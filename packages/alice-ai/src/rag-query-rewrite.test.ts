import assert from 'node:assert/strict';
import test from 'node:test';
import type { Message } from './llm.ts';
import { MAX_REWRITTEN_QUERY_CHARS, rewriteRetrievalQuery } from './rag-query-rewrite.ts';
import { planAliceTurn } from './turn-planner.ts';

const BITCOIN_EXCHANGE: Message[] = [
  { role: 'user', content: 'Explain what is Bitcoin?' },
  { role: 'assistant', content: 'Bitcoin is a decentralized monetary network.' },
];

/** The chat appends the current message to the history it hands over. */
function rewrite(previous: Message[], userMessage: string): string | null {
  return rewriteRetrievalQuery({
    history: [...previous, { role: 'user', content: userMessage }],
    userMessage,
    plan: planAliceTurn(userMessage),
  });
}

test('autonomous questions, greetings, personal statements and memory questions keep their plan', () => {
  assert.equal(rewrite(BITCOIN_EXCHANGE, 'How does Lightning routing work?'), 'How does Lightning routing work?');
  assert.equal(rewrite(BITCOIN_EXCHANGE, 'What is proof of work?'), 'What is proof of work?');
  assert.equal(rewrite(BITCOIN_EXCHANGE, 'Hello!'), null);
  assert.equal(rewrite(BITCOIN_EXCHANGE, 'I prefer concise answers.'), null);
  assert.equal(rewrite(BITCOIN_EXCHANGE, 'Je débute avec les UTXO.'), null);
  assert.equal(rewrite(BITCOIN_EXCHANGE, 'Que sais-tu de moi ?'), null);
});

test('generic FR/EN follow-ups search the subject of the previous question', () => {
  for (const followUp of [
    'Pourquoi ?',
    'Et pourquoi ?',
    'Comment ?',
    'Can you explain that more?',
    'Tell me more',
    'Développe',
    'Approfondis',
    'Dis-m’en plus',
  ]) {
    assert.equal(rewrite(BITCOIN_EXCHANGE, followUp), 'Explain what is Bitcoin?', followUp);
  }
});

test('an acknowledgement refers to the previous answer without ever searching', () => {
  for (const message of [
    'That makes sense.',
    'Thanks, that helps.',
    'Merci !',
    'Ok, je vois.',
  ]) {
    assert.equal(rewrite(BITCOIN_EXCHANGE, message), null, message);
  }
});

// Before this module, any follow-up inherited the previous raw user message, so
// "What about Lightning?" searched Bitcoin *and* Lightning and answered neither
// topic well. A follow-up that names its own subject is a topic change.
test('a short named topic change is retrieved on its own terms', () => {
  for (const [topicChange, subject] of [
    ['What about Lightning?', 'lightning'],
    ['Et les CoinJoin alors ?', 'coinjoin'],
    ['Qu’en est-il des frais ?', 'frais'],
  ]) {
    assert.equal(rewrite(BITCOIN_EXCHANGE, topicChange), subject, topicChange);
  }
});

test('a reference to the previous answer keeps the subject and adds what the follow-up names', () => {
  assert.equal(
    rewrite(BITCOIN_EXCHANGE, 'Et ça marche avec Ark ?'),
    'Explain what is Bitcoin?\nFollow-up topic: marche ark',
  );
  assert.equal(
    rewrite(BITCOIN_EXCHANGE, 'Is it compatible with Ark?'),
    'Explain what is Bitcoin?\nFollow-up topic: compatible ark',
  );
});

test('a mixed follow-up reads its question clause, never the personal sentence beside it', () => {
  const namedTopic = rewrite(BITCOIN_EXCHANGE, "I'm new to this. What about Lightning?");
  assert.equal(namedTopic, 'lightning');

  const inherited = rewrite(BITCOIN_EXCHANGE, "I'm new to this. Can you explain more?");
  assert.equal(inherited, 'Explain what is Bitcoin?');
  assert.doesNotMatch(inherited ?? '', /new to/i);
});

test('a generic follow-up after a topic change uses the latest subject', () => {
  const afterTopicChange: Message[] = [
    ...BITCOIN_EXCHANGE,
    { role: 'user', content: 'What about Lightning?' },
    { role: 'assistant', content: 'Lightning is a payment network on top of Bitcoin.' },
  ];

  assert.equal(rewrite(afterTopicChange, 'Pourquoi ?'), 'lightning');
  assert.equal(rewrite(afterTopicChange, 'Tell me more'), 'lightning');
});

