import { createHash } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { readdir, readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const MARKER = '<meta id="alice-script-policy"';
export function secureHtml(html) {
  if (!/<head(?:\s[^>]*)?>/i.test(html)) throw new Error('Exported HTML has no head.');
  if (html.includes(MARKER)) throw new Error('Export already has a script policy. Rebuild before securing it.');
  const hashes = new Set();
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const [, attributes, source] = match;
    const src = attributes.match(/(?:^|\s)src\s*=\s*["']([^"']*)["']/i);
    if (src) {
      const url = new URL(src[1], 'https://alice.invalid');
      if (url.origin !== 'https://alice.invalid') throw new Error('Export contains a third-party script.');
    } else {
      // Hash the exact script text the HTML parser sees, including whitespace.
      const normalized = source.replace(/\r\n?/g, '\n');
      hashes.add(`'sha256-${createHash('sha256').update(normalized).digest('base64')}'`);
    }
  }
  const policy = `script-src 'self' 'wasm-unsafe-eval' ${[...hashes].join(' ')}; script-src-attr 'none'; worker-src 'self' blob:; object-src 'none'; base-uri 'none'`;
  const meta = `${MARKER} http-equiv="Content-Security-Policy" content="${policy}">`;
  return html.replace(/<head(?:\s[^>]*)?>/i, head => head + meta);
}

export async function secureExport(root) {
  let count = 0;
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        await writeFile(path, secureHtml(await readFile(path, 'utf8')));
        count++;
      }
    }
  }
  // Only the small executable factories are bundled. Weights and WASM
  // binaries keep their existing download paths.
  const runtime = resolve(dirname(fileURLToPath(import.meta.url)), '../node_modules/onnxruntime-web/dist');
  const target = join(root, 'semantic-runtime');
  await mkdir(target, { recursive: true });
  for (const name of ['ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.asyncify.mjs', 'ort-wasm-simd-threaded.jsep.mjs', 'ort-wasm-simd-threaded.jspi.mjs']) {
    await copyFile(join(runtime, name), join(target, name));
  }
  await visit(root);
  if (!count) throw new Error('No exported HTML found. Refusing an unsecured export.');
  return count;
}
if (process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(resolve(process.argv[1]))) {
  const root = resolve(process.argv[2] ?? 'apps/app-web/out');
  console.log(`Secured ${await secureExport(root)} exported pages.`);
}
