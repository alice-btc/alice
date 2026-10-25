export function isExpectedModelFileSize(
  actualBytes: number | undefined,
  expectedBytes: number,
): boolean {
  return Number.isFinite(actualBytes)
    && actualBytes === expectedBytes;
}

/** A SHA-256 digest as Hugging Face publishes it: 64 lowercase hex digits. */
export function isSha256Hex(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
}

/**
 * The last segment of a stored model path, on either separator. Older desktop
 * builds stored the full path of the model; the desktop shell now starts a
 * model by filename only, inside its own models directory.
 */
export function modelFilenameFromPath(path: string | null | undefined): string | null {
  if (!path) return null;
  const name = path.split(/[\\/]/).pop() ?? '';
  return name.endsWith('.gguf') ? name : null;
}
