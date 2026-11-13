import assert from 'node:assert/strict';
import test from 'node:test';
import { walletTroubleshootingReason, directWalletTroubleshootingResponse } from './wallet-troubleshooting.ts';
import { planAliceTurn } from './turn-planner.ts';
import { prepareAliceTurn, type TurnPreparationServices } from './turn-engine.ts';

const ambiguous = {
  fr: "J'ai un téléphone avec une application Bitcoin, un portefeuille matériel et une sauvegarde sur papier. Depuis un changement de mot de passe, l'application n'affiche plus mon solde. Tu me conseilles de le réinitialiser ?",
  en: 'My phone app and hardware wallet no longer show the same Bitcoin balance after a password change. Should I reset it?',
};
const clarified = {
  fr: "Je parle de l'application sur le téléphone. Elle est en lecture seule, connectée à mon portefeuille matériel. Le mot de passe modifié est celui de l'application ; je n'ai touché ni au PIN ni à une passphrase du portefeuille matériel. Que vérifier en premier ?",
  en: 'My phone app is watch-only and linked to my hardware wallet. I changed the app password, not the hardware PIN or BIP39 passphrase. What should I check first?',
};

test('ambiguous reset questions require clarification rather than selecting a device or password', () => {
  for (const message of [
    ...Object.values(ambiguous),
    'Mon application Bitcoin et mon portefeuille matériel sont bloqués. Dois-je le réinitialiser ?',
    'My Bitcoin app and my phone are both slow. Do you recommend resetting it?',
  ]) {
    assert.equal(walletTroubleshootingReason(message), 'ambiguous-reset', message);
    const plan = planAliceTurn(message);
    assert.equal(plan.retrievalQuery, null);
    assert.equal(plan.needsConversationContext, false);
    assert.deepEqual(plan.explicitMemoryCandidates, []);
  }
  for (const language of ['fr', 'en'] as const) {
    const answer = directWalletTroubleshootingResponse('ambiguous-reset', language);
    assert.match(answer, language === 'fr' ? /téléphone, de l’application ou du portefeuille matériel/ : /phone, the app, or the hardware wallet/);
    assert.match(answer, /PIN.*BIP39/);
    assert.match(answer, language === 'fr' ? /ne réinitialise ni ne désinstalle rien/ : /do not reset or uninstall anything/);
    assert.match(answer, language === 'fr' ? /ne saisis pas la phrase de récupération/ : /or enter the hardware wallet’s recovery phrase/);
  }
});

test('explicit watch-only app-password troubleshooting has a narrow independent intent', () => {
  for (const message of [
    ...Object.values(clarified),
    'My read-only app uses my hardware wallet. The password for my app changed. What should I verify?',
    "Mon application est en lecture seule avec mon portefeuille matériel. Le mot de passe de l'application a changé. Que dois-je vérifier ?",
  ]) assert.equal(walletTroubleshootingReason(message), 'watch-only-app-password', message);
  const en = directWalletTroubleshootingResponse('watch-only-app-password', 'en');
  for (const fact of [/private keys stay in the hardware wallet/, /without reading private keys/, /not a BIP39 passphrase/, /does not move bitcoin/, /correct wallet and account/, /network and public wallet information/, /descriptor or extended public key/, /server or node connection/, /synchronization/, /without importing a recovery phrase or private key/, /Do not reset the hardware or send a payment/, /Bluetooth is not a general requirement/]) assert.match(en, fact);
  const fr = directWalletTroubleshootingResponse('watch-only-app-password', 'fr');
  for (const fact of [/clés privées restent dans le portefeuille matériel/, /sans lire les clés privées/, /n’est pas une passphrase BIP39/, /ne déplace pas les bitcoins/, /bon portefeuille et le bon compte/, /descripteur ou une clé publique étendue/, /serveur ou nœud/, /sans importer la phrase de récupération/, /n’envoie pas de paiement/]) assert.match(fr, fact);
});

test('specific reset targets, ordinary questions and incomplete setups do not activate a canned troubleshooting answer', () => {
  for (const message of [
    'How do I reset my Bitcoin app password?',
    'My Bitcoin app is frozen. Should I reset my phone?',
    'My hardware wallet stopped responding. Should I reset it?',
    'My Bitcoin phone app is broken. I will not reset it.',
    'Mon application Bitcoin et mon téléphone sont lents. Comment réinitialiser le téléphone ?',
    'Explain this sentence: "My Bitcoin app is slow. Should I reset it?"',
    'My hardware wallet and watch-only app need a password. What is a BIP39 passphrase?',
    'My app is not watch-only. I changed my app password for my hardware wallet. What should I check?',
    'My watch-only hardware wallet display is empty. What should I check?',
    'My watch-only app password changed. What should I check?',
    'Mon application n’est pas en lecture seule. Mon portefeuille matériel a un mot de passe. Que vérifier ?',
  ]) assert.equal(walletTroubleshootingReason(message), null, message);
});

