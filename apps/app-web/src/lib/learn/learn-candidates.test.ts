import assert from 'node:assert/strict';
import test from 'node:test';
import type { LearnCatalogCourse, LearnCatalogTutorial } from '@alice-wallet/alice-content/src/learn-types';
import { firstRelevantLearnContext, rankLearnCandidates, type LearnCandidate } from './learn-candidates.ts';
import { conceptsIn, conceptAffinity, describeLearnResource, LEARN_CONCEPTS, relatedConcepts } from './concept-map.ts';
import { pickChapter } from './turn-context-score.ts';

const course: LearnCatalogCourse = {
  code: 'lnp201', courseId: null, topic: 'protocol', type: 'theory', level: 'beginner', hours: 1,
  languages: ['en', 'fr'], chapterCount: {}, quizCount: {},
  i18n: {
    en: { name: 'Lightning Network Theory', goal: 'Understand payment channels and routing.', objectives: ['Learn about invoices and liquidity.'] },
    fr: { name: 'Le réseau Lightning', goal: 'Comprendre les canaux de paiement et le routage.', objectives: ['Comprendre les factures et la liquidité.'] },
  },
};
const smoke: LearnCatalogTutorial = {
  id: null, slug: 'smoke-machine', category: 'business', subcategory: null, level: 'intermediate', languages: ['en', 'fr'],
  i18n: {
    en: { name: 'Lightning Smoke Machine', description: 'Trigger a smoke machine with a Lightning payment via ESP32.' },
    fr: { name: 'Machine à fumée Lightning', description: 'Déclencher une machine à fumée avec un paiement Lightning.' },
  },
};
const candidate = (code: string): LearnCandidate => ({ code, kind: 'course', title: code, score: 1, relation: 'explains', concepts: [] });

test('general explanations prefer a concept explanation while practical requests retain tutorials', () => {
  assert.equal(rankLearnCandidates('Explain how a Lightning payment works for my level.', ['en', 'fr'], [course], [smoke])[0]?.code, 'lnp201');
  assert.equal(rankLearnCandidates('Explique le fonctionnement des paiements Lightning.', ['fr', 'en'], [course], [smoke])[0]?.code, 'lnp201');
  assert.equal(rankLearnCandidates('How can I build a smoke machine triggered by a Lightning payment?', ['en'], [course], [smoke])[0]?.code, 'business/smoke-machine');
  assert.equal(rankLearnCandidates('Comment déclencher une machine à fumée avec Lightning ?', ['fr'], [course], [smoke])[0]?.code, 'business/smoke-machine');
  assert.deepEqual(rankLearnCandidates('What is the weather forecast?', ['en', 'fr'], [course], [smoke]), []);
  assert.deepEqual(rankLearnCandidates('bitcoin', ['en'], [course], [smoke]), []);
});

test('concept edges carry literal metadata evidence, typed purpose and one-hop relations', () => {
  const explanation = describeLearnResource('course', 'explains', { title: 'Lightning network', objectives: 'Invoices and payment channels' });
  const definition = describeLearnResource('definition', 'defines', { title: 'INVOICE' });
  const application = describeLearnResource('tutorial', 'applies', { description: 'Pay a Lightning invoice to trigger a machine' });
  assert.ok(explanation.some(edge => edge.conceptId === 'lightning' && edge.evidence.field === 'title'));
  assert.ok(definition.some(edge => edge.relation === 'defines' && edge.conceptId === 'invoice'));
  assert.ok(application.some(edge => edge.relation === 'applies' && edge.conceptId === 'lightning'));
  assert.ok(conceptAffinity('What is an invoice?', definition).score > conceptAffinity('What is an invoice?', application).score);
  assert.deepEqual(conceptsIn('facture et liquidité'), ['invoice', 'liquidity']);
  assert.ok(relatedConcepts(['lightning']).includes('routing'));
  assert.ok(!relatedConcepts(['lightning']).includes('transactions'), 'no recursive graph walk');
  assert.equal(conceptAffinity('Lightning', describeLearnResource('adjacent', 'explains', { title: 'Transaction fees' })).direct, 0);
  const ids = new Set(LEARN_CONCEPTS.map(concept => concept.id));
  assert.equal(ids.size, LEARN_CONCEPTS.length);
  assert.ok(LEARN_CONCEPTS.every(concept => concept.related.every(id => ids.has(id))));
});

test('course chapters may explain Lightning through channels but still need relevant emitted prose', () => {
  const base = { code: 'lnp201', lang: 'en', commit: 'fixture', name: 'Lightning', goal: '', objectives: [], assetBase: '', videos: {}, intro: '' };
  const chapter = (title: string, markdown: string) => ({ title, markdown, chapterId: null, videoIds: [] });
  const pack = { ...base, parts: [{ title: '', partId: null, chapters: [
    chapter('Lightning events', 'People gather at an event with music and a smoke machine.'),
    chapter('Payment channels', 'Lightning payments update balances in payment channels. A route needs liquidity in the correct direction.'),
  ] }] };
  assert.equal(pickChapter('Explain how a Lightning payment works for my level.', pack)?.title, 'Payment channels');
  assert.equal(pickChapter('Lightning quantum evaporation', pack), null);
  assert.equal(pickChapter('Difference between Lightning payments and credit cards?', pack), null);
});

test('rejected and failed candidates do not hide a valid later excerpt', async () => {
  const calls: string[] = [];
  const result = await firstRelevantLearnContext([candidate('rejected'), candidate('failed'), candidate('valid')], async item => {
    calls.push(item.code);
    if (item.code === 'rejected') return null;
    if (item.code === 'failed') throw new Error('unavailable pack');
    return 'relevant source excerpt';
  });
  assert.equal(result, 'relevant source excerpt');
  assert.deepEqual(calls, ['rejected', 'failed', 'valid']);
});

test('ranking wins over response speed and no fourth candidate is fetched', async () => {
  const calls: string[] = [];
  const result = await firstRelevantLearnContext([candidate('best'), candidate('fast'), candidate('third'), candidate('fourth')], async item => {
    calls.push(item.code);
    if (item.code === 'best') await new Promise(resolve => setTimeout(resolve, 5));
    return item.code;
  });
  assert.equal(result, 'best');
  assert.equal(calls.length, 3);
  assert.ok(!calls.includes('fourth'));
});

test('a stalled higher candidate is bounded and its fetch is aborted before using a valid lower one', async () => {
  let stalledSignal: AbortSignal | undefined;
  const result = await firstRelevantLearnContext([candidate('stalled'), candidate('valid')], async (item, signal) => {
    if (item.code === 'stalled') { stalledSignal = signal; return new Promise<never>(() => {}); }
    return 'valid';
  }, 15);
  assert.equal(result, 'valid');
  assert.equal(stalledSignal?.aborted, true);
});
