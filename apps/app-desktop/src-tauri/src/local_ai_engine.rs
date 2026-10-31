// llama.cpp inside the Android and iOS apps. The model the shell downloaded
// (src/local_ai.rs) is loaded in this process and answers the chat requests
// the webview sends as Tauri commands, each piece of the answer going back
// through a Channel. The desktop keeps its llama-server child process: iOS
// cannot start one and Android ships none. The webview side is
// packages/alice-ai/src/ai-backend-local-mobile.ts.
//
// One thread owns llama.cpp: the backend, the loaded model and its context
// (a context is Send but not Sync, and must not outlive its model). Commands
// hand it jobs over a channel and wait for the reply off the async runtime.

use std::num::NonZeroU32;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, Receiver, Sender, SyncSender};
use std::sync::{Arc, Mutex};
use std::time::Instant;

use llama_cpp_2::context::params::LlamaContextParams;
use llama_cpp_2::context::LlamaContext;
use llama_cpp_2::llama_backend::LlamaBackend;
use llama_cpp_2::llama_batch::LlamaBatch;
use llama_cpp_2::model::params::LlamaModelParams;
use llama_cpp_2::model::{LlamaChatMessage, LlamaChatTemplate, LlamaModel};
use llama_cpp_2::sampling::LlamaSampler;
use llama_cpp_2::token::LlamaToken;
use tauri::ipc::Channel;

use crate::local_ai::{models_dir, resolve_installed_model};
use crate::local_ai_text::{common_prefix, model_memory_need, ThinkFilter, Utf8Pieces};

/// Context the phone builds affords: the shared mobile budget in
/// packages/alice-ai/src/local-context-budget.ts (LOCAL_CONTEXT_TOKENS).
const DEFAULT_CONTEXT_TOKENS: u32 = 4096;
const MIN_CONTEXT_TOKENS: u32 = 1024;
const MAX_CONTEXT_TOKENS: u32 = 16384;
/// Room the prompt must leave for an answer, as the webview's budget does.
const MIN_RESPONSE_TOKENS: usize = 128;
const PROMPT_BATCH_TOKENS: u32 = 512;
/// The wording packages/alice-ai/src/chat-context.tsx turns into its
/// "ran out of context" message.
const PROMPT_TOO_LONG: &str = "Local prompt is too long for the model context.";

#[derive(Clone, serde::Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerationRequest {
    pub messages: Vec<ChatMessage>,
    pub temperature: f32,
    pub max_tokens: u32,
    /// Qwen3 and SmolLM3 reason by default and the think block eats the whole
    /// token budget; the answer-only switch pre-fills an empty think block.
    #[serde(default)]
    pub disable_thinking: bool,
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerationResult {
    pub content: String,
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    /// Stopped at max_tokens or at the end of the context, not by the model.
    pub truncated: bool,
    pub cancelled: bool,
    pub duration_ms: u64,
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EngineStatus {
    pub loaded_model: Option<String>,
    pub context_tokens: Option<u32>,
    pub busy: bool,
}

#[derive(Clone, Copy, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceMemory {
    pub total_bytes: u64,
    /// What this process may still allocate (iOS) or what the system has
    /// free (Android); 0 when the platform did not say.
    pub available_bytes: u64,
}

enum Job {
    Load {
        path: PathBuf,
        ctx_size: u32,
        reply: SyncSender<Result<u32, String>>,
    },
    Unload {
        reply: SyncSender<()>,
    },
    Generate {
        request: GenerationRequest,
        pieces: Channel<String>,
        reply: SyncSender<Result<GenerationResult, String>>,
    },
}

#[derive(Clone)]
struct LoadedInfo {
    filename: String,
    context_tokens: u32,
}

pub struct LocalEngineState {
    jobs: Mutex<Option<Sender<Job>>>,
    loaded: Mutex<Option<LoadedInfo>>,
    busy: AtomicBool,
    cancel: Arc<AtomicBool>,
}

impl LocalEngineState {
    pub fn new() -> Self {
        Self {
            jobs: Mutex::new(None),
            loaded: Mutex::new(None),
            busy: AtomicBool::new(false),
            cancel: Arc::new(AtomicBool::new(false)),
        }
    }

    /// The engine thread, started on first use and kept for the app's life.
    fn jobs(&self) -> Result<Sender<Job>, String> {
        let mut guard = self.jobs.lock().map_err(|e| e.to_string())?;
        if let Some(sender) = guard.as_ref() {
            return Ok(sender.clone());
        }
        let (tx, rx) = mpsc::channel();
        let cancel = self.cancel.clone();
        std::thread::Builder::new()
            .name("alice-local-ai".into())
            .stack_size(8 << 20)
            .spawn(move || engine_thread(rx, cancel))
            .map_err(|e| format!("Failed to start the local engine: {e}"))?;
        *guard = Some(tx.clone());
        Ok(tx)
    }