test('two-turn clarification is non-destructive and bypasses model preparation on local and cloud', async () => {
  const forbidden = new Proxy({} as TurnPreparationServices, {
    get() { throw new Error('No retrieval or memory service should run for bounded troubleshooting'); },
  });
  for (const backendType of ['local', 'cloud'] as const) for (const language of ['fr', 'en'] as const) {
    const first = await prepareAliceTurn({ history: [], userMessage: ambiguous[language], backendType, targetLanguage: language }, forbidden);
    assert.equal(first.plan.walletTroubleshootingReason, 'ambiguous-reset');
    const second = await prepareAliceTurn({
      history: [{ role: 'user', content: ambiguous[language] }, { role: 'assistant', content: first.directResponse! }],
      userMessage: clarified[language], backendType, targetLanguage: language,
    }, forbidden);
    assert.equal(second.plan.walletTroubleshootingReason, 'watch-only-app-password');
    assert.notEqual(first.directResponse, second.directResponse);
    assert.equal(second.diagnostics.retrieval, 'none');
    assert.deepEqual(second.explicitMemoryCandidates, []);
    assert.match(second.directResponse!, language === 'fr' ? /sans importer la phrase de récupération/ : /without importing a recovery phrase/);
    // The latest message must establish this setup; an earlier assistant
    // claim alone cannot turn a different question into a wallet diagnosis.
    assert.equal(planAliceTurn('What is proof of work?').walletTroubleshootingReason, null);
    assert.equal(planAliceTurn('What should I check first?').walletTroubleshootingReason, null);
  }
});

const confirmedReversal = {
  en: 'I sent bitcoin to the wrong address and the transaction already has two confirmations. Can I use RBF now to replace that address with my own and get the money back?',
  fr: "J'ai envoyé des bitcoins à la mauvaise adresse et la transaction a déjà deux confirmations. Puis-je utiliser RBF pour remplacer cette adresse et récupérer mon argent ?",
};
const digitalBackup = {
  en: "Let's change subjects. I'm setting up a different hardware wallet and haven't put funds on it yet. Is taking a photo of its recovery words and saving it in my normal cloud photo library a good backup plan?",
  fr: "Changeons de sujet. Mon nouveau portefeuille matériel est encore vide. Est-ce une bonne idée de photographier ses mots de récupération et de les sauvegarder dans le cloud ?",
};

test('digital secret-backup suitability is scoped to the proposed medium and actual secret', () => {
  for (const message of [
    ...Object.values(digitalBackup),
    'Should I store my recovery phrase in a password manager?',
    'Is a screenshot of my private key a safe backup?',
    'Is taking a photo of my recovery words, not my public receiving address, a good backup plan?',
    'Puis-je garder ma phrase de récupération en photo ?',
    'Est-il prudent de stocker ma clé privée dans le cloud ?',
    'Est-ce une bonne idée de photographier mes mots de récupération, pas mon adresse publique de réception ?',
  ]) assert.equal(walletTroubleshootingReason(message), 'seed-digital-backup', message);
  for (const message of [
    'How do wallet backups work?',
    'Why are digital recovery phrase backups risky?',
    'What is a recovery phrase?',
    'Is taking a photo of my public address safe?',
    'Is taking a photo of my public address, not my private key, a good backup plan?',
    'Is taking a photo of my public receiving address, not my recovery words, a good backup plan?',
    'My recovery phrase is on paper. Is a cloud backup of my public descriptor a good idea?',
    'Should I photograph my hardware wallet receipt?',
    'Est-ce une bonne idée de photographier mon adresse publique ?',
    'Est-ce prudent de photographier mon adresse publique, pas ma clé privée ?',
    'Est-ce une bonne idée de photographier mon adresse publique de réception, pas mes mots de récupération ?',
    'Ma phrase de récupération reste sur papier. Puis-je stocker mon descripteur public dans le cloud ?',
    'Explain "Is a cloud photo of my recovery words a good backup?".',
  ]) assert.equal(walletTroubleshootingReason(message), null, message);
});

