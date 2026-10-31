# Alice on Android

The Android app is Alice App, the same web export as Alice Web and the
desktop app, wrapped by the Tauri project in `apps/app-desktop`. It has no
wallet. Its Android project lives in `apps/app-desktop/src-tauri/gen/android`
and its configuration override in `src-tauri/tauri.android.conf.json`.

Identifier: `com.alicebitcoin.app`. Version name and version code come from
the shared release version in `tauri.conf.json`.

## What differs from the desktop

- Local AI runs inside the app: there is no `llama-server` on Android, so
  llama.cpp is linked into the native library and answers through Tauri
  commands (`src-tauri/src/local_ai_engine.rs`, CPU only, no Vulkan or
  OpenCL yet). Models are downloaded with the desktop commands of
  `src-tauri/src/local_ai.rs`; the download client trusts the Mozilla root
  store (`webpki-roots`) because reqwest's platform verifier needs a Java
  component the app does not ship. A transfer the network cuts continues
  from the bytes on disk (Range request, 12 attempts), as on iOS; Android
  has no wake lock here yet, so a screen that locks may pause the download
  until the app is back in front. The memory figure is a notice before a
  download, never a refusal at load time on Android (the system evicts
  mapped weights and frees cached apps; docs/IOS.md has the measurement).
  Measured on a Galaxy A15 (4 GB, MediaTek MT6789, 2026-10-29): the 2B
  answers correctly but reads Alice's prompt for over 4 minutes before its
  first word; the 0.8B catalog entry exists for such phones. Not measured
  yet: the 0.8B on that phone, and 2 threads on the big cores instead of 6
  mixed ones. The build needs `cmake` and `libclang`
  (see docs/IOS.md, "Local AI on the phone", for the variables) and the NDK
  that `tauri android build` already uses. Branch `mobile-local-ai`,
  2026-10-29: see "Local AI" below for what is verified.
- Custom AI servers and Explorer nodes must answer over HTTPS. A release build
  refuses cleartext traffic, and the policy in `tauri.android.conf.json` leaves
  `http:` and `ws:` out.
- Local stores are encrypted with the web build's WebCrypto key, kept in the
  app's private webview storage. Android's Keystore does not hold it (see
  `packages/alice-ai/src/local-cipher.ts`). Settings → Data says so.
- No update check: Google Play updates the app. What's new still shows after
  an update.
- The semantic search model is not bundled: the webview serves the app from
  `http://tauri.localhost`, which loads the model from Hugging Face on first
  use, as Alice Web does (`apps/app-desktop/build-web.sh`).
- The status bar follows the app theme through a message from the page
  (`MainActivity.kt` and `apps/app-web/src/lib/theme-init.ts`).
- Links open in the system browser through the opener plugin; the shell
  plugin is desktop only. The webview ignores `window.open()`, so code that
  opens a page calls `openExternalUrl()` (`apps/app-web/src/lib/open-external.ts`).
- Native libraries are linked with 16 KB page alignment (`src-tauri/build.rs`),
  which Google Play requires.

## Requirements

- Android Studio with the SDK, platform 36 and NDK 27.1.12297006
- JDK 17 (`JAVA_HOME`)
- `ANDROID_HOME` and `NDK_HOME` set, for example
  `export NDK_HOME="$ANDROID_HOME/ndk/27.1.12297006"`
- The Rust targets:

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

## Build

From `apps/app-desktop`. `beforeBuildCommand` runs `build-web.sh`, so each
build exports the web app first.

A debug APK for an arm64 emulator or phone:

```bash
npx tauri android build --debug --apk --target aarch64
```

The release bundle for Google Play:

```bash
npx tauri android build --aab --target aarch64 --target armv7 --target x86_64
```

The release bundle is signed only when
`src-tauri/gen/android/keystore.properties` exists (git-ignored):

```properties
storeFile=/absolute/path/to/upload-keystore.jks
keyAlias=upload
password=…
```

The upload keystore and its password stay out of the repository, in the
maintainer's password manager. Google Play keeps the app signing key (Play
App Signing).

## Run on an emulator

```bash
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
adb shell am start -n com.alicebitcoin.app/.MainActivity
```

A debug build exposes its webview to Chrome DevTools
(`chrome://inspect`, or `adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>`).

## Local AI

Verified on 2026-10-29: the native library compiles for arm64 with llama.cpp
inside it (33 minutes the first time, CPU backend only), with the NDK named
by hand because `cargo` alone has no linker for the target:

```bash
# from apps/app-desktop/src-tauri
NDK="$HOME/Library/Android/sdk/ndk/27.1.12297006"
TC="$NDK/toolchains/llvm/prebuilt/darwin-x86_64/bin"
export CMAKE="$HOME/Library/Android/sdk/cmake/3.22.1/bin/cmake"
export LIBCLANG_PATH="/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib"
export ANDROID_NDK="$NDK" ANDROID_API_LEVEL=24
export CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER="$TC/aarch64-linux-android24-clang"
export CC_aarch64_linux_android="$TC/aarch64-linux-android24-clang"
export CXX_aarch64_linux_android="$TC/aarch64-linux-android24-clang++"
export AR_aarch64_linux_android="$TC/llvm-ar"
cargo build --lib --target aarch64-linux-android
```

`npx tauri android build` sets the NDK variables itself; `CMAKE` and
`LIBCLANG_PATH` still have to be in the environment. Not verified: the APK
through `tauri android build` (not run on this branch), the TLS root store
on a device, a model loaded and answering on a phone (speed on the CPU,
memory read from `/proc/meminfo`, the 16 KB page alignment of the larger
library), and the armv7 and x86 targets, where llama.cpp has not been tried.

## Private Cloud

The Worker answers cross-origin requests only from the origins listed in
`ALLOWED_ORIGINS` (`apps/venice-proxy-worker/wrangler.toml`). The Android app
sends `Origin: http://tauri.localhost`, so the chat fails with "Venice API
error" until a Worker with that origin is deployed.

## Checked so far

On 2026-10-28, debug APK on the Android 17 emulator (16 KB pages, WebView 145):

- The app starts on the chat, the drawer, Learn, Explorer (live blocks),
  Playground and Settings open, and the layout keeps clear of the status bar
  and the gesture bar.
- A conversation survives a restart, stored encrypted
  (`alice-chat-encrypted:v1:` in local storage); Settings → Data says
  "STORED IN THIS APP’S PRIVATE STORAGE".
- Light and dark themes switch the status bar icons.
- `target="_blank"` links and `openExternalUrl()` open Chrome.
- The 16 KB alignment warning is gone once `build.rs` links with
  `max-page-size=16384`; the release libraries show `0x4000` LOAD alignment.
- The unsigned release bundle for the three ABIs is about 57 MB.

Not checked yet: a reply from Private Cloud (needs the Worker deployed with
the new origin), a real phone, the keyboard over the composer on small
screens, rotation, the semantic model download over mobile data, a signed
bundle on the Play Console tracks.
