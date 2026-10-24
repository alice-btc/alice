import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFeedbackIssueUrl, FEEDBACK_REPO, getReportPageLabel } from './feedback-context.ts';

test('known routes map to their label', () => {
  assert.equal(getReportPageLabel('https://app.alicebtc.com/'), 'Home');
  assert.equal(getReportPageLabel('https://app.alicebtc.com/explorer/'), 'Explorer');
  assert.equal(getReportPageLabel('https://app.alicebtc.com/learn'), 'Learn');
  assert.equal(getReportPageLabel('https://app.alicebtc.com/playground/'), 'Playground');
  assert.equal(getReportPageLabel('https://app.alicebtc.com/settings/'), 'Settings');
});

test('query strings and hashes never reach the label', () => {
  for (const href of [
    'https://app.alicebtc.com/learn/?token=SECRET&addr=bc1qabc',
    'https://app.alicebtc.com/settings/#access_token=SECRET',
    'https://app.alicebtc.com/?seed=SECRET#frag',
  ]) {
    assert.doesNotMatch(getReportPageLabel(href), /SECRET|bc1q|token|seed|\?|#/);
  }
  assert.equal(getReportPageLabel('https://app.alicebtc.com/learn/?token=SECRET'), 'Learn');
});

test('credentials and origin are never included', () => {
  const label = getReportPageLabel('https://user:hunter2@app.alicebtc.com:8443/explorer/');
  assert.equal(label, 'Explorer');
  assert.doesNotMatch(label, /user|hunter2|alicebtc|8443|https/);
});

test('unknown paths collapse to Other page without leaking segments', () => {
  const label = getReportPageLabel(
    'https://app.alicebtc.com/tx/4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
  );
  assert.equal(label, 'Other page');
  assert.equal(getReportPageLabel('https://app.alicebtc.com/wallet/xpub6CUGRUonZSQ4'), 'Other page');
  assert.equal(getReportPageLabel('https://app.alicebtc.com/learnx/'), 'Other page');
});

test('known section with identifier subpath reveals only the section', () => {
  const label = getReportPageLabel('https://app.alicebtc.com/explorer/tx/deadbeef1234');
  assert.equal(label, 'Explorer');
  assert.doesNotMatch(label, /deadbeef/);
});

test('missing or malformed input is Unknown', () => {
  assert.equal(getReportPageLabel(undefined), 'Unknown');
  assert.equal(getReportPageLabel(null), 'Unknown');
  assert.equal(getReportPageLabel(''), 'Unknown');
  assert.equal(getReportPageLabel('http://'), 'Unknown');
  assert.equal(getReportPageLabel('https://[bad'), 'Unknown');
});

test('malformed non-URL text does not leak', () => {
  const label = getReportPageLabel('not a url?secret=1');
  assert.equal(label, 'Other page');
});

test('desktop tauri origins use the same route labels', () => {
  assert.equal(getReportPageLabel('http://tauri.localhost/learn/'), 'Learn');
  assert.equal(getReportPageLabel('https://tauri.localhost/settings/?x=SECRET'), 'Settings');
  assert.equal(getReportPageLabel('tauri://localhost/playground/#SECRET'), 'Playground');
  assert.equal(getReportPageLabel('tauri://localhost/'), 'Home');
  assert.equal(getReportPageLabel('tauri://localhost/unknown/abc'), 'Other page');
});

// Object prototype names are untrusted path segments, never route labels.
test('prototype property names cannot escape the fixed label set', () => {
  for (const segment of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
    assert.equal(getReportPageLabel(`https://app.alicebtc.com/${segment}`), 'Other page');
  }
});

test('a report opens a prefilled issue on the public source repository', () => {
  assert.equal(FEEDBACK_REPO, 'alice-btc/alice');
  const title = 'Explorer: “FULL” attachment & 100% width?';
  const body = '## Report\n\n- Page: Explorer\n- Steps: a=1&b=2 #3';
  const url = new URL(buildFeedbackIssueUrl({ title, body, category: 'alice-response' }));
  assert.equal(url.origin, 'https://github.com');
  assert.equal(url.pathname, '/alice-btc/alice/issues/new');
  assert.equal(url.searchParams.get('title'), title);
  assert.equal(url.searchParams.get('body'), body);
  assert.equal(url.searchParams.get('labels'), 'alice-response,private-beta');
  assert.equal(url.hash, '');
});
