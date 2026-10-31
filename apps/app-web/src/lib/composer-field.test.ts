import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fitComposer } from './composer-field.ts';

// A field whose content is `lines` lines of 26px tall, with 4px of padding
// above and below; scrollHeight counts the padding, like a browser.
function field(lines: number, caretAtEnd = true) {
  const value = 'x'.repeat(lines * 40);
  return {
    value,
    selectionEnd: caretAtEnd ? value.length : 0,
    scrollTop: 0,
    scrollHeight: lines * 26 + 8,
    style: { height: '', overflowY: '' },
  } as unknown as HTMLTextAreaElement;
}
const style = { lineHeight: '26px', paddingTop: '4px', paddingBottom: '4px' };

test('the field grows with its text, without scrolling, up to three lines', () => {
  for (const lines of [1, 2, 3]) {
    const el = field(lines);
    fitComposer(el, style);
    assert.equal(el.style.height, `${lines * 26 + 8}px`);
    assert.equal(el.style.overflowY, 'hidden');
  }
});

test('past three lines it keeps three and scrolls inside, the newest line in view', () => {
  const el = field(7);
  fitComposer(el, style);
  assert.equal(el.style.height, `${3 * 26 + 8}px`);
  assert.equal(el.style.overflowY, 'auto');
  assert.equal(el.scrollTop, 7 * 26 + 8);
});

test('editing further up leaves the field where it was scrolled', () => {
  const el = field(7, false);
  el.scrollTop = 30;
  fitComposer(el, style);
  assert.equal(el.scrollTop, 30);
});

test('an emptied field goes back to one line', () => {
  const el = field(7);
  fitComposer(el, style);
  Object.assign(el, { value: '', selectionEnd: 0, scrollHeight: 26 + 8 });
  fitComposer(el, style);
  assert.equal(el.style.height, `${26 + 8}px`);
  assert.equal(el.style.overflowY, 'hidden');
});

test('an empty field is one line even when its placeholder would wrap', () => {
  const el = field(0);
  Object.assign(el, { scrollHeight: 520 });
  fitComposer(el, style);
  assert.equal(el.style.height, `${26 + 8}px`);
  assert.equal(el.style.overflowY, 'hidden');
});
