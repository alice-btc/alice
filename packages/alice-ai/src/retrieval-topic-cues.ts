import { isUtxoValidationQuestion } from './rag-query-policy.ts';

/** Shared FR/EN subject evidence for retrieval and source-gated answer rules.
 * These functions identify a topic, never an answer or a personal fact. */
export function foldTopic(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe').replace(/[^a-z0-9]+/g, ' ');
}
const OTHER_RAIL = /\b(?:ethereum|solana|monero|paypal|bank|banque|bancaire|ark|spark|liquid|cashu|fedimint)\b/;

/**
 * The recipient of an unconfirmed on-chain payment asks whether its sender
 * can still change, redirect or cancel it. The question is about replacement
 * (replace-by-fee) even when it never names it.
 */
export function isUnconfirmedReceiptReplacementQuestion(message: string): boolean {
  const q = foldTopic(message);
  if (q.length > 1200 || OTHER_RAIL.test(q) || /\b(?:lightning|bolt11|bolt12|invoice|facture)\b/.test(q)) return false;
  const unconfirmed = /\b(?:unconfirmed|not (?:yet )?confirmed|zero conf\w*|0 conf\w*|zero confirmations?|no confirmations?|non confirmee?s?|pas (?:encore )?confirmee?s?|sans confirmation|aucune confirmation|zero confirmation)\b/.test(q);
  const received = /\b(?:paid me|pays me|paying me|sent me|sends me|i (?:have )?received|i (?:am|m) receiving|i receive|incoming|my customer|my client|my buyer|a customer|a client|a buyer|m a (?:paye|envoye|regle)|on m a|j ai recu|je recois|que je recois|mon client|un client|mon acheteur|un acheteur)\b/.test(q);
  const altered = /\b(?:chang\w*|cancel\w*|revers\w*|redirect\w*|undo|replac\w*|double spen\w*|take (?:it|the money|the payment) back|modifi\w*|annul\w*|remplac\w*|redirig\w*|reprendre|double depense)\b/.test(q);
  return unconfirmed && received && altered;
}

export function isImplicitCpfpQuestion(message: string): boolean {
  const q = foldTopic(message);
  if (OTHER_RAIL.test(q) || /\blightning\b/.test(q)) return false;
  const pending = /\b(?:unconfirmed|pending|stuck|non confirmee?|en attente|bloquee?)\b/.test(q);
  const transfer = /\b(?:bitcoin|btc|transaction|output|sortie|utxo)\b/.test(q);
  const spending = /\b(?:spend\w*|depens\w*)\b/.test(q);
  const received = /\b(?:receiv\w*|received|recu\w*|reception|destinataire|recipient)\b/.test(q);
  return pending && transfer && spending && received && /\b(?:fees?|frais|acceler\w*|confirm\w*|mineurs?|miners?)\b/.test(q);
}

export function isMonetaryIssuanceQuestion(message: string): boolean {
  const q = foldTopic(message);
  if (OTHER_RAIL.test(q) || /\b(?:lightning|coinbase exchange|exchange coinbase|plateforme coinbase)\b/.test(q)
    || /\bcoinbase\b/.test(q) && /\b(?:account|compte|plateforme|exchange)\b/.test(q)) return false;
  const mining = /\b(?:miners?|mineurs?|coinbase|subsid\w*|subvention\w*)\b/.test(q);
  const reward = /\b(?:rewards?|recompenses?|coinbase|subsid\w*|subvention\w*)\b/.test(q);
  const creation = /\b(?:issuance|issued|emission|emis\w*|emet\w*|creat\w*|cree\w*|newly|new (?:bitcoins?|coins?|money)|nouveaux (?:bitcoins?|satoshis?)|monnaie nouvelle|mint\w*)\b/.test(q);
  const excess = /\b(?:too much|more than|above|exceed\w*|excess\w*|plus que|trop|depasse\w*)\b/.test(q);
  // Coinbase value validation can be asked without saying "new" or "excess".
  // Require protocol actors and a monetary object, keeping maturity, encoding
  // and exchange-account questions out of this source family.
  const coinbaseValueCheck = /\bcoinbase\b/.test(q)
    && /\b(?:nodes?|noeuds?|miners?|mineurs?)\b/.test(q)
    && /\b(?:check\w*|validat\w*|verif\w*|control\w*|enforc\w*|limit\w*|autoris\w*|allowed)\b/.test(q)
    && /\b(?:amounts?|values?|claim\w*|rewards?|fees?|frais|montants?|valeurs?|attribu\w*|reclam\w*)\b/.test(q);
  const monetaryRecalculation = /\bcoinbase\b/.test(q)
    && /\b(?:subsid\w*|subvention\w*)\b/.test(q) && /\b(?:fees|frais)\b/.test(q)
    && /\b(?:ceiling|plafond|net increase|variation nette)\b/.test(q);
  return mining && reward && (creation || excess || coinbaseValueCheck || monetaryRecalculation);
}

export function isLightningPrivacyQuestion(message: string): boolean {
  const q = foldTopic(message);
  return !OTHER_RAIL.test(q) && /\blightning\b/.test(q)
    && /\b(?:privacy|confidential\w*|anonym\w*|identit\w*|trac\w*|who i am|who you are|qui je suis|qui on est|who can see|qui peut voir|who sees|qui voit)\b/.test(q);
}

export function isInputOutputAllocationQuestion(message: string): boolean {
  if (isUtxoValidationQuestion(message)) return false;
  const q = foldTopic(message);
  if (OTHER_RAIL.test(q) || /\b(?:lightning|coinjoin|payjoin|rbf|cpfp|keyboard|clavier|audio|sql|programming|programmation)\b/.test(q)) return false;
  const transaction = /\b(?:transactions?|bitcoin|btc|sats?|satoshis?|utxos?)\b/.test(q);
  const bothSides = /\b(?:inputs?|entrees?)\b/.test(q) && /\b(?:outputs?|sorties?)\b/.test(q);
  const changeSignature = /\b(?:change|monnaie rendue)\b/.test(q) && /\b(?:signatures?|signing|signatures?)\b/.test(q);
  // Accounting can name previously spent outputs without calling them inputs,
  // and a fee-update follow-up can ask about change without saying outputs.
  const spentAndNewOutputs = /\b(?:spend\w*|depens\w*)\b/.test(q)
    && /\b(?:new outputs?|nouvelles? sorties?)\b/.test(q);
  const inputsAndChange = /\b(?:inputs?|entrees?)\b/.test(q) && /\b(?:change|monnaie)\b/.test(q);
  return transaction && (bothSides || changeSignature || spentAndNewOutputs || inputsAndChange);
}


/** Explicit revoked-state evidence, including a mixed routing/dispute follow-up.
 * An ordinary close, invoice expiry, or unrelated channel is not enough. */
export function isRevokedLightningStateQuestion(message: string): boolean {
  const q = foldTopic(message);
  return !OTHER_RAIL.test(q)
    && /\b(?:lightning|watchtower|channels?|canal|canaux)\b/.test(q)
    && /\b(?:revok\w*|revoqu\w*|old (?:channel )?state|ancien etat)\b/.test(q);
}
