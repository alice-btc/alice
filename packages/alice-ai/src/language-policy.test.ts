import assert from 'node:assert/strict';
import test from 'node:test';
import {
  conversationLanguageAfter,
  detectExplicitResponseLanguage,
  detectTextLanguage,
  dominantHistoryLanguage,
  isResponseLanguageAcceptable,
  resolveResponseLanguage,
} from './language-policy.ts';

test('detects ordinary French and English questions', () => {
  assert.equal(detectTextLanguage("Qu'est-ce que le proof of work et pourquoi est-il utile ?")?.language, 'fr');
  assert.equal(detectTextLanguage('What is proof of work and why does Bitcoin need it?')?.language, 'en');
});

test('detects short acknowledgements early enough for safe streaming', () => {
  assert.equal(detectTextLanguage("Got it, I'll keep my replies concise.")?.language, 'en');
  assert.equal(detectTextLanguage("Compris, je vais garder mes réponses concises.")?.language, 'fr');
});

test('ignores code and URLs while detecting a response language', () => {
  assert.equal(detectTextLanguage('Please explain `const langue = "francais"` from https://example.fr')?.language, 'en');
});

test('explicit language request wins over the language of the question', () => {
  assert.equal(detectExplicitResponseLanguage('What is Ark ? Réponds-moi en français.'), 'fr');
  assert.equal(resolveResponseLanguage({
    message: 'Explique-moi Ark, but answer in English.',
    preference: 'fr',
  }).targetLanguage, 'en');
});

test('pinned preference wins when there is no explicit request', () => {
  const decision = resolveResponseLanguage({
    message: 'What is Bitcoin?',
    preference: 'fr',
    appLanguage: 'en',
  });
  assert.deepEqual(decision, { targetLanguage: 'fr', source: 'preference', confidence: 1 });
});

test('explicit request also wins over the app language', () => {
  const decision = resolveResponseLanguage({
    message: 'Qu\'est-ce que Ark ? Answer in English please.',
    preference: 'app',
    appLanguage: 'fr',
  });
  assert.equal(decision.targetLanguage, 'en');
  assert.equal(decision.source, 'explicit');
});

test('Same as app answers in the app language, whatever the message looks like', () => {
  for (const message of ['Explain Lightning', 'Tell me more', 'Thanks', 'Bitcoin halving', 'Ark?']) {
    const decision = resolveResponseLanguage({
      message,
      preference: 'app',
      appLanguage: 'en',
      interfaceLanguage: 'fr-FR',
    });
    assert.deepEqual(decision, { targetLanguage: 'en', source: 'app', confidence: 1 }, message);
  }
  // A French question in an English app still gets English: with 'app', the app language is the rule.
  assert.equal(resolveResponseLanguage({
    message: "Qu'est-ce que le proof of work et pourquoi est-il utile ?",
    preference: 'app',
    appLanguage: 'en',
  }).targetLanguage, 'en');
});

test('a missing preference means Auto: a French question in an English app gets French', () => {
  const decision = resolveResponseLanguage({
    message: "Qu'est-ce que le proof of work et pourquoi est-il utile ?",
    appLanguage: 'en',
    interfaceLanguage: 'en-US',
  });
  assert.equal(decision.targetLanguage, 'fr');
  assert.equal(decision.source, 'message');
});

test('by default a message too short to tell its language falls back to the app language', () => {
  for (const message of ['Thanks', 'Ark?', 'UTXO?']) {
    const decision = resolveResponseLanguage({ message, appLanguage: 'fr', interfaceLanguage: 'en-US' });
    assert.deepEqual(decision, { targetLanguage: 'fr', source: 'app', confidence: 0.5 }, message);
  }
});

test('with Same as app and no chosen app language, the interface locale stands in for it', () => {
  const sameAsApp = (interfaceLanguage: string) =>
    resolveResponseLanguage({ message: 'UTXO?', preference: 'app', interfaceLanguage });
  assert.equal(sameAsApp('fr-FR').targetLanguage, 'fr');
  assert.equal(sameAsApp('en-US').targetLanguage, 'en');
  assert.equal(sameAsApp('de-DE').targetLanguage, 'en');
  assert.equal(sameAsApp('de-DE').source, 'app');
});

test('Auto follows a clear current message first', () => {
  const decision = resolveResponseLanguage({
    message: 'What is proof of work and why does Bitcoin need it?',
    preference: 'auto',
    appLanguage: 'fr',
    history: [{ role: 'user', content: "Qu'est-ce que le proof of work et pourquoi est-il utile ?" }],
    interfaceLanguage: 'fr-FR',
  });
  assert.equal(decision.targetLanguage, 'en');
  assert.equal(decision.source, 'message');
});

test('Auto reads the recent user turns for a short follow-up, before the interface locale', () => {
  const history = [
    { role: 'user', content: 'What is the Lightning Network and how does it work?' },
    { role: 'assistant', content: "Le Lightning Network est un reseau de paiement qui fonctionne au-dessus de Bitcoin." },
    { role: 'user', content: 'Tell me more' },
  ];
  const decision = resolveResponseLanguage({
    message: 'Tell me more',
    preference: 'auto',
    appLanguage: 'fr',
    history,
    interfaceLanguage: 'fr-FR',
  });
  assert.equal(decision.targetLanguage, 'en');
  assert.equal(decision.source, 'history');
});

