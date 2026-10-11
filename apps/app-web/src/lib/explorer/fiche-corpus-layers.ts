// The off-chain layers of the Explorer corpus: what Spark, Arkade and Bark
// are and what their pages show, written so Alice can explain a Spark
// address, a leaf, a transfer, an Ark VTXO or a commitment transaction in the
// Explorer's own words. Concept fiches only: they explain a protocol, they
// never recommend moving funds to it (educational_only, enforced by code like
// every posture). Facts were read from the protocols' documentation and from
// what the Explorer itself observed on mainnet; the dated ones are kept
// verbatim in the French translation (fiche-corpus-layers.fr.ts).

import { disclaimerFor, type Fiche } from './fiche.ts';

const CHECKED = '2026-10-10';

// The fields every layer fiche shares: a concept, explained on request,
// filed under the 'layers' theme so the chunk is not mistaken for privacy
// advice. Only the retrievable text and the stability differ.
function concept(f: {
  id: string;
  title: string;
  summary: string;
  body: string;
  retrievalHints: string[];
  sources: Fiche['sources'];
  stability: Fiche['stability'];
}): Fiche {
  return {
    id: f.id,
    version: 1,
    updatedAt: CHECKED,
    reviewedBy: 'explorer',
    kind: 'concept',
    locale: 'en',
    title: f.title,
    summary: f.summary,
    body: f.body,
    appliesTo: ['LAYER_CONTEXT'],
    retrievalHints: f.retrievalHints,
    preconditions: [],
    contraindications: [],
    effort: 'trivial',
    cost: 'none',
    reversibility: 'reversible',
    legalPosture: 'educational_only',
    disclaimer: disclaimerFor('educational_only'),
    sources: f.sources,
    stability: f.stability,
    theme: 'layers',
  };
}

const SPARK_TLDR = { url: 'https://docs.spark.money/learn/tldr', label: 'Spark docs: TLDR', checkedAt: CHECKED };
const SPARK_TRUST = { url: 'https://docs.spark.money/learn/trust-model', label: 'Spark docs: Trust model', checkedAt: CHECKED };
const SPARK_TECH = { url: 'https://docs.spark.money/learn/technical-definitions', label: 'Spark docs: Technical definitions', checkedAt: CHECKED };
const SPARK_SDK = { url: 'https://github.com/buildonspark/spark', label: 'Spark SDK (GitHub)', checkedAt: CHECKED };
const SPARKSCAN = { url: 'https://sparkscan.io/', label: 'Sparkscan', checkedAt: CHECKED };
const OPTECH_STATECHAINS = { url: 'https://bitcoinops.org/en/topics/statechains/', label: 'Bitcoin Optech: Statechains', checkedAt: CHECKED };
const ARK_PROTOCOL = { url: 'https://ark-protocol.org/', label: 'Ark protocol', checkedAt: CHECKED };
const OPTECH_ARK = { url: 'https://bitcoinops.org/en/topics/ark/', label: 'Bitcoin Optech: Ark', checkedAt: CHECKED };
const ARKADE_DOCS = { url: 'https://docs.arkadeos.com/', label: 'Arkade docs', checkedAt: CHECKED };
const SECOND_DOCS = { url: 'https://second.tech/docs', label: 'Second docs (Bark)', checkedAt: CHECKED };

/* ---------------------------------- Spark --------------------------------- */

