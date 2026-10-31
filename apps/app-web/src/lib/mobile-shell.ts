import { tauriShell } from '@alice-wallet/alice-ai';

/** Above this many pixels hidden at the bottom, the keyboard is open. */
const KEYBOARD_MIN_HEIGHT = 120;

/**
 * The Android and iOS apps only. Marks the page with `data-shell` so the
 * stylesheet can give them their own controls, and keeps the app frame as tall
 * as the part of the screen the keyboard leaves visible. The iOS webview does
 * not shrink when the keyboard opens: it slides the page up instead, which
 * pushed the composer's send button under the keyboard.
 */
export function startMobileShell(): () => void {
  const shell = tauriShell();
  if (shell !== 'android' && shell !== 'ios') return () => {};
  const root = document.documentElement;
  root.dataset.shell = shell;

  const viewport = window.visualViewport;
  if (!viewport) return () => {};
  const update = () => {
    root.style.setProperty('--alice-viewport-height', `${viewport.height}px`);
    root.toggleAttribute('data-keyboard', window.innerHeight - viewport.height > KEYBOARD_MIN_HEIGHT);
    if (window.scrollY !== 0) window.scrollTo(0, 0);
  };
  update();
  viewport.addEventListener('resize', update);
  viewport.addEventListener('scroll', update);
  return () => {
    viewport.removeEventListener('resize', update);
    viewport.removeEventListener('scroll', update);
  };
}
