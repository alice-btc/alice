#!/usr/bin/env node
// Builds the English Learn dictionary pack: an unofficial translation of the
// "Dictionnaire de Bitcoin" by Loïc Pandul (Loïc Morel), CC BY-NC-SA 4.0,
// made for Alice with the author's agreement of 2 November 2026, until the
// author's own English translation replaces it.
//
// Inputs, both in the repository:
//   apps/app-web/public/dictionary/fr/      the French pack (scripts/build-dictionary-pack.mjs)
//   data/dictionary-en/translations.json    { <uuid>: { title, body, category, frSha256 } }
// frSha256 is the SHA-256 of the French body a translation was made from, as
// the French pack stores it: when a French definition changes, its
// translation is stale and the build refuses it.
//
// Output, under apps/app-web/public/dictionary/en/:
//   index.json            every term, listed under the letter of its English title
//   letters/<a-z>.json    the definitions, filed by the letter of their slug as
//                         in the French pack, since a definition is fetched by slug
//   README.md             attribution, licence, permission and modifications
//
//   node scripts/build-dictionary-pack-en.mjs            build
//   node scripts/build-dictionary-pack-en.mjs --check    fail unless the files match a fresh build byte for byte
//
// Every input is checked before anything is written, and nothing is deleted.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENGLISH_ROOT, FRENCH_ROOT, TRANSLATIONS_FILE, buildEnglishPack, listFiles, readPack, renderPackFiles } from './dictionary-en-utils.mjs';

function main(args) {
  const check = args.includes('--check');
  const unknown = args.filter(arg => arg !== '--check');
  if (unknown.length > 0) throw new Error(`Unknown argument: ${unknown.join(' ')}. Usage: node scripts/build-dictionary-pack-en.mjs [--check]`);

  const french = readPack(FRENCH_ROOT);
  if (french.unexpected.length > 0) throw new Error(`The French pack holds unexpected files: ${french.unexpected.join(', ')}.`);
  const translations = JSON.parse(fs.readFileSync(TRANSLATIONS_FILE, 'utf8'));
  const files = renderPackFiles(buildEnglishPack(french.index, french.definitions, translations));
  const produced = new Set(files.map(([name]) => name));
  const unexpected = listFiles(ENGLISH_ROOT).filter(name => !produced.has(name));

  if (check) {
    const differing = files
      .filter(([name, content]) => {
        const file = path.join(ENGLISH_ROOT, name);
        return !fs.existsSync(file) || !fs.readFileSync(file).equals(Buffer.from(content, 'utf8'));
      })
      .map(([name]) => name);
    if (differing.length > 0 || unexpected.length > 0) {
      const lines = [...differing.map(name => `differs from a fresh build: ${name}`), ...unexpected.map(name => `not produced by the build: ${name}`)];
      throw new Error(`The English dictionary pack is not up to date:\n  ${lines.join('\n  ')}\nRun node scripts/build-dictionary-pack-en.mjs.`);
    }
    console.log(`English dictionary pack up to date: ${files.length} files.`);
    return;
  }

  if (unexpected.length > 0) {
    throw new Error(`${path.relative(process.cwd(), ENGLISH_ROOT)} holds files the build does not produce: ${unexpected.join(', ')}. Nothing was written; remove them by hand if they are obsolete.`);
  }
  fs.mkdirSync(path.join(ENGLISH_ROOT, 'letters'), { recursive: true });
  for (const [name, content] of files) fs.writeFileSync(path.join(ENGLISH_ROOT, name), content);
  const index = JSON.parse(files.find(([name]) => name === 'index.json')[1]);
  console.log(`English dictionary pack: ${index.count} definitions, ${files.length - 2} letter files, ${index.letters.length} letters in the index, built ${index.source.builtAt}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