const FICHE_SPARK_OVERVIEW = concept({
  id: 'FICHE_SPARK_OVERVIEW',
  title: 'Spark, a statechain layer on Bitcoin',
  summary: 'Spark moves bitcoin off-chain by handing coins from owner to owner with the help of a group of operators, while every coin keeps a pre-signed way back to Bitcoin.',
  body:
    'Spark is an off-chain layer built on statechains. A coin enters it through a deposit ' +
    'transaction on Bitcoin, then changes hands without touching the chain: for each ' +
    'transfer, the owner and the Spark operators sign together, the operators move their ' +
    'share of the key to the new owner, and the previous owner loses the ability to spend. ' +
    'Transfers are instant and carry no on-chain fee. The operators (on mainnet: Lightspark, ' +
    'Breez and Flashnet) never hold a coin alone: spending always needs the owner. The ' +
    'trust is a moment-in-time one: as long as one operator honestly forgets the old share ' +
    'at each transfer, nobody can rewind a past transfer. Every coin also carries ' +
    'pre-signed transactions that let its owner leave to Bitcoin without asking anyone ' +
    '(the unilateral exit). The Explorer reads a Spark wallet straight from the operators: ' +
    'its balance, its leaves (the coins), its transfers, and for each leaf the path back ' +
    'to Bitcoin.',
  retrievalHints: [
    'spark', 'spark network', 'what is spark', 'statechain', 'spark operators', 'off-chain', 'layer 2',
    'lightspark', 'breez', 'flashnet', 'réseau spark', "c'est quoi spark", 'couche 2', 'hors chaîne',
  ],
  sources: [SPARK_TLDR, SPARK_TRUST, OPTECH_STATECHAINS],
  stability: 'stable',
});

const FICHE_SPARK_LEAF_TREE = concept({
  id: 'FICHE_SPARK_LEAF_TREE',
  title: 'Spark leaf and tree',
  summary: 'A leaf is a coin on Spark. Leaves hang from a tree of pre-signed transactions whose root spends a deposit on Bitcoin.',
  body:
    'On Spark a coin is called a leaf. It carries an amount in sats, an owner (an identity ' +
    'key, which is also the owner\'s Spark address) and a state: available, locked while a ' +
    'transfer or a split is in progress, split when it was replaced by smaller leaves, ' +
    'exited when it went back to Bitcoin. Leaves come from a tree: the deposit on Bitcoin ' +
    'is split, off-chain, into smaller and smaller outputs by pre-signed transactions, ' +
    'down to the amounts a wallet needs; splits usually halve the amount, so leaves tend ' +
    'to be powers of two sats. The Explorer\'s address page shows the leaves as bubbles ' +
    'sized by amount and lists them; a leaf page shows the leaf\'s amount, state, owner, ' +
    'the tree it belongs to, the deposit at the top of the tree and the exit path down to ' +
    'the leaf. A transfer never cuts a leaf: it moves whole leaves, so paying an odd ' +
    'amount means splitting first or sending several leaves.',
  retrievalHints: [
    'leaf', 'leaves', 'spark leaf', 'spark tree', 'tree id', 'coin on spark', 'split', 'leaf id',
    'feuille', 'feuilles spark', 'feuille spark', 'arbre spark',
  ],
  sources: [SPARK_TECH, SPARK_SDK],
  stability: 'stable',
});

const FICHE_SPARK_DEPOSIT = concept({
  id: 'FICHE_SPARK_DEPOSIT',
  title: 'Spark deposit on Bitcoin',
  summary: 'A tree of Spark leaves starts from one output of a Bitcoin transaction, the deposit. The Explorer joins the two sides.',
  body:
    'Everything on Spark hangs from Bitcoin. A wallet deposits by paying an address it ' +
    'controls together with the operators; that transaction is the deposit, and its ' +
    'output is the root the tree grows from. The root node transaction spends the ' +
    'deposit, the splits below it divide the amount, and the leaves are the coins people ' +
    'transfer. The deposit is the one dated, on-chain moment of the tree: the Explorer\'s ' +
    'leaf page shows when it confirmed and in which block, and the Bitcoin transaction ' +
    'page of a deposit gets a Spark card naming the tree it started and the leaf you came ' +
    'from. Sparkscan, the public Spark explorer, indexes the Spark side only: a deposit\'s ' +
    'txid is unknown to it. Alice\'s Explorer is where the deposit, the tree, the leaf and ' +
    'the exit path are read as one story.',
  retrievalHints: [
    'deposit', 'spark deposit', 'deposit transaction', 'root', 'tree root', 'on-chain deposit', 'deposit output',
    'dépôt spark', 'dépôt', 'transaction de dépôt', 'racine',
  ],
  sources: [SPARK_TECH, SPARKSCAN],
  stability: 'stable',
});

