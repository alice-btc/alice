import { useLayoutEffect, type KeyboardEvent, type RefObject } from 'react';
import { finePointer } from './pointer.ts';

// The message fields grow with their text up to three lines, so the chat
// behind them stays visible, then scroll inside. The limit is read from the
// field's own line height and padding, so it never cuts a line in half.
export const COMPOSER_MAX_LINES = 3;

type FieldStyle = Pick<CSSStyleDeclaration, 'lineHeight' | 'paddingTop' | 'paddingBottom'>;

export function fitComposer(
  el: HTMLTextAreaElement,
  style: FieldStyle = getComputedStyle(el),
): void {
  const line = parseFloat(style.lineHeight) || 26;
  const padding = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
  const max = line * COMPOSER_MAX_LINES + padding;
  const scrollTop = el.scrollTop;
  el.style.height = 'auto';
  // An empty field is one line: its placeholder may wrap, and a field laid
  // out before it had a width measures as many lines.
  const full = el.value ? el.scrollHeight : line + padding;
  el.style.height = Math.min(full, max) + 'px';
  el.style.overflowY = full > max ? 'auto' : 'hidden';
  // Typing at the end keeps the newest line in view; editing further up
  // leaves the field where the reader had it.
  el.scrollTop = el.selectionEnd === el.value.length ? full : scrollTop;
}

export function useComposerFit(ref: RefObject<HTMLTextAreaElement | null>, value: string): void {
  useLayoutEffect(() => {
    if (ref.current) fitComposer(ref.current);
  }, [ref, value]);
  // A new width (a rotated phone, a resized window) rewraps the text.
  useLayoutEffect(() => {
    const refit = () => { if (ref.current) fitComposer(ref.current); };
    window.addEventListener('resize', refit);
    return () => window.removeEventListener('resize', refit);
  }, [ref]);
}

// With a physical keyboard, Enter sends and Shift+Enter starts a new line.
// On a touch screen the keyboard's return key starts a new line, and the
// send button sends.
export function enterSends(e: KeyboardEvent<HTMLTextAreaElement>): boolean {
  return e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && finePointer();
}
