import assert from 'node:assert/strict';
import test from 'node:test';
import { feeCalculation, hasFeeCalculationParameters } from './fee-calculation.ts';
const clean = (s: string | null) => s?.replace(/[\u202f\u00a0]/g, ' ');
const en = 'A hypothetical Bitcoin transaction is 180 vB and uses a fee rate of 12 sat/vB. What is its total fee, and would sending a larger amount necessarily change that fee if its virtual size stayed the same?';
const fr = 'Pour une transaction Bitcoin hypothétique de 140 vB, avec un taux de 20 sat/vB, combien de frais paierait-on ? Explique brièvement le calcul.';
const user = (content: string) => ({ role: 'user', content });
test('explicit values and amount independence are answered together', () => {
  assert.match(feeCalculation(en, 'en')!, /2,160 sats/);
  assert.match(feeCalculation(en, 'en')!, /larger amount does not change/);
  assert.match(clean(feeCalculation(fr, 'fr'))!, /140 vB × 20 sat\/vB = 2 800 sats/);
});
test('follow-up reuses user rate and respects calculation-only format', () => {
  const q = 'Et pour 220 vB au même taux ? Juste le calcul et le résultat.';
  assert.equal(clean(feeCalculation(q, 'fr', [user(fr), { role: 'assistant', content: 'Incorrect model rate: 999 sat/vB' }, user(q)])), '220 vB × 20 sat/vB = 4 400 sats.');
});
test('half-rate follow-up retains size and produces one sentence', () => {
  assert.equal(feeCalculation('And at half that rate, with the same size? One sentence.', 'en', [user(en)]), '180 vB × 6 sat/vB = 1,080 sats.');
});
test('other values and decimal rates are computed rather than looked up', () => {
  assert.match(feeCalculation('Calculate the fee for 207 vB at 2.5 sat/vB.', 'en')!, /517.5 sats/);
  assert.match(clean(feeCalculation('Calcule les frais pour 120 vB à 3,25 sat/vB.', 'fr'))!, /390 sats/);
});
test('marginal input arithmetic is distinct from total fee and dust policy', () => {
  const q = "Supposons une sortie de 1 000 satoshis, acceptée par la politique dust utilisée ici. Si l'entrée nécessaire pour la dépenser ajoute 68 vB à une transaction, à un taux hypothétique de 20 sat/vB, son coût marginal dépasse-t-il sa valeur ? Est-ce la même chose que du dust ?";
  const answer = clean(feeCalculation(q, 'fr'))!;
  assert.match(answer, /1 360 sats/); assert.match(answer, /dépasse.*1 000 sats/);
  assert.match(answer, /pas le coût total/); assert.match(answer, /distincte/);
});
test('topic changes and model-only numeric history cannot supply missing values', () => {
  const q = 'And 220 vB at the same rate?';
  assert.equal(feeCalculation(q, 'en', [user(en), user('Explain CoinJoin privacy.')]), null);
  assert.equal(feeCalculation(q, 'en', [{ role: 'assistant', content: en }]), null);
  assert.equal(feeCalculation(q, 'en'), null);
});
test('ambiguous, malformed, live and unrelated requests fall back', () => {
  for (const q of [
    'Calculate fees for 100 vB or 200 vB at 2 sat/vB.',
    'Calculate fees for 100 vB at 2 sat/vB or 3 sat/vB.',
    'Calculate fees for -100 vB at 2 sat/vB.',
    'Calculate fees for 100 vB at -2 sat/vB.',
    'Calculate fees for 1e3 vB at 2 sat/vB.',
    'Calculate fees for 100.5 vB at 2 sat/vB.',
    'Calculate fees for 0 vB at 2 sat/vB.',
    'Translate: calculate fees for 100 vB at 2 sat/vB.',
    'What is the current rate for 100 vB? Use 2 sat/vB.',
    'Explain Lightning fees for 100 vB at 2 sat/vB.',
    'For 100 vB at 2 sat/vB, when will this confirm?',
  ]) assert.equal(feeCalculation(q, 'en'), null, q);
});
test('multi-step arithmetic uses user-supplied updates and stops at an unrelated turn', () => {
  const half = 'And at half that rate, with the same size?';
  assert.match(feeCalculation('And 300 vB at the same rate?', 'en', [user(en), user(half)])!, /1,800 sats/);
  assert.equal(feeCalculation(half, 'en', [user(en), user('What is a block?')]), null);
});

test('unhandled numeric requests stay out of generic canned explanations', () => {
  const q = 'Why do fees for 100 vB at 2 sat/vB take longer to confirm?';
  assert.equal(feeCalculation(q, 'en'), null);
  assert.equal(hasFeeCalculationParameters(q), true);
  assert.equal(hasFeeCalculationParameters('Why do small payments have the same fees?'), false);
  assert.equal(feeCalculation('Calculate 1,000 vB at 2 sat/vB.', 'en'), null);
  assert.match(feeCalculation('Calculate the fee for 207 vB at 2.5 sat/vB.', 'en')!, /whole-satoshi fees requires 518 sats/);
});
