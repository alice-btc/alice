//! The screen stays on while a model downloads.
//!
//! iOS suspends an app a few seconds after the screen locks, and a transfer
//! in progress stops with it; the download then continues from the bytes on
//! disk when the app comes back, but a 2.7 GB file would take many such
//! returns. Disabling the idle timer keeps the screen, and the app, awake
//! for as long as a download runs. It does nothing when the person locks the
//! phone themselves.

use objc2::msg_send;
use objc2::runtime::{AnyClass, AnyObject, Bool};
use std::sync::atomic::{AtomicUsize, Ordering};

static RUNNING_DOWNLOADS: AtomicUsize = AtomicUsize::new(0);

pub fn download_started(app: &tauri::AppHandle) {
    if RUNNING_DOWNLOADS.fetch_add(1, Ordering::SeqCst) == 0 {
        set_idle_timer_disabled(app, true);
    }
}

pub fn download_ended(app: &tauri::AppHandle) {
    if RUNNING_DOWNLOADS.fetch_sub(1, Ordering::SeqCst) == 1 {
        set_idle_timer_disabled(app, false);
    }
}

fn set_idle_timer_disabled(app: &tauri::AppHandle, disabled: bool) {
    // UIApplication is main-thread only.
    let _ = tauri::Manager::app_handle(app).run_on_main_thread(move || {
        let Some(class) = AnyClass::get(c"UIApplication") else {
            return;
        };
        // SAFETY: `sharedApplication` returns the app object or nil, and
        // `setIdleTimerDisabled:` takes one BOOL.
        unsafe {
            let shared: *mut AnyObject = msg_send![class, sharedApplication];
            if shared.is_null() {
                return;
            }
            let _: () = msg_send![shared, setIdleTimerDisabled: Bool::new(disabled)];
        }
    });
}
