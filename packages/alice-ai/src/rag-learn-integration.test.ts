import assert from 'node:assert/strict';
import test from 'node:test';
import { loadRagEvaluationRuntime } from '../../../scripts/rag-eval-runtime.mjs';

test('the production RAG bridge forwards response language and quotes Learn separately', async () => {
  const runtime = await loadRagEvaluationRuntime(`
    export { buildRagTurnContext } from './packages/alice-ai/src/rag.ts';
    export { registerLearnContextProvider } from './packages/alice-ai/src/learn-context.ts';
    export { composeGenerationHistory } from './packages/alice-ai/src/generation-context.ts';
  `);
  runtime.registerLearnContextProvider(async (query: string, options: { targetLanguage?: string }) => {
    assert.equal(query, 'What is Bitcoin?');
    assert.equal(options?.targetLanguage, 'fr');
    return { label: 'Les bases', excerpt: 'Un réseau monétaire sans autorité centrale.' };
  });
  const context = await runtime.buildRagTurnContext('What is Bitcoin?', undefined, { maxChunks: 1, targetLanguage: 'fr' });
  assert.equal(context.learnContext, 'Les bases\nUn réseau monétaire sans autorité centrale.');
  assert.equal(context.diagnostics[0]?.conceptId, 'bitcoin-network-vs-asset');
  const history = runtime.composeGenerationHistory([{ role: 'user', content: 'What is Bitcoin?' }], context, '');
  assert.equal(history.at(-1).content, 'What is Bitcoin?');
  assert.ok(history.some((m: { role: string; content: string }) => m.role === 'system' && m.content.includes('Les bases')));
});


test('RAG stage timings preserve parallel Learn and semantic work without query text', { timeout: 3000 }, async () => {
  const runtime = await loadRagEvaluationRuntime(`
    export { buildRagTurnContext } from './packages/alice-ai/src/rag.ts';
    export { registerLearnContextProvider } from './packages/alice-ai/src/learn-context.ts';
  `);
  let releaseLearn!: () => void;
  const semanticStarted = new Promise<void>(resolve => { releaseLearn = resolve; });
  let releaseSemantic!: () => void;
  const learnStarted = new Promise<void>(resolve => { releaseSemantic = resolve; });
  runtime.registerLearnContextProvider(async () => {
    releaseSemantic();
    // Each stage waits for the other to start, enforcing parallel execution.
    await semanticStarted;
    return { label: 'Course', excerpt: 'Parallel context.' };
  });
  runtime.setEvaluationSemanticMatcher(async () => { releaseLearn(); await learnStarted; return null; });
  const context = await runtime.buildRagTurnContext('What is Bitcoin?', undefined, { maxChunks: 1 });
  assert.equal(context.learnContext, 'Course\nParallel context.');
  for (const value of Object.values(context.timingMs)) {
    assert.ok(typeof value === 'number' && Number.isFinite(value) && value >= 0);
  }
  assert.ok(context.timingMs.total >= context.timingMs.semantic);
  assert.ok(context.timingMs.total >= context.timingMs.learn);
  assert.doesNotMatch(JSON.stringify(context.timingMs), /Bitcoin|What is/);
});


test('the actual RAG + Learn bridge shares a hard text budget and reports only emitted notes', async () => {
  const runtime = await loadRagEvaluationRuntime(`
    export { buildRagTurnContext } from './packages/alice-ai/src/rag.ts';
    export { registerLearnContextProvider } from './packages/alice-ai/src/learn-context.ts';
    export { getAllChunks } from './packages/alice-ai/src/knowledge-packs.ts';
  `);
  const full = await runtime.buildRagTurnContext('What is Bitcoin?', undefined, {maxChunks:1});
  const content = runtime.getAllChunks().find((c: {id:string}) => c.id === 'curated-bitcoin-network-vs-asset').content;
  runtime.registerLearnContextProvider(async () => ({label:'Course', excerpt:content}));
  const duplicate = await runtime.buildRagTurnContext('What is Bitcoin?', undefined, {maxChunks:1});
  assert.equal(duplicate.learnContext, null);
  assert.deepEqual(duplicate.diagnostics, full.diagnostics);
  runtime.registerLearnContextProvider(async () => ({label:'Course', excerpt:'An additional, complete paragraph. No guarantee is implied.'}));
  const capped = await runtime.buildRagTurnContext('What is Bitcoin?', undefined, {
    maxChunks:1, maxContextChars:full.ragContext.length + 20,
  });
  assert.equal(capped.ragContext, full.ragContext);
  assert.equal(capped.learnContext, null);
  const tiny = await runtime.buildRagTurnContext('What is Bitcoin?', undefined, {maxChunks:1,maxContextChars:100});
  assert.equal(tiny.ragContext, null);
  assert.deepEqual(tiny.diagnostics, []);
  assert.ok(tiny.learnContext.includes('No guarantee is implied.'));
  assert.ok(tiny.learnContext.length <= 100);
});

