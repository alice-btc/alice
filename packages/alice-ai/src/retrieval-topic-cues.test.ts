import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { loadRagEvaluationRuntime } from '../../../scripts/rag-eval-runtime.mjs';
import { isImplicitCpfpQuestion, isMonetaryIssuanceQuestion, isLightningPrivacyQuestion, isInputOutputAllocationQuestion, isRevokedLightningStateQuestion } from './retrieval-topic-cues.ts';

const runtime = await loadRagEvaluationRuntime(`
export { planAliceTurn } from './packages/alice-ai/src/turn-planner';
export { rewriteRetrievalQuery } from './packages/alice-ai/src/rag-query-rewrite';
export { selectCuratedKnowledge } from './packages/alice-ai/src/curated-retrieval';
export { answerRuleNoteIdsIn, answerRuleNoteIdsOnSubject, registerAnswerRuleVariantTitles } from './packages/alice-ai/src/answer-rules';
export { GENERATED_CURATED_KNOWLEDGE_BASE as chunks } from './packages/alice-ai/src/generated/curated-rag';
`);
runtime.registerAnswerRuleVariantTitles(runtime.chunks);

test('received unconfirmed spending is CPFP evidence without the acronym in FR/EN', () => {
  for (const q of [
    'Can spending an unconfirmed output I received raise the fees of the pending transaction?',
    'Puis-je dépenser la sortie non confirmée reçue pour accélérer la transaction bitcoin ?',
  ]) assert.ok(isImplicitCpfpQuestion(q), q);
  for (const q of [
    'My child received money from a parent to pay school fees.',
    'Can I spend a confirmed bitcoin output I received?',
    'Une transaction en attente a peu de frais. Comment utiliser RBF ?',
    'Can spending an unconfirmed Ethereum output I received raise its fees?',
  ]) assert.ok(!isImplicitCpfpQuestion(q), q);
});

test('issuance, privacy and allocation cues require the matching subject', () => {
  for (const q of ['Are the fees in a miner reward newly created bitcoin?', 'Un mineur peut-il recevoir plus que la récompense prévue ?']) assert.ok(isMonetaryIssuanceQuestion(q), q);
  for (const q of ['What is coinbase maturity?', 'My bank creates reward points.', 'Why does Coinbase exchange reject my transfer?']) assert.ok(!isMonetaryIssuanceQuestion(q), q);
  for (const q of ['Who can see my Lightning payment?', 'Un canal Lightning montre-t-il qui je suis ?']) assert.ok(isLightningPrivacyQuestion(q), q);
  for (const q of ['Who can see my bank transfer?', 'Who maintains the Lightning code?']) assert.ok(!isLightningPrivacyQuestion(q), q);
  assert.ok(isInputOutputAllocationQuestion('Do transaction input signatures identify which output is change?'));
  for (const q of ['Explain keyboard inputs and audio outputs.', 'How do CoinJoin transaction inputs and outputs affect privacy?']) assert.ok(!isInputOutputAllocationQuestion(q), q);
});

function query(question: string, history: {role: string; content: string}[] = []) {
  return runtime.rewriteRetrievalQuery({userMessage:question,history:[...history,{role:'user',content:question}],plan:runtime.planAliceTurn(question)});
}

test('fixture paraphrases reach their source and rule through the production planner', () => {
  const fixture = JSON.parse(readFileSync(new URL('../../../scripts/data/memory-relevance/free-response-unseen-cases-2026-11-07.json', import.meta.url),'utf8'));
  const expected: Record<string, [string,string]> = {
    'fr-unseen-cpfp-merchant-package':['child-pays-for-parent','child-pays-for-parent'],
    'fr-unseen-coinbase-fees-issuance':['bitcoin-monetary-policy','bitcoin-issuance-validation'],
    'fr-unseen-inputs-outputs-change':['bitcoin-transaction-output','transaction-inputs-outputs'],
    'en-unseen-channel-open-identity':['lightning-privacy-tradeoff','lightning-payment-privacy'],
    'en-unseen-invoice-route-hints-editing':['lightning-invoice','lightning-invoice-contents'],
  };
  for (const c of fixture.conversations) {
    if (!expected[c.id]) continue;
    const history: {role:string;content:string}[] = [];
    for (const turn of c.turns) {
      const retrievalQuery=query(turn.question,history);
      const chunks=runtime.selectCuratedKnowledge(retrievalQuery,runtime.chunks,{targetLanguage:c.language,maxChunks:2});
      assert.equal(chunks[0]?.conceptId,expected[c.id][0],`${c.id}: ${retrievalQuery}`);
      const context=chunks.map((c:{title:string})=>`Topic: ${c.title}`).join('\n');
      const userText=[...history.filter(t=>t.role==='user').map(t=>t.content),turn.question].join('\n');
      const rules=runtime.answerRuleNoteIdsOnSubject(runtime.answerRuleNoteIdsIn(context),userText);
      assert.ok(rules.includes(expected[c.id][1]),`${c.id}: ${rules}`);
      history.push({role:'user',content:turn.question},{role:'assistant',content:'Unrelated assistant text cannot establish a topic.'});
    }
  }
});