test('an unrelated standalone question breaks the chain', () => {
  const afterStandalone: Message[] = [
    ...BITCOIN_EXCHANGE,
    { role: 'user', content: 'How does Lightning routing work?' },
    { role: 'assistant', content: 'Payments are forwarded along a path of channels.' },
  ];

  assert.equal(rewrite(afterStandalone, 'Tell me more'), 'How does Lightning routing work?');
});

test('repeated follow-ups keep reaching the subject instead of quoting each other', () => {
  const repeated: Message[] = [
    ...BITCOIN_EXCHANGE,
    { role: 'user', content: 'Can you explain that more?' },
    { role: 'assistant', content: 'More detail about Bitcoin.' },
    { role: 'user', content: 'Tell me more' },
    { role: 'assistant', content: 'Even more detail about Bitcoin.' },
  ];

  const query = rewrite(repeated, 'Et pourquoi ?');
  assert.equal(query, 'Explain what is Bitcoin?');
  assert.doesNotMatch(query ?? '', /Follow-up topic/);
});

test('a personal declaration or a memory question is never inherited', () => {
  const personalHistory: Message[] = [
    { role: 'user', content: 'I am building Alice Wallet. I prefer concise answers.' },
    { role: 'assistant', content: 'Got it.' },
    { role: 'user', content: 'Que sais-tu de moi ?' },
    { role: 'assistant', content: 'You are building Alice Wallet and prefer concise answers.' },
  ];

  const query = rewrite(personalHistory, 'Pourquoi ?');
  assert.equal(query, 'Pourquoi ?');
  assert.doesNotMatch(query ?? '', /Alice Wallet|concise|sais/i);
  // Nothing safe is left to continue, so the turn does not search at all.
  assert.equal(rewrite(personalHistory, 'Développe'), null);
});