test('the sources of a Learn excerpt ride with the turn, and a source whose text was cut is dropped', async () => {
  const runtime = await loadRagEvaluationRuntime(`
    export { buildRagTurnContext } from './packages/alice-ai/src/rag.ts';
    export { registerLearnContextProvider } from './packages/alice-ai/src/learn-context.ts';
  `);
  const definition = { kind: 'definition', label: 'UTXO', path: '/learn/?definition=utxo', attribution: 'Loïc Pandul, CC BY-NC-SA 4.0' };
  const course = { kind: 'course', label: 'BTC101 · UTXOs', path: '/learn/?course=btc101', attribution: 'Plan ₿ Network, CC BY-SA 4.0' };
  runtime.registerLearnContextProvider(async () => ({
    label: 'Dictionnaire de Bitcoin · UTXO',
    excerpt: `Un UTXO est une sortie non dépensée.\n\nBTC101 · UTXOs\n${'Coins are outputs. '.repeat(40)}`,
    sources: [definition, course],
  }));
  const whole = await runtime.buildRagTurnContext('What is a UTXO?', undefined, { maxChunks: 1 });
  assert.deepEqual(whole.learnSources, [definition, course]);
  // A budget that keeps only the definition's paragraph leaves the course out of the sources too.
  const tight = await runtime.buildRagTurnContext('What is a UTXO?', undefined, { maxChunks: 1, maxContextChars: 700 });
  assert.ok(tight.learnContext?.includes('Un UTXO est une sortie'), tight.learnContext ?? 'no learn context');
  assert.ok(!tight.learnContext?.includes('Coins are outputs'), 'the course paragraph did not fit');
  assert.deepEqual(tight.learnSources, [definition]);
});

test('actual turn preparation keeps issuance evidence and checked arithmetic on a fee-concept follow-up', async()=>{
 const runtime=await loadRagEvaluationRuntime(`
 export {prepareAliceTurn} from './packages/alice-ai/src/turn-engine.ts';
 export {buildRagTurnContext,loadRagCorpus,isTechnicalRagQuery} from './packages/alice-ai/src/rag.ts';
 export {ragQueryChunkBudget} from './packages/alice-ai/src/rag-query-policy.ts';
 export {knowledgeContextCharLimit} from './packages/alice-ai/src/knowledge-context-budget.ts';
 export {createAliceMemory} from './packages/alice-ai/src/alice-memory-core.ts';
 export {createPedagogicalProfile} from './packages/alice-ai/src/pedagogical-profile-core.ts';
 `,{evaluationPreferences:{}});
 await runtime.loadRagCorpus();
 const first='Exemple fictif : la subvention autorisée est 6000 sat, les frais sont 400 sat et le mineur réclame 6200 sat dans la coinbase. Quel est le plafond permis et de combien augmente la quantité totale de bitcoins ?';
 const next='Et une coinbase à 6500 sat deviendrait-elle acceptable avec davantage de preuve de travail ? Est-ce que les frais deviennent alors des nouveaux bitcoins ?';
 const prepared=await runtime.prepareAliceTurn({userMessage:next,history:[{role:'user',content:first},{role:'assistant',content:'Un brouillon erroné avait annoncé 9999 sat.'},{role:'user',content:next}],backendType:'local',targetLanguage:'fr'},{
 recordPedagogicalSignal:async()=>runtime.createPedagogicalProfile(),getMemory:async()=>({...runtime.createAliceMemory(),enabled:false}),rememberMemoryCandidates:async()=>({memory:runtime.createAliceMemory(),saved:true}),pedagogicalContext:()=>'',memoryContext:()=>'',memoryCaptureInstruction:'',
 retrieveKnowledge:async (query:string)=>runtime.buildRagTurnContext(query,undefined,{maxChunks:runtime.ragQueryChunkBudget(query,true,()=>runtime.isTechnicalRagQuery(query)),targetLanguage:'fr',maxContextChars:runtime.knowledgeContextCharLimit(true)})});
 assert.ok(prepared.diagnostics.answerRuleNoteIds.includes('bitcoin-issuance-validation'));
 const context=prepared.history.filter((m:{role:string})=>m.role==='system').map((m:{content:string})=>m.content).join('\n');
 for(const text of ['6200 <= 6400','6500 > 6400','C - F = 5800'])assert.ok(context.includes(text),text);
 assert.ok(!context.includes('9999'));
});