test('invoice follow-ups inherit only an immediately preceding user subject', () => {
  const q='Could I edit that invoice and still pay it?';
  const prior={role:'user',content:'How do route hints in a Lightning invoice work?'};
  const expected='Lightning BOLT11 invoice editing disclosure checksum signature route hints';
  assert.equal(query(q,[prior]),expected);
  assert.notEqual(query(q,[{role:'assistant',content:prior.content}]),expected);
  assert.notEqual(query(q,[prior,{role:'user',content:'How do bank invoices work?'}]),expected);
  assert.notEqual(query('Another topic: could I edit my bank invoice?',[prior]),expected);
  assert.notEqual(query('Can a BOLT12 offer be edited?',[prior]),expected);
});

test('paraphrase rule eligibility never supplies an absent retrieved source', () => {
  const q='Can spending an unconfirmed output I received raise the fees of the pending transaction?';
  assert.deepEqual(runtime.answerRuleNoteIdsOnSubject([],q),[]);
  assert.ok(!runtime.answerRuleNoteIdsOnSubject(['lightning-payment-privacy'],q).length);
});


test('privacy focusing preserves invoice questions and comparisons', () => {
  const invoice = 'Does a Lightning invoice reveal my identity?';
  const chunks = runtime.selectCuratedKnowledge(query(invoice),runtime.chunks,{maxChunks:2});
  assert.equal(chunks[0].conceptId,'lightning-invoice');
  const comparison = 'Compare Lightning privacy with on-chain privacy.';
  assert.equal(query(comparison),runtime.planAliceTurn(comparison).retrievalQuery);
});


test('personal declarations cannot replace the current or preceding question topic', () => {
  for (const q of ["I'm learning about Lightning privacy. What is a full node?", 'Je débute avec Lightning et sa confidentialité. Comment fonctionne le minage ?']) {
    assert.equal(query(q),runtime.planAliceTurn(q).retrievalQuery,q);
  }
  const prior={role:'user',content:"I'm learning about the Lightning invoice. How do bank invoices work?"};
  assert.notEqual(query('Could I edit that invoice and still pay it?',[prior]),'Lightning BOLT11 invoice editing disclosure checksum signature route hints');
});

test('source cues preserve plurals, spending validity and unrelated follow-ups', () => {
  const invoice='How do Lightning invoices protect my identity?';
  assert.equal(runtime.selectCuratedKnowledge(query(invoice),runtime.chunks,{maxChunks:2})[0].conceptId,'lightning-invoice');
  const validity='How do Bitcoin transaction inputs and outputs prevent double spending?';
  assert.equal(query(validity),runtime.planAliceTurn(validity).retrievalQuery);
  assert.equal(runtime.selectCuratedKnowledge(query(validity),runtime.chunks,{maxChunks:2})[0].conceptId,'double-spending');
  assert.ok(!query('What fees should a parent pay for a child at school?',[{role:'user',content:'How does CPFP work?'}])?.includes('Bitcoin CPFP'));
  for (const rail of ['Liquid','Spark','Cashu','Fedimint']) {
    assert.notEqual(query(`Could I edit the invoice in ${rail}?`,[{role:'user',content:'How do Lightning invoices work?'}]),'Lightning BOLT11 invoice editing disclosure checksum signature route hints');
  }
});

test('an unrelated earlier subject does not suppress a newly retrieved CPFP rule', () => {
  const q='How do bank transfers work?\nCan spending an unconfirmed output I received raise the fees of the pending transaction?';
  assert.deepEqual(runtime.answerRuleNoteIdsOnSubject(['child-pays-for-parent'],q),['child-pays-for-parent']);
});


test('a personal CPFP declaration cannot replace cancellation or expiry questions', () => {
  for (const q of [
    "I'm learning to spend unconfirmed outputs I received to raise fees. How can I cancel a pending bitcoin transaction?",
    "I'm learning how to spend unconfirmed outputs I received to raise fees. Why do pending bitcoin transactions expire?",
    'Je débute avec la dépense des sorties non confirmées reçues pour augmenter les frais. Pourquoi une transaction bitcoin en attente expire-t-elle ?',
  ]) assert.ok(!query(q)?.startsWith('Bitcoin CPFP'),q);
});