test('a mixed turn contributes only its question clause', () => {
  const mixedHistory: Message[] = [
    { role: 'user', content: "I'm new to UTXOs. What is a change output?" },
    { role: 'assistant', content: 'A change output returns the remainder to you.' },
  ];

  const query = rewrite(mixedHistory, 'Pourquoi ?');
  assert.equal(query, 'What is a change output?');
  assert.doesNotMatch(query ?? '', /I'm new/);
});

test('assistant answers are never a retrieval source', () => {
  const history: Message[] = [
    { role: 'user', content: 'Explain what is Bitcoin?' },
    { role: 'assistant', content: 'Bitcoin settles on-chain, and CoinJoin can improve privacy.' },
  ];

  const query = rewrite(history, 'Tell me more');
  assert.equal(query, 'Explain what is Bitcoin?');
  assert.doesNotMatch(query ?? '', /CoinJoin|on-chain/);
});

test('the rewrite reads the history without mutating it', () => {
  const history: Message[] = [
    ...BITCOIN_EXCHANGE,
    { role: 'user', content: 'Pourquoi ?' },
  ];
  const snapshot = JSON.stringify(history);

  rewriteRetrievalQuery({ history, userMessage: 'Pourquoi ?', plan: planAliceTurn('Pourquoi ?') });

  assert.equal(JSON.stringify(history), snapshot);
});

test('a caller that has not appended the current message yet gets the same query', () => {
  assert.equal(
    rewriteRetrievalQuery({
      history: BITCOIN_EXCHANGE,
      userMessage: 'Pourquoi ?',
      plan: planAliceTurn('Pourquoi ?'),
    }),
    'Explain what is Bitcoin?',
  );
});

test('the inherited subject and the added topic are both bounded', () => {
  const longSubject = `Explain how ${'Lightning routing liquidity '.repeat(20)}?`;
  const longHistory: Message[] = [
    { role: 'user', content: longSubject },
    { role: 'assistant', content: 'A long answer.' },
  ];

  const inherited = rewrite(longHistory, 'Pourquoi ?') ?? '';
  assert.ok(inherited.length <= MAX_REWRITTEN_QUERY_CHARS, `${inherited.length}`);
  assert.ok(inherited.length < longSubject.length);
  assert.match(inherited, /^Explain how Lightning routing liquidity/);

  const longFollowUp = `Et ça marche avec ${'Ark Arkade vTXO mining privacy covenants '.repeat(5)}?`;
  const combined = rewrite(BITCOIN_EXCHANGE, longFollowUp) ?? '';
  const [anchor, topic] = combined.split('\n');
  assert.equal(anchor, 'Explain what is Bitcoin?');
  assert.ok(combined.length <= MAX_REWRITTEN_QUERY_CHARS, `${combined.length}`);
  assert.ok((topic ?? '').replace('Follow-up topic: ', '').split(' ').length <= 6);
});

test('the history walk stops instead of scanning an unbounded conversation', () => {
  const longChain: Message[] = [...BITCOIN_EXCHANGE];
  for (let turn = 0; turn < 6; turn++) {
    longChain.push({ role: 'user', content: 'Tell me more' });
    longChain.push({ role: 'assistant', content: `Detail ${turn}.` });
  }

  // The subject now sits further back than the scanned window: the rewrite
  // gives up rather than walking the whole conversation.
  assert.equal(rewrite(longChain, 'Pourquoi ?'), 'Pourquoi ?');
});

test('a follow-up with no earlier turn to inherit falls back to its own clause', () => {
  assert.equal(rewrite([], 'Pourquoi ?'), 'Pourquoi ?');
  assert.equal(rewrite([], 'Développe'), null);
});

test('a French "ça" refers back only as the subject of a short question', () => {
  const standalone = "Quand j'envoie des bitcoins est-ce que ça passe par une banque ?";
  assert.equal(rewrite(BITCOIN_EXCHANGE, standalone), standalone);
  assert.match(rewrite(BITCOIN_EXCHANGE, 'Comment ça fonctionne avec le multisig ?') ?? '', /^Explain what is Bitcoin\?\nFollow-up topic: .*multisig/);
});

test('an adverbial follow-up keeps the previous subject instead of becoming a topic change', () => {
  for (const message of ['Et concrètement ?', 'Et en pratique ?', 'And in practice?']) {
    const query = rewrite(BITCOIN_EXCHANGE, message) ?? '';
    assert.match(query, /^Explain what is Bitcoin\?/, message);
    assert.doesNotMatch(query, /concretement|pratique|practice/, message);
  }
});

test('named protocol questions retain their subject when the planner extracts a later clause', () => {
  const q = "Pour comprendre Ark sans parler d'un produit particulier : si une dépense normale nécessite ma signature, puis-je en déduire que l'opérateur ne pourra jamais récupérer les fonds, même si je laisse passer l'expiration ?";
  assert.doesNotMatch(planAliceTurn(q).retrievalQuery!, /Ark/);
  assert.match(rewrite(BITCOIN_EXCHANGE, q)!, /^Ark .*security.*expiry/);
  assert.match(rewrite(BITCOIN_EXCHANGE, "Does CoinJoin erase transaction history or protect ownership privacy?")!, /^CoinJoin /);
});

test('protocol focusing does not inherit old topics or steal comparisons and personal introductions', () => {
  assert.equal(rewrite([{ role: 'user', content: 'Explain Ark security.' }], 'What is a change output?'), 'What is a change output?');
  for (const q of ['Compare Ark and CoinJoin privacy.', 'I use Ark. What is a recovery phrase?', 'Not about Ark: explain recovery phrases.']) {
    assert.equal(rewrite([], q), planAliceTurn(q).retrievalQuery);
  }
});

test('focused protocol queries retrieve the named material through production lexical retrieval', async () => {
  const { loadRagEvaluationRuntime } = await import('../../../scripts/rag-eval-runtime.mjs');
  const runtime = await loadRagEvaluationRuntime(`export { loadRagCorpus, buildRagTurnContext } from './packages/alice-ai/src/rag.ts';`, { evaluationPreferences: {} });
  await runtime.loadRagCorpus();
  for (const [question, topic] of [
    ["Pour comprendre Ark, puis-je croire que la signature protège mes fonds après expiration ?", /Topic: Les hypothèses de sécurité d’Ark/],
    ["Un CoinJoin efface-t-il l'historique des bitcoins ? Explique ce qu'un observateur de la blockchain voit et pourquoi les dépenses ultérieures comptent.", /Topic: Comprendre CoinJoin/],
  ] as const) {
    const query = rewrite(BITCOIN_EXCHANGE, question);
    const result = await runtime.buildRagTurnContext(query, undefined, { maxChunks: 3, targetLanguage: 'fr', maxContextChars: 6000 });
    assert.match(result.ragContext!, topic);
  }
});


test('a referential loss conclusion after dust economics keeps that subject', () => {
  const previous: Message[] = [{ role: 'user', content: 'Pourquoi cette sortie dust est-elle non rentable à dépenser avec ces frais ?' }];
  assert.match(rewrite(previous, 'Donc ces 1 000 sats sont définitivement perdus ?')!, /^dust uneconomic/);
  for (const q of ['Donc ces clés perdues signifient que mes sats sont perdus ?', 'Donc cette phrase de récupération est perdue ?', 'Donc ces fonds sont volés après un piratage ?']) {
    assert.doesNotMatch(rewrite(previous, q) ?? '', /^dust uneconomic/);
  }
  assert.doesNotMatch(rewrite([...previous, { role: 'user', content: 'What is a seed phrase?' }], 'So these funds are lost?') ?? '', /^dust uneconomic/);
});


test('arkoor names Ark even in a compound exit-confirmation follow-up', () => {
  const q = 'What must be ready for a unilateral exit before the deadline, including confirmation? And separately, why can an arkoor recipient face collusion with an earlier holder?';
  assert.match(rewrite([], q)!, /^Ark .*security/);
});

test('a directional channel follow-up preserves Lightning despite question-clause extraction', () => {
  const prior: Message[] = [{role:'user',content:'Pourquoi mon canal Lightning financé par moi ne permet-il pas de recevoir ?'}, {role:'assistant',content:'A previous generated answer.'}];
  const follow = "Donc si je paie un commerçant par ce canal, je pourrai forcément recevoir ensuite exactement la même somme depuis n'importe quel autre nœud ?";
  assert.equal(rewrite(prior, follow), 'Lightning channel liquidity receiving sending route capacity');
  assert.equal(rewrite(prior, 'If I spend through this channel, can I receive from any other node?'), 'Lightning channel liquidity receiving sending route capacity');
  assert.notEqual(rewrite([], follow), 'Lightning channel liquidity receiving sending route capacity');
  assert.notEqual(rewrite([{role:'user',content:'I prefer Lightning payments.'}], follow), 'Lightning channel liquidity receiving sending route capacity');
  assert.notEqual(rewrite([{role:'assistant',content:'Lightning channel'}], follow), 'Lightning channel liquidity receiving sending route capacity');
});
test('invoice status follow-up inherits only the immediately previous user protocol', () => {
  const prior: Message[] = [{role:'user',content:'Pourquoi ma facture Lightning BOLT11 expirée reste-t-elle en cours ?'}];
  assert.equal(rewrite(prior, 'La nouvelle facture est aussi en cours, que faire ?'), 'Lightning BOLT11 invoice expiry pending payment status retry');
  for (const message of ['Cette facture bancaire est en cours, que faire ?', 'Autre sujet : une facture est en cours, que faire ?', 'How does RBF replace this pending transaction?']) {
    assert.notEqual(rewrite(prior,message),'Lightning BOLT11 invoice expiry pending payment status retry');
  }
  const switched: Message[] = [...prior,{role:'user',content:'Comment fonctionne une facture bancaire ?'}];
  assert.notEqual(rewrite(switched,'La nouvelle facture est en cours, que faire ?'),'Lightning BOLT11 invoice expiry pending payment status retry');
});

test('invoice disclosure retains explicitly introduced BOLT11 without inheriting another protocol', () => {
  for (const question of [
    'I have a BOLT11 payment request from a merchant. Does the invoice reveal an amount and recipient?',
    'Je souhaite partager une facture BOLT11. La facture révèle-t-elle des informations sur le destinataire ?',
  ]) assert.equal(rewrite([], question), 'Lightning BOLT11 invoice decoding privacy amount payee public key payment hash');
  const prior: Message[] = [{role:'user', content:'My BOLT11 Lightning invoice expired while payment was pending. What happens?'}];
  for (const question of [
    'How does a new BOLT12 invoice work?',
    'Comment fonctionne une nouvelle facture BOLT12 ?',
    'How does a new invoice encode its description?',
    'I also use BOLT11. Is my bank invoice public?',
    'I have a BOLT11 invoice. How do Ethereum invoice fields work?',
    'I have a BOLT11 invoice. What is proof of work?',
  ]) assert.equal(rewrite(prior, question), planAliceTurn(question).retrievalQuery, question);
  assert.equal(rewrite(prior, 'This invoice still says pending. Can a new invoice cancel it?'), 'Lightning BOLT11 invoice expiry pending payment status retry');
});

test('operator collusion follow-ups inherit only an immediately preceding Ark user subject', () => {
  const prior: Message[] = [{role:'user',content:'Who must I trust when using Ark?'}];
  for (const q of ['And what changes if the operator colludes with participants?', 'Et si le serveur s’allie avec un ancien émetteur ?', 'Donc une collusion de l’opérateur change quoi ?']) assert.equal(rewrite(prior,q),'Ark arkoor operator security collusion previous sender double spend',q);
  const follow='And what changes if the operator colludes with participants?';
  for (const history of [[],[{role:'assistant' as const,content:'Ark operators may collude.'}],[...prior,{role:'user' as const,content:'How does a Lightning channel work?'}],[{role:'user' as const,content:'I prefer using Ark.'}]]) assert.notEqual(rewrite(history,follow),'Ark arkoor operator security collusion previous sender double spend');
  assert.notEqual(rewrite(prior,'And what changes if a bank operator colludes with participants?'),'Ark arkoor operator security collusion previous sender double spend');
});

const freshLightning = ["I want to pay a museum's Lightning invoice. Walk me through how the payment reaches the museum and completes.", "My wallet gives up finding a route before it sends anything. Is my channel balance now frozen?", "Separately, the other peer broadcasts an old revoked commitment. What must my wallet or watchtower actually do?"];
const freshIssuanceFr = ["Prenons des valeurs fictives : subvention autorisée de 8000 sat, frais inclus de 600 sat, sorties de coinbase de 8300 sat. Quel est le plafond autorisé et l’augmentation nette de la quantité de bitcoins ? Cette coinbase respecte-t-elle la limite ?", "Je conserve la subvention et le montant réclamé dans la coinbase, mais les frais inclus passent à 350 sat. Refais les deux calculs.", "Avec ces nouveaux frais, un mineur pourrait-il réclamer 8400 sat si sa preuve de travail est plus forte ?"];
test('a current payment walkthrough retains the explicit Lightning setup through a route follow-up',()=>{
 const first=rewrite([],freshLightning[0]); assert.match(first!,/Lightning/); assert.doesNotMatch(first!,/museum/);
 const second=rewrite([{role:'user',content:freshLightning[0]},{role:'assistant',content:'Incorrect on-chain narrative'}],freshLightning[1]);
 assert.match(second!,/Lightning/);assert.match(second!,/route failure/);assert.doesNotMatch(second!,/Incorrect/);
 for(const q of ['I use Lightning. Walk me through a bank payment.', 'I use Lightning. Walk me through a Bitcoin on-chain payment.', 'I use Lightning. Walk me through SQL transactions.', 'I use Lightning. Explain invoice privacy.'])assert.doesNotMatch(rewrite([],q)??'',/normal flow of a Lightning invoice payment/,q);
 assert.doesNotMatch(rewrite([{role:'user',content:'I use Lightning.'}],freshLightning[1])??'',/Lightning/);
 assert.doesNotMatch(rewrite([{role:'user',content:freshLightning[0]},{role:'user',content:'Explain Ethereum.'}],freshLightning[1])??'',/Lightning/);
});
test('a French hypothetical coinbase follow-up retains monetary context from user values only',()=>{
 const history:Message[]=[];
 for(const q of freshIssuanceFr){assert.match(rewrite(history,q)??'',/coinbase monetary issuance/);history.push({role:'user',content:q},{role:'assistant',content:'Incorrect earlier answer: net issuance is 8000 sat.'});}
 assert.doesNotMatch(rewrite([{role:'assistant',content:freshIssuanceFr[0]}],freshIssuanceFr[1])??'',/coinbase monetary issuance/);
 assert.doesNotMatch(rewrite([{role:'user',content:freshIssuanceFr[0]},{role:'user',content:'Explain Lightning.'}],freshIssuanceFr[2])??'',/coinbase monetary issuance/);
});
