import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCustomModelEntry,
  customModelFilename,
  customModelId,
  isAllowedModelDownloadUrl,
  isCustomModelId,
  isPinnedModelDownloadUrl,
  modelDownloadRefusal,
  normalizeHuggingFaceRepo,
  parseHuggingFaceModelListing,
  parseStoredCustomModels,
} from './local-model-registry.ts';

const sha = 'f6d5376be1edb4d416d56da11e5397a961aca8ae';
const q4Sha256 = 'aaf42c8b7c3cab2bf3d69c355048d4a0ee9973d48f16c731c0520ee914699223';
const payload = {
  sha,
  gated: false,
  cardData: { license: 'apache-2.0' },
  siblings: [
    { rfilename: 'README.md', size: 1200 },
    { rfilename: 'Qwen3.5-2B-Q4_K_M.gguf', size: 1_280_835_840, lfs: { sha256: q4Sha256, size: 1_280_835_840, pointerSize: 135 } },
    // An LFS record that disagrees with the listed size is not trusted.
    { rfilename: 'Qwen3.5-2B-Q8_0.gguf', size: 2_100_000_000, lfs: { sha256: q4Sha256, size: 1 } },
    { rfilename: 'Qwen3.5-2B-BF16.gguf' },
    { rfilename: 'mmproj-F16.gguf', size: 900_000_000 },
    { rfilename: 'Qwen3.5-2B-Q4_K_M-00001-of-00002.gguf', size: 700_000_000 },
    { rfilename: 'nested/Qwen3.5-2B-IQ4_XS.gguf', size: 1_100_000_000 },
  ],
};

test('repository names are normalized from typed text and pasted URLs', () => {
  for (const input of ['unsloth/Qwen3.5-2B-GGUF', ' unsloth/Qwen3.5-2B-GGUF ', 'https://huggingface.co/unsloth/Qwen3.5-2B-GGUF', 'https://huggingface.co/unsloth/Qwen3.5-2B-GGUF/tree/main', 'hf.co/unsloth/Qwen3.5-2B-GGUF/']) {
    assert.equal(normalizeHuggingFaceRepo(input), 'unsloth/Qwen3.5-2B-GGUF', input);
  }
  for (const input of ['', 'unsloth', 'unsloth/', '/Qwen', 'a/b/c', 'unsloth/Qwen 3', '../../etc', 'unsloth/Qwen3.5-2B-GGUF?x=1']) {
    assert.equal(normalizeHuggingFaceRepo(input), null, input);
  }
});

test('the listing keeps complete single gguf weights with a size, sorted by size', () => {
  const listing = parseHuggingFaceModelListing('unsloth/Qwen3.5-2B-GGUF', payload);
  assert.equal(listing.revision, sha);
  assert.equal(listing.license, 'apache-2.0');
  assert.equal(listing.gated, false);
  assert.deepEqual(listing.files.map(f => f.filename), ['nested/Qwen3.5-2B-IQ4_XS.gguf', 'Qwen3.5-2B-Q4_K_M.gguf', 'Qwen3.5-2B-Q8_0.gguf']);
  assert.deepEqual(listing.files.map(f => f.sha256), [undefined, q4Sha256, undefined]);
  assert.throws(() => parseHuggingFaceModelListing('x/y', { siblings: [] }), /revision/);
  assert.throws(() => parseHuggingFaceModelListing('x/y', null), /Unexpected/);
  assert.equal(parseHuggingFaceModelListing('x/y', { sha, gated: 'auto', siblings: [] }).gated, true);
});

test('a custom entry is pinned to the revision, stored under a flat filename and marked untested', () => {
  const listing = parseHuggingFaceModelListing('unsloth/Qwen3.5-2B-GGUF', payload);
  const entry = buildCustomModelEntry(listing, 'Qwen3.5-2B-Q4_K_M.gguf');
  assert.equal(entry.id, 'custom:unsloth/Qwen3.5-2B-GGUF/Qwen3.5-2B-Q4_K_M.gguf');
  assert.equal(entry.filename, 'unsloth__Qwen3.5-2B-GGUF__Qwen3.5-2B-Q4_K_M.gguf');
  assert.equal(entry.url, `https://huggingface.co/unsloth/Qwen3.5-2B-GGUF/resolve/${sha}/Qwen3.5-2B-Q4_K_M.gguf`);
  assert.equal(entry.sizeBytes, 1_280_835_840);
  assert.equal(entry.source, 'custom');
  assert.equal(entry.revision, sha);
  assert.equal(entry.sha256, q4Sha256);
  assert.match(entry.description, /Not tested by Alice/);
  assert.ok(isCustomModelId(entry.id));
  assert.ok(isAllowedModelDownloadUrl(entry.url));
  assert.equal(customModelId('a/b', 'c.gguf'), 'custom:a/b/c.gguf');
  assert.equal(customModelFilename('a/b', 'c.gguf'), 'a__b__c.gguf');
  // A nested path keeps its folder in the id, the flat filename and the URL,
  // so the download targets the file where the repository serves it.
  const nested = buildCustomModelEntry(listing, 'nested/Qwen3.5-2B-IQ4_XS.gguf');
  assert.equal(nested.id, 'custom:unsloth/Qwen3.5-2B-GGUF/nested/Qwen3.5-2B-IQ4_XS.gguf');
  assert.equal(nested.filename, 'unsloth__Qwen3.5-2B-GGUF__nested__Qwen3.5-2B-IQ4_XS.gguf');
  assert.equal(nested.url, `https://huggingface.co/unsloth/Qwen3.5-2B-GGUF/resolve/${sha}/nested/Qwen3.5-2B-IQ4_XS.gguf`);
  assert.equal(nested.name, 'Qwen3.5-2B-IQ4_XS');
  // No hash in the listing: the entry keeps the size check only.
  assert.equal(nested.sha256, undefined);
  const escaping = { ...listing, files: [...listing.files, { filename: 'a/../b.gguf', sizeBytes: 1 }, { filename: '.hidden/c.gguf', sizeBytes: 1 }] };
  assert.throws(() => buildCustomModelEntry(escaping, 'a/../b.gguf'), /Invalid model filename/);
  assert.throws(() => buildCustomModelEntry(escaping, '.hidden/c.gguf'), /Invalid model filename/);
  assert.throws(() => buildCustomModelEntry(listing, 'Qwen3.5-2B-BF16.gguf'), /not in the repository listing/);
  assert.throws(() => buildCustomModelEntry({ ...listing, gated: true }, 'Qwen3.5-2B-Q4_K_M.gguf'), /gated/);
});

