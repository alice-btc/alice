import { realpathSync } from 'node:fs';
import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Build Output API v3: upload the tested static export only. This does not
// retrieve Vercel environment variables or upload private source/configuration.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// A prebuilt deployment ignores vercel.json, so its response headers are
// carried into config.json from that file, the single source of truth. Any
// setting this script cannot carry is refused rather than silently dropped.
export const REQUIRED_SECURITY_HEADERS = [
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Content-Security-Policy',
];
const CARRIED_SETTINGS = new Set(['$schema', 'installCommand', 'buildCommand', 'headers']);
const ALL_PATHS_SOURCE = '/(.*)';
const HEADER_NAME = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
const PAGE_CACHE = { 'Cache-Control': 'public, max-age=0, must-revalidate' };
const ASSET_CACHE = { 'Cache-Control': 'public,max-age=31536000,immutable' };

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

/** The response headers of a parsed vercel.json, or an error when any part
 *  of its configuration cannot be reproduced exactly for every response. */
export function securityHeadersFrom(config) {
  if (!isObject(config)) throw new Error('vercel.json must be a JSON object.');
  for (const name of Object.keys(config)) {
    if (!CARRIED_SETTINGS.has(name)) {
      throw new Error(`vercel.json setting "${name}" is not carried into the prebuilt deployment.`);
    }
  }
  if (!Array.isArray(config.headers) || config.headers.length === 0) {
    throw new Error('vercel.json defines no response headers.');
  }
  const headers = {};
  const seen = new Set();
  for (const rule of config.headers) {
    if (!isObject(rule)) throw new Error('Malformed vercel.json header rule.');
    const condition = Object.keys(rule).find(name => name !== 'source' && name !== 'headers');
    if (condition) throw new Error(`Unsupported vercel.json header rule field "${condition}".`);
    if (rule.source !== ALL_PATHS_SOURCE) {
      throw new Error(`Unsupported vercel.json header source ${JSON.stringify(rule.source)}; only "${ALL_PATHS_SOURCE}" is carried.`);
    }
    if (!Array.isArray(rule.headers) || rule.headers.length === 0) {
      throw new Error('Malformed vercel.json header list.');
    }
    for (const header of rule.headers) {
      if (!isObject(header) || Object.keys(header).sort().join() !== 'key,value') {
        throw new Error('Malformed vercel.json header entry.');
      }
      const { key, value } = header;
      if (typeof key !== 'string' || !HEADER_NAME.test(key)) throw new Error(`Invalid header name ${JSON.stringify(key)}.`);
      if (typeof value !== 'string' || !value.trim() || /[\r\n\0]/.test(value)) {
        throw new Error(`Invalid value for header ${key}.`);
      }
      const name = key.toLowerCase();
      // Cache-Control is set per route below; a second source would conflict.
      if (name === 'cache-control') throw new Error('Cache-Control is set by the deployment script, not vercel.json.');
      if (seen.has(name)) throw new Error(`Duplicate header ${key} in vercel.json.`);
      seen.add(name);
      headers[key] = value;
    }
  }
  const missing = REQUIRED_SECURITY_HEADERS.filter(name => !seen.has(name.toLowerCase()));
  if (missing.length) throw new Error(`vercel.json is missing required headers: ${missing.join(', ')}.`);
  return headers;
}

/** Build Output API routes for the exported files, in evaluation order. */
export function deploymentRoutes(files, securityHeaders) {
  const pageRoutes = files.filter(f => f === 'index.html' || f.endsWith('/index.html')).sort().map(f => {
    const route = f === 'index.html' ? '/' : `/${f.slice(0, -'index.html'.length)}`;
    const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return {
      src: route === '/' ? '^/$' : `^${escaped.slice(0, -1)}/?$`,
      dest: `/${f}`,
      headers: { ...PAGE_CACHE },
    };
  });
  return [
    // First and non-terminal, so pages, assets, direct file paths and the
    // 404 fallback all carry these headers.
    { src: '^/.*$', headers: { ...securityHeaders }, continue: true },
    { src: '/_next/static/(.*)', headers: { ...ASSET_CACHE }, continue: true },
    ...pageRoutes,
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/404.html', status: 404 },
  ];
}

/** Writes a fresh Build Output directory and returns its page route count. */
export async function prepareWebDeployment({ source, output, vercelConfig }) {
  // Everything is validated before the destination is created.
  const securityHeaders = securityHeadersFrom(JSON.parse(await readFile(vercelConfig, 'utf8')));
  await readFile(path.join(source, 'index.html'));
  await readFile(path.join(source, '404.html'));
  // Require a fresh destination so old chunks cannot leak into a new deployment.
  await mkdir(output, { recursive: false });
  await cp(source, path.join(output, 'static'), { recursive: true });
  const routes = deploymentRoutes(await readdir(source, { recursive: true }), securityHeaders);
  await writeFile(path.join(output, 'config.json'), JSON.stringify({ version: 3, routes }, null, 2) + '\n');
  return routes.filter(route => route.dest && route.status === undefined).length;
}

if (process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(path.resolve(process.argv[1]))) {
  const output = path.resolve(process.argv[2] ?? path.join(root, '.vercel/output'));
  const count = await prepareWebDeployment({
    source: path.join(root, 'apps/app-web/out'),
    output,
    vercelConfig: path.join(root, 'apps/app-web/vercel.json'),
  });
  console.log(`Prepared ${count} static page routes in ${output}`);
}
