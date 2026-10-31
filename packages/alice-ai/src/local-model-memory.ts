// What a local model costs a phone, and which of the catalog a phone is
// offered. Pure, so it runs under node:test; the Android and iOS shells
// apply the same memory figures before a load
// (apps/app-desktop/src-tauri/src/local_ai_text.rs).

import type { LocalModelEntry } from './local-model-registry';

/**
 * Memory a model needs beyond its file: the KV cache of a 4096-token
 * context, llama.cpp's compute buffers and the app itself. Weights are
 * mapped from the file, so the file's size is the floor.
 */
const MODEL_MEMORY_FILE_SHARE = 8;
const MODEL_MEMORY_OVERHEAD_BYTES = 640 * 1024 * 1024;

export function localModelMemoryNeed(sizeBytes: number): number {
  return sizeBytes + Math.floor(sizeBytes / MODEL_MEMORY_FILE_SHARE) + MODEL_MEMORY_OVERHEAD_BYTES;
}

/**
 * The phone catalog stops at 4 billion parameters in 4-bit quantization: the
 * 9B file alone is 5.7 GB, more than any phone can map next to its system.
 * A file whose parameter count is unknown (a custom Hugging Face file) is
 * judged by its size, about what a 4B model weighs in Q4.
 */
export const MOBILE_MAX_MODEL_PARAMETERS = 4;
export const MOBILE_MAX_MODEL_BYTES = 3_000_000_000;

export type DeviceMemory = {
  totalBytes: number;
  /** What the app may still allocate; 0 when the platform did not say. */
  availableBytes: number;
};

function gigabytes(bytes: number): string {
  return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
}

/** Why a phone is not offered this entry, or null when it is. */
export function mobileModelRefusal(entry: Pick<LocalModelEntry, 'name' | 'sizeBytes' | 'parameters'>): string | null {
  if (entry.parameters !== undefined) {
    return entry.parameters <= MOBILE_MAX_MODEL_PARAMETERS
      ? null
      : `${entry.name} has ${entry.parameters}B parameters; phones run models up to ${MOBILE_MAX_MODEL_PARAMETERS}B in Q4.`;
  }
  return mobileFileSizeRefusal(entry.sizeBytes);
}

/** Why a phone is not offered a file of this size, or null when it is. */
export function mobileFileSizeRefusal(sizeBytes: number): string | null {
  return sizeBytes <= MOBILE_MAX_MODEL_BYTES
    ? null
    : `Files over ${gigabytes(MOBILE_MAX_MODEL_BYTES)} are not offered on a phone (about ${MOBILE_MAX_MODEL_PARAMETERS}B parameters in Q4).`;
}

/**
 * A notice when the model may not fit what the system lets this app allocate
 * right now, or null when it fits or when the device did not say. The figure
 * is RAM, not storage, and it moves with the apps open at that moment, so it
 * is a warning before a download. iOS refuses the load while the budget is
 * short; Android loads and lets the system evict and reclaim.
 */
export function deviceMemoryShortfall(sizeBytes: number, memory: DeviceMemory | null): string | null {
  if (!memory || !(memory.availableBytes > 0)) return null;
  const need = localModelMemoryNeed(sizeBytes);
  if (need <= memory.availableBytes) return null;
  return `This model needs about ${gigabytes(need)} of memory (RAM, not storage) and the system lets this app use ${gigabytes(memory.availableBytes)} right now. The download can go ahead; whether the model then loads is decided on the phone at that moment.`;
}
