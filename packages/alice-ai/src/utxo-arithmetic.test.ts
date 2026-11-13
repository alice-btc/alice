import assert from 'node:assert/strict';
import test from 'node:test';
import {resolveUtxoExample,utxoExample,utxoArithmeticEvidence,utxoNumericContradiction,utxoOutputTotalContradiction} from './utxo-arithmetic.ts';
import {answerRuleViolationsIn} from './answer-rules.ts';
const fr='Pour comprendre les UTXO, imagine deux anciennes sorties de 12000 et 19000 sat utilisées ensemble pour payer 18000 sat, avec 1000 sat de frais. Décris les anciennes et nouvelles sorties de cet exemple fictif.';
const en='For a made-up example, one input is 18000 sat, the recipient gets 11500 sat and the fee is 700 sat. How much change is created?';
test('UTXO educational arithmetic preserves all inputs, payment, fee and change',()=>{
 assert.deepEqual(utxoExample(fr),{inputs:[12000,19000],total:31000,payment:18000,fee:1000,change:12000});
 assert.equal(utxoExample(en)?.change,5800);
 assert.equal(utxoExample('Exemple fictif : une entrée de 23000 sat, 14000 sat pour le destinataire et 800 sat de frais.')?.change,8200);
 const question='Hypothetical example: previous outputs of 8000 sat and 15000 sat, payment of 14000 sat, fee is 2000 sat.';
 assert.equal(utxoExample(question)?.change,7000);
 assert.match(utxoArithmeticEvidence(fr,'fr',['transaction-inputs-outputs']),/31000 - 18000 - 1000 = 12000/);
 assert.equal(utxoArithmeticEvidence(fr,'fr',[]),'');
});
test('UTXO arithmetic declines unsupported or ambiguous educational amounts',()=>{
 for(const q of [en.replace('18000 sat','18000 BTC'),en.replace('18000 sat','18000'),en.replace('18000 sat','-18000 sat'),en.replace('11500 sat','21000 sat'),en+' Another input is 1000 sat.',en.replace('made-up example','payment'),en.replace('18000 sat','18,000 sat')])assert.equal(utxoExample(q),null,q);
});
test('observed wrong two-input change triggers repair; correct and refuted values stay accepted',()=>{
 const wrong='La transaction crée une sortie de 18 000 sats envoyée au destinataire et une de 10 000 sats (12 000 + 19 000 - 18 000 - 1 000) qui constitue la monnaie rendue.';
 assert.equal(utxoNumericContradiction(wrong,fr),true);
 assert.ok(answerRuleViolationsIn(wrong,['transaction-inputs-outputs'],fr).includes('utxo-numeric-change'));
 assert.equal(utxoNumericContradiction('The change output is 5900 sat.',en),true);
 assert.equal(utxoNumericContradiction('The fee is not an output; the change output is 5900 sat.',en),true);
 assert.equal(utxoNumericContradiction('It is not 5900 sat of change.',en),false);
 for(const text of ['The change output is 5800 sat.','The change is not 5900 sat.','If the fee were different, the change would be 5900 sat.','Is the change 5900 sat?'])assert.equal(utxoNumericContradiction(text,en),false,text);
 assert.equal(utxoNumericContradiction(wrong.replace('10 000 sats','12 000 sats'),fr),false);
});

test('comma-separated recipient and fee amounts cannot become extra inputs',()=>{
 const fr='Exemple fictif : une entrée de 23000 sat, 14000 sat pour le destinataire et 800 sat de frais.';
 assert.deepEqual(utxoExample(fr),{inputs:[23000],total:23000,payment:14000,fee:800,change:8200});
 assert.deepEqual(utxoExample('Hypothetical example: inputs of 8000 sat, 15000 sat, 14000 sat to the recipient and 2000 sat in fees.'),{inputs:[8000,15000],total:23000,payment:14000,fee:2000,change:7000});
 assert.equal(utxoNumericContradiction('La monnaie est 22200 sat.',fr),true);
 assert.equal(utxoNumericContradiction('La monnaie est 8200 sat.',fr),false);
});

