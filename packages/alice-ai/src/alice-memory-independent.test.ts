import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { aliceMemoryContext, type AliceMemoryCategory } from './alice-memory-core.ts';

type Case = { id: string; question: string; items: { id: string; category: AliceMemoryCategory; text: string; relevant: boolean }[] };
const fixture = JSON.parse(readFileSync(new URL('../../../scripts/data/memory-relevance/independent-cases-2026-11-06.json', import.meta.url), 'utf8')) as { cases: Case[] };

for (const row of fixture.cases) {
  const context = () => aliceMemoryContext({ version: 2, enabled: true, pausedCategories: [],
    items: row.items.map(item => ({ ...item, createdDay: '2026-10-01', updatedDay: '2026-10-01' })),
  }, row.question);
  test(`independent memory ${row.id}: excludes distractors`, () => {
    const result = context();
    for (const item of row.items.filter(item => !item.relevant)) {
      assert.ok(!result.includes(item.text), `Unrelated memory: ${item.text}`);
    }
    if (row.items.every(item => !item.relevant)) assert.equal(result, '');
  });
  test(`independent memory ${row.id}: retrieves useful context`, () => {
    const result = context();
    for (const item of row.items.filter(item => item.relevant)) {
      assert.ok(result.includes(item.text), `Missing useful memory: ${item.text}`);
    }
  });
}
