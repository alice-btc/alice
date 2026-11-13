import assert from 'node:assert/strict';
import test from 'node:test';
import {loadRagEvaluationRuntime} from '../../../scripts/rag-eval-runtime.mjs';
import {prepareAliceTurn} from './turn-engine.ts';
import {createAliceMemory} from './alice-memory-core.ts';
import {createPedagogicalProfile} from './pedagogical-profile-core.ts';
import {answerRulesBlock,ANSWER_RULES} from './answer-rules.ts';
import type {Message} from './llm.ts';
import {resolveResponseLanguage} from './language-policy.ts';

const runtime=await loadRagEvaluationRuntime(`export {loadRagCorpus,buildRagTurnContext} from './packages/alice-ai/src/rag.ts';`,{evaluationPreferences:{}});
await runtime.loadRagCorpus();
async function prepare(question:string, backendType:'custom'|'local', enabled:boolean, previous:Message[]=[]) {
  const memory={...createAliceMemory(),enabled};
  const targetLanguage=resolveResponseLanguage({message:question,appLanguage:'en',history:previous}).targetLanguage;
  return prepareAliceTurn({history:[...previous,{role:'user',content:question}],userMessage:question,backendType,targetLanguage}, {
    recordPedagogicalSignal:async()=>createPedagogicalProfile(),
    getMemory:async()=>memory,
    rememberMemoryCandidates:async()=>({memory,saved:false}),
    memoryContext:()=>enabled?'Personal memory:\n- (noted 2026-11-06) Beginner with Bitcoin':'',
    memoryCaptureInstruction:'',pedagogicalContext:()=>'',
    retrieveKnowledge:query=>runtime.buildRagTurnContext(query,undefined,{maxChunks:backendType==='local'?1:3,targetLanguage,maxContextChars:6000}),
  });
}

test('Local and Custom preparation share Lightning sources and memory-controlled answer eligibility',async()=>{
  for(const backend of ['local','custom'] as const) {
    for(const question of ['Explain how a Lightning payment works for my level.','Explain how a Lightning payment works at a level suited to my experience.']) {
      const enabled=await prepare(question,backend,true);
      assert.ok(enabled.diagnostics.retrievedChunkIds.includes('curated-lightning-network.en'));
      // The checked text is a reference in the model's context, never the answer itself.
      assert.equal(enabled.directResponse,null);
      assert.equal(enabled.verifiedReference?.id,'selected-memory');
      assert.match(enabled.verifiedReference!.text,/earlier saved fact/);
      assert.match(enabled.verifiedReference!.text,/does not automatically turn into an on-chain/);
      assert.ok(enabled.history.some(m=>m.role==='system'&&m.content.includes('[Verified reference on this subject]')&&m.content.includes(enabled.verifiedReference!.text)));
      const disabled=await prepare(question,backend,false);
      assert.equal(disabled.directResponse,null);
      assert.equal(disabled.verifiedReference,null);
      assert.ok(disabled.diagnostics.answerRuleNoteIds.includes('lightning-payment-mechanics'));
      assert.ok(!disabled.history.some(m=>m.content.includes('Beginner with Bitcoin')));
    }
  }
});
test('Local and Custom preserve Ark sources across an operator-collusion follow-up',async()=>{
  for(const backend of ['local','custom'] as const) {
    const first='Who must I trust when using Ark?';
    const initial=await prepare(first,backend,false);
    assert.equal(initial.directResponse,null);
    assert.match(initial.verifiedReference!.text,/not a blanket guarantee/);
    const follow=await prepare('And what changes if the operator colludes with other participants?',backend,false,[{role:'user',content:first},{role:'assistant',content:'A generated answer about trust in Ark.'}]);
    assert.ok(follow.diagnostics.retrievedChunkIds.includes('curated-ark-security-model.en'));
    assert.equal(follow.directResponse,null);
    assert.match(follow.verifiedReference!.text,/previous sender/);
    assert.match(follow.verifiedReference!.text,/double-spend/);
  }
});
test('monetary consensus questions use source-gated free generation on both backends',async()=>{
  for(const backend of ['local','custom'] as const) {
    const result=await prepare('Why do Bitcoin nodes reject a block that creates too many coins?',backend,false);
    assert.equal(result.directResponse,null);
    assert.ok(result.diagnostics.retrievedChunkIds.includes('curated-bitcoin-monetary-policy.en'));
    assert.ok(result.diagnostics.answerRuleNoteIds.includes('bitcoin-issuance-validation'));
  }
  for(const id of ['bitcoin-issuance-validation','lightning-payment-mechanics']) for(const language of ['fr','en'] as const) {
    const block=answerRulesBlock([id],language);assert.ok(block.length<=1700);
    for(const point of ANSWER_RULES.find(r=>r.noteId===id)!.mustState[language]) assert.ok(block.includes(point));
  }
});