const FICHE_SPARK_TRANSFER = concept({
  id: 'FICHE_SPARK_TRANSFER',
  title: 'Spark transfer',
  summary: 'A transfer hands whole leaves from one Spark address to another by re-signing them with the operators; it is instant and leaves no trace on Bitcoin.',
  body:
    'A Spark transfer moves one or more leaves, whole, from a sender to a receiver. The ' +
    'sender starts it, the operators adjust their key share so that the receiver becomes ' +
    'the only one able to spend (the key tweak), and the receiver signs the new refund ' +
    'transaction that is the receiver\'s own way back to Bitcoin. Until the receiver has ' +
    'done its part the transfer is pending; it then reads completed. A transfer that is ' +
    'not claimed in time expires, or is returned to the sender. Nothing is written to ' +
    'Bitcoin and there is no fee to read. The Explorer names each transfer by its id (a ' +
    'UUID), shows the sender, the receiver, the amount and the leaves moved, and draws the ' +
    'flow from the sender\'s address to the receiver\'s. Some transfers have a special ' +
    'shape: a Lightning payment is a swap with the Spark Service Provider, a cooperative ' +
    'exit sends the coin to Bitcoin with the operators\' help, and a claimed deposit turns ' +
    'a fresh deposit into leaves.',
  retrievalHints: [
    'transfer', 'spark transfer', 'send on spark', 'receive on spark', 'pending transfer', 'key tweak', 'transfer id',
    'uuid', 'completed', 'transfert spark', 'transfert', 'envoi spark', 'réception spark', 'en attente',
  ],
  sources: [SPARK_TECH, SPARK_SDK],
  stability: 'stable',
});

const FICHE_SPARK_EXIT_TIMELOCKS = concept({
  id: 'FICHE_SPARK_EXIT_TIMELOCKS',
  title: 'Spark unilateral exit and timelocks',
  summary: 'Every Spark leaf carries pre-signed transactions that let its owner return to Bitcoin alone. Relative timelocks on that path are what keep an old owner from racing a new one.',
  body:
    'A leaf\'s owner can leave Spark without anyone\'s help: broadcast the pre-signed node ' +
    'transactions from the root of the tree down to the leaf, then the refund transaction ' +
    'that pays the owner. Each of these transactions waits a relative timelock after its ' +
    'parent confirms. A fresh leaf starts with a wait of 2,000 blocks on its refund; each ' +
    'transfer lowers it by 100 blocks, because the new owner\'s refund must be able to ' +
    'confirm before the previous owner\'s; when it gets below 200 blocks the leaf is ' +
    'renewed, which resets the wait. The sum of the timelocks on the path is the time an ' +
    'exit takes at worst, about two weeks for a fresh leaf. The Explorer\'s leaf page draws ' +
    'this path as a funnel: the deposit, the splits, the leaf, the refund, with each ' +
    'transaction\'s wait, and adds them up under THEN WAIT. The cooperative exit is the ' +
    'quick alternative: the operators sign a direct payment to Bitcoin, no timelock to sit ' +
    'through.',
  retrievalHints: [
    'unilateral exit', 'exit', 'timelock', 'refund transaction', 'exit path', 'then wait', 'leave spark',
    'cooperative exit', 'exit tree', 'sortie unilatérale', 'sortie spark', 'timelock spark', 'chemin de sortie', 'délai',
    'remboursement',
  ],
  sources: [SPARK_TECH, SPARK_SDK],
  stability: 'stable',
});

