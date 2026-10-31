#!/usr/bin/env node
// Builds the Learn dictionary pack from the "Dictionnaire de Bitcoin" by Loïc
// Pandul (Loïc Morel), https://github.com/LoicPandul/Dictionnaire-de-Bitcoin,
// licensed CC BY-NC-SA 4.0.
//
// The source is pinned to one commit, so the pack in the repository is
// reproducible and the attribution names the exact text it came from. The
// script reads a checkout of that commit:
//
//   ALICE_DICTIONARY_SRC=/path/to/Dictionnaire-de-Bitcoin node scripts/build-dictionary-pack.mjs
//
// or, with no path given, makes a sparse clone of the pinned commit in a
// temporary directory (definitions only, a few megabytes).
//
// Output, under apps/app-web/public/dictionary/fr/:
//   index.json            every term: slug, title, letter, category, equivalents
//   letters/<a-z>.json    the definitions of one letter, bodies included
//   README.md             attribution, licence and the list of rewrites below
//
// What changes between the source and the pack (the licence asks that
// modifications be indicated, and the README says the same):
//   - YAML and Markdown parsed into JSON; nothing in the text is rewritten;
//   - relative image paths become absolute URLs to the pinned commit on GitHub,
//     because the images are not bundled;
//   - LaTeX blocks ($$ … $$) become fenced code blocks and inline formulas
//     ($ … $) inline code, since the Learn renderer has no formula engine;
//   - cross-references (UUIDs) are resolved to the referenced terms.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const OUTPUT_ROOT = path.join(REPO_ROOT, 'apps/app-web/public/dictionary/fr');

const SOURCE = {
  title: 'Dictionnaire de Bitcoin',
  // The pen name he publishes under; the copyright notice keeps the full name.
  author: 'Loïc Pandul',
  license: 'CC BY-NC-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  repository: 'https://github.com/LoicPandul/Dictionnaire-de-Bitcoin',
  // v1.0 of the dictionary, 1 408 definitions, 11 June 2026.
  commit: 'bab568e32351cc9f1240f49f5feedc242123d101',
};
SOURCE.definitionsBase = `${SOURCE.repository}/blob/${SOURCE.commit}/definitions/fr`;
const RAW_BASE = `https://raw.githubusercontent.com/LoicPandul/Dictionnaire-de-Bitcoin/${SOURCE.commit}/definitions/fr`;

function sourceDir() {
  const given = process.env.ALICE_DICTIONARY_SRC;
  if (given) {
    const head = execFileSync('git', ['-C', given, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    if (head !== SOURCE.commit) {
      throw new Error(`ALICE_DICTIONARY_SRC is at ${head}, the pack is pinned to ${SOURCE.commit}.`);
    }
    return given;
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'alice-dictionary-'));
  execFileSync('git', ['clone', '--quiet', '--no-checkout', '--filter=blob:none', `${SOURCE.repository}.git`, dir], { stdio: 'inherit' });
  execFileSync('git', ['-C', dir, 'sparse-checkout', 'set', 'definitions'], { stdio: 'inherit' });
  execFileSync('git', ['-C', dir, 'checkout', '--quiet', SOURCE.commit], { stdio: 'inherit' });
  return dir;
}

// The metadata files are small YAML documents: scalars, the list of
// cross-reference UUIDs, and for a few terms an `assets` list of mappings
// (image file names, which the body already references). A dedicated parser
// is not worth a dependency: top-level scalars and the UUID list are read,
// every other indented line is skipped.
function parseMetadata(text, file) {
  const meta = { cross_references: [] };
  let listKey = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, '').trimEnd();
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (/^\s/.test(line)) {
      const item = line.match(/^\s+-\s+"([^"]*)"\s*$/);
      if (item && listKey === 'cross_references') meta.cross_references.push(item[1].trim());
      continue;
    }
    const pair = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!pair) throw new Error(`Unreadable metadata line in ${file}: ${raw}`);
    const [, key, value] = pair;
    if (value === '') { listKey = key; continue; }
    listKey = null;
    meta[key] = value.replace(/^"(.*)"$/, '$1').trim();
  }
  for (const required of ['uuid', 'title', 'slug', 'category']) {
    if (!meta[required]) throw new Error(`${file} has no ${required}.`);
  }
  return meta;
}

function rewriteBody(markdown, letter, slug) {
  let text = markdown.replace(/\r\n/g, '\n').trim();
  // Display formulas on their own lines: a code block the renderer knows how
  // to show. A display formula caught inside a sentence stays inline code.
  text = text.replace(/^\$\$\s*\n([\s\S]*?)\n\$\$\s*$/gm, (_m, formula) => `\`\`\`math\n${formula.trim()}\n\`\`\``);
  text = text.replace(/^\$\$([^$\n]+)\$\$\s*$/gm, (_m, formula) => `\`\`\`math\n${formula.trim()}\n\`\`\``);
  text = text.replace(/\$\$([^$\n]+?)\$\$/g, (_m, formula) => `\`${formula.trim()}\``);
  // Inline formulas: inline code. A dollar amount ("10 $") has a space before
  // the sign and no closing sign on the same line, so it is left alone.
  text = text.replace(/\$([^$\s][^$\n]*?[^$\s]|[^$\s])\$/g, (_m, formula) => `\`${formula}\``);
  // Images live next to the definition in the repository, not in the app.
  text = text.replace(/!\[([^\]]*)\]\((\.\/)?assets\/([^)\s]+)\)/g, (_m, alt, _dot, file) => `![${alt}](${RAW_BASE}/${letter}/${slug}/assets/${file})`);
  return text;
}

