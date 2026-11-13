import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {answerRuleViolationsIn,answerRulesBlock,ANSWER_RULES} from './answer-rules.ts';
const rows=JSON.parse(readFileSync(new URL('./fixtures/local-answer-violations-2026-11-12.json',import.meta.url),'utf8'));
for(const row of rows)test(`local generated contradiction: ${row.id}`,()=>{
 assert.ok(answerRuleViolationsIn(row.answer,row.notes,row.question,row.previousUserQuestion).includes(row.expected),row.expected);
});
const notes=['transaction-inputs-outputs','lightning-payment-mechanics','lightning-revoked-state','bitcoin-issuance-validation'];
for(const answer of [
 'Les frais ne constituent pas une sortie supplémentaire. Les sorties sont le paiement et la monnaie.',
 'La ligne de frais dans l’interface du portefeuille est une information comptable, pas une sortie de la transaction.',
 'The wallet displays a fee row, not a transaction output.',
 'La coinbase du bloc peut avoir une sortie qui rémunère le mineur avec la subvention et les frais.',
 'Les signatures ne révèlent pas le propriétaire de la monnaie.',
 'L’identité du propriétaire de la monnaie ne peut pas être déduite par la vérification des signatures des entrées.',
 'L’identité du propriétaire de la monnaie ne peut être déduite par la vérification des signatures des entrées.',
 'Input signatures authorize spending; they do not identify the change owner.',
 'Une facture contient un hash utilisé par les HTLC ; elle n’est pas une transaction HTLC.',
 'The invoice is not an HTLC transaction; it includes a payment hash used by HTLCs.',
 'Le commerce reçoit le paiement hors chaîne. Il peut ensuite choisir de fermer son canal séparément.',
 'The recipient receives the payment off-chain without closing the channel.',
 'Si aucun chemin ne fonctionne, aucun HTLC n’est engagé et le portefeuille peut réessayer.',
 'Pour un HTLC déjà en cours, des fonds peuvent rester bloqués jusqu’à résolution, parfois sur chaîne après une clôture forcée.',
 'A pending HTLC may temporarily lock liquidity until resolution; this is different from finding no route.',
 'Un état révoqué peut nécessiter une transaction de pénalité sur la blockchain pour récupérer les fonds.',
])test(`valid mechanism remains accepted: ${answer}`,()=>assert.deepEqual(answerRuleViolationsIn(answer,notes),[]));

test('reverse signature causality is checked in English and French without treating ne...que as denial',()=>{
 for(const answer of ['The owner of the change can be identified by checking input signatures.','Le propriétaire de la monnaie ne peut être identifié que par les signatures des entrées.'])
 assert.ok(answerRuleViolationsIn(answer,['transaction-inputs-outputs']).includes('signature-reveals-change'));
});
test('fee-output claims are checked across a corrective clause',()=>{
 for(const answer of ['An additional output pays the fees.','Une ligne spéciale sert à payer les frais, mais les frais ne sont pas une sortie.'])
 assert.ok(answerRuleViolationsIn(answer,['transaction-inputs-outputs']).includes('utxo-fee-output'));
});
test('ordinary failed routing and already-pending HTLCs are distinguished',()=>{
 assert.ok(answerRuleViolationsIn('The funds remain locked until channel closure.',['lightning-payment-mechanics']).includes('lightning-route-failure-locks-funds'));
 assert.deepEqual(answerRuleViolationsIn('For a pending HTLC, funds remain locked until resolution after a forced closure.',['lightning-payment-mechanics']),[]);
});

test('scripts set conditions; signatures satisfy them',()=>{
 for(const text of ['Les signatures définissent les conditions pour dépenser une ancienne sortie.','Signatures define spending conditions.','Signatures authorize spending and define spending conditions.','Les signatures autorisent la dépense et définissent les conditions.'])assert.ok(answerRuleViolationsIn(text,['transaction-inputs-outputs']).includes('signature-sets-spending-conditions'));
 for(const text of ['Les scripts définissent les conditions ; les signatures les satisfont.','Signatures do not define spending conditions.'])assert.deepEqual(answerRuleViolationsIn(text,['transaction-inputs-outputs']),[]);
});
test('ordinary invoices do not identify or commit the payer',()=>{
 for(const text of ['Cette facture définit le montant à payer et l’identité du payeur.','Elle sert de preuve que le payeur s’engage à payer.'])assert.ok(answerRuleViolationsIn(text,['lightning-payment-mechanics']).includes('lightning-invoice-payer-identity'));
 for(const text of ['Une facture indique le nœud du destinataire, pas l’identité du payeur.','The invoice does not reveal the payer identity.','The invoice is signed by the recipient.','It is not proof that the payer commits to paying.','Ce n’est pas une preuve que le payeur s’engage à payer.'])assert.deepEqual(answerRuleViolationsIn(text,['lightning-payment-mechanics']),[]);
});

test('correct net arithmetic cannot be explained by miner-paid fees or an issuance cap including fees',()=>{
 const notes=['bitcoin-issuance-validation'];
 assert.ok(answerRuleViolationsIn("La création monétaire est la différence entre ce que le mineur a reçu et les frais qu’il a payé.",notes).includes('issuance-fees-transfer-direction'));
 assert.ok(answerRuleViolationsIn("Le protocole ne permet pas d’émettre plus que ce plafond défini par la subvention et les frais.",notes).includes('issuance-fees-new-coins'));
 for(const answer of ['Un mineur peut payer des frais dans une transaction ordinaire.','Le plafond de la récompense coinbase est la subvention plus les frais.','Le protocole ne permet pas d’émettre de nouveaux bitcoins à partir des frais.'])assert.deepEqual(answerRuleViolationsIn(answer,notes),[]);
});

test("historical signatures cannot identify the change owner",()=>{
 const answer="Il reste **8 200 satoshis** de monnaie rendue au payeur. Ce montant est calculé par la différence entre le total des entrées consommées et la somme du paiement effectué plus les frais : 23 000 sat (entrées) – 14 000 sat (paiement) – 800 sat (frais) = 8 200 sat.\n\nLa signature de l'entrée autorise uniquement la dépense de l'UTXO consommé ; elle ne permet pas d'identifier le propriétaire des nouvelles sorties créées. Les scripts définissent les conditions de dépense, mais ne révèlent pas directement qui possède quelle sortie. Pour savoir à qui appartient la monnaie rendue, il faut analyser l'historique des signatures des entrées précédentes qui ont créé cette sortie, car l'ordre des sorties ou la signature actuelle ne suffisent pas à le prouver.";
 assert.ok(answerRuleViolationsIn(answer,['transaction-inputs-outputs']).includes('signature-reveals-change'));
 for(const text of ['To identify the owner of the change, inspect the historical input signatures.','Pour savoir à qui appartient la monnaie, il faut analyser les signatures anciennes.'])assert.ok(answerRuleViolationsIn(text,['transaction-inputs-outputs']).includes('signature-reveals-change'));
 for(const text of ['Il est impossible de savoir à qui appartient la monnaie en analysant les signatures.','It is not possible to identify the owner by checking historical signatures.'])assert.deepEqual(answerRuleViolationsIn(text,['transaction-inputs-outputs']),[]);
});

