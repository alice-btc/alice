// Local AI models: downloaded from Hugging Face into the app's data
// directory and checked, on every platform. On the desktop a llama-server
// child process then serves the file; Android and iOS load it inside the app
// instead (src/local_ai_engine.rs), since iOS cannot start a process and
// Android ships no server.

use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;
use tauri::Manager;
#[cfg(desktop)]
use tauri_plugin_shell::process::CommandChild;
#[cfg(desktop)]
use tauri_plugin_shell::ShellExt;

#[cfg(desktop)]
pub struct LocalAIState(pub Mutex<Option<CommandChild>>);

fn validate_model_filename(filename: &str) -> Result<(), String> {
    // A colon is refused too: on Windows `dir.join("C:x.gguf")` drops `dir`
    // and resolves against the current directory of drive C.
    let is_safe = filename.ends_with(".gguf")
        && !filename.contains('/')
        && !filename.contains('\\')
        && !filename.contains(':')
        && !filename.contains("..");
    if is_safe {
        Ok(())
    } else {
        Err("Invalid model filename".into())
    }
}

pub(crate) fn models_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("Failed to resolve app data directory: {e}"))?
        .join("models");
    std::fs::create_dir_all(&dir).map_err(|e| format!("Failed to create models directory: {e}"))?;
    Ok(dir)
}

fn model_path(app: &tauri::AppHandle, filename: &str) -> Result<PathBuf, String> {
    validate_model_filename(filename)?;
    Ok(models_dir(app)?.join(filename))
}

fn model_temp_path(app: &tauri::AppHandle, filename: &str) -> Result<PathBuf, String> {
    validate_model_filename(filename)?;
    Ok(models_dir(app)?.join(format!("{filename}.download")))
}

/// The installed model `filename` inside `models_dir`. The check resolves any
/// symlink, so the engine can only ever be pointed at a file that really
/// lives in the app's models directory; the path handed back is the plain one,
/// since a canonical Windows path carries a `\\?\` prefix.
pub(crate) fn resolve_installed_model(models_dir: &Path, filename: &str) -> Result<PathBuf, String> {
    validate_model_filename(filename)?;
    let not_installed = || "Model is not installed".to_string();
    let path = models_dir.join(filename);
    let dir = models_dir.canonicalize().map_err(|_| not_installed())?;
    let target = path.canonicalize().map_err(|_| not_installed())?;
    if target.starts_with(&dir) && target.is_file() {
        Ok(path)
    } else {
        Err(not_installed())
    }
}

fn is_sha256_hex(value: &str) -> bool {
    value.len() == 64
        && value
            .bytes()
            .all(|b| matches!(b, b'0'..=b'9' | b'a'..=b'f'))
}

/// Checks a finished download before it may be loaded: the exact size, then,
/// when the catalog or the Hugging Face listing published one, the SHA-256 of
/// the bytes on disk. The size catches a truncated or HTML response; the hash
/// catches a file swapped on the server or in transit. `report` receives the
/// bytes hashed so far after each piece, for the page's verifying bar.
fn verify_model_file_with_progress(
    path: &Path,
    expected_size: u64,
    expected_sha256: Option<&str>,
    report: impl Fn(u64),
) -> Result<(), String> {
    if let Some(expected) = expected_sha256 {
        if !is_sha256_hex(expected) {
            return Err("Invalid model checksum".into());
        }
    }
    let file = std::fs::File::open(path)
        .map_err(|e| format!("Failed to open model download file: {e}"))?;
    let size = file
        .metadata()
        .map_err(|e| format!("Failed to read model download file: {e}"))?
        .len();
    if size != expected_size {
        return Err(format!(
            "Download incomplete ({size} of {expected_size} bytes)."
        ));
    }
    let Some(expected) = expected_sha256 else {
        return Ok(());
    };
    let mut hasher = Sha256::new();
    let mut reader = std::io::BufReader::with_capacity(1 << 20, file);
    let mut buffer = vec![0u8; 1 << 20];
    let mut done = 0u64;
    loop {
        let read = std::io::Read::read(&mut reader, &mut buffer)
            .map_err(|e| format!("Failed to read model download file: {e}"))?;
        if read == 0 {
            break;
        }
        hasher.update(&buffer[..read]);
        done += read as u64;
        report(done);
    }
    let actual = format!("{:x}", hasher.finalize());
    if actual == expected {
        Ok(())
    } else {
        Err("The downloaded model does not match its published SHA-256 checksum.".into())
    }
}

#[cfg(desktop)]
fn resolve_llama_server() -> &'static str {
    const CANDIDATES: &[&str] = &[
        "/opt/homebrew/bin/llama-server",
        "/usr/local/bin/llama-server",
    ];
    for path in CANDIDATES {
        if std::path::Path::new(path).exists() {
            return path;
        }
    }
    "llama-server"
}