    fn loaded(&self) -> Option<LoadedInfo> {
        self.loaded.lock().ok().and_then(|guard| guard.clone())
    }

    fn set_loaded(&self, info: Option<LoadedInfo>) {
        if let Ok(mut guard) = self.loaded.lock() {
            *guard = info;
        }
    }
}

/// Waits for the engine thread's reply without holding an async worker.
async fn wait_reply<T: Send + 'static>(rx: mpsc::Receiver<T>) -> Result<T, String> {
    match tauri::async_runtime::spawn_blocking(move || rx.recv()).await {
        Ok(Ok(value)) => Ok(value),
        Ok(Err(_)) => Err("The local engine stopped unexpectedly.".into()),
        Err(e) => Err(format!("The local engine did not answer: {e}")),
    }
}

async fn unload(state: &LocalEngineState) -> Result<(), String> {
    if state.loaded().is_none() {
        return Ok(());
    }
    let (reply, rx) = mpsc::sync_channel(1);
    state
        .jobs()?
        .send(Job::Unload { reply })
        .map_err(|_| "The local engine stopped unexpectedly.".to_string())?;
    wait_reply(rx).await?;
    state.set_loaded(None);
    Ok(())
}

#[cfg(target_os = "ios")]
fn gigabytes(bytes: u64) -> String {
    format!("{:.1} GB", bytes as f64 / 1_000_000_000.0)
}

/// Loads an installed model, by filename only, after the memory check. A
/// model already loaded with the same context is kept; another one is freed
/// first, so the check sees the memory the new one will really get.
#[tauri::command]
pub async fn local_ai_engine_load(
    app: tauri::AppHandle,
    state: tauri::State<'_, LocalEngineState>,
    filename: String,
    ctx_size: Option<u32>,
) -> Result<EngineStatus, String> {
    let ctx_size = ctx_size
        .unwrap_or(DEFAULT_CONTEXT_TOKENS)
        .clamp(MIN_CONTEXT_TOKENS, MAX_CONTEXT_TOKENS);
    let path = resolve_installed_model(&models_dir(&app)?, &filename)?;
    if state.busy.load(Ordering::SeqCst) {
        return Err("The local model is busy answering; try again in a moment.".into());
    }
    if let Some(loaded) = state.loaded() {
        if loaded.filename == filename && loaded.context_tokens == ctx_size {
            return local_ai_engine_status(state);
        }
    }
    unload(&state).await?;

    let size = std::fs::metadata(&path)
        .map_err(|e| format!("Failed to read the model file: {e}"))?
        .len();
    // iOS ends an app that passes its memory budget, so a model that does
    // not fit is refused with the figures. Android evicts mapped weights and
    // frees cached apps instead: on a 4 GB Galaxy A15 the 2B answered with
    // 1.6 GB "available" against 2.1 GB estimated (2026-10-29), so the figure
    // is only a notice there (shown by the settings page before a download).
    #[cfg(target_os = "ios")]
    {
        let memory = device_memory();
        let need = model_memory_need(size);
        if memory.available_bytes > 0 && memory.available_bytes < need {
            return Err(format!(
                "This model needs about {} of memory (RAM, not storage) and the system lets this app use {} right now. Close other apps or choose a smaller model.",
                gigabytes(need),
                gigabytes(memory.available_bytes)
            ));
        }
    }

    let (reply, rx) = mpsc::sync_channel(1);
    state
        .jobs()?
        .send(Job::Load { path, ctx_size, reply })
        .map_err(|_| "The local engine stopped unexpectedly.".to_string())?;
    let context_tokens = wait_reply(rx).await??;
    state.set_loaded(Some(LoadedInfo { filename, context_tokens }));
    local_ai_engine_status(state)
}

#[tauri::command]
pub async fn local_ai_engine_unload(state: tauri::State<'_, LocalEngineState>) -> Result<(), String> {
    if state.busy.load(Ordering::SeqCst) {
        state.cancel.store(true, Ordering::SeqCst);
    }
    unload(&state).await
}

#[tauri::command]
pub fn local_ai_engine_status(state: tauri::State<'_, LocalEngineState>) -> Result<EngineStatus, String> {
    let loaded = state.loaded();
    Ok(EngineStatus {
        loaded_model: loaded.as_ref().map(|info| info.filename.clone()),
        context_tokens: loaded.as_ref().map(|info| info.context_tokens),
        busy: state.busy.load(Ordering::SeqCst),
    })
}