test("ordinary Lightning invoice sender and timing in real generated prose",()=>{
 const answer="Pour un paiement Lightning vers un commerce, le processus commence par la présentation d'une facture numérique. Cette facture contient une demande de paiement signée par le commerçant, qui définit le montant et les détails de la transaction sans révéler l'identité du payeur ni les conditions cryptographiques complexes. Le portefeuille du client (le payeur) reçoit cette information et analyse la situation de son réseau de canaux.\n\nEnsuite, le portefeuille recherche un chemin de paiement à travers les canaux ouverts du réseau Lightning. Ce chemin peut passer par plusieurs intermédiaires ; il n'est pas nécessaire d'avoir un canal direct avec le commerçant. Une fois le chemin trouvé, les participants mettent à jour leurs engagements hors chaîne pour autoriser le transfert des fonds. Le paiement est alors exécuté instantanément sans inscription sur la blockchain Bitcoin, ce qui permet une rapidité et une faible consommation de frais.\n\nSi le portefeuille ne trouve pas de chemin disponible, il peut réessayer ou signaler l'échec. Les fonds restent dans le canal jusqu'à ce que le chemin soit trouvé ou que le canal soit fermé manuellement. Le commerçant ne crée pas la facture ; il fournit simplement la demande de paiement.";
 const found=answerRuleViolationsIn(answer,['lightning-payment-mechanics']);
 for(const id of ['lightning-recipient-no-invoice','lightning-instant-guarantee'])assert.ok(found.includes(id),id);
 for(const text of ['The merchant does not create the invoice.','The payment is then executed instantly.'])assert.ok(answerRuleViolationsIn(text,['lightning-payment-mechanics']).length);
 for(const text of ['Le commerçant crée la facture, pas le payeur.','Le paiement peut être exécuté instantanément, sans garantie.','The payment can settle quickly but may fail.','The payment is not executed instantly.','Le paiement n’est pas instantané.'])assert.deepEqual(answerRuleViolationsIn(text,['lightning-payment-mechanics']),[]);
 assert.deepEqual(answerRuleViolationsIn('The recipient does not create an invoice.',['lightning-payment-mechanics'],'How does keysend work?'),[]);
});

test("fees are not set by block height",()=>{
 const answer="Non, cela ne signifie pas que 9000 nouveaux satoshis sont émis. Seule la subvention de bloc, fixée à 8500 sat dans votre exemple, représente de l'argent nouveau créé par l'émission monétaire. Les 700 sat de frais sont des bitcoins déjà existants qui sont transférés au mineur. L'augmentation réelle de la quantité de bitcoins dans le système est donc de 8300 sat (la différence entre les 9000 sat réclamés et les 700 sat de frais).\n\nSi la coinbase réclamait 9300 sat, le bloc serait rejeté par les nœuds du réseau, même avec une preuve de travail valide. Le contrôle monétaire vérifie strictement que la somme réclamée (C) ne dépasse pas la somme de la subvention autorisée (S) et des frais (F). Ici, 9300 est supérieur à 9200 (8500 + 700), ce qui viole la règle de validation. Un bloc plus petit ne changerait rien à cette limite, car la contrainte est monétaire et non liée à la taille du bloc ou au poids.\n\nIl reste inconnu si le mineur pourrait modifier la subvention ou les frais dans ce scénario fictif, car ces paramètres sont déterminés par le protocole et la hauteur du bloc, et non par la demande du mineur.";
 assert.ok(answerRuleViolationsIn(answer,['bitcoin-issuance-validation']).includes('fees-fixed-by-height'));
 assert.ok(answerRuleViolationsIn('Fees are determined by block height.',['transaction-fees']).includes('fees-fixed-by-height'));
 for(const text of ['Les frais ne sont pas fixés par la hauteur du bloc.','Fees are not determined by block height.','La subvention est déterminée par la hauteur du bloc.','Les frais sont définis par la différence entre les entrées et les sorties.'])assert.deepEqual(answerRuleViolationsIn(text,['bitcoin-issuance-validation']),[]);
});

test("completed payment keeps channels open; failed routing does not lock payment until closure",()=>{
 assert.ok(answerRuleViolationsIn("Pour un paiement Lightning ordinaire vers un commerce, le processus commence par le commerce qui génère et fournit une facture (une demande de paiement signée par lui). Le payeur lit cette facture et cherche un chemin routé à travers le réseau de canaux, en utilisant les liquidités disponibles dans les canaux intermédiaires pour atteindre le commerce.\n\nLe paiement se déroule hors chaîne : le payeur envoie les fonds au premier intermédiaire, qui les transmet au suivant, jusqu'à ce que le commerce les reçoive. À chaque étape, les soldes des canaux sont mis à jour pour refléter ce transfert. Une fois le commerce payé, les deux parties (payeur et commerce) publient une transaction sur la chaîne Bitcoin pour clôturer leurs canaux et régler les soldes restants.\n\nCe mécanisme permet des règlements rapides et peu coûteux, mais il ne garantit pas le succès du paiement : si aucun chemin avec assez de liquidité n'est trouvé, le paiement échoue sans être automatiquement transféré sur la chaîne.",['lightning-payment-mechanics']).includes('lightning-payment-waits-for-close'));
 assert.ok(answerRuleViolationsIn("Non, si aucun chemin ne fonctionne, le paiement ne passe pas tout seul sur la blockchain. Le réseau Lightning ne transfère pas automatiquement les fonds hors chaîne vers la chaîne Bitcoin en cas d'échec de routage.\n\nDe même, Bitcoin ne rend pas automatiquement les fonds si un partenaire publie un ancien état du canal. La chaîne Bitcoin ne lance aucun remboursement. Si un état révoqué est publié, le pair malhonnête peut prendre les fonds, mais la récupération dépend de la surveillance active (comme les watchtowers) et de la réaction dans les délais imposés par les timelocks. Sans cette surveillance et cette action rapide, les fonds peuvent être perdus.\n\nPour un paiement ordinaire, le processus nécessite que le payeur trouve un chemin avec assez de liquidité. Si le chemin échoue, le paiement reste bloqué hors chaîne jusqu'à ce qu'un nouveau chemin soit trouvé ou que le canal soit fermé manuellement.",['lightning-payment-mechanics']).includes('lightning-route-failure-locks-funds'));
 for(const text of ['Une fois le commerce payé, les pairs peuvent choisir de fermer leurs canaux séparément.','Once the merchant is paid, the peers may choose to close their channels separately.','Un HTLC déjà en cours est différent : le paiement reste bloqué jusqu’à ce que le canal soit fermé.'])assert.deepEqual(answerRuleViolationsIn(text,['lightning-payment-mechanics']),[]);
});