// Takes a filename, not a path: the webview can only start a model the app
// downloaded into its own models directory, never an arbitrary file on disk.
#[cfg(desktop)]
#[tauri::command]
pub fn local_ai_start(
    filename: String,
    ctx_size: Option<u32>,
    state: tauri::State<'_, LocalAIState>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    let model_path = resolve_installed_model(&models_dir(&app)?, &filename)?;
    let model_path = model_path.to_string_lossy().into_owned();
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(child) = guard.take() {
        let _ = child.kill();
    }
    let binary = resolve_llama_server();
    // 4096 was too tight once Alice's system prompt, retrieved context and the
    // conversation history are in: answers were truncated after ~250 tokens.
    let ctx = ctx_size.unwrap_or(8192).clamp(2048, 32768).to_string();
    let (_rx, child) = app
        .shell()
        .command(binary)
        .args([
            "--model",
            &model_path,
            "--port",
            "11435",
            "--ctx-size",
            &ctx,
            "--log-disable",
        ])
        .spawn()
        .map_err(|e| format!("Failed to start llama-server ({binary}): {e}"))?;
    *guard = Some(child);
    Ok(())
}

#[cfg(desktop)]
#[tauri::command]
pub fn local_ai_stop(state: tauri::State<'_, LocalAIState>) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(child) = guard.take() {
        child
            .kill()
            .map_err(|e| format!("Failed to stop llama-server: {e}"))?;
    }
    Ok(())
}

#[cfg(desktop)]
#[tauri::command]
pub fn local_ai_is_running(state: tauri::State<'_, LocalAIState>) -> bool {
    state.0.lock().map(|g| g.is_some()).unwrap_or(false)
}

#[tauri::command]
pub fn local_ai_model_status(app: tauri::AppHandle, filename: String) -> Result<String, String> {
    let installed_path = model_path(&app, &filename)?;
    if installed_path.exists() {
        return Ok("installed".into());
    }

    Ok("not-installed".into())
}

#[tauri::command]
pub fn local_ai_model_path(app: tauri::AppHandle, filename: String) -> Result<String, String> {
    let installed_path = model_path(&app, &filename)?;
    if installed_path.exists() {
        return Ok(installed_path.to_string_lossy().into_owned());
    }

    Err("Model is not installed".into())
}

// A model is downloaded by the shell itself, straight into the models
// directory, and the webview only polls where it stands: handing the bytes
// over the JSON IPC bridge silently lost a message on macOS after a few
// hundred megabytes, and the download then hung without an error.

/// Where a model download stands, as the webview polls it.
#[derive(Clone, serde::Serialize)]
#[serde(tag = "state", rename_all = "camelCase")]
pub enum ModelDownloadStatus {
    Downloading { received: u64, total: u64 },
    /// Transfer complete; the size and SHA-256 are being checked. Hashing a
    /// 2.7 GB file takes seconds in a release build, and the page shows this
    /// phase apart so a full bar is not read as a new freeze.
    Verifying { done: u64, total: u64 },
    Installed,
    Failed { error: String },
}

pub struct ModelDownloadsState(pub Mutex<HashMap<String, ModelDownloadStatus>>);

const MODEL_DOWNLOAD_CONNECT_TIMEOUT: Duration = Duration::from_secs(30);
// Longest silence tolerated between two pieces of the file: a download that
// stops delivering fails with a message instead of sitting at the same percent.
const MODEL_DOWNLOAD_READ_TIMEOUT: Duration = Duration::from_secs(60);
// A transfer cut by the network (a phone suspended by its system, a Wi-Fi
// handover) continues from the bytes already on disk, with a Range request,
// this many times before the failure is shown.
const MODEL_DOWNLOAD_ATTEMPTS: u32 = 12;
const MODEL_DOWNLOAD_RETRY_WAIT: Duration = Duration::from_secs(3);
// A connection the CDN lets wither (5 KB/s seen on a Galaxy A15 while a new
// connection got 800 KB/s) keeps delivering too often for the read timeout
// to fire and would take days; under this floor the attempt is dropped and
// the next one continues from the bytes on disk over a fresh connection.
const MODEL_DOWNLOAD_SLOW_WINDOW: Duration = Duration::from_secs(60);
const MODEL_DOWNLOAD_SLOW_FLOOR_BYTES: u64 = 512 << 10;

/// Only Hugging Face serves Alice's models, over TLS: the catalog and the
/// custom entries already point there, so any other address is a bug or a
/// tampered entry, never a download. The redirects Hugging Face answers with
/// (to its CDN) are followed by the client, not checked here.
fn validate_model_download_url(url: &str) -> Result<(), String> {
    let parsed =
        reqwest::Url::parse(url).map_err(|_| "Invalid model download URL".to_string())?;
    let allowed = parsed.scheme() == "https"
        && parsed.host_str() == Some("huggingface.co")
        && parsed.path().ends_with(".gguf");
    if allowed {
        Ok(())
    } else {
        Err("Model downloads come from huggingface.co only".into())
    }
}

