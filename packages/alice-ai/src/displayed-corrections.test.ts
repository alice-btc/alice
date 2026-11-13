import assert from 'node:assert/strict';
import test from 'node:test';
import { NEVER_CLAIM_CHECKS, answerRuleCorrectionsIn, answerRuleRepairGuidance, withAnswerRuleCorrections } from './answer-rules.ts';

test('every model-only sentence is part of its correction', () => {
  for (const check of NEVER_CLAIM_CHECKS) {
    for (const language of ['en', 'fr'] as const) {
      for (const part of check.modelOnly?.[language] ?? []) {
        assert.ok(check.correction[language].includes(part), `${check.id} ${language}`);
      }
    }
  }
});

test('a displayed correction leaves out the sentence meant for the model; the repair guidance keeps it', () => {
  const notes = ['transaction-inputs-outputs'];
  const shown = withAnswerRuleCorrections('Un UTXO (unité de transfert) est une pièce.', 'fr', notes);
  assert.deepEqual(shown.applied, ['utxo-invented-expansion']);
  assert.doesNotMatch(shown.text, /N’invente pas/);
  assert.match(shown.text, /soit une sortie de transaction non dépensée\. La dépense retire la sortie/);
  assert.equal(withAnswerRuleCorrections(shown.text, 'fr', notes).text, shown.text);
  assert.equal(answerRuleCorrectionsIn(shown.text).length, 1);
  const [guidance] = answerRuleRepairGuidance(['utxo-invented-expansion'], 'fr', notes);
  assert.match(guidance.correction, /N’invente pas un autre développement du sigle\./);
});

test('a clause kept after a model-only order starts its own sentence', () => {
  const displayed = 'Correction: a configured wallet or watchtower can detect a revoked commitment and broadcast the penalty automatically using saved data. Bitcoin itself does not initiate a refund. Successful recovery still requires appropriate data and timely confirmation.';
  assert.deepEqual(answerRuleCorrectionsIn(`An answer.\n\n${displayed}`), [displayed]);
});
