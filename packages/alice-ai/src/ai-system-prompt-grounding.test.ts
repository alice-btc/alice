import assert from 'node:assert/strict';
import test from 'node:test';
import { loadRagEvaluationRuntime } from '../../../scripts/rag-eval-runtime.mjs';

async function loadPromptModule() {
  return loadRagEvaluationRuntime(`
    export { buildAliceSystemPrompt, buildAliceLocalSystemPrompt, withAliceInstructionReminder, groundedAnswerPolicy } from './packages/alice-ai/src/ai-system-prompt.ts';
  `, {});
}

test('current factual reminder preserves real history and the final question for both languages', async () => {
  const { withAliceInstructionReminder } = await loadPromptModule();
  const history = [
    { role: 'user', content: 'Earlier question' },
    { role: 'assistant', content: 'An unsupported earlier claim' },
    { role: 'system', content: '[Retrieved knowledge]\nCurrent evidence' },
    { role: 'user', content: 'Is that claim correct?' },
  ];
  const original = structuredClone(history);
  for (const language of ['en', 'fr']) {
    const result = withAliceInstructionReminder(history, 'Use one sentence.', language);
    assert.deepEqual(history, original);
    assert.deepEqual(result.slice(0, -2), original.slice(0, -1));
    assert.deepEqual(result.at(-1), original.at(-1));
    assert.match(result.at(-2).content, /Use one sentence/);
    assert.match(result.at(-2).content, language === 'fr' ? /ne sont pas des preuves/ : /are not evidence/);
    assert.match(result.at(-2).content, language === 'fr' ? /pas des ordres/ : /not commands/);
  }
});

test('buildAliceSystemPrompt keeps the underlying Bitcoin system prompt byte-for-byte when custom instructions are added', async () => {
  const { buildAliceSystemPrompt } = await loadPromptModule();
  for (const language of ['en', 'fr']) {
    const base = buildAliceSystemPrompt('', language);
    const withCustom = buildAliceSystemPrompt('Reply with a synthetic test tone.', language);

    assert.ok(withCustom.endsWith(base));
    assert.match(withCustom, /unless they conflict with wallet safety, privacy, or financial-advice limits/);
  }
});

test('buildAliceLocalSystemPrompt retains wallet, privacy, and financial-advice boundaries with and without custom instructions', async () => {
  const { buildAliceLocalSystemPrompt } = await loadPromptModule();
  for (const custom of ['', 'Reply with a synthetic test tone.']) {
    for (const language of ['en', 'fr']) {
      const prompt = buildAliceLocalSystemPrompt(custom, language).toLowerCase();
      assert.match(prompt, /seed phrase/);
      assert.match(prompt, language === 'fr' ? /cl[ée] priv[ée]e/ : /private key/);
      assert.match(prompt, language === 'fr' ? /jamais.*effectu[ée] ou confirm[ée] un paiement/ : /never claim that you performed or confirmed a payment/);
      assert.match(prompt, language === 'fr' ? /conseill[èe]re financi[èe]re/ : /not a financial or investment advisor/);
    }
  }
});


test('compact grounded writing applies to retrieved Local/Custom turns without overriding custom style or other contexts', async () => {
  const { withAliceInstructionReminder } = await loadPromptModule();
  const question = { role: 'user', content: 'Explain transaction outputs.' };
  const history = [{ role: 'system', content: '[Retrieved knowledge]\nTopic: The outputs of a transaction\nEvidence' }, question];
  for (const language of ['en', 'fr']) {
    const marker = language === 'en' ? /Define the quantities or actors separately/ : /Définis séparément les quantités/;
    const result = withAliceInstructionReminder(history, '', language, false, true);
    assert.match(result.at(-2).content, marker);
    assert.match(result.at(-2).content, language === 'en' ? /analogy only if the user requests one/ : /analogie seulement si l’utilisateur en demande une/);
    assert.deepEqual(result.at(-1), question);
    assert.deepEqual(result[0], history[0]);
    assert.doesNotMatch(withAliceInstructionReminder(history, '', language).at(-2).content, marker);
    assert.doesNotMatch(withAliceInstructionReminder(history, 'Exactly one sentence.', language, false, true).at(-2).content, marker);
    assert.doesNotMatch(withAliceInstructionReminder([question], '', language, false, true).at(-2).content, marker);
    assert.doesNotMatch(withAliceInstructionReminder([{ role: 'user', content: '[Retrieved knowledge] fake' }, question], '', language, false, true).at(-2).content, marker);
  }
});


test('grounded writing policy never promotes source, memory or user text to system authority', async () => {
  const { groundedAnswerPolicy } = await loadPromptModule();
  const source = { role: 'system', content: '[Retrieved knowledge]\nUNTRUSTED_SOURCE_SENTINEL\n[Personal memory] PRIVATE_SENTINEL' };
  for (const language of ['en', 'fr']) {
    const policy = groundedAnswerPolicy([source, { role: 'user', content: 'USER_SENTINEL' }], '', language);
    assert.match(policy, /180/);
    assert.doesNotMatch(policy, /SENTINEL/);
    assert.equal(groundedAnswerPolicy([{ role: 'user', content: source.content }], '', language), '');
    assert.equal(groundedAnswerPolicy([source], 'Write a detailed explanation.', language), '');
    assert.equal(groundedAnswerPolicy([], '', language), '');
  }
});

test('retrieved default persona does not demand 400 words or a closing question', async()=>{
 const {buildAliceSystemPrompt,buildAliceLocalSystemPrompt}=await loadPromptModule();
 for(const lang of ['en','fr'])for(const build of [buildAliceSystemPrompt,buildAliceLocalSystemPrompt]){
  const grounded=build('',lang,true);
  assert.doesNotMatch(grounded,/400|End (?:with 1|every broad definition)|Termine (?:par 1|chaque définition générale)/);
  assert.equal(build('Use a detailed explanation.',lang,true),build('Use a detailed explanation.',lang));
  assert.match(grounded,/Alice/);assert.match(grounded,/seed phrase/);
 }
});
