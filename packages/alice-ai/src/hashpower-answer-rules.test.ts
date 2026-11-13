import assert from 'node:assert/strict';
import test from 'node:test';
import {isMajorityHashpowerQuestion} from './majority-hashpower.ts';
import {ANSWER_RULES,answerRuleNoteIdsIn,answerRuleNoteIdsOnSubject,answerRulesBlock,withAnswerRuleCorrections} from './answer-rules.ts';

test('majority source and user subject are both required, including fractional shares', () => {
  for (const title of ['L’attaque majoritaire','The majority attack']) {
    assert.deepEqual(answerRuleNoteIdsIn(`Topic: ${title}`), ['majority-hashpower']);
    assert.deepEqual(answerRuleNoteIdsIn(`Notes: ${title}`), []);
  }
  for (const question of ['Can 50.5% of Bitcoin hash power impose invalid blocks?', 'Un pool avec 99% du hashrate peut-il modifier les règles ?', 'What can a majority mining pool do?', 'Can more than half the hash power censor?', 'Does hash power at 77 percent allow forbidden issuance?']) {
    assert.ok(isMajorityHashpowerQuestion(question), question);
    assert.deepEqual(answerRuleNoteIdsOnSubject(['majority-hashpower'], question), ['majority-hashpower'], question);
  }
  for (const question of ['What if 60% of miners stop mining?', 'Can 49.5% of hash power impose invalid rules?', 'How does the pool pay 80% of its revenue?', 'Can a majority of nodes vote?', 'Is unchanged supply harmless?', 'Can 70% of Ethereum hash power censor?', 'The majority mining example is done. New topic: how does pruning work?']) {
    assert.equal(isMajorityHashpowerQuestion(question), false, question);
    assert.deepEqual(answerRuleNoteIdsOnSubject(['majority-hashpower'], question), [], question);
  }
});
test('validity and remaining attack powers survive budgeting beside a confirmation note', () => {
  for (const language of ['fr','en'] as const) {
    const block=answerRulesBlock(['transaction-confirmations','majority-hashpower'],language);
    assert.ok(block.length <= 1700);
    for (const point of ANSWER_RULES.find(r=>r.noteId==='majority-hashpower')!.mustState[language]) assert.ok(block.includes(point), point);
  }
  const en=answerRulesBlock(['majority-hashpower'],'en');
  for (const fact of [/subsidy plus fees/,/even with valid proof of work/,/only among valid chains/,/majority-of-nodes vote/,/censor, reorganize confirmations/,/other users’ signatures/]) assert.match(en,fact);
  const text='The answer remains freely generated.';
  assert.deepEqual(withAnswerRuleCorrections(text,'en',['majority-hashpower']),{text,applied:[]});
});
