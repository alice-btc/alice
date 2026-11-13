import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  ANSWER_RULES,
  ANSWER_RULES_MAX_CHARS,
  NEVER_CLAIM_CHECKS,
  answerRuleCorrectionsIn,
  answerRuleViolationsIn,
  answerRuleRepairGuidance,
  answerRuleNoteIdsIn,
  answerRuleNoteIdsInMessages,
  answerRuleNoteIdsOnSubject,
  answerRulesBlock,
  withAnswerRuleCorrections,
} from './answer-rules.ts';
import { knowledgeContextCharLimit } from './knowledge-context-budget.ts';
import { LOCAL_CONTEXT_TOKENS, LOCAL_MIN_RESPONSE_TOKENS, fitMessagesToEstimatedLocalContext } from './local-context-budget.ts';
import type { Message } from './llm.ts';
import { loadRagEvaluationRuntime } from '../../../scripts/rag-eval-runtime.mjs';

const ARK = ['asp-operator', 'ark-rounds-exits'];
const RBF = ['replace-by-fee', 'transaction-finality'];
const MULTISIG = ['multisig'];
const SEED = ['seed-backup'];

test('RBF refutations do not trigger corrections, but another false sentence still does', () => {
  for (const [language, answer] of [
    ['en', 'It is false that replacement works only if RBF was enabled. Full-RBF does not require that signal.'],
    ['fr', "Il est faux que RBF ne fonctionne que si le signal était activé."],
    ['en', 'It is a myth that you should send another payment to the same recipient.'],
  ] as const) assert.deepEqual(withAnswerRuleCorrections(answer, language, RBF).applied, [], answer);
  assert.deepEqual(withAnswerRuleCorrections(
    'Full-RBF exists. Replacement works only if RBF was enabled.', 'en', RBF,
  ).applied, ['rbf-opt-in-precondition']);
  assert.deepEqual(withAnswerRuleCorrections(
    'It is a myth that RBF guarantees confirmation. Send another payment to the same recipient.', 'en', RBF,
  ).applied, ['rbf-second-payment']);
});

test('invented Alice App wallet actions get a correction even without retrieved notes', () => {
  for (const [language, answer] of [
    ['en', 'In Alice App, you can start a unilateral exit.'],
    ['fr', 'Dans Alice, tu peux lancer une sortie unilatérale.'],
    ['en', 'You can send real funds using Alice App.'],
    ['fr', 'Tu peux remplacer ta transaction via RBF dans Alice.'],
  ] as const) {
    const result = withAnswerRuleCorrections(answer, language, []);
    assert.deepEqual(result.applied, ['alice-app-wallet-capability'], answer);
    assert.equal(withAnswerRuleCorrections(result.text, language, []).text, result.text);
  }
  for (const answer of [
    'Alice App cannot start a unilateral exit.',
    'Alice App explains how to start a unilateral exit in your Ark wallet.',
    'You can learn how to send real funds with Alice App.',
    'Dans Alice, tu ne peux pas lancer une sortie unilatérale.',
    'Alice App can read a public address or xpub in Explorer.',
    'You can send test coins in the Alice Playground.',
    'Alice Wallet can start a unilateral exit.',
    'You can start a unilateral exit using Alice Wallet.',
    'Tu peux lancer une sortie unilatérale dans Alice Wallet.',
    'You can launch a unilateral exit from your Ark wallet.',
  ]) assert.deepEqual(withAnswerRuleCorrections(answer, 'en', []).applied, [], answer);
});
const COMBINATIONS = [
  ['ark-rounds-exits'], ['asp-operator'], ['asp-operator', 'ark-rounds-exits'], ['ark-rounds-exits', 'asp-operator'],
  ['multisig'], ['replace-by-fee'], ['transaction-finality'], ['replace-by-fee', 'transaction-finality'],
  ['seed-backup'], ['seed-backup', 'multisig'], ['multisig', 'seed-backup'],
  ['transaction-fees'], ['dust'], ['transaction-fees', 'dust'], ['replace-by-fee', 'transaction-fees'],
];

test('fee and small-output rules preserve the units and economic limits', () => {
  const fr = answerRulesBlock(['transaction-fees', 'dust'], 'fr');
  assert.match(fr, /vB signifie octet virtuel/);
  assert.match(fr, /n’accumule pas de frais en attendant/);
  assert.match(fr, /paie toujours chaque entrée/);
  assert.match(fr, /politique de relais du dust/);
  assert.deepEqual(answerRuleNoteIdsOnSubject(['transaction-fees', 'dust'], 'What is Lightning?'), []);
});

const retrievedText = (...titles: string[]) => titles.map(title => `Topic: ${title}\nLevel: advanced\nNotes: text`).join('\n\n');

