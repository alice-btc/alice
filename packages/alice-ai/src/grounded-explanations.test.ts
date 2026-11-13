import assert from 'node:assert/strict';
import test from 'node:test';
import { groundedExplanation } from './grounded-explanations.ts';

const cases = [
  ['Why do small and large payments have the same fees?', 'en', 'Transaction fees', /vB × fee rate/, /Miners select transactions and receive fees/],
  ['Pourquoi les frais sont-ils les mêmes pour un petit et un gros paiement ?', 'fr', 'Les frais de transaction', /taille virtuelle/, /ils ne paient pas/],
  ['Why is this output uneconomic to spend?', 'en', 'Dust and uneconomic outputs', /no universal/, /still pays for every input/],
  ['Pourquoi cette sortie est-elle non rentable ?', 'fr', 'Le dust et les sorties non rentables', /création/, /paie toujours chaque entrée/],
  ['Does CoinJoin guarantee anonymity?', 'en', 'CoinJoin', /anonymity set/, /merging of outputs/],
  ['Après un CoinJoin, suis-je invisible ?', 'fr', 'Comprendre CoinJoin', /motifs de montants/, /fusionner/],
  ['What can an Ark operator do with my money?', 'en', 'Payments with Ark', /not a blanket guarantee/, /before expiry/],
  ['Que peut faire un opérateur Ark ?', 'fr', 'Les paiements avec Ark', /collusion/, /voit l’activité/],
] as const;
for (const [q, lang, title, required, boundary] of cases) test(`controlled explanation: ${q}`, () => {
  const text = groundedExplanation(q, lang, `Topic: ${title}\nNotes: background`);
  assert.ok(text); assert.match(text, required); assert.match(text, boundary);
  assert.equal(groundedExplanation(q, lang, ''), null);
  assert.equal(groundedExplanation(q, lang, 'Topic: Mining'), null);
});
const all = cases.map(row => `Topic: ${row[2]}`).join('\n');
for (const q of [
  'Compare CoinJoin and Ark privacy', 'What are the current fees for a small payment?',
  'Write code to calculate fees for a small amount', 'Translate: why do small payments have the same fees?',
  'Can an Ark operator recover my wallet?', 'What can the Arkade operator do in version 2?',
  'Explain Lightning fees for small payments', 'Tell me more', 'Why is Bitcoin useful?',
  'Do not talk about CoinJoin anonymity, explain mining instead', 'Pourquoi les frais bancaires dépendent-ils du montant ?',
]) test(`unrelated or specific request stays on generation: ${q}`, () => assert.equal(groundedExplanation(q, 'en', all), null));

