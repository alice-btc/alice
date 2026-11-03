import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { build } from 'esbuild';

test('the real Learn catalog/provider follows conversation language instead of reader preference', async t => {
  const bundled = await build({
    stdin: {
      contents: `
        export { registerLearnTurnContext } from './apps/app-web/src/lib/learn/turn-context.ts';
        export { learnContextFor } from './packages/alice-ai/src/learn-context.ts';
      `,
      resolveDir: process.cwd(), loader: 'ts',
    },
    bundle: true, write: false, platform: 'node', format: 'esm',
    alias: {
      '@alice-wallet/alice-ai': resolve('packages/alice-ai/src/learn-context.ts'),
      '@alice-wallet/alice-content': resolve('packages/alice-content'),
    },
  });
  const runtime = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].contents).toString('base64')}`);
  const urls: string[] = [];
  t.mock.method(globalThis, 'fetch', async (url: string) => {
    urls.push(url);
    const markdown = 'Bitcoin wallet recovery phrase backup. Sauvegarder la phrase de récupération du portefeuille Bitcoin.';
    return new Response(JSON.stringify({
      name: 'Recovery', markdown,
      parts: [{ title: 'Recovery', chapters: [{ title: markdown, markdown }] }],
    }), { status: 200 });
  });
  runtime.registerLearnTurnContext();
  const fr = await runtime.learnContextFor('Comment sauvegarder mon portefeuille Bitcoin et ma phrase de récupération ?', { targetLanguage: 'fr' });
  assert.ok(fr?.excerpt);
  assert.ok(urls.at(-1)?.startsWith('/learn/fr/'), JSON.stringify(urls));
  const en = await runtime.learnContextFor('How do I back up my Bitcoin wallet recovery phrase?', { targetLanguage: 'en' });
  assert.ok(en?.excerpt);
  assert.ok(urls.at(-1)?.startsWith('/learn/en/'), JSON.stringify(urls));
});

test('the dictionary follows the answer language, else the app language, and names the translation', async t => {
  const bundled = await build({
    stdin: {
      contents: `
        export { registerLearnTurnContext } from './apps/app-web/src/lib/learn/turn-context.ts';
        export { learnContextFor } from './packages/alice-ai/src/learn-context.ts';
        export { setCurrentLocale } from './apps/app-web/src/i18n/translate.ts';
      `,
      resolveDir: process.cwd(), loader: 'ts',
    },
    bundle: true, write: false, platform: 'node', format: 'esm',
    alias: {
      '@alice-wallet/alice-ai': resolve('packages/alice-ai/src/learn-context.ts'),
      '@alice-wallet/alice-content': resolve('packages/alice-content'),
    },
  });
  const runtime = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].contents).toString('base64')}`);
  const author = { author: 'Loïc Pandul', license: 'CC BY-NC-SA 4.0' };
  const packs: Record<string, unknown> = {
    '/dictionary/en/index.json': {
      lang: 'en',
      source: {
        ...author, title: 'Bitcoin Dictionary',
        translation: { originalTitle: 'Dictionnaire de Bitcoin', originalLanguage: 'fr', language: 'en', status: 'unofficial', permissionDate: '2026-11-02', reviewedByAuthor: false, replacement: 'The author’s own English translation' },
      },
      entries: [{ slug: 'racine-de-merkle', title: 'MERKLE ROOT', letter: 'm', category: 'CRYPTOGRAPHY', french: 'RACINE DE MERKLE' }],
    },
    '/dictionary/en/letters/r.json': {
      lang: 'en', letter: 'r',
      entries: [{ slug: 'racine-de-merkle', title: 'MERKLE ROOT', letter: 'r', category: 'CRYPTOGRAPHY', uuid: 'u1', body: 'The Merkle root sums up every transaction of a block.', seeAlso: [] }],
    },
    '/dictionary/fr/index.json': {
      lang: 'fr',
      source: { ...author, title: 'Dictionnaire de Bitcoin' },
      entries: [{ slug: 'racine-de-merkle', title: 'RACINE DE MERKLE', letter: 'r', category: 'CRYPTOGRAPHIE', english: 'MERKLE ROOT' }],
    },
    '/dictionary/fr/letters/r.json': {
      lang: 'fr', letter: 'r',
      entries: [{ slug: 'racine-de-merkle', title: 'RACINE DE MERKLE', letter: 'r', category: 'CRYPTOGRAPHIE', uuid: 'u1', body: 'La racine de Merkle résume toutes les transactions d’un bloc.', seeAlso: [] }],
    },
  };
  const urls: string[] = [];
  t.mock.method(globalThis, 'fetch', async (url: string) => {
    urls.push(url);
    return url in packs ? new Response(JSON.stringify(packs[url]), { status: 200 }) : new Response('', { status: 404 });
  });
  const dictionaryUrls = () => urls.filter(url => url.startsWith('/dictionary/'));
  runtime.registerLearnTurnContext();

  const englishLabel = 'Bitcoin Dictionary · MERKLE ROOT (Loïc Pandul, CC BY-NC-SA 4.0, unofficial translation)';
  const en = await runtime.learnContextFor('What is a Merkle root?', { targetLanguage: 'en' });
  assert.equal(en?.label, englishLabel);
  assert.equal(en?.excerpt, 'The Merkle root sums up every transaction of a block.');
  assert.deepEqual(en?.sources, [{ kind: 'definition', label: englishLabel, path: '/learn/?definition=racine-de-merkle', attribution: 'Loïc Pandul, CC BY-NC-SA 4.0, unofficial translation' }]);
  assert.deepEqual(dictionaryUrls(), ['/dictionary/en/index.json', '/dictionary/en/letters/r.json']);

  const named = await runtime.learnContextFor('What does racine de Merkle mean exactly?', { targetLanguage: 'en' });
  assert.equal(named?.label, englishLabel);

  const fr = await runtime.learnContextFor('C’est quoi la racine de Merkle ?', { targetLanguage: 'fr' });
  assert.equal(fr?.label, 'Dictionnaire de Bitcoin · RACINE DE MERKLE (Loïc Pandul, CC BY-NC-SA 4.0)');
  assert.equal(fr?.sources?.[0]?.attribution, 'Loïc Pandul, CC BY-NC-SA 4.0');
  assert.deepEqual(dictionaryUrls().slice(2), ['/dictionary/fr/index.json', '/dictionary/fr/letters/r.json']);

  runtime.setCurrentLocale('en');
  assert.equal((await runtime.learnContextFor('What is a Merkle root?'))?.label, englishLabel);
  runtime.setCurrentLocale('fr');
  assert.equal((await runtime.learnContextFor('What is a Merkle root?'))?.label, 'Dictionnaire de Bitcoin · RACINE DE MERKLE (Loïc Pandul, CC BY-NC-SA 4.0)');
  runtime.setCurrentLocale('de');
  assert.ok((await runtime.learnContextFor('What is a Merkle root?'))?.label.startsWith('Dictionnaire de Bitcoin · '));
});

test('idle prefetch reads the current app language when it runs', async t => {
  const bundled = await build({
    stdin: {
      contents: `
        export { prefetchDictionaryIndex } from './apps/app-web/src/lib/learn/dictionary-packs.ts';
        export { setCurrentLocale } from './apps/app-web/src/i18n/translate.ts';
      `,
      resolveDir: process.cwd(), loader: 'ts',
    },
    bundle: true, write: false, platform: 'node', format: 'esm',
  });
  const runtime = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].contents).toString('base64')}`);
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  let start = () => {};
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { requestIdleCallback: (callback: () => void) => { start = callback; } },
  });
  t.after(() => {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  const urls: string[] = [];
  t.mock.method(globalThis, 'fetch', async (url: string) => {
    urls.push(url);
    return new Response(JSON.stringify({ lang: 'en', entries: [] }), { status: 200 });
  });
  runtime.setCurrentLocale('fr');
  runtime.prefetchDictionaryIndex();
  assert.deepEqual(urls, []);
  runtime.setCurrentLocale('en');
  start();
  assert.deepEqual(urls, ['/dictionary/en/index.json']);
});