/// The byte count the download must reach: the catalog's size, which the
/// server's Content-Length has to agree with when it sends one. A different
/// length is another file than the one the hash was published for, so the
/// download stops before the first byte rather than after gigabytes.
fn expected_download_total(
    content_length: Option<u64>,
    expected_size: u64,
) -> Result<u64, String> {
    match content_length {
        Some(length) if length != expected_size => Err(format!(
            "The server offers {length} bytes but the catalog expects {expected_size}."
        )),
        _ => Ok(expected_size),
    }
}

/// Writes the pieces of a model file as they arrive and refuses to go past
/// the announced size, so a server that keeps sending cannot fill the disk.
struct ModelDownloadSink {
    file: std::io::BufWriter<std::fs::File>,
    received: u64,
    total: u64,
}

impl ModelDownloadSink {
    fn create(path: &Path, total: u64) -> Result<Self, String> {
        let _ = std::fs::remove_file(path);
        let file = std::fs::File::create(path)
            .map_err(|e| format!("Failed to create model download file: {e}"))?;
        Ok(Self {
            file: std::io::BufWriter::with_capacity(1 << 20, file),
            received: 0,
            total,
        })
    }

    /// Continues a partial file after its `received` bytes; a fresh file when 0.
    fn open(path: &Path, total: u64, received: u64) -> Result<Self, String> {
        if received == 0 {
            return Self::create(path, total);
        }
        let file = std::fs::OpenOptions::new()
            .append(true)
            .open(path)
            .map_err(|e| format!("Failed to continue the model download file: {e}"))?;
        Ok(Self {
            file: std::io::BufWriter::with_capacity(1 << 20, file),
            received,
            total,
        })
    }

    /// Appends one piece and returns the bytes received so far.
    fn write(&mut self, chunk: &[u8]) -> Result<u64, String> {
        let received = self.received + chunk.len() as u64;
        if received > self.total {
            return Err(format!(
                "The server sent more than the expected {} bytes.",
                self.total
            ));
        }
        self.file
            .write_all(chunk)
            .map_err(|e| format!("Failed to write model download chunk: {e}"))?;
        self.received = received;
        Ok(received)
    }

    fn finish(mut self) -> Result<u64, String> {
        self.file
            .flush()
            .map_err(|e| format!("Failed to write model download file: {e}"))?;
        Ok(self.received)
    }
}

/// reqwest checks server certificates through rustls-platform-verifier, which
/// on Android expects a Java component initialised by the app; Alice ships
/// none, so every download would fail its TLS check. The Android client
/// trusts the Mozilla root store bundled by webpki-roots instead, enough for
/// huggingface.co and its CDN. Not verified on a device yet.
#[cfg(target_os = "android")]
fn android_tls_config() -> rustls::ClientConfig {
    let mut roots = rustls::RootCertStore::empty();
    roots.extend(webpki_roots::TLS_SERVER_ROOTS.iter().cloned());
    rustls::ClientConfig::builder()
        .with_root_certificates(roots)
        .with_no_client_auth()
}

fn model_download_client() -> Result<reqwest::Client, String> {
    let builder = reqwest::Client::builder()
        .connect_timeout(MODEL_DOWNLOAD_CONNECT_TIMEOUT)
        .read_timeout(MODEL_DOWNLOAD_READ_TIMEOUT)
        .user_agent(concat!("alice-desktop/", env!("CARGO_PKG_VERSION")));
    #[cfg(target_os = "android")]
    let builder = builder.tls_backend_preconfigured(android_tls_config());
    builder
        .build()
        .map_err(|e| format!("Failed to prepare the download: {e}"))
}

/// Bytes of an earlier attempt kept in `temp` that a Range request can
/// continue: a file shorter than the whole model.
fn resumable_bytes(temp: &Path, total: u64) -> u64 {
    match std::fs::metadata(temp) {
        Ok(meta) if meta.len() < total => meta.len(),
        _ => 0,
    }
}

/// Whether a stream that delivered `bytes` over `elapsed` is too slow to
/// keep: judged once a full window has passed, never before.
fn stream_too_slow(elapsed: Duration, bytes: u64) -> bool {
    elapsed >= MODEL_DOWNLOAD_SLOW_WINDOW && bytes < MODEL_DOWNLOAD_SLOW_FLOOR_BYTES
}

/// Why one transfer attempt ended short, and whether another may follow.
struct TransferFailure {
    error: String,
    /// Network trouble, worth continuing from the bytes on disk; false for a
    /// refusal by the server or a problem with the file itself.
    retry: bool,
}

impl From<String> for TransferFailure {
    fn from(error: String) -> Self {
        Self { error, retry: false }
    }
}

