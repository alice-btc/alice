import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareAliceTurn, type TurnPreparationServices } from './turn-engine.ts';
import { planAliceTurn } from './turn-planner.ts';

test('actual wallet inspection and payment-status requests are guarded in French and English', () => {
  for (const message of [
    'Please open my Bitcoin wallet and check whether the payment I made this morning is confirmed.',
    'Could you inspect my wallet?',
    'Can you connect my wallet?',
    'Peux-tu ouvrir mon portefeuille ?',
    'Ouvre mon portefeuille Bitcoin et vérifie ma transaction.',
    'Check whether my payment is confirmed.',
    'Can you verify the status of my transaction?',
    'Is my transaction confirmed?',
    'Peux-tu vérifier si mon paiement est confirmé ?',
    'Vérifie le statut de ma transaction.',
  ]) {
    const plan = planAliceTurn(message);
    assert.ok(plan.walletStateReason, message);
    assert.equal(plan.retrievalQuery, null, message);
    assert.equal(plan.needsConversationContext, false, message);
    assert.deepEqual(plan.explicitMemoryCandidates, [], message);
  }
});

test('wallet explanations, supplied evidence and hypothetical examples stay ordinary questions', () => {
  for (const message of [
    'How do I open my wallet and check a confirmation?',
    'Can you explain how to check whether my payment is confirmed?',
    'Comment vérifier si mon paiement est confirmé ?',
    'Explain the instruction "open my wallet".',
    'If my transaction has six confirmations, what does that mean?',
    'Is my transaction confirmed if it is only in the mempool?',
    'Vérifie si ma transaction serait confirmée si elle était seulement en mempool.',
    'My wallet says six confirmations. Why is that useful?',
    'Please open my wallet file format documentation.',
    'Do not open my wallet.',
    "N’ouvre pas mon portefeuille.",
  ]) assert.equal(planAliceTurn(message).walletStateReason, null, message);
});

test('explicit offers of secrets take precedence over payment and inspection requests', () => {
  for (const message of [
    'Then send some bitcoin for me. I can paste my recovery phrase here if that gives you access.',
    'I could give you my private key.',
    'Should I share my seed phrase with you?',
    'Do you need my wallet password?',
    'Here is my recovery phrase: [omitted].',
    "Here's my recovery phrase: [omitted].",
    'Here’s my private key: [omitted].',
    'Here are my private keys: [omitted].',
    'Ouvre mon portefeuille. Je peux te donner ma phrase de récupération.',
    'Puis-je te montrer ma clé privée ?',
    'Veux-tu ma phrase de récupération ?',
    'Voici ma clé privée : [omise].',
    'Voici ma phrase de récupération, pas mon adresse publique : [omise].',
  ]) {
    const plan = planAliceTurn(message);
    assert.equal(plan.walletActionReason, 'share-secret', message);
    assert.equal(plan.retrievalQuery, null, message);
    assert.deepEqual(plan.explicitMemoryCandidates, [], message);
  }
});

test('general secret education, negated offers and local restoration are not secret-sharing intents', () => {
  for (const message of [
    'Why should I never share my recovery phrase?',
    'Can you explain what a private key controls?',
    'I will not send you my recovery phrase.',
    'I can paste my recovery phrase into my own hardware wallet?',
    'Explain the warning "I can give you my recovery phrase".',
    'Pourquoi ne faut-il pas partager une phrase de récupération ?',
    'Je ne vais pas te donner ma clé privée.',
    'Je peux saisir ma phrase de récupération dans mon propre portefeuille ?',
    'Here is my transaction ID, not my private key: abc123.',
    "Here's my public address, not my recovery phrase: [public address].",
    'Do you need my public address instead of my seed phrase?',
    'I can give you my transaction ID, not my private key.',
    'I can paste my public address here without sharing my recovery phrase.',
    'Voici mon identifiant de transaction, pas ma clé privée : abc123.',
    'Veux-tu mon adresse publique plutôt que ma phrase de récupération ?',
    'Je peux te donner mon adresse publique, pas ma clé privée.',
  ]) assert.equal(planAliceTurn(message).walletActionReason, null, message);
});

test('direct replies reject invented connections and warn about control of funds without preparation services', async () => {
  const forbidden = new Proxy({} as TurnPreparationServices, {
    get() { throw new Error('Wallet safety requests must not call retrieval, memory or other preparation services'); },
  });
  for (const backendType of ['local', 'cloud'] as const) {
    for (const language of ['en', 'fr'] as const) {
      const question = language === 'en'
        ? 'Open my wallet and check my payment.' : 'Ouvre mon portefeuille et vérifie mon paiement.';
      const first = await prepareAliceTurn({ history: [], userMessage: question, backendType, targetLanguage: language }, forbidden);
      assert.equal(first.diagnostics.retrieval, 'none');
      assert.match(first.directResponse!, language === 'en' ? /cannot open or connect/ : /ne peut pas ouvrir ni connecter/);
      assert.match(first.directResponse!, language === 'en' ? /Check the transaction.*in your wallet app/ : /Consulte la transaction.*dans ton application/);
      const next = language === 'en'
        ? 'Send bitcoin for me. I can give you my recovery phrase.'
        : 'Envoie des bitcoins pour moi. Je peux te donner ma phrase de récupération.';
      const second = await prepareAliceTurn({
        history: [{ role: 'user', content: question }, { role: 'assistant', content: first.directResponse! }],
        userMessage: next, backendType, targetLanguage: language,
      }, forbidden);
      assert.equal(second.diagnostics.retrieval, 'none');
      assert.match(second.directResponse!, language === 'en' ? /Do not share your recovery phrase/ : /Ne partage pas ta phrase de récupération/);
      assert.match(second.directResponse!, language === 'en' ? /control of your funds/ : /contrôle de tes fonds/);
      assert.match(second.directResponse!, language === 'en' ? /cannot access.*or send, sign, or broadcast/ : /ne peut pas accéder.*ni envoyer, signer ou diffuser/);
      assert.match(second.directResponse!, language === 'en' ? /guide you.*without receiving these secrets/ : /guider.*sans recevoir ces secrets/);
      assert.deepEqual(second.explicitMemoryCandidates, []);
    }
  }
});
