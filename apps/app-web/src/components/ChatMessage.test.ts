import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { build } from 'esbuild';

// The bubble is rendered for real, with the app's own dictionaries and term
// links. The chat provider and the Next router are stood in for, and the
// alice-ai package is cut down to what this tree calls, so the bundle stops
// short of the local models.
const fromAliceAi = (file: string, names: string) => `export { ${names} } from '${resolve('packages/alice-ai/src', file)}';`;
const STUBS: Record<string, string> = {
  'next/navigation': 'export const useRouter = () => ({ push() {} });',
  '@alice-wallet/alice-ai': [
    fromAliceAi('language-policy.ts', 'detectTextLanguage'),
    fromAliceAi('languages.ts', 'isSupportedLanguage, languageFromLocale'),
    fromAliceAi('ai-preferences.ts', 'getAppLanguage, setAppLanguage, currentInterfaceLanguage, subscribeLanguagePreferences'),
    fromAliceAi('tauri-runtime.ts', 'isTauriMobile'),
    'export const useChat = () => ({ editMessage() {}, retryWithPrivateCloud() {}, busy: false });',
  ].join('\n'),
};

async function renderChatMessage(): Promise<(props: Record<string, unknown>) => string> {
  const bundled = await build({
    stdin: {
      contents: `
        import { createElement } from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import { ChatMessage } from './apps/app-web/src/components/ChatMessage.tsx';
        export const render = props => renderToStaticMarkup(createElement(ChatMessage, props));
      `,
      resolveDir: process.cwd(), loader: 'ts',
    },
    bundle: true, write: false, platform: 'node', format: 'esm', jsx: 'automatic',
    tsconfig: resolve('apps/app-web/tsconfig.json'),
    logLevel: 'silent',
    // react-dom/server is CommonJS and requires Node builtins at run time.
    banner: { js: `import { createRequire } from 'node:module'; const require = createRequire(${JSON.stringify(`${process.cwd()}/`)});` },
    plugins: [{
      name: 'chat-message-stubs',
      setup(api) {
        api.onResolve({ filter: /^(next\/navigation|@alice-wallet\/alice-ai)$/ }, args => ({ path: args.path, namespace: 'stub' }));
        api.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({ contents: STUBS[args.path], loader: 'ts', resolveDir: process.cwd() }));
      },
    }],
  });
  const runtime = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].contents).toString('base64')}`);
  return runtime.render;
}
const chatMessage = renderChatMessage();

/** The inner HTML of the first element whose opening tag matches `open`. */
function innerHtml(markup: string, open: RegExp): string {
  const start = markup.search(open);
  assert.notEqual(start, -1, `no element matching ${open}`);
  const tags = /<(\/?)[a-z0-9]+[^>]*?(\/?)>/g;
  tags.lastIndex = start;
  let depth = 0;
  for (let tag = tags.exec(markup); tag; tag = tags.exec(markup)) {
    if (tag[2]) continue;
    depth += tag[1] ? -1 : 1;
    if (depth === 0) return markup.slice(markup.indexOf('>', start) + 1, tag.index);
  }
  assert.fail(`unclosed element at ${start}`);
}

const ENGLISH_REPLY = 'The seed phrase is the backup of your wallet. Write it down and keep it offline, never in a photo.';
const FRENCH_QUESTION = 'Comment sauvegarder ma phrase de récupération sans la perdre ?';

test('an English reply in the French app carries lang="en" on its text, not on the interface notices', async () => {
  const render = await chatMessage;
  const markup = render({
    lang: 'fr',
    message: { id: 'a1', role: 'assistant', content: ENGLISH_REPLY, time: new Date(), truncated: true },
  });
  const text = innerHtml(markup, /<div class="flex flex-col gap-1" lang="en">/);
  assert.match(text, /The seed phrase is the backup/);
  // The truncation notice and the action row stay in the interface's French.
  assert.doesNotMatch(text, /inhabituellement longue/);
  assert.match(markup, /Cette réponse est inhabituellement longue/);
  assert.match(markup, /title="Modifier"/);
  assert.equal(markup.match(/ lang="/g)?.length, 1);
});

test('a French question carries lang="fr" on the question alone, whatever its attachment says', async () => {
  const render = await chatMessage;
  const markup = render({
    lang: 'en',
    message: {
      id: 'u1', role: 'user', time: new Date(),
      content: `${FRENCH_QUESTION}\n\n[Attached on-chain context, identified mode]\nThe block has 2,000 transactions and the fee rate is high today.`,
    },
  });
  const question = innerHtml(markup, /<p [^>]*lang="fr">/);
  assert.match(question, /Comment sauvegarder/);
  assert.doesNotMatch(question, /fee rate/);
  assert.equal(markup.match(/ lang="/g)?.length, 1);
});

test('a bubble whose language is unclear carries no lang attribute', async () => {
  const render = await chatMessage;
  const markup = render({ lang: 'fr', message: { id: 'u2', role: 'user', content: 'ok', time: new Date() } });
  assert.match(markup, />ok</);
  assert.doesNotMatch(markup, / lang="/);
});
