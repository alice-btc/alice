// Local encryption of Alice Desktop and Alice for iOS: a random 32-byte key
// kept in the operating-system keychain, used by the webview through two
// commands so the key never enters JavaScript. The Android app has no
// keychain backend here and uses the web build's WebCrypto cipher instead.

use aes_gcm::aead::{Aead, Payload};
use aes_gcm::{Aes256Gcm, KeyInit, Nonce};
use base64::engine::general_purpose::STANDARD_NO_PAD;
use base64::Engine;
use rand::rngs::OsRng;
use rand::RngCore;
use std::sync::Mutex;
use tauri::Manager;
use zeroize::{Zeroize, Zeroizing};

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

/// Why the keychain key could not be loaded or created, as the webview
/// names it (see alice-ai's local-cipher.ts). The webview never falls back to
/// another key or to plaintext: on any of these it keeps the session in
/// memory and says so.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum KeychainFailure {
    /// No keychain to talk to: no D-Bus session, or no Secret Service
    /// provider (GNOME Keyring, KWallet) running.
    NoSecretService,
    /// The keychain is there but stays locked.
    Locked,
    /// The keychain refused: the unlock prompt was dismissed, access was
    /// denied, or what it holds for Alice cannot be used.
    Denied,
}

impl KeychainFailure {
    pub fn code(self) -> &'static str {
        match self {
            KeychainFailure::NoSecretService => "no-secret-service",
            KeychainFailure::Locked => "locked",
            KeychainFailure::Denied => "denied",
        }
    }
}

#[derive(Debug)]
pub struct KeychainError {
    pub failure: KeychainFailure,
    pub message: String,
}

impl KeychainError {
    fn new(failure: KeychainFailure, message: impl Into<String>) -> Self {
        Self {
            failure,
            message: message.into(),
        }
    }
}

/// keyring wraps the Secret Service errors without exposing their type, so
/// the classification reads the message chain. Anything unrecognized is a
/// refusal: the key cannot be used, whatever the cause.
fn classify_keyring_error(error: &keyring::Error) -> KeychainFailure {
    let mut text = error.to_string();
    let mut source = std::error::Error::source(error);
    while let Some(inner) = source {
        text.push('\n');
        text.push_str(&inner.to_string());
        source = inner.source();
    }
    let text = text.to_lowercase();
    if text.contains("prompt was dismissed") || text.contains("accessdenied") {
        return KeychainFailure::Denied;
    }
    // "object locked", "IsLocked", "Cannot create an item in a locked
    // collection" (GNOME Keyring when its unlock prompt cannot be shown).
    if text.contains("locked") {
        return KeychainFailure::Locked;
    }
    if text.contains("no dbus session or secret service provider")
        || text.contains("serviceunknown")
        || text.contains("namehasnoowner")
        || text.contains("not provided by any .service files")
        || text.contains("org.freedesktop.dbus.error")
        || text.contains("dbus error")
        || text.contains("no result found")
    {
        return KeychainFailure::NoSecretService;
    }
    KeychainFailure::Denied
}

