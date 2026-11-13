import assert from 'node:assert/strict';
import test from 'node:test';
import { coinbaseArithmeticAntecedent, coinbaseExample, coinbaseArithmeticEvidence, coinbaseNumericContradiction, coinbaseIssuanceContradiction, coinbaseExcessContradiction } from './coinbase-arithmetic.ts';
import { answerRuleViolationsIn, answerRuleRepairGuidance } from './answer-rules.ts';

const en = 'Use hypothetical numbers: the permitted subsidy is 4000 sat and included transactions pay 600 sat in fees. May the coinbase claim 4500 sat? What about 4700 sat?';
const fr = 'Exemple fictif : 5000 sat de subvention autorisée et 900 sat de frais. Une coinbase à 5800 sat passe-t-elle ? Et à 6000 sat ?';
test('hypothetical coinbase arithmetic derives ceilings and underclaims without replacing generation', () => {
  assert.deepEqual(coinbaseExample(en), {subsidy:4000, fees:600, ceiling:4600, comparisons:[4500,4700]});
  assert.deepEqual(coinbaseExample(fr), {subsidy:5000, fees:900, ceiling:5900, comparisons:[5800,6000]});
  for (const [question, language, smaller, cap, net] of [[en,'en',4500,4600,3900],[fr,'fr',5800,5900,4900]] as const) {
    const evidence = coinbaseArithmeticEvidence(question, language, ['bitcoin-issuance-validation']);
    assert.ok(evidence.includes(`${smaller} <= ${cap}`));
    assert.ok(evidence.includes(`C - F = ${net}`));
    assert.equal(coinbaseArithmeticEvidence(question, language, []), '');
  }
});
test('ambiguous or unsupported inputs do not produce arithmetic evidence', () => {
  for(const q of [
    'The subsidy is 4000 sat and fees are 600 sat. Can the coinbase claim 4500 sat?',
    'Example coinbase: subsidy is 4000 sat or subsidy is 5000 sat, fees are 600 sat.',
    'Example coinbase: subsidy is 4.000 sat, fees are 600 sat.',
    'Example coinbase: subsidy is -4000 sat, fees are 600 sat.',
    'Example coinbase: subsidy is 4000 BTC, fees are 600 sat.',
    'Translate this example coinbase: subsidy is 4000 sat, fees are 600 sat.',
    'Example coinbase: subsidy is 4000, fees are 600 sat.',
  ]) assert.equal(coinbaseExample(q),null,q);
  const changed = coinbaseExample('Hypothetical coinbase: subsidy is 7000 sat, fees are 300 sat. Can the miner claim 7200 sat?');
  assert.equal(changed?.ceiling,7300);
});
test('observed contradictory underclaim denial triggers repair despite a correct formula later', () => {
  const bad = 'No, the coinbase cannot claim 4500 sat, and no, it cannot claim 4700 sat. The cap is4600 sat, so4500 is allowed.';
  assert.equal(coinbaseNumericContradiction(bad,en),true);
  assert.ok(answerRuleViolationsIn(bad,['bitcoin-issuance-validation'],en).includes('coinbase-numeric-comparison'));
  assert.equal(answerRuleViolationsIn(bad,[],en).includes('coinbase-numeric-comparison'),false);
  assert.equal(answerRuleRepairGuidance(['coinbase-numeric-comparison'],'en',['bitcoin-issuance-validation']).length,1);
  assert.equal(coinbaseNumericContradiction('Le mineur ne peut pas réclamer 5800 sat.',fr),true);
});
test('valid cap denials, underclaims, refutations and other validity checks stay accepted', () => {
  for(const text of [
    'The coinbase can claim 4500 sat. The coinbase cannot claim 4700 sat.',
    'The coinbase may claim 4500 sat; the miner may not claim 4700 sat.',
    'It is false that the coinbase cannot claim 4500 sat.',
    'The claim that the coinbase cannot claim 4500 sat is false.',
    'A 4500 sat coinbase may be invalid if its script violates another rule.',
    'Can the coinbase claim 4500 sat?',
    'The coinbase cannot claim 4500 sat if the subsidy is only 1000 sat.',
    'The coinbase cannot claim 4500 sat twice.',
  ]) assert.equal(coinbaseNumericContradiction(text,en),false,text);
  assert.equal(coinbaseNumericContradiction('La coinbase peut réclamer 5800 sat. Le mineur ne peut pas réclamer 6000 sat.',fr),false);
});