test('coinbase value validation retrieves monetary consensus without an explicit issuance word', () => {
  for (const [language, question] of [
    ['fr', 'Comment un nœud contrôle-t-il ce que le mineur s’attribue dans une coinbase, frais compris ?'],
    ['fr', 'Comment les nœuds vérifient-ils le montant de la coinbase ?'],
    ['en', 'How does a node check what the miner claims in the coinbase, including fees?'],
    ['en', 'Which coinbase value must miners respect for node validation?'],
  ] as const) {
    assert.ok(isMonetaryIssuanceQuestion(question), question);
    for (const maxChunks of [1, 2]) {
      const chunks = runtime.selectCuratedKnowledge(query(question), runtime.chunks, { targetLanguage: language, maxChunks });
      assert.equal(chunks[0]?.conceptId, 'bitcoin-monetary-policy', question);
      const context = chunks.map((chunk: { title: string }) => `Topic: ${chunk.title}`).join('\n');
      assert.ok(runtime.answerRuleNoteIdsOnSubject(runtime.answerRuleNoteIdsIn(context), question).includes('bitcoin-issuance-validation'), question);
    }
  }
  for (const question of ['How do nodes check coinbase maturity?', 'How does a node verify the coinbase witness commitment?', 'Comment vérifier les frais de mon compte Coinbase ?', 'What fee should I use to spend a mature coinbase output?']) {
    assert.equal(isMonetaryIssuanceQuestion(question), false, question);
  }
});


test('mixed routing and revoked-state questions retain the dispute evidence as well as payment context', () => {
  for (const [language, question] of [
    ['en', 'If no route works, does that turn into an on-chain payment? Separately, if a peer broadcasts an old channel state, does Bitcoin automatically recover the funds for me?'],
    ['fr', 'Si aucun chemin ne fonctionne, le paiement passe-t-il tout seul sur la blockchain ? Et si un pair publie un ancien état du canal, Bitcoin me rend-il automatiquement les fonds ?'],
  ] as const) {
    assert.ok(isRevokedLightningStateQuestion(question));
    const chunks = runtime.selectCuratedKnowledge(query(question), runtime.chunks, { targetLanguage: language, maxChunks: 2 });
    assert.deepEqual(chunks.map(chunk => chunk.conceptId), ['secondary-lightning-revocation-key', 'lightning-network']);
    const context = chunks.map(chunk => `Topic: ${chunk.title}`).join('\n');
    assert.ok(runtime.answerRuleNoteIdsOnSubject(runtime.answerRuleNoteIdsIn(context), question).includes('lightning-revoked-state'));
  }
  for (const q of ['How do I close a Lightning channel?', 'An old Lightning invoice is expired.', 'How do I restore an old Slack channel?', 'How do Ark revoked states work?']) assert.equal(isRevokedLightningStateQuestion(q), false, q);
});


test('issued and émis identify monetary creation without capturing Coinbase accounts', () => {
  for(const q of ['Are newly issued satoshis in this coinbase all new money?', 'Ces nouveaux satoshis sont-ils émis dans la coinbase ?'])assert.equal(isMonetaryIssuanceQuestion(q),true,q);
  for(const q of ['Mon compte Coinbase a émis un virement.', 'My Coinbase account issued a receipt.'])assert.equal(isMonetaryIssuanceQuestion(q),false,q);
});

test('invoice walkthrough and no-route HTLC follow-up receive actual mechanism notes',()=>{
 const first='A cafe gives me a Lightning invoice. Is that invoice already an HTLC transaction, and must the cafe close its channel to receive my ordinary payment? Explain the normal flow.';
 const next='My wallet cannot find any route before sending. Is my whole channel balance now locked until I close it? How is that different from an HTLC already in flight?';
 assert.deepEqual(runtime.selectCuratedKnowledge(first,runtime.chunks,{maxChunks:2}).map(c=>c.conceptId),['lightning-network','lightning-invoice']);
 assert.ok(!runtime.answerRuleNoteIdsOnSubject(['lightning-invoice'],first).length, 'HTLC mentioned in normal flow does not imply an expired/pending invoice');
 const chunks=runtime.selectCuratedKnowledge(next,runtime.chunks,{maxChunks:2});
 assert.equal(chunks[0]?.conceptId,'lightning-network');
 assert.ok(runtime.answerRuleNoteIdsOnSubject(runtime.answerRuleNoteIdsIn(chunks.map(c=>'Topic: '+c.title+'\nNotes: '+c.content).join('\n\n')),next).includes('lightning-payment-mechanics'));
 for(const q of ['How much is my Lightning channel balance now?', 'How many sats are available in my wallet right now?', 'How much of my Lightning balance is now locked in a pending route?'])assert.deepEqual(runtime.selectCuratedKnowledge(q,runtime.chunks),[],q);
});

test('new coins in a coinbase follow-up keep issuance sources rather than transaction-fee advice',()=>{
 for(const q of ['Et une coinbase à 6500 sat deviendrait-elle acceptable avec davantage de preuve de travail ? Est-ce que les frais deviennent alors des nouveaux bitcoins ?', 'Would a larger coinbase be allowed with more proof of work? Are the fees new coins?']) {
  assert.ok(isMonetaryIssuanceQuestion(q));
  assert.equal(runtime.selectCuratedKnowledge(query(q),runtime.chunks,{maxChunks:2})[0].conceptId,'bitcoin-monetary-policy');
 }
 for(const q of ['Does my Coinbase account contain new bitcoins?', 'Do Ethereum fees create new coins?'])assert.equal(isMonetaryIssuanceQuestion(q),false);
});