/// One attempt at the transfer, continuing after the bytes already in `temp`
/// when the server honours the range. Returns the bytes on disk once the
/// server has sent everything.
async fn transfer_attempt(
    client: &reqwest::Client,
    url: &str,
    temp: &Path,
    size_bytes: u64,
    report: &(impl Fn(u64, u64) + Send + Sync),
) -> Result<u64, TransferFailure> {
    let resume_from = resumable_bytes(temp, size_bytes);
    let mut request = client.get(url);
    if resume_from > 0 {
        request = request.header(reqwest::header::RANGE, format!("bytes={resume_from}-"));
    }
    let mut response = request.send().await.map_err(|e| TransferFailure {
        error: format!("Download failed: {e}"),
        retry: true,
    })?;
    let status = response.status();
    let received = if status == reqwest::StatusCode::PARTIAL_CONTENT && resume_from > 0 {
        let announced = response.content_length().map(|rest| rest + resume_from);
        expected_download_total(announced, size_bytes)?;
        resume_from
    } else if status.is_success() {
        // The whole file again, whether or not a range was asked for.
        expected_download_total(response.content_length(), size_bytes)?;
        0
    } else if status == reqwest::StatusCode::RANGE_NOT_SATISFIABLE {
        // The partial file does not match what the server has: start over.
        let _ = std::fs::remove_file(temp);
        return Err(TransferFailure { error: format!("Download failed ({status})"), retry: true });
    } else {
        return Err(TransferFailure {
            error: format!("Download failed ({status})"),
            retry: status.is_server_error() || status == reqwest::StatusCode::TOO_MANY_REQUESTS,
        });
    };
    let mut sink = ModelDownloadSink::open(temp, size_bytes, received)?;
    report(received, size_bytes);
    let mut window_start = std::time::Instant::now();
    let mut window_bytes: u64 = 0;
    loop {
        match response.chunk().await {
            Ok(Some(chunk)) => {
                let received = sink.write(&chunk)?;
                report(received, size_bytes);
                window_bytes += chunk.len() as u64;
                let elapsed = window_start.elapsed();
                if stream_too_slow(elapsed, window_bytes) {
                    let _ = sink.finish();
                    return Err(TransferFailure {
                        error: format!(
                            "Download too slow ({} KB in {} s); reconnecting.",
                            window_bytes >> 10,
                            elapsed.as_secs()
                        ),
                        retry: true,
                    });
                }
                if elapsed >= MODEL_DOWNLOAD_SLOW_WINDOW {
                    window_start = std::time::Instant::now();
                    window_bytes = 0;
                }
            }
            Ok(None) => break,
            Err(e) => {
                // The bytes already written stay on disk for the next attempt.
                let _ = sink.finish();
                return Err(TransferFailure { error: format!("Download interrupted: {e}"), retry: true });
            }
        }
    }
    Ok(sink.finish()?)
}

/// Downloads `url` into `temp`, reporting (received, total) as pieces land,
/// then checks the exact size and, when one is published, the SHA-256. On
/// success `temp` holds a verified file. A transfer the network cut is
/// continued from the bytes on disk; after the last attempt, or when the
/// file is refused, `temp` is removed so nothing half-done can be loaded.
async fn download_model_file(
    client: &reqwest::Client,
    url: &str,
    temp: &Path,
    size_bytes: u64,
    sha256: Option<&str>,
    report: impl Fn(u64, u64) + Send + Sync,
    report_verifying: impl Fn(u64, u64) + Send + Sync + 'static,
) -> Result<(), String> {
    let result: Result<(), TransferFailure> = async {
        let mut attempt = 0;
        let received = loop {
            attempt += 1;
            match transfer_attempt(client, url, temp, size_bytes, &report).await {
                Ok(received) => break received,
                Err(failure) if failure.retry && attempt < MODEL_DOWNLOAD_ATTEMPTS => {
                    // No async timer without a tokio dependency of our own:
                    // the wait sits on a blocking thread.
                    let wait = MODEL_DOWNLOAD_RETRY_WAIT;
                    let _ = tauri::async_runtime::spawn_blocking(move || std::thread::sleep(wait)).await;
                }
                Err(failure) => return Err(failure),
            }
        };
        if received != size_bytes {
            return Err(format!("Download incomplete ({received} of {size_bytes} bytes).").into());
        }
        report_verifying(0, received);
        // Hashing gigabytes takes seconds: off the async runtime's workers.
        let checked = temp.to_path_buf();
        let sha256 = sha256.map(str::to_owned);
        tauri::async_runtime::spawn_blocking(move || {
            verify_model_file_with_progress(&checked, size_bytes, sha256.as_deref(), |done| {
                report_verifying(done, received);
            })
        })
        .await
        .map_err(|e| format!("Failed to verify model download: {e}"))?
        .map_err(TransferFailure::from)
    }
    .await;
    match result {
        Ok(()) => Ok(()),
        Err(failure) => {
            // A partial file the network left is kept for the next Download,
            // which continues it; a file the server or the check refused is
            // never left where it could be loaded.
            if !failure.retry {
                let _ = std::fs::remove_file(temp);
            }
            Err(failure.error)
        }
    }
}