const history = (question: string) => [{ role: 'user' as const, content: question }, { role: 'assistant' as const, content: 'Actual earlier reply; do not infer topics from this text.' }];
test('Ark expiry explanation covers ordinary signatures without a lifetime guarantee', () => {
  const answer = groundedExplanation('If an Ark operator needs my signature for ordinary spending, can it reclaim funds after expiry?', 'en', 'Topic: Payments with Ark');
  assert.ok(answer);
  assert.match(answer, /recovery path may allow the server to reclaim/);
  assert.match(answer, /required exit steps must confirm/);
  assert.match(answer, /previous senders/);
});
test('compound conceptual Ark exit and collusion question is not mistaken for broadcasting an action', () => {
  const answer = groundedExplanation('Et une sortie unilatérale diffusée avant expiration suffit-elle ? Quel risque de collusion avec arkoor ?', 'fr', 'Topic: Entrer et sortir d’Ark', history('Quels sont les risques d’Ark ?'));
  assert.ok(answer); assert.match(answer, /simple diffusion/); assert.match(answer, /confirmées à temps/); assert.match(answer, /ancien(?:s)? émetteur/);
  assert.equal(groundedExplanation('Broadcast my Ark exit now', 'en', 'Topic: Payments with Ark'), null);
});
test('CoinJoin history and identity questions preserve the public history and known identity', () => {
  const answer = groundedExplanation('Can CoinJoin erase history or make a service forget my identity?', 'en', 'Topic: CoinJoin');
  assert.ok(answer); assert.match(answer, /earlier history is not erased/); assert.match(answer, /retains that information/);
});
test('CoinJoin merging follow-up uses the immediate user subject and honors two bullets', () => {
  const question = 'Then combining my outputs cannot hurt privacy, right? Two short bullets.';
  const answer = groundedExplanation(question, 'en', 'Topic: CoinJoin', history('Does CoinJoin hide ownership?'));
  assert.ok(answer); assert.equal(answer.split('\n').length, 2); assert.ok(answer.split('\n').every(line => line.startsWith('- ')));
  assert.match(answer, /reduce privacy/); assert.match(answer, /other information/);
  assert.equal(groundedExplanation(question, 'en', 'Topic: CoinJoin', history('What is Lightning?')), null);
});
test('dust economic follow-up does not claim funds are destroyed or guarantee future profitability', () => {
  const answer = groundedExplanation('Donc ces fonds sont définitivement perdus ?', 'fr', 'Topic: Le dust et les sorties non rentables', history('Quand une sortie est-elle non rentable ?'));
  assert.ok(answer); assert.match(answer, /ne sont pas définitivement perdus/); assert.match(answer, /sans garantie/);
});
test('dust policy follow-up separates relay policy and consensus', () => {
  const answer = groundedExplanation('So creating dust makes the entire block invalid under consensus?', 'en', 'Topic: Dust and uneconomic outputs', history('Why are small outputs uneconomic?'));
  assert.ok(answer); assert.match(answer, /does not by itself/); assert.match(answer, /satisfy consensus rules/);
});
test('explicit new subject cannot inherit a prior controlled explanation', () => {
  assert.equal(groundedExplanation('And what about Lightning privacy?', 'en', 'Topic: CoinJoin', history('What is CoinJoin?')), null);
  assert.equal(groundedExplanation('Et les frais bancaires ?', 'fr', 'Topic: CoinJoin', history('Que fait CoinJoin ?')), null);
  assert.equal(groundedExplanation('Then can I lose it?', 'en', 'Topic: CoinJoin', [{role:'assistant',content:'CoinJoin'}]), null);
});
test('numeric and unrelated compound requests are not swallowed by generic explanations', () => {
  assert.equal(groundedExplanation('Why do small payments cost the same? Calculate 200 vB at 3 sat/vB.', 'en', 'Topic: Transaction fees'), null);
  assert.equal(groundedExplanation('Explain CoinJoin privacy and its fees.', 'en', 'Topic: CoinJoin'), null);
  assert.equal(groundedExplanation('Write a script explaining Ark signatures.', 'en', 'Topic: Payments with Ark'), null);
  assert.equal(groundedExplanation('Explain Ark signatures in one sentence.', 'en', 'Topic: Payments with Ark'), null);
  assert.equal(groundedExplanation('Explain CoinJoin privacy and proof of work.', 'en', 'Topic: CoinJoin'), null);
  assert.equal(groundedExplanation('What can an Ark operator do?', 'en', 'Topic: Recovery phrase'), null);
});

test('actual English corpus titles gate their corresponding explanations', () => {
  for (const [question, title, expected] of [
    ['Does CoinJoin hide ownership?', 'Understanding CoinJoin', /anonymity set/],
    ['Can an Ark operator recover funds after expiry?', "Ark's security assumptions", /recovery path/],
  ] as const) {
    assert.match(groundedExplanation(question, 'en', `Topic: ${title}`) ?? '', expected);
    assert.equal(groundedExplanation(question, 'en', 'Topic: Recovery phrase'), null);
    assert.equal(groundedExplanation(question, 'en', `Notes: ${title}`), null);
  }
});
test('explicitly excluding live fee rates does not block a conceptual dust explanation', () => {
  const context = 'Topic: Dust and uneconomic outputs';
  const question = 'Can an output above the dust threshold cost more to spend than it is worth? Explain without quoting current fee rates.';
  assert.match(groundedExplanation(question, 'en', context) ?? '', /dust relay policy/);
  assert.equal(groundedExplanation(question + ' Also give the current fee rate.', 'en', context), null);
  assert.equal(groundedExplanation('Can dust cost more to spend? Give the current fee rate.', 'en', context), null);
  assert.match(groundedExplanation('Pourquoi une sortie est-elle non rentable ? Explique sans citer les taux de frais actuels.', 'fr', 'Topic: Le dust et les sorties non rentables') ?? '', /politique de relais/);
});