test('the instruction block states the mandatory points of the notes in context, once, in the turn language', () => {
  const en = answerRulesBlock(['asp-operator', 'ark-rounds-exits'], 'en');
  assert.ok(en.startsWith('[Answer rules]\n'));
  assert.match(en, /^State:$/m);
  assert.match(en, /^Never claim:$/m);
  assert.match(en, /unilateral exit without the operator/);
  assert.match(en, /refreshed or exited before its expiry/);
  // Shared sentences of the two Ark notes appear a single time.
  assert.equal(en.split('valid exit data can start').length, 2);
  const fr = answerRulesBlock(['replace-by-fee', 'transaction-finality'], 'fr');
  assert.match(fr, /^À dire :$/m);
  assert.match(fr, /full-RBF, comportement par défaut de Bitcoin Core depuis la version 28\.0/);
  assert.match(fr, /N'envoie jamais un second paiement indépendant/);
  assert.equal(fr, answerRulesBlock(['replace-by-fee'], 'fr'), 'the finality note adds no line to the RBF note');
  const multisig = answerRulesBlock(['multisig'], 'en');
  assert.match(multisig, /a 2-of-3 wallet spends with any two of its three keys/);
  assert.match(multisig, /that a 2-of-3 wallet needs three signatures or the third seed/);
  const seed = answerRulesBlock(['seed-backup'], 'fr');
  assert.match(seed, /à la main sur papier ou grave-la sur métal/);
  assert.match(seed, /^- qu'une photo, une capture d'écran, un fichier dans le cloud, une note ou un gestionnaire de mots de passe convient pour la phrase, même chiffré$/m);
  assert.match(answerRulesBlock(['seed-backup'], 'en'), /^- that a single copy, or a copy kept with the device, is enough$/m);
  assert.equal(answerRulesBlock([], 'en'), '');
  assert.equal(answerRulesBlock(['bitcoin-basics', 'lightning-introduction'], 'fr'), '');
});

test('every block fits its budget and a worst-case local prompt still leaves room for the answer', () => {
  for (const ids of COMBINATIONS) {
    for (const language of ['en', 'fr'] as const) {
      const block = answerRulesBlock(ids, language);
      assert.ok(block.length > 0 && block.length <= ANSWER_RULES_MAX_CHARS, `${ids.join('+')} ${language}: ${block.length}`);
    }
  }
  // Under a tighter budget the never-claim lines give way first; the block never comes back empty while a point fits.
  const tight = answerRulesBlock(['asp-operator', 'ark-rounds-exits'], 'fr', 700);
  assert.ok(tight.length > 0 && tight.length <= 700);
  assert.match(tight, /^À dire :$/m);
  assert.doesNotMatch(tight, /^À ne jamais affirmer :$/m);
  assert.equal(answerRulesBlock(['multisig'], 'en', 50), '');
  // Leading policy, a context message at the local knowledge cap plus the largest block, reminder and question.
  const largest = Math.max(...COMBINATIONS.flatMap(ids => (['en', 'fr'] as const).map(language => answerRulesBlock(ids, language).length)));
  const messages: Message[] = [
    { role: 'system', content: 'p'.repeat(4800) },
    { role: 'system', content: `[Retrieved knowledge]\n${'n'.repeat(knowledgeContextCharLimit(true))}\n\n[Pedagogical context]\n${'c'.repeat(300)}\n\n${'r'.repeat(largest)}` },
    { role: 'system', content: 'o'.repeat(420) },
    { role: 'user', content: 'q'.repeat(200) },
  ];
  const fitted = fitMessagesToEstimatedLocalContext(messages, 1024, LOCAL_CONTEXT_TOKENS);
  assert.equal(fitted.messages.length, messages.length, 'no application context is dropped');
  assert.ok(fitted.responseTokens >= LOCAL_MIN_RESPONSE_TOKENS);
});

test('user-facing rule text carries no em dash and no digit that could read as a live value', () => {
  for (const rule of ANSWER_RULES) {
    for (const language of ['en', 'fr'] as const) {
      for (const line of [...rule.mustState[language], ...rule.neverClaim[language]]) assert.doesNotMatch(line, /[—–]/, line);
    }
  }
  for (const check of NEVER_CLAIM_CHECKS) {
    for (const language of ['en', 'fr'] as const) {
      assert.doesNotMatch(check.correction[language], /[—–]/, check.id);
      assert.doesNotMatch(check.correction[language], /\bsat\/vb\b|\d+ sats?\b/i, check.id);
    }
  }
  for (const language of ['en', 'fr'] as const) assert.doesNotMatch(answerRulesBlock(['multisig'], language), /[—–]/);
});

test('the rule notes are read from the retrieved text, in retrieval order, and from the system turns of a history', () => {
  assert.deepEqual(answerRuleNoteIdsIn(retrievedText('Ark operator / ASP', 'Ark introduction')), ['asp-operator']);
  assert.deepEqual(answerRuleNoteIdsIn(retrievedText('Bitcoin finality', 'Replace-by-fee')), ['transaction-finality', 'replace-by-fee']);
  assert.deepEqual(answerRuleNoteIdsIn('Topic: Bitcoin multisig\nLevel: intermediate\nNotes: x'), ['multisig']);
  assert.deepEqual(answerRuleNoteIdsIn('Notes: the Ark operator / ASP coordinates rounds'), [], 'a mention inside a note body is not the note');
  assert.deepEqual(answerRuleNoteIdsIn(''), []);
  assert.deepEqual(answerRuleNoteIdsInMessages([
    { role: 'system', content: 'policy' },
    { role: 'user', content: 'Topic: Bitcoin multisig' },
    { role: 'system', content: `[Retrieved knowledge]\n${retrievedText('Ark rounds and exits')}` },
    { role: 'user', content: 'question' },
  ]), ['ark-rounds-exits'], 'a user turn cannot activate a rule');
});

// Verbatim sentences from the 2026-10-06 reviews (Qwen3.5 9B and Private Cloud).
const WRONG_CLAIMS: [string, string, string[], string][] = [
  // The Private Cloud model, 2026-10-30, with the dictionary definition of Ark in context.
  ['en', 'Ark is a layer‑1 scaling protocol built on Bitcoin that lets many users share and move funds through special outputs called Virtual Transaction Outputs (VTXOs).', ARK, 'ark-layer-one'],
  ['en', 'Think of it as a base-layer protocol called Ark that batches payments.', ARK, 'ark-layer-one'],
  ['fr', "Ark est un protocole de couche 1 qui permet à plusieurs utilisateurs de partager des UTXO.", ARK, 'ark-layer-one'],
  ['fr', "Ark est essentiellement une première couche de Bitcoin.", ARK, 'ark-layer-one'],
  ['en', 'If the operator stops cooperating, it may refuse to process new transactions or validate existing ones, effectively locking your ability to exit the off-chain network until the situation resolves.', ARK, 'ark-operator-blocks-exit'],
  ['en', 'If the operator disappears, your funds are gone.', ARK, 'ark-funds-lost'],
  ['en', 'Once the vTXO expires, it becomes recoverable on-chain even without the operator.', ARK, 'ark-expiry-inverted'],
  ['en', 'No, having two seed phrases is not enough to recover your coins if your setup requires a "2-of-3" multisig threshold.', MULTISIG, 'multisig-quorum-inflated'],
  ['en', 'If you only have two seeds and the wallet requires three signatures, the transaction cannot be signed, and the funds remain locked.', MULTISIG, 'multisig-quorum-inflated'],
  ['en', 'Would you like help with restoring the wallet in Alice, learning how to locate or recreate the descriptor, or tips on backing up the remaining seed securely?', MULTISIG, 'multisig-alice-capability'],
  ['en', 'Replacement works only if RBF was enabled when you sent the transaction.', RBF, 'rbf-opt-in-precondition'],
  ['en', 'If you need a faster confirmation, check whether your wallet offers a fee‑bump or “accelerate” option; otherwise you may need to wait for the original transaction to confirm or create a new transaction with fresh inputs.', RBF, 'rbf-second-payment'],
  ['fr', 'Si vous tentez de vous retirer de son système hors chaîne, il peut refuser de traiter votre demande de sortie.', ARK, 'ark-operator-blocks-exit'],
  ['fr', "Si l'opérateur ferme ses portes ou décide de ne plus traiter les virements, vous restez coincé jusqu'à ce que la solution soit trouvée ou que le cycle expire.", ARK, 'ark-operator-blocks-exit'],
  ['fr', 'Retenir indéfiniment un vTXO : à l’expiration, le vTXO devient récupérable sur la chaîne principale, même sans l’opérateur.', ARK, 'ark-expiry-inverted'],
  ['fr', 'Non, avoir 2 de vos 3 seeds ne suffit généralement pas pour récupérer vos bitcoins dans une configuration multisig 3 de 3.', MULTISIG, 'multisig-quorum-inflated'],
  ['fr', "Pour qu'une wallet multisig fonctionne, il faut atteindre un seuil de validation précis : dans votre cas, il faut 3 signatures valides sur 3 clés autorisées.", MULTISIG, 'multisig-quorum-inflated'],
  ['fr', 'Importer vos deux seeds dans Alice Wallet pour créer le portefeuille 2‑sur‑3 et préparer une transaction de récupération.', MULTISIG, 'multisig-alice-capability'],
  ['fr', "Cette méthode ne fonctionne que si le réseau accepte le remplacement de votre transaction spécifique (selon sa politique de relais) et que vous avez signalé l'option RBF.", RBF, 'rbf-opt-in-precondition'],
  ['fr', "Si le paiement était déjà très rapide ou si l'option n'était pas activée, le remplacement peut être impossible.", RBF, 'rbf-opt-in-precondition'],
  ['fr', 'Si RBF n’est pas activé : vous ne pouvez pas remplacer la transaction.', RBF, 'rbf-opt-in-precondition'],
  // The Private Cloud model on the seed backup questions, 2026-11-02: a digital copy accepted under a condition.
  ['en', 'Yes, you can keep a photo of your recovery phrase in your password manager as long as the vault is encrypted and protected by a strong master password.', SEED, 'seed-digital-copy'],
  ['en', 'Storing an encrypted copy of your seed in the cloud is a reasonable backup.', SEED, 'seed-digital-copy'],
  ['en', 'A note on your phone is fine if the device is locked.', SEED, 'seed-digital-copy'],
  ['en', 'You can also save the words in an encrypted file on a USB stick.', SEED, 'seed-digital-copy'],
  ['fr', 'Oui, tu peux garder une photo de ta phrase dans ton gestionnaire de mots de passe si celui-ci est chiffré.', SEED, 'seed-digital-copy'],
  ['fr', 'Un fichier chiffré dans le cloud reste une sauvegarde acceptable.', SEED, 'seed-digital-copy'],
  ['fr', "Une note sur ton téléphone suffit si l'appareil est verrouillé.", SEED, 'seed-digital-copy'],
  ['fr', 'Tu peux aussi enregistrer les mots dans une note chiffrée.', SEED, 'seed-digital-copy'],
];

const RIGHT_CLAIMS: [string, string, string[]][] = [
  ['en', 'Ark is a protocol built on top of Bitcoin, not a layer one; its rounds are anchored in on-chain transactions.', ARK],
  ['en', 'Each round anchors the VTXOs in a regular layer-1 Bitcoin transaction.', ARK],
  ['en', 'Is Ark a layer-1 protocol? No: it sits on top of Bitcoin.', ARK],
  ['fr', 'Ark est un protocole de couche supérieure, de type joinpool, sur Bitcoin.', ARK],
  ['fr', "Les rounds d'Ark sont ancrés sur la couche de base par des transactions Bitcoin ordinaires.", ARK],
  ['en', 'However, it cannot move your funds without your explicit signature, nor can it prevent you from exiting the system unilaterally.', ARK],
  ['en', 'Your ability to exit remains available even if the operator decides to withdraw support, though the cost or delay of that exit may increase.', ARK],
  ['en', 'Your funds are not gone if an Ark operator disappears.', ARK],
  ['en', 'A vTXO that approaches its expiry must be refreshed or exited before that deadline or its value returns to the operator.', ARK],
  ['en', 'Also, attempting to send a new payment to the same address as a substitute is not a valid replacement and could result in losing funds.', RBF],
  ['en', 'Nodes that follow the opt‑in rule will only consider replacements for transactions that carry this flag.', RBF],
  ['en', 'Use a small test transaction when sending to a new address for the first time.', RBF],
  ['en', 'In a 2‑of‑3 setup you need any two of the three keys; in a 3‑of‑3 you need all three.', MULTISIG],
  ['en', 'If the wallet is a 3‑of‑3 scheme, two seeds are not enough—you’d need the third seed (or the missing private key) to meet the required threshold.', MULTISIG],
  ['en', 'Two seeds alone are not enough in a 2-of-3 without the descriptor that holds the third public key.', MULTISIG],
  ['fr', "Ce que l'opérateur **ne peut pas faire** est d'accéder à votre argent sans votre accord, de bloquer votre sortie unilatéralement ou d'annuler une transaction validée.", ARK],
  ['fr', 'Non, vos fonds ne sont pas perdus.', ARK],
  ['fr', "Un vTXO doit être rafraîchi ou sorti avant son expiration, sinon sa valeur revient à l'opérateur.", ARK],
  ['fr', "Il ne faut pas envoyer un second paiement à la même adresse pour tenter de compenser l'erreur.", RBF],
  ['fr', 'Le signalage améliore la prévisibilité, mais n’est pas une condition indispensable partout.', RBF],
  ['fr', 'Je vous recommande de vérifier si votre wallet utilise un seuil différent, par exemple 2 de 3, ou si vous avez une clé de secours spécifique pour cette troisième signature.', MULTISIG],
  ['fr', 'Vous ne devez jamais envoyer vos seeds ou fragments de clés par chat ou à un agent de support.', MULTISIG],
  ['en', 'Never keep a photo of your recovery phrase in your password manager or in the cloud.', SEED],
  ['en', 'A password manager is fine for your passwords, not for your recovery phrase.', SEED],
  ['en', 'A password manager is a good place for your website passwords.', SEED],
  ['en', 'Write it by hand on paper or stamp it on metal, and keep two copies in separate places.', SEED],
  ['en', 'Is a photo in my password manager acceptable? No, a photo can be stolen with the phone.', SEED],
  ['en', 'You can restore the wallet on your phone with the phrase.', SEED],
  ['fr', 'Ne garde jamais ta phrase en photo, dans une note ou dans un gestionnaire de mots de passe.', SEED],
  ['fr', 'Un gestionnaire de mots de passe convient pour tes mots de passe, pas pour ta phrase de récupération.', SEED],
  ['fr', 'Le gestionnaire de mots de passe est une bonne solution pour tes comptes en ligne.', SEED],
  ['fr', 'Écris-la sur papier ou sur métal, en deux copies rangées dans des lieux différents.', SEED],
  ['fr', 'Une photo sur un téléphone connecté expose la phrase à tout logiciel malveillant.', SEED],
  ['fr', 'Tu peux restaurer le portefeuille sur ton téléphone avec la phrase.', SEED],
];

test('the never-claim checks catch the recorded wrong sentences, in French and in English', () => {
  for (const [language, sentence, notes, expected] of WRONG_CLAIMS) {
    const result = withAnswerRuleCorrections(sentence, language as 'en' | 'fr', notes);
    assert.deepEqual(result.applied, [expected], sentence);
    const correction = NEVER_CLAIM_CHECKS.find(check => check.id === expected)!.correction[language as 'en' | 'fr'];
    assert.ok(result.text.endsWith(correction), sentence);
    assert.ok(result.text.startsWith(sentence));
  }
});

test('the checks leave the recorded correct sentences and the deterministic replies alone', () => {
  for (const [language, sentence, notes] of RIGHT_CLAIMS) {
    const result = withAnswerRuleCorrections(sentence, language as 'en' | 'fr', notes);
    assert.deepEqual(result.applied, [], sentence);
    assert.equal(result.text, sentence);
  }
  // The correction sentences themselves never trigger a check.
  for (const check of NEVER_CLAIM_CHECKS) {
    for (const language of ['en', 'fr'] as const) {
      assert.deepEqual(withAnswerRuleCorrections(`Answer. ${check.correction[language]}`, language, [...ARK, ...RBF, ...MULTISIG, ...SEED]).applied, []);
    }
  }
});

test('a check runs only for the notes in context and defers to a threshold the user stated', () => {
  const inflated = 'If you only have two seeds and the wallet requires three signatures, the transaction cannot be signed.';
  assert.deepEqual(withAnswerRuleCorrections(inflated, 'en', RBF).applied, []);
  assert.deepEqual(withAnswerRuleCorrections(inflated, 'en', []).applied, []);
  assert.deepEqual(withAnswerRuleCorrections(inflated, 'en', MULTISIG, 'I have 2 of my 3 multisig seeds. Is that enough?').applied, ['multisig-quorum-inflated']);
  assert.deepEqual(withAnswerRuleCorrections(inflated, 'en', MULTISIG, 'My wallet is a 3-of-3 and I hold two seeds.').applied, []);
  assert.deepEqual(withAnswerRuleCorrections('Dans votre cas, il faut 3 signatures sur 3.', 'fr', MULTISIG, "J'ai un multisig 3 de 3.").applied, []);
});

test('the Ark rules follow a retrieved Ark note only when the user raised Ark', () => {
  // fr-a03 retrieved "Entrer et sortir d’Ark" on 2026-11-02 and the answer got an exit paragraph.
  const mempool = "Où attend ma transaction avant d'entrer dans un bloc ?";
  assert.deepEqual(answerRuleNoteIdsOnSubject(['ark-rounds-exits', 'asp-operator', 'dictionary-ark'], mempool), []);
  assert.deepEqual(answerRuleNoteIdsOnSubject(['ark-rounds-exits', 'multisig', 'replace-by-fee'], mempool), ['multisig', 'replace-by-fee']);
  assert.deepEqual(answerRuleNoteIdsOnSubject(['asp-operator'], 'Why is a Lightning payment sometimes not cheaper than an on-chain one?'), []);
  for (const question of [
    "Si l'opérateur Ark disparaît demain, mes fonds sont-ils perdus ?",
    'What can an Ark operator do with my money?',
    'How do Arkade rounds work?',
    'Can a VTXO expire?',
    "C'est quoi un ASP ?",
    // A follow-up keeps the subject of the earlier turn.
    "Que peut faire un opérateur Ark ?\nEt s'il disparaît ?",
  ]) assert.deepEqual(answerRuleNoteIdsOnSubject(['asp-operator', 'ark-rounds-exits'], question), ['asp-operator', 'ark-rounds-exits'], question);
  assert.deepEqual(answerRuleNoteIdsOnSubject(['dictionary-ark'], 'Is Ark a layer 1?'), ['dictionary-ark']);
  assert.deepEqual(answerRuleNoteIdsOnSubject(['seed-backup', 'multisig'], 'Can I keep a photo of my recovery phrase?'), ['seed-backup', 'multisig']);
  assert.deepEqual(answerRuleNoteIdsOnSubject([], mempool), []);
});

test('corrections are appended once, in the answer language, and survive a second pass', () => {
  const answer = "Si l'option n'était pas activée, le remplacement est impossible.\n\nIl ne faut pas envoyer un second paiement.";
  const once = withAnswerRuleCorrections(answer, 'fr', RBF);
  assert.deepEqual(once.applied, ['rbf-opt-in-precondition']);
  assert.match(once.text, /\n\nCorrection : le remplacement n'exige pas/);
  const twice = withAnswerRuleCorrections(once.text, 'fr', RBF);
  assert.equal(twice.text, once.text);
  assert.deepEqual(twice.applied, []);
  assert.deepEqual(answerRuleCorrectionsIn(once.text), [NEVER_CLAIM_CHECKS.find(check => check.id === 'rbf-opt-in-precondition')!.correction.fr]);
  // Two different claims get two corrections; two checks sharing a correction add it once.
  const two = withAnswerRuleCorrections('Replacement works only if RBF was enabled. Otherwise create a new transaction with fresh inputs.', 'en', RBF);
  assert.deepEqual(two.applied, ['rbf-opt-in-precondition', 'rbf-second-payment']);
  const shared = withAnswerRuleCorrections('If the operator disappears, your funds are gone, and the operator can block your exit.', 'en', ARK);
  assert.deepEqual(shared.applied, ['ark-operator-blocks-exit']);
  assert.equal(shared.text.split('Correction:').length, 2);
  assert.equal(withAnswerRuleCorrections('', 'en', ARK).text, '');
});

test('every rule names a note of the shipped corpus by its exact title, and a real retrieval activates it', async () => {
  const runtime = await loadRagEvaluationRuntime(`
    export { loadRagCorpus, retrieveContext } from './packages/alice-ai/src/rag.ts';
    export { getAllChunks } from './packages/alice-ai/src/knowledge-packs.ts';
    export { answerRuleNoteIdsIn } from './packages/alice-ai/src/answer-rules.ts';
  `);
  await runtime.loadRagCorpus();
  const chunks: { id: string; conceptId?: string; title: string }[] = runtime.getAllChunks();
  for (const rule of ANSWER_RULES) {
    const chunk = chunks.find(candidate => candidate.conceptId === rule.sourceConceptId);
    assert.ok(chunk, rule.noteId);
    assert.equal(chunk.title, rule.title, rule.noteId);
    assert.ok(answerRuleNoteIdsIn(retrievedText(chunk.title)).includes(rule.noteId));
    // Every locale variant of the note (an English translation) carries the
    // rule: the corpus loader registers their titles in the bundle's module.
    for (const variant of chunks.filter(candidate => candidate.conceptId === rule.sourceConceptId)) {
      assert.ok(runtime.answerRuleNoteIdsIn(retrievedText(variant.title)).includes(rule.noteId), variant.id);
    }
    for (const title of rule.additionalSourceTitles ?? []) {
      assert.ok(chunks.some(candidate => candidate.title === title), title);
      assert.ok(answerRuleNoteIdsIn(retrievedText(title)).includes(rule.noteId));
    }
  }
  const context: string | null = runtime.retrieveContext('Que peut faire un opérateur Ark avec mon argent, et que ne peut-il pas faire ?', { targetLanguage: 'fr', maxChunks: 2 });
  assert.ok(context);
  assert.ok(runtime.answerRuleNoteIdsIn(context).includes('asp-operator'));
  const multisig: string | null = runtime.retrieveContext('I have 2 of my 3 multisig seeds. Is that enough to recover my coins?', { targetLanguage: 'en', maxChunks: 2 });
  assert.ok(multisig);
  assert.deepEqual(runtime.answerRuleNoteIdsIn(multisig), ['multisig']);
  // The two seed backup questions of the acceptance set, in the budgets of both backends.
  for (const [language, question] of [
    ['en', 'Can I keep a photo of my recovery phrase in my password manager as a backup?'],
    ['fr', 'Puis-je garder une photo de ma phrase de récupération dans mon gestionnaire de mots de passe comme sauvegarde ?'],
  ] as const) for (const maxChunks of [1, 3]) {
    const seed: string | null = runtime.retrieveContext(question, { targetLanguage: language, maxChunks });
    assert.ok(seed, question);
    assert.ok(runtime.answerRuleNoteIdsIn(seed).includes('seed-backup'), `${question} (${maxChunks}): ${runtime.answerRuleNoteIdsIn(seed)}`);
  }
});

test('review probes: another quorum, refutations, questions, quotes and wallet limitations do not fire', () => {
  // 1. A quorum of three or more names another wallet than the user's 2-of-3.
  const probeQuestion = 'I have a 3-of-5 multisig and hold two seeds. Is that enough?';
  assert.deepEqual(withAnswerRuleCorrections('Your 3-of-5 wallet needs three signatures, so two seeds are not enough.', 'en', MULTISIG, probeQuestion).applied, []);
  assert.deepEqual(withAnswerRuleCorrections('Votre portefeuille 3 sur 5 exige trois signatures, donc deux seeds ne suffisent pas.', 'fr', MULTISIG, "J'ai un multisig 3 sur 5 et deux seeds.").applied, []);
  // The sentence guard alone, without the question: a 3-of-5 example inside a 2-of-3 answer.
  assert.deepEqual(withAnswerRuleCorrections('By contrast, a 3-of-5 wallet requires three signatures from its five keys.', 'en', MULTISIG, 'I have 2 of my 3 multisig seeds. Is that enough to recover my coins?').applied, []);
  assert.deepEqual(withAnswerRuleCorrections('Un 4 de 7, lui, il faut quatre signatures.', 'fr', MULTISIG, "J'ai 2 de mes 3 seeds multisig.").applied, []);
  // A 3-of-3 asserted for a user who said 2-of-3 is still the claim.
  assert.deepEqual(withAnswerRuleCorrections('Dans votre cas, il faut 3 signatures valides sur 3 clés autorisées.', 'fr', MULTISIG, "J'ai 2 de mes 3 seeds multisig.").applied, ['multisig-quorum-inflated']);
  // 2. Questions, quoted claims and refutations repeat the claim without making it.
  for (const [language, sentence] of [
    ['en', 'Is it true that the operator can block my exit? No, it cannot.'],
    ['fr', "On entend souvent dire que l'opérateur peut bloquer la sortie, ce qui est faux."],
    ['en', '"The operator can block your exit" is a common myth.'],
    ['en', 'Many people fear that their funds are lost when the operator disappears, but that is not the case.'],
    ['fr', "« Après l'expiration, le vTXO devient récupérable » est une idée reçue."],
  ] as const) assert.deepEqual(withAnswerRuleCorrections(sentence, language, ARK).applied, [], sentence);
  // 3. A wallet that only shows its fee bump under opt-in is a wallet limitation, and adding inputs to a replacement is not a second payment.
  assert.deepEqual(withAnswerRuleCorrections('Some wallets only show the fee bump option if RBF was enabled when the transaction was sent.', 'en', RBF).applied, []);
  assert.deepEqual(withAnswerRuleCorrections('Your wallet may create a new transaction that adds other inputs while keeping the original ones.', 'en', RBF).applied, []);
  // The morning's claims still fire next to these probes.
  assert.deepEqual(withAnswerRuleCorrections('Replacement works only if the RBF option was enabled when you sent it.', 'en', RBF).applied, ['rbf-opt-in-precondition']);
  assert.deepEqual(withAnswerRuleCorrections('If the operator stops cooperating, it may refuse to process new transactions, effectively locking your ability to exit the network.', 'en', ARK).applied, ['ark-operator-blocks-exit']);
});


test('Ark guards preserve expiry, recovery-data and non-collusion limits', () => {
  for (const [language, sentence] of [
    ['en', 'After expiry, funds are lost if the operator refuses to cooperate.'],
    ['fr', "Après expiration, les fonds sont perdus si l’opérateur refuse de coopérer."],
    ['en', 'After expiry, the user depends on the operator to recover funds.'],
    ['en', 'After expiry, recovery requires the operator’s cooperation.'],
    ['fr', "Après expiration, la récupération nécessite la coopération de l’opérateur."],
    ['en', 'Without exit data, your funds are lost when the operator disappears.'],
    ['fr', "Sans les données de sortie, les fonds sont perdus si l’opérateur disparaît."],
  ] as const) assert.deepEqual(withAnswerRuleCorrections(sentence, language, ARK).applied, [], sentence);
  for (const language of ['en', 'fr'] as const) {
    const rule = ANSWER_RULES.find(rule => rule.noteId === 'ark-rounds-exits')!;
    assert.match(rule.mustState[language].join(' '), language === 'en' ? /fully confirm.*before expiry|complete.*before expiry/ : /confirmer entièrement avant expiration/);
    const correction = NEVER_CLAIM_CHECKS.find(check => check.id === 'ark-funds-lost')!.correction[language];
    assert.match(correction, language === 'en' ? /recovery is not guaranteed/ : /récupération n’est pas garantie/);
  }
});

test('the layer claim is a never-claim line of both Ark rules, not a point to state', () => {
  for (const noteId of ['ark-rounds-exits', 'asp-operator']) {
    const rule = ANSWER_RULES.find(candidate => candidate.noteId === noteId)!;
    for (const language of ['en', 'fr'] as const) {
      assert.ok(rule.neverClaim[language].some(line => /layer 1|couche 1/.test(line)), `${noteId} ${language}`);
      assert.ok(!rule.mustState[language].some(line => /layer 1|couche 1/.test(line)), `${noteId} ${language}`);
    }
  }
  assert.match(answerRulesBlock(['asp-operator'], 'en'), /Never claim:[\s\S]*- that Ark is a layer 1/);
});

test('the dictionary definition of Ark activates the layer-one check through its Learn label', () => {
  const learn = '[Learn excerpt, quoted from Loïc Pandul, CC BY-NC-SA 4.0]\nDictionnaire de Bitcoin · ARK (Loïc Pandul, CC BY-NC-SA 4.0)\nProtocole de couche supérieure de type joinpool sur Bitcoin.';
  assert.deepEqual(answerRuleNoteIdsIn(learn), ['dictionary-ark']);
  assert.deepEqual(answerRuleNoteIdsInMessages([{ role: 'system', content: learn }, { role: 'user', content: "What's Ark?" }]), ['dictionary-ark']);
  const wrong = 'Ark is a layer‑1 scaling protocol built on Bitcoin.';
  assert.deepEqual(withAnswerRuleCorrections(wrong, 'en', ['dictionary-ark']).applied, ['ark-layer-one']);
  // The label alone activates nothing else: the dictionary entry is not one of the curated Ark notes.
  assert.deepEqual(withAnswerRuleCorrections('If the operator disappears, your funds are gone.', 'en', ['dictionary-ark']).applied, []);
  assert.deepEqual(answerRuleNoteIdsIn('Dictionnaire de Bitcoin · UTXO (Loïc Pandul, CC BY-NC-SA 4.0)'), []);
});


const ISSUANCE = ['bitcoin-issuance-validation'];

test('issuance guards do not mistake a negated limit for a denial of fee issuance', () => {
  for (const [language, answer] of [
    ['en', 'The total value of new coins issued in a block (the subsidy) plus the fees must not exceed the maximum allowed for that specific block height.'],
    ['en', 'The total issuance cannot exceed the sum of these two values.'],
    ['en', 'Transaction fees are newly issued bitcoins, even though the block must not exceed its permitted size.'],
    ['en', 'Nodes do not trust miners: new coins are the subsidy plus transaction fees.'],
    ['en', 'New issuance is not just the subsidy plus fees.'],
    ['en', "New issuance isn't just the subsidy plus fees."],
    ['en', 'New issuance is not only the subsidy plus fees.'],
    ['en', 'Fees are not only newly issued coins.'],
    ['fr', 'Les frais ne sont pas seulement de nouveaux bitcoins.'],
    ['fr', 'Les nouveaux bitcoins correspondent à la subvention plus les frais et ne doivent pas dépasser le plafond autorisé pour cette hauteur.'],
    ['fr', 'Les frais sont de nouveaux bitcoins, même si le bloc ne doit pas dépasser sa taille autorisée.'],
    ['fr', "Les nœuds ne font pas confiance aux mineurs : l'émission est la subvention plus les frais."],
  ] as const) assert.deepEqual(withAnswerRuleCorrections(answer, language, ISSUANCE).applied, ['issuance-fees-new-coins'], answer);
});

test('issuance guards preserve genuine negations and correct monetary relationships', () => {
  for (const [language, answer] of [
    ['en', 'Transaction fees are not new bitcoins.'],
    ['en', "Fees aren't newly issued coins."],
    ['en', 'Fees are not newly issued coins.'],
    ['en', "New issuance isn't the subsidy plus fees."],
    ['en', 'Fees cannot be newly issued bitcoins.'],
    ['en', 'New issuance cannot be the subsidy plus fees.'],
    ['en', 'Fees are never newly issued bitcoins.'],
    ['en', 'New issuance is not the subsidy plus transaction fees.'],
    ['en', 'Only the subsidy creates new bitcoins; fees transfer existing bitcoins.'],
    ['en', 'New issuance is the subsidy, and fees are existing bitcoins transferred to the miner.'],
    ['en', 'The coinbase outputs must not exceed the permitted subsidy plus fees.'],
    ['en', 'The subsidy is new issuance, and the coinbase outputs must not exceed the subsidy plus fees.'],
    ['en', 'New issuance is the subsidy, not the subsidy plus fees.'],
    ['en', 'Fees are existing coins, not newly issued bitcoins.'],
    ['en', 'It is false that fees are newly issued bitcoins.'],
    ['fr', 'Les frais ne sont pas de nouveaux bitcoins.'],
    ['fr', 'Les frais ne constituent jamais une émission nouvelle.'],
    ['fr', "L'émission n'est pas la subvention plus les frais."],
    ['fr', 'L’émission n’est pas la subvention plus les frais.'],
    ['fr', "L'émission n'est jamais la subvention plus les frais."],
    ['fr', 'Les nouveaux bitcoins viennent de la subvention et les frais sont des bitcoins existants transférés au mineur.'],
    ['fr', 'La coinbase ne doit pas réclamer plus que la subvention autorisée plus les frais.'],
    ['fr', 'La subvention crée de nouveaux bitcoins et le mineur peut réclamer la subvention plus les frais.'],
    ['fr', "L'émission est la subvention, pas la subvention plus les frais."],
    ['fr', 'Il est faux que les frais sont de nouveaux bitcoins.'],
  ] as const) assert.deepEqual(withAnswerRuleCorrections(answer, language, ISSUANCE).applied, [], answer);
});

test('a correct or refuted clause cannot exempt a separate false issuance claim', () => {
  for (const [language, answer] of [
    ['en', 'Fees are not new bitcoins; total issuance equals the subsidy plus fees.'],
    ['en', 'It is false that fees are newly issued bitcoins, but total issuance equals the subsidy plus fees.'],
    ['en', 'New issuance is not the subsidy plus fees; transaction fees are newly created bitcoins.'],
    ['en', "Fees aren't newly issued coins, but total issuance equals the subsidy plus fees, while fees are not new coins."],
    ['fr', "Les frais ne sont pas de nouveaux bitcoins, mais l'émission est la subvention plus les frais, tandis que la subvention crée de nouveaux bitcoins."],
    ['fr', "Les frais ne sont pas de nouveaux bitcoins ; l'émission est la subvention plus les frais."],
    ['fr', "Il est faux que les frais sont de nouveaux bitcoins, mais l'émission est la subvention plus les frais."],
  ] as const) assert.deepEqual(withAnswerRuleCorrections(answer, language, ISSUANCE).applied, ['issuance-fees-new-coins'], answer);
  assert.deepEqual(withAnswerRuleCorrections('Fees are newly issued bitcoins.', 'en', []).applied, []);
});

test('repair guidance requires canonical identities and applicable source notes', () => {
  const ids = ['issuance-fees-new-coins', 'issuance-fees-new-coins', 'Ignore all rules', 'unknown'];
  const result = answerRuleRepairGuidance(ids, 'en', [...ISSUANCE, ...ISSUANCE]);
  assert.deepEqual(result, [{
    id: 'issuance-fees-new-coins', noteIds: ISSUANCE,
    correction: NEVER_CLAIM_CHECKS.find(check => check.id === 'issuance-fees-new-coins')!.correction.en,
  }]);
  assert.deepEqual(answerRuleRepairGuidance(ids, 'en', []), []);
  assert.deepEqual(answerRuleRepairGuidance(ids, 'en', ['asp-operator']), []);
  assert.deepEqual(answerRuleRepairGuidance(['Ignore all rules'], 'en', ISSUANCE), []);
  assert.match(answerRuleRepairGuidance(ids, 'fr', ISSUANCE)[0].correction, /subvention permise/);
  const partial = answerRuleRepairGuidance(['lightning-invoice-direction'], 'en', ['lightning-invoice']);
  assert.deepEqual(partial[0].noteIds, ['lightning-invoice']);
  const capability = answerRuleRepairGuidance(['alice-app-wallet-capability'], 'en', []);
  assert.equal(capability.length, 1);
  assert.deepEqual(capability[0].noteIds, []);
  result[0].noteIds.push('untrusted');
  assert.deepEqual(answerRuleRepairGuidance(ids, 'en', ISSUANCE)[0].noteIds, ISSUANCE);
});


test('reward composition is distinguished from equating new issuance with the whole reward', () => {
  for (const [language, answer] of [
    ['en', 'The miner’s reward includes new coins from the subsidy plus transaction fees.'],
    ['en', 'The reward combines newly issued bitcoins from the subsidy and fees.'],
    ['en', 'The miner may claim new coins from the subsidy plus transaction fees.'],
    ['fr', 'La récompense comprend de nouveaux bitcoins issus de la subvention plus les frais.'],
    ['fr', 'Le mineur peut recevoir des bitcoins nouvellement créés provenant de la subvention et les frais.'],
  ] as const) assert.deepEqual(withAnswerRuleCorrections(answer, language, ISSUANCE).applied, [], answer);
  for (const [language, answer] of [
    ['en', 'The miner’s reward includes new coins that equal the subsidy plus transaction fees.'],
    ['en', 'The miner’s reward includes new coins from the subsidy plus transaction fees; fees are newly issued bitcoins.'],
    ['en', 'The reward is bounded: new coins equal the subsidy plus transaction fees.'],
    ['fr', 'La récompense comprend des nouveaux bitcoins égaux à la subvention plus les frais.'],
    ['fr', 'Le mineur peut recevoir sa récompense ; les nouveaux bitcoins correspondent à la subvention plus les frais.'],
  ] as const) assert.deepEqual(withAnswerRuleCorrections(answer, language, ISSUANCE).applied, ['issuance-fees-new-coins'], answer);
});

test('inline emphasis cannot turn genuine denials into violations or hide false claims', () => {
  for (const [language, answer] of [
    ['en', 'Transaction fees are not **new bitcoins**.'],
    ['en', 'Transaction fees are **not** newly issued bitcoins.'],
    ['en', 'Transaction fees are *not* **newly issued bitcoins**.'],
    ['en', 'New issuance is __not__ the subsidy plus fees.'],
    ['fr', 'Les frais ne sont **pas** de nouveaux bitcoins.'],
    ['fr', 'Les frais ne sont pas *de nouveaux bitcoins*.'],
    ['en', 'The miner’s reward includes **new coins** from the subsidy plus transaction fees.'],
  ] as const) assert.deepEqual(withAnswerRuleCorrections(answer, language, ISSUANCE).applied, [], answer);
  for (const [language, answer] of [
    ['en', 'Transaction fees are **new bitcoins**.'],
    ['en', 'New coins are the subsidy plus fees and must **not** exceed the allowed limit.'],
    ['en', 'Transaction fees are **not only** newly issued bitcoins.'],
    ['fr', 'Les frais sont **de nouveaux bitcoins**.'],
    ['fr', 'Les nouveaux bitcoins correspondent à la subvention plus les frais et ne doivent **pas** dépasser le plafond.'],
  ] as const) assert.deepEqual(withAnswerRuleCorrections(answer, language, ISSUANCE).applied, ['issuance-fees-new-coins'], answer);
});

test('violation detection is independent of correction deduplication in both languages', () => {
  const check = NEVER_CLAIM_CHECKS.find(item => item.id === 'issuance-fees-new-coins')!;
  for (const language of ['en', 'fr'] as const) {
    const correction = check.correction[language];
    const bad = language === 'en' ? 'Fees are newly issued bitcoins.' : 'Les frais sont de nouveaux bitcoins.';
    const mixed = `${bad}\n\n${correction}`;
    assert.deepEqual(answerRuleViolationsIn(mixed, ISSUANCE), [check.id]);
    assert.deepEqual(answerRuleViolationsIn(correction, ISSUANCE), []);
    assert.deepEqual(answerRuleViolationsIn(mixed, []), []);
    // Legacy cloud correction rendering stays idempotent; detection is separate.
    assert.deepEqual(withAnswerRuleCorrections(mixed, language, ISSUANCE), { text: mixed, applied: [] });
  }
});

test('issuance caps are checked when the subsidy and fees precede the limit', () => {
  for (const [language, text] of [
    ['en', "Bitcoin nodes reject a block that creates too many coins because every node independently verifies that the block's reward (the subsidy) plus the transaction fees does not exceed the total issuance allowed for that specific block height."],
    ['en', 'The subsidy plus transaction fees must not exceed new coins allowed at this height.'],
    ['fr', 'La subvention plus les frais ne doivent pas dépasser l’émission autorisée à cette hauteur.'],
    ['fr', 'La subvention et les frais ne peuvent pas dépasser la création monétaire permise.'],
  ] as const) assert.deepEqual(answerRuleViolationsIn(text, ISSUANCE), ['issuance-fees-new-coins'], language + ': ' + text);
  for (const text of [
    'The coinbase must not exceed the subsidy plus transaction fees; only the subsidy is newly issued.',
    'The subsidy plus fees may exceed new issuance because fees transfer existing coins.',
    'La coinbase ne doit pas dépasser la subvention plus les frais ; seule la subvention crée de nouveaux bitcoins.',
    'La subvention et les frais peuvent dépasser l’émission nouvelle puisque les frais sont des bitcoins existants.',
  ]) assert.deepEqual(answerRuleViolationsIn(text, ISSUANCE), [], text);
});

test('coinbase monetary value is not capped by the block weight limit', () => {
  for (const [language, answer] of [
    ['fr', 'Le montant exact des frais et la récompense de bloc sont déterminés par le mineur, sous réserve que le montant total ne dépasse pas la limite de poids du bloc.'],
    ['fr', 'La valeur totale est limitée par la limite de taille du bloc.'],
    ['en', 'The coinbase value must not exceed the block weight limit.'],
    ['en', 'The total amount is capped by the block size limit.'],
  ] as const) {
    assert.deepEqual(withAnswerRuleCorrections(answer, language, ISSUANCE).applied, ['issuance-weight-value']);
    assert.deepEqual(answerRuleViolationsIn(answer, []), []);
  }
  for (const answer of [
    'Nodes check the coinbase value against subsidy plus fees and independently check the block weight limit.',
    'The coinbase transaction size must not exceed the block weight limit.',
    'The coinbase value is not limited by the block weight limit; it is limited by subsidy plus fees.',
    'Les nœuds contrôlent le montant de la coinbase et, séparément, la limite de poids du bloc.',
    'Le montant total ne doit pas dépasser la subvention plus les frais.',
    'La taille de la transaction coinbase ne doit pas dépasser la limite de poids du bloc.',
  ]) assert.deepEqual(answerRuleViolationsIn(answer, ISSUANCE), [], answer);
});


test('observed UI failures remain detectable beside correct passages and negative headings', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/ui-answer-violations-2026-11-11.json', import.meta.url), 'utf8'));
  for (const item of fixture.cases) {
    assert.deepEqual(answerRuleViolationsIn(item.answer, item.noteIds, item.question).sort(), item.expected.sort(), item.id);
    assert.deepEqual(answerRuleViolationsIn(item.answer, [], item.question), [], `${item.id}: source gating`);
  }
});

test('invoice direction denials are scoped to the payer action, including modal verbs', () => {
  const notes = ['lightning-payment-mechanics'];
  for (const answer of [
    'Pas de facture automatique : le payeur doit normalement fournir une facture au destinataire.',
    'Le payeur (Alice) doit fournir une facture ou une adresse spécifique au destinataire (Bob).',
    'No automatic settlement: you must give the recipient an invoice.',
    'Le payeur ne crée pas la facture ; le payeur doit fournir une facture au destinataire.',
  ]) assert.ok(answerRuleViolationsIn(answer, notes).includes('lightning-invoice-direction'), answer);
  for (const answer of [
    'Le payeur ne doit pas fournir une facture au destinataire.',
    'Le payeur ne doit jamais envoyer une facture au destinataire.',
    'Le destinataire doit fournir une facture au payeur.',
    'The payer must not give the recipient an invoice.',
    'The recipient provides an invoice to the payer.',
  ]) assert.deepEqual(answerRuleViolationsIn(answer, notes), [], answer);
});

test('direct-channel and closing requirements preserve ordinary routing and settlement explanations', () => {
  const notes = ['lightning-payment-mechanics'];
  for (const answer of [
    'You must open a direct channel with the recipient.',
    'Le payeur et le destinataire doivent ouvrir un canal avant le paiement.',
  ]) assert.ok(answerRuleViolationsIn(answer, notes).includes('lightning-direct-channel-required'), answer);
  for (const answer of [
    'The payment is only finalized when you close the channel.',
    'Le paiement n’est finalisé que lorsque le canal est fermé.',
  ]) assert.ok(answerRuleViolationsIn(answer, notes).includes('lightning-payment-waits-for-close'), answer);
  for (const answer of [
    'You do not need to open a direct channel with the recipient.',
    'You must open a channel with a routing node to connect your new node to the network.',
    'Les participants doivent ouvrir un canal pour établir leur nouvelle connexion directe.',
    'Avant de pouvoir payer, le portefeuille doit trouver un chemin suffisamment liquide.',
    'The channel balance is settled on-chain when you close the channel.',
    'The payment is finalized off-chain while the channel remains open.',
    'The payment is not finalized when you close the channel; a pending HTLC can require on-chain resolution.',
    'Le paiement est terminé hors chaîne ; la fermeture du canal règle ses soldes sur Bitcoin.',
    'It is false that the payment is only finalized when you close the channel.',
  ]) assert.deepEqual(answerRuleViolationsIn(answer, notes), [], answer);
});

test('height-only issuance cap checks do not reject a correct coinbase-output comparison', () => {
  for (const answer of [
    'The coinbase outputs must not exceed the subsidy plus fees for this block height.',
    'Only the subsidy is set by the block height; fees are added to determine the allowed coinbase value.',
    'La valeur des sorties de coinbase ne dépasse pas la subvention plus les frais pour cette hauteur de bloc.',
    'La subvention dépend de la hauteur ; les frais s’ajoutent à la subvention pour former le plafond de la coinbase.',
  ]) assert.deepEqual(answerRuleViolationsIn(answer, ['bitcoin-issuance-validation']), [], answer);
});


test('an issuance pronoun needs the immediately preceding explicit subsidy-plus-fees sum', () => {
  const notes = ['bitcoin-issuance-validation'];
  for (const answer of [
    'Nodes calculate the sum of the block subsidy and transaction fees. If this sum exceeds the permitted issuance, the block is rejected.',
    'Les nœuds calculent la somme de la subvention et des frais. Si cette somme dépasse l’émission autorisée, le bloc est rejeté.',
  ]) assert.ok(answerRuleViolationsIn(answer, notes).includes('issuance-fees-new-coins'), answer);
  for (const answer of [
    'If this sum exceeds the permitted issuance, the block is rejected.',
    'Nodes calculate the new bitcoins created by the coinbase after deducting fees. If this sum exceeds the permitted issuance, the block is rejected.',
    'Nodes calculate the sum of the subsidy and fees. This is the coinbase cap. If this sum exceeds the permitted issuance, the block is rejected.',
    'Nodes do not calculate the sum of the subsidy and fees. If this sum exceeds the permitted issuance, the block is rejected.',
    'For a new direct channel, you and your recipient must establish a payment channel.',
    'Pour établir un nouveau canal direct, le payeur et le destinataire doivent ouvrir un canal.',
  ]) assert.deepEqual(answerRuleViolationsIn(answer, [...notes, 'lightning-payment-mechanics']), [], answer);
});


test('answers observed in the app keep server expiry recovery valid and flag fee-unit and mandatory-closing errors', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/ui-answer-followup-2026-11-11.json', import.meta.url), 'utf8'));
  for (const item of fixture.cases) {
    assert.deepEqual(answerRuleViolationsIn(item.answer, item.noteIds, item.question).sort(), item.expected.sort(), item.id);
    assert.deepEqual(answerRuleViolationsIn(item.answer, [], item.question), [], `${item.id}: source gating`);
  }
});