const FICHE_SPARK_OPERATORS_SSP = concept({
  id: 'FICHE_SPARK_OPERATORS_SSP',
  title: 'Spark operators and the Spark Service Provider',
  summary: 'A small set of operators co-sign every Spark transfer, and a service provider bridges Spark to Lightning and to Bitcoin. Trust in them is bounded, not absent.',
  body:
    'Spark runs on a fixed group of operators; on mainnet they are Lightspark, Breez and ' +
    'Flashnet. Together they hold a share of each coin\'s key and sign transfers with the ' +
    'owner using a threshold signature. They can refuse to co-sign (a liveness risk, ' +
    'answered by the unilateral exit), and they see every transfer, so Spark is not ' +
    'private towards its operators; but they cannot spend a coin without its owner, and ' +
    'as long as one of them honestly forgets the old share at each transfer, a past owner ' +
    'cannot take the coin back. The Spark Service Provider (SSP), run by Lightspark, is a ' +
    'wallet like any other with a public job: it pays and receives Lightning invoices on ' +
    'behalf of Spark wallets, and it executes cooperative exits to Bitcoin. In the ' +
    'Explorer, a transfer whose counterparty is the SSP reads as a Lightning payment; the ' +
    'operators\' endpoints and keys are listed on the Spark home page, and every address ' +
    'page says which operators were read.',
  retrievalHints: [
    'operator', 'spark operator', 'ssp', 'spark service provider', 'lightning on spark', 'trust model', 'who runs spark',
    'threshold signature', 'opérateur spark', 'opérateurs', 'fournisseur de service spark', 'modèle de confiance',
  ],
  sources: [SPARK_TRUST, SPARK_SDK],
  stability: 'volatile',
});

const FICHE_SPARK_ADDRESS = concept({
  id: 'FICHE_SPARK_ADDRESS',
  title: 'Spark address',
  summary: 'A Spark address is a wallet\'s identity key, written in bech32m with the prefix spark1. One address, one wallet: reuse is built in.',
  body:
    'A Spark address encodes the wallet\'s identity public key, the key the operators sign ' +
    'with for that wallet; current addresses start with spark1, older ones with sp1 and ' +
    'carry the same key. Because the address is the key, a Spark wallet has one address ' +
    'for its whole life: every transfer it sends or receives is tied to it, which is the ' +
    'opposite of Bitcoin\'s fresh address per payment. The Explorer reads an address from ' +
    'the operators and shows its balance, its leaves as bubbles and as a list, its ' +
    'transfers (sent and received), when it was first seen, the average age of its coins, ' +
    'and a balance timeline rebuilt from the transfers. The token lines, under the word ' +
    'token, come from Sparkscan. A wallet that turned on privacy answers nothing to these ' +
    'public reads: it looks exactly like an empty wallet, and the page says so.',
  retrievalHints: [
    'spark address', 'spark1', 'sp1', 'identity key', 'identity public key', 'address on spark', 'balance on spark',
    'adresse spark', "clé d'identité", 'solde spark',
  ],
  sources: [SPARK_SDK, SPARK_TECH],
  stability: 'stable',
});

const FICHE_SPARK_PRIVACY = concept({
  id: 'FICHE_SPARK_PRIVACY',
  title: 'What Spark shows in public',
  summary: 'A public Spark wallet\'s balance, leaves and transfers can be read by anyone from the operators; a private one reads as empty. The operators see everything either way.',
  body:
    'The Spark operators answer balance, leaf and transfer queries for any address, ' +
    'without authentication, unless the wallet has turned on privacy mode; a private ' +
    'wallet\'s reads come back empty, indistinguishable from an empty wallet, so the ' +
    'Explorer\'s address page says "Empty, or private" rather than guessing. Sparkscan, ' +
    'the public explorer, lists the same public data plus a live feed of the network. ' +
    'What this means for privacy: on Spark the question is not who can read the chain, ' +
    'since transfers do not touch it, but who can read the operators. With a public ' +
    'wallet, anyone can; with a private one, the operators themselves can, since they ' +
    'co-sign every transfer and know both sides of it. A deposit and an exit are the two ' +
    'moments that touch Bitcoin and can be read there by anyone, like any transaction.',
  retrievalHints: [
    'spark privacy', 'private wallet', 'privacy mode', 'empty or private', 'who can see spark', 'public wallet',
    'confidentialité spark', 'portefeuille privé', 'vie privée spark', 'mode privé',
  ],
  sources: [SPARK_SDK, SPARKSCAN],
  stability: 'stable',
});

