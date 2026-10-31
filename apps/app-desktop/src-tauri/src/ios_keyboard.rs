//! The iOS keyboard without the web form bar.
//!
//! WKWebView puts a bar with previous, next and done buttons above the
//! keyboard whenever a field has focus. The composer already has its own send
//! button, and the bar covers it. WKContentView, the view that owns the focus
//! inside every WKWebView, returns that bar from `inputAccessoryView`; making
//! it return nil removes the bar for every webview of the app.

use objc2::ffi::class_replaceMethod;
use objc2::runtime::{AnyClass, AnyObject, Imp, Sel};
use objc2::sel;

extern "C-unwind" fn no_accessory_view(_this: &AnyObject, _cmd: Sel) -> *mut AnyObject {
    std::ptr::null_mut()
}

pub fn hide_form_accessory_bar() {
    let Some(class) = AnyClass::get(c"WKContentView") else {
        return;
    };
    let imp: extern "C-unwind" fn(&AnyObject, Sel) -> *mut AnyObject = no_accessory_view;
    // SAFETY: the implementation matches the `@@:` signature of
    // `inputAccessoryView` (an object, from a receiver and a selector).
    unsafe {
        class_replaceMethod(
            class as *const AnyClass as *mut AnyClass,
            sel!(inputAccessoryView),
            std::mem::transmute::<_, Imp>(imp),
            c"@@:".as_ptr(),
        );
    }
}
