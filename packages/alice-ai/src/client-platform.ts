// Web and Tauri builds (desktop, Android, iOS). Metro picks
// client-platform.native.ts for the React Native builds instead, which is why
// react-native is not imported here.
// Keep this import extensionless: adding .ts would defeat Metro's platform
// resolution.
import { tauriShell } from './tauri-runtime';
import { desktopPlatformFromHint, type AlicePlatform } from './client-info-format';

export function resolveAlicePlatform(): AlicePlatform {
  const shell = tauriShell();
  if (shell === null) return 'web';
  if (shell !== 'desktop') return shell;
  const hint = typeof navigator !== 'undefined'
    ? `${navigator.userAgent ?? ''} ${(navigator as { platform?: string }).platform ?? ''}`
    : '';
  return desktopPlatformFromHint(hint);
}