test('only explicit own confirmed-payment RBF reversal requests use the capability boundary', () => {
  for (const message of [
    ...Object.values(confirmedReversal),
    'My payment is already confirmed. Can I cancel it with replace-by-fee?',
    'Ma transaction est confirmée. Comment puis-je la remplacer avec RBF ?',
  ]) assert.equal(walletTroubleshootingReason(message), 'confirmed-rbf-reversal', message);
  for (const message of [
    'My transaction is unconfirmed. Can I replace it using RBF?',
    'My transaction is not confirmed. Can I cancel it with RBF?',
    'My transaction has zero confirmations. Can I replace it with RBF?',
    'Ma transaction est non confirmée. Puis-je la remplacer avec RBF ?',
    'Ma transaction a zéro confirmation. Puis-je l’annuler avec RBF ?',
    'If my transaction has two confirmations, can I cancel it using RBF?',
    'Si ma transaction est confirmée, puis-je la remplacer avec RBF ?',
    'Can RBF reverse a confirmed transaction?',
    'My transaction is confirmed. What does RBF mean?',
    'The historical transaction has two confirmations. Can I replace it using RBF?',
    'My old transaction is confirmed but this payment is unconfirmed. Can I replace it using RBF?',
    'Explain "My payment is confirmed. Can I cancel it with RBF?".',
  ]) assert.equal(walletTroubleshootingReason(message), null, message);
});

test('direct safety responses preserve recovery limits without destructive tests or absolute finality', () => {
  const backupEn = directWalletTroubleshootingResponse('seed-digital-backup', 'en');
  for (const phrase of [/physical offline backup/, /paper or an appropriate metal backup/, /unauthorized access, loss and damage/, /including funds added later/, /additional settings or secrets/, /manufacturer’s compatible procedure/, /verification directly on the device if available/, /without wiping.*or importing its phrase into a phone or computer/, /Do not share the words/]) assert.match(backupEn, phrase);
  assert.doesNotMatch(backupEn, /mylar|air.gap|funds (?:are|were) (?:lost|stolen)|safely store the digital copy/i);
  const backupFr = directWalletTroubleshootingResponse('seed-digital-backup', 'fr');
  for (const phrase of [/sauvegarde physique hors ligne/, /papier ou un support métallique/, /non autorisé, la perte et les dégâts/, /ajoutés plus tard/, /procédure compatible du fabricant/, /sans effacer.*ni importer sa phrase/, /Ne partage ni les mots/]) assert.match(backupFr, phrase);
  const rbfEn = directWalletTroubleshootingResponse('confirmed-rbf-reversal', 'en');
  for (const phrase of [/as you describe/, /unconfirmed transactions under mempool rules/, /CPFP raises the fees/, /does not refund or redirect/, /Neither this chat nor Alice App can undo/, /voluntarily.*separate new transaction/, /not guaranteed/, /does not mean every confirmation is mathematically irreversible/]) assert.match(rbfEn, phrase);
  assert.doesNotMatch(rbfEn, /funds are lost|final and permanent|Child-Pay-For-Child/i);
  const rbfFr = directWalletTroubleshootingResponse('confirmed-rbf-reversal', 'fr');
  for (const phrase of [/comme tu l’indiques/, /transactions non confirmées/, /CPFP augmente les frais/, /ne rembourse ni ne redirige/, /nouvelle transaction distincte/, /n’est pas garanti/, /ne signifie pas.*mathématiquement irréversible/]) assert.match(rbfFr, phrase);
});

test('confirmed-payment then new empty-wallet backup switches safety topics without carrying old funds', async () => {
  const forbidden = new Proxy({} as TurnPreparationServices, {
    get() { throw new Error('No model preparation or memory services for these explicit safety requests'); },
  });
  for (const backendType of ['local', 'cloud'] as const) for (const language of ['fr', 'en'] as const) {
    const first = await prepareAliceTurn({ history: [], userMessage: confirmedReversal[language], backendType, targetLanguage: language }, forbidden);
    assert.equal(first.plan.walletTroubleshootingReason, 'confirmed-rbf-reversal');
    const second = await prepareAliceTurn({
      history: [{ role: 'user', content: confirmedReversal[language] }, { role: 'assistant', content: first.directResponse! }],
      userMessage: digitalBackup[language], backendType, targetLanguage: language,
    }, forbidden);
    assert.equal(second.plan.walletTroubleshootingReason, 'seed-digital-backup');
    assert.equal(second.diagnostics.retrieval, 'none');
    assert.deepEqual(second.explicitMemoryCandidates, []);
    assert.doesNotMatch(second.directResponse!, /RBF|CPFP|confirmations?|refund|remboursement/i);
    assert.match(second.directResponse!, language === 'fr' ? /ajoutés plus tard/ : /funds added later/);
  }
});