const FICHE_SPARK_TOKENS = concept({
  id: 'FICHE_SPARK_TOKENS',
  title: 'Tokens on Spark',
  summary: 'Spark also carries tokens issued on it. The Explorer shows them as token lines, without name, ticker or amount.',
  body:
    'Besides bitcoin, Spark carries tokens: assets minted on Spark and transferred through ' +
    'the same operators, each named by an identifier that starts with btkn1. A token ' +
    'transaction is identified by a 64-character hexadecimal id, like a Bitcoin txid, and ' +
    'it can move a token between several wallets at once. Alice\'s Explorer deliberately ' +
    'shows these as "token" lines on an address page, and as a token card when one is ' +
    'opened: it says which wallets took part and when, but it does not name the token, ' +
    'show its ticker or its amount. That is a choice, not a limit of the data: Alice ' +
    'explains bitcoin and does not promote other assets. The token lines come from ' +
    'Sparkscan, not from the operators\' bitcoin queries.',
  retrievalHints: [
    'token', 'tokens', 'spark token', 'btkn', 'btkn1', 'token transaction', 'token activity',
    'jeton', 'jetons spark', 'jeton spark',
  ],
  sources: [SPARK_TLDR, SPARKSCAN],
  stability: 'volatile',
});

const FICHE_SPARKSCAN = concept({
  id: 'FICHE_SPARKSCAN',
  title: 'Sparkscan',
  summary: 'Sparkscan is the public Spark explorer. Alice uses it for the live feed and the token lines, and adds what it lacks: the Bitcoin side.',
  body:
    'Sparkscan (sparkscan.io) indexes the Spark network: a live feed of transfers, a page ' +
    'per address with its history, and a page per transaction, tokens included. Alice\'s ' +
    'Explorer uses it for what the operators do not offer: the network-wide live feed on ' +
    'the Spark home page, the size of an address\'s history, and the token lines. ' +
    'Everything else, balances, leaves, transfers and exit trees, is read straight from ' +
    'the operators. Sparkscan stops at Spark\'s edge: a deposit\'s Bitcoin transaction, the ' +
    'tree it started, and the pre-signed exit path are not on it. Alice draws that side, ' +
    'from the Bitcoin block down to the leaf, and marks a deposit on its Bitcoin ' +
    'transaction page. Sparkscan writes addresses in the older sp1 form in its feed; the ' +
    'Explorer shows the current spark1 form, the same key.',
  retrievalHints: [
    'sparkscan', 'spark explorer', 'live feed', 'spark scan', 'explorateur spark', 'fil en direct',
  ],
  sources: [SPARKSCAN],
  stability: 'volatile',
});

/* ----------------------------------- Ark ---------------------------------- */

const FICHE_ARK_OVERVIEW = concept({
  id: 'FICHE_ARK_OVERVIEW',
  title: 'Ark, Arkade and Bark',
  summary: 'Ark is an off-chain protocol where an operator batches users\' coins into shared Bitcoin transactions. Arkade and Bark are two implementations the Explorer reads.',
  body:
    'Ark is a protocol for off-chain bitcoin payments built around an operator (called the ' +
    'Ark Service Provider or server). Users hold virtual coins, VTXOs, that live in a tree ' +
    'of pre-signed transactions hanging from one on-chain transaction the operator makes ' +
    'for a whole batch of users. Payments are co-signed by the owner and the operator and ' +
    'settle instantly; periodically, coins are refreshed into a new batch, and a coin that ' +
    'is never refreshed expires and can be swept by the operator. An owner can always ' +
    'leave alone by broadcasting the coin\'s branch of the tree and waiting an exit delay. ' +
    'The Explorer reads two implementations: Arkade (addresses ark1q…), whose operator ' +
    'publishes an indexer of coins, virtual transactions and commitment transactions, and ' +
    'Bark by Second (addresses ark1p…), whose server publishes its rounds and answers for ' +
    'a coin by its id. Neither publishes a list of past rounds, so the Explorer finds them ' +
    'by walking the operator\'s wallet on Bitcoin.',
  retrievalHints: [
    'ark', 'ark protocol', 'arkade', 'bark', 'second', 'ark service provider', 'asp', 'ark server', 'what is ark',
    'protocole ark', "c'est quoi ark", 'serveur ark', 'opérateur ark',
  ],
  sources: [ARK_PROTOCOL, OPTECH_ARK, ARKADE_DOCS, SECOND_DOCS],
  stability: 'volatile',
});

