use aes_gcm::aead::{Aead, Payload};
use aes_gcm::{Aes256Gcm, KeyInit, Nonce};
use base64::engine::general_purpose::STANDARD_NO_PAD;
use base64::Engine;
use rand::rngs::OsRng;
use rand::RngCore;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;
use tauri::menu::{AboutMetadata, MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::Manager;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;
use zeroize::{Zeroize, Zeroizing};

pub struct LocalAIState(pub Mutex<Option<CommandChild>>);
pub struct ChatStorageKeyState(pub Mutex<Option<Zeroizing<[u8; 32]>>>);

const CHAT_KEYRING_SERVICE: &str = "com.alicebitcoin.desktop";
const CHAT_KEYRING_USER: &str = "chat-storage-v1";
const CHAT_VALUE_VERSION: &str = "v1:";
const MAX_CHAT_PLAINTEXT_BYTES: usize = 16 * 1024 * 1024;

// The storage keys the keychain key may encrypt: the conversations and the
// profiles (exact keys), and the Explorer's and the Playground's own stores
// (by prefix; see apps/app-web/src/lib/local-vault.ts for the list). A
// context is the storage key the value is bound to, so a value cannot be
// moved from one key to another.
const LOCAL_STORE_CONTEXT_PREFIXES: [&str; 7] = [
    "explorer.",
    "alice_explorer_",
    "alice_arkade_",
    "alice_bark_",
    "alice_spark_",
    "alice.ask-alice.",
    "alice.test-wallet.",
];

fn validate_chat_storage_context(context: &str) -> Result<(), String> {
    if context == "alice_chat_sessions"
        || context == "alice_pedagogical_profile_v2"
        || context == "alice_learning_profile_v3"
        || context == "alice_personal_memory_v1"
        || context.starts_with("alice_chat_session_")
        || LOCAL_STORE_CONTEXT_PREFIXES
            .iter()
            .any(|prefix| context.starts_with(prefix))
    {
        Ok(())
    } else {
        Err("Invalid chat storage context".into())
    }
}

fn load_or_create_chat_storage_key() -> Result<[u8; 32], String> {
    let entry = keyring::Entry::new(CHAT_KEYRING_SERVICE, CHAT_KEYRING_USER)
        .map_err(|e| format!("Failed to open the system keychain: {e}"))?;
    match entry.get_password() {
        Ok(encoded) => {
            let mut decoded = STANDARD_NO_PAD.decode(encoded).map_err(|_| {
                "The chat encryption key stored in the system keychain is invalid.".to_string()
            })?;
            if decoded.len() != 32 {
                decoded.zeroize();
                return Err(
                    "The chat encryption key stored in the system keychain has an invalid length."
                        .into(),
                );
            }
            let mut key = [0u8; 32];
            key.copy_from_slice(&decoded);
            decoded.zeroize();
            Ok(key)
        }
        Err(keyring::Error::NoEntry) => {
            let mut key = [0u8; 32];
            OsRng.fill_bytes(&mut key);
            let encoded = STANDARD_NO_PAD.encode(key);
            if let Err(error) = entry.set_password(&encoded) {
                key.zeroize();
                return Err(format!(
                    "Failed to save the chat encryption key in the system keychain: {error}"
                ));
            }
            Ok(key)
        }
        Err(error) => Err(format!(
            "Failed to read the chat encryption key from the system keychain: {error}"
        )),
    }
}

fn encrypt_chat_value_with_key(
    key: &[u8; 32],
    plaintext: &str,
    context: &str,
) -> Result<String, String> {
    validate_chat_storage_context(context)?;
    if plaintext.len() > MAX_CHAT_PLAINTEXT_BYTES {
        return Err("Conversation data is too large to encrypt.".into());
    }
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|_| "Failed to initialize chat encryption.".to_string())?;
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let ciphertext = cipher
        .encrypt(
            Nonce::from_slice(&nonce_bytes),
            Payload {
                msg: plaintext.as_bytes(),
                aad: context.as_bytes(),
            },
        )
        .map_err(|_| "Failed to encrypt conversation data.".to_string())?;
    let mut payload = Vec::with_capacity(nonce_bytes.len() + ciphertext.len());
    payload.extend_from_slice(&nonce_bytes);
    payload.extend_from_slice(&ciphertext);
    Ok(format!(
        "{CHAT_VALUE_VERSION}{}",
        STANDARD_NO_PAD.encode(payload)
    ))
}