test("a real signature denial is not a claim of ownership proof",()=>{
 const answer="No, you cannot prove which output returns to the sender just by looking at the input signatures or the order of the outputs.\n\nInput signatures only authorize the spending of the previous outputs; they do not identify the owner of the new outputs or label the change. The script attached to each new output specifies how it can be spent, but the order in which outputs appear in a transaction does not determine which one is the change.\n\nWhile you can form hypotheses based on the amounts or the addresses involved, there is no proof in the transaction data itself that distinguishes the change output from a payment output. Only the wallet code can definitively identify the change by matching the calculated difference against the sender's known addresses.";
 assert.deepEqual(answerRuleViolationsIn(answer,['transaction-inputs-outputs']),[]);
 for(const text of ['You cannot prove which output is change by checking input signatures.','Input signatures do not prove which output returns to the payer.'])assert.deepEqual(answerRuleViolationsIn(text,['transaction-inputs-outputs']),[]);
 assert.ok(answerRuleViolationsIn('You can prove which output is change by checking input signatures.',['transaction-inputs-outputs']).includes('signature-reveals-change'));
});

test("the recipient, not the payer, reveals the HTLC preimage",()=>{
 const answer="A Lightning invoice is a payment request, not an HTLC transaction itself. It contains the information needed to initiate a payment, including a destination, an expiry time, and often a fixed amount. The invoice is readable by any compatible wallet and allows the payer to send funds without first contacting the recipient.\n\nThe normal flow involves the payer's wallet decoding the invoice and sending funds to the recipient's channel. This payment is secured by a Hashed Time-Lock Contract (HTLC), which is a cryptographic commitment that ensures the recipient can only claim the funds once the payer reveals a secret key. The recipient does not need to close their channel to receive the payment; the funds are locked in the channel until the HTLC conditions are met.\n\nThe invoice expiry and the HTLC settlement deadline are separate concepts. The invoice expiry prevents the request from being used indefinitely, while the HTLC deadline determines when the recipient can claim the funds. If the payer fails to reveal the secret key before the HTLC deadline, the funds are returned to the payer, and the recipient receives nothing. This mechanism ensures that both parties are protected during the payment process.";
 assert.ok(answerRuleViolationsIn(answer,['lightning-payment-mechanics']).includes('lightning-payer-reveals-preimage'));
 for(const text of ['The recipient reveals the payment preimage.','The payer does not reveal a private key.','Le destinataire révèle la préimage, pas une clé privée du payeur.'])assert.deepEqual(answerRuleViolationsIn(text,['lightning-payment-mechanics']),[]);
});

test("unsupported role inference and exclusive channel-closing reasons stay rejected",()=>{
 assert.ok(answerRuleViolationsIn("La monnaie restante est de **8 200 satoshis**. Ce montant se calcule par comptabilité stricte : vous prenez le total des entrées consommées (23 000 sat), vous y déduisez le montant envoyé au destinataire (14 000 sat) et les frais de transaction (800 sat). Le reste, soit 8 200 sat, constitue la monnaie rendue au payeur.\n\nLa signature de l'entrée permet uniquement d'autoriser la dépense de l'ancien UTXO consommé. Elle ne désigne ni le propriétaire d'une nouvelle sortie ni l'identité de la personne qui reçoit la monnaie. Les scripts définissent les conditions de dépense, mais seuls le montant, l'ordre des sorties et les signatures des entrées permettent de déduire qui a payé et qui a reçu, sans jamais pouvoir prouver l'identité d'un propriétaire.",['transaction-inputs-outputs']).includes('signature-reveals-change'));
 assert.ok(answerRuleViolationsIn("No, the invoice you receive from the cafe is not an HTLC transaction itself. It is a signed payment request created by the cafe that tells your wallet how much to pay and where to send it. The actual transaction only happens when you pay.\n\nThe normal flow involves your wallet selecting a route through a series of channels to reach the cafe's channel. When you pay, the payment settles off-chain by updating both your channel balance and the cafe's channel balance. The cafe receives the funds immediately without needing to close its channel.\n\nThe cafe only closes its channel if it needs to move funds to another channel or if the channel becomes unprofitable or closed by the cafe. Closing a channel is a separate on-chain operation that settles the final balances of that specific channel, not a requirement for receiving a payment.",['lightning-payment-mechanics']).includes('lightning-closure-to-move-funds'));
 for(const text of ['Les signatures ne permettent pas de savoir qui a reçu la monnaie.','Input signatures do not identify who received the change.','The merchant may choose to close a channel and move the on-chain funds.','A cooperative or forced closure settles channel balances.'])assert.deepEqual(answerRuleViolationsIn(text,['transaction-inputs-outputs','lightning-payment-mechanics']),[]);
});

test("underclaim does not issue the full subsidy or send fees away from the miner",()=>{
 const answer="Non, une demande de 6500 sat ne deviendra jamais acceptable, même avec une quantité immense de preuve de travail. Le protocole Bitcoin impose une limite stricte : la somme des sorties de coinbase (la récompense du mineur) ne peut jamais dépasser la subvention autorisée plus les frais inclus dans le bloc. Dans votre exemple, le plafond est de 6400 sat (6000 sat de subvention + 400 sat de frais). Si le mineur réclame 6500 sat, les nœuds du réseau rejetteront le bloc immédiatement, car cette somme dépasse le plafond autorisé, indépendamment de la difficulté ou de la puissance de calcul dépensée.\n\nLes frais de transaction ne sont jamais de nouveaux bitcoins. Ils représentent toujours des bitcoins déjà existants qui sont transférés du mineur vers les autres participants du réseau pour récompenser le traitement des transactions. Par conséquent, l'augmentation réelle de la quantité totale de bitcoins émis par l'émission monétaire est toujours égale à la subvention autorisée (6000 sat dans votre exemple), quelle que soit la somme totale réclamée par le mineur tant qu'elle reste inférieure ou égale au plafond. Si le mineur réclame moins que le plafond, l'émission reste identique à la subvention, mais si il réclame plus que le plafond, le bloc est invalide et aucune émission n'a lieu.";
 const question="Et une coinbase à 6500 sat deviendrait-elle acceptable avec davantage de preuve de travail ? Est-ce que les frais deviennent alors des nouveaux bitcoins ?";
 const prior="Exemple fictif : la subvention autorisée est 6000 sat, les frais sont 400 sat et le mineur réclame 6200 sat dans la coinbase. Quel est le plafond permis et de combien augmente la quantité totale de bitcoins ?";
 const ids=answerRuleViolationsIn(answer,['bitcoin-issuance-validation'],question,prior);
 for(const id of ['issuance-fees-transfer-direction','coinbase-numeric-issuance'])assert.ok(ids.includes(id),id);
 for(const text of ['Si le mineur réclame le plafond, la variation nette est toujours égale à la subvention.','When the miner claims the full reward, net issuance always equals the subsidy.','La variation nette n’est pas toujours égale à la subvention.','Le commerçant ne ferme pas son canal pour déplacer ses fonds vers un autre canal.'])assert.deepEqual(answerRuleViolationsIn(text,['bitcoin-issuance-validation','lightning-payment-mechanics'],question,prior),[]);
});


