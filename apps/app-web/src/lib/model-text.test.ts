import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { LocalModelError, buildCustomModelEntry, type LocalModelEntry } from '../../../../packages/alice-ai/src/local-model-registry.ts';
import { en } from '../i18n/en.ts';
import { formatGigabytes, formatModelSize, formatStorageSize } from './format-size.ts';
import { localModelErrorText, modelDescription, modelRam, modelRecommendation, modelSpeed } from './model-text.ts';

const catalogSource = readFileSync(new URL('../../../../packages/alice-ai/src/ai-preferences.ts', import.meta.url), 'utf8');

const qwen4b: LocalModelEntry = {
  id: 'qwen3.5-4b',
  name: 'Qwen3.5 4B',
  filename: 'Qwen3.5-4B-Q4_K_M.gguf',
  sizeBytes: 2_740_937_888,
  url: 'https://huggingface.co/unsloth/Qwen3.5-4B-GGUF/resolve/0/Qwen3.5-4B-Q4_K_M.gguf',
  description: 'package description',
  speed: 'Medium',
  ramNeeded: '6 GB',
  recommendation: 'package recommendation',
  source: 'catalog',
};

describe('sizes', () => {
  it('keep their English form and use French units and decimal comma', () => {
    assert.equal(formatModelSize(2_740_937_888, 'en'), '2.7 GB');
    assert.equal(formatModelSize(2_740_937_888, 'fr'), '2,7 Go');
    assert.equal(formatModelSize(532_517_120, 'en'), '533 MB');
    assert.equal(formatModelSize(532_517_120, 'fr'), '533 Mo');
    assert.equal(formatGigabytes(3_000_000_000, 'en'), '3.0 GB');
    assert.equal(formatGigabytes(3_000_000_000, 'fr'), '3,0 Go');
    assert.equal(formatStorageSize(512, 'fr'), '512 o');
    assert.equal(formatStorageSize(5000, 'en'), '5 KB');
    assert.equal(formatStorageSize(5000, 'fr'), '5 ko');
    assert.equal(formatStorageSize(3.5 * 1024 * 1024, 'en'), '3.5 MB');
    assert.equal(formatStorageSize(3.5 * 1024 * 1024, 'fr'), '3,5 Mo');
  });
});

describe('local model texts', () => {
  it('name the catalog entries in the interface language', () => {
    assert.match(modelDescription(qwen4b, 'fr'), /Le modèle local recommandé/);
    assert.match(modelRecommendation(qwen4b, 'fr'), /Le choix par défaut/);
    assert.equal(modelSpeed(qwen4b, 'fr'), 'Moyenne');
    assert.equal(modelRam(qwen4b, 'fr'), '6 Go');
    assert.equal(modelRam(qwen4b, 'en'), '6 GB');
  });

  it('fall back to the package text for an entry the dictionary does not name', () => {
    const unknown = { ...qwen4b, id: 'future-model', speed: 'Warp', ramNeeded: 'plenty' };
    assert.equal(modelDescription(unknown, 'fr'), 'package description');
    assert.equal(modelRecommendation(unknown, 'fr'), 'package recommendation');
    assert.equal(modelSpeed(unknown, 'fr'), 'Warp');
    assert.equal(modelRam(unknown, 'fr'), 'plenty');
  });

  it('say the same English as the package catalog', () => {
    for (const [key, value] of Object.entries(en)) {
      if (!key.startsWith('models.catalog.')) continue;
      assert.ok(catalogSource.includes(`'${value}'`), key);
    }
  });

  it('describe a custom Hugging Face file with its repository', () => {
    const entry = buildCustomModelEntry({
      repo: 'unsloth/Qwen3.5-2B-GGUF',
      revision: 'a'.repeat(40),
      license: null,
      gated: false,
      files: [{ filename: 'Qwen3.5-2B-Q4_K_M.gguf', sizeBytes: 1_280_835_840 }],
    }, 'Qwen3.5-2B-Q4_K_M.gguf');
    assert.equal(modelDescription(entry, 'en'), entry.description);
    assert.equal(modelRecommendation(entry, 'en'), entry.recommendation);
    assert.equal(modelRam(entry, 'en'), entry.ramNeeded);
    assert.equal(modelSpeed(entry, 'en'), entry.speed);
    assert.match(modelDescription(entry, 'fr'), /^Modèle personnalisé de unsloth\/Qwen3.5-2B-GGUF\./);
    assert.equal(modelRam(entry, 'fr'), 'environ 1,9 Go');
  });

  it('translate a coded refusal and keep any other error as it is', () => {
    const coded = new LocalModelError('hf_status', 'Hugging Face answered 500.', { status: 500 });
    assert.equal(localModelErrorText(coded, 'fallback', 'en'), 'Hugging Face answered 500.');
    assert.equal(localModelErrorText(coded, 'fallback', 'fr'), 'Hugging Face a répondu 500.');
    assert.equal(localModelErrorText(new TypeError('Failed to fetch'), 'fallback', 'fr'), 'Failed to fetch');
    assert.equal(localModelErrorText('nope', 'fallback', 'fr'), 'fallback');
  });
});