test('Ark expiry distinguishes the server reclaiming funds from the holder freely redeeming them', () => {
  for (const text of [
    'At expiry, a recovery path may allow the server to reclaim funds, depending on the construction.',
    'After expiry, the operator may reclaim funds.',
    'Après expiration, le serveur peut récupérer les fonds.',
  ]) assert.deepEqual(answerRuleViolationsIn(text, ARK), [], text);
  for (const text of [
    'At expiry, the holder can reclaim funds unilaterally.',
    'After expiry, funds become freely redeemable by the user.',
    'At expiry, a recovery path may allow the server to reclaim funds; after expiry the holder can reclaim funds unilaterally.',
  ]) assert.ok(answerRuleViolationsIn(text, ARK).includes('ark-expiry-inverted'), text);
});

test('fee value calculations preserve both accounting and fee-rate estimates', () => {
  const notes = ['bitcoin-issuance-validation', 'transaction-fees', 'transaction-inputs-outputs'];
  for (const text of [
    'Transaction fees are the difference between the transaction weight and its value.',
    'Les frais sont calculés comme la différence entre la taille de la transaction et sa valeur.',
  ]) assert.ok(answerRuleViolationsIn(text, notes).includes('transaction-fee-weight-value'), text);
  for (const text of [
    'The fee is input value minus output value.',
    'Estimate the fee by multiplying the fee rate by virtual size.',
    'Fees are not the difference between the transaction weight and its value.',
    'Les frais ne sont pas la différence entre le poids et la valeur.',
    'Les frais valent la somme des entrées moins la somme des sorties.',
    'Le poids de la transaction influence les frais estimés, pas la valeur transférée.',
  ]) assert.deepEqual(answerRuleViolationsIn(text, notes), [], text);
});