const FICHE_ARK_VTXO = concept({
  id: 'FICHE_ARK_VTXO',
  title: 'VTXO, a virtual coin',
  summary: 'A VTXO is an off-chain coin on Ark: an output of a pre-signed transaction, backed by a batch anchored on Bitcoin, with an expiry.',
  body:
    'A VTXO (virtual transaction output) is a coin that exists off-chain: an output of a ' +
    'pre-signed transaction in a tree that hangs from an on-chain batch. It has an amount, ' +
    'an owner script (the owner\'s key with the operator\'s), and an expiry after which the ' +
    'operator may sweep the batch; refreshing the coin into a new batch before that keeps ' +
    'it alive. On Arkade a coin is preconfirmed when the operator has co-signed it but it ' +
    'is not yet in a batch, settled once a commitment transaction anchors it, spent when a ' +
    'later virtual transaction consumed it, swept when it expired. On Bark a coin comes ' +
    'from a round, from a board (an on-chain output turned into a coin directly), or from ' +
    'an arkoor payment made outside a round and co-signed by the server. The Explorer\'s ' +
    'VTXO page shows the coin\'s id (txid:vout), amount, state, expiry, where it comes ' +
    'from, and its exit path drawn as a funnel.',
  retrievalHints: [
    'vtxo', 'vtxos', 'virtual coin', 'virtual utxo', 'virtual transaction output', 'vtxo expiry', 'preconfirmed',
    'settled', 'swept', 'arkoor', 'board', 'pièce virtuelle', 'expiration vtxo', 'vtxo arkade', 'vtxo bark',
  ],
  sources: [ARK_PROTOCOL, ARKADE_DOCS, SECOND_DOCS],
  stability: 'stable',
});

const FICHE_ARK_COMMITMENT_ROUND = concept({
  id: 'FICHE_ARK_COMMITMENT_ROUND',
  title: 'Commitment transaction and round',
  summary: 'The on-chain transaction that anchors a batch of Ark coins: a commitment transaction on Arkade, a round on Bark. Not a payment between two people.',
  body:
    'Every batch of Ark coins hangs from one Bitcoin transaction made by the operator: ' +
    'Arkade calls it a commitment transaction, Bark calls it a round. It spends the ' +
    'operator\'s own funds and the forfeited coins of the users who settled, and it ' +
    'creates the batch output the new tree hangs from (plus, often, a connector output ' +
    'used to forfeit coins later). The Explorer marks these transactions with an ARKADE ' +
    'COMMITMENT TX or BARK ROUND badge on their Bitcoin page, lists the batch and the ' +
    'coins it carries, and shows the latest ones in a live feed on each network\'s home ' +
    'page. Reading one as a payment would mislead: its inputs and outputs belong to many ' +
    'users and to the operator at once, so the usual privacy heuristics (change ' +
    'detection, common input ownership) do not apply; the Explorer says so with an "Ark ' +
    'round settled on-chain" note instead of running them. Lists of past rounds come from ' +
    'walking the operator\'s wallet, so they may be incomplete.',
  retrievalHints: [
    'commitment transaction', 'commitment tx', 'round', 'bark round', 'arkade commitment', 'batch', 'settlement',
    'ark settlement', 'forfeit', 'connector', "transaction d'engagement", 'tour bark', 'lot', 'règlement',
  ],
  sources: [ARK_PROTOCOL, ARKADE_DOCS, SECOND_DOCS],
  stability: 'stable',
});