fn decrypt_chat_value_with_key(
    key: &[u8; 32],
    encrypted: &str,
    context: &str,
) -> Result<String, String> {
    validate_chat_storage_context(context)?;
    let payload = encrypted
        .strip_prefix(CHAT_VALUE_VERSION)
        .ok_or_else(|| "Unsupported chat encryption format.".to_string())?;
    let mut decoded = STANDARD_NO_PAD
        .decode(payload)
        .map_err(|_| "Conversation data is corrupt.".to_string())?;
    if decoded.len() <= 12 {
        decoded.zeroize();
        return Err("Conversation data is corrupt.".into());
    }
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|_| "Failed to initialize chat decryption.".to_string())?;
    let plaintext = cipher
        .decrypt(
            Nonce::from_slice(&decoded[..12]),
            Payload {
                msg: &decoded[12..],
                aad: context.as_bytes(),
            },
        )
        .map_err(|_| "Conversation data could not be authenticated.".to_string())?;
    decoded.zeroize();
    String::from_utf8(plaintext).map_err(|_| "Conversation data is not valid text.".into())
}

#[tauri::command]
fn chat_storage_encrypt(
    plaintext: String,
    context: String,
    state: tauri::State<'_, ChatStorageKeyState>,
) -> Result<String, String> {
    with_chat_storage_key(&state, |key| {
        encrypt_chat_value_with_key(key, &plaintext, &context)
    })
}

#[tauri::command]
fn chat_storage_decrypt(
    ciphertext: String,
    context: String,
    state: tauri::State<'_, ChatStorageKeyState>,
) -> Result<String, String> {
    with_chat_storage_key(&state, |key| {
        decrypt_chat_value_with_key(key, &ciphertext, &context)
    })
}

fn with_chat_storage_key<T>(
    state: &tauri::State<'_, ChatStorageKeyState>,
    operation: impl FnOnce(&[u8; 32]) -> Result<T, String>,
) -> Result<T, String> {
    let mut guard = state
        .0
        .lock()
        .map_err(|_| "Chat encryption key state is unavailable.".to_string())?;
    if guard.is_none() {
        *guard = Some(Zeroizing::new(load_or_create_chat_storage_key()?));
    }
    let key = guard
        .as_ref()
        .ok_or_else(|| "Chat encryption key is unavailable.".to_string())?;
    operation(key)
}

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

fn desktop_models_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("Failed to resolve app data directory: {e}"))?
        .join("models");
    std::fs::create_dir_all(&dir).map_err(|e| format!("Failed to create models directory: {e}"))?;
    Ok(dir)
}

fn desktop_model_path(app: &tauri::AppHandle, filename: &str) -> Result<PathBuf, String> {
    validate_model_filename(filename)?;
    Ok(desktop_models_dir(app)?.join(filename))
}

fn desktop_model_temp_path(app: &tauri::AppHandle, filename: &str) -> Result<PathBuf, String> {
    validate_model_filename(filename)?;
    Ok(desktop_models_dir(app)?.join(format!("{filename}.download")))
}