test('Auto history keeps only the last 5 user turns and breaks a tie with the most recent', () => {
  const french = { role: 'user', content: "Qu'est-ce que le proof of work et pourquoi est-il utile ?" };
  const english = { role: 'user', content: 'What is proof of work and why does Bitcoin need it?' };
  const filler = { role: 'user', content: 'Ark?' };
  assert.equal(dominantHistoryLanguage([french, french, french, english, english, filler, filler, filler])?.language, 'en');
  assert.equal(dominantHistoryLanguage([english, french])?.language, 'fr');
  assert.equal(dominantHistoryLanguage([french, english])?.language, 'en');
  assert.equal(dominantHistoryLanguage([{ role: 'assistant', content: english.content }]), null);
});

test('Auto falls back to the app language, then the interface locale, when nothing is conclusive', () => {
  const inconclusive = { message: 'Ark?', preference: 'auto' as const, history: [{ role: 'user', content: 'UTXO?' }] };
  const withApp = resolveResponseLanguage({ ...inconclusive, appLanguage: 'en', interfaceLanguage: 'fr-FR' });
  assert.equal(withApp.targetLanguage, 'en');
  assert.equal(withApp.source, 'app');
  const withoutApp = resolveResponseLanguage({ ...inconclusive, interfaceLanguage: 'fr-FR' });
  assert.equal(withoutApp.targetLanguage, 'fr');
  assert.equal(withoutApp.source, 'interface');
});

test('rejects a clear wrong-language response but accepts technical fragments', () => {
  assert.equal(isResponseLanguageAcceptable('Bitcoin est un reseau monetaire ouvert qui permet de transferer de la valeur.', 'en'), false);
  assert.equal(isResponseLanguageAcceptable('Bitcoin is an open monetary network that lets people transfer value.', 'en'), true);
  assert.equal(isResponseLanguageAcceptable('UTXO: txid:vout', 'fr'), true);
});

test('quoted source text does not override the language of the answer', () => {
  const answer = 'The source says: « Bitcoin est un reseau monetaire ouvert qui permet de transferer de la valeur. » This explains why users can verify the rules.';
  assert.equal(isResponseLanguageAcceptable(answer, 'en'), true);
});

test('a language asked for in a message holds for the rest of the conversation', () => {
  let kept = conversationLanguageAfter('Réponds en anglais, s’il te plaît.', null);
  for (const message of ['Et le Lightning ?', 'Pourquoi les canaux ont-ils besoin de liquidité ?']) {
    kept = conversationLanguageAfter(message, kept);
    assert.equal(kept, 'en');
    assert.equal(resolveResponseLanguage({ message, preference: kept ?? 'fr', appLanguage: 'fr' }).targetLanguage, 'en');
  }
});

test('a new request in the same conversation replaces the previous one', () => {
  assert.equal(conversationLanguageAfter('Reviens au français.', 'en'), 'fr');
  assert.equal(conversationLanguageAfter('Switch back to English please.', 'fr'), 'en');
  assert.equal(conversationLanguageAfter('Go back to English.', 'fr'), 'en');
  assert.equal(conversationLanguageAfter('Repasse en anglais.', 'fr'), 'en');
});

test('a new conversation starts again from Settings', () => {
  const kept = conversationLanguageAfter('Qu’est-ce que le proof of work ?', null);
  assert.equal(kept, null);
  assert.equal(resolveResponseLanguage({ message: 'What is proof of work?', preference: kept ?? 'fr' }).targetLanguage, 'fr');
});

test('saying which languages one speaks, or asking for a translation, changes nothing', () => {
  for (const message of [
    'Je parle anglais couramment, mais explique simplement.',
    'Traduis ce paragraphe en anglais.',
    'Comment dit-on clé privée en anglais ?',
    'I go to English classes, what is a seed phrase?',
    'Is French the language of the Bitcoin white paper?',
  ]) {
    assert.equal(conversationLanguageAfter(message, null), null, message);
  }
});

test('short explanation imperatives keep their language beside shared technical terms', () => {
  for (const message of ['Explique comment fonctionne un paiement Lightning.', 'Explique Lightning.', 'Expliquez Bitcoin.', 'Explique-moi les UTXO.']) {
    const decision = resolveResponseLanguage({ message, appLanguage: 'en' });
    assert.equal(decision.targetLanguage, 'fr', message);
    assert.equal(decision.source, 'message', message);
  }
  assert.equal(resolveResponseLanguage({ message: 'Explain Lightning.', appLanguage: 'fr' }).targetLanguage, 'en');
  assert.equal(resolveResponseLanguage({ message: 'Explique Lightning.', preference: 'en', appLanguage: 'fr' }).targetLanguage, 'en');
  for (const message of ['Lightning', 'UTXO', 'Bitcoin']) assert.equal(detectTextLanguage(message), null);
  assert.equal(detectTextLanguage('What does "explique Lightning" mean in this example?')?.language, 'en');
});
