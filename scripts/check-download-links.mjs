// Validates only the public download configuration. No uploads or writes.
// --live additionally follows each configured URL; --require-companion-apk
// is the launch gate once the signed APK and its checksum page exist.
import assert from 'node:assert/strict';
import {
  SOURCE_URL, IOS_TESTFLIGHT_URL, COMPANION_ANDROID_APK_URL,
  COMPANION_ANDROID_RELEASE_URL, DESKTOP_MAC_URL, DESKTOP_WINDOWS_URL,
  DESKTOP_LINUX_APPIMAGE_URL, DESKTOP_LINUX_DEB_URL, DESKTOP_RELEASE_URL,
  ANDROID_APK_URL, ANDROID_RELEASE_URL,
} from '../apps/site/src/lib/site.ts';

const args = new Set(process.argv.slice(2));
for (const arg of args) assert.ok(['--live', '--require-companion-apk'].includes(arg), `Unknown option: ${arg}`);
assert.equal(Boolean(COMPANION_ANDROID_APK_URL), Boolean(COMPANION_ANDROID_RELEASE_URL),
  'The companion APK and its release/checksum page must be configured together.');
if (args.has('--require-companion-apk')) {
  assert.ok(COMPANION_ANDROID_APK_URL, 'Companion APK is not published/configured yet.');
}
const links = [
  ['TestFlight', IOS_TESTFLIGHT_URL], ['macOS', DESKTOP_MAC_URL],
  ['Windows', DESKTOP_WINDOWS_URL], ['Linux AppImage', DESKTOP_LINUX_APPIMAGE_URL],
  ['Linux Debian', DESKTOP_LINUX_DEB_URL], ['Desktop release', DESKTOP_RELEASE_URL],
  ['Legacy Wallet APK', ANDROID_APK_URL], ['Legacy Wallet release', ANDROID_RELEASE_URL],
  ...(COMPANION_ANDROID_APK_URL ? [
    ['Companion APK', COMPANION_ANDROID_APK_URL], ['Companion release', COMPANION_ANDROID_RELEASE_URL],
  ] : []),
];
for (const [name, href] of links) {
  const url = new URL(href);
  assert.equal(url.protocol, 'https:', `${name} must use HTTPS`);
  assert.ok(href.startsWith(`${SOURCE_URL}/releases/`) ||
    (name === 'TestFlight' && url.origin === 'https://testflight.apple.com' && /^\/join\/[A-Za-z0-9]+$/.test(url.pathname)),
  `${name}: unexpected download destination`);
}
if (COMPANION_ANDROID_APK_URL) {
  assert.notEqual(COMPANION_ANDROID_APK_URL, ANDROID_APK_URL, 'Do not serve the Wallet APK as the companion.');
  assert.ok(new URL(COMPANION_ANDROID_APK_URL).pathname.endsWith('.apk'), 'Companion download must be an APK.');
}
if (args.has('--live')) {
  const results = await Promise.allSettled(links.map(async ([name, href]) => {
    const response = await fetch(href, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(30000) });
    assert.ok(response.ok, `${name}: HTTP ${response.status}`);
    console.log(`OK ${name}: HTTP ${response.status}`);
  }));
  const failures = results.filter(r => r.status === 'rejected');
  for (const failure of failures) console.error(failure.reason.message);
  if (failures.length) process.exitCode = 1;
} else {
  console.log(`Configuration valid: ${links.length} public download URLs. Availability not checked (use --live).`);
}
if (!COMPANION_ANDROID_APK_URL) console.log('Companion APK remains disabled pending the signed release asset.');
