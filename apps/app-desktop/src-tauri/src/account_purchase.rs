//! Distribution and storefront come from the native build, never the web locale.
use serde::Serialize;

#[derive(Serialize)]
pub struct PurchaseContext {
    channel: &'static str,
    storefront: Option<String>,
}

#[cfg(target_os = "android")]
#[tauri::command]
pub fn account_purchase_context() -> PurchaseContext {
    PurchaseContext {
        // Only the separately distributed APK is built with this explicit flag.
        // Missing or misspelled flags retain the Google Play restrictions.
        channel: if option_env!("ALICE_DISTRIBUTION") == Some("android-direct") {
            "android-direct"
        } else {
            "google-play"
        },
        storefront: None,
    }
}

#[cfg(target_os = "ios")]
#[link(name = "StoreKit", kind = "framework")]
extern "C" {}

#[cfg(target_os = "ios")]
#[tauri::command]
pub fn account_purchase_context() -> PurchaseContext {
    use objc2::{msg_send, runtime::{AnyClass, AnyObject}};
    use std::{ffi::CStr, os::raw::c_char};
    // Synchronous Tauri commands run on the main thread. StoreKit owns these
    // objects; copy the NSString before returning to JavaScript. A missing
    // storefront returns None so no purchase link is shown.
    let storefront = (|| unsafe {
        let class = AnyClass::get(c"SKPaymentQueue")?;
        let queue: *mut AnyObject = msg_send![class, defaultQueue];
        if queue.is_null() { return None; }
        let store: *mut AnyObject = msg_send![queue, storefront];
        if store.is_null() { return None; }
        let country: *mut AnyObject = msg_send![store, countryCode];
        if country.is_null() { return None; }
        let text: *const c_char = msg_send![country, UTF8String];
        if text.is_null() { return None; }
        Some(CStr::from_ptr(text).to_string_lossy().into_owned())
    })();
    PurchaseContext { channel: "ios", storefront }
}