function main() {
  const root = sourceDir();
  const definitionsRoot = path.join(root, 'definitions/fr');
  const letters = fs.readdirSync(definitionsRoot).filter(name => /^[a-z]$/.test(name)).sort();
  const byUuid = new Map();
  const drafts = [];

  for (const letter of letters) {
    const letterDir = path.join(definitionsRoot, letter);
    for (const slug of fs.readdirSync(letterDir).sort()) {
      const dir = path.join(letterDir, slug);
      if (!fs.statSync(dir).isDirectory()) continue;
      const metaFile = path.join(dir, 'metadata.yaml');
      const bodyFile = path.join(dir, 'definition.md');
      if (!fs.existsSync(metaFile) || !fs.existsSync(bodyFile)) continue;
      const meta = parseMetadata(fs.readFileSync(metaFile, 'utf8'), metaFile);
      if (meta.slug !== slug) throw new Error(`${metaFile}: slug "${meta.slug}" differs from its folder "${slug}".`);
      if (byUuid.has(meta.uuid)) throw new Error(`Duplicate uuid ${meta.uuid} (${slug} and ${byUuid.get(meta.uuid).slug}).`);
      const draft = {
        slug,
        title: meta.title,
        letter,
        category: meta.category,
        english: meta.english_term || undefined,
        french: meta.french_term || undefined,
        uuid: meta.uuid,
        body: rewriteBody(fs.readFileSync(bodyFile, 'utf8'), letter, slug),
        references: meta.cross_references,
      };
      byUuid.set(meta.uuid, draft);
      drafts.push(draft);
    }
  }

  const collator = new Intl.Collator('fr', { sensitivity: 'base', numeric: true });
  drafts.sort((a, b) => a.letter.localeCompare(b.letter) || collator.compare(a.title, b.title) || a.slug.localeCompare(b.slug));

  let dangling = 0;
  const definitions = drafts.map(draft => {
    const seeAlso = [];
    for (const uuid of draft.references) {
      const target = byUuid.get(uuid);
      if (!target || target.slug === draft.slug) { dangling += 1; continue; }
      if (!seeAlso.some(entry => entry.slug === target.slug)) seeAlso.push({ slug: target.slug, title: target.title });
    }
    const { references, ...rest } = draft;
    return { ...rest, seeAlso };
  });

  const builtAt = new Date().toISOString().slice(0, 10);
  const source = { ...SOURCE, builtAt };
  const index = {
    lang: 'fr',
    source,
    count: definitions.length,
    letters,
    entries: definitions.map(({ slug, title, letter, category, english, french }) => ({
      slug, title, letter, category, ...(english ? { english } : {}), ...(french ? { french } : {}),
    })),
  };

  fs.rmSync(OUTPUT_ROOT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUTPUT_ROOT, 'letters'), { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_ROOT, 'index.json'), JSON.stringify(index));
  for (const letter of letters) {
    const pack = { lang: 'fr', letter, entries: definitions.filter(entry => entry.letter === letter) };
    fs.writeFileSync(path.join(OUTPUT_ROOT, 'letters', `${letter}.json`), JSON.stringify(pack));
  }
  fs.writeFileSync(path.join(OUTPUT_ROOT, 'README.md'), readme(source, definitions.length));

  const bytes = fs.readdirSync(path.join(OUTPUT_ROOT, 'letters')).reduce((sum, file) => sum + fs.statSync(path.join(OUTPUT_ROOT, 'letters', file)).size, 0);
  console.log(`Dictionary pack: ${definitions.length} definitions, ${letters.length} letters, index ${(fs.statSync(path.join(OUTPUT_ROOT, 'index.json')).size / 1024).toFixed(0)} KB, letters ${(bytes / 1024).toFixed(0)} KB.`);
  if (dangling > 0) console.log(`${dangling} cross-reference(s) pointed at no term and were dropped.`);
  console.log(`Source commit ${source.commit}, built ${builtAt}.`);
}

function readme(source, count) {
  return `# Dictionnaire de Bitcoin, Learn pack

This folder holds the ${count} definitions of the *Dictionnaire de Bitcoin* by
${source.author}, as static JSON for the Learn section of Alice App.
Copyright (c) 2024 Loïc Morel (Pandul), the notice the work is supplied with.

- Source: ${source.repository}, commit \`${source.commit}\`, built ${source.builtAt}.
- Licence: ${source.license}, ${source.licenseUrl}. The text is the author's;
  Alice reproduces it with attribution and does not rewrite it.
- Modifications, so that the licence's notice is kept: the YAML metadata and
  Markdown bodies were parsed into JSON; relative image paths were replaced by
  absolute URLs to the same images at the source commit; LaTeX blocks and
  inline formulas were turned into code blocks and inline code; the
  cross-references given as UUIDs were resolved to the terms they name.
  Nothing else in the definitions was changed.

Rebuild with \`node scripts/build-dictionary-pack.mjs\` (see that script for
the pinned commit). Do not edit these files by hand.
`;
}

main();