test('Ark compound follow-up answers exit conditions and collusion without replaying the overview', () => {
  const first = 'What can an Ark operator do with my money?';
  const context = "Topic: Ark's security assumptions";
  const overview = groundedExplanation(first, 'en', context)!;
  const question = 'What must be ready for a unilateral exit before that deadline, including confirmation rather than just broadcast? And separately, why can an arkoor recipient face collusion with an earlier holder?';
  const answer = groundedExplanation(question, 'en', context, [
    { role: 'user', content: first }, { role: 'assistant', content: overview }, { role: 'user', content: question },
  ]);
  assert.ok(answer);
  assert.notEqual(answer, overview);
  assert.doesNotMatch(answer, /Normal spending of an Ark VTXO|coordinates payments/);
  for (const required of [/broadcasting.*not enough/, /valid exit data/, /transaction fees/, /timelocks/, /confirm before expiry/, /previous sender/, /double-spend/, /implementation/, /not guaranteed/]) assert.match(answer, required);
  assert.ok(answer.indexOf('For the exit') < answer.indexOf('arkoor risk is separate'));
});

test('French Ark follow-up focuses on the two newly requested risks', () => {
  const context = 'Topic: Les hypothèses de sécurité d’Ark';
  const answer = groundedExplanation('Et pour éviter ça, une sortie unilatérale simplement diffusée avant l’expiration suffit-elle ? Séparément, quel risque de collusion avec arkoor ?', 'fr', context, history('La signature Ark suffit-elle à protéger après expiration ?'));
  assert.ok(answer);
  assert.doesNotMatch(answer, /Dans la voie normale|coordonne les paiements/);
  for (const required of [/simple diffusion/, /données de sortie valides/, /frais sur Bitcoin/, /timelocks/, /confirmées à temps/, /avant l’expiration/, /risque arkoor est distinct/, /double dépense/, /implémentation/, /n’est pas garantie/]) assert.match(answer, required);
});

test('Ark focused follow-ups do not add an unasked second topic', () => {
  const context = 'Topic: Payments with Ark';
  const earlier = history('What are the Ark operator risks?');
  const exit = groundedExplanation('And does broadcasting the unilateral exit before expiry suffice?', 'en', context, earlier)!;
  assert.match(exit, /confirm before expiry/);
  assert.doesNotMatch(exit, /arkoor|double-spend/);
  const collusion = groundedExplanation('And what is the arkoor collusion risk?', 'en', context, earlier)!;
  assert.match(collusion, /previous sender/);
  assert.doesNotMatch(collusion, /For the exit|timelocks/);
});

test('Ark follow-up focus requires immediate user context and matching evidence', () => {
  const q = 'What must be ready for an Ark unilateral exit before expiry?';
  const context = 'Topic: Payments with Ark';
  const standalone = groundedExplanation(q, 'en', context);
  assert.equal(groundedExplanation(q, 'en', context, [{ role: 'assistant', content: 'Ark expiry' }]), standalone);
  assert.equal(groundedExplanation(q, 'en', context, [...history('What is Ark?'), { role: 'user', content: 'What is CoinJoin?' }]), standalone);
  assert.equal(groundedExplanation(q, 'en', 'Topic: Recovery phrase', history('What is Ark?')), null);
  for (const question of ['And what about Lightning exits?', 'And does CoinJoin hide ownership?', 'And what now?']) {
    assert.equal(groundedExplanation(question, 'en', context, history('What is Ark?')), null);
  }
});

test('a broader Ark follow-up still covers its additional request', () => {
  const context = 'Topic: Payments with Ark';
  const answer = groundedExplanation('How does an Ark unilateral exit before expiry relate to the signature required for spending?', 'en', context, history('What is Ark?'));
  assert.ok(answer);
  assert.match(answer, /holder’s signature/);
  assert.match(answer, /before expiry/);
});

test('Ark trust vocabulary and inflected collusion keep existing source-gated explanations', () => {
  const source="Topic: Ark's security assumptions";
  for (const q of ['Who must I trust when using Ark?', 'What trust assumptions does Ark make?', 'À qui faire confiance pour utiliser Ark ?']) assert.ok(groundedExplanation(q,'en',source),q);
  const q='And what changes if the operator colludes with other participants?';
  const answer=groundedExplanation(q,'en',source,history('Who must I trust when using Ark?'))!;
  assert.match(answer,/previous sender/); assert.match(answer,/double-spend/); assert.doesNotMatch(answer,/Normal spending/);
  assert.equal(groundedExplanation(q,'en','Topic: Bitcoin halving',history('Who must I trust when using Ark?')),null);
  assert.equal(groundedExplanation(q,'en',source,history('How does Lightning work?')),null);
});
