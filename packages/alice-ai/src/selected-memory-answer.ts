import type { SupportedLanguage } from './language-policy.ts';
import { isGeneralLightningPaymentExplanation } from './rag-query-policy.ts';

/** A bounded link requested by the user, using only a fact selected for this turn. */
export function withSelectedFeePreference(
  answer: string | null,
  question: string,
  language: SupportedLanguage,
  selectedContext: string,
  memoryEnabled: boolean,
): string | null {
  if (!answer || !memoryEnabled) return answer;
  const q = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!/\b(?:fees?|frais|fee rate|taux)\b/.test(q)
    || !/\b(?:my usual approach|my (?:habit|preference|approach)\w*|mes habitudes|ma preference|mon habitude|ma facon)\b/.test(q)) return answer;
  // Current instructions override stored preferences, including a newly stated
  // preference or an explicit correction. Do not reconcile them by guessing.
  if (/\b(?:no longer|not anymore|i (?:do not|don.t|now|prefer|stopped|never)|actually|instead|immediately|urgent\w*|je (?:ne|n[’\']|prefere|veux)|desormais|plutot|maintenant|preference has changed)\b/.test(q)) return answer;
  if (/\b(?:one sentence|une phrase|just|juste|only|seulement|bullets?|puces?)\b/.test(q)) return answer;
  const selectedPreference = selectedContext.split('\n').some(line =>
    /^- \(noted \d{4}-\d{2}-\d{2}\) Prefers sending during low-traffic periods\.?$/i.test(line));
  if (!selectedPreference) return answer;
  const link = language === 'fr'
    ? 'Une préférence enregistrée précédemment indique que tu préfères envoyer pendant les périodes de faible trafic. Une demande plus faible pour l’espace de bloc peut permettre un taux de frais plus bas ; cela ne garantit ni un taux particulier ni un délai de confirmation. Cette préférence concerne le taux, pas le montant envoyé ni la taille virtuelle.'
    : 'An earlier saved preference says you prefer sending during low-traffic periods. Lower demand for block space may allow a lower fee rate; it guarantees neither a particular rate nor a confirmation time. That preference concerns the rate, not the amount sent or the virtual size.';
  return `${answer}\n\n${link}`;
}

const normalizeQuestion = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Personalise only an explicitly requested level/analogy using a fact actually
 * selected for this turn and a matching retrieved explanation. */
export function selectedMemoryExplanation(
  question: string,
  language: SupportedLanguage,
  selectedContext: string,
  memoryEnabled: boolean,
  ragContext: string,
): string | null {
  if (!memoryEnabled) return null;
  const q = normalizeQuestion(question);
  if (q.length > 400 || /[\d\n]/.test(q)) return null;
  if (!/\b(?:explain|explique\w*|what is|qu.est.ce)\b/.test(q)
    || !/\b(?:my (?:experience|background|level)|mon (?:experience|niveau|parcours)|mes connaissances)\b/.test(q)) return null;
  // Current instructions, scope and response constraints take precedence over
  // an earlier fact. A controlled overview must not swallow extra questions.
  if (/\b(?:no longer|not anymore|actually|instead|now|today|current|live|urgent\w*|i (?:am|know|prefer)|je (?:suis|connais|prefere|veux|ne)|je n[’']|desormais|maintenant|expert\w*|advanced|avance\w*|changed|change\w* de niveau)\b/.test(q)) return null;
  if (/\b(?:not|dont|without|sans|pas|ignore\w*|forget|oublie\w*|contraire\w*)\b/.test(q)) return null;
  if (/\b(?:send|sending|pay|open|close|ouvrir|fermer|envoi\w*|payer|recover|recuper\w*|restore|restaur\w*|seed|private key|cle privee|balance|solde|mine|mon portefeuille)\b/.test(q)) return null;
  if (/\b(?:code|script|sql|api|python|javascript|calculate|calcul\w*|translate|tradu\w*|compare\w*|compar\w*|versus|bullets?|puces?|sentence|phrase|words|mots|just|juste|only|seulement|brief\w*|bref|court\w*|tableau|diagram\w*|poem\w*)\b/.test(q)) return null;
  if (/\b(?:and|et|also|additionally|as well|egalement|puis explique)\b/.test(q)) return null;
  if (/\b(?:ark|coinjoin|dust|mining|minage|halving|multisig|ethereum|solana|segwit|taproot|rbf|cpfp)\b/.test(q)) return null;
  const selected = (fact: string) => selectedContext.split('\n').some(line => {
    const match = /^- \(noted \d{4}-\d{2}-\d{2}\) (.+?)\.?$/.exec(line);
    return match?.[1] === fact;
  });
  const topics = ragContext.split('\n').filter(line => line.startsWith('Topic: ')).map(line => normalizeQuestion(line.slice(7).trim()));
  const evidence = (titles: string[]) => titles.some(title => topics.includes(normalizeQuestion(title)));
  const lightning = /\blightning\b/.test(q);
  const utxo = /\butxos?\b/.test(q);
  if (lightning && utxo) return null;
  if (lightning && isGeneralLightningPaymentExplanation(question)
    && selected('Beginner with Bitcoin')
    && evidence(['Understanding Lightning', 'Comprendre Lightning'])) {
    return language === 'fr'
      ? 'Une information enregistrée précédemment indique que tu débutais avec Bitcoin. Voici une explication à partir des bases.\n\nLightning utilise des canaux de paiement : des bitcoins sont engagés dans une transaction sur la chaîne Bitcoin pour établir un canal. Les participants mettent ensuite à jour la répartition des fonds dans ce canal, sans inscrire chaque paiement dans un nouveau bloc. La chaîne sert aussi à régler le canal lors de sa fermeture.\n\nPour un paiement courant, le destinataire fournit une facture Lightning, c’est-à-dire une demande de paiement que le portefeuille du payeur lit. Le paiement peut traverser plusieurs canaux et des intermédiaires ; il n’est pas nécessaire d’avoir un canal direct avec chaque destinataire. Il faut cependant assez de liquidité dans le bon sens sur un chemin utilisable.\n\nSi aucun chemin ne convient, le paiement peut échouer et le portefeuille peut essayer un autre chemin. Cela ne transforme pas automatiquement le paiement en transaction sur la chaîne Bitcoin. La réussite, la rapidité et les frais ne sont pas garantis ; un service peut aussi gérer les canaux à ta place, avec ses propres conditions de garde.'
      : 'An earlier saved fact says you were a beginner with Bitcoin. Here is an explanation from the basics.\n\nLightning uses payment channels: bitcoin is committed in a transaction on the Bitcoin blockchain to establish a channel. The participants then update how the funds in that channel are divided, without recording every payment in a new block. The chain is also used to settle the channel when it closes.\n\nFor a typical payment, the recipient supplies a Lightning invoice, a payment request read by the payer’s wallet. The payment may pass through several channels and intermediaries; you do not need a direct channel with every recipient. There must be enough liquidity in the correct direction along a usable path.\n\nIf no path works, the payment can fail and the wallet may try another route. It does not automatically turn into an on-chain Bitcoin transaction. Success, speed and fees are not guaranteed; a service may also manage channels for you under its own custody arrangement.';
  }
  const generalUtxoAnalogy = /^(?:explain what (?:a utxo is|utxos are) using an analogy suited to my (?:background|experience)|explique (?:les utxo|ce qu.est un utxo) avec une analogie adaptee a mon (?:parcours|experience))[.!?]?$/.test(q.trim());
  if (utxo && generalUtxoAnalogy
    && (selected('Familiar with relational databases') || selected('Familiar with databases'))
    && evidence(['Understanding UTXOs', 'Comprendre les UTXO'])) {
    return language === 'fr'
      ? 'Une information enregistrée précédemment indique que tu connais les bases de données. Une analogie utile est une table conceptuelle des sorties de transaction encore non dépensées. Chaque ligne représente un UTXO, avec sa référence, sa valeur et ses conditions de dépense.\n\nLors d’un paiement ordinaire, la transaction consomme entièrement les UTXO choisis comme entrées : leurs lignes quittent l’ensemble actif des sorties non dépensées. Elle crée de nouvelles sorties, donc de nouvelles lignes, pour le destinataire et, si nécessaire, pour la monnaie rendue. La différence entre la somme des entrées et celle des sorties constitue les frais ; les frais ne sont pas une sortie supplémentaire de cette transaction.\n\nLa valeur de l’ancien UTXO n’est pas diminuée sur place pour payer une partie : l’ancienne sortie est consommée et de nouvelles sont créées. L’historique des transactions reste dans la blockchain. Cette table est une analogie du modèle de dépense Bitcoin, pas une affirmation sur l’implémentation du stockage ni sur ce qu’une base SQL ordinaire peut modifier.'
      : 'An earlier saved fact says you are familiar with databases. A useful analogy is a conceptual table of transaction outputs that remain unspent. Each row represents a UTXO, with its reference, value and spending conditions.\n\nFor an ordinary payment, the transaction consumes each chosen input UTXO in full: those rows leave the active unspent set. It creates new outputs, or new rows, for the recipient and, when needed, change. The difference between total input value and total output value is the fee; the fee is not an additional output of that transaction.\n\nThe old UTXO’s value is not reduced in place to make a partial payment: the old output is consumed and new ones are created. Transaction history remains on the blockchain. This table is an analogy for Bitcoin’s spending model, not a claim about its storage implementation or what an ordinary SQL database can update.';
  }
  return null;
}