const FICHE_ARK_EXIT = concept({
  id: 'FICHE_ARK_EXIT',
  title: 'Ark unilateral exit',
  summary: 'An Ark coin\'s owner can leave without the operator by broadcasting the coin\'s branch of the tree, then waiting the exit delay.',
  body:
    'The pre-signed tree behind an Ark batch is the owner\'s guarantee: to leave without ' +
    'the operator\'s help, the owner broadcasts the transactions on the path from the ' +
    'batch output down to the coin, each one spending the previous, and then waits a ' +
    'delay before the coin can be spent on Bitcoin. On Arkade that delay is the ' +
    'operator\'s unilateral exit delay; on Bark each step waits an exit delta in blocks. ' +
    'Leaving this way costs on-chain fees for every transaction broadcast and takes time, ' +
    'which is why the normal way out is cooperative: the operator co-signs a direct ' +
    'payment to Bitcoin. The Explorer\'s VTXO page draws the exit path as a funnel, from ' +
    'the commitment or round at the top to the coin at the bottom, with each ' +
    'transaction\'s outputs and the coin\'s branch highlighted, and sums the wait under ' +
    'THEN WAIT. An expired coin, swept by the operator, has no exit left: refreshing ' +
    'before expiry is what keeps the path valid.',
  retrievalHints: [
    'unilateral exit', 'exit delay', 'exit path', 'leave ark', 'sweep', 'expiry', 'then wait', 'exit tree', 'refresh',
    'sortie unilatérale', 'chemin de sortie', 'délai de sortie', 'balayage', 'rafraîchir',
  ],
  sources: [ARK_PROTOCOL, OPTECH_ARK, ARKADE_DOCS, SECOND_DOCS],
  stability: 'stable',
});

const FICHE_ARK_ADDRESS = concept({
  id: 'FICHE_ARK_ADDRESS',
  title: 'Ark addresses',
  summary: 'An ark1 address names an off-chain destination. Arkade\'s (ark1q) carry the owner\'s script and the operator\'s key; Bark\'s (ark1p) carry a policy and a mailbox.',
  body:
    'Ark addresses start with ark1 and tell which implementation they belong to by their ' +
    'version: Arkade\'s start with ark1q and encode the operator\'s signing key with the ' +
    'taproot script the coins sit on; Bark\'s start with ark1p and encode the server\'s id, ' +
    'the owner\'s key (the policy) and a mailbox the server delivers payments to. For an ' +
    'Arkade address the Explorer asks the operator\'s indexer and shows the address like a ' +
    'Bitcoin one: spendable balance, coins as bubbles and as a list, virtual transactions, ' +
    'a balance timeline. A Bark address cannot be listed that way: the server only tells ' +
    'an address\'s owner about its coins, so the page decodes what the address itself ' +
    'says (which server, which key, which mailbox) and nothing more. An Ark address is ' +
    'reusable by design and is tied to one operator: a coin paid to it exists only with ' +
    'that operator\'s help.',
  retrievalHints: [
    'ark address', 'ark1', 'ark1q', 'ark1p', 'arkade address', 'bark address', 'mailbox', 'policy',
    'adresse ark', 'adresse arkade', 'adresse bark', 'boîte aux lettres',
  ],
  sources: [ARKADE_DOCS, SECOND_DOCS],
  stability: 'stable',
});

/** The off-chain layer fiches, Spark first, then Ark. */
export const LAYER_FICHES: Fiche[] = [
  FICHE_SPARK_OVERVIEW,
  FICHE_SPARK_LEAF_TREE,
  FICHE_SPARK_DEPOSIT,
  FICHE_SPARK_TRANSFER,
  FICHE_SPARK_EXIT_TIMELOCKS,
  FICHE_SPARK_OPERATORS_SSP,
  FICHE_SPARK_ADDRESS,
  FICHE_SPARK_PRIVACY,
  FICHE_SPARK_TOKENS,
  FICHE_SPARKSCAN,
  FICHE_ARK_OVERVIEW,
  FICHE_ARK_VTXO,
  FICHE_ARK_COMMITMENT_ROUND,
  FICHE_ARK_EXIT,
  FICHE_ARK_ADDRESS,
];