test('turn preparation attaches UTXO checks and user-derived arithmetic across fee updates', async()=>{
 const runtime=await loadRagEvaluationRuntime(`
 export {prepareAliceTurn} from './packages/alice-ai/src/turn-engine.ts';
 export {buildRagTurnContext,loadRagCorpus,isTechnicalRagQuery} from './packages/alice-ai/src/rag.ts';
 export {ragQueryChunkBudget} from './packages/alice-ai/src/rag-query-policy.ts';
 export {knowledgeContextCharLimit} from './packages/alice-ai/src/knowledge-context-budget.ts';
 export {createAliceMemory} from './packages/alice-ai/src/alice-memory-core.ts';
 export {createPedagogicalProfile} from './packages/alice-ai/src/pedagogical-profile-core.ts';
 export {answerRuleNoteIdsIn,answerRuleViolationsIn} from './packages/alice-ai/src/answer-rules.ts';
 export {getAllChunks} from './packages/alice-ai/src/knowledge-packs.ts';
 `,{evaluationPreferences:{}});
 await runtime.loadRagCorpus();
 const messages = [
 'Pour une transaction Bitcoin fictive, je dépense ensemble deux sorties de 26000 sat et 19000 sat. Le destinataire reçoit 28000 sat et les frais valent 1200 sat. Décris les nouvelles sorties et ce qui reste des anciennes.',
 'Je garde les mêmes entrées et le même paiement, mais je prépare plutôt la transaction avec 500 sat de frais. Que devient la monnaie ?',
 'Un observateur peut-il alors prouver, avec les signatures et un explorateur, quelle sortie me revient ? Et mes anciennes sorties disparaissent-elles de l’historique ?',
 ];
 const services={recordPedagogicalSignal:async()=>runtime.createPedagogicalProfile(),getMemory:async()=>({...runtime.createAliceMemory(),enabled:false}),rememberMemoryCandidates:async()=>({memory:runtime.createAliceMemory(),saved:true}),pedagogicalContext:()=>'',memoryContext:()=>'',memoryCaptureInstruction:'',
 retrieveKnowledge:async (query:string)=>runtime.buildRagTurnContext(query,undefined,{maxChunks:runtime.ragQueryChunkBudget(query,true,()=>runtime.isTechnicalRagQuery(query)),targetLanguage:'fr',maxContextChars:runtime.knowledgeContextCharLimit(true)})};
 const history: {role:string;content:string}[]=[];
 for(const [i,question] of messages.entries()){
  history.push({role:'user',content:question});
  const prepared=await runtime.prepareAliceTurn({userMessage:question,history,backendType:'local',targetLanguage:'fr'},services);
  assert.ok(prepared.diagnostics.answerRuleNoteIds.includes('transaction-inputs-outputs'),JSON.stringify(prepared.diagnostics));
  const system=prepared.history.filter((m:{role:string})=>m.role==='system').map((m:{content:string})=>m.content).join('\n');
  if(i===0) assert.match(system,/45000 - 28000 - 1200 = 15800/);
  if(i===1) assert.match(system,/45000 - 28000 - 500 = 16500/);
  assert.ok(!system.includes('9999'));
  history.push({role:'assistant',content:'La monnaie est de 9999 sat.'});
 }
 for(const chunk of runtime.getAllChunks().filter((c:{conceptId:string})=>['change-output','change-privacy-linking'].includes(c.conceptId))){
  assert.ok(runtime.answerRuleNoteIdsIn(`Topic: ${chunk.title}\n${chunk.content}`).includes('transaction-inputs-outputs'),chunk.title);
 }
});