test("output totals and English thousands retain fees",()=>{
 const question="For a hypothetical Bitcoin transaction, previous outputs of 12900 sat and 17100 sat are spent together, payment is 20000 sat and fee is 900 sat. Explain the new outputs and whether any value remains in the old outputs.";
 const answer="In this transaction, the two previous outputs totaling 30,000 satoshis are consumed in full. They no longer exist as spendable units; instead, they are replaced by two new outputs: one for the payment of 20,000 satoshis and one for the change of 9,100 satoshis. The fee of 900 satoshis is not a new output; it is the difference between the inputs and the outputs, sent directly to the miner.\n\nThe old outputs are not edited or partially spent. The entire 30,000 satoshis from the previous outputs is transferred to the new outputs. You can verify this with the accounting rule: the sum of inputs (30,000) equals the sum of new outputs (20,000 + 9,100) plus the fee (900).\n\nTo visualize this, imagine a jar containing 30,000 coins. You do not take some out and leave the rest in the jar. Instead, you pour all 30,000 coins into two new piles: one pile of 20,000 coins for the recipient and one pile of 9,100 coins for yourself. The original jar is empty, and the coins now exist only in the new piles.";
 assert.equal(utxoOutputTotalContradiction(answer,question),true);
 assert.ok(answerRuleViolationsIn(answer,['transaction-inputs-outputs'],question).includes('utxo-numeric-output-total'));
 assert.equal(utxoNumericContradiction('The change is 9,900 satoshis.',question),true);
 assert.equal(utxoNumericContradiction('The change is 9,100 satoshis.',question),false);
 for(const text of ['Total outputs = 30,000 satoshis.','La totalité des 30 000 satoshis est transférée aux nouvelles sorties.'])assert.equal(utxoOutputTotalContradiction(text,question),true,text);
 for(const text of ['Total outputs = 20,000 sat + 9,100 sat = 29,100 sat.','Total outputs = 29,100 satoshis.','The entire 30,000 satoshis is allocated to the new outputs and the fee.','The entire 30,000 satoshis is not transferred to the new outputs.','If fees were zero, total outputs = 30,000 sat.','Total outputs = 30,000 sat?'])assert.equal(utxoOutputTotalContradiction(text,question),false,text);
});


const transfer = 'Pour une transaction Bitcoin fictive, je dépense ensemble deux sorties de 26000 sat et 19000 sat. Le destinataire reçoit 28000 sat et les frais valent 1200 sat. Décris les nouvelles sorties et ce qui reste des anciennes.';
const updatedFees = 'Je garde les mêmes entrées et le même paiement, mais je prépare plutôt la transaction avec 500 sat de frais. Que devient la monnaie ?';
test('natural-language spending example receives checked arithmetic and catches the observed error', () => {
 assert.deepEqual(utxoExample(transfer), {inputs:[26000,19000],total:45000,payment:28000,fee:1200,change:15800});
 assert.equal(utxoNumericContradiction('La monnaie rendue est de 6000 sat.',transfer),true);
 assert.equal(utxoNumericContradiction('La monnaie rendue est de 15800 sat.',transfer),false);
});
test('explicit fee replacement retains user inputs and payment, with updated checks', () => {
 assert.deepEqual(resolveUtxoExample(updatedFees,transfer),{inputs:[26000,19000],total:45000,payment:28000,fee:500,change:16500});
 assert.match(utxoArithmeticEvidence(updatedFees,'fr',['transaction-inputs-outputs'],transfer),/augmente de 700 sat/);
 assert.equal(utxoNumericContradiction('La monnaie est de 21000 sat.',updatedFees,transfer),true);
 assert.equal(utxoNumericContradiction('Avant, la monnaie était de 15800 sat. La monnaie est de 16500 sat.',updatedFees,transfer),false);
 assert.equal(utxoOutputTotalContradiction('Total des sorties = 45000 sat.',updatedFees,transfer),true);
 assert.ok(answerRuleViolationsIn('La monnaie est de 21000 sat.',['transaction-inputs-outputs'],updatedFees,transfer).includes('utxo-numeric-change'));
 assert.equal(resolveUtxoExample('Keep the same inputs and the same payment, with 200 sat in fees. What is the change?',en)?.change,6300);
 for (const q of [updatedFees.replace('mêmes entrées','nouvelles entrées'),updatedFees.replace('même paiement','nouveau paiement'),updatedFees.replace('500 sat','500 BTC'),updatedFees.replace('500 sat','-500 sat'),updatedFees.replace('500 sat','50000 sat'),updatedFees+' Et 20 pour autre chose.',updatedFees+' Sur mon wallet réel.',updatedFees+' Ou 600 sat de frais.']) assert.equal(resolveUtxoExample(q,transfer),null,q);
 assert.equal(resolveUtxoExample(updatedFees,'What is Lightning?'),null);
 assert.equal(utxoArithmeticEvidence(updatedFees,'fr',[],transfer),'');
});


