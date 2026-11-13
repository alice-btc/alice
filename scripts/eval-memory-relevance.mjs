#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { loadRagEvaluationRuntime } from './rag-eval-runtime.mjs';

const args = process.argv.slice(2);
const value = flag => args.includes(flag) ? args[args.indexOf(flag) + 1] : null;
const revision = value('--baseline');
const output = value('--output');
assert.ok(revision && /^[0-9a-f]{7,40}$/.test(revision) && output, 'Require --baseline <commit hash> --output <report.json>');
const baselineCommit = execFileSync('git', ['rev-parse', `${revision}^{commit}`], { encoding: 'utf8' }).trim();
const fixtureBytes = await readFile('scripts/data/memory-relevance/profiles.json');
const fixture = JSON.parse(fixtureBytes);
const entry = "export { aliceMemoryContext, aliceMemoryRefusalReason } from './packages/alice-ai/src/alice-memory-core.ts';";
const baseline = await loadRagEvaluationRuntime(entry, { revision: baselineCommit });
const candidate = await loadRagEvaluationRuntime(entry);
const standing = new Set(['preference', 'constraint', 'requested-note']);
const useful = (item, question) => ['preference', 'constraint'].includes(item.category)
  || (item.category === 'requested-note' && item.tags.includes('general'))
  || item.tags.some(tag => question.tags.includes(tag));
const report = {
  methodology: 'Frozen synthetic profiles from the 2026-11-04 research, evaluated with their original topic annotations. No inference, embeddings or real user data. Topic tags are coarse relevance labels, not factual-answer or privacy judgements. Existing capture filters are checked unchanged; this does not validate every synthetic fact as desirable to store.',
  baselineCommit,
  candidateHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  candidateDiffSha256: createHash('sha256').update(execFileSync('git', ['diff', 'HEAD'])).digest('hex'),
  candidateSources: Object.fromEntries(await Promise.all(['alice-memory-core.ts', 'memory-relevance.ts'].map(async name => [name, createHash('sha256').update(await readFile(`packages/alice-ai/src/${name}`)).digest('hex')]))),
  fixtureSha256: createHash('sha256').update(fixtureBytes).digest('hex'),
  pairs: fixture.profiles.length * fixture.questions.length,
  partitionPolicy: '100 development pairs use even zero-based profile AND question indices; the remaining 300 form the comparison partition. Both were visible during development: the partitions are descriptive, not independent acceptance evidence.',
  strategies: {},
  partitions: {},
  details: {},
};
for (const [name, runtime] of Object.entries({ baseline, candidate })) {
  let sentCount = 0, irrelevantCount = 0, usefulCount = 0, usefulSent = 0, topicalCount = 0, topicalSent = 0, noisyPairs = 0;
  const details = [];
  for (const profile of fixture.profiles) {
    for (const item of profile.items) assert.equal(runtime.aliceMemoryRefusalReason(item.text), null, item.text);
    const memory = { version: 2, enabled: true, pausedCategories: [], items: profile.items.map((item, i) => ({
      id: String(i), category: item.category, text: item.text, createdDay: '2026-10-01', updatedDay: '2026-10-01',
    })) };
    for (const question of fixture.questions) {
      const context = runtime.aliceMemoryContext(memory, question.text);
      const selectedTexts = new Set(context.split('\n').flatMap(line => {
        const match = /^- \(noted \d{4}-\d{2}-\d{2}\) (.+)$/.exec(line);
        return match ? [match[1]] : [];
      }));
      const sent = profile.items.filter(item => selectedTexts.has(item.text));
      const relevant = profile.items.filter(item => useful(item, question));
      const irrelevant = sent.filter(item => !useful(item, question));
      const missed = relevant.filter(item => !selectedTexts.has(item.text));
      const topical = relevant.filter(item => !standing.has(item.category) || item.category === 'requested-note');
      sentCount += sent.length;
      irrelevantCount += irrelevant.length;
      usefulCount += relevant.length;
      usefulSent += relevant.length - missed.length;
      topicalCount += topical.length;
      topicalSent += topical.filter(item => selectedTexts.has(item.text)).length;
      noisyPairs += irrelevant.length > 0 ? 1 : 0;
      details.push({ profile: profile.id, question: question.id, sent: sent.length, irrelevant: irrelevant.map(item => item.text), missed: missed.map(item => item.text),
        useful: relevant.length, usefulSent: relevant.length - missed.length,
        topical: topical.length, topicalSent: topical.filter(item => selectedTexts.has(item.text)).length,
      });
    }
  }
  const ratio = (n, d) => d ? Number((n / d).toFixed(3)) : 0;
  report.strategies[name] = {
    meanSentPerPair: ratio(sentCount, report.pairs), meanIrrelevantPerPair: ratio(irrelevantCount, report.pairs),
    pairsWithAtLeastOneIrrelevant: ratio(noisyPairs, report.pairs), usefulRecall: ratio(usefulSent, usefulCount),
    topicalUsefulRecall: ratio(topicalSent, topicalCount),
  };
  report.details[name] = details;
  const developmentProfiles = new Set(fixture.profiles.filter((_, i) => i % 2 === 0).map(p => p.id));
  const developmentQuestions = new Set(fixture.questions.filter((_, i) => i % 2 === 0).map(q => q.id));
  const isDevelopment = row => developmentProfiles.has(row.profile) && developmentQuestions.has(row.question);
  report.partitions[name] = {};
  for (const [partition, rows] of Object.entries({
    development: details.filter(isDevelopment), withheld: details.filter(row => !isDevelopment(row)),
  })) {
    const sum = select => rows.reduce((total, row) => total + select(row), 0);
    report.partitions[name][partition] = {
      pairs: rows.length,
      meanIrrelevantPerPair: ratio(sum(row => row.irrelevant.length), rows.length),
      usefulRecall: ratio(sum(row => row.usefulSent), sum(row => row.useful)),
      topicalUsefulRecall: ratio(sum(row => row.topicalSent), sum(row => row.topical)),
    };
  }
}
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.table(report.strategies);
