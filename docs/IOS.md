# Alice for iOS

Status, 2026-10-29: the debug build runs in the iOS 26.5 simulator. It has not
run on a device and is not signed. Local AI (llama.cpp inside the app, see
[Local AI on the phone](#local-ai-on-the-phone)) compiles for the device and
the simulator has not run it; nothing of it is verified on a phone yet.

## What the iOS build is

The same Tauri 2 project as Alice Desktop (`apps/app-desktop`), embedding the
static export of `apps/app-web`. The iOS build differs from the desktop one
in:

- `src-tauri/tauri.ios.conf.json`: identifier `com.alicebitcoin.app` (the
  Android one too) and a Content Security Policy without `http:`, `ws:` or
  localhost. On iOS the app is served from `tauri://localhost` and the IPC
  goes to `ipc://localhost`, which `'self'` and `ipc:` cover.
- `src-tauri/gen/apple`: the Xcode project made by `tauri ios init`. Its
  `.gitignore` keeps `build/`, `Externals/` and `xcuserdata/` out of the
  repository.
- Rust (`src/lib.rs`): the opener plugin, to open links in Safari (the
  shell plugin is desktop only, as on Android), the keychain cipher of
  `src/keychain_storage.rs`, the model downloads of `src/local_ai.rs` and
  the llama.cpp engine of `src/local_ai_engine.rs`. No menu or window state.
- Local encryption: as on the desktop, a random 32-byte key in the iOS
  keychain, used through the `chat_storage_encrypt` and
  `chat_storage_decrypt` commands. See
  [local-chat-encryption.md](security/local-chat-encryption.md).
- The web layer recognises iOS by its user agent (`tauriShell()` in
  `packages/alice-ai/src/tauri-runtime.ts`) and hides what is desktop only.
- App icon: `icons/icon.png` cropped to its square, flattened on `#0d1117`
  and written without an alpha channel into
  `gen/apple/Assets.xcassets/AppIcon.appiconset`. Running `tauri ios init`
  again puts Tauri's default icon back.

## Prerequisites

- Xcode 26.5 with the iOS 26.5 platform component (Xcode > Settings >
  Components). Without it `npx tauri ios build` stops at "iOS platform not
  installed" and `xcodebuild -showdestinations` lists no destination.
- Rust targets:
  `rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios`
- CocoaPods. `npx tauri ios init` installs what else it needs through
  Homebrew.
- The repository's node modules (`npm ci` at the root).
- For the local AI engine: `cmake` (3.14 or later) and `libclang`. Neither is
  on a bare Mac; the Android SDK's `cmake/3.22.1/bin/cmake` and Xcode's
  toolchain serve, named through environment variables:

```bash
export CMAKE="$HOME/Library/Android/sdk/cmake/3.22.1/bin/cmake"
export LIBCLANG_PATH="/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib"
```

  `npx tauri ios build` runs cargo from an Xcode build phase that keeps
  `PATH` but drops other variables, so for the app build the cmake
  directory goes on the PATH instead
  (`export PATH="$HOME/Library/Android/sdk/cmake/3.22.1/bin:$PATH"`); the
  Xcode toolchain's libclang is found without `LIBCLANG_PATH`. A Homebrew
  `cmake` on the PATH works too (not tried). Without cmake the
  `llama-cpp-sys-2` build script stops before compiling anything.

## Verified commands

Run on 2026-10-28, macOS 26.5.2, Xcode 26.5, Rust 1.96.1, Tauri CLI 2.11.4.

From `apps/app-desktop`. `beforeBuildCommand` runs `build-web.sh`, which
sets the iOS viewport only when Tauri passes `TAURI_ENV_PLATFORM=ios`.

```bash
npx tauri ios init --ci    # only to regenerate gen/apple
```

From `apps/app-desktop/src-tauri`:

```bash
cargo build --lib --target aarch64-apple-ios-sim
cargo build --lib --target aarch64-apple-ios
cargo test                 # the desktop build and its tests
```

## Checked in the simulator

On 2026-10-28 and 2026-10-29, iPhone 17 Pro simulator, iOS 26.5, debug
build:

```bash
# from apps/app-desktop
npx tauri ios build --debug --target aarch64-sim
```

The app it builds is in
`src-tauri/gen/apple/build/alice-desktop_iOS.xcarchive/Products/Applications/Alice.app`.
When `build/arm64-sim/Alice.app` already exists, the command ends with
"failed to rename app ... Directory not empty" after `BUILD SUCCEEDED`: the
copy in the archive is the new one, the one in `arm64-sim` is not.

- Launch, the menu, the status bar and the screen edges.
- Private Cloud chat: a question answered with its source.
- Explorer with live blocks.
- A conversation still there after the app restarts. Neither the question
  nor the answer appears in clear anywhere in the app's data; the stored
  chats carry the encrypted marker, and the key is in the simulator's
  keychain under the app's access group.
- A search field (Explorer, 14.5px text) takes focus without zooming the
  page, and the page settles back when the keyboard closes.
- With the keyboard open, the composer and its send button sit just above
  it, and WebKit's previous, next and done bar is gone
  (`src-tauri/src/ios_keyboard.rs`, `apps/app-web/src/lib/mobile-shell.ts`).
- Round menu and new chat buttons at the top, a rounded composer at the
  bottom, clear of the screen corners and the home indicator.

Found and not fixed: the debug build shows a white screen for about 15
seconds at launch. A release build has not been timed.

Not checked yet: Learn, Playground, Settings, Report an issue, external
links, dark and light themes, rotation, iPad, a signed build, a device.

## Not done

- Signing: no development team or certificate is in the repository. The team
  ID goes in `bundle.iOS.developmentTeam` or the `APPLE_DEVELOPMENT_TEAM`
  environment variable at build time, from the owner's Apple Developer
  account.
- App Store Connect record, TestFlight, export compliance answer, privacy
  details and screenshots.

## Local AI on the phone

Branch `mobile-local-ai`, 2026-10-29. The desktop serves a model through a
`llama-server` child process; iOS forbids starting a process, so the iOS and
Android apps link llama.cpp into the app library instead.

### How it is built

- Crate `llama-cpp-2` 0.1.160 (`llama-cpp-sys-2` 0.1.160, which vendors
  llama.cpp and builds it with CMake, static libraries), declared for
  Android and iOS only in `src-tauri/Cargo.toml`, without default features:
  `openmp` has no runtime on either platform and `common` pulls llama.cpp's
  tooling in. Feature `android-static-stdcxx` links libc++ statically on
  Android; it changes nothing on iOS.
- The Xcode target links `Accelerate.framework` (`gen/apple/project.yml`
  and the generated project), which ggml's CPU ops call through vDSP; the
  frameworks cargo names for a static library do not reach Xcode's linker.
  Metal and MetalKit were already linked for the webview.
- Metal: on through llama.cpp's Apple default, with the shader source
  embedded in the binary (`GGML_METAL_EMBED_LIBRARY`, the default when Metal
  is on) and compiled by the device on first load. All layers are offloaded
  (`GPU_LAYERS` in `src/local_ai_engine.rs`); Android runs on the CPU.
- The engine owns one thread with the llama.cpp backend, the loaded model
  and its context (4096 tokens, the shared mobile budget). The prompt is laid
  out by the model's own chat template through llama.cpp's built-in
  templates; with thinking off (Qwen3, SmolLM3) an empty think block is
  pre-filled, and a leading think block in the output is dropped, as
  llama-server does on the desktop. The state of the previous turn is kept,
  so the next turn of a conversation reads only what it adds.
- Commands (`src/local_ai_engine.rs`): `local_ai_engine_load`,
  `local_ai_engine_unload`, `local_ai_engine_status`,
  `local_ai_engine_generate` (the answer streams through a
  `tauri::ipc::Channel<String>`), `local_ai_engine_cancel`,
  `local_ai_device_memory`, `local_ai_model_memory_need`. The downloads and
  statuses reuse the desktop commands of `src/local_ai.rs`, which now build
  on every platform.
- The webview side is `packages/alice-ai/src/ai-backend-local-mobile.ts`
  (the Channel is created without `@tauri-apps/api`, in
  `tauri-runtime.ts`). No HTTP server, no port, no change to the iOS
  Content Security Policy.
- Memory: before a load, the engine compares what the process may still
  allocate (`os_proc_available_memory`) with the file's size plus an eighth
  of it plus 640 MB, and refuses with both figures, named as RAM. That
  figure is the budget iOS grants this one app, well under the device's
  RAM: an iPhone 17 Pro Max with 12 GB reported 3.5 GB (2026-10-29). The
  entitlement `com.apple.developer.kernel.increased-memory-limit`
  (`gen/apple/alice-desktop_iOS/alice-desktop_iOS.entitlements`) asks for a
  larger budget on the devices that allow one; how much it adds is not
  measured yet. The settings page makes the same comparison before a
  download (`packages/alice-ai/src/local-model-memory.ts`) as a notice that
  does not block the download, since the figure moves with the apps open at
  that moment. The refusal at load time is iOS only: Android evicts mapped
  weights and frees cached apps, and a 4 GB Galaxy A15 ran the 2B with
  1.6 GB "available" against 2.1 GB estimated (2026-10-29). A phone is
  offered the catalog from 0.8B to 4B parameters in Q4 (the 9B file stays
  on the desktop; the 0.8B is for entry-level phones, where the 2B took
  over 4 minutes to read the prompt); Hugging Face files over 3 GB are not
  listed on a phone. These figures are estimates, not measured on a device.
- Downloads: the shell transfers the file itself (`local_ai.rs`), and a
  transfer the network cuts continues from the bytes on disk with a Range
  request, 12 attempts 3 s apart, before the failure is shown; the partial
  file stays for the next Download, which continues it, and a file the
  server or the hash check refused is removed. A connection that delivers
  under 512 KB in 60 s is dropped for a fresh one the same way: on
  2026-10-29 the Hugging Face CDN let a Galaxy A15 connection wither to
  5 KB/s while a new one got 800 KB/s, too slow to finish, too lively for
  the 60 s read timeout. While a download runs the
  idle timer is off (`ios_screen.rs`, `UIApplication.idleTimerDisabled`), so
  the screen does not lock by itself: iOS suspends the app a few seconds
  after the screen locks or another app comes to the front, and the socket
  dies with it. The page polls the shell every 250 ms and gives up on one
  answer after 5 s, then asks again, so a lost bridge message no longer
  freezes the bar (the 0.2.5 freeze on macOS looked the same). On
  2026-10-29 a 4B download on an iPhone 17 Pro Max stopped at 4 % with no
  message; whether the app had been suspended or a poll answer lost is not
  established.

### Verified commands

Run on 2026-10-29, with the two variables above:

```bash
# from apps/app-desktop/src-tauri
cargo build --lib --target aarch64-apple-ios
cargo test                 # the desktop build, which runs the engine's pure parts

# from apps/app-desktop, with the cmake directory on the PATH
APPLE_DEVELOPMENT_TEAM=<team id> npx tauri ios build --debug --target aarch64
```

The `llama-cpp-sys-2` build takes about 15 minutes the first time (CMake
configure plus llama.cpp and ggml for arm64 with Metal); the result is kept
in `target/`. The device build ends with `BUILD SUCCEEDED` and a 196 MB
`Alice.app` in
`src-tauri/gen/apple/build/alice-desktop_iOS.xcarchive/Products/Applications/`,
whose binary carries `ggml_metal_init` and `llama_decode`. The build writes
the team id into `gen/apple/alice-desktop.xcodeproj/project.pbxproj`; that
change is reverted before any commit. The app requires iOS 16 or later
(`project.yml` and the two `IPHONEOS_DEPLOYMENT_TARGET` entries of the
project; 14.0 until 2026-10-29): iPhone 8 and X still qualify, and Metal 3
and the WebKit features the layout uses are there. The linker warns that
the ggml objects were built for iOS 26.5 while the app targets 16.0: the
Xcode build phase does not pass its deployment target to cargo, so
llama.cpp is compiled against the SDK's default. Not verified whether a
phone on an older iOS refuses the binary.

### Not verified

- A model loaded and answering on a device: Metal initialisation, the
  runtime shader compile, speed, battery, and whether the memory figures
  above match what iOS allows an app. `os_proc_available_memory` returns 0
  in the simulator, where the memory check is then skipped.
- A download over cellular data, and a 2.7 GB file in the app's data
  directory on a phone with little space.
- The Android build of the same engine (see docs/ANDROID.md).

## Known limits

- The keychain item uses iOS's default accessibility (when unlocked, not
  "this device only"): it is not synced through iCloud Keychain but can move
  to a new device in an encrypted backup, and it can outlive the app.
- `CFBundleVersion` equals the marketing version (0.2.7). Each TestFlight
  upload needs a higher build number (`tauri ios build --build-number`).
- The semantic search model (about 164 MB) is embedded as on the desktop, so
  the app is large.
- The page cannot be zoomed: the iOS build sets `maximum-scale=1` (see
  `apps/app-web/src/app/layout.tsx`) so that a field with text under 16px
  does not zoom the page when it takes focus.
- Local AI: the prompt-reading batch is 512 tokens and the thread count is
  the cores minus 2 (between 2 and 6), neither tuned on a device. A model is
  unloaded when the chat leaves Local mode and loaded again, from the file,
  when it comes back. Thinking cannot be enabled for the local model.