test('monetary elaborations cannot reverse fees or make difficulty set the subsidy', () => {
  const notes = ['bitcoin-issuance-validation'];
  for (const text of [
    "Souhaitez-vous comprendre comment l'ajustement de la difficulté modifie la valeur de S tous les 2016 blocs, ou comment l'ajustement de la difficulté influence la subvention S ?",
    'Would you like to know how difficulty adjustment changes the subsidy?',
  ]) assert.ok(answerRuleViolationsIn(text,notes).includes('difficulty-subsidy-confusion'),text);
  for (const text of [
    'Les 900 sats de frais correspondent à des bitcoins déjà en circulation qui sont transférés du mineur vers le bloc.',
    'Transaction fees are transferred from the miner into the coinbase.',
  ]) assert.ok(answerRuleViolationsIn(text,notes).includes('issuance-fees-transfer-direction'),text);
  for (const text of [
    'La difficulté ne modifie pas la subvention par bloc.',
    'Difficulty does not set the subsidy.',
    'Difficulty changes the expected time between blocks; the subsidy follows block height.',
    'Les frais sont transférés au mineur dans la coinbase.',
    'Fees move from the included transactions to the miner through the coinbase.',
    'A miner can pay fees in an ordinary transaction.',
  ]) assert.deepEqual(answerRuleViolationsIn(text,notes),[],text);
});


test('a monetary follow-up can reuse only the immediately preceding explicit user example', () => {
  const first = 'Dans un bloc fictif, la subvention autorisée à cette hauteur vaut 8500 sat et les frais des transactions valent 700 sat. Le mineur réclame 9000 sat dans sa coinbase.';
  assert.equal(coinbaseExample(first)?.ceiling,9200);
  const next = 'Est-ce que cela signifie que 9000 nouveaux satoshis sont émis ? Si la coinbase réclamait plutôt 9300 sat, une preuve de travail valide pourrait-elle la rendre acceptable ?';
  const evidence=coinbaseArithmeticEvidence(next,'fr',['bitcoin-issuance-validation'],first);
  assert.match(evidence,/9000 <= 9200/);
  assert.match(evidence,/C - F = 8300/);
  assert.match(evidence,/9300 > 9200/);
  for(const question of [next+' La subvention change.',next+' Utilise les frais actuels.', 'Is my Coinbase account balance acceptable?', 'Would Lightning make this coinbase acceptable?'])assert.equal(coinbaseArithmeticEvidence(question,'en',['bitcoin-issuance-validation'],first),'',question);
  assert.equal(coinbaseArithmeticEvidence(next,'fr',['bitcoin-issuance-validation'],'What is a Bitcoin wallet?'),'');
});

test('net issuance assertions are checked without replacing subsidy limits or alternative examples',()=>{
 const question='Hypothetical example: subsidy is 8500 sat and fees are 700 sat. The miner claims 9000 sat in the coinbase.';
 for(const text of ['The net increase is 8500 sat.','Il obtient 8500 sat de monnaie nouvelle.','Seule la partie de 8500 sat correspond à une émission nouvelle.'])assert.equal(coinbaseIssuanceContradiction(text,question),true,text);
 for(const text of ['The net increase is 8300 sat.','The permitted subsidy is 8500 sat.','At most 8500 sat of new money may be issued.','If the miner claimed the full ceiling, the net increase would be 8500 sat.','La variation nette n’est pas 8500 sat.'])assert.equal(coinbaseIssuanceContradiction(text,question),false,text);
 const follow='Does that mean new coins were issued? Could a coinbase of 9300 sat be acceptable?';
 assert.equal(coinbaseIssuanceContradiction('The net increase is 8500 sat.',follow,question),true);
 assert.equal(coinbaseIssuanceContradiction('The net increase is 8500 sat.',follow,'How does Lightning work?'),false);
 assert.equal(coinbaseIssuanceContradiction('The net increase is 8500 sat.',follow+' The fees changed.',question),false);
 assert.equal(coinbaseIssuanceContradiction('The net increase is 8500 sat.',question.replace('9000 sat','8900 sat or 9000 sat')),false);
});

