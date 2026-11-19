import assert from 'node:assert/strict';
import test from 'node:test';
import type { LearnCatalogCourse, LearnCatalogTutorial } from '@alice-wallet/alice-content/src/learn-types';
import { ambiguousToolTutorials, firstRelevantLearnContext, namesTutorialTool, rankLearnCandidates, toolNames, tutorialsNamedBy, type LearnCandidate } from './learn-candidates.ts';
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

const tutorial = (category: string, slug: string, en: string, fr: string, description = ''): LearnCatalogTutorial => ({
  id: null, slug, category, subcategory: null, level: 'beginner', languages: ['en', 'fr'],
  i18n: { en: { name: en, description }, fr: { name: fr, description } },
});
const toolTutorials = [
  tutorial('wallet', 'sparrow', 'Sparrow Wallet', 'Sparrow Wallet', 'Installer, configurer et utiliser Sparrow Wallet'),
  tutorial('wallet', 'jade-plus-sparrow', 'Jade Plus - Sparrow', 'Jade Plus - Sparrow'),
  tutorial('wallet', 'coldcard-q', 'COLDCARD Q', 'COLDCARD Q'),
  tutorial('wallet', 'coldcard-seed', 'Coldcard Seed Vulnerability', 'Coldcard Seed Vulnerability'),
  tutorial('computer-security', 'keepass', 'KeePass password manager', 'KeePass gestionnaire de mots de passe'),
];
const walletCourse: LearnCatalogCourse = {
  ...course, code: 'btc102',
  i18n: {
    en: { name: 'Your first wallet', goal: 'Set up a wallet and back up its recovery phrase.', objectives: ['Install a wallet.'] },
    fr: { name: 'Ton premier portefeuille', goal: 'Installer un portefeuille et sauvegarder sa phrase de récupération.', objectives: ['Installer un portefeuille.'] },
  },
};

test('a tool name is the title word left untranslated, and not a kind of tool', () => {
  const names = toolNames(toolTutorials);
  assert.deepEqual([...names.get('wallet/sparrow')!], ['sparrow']);
  assert.deepEqual([...names.get('wallet/jade-plus-sparrow')!].sort(), ['jade', 'sparrow']);
  assert.deepEqual([...names.get('wallet/coldcard-seed')!], ['coldcard'], 'seed is vocabulary, not a tool');
  assert.deepEqual([...names.get('computer-security/keepass')!], ['keepas'], 'translated words are not names');
});

test('a tool named with a usage word finds its tutorial on that single shared word', () => {
  const ranked = rankLearnCandidates('Comment relier Sparrow à mon nœud ?', ['fr', 'en'], [walletCourse], toolTutorials);
  assert.equal(ranked[0]?.code, 'wallet/sparrow', 'the tool\'s own tutorial before one that pairs it with another');
  assert.deepEqual(ranked[0]?.toolNames, ['sparrow']);
  assert.equal(rankLearnCandidates('Comment configurer mon Coldcard ?', ['fr', 'en'], [walletCourse], toolTutorials)[0]?.code, 'wallet/coldcard-q');
  assert.equal(rankLearnCandidates('How do I set up my Coldcard?', ['en', 'fr'], [walletCourse], toolTutorials)[0]?.code, 'wallet/coldcard-q');
});

test('a named tool goes before a course that scores higher on the same subject', () => {
  const ranked = rankLearnCandidates('Comment importer un wallet sur mon Coldcard ?', ['fr', 'en'], [walletCourse], toolTutorials);
  assert.equal(ranked[0]?.code, 'wallet/coldcard-q');
  const courseRank = ranked.findIndex(item => item.code === 'btc102');
  assert.ok(courseRank > 0 && ranked[courseRank].score > ranked[0].score);
});

test('the name of a tool on its own finds the tutorial of that tool', () => {
  const linuxMint = tutorial('computer-security', 'linux-mint', 'Linux Mint', 'Linux Mint');
  const catalog = [...toolTutorials, linuxMint];
  for (const message of ['Sparrow', 'Sparrow Wallet', 'C\'est quoi Sparrow ?', 'What is Sparrow?', 'Explique Sparrow']) {
    assert.equal(rankLearnCandidates(message, ['fr', 'en'], [], catalog)[0]?.code, 'wallet/sparrow', message);
    assert.equal(namesTutorialTool(message, catalog), true, message);
  }
  assert.equal(rankLearnCandidates('Linux Mint', ['fr', 'en'], [], catalog)[0]?.code, 'computer-security/linux-mint');
  for (const message of ['What is a mint?', 'Sparrow et Electrum', 'ok', 'merci', 'seed']) {
    assert.deepEqual(rankLearnCandidates(message, ['fr', 'en'], [], catalog), [], message);
    assert.equal(namesTutorialTool(message, catalog), false, message);
  }
  assert.equal(namesTutorialTool('wallet', catalog), false, 'a kind of tool is not the name of one');
});