/// One answer. Pieces of text reach the webview through `on_piece` as they
/// are produced; the whole answer and its token counts come back at the end.
#[tauri::command]
pub async fn local_ai_engine_generate(
    state: tauri::State<'_, LocalEngineState>,
    request: GenerationRequest,
    on_piece: Channel<String>,
) -> Result<GenerationResult, String> {
    if state.loaded().is_none() {
        return Err("No local model is loaded.".into());
    }
    if state.busy.swap(true, Ordering::SeqCst) {
        return Err("The local model is already answering.".into());
    }
    state.cancel.store(false, Ordering::SeqCst);
    let (reply, rx) = mpsc::sync_channel(1);
    let sent = state.jobs().and_then(|jobs| {
        jobs.send(Job::Generate { request, pieces: on_piece, reply })
            .map_err(|_| "The local engine stopped unexpectedly.".to_string())
    });
    let result = match sent {
        Ok(()) => wait_reply(rx).await.and_then(|r| r),
        Err(e) => Err(e),
    };
    state.busy.store(false, Ordering::SeqCst);
    result
}

/// Stops the answer in progress at its next token; the generate command then
/// returns what was produced, marked cancelled.
#[tauri::command]
pub fn local_ai_engine_cancel(state: tauri::State<'_, LocalEngineState>) {
    state.cancel.store(true, Ordering::SeqCst);
}

#[tauri::command]
pub fn local_ai_device_memory() -> DeviceMemory {
    device_memory()
}

/// Memory before a load, from what the model file will cost.
#[tauri::command]
pub fn local_ai_model_memory_need(size_bytes: u64) -> u64 {
    model_memory_need(size_bytes)
}

#[cfg(target_os = "ios")]
fn device_memory() -> DeviceMemory {
    // os/proc.h, iOS 13 and later: how much more this process may allocate
    // before the system ends it. libc has no binding for it yet.
    extern "C" {
        fn os_proc_available_memory() -> usize;
    }
    let mut total: u64 = 0;
    let mut len = std::mem::size_of::<u64>();
    // SAFETY: hw.memsize is a 64-bit value and `len` says the buffer holds one.
    let ok = unsafe {
        libc::sysctlbyname(
            c"hw.memsize".as_ptr(),
            std::ptr::addr_of_mut!(total).cast(),
            &mut len,
            std::ptr::null_mut(),
            0,
        )
    } == 0;
    DeviceMemory {
        total_bytes: if ok { total } else { 0 },
        // SAFETY: a plain query with no arguments.
        available_bytes: unsafe { os_proc_available_memory() } as u64,
    }
}

#[cfg(target_os = "android")]
fn device_memory() -> DeviceMemory {
    let meminfo = std::fs::read_to_string("/proc/meminfo").unwrap_or_default();
    let read = |key: &str| -> u64 {
        meminfo
            .lines()
            .find_map(|line| line.strip_prefix(key))
            .and_then(|rest| rest.trim().trim_end_matches("kB").trim().parse::<u64>().ok())
            .map(|kb| kb * 1024)
            .unwrap_or(0)
    };
    DeviceMemory {
        total_bytes: read("MemTotal:"),
        available_bytes: read("MemAvailable:"),
    }
}

/// Threads for the CPU side: the cores minus 2, between 2 and 6, so the
/// webview and the system keep a core each. On a Galaxy A15 (8 cores), 6
/// threads generated fastest; 2 were slower, and all 8 starved the webview
/// down to under 1 token a second.
fn inference_threads() -> i32 {
    let cores = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4);
    cores.saturating_sub(2).clamp(2, 6) as i32
}

// The GPU side: every layer on Metal on iOS, nothing on Android, which
// builds the CPU backend only.
#[cfg(target_os = "ios")]
const GPU_LAYERS: u32 = 999;
#[cfg(target_os = "android")]
const GPU_LAYERS: u32 = 0;