fn set_model_download_status(app: &tauri::AppHandle, filename: &str, status: ModelDownloadStatus) {
    if let Some(state) = app.try_state::<ModelDownloadsState>() {
        if let Ok(mut downloads) = state.0.lock() {
            downloads.insert(filename.to_owned(), status);
        }
    }
}

async fn run_model_download(
    app: tauri::AppHandle,
    filename: String,
    url: String,
    size_bytes: u64,
    sha256: Option<String>,
) -> Result<(), String> {
    let temp = model_temp_path(&app, &filename)?;
    let dest = model_path(&app, &filename)?;
    let client = model_download_client()?;
    let progress_app = app.clone();
    let progress_filename = filename.clone();
    let verifying_app = app.clone();
    let verifying_filename = filename.clone();
    download_model_file(
        &client,
        &url,
        &temp,
        size_bytes,
        sha256.as_deref(),
        move |received, total| {
            set_model_download_status(
                &progress_app,
                &progress_filename,
                ModelDownloadStatus::Downloading { received, total },
            );
        },
        move |done, total| {
            set_model_download_status(
                &verifying_app,
                &verifying_filename,
                ModelDownloadStatus::Verifying { done, total },
            );
        },
    )
    .await?;
    // Windows refuses to rename over an existing file.
    if dest.exists() {
        std::fs::remove_file(&dest)
            .map_err(|e| format!("Failed to replace the installed model: {e}"))?;
    }
    std::fs::rename(&temp, &dest).map_err(|e| format!("Failed to finalize model download: {e}"))?;
    Ok(())
}

/// Starts a download in the background and returns at once; the webview
/// follows it with `local_ai_download_model_progress`.
#[tauri::command]
pub fn local_ai_download_model_start(
    app: tauri::AppHandle,
    state: tauri::State<'_, ModelDownloadsState>,
    filename: String,
    url: String,
    size_bytes: u64,
    sha256: Option<String>,
) -> Result<(), String> {
    validate_model_filename(&filename)?;
    validate_model_download_url(&url)?;
    if size_bytes == 0 {
        return Err("The model entry has no size".into());
    }
    if let Some(hash) = sha256.as_deref() {
        if !is_sha256_hex(hash) {
            return Err("Invalid model checksum".into());
        }
    }
    {
        let mut downloads = state.0.lock().map_err(|e| e.to_string())?;
        if matches!(
            downloads.get(&filename),
            Some(ModelDownloadStatus::Downloading { .. } | ModelDownloadStatus::Verifying { .. })
        ) {
            return Err("This model is already downloading".into());
        }
        downloads.insert(
            filename.clone(),
            ModelDownloadStatus::Downloading {
                received: 0,
                total: size_bytes,
            },
        );
    }
    tauri::async_runtime::spawn(async move {
        #[cfg(target_os = "ios")]
        crate::ios_screen::download_started(&app);
        let result =
            run_model_download(app.clone(), filename.clone(), url, size_bytes, sha256).await;
        #[cfg(target_os = "ios")]
        crate::ios_screen::download_ended(&app);
        let status = match result {
            Ok(()) => ModelDownloadStatus::Installed,
            Err(error) => ModelDownloadStatus::Failed { error },
        };
        set_model_download_status(&app, &filename, status);
    });
    Ok(())
}

/// `None` when the shell knows nothing of this file (no download started since
/// the app was launched); a finished or failed download stays readable until
/// the next start.
#[tauri::command]
pub fn local_ai_download_model_progress(
    state: tauri::State<'_, ModelDownloadsState>,
    filename: String,
) -> Result<Option<ModelDownloadStatus>, String> {
    validate_model_filename(&filename)?;
    let downloads = state.0.lock().map_err(|e| e.to_string())?;
    Ok(downloads.get(&filename).cloned())
}

#[tauri::command]
pub fn local_ai_delete_model(app: tauri::AppHandle, filename: String) -> Result<(), String> {
    let path = model_path(&app, &filename)?;
    let temp = model_temp_path(&app, &filename)?;
    let _ = std::fs::remove_file(path);
    let _ = std::fs::remove_file(temp);

    Ok(())
}

/// llama-server is a child process: it must not outlive the app.
#[cfg(desktop)]
pub fn stop_server_on_exit(app: &tauri::AppHandle) {
    if let Some(state) = app.try_state::<LocalAIState>() {
        if let Ok(mut guard) = state.0.lock() {
            if let Some(child) = guard.take() {
                let _ = child.kill();
            }
        }
    }
}

