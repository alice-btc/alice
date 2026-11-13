import assert from 'node:assert/strict';
import test from 'node:test';
import { effectiveTemperature, type AIBackend, type SendMessageOptions } from './ai-backend.ts';
import { answerRuleNoteIdsIn, answerRuleNoteIdsOnSubject, answerRulesBlock, withAnswerRuleCorrections } from './answer-rules.ts';
import { GROUNDED_TEMPERATURE_CAP, generateLanguageChecked } from './language-generation.ts';

// Sentences taken from answers the checks must reject. They pin known
// failures; they do not measure unseen phrasings.
const OBSERVED: readonly { id: string; notes: string[]; language: 'en' | 'fr'; text: string }[] = [
  { id: 'lightning-channel-identity', notes: ['lightning-payment-privacy'], language: 'en',
    text: 'While individual payments stay off-chain, opening and closing channels require on-chain transactions that reveal your identity and funds.' },
  { id: 'lightning-route-hints-path', notes: ['lightning-invoice-contents'], language: 'en',
    text: 'Additionally, the invoice contains routing hints that can help observers trace the path your payment will take.' },
  { id: 'lightning-invoice-edit', notes: ['lightning-invoice-contents'], language: 'en',
    text: 'Would you like to know how to obfuscate the invoice text further before posting it?' },
  { id: 'lightning-invoice-direction', notes: ['lightning-payment-mechanics'], language: 'en',
    text: 'A Lightning payment moves money instantly. To send, you give the recipient an invoice.' },
  { id: 'lightning-failure-on-chain', notes: ['lightning-payment-mechanics'], language: 'en',
    text: 'The payment only appears on the blockchain if the route fails or if the channel is closed.' },
  { id: 'issuance-fees-new-coins', notes: ['bitcoin-issuance-validation'], language: 'en',
    text: 'The total issuance cannot exceed the sum of these two values.' },
  { id: 'signature-reveals-change', notes: ['transaction-inputs-outputs'], language: 'en',
    text: 'What remains unknown is exactly which specific output in a complex transaction belongs to you versus your change, as an observer cannot deduce this just by looking at the order of outputs without verifying the signatures on the inputs.' },
  { id: 'alice-app-key-check', notes: [], language: 'fr',
    text: "Alice App peut t'aider à vérifier si tes clés permettent de signer une sortie, mais ne peut pas accélérer la transaction elle-même." },
];

for (const row of OBSERVED) {
  test(`observed claim triggers ${row.id}`, () => {
    const result = withAnswerRuleCorrections(row.text, row.language, row.notes);
    assert.ok(result.applied.includes(row.id), `${row.id} did not fire: ${result.applied.join(',')}`);
  });
}

const CORRECT: readonly { notes: string[]; language: 'en' | 'fr'; text: string }[] = [
  { notes: ['lightning-payment-privacy'], language: 'en', text: 'Opening a channel publishes an on-chain transaction that can link your node to those funds, but it does not by itself reveal your identity.' },
  { notes: ['lightning-payment-privacy'], language: 'fr', text: "Ouvrir un canal publie une transaction on-chain qui peut relier ton nœud à ces fonds, sans révéler à elle seule ton identité." },
  { notes: ['lightning-invoice-contents'], language: 'en', text: 'Route hints describe the last hops toward the recipient, not the full path your payment will take.' },
  { notes: ['lightning-invoice-contents'], language: 'en', text: 'If you edit or hide part of the invoice, it becomes invalid and can no longer be paid.' },
  { notes: ['lightning-invoice-contents'], language: 'fr', text: 'Une facture modifiée ne peut plus être payée : sa signature ne correspond plus.' },
  { notes: ['lightning-payment-mechanics'], language: 'en', text: 'The recipient creates an invoice and gives it to you; your wallet then looks for a route.' },
  { notes: ['lightning-payment-mechanics'], language: 'en', text: 'If routing fails, the payment does not move on-chain automatically; the wallet may retry or report the failure.' },
  { notes: ['lightning-payment-mechanics'], language: 'fr', text: "Le destinataire te donne une facture, puis ton portefeuille cherche un chemin. Si le routage échoue, rien n'est envoyé on-chain automatiquement." },
  { notes: ['bitcoin-issuance-validation'], language: 'en', text: 'The miner may claim the subsidy, which is new issuance, plus the fees, which are existing bitcoins transferred from the included transactions.' },
  { notes: ['bitcoin-issuance-validation'], language: 'fr', text: 'La subvention crée de nouveaux bitcoins ; les frais sont des bitcoins existants transférés au mineur.' },
  { notes: ['transaction-inputs-outputs'], language: 'en', text: 'Input signatures only prove the right to spend those inputs; they do not reveal which output is change.' },
  { notes: ['transaction-inputs-outputs'], language: 'fr', text: "Les signatures prouvent seulement le droit de dépenser les entrées ; elles ne montrent pas quelle sortie est la monnaie." },
  { notes: [], language: 'en', text: 'Alice App can explain how to check which keys your wallet uses, but you do this in your own wallet.' },
  { notes: [], language: 'fr', text: 'Alice App ne peut pas vérifier tes clés ni signer de transaction.' },
];

test('correct statements of the same facts trigger none of the checks', () => {
  for (const row of CORRECT) {
    const result = withAnswerRuleCorrections(row.text, row.language, row.notes);
    assert.deepEqual(result.applied, [], `${row.text} -> ${result.applied.join(',')}`);
  }
});