test("fee concept follow-up preserves the prior example and catches its false ceiling comparison",()=>{
 const prior="Exemple fictif : la subvention autorisée est 6000 sat, les frais sont 400 sat et le mineur réclame 6200 sat dans la coinbase. Quel est le plafond permis et de combien augmente la quantité totale de bitcoins ?";
 const question="Et une coinbase à 6500 sat deviendrait-elle acceptable avec davantage de preuve de travail ? Est-ce que les frais deviennent alors des nouveaux bitcoins ?";
 const answer="Non, une demande de 6500 sat ne deviendra pas acceptable simplement par l'ajout de plus de preuve de travail, car le plafond de la récompense coinbase est fixé à 6400 sat (6000 sat de subvention + 400 sat de frais). Le réseau Bitcoin rejette toute transaction où la somme des sorties coinbase dépasse cette limite, peu importe la quantité de travail fourni par le mineur.\n\nLes frais ne sont pas de nouveaux bitcoins créés par la demande du mineur, mais des bitcoins déjà existants transférés du portefeuille émetteur vers le mineur. Dans votre exemple, les 400 sat de frais sont prélevés sur les entrées de la transaction. Si le mineur réclame 6200 sat alors que les frais sont de 400 sat, cela signifie qu'il tente de recevoir 5800 sat de nouvelles monnaies plus les frais, ce qui dépasse le plafond autorisé de 6400 sat si la subvention est de 6000 sat.\n\nPour que la transaction soit valide, le montant total des sorties coinbase doit rester inférieur ou égal à 6400 sat. Si le mineur tente de recevoir plus, le réseau le rejetera, et l'ajout de preuve de travail ne résoudra pas ce problème de validation.";
 assert.match(coinbaseArithmeticEvidence(question,'fr',['bitcoin-issuance-validation'],prior),/6200 <= 6400/);
 assert.match(coinbaseArithmeticEvidence(question,'fr',['bitcoin-issuance-validation'],prior),/6500 > 6400/);
 assert.equal(coinbaseNumericContradiction(answer,question,prior),true);
 assert.ok(answerRuleViolationsIn(answer,['bitcoin-issuance-validation'],question,prior).includes('coinbase-numeric-comparison'));
 assert.equal(coinbaseNumericContradiction('La coinbase ne peut pas réclamer 6200 sat.',question,prior),true);
 for(const text of ['Si le mineur réclame 6500 sat alors que les frais sont de 400 sat, cela fait 6100 sat nouveaux plus les frais, ce qui dépasse le plafond autorisé de 6400 sat si la subvention est de 6000 sat.','Si le mineur réclame 6200 sat alors que les frais sont de 400 sat, cela fait 5800 sat nouveaux plus les frais, ce qui dépasse le plafond autorisé de 5900 sat si la subvention est de 5500 sat.'])assert.equal(coinbaseNumericContradiction(text,question,prior),false,text);
 for(const extra of [' Les frais sont de 800 sat.',' Utilise les frais actuels.',' La subvention change.'])assert.equal(coinbaseArithmeticEvidence(question+extra,'fr',['bitcoin-issuance-validation'],prior),'');
});

test("overclaim excess subtracts both subsidy and fees",()=>{
 const prior="Exemple fictif : la subvention autorisée est 6000 sat, les frais sont 400 sat et le mineur réclame 6200 sat dans la coinbase. Quel est le plafond permis et de combien augmente la quantité totale de bitcoins ?";
 const question="Et une coinbase à 6500 sat deviendrait-elle acceptable avec davantage de preuve de travail ? Est-ce que les frais deviennent alors des nouveaux bitcoins ?";
 const answer="Non, une demande de 6500 sat ne deviendra jamais acceptable, même avec une preuve de travail immense. Le réseau Bitcoin rejette automatiquement toute transaction de récompense de bloc qui dépasse la somme de la subvention autorisée (6000 sat) et des frais inclus (400 sat), soit un plafond de 6400 sat. La quantité de travail fourni par le mineur ne peut pas contourné cette règle de sécurité du protocole.\n\nDe plus, les frais de transaction ne sont jamais de nouveaux bitcoins. Ils correspondent toujours à des bitcoins déjà existants qui sont transférés du réseau vers le mineur pour récompenser son travail. L'émission de nouveaux bitcoins provient uniquement de la subvention du bloc. Si le mineur réclame 6500 sat, le réseau considère que 500 sat de cette somme sont illégaux et rejette le bloc entier, peu importe la difficulté ou la quantité de calculs effectués.";
 assert.equal(coinbaseExcessContradiction(answer,question,prior),true);
 assert.ok(answerRuleViolationsIn(answer,['bitcoin-issuance-validation'],question,prior).includes('coinbase-numeric-excess'));
 assert.match(coinbaseArithmeticEvidence(question,'fr',['bitcoin-issuance-validation'],prior),/C - \(S \+ F\) = 100 sat/);
 assert.equal(coinbaseExcessContradiction('The excess above the ceiling is 500 sat.',question,prior),true);
 for(const text of ['Le dépassement du plafond est 100 sat.','Si le mineur réclame 6500 sat, les 100 sat excédentaires invalident le bloc.','Si la subvention était 5600 sat, 500 sat seraient illégaux.','Le dépassement n’est pas 500 sat.'])assert.equal(coinbaseExcessContradiction(text,question,prior),false,text);
});


