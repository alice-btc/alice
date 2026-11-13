import assert from 'node:assert/strict';
import test from 'node:test';
import { answerRuleNoteIdsIn, answerRuleNoteIdsOnSubject, answerRulesBlock, withAnswerRuleCorrections } from './answer-rules.ts';

test('confirmation guidance requires a selected note and an actual confirmation topic', () => {
  assert.deepEqual(answerRuleNoteIdsIn('Topic: Confirmations\nNotes: Example'), ['transaction-confirmations']);
  assert.deepEqual(answerRuleNoteIdsIn('Topic: Les confirmations\nNotes: Exemple'), ['transaction-confirmations']);
  assert.deepEqual(answerRuleNoteIdsIn('Notes: Confirmations'), []);
  assert.deepEqual(answerRuleNoteIdsOnSubject(['transaction-confirmations'], 'Explain channel liquidity.'), []);
  assert.deepEqual(answerRuleNoteIdsOnSubject(['transaction-confirmations'], 'Et six confirmations après une réorganisation ?'), ['transaction-confirmations']);
  assert.deepEqual(answerRuleNoteIdsOnSubject(['transaction-confirmations', 'transaction-finality'], 'Et six confirmations après une réorganisation ?'), ['transaction-confirmations']);
  assert.deepEqual(answerRuleNoteIdsOnSubject(['transaction-finality'], 'Can RBF cancel a confirmed payment?'), ['transaction-finality']);
});

test('confirmation guidance fixes count and causal distinctions without rewriting or appending to generated text', () => {
  const english = answerRulesBlock(['transaction-confirmations'], 'en');
  const french = answerRulesBlock(['transaction-confirmations'], 'fr');
  assert.match(english, /plus five blocks built after it/);
  assert.match(french, /cinq blocs construits après lui/);
  assert.match(english, /sender does not personally confirm/);
  assert.match(french, /ne prouve ni remboursement ni vol/);
  assert.match(english, /mathematically zero/);
  for (const phrase of [/included once/, /do not contain the transaction again/, /most cumulative work/, /SAME input outpoint/, /Address receipts or balances alone/, /need not require majority hash power/]) assert.match(english, phrase);
  for (const phrase of [/incluse une seule fois/, /travail cumulé le plus élevé/, /MÊME outpoint/, /n’exige pas forcément une majorité/]) assert.match(french, phrase);
  assert.ok(english.length <= 1700 && french.length <= 1700);
  const generated = 'The transaction may be included again, but that is not guaranteed.';
  assert.equal(withAnswerRuleCorrections(generated, 'en', ['transaction-confirmations']).text, generated);
});