test('relative change arithmetic catches the real inversion without rejecting another hypothetical',()=>{
 const answer='Si vous conservez les mêmes entrées (45 000 satoshis) et le même paiement (28 000 satoshis) mais augmentez les frais à 500 satoshis, la monnaie rendue diminue de 700 satoshis. Elle s’élève alors à 16 500 satoshis.';
 assert.equal(utxoNumericContradiction(answer,updatedFees,transfer),true);
 assert.equal(utxoNumericContradiction('La monnaie augmente de 700 sat.',updatedFees,transfer),false);
 assert.equal(utxoNumericContradiction('La monnaie augmente de 500 sat.',updatedFees,transfer),true);
 assert.equal(utxoNumericContradiction('Si les frais étaient de 1700 sat, la monnaie diminue de 500 sat.',updatedFees,transfer),false);
 assert.equal(utxoNumericContradiction('Si vous gardez les mêmes entrées et le même paiement avec des frais à 1700 sat, la monnaie diminue de 500 sat.',updatedFees,transfer),false);
 assert.equal(utxoNumericContradiction('La monnaie diminue de 700 sat ?',updatedFees,transfer),false);
 assert.equal(utxoNumericContradiction('La monnaie ne diminue pas de 700 sat.',updatedFees,transfer),false);
});


test('a comparison mentioning a previous transaction still checks the current change amount',()=>{
 assert.equal(utxoNumericContradiction('Compared to the previous transaction, the change is 16500 sat.',updatedFees,transfer),false);
 assert.equal(utxoNumericContradiction('Compared to the previous transaction, the change is 15800 sat.',updatedFees,transfer),true);
 assert.equal(utxoNumericContradiction('The previous change is 15800 sat. The change is 16500 sat.',updatedFees,transfer),false);
});


test('a change amount and a change delta have distinct roles in either word order',()=>{
 for(const a of ['La baisse des frais augmente la monnaie de 700 sat.','The lower fee increases the change by 700 sat.','La monnaie augmente de 700 sat.']) assert.equal(utxoNumericContradiction(a,updatedFees,transfer),false,a);
 for(const a of ['La différence de frais par rapport à votre première hypothèse réduit la monnaie de 700 sat.','The lower fee decreases the change by 700 sat.','La baisse des frais augmente la monnaie de 500 sat.']) assert.equal(utxoNumericContradiction(a,updatedFees,transfer),true,a);
 assert.equal(utxoNumericContradiction('La baisse des frais ne réduit pas la monnaie de 700 sat.',updatedFees,transfer),false);
});


