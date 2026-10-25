# Alice Closed Beta

Alice App, on the web and on desktop, is a public beta.

## Tested Release

Alice's source lives at <https://github.com/alice-btc/alice>.

- Version: `0.2.5`.
- Source: public tag `v0.2.5` in <https://github.com/alice-btc/alice>.

## Available Surfaces

- Alice Web: <https://app.alicebtc.com>

Desktop installers for macOS, Windows and Linux are attached to the `0.2.5`
GitHub Release and linked from <https://alicebtc.com>.

## Installing Alice Desktop 0.2.5

The GitHub Release contains a universal macOS DMG, a Windows MSI, a Linux
AppImage and a Debian package. It also contains one build information file per
platform; its `signing` line says how that installer is signed. The macOS
application is signed and notarised by Apple; the Windows and Linux installers
are not signed yet, which explains the Windows warning described below.

Compare the downloaded installer with `SHA256SUMS-desktop-v0.2.5.txt` from the
same release before opening it.

### macOS

Open the DMG and drag Alice into Applications. Since 0.2.5 the application is
signed with Marius Farashi's Apple Developer ID and notarised by Apple
(`signing=apple-developer` in `alice-desktop-macos.txt`). The first launch
shows the standard question macOS asks about every application downloaded
outside the App Store, naming the developer, with an **Open** button. Click
it once; later launches ask nothing. Apple's notarisation ticket is stapled to
the application, so this works offline too.

To check the signature yourself, on the copy in Applications:

```bash
codesign -dv --verbose=2 /Applications/Alice.app
spctl -a -vv -t exec /Applications/Alice.app
```

The first command must list `Developer ID Application: Marius Farashi`, the
second must answer `accepted` with `source=Notarized Developer ID`. Anything
else, including an **"Alice" Not Opened** dialog that offers only **Done** and
**Move to Bin**, means the file is not the one from the release: delete it and
download again from the release page.

Builds made without the Apple secrets (a fork, or a preview build) carry an ad
hoc signature instead, and macOS refuses them at first launch. The permission
is then granted from **System Settings**, **Privacy & Security**, **Security**,
**Open Anyway**, after one blocked launch.

The release workflow signs with the `APPLE_CERTIFICATE` and
`APPLE_CERTIFICATE_PASSWORD` secrets and notarises with `APPLE_ID`,
`APPLE_PASSWORD` and `APPLE_TEAM_ID`. The application bundle is notarised and
stapled; the DMG file around it is signed but not notarised on its own.

### Windows

Open the MSI. An unsigned build can trigger Microsoft Defender SmartScreen and
show **Windows protected your PC**. Choose **More info**, verify that the file
name and checksum match the release, then choose **Run anyway**. A signed
certificate can still show SmartScreen until it has acquired enough reputation.

Alice installs for all users in Program Files, so Windows then asks whether to
allow the app to make changes to your device, with **Unknown publisher**. Choose
**Yes**. On a Windows 10 without Microsoft Edge WebView2, the installer downloads
it from Microsoft, so keep the computer online.

When `WINDOWS_CERTIFICATE` and `WINDOWS_CERTIFICATE_PASSWORD` contain a
base64-encoded PFX and its password, the release workflow imports it and signs
the MSI automatically. With neither secret, the MSI remains unsigned. A single
missing secret stops the job rather than silently publishing an unsigned file.

### Linux

Linux shows no comparable platform signature warning for these files. For the
AppImage, make it executable and run it:

```bash
chmod +x Alice_0.2.5_*.AppImage
./Alice_0.2.5_*.AppImage
```

On Debian or Ubuntu, install the local package with:

```bash
sudo apt install ./Alice_0.2.5_*.deb
```

Alice keeps the key that encrypts your conversations in the desktop's keyring
(GNOME Keyring, or KWallet with its Secret Service support), which a desktop
session usually unlocks when you log in. Without an unlocked keyring, Alice still
works but saves nothing: conversations and the practice wallet are gone at the
next launch. If the keyring asks for your password when Alice starts, unlock it.

To uninstall, run `sudo apt remove alice` for the Debian package, or delete the
AppImage file. Your data stays in `~/.local/share/com.alicebitcoin.desktop`,
with its key in the keyring under `com.alicebitcoin.desktop`; delete both to
start from scratch.

## Safety Rules

- Never send a recovery phrase, private key, or sensitive screenshot to Alice,
  a tester, or a bug-report form.

## Reporting Problems

In Alice App (web and Desktop), open `Account > Report an issue`.

The report can be copied, sent to `support@alicebtc.com`, or opened as an issue
in the public [`alice`](https://github.com/alice-btc/alice/issues) repository.
Nothing is sent until you choose one of these. Include the platform, version,
action, expected result, and actual result. Never include wallet secrets.
Security vulnerabilities follow `SECURITY.md`, not a public issue.

## Known Limits

- Private Cloud is currently `attested-unpinned`. Transport encryption and TDX
  attestation verification are implemented, but Venice has not yet published
  the reference measurements required to pin the exact enclave identity.
- Alice Memory is stored on the device only. The few facts relevant to a
  message travel with it to the model you chose: inside the encrypted payload
  for Private Cloud, to your own server for Custom AI, nowhere for Local.
- Semantic retrieval runs on Alice App web and Desktop.

Current service availability is not a release guarantee. External providers
can be temporarily unavailable.