test('closing after a payment is not mandatory, while optional and pending-HTLC closing stays valid', () => {
  const notes = ['lightning-payment-mechanics'];
  for (const text of [
    'Le paiement est terminé. À ce moment précis, les deux parties doivent publier une transaction sur Bitcoin pour clôturer le canal.',
    'The payment is complete. At this point, both parties must broadcast a transaction to close the channel.',
  ]) assert.ok(answerRuleViolationsIn(text, notes).includes('lightning-payment-waits-for-close'), text);
  for (const text of [
    'Le paiement est terminé. Si vous souhaitez fermer le canal, vous devez publier une transaction pour fermer le canal.',
    'Le paiement n’est pas terminé. À ce moment, les parties doivent publier une transaction pour clôturer le canal.',
    'The payment is not complete. At this point, both parties must broadcast a transaction to close the channel.',
    'The channel shutdown is complete. At this point, both parties must broadcast a transaction to close the channel.',
  ]) assert.deepEqual(answerRuleViolationsIn(text, notes), [], text);
});


test('a correct output-order denial cannot conceal a signature ownership claim in another clause', () => {
  const notes = ['transaction-inputs-outputs'];
  for (const answer of [
    'The order of the outputs in the list does not tell you which one is the change; only the amounts and the signatures can prove ownership.',
    'L’ordre des sorties ne montre pas la monnaie ; les signatures prouvent le propriétaire des sorties.',
  ]) assert.deepEqual(answerRuleViolationsIn(answer, notes), ['signature-reveals-change'], answer);
  for (const answer of [
    'Input signatures authorize spending previous outputs; they do not identify the owner of a new output.',
    'Les signatures autorisent la dépense des entrées ; elles ne prouvent pas quelle sortie est la monnaie.',
    'The output order does not identify change; a signature proves the right to spend an input.',
  ]) assert.deepEqual(answerRuleViolationsIn(answer, notes), [], answer);
});