test('a French coinbase question keeps its monetary source and guard through actual turn preparation', async () => {
  const question = 'Comment un nœud contrôle-t-il ce que le mineur s’attribue dans une coinbase, frais compris ?';
  for (const backend of ['local', 'custom'] as const) {
    const result = await prepare(question, backend, false);
    assert.equal(result.directResponse, null);
    assert.ok(result.diagnostics.retrievedChunkIds.includes('curated-bitcoin-monetary-policy'));
    assert.ok(result.diagnostics.answerRuleNoteIds.includes('bitcoin-issuance-validation'));
    assert.ok(result.history.some(message => message.content.includes('L’émission monétaire de Bitcoin')));
  }
});

test('payment walkthroughs retain a mechanism source and real free generation across both backends', async () => {
  for (const question of [
    'Walk me through an ordinary Lightning payment from a wallet to a shop, including the invoice and the route. I want to understand the mechanism, not make a payment.',
    'Explique les étapes d’un paiement Lightning ordinaire vers un commerce, de la facture au routage. Je cherche seulement à comprendre le mécanisme.',
  ]) for (const backend of ['local', 'custom'] as const) {
    const result = await prepare(question, backend, false);
    assert.equal(result.directResponse, null);
    assert.ok(result.diagnostics.retrievedChunkIds.some(id => /^curated-lightning-network(?:\.en)?$/.test(id)), JSON.stringify(result.diagnostics));
    assert.ok(result.diagnostics.answerRuleNoteIds.includes('lightning-payment-mechanics'));
  }
});


test('the retrieved coinbase-transaction note also carries the monetary rule in a numeric follow-up', async () => {
  const question = 'Use hypothetical numbers, not the current subsidy: the permitted subsidy is 4000 sat and included transactions pay 600 sat in fees. May the coinbase claim 4500 sat? What about 4700 sat? Are all 4600 sat new coins?';
  for (const backend of ['local', 'custom'] as const) {
    const result = await prepare(question, backend, false);
    assert.equal(result.directResponse, null);
    assert.ok(result.diagnostics.answerRuleNoteIds.includes('bitcoin-issuance-validation'), JSON.stringify(result.diagnostics));
    assert.ok(result.history.some(message => message.content.includes('C - F')));
    assert.ok(result.history.some(message => message.content.includes('4500 <= 4600') && message.content.includes('C - F = 3900')));
  }
});


test('a two-input hypothetical question activates the UTXO source rule and verified arithmetic on both backends', async () => {
  const question = 'Pour comprendre les UTXO, imagine deux anciennes sorties de 12000 et 19000 sat utilisées ensemble pour payer 18000 sat, avec 1000 sat de frais. Décris les anciennes et nouvelles sorties de cet exemple fictif.';
  for (const backend of ['local', 'custom'] as const) {
    const result = await prepare(question, backend, false);
    assert.equal(result.directResponse, null);
    assert.ok(result.diagnostics.answerRuleNoteIds.includes('transaction-inputs-outputs'));
    assert.ok(result.history.some(message => message.content.includes('31000 - 18000 - 1000 = 12000')));
  }
});


test('a French issuance follow-up keeps monetary evidence instead of a fee-only source', async () => {
  const first='Dans un bloc fictif, la subvention autorisée à cette hauteur vaut 8500 sat et les frais des transactions valent 700 sat. Le mineur réclame 9000 sat dans sa coinbase.';
  const question='Est-ce que cela signifie que 9000 nouveaux satoshis sont émis ? Si la coinbase réclamait plutôt 9300 sat, une preuve de travail valide ou un bloc plus petit pourrait-il la rendre acceptable ?';
  for(const backend of ['local','custom'] as const) {
    const result=await prepare(question,backend,false,[{role:'user',content:first},{role:'assistant',content:'An earlier assistant claim is not a numeric authority.'}]);
    assert.equal(result.directResponse,null);
    assert.ok(result.diagnostics.answerRuleNoteIds.includes('bitcoin-issuance-validation'));
    assert.ok(result.history.some(message=>message.content.includes('C - F = 8300')));
  }
});
test('the recipient of an unconfirmed payment gets the checked answer on Local and Custom',async()=>{
  for(const backend of ['local','custom'] as const) {
    for(const question of ['Someone paid me with an unconfirmed transaction. Can the sender still change what I receive?','Un client m’a payé mais la transaction n’est pas encore confirmée. Peut-il encore annuler le paiement ?']) {
      const result=await prepare(question,backend,false);
      assert.ok(result.diagnostics.retrievedChunkIds.some(id=>id.startsWith('curated-replace-by-fee')),question);
      assert.equal(result.verifiedReference?.id,'unconfirmed-receipt');
      assert.match(result.directResponse!,/^(?:Yes|Oui)\./);
    }
  }
});