test('the inputs/outputs rule follows both transaction notes in both languages', () => {
  for (const title of ['Les sorties d’une transaction', 'The outputs of a transaction', 'Les entrées d’une transaction', 'The inputs of a transaction']) {
    assert.deepEqual(answerRuleNoteIdsIn(`Topic: ${title}`), ['transaction-inputs-outputs']);
  }
  assert.deepEqual(answerRuleNoteIdsOnSubject(['transaction-inputs-outputs'], 'Explain transaction inputs and outputs.'), ['transaction-inputs-outputs']);
  assert.match(answerRulesBlock(['transaction-inputs-outputs'], 'en'), /not an output/);
  assert.match(answerRulesBlock(['transaction-inputs-outputs'], 'fr'), /ne sont pas une sortie/);
});

test('added facts stay inside the bounded rule block, including CPFP with RBF', () => {
  for (const language of ['en', 'fr'] as const) {
    assert.match(answerRulesBlock(['child-pays-for-parent'], language), /÷/);
    assert.match(answerRulesBlock(['lightning-invoice-contents'], language), language === 'en' ? /Route hints are optional/ : /indices de routage sont facultatifs/);
    assert.match(answerRulesBlock(['lightning-payment-privacy'], language), language === 'en' ? /does not by itself reveal a real-world identity/ : /sans révéler à lui seul une identité civile/);
    const combined = answerRulesBlock(['replace-by-fee', 'child-pays-for-parent'], language);
    assert.match(combined, /÷/);
    assert.match(combined, language === 'en' ? /Recipient addresses or output amounts/ : /Ni les adresses destinataires ni leurs montants/);
  }
});

test('a grounded turn caps the preset temperature; an override still wins', () => {
  assert.equal(effectiveTemperature(0.7), 0.7);
  assert.equal(effectiveTemperature(0.7, { temperatureCap: 0.3 }), 0.3);
  assert.equal(effectiveTemperature(0.2, { temperatureCap: 0.3 }), 0.2);
  assert.equal(effectiveTemperature(0.7, { temperatureCap: 0.3, temperatureOverride: 0.1 }), 0.1);
});

function backend(type: AIBackend['type'], answers: string[], seen: SendMessageOptions[]): AIBackend {
  let index = 0;
  return {
    type,
    async init() {},
    status: () => ({ state: 'ready' }),
    async sendMessage(_messages, onChunk, options) {
      seen.push(options ?? {});
      const content = answers[index++] ?? answers.at(-1) ?? '';
      onChunk?.(content);
      return { content, truncated: false };
    },
    async dispose() {},
  };
}

const GROUNDED_HISTORY = [
  { role: 'system' as const, content: '[Retrieved knowledge]\nTopic: Understanding Lightning\nNotes: Short answer' },
  { role: 'user' as const, content: 'Explain how a Lightning payment works.' },
];
const WRONG = 'A Lightning payment moves through channels. To send, you give the recipient an invoice and your wallet finds a route.';
const RIGHT = 'A Lightning payment moves through channels. The recipient gives you an invoice and your wallet looks for a route.';

test('an on-device answer that contradicts a rule is generated once more at low temperature', async () => {
  const seen: SendMessageOptions[] = [];
  const result = await generateLanguageChecked({ backend: backend('local', [WRONG, RIGHT], seen), history: GROUNDED_HISTORY, allowContinuation: false, targetLanguage: 'en' });
  assert.equal(result.text, RIGHT);
  assert.equal(seen.length, 2);
  assert.equal(seen[0].temperatureCap, GROUNDED_TEMPERATURE_CAP);
  assert.equal(seen[0].temperatureOverride, undefined);
  assert.equal(seen[1].temperatureOverride, 0.1);
  assert.equal(seen[1].strictLanguageRetry, false);
  assert.deepEqual(result.answerRuleRetry, ['lightning-invoice-direction']);
  assert.deepEqual(result.answerRuleCorrections, []);
});

test('a retry that repeats the claim is withheld; no third generation', async () => {
  const seen: SendMessageOptions[] = [];
  const result = await generateLanguageChecked({ backend: backend('custom', [WRONG, WRONG], seen), history: GROUNDED_HISTORY, allowContinuation: false, targetLanguage: 'en' });
  assert.equal(seen.length, 2);
  assert.match(result.text, /couldn't produce a reliable answer/);
  assert.deepEqual(result.answerRuleCorrections, []);
  assert.deepEqual(result.answerRuleFailure, ['lightning-invoice-direction']);
});

test('Private Cloud keeps its preset and appends the correction without regenerating', async () => {
  const seen: SendMessageOptions[] = [];
  const result = await generateLanguageChecked({ backend: backend('cloud', [WRONG], seen), history: GROUNDED_HISTORY, allowContinuation: false, targetLanguage: 'en' });
  assert.equal(seen.length, 1);
  assert.match(result.text, /Correction: in a usual Lightning payment/);
  assert.equal(result.answerRuleRetry, undefined);
});

test('an ungrounded turn is not capped', async () => {
  const seen: SendMessageOptions[] = [];
  await generateLanguageChecked({ backend: backend('local', ['Hello! How can I help you with Bitcoin today?'], seen), history: [{ role: 'user', content: 'Hello' }], allowContinuation: false, targetLanguage: 'en' });
  assert.equal(seen[0].temperatureCap, undefined);
});

test('a rule retry that drifts into another language withholds the rejected first answer', async () => {
  const seen: SendMessageOptions[] = [];
  const result = await generateLanguageChecked({
    backend: backend('local', [WRONG, 'Un paiement Lightning passe par des canaux et le destinataire fournit la facture au payeur.'], seen),
    history: GROUNDED_HISTORY, allowContinuation: false, targetLanguage: 'en',
  });
  assert.equal(seen.length, 2);
  assert.match(result.text, /couldn't produce a reliable answer/);
  assert.deepEqual(result.answerRuleFailure, ['lightning-invoice-direction']);
  assert.doesNotMatch(result.text, /you give the recipient/);
});
