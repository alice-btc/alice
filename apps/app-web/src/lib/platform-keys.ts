// The modifier of the app's keyboard shortcuts: Command on Apple devices,
// Control everywhere else (Linux, Windows, ChromeOS), as the desktop menu's
// CmdOrCtrl accelerators do.

import { useSyncExternalStore } from 'react';

/** True for macOS, iPadOS and iOS, from the user agent and platform hints. */
export function isApplePlatform(userAgent: string, platform = ''): boolean {
  return /mac|iphone|ipad|ipod/i.test(platform) || /macintosh|mac os x|iphone|ipad|ipod/i.test(userAgent);
}

function currentIsApple(): boolean {
  if (typeof navigator === 'undefined') return false;
  const hints = navigator as Navigator & { userAgentData?: { platform?: string } };
  return isApplePlatform(navigator.userAgent ?? '', hints.userAgentData?.platform ?? navigator.platform ?? '');
}

/** The modifier as a shortcut label prefix: "⌘" on Apple, "Ctrl+" elsewhere,
 *  so `${modKey()}K` reads "⌘K" or "Ctrl+K". */
export function modKey(apple = currentIsApple()): string {
  return apple ? '⌘' : 'Ctrl+';
}

type ShortcutEvent = Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey'>;

/** True when `event` is the app shortcut for `key`: Command+key on Apple,
 *  Control+key elsewhere. The other modifier must be up, so Control+K on a
 *  Mac and the Windows key on a PC stay free for the system. */
export function isModShortcut(event: ShortcutEvent, key: string, apple = currentIsApple()): boolean {
  if (event.altKey || event.key.toLowerCase() !== key) return false;
  return apple ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
}

const never = () => () => {};
/** modKey() for a component: the static export is rendered without a
 *  platform, so hydration starts from "Ctrl+" and settles on the device's. */
export function useModKey(): string {
  return useSyncExternalStore(never, () => modKey(), () => modKey(false));
}
