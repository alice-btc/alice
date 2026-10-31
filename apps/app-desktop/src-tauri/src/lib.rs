#[cfg(any(desktop, target_os = "ios"))]
mod keychain_storage;
#[cfg(target_os = "ios")]
mod ios_keyboard;
#[cfg(target_os = "ios")]
mod ios_screen;
mod local_ai;
#[cfg(mobile)]
mod local_ai_engine;
mod local_ai_text;

use std::collections::HashMap;
use std::sync::Mutex;
#[cfg(desktop)]
use tauri::menu::{AboutMetadata, MenuBuilder, MenuItemBuilder, SubmenuBuilder};
#[cfg(desktop)]
use tauri::Manager;

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
#[cfg(desktop)]
const MENU_NEW_CHAT: &str = "new-chat";
#[cfg(desktop)]
const MENU_SEARCH: &str = "search";
#[cfg(desktop)]
const MENU_SETTINGS: &str = "settings";

#[cfg(desktop)]
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

#[cfg(desktop)]
fn with_desktop_features(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
    builder
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
        .manage(local_ai::LocalAIState(Mutex::new(None)))
        .manage(keychain_storage::ChatStorageKeyState(Mutex::new(None)))
        .manage(local_ai::ModelDownloadsState(Mutex::new(HashMap::new())))
        .invoke_handler(tauri::generate_handler![
            keychain_storage::chat_storage_decrypt,
            keychain_storage::chat_storage_encrypt,
            keychain_storage::chat_storage_status,
            local_ai::local_ai_delete_model,
            local_ai::local_ai_download_model_progress,
            local_ai::local_ai_download_model_start,
            local_ai::local_ai_model_path,
            local_ai::local_ai_model_status,
            local_ai::local_ai_start,
            local_ai::local_ai_stop,
            local_ai::local_ai_is_running,
        ])
}

// Android and iOS download models with the same commands as the desktop and
// run them inside the app (src/local_ai_engine.rs). No menu, no window state.
#[cfg(mobile)]
fn with_mobile_local_ai(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
    builder
        .manage(local_ai::ModelDownloadsState(Mutex::new(HashMap::new())))
        .manage(local_ai_engine::LocalEngineState::new())
}

// iOS keeps the desktop's keychain cipher. Its keyboard comes without the
// web form bar.
#[cfg(target_os = "ios")]
fn with_ios_features(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
    with_mobile_local_ai(builder)
        .manage(keychain_storage::ChatStorageKeyState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            keychain_storage::chat_storage_decrypt,
            keychain_storage::chat_storage_encrypt,
            local_ai::local_ai_delete_model,
            local_ai::local_ai_download_model_progress,
            local_ai::local_ai_download_model_start,
            local_ai::local_ai_model_path,
            local_ai::local_ai_model_status,
            local_ai_engine::local_ai_device_memory,
            local_ai_engine::local_ai_engine_cancel,
            local_ai_engine::local_ai_engine_generate,
            local_ai_engine::local_ai_engine_load,
            local_ai_engine::local_ai_engine_status,
            local_ai_engine::local_ai_engine_unload,
            local_ai_engine::local_ai_model_memory_need,
        ])
        .setup(|_app| {
            ios_keyboard::hide_form_accessory_bar();
            Ok(())
        })
}

// Android has no keychain cipher (the web build's WebCrypto key encrypts its
// stores, see packages/alice-ai/src/local-cipher.ts).
#[cfg(target_os = "android")]
fn with_android_features(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
    with_mobile_local_ai(builder).invoke_handler(tauri::generate_handler![
        local_ai::local_ai_delete_model,
        local_ai::local_ai_download_model_progress,
        local_ai::local_ai_download_model_start,
        local_ai::local_ai_model_path,
        local_ai::local_ai_model_status,
        local_ai_engine::local_ai_device_memory,
        local_ai_engine::local_ai_engine_cancel,
        local_ai_engine::local_ai_engine_generate,
        local_ai_engine::local_ai_engine_load,
        local_ai_engine::local_ai_engine_status,
        local_ai_engine::local_ai_engine_unload,
        local_ai_engine::local_ai_model_memory_need,
    ])
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder =
        tauri::Builder::default().append_invoke_initialization_script(IPC_FETCH_TIMEOUT_FIX);
    #[cfg(desktop)]
    let builder = with_desktop_features(builder);
    #[cfg(mobile)]
    let builder = builder.plugin(tauri_plugin_opener::init());
    #[cfg(target_os = "ios")]
    let builder = with_ios_features(builder);
    #[cfg(target_os = "android")]
    let builder = with_android_features(builder);
    builder
        .build(tauri::generate_context!())
        .expect("error building application")
        .run(|_app, _event| {
            #[cfg(desktop)]
            if let tauri::RunEvent::Exit = _event {
                local_ai::stop_server_on_exit(_app);
            }
        });
}