test('one of a tool\'s names typed on its own finds the tool, a question about the word does not', () => {
  const catalog = [...toolTutorials, tutorial('computer-security', 'linux-mint', 'Linux Mint', 'Linux Mint')];
  assert.equal(rankLearnCandidates('Mint', ['fr', 'en'], [], catalog)[0]?.code, 'computer-security/linux-mint');
  assert.equal(namesTutorialTool('Mint', catalog), true);
  assert.deepEqual(tutorialsNamedBy('Mint', catalog).part.map(item => item.slug), ['linux-mint']);
  assert.deepEqual(ambiguousToolTutorials('Mint', catalog), [], 'a single tutorial settles it');
  assert.equal(namesTutorialTool('What is a mint?', catalog), false);
});

test('a name several tutorials carry is ambiguous, one tutorial of its own settles it', () => {
  const trezor = [
    tutorial('wallet', 'passphrase-trezor', 'BIP-39 Passphrase Trezor', 'BIP-39 Passphrase Trezor'),
    tutorial('wallet', 'trezor-model-one', 'Trezor Model One', 'Trezor Model One'),
    tutorial('wallet', 'trezor-safe-3', 'Trezor Safe 3', 'Trezor Safe 3'),
    tutorial('wallet', 'trezor-shamir-backup', 'Trezor Shamir Backup', 'Trezor Shamir Backup'),
  ];
  const catalog = [...toolTutorials, ...trezor];
  assert.deepEqual(ambiguousToolTutorials('Trezor', catalog).map(item => item.slug), ['passphrase-trezor', 'trezor-model-one', 'trezor-safe-3', 'trezor-shamir-backup']);
  assert.deepEqual(ambiguousToolTutorials('trezor ?', catalog).map(item => item.slug), ['passphrase-trezor', 'trezor-model-one', 'trezor-safe-3'], 'inside a question, only the tutorials named whole');
  // "Sparrow" is the whole name of one tutorial and a part of another.
  assert.deepEqual(tutorialsNamedBy('Sparrow', catalog).whole.map(item => item.slug), ['sparrow']);
  assert.deepEqual(tutorialsNamedBy('Sparrow', catalog).part.map(item => item.slug), ['jade-plus-sparrow']);
  assert.deepEqual(ambiguousToolTutorials('Sparrow', catalog), []);
  assert.deepEqual(ambiguousToolTutorials('Shamir', catalog), [], 'one tutorial in part settles it too');
  const variations = [...catalog, tutorial('wallet', 'sparrow-multisig', 'Sparrow Wallet - Multisig', 'Sparrow Wallet - Multisig')];
  assert.deepEqual(tutorialsNamedBy('Sparrow', variations).whole.map(item => item.slug), ['sparrow', 'sparrow-multisig']);
  assert.deepEqual(ambiguousToolTutorials('Sparrow', variations), [], 'the tool\'s own tutorial stands before its variations');
  assert.equal(rankLearnCandidates('Sparrow', ['fr', 'en'], [], variations)[0]?.code, 'wallet/sparrow');
  const devices = [tutorial('wallet', 'ledger-flex', 'Ledger Flex', 'Ledger Flex'), tutorial('wallet', 'ledger-nano-s-plus', 'Ledger Nano S Plus', 'Ledger Nano S Plus')];
  assert.deepEqual(ambiguousToolTutorials('Ledger', devices).map(item => item.slug), ['ledger-flex', 'ledger-nano-s-plus'], '2 devices of one brand stay ambiguous');
  assert.deepEqual(ambiguousToolTutorials('Comment configurer mon Trezor ?', catalog), [], 'a question is not a name');
});

test('a vocabulary word with a usage word selects nothing', () => {
  assert.deepEqual(rankLearnCandidates('Comment sauvegarder ma seed ?', ['fr', 'en'], [], toolTutorials), []);
});
