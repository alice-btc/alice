import { inferPedagogicalConcepts } from './pedagogical-profile-core.ts';

// Generic phrasing and the product's subject are not evidence that a memory
// helps with this particular turn. Keep short subject words such as Tor/car.
const STOP_WORDS = new Set(`the and for with from that this what which why how who when where
does have has had can could would should will was were are not only your you our their they his her its
about into then than some any all been being using used uses use wants want interested curious understand learn knows know like likes
les des une pour dans avec sans sur par est sont qui que quoi quel quels quelle quelles comment pourquoi quand
peut peux fait faire mon mes ton tes son ses nos vos leur leurs plus pas aux ces cette cet il elle vous nous comme
comprendre savoir veut voudrais utilise utilisee utilisees depuis deja
bitcoin bitcoins btc alice app application please explique explain wallet wallets portefeuille portefeuilles payment payments paiement paiements`.split(/\s+/));

// The pedagogical map supplies shared concepts; these aliases cover how users
// describe their setup and interests without naming a course concept.
const MEMORY_TOPICS = [
  { id: 'transactions-utxo', pattern: /\b(?:fees?|frais|rbf|cpfp|dust|sorties?|outputs?|consolid\w*|coin selection|selection des pieces|confirmations?|unconfirmed|pending|on.chain|regroup\w*)\b/ },
  { id: 'privacy', pattern: /\b(?:confidentialite|tor|coinjoins|silent payments|anonym\w*)\b/ },
  { id: 'keys-self-custody', pattern: /\b(?:backups?|back up|sauvegard\w*|restaur\w*|restor\w*|recover\w*|recuper\w*|heritage|inheritance|hardware (?:wallet|signing devices?)|portefeuille materiel|trezor|ledger|backup words|cles materielles)\b|\b(?:lost|lose|perdu|perte)\b.{0,35}\b(?:wallet|phone|portefeuille|telephone|acces)\b|\b(?:wallet|phone|portefeuille|telephone)\b.{0,20}\b(?:lost|perdu)\b/ },
  { id: 'lightning-basics', pattern: /\b(?:canaux|canal|channels?|liquidity|liquidite|splicing|htlc)\b/ },
  { id: 'mining-proof-of-work', pattern: /\b(?:mineurs?|miners?|bitaxe|halving)\b/ },
  { id: 'bitcoin-economics', pattern: /\b(?:econom\w*|halving|ponzi|monet\w*|inflation|hyperinflation|epargn\w*|finance|financial|financi\w*|savings|saving|gold|bubble|bulle|banques?|banks?|central bank|supply|emission|raret\w*|scarcity|etf)\b|\b(?:histoire|history) (?:de |of )?bitcoin\b/ },
  { id: 'node', pattern: /\b(?:nodes?|noeuds?|nœuds?|bitcoin core|raspberry pi|umbrel)\b/ },
  { id: 'learning', pattern: /\b(?:learn|courses?|cours|quiz|atelier|workshops?|chapters?|chapitres?|books?|livres?|enseigne\w*|teach\w*|education|educat\w*|whitepaper)\b|\b(?:expliquer|explain) bitcoin (?:a|to)\b/ },
  { id: 'exchange', pattern: /\b(?:exchanges?|plateformes?|echange|withdrawal|retrait)\b/ },
  { id: 'scaling-ark', pattern: /\b(?:uses?|using|utilise|teste) bark\b|\bbark (?:wallet|portefeuille)\b/ },
  { id: 'wallet', pattern: /\b(?:wallets?|portefeuilles?|trezor|ledger|sparrow|electrum|self.custody|auto.garde)\b/ },
  { id: 'development', pattern: /\b(?:developers?|developpeurs?|development|developpement|software|logiciel|programm\w*|code|api|rpc|scripts?|python|javascript|rust|computer science|informatique|btcpay|web shop|web store|open.source)\b|\b(?:build\w*|creer|developper)\b.{0,40}\b(?:tools?|outils?)\b/ },
  { id: 'privacy', pattern: /\b(?:address clustering|regroupement d.adresses|fresh addresses|nouvelles adresses)\b/ },
  { id: 'scaling-comparison', pattern: /\b(?:off.chain scaling|scaling approaches|layer.2 approaches|solutions de mise a l.echelle)\b/ },
  { id: 'keys-self-custody', pattern: /\b(?:single device failure|panne d.un appareil|device redundancy|redondance des appareils)\b/ },
];