fn load_or_create_chat_storage_key() -> Result<[u8; 32], KeychainError> {
    let keyring_error = |context: &str, error: keyring::Error| {
        KeychainError::new(
            classify_keyring_error(&error),
            format!("{context}: {error}"),
        )
    };
    let entry = keyring::Entry::new(CHAT_KEYRING_SERVICE, CHAT_KEYRING_USER)
        .map_err(|e| keyring_error("Failed to open the system keychain", e))?;
    match entry.get_password() {
        Ok(encoded) => {
            // A key that is there but unusable is never replaced: every value
            // sealed under it would become unreadable.
            let mut decoded = STANDARD_NO_PAD.decode(encoded).map_err(|_| {
                KeychainError::new(
                    KeychainFailure::Denied,
                    "The chat encryption key stored in the system keychain is invalid.",
                )
            })?;
            if decoded.len() != 32 {
                decoded.zeroize();
                return Err(KeychainError::new(
                    KeychainFailure::Denied,
                    "The chat encryption key stored in the system keychain has an invalid length.",
                ));
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
                return Err(keyring_error(
                    "Failed to save the chat encryption key in the system keychain",
                    error,
                ));
            }
            Ok(key)
        }
        Err(error) => Err(keyring_error(
            "Failed to read the chat encryption key from the system keychain",
            error,
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

// The commands are async and the keychain is reached on a blocking thread:
// unlocking GNOME Keyring or KWallet can wait on the user for as long as its
// prompt stays open, and the main thread must keep drawing the window.

/// Loads or creates the keychain key, so the webview knows at start whether
/// its stores can be encrypted. Resolves when the key is ready; rejects with
/// "no-secret-service", "locked" or "denied" otherwise.
#[tauri::command]
pub async fn chat_storage_status(app: tauri::AppHandle) -> Result<(), String> {
    on_blocking_thread(app, |state| {
        with_chat_storage_key(state, |_| Ok(())).map_err(|error| error.failure.code().to_string())
    })
    .await
}

#[tauri::command]
pub async fn chat_storage_encrypt(
    plaintext: String,
    context: String,
    app: tauri::AppHandle,
) -> Result<String, String> {
    on_blocking_thread(app, move |state| {
        with_chat_storage_key(state, |key| {
            encrypt_chat_value_with_key(key, &plaintext, &context)
        })
        .map_err(|error| error.message)
    })
    .await
}

#[tauri::command]
pub async fn chat_storage_decrypt(
    ciphertext: String,
    context: String,
    app: tauri::AppHandle,
) -> Result<String, String> {
    on_blocking_thread(app, move |state| {
        with_chat_storage_key(state, |key| {
            decrypt_chat_value_with_key(key, &ciphertext, &context)
        })
        .map_err(|error| error.message)
    })
    .await
}

async fn on_blocking_thread<T: Send + 'static>(
    app: tauri::AppHandle,
    operation: impl FnOnce(&ChatStorageKeyState) -> Result<T, String> + Send + 'static,
) -> Result<T, String> {
    tauri::async_runtime::spawn_blocking(move || operation(&app.state::<ChatStorageKeyState>()))
        .await
        .map_err(|_| "Chat encryption stopped unexpectedly.".to_string())?
}

/// Runs `operation` with the key, loading it first if needed. Callers queue
/// on the lock while a keychain prompt is open, so only one prompt shows.
fn with_chat_storage_key<T>(
    state: &ChatStorageKeyState,
    operation: impl FnOnce(&[u8; 32]) -> Result<T, String>,
) -> Result<T, KeychainError> {
    let mut guard = state.0.lock().map_err(|_| {
        KeychainError::new(
            KeychainFailure::Denied,
            "Chat encryption key state is unavailable.",
        )
    })?;
    if guard.is_none() {
        *guard = Some(Zeroizing::new(load_or_create_chat_storage_key()?));
    }
    let key = guard.as_ref().ok_or_else(|| {
        KeychainError::new(
            KeychainFailure::Denied,
            "Chat encryption key is unavailable.",
        )
    })?;
    // An error of the operation itself (a bad context, a forged value) is not
    // a keychain failure; it only travels in the message.
    operation(key).map_err(|message| KeychainError::new(KeychainFailure::Denied, message))
}

#[cfg(test)]
mod chat_storage_tests {
    use super::{
        classify_keyring_error, decrypt_chat_value_with_key, encrypt_chat_value_with_key,
        load_or_create_chat_storage_key, KeychainFailure,
    };
    use zeroize::Zeroize;

    fn platform(message: &str) -> keyring::Error {
        keyring::Error::PlatformFailure(Box::new(std::io::Error::other(message.to_string())))
    }

    fn no_access(message: &str) -> keyring::Error {
        keyring::Error::NoStorageAccess(Box::new(std::io::Error::other(message.to_string())))
    }

    #[test]
    fn keychain_failures_are_named_for_the_webview() {
        // What dbus-secret-service reports when nothing answers on D-Bus.
        for missing in [
            "No DBus session or Secret Service provider found",
            "DBus error: The name org.freedesktop.secrets was not provided by any .service files",
            "DBus error: org.freedesktop.DBus.Error.ServiceUnknown",
            "DBus error: Unable to autolaunch a dbus-daemon without a $DISPLAY for X11",
        ] {
            assert_eq!(
                classify_keyring_error(&platform(missing)),
                KeychainFailure::NoSecretService,
                "{missing}"
            );
        }
        assert_eq!(
            classify_keyring_error(&no_access("Secret Service: no result found")),
            KeychainFailure::NoSecretService
        );
        assert_eq!(
            classify_keyring_error(&no_access("Secret Service: object locked")),
            KeychainFailure::Locked
        );
        assert_eq!(
            classify_keyring_error(&platform(
                "DBus error: org.freedesktop.Secret.Error.IsLocked: Cannot create an item in a locked collection"
            )),
            KeychainFailure::Locked
        );
        assert_eq!(
            classify_keyring_error(&platform(
                "DBus error: Cannot create an item in a locked collection"
            )),
            KeychainFailure::Locked
        );
        assert_eq!(
            classify_keyring_error(&no_access("Secret Service: unlock prompt was dismissed")),
            KeychainFailure::Denied
        );
        assert_eq!(
            classify_keyring_error(&platform(
                "DBus error: org.freedesktop.DBus.Error.AccessDenied: Rejected send message"
            )),
            KeychainFailure::Denied
        );
        assert_eq!(
            classify_keyring_error(&keyring::Error::Ambiguous(Vec::new())),
            KeychainFailure::Denied
        );
        assert_eq!(KeychainFailure::NoSecretService.code(), "no-secret-service");
        assert_eq!(KeychainFailure::Locked.code(), "locked");
        assert_eq!(KeychainFailure::Denied.code(), "denied");
    }

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
