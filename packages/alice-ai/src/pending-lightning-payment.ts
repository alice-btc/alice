import type { SupportedLanguage } from './languages.ts';
import type { Message } from './llm.ts';

const normalize = (text: string) => text.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
const invoice = /\b(?:invoices?|factures?|bolt11)\b/;
const lightning = /\b(?:lightning|bolt11)\b/;
const pending = /\b(?:pending|in[- ]flight|unresolved|still processing|en cours|en attente|non resolu\w*)\b/;
const expiry = /\bexpir\w*\b/;
const started = /\b(?:i (?:have )?(?:started|initiated|sent|paid)|already (?:started|initiated|sent)|j'ai (?:deja )?(?:lance|initie|envoye|paye)|paiement (?:deja )?lance|payment (?:already )?(?:started|initiated|sent))\b/;
const replacement = /\b(?:(?:new|another|second|replacement|fresh) invoice|(?:nouvelle|autre|seconde|deuxieme) facture|pay again|repay|repayer|payer a nouveau|payer une seconde fois)\b/;

function outOfScope(text: string): boolean {
  return text.length > 1200
    || /\b(?:bolt[- ]?12|on[- ]chain|mempool|rbf|cpfp|ark|spark|liquid|cashu|fedimint|ethereum|solana|monero|paypal|bank|banking|banque|bancair\w*|credit card|carte bancaire|another topic|different topic|new topic|autre sujet|changeons de sujet)\b/.test(text)
    || /\b(?:translate|tradu\w*|poem\w*|code|api|python|javascript|compare\w*|compar\w*|versus|privacy|confidential\w*|public key|cle publique|decode\w*|decod\w*|signature|hash|field|champ)\b/.test(text)
    || /\b(?:expired before (?:i|the payment)|avant (?:que je|d'avoir|d'initier|de lancer|le lancement)|never (?:started|initiated|sent|paid)|not (?:yet )?(?:started|initiated)|aucun paiement (?:lance|initie))\b/.test(text)
    || /\b(?:not (?:a )?lightning|pas (?:une? )?lightning|not pending|no longer pending|n'est plus en (?:cours|attente)|ne reste plus en cours)\b/.test(text);
}

function unresolvedInvoice(text: string): boolean {
  return !outOfScope(text) && lightning.test(text) && invoice.test(text)
    && (pending.test(text) || expiry.test(text) && started.test(text));
}

/** A bounded safety explanation, not a payment-status lookup or a model result.
 * The source must be present this turn. Only the immediately previous USER
 * turn may supply the Lightning subject for a replacement-invoice follow-up. */
export function pendingLightningPayment(
  question: string,
  language: SupportedLanguage,
  context: string,
  history: Message[] = [],
): string | null {
  const titles = context.split('\n').filter(line => line.startsWith('Topic: ')).map(line => normalize(line.slice(7)));
  if (!titles.some(title => title === 'lightning invoices' || title === 'les factures lightning')) return null;
  const q = normalize(question);
  if (outOfScope(q)) return null;
  // Do not silently replace translation, format or additional-topic requests
  // with this complete explanation. Ordinary payment-status questions qualify.
  if (/\b(?:one sentence|une phrase|bullets?|puces?|also explain|explique aussi|additionally|en plus)\b/.test(q)) return null;
  const users = history.filter(turn => turn.role === 'user');
  if (users.at(-1) && normalize(users.at(-1)!.content) === q) users.pop();
  const previous = normalize(users.at(-1)?.content ?? '');
  const isReplacement = replacement.test(q) && pending.test(q)
    && (lightning.test(q) || unresolvedInvoice(previous));
  const isExpiredAttempt = unresolvedInvoice(q) && expiry.test(q)
    && (pending.test(q) || started.test(q));
  if (!isReplacement && !isExpiredAttempt) return null;

  const lead = isReplacement
    ? language === 'fr'
      ? 'Ne paie pas une nouvelle facture pour accélérer ce même achat tant que le premier paiement reste indéterminé : les 2 pourraient réussir et payer le vendeur 2 fois.'
      : 'Do not pay a new invoice to speed up the same purchase while the first payment is unresolved: both could succeed and pay the seller twice.'
    : language === 'fr'
      ? 'L’expiration de la facture ne prouve ni l’échec du paiement déjà lancé ni le retour des fonds.'
      : 'Invoice expiry proves neither that an already initiated payment failed nor that its funds have returned.';
  const explanation = language === 'fr'
    ? 'L’échéance de la facture et le règlement des contrats de paiement (HTLC) sont distincts. Le premier paiement peut encore réussir ; dans ce cas il paie le destinataire, il ne te rembourse pas. Un échec doit être résolu avant de considérer les fonds disponibles, sans délai garanti. Une nouvelle facture n’annule pas le premier paiement.'
    : 'Invoice expiry and settlement of the payment contracts (HTLCs) are distinct. The first payment may still succeed; success pays the recipient, it does not refund you. A failure must be resolved before treating the funds as available, with no guaranteed timing. A new invoice does not cancel the first payment.';
  const action = language === 'fr'
    ? 'Je n’ai pas accès à l’état réel de ton paiement et l’affichage du portefeuille peut être en retard. Vérifie le résultat définitif et la disponibilité des fonds dans le portefeuille, avec son assistance si nécessaire, puis coordonne-toi avec le vendeur avant tout nouveau paiement. Tant que le résultat reste incertain, ne repaie pas le même achat.'
    : 'I cannot inspect your actual payment status, and the wallet display may lag. Verify the final result and fund availability in the wallet, with its support team if needed, and coordinate with the seller before any new payment. While the outcome remains uncertain, do not pay for the same purchase again.';
  return `${lead}\n\n${explanation}\n\n${action}`;
}