test('ordinary closure is not automatic, but fault handling and separately configured closure remain possible',()=>{
 for(const text of ['Channel closure is an automatic operation after an ordinary payment.','La fermeture du canal est automatique après paiement.'])assert.ok(answerRuleViolationsIn(text,['lightning-payment-mechanics']).includes('lightning-automatic-closure'),text);
 for(const text of ['La clôture des canaux n’est pas automatique.','Channel closure is not automatic.','A configured wallet can trigger channel closure automatically when a peer stays offline.','Une fermeture forcée peut être déclenchée automatiquement en cas de litige.'])assert.deepEqual(answerRuleViolationsIn(text,['lightning-payment-mechanics']),[],text);
});
test('watchtower service pricing and penalty transaction fees differ from protocol fees to verify states',()=>{
 for(const text of ['It requires fees to verify the states.','Le mécanisme impose des frais pour vérifier les états.'])assert.ok(answerRuleViolationsIn(text,['lightning-revoked-state']).includes('lightning-monitoring-protocol-fees'),text);
 for(const text of ['La surveillance n’impose pas de frais pour vérifier les états.','Un service de watchtower peut facturer son travail.','La transaction de pénalité sur chaîne nécessite des frais.','A watchtower provider requires fees to monitor the channel.'])assert.deepEqual(answerRuleViolationsIn(text,['lightning-revoked-state']),[],text);
});


test('the payment preimage travels back from the recipient, with payer context for wallet pronouns',()=>{
 for(const answer of ['The payer sends the pre-image along the route.','When you pay, your wallet selects a route. Your wallet sends a pre-image along this route.'])assert.ok(answerRuleViolationsIn(answer,['lightning-payment-mechanics']).includes('lightning-payer-reveals-preimage'),answer);
 for(const answer of ['The recipient sends the pre-image back along the route.','When you receive a payment, your wallet sends the pre-image back.','The payer does not send the pre-image.','Pas de clôture automatique : le paiement laisse les canaux ouverts.','No automatic closure follows the payment.'])assert.deepEqual(answerRuleViolationsIn(answer,['lightning-payment-mechanics']),[],answer);
});


test('ordinary balance updates remain off-chain and route failure does not force a default payment rail',()=>{
 for(const text of ['The preimage updates the balances on-chain.','La préimage actualise les soldes sur la chaîne.'])assert.ok(answerRuleViolationsIn(text,['lightning-payment-mechanics']).includes('lightning-settlement-on-chain'),text);
 for(const text of ['En cas de blocage total, on revient à la blockchain.','Votre portefeuille doit alors utiliser un mécanisme de paiement par défaut pour envoyer les fonds.'])assert.ok(answerRuleViolationsIn(text,['lightning-payment-mechanics']).includes('lightning-failure-on-chain'),text);
 for(const text of ['Le règlement actualise les soldes hors chaîne.','Le paiement ne met pas à jour les soldes sur la chaîne.','Channel closure updates balances on-chain.','En cas de blocage total, on ne revient pas automatiquement à la blockchain.','En cas de blocage total, on peut choisir un paiement distinct sur la blockchain.'])assert.deepEqual(answerRuleViolationsIn(text,['lightning-payment-mechanics']),[],text);
});


test('retained history and UTXO deletion are distinguished without rejecting pruning or the active view',()=>{
 for(const text of ['Les UTXO (Unspent Transaction Outputs) sont des sorties non dépensées.','La dépense ne supprime pas la ligne source.','On supprime la ligne source de la vue active, mais pas de l’historique.','Pruning deletes the source record from the local database, not from the chain history.'])assert.deepEqual(answerRuleViolationsIn(text,['transaction-inputs-outputs']),[],text);
});
test('the invoice is read by the payer; it is not a routing packet',()=>{
 for(const text of ['Le destinataire transmet la facture au payeur.','Le payeur ne transmet pas la facture au réseau Lightning.','The recipient sends the invoice to the payer.','The payer sends onion messages along the route.'])assert.deepEqual(answerRuleViolationsIn(text,['lightning-payment-mechanics','lightning-invoice-contents']),[],text);
});
test('search failure is evidence of a failed search, not omniscient knowledge of the network',()=>{
 for(const text of ['The inability to route does not prove that a liquid path exists or does not exist.','A failed route search might mean that no usable route exists.','Un échec du routage ne prouve pas qu’aucun chemin utilisable existe.','Le portefeuille peut manquer d’informations sur un chemin pourtant possible.'])assert.deepEqual(answerRuleViolationsIn(text,['lightning-payment-mechanics']),[],text);
});


test('a payment remainder can be change; ordinary fees are assigned to the miner',()=>{
 for(const text of ['Le reste ne doit pas être perdu : le portefeuille crée une sortie de monnaie.','The remainder need not be lost.','Unclaimed fees can be lost if the miner does not claim them.','The difference between all inputs and all outputs is the fee.'])assert.deepEqual(answerRuleViolationsIn(text,['transaction-inputs-outputs']),[],text);
});
test('invoice delivery precedes payment and HTLC fulfillment effects settlement',()=>{
 for(const text of ['The cafe gives the invoice to the payer before payment.','The invoice does not remain with the cafe until you pay.','The recipient reveals the preimage to settle the payment.','Once the payment is settled, the merchant may share the preimage as a receipt.'])assert.deepEqual(answerRuleViolationsIn(text,['lightning-payment-mechanics','lightning-invoice-contents']),[],text);
});