test('a correct net amount for one claim is not constant for every claim', () => {
  const question = 'Hypothetical coinbase example: subsidy is 6000 sat, fees are 400 sat, and the miner claims 6200 sat.';
  for (const answer of [
    'La variation nette reste de 5800 sat, quelle que soit la taille de la coinbase.',
    'The net increase remains 5800 sat regardless of the amount claimed in the coinbase.',
  ]) assert.equal(coinbaseIssuanceContradiction(answer, question), true, answer);
  for (const answer of [
    'La variation nette est 5800 sat pour une coinbase de 6200 sat. Elle change si la coinbase change.',
    'Le plafond reste de 6400 sat, quelle que soit la taille de la coinbase.',
    'La variation nette ne reste pas de 5800 sat quelle que soit la taille de la coinbase.',
    'The net increase does not remain 5800 sat regardless of the amount claimed.',
    'The net increase remains 5800 sat regardless of the amount claimed if fees change by the same amount.',
    'La variation nette reste de 5800 sat quelle que soit la coinbase si les frais varient du même montant.',
  ]) assert.equal(coinbaseIssuanceContradiction(answer, question), false, answer);
});


const transferFirst='Use fictional values: permitted Bitcoin subsidy is 7000 sat, included transaction fees are 900 sat, and the miner claims 7300 sat in the coinbase outputs. What is the allowed ceiling, is that claim allowed, and what is the net supply increase?';
const transferUpdate='Keep the subsidy and claimed coinbase amount the same, but set the included fees to 400 sat instead. Recalculate the ceiling and net increase.';
const transferClaim='With those updated fees, could a claim of 7500 sat be accepted if the miner found a much stronger proof of work? Why?';
test('coinbase arithmetic follows explicit user fee updates over three turns',()=>{
 const prior=coinbaseArithmeticAntecedent([transferFirst,transferUpdate]);
 const second=coinbaseArithmeticEvidence(transferUpdate,'en',['bitcoin-issuance-validation'],transferFirst);
 assert.match(second,/ceiling S \+ F = 7400/);
 assert.match(second,/C - F = 6900/);
 const third=coinbaseArithmeticEvidence(transferClaim,'en',['bitcoin-issuance-validation'],prior);
 assert.match(third,/7500 > 7400/);
 assert.match(third,/Excess above ceiling C - \(S \+ F\) = 100/);
 assert.ok(!third.includes('7900'));
 assert.equal(coinbaseArithmeticEvidence(transferClaim,'en',['bitcoin-issuance-validation'],coinbaseArithmeticAntecedent([transferFirst,'What is Lightning?',transferUpdate])), '');
 for(const q of [transferUpdate.replace('400 sat','400 BTC'),transferUpdate.replace('400 sat','-400 sat'),transferUpdate+' Also set subsidy to 6000 sat.',transferUpdate.replace('the same','different'),transferUpdate+' In my real wallet.']) assert.equal(coinbaseArithmeticEvidence(q,'en',['bitcoin-issuance-validation'],transferFirst),'',q);
});


test('coinbase numeric checks cover displayed English thousands and wrong ceilings',()=>{
 const prior=coinbaseArithmeticAntecedent([transferFirst]);
 assert.equal(coinbaseNumericContradiction('With the new parameters, the allowed ceiling is **8,400 sat**.',transferUpdate,prior),true);
 assert.equal(coinbaseNumericContradiction('The allowed ceiling is 7,400 sat.',transferUpdate,prior),false);
 assert.equal(coinbaseIssuanceContradiction('The net supply increase is 6,400 sat.',transferUpdate,prior),true);
 assert.equal(coinbaseIssuanceContradiction('The net supply increase is 6,900 sat.',transferUpdate,prior),false);
 for(const a of ['The ceiling is not 8,400 sat.','If fees were 1,400 sat, the ceiling is 8,400 sat.','Is the ceiling 8,400 sat?','It is false that the ceiling is 8,400 sat.','The ceiling is 8,400 sat is false.','The previous ceiling is 7,900 sat. The ceiling is 7,400 sat.','The ceiling = 7,000 sat + 400 sat = 7,400 sat.']) assert.equal(coinbaseNumericContradiction(a,transferUpdate,prior),false,a);
});


