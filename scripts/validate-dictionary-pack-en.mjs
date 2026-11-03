#!/usr/bin/env node
// Checks the English dictionary pack against the French one, definition by
// definition: 1408 terms with the same slugs and uuids, letters, uppercase
// titles, the fixed categories, cross-references titled in English, code
// blocks and inline code byte for byte, link and image destinations, Markdown
// structure, no empty title or body, and the common French words (le, la,
// les, des, est, une, pour, avec) left in titles, prose and image text.
//
//   node scripts/validate-dictionary-pack-en.mjs           summary and every finding
//   node scripts/validate-dictionary-pack-en.mjs --json    the same report as JSON
//
// An occurrence reviewed and judged not to be French prose goes in
// REVIEWED_FRENCH_WORDS (scripts/dictionary-en-utils.mjs), with its reason.
// French words set as inline code and translated go in TRANSLATED_CODE_WORDS,
// the only inline code that may differ.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENGLISH_ROOT, FRENCH_ROOT, readPack, validateEnglishPack } from './dictionary-en-utils.mjs';

function main(args) {
  const json = args.includes('--json');
  const unknown = args.filter(arg => arg !== '--json');
  if (unknown.length > 0) throw new Error(`Unknown argument: ${unknown.join(' ')}. Usage: node scripts/validate-dictionary-pack-en.mjs [--json]`);

  const french = readPack(FRENCH_ROOT);
  const english = readPack(ENGLISH_ROOT);
  const report = validateEnglishPack({ frIndex: french.index, frDefinitions: french.definitions, enIndex: english.index, enPacks: english.packs });
  const unexpected = [...french.unexpected.map(name => `French pack: unexpected ${name}`), ...english.unexpected.map(name => `English pack: unexpected ${name}`)];
  report.errors.unshift(...unexpected);
  if (unexpected.length > 0) report.ok = false;

  if (json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`English dictionary pack: ${report.count} definitions checked against the French pack.`);
    console.log(`Errors: ${report.errors.length}`);
    for (const error of report.errors) console.log(`  ${error}`);
    console.log(`French words: ${report.findings.length} unreviewed (tolerance ${report.tolerance}), ${report.reviewedOccurrences} reviewed.`);
    for (const finding of report.findings) console.log(`  ${finding.slug} [${finding.where}] "${finding.word}": ${finding.context}`);
    for (const review of report.reviewedFindings) console.log(`  reviewed ${review.slug}: "${review.text}" (${review.reason})`);
    for (const review of report.unusedReviews) console.log(`  reviewed entry matches nothing: ${review.slug} "${review.text}"`);
    console.log(report.ok ? 'OK' : 'FAILED');
  }
  if (!report.ok) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
