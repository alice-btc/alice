fn main() {
    // Google Play requires 64-bit native libraries to load on devices with
    // 16 KB memory pages. NDK 27 still aligns ELF segments on 4 KB by default.
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("android") {
        println!("cargo:rustc-link-arg=-Wl,-z,max-page-size=16384");
    }
    tauri_build::build()
}
