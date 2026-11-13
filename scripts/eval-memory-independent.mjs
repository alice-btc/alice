#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { loadRagEvaluationRuntime } from './rag-eval-runtime.mjs';

const outputIndex = process.argv.indexOf('--output');
assert.ok(outputIndex >= 0 && process.argv[outputIndex + 1], 'Require --output <report.json>');
const fixtureBytes = await readFile(new URL('./data/memory-relevance/independent-cases-2026-11-06.json', import.meta.url));
const fixture = JSON.parse(fixtureBytes);
const { aliceMemoryContext, aliceMemoryRefusalReason } = await loadRagEvaluationRuntime(
  "export { aliceMemoryContext, aliceMemoryRefusalReason } from './packages/alice-ai/src/alice-memory-core.ts';",
);
const details = fixture.cases.map(row => {
  const items = row.items.map(item => ({ ...item, createdDay: '2026-10-01', updatedDay: '2026-10-01' }));
  // Test the selection of already-stored synthetic facts. Also expose capture
  // refusals: a successful selection is not permission to store the fact.
  const context = aliceMemoryContext({ version: 2, enabled: true, pausedCategories: [], items }, row.question);
  const lines = new Set(context.split('\n').flatMap(line => {
    const match = /^- \(noted \d{4}-\d{2}-\d{2}\) (.+)$/.exec(line);
    return match ? [match[1]] : [];
  }));
  const selected = items.filter(item => lines.has(item.text));
  const eligible = items.filter(item => aliceMemoryRefusalReason(item.text) === null);
  const eligibleUseful = eligible.filter(item => item.relevant);
  return {
    id: row.id, question: row.question,
    eligibleUseful: eligibleUseful.length,
    eligibleUsefulSent: eligibleUseful.filter(item => lines.has(item.text)).length,
    useful: items.filter(item => item.relevant).length,
    usefulSent: selected.filter(item => item.relevant).length,
    irrelevant: selected.filter(item => !item.relevant).map(item => item.id),
    missed: items.filter(item => item.relevant && !lines.has(item.text)).map(item => item.id),
    captureRefusals: items.flatMap(item => {
      const reason = aliceMemoryRefusalReason(item.text);
      return reason ? [{ id: item.id, reason }] : [];
    }),
  };
});
const sum = fn => details.reduce((total, row) => total + fn(row), 0);
const report = {
  methodology: fixture.methodology,
  fixtureSha256: createHash('sha256').update(fixtureBytes).digest('hex'),
  candidateSources: Object.fromEntries(await Promise.all(['alice-memory-core.ts', 'memory-relevance.ts'].map(async name => [
    name, createHash('sha256').update(await readFile(new URL(`../packages/alice-ai/src/${name}`, import.meta.url))).digest('hex'),
  ]))),
  cases: details.length,
  exactCases: sum(row => row.missed.length === 0 && row.irrelevant.length === 0 ? 1 : 0),
  useful: sum(row => row.useful), usefulSent: sum(row => row.usefulSent),
  usefulRecall: sum(row => row.usefulSent) / sum(row => row.useful),
  eligibleUseful: sum(row => row.eligibleUseful),
  eligibleUsefulSent: sum(row => row.eligibleUsefulSent),
  eligibleUsefulRecall: sum(row => row.eligibleUsefulSent) / sum(row => row.eligibleUseful),
  irrelevant: sum(row => row.irrelevant.length),
  meanIrrelevantPerQuestion: sum(row => row.irrelevant.length) / details.length,
  captureRefusals: sum(row => row.captureRefusals.length),
  details,
};
await writeFile(process.argv[outputIndex + 1], `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, details: details.filter(row => row.missed.length || row.irrelevant.length || row.captureRefusals.length) }, null, 2));