test('net issuance checks cannot jump over another amount to borrow its predicate',()=>{
 const correct='While the total reward is 7,300 sat, only 6,400 sat represents new issuance, as the remaining 900 sat are existing bitcoins transferred to the miner.';
 assert.equal(coinbaseIssuanceContradiction(correct,transferFirst),false);
 assert.equal(coinbaseIssuanceContradiction(correct.replace('6,400','6,300'),transferFirst),true);
 assert.equal(coinbaseIssuanceContradiction('7,300 sat de récompense, dont 6,400 sat correspondent à une émission nouvelle.',transferFirst),false);
 assert.equal(coinbaseIssuanceContradiction('7,300 sat représentent une récompense, dont 6,300 sat correspondent à une émission nouvelle.',transferFirst),true);
});

const freshFr = ["Prenons des valeurs fictives : subvention autorisée de 8000 sat, frais inclus de 600 sat, sorties de coinbase de 8300 sat. Quel est le plafond autorisé et l’augmentation nette de la quantité de bitcoins ? Cette coinbase respecte-t-elle la limite ?", "Je conserve la subvention et le montant réclamé dans la coinbase, mais les frais inclus passent à 350 sat. Refais les deux calculs.", "Avec ces nouveaux frais, un mineur pourrait-il réclamer 8400 sat si sa preuve de travail est plus forte ?"];
test('French included fees and an explicitly retained coinbase amount stay coherent across three user turns',()=>{
 assert.deepEqual(coinbaseExample(freshFr[0]),{subsidy:8000,fees:600,ceiling:8600,comparisons:[8300]});
 const second=coinbaseArithmeticEvidence(freshFr[1],'fr',['bitcoin-issuance-validation'],freshFr[0]);
 assert.match(second,/plafond S \+ F = 8350/); assert.match(second,/C - F = 7950/);
 const prior=coinbaseArithmeticAntecedent(freshFr.slice(0,2));
 assert.match(coinbaseArithmeticEvidence(freshFr[2],'fr',['bitcoin-issuance-validation'],prior),/8400 > 8350/);
 for(const invalid of [freshFr[1].replace('Je conserve','Je ne conserve pas'),freshFr[1].replace('350 sat','350 BTC'),freshFr[1]+' La subvention change aussi à 7000 sat.',freshFr[1]+' Dans mon wallet réel.']) assert.equal(coinbaseArithmeticEvidence(invalid,'fr',['bitcoin-issuance-validation'],freshFr[0]),'',invalid);
 assert.equal(coinbaseArithmeticEvidence(freshFr[2],'fr',['bitcoin-issuance-validation'],coinbaseArithmeticAntecedent([freshFr[0],'Explique Lightning.',freshFr[1]])),'');
 assert.ok(coinbaseIssuanceContradiction("L’augmentation nette de la quantité de bitcoins est de 8000 sat.",freshFr[0]));
 assert.ok(coinbaseIssuanceContradiction("L’augmentation nette de la quantité de bitcoins reste de 8000 sat.",freshFr[1],freshFr[0]));
});


test('a permitted subsidy is not automatically the amount issued in an underclaim example',()=>{
 assert.ok(coinbaseIssuanceContradiction('La subvention de 8 000 sat représente de nouveaux bitcoins émis.',freshFr[1],freshFr[0]));
 assert.ok(coinbaseIssuanceContradiction('8 000 sat represents newly issued bitcoins.',freshFr[1],freshFr[0]));
 assert.equal(coinbaseIssuanceContradiction('7 950 sat représente de nouveaux bitcoins émis.',freshFr[1],freshFr[0]),false);
 for(const text of ['Au maximum, 8000 sat représentent de nouveaux bitcoins émis.', 'Si le mineur réclame la totalité, 8000 sat représentent de nouveaux bitcoins émis.', '8000 sat ne représentent pas de nouveaux bitcoins émis.'])assert.equal(coinbaseIssuanceContradiction(text,freshFr[1],freshFr[0]),false,text);
});