fn engine_thread(jobs: Receiver<Job>, cancel: Arc<AtomicBool>) {
    let backend = match LlamaBackend::init() {
        Ok(backend) => backend,
        Err(e) => {
            let message = format!("llama.cpp failed to start: {e}");
            for job in jobs {
                match job {
                    Job::Load { reply, .. } => {
                        let _ = reply.send(Err(message.clone()));
                    }
                    Job::Unload { reply } => {
                        let _ = reply.send(());
                    }
                    Job::Generate { reply, .. } => {
                        let _ = reply.send(Err(message.clone()));
                    }
                }
            }
            return;
        }
    };
    let mut loaded: Option<LoadedModel> = None;
    for job in jobs {
        match job {
            Job::Load { path, ctx_size, reply } => {
                loaded = None;
                let result = LoadedModel::load(&backend, &path, ctx_size);
                let _ = match result {
                    Ok(model) => {
                        let n_ctx = model.n_ctx;
                        loaded = Some(model);
                        reply.send(Ok(n_ctx))
                    }
                    Err(e) => reply.send(Err(e)),
                };
            }
            Job::Unload { reply } => {
                loaded = None;
                let _ = reply.send(());
            }
            Job::Generate { request, pieces, reply } => {
                let result = match loaded.as_mut() {
                    Some(model) => model.generate(&request, &pieces, &cancel),
                    None => Err("No local model is loaded.".into()),
                };
                let _ = reply.send(result);
            }
        }
    }
}

struct LoadedModel {
    // Declared before `model` so it is dropped first: the context borrows
    // the model (see `load`).
    context: Option<LlamaContext<'static>>,
    model: Box<LlamaModel>,
    n_ctx: u32,
    n_batch: u32,
    /// The tokens whose state the context holds after the last answer, so the
    /// next turn of the same conversation only reads what it adds (the same
    /// prompt reuse llama-server does with cache_prompt).
    cached_tokens: Vec<LlamaToken>,
}

impl LoadedModel {
    fn load(backend: &LlamaBackend, path: &Path, ctx_size: u32) -> Result<Self, String> {
        let model_params = LlamaModelParams::default()
            .with_n_gpu_layers(GPU_LAYERS)
            .with_use_mmap(true);
        let model = Box::new(
            LlamaModel::load_from_file(backend, path, &model_params)
                .map_err(|e| format!("Failed to load the model: {e}"))?,
        );
        let threads = inference_threads();
        let n_batch = PROMPT_BATCH_TOKENS.min(ctx_size);
        let params = LlamaContextParams::default()
            .with_n_ctx(NonZeroU32::new(ctx_size))
            .with_n_batch(n_batch)
            .with_n_ubatch(n_batch)
            .with_n_threads(threads)
            .with_n_threads_batch(threads);
        let context = model
            .new_context(backend, params)
            .map_err(|e| format!("Failed to prepare the model context: {e}"))?;
        let n_ctx = context.n_ctx();
        // SAFETY: the context borrows the model, which lives in a Box at a
        // stable address for as long as this struct, and `context` is dropped
        // before `model` (field order, and `None` in Drop below).
        let context: LlamaContext<'static> = unsafe { std::mem::transmute(context) };
        Ok(Self {
            context: Some(context),
            model,
            n_ctx,
            n_batch,
            cached_tokens: Vec::new(),
        })
    }