test('download URLs stay on huggingface.co over https and point at a gguf file', () => {
  assert.ok(isAllowedModelDownloadUrl('https://huggingface.co/a/b/resolve/main/c.gguf'));
  for (const url of ['http://huggingface.co/a/b/resolve/main/c.gguf', 'https://example.com/a/b/resolve/main/c.gguf', 'https://huggingface.co/a/b/resolve/main/c.bin', 'not a url']) {
    assert.equal(isAllowedModelDownloadUrl(url), false, url);
  }
});

test('stored custom models are read defensively', () => {
  const listing = parseHuggingFaceModelListing('unsloth/Qwen3.5-2B-GGUF', payload);
  const entry = buildCustomModelEntry(listing, 'Qwen3.5-2B-Q4_K_M.gguf');
  const stored = JSON.stringify([
    entry,
    entry, // duplicate id
    { ...entry, id: 'qwen3.5-2b' }, // not a custom id
    { ...entry, id: 'custom:x/y/z.gguf', url: 'https://example.com/z.gguf' }, // foreign host
    { ...entry, id: 'custom:x/y/w.gguf', filename: '../w.gguf' }, // path escape
    { ...entry, id: 'custom:x/y/v.gguf', sizeBytes: -1 },
    { ...entry, id: 'custom:x/y/u.gguf', sha256: 'not-a-hash' }, // kept, without the bad hash
    'garbage',
    null,
  ]);
  const parsed = parseStoredCustomModels(stored);
  assert.equal(parsed.length, 2);
  assert.deepEqual(parsed[0], entry);
  assert.equal(parsed[1].sha256, undefined);
  assert.deepEqual(parseStoredCustomModels(null), []);
  assert.deepEqual(parseStoredCustomModels('{not json'), []);
  assert.deepEqual(parseStoredCustomModels('{"a":1}'), []);
});

test('the listing fetch maps HTTP outcomes to plain errors and never leaves huggingface.co', async () => {
  const { fetchHuggingFaceGgufListing } = await import('./local-model-registry.ts');
  const calls: string[] = [];
  const fetchOk = async (url: string) => { calls.push(url); return { ok: true, status: 200, json: async () => payload }; };
  const listing = await fetchHuggingFaceGgufListing('https://huggingface.co/unsloth/Qwen3.5-2B-GGUF', fetchOk);
  assert.equal(listing.files.length, 3);
  assert.deepEqual(calls, ['https://huggingface.co/api/models/unsloth/Qwen3.5-2B-GGUF?blobs=true']);
  await assert.rejects(fetchHuggingFaceGgufListing('nope', fetchOk), /owner\/name/);
  await assert.rejects(fetchHuggingFaceGgufListing('a/b', async () => ({ ok: false, status: 404, json: async () => ({}) })), /does not exist/);
  await assert.rejects(fetchHuggingFaceGgufListing('a/b', async () => ({ ok: false, status: 403, json: async () => ({}) })), /gated/);
  await assert.rejects(fetchHuggingFaceGgufListing('a/b', async () => ({ ok: true, status: 200, json: async () => ({ sha, siblings: [] }) })), /No single gguf/);
});

test('downloads come only from a commit, never from a branch or the previous catalog', () => {
  const listing = parseHuggingFaceModelListing('unsloth/Qwen3.5-2B-GGUF', payload);
  const custom = buildCustomModelEntry(listing, 'Qwen3.5-2B-Q4_K_M.gguf');
  assert.ok(isPinnedModelDownloadUrl(custom.url));
  assert.equal(isPinnedModelDownloadUrl('https://huggingface.co/a/b/resolve/main/c.gguf'), false);
  assert.equal(isPinnedModelDownloadUrl(`https://huggingface.co/a/b/resolve/${sha.slice(0, 12)}/c.gguf`), false);
  assert.equal(isPinnedModelDownloadUrl('not a url'), false);

  assert.equal(modelDownloadRefusal(custom), null);
  // A custom file listed without a hash still downloads, with the size check only.
  assert.equal(modelDownloadRefusal({ ...custom, sha256: undefined }), null);
  assert.match(modelDownloadRefusal({ ...custom, url: 'https://huggingface.co/a/b/resolve/main/c.gguf' }) ?? '', /not pinned/);
  assert.match(modelDownloadRefusal({ ...custom, url: `https://example.com/a/b/resolve/${sha}/c.gguf` }) ?? '', /not pinned/);
  assert.match(modelDownloadRefusal({ ...custom, source: 'legacy' }) ?? '', /previous catalog/);
  assert.equal(modelDownloadRefusal({ ...custom, source: 'catalog' }), null);
  assert.match(modelDownloadRefusal({ ...custom, source: 'catalog', sha256: undefined }) ?? '', /no published checksum/);
});