test('requested examples remain allowed, and confirmation is not ownership proof',()=>{
 const notes=['transaction-inputs-outputs'];
 const numeric='If the inputs total 10000 sat and outputs total 9000 sat, the fee is 1000 sat.';
 assert.ok(answerRuleViolationsIn(numeric,notes,'Explain transaction inputs and outputs.').includes('utxo-unrequested-numeric-example'));
 for(const q of ['Explain inputs and outputs with a numerical example.','Donne un exemple chiffré.','Exemple fictif : une entrée de 10000 sat.'])assert.deepEqual(answerRuleViolationsIn(numeric,notes,q),[]);
 for(const answer of ['La confirmation ne permet pas de savoir avec certitude qui possède la sortie.','Waiting for confirmation does not prove who owns the change.','Les scripts définissent la condition de dépense ; les signatures la satisfont.'])assert.deepEqual(answerRuleViolationsIn(answer,notes),[],answer);
});


test('ordinary output sums exclude fees; separate coinbase and explicit denials remain valid',()=>{
 for(const text of ['Les sorties ne contiennent pas le paiement et les frais : elles contiennent paiement et monnaie.','Coinbase outputs contain the subsidy and fees.','Outputs include payment and change; fees are the input-output difference.','Les sorties comprennent paiement et monnaie, mais les frais ne sont pas une sortie.'])assert.deepEqual(answerRuleViolationsIn(text,['transaction-inputs-outputs']),[],text);
});
test('watchtower protects its client, not the cheating peer in the revoked-state explanation',()=>{
 for(const text of ['C’est la watchtower de la victime, pas la watchtower du pair malhonnête, qui intervient.','The victim’s watchtower, not the cheating peer’s watchtower, reacts.','La watchtower du client détecte l’état révoqué du pair malhonnête.','The cheating peer’s watchtower does not protect the victim.','La watchtower du pair malhonnête ne protège pas la victime.'])assert.deepEqual(answerRuleViolationsIn(text,['lightning-revoked-state']),[],text);
});
test('routing follow-ups retain no-route, pending HTLC and revocation conditions within the real budget',()=>{
 for(const language of ['en','fr'] as const){
  const question=language==='fr'?'Si aucun chemin ne fonctionne, le paiement passe-t-il tout seul sur la blockchain ? Et si un pair publie un ancien état du canal, Bitcoin me rend-il automatiquement les fonds ?':'No route works. What if a peer publishes a revoked state?';
  const block=answerRulesBlock(['lightning-payment-mechanics','lightning-revoked-state'],language,1700,question);
  assert.ok(block.length<=1700);
  const mechanics=ANSWER_RULES.find(r=>r.noteId==='lightning-payment-mechanics')!;
  const revoked=ANSWER_RULES.find(r=>r.noteId==='lightning-revoked-state')!;
  for(const point of [...revoked.mustState[language],mechanics.mustState[language][3]])assert.ok(block.includes(point),point);
 }
});


test('coinbase is a transaction with its own special input, not an ordinary payment input',()=>{
 const notes=['transaction-inputs-outputs'];
 for(const answer of ['Ces frais sont attribués au mineur via une entrée spéciale (la transaction coinbase) distincte des sorties de paiement.','Fees are assigned through a special input (the coinbase transaction).','La transaction coinbase est une entrée spéciale.','The coinbase transaction is a special input.'])
  assert.ok(answerRuleViolationsIn(answer,notes).includes('utxo-coinbase-as-input'),answer);
 for(const answer of ['La transaction coinbase contient une entrée spéciale qui ne dépense pas d’UTXO.','The coinbase transaction has a special input, and its outputs claim subsidy and fees.','La transaction coinbase n’est pas une entrée du paiement.','The coinbase transaction is not an input of the payment.','La coinbase est une transaction distincte, dont les sorties rémunèrent le mineur.'])
  assert.deepEqual(answerRuleViolationsIn(answer,notes),[],answer);
 assert.deepEqual(answerRuleViolationsIn('The coinbase transaction is a special input.',[]),[]);
});

test('UTXO accounting and explorer attribution limits fit the delivered rule block',()=>{
 const rule=ANSWER_RULES.find(r=>r.noteId==='transaction-inputs-outputs');
 for(const language of ['fr','en']){
  const block=answerRulesBlock([rule.noteId],language);
  for(const point of rule.mustState[language]) assert.ok(block.includes(point),point);
 }
});


test('an explicit payment walkthrough requests missing fulfillment without constraining narrow questions',()=>{
 const notes=['lightning-payment-mechanics'];
 const brief='The payer reads an invoice, finds a liquid route, and balances update off-chain. Channels remain open.';
 for(const question of ['Explain the normal flow of a Lightning invoice payment.','Explique les étapes d’un paiement Lightning.'])
  assert.ok(answerRuleViolationsIn(brief,notes,question).includes('lightning-fulfillment-omitted'));
 for(const question of ['Does an ordinary Lightning payment close its channel?','Explique les champs d’une facture Lightning.','Explain the steps to recover a revoked Lightning channel.'])
  assert.deepEqual(answerRuleViolationsIn(brief,notes,question),[]);
 for(const answer of ['The recipient reveals the preimage to its peer, and fulfillment travels backward along the route.','Le destinataire révèle le secret correspondant au hash ; le règlement remonte vers le payeur.'])
  assert.deepEqual(answerRuleViolationsIn(answer,notes,'Explain the normal flow of a Lightning payment.'),[]);
 assert.deepEqual(answerRuleViolationsIn(brief,[],'Explain the normal flow of a Lightning payment.'),[]);
});


test('a denial later in the analogy does not hide an earlier historical deletion claim',()=>{
 const notes=['transaction-inputs-outputs'];
 for(const answer of ["Vous effacez une ligne historique et ajoutez de nouvelles sorties.","Cela ressemble à supprimer une ligne d’un historique et d’en ajouter une nouvelle, sans jamais effacer les enregistrements passés.","Deleting a row from transaction history does not remove the blockchain."])
  assert.ok(answerRuleViolationsIn(answer,notes).includes('utxo-source-record-deletion'),answer);
 for(const answer of ["Vous n’effacez jamais une ligne historique.","On ne supprime pas une ligne historique.","Sans supprimer une ligne d’un historique, on retire la sortie de la vue dépensable.","We do not delete a row from transaction history.","An input never deletes the historical record.","On supprime une ligne source de la vue actuelle des UTXO."])
  assert.deepEqual(answerRuleViolationsIn(answer,notes),[],answer);
});


