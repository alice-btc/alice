import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { tauriShellFromHint } from './tauri-runtime.ts';

describe('tauriShellFromHint', () => {
  it('places the Android webview', () => {
    assert.equal(
      tauriShellFromHint('Mozilla/5.0 (Linux; Android 16; Pixel 9 Build/BP2A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/141.0.0.0 Mobile Safari/537.36', 5),
      'android',
    );
  });

  it('places iPhone and iPad, including an iPad that reports itself as a Mac', () => {
    assert.equal(tauriShellFromHint('Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', 5), 'ios');
    assert.equal(tauriShellFromHint('Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', 5), 'ios');
    assert.equal(tauriShellFromHint('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)', 5), 'ios');
  });

  it('keeps every desktop webview on desktop', () => {
    assert.equal(tauriShellFromHint('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)', 0), 'desktop');
    assert.equal(tauriShellFromHint('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', 0), 'desktop');
    assert.equal(tauriShellFromHint('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko)', 0), 'desktop');
    // A Windows laptop with a touch screen is still a desktop.
    assert.equal(tauriShellFromHint('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 10), 'desktop');
    assert.equal(tauriShellFromHint('', 0), 'desktop');
  });
});
