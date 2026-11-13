import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {groundedRecoveryConfirmations as explain} from './grounded-recovery-confirmations.ts';
import type {Message} from './llm.ts';
const bip='Topic: The optional passphrase';
const conf='Topic: Confirmations';
const history=(q:string):Message[]=>[{role:'user',content:q},{role:'assistant',content:'An earlier answer is not a retrieval source.'}];

test('BIP39 recovery explains key derivation and distinct access credentials in both languages',()=>{
  const en=explain('I forgot my BIP39 passphrase. Are the recovery words enough?','en',bip)!;
  for(const fact of [/exact original passphrase/,/seed and private keys/,/device PIN or local app password/,/no universal passphrase reset/,/known candidates/,/do not send them here/]) assert.match(en,fact);
  const fr=explain('Si ma passphrase BIP39 est oubliée, mes mots suffisent-ils à restaurer le portefeuille ?','fr','Topic: La passphrase optionnelle')!;
  for(const fact of [/passphrase originale exacte/,/PIN d’appareil/,/ni réinitialisation universelle/,/candidats connus/]) assert.match(fr,fact);
});
test('empty display is not a diagnosis, including the same topic in a follow-up',()=>{
  const q='I tried another variant and the wallet is empty without an error. Does that prove the passphrase is correct?';
  const en=explain(q,'en',bip,history('Are my BIP39 recovery words enough if I forgot the passphrase?'))!;
  for(const fact of [/Every BIP39 passphrase/,/another valid wallet/,/does not establish that a different wallet/,/derivation path, account, network or incomplete synchronization/,/locally/,/do not share/]) assert.match(en,fact);
  assert.equal(explain(q,'en',bip),null);
  assert.equal(explain(q,'en',bip,history('How does a Bitcoin payment get confirmed?')),null);
});
test('reorganization distinguishes branches, validity and input conflicts without diagnosing loss',()=>{
  const en=explain('A Bitcoin transaction lost its confirmation after a reorg. Is that proof of theft?','en',conf)!;
  for(const fact of [/does not itself prove theft/,/more cumulative proof of work/,/If still valid/,/mempool/,/without a guarantee/,/same input outpoint/,/cannot infer their current state/]) assert.match(en,fact);
  const fr=explain('Un paiement Bitcoin a perdu une confirmation après une réorganisation. Est-ce un remboursement ?','fr','Topic: Les confirmations')!;
  assert.match(fr,/pas à lui seul un vol/);assert.match(fr,/même outpoint/);
});
test('confirmation count and risk are distinct, with contextual threshold and no guaranteed finality',()=>{
  const en=explain('Do six confirmations make a Bitcoin payment mathematically irreversible for any value?','en',conf)!;
  for(const fact of [/6 confirmations count that block plus 5 blocks built after it/,/not repeated/,/not necessarily require majority hash power/,/value at stake and the threat assumptions/,/No precise reversal probability/]) assert.match(en,fact);
  const follow=explain('Et le risque devient-il nul pour un montant énorme ?','fr','Topic: Les confirmations',history('Pourquoi un paiement Bitcoin perd-il une confirmation dans une réorganisation ?'))!;
  assert.match(follow,/valeur en jeu/);assert.match(follow,/mathématiquement nul/);
  const twelve=explain('How do I count 12 confirmations on Bitcoin?','en',conf)!;
  assert.match(twelve,/12 confirmations count that block plus 11/);
});
test('current exact retrieved topic is required, never an evidence mention or the old assistant topic',()=>{
  for(const source of ['', 'Notes: The optional passphrase', 'Topic: Wallet backups',conf]) assert.equal(explain('Are my BIP39 words enough to recover without its passphrase?','en',source),null);
  for(const source of ['', 'Notes: Confirmations',bip]) assert.equal(explain('Can six Bitcoin confirmations make risk zero?','en',source),null);
  const q='And is that risk zero?';
  assert.equal(explain(q,'en',conf,[{role:'assistant',content:'Bitcoin confirmations reduce risk.'}]),null);
  assert.equal(explain(q,'en',conf,[...history('Can six Bitcoin confirmations make risk zero?'),{role:'user',content:'How do mining fees work?'}]),null);
});
test('operations, specialist requests, new subjects and unsupported formats stay outside scope',()=>{
  for(const q of [
    'Can you restore my BIP39 wallet with its passphrase?',
    'Restore my BIP39 passphrase wallet?',
    'Calculate the PBKDF2 output for this BIP39 passphrase?',
    'Explain BIP39 passphrase recovery in one sentence?',
    'Compare BIP39 recovery and Lightning backups?',
    'Can six email confirmations guarantee delivery?',
    'Can you check whether my Bitcoin transaction has six confirmations?',
    'What is the probability of reversing six Bitcoin confirmations?',
    'How does pruning remove old Bitcoin confirmations?',
    'Does RBF replace a Bitcoin transaction with six confirmations?',
    'Another topic: explain how six confirmations affect risk?',
    'Can my BIP39 passphrase recover Bitcoin transactions lost in a reorg?',
    'I lost the seed. Can my wallet be recovered?',
    'I never set a BIP39 passphrase. Are my words enough?',
    'Explain BIP39 passphrase recovery and also explain inflation?',
  ]) assert.equal(explain(q,'en',bip+'\n'+conf,history('Are my BIP39 passphrase words enough?')),null,q);
});
test('the BIP39 and confirmation fixture turns each receive a checked explanation',()=>{
  const fixture=JSON.parse(readFileSync(new URL('../../../scripts/data/memory-relevance/free-response-cases-2026-11-06.json',import.meta.url),'utf8'));
  const selected=fixture.conversations.filter((c:{id:string})=>['fr-bip39-passphrase-recovery','fr-confirmations-reorg'].includes(c.id));
  assert.equal(selected.length,2);
  for(const c of selected) {
    const previous:Message[]=[];
    for(const t of c.turns) {
      const answer=explain(t.question,'fr',c.id.includes('bip39')?'Topic: La passphrase optionnelle':'Topic: Les confirmations',previous);
      assert.ok(answer,`${c.id}: ${t.question}`);
      previous.push({role:'user',content:t.question},{role:'assistant',content:answer});
    }
  }
});