test('conditional signature necessity is not excused by a denial about output order',()=>{
 const notes=['transaction-inputs-outputs'];
 for(const answer of [
  "L'ordre des sorties dans la transaction ne permet pas de savoir avec certitude laquelle des nouvelles sorties correspond à la monnaie rendue sans consulter les signatures de dépense.",
  'You cannot prove which output is change without checking the signatures.',
  'On ne peut pas identifier la monnaie rendue sans consulter les signatures.',
 ])assert.ok(answerRuleViolationsIn(answer,notes).includes('signature-reveals-change'),answer);
 for(const answer of [
  'You cannot prove which output is change by checking the signatures.',
  'On ne peut pas identifier la monnaie rendue en consultant les signatures.',
  'Avec ou sans consulter les signatures, on ne peut pas identifier la monnaie rendue.',
  'Signatures cannot identify the owner of a new output.',
  'Les signatures ne peuvent pas identifier la monnaie.',
  'It is false that you can prove which output is change by checking the signatures.',
 ])assert.deepEqual(answerRuleViolationsIn(answer,notes),[],answer);
});

test('ordinary fees do not disappear from the system; unclaimed fees and wallet transfers remain distinct',()=>{
 const notes=['transaction-inputs-outputs'];
 for(const answer of ['The 900 satoshis fee leaves the system entirely.','Les frais de 900 sat quittent le système.'])assert.ok(answerRuleViolationsIn(answer,notes).includes('utxo-remainder-must-be-lost'),answer);
 for(const answer of ['The fee leaves the payer’s wallet and is claimed by the miner.','The fee does not leave the system.','Les frais ne quittent pas le système.','Unclaimed fees leave the system if the miner underclaims.','Les frais non réclamés disparaissent du système.','It is false that fees leave the system.'])assert.deepEqual(answerRuleViolationsIn(answer,notes),[],answer);
 assert.deepEqual(answerRuleViolationsIn('The fee leaves the system entirely.',[]),[]);
});

test('a checked subsidy-plus-fees ceiling cannot be relabelled as maximum new coins',()=>{
 const notes=['bitcoin-issuance-validation'];
 const question='Use fictional values: permitted Bitcoin subsidy is 7000 sat, included transaction fees are 900 sat, and the miner claims 7300 sat in the coinbase outputs. What is the allowed ceiling and net supply increase?';
 const prefix='The subsidy is 7,000 sat and the transaction fees are 900 sat, creating a total ceiling of 7,900 sat. ';
 const bad='This ceiling represents the maximum value of new coins that can be created in this block, as it combines new issuance with existing coins being moved.';
 assert.ok(answerRuleViolationsIn(prefix+bad,notes,question).includes('issuance-fees-new-coins'));
 const fr='La subvention est de 7000 sat et les frais de 900 sat, soit un plafond de 7900 sat. Ce plafond représente le maximum de nouveaux bitcoins.';
 assert.ok(answerRuleViolationsIn(fr,notes,question).includes('issuance-fees-new-coins'));
 for(const answer of [prefix+'This ceiling is not the maximum of new coins.',prefix+'This ceiling represents the maximum value of new coins and existing coins claimed together.',prefix+'It is false that this ceiling represents the maximum of new coins.',prefix+bad.replace('created in this block, as it combines new issuance with existing coins being moved.','created?'), 'The monetary supply ceiling is 21 million bitcoins. This ceiling represents the maximum of new coins.'])assert.deepEqual(answerRuleViolationsIn(answer,notes,question),[],answer);
 assert.deepEqual(answerRuleViolationsIn(prefix.replace('900 sat','0 sat').replace('7,900','7,000')+bad,notes,question.replace('900 sat','0 sat')),[]);
 assert.deepEqual(answerRuleViolationsIn(prefix+bad,[],question),[]);
});


const scopedMechanismCases = [
 { id:'lightning-unqualified-free-payments', notes:['lightning-payment-mechanics'],
   bad:['Les canaux restent ouverts pour permettre des paiements rapides et gratuits.', 'Lightning payments are free.'],
   good:['Les paiements Lightning ne sont pas gratuits par définition.', 'Direct payments are free of forwarding fees.', 'Lightning payments can be free if all forwarding fees are zero.', 'Les paiements peuvent être gratuits sur un chemin à frais nuls.', 'Lightning payments are not always free.', 'Are Lightning payments free?'] },
 { id:'lightning-closure-requires-both', notes:['lightning-payment-mechanics'],
   bad:['Le canal se ferme uniquement lorsque les deux parties décident de le clôturer.', 'Un canal ne peut fermer que si les deux pairs acceptent.', 'A channel can only be closed when both parties agree.', 'The channel only closes when both peers agree.'],
   good:['Le canal se ferme lorsque les deux parties décident de le clôturer.', 'Une fermeture coopérative du canal exige l’accord des deux parties.', 'A channel can close cooperatively when both parties agree, or unilaterally.', 'A cooperative channel closure requires both parties to agree.', 'Le canal ne se ferme pas uniquement lorsque les deux parties acceptent.'] },
 { id:'lightning-penalty-cancels-commitment', notes:['lightning-revoked-state'],
   bad:['Pour annuler cet engagement révoqué, votre portefeuille doit réagir.', 'Si votre pair a déjà publié un état de canal révoqué, ce paiement reste valide sur la blockchain tant qu’il n’est pas contesté.', 'The watchtower can cancel the revoked commitment.', 'The revoked commitment remains valid until challenged.'],
   good:['La pénalité dépense les sorties sans annuler cet engagement révoqué.', 'The penalty does not cancel the revoked commitment.', 'The watchtower cannot invalidate the revoked commitment.', 'Le portefeuille ne peut pas annuler cet engagement révoqué.', 'Un engagement révoqué peut être valide sur chaîne ; la pénalité dépense ses sorties.', 'Can the watchtower cancel the revoked commitment?'] },
 { id:'proof-of-work-replaces-validation', notes:['bitcoin-issuance-validation'],
   bad:["Stronger proof of work only validates the chain's history, not the validity of the monetary issuance rules.", 'Proof of work validates transactions.', 'La preuve de travail valide l’historique, pas les règles monétaires.'],
   good:['Proof of work does not validate transactions.', 'La preuve de travail ne valide pas les transactions.', 'Full nodes validate transactions and check proof of work separately.', 'Accumulated proof of work selects between valid histories.', 'It is false that proof of work validates transactions.', 'Does proof of work validate transactions?'] },
 { id:'lightning-route-search-certainty', notes:['lightning-payment-mechanics'],
   bad:['Le fait que le portefeuille ne trouve aucun chemin compatible avec vos limites de frais avant l’envoi signifie simplement qu’il n’existe pas actuellement un trajet utilisable.', 'The wallet cannot find a route, which means no route exists.'],
   good:['Le fait que le portefeuille ne trouve aucun chemin ne signifie pas qu’aucun trajet n’existe.', 'The wallet cannot find a route, which does not prove that no route exists.', 'A failed route search may mean no route exists, but it may also reflect incomplete information.', 'The wallet found no route within its fee limit; no HTLC was sent.'] },
];
for(const row of scopedMechanismCases){
 test(`reviewed mechanism: ${row.id}`,()=>{
  for(const text of row.bad){
   assert.ok(answerRuleViolationsIn(text,row.notes).includes(row.id),text);
   assert.deepEqual(answerRuleViolationsIn(text,[]),[],`source gating: ${text}`);
  }
  for(const text of row.good) assert.deepEqual(answerRuleViolationsIn(text,row.notes),[],text);
 });
}


