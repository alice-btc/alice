import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isApplePlatform, isModShortcut, modKey } from './platform-keys.ts';

const LINUX_DESKTOP = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko)';
const WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15';

const key = (key: string, modifiers: { metaKey?: boolean; ctrlKey?: boolean; altKey?: boolean } = {}) =>
  ({ key, metaKey: false, ctrlKey: false, altKey: false, ...modifiers });

test('Apple devices are told apart from Linux and Windows', () => {
  assert.equal(isApplePlatform(MAC), true);
  assert.equal(isApplePlatform(IPHONE), true);
  assert.equal(isApplePlatform('', 'macOS'), true);
  assert.equal(isApplePlatform(LINUX_DESKTOP), false);
  assert.equal(isApplePlatform(WINDOWS, 'Windows'), false);
  assert.equal(isApplePlatform(LINUX_DESKTOP, 'Linux x86_64'), false);
});

test('the shortcut label reads ⌘ on Apple and Ctrl+ elsewhere', () => {
  assert.equal(modKey(true), '⌘');
  assert.equal(modKey(false), 'Ctrl+');
  assert.equal(`${modKey(false)}K`, 'Ctrl+K');
  assert.equal(`${modKey(true)},`, '⌘,');
});

test('on Linux and Windows the shortcuts take Control, not the Super key', () => {
  for (const letter of ['n', 'k', ',']) {
    assert.equal(isModShortcut(key(letter, { ctrlKey: true }), letter, false), true, letter);
    assert.equal(isModShortcut(key(letter, { metaKey: true }), letter, false), false, letter);
    assert.equal(isModShortcut(key(letter), letter, false), false, letter);
  }
  // Caps Lock or Shift do not change the letter.
  assert.equal(isModShortcut(key('K', { ctrlKey: true }), 'k', false), true);
});

test('on Apple the shortcuts take Command, and Control stays free', () => {
  assert.equal(isModShortcut(key('k', { metaKey: true }), 'k', true), true);
  assert.equal(isModShortcut(key('k', { ctrlKey: true }), 'k', true), false);
  assert.equal(isModShortcut(key('k', { metaKey: true, ctrlKey: true }), 'k', true), false);
});

test('Alt changes the shortcut into something else', () => {
  assert.equal(isModShortcut(key('k', { ctrlKey: true, altKey: true }), 'k', false), false);
  assert.equal(isModShortcut(key('n', { ctrlKey: true }), 'k', false), false);
});