const MULTISIG = /\b(?:multisig|multi[ -]?signature|cosign\w*|descripte?ors?|descripteurs?)\b/;
const PAYMENT_CANCELLATION = /\b(?:cancel\w*|annul\w*|replace\w*|remplac\w*|rbf|cpfp)\b/;
const RECOVERY = /\b(?:backup|back up|sauvegard\w*|recover\w*|recuper\w*|restor\w*|restaur\w*|hardware wallet|portefeuille materiel)\b/;
const WALLET_CHOICE = /\b(?:which|choose|choisir|quel|quelle)\b.{0,35}\b(?:wallet|portefeuille)\b/;
const ADDRESS_REUSE = /\b(?:address reuse|reus\w*.{0,25}address|reutilis\w*.{0,25}adresse)\b/;
const MERCHANT = /\b(?:accept\w*|accepte\w*|receiv\w*|recevoir)\b.{0,45}\b(?:payments?|paiements?|bitcoin)\b.{0,45}\b(?:shop|store|business|boutique|commerce|entreprise)\b/;
const BROAD_INTRODUCTION = /\b(?:what is bitcoin|explain bitcoin|c.est quoi bitcoin|qu.est.ce que (?:le )?bitcoin|explique.{0,8}bitcoin)\b/;
const BEGINNER_CONTEXT = /\b(?:beginner|debut\w*|never (?:held|used|installed)|jamais (?:utilise|envoye))\b|\b(?:bitcoin|btc) depuis \d{4}\b|\bbitcoin since \d{4}\b/;
const PERSONAL_BITCOIN_USE = /\b(?:epargn\w*|savings|held bitcoin|buy.{0,20}(?:bitcoin|amount)|acheter.{0,20}bitcoin|garder ses bitcoins|accept\w* bitcoin)\b|\b(?:sent|send\w*|receiv\w*|envoy\w*|recu|recevoir|paid|paye)\b.{0,35}\b(?:payments?|paiements?|bitcoin)\b/;

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function signals(text: string, question: boolean): { words: Set<string>; topics: Set<string> } {
  const folded = normalize(text);
  const topics = new Set([
    ...inferPedagogicalConcepts(text).filter(concept => concept !== 'bitcoin-basics'),
    ...MEMORY_TOPICS.filter(topic => topic.pattern.test(folded)).map(topic => topic.id),
  ]);
  if (MULTISIG.test(folded)) topics.add('keys-self-custody');
  if (question) {
    // A wallet setup is relevant to an operation the user wants to perform,
    // not automatically to every theoretical question mentioning a wallet.
    const walletOperation = RECOVERY.test(folded) || WALLET_CHOICE.test(folded) || PAYMENT_CANCELLATION.test(folded)
      || ADDRESS_REUSE.test(folded) || MERCHANT.test(folded) || topics.has('exchange');
    if (walletOperation && !MULTISIG.test(folded)) topics.add('wallet');
    else topics.delete('wallet');
    if (PAYMENT_CANCELLATION.test(folded)) topics.add('transactions-utxo');
    if (MERCHANT.test(folded)) {
      topics.add('development');
      topics.add('lightning-basics');
    }
    if (topics.has('scaling-ark') && topics.has('lightning-basics')) topics.add('scaling-comparison');
    if (BROAD_INTRODUCTION.test(folded) && topics.size === 0) topics.add('introductory-experience');
  } else {
    if (BEGINNER_CONTEXT.test(folded)) topics.add('introductory-experience');
    // General payment/custody experience helps with wallet operations. A
    // payment mention inside a privacy or L2 topic is not enough on its own.
    if (PERSONAL_BITCOIN_USE.test(folded)
      && !['privacy', 'scaling-ark', 'lightning-basics'].some(topic => topics.has(topic))) topics.add('wallet');
  }
  return {
    words: new Set(folded.split(/[^a-z0-9œ]+/).filter(word => word.length >= 3 && !STOP_WORDS.has(word) && !/^\d+$/.test(word))),
    topics,
  };
}

// These bridges describe when a stated background or habit helps the current
// explanation. They do not add inferred facts to memory or broaden capture.
function contextualBridge(question: string, memory: string, category?: string): number {
  const q = normalize(question);
  const m = normalize(memory);
  const explanation = /\b(?:what is|what are|explain|how (?:does|do)|comment fonctionne|qu.est.ce|c.est quoi|explique\w*)\b/.test(q);
  const utxoStructure = /\butxos?\b/.test(q)
    || /\btransactions?\b/.test(q) && /\b(?:inputs?|outputs?|entrees?|sorties?)\b/.test(q)
      && !/\b(?:ethereum|solana|lightning|ark|bank|banque|bancaire|paypal)\b/.test(q);
  if (category === 'background' && explanation && utxoStructure
    && /\b(?:familiar|comfortable|experienced|connai\w*|maitris\w*|travaille)\b/.test(m)
    && /\b(?:databases?|bases? de donnees)\b/.test(m)) return 2;
  if (category === 'background' && explanation
    && /\b(?:beginner (?:with|in) bitcoin|debut\w* (?:avec|en|sur) bitcoin)\b/.test(m)
    && !/\b(?:teach\w*|enseign\w*|workshop\w*|atelier\w*)\b/.test(m)
    && inferPedagogicalConcepts(question).some(concept => concept !== 'bitcoin-basics')) return 2;
  if (category === 'experience' && /\b(?:fees?|frais)\b/.test(q)
    && /\b(?:choisir|choose|choosing|select\w*|taux|rate|urgente?|urgent)\b/.test(q)
    && !/\b(?:lightning|ark|bank|bancair\w*|ethereum|solana)\b/.test(q)
    && /\b(?:wait\w*|attend\w*|prefer\w*)\b/.test(m)
    && /\b(?:low.traffic|low activity|faible activite|peu de trafic)\b/.test(m)
    && /\b(?:send\w*|envoy\w*)\b/.test(m)
    && !/\b(?:email\w*|mail\w*|courriel\w*|parcel\w*|colis|road\w*|route\w*|commut\w*)\b/.test(m)) return 2;
  return 0;
}

/** Derived per turn, never stored as inferred attributes of the user. */
export function memoryRelevanceScorer(question: string): (memory: string, category?: string) => number {
  const query = signals(question, true);
  return (memory, category) => {
    const candidate = signals(memory, false);
    const topics = [...candidate.topics].filter(topic => query.topics.has(topic)).length;
    const words = [...candidate.words].filter(word => query.words.has(word)).length;
    return topics * 2 + words + contextualBridge(question, memory, category);
  };
}