test('compound proof-of-work objects do not conceal independent transaction-validation claims',()=>{
 const notes=['bitcoin-issuance-validation'];
 for(const text of ["Proof of work validates the computational effort and the validity of the block's transactions, but it does not override the rule.", 'La preuve de travail valide l’effort de calcul et la validité des transactions.'])assert.ok(answerRuleViolationsIn(text,notes).includes('proof-of-work-replaces-validation'),text);
 for(const text of ["Proof of work validates the computational effort, not the validity of the block's transactions.", 'La preuve de travail ne valide pas l’effort de calcul et la validité des transactions.', 'Full nodes check transaction validity and proof of work separately.'])assert.deepEqual(answerRuleViolationsIn(text,notes),[],text);
});
test('revoked commitments do not expire with the delay and penalty reactions need not be manual',()=>{
 const notes=['lightning-revoked-state'];
 for(const text of ["L'ancien engagement reste valide sur la blockchain tant que le délai de résolution n'est pas écoulé.", 'The revoked commitment remains valid until its timelock expires.'])assert.ok(answerRuleViolationsIn(text,notes).includes('lightning-penalty-cancels-commitment'),text);
 for(const text of ['Il faut attendre la publication de l’engagement révoqué, puis déclencher manuellement une transaction de pénalité.', 'You must manually publish the penalty transaction.'])assert.ok(answerRuleViolationsIn(text,notes).includes('lightning-penalty-manual-required'),text);
 for(const text of ['Le délai ne limite pas la validité de l’engagement révoqué, mais la dépense du fraudeur.', 'The revoked commitment stays in history after the delay expires.', 'Une watchtower configurée peut publier la pénalité automatiquement.', 'You do not always need to manually publish a penalty transaction.', 'Without a watchtower, you must manually publish the penalty transaction if your wallet cannot do so.', 'Il ne faut pas déclencher manuellement une transaction de pénalité sans vérifier le fonctionnement du wallet.'])assert.deepEqual(answerRuleViolationsIn(text,notes),[],text);
});


test('routing fees are charged by relays and constrained by the payer, not refused for being too high',()=>{
 const notes=['lightning-payment-mechanics'];
 for(const text of ['Les frais demandés sont trop élevés par rapport à ce que les nœuds intermédiaires sont prêts à accepter.', 'The requested fees are too high for what intermediate nodes are willing to accept.'])assert.ok(answerRuleViolationsIn(text,notes).includes('lightning-routing-fee-direction'),text);
 for(const text of ['Les frais demandés par les relais dépassent la limite du payeur.', 'Forwarding nodes charge fees; the payer sets a maximum it will pay.', 'Some nodes charge zero routing fees.', 'Les frais demandés ne sont pas trop élevés par rapport à ce que les nœuds intermédiaires sont prêts à accepter.', 'The requested fees are not too high for what intermediate nodes are willing to accept.'])assert.deepEqual(answerRuleViolationsIn(text,notes),[],text);
});
test('off-chain settlement changes channel state and the payer does not send the invoice back to pay',()=>{
 const notes=['lightning-payment-mechanics'];
 for(const text of ['Chaque paiement ordinaire ne modifie pas l’état du canal ; il ne fait que transférer des fonds à l’intérieur de celui-ci.', 'An ordinary payment does not update the channel state.'])assert.ok(answerRuleViolationsIn(text,notes).includes('lightning-payment-state-unchanged'),text);
 assert.ok(answerRuleViolationsIn('Le client (vous) reçoit cette facture, la lit localement pour vérifier les détails, puis l’envoie à la librairie.',notes).includes('lightning-invoice-direction'));
 for(const text of ['Un paiement ordinaire modifie l’état du canal hors chaîne.', 'The payment does not change the on-chain state of the channel.', 'An ordinary payment updates channel state without closing it.', 'Le destinataire crée une facture et la transmet au payeur.', 'Le client reçoit cette facture puis ne l’envoie pas à la librairie.'])assert.deepEqual(answerRuleViolationsIn(text,notes),[],text);
});


test('revoked commitment cancellation keeps a bounded immediately preceding referent',()=>{
 const notes=['lightning-revoked-state'];
 for(const text of [
  'Lorsqu’un pair publie un état de canal révoqué, il menace les fonds. Pour annuler cet engagement et récupérer vos fonds, il faut agir. La pénalité dépense ses sorties sans annuler l’engagement original.',
  'A peer publishes a revoked commitment. To cancel this commitment, the watchtower broadcasts a penalty.',
  'L’engagement révoqué reste valide jusqu’à ce que le délai expire.',
 ])assert.ok(answerRuleViolationsIn(text,notes).includes('lightning-penalty-cancels-commitment'),text);
 for(const text of [
  'Un engagement révoqué est publié. La pénalité dépense des sorties sans annuler cet engagement.',
  'A peer publishes a revoked commitment. The penalty does not cancel this commitment.',
  'La transaction reste dans l’historique après expiration du délai.',
  'Le formulaire contient un engagement commercial non signé. On peut annuler cet engagement.',
 ])assert.deepEqual(answerRuleViolationsIn(text,notes),[],text);
 assert.deepEqual(answerRuleViolationsIn('L’engagement révoqué reste valide jusqu’à ce que le délai expire.',[]),[]);
});
test('transaction graph tracing alone does not establish output ownership',()=>{
 const notes=['transaction-inputs-outputs'];
 for(const text of [
  'Pour savoir à quoi appartiennent les fonds, il faut suivre l’historique des entrées (qui les ont créées) et des sorties (qui les ont dépensées), mais la signature seule ne lie pas une sortie spécifique à un individu.',
  'To know who owns these funds, you must trace the transaction history.',
  'Transaction history proves who owns the change.',
  'L’historique de la blockchain identifie le propriétaire.',
 ])assert.ok(answerRuleViolationsIn(text,notes).includes('transaction-history-proves-owner'),text);
 for(const text of [
  'L’historique de la blockchain ne prouve pas à qui appartient la sortie.',
  'Transaction history does not prove who owns the change.',
  'To know who owns these funds, you must trace the transaction history and obtain independent ownership information.',
  'Pour savoir à qui appartiennent les fonds, il faut suivre l’historique et obtenir des informations indépendantes.',
  'Les liens du graphe peuvent servir à des hypothèses, sans preuve de propriété à eux seuls.',
 ])assert.deepEqual(answerRuleViolationsIn(text,notes),[],text);
 assert.deepEqual(answerRuleViolationsIn('Transaction history proves who owns the change.',[]),[]);
});