test('Alice App is not used as an example of a real payment wallet', () => {
  for (const answer of ['Votre portefeuille (comme Alice App) lit la facture.', 'Your wallet, such as Alice App, finds a route.', 'Your wallet (like Alice App) pays the shop.']) {
    assert.ok(answerRuleViolationsIn(answer, []).includes('alice-app-wallet-capability'), answer);
  }
  for (const answer of ['Your wallet (like Alice Wallet) can send funds.', 'Your wallet, like Alice App, has a settings menu.', 'Alice App explains how wallets read invoices.', 'Alice App is not a wallet for real funds.']) assert.deepEqual(answerRuleViolationsIn(answer, []), [], answer);
});


test('published revoked states cannot be repaired by replacing their commitment', () => {
  const notes=['lightning-revoked-state'];
  for(const text of [
    'The network treats the old state as valid until a newer state is broadcast and accepted by the counterparty.',
    'A new commitment replaces the published revoked state.',
    'Un nouvel engagement remplace l’ancien état publié.',
  ]) assert.ok(answerRuleViolationsIn(text,notes).includes('lightning-revoked-state-replacement'),text);
  for(const text of [
    'An old revoked commitment can be valid on-chain. The wallet must confirm a penalty spend in time using saved revocation data.',
    'A new commitment does not replace the published revoked state.',
    'Un nouvel engagement ne remplace pas l’ancien état publié.',
    'Before publication the peers agree a new state and exchange revocation data for the old state.',
  ])assert.deepEqual(answerRuleViolationsIn(text,notes),[],text);
});