test('issuance follow-up retrieval and arithmetic stay active through updated fees and claims',async()=>{
 const runtime=await loadRagEvaluationRuntime(`
 export {prepareAliceTurn} from './packages/alice-ai/src/turn-engine.ts';
 export {buildRagTurnContext,loadRagCorpus,isTechnicalRagQuery} from './packages/alice-ai/src/rag.ts';
 export {ragQueryChunkBudget} from './packages/alice-ai/src/rag-query-policy.ts';
 export {knowledgeContextCharLimit} from './packages/alice-ai/src/knowledge-context-budget.ts';
 export {createAliceMemory} from './packages/alice-ai/src/alice-memory-core.ts';
 export {createPedagogicalProfile} from './packages/alice-ai/src/pedagogical-profile-core.ts';
 `,{evaluationPreferences:{}});
 await runtime.loadRagCorpus();
 const messages=[
 'Use fictional values: permitted Bitcoin subsidy is 7000 sat, included transaction fees are 900 sat, and the miner claims 7300 sat in the coinbase outputs. What is the allowed ceiling, is that claim allowed, and what is the net supply increase?',
 'Keep the subsidy and claimed coinbase amount the same, but set the included fees to 400 sat instead. Recalculate the ceiling and net increase.',
 'With those updated fees, could a claim of 7500 sat be accepted if the miner found a much stronger proof of work? Why?',
 ];
 const services={recordPedagogicalSignal:async()=>runtime.createPedagogicalProfile(),getMemory:async()=>({...runtime.createAliceMemory(),enabled:false}),rememberMemoryCandidates:async()=>({memory:runtime.createAliceMemory(),saved:true}),pedagogicalContext:()=>'',memoryContext:()=>'',memoryCaptureInstruction:'',retrieveKnowledge:async(query:string)=>runtime.buildRagTurnContext(query,undefined,{maxChunks:runtime.ragQueryChunkBudget(query,true,()=>runtime.isTechnicalRagQuery(query)),targetLanguage:'en',maxContextChars:runtime.knowledgeContextCharLimit(true)})};
 const history:{role:string;content:string}[]=[];
 for(const [i,question] of messages.entries()){
  history.push({role:'user',content:question});
  const prepared=await runtime.prepareAliceTurn({history,userMessage:question,backendType:'local',targetLanguage:'en'},services);
  assert.ok(prepared.diagnostics.answerRuleNoteIds.includes('bitcoin-issuance-validation'),JSON.stringify(prepared.diagnostics));
  const system=prepared.history.filter((m:{role:string})=>m.role==='system').map((m:{content:string})=>m.content).join('\n');
  if(i===0)assert.match(system,/C - F = 6400/);
  if(i===1)assert.match(system,/ceiling S \+ F = 7400[\s\S]*C - F = 6900/);
  if(i===2)assert.match(system,/7500 > 7400/);
  assert.ok(!system.includes('9999'));
  history.push({role:'assistant',content:'The fees are 9999 sat.'});
 }
});


test('a comparison imperative follows the production retrieval and checked-arithmetic path',async()=>{
 const runtime=await loadRagEvaluationRuntime(`
 export {prepareAliceTurn} from './packages/alice-ai/src/turn-engine.ts';
 export {buildRagTurnContext,loadRagCorpus,isTechnicalRagQuery} from './packages/alice-ai/src/rag.ts';
 export {ragQueryChunkBudget} from './packages/alice-ai/src/rag-query-policy.ts';
 export {knowledgeContextCharLimit} from './packages/alice-ai/src/knowledge-context-budget.ts';
 export {createAliceMemory} from './packages/alice-ai/src/alice-memory-core.ts';
 export {createPedagogicalProfile} from './packages/alice-ai/src/pedagogical-profile-core.ts';
 export {answerRuleNoteIdsIn,answerRuleViolationsIn} from './packages/alice-ai/src/answer-rules.ts';
 export {getAllChunks} from './packages/alice-ai/src/knowledge-packs.ts';
 `,{evaluationPreferences:{}});
 await runtime.loadRagCorpus();
 const services={recordPedagogicalSignal:async()=>runtime.createPedagogicalProfile(),getMemory:async()=>({...runtime.createAliceMemory(),enabled:false}),rememberMemoryCandidates:async()=>({memory:runtime.createAliceMemory(),saved:true}),pedagogicalContext:()=>'',memoryContext:()=>'',memoryCaptureInstruction:'',
 retrieveKnowledge:async (query:string)=>runtime.buildRagTurnContext(query,undefined,{maxChunks:runtime.ragQueryChunkBudget(query,true,()=>runtime.isTechnicalRagQuery(query)),targetLanguage:'fr',maxContextChars:runtime.knowledgeContextCharLimit(true)})};
 const first="Exemple fictif de transaction Bitcoin : deux entrées de 6500 sat et 3200 sat, un paiement de 4300 sat et 450 sat de frais. Calcule la monnaie et explique quelles sorties sont créées.";
 const next="Je garde les mêmes entrées et le même paiement, mais prépare la transaction avec 200 sat de frais. Compare la monnaie avant et après.";
 const prepared=await runtime.prepareAliceTurn({userMessage:next,history:[{role:'user',content:first},{role:'assistant',content:'Les frais de 200 sat sont impossibles et la monnaie est de 4850 sat.'},{role:'user',content:next}],backendType:'local',targetLanguage:'fr'},services);
 assert.equal(prepared.plan.kind,'question');
 assert.ok(prepared.diagnostics.answerRuleNoteIds.includes('transaction-inputs-outputs'),JSON.stringify(prepared.diagnostics));
 const system=prepared.history.filter((m:{role:string})=>m.role==='system').map((m:{content:string})=>m.content).join('\n');
 assert.match(system,/9700 - 4300 - 200 = 5200/);
 assert.match(system,/augmente de 250 sat/);
 assert.ok(!system.includes('4850'));
});
