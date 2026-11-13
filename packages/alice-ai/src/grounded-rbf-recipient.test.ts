import assert from 'node:assert/strict';
import test from 'node:test';
import { groundedRbfRecipient } from './grounded-rbf-recipient.ts';
import type { Message } from './llm.ts';

const source = 'Topic: Raising fees with RBF\nNotes: Replacement policy does not guarantee recipient outputs.';
const fixtureQuestion = "L'expéditeur vient de me dire qu'il va faire un RBF. Je peux donc considérer que mon adresse et le montant que je reçois resteront forcément identiques dans la transaction de remplacement ?";
const previous = "Je suis le destinataire d'une transaction Bitcoin non confirmée. Je contrôle l'adresse qui reçoit, mais aucune clé de l'expéditeur. Puis-je accélérer cette transaction moi-même avec RBF, ou le CPFP est-il plus pertinent ?";

test('actual recipient guarantee question and FR/EN paraphrases receive a bounded source-backed explanation', () => {
  for (const q of [fixtureQuestion,
    'Does RBF have to preserve my receiving address and amount?',
    'Can a replace-by-fee transaction change recipient outputs?',
    'Will my payment amount stay the same if the sender uses RBF?',
    'RBF doit-il conserver les destinataires et les montants ?',
    'Est-ce que RBF peut changer mon adresse de réception ?',
  ]) {
    assert.ok(groundedRbfRecipient(q, 'en', source), q);
    assert.ok(groundedRbfRecipient(q, 'fr', 'Topic: Augmenter les frais avec RBF'), q);
  }
});

test('current retrieved Topic is mandatory, not a body mention or previous assistant claim', () => {
  for (const context of ['', 'Notes: Raising fees with RBF', 'Topic: Child Pays For Parent', 'Topic: Transaction fees']) {
    assert.equal(groundedRbfRecipient(fixtureQuestion, 'fr', context), null, context);
  }
});

test('replacement follow-up can use only the immediate user payment topic, including after CPFP', () => {
  const follow = 'Et dans le remplacement, mon adresse et le montant resteront-ils identiques ?';
  const history: Message[] = [{ role: 'user', content: previous }, { role: 'assistant', content: 'Every replacement guarantees the recipient amount.' }];
  assert.ok(groundedRbfRecipient(follow, 'fr', source, history));
  assert.ok(groundedRbfRecipient(follow, 'fr', source, [...history, { role: 'user', content: follow }]));
  assert.ok(groundedRbfRecipient('And must the replacement preserve my amount?', 'en', source, [{ role: 'user', content: 'Can a recipient use CPFP for an unconfirmed transaction?' }]));
  assert.equal(groundedRbfRecipient(follow, 'fr', source, [{ role: 'assistant', content: previous }]), null);
  assert.equal(groundedRbfRecipient(follow, 'fr', source, [...history, { role: 'user', content: 'How do hardware wallet backups work?' }]), null);
  assert.equal(groundedRbfRecipient('And will my amount stay the same?', 'en', source, history), null);
});

test('definitions, separate topics and additional format requests remain outside the narrow answer', () => {
  for (const q of [
    previous,
    'I am the recipient. Can I speed up this transaction myself with RBF or CPFP?',
    'Calculate the changed output amount of my RBF replacement.',
    'Combien de monnaie reste dans ma sortie après un RBF ?',
    'What is RBF?',
    'How does CPFP work for a recipient?',
    'Which fee should I use for my RBF replacement?',
    'Does changing my address in an RBF replacement improve privacy?',
    'Compare RBF and CPFP: do they preserve recipient outputs?',
    'Explain in one sentence whether RBF preserves recipient amounts.',
    'Translate: does RBF keep my receiving address?',
    'My payment is already confirmed. Can RBF change its recipient?',
    'Different topic: can a Lightning invoice keep the same amount?',
    'Changeons de sujet : mon adresse Lightning restera-t-elle identique ?',
    'And can my backup preserve the same address?',
    'This is not about RBF. Does my recipient address stay the same?',
  ]) assert.equal(groundedRbfRecipient(q, 'en', source, [{ role: 'user', content: previous }]), null, q);
});

test('answer covers output changes and practical verification without inventing actions or guarantees', () => {
  const en = groundedRbfRecipient(fixtureQuestion, 'en', source)!;
  for (const fact of [/does not guarantee.*address, recipient or received amount/, /can change.*outputs/, /subject to validity/, /does not mean every RBF necessarily reduces or removes/, /initially displayed unconfirmed receipt does not guarantee settlement/, /actual replacement transaction/, /address, amount and confirmation status/, /wallet or a reliable explorer/, /cannot inspect/, /broadcasting.*guarantees neither acceptance nor confirmation/, /relay policies and miners/, /Opt-in signaling is not a universal requirement/]) assert.match(en, fact);
  const fr = groundedRbfRecipient(fixtureQuestion, 'fr', source)!;
  for (const fact of [/ne garantit pas.*adresse.*montant/, /modifier les sorties/, /chaque RBF réduit ou supprime nécessairement/, /affichage initial.*ne garantit pas le règlement/, /transaction de remplacement réelle/, /adresse, son montant et son état de confirmation/, /ni son acceptation ni sa confirmation/, /opt-in n’est pas une condition universelle/, /n’ai pas accès/]) assert.match(fr, fact);
  assert.doesNotMatch(en + fr, /I (?:sent|signed|broadcast|checked your)|j’ai (?:envoyé|signé|diffusé|vérifié ton)/i);
});