/// The installed model `filename` inside `models_dir`. The check resolves any
/// symlink, so llama-server can only ever be pointed at a file that really
/// lives in the app's models directory; the path handed back is the plain one,
/// since a canonical Windows path carries a `\\?\` prefix.
fn resolve_installed_model(models_dir: &Path, filename: &str) -> Result<PathBuf, String> {
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
#[tauri::command]
fn local_ai_start(
    filename: String,
    ctx_size: Option<u32>,
    state: tauri::State<'_, LocalAIState>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    let model_path = resolve_installed_model(&desktop_models_dir(&app)?, &filename)?;
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

#[tauri::command]
fn local_ai_stop(state: tauri::State<'_, LocalAIState>) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(child) = guard.take() {
        child
            .kill()
            .map_err(|e| format!("Failed to stop llama-server: {e}"))?;
    }
    Ok(())
}

#[tauri::command]
fn local_ai_is_running(state: tauri::State<'_, LocalAIState>) -> bool {
    state.0.lock().map(|g| g.is_some()).unwrap_or(false)
}

#[tauri::command]
fn local_ai_model_status(app: tauri::AppHandle, filename: String) -> Result<String, String> {
    let installed_path = desktop_model_path(&app, &filename)?;
    if installed_path.exists() {
        return Ok("installed".into());
    }

    Ok("not-installed".into())
}

#[tauri::command]
fn local_ai_model_path(app: tauri::AppHandle, filename: String) -> Result<String, String> {
    let installed_path = desktop_model_path(&app, &filename)?;
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

fn model_download_client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .connect_timeout(MODEL_DOWNLOAD_CONNECT_TIMEOUT)
        .read_timeout(MODEL_DOWNLOAD_READ_TIMEOUT)
        .user_agent(concat!("alice-desktop/", env!("CARGO_PKG_VERSION")))
        .build()
        .map_err(|e| format!("Failed to prepare the download: {e}"))
}

/// Downloads `url` into `temp`, reporting (received, total) as pieces land,
/// then checks the exact size and, when one is published, the SHA-256. On
/// success `temp` holds a verified file; on failure it is removed.
async fn download_model_file(
    client: &reqwest::Client,
    url: &str,
    temp: &Path,
    size_bytes: u64,
    sha256: Option<&str>,
    report: impl Fn(u64, u64) + Send + Sync,
    report_verifying: impl Fn(u64, u64) + Send + Sync + 'static,
) -> Result<(), String> {
    let result = async {
        let mut response = client
            .get(url)
            .send()
            .await
            .map_err(|e| format!("Download failed: {e}"))?;
        let status = response.status();
        if !status.is_success() {
            return Err(format!("Download failed ({status})"));
        }
        let total = expected_download_total(response.content_length(), size_bytes)?;
        let mut sink = ModelDownloadSink::create(temp, total)?;
        report(0, total);
        while let Some(chunk) = response
            .chunk()
            .await
            .map_err(|e| format!("Download interrupted: {e}"))?
        {
            let received = sink.write(&chunk)?;
            report(received, total);
        }
        let received = sink.finish()?;
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
    }
    .await;
    if result.is_err() {
        // A file that failed the download or the check is never left where
        // it could be loaded.
        let _ = std::fs::remove_file(temp);
    }
    result
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
    let temp = desktop_model_temp_path(&app, &filename)?;
    let dest = desktop_model_path(&app, &filename)?;
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
fn local_ai_download_model_start(
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
        let result =
            run_model_download(app.clone(), filename.clone(), url, size_bytes, sha256).await;
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
fn local_ai_download_model_progress(
    state: tauri::State<'_, ModelDownloadsState>,
    filename: String,
) -> Result<Option<ModelDownloadStatus>, String> {
    validate_model_filename(&filename)?;
    let downloads = state.0.lock().map_err(|e| e.to_string())?;
    Ok(downloads.get(&filename).cloned())
}

#[tauri::command]
fn local_ai_delete_model(app: tauri::AppHandle, filename: String) -> Result<(), String> {
    let path = desktop_model_path(&app, &filename)?;
    let temp = desktop_model_temp_path(&app, &filename)?;
    let _ = std::fs::remove_file(path);
    let _ = std::fs::remove_file(temp);

    Ok(())
}

// On macOS 15+, WebKit silently drops fetch() calls from tauri:// pages to ipc://.
// No JS error fires, so ipc-protocol.js's customProtocolIpcFailed flag stays false
// and the window.ipc.postMessage fallback never activates.
// Wrapping window.fetch with a 100ms timeout forces a rejection on the first hung
// ipc:// call, which sets customProtocolIpcFailed = true and switches all subsequent
// invokes to the postMessage path permanently.
const IPC_FETCH_TIMEOUT_FIX: &str = r#"
;(function () {
  var _f = window.fetch;
  window.fetch = function (resource, init) {
    var url = typeof resource === 'string' ? resource : resource && resource.url;
    if (url && url.indexOf('ipc://') === 0) {
      return Promise.race([
        _f.call(window, resource, init),
        new Promise(function (_, reject) {
          setTimeout(function () { reject(new Error('ipc:// unavailable')); }, 100);
        })
      ]);
    }
    return _f.apply(window, arguments);
  };
})();
"#;

// Menu ids are forwarded to the web layer as an `alice-menu` DOM event rather
// than handled in Rust: New Chat, Settings and Search all live in the React
// sidebar, which owns the session state.
const MENU_NEW_CHAT: &str = "new-chat";
const MENU_SEARCH: &str = "search";
const MENU_SETTINGS: &str = "settings";

fn build_app_menu(app: &tauri::AppHandle) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    let settings = MenuItemBuilder::with_id(MENU_SETTINGS, "Settings…")
        .accelerator("CmdOrCtrl+,")
        .build(app)?;
    let new_chat = MenuItemBuilder::with_id(MENU_NEW_CHAT, "New Chat")
        .accelerator("CmdOrCtrl+N")
        .build(app)?;
    let search = MenuItemBuilder::with_id(MENU_SEARCH, "Search Conversations")
        .accelerator("CmdOrCtrl+K")
        .build(app)?;

    let about_metadata = AboutMetadata {
        name: Some("Alice".into()),
        version: Some(env!("CARGO_PKG_VERSION").into()),
        ..Default::default()
    };

    let alice_menu = SubmenuBuilder::new(app, "Alice")
        .about(Some(about_metadata))
        .separator()
        .item(&settings)
        .separator()
        .services()
        .separator()
        .hide()
        .hide_others()
        .show_all()
        .separator()
        .quit()
        .build()?;

    let file_menu = SubmenuBuilder::new(app, "File")
        .item(&new_chat)
        .item(&search)
        .separator()
        .close_window()
        .build()?;

    // Setting a custom menu replaces the macOS default one, so Edit has to be
    // rebuilt by hand or copy/paste stops working in the composer.
    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;

    let window_menu = SubmenuBuilder::new(app, "Window")
        .minimize()
        .fullscreen()
        .build()?;

    MenuBuilder::new(app)
        .items(&[&alice_menu, &file_menu, &edit_menu, &window_menu])
        .build()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .append_invoke_initialization_script(IPC_FETCH_TIMEOUT_FIX)
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            let menu = build_app_menu(app.handle())?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            let id = event.id().as_ref();
            if id != MENU_NEW_CHAT && id != MENU_SEARCH && id != MENU_SETTINGS {
                return;
            }
            if let Some(window) = app.get_webview_window("main") {
                // A menu accelerator is swallowed by macOS and never reaches the
                // webview, so the keyboard shortcuts have to be replayed here.
                let _ = window.eval(&format!(
                    "window.dispatchEvent(new CustomEvent('alice-menu', {{ detail: '{id}' }}))"
                ));
            }
        })
        .manage(LocalAIState(Mutex::new(None)))
        .manage(ChatStorageKeyState(Mutex::new(None)))
        .manage(ModelDownloadsState(Mutex::new(HashMap::new())))
        .invoke_handler(tauri::generate_handler![
            chat_storage_decrypt,
            chat_storage_encrypt,
            local_ai_delete_model,
            local_ai_download_model_progress,
            local_ai_download_model_start,
            local_ai_model_path,
            local_ai_model_status,
            local_ai_start,
            local_ai_stop,
            local_ai_is_running,
        ])
        .build(tauri::generate_context!())
        .expect("error building application")
        .run(|app_handle, event| {
            if let tauri::RunEvent::Exit = event {
                if let Some(state) = app_handle.try_state::<LocalAIState>() {
                    if let Ok(mut guard) = state.0.lock() {
                        if let Some(child) = guard.take() {
                            let _ = child.kill();
                        }
                    }
                }
            }
        });
}

