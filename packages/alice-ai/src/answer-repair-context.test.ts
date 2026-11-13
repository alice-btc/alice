import assert from 'node:assert/strict';
import test from 'node:test';
import { assertAnswerRepairContext } from './answer-repair-context.ts';
import { fitLocalModelRoles } from './local-model-message-policy.ts';
import { loadRagEvaluationRuntime } from '../../../scripts/rag-eval-runtime.mjs';

const context = '[Retrieved knowledge]\nTopic: Understanding Lightning\nNotes: The recipient supplies the invoice.\n\n[Answer repair]\nCorrect the invoice direction.';
const history = [{ role: 'system' as const, content: context }, { role: 'user' as const, content: 'Explain a Lightning payment.' }];

test('role adaptation preserves the exact repair evidence; a bare marker cannot stand in for it', () => {
  const adapted = fitLocalModelRoles([{ role: 'system', content: 'Policy' }, ...history], 'qwen3.5-4b');
  assert.doesNotThrow(() => assertAnswerRepairContext(adapted, context));
  assert.throws(() => assertAnswerRepairContext([{ role: 'user', content: '[Answer repair]' }], context), /without its source context/);
  assert.doesNotThrow(() => assertAnswerRepairContext([], undefined));
});

test('actual local request preparation refuses a repair whose context fitting discards its evidence', async () => {
  const runtime = await loadRagEvaluationRuntime(`export { prepareLocalRequest } from './packages/alice-ai/src/local-request.ts';`,
    { evaluationPreferences: { alice_ai_preset_local: 'balanced', alice_ai_local_model: 'qwen3.5-4b' } });
  const fitted = await runtime.prepareLocalRequest(history, { responseLanguage: 'en', requiredAnswerRepairContext: context }, 8192);
  assert.ok(fitted.messages.some((message: { content: string }) => message.content.includes(context)));
  const oversized = context + ' source evidence '.repeat(8000);
  const messages = [{ role: 'system', content: oversized }, history[1]];
  // The existing non-repair path can drop this optional context and fit.
  const ordinary = await runtime.prepareLocalRequest(messages, { responseLanguage: 'en' }, 8192);
  assert.ok(!ordinary.messages.some((message: { content: string }) => message.content.includes(oversized)));
  await assert.rejects(() => runtime.prepareLocalRequest(messages, { responseLanguage: 'en', requiredAnswerRepairContext: oversized }, 8192), /without its source context/);
});
