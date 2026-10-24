// Renders the link-preview cards of Alice App: one per section, written as
// src/app/<section>/opengraph-image.png with its .alt.txt, which Next turns
// into the og:image and twitter:image tags of that section's pages.
//
// Same system as the website's card (apps/site/scripts/generate-og.mjs):
// grid, fonts, colours and layout. Each section shows its own pixel icon from
// the sidebar (src/lib/atelier-icons.ts) where the website shows the Alice
// symbol. The cards name a section only, never a transaction, an address or a
// course: a shared link must not tell what its sender was looking at.
//
// Run after changing a line below or an icon:
//   node scripts/generate-og.mjs
import { ImageResponse } from 'next/og.js';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(APP_DIR, 'public');

// The root card also serves the pages without their own (settings, privacy).
const CARDS = [
  { dir: '', icon: 'CHAT_ICON', eyebrow: 'PRIVATE AI · OPEN SOURCE', title: 'Ask Alice about Bitcoin. Your questions stay private.', url: 'app.alicebtc.com' },
  { dir: 'explorer', icon: 'EXPLORE_ICON', eyebrow: 'ALICE · EXPLORER', title: 'Follow the coins. See what the chain quietly reveals.', url: 'app.alicebtc.com/explorer' },
  { dir: 'learn', icon: 'LEARN_ICON', eyebrow: 'ALICE · LEARN', title: 'Bitcoin courses and tutorials, at your own pace.', url: 'app.alicebtc.com/learn' },
  { dir: 'playground', icon: 'PLAY_ICON', eyebrow: 'ALICE · PLAYGROUND', title: 'A real Bitcoin wallet with worthless coins. Make every mistake here.', url: 'app.alicebtc.com/playground' },
];

const SIZE = { width: 1200, height: 630 };
const GRID = 78;
const BG = '#0b1016';
const GRID_LINE = '#111922';
const PRIMARY = '#8bb8ff';
const HEADING = '#eaf1ff';

const [pixelFont, bodyFont, icons] = await Promise.all([
  readFile(join(PUBLIC, 'fonts', 'PressStart2P-Regular.ttf')),
  readFile(join(PUBLIC, 'fonts', 'terminal-grotesque.ttf')),
  readFile(join(APP_DIR, 'src', 'lib', 'atelier-icons.ts'), 'utf8'),
]);

function iconSrc(name) {
  const svg = icons.match(new RegExp(`export const ${name} = \`([^\`]+)\``))?.[1];
  if (!svg) throw new Error(`Unknown icon ${name}`);
  const sized = svg.replace('{{COLOR}}', PRIMARY).replace('width="20" height="20"', 'width="200" height="200"');
  return `data:image/svg+xml;base64,${Buffer.from(sized).toString('base64')}`;
}

const line = (style) => ({
  type: 'div',
  props: { style: { position: 'absolute', backgroundColor: GRID_LINE, ...style } },
});

const verticals = Array.from({ length: Math.floor(SIZE.width / GRID) }, (_, i) =>
  line({ left: (i + 1) * GRID, top: 0, width: 1, height: SIZE.height }),
);
const horizontals = Array.from({ length: Math.floor(SIZE.height / GRID) }, (_, i) =>
  line({ top: (i + 1) * GRID, left: 0, height: 1, width: SIZE.width }),
);

const text = (content, style) => ({ type: 'div', props: { style, children: content } });

const card = ({ icon, eyebrow, title, url }) => ({
  type: 'div',
  props: {
    style: { width: '100%', height: '100%', display: 'flex', position: 'relative', backgroundColor: BG },
    children: [
      ...verticals,
      ...horizontals,
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 72px',
            width: 880,
          },
          children: [
            text(eyebrow, { fontFamily: 'PressStart2P', fontSize: 13, color: PRIMARY, letterSpacing: 2 }),
            text(title, { fontFamily: 'TerminalGrotesque', fontSize: 62, lineHeight: 1.18, color: HEADING, marginTop: 40 }),
            text(url, { fontFamily: 'TerminalGrotesque', fontSize: 28, color: PRIMARY, marginTop: 40 }),
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' },
          children: [{ type: 'img', props: { src: iconSrc(icon), width: 200, height: 200 } }],
        },
      },
    ],
  },
});

const fonts = [
  { name: 'PressStart2P', data: pixelFont, style: 'normal' },
  { name: 'TerminalGrotesque', data: bodyFont, style: 'normal' },
];

for (const entry of CARDS) {
  const response = new ImageResponse(card(entry), { ...SIZE, fonts });
  const dir = join(APP_DIR, 'src', 'app', entry.dir);
  const out = join(dir, 'opengraph-image.png');
  await writeFile(out, Buffer.from(await response.arrayBuffer()));
  await writeFile(join(dir, 'opengraph-image.alt.txt'), entry.title);
  console.log(`wrote ${out}`);
}