test('prior fee comparison checks the parenthetical old change without rejecting the current amount',()=>{
 const first="Exemple fictif : deux entrées de 31000 sat et 17000 sat, un paiement de 29000 sat et 1100 sat de frais. Quelles sorties crée cette transaction Bitcoin ?";
 const current="Je garde les mêmes entrées et le même paiement, mais prépare la transaction avec 1600 sat de frais. Recalcule la monnaie et compare avec ton premier résultat.";
 const observed=["Avec 1600 sat de frais, la monnaie rendue est de 17 400 sat.\n\nVoici le calcul détaillé :\n*   **Entrées totales** : 31 000 + 17 000 = 48 000 sat.\n*   **Paiement** : 29 000 sat.\n*   **Frais** : 1 600 sat (au lieu de 1 100 sat).\n*   **Monnaie** : 48 000 - 29 000 - 1 600 = 17 400 sat.\n\nComparé au premier résultat où les frais étaient de 1 100 sat (monnaie de 17 900 sat), la monnaie rendue a diminué de 500 sat. Cette différence correspond exactement aux 500 sat supplémentaires alloués aux frais.\n\nLes 1 600 sat de frais ne forment pas une sortie visible pour le destinataire ; ils sont attribués au mineur via une transaction coinbase distincte. La seule différence entre les deux scénarios est donc le montant de la monnaie rendue, qui s'ajuste pour absorber le coût supplémentaire des frais.", "Avec 1600 sat de frais, la monnaie rendue sera de 17 400 satoshis.\n\nLe calcul se fait ainsi : vous avez 48 000 satoshis d'entrées (31 000 + 17 000). Vous soustrayez le paiement de 29 000 satoshis et les frais de 1 600 satoshis. Le reste, soit 17 400 satoshis, forme la nouvelle sortie de monnaie rendue.\n\nComparé à votre premier résultat où les frais étaient de 1 100 satoshis (ce qui donnait 17 900 satoshis de monnaie), la monnaie diminue de 500 satoshis. Cette différence correspond exactement aux 500 satoshis supplémentaires consacrés aux frais. Les frais ne sont pas une sortie visible pour le destinataire, mais ils réduisent directement le montant disponible pour la monnaie rendue."];
 for(const answer of observed)assert.equal(utxoNumericContradiction(answer,current,first),false,answer);
 const cases=[
  ['Compared with your first result where fees were 1100 sat (change of 17900 sat), the change is 17400 sat.',false],
  ['Comparé au premier résultat où les frais étaient de 1100 sat (monnaie de 17900 sat), la monnaie est de 17400 sat.',false],
  ['Comparé au premier résultat où les frais étaient de 1100 sat (monnaie de 17000 sat), la monnaie est de 17400 sat.',true],
  ['Comparé au premier résultat où les frais étaient de 1100 sat (monnaie de 17900 sat), la monnaie est de 17900 sat.',true],
  ['Compared with your first result where fees were 1100 sat (change of 17900 sat), the change is 17900 sat.',true],
  ['Compared with the previous transaction, the change is 17900 sat.',true],
  ['La monnaie est de 17900 sat.',true],
 ];
 for(const [answer,expected] of cases)assert.equal(utxoNumericContradiction(answer,current,first),expected,answer);
});


test('from-to transitions distinguish old and new change instead of reading the French verb as a noun',()=>{
 const first="Exemple fictif de transaction Bitcoin : deux entrées de 6500 sat et 3200 sat, un paiement de 4300 sat et 450 sat de frais. Calcule la monnaie et explique quelles sorties sont créées.";
 const question="Je garde les mêmes entrées et le même paiement, mais prépare la transaction avec 200 sat de frais. Compare la monnaie avant et après.";

 for(const answer of ['La monnaie rendue change de 4950 satoshis à 5200 satoshis.', 'La monnaie passe de 4950 sat à 5200 sat.', 'The change moves from 4950 sat to 5200 sat.'])assert.equal(utxoNumericContradiction(answer,question,first),false,answer);
 for(const answer of ['La monnaie rendue change de 4900 sat à 5200 sat.', 'La monnaie passe de 4950 sat à 4850 sat.', 'The change moves from 4950 sat to 4850 sat.', 'La monnaie passe de 4950 sat à 5200 sat. La monnaie est de 4850 sat.'])assert.equal(utxoNumericContradiction(answer,question,first),true,answer);
});
