// The words of the local model catalog in the interface language. The entries
// in packages/alice-ai carry English, which stays the fallback: a model the
// dictionary does not name (a catalog entry added later) shows the package's
// text rather than nothing.

import type { LocalModelEntry, LocalModelErrorCode } from '@alice-wallet/alice-ai/local-model-registry';
import { currentLocale, translate, type Locale, type MessageKey } from '../i18n/translate.ts';
import { formatDecimal } from './format-size.ts';

type ModelText = { description: MessageKey; recommendation: MessageKey };

const MODEL_TEXT: Record<string, ModelText> = {
  'qwen3.5-0.8b': { description: 'models.catalog.qwen35_08b.description', recommendation: 'models.catalog.qwen35_08b.recommendation' },
  'qwen3.5-2b': { description: 'models.catalog.qwen35_2b.description', recommendation: 'models.catalog.qwen35_2b.recommendation' },
  'qwen3.5-4b': { description: 'models.catalog.qwen35_4b.description', recommendation: 'models.catalog.qwen35_4b.recommendation' },
  'qwen3.5-9b': { description: 'models.catalog.qwen35_9b.description', recommendation: 'models.catalog.qwen35_9b.recommendation' },
  'qwen3-0.6b': { description: 'models.catalog.qwen3_06b.description', recommendation: 'models.catalog.qwen3_06b.recommendation' },
  'qwen3-1.7b': { description: 'models.catalog.qwen3_17b.description', recommendation: 'models.catalog.qwen3_17b.recommendation' },
  'granite-3.3-2b': { description: 'models.catalog.granite33_2b.description', recommendation: 'models.catalog.granite33_2b.recommendation' },
  'smollm3-3b': { description: 'models.catalog.smollm3_3b.description', recommendation: 'models.catalog.smollm3_3b.recommendation' },
  'qwen3-4b': { description: 'models.catalog.qwen3_4b.description', recommendation: 'models.catalog.qwen3_4b.recommendation' },
};

const SPEED_TEXT: Record<string, MessageKey> = {
  Fastest: 'models.speed.fastest',
  Fast: 'models.speed.fast',
  Medium: 'models.speed.medium',
  Slow: 'models.speed.slow',
  Unknown: 'models.speed.unknown',
};

type Entry = Pick<LocalModelEntry, 'id' | 'source' | 'repo' | 'description' | 'recommendation' | 'speed' | 'ramNeeded'>;

export function modelDescription(model: Entry, locale: Locale = currentLocale()): string {
  if (model.source === 'custom' && model.repo) return translate(locale, 'models.custom.description', { repo: model.repo });
  const text = MODEL_TEXT[model.id];
  return text ? translate(locale, text.description) : model.description;
}

export function modelRecommendation(model: Entry, locale: Locale = currentLocale()): string {
  if (model.source === 'custom') return translate(locale, 'models.custom.recommendation');
  const text = MODEL_TEXT[model.id];
  return text ? translate(locale, text.recommendation) : model.recommendation;
}

export function modelSpeed(model: Entry, locale: Locale = currentLocale()): string {
  const key = SPEED_TEXT[model.speed];
  return key ? translate(locale, key) : model.speed;
}

const RAM_PATTERN = /^(about )?(\d+(?:\.\d+)?) (GB|MB)$/;

/** "6 GB" or "about 2.9 GB" as the entries write it, in the locale's units. */
export function modelRam(model: Entry, locale: Locale = currentLocale()): string {
  const match = RAM_PATTERN.exec(model.ramNeeded);
  if (!match) return model.ramNeeded;
  const [, about, figure, unit] = match;
  const digits = figure.includes('.') ? figure.split('.')[1].length : 0;
  const size = translate(locale, unit === 'GB' ? 'common.size.gb' : 'common.size.mb', { value: formatDecimal(Number(figure), digits, locale) });
  return about ? translate(locale, 'models.ramAbout', { size }) : size;
}

const ERROR_TEXT: Record<LocalModelErrorCode, MessageKey> = {
  repo_format: 'models.error.repoFormat',
  repo_missing: 'models.error.repoMissing',
  repo_gated: 'models.error.repoGated',
  hf_status: 'models.error.hfStatus',
  hf_network: 'models.error.hfNetwork',
  no_gguf: 'models.error.noGguf',
  listing_unexpected: 'models.error.listingUnexpected',
  listing_revision: 'models.error.listingRevision',
  invalid_repo: 'models.error.invalidRepo',
  invalid_filename: 'models.error.invalidFilename',
  file_not_listed: 'models.error.fileNotListed',
  not_huggingface: 'models.error.notHuggingFace',
  already_in_catalog: 'models.error.alreadyInCatalog',
  download_legacy: 'models.error.downloadLegacy',
  download_unpinned: 'models.error.downloadUnpinned',
  download_missing_checksum: 'models.error.downloadMissingChecksum',
};

/**
 * What a failed Hugging Face lookup or addition says: a LocalModelError in
 * the interface language, any other error in its own words, `fallback` when
 * there are none.
 */
export function localModelErrorText(error: unknown, fallback: string, locale: Locale = currentLocale()): string {
  if (!(error instanceof Error)) return fallback;
  const { code, params } = error as Error & { code?: unknown; params?: Record<string, string | number> };
  const key = error.name === 'LocalModelError' && typeof code === 'string' ? ERROR_TEXT[code as LocalModelErrorCode] : undefined;
  return key ? translate(locale, key, params) : error.message;
}