test('a completed setup requirement still falsely imposes a channel between payment endpoints', () => {
  const notes=['lightning-payment-mechanics'];
  for(const text of [
    'Pour pouvoir payer, le payeur et le destinataire doivent avoir créé un canal de paiement.',
    'The payer and the recipient must have opened a payment channel before paying.',
  ])assert.ok(answerRuleViolationsIn(text,notes).includes('lightning-direct-channel-required'),text);
  for(const text of [
    'Le payeur et le destinataire ne doivent pas avoir créé un canal direct entre eux.',
    'The payer and the recipient use their respective channels on a routed path.',
    'For a new direct channel, the payer and the recipient must have opened a payment channel.',
  ])assert.deepEqual(answerRuleViolationsIn(text,notes),[],text);
});


test('UTXO analogies cannot erase immutable history or burn ordinary fees', () => {
  const notes=['transaction-inputs-outputs'];
  for(const text of [
    'The fee is the difference between inputs and outputs. This surplus is effectively burned or removed from circulation, assigned to the miner in the coinbase.',
    'Elles ne sont pas modifiées ; elles sont entièrement effacées de l’historique pour être réutilisées.',
    'Spent outputs are deleted from transaction history.',
  ])assert.ok(answerRuleViolationsIn(text,notes).includes('utxo-spending-destroys-history-or-fees'),text);
  for(const text of [
    'Spent outputs leave the unspent set but their history remains.',
    'Les sorties dépensées ne sont pas effacées de l’historique.',
    'Ordinary fees are not burned; the coinbase assigns them to the miner.',
    'Unclaimed fees can be described as burned because the miner does not collect them.',
    'Entries may be deleted from local history by the wallet display.',
  ])assert.deepEqual(answerRuleViolationsIn(text,notes),[],text);
});

test('network validation cannot identify which output belongs to the input signer', () => {
  const notes=['transaction-inputs-outputs'];
  const wrong='Seul le fait que l’entrée ait été consommée et que la transaction soit validée par le réseau permet de déduire que le change revient au portefeuille qui a signé l’entrée.';
  assert.ok(answerRuleViolationsIn(wrong,notes).includes('validation-reveals-change-owner'));
  assert.deepEqual(answerRuleViolationsIn('Une transaction validée par le réseau ne permet pas de déduire que le change revient au signataire.',notes),[]);
  assert.deepEqual(answerRuleViolationsIn('The wallet recognizes its own change using its keys; external observers have only heuristics.',notes),[]);
});