    fn generate(
        &mut self,
        request: &GenerationRequest,
        pieces: &Channel<String>,
        cancel: &AtomicBool,
    ) -> Result<GenerationResult, String> {
        let started = Instant::now();
        let Self { context, model, n_ctx, n_batch, cached_tokens } = self;
        let context = context.as_mut().ok_or("The model context is gone.")?;
        let n_ctx = *n_ctx as usize;
        let n_batch = *n_batch as usize;
        let vocab = model.vocab();

        let prompt = build_prompt(model, &request.messages, request.disable_thinking)?;
        let prompt_tokens = vocab.tokenize(prompt.as_bytes(), true, true);
        if prompt_tokens.is_empty() {
            return Err("The prompt is empty.".into());
        }
        if prompt_tokens.len() + MIN_RESPONSE_TOKENS > n_ctx {
            return Err(PROMPT_TOO_LONG.into());
        }

        // Keep the state of the longest common start with the last answer;
        // at least one token is read again so the sampler has fresh logits.
        // A memory that cannot drop a partial range (recurrent layers)
        // answers false, and the prompt is then read from the start.
        let mut n_past = common_prefix(cached_tokens, &prompt_tokens).min(prompt_tokens.len() - 1);
        let reused = n_past > 0
            && context
                .clear_kv_cache_seq(Some(0), Some(n_past as u32), None)
                .unwrap_or(false);
        if !reused {
            context.clear_kv_cache();
            n_past = 0;
        }
        cached_tokens.clear();
        let mut decoded: Vec<LlamaToken> = prompt_tokens[..n_past].to_vec();

        let mut batch = LlamaBatch::new(n_batch, 1);
        let pending = &prompt_tokens[n_past..];
        let chunks = pending.chunks(n_batch).count();
        for (index, chunk) in pending.chunks(n_batch).enumerate() {
            if cancel.load(Ordering::Relaxed) {
                *cached_tokens = decoded;
                return Ok(cancelled_result(started, prompt_tokens.len()));
            }
            batch.clear();
            let last_chunk = index + 1 == chunks;
            for (offset, token) in chunk.iter().enumerate() {
                let wants_logits = last_chunk && offset + 1 == chunk.len();
                batch
                    .add(*token, (n_past + offset) as i32, &[0], wants_logits)
                    .map_err(|e| format!("The prompt does not fit the batch: {e}"))?;
            }
            context
                .decode(&mut batch)
                .map_err(|e| format!("The model could not read the prompt: {e}"))?;
            n_past += chunk.len();
            decoded.extend_from_slice(chunk);
        }

        let mut sampler = build_sampler(request.temperature);
        let mut pieces_utf8 = Utf8Pieces::default();
        let mut filter = ThinkFilter::default();
        let mut generated = 0u32;
        let mut truncated = false;
        let mut cancelled = false;
        let max_tokens = request.max_tokens.max(1);
        loop {
            if cancel.load(Ordering::Relaxed) {
                cancelled = true;
                break;
            }
            let token = sampler.sample(context, -1);
            if vocab.is_eog(token) {
                break;
            }
            generated += 1;
            let bytes = vocab.token_to_piece(token, false, None);
            if let Some(text) = pieces_utf8.push(&bytes) {
                if let Some(out) = filter.push(&text) {
                    let _ = pieces.send(out);
                }
            }
            if generated >= max_tokens || n_past + 1 >= n_ctx {
                truncated = true;
                break;
            }
            batch.clear();
            batch
                .add(token, n_past as i32, &[0], true)
                .map_err(|e| format!("The answer does not fit the batch: {e}"))?;
            context
                .decode(&mut batch)
                .map_err(|e| format!("The model could not continue: {e}"))?;
            n_past += 1;
            decoded.push(token);
        }
        if let Some(out) = filter.finish() {
            let _ = pieces.send(out);
        }
        *cached_tokens = decoded;
        Ok(GenerationResult {
            content: filter.content,
            prompt_tokens: prompt_tokens.len() as u32,
            completion_tokens: generated,
            truncated,
            cancelled,
            duration_ms: started.elapsed().as_millis() as u64,
        })
    }
}

impl Drop for LoadedModel {
    fn drop(&mut self) {
        self.context = None;
    }
}

fn cancelled_result(started: Instant, prompt_tokens: usize) -> GenerationResult {
    GenerationResult {
        content: String::new(),
        prompt_tokens: prompt_tokens as u32,
        completion_tokens: 0,
        truncated: false,
        cancelled: true,
        duration_ms: started.elapsed().as_millis() as u64,
    }
}

/// The prompt as the model's own chat template lays it out, through
/// llama.cpp's built-in templates (the model's Jinja is matched to one of
/// them; ChatML when it matches none). With thinking off, the answer starts
/// after an empty think block, as the Qwen3 templates render
/// enable_thinking=false.
fn build_prompt(model: &LlamaModel, messages: &[ChatMessage], disable_thinking: bool) -> Result<String, String> {
    let chat = messages
        .iter()
        .map(|m| LlamaChatMessage::new(m.role.clone(), m.content.clone()))
        .collect::<Result<Vec<_>, _>>()
        .map_err(|_| "A message contains a NUL byte.".to_string())?;
    let chatml = LlamaChatTemplate::new("chatml").map_err(|e| e.to_string())?;
    let template = model.chat_template(None).unwrap_or_else(|_| chatml.clone());
    let mut prompt = match model.apply_chat_template(&template, &chat, true) {
        Ok(prompt) => prompt,
        Err(_) => model
            .apply_chat_template(&chatml, &chat, true)
            .map_err(|e| format!("The model's chat template could not be applied: {e}"))?,
    };
    if disable_thinking {
        prompt.push_str("<think>\n\n</think>\n\n");
    }
    Ok(prompt)
}

fn build_sampler(temperature: f32) -> LlamaSampler {
    if temperature <= 0.0 {
        return LlamaSampler::greedy();
    }
    let seed = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.subsec_nanos())
        .unwrap_or(0);
    LlamaSampler::chain_simple([
        LlamaSampler::top_k(40),
        LlamaSampler::top_p(0.95, 1),
        LlamaSampler::min_p(0.05, 1),
        LlamaSampler::temp(temperature),
        LlamaSampler::dist(seed),
    ])
}