#[cfg(test)]
mod chat_storage_tests {
    use super::{
        decrypt_chat_value_with_key, encrypt_chat_value_with_key, load_or_create_chat_storage_key,
    };
    use zeroize::Zeroize;

    #[test]
    fn chat_storage_round_trips_without_plaintext_in_the_envelope() {
        let key = [7u8; 32];
        let context = "alice_chat_session_test";
        let plaintext = r#"[{"role":"user","content":"private conversation"}]"#;
        let encrypted = encrypt_chat_value_with_key(&key, plaintext, context).unwrap();

        assert!(!encrypted.contains("private conversation"));
        assert_eq!(
            decrypt_chat_value_with_key(&key, &encrypted, context).unwrap(),
            plaintext
        );
    }

    #[test]
    fn learning_profile_uses_the_same_keychain_backed_envelope() {
        let key = [5u8; 32];
        let plaintext = r#"{"version":3,"concepts":{}}"#;
        let encrypted = encrypt_chat_value_with_key(&key, plaintext, "alice_learning_profile_v3").unwrap();

        assert!(!encrypted.contains("concepts"));
        assert_eq!(
            decrypt_chat_value_with_key(&key, &encrypted, "alice_learning_profile_v3").unwrap(),
            plaintext
        );

        let memory = r#"{"version":1,"enabled":true,"items":[]}"#;
        let encrypted_memory = encrypt_chat_value_with_key(&key, memory, "alice_personal_memory_v1").unwrap();
        assert!(!encrypted_memory.contains("items"));
        assert_eq!(
            decrypt_chat_value_with_key(&key, &encrypted_memory, "alice_personal_memory_v1").unwrap(),
            memory
        );
    }

