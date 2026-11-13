import type { SupportedLanguage } from './languages.ts';
import type { Message } from './llm.ts';

const normalize = (text: string) => text.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
const channel = /\b(?:channels?|canal|canaux)\b/;
const receive = /\b(?:receiv\w*|recev\w*|reception|inbound|entrant\w*)\b/;
const send = /\b(?:pay\w*|paid|sent|send\w*|spend\w*|spent|paie\w*|paye\w*|envoy\w*|depens\w*|sortant\w*|outgoing)\b/;

function hasSource(context: string, titles: string[]): boolean {
  const topics = context.split('\n').filter(line => line.startsWith('Topic: ')).map(line => normalize(line.slice(7)));
  return titles.some(title => topics.includes(normalize(title)));
}

function unsupported(q: string): boolean {
  return q.length > 1100
    || /\b(?:bolt[- ]?12|ethereum|solana|monero|ark|spark|cashu|fedimint|paypal|bank|banque|bancair\w*|rbf|cpfp|coinjoin)\b/.test(q)
    || /\b(?:code|api|python|javascript|sql|translate|tradu\w*|compare\w*|compar\w*|versus|poem\w*|one sentence|une phrase|bullets?|puces?|also explain|explique aussi)\b/.test(q)
    || /^(?:(?:please|just|then|s'il te plait)[, ]+)?(?:(?:can|could|would) you |(?:peux|pourrais)[- ]tu )?(?:send|pay|sign|broadcast|open|close|envoie|envoies|paie|paye|signe|diffuse|ouvre|ferme)\b/.test(q)
    || /\b(?:private key|cle privee|seed phrase|recovery phrase|phrase de recuperation)\b/.test(q);
}

function selfFundedReceiving(q: string): boolean {
  const funded = /\b(?:fund\w*|financ\w*)\b/.test(q);
  const ownFunding = /\b(?:self[- ]fund\w*|fund\w* (?:my own|it myself)|(?:funded|finance\w*)[^.!?;]{0,50}(?:by me|myself|par moi)|i (?:have )?(?:just )?funded|j'ai finance|all (?:the )?(?:funds|balance)[^.!?;]{0,30}(?:local|my side))\b/.test(q);
  const jointOrRemote = /\b(?:dual[- ]fund\w*|joint\w*|both (?:sides|parties)|both of us|par mon pair|financement conjoint|cofinance\w*|tous les deux)\b/.test(q);
  return !unsupported(q) && !jointOrRemote && /\blightning\b/.test(q) && channel.test(q) && receive.test(q) && funded && ownFunding;
}

/** Controlled directional-liquidity explanation backed by this turn's note.
 * It does not inspect balances or assert a route exists. A reference to "this
 * channel" can inherit only the immediately preceding user question. */
export function groundedLightningLiquidity(
  question: string,
  language: SupportedLanguage,
  context: string,
  history: Message[] = [],
): string | null {
  if (!hasSource(context, ['Lightning liquidity and payment paths', 'Liquidité et chemins de paiement Lightning', 'Receiving capacity', 'La capacité de réception'])) return null;
  const q = normalize(question);
  if (unsupported(q) || /\b(?:on[- ]chain|onchain|sur chaine|splic\w*|close|closing|fermer|fermeture|backup|sauvegarde|recover\w*|recuper\w*|pending|en cours|en attente|expir\w*|privacy|confidential\w*|new topic|another topic|different topic|autre sujet|changeons)\b/.test(q)) return null;
  const users = history.filter(turn => turn.role === 'user');
  if (users.at(-1) && normalize(users.at(-1)!.content) === q) users.pop();
  const previous = normalize(users.at(-1)?.content ?? '');
  const channelReference = /\b(?:this channel|that channel|the same channel|ce canal|ce meme canal)\b/.test(q);
  const receivedBack = send.test(q) && receive.test(q)
    && /\b(?:same (?:amount|sum)|exact\w*|guarantee\w*|any (?:other )?(?:node|sender)|meme (?:somme|montant)|forcement|n'importe quel|tout (?:autre )?noeud)\b/.test(q);
  const followUp = receivedBack && channel.test(q)
    && (/\blightning\b/.test(q) || channelReference && selfFundedReceiving(previous));
  if (!selfFundedReceiving(q) && !followUp) return null;

  const first = language === 'fr'
    ? 'La capacité totale du canal et ses soldes local et distant sont distincts. Si tu finances seul un nouveau canal, les fonds sont surtout de ton côté : ils permettent d’envoyer, sans créer une capacité entrante équivalente. Pour recevoir par ce canal, il faut du solde utilisable du côté du pair.'
    : 'Total channel capacity and its local and remote balances are distinct. If you fund a new channel alone, the funds are mostly on your side: they provide sending capacity, not equivalent incoming capacity. Receiving through that channel needs usable balance on the peer’s side.';
  const second = language === 'fr'
    ? 'Un paiement sortant réussi déplace du solde local vers le côté du pair et peut donc créer de la capacité entrante. Cela ne garantit pas de recevoir la même somme depuis n’importe quel autre nœud : tout le chemin doit avoir assez de liquidité dans le bon sens, en respectant les réserves, les limites HTLC et les politiques des canaux.'
    : 'A successful outgoing payment moves local balance to the peer’s side and can therefore create incoming capacity. It does not guarantee receiving the same amount from any other node: the whole route needs enough liquidity in the correct direction, subject to reserves, HTLC limits and channel policies.';
  const third = language === 'fr'
    ? 'Dans un paiement Lightning ordinaire, l’émetteur paie les frais de routage et les relais les perçoivent. Pour une facture ordinaire à montant fixé, le paiement réussit pour le montant demandé ou échoue ; le chemin ne transforme pas ce montant en une somme nette imprévisible. La capacité permet ou empêche ce paiement, elle ne garantit pas son succès.'
    : 'In an ordinary Lightning payment, the sender pays routing fees and forwarding nodes receive them. For an ordinary fixed-amount invoice, the payment succeeds for the requested amount or fails; the route does not turn that amount into an unpredictable net receipt. Capacity affects whether the payment can complete; it does not guarantee success.';
  return `${first}\n\n${second}\n\n${third}`;
}

/** Explain the on-chain-to-Lightning payment boundary, never execute a send.
 * This has an explicit current subject and does not inherit earlier topics. */
export function onchainLightningInvoiceExplanation(
  question: string,
  language: SupportedLanguage,
  context: string,
): string | null {
  if (!hasSource(context, ['Lightning invoices', 'Les factures Lightning'])) return null;
  const q = normalize(question);
  if (unsupported(q) || /\b(?:pending|en cours|en attente|expir\w*|public key|cle publique|decod\w*|privacy|confidential\w*)\b/.test(q)) return null;
  const lightningInvoice = /\blnbc\w*\b/.test(q)
    || /\b(?:lightning|bolt11)\b/.test(q) && /\b(?:invoice|facture)\b/.test(q);
  const onchainWallet = /\b(?:on[- ]chain|onchain|sur (?:la )?chaine|portefeuille bitcoin (?:classique|ordinaire))\b/.test(q);
  const addressField = /\b(?:address field|bitcoin address|champ[^.!?;]{0,30}adresse|adresse bitcoin)\b/.test(q);
  const attempt = /\b(?:paste|enter|send|pay|coller|saisir|envoyer|payer)\b/.test(q);
  if (!lightningInvoice || !onchainWallet || !addressField || !attempt) return null;
  return language === 'fr'
    ? 'Une facture Lightning BOLT11, notamment un texte commençant par lnbc, n’est pas une adresse Bitcoin on-chain. Un formulaire d’envoi uniquement on-chain ne peut pas la payer comme une adresse. Le réseau Bitcoin ne convertit pas automatiquement cet envoi en paiement Lightning.\n\nPour payer la facture, utilise un portefeuille qui prend explicitement en charge Lightning, ou demande au vendeur une adresse on-chain pour ce même achat. Une autre possibilité est un service compatible qui reçoit tes fonds on-chain et paie la facture en Lightning ; cela exige une prise en charge explicite, avec ses frais, délais et conditions de confiance. Ce n’est pas une fonction automatique de tout portefeuille et aucun succès ni délai n’est garanti. Vérifie le réseau et les conditions affichées avant de confirmer.'
    : 'A BOLT11 Lightning invoice, including text beginning with lnbc, is not an on-chain Bitcoin address. An on-chain-only send form cannot pay it as an address. The Bitcoin network does not automatically convert that transfer into a Lightning payment.\n\nTo pay the invoice, use a wallet that explicitly supports Lightning, or ask the seller for an on-chain address for the same purchase. Another possibility is a compatible service that receives your on-chain funds and pays the invoice over Lightning; this requires explicit support, with its fees, timing and trust conditions. It is not an automatic feature of every wallet, and neither success nor timing is guaranteed. Check the network and displayed conditions before confirming.';
}
