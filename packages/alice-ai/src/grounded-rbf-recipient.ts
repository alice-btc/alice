import type { SupportedLanguage } from './languages.ts';
import type { Message } from './llm.ts';
import { isUnconfirmedReceiptReplacementQuestion } from './retrieval-topic-cues.ts';

const normalize = (text: string) => text.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
const rbf = /\b(?:rbf|replace[- ]by[- ]fee)\b/;
const replacement = /\b(?:replac\w*|remplac\w*)\b/;
const outputs = /\b(?:addresses?|recipients?|amounts?|outputs?|destinations?|adresse\w*|destinataires?|montants?|sorties?)\b/;
const preservation = /\b(?:same|identical|unchanged|preserv\w*|keep|keeps|remain|stay|guarantee\w*|change\w*|identique\w*|conserv\w*|gard\w*|rest\w*|garanti\w*|forcement|obligatoir\w*|chang\w*)\b|\bmemes?\s+(?:adresses?|montants?|sorties?|destinataires?|destinations?)\b/;

function outOfScope(text: string): boolean {
  return text.length > 1200
    || /\b(?:lightning|bolt11|bolt12|lnbc\w*|ark|spark|liquid|cashu|fedimint|ethereum|solana|monero|paypal|banque|bank|bancair\w*)\b/.test(text)
    || /\b(?:translate|tradu\w*|compare\w*|compar\w*|versus|poem\w*|python|javascript|api|privacy|confidential\w*|recover\w*|restor\w*|backup\w*|seed|sauvegard\w*|recuper\w*|restaur\w*|one sentence|une phrase|bullets?|puces?)\b/.test(text)
    || /\b(?:changeons de sujet|autre sujet|another topic|different topic|new topic|change subjects|not (?:about|using) rbf|pas (?:de|sur|du) rbf)\b/.test(text)
    || /\b(?:already confirmed|deja confirmee?|after confirmation|apres confirmation)\b/.test(text);
}

/** Recipient-output guarantees only, with a retrieved RBF source this turn.
 * An explicit replacement follow-up may inherit the immediately preceding
 * user payment topic; assistant prose never supplies that subject. */
export function groundedRbfRecipient(
  question: string,
  language: SupportedLanguage,
  context: string,
  history: Message[] = [],
): string | null {
  const titles = context.split('\n').filter(line => line.startsWith('Topic: ')).map(line => normalize(line.slice(7)));
  if (!titles.some(title => ['augmenter les frais avec rbf', 'raising fees with rbf', 'replace-by-fee'].includes(title))) return null;
  const q = normalize(question);
  // A recipient asking whether the sender can still change an unconfirmed
  // payment is on this subject without naming RBF, an address or an amount.
  const unconfirmedReceipt = isUnconfirmedReceiptReplacementQuestion(question);
  if (outOfScope(q) || !unconfirmedReceipt && (!outputs.test(q) || !preservation.test(q))) return null;
  if (/\b(?:calculate|calcul\w*|combien|how much|acceler\w*|speed up|bump)\b/.test(q)) return null;
  const users = history.filter(turn => turn.role === 'user');
  if (users.at(-1) && normalize(users.at(-1)!.content) === q) users.pop();
  const previous = normalize(users.at(-1)?.content ?? '');
  const previousPaymentTopic = !outOfScope(previous) && /\b(?:rbf|cpfp|replace[- ]by[- ]fee)\b/.test(previous)
    && /\b(?:transactions?|payments?|paiements?|recipients?|destinataires?|outputs?|sorties?)\b/.test(previous);
  const followup = /^(?:and|so|then|et|donc|alors)\b/.test(q) && replacement.test(q) && previousPaymentTopic;
  if (!rbf.test(q) && !followup && !unconfirmedReceipt) return null;

  // Asked without the word RBF, the question first gets its plain answer.
  const lead = unconfirmedReceipt && !rbf.test(q)
    ? language === 'fr'
      ? 'Oui. Tant qu’une transaction n’est pas confirmée, son expéditeur peut la remplacer par une autre qui dépense les mêmes pièces. Ce mécanisme s’appelle replace-by-fee (RBF).\n\n'
      : 'Yes. Until a transaction is confirmed, its sender can replace it with another one that spends the same coins. This is called replace-by-fee (RBF).\n\n'
    : '';
  return lead + (language === 'fr'
    ? "RBF ne garantit pas que ton adresse, le destinataire ou le montant reçu restent identiques. Le signataire peut modifier les sorties de la transaction de remplacement, sous réserve de sa validité et des politiques applicables ; cela ne signifie pas que chaque RBF réduit ou supprime nécessairement ton paiement. Ce mécanisme concerne les transactions non confirmées.\n\nL’annonce de l’expéditeur ou l’affichage initial d’une réception non confirmée ne garantit pas le règlement. Vérifie la transaction de remplacement réelle, la sortie correspondant à la réception attendue, son adresse, son montant et son état de confirmation dans ton portefeuille ou un explorateur fiable. Je n’ai pas accès à ton paiement réel.\n\nLa simple diffusion du remplacement ou une hausse des frais ne garantit ni son acceptation ni sa confirmation : les politiques de relais et les choix des mineurs comptent. Le signalement opt-in n’est pas une condition universelle : certaines politiques full-RBF permettent un remplacement même si la transaction initiale ne signalait pas RBF."
    : "RBF does not guarantee that your address, recipient or received amount stays the same. The signer can change the replacement transaction’s outputs, subject to validity and applicable policies; this does not mean every RBF necessarily reduces or removes your payment. This mechanism concerns unconfirmed transactions.\n\nThe sender’s announcement or an initially displayed unconfirmed receipt does not guarantee settlement. Check the actual replacement transaction, the output corresponding to the expected payment, its address, amount and confirmation status in your wallet or a reliable explorer. I cannot inspect your actual payment.\n\nSimply broadcasting a replacement or increasing its fees guarantees neither acceptance nor confirmation: relay policies and miners’ choices matter. Opt-in signaling is not a universal requirement: some full-RBF policies permit replacement even when the original transaction did not signal RBF.");
}