test('proof of work alone does not guarantee block validity',()=>{
 const notes=['bitcoin-issuance-validation'];
 for(const text of ['La force de la preuve de travail garantit que le bloc est valide et sécurisé, mais elle ne donne aucun droit à émettre plus.', 'Proof of work guarantees that a block is valid.'])assert.ok(answerRuleViolationsIn(text,notes).includes('proof-of-work-replaces-validation'),text);
 for(const text of ['La preuve de travail ne garantit pas que le bloc est valide.', 'Proof of work does not guarantee that a block is valid.', 'A valid block must satisfy proof of work and all other consensus rules.', 'Proof of work guarantees a block is valid if all other checks pass.'])assert.deepEqual(answerRuleViolationsIn(text,notes),[],text);
});


const pairedMechanismCases = [
 {id:'proof-of-work-replaces-validation', notes:['bitcoin-issuance-validation'],
  bad:['La preuve de travail valide le bloc, mais ne permet pas de dépasser le plafond.', 'Proof of work validates the block.'],
  good:['La preuve de travail ne valide pas le bloc à elle seule.', 'Proof of work does not validate the block.', 'The block has valid proof of work.', 'Proof of work validates a block header against its target.', 'La preuve de travail valide le bloc si toutes les autres règles sont satisfaites.', 'Proof of work validates the block if all other checks pass.']},
 {id:'issuance-fees-transfer-direction', notes:['bitcoin-issuance-validation'],
  bad:['La création nette dépend uniquement de la différence entre ce que le mineur réclame et les frais qu’il doit payer.', 'Net issuance is the coinbase claim minus the fees the miner must pay.'],
  good:['La création nette vaut la coinbase moins les frais des transactions incluses.', 'Les frais ne sont pas une dépense que le mineur doit payer pour créer le bloc.', 'A miner can pay fees when spending coins in an ordinary transaction.', 'Net issuance subtracts fees because those coins already existed.', 'The miner claims less than the allowed ceiling; later it pays a fee to spend its reward.']},
 {id:'signature-spends-utxo', notes:['transaction-inputs-outputs'],
  bad:["La signature autorise uniquement la dépense de l’ancienne sortie (l’entrée) et retire celle-ci de la vue des sorties non dépensées (UTXO).", 'The signature authorizes spending the old output and removes it from the UTXO set.', 'La signature retire la sortie de l’ensemble UTXO.'],
  good:['La signature autorise la dépense ; appliquer la transaction dépense la sortie.', 'The signature authorizes the spend; applying the transaction removes the spent output from the UTXO set.', 'The signature does not remove the output from the UTXO set.', 'La signature autorise la dépense mais ne retire pas la sortie de l’ensemble UTXO.', 'A signed transaction, once applied, removes the spent output from the UTXO set.']},
 {id:'transaction-history-proves-owner', notes:['transaction-inputs-outputs'],
  bad:['Il faut des informations externes ou un schéma de dépense connu pour faire cette attribution.', 'External ownership information or a known spending pattern is sufficient to identify the owner.'],
  good:['Il faut des informations externes pour confirmer la propriété ; un schéma de dépense connu ne suffit pas.', 'A known spending pattern is a heuristic, not proof of ownership.', 'External ownership information and a known spending pattern can be combined.', 'Des informations externes ou un schéma de dépense connu ne suffisent pas toujours à confirmer cette attribution.']},
];
for (const row of pairedMechanismCases) test(`mechanism distinction: ${row.id}`,()=>{
 for(const text of row.bad){assert.ok(answerRuleViolationsIn(text,row.notes).includes(row.id),text);assert.deepEqual(answerRuleViolationsIn(text,[]),[],text);}
 for(const text of row.good)assert.deepEqual(answerRuleViolationsIn(text,row.notes),[],text);
});


test('the actual fee-output claim triggers repair independently of a correct from-to comparison',()=>{
 const draft="Avec les mêmes entrées (9 700 satoshis) et le même paiement (4 300 satoshis), la monnaie rendue change de 4 950 satoshis à 5 200 satoshis lorsque les frais passent de 450 à 200 satoshis. La différence s'élève à 250 satoshis, qui correspond exactement à l'économie réalisée sur les frais.\n\nLe calcul se fait ainsi : la monnaie est égale au total des entrées moins le paiement moins les frais. Avant, 9 700 - 4 300 - 450 = 4 950. Après, 9 700 - 4 300 - 200 = 5 200. Les 250 satoshis économisés sont directement ajoutés à la monnaie rendue.\n\nIl est important de noter que cette économie n'affecte pas le montant envoyé au destinataire ni la validité de la transaction. Seule la quantité de Bitcoin retournée au payeur augmente, tandis que le total des sorties (paiement + monnaie) diminue de 250 satoshis par rapport à la somme des entrées, car les frais sont eux-mêmes une sortie distincte vers le réseau.";
 const first="Exemple fictif de transaction Bitcoin : deux entrées de 6500 sat et 3200 sat, un paiement de 4300 sat et 450 sat de frais. Calcule la monnaie et explique quelles sorties sont créées.";
 const question="Je garde les mêmes entrées et le même paiement, mais prépare la transaction avec 200 sat de frais. Compare la monnaie avant et après.";

 const notes=['transaction-inputs-outputs'];
 const found=answerRuleViolationsIn(draft,notes,question,first);
 assert.ok(found.includes('utxo-fee-output'),JSON.stringify(found));
 assert.ok(!found.includes('utxo-numeric-change'),JSON.stringify(found));
 for(const text of ['Les frais sont eux-mêmes une sortie distincte vers le réseau.', 'The fees are themselves a separate output.'])assert.ok(answerRuleViolationsIn(text,notes).includes('utxo-fee-output'),text);
 for(const text of ['Les frais ne sont pas une sortie distincte.', 'Fees are not an output.', 'The fee is claimed through the separate coinbase outputs.'])assert.deepEqual(answerRuleViolationsIn(text,notes),[],text);
 assert.deepEqual(answerRuleViolationsIn(draft,[],question,first),[]);
});
