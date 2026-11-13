import assert from 'node:assert/strict';
import test from 'node:test';
import {ANSWER_RULES, answerRuleNoteIdsIn, answerRuleNoteIdsOnSubject, answerRulesBlock, withAnswerRuleCorrections} from './answer-rules.ts';

const cases = [
  {id:'lnd-channel-recovery', titles:['Les sauvegardes Lightning','Lightning backups'], question:'Does an LND seed and SCB restore active channels?'},
  {id:'lightning-payment-privacy', titles:['La confidentialité sur Lightning','Privacy on Lightning'], question:'Are Lightning payments anonymous?'},
  {id:'lightning-invoice-contents', titles:['Les factures Lightning','Lightning invoices'], question:'What does a BOLT11 invoice reveal publicly?'},
];
for (const row of cases) test(`${row.id}: source and subject gate concise free-generation guidance`, () => {
  for (const title of row.titles) {
    const ids = answerRuleNoteIdsIn(`Topic: ${title}`);
    assert.ok(answerRuleNoteIdsOnSubject(ids, row.question).includes(row.id));
    assert.ok(!answerRuleNoteIdsIn(`Notes: ${title}`).includes(row.id));
    assert.ok(!answerRuleNoteIdsOnSubject(ids, 'Explain Bitcoin mining.').includes(row.id));
  }
  for (const language of ['fr','en'] as const) {
    const block = answerRulesBlock([row.id], language);
    assert.ok(block.length <= 1700);
    for (const point of ANSWER_RULES.find(rule => rule.noteId === row.id)!.mustState[language]) assert.ok(block.includes(point));
  }
  const text = 'This answer deliberately remains generated text.';
  assert.deepEqual(withAnswerRuleCorrections(text, 'en', [row.id]), {text, applied:[]});
});
test('invoice content and payment-state rules have distinct subjects', () => {
  const source = answerRuleNoteIdsIn('Topic: Lightning invoices');
  assert.deepEqual(answerRuleNoteIdsOnSubject(source, 'Is a BOLT11 invoice encrypted or can anyone decode its fields?'), ['lightning-invoice-contents']);
  assert.deepEqual(answerRuleNoteIdsOnSubject(source, 'A BOLT11 invoice expired but my payment is pending. Can I retry?'), ['lightning-invoice']);
  assert.deepEqual(answerRuleNoteIdsOnSubject(source, 'What is proof of work?'), []);
  assert.match(answerRulesBlock(['lightning-invoice-contents'],'en'), /NOT the payment hash/);
  assert.match(answerRulesBlock(['lnd-channel-recovery'],'en'), /requires the appropriate keys/);
  assert.match(answerRulesBlock(['lightning-payment-privacy'],'en'), /not the full route in plaintext/);
});