#[cfg(test)]
mod local_model_tests {
    use super::{
        download_model_file, expected_download_total, model_download_client,
        resolve_installed_model, resumable_bytes, stream_too_slow, validate_model_download_url,
        validate_model_filename, verify_model_file_with_progress, ModelDownloadSink,
        ModelDownloadStatus,
    };
    use sha2::{Digest, Sha256};
    use std::path::{Path, PathBuf};
    use std::sync::Mutex;

    fn verify_model_file(path: &Path, size: u64, sha256: Option<&str>) -> Result<(), String> {
        verify_model_file_with_progress(path, size, sha256, |_| {})
    }

    // A fresh directory per test under the system temp dir; removed at the end.
    fn scratch_dir(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "alice-desktop-{name}-{}",
            std::process::id()
        ));
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn model_filenames_cannot_leave_the_models_directory() {
        assert!(validate_model_filename("Qwen3.5-4B-Q4_K_M.gguf").is_ok());
        for name in [
            "../model.gguf",
            "dir/model.gguf",
            "dir\\model.gguf",
            "C:model.gguf",
            "/etc/model.gguf",
            "model.bin",
            "model.gguf.download",
        ] {
            assert!(validate_model_filename(name).is_err(), "{name}");
        }
    }

    #[test]
    fn only_an_installed_model_inside_the_directory_is_started() {
        let root = scratch_dir("start");
        let models = root.join("models");
        std::fs::create_dir_all(&models).unwrap();
        std::fs::write(models.join("installed.gguf"), b"gguf").unwrap();
        std::fs::write(root.join("outside.gguf"), b"gguf").unwrap();

        let resolved = resolve_installed_model(&models, "installed.gguf").unwrap();
        assert_eq!(resolved, models.join("installed.gguf"));
        assert!(resolve_installed_model(&models, "missing.gguf").is_err());
        assert!(resolve_installed_model(&models, "../outside.gguf").is_err());
        assert!(
            resolve_installed_model(&models, &root.join("outside.gguf").to_string_lossy()).is_err()
        );

        // A link planted in the directory does not lead llama-server outside it.
        #[cfg(unix)]
        {
            std::os::unix::fs::symlink(root.join("outside.gguf"), models.join("link.gguf"))
                .unwrap();
            assert!(resolve_installed_model(&models, "link.gguf").is_err());
        }
        std::fs::remove_dir_all(&root).unwrap();
    }

    #[test]
    fn a_download_is_accepted_only_with_its_size_and_published_hash() {
        let root = scratch_dir("verify");
        let file = root.join("model.gguf.download");
        std::fs::write(&file, b"abc").unwrap();
        // SHA-256 of "abc".
        let abc = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

        assert!(verify_model_file(&file, 3, Some(abc)).is_ok());
        assert!(verify_model_file(&file, 3, None).is_ok());
        assert!(verify_model_file(&file, 4, Some(abc)).is_err());
        assert!(verify_model_file(&file, 4, None).is_err());
        let other = "0".repeat(64);
        assert!(verify_model_file(&file, 3, Some(&other)).is_err());
        assert!(verify_model_file(&file, 3, Some(&abc.to_uppercase())).is_err());
        assert!(verify_model_file(&file, 3, Some("abc")).is_err());
        std::fs::remove_dir_all(&root).unwrap();
    }

    // The shape packages/alice-ai/src/local-model-download-progress.ts reads.
    #[test]
    fn the_polled_status_is_serialized_as_the_webview_reads_it() {
        let json = |status: ModelDownloadStatus| serde_json::to_string(&status).unwrap();
        assert_eq!(
            json(ModelDownloadStatus::Downloading { received: 437_009_580, total: 2_740_937_888 }),
            r#"{"state":"downloading","received":437009580,"total":2740937888}"#
        );
        assert_eq!(
            json(ModelDownloadStatus::Verifying { done: 1_048_576, total: 2_740_937_888 }),
            r#"{"state":"verifying","done":1048576,"total":2740937888}"#
        );
        assert_eq!(json(ModelDownloadStatus::Installed), r#"{"state":"installed"}"#);
        assert_eq!(
            json(ModelDownloadStatus::Failed { error: "Download incomplete (3 of 4 bytes).".into() }),
            r#"{"state":"failed","error":"Download incomplete (3 of 4 bytes)."}"#
        );
    }

    #[test]
    fn the_hash_check_reports_how_far_it_is() {
        let root = scratch_dir("verify-progress");
        let file = root.join("model.gguf.download");
        // 3 MB, so the 1 MB pieces report 3 times, ending at the full size.
        let bytes = vec![7u8; 3 << 20];
        std::fs::write(&file, &bytes).unwrap();
        let expected = format!("{:x}", Sha256::digest(&bytes));
        let seen = Mutex::new(Vec::new());
        verify_model_file_with_progress(&file, bytes.len() as u64, Some(&expected), |done| {
            seen.lock().unwrap().push(done);
        })
        .unwrap();
        assert_eq!(seen.into_inner().unwrap(), vec![1 << 20, 2 << 20, 3 << 20]);
        std::fs::remove_dir_all(&root).unwrap();
    }

    #[test]
    fn models_are_downloaded_from_hugging_face_over_tls_only() {
        assert!(validate_model_download_url(
            "https://huggingface.co/unsloth/Qwen3.5-4B-GGUF/resolve/e87f176479d0855a907a41277aca2f8ee7a09523/Qwen3.5-4B-Q4_K_M.gguf"
        )
        .is_ok());
        for url in [
            "http://huggingface.co/unsloth/Qwen3.5-4B-GGUF/resolve/main/Qwen3.5-4B-Q4_K_M.gguf",
            "https://example.com/unsloth/Qwen3.5-4B-GGUF/resolve/main/Qwen3.5-4B-Q4_K_M.gguf",
            "https://huggingface.co.evil.example/model.gguf",
            "https://huggingface.co/unsloth/Qwen3.5-4B-GGUF/resolve/main/README.md",
            "not a url",
        ] {
            assert!(validate_model_download_url(url).is_err(), "{url}");
        }
    }

    #[test]
    fn a_server_announcing_another_size_is_refused_before_the_first_byte() {
        assert_eq!(expected_download_total(Some(2_740_937_888), 2_740_937_888), Ok(2_740_937_888));
        assert_eq!(expected_download_total(None, 2_740_937_888), Ok(2_740_937_888));
        assert!(expected_download_total(Some(6_000_000_000), 2_740_937_888).is_err());
        assert!(expected_download_total(Some(1066), 2_740_937_888).is_err());
    }

    #[test]
    fn the_sink_writes_every_piece_and_stops_at_the_announced_size() {
        let root = scratch_dir("sink");
        let temp = root.join("model.gguf.download");

        let mut sink = ModelDownloadSink::create(&temp, 6).unwrap();
        assert_eq!(sink.write(b"abc").unwrap(), 3);
        assert_eq!(sink.write(b"de").unwrap(), 5);
        // Past the announced size: refused, and the bytes already written stay.
        assert!(sink.write(b"fg").is_err());
        assert_eq!(sink.write(b"f").unwrap(), 6);
        assert_eq!(sink.finish().unwrap(), 6);
        assert_eq!(std::fs::read(&temp).unwrap(), b"abcdef");

        // A new sink for the same file starts over instead of appending.
        let sink = ModelDownloadSink::create(&temp, 1).unwrap();
        assert_eq!(sink.finish().unwrap(), 0);
        assert_eq!(std::fs::read(&temp).unwrap(), b"");
        std::fs::remove_dir_all(&root).unwrap();
    }

    #[test]
    fn a_stream_is_dropped_only_after_a_full_window_under_the_floor() {
        use std::time::Duration;
        // Before the window closes nothing is judged, however little arrived.
        assert!(!stream_too_slow(Duration::from_secs(59), 0));
        // A window at 5 KB/s (the Galaxy A15 case) is dropped.
        assert!(stream_too_slow(Duration::from_secs(60), 300 << 10));
        // 512 KB in 60 s is kept: a slow link still gets there.
        assert!(!stream_too_slow(Duration::from_secs(60), 512 << 10));
        assert!(!stream_too_slow(Duration::from_secs(61), 50 << 20));
    }

    #[test]
    fn a_sink_opened_on_a_partial_file_continues_after_its_bytes() {
        let root = scratch_dir("sink-resume");
        let temp = root.join("model.gguf.download");
        let mut sink = ModelDownloadSink::create(&temp, 6).unwrap();
        sink.write(b"abc").unwrap();
        sink.finish().unwrap();

        assert_eq!(resumable_bytes(&temp, 6), 3);
        assert_eq!(resumable_bytes(&temp, 3), 0, "a complete file is not resumed");
        assert_eq!(resumable_bytes(&root.join("missing"), 6), 0);

        let mut sink = ModelDownloadSink::open(&temp, 6, 3).unwrap();
        assert_eq!(sink.write(b"de").unwrap(), 5);
        assert!(sink.write(b"fg").is_err());
        assert_eq!(sink.write(b"f").unwrap(), 6);
        assert_eq!(sink.finish().unwrap(), 6);
        assert_eq!(std::fs::read(&temp).unwrap(), b"abcdef");
        std::fs::remove_dir_all(&root).unwrap();
    }

    // A server on this machine that sends 3 of 6 bytes and closes, then
    // answers the Range request with the rest.
    fn serve_a_cut_then_the_rest() -> (String, std::thread::JoinHandle<Vec<String>>) {
        use std::io::{Read, Write};
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let url = format!("http://{}/model.gguf", listener.local_addr().unwrap());
        let handle = std::thread::spawn(move || {
            let mut requests = Vec::new();
            for turn in 0..2 {
                let (mut stream, _) = listener.accept().unwrap();
                let mut head = Vec::new();
                let mut byte = [0u8; 1];
                while !head.ends_with(b"\r\n\r\n") && stream.read(&mut byte).unwrap() == 1 {
                    head.push(byte[0]);
                }
                let request = String::from_utf8_lossy(&head).to_string();
                let resumed = request.to_ascii_lowercase().contains("range: bytes=3-");
                requests.push(request);
                if turn == 0 {
                    stream
                        .write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 6\r\nConnection: close\r\n\r\nabc")
                        .unwrap();
                    // Closing here cuts the body short.
                } else {
                    assert!(resumed, "the second request continues after the bytes on disk");
                    stream
                        .write_all(b"HTTP/1.1 206 Partial Content\r\nContent-Length: 3\r\nContent-Range: bytes 3-5/6\r\nConnection: close\r\n\r\ndef")
                        .unwrap();
                }
            }
            requests
        });
        (url, handle)
    }

    #[test]
    fn a_cut_transfer_continues_from_the_bytes_on_disk() {
        let root = scratch_dir("resume");
        let temp = root.join("model.gguf.download");
        let (url, server) = serve_a_cut_then_the_rest();
        let abcdef = "bef57ec7f53a6d40beb640a780a639c83bc29ac8a9816f1fc6c5c6dcd93c4721";
        let reports = Mutex::new(Vec::<(u64, u64)>::new());
        tauri::async_runtime::block_on(async {
            let client = model_download_client().unwrap();
            download_model_file(
                &client,
                &url,
                &temp,
                6,
                Some(abcdef),
                |received, total| reports.lock().unwrap().push((received, total)),
                |_, _| {},
            )
            .await
        })
        .unwrap();
        let requests = server.join().unwrap();
        assert_eq!(requests.len(), 2);
        assert_eq!(std::fs::read(&temp).unwrap(), b"abcdef");
        let reports = reports.into_inner().unwrap();
        assert_eq!(reports.first(), Some(&(0, 6)));
        assert!(reports.contains(&(3, 6)), "the second attempt reports from the bytes kept: {reports:?}");
        assert_eq!(reports.last(), Some(&(6, 6)));
        std::fs::remove_dir_all(&root).unwrap();
    }

    // The recommended catalog model, for real, from Hugging Face: 2.7 GB, so
    // on demand only (`cargo test -- --ignored real_download`). Checks the
    // progress reports, the exact size and the published SHA-256 end to end.
    #[test]
    #[ignore = "downloads 2.7 GB from Hugging Face"]
    fn real_download_of_the_recommended_model_completes_and_verifies() {
        const URL: &str = "https://huggingface.co/unsloth/Qwen3.5-4B-GGUF/resolve/e87f176479d0855a907a41277aca2f8ee7a09523/Qwen3.5-4B-Q4_K_M.gguf";
        const SIZE: u64 = 2_740_937_888;
        const SHA256: &str = "00fe7986ff5f6b463e62455821146049db6f9313603938a70800d1fb69ef11a4";
        let root = std::env::var_os("ALICE_MODEL_DOWNLOAD_TEST_DIR")
            .map(PathBuf::from)
            .unwrap_or_else(|| scratch_dir("real-download"));
        std::fs::create_dir_all(&root).unwrap();
        let temp = root.join("Qwen3.5-4B-Q4_K_M.gguf.download");
        let reports = Mutex::new(Vec::<(u64, u64)>::new());
        let started = std::time::Instant::now();
        tauri::async_runtime::block_on(async {
            let client = model_download_client().unwrap();
            download_model_file(
                &client,
                URL,
                &temp,
                SIZE,
                Some(SHA256),
                |received, total| {
                    let mut reports = reports.lock().unwrap();
                    let percent = received * 100 / total;
                    if reports.last().map(|(r, t)| r * 100 / t) != Some(percent) || received == total {
                        eprintln!("{:>5.0}s {percent:>3}% {received} / {total}", started.elapsed().as_secs_f64());
                    }
                    reports.push((received, total));
                },
                move |done, total| {
                    if done == 0 || done == total || done % (256 << 20) == 0 {
                        eprintln!("{:>5.0}s verifying {done} / {total}", started.elapsed().as_secs_f64());
                    }
                },
            )
            .await
        })
        .unwrap();
        let reports = reports.into_inner().unwrap();
        assert_eq!(reports.first(), Some(&(0, SIZE)));
        assert_eq!(reports.last(), Some(&(SIZE, SIZE)));
        assert!(reports.windows(2).all(|w| w[0].0 <= w[1].0), "progress never goes backwards");
        assert_eq!(std::fs::metadata(&temp).unwrap().len(), SIZE);
        std::fs::remove_file(&temp).unwrap();
    }
}
