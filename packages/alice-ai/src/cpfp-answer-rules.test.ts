import assert from 'node:assert/strict';
import test from 'node:test';
import {answerRuleNoteIdsIn, answerRuleNoteIdsOnSubject, answerRulesBlock, withAnswerRuleCorrections} from './answer-rules.ts';

test('CPFP guidance requires a selected matching source and a CPFP subject', () => {
  assert.deepEqual(answerRuleNoteIdsIn('Topic: Accélérer avec CPFP'), ['child-pays-for-parent']);
  assert.deepEqual(answerRuleNoteIdsIn('Topic: Child pays for parent'), ['child-pays-for-parent']);
  assert.deepEqual(answerRuleNoteIdsIn('Notes: Child pays for parent'), []);
  assert.deepEqual(answerRuleNoteIdsOnSubject(['child-pays-for-parent'], 'Can a recipient use CPFP?'), ['child-pays-for-parent']);
  assert.deepEqual(answerRuleNoteIdsOnSubject(['child-pays-for-parent'], 'Explain a bank invoice.'), []);
});
test('CPFP and RBF distinctions survive the bounded prompt in both languages', () => {
  const en = answerRulesBlock(['replace-by-fee','child-pays-for-parent'], 'en');
  const fr = answerRulesBlock(['replace-by-fee','child-pays-for-parent'], 'fr');
  assert.match(en, /Child Pays For Parent/); assert.match(en, /recipient controlling/i);
  assert.match(en, /without the sender’s keys/); assert.match(en, /does not replace the parent or require RBF/);
  assert.match(en, /wallet support and relay\/mining package policies/); assert.match(en, /timing are not guaranteed/);
  assert.match(en, /Recipient addresses or output amounts/);
  assert.match(fr, /sans celles de l’expéditeur/); assert.match(fr, /Ni les adresses destinataires ni leurs montants/);
  assert.match(en, /full-RBF/); assert.match(fr, /full-RBF/);
  assert.match(en, /THIS replacement’s total inputs/); assert.match(fr, /entrées de CE remplacement/);
  assert.match(en, /Parent age alone does not invalidate/); assert.match(en, /cannot construct or sign real CPFP/);
  assert.ok(en.length <= 1700 && fr.length <= 1700);
});
test('RBF guidance preserves the distinction between proposed replacement and settlement', () => {
  const rule = answerRulesBlock(['replace-by-fee'], 'en');
  assert.match(rule, /authorization for the replacement inputs/);
  assert.match(rule, /Check actual replacement and confirmations/);
  assert.match(rule, /wallet visibility does not guarantee settlement/);
  const generated = 'Only the sender can construct a CPFP child.';
  assert.equal(withAnswerRuleCorrections(generated, 'en', ['child-pays-for-parent']).text, generated);
});
