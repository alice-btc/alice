// The executable factory is shipped with Alice. Model weights and WASM
// binaries may still be downloaded; they are not remote JavaScript modules.
export const SEMANTIC_WASM_FACTORIES = [
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.asyncify.mjs',
  'ort-wasm-simd-threaded.jsep.mjs',
  'ort-wasm-simd-threaded.jspi.mjs',
] as const;

export function localSemanticWasmPaths(paths: unknown): { mjs: string; wasm: string | URL } {
  const value = paths as { mjs?: unknown; wasm?: unknown } | undefined;
  if (!value || !(typeof value.mjs === 'string' || value.mjs instanceof URL)
    || !(typeof value.wasm === 'string' || value.wasm instanceof URL)) {
    throw new Error('Unsupported semantic runtime paths.');
  }
  const name = new URL(String(value.mjs), 'https://alice.invalid').pathname.split('/').pop();
  if (!SEMANTIC_WASM_FACTORIES.some(file => file === name)) {
    throw new Error('Unsupported semantic runtime factory.');
  }
  return { mjs: `/semantic-runtime/${name}`, wasm: value.wasm };
}