    #[test]
    fn chat_storage_rejects_tampering_and_wrong_context() {
        let key = [9u8; 32];
        let encrypted =
            encrypt_chat_value_with_key(&key, "sensitive title", "alice_chat_sessions").unwrap();
        assert!(
            decrypt_chat_value_with_key(&key, &encrypted, "alice_chat_session_other",).is_err()
        );

        let mut tampered = encrypted.into_bytes();
        let last = tampered.len() - 1;
        tampered[last] = if tampered[last] == b'A' { b'B' } else { b'A' };
        let tampered = String::from_utf8(tampered).unwrap();

        assert!(decrypt_chat_value_with_key(&key, &tampered, "alice_chat_sessions").is_err());
    }

    #[test]
    fn explorer_and_playground_stores_use_the_same_envelope_bound_to_their_key() {
        let key = [3u8; 32];
        for context in [
            "explorer.tabs.v1",
            "alice_explorer_wallets",
            "alice_explorer_node_mainnet",
            "alice_arkade_settlements_v1",
            "alice_bark_rounds_v2",
            "alice_spark_onchain_v2",
            "alice.ask-alice.questions",
            "alice.test-wallet.mnemonic",
        ] {
            let plaintext = r#"[{"input":"xpub6example"}]"#;
            let encrypted = encrypt_chat_value_with_key(&key, plaintext, context).unwrap();
            assert!(!encrypted.contains("xpub6example"));
            assert_eq!(decrypt_chat_value_with_key(&key, &encrypted, context).unwrap(), plaintext);
            // Bound to its own key: the same value under another store's key fails.
            assert!(decrypt_chat_value_with_key(&key, &encrypted, "explorer.session-tabs.v1").is_err());
        }
        // Anything outside the known stores is refused before any key is touched.
        assert!(encrypt_chat_value_with_key(&key, "x", "alice_theme_mode").is_err());
        assert!(encrypt_chat_value_with_key(&key, "x", "random_key").is_err());
    }

    #[test]
    #[ignore = "writes Alice Desktop's persistent key to the operating-system keychain"]
    fn chat_storage_keychain_persists_the_same_key() {
        let mut first = load_or_create_chat_storage_key().unwrap();
        let mut second = load_or_create_chat_storage_key().unwrap();

        assert_eq!(first, second);
        first.zeroize();
        second.zeroize();
    }
}

#[cfg(test)]
mod local_model_tests {
    use super::{
        download_model_file, expected_download_total, model_download_client,
        resolve_installed_model, validate_model_download_url, validate_model_filename,
        verify_model_file_with_progress, ModelDownloadSink, ModelDownloadStatus,
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
