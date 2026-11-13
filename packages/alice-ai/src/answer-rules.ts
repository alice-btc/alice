import { utxoNumericContradiction, utxoOutputTotalContradiction } from './utxo-arithmetic.ts';
import { coinbaseNumericContradiction, coinbaseIssuanceContradiction, coinbaseExcessContradiction, coinbaseCeilingIssuanceContradiction } from './coinbase-arithmetic.ts';
import { isImplicitCpfpQuestion, isMonetaryIssuanceQuestion, isLightningPrivacyQuestion } from './retrieval-topic-cues.ts';
// Answer rules: the points a retrieved note makes mandatory, and the claims
// it rules out. The measured models (Qwen3.5 9B on 2026-10-06, the Private
// Cloud model the same day) kept inverting three subjects with the right
// note in front of them: an Ark exit presented as depending on the operator,
// a multisig quorum inflated to "all three signatures", a replacement made
// conditional on an opt-in flag. Two deterministic layers answer that:
//
// 1. When one of these notes is in the retrieved context of a turn, a short
//    instruction block built from its rules rides with the context
//    (generation-context.ts). It is bounded so it always fits the local
//    context budget next to the notes themselves.
// 2. After generation, each sentence of the answer is tested against the
//    never-claim patterns of the notes that were in context. On Private
//    Cloud a match appends a short correction in the user's language, in the
//    spirit of the live-value caveat (live-value-caveat.ts). On a local or
//    custom model the answer is generated once more with the correction, and
//    withheld if the second attempt still fails (language-generation.ts).
//    The match is reported in the generation diagnostics.
//
// The 2026-11-02 replay on Private Cloud added a fourth subject, the seed
// backup: a photo, a phone note or an encrypted cloud file accepted as a copy
// of the phrase. It also showed the Ark rules riding with a retrieved Ark note
// on a mempool question, hence the subject gate on a rule.
//
// The rules are keyed by note id and kept out of the knowledge packs: they
// are instructions for the model and for the output guard, not retrievable
// text, so they change neither the pack schema nor the corpus hash.

import { isMajorityHashpowerQuestion } from './majority-hashpower.ts';
import { isGeneralLightningPaymentExplanation, isLightningPaymentWalkthrough } from './rag-query-policy.ts';
import { SUPPORTED_LANGUAGE_CODES, type SupportedLanguage } from './languages.ts';

type Localized = Record<SupportedLanguage, string>;

export type AnswerRule = {
  /** Stable rule identity retained for existing diagnostics and saved contexts. */
  noteId: string;
  sourceConceptId: string;
  /** Additional reviewed concepts sharing this rule family across locales. */
  additionalSourceConceptIds?: readonly string[];
  /** Prior titles only support saved contexts; they never import retired prose. */
  legacyTitles?: readonly string[];
  /** Additional selected fiches carrying the same safety conditions. */
  additionalSourceTitles?: readonly string[];
  /** The title the retrieval formats as "Topic: <title>" (rag.ts). */
  title: string;
  mustState: Record<SupportedLanguage, readonly string[]>;
  neverClaim: Record<SupportedLanguage, readonly string[]>;
  /**
   * Set when the rules concern one subject: they apply only when the user's
   * recent turns name it (answerRuleNoteIdsOnSubject). The retrieval ranks
   * an Ark note next to a mempool question, and its exit rules then rode
   * with the answer (2026-11-02).
   */
  subject?: Pick<RegExp, 'test'>;
};

export type ClaimPattern = {
  /** Tested on each normalized sentence of the answer. */
  test: RegExp;
  /** Resolve a pronoun only from the immediately preceding explicit statement. */
  previousSentence?: RegExp;
  /** An explicit exception within the matched relation, never nearby prose. */
  unlessMatch?: RegExp;
  /** A sentence that also matches this states something else. */
  unless?: RegExp;
  /** Both the preceding subject and the matched component must agree. */
  unlessInContext?: { prefix: RegExp; claim: RegExp };
};

export type NeverClaimCheck = {
  id: string;
  /** Active when one of these notes was retrieved, unless always is set. */
  notes: readonly string[];
  /** Product capabilities apply even when no knowledge note was retrieved. */
  always?: boolean;
  /** Any matching pattern counts. */
  patterns: readonly ClaimPattern[];
  /** Bounded numeric/context checks use parsed text, not model judgments. */
  evaluateAnswer?: (answer: string, question: string, previousUserQuestion: string) => boolean;
  /**
   * Denial or hedge words. Tested on the whole sentence, or, with the
   * 'span' scope, on the matched claim and a short margin around it. The
   * 'match' scope excludes even that margin for relationship-specific denials.
   */
  unless?: RegExp;
  unlessScope?: 'sentence' | 'span' | 'match';
  /**
   * The correction is an instruction for a second generation, not a sentence
   * a reader can use. It drives the repair attempt and is never appended to
   * a displayed answer.
   */
  repairOnly?: boolean;
  /**
   * Sentences of the correction that instruct the second generation. They stay
   * in the repair guidance and are left out of the correction a reader sees.
   */
  modelOnly?: Readonly<Record<SupportedLanguage, readonly string[]>>;
  /** Evaluate independent contrast/semicolon clauses separately. */
  clauseScoped?: boolean;
  /**
   * Tested on the whole sentence (or independent clause when clauseScoped),
   * whatever the scope of `unless`: a question,
   * a quoted claim or a refutation ("a common myth", "ce qui est faux")
   * repeats the claim without making it.
   */
  unlessSentence?: RegExp;
  /** Skipped when the user's own question matches, e.g. a threshold the user stated. */
  unlessQuestion?: RegExp;
  correction: Localized;
};

/** Longest instruction block, in characters, including its header. */
export const ANSWER_RULES_MAX_CHARS = 1700;

// Sentences shared by two notes are the same string, so a turn that retrieves
// both notes states them once.
const EXIT_WITHOUT_OPERATOR: Localized = {
  en: "A holder with valid exit data can start a unilateral exit without the operator, while sufficient time remains to fully confirm it before expiry; the operator has no approval step in that exit.",
  fr: "Un détenteur ayant les données de sortie valides peut lancer une sortie unilatérale sans accord de l’opérateur, si le temps suffit à la confirmer entièrement avant expiration.",
};
const EXIT_MECHANICS: Localized = {
  en: "The exit publishes on-chain transactions, pays fees and waits for confirmations and timelocks. Starting before expiry is insufficient: the exit must complete in time under the implementation’s rules.",
  fr: "La sortie publie des transactions, paie des frais et attend confirmations et timelocks. La lancer avant expiration ne suffit pas : elle doit aboutir à temps selon l’implémentation.",
};
const EXPIRY_RULE: Localized = {
  en: "A vTXO must be refreshed or exited before its expiry. After expiry, unilateral recovery is no longer available: recovery depends on the operator’s cooperation and funds can be lost. Check the wallet and server rules.",
  fr: "Un vTXO doit être renouvelé ou sorti avant expiration. Après cette échéance, la récupération unilatérale disparaît : elle dépend de la coopération de l’opérateur et les fonds peuvent être perdus. Vérifie les règles du wallet et du serveur.",
};
const OPERATOR_POWERS: Localized = {
  en: "Normal VTXO spending needs the holder’s signature: the operator cannot spend it alone. It coordinates payments, sees the activity it handles and can stop cooperating. This is not a guarantee against expiry or arkoor collusion with former senders.",
  fr: "La dépense normale d’un VTXO exige la signature de son détenteur : l’opérateur ne peut pas le dépenser seul. Il coordonne les paiements, voit l’activité qu’il traite et peut cesser de coopérer. Cela ne protège pas de l’expiration ni d’une collusion arkoor avec d’anciens émetteurs.",
};
const NO_OPERATOR_BLOCK: Localized = {
  en: "that operator permission is needed for a valid unilateral exit completed before expiry",
  fr: "que l’accord de l’opérateur est requis pour une sortie unilatérale valide achevée avant expiration",
};
const NO_FUNDS_LOST: Localized = {
  en: "that disappearance alone necessarily loses funds despite valid exit data and enough time, or that funds can never be lost",
  fr: "que la disparition seule fait nécessairement perdre les fonds malgré les données et le temps suffisants, ou que toute perte est impossible",
};
const NO_EXPIRY_INVERSION: Localized = {
  en: "that expiry unlocks unilateral recovery without the operator",
  fr: "que l’expiration débloque une récupération unilatérale sans opérateur",
};
const NO_LAYER_ONE: Localized = {
  en: 'that Ark is a layer 1 or a base-layer protocol; it is built on top of Bitcoin, its rounds anchored in ordinary Bitcoin transactions',
  fr: "qu'Ark est une couche 1 ou un protocole de la couche de base ; il est construit par-dessus Bitcoin, ses rounds ancrés dans des transactions Bitcoin ordinaires",
};
const NO_INSTANT_EXIT: Localized = {
  en: 'that exits are instant, free or identical across implementations',
  fr: 'que les sorties sont instantanées, gratuites ou identiques partout',
};

const CONFIRMED_IS_FINAL: Localized = {
  en: "A confirmed payment cannot be cancelled by the wallet or replaced with RBF. Confirmations reduce the risk of a chain reorganization; they do not prove absolute irreversibility.",
  fr: "Un paiement confirmé ne peut être annulé par le wallet ni remplacé par RBF. Les confirmations réduisent le risque de réorganisation de chaîne sans prouver une irréversibilité absolue.",
};
const REPLACEMENT_CONDITIONS: Localized = {
  en: 'While unconfirmed, a replacement that spends the same inputs and pays a higher fee may be possible, if the wallet supports it and node policies accept it; it is never guaranteed.',
  fr: "Tant qu'il n'est pas confirmé, un remplacement qui dépense les mêmes entrées avec des frais plus élevés peut être possible, si le portefeuille le permet et si les politiques des nœuds l'acceptent ; ce n'est jamais garanti.",
};
const FULL_RBF: Localized = {
  en: 'Opt-in signaling (BIP 125) is not a precondition everywhere: nodes and miners applying full-RBF, the Bitcoin Core default since version 28.0, also accept a replacement of a transaction that did not signal it.',
  fr: "Le signal opt-in (BIP 125) n'est pas une condition partout : les nœuds et mineurs qui appliquent le full-RBF, comportement par défaut de Bitcoin Core depuis la version 28.0, acceptent aussi le remplacement d'une transaction qui ne l'a pas signalé.",
};
const NO_SECOND_PAYMENT: Localized = {
  en: 'Never send a second independent payment as a remedy; verify destination, amount and total fee in the wallet before any replacement.',
  fr: "N'envoie jamais un second paiement indépendant pour corriger le premier ; vérifie la destination, le montant et les frais totaux dans le portefeuille avant tout remplacement.",
};
const NO_OPT_IN_PRECONDITION: Localized = {
  en: 'that a replacement works only if RBF was enabled or signaled when the payment was sent',
  fr: "qu'un remplacement ne fonctionne que si l'option RBF a été activée ou signalée à l'envoi",
};
const NO_SECOND_PAYMENT_REMEDY: Localized = {
  en: 'that a second payment, or a new transaction with other inputs, fixes or speeds up the first one',
  fr: "qu'un second paiement, ou une nouvelle transaction avec d'autres entrées, corrige ou accélère le premier",
};
const NO_REVERSAL: Localized = {
  en: 'that a confirmed payment can be reversed, or that Alice cancelled or replaced a real transaction',
  fr: "qu'un paiement confirmé peut être annulé, ou qu'Alice a annulé ou remplacé une transaction réelle",
};

// Tested on the normalized text of the user's recent turns.
const ARK_SUBJECT = /\b(?:ark|arkade|bark|vtxos?|rounds?|asp|operat(?:or|eur)s?)\b/;

const SEED_MEDIUM: Localized = {
  en: 'Write the recovery phrase by hand on paper or stamp it on metal. Never photograph it or type it into a note, an email, a cloud file or a password manager, even encrypted: a connected device can be compromised, and an exposed phrase gives away every key it derives.',
  fr: "Écris la phrase de récupération à la main sur papier ou grave-la sur métal. Ne la prends jamais en photo et ne la saisis jamais dans une note, un e-mail, un fichier dans le cloud ou un gestionnaire de mots de passe, même chiffré : un appareil connecté peut être compromis, et une phrase exposée livre toutes les clés qu'elle dérive.",
};
const SEED_COPIES: Localized = {
  en: 'Keep more than one copy, in separate places, away from fire, water and curious eyes.',
  fr: "Conserve plusieurs copies, dans des lieux séparés, à l'abri du feu, de l'eau et des regards.",
};
const SEED_RESTORE_TEST: Localized = {
  en: 'Test the backup with a restore in a safe setting, without typing the phrase into a website, a chat or a support form.',
  fr: 'Teste la sauvegarde par une restauration dans un cadre sûr, sans saisir la phrase sur un site, un chat ou un formulaire de support.',
};

/** Source presence is checked separately. Do not reuse the exact overview
 * query recognizer here: it deliberately restricts retrieval rewriting, but
 * equivalent payment questions and their route follow-ups need the same facts. */
function isLightningPaymentMechanicsSubject(recentUserText: string): boolean {
  const latest = recentUserText.trim().split('\n').at(-1) ?? '';
  if (isGeneralLightningPaymentExplanation(latest)) return true;
  const rail = /\b(?:lightning|bolt11|htlc)\b/;
  const payment = /\b(?:payments?|paiements?|paying|payer|invoice|invoices|factures?|routing|routage|route|routes|chemins?|paths?)\b/;
  if (rail.test(latest)) return payment.test(latest);
  // A new, explicitly named rail/topic must not inherit old Lightning rules.
  if (/\b(?:bitcoin|on.chain fees|frais on.chain|ark|arkade|liquid|cashu|fedimint|monero|ethereum|seed|bip39|mining|minage|coinbase|subsidy|subvention)\b/.test(latest)) {
    // A mixed route-failure/on-chain question still concerns Lightning.
    if (!/\b(?:no (?:route|path)|(?:route|path) (?:fails?|does not work)|aucun chemin|chemin ne fonctionne)\b/.test(latest)) return false;
    if (/\b(?:ark|arkade|liquid|cashu|fedimint|monero|ethereum|seed|bip39|mining|minage|coinbase|subsidy|subvention)\b/.test(latest)) return false;
  }
  return rail.test(recentUserText) && /\b(?:invoice|invoices|factures?|route|routes|routing|routage|chemins?|paths?)\b/.test(latest);
}

export const ANSWER_RULES: readonly AnswerRule[] = [
  {
    noteId: 'lightning-payment-mechanics',
    sourceConceptId: 'lightning-network',
    title: 'Comprendre Lightning',
    additionalSourceTitles: ['Understanding Lightning'],
    subject: { test: isLightningPaymentMechanicsSubject },
    mustState: {
      en: [
        'Invoice: the recipient signs a payment request and gives it to the payer before payment. The payer reads it locally; it is neither an HTLC nor a packet forwarded through the route.',
        'Route: the payer’s wallet selects channels with enough liquidity in the payment direction. Intermediate nodes allow payment without a direct payer-recipient channel.',
        'Settlement: the recipient reveals the preimage to its adjacent peer; it travels back toward the payer to fulfill HTLCs. Balances update off-chain and channels stay open. Forwarding fees can apply; zero fees, instant completion and success are not guaranteed.',
        'No route found before sending: retry or report failure; the search itself locks no funds and does not prove no usable path exists. Information, constraints or liquidity can limit it. A committed HTLC can keep its amount pending until fulfillment or failure resolution; check its status before retrying.',
        'An ordinary payment has no closing step. Closing later is separate: both parties can cooperate, or either can publish a commitment unilaterally. On-chain fees and delays can apply; closing does not publish each past payment.',
      ],
      fr: [
        'Facture : le destinataire signe une demande et la donne au payeur avant paiement. Le payeur la lit localement ; ce n’est ni un HTLC ni un paquet transmis sur le chemin.',
        'Chemin : le portefeuille sélectionne des canaux avec assez de liquidité dans le sens du paiement. Les intermédiaires évitent d’exiger un canal direct payeur-destinataire.',
        'Règlement : le destinataire révèle la préimage à son pair adjacent ; elle revient vers le payeur pour remplir les HTLC. Les soldes changent hors chaîne et les canaux restent ouverts. Des frais de routage peuvent s’appliquer ; gratuité, instantanéité et succès ne sont pas garantis.',
        'Aucun chemin trouvé avant envoi : réessayer ou signaler l’échec ; cette recherche ne bloque pas de fonds et ne prouve pas qu’aucun chemin n’existe. Information, contraintes ou liquidité peuvent la limiter. Un HTLC engagé peut rester en attente jusqu’au règlement ou à sa résolution ; vérifier son statut avant de réessayer.',
        'Un paiement ordinaire ne ferme pas le canal. Une fermeture ultérieure, coopérative ou unilatérale, est une opération on-chain distincte avec frais et délais possibles ; elle règle les soldes sans publier chaque paiement passé.',
      ],
    },
    neverClaim: {
      en: ['that every payment closes its channels, every routing failure loses funds or automatically appears on-chain', 'that the payer creates the invoice or gives it to the recipient'],
      fr: ['que tout paiement ferme ses canaux ou que tout échec de routage perd les fonds ou apparaît automatiquement on-chain', 'que le payeur crée la facture ou la donne au destinataire'],
    },
  },
  {
    noteId: 'bitcoin-issuance-validation',
    sourceConceptId: 'bitcoin-monetary-policy',
    title: 'L’émission monétaire de Bitcoin',
    additionalSourceTitles: ["Bitcoin's monetary issuance", "The coinbase transaction", "La transaction coinbase"],
    subject: /\b(?:coinbase|issuance|emission|subsid\w*|subvention\w*|creates?|cree\w*|too many coins|trop de (?:pieces|bitcoins))\b/,
    mustState: {
      en: [
        "Keep three quantities distinct: S is the permitted subsidy at the block height; F is the sum of included transaction fees (existing coins); C is the sum of coinbase outputs claimed by the miner. Each full node checks C <= S + F. It rejects C > S + F, even with valid proof of work.",
        "S caps new issuance; it is not necessarily the amount actually issued. Fees transfer existing coins. S + F caps the coinbase reward, not new issuance. A miner may claim less: the net supply increase is C - F, at most S. Subtract F because these coins already existed, not because the miner pays F as an expense. Explain this comparison first; use hypothetical values only when specified, never invent a current subsidy.",
        "For each ordinary transaction, fee = sum(inputs) - sum(outputs). Block size, weight and the Merkle root are not the monetary ceiling. Do not compare S + F to S or sum every output of every transaction to measure issuance.",
      ],
      fr: [
        "Distingue trois quantités : S est la subvention autorisée à cette hauteur ; F est la somme des frais inclus (bitcoins existants) ; C est la somme des sorties de coinbase réclamée. Chaque nœud vérifie C <= S + F. Il rejette C > S + F même avec une preuve de travail valide.",
        "S plafonne la création nouvelle ; ce n’est pas forcément le montant réellement émis. Les frais transfèrent des bitcoins existants. S + F plafonne la récompense coinbase, pas les nouveaux bitcoins. Le mineur peut réclamer moins : l’augmentation nette vaut C - F, au plus S. On soustrait F car ces bitcoins existaient déjà, pas parce que le mineur paie F comme dépense. Commence par cette comparaison ; utilise les valeurs fictives données, sans inventer de subvention actuelle.",
        "Pour une transaction ordinaire, frais = total entrées - total sorties. Poids, taille et racine de Merkle ne sont pas le plafond monétaire. Ne compare pas S + F à S et n’additionne pas toutes les sorties du bloc pour mesurer l’émission.",
      ],
    },
    neverClaim: {
      en: ['that difficulty or the Merkle root alone enforces the allowed coinbase value', 'that transaction fees are newly issued bitcoins or part of new issuance', 'that the block weight or size limit sets the permitted monetary value of the coinbase'],
      fr: ['que la difficulté ou la racine de Merkle contrôle seule la valeur autorisée de la coinbase', 'que les frais de transaction sont des bitcoins nouvellement émis ou font partie de l’émission', 'que la limite de poids ou de taille du bloc fixe la valeur monétaire autorisée de la coinbase'],
    },
  },
  {
    noteId: 'majority-hashpower',
    sourceConceptId: '51-attack',
    title: 'L’attaque majoritaire',
    additionalSourceTitles: ['The majority attack'],
    subject: { test: isMajorityHashpowerQuestion },
    mustState: {
      en: [
        'Each full node independently checks validity, including coinbase outputs no greater than the permitted subsidy plus fees. Excess issuance is rejected even with valid proof of work; it does not inherently cause a hash mismatch. Most accumulated work selects only among valid chains, not by a majority-of-nodes vote.',
        'Unchanged supply does not make majority hash power harmless or honest: it can censor, reorganize confirmations and double-spend the attacker’s own payments. It cannot supply other users’ signatures or authorize spending their coins.',
      ],
      fr: [
        'Chaque nœud complet vérifie indépendamment la validité, dont une coinbase ne dépassant pas la subvention autorisée plus les frais. Une émission excessive est rejetée même avec une preuve de travail valide ; elle ne provoque pas automatiquement un mauvais hash. Le travail accumulé départage seulement les chaînes valides, sans vote majoritaire des nœuds.',
        'Une offre inchangée ne rend pas la majorité de calcul inoffensive ou honnête : elle peut censurer, réorganiser les confirmations et doubler les propres paiements de l’attaquant. Elle ne fournit ni les signatures des autres ni le droit de dépenser leurs fonds.',
      ],
    },
    neverClaim: {
      en: ['that pool shares are block proof of work, a node-count vote defeats valid greater work, or attack timing or success is guaranteed'],
      fr: ['que les shares d’un pool sont la preuve de travail du bloc, qu’un vote de nœuds défait davantage de travail valide ou que délai ou succès d’attaque sont garantis'],
    },
  },
  {
    noteId: 'bip39-passphrase',
    sourceConceptId: 'bip39-passphrase',
    title: 'La passphrase optionnelle',
    additionalSourceTitles: ['The optional passphrase'],
    subject: /\b(?:passphrases?|bip[ -]?39)\b/,
    mustState: {
      en: [
        'BIP39 derives a seed and private keys from the mnemonic plus the exact passphrase. Every passphrase, including an empty one, gives a valid result; opening without an error does not validate the original choice. The words alone are insufficient for the same protected wallet.',
        'A BIP39 passphrase changes key derivation. A device PIN or local app password controls access to a device or app; resetting that access does not recreate a forgotten BIP39 passphrase.',
        'A zero or empty display alone establishes neither a different wallet nor a correct passphrase, loss or continued presence of funds. Possible causes include a different passphrase, derivation path, account, network or incomplete synchronization; do not select one without evidence.',
        'Compare known public wallet details, such as a previously used address, locally with compatible recovery settings and synchronization. Never request the words or passphrase.',
        'BIP39 has no passphrase reset or guaranteed recovery. Feasibility depends on what is still known and the secret’s strength; checking a limited set of known candidates can sometimes help, but do not promise success or declare all recovery mathematically impossible.',
      ],
      fr: [
        'BIP39 dérive seed et clés privées avec les mots et la passphrase exacte. Toute passphrase, même vide, donne un résultat valide ; l’absence d’erreur ne valide pas le choix initial. Les mots seuls ne suffisent pas pour le même portefeuille protégé.',
        'La passphrase BIP39 modifie la dérivation des clés. Un PIN d’appareil ou mot de passe local d’application contrôle un accès ; réinitialiser cet accès ne recrée pas une passphrase BIP39 oubliée.',
        'Un affichage vide ou nul ne prouve à lui seul ni portefeuille différent, ni passphrase correcte, ni perte ou présence des fonds. Causes possibles : autre passphrase, chemin de dérivation, compte, réseau ou synchronisation incomplète ; ne pas en retenir une sans preuve.',
        'Comparer localement des repères publics connus, comme une adresse déjà utilisée, avec les paramètres de restauration compatibles et la synchronisation. Ne jamais demander mots ou passphrase.',
        'BIP39 ne prévoit ni réinitialisation de passphrase ni récupération garantie. La faisabilité dépend des éléments encore connus et de la robustesse du secret ; vérifier un ensemble limité de candidats connus peut parfois aider, sans promettre le succès ni déclarer toute récupération mathématiquement impossible.',
      ],
    },
    neverClaim: {
      en: ['that BIP39 passphrases decrypt an archive, or that restoring without one produces only public keys'],
      fr: ['que la passphrase BIP39 déchiffre une archive, ou que son absence ne produit que des clés publiques'],
    },
  },
  {
    noteId: 'lightning-liquidity-path',
    sourceConceptId: 'lightning-liquidity-path',
    title: 'Liquidité et chemins de paiement Lightning',
    additionalSourceTitles: ['Lightning liquidity and payment paths', 'La capacité de réception', 'Receiving capacity'],
    subject: /\b(?:lightning|liquidit\w*|channels?|canal|canaux)\b/,
    // BOLT 11's requested amount and BOLT 4's per-hop forwarding amounts
    // distinguish receiving capacity from sender-funded routing fees:
    // https://github.com/lightning/bolts/blob/master/11-payment-encoding.md
    // https://github.com/lightning/bolts/blob/master/04-onion-routing.md
    mustState: {
      en: [
        'Channel capacity is a monetary amount of bitcoin, measured in BTC or sats, not data volume. Separate total channel capacity from local and remote balances. Funding a fresh channel yourself mainly supplies local balance for sending; receiving needs usable balance on the peer’s side.',
        'A settled outgoing payment through that channel moves value from the local to the remote side, and can increase incoming capacity. It does not generally reduce incoming capacity merely because local balance fell.',
        'Extra incoming capacity does not guarantee that any sender can route a future payment. Liquidity along the route, reserves and HTLC limits constrain success, not an unpredictable net amount. A successful ordinary fixed-amount invoice payment delivers the requested amount; routing fees are normally paid by the sender, not deducted from that amount. If the route cannot carry it, the payment can fail. Do not invent a minimum route length or diagnose actual balances.',
      ],
      fr: [
        'La capacité du canal est un montant de bitcoins, en BTC ou sats, pas un volume de données. Distingue capacité totale, solde local et solde distant. Financer seul un canal apporte surtout un solde local pour envoyer ; recevoir exige un solde utilisable du côté du pair.',
        'Un paiement sortant réglé par ce canal déplace de la valeur du côté local vers le côté distant et peut augmenter la capacité entrante. La baisse du solde local ne signifie donc pas une baisse de capacité entrante.',
        'Plus de capacité entrante ne garantit pas que tout expéditeur puisse acheminer un futur paiement. Liquidité du chemin, réserves et limites HTLC conditionnent la réussite, pas un montant net imprévisible. Un paiement ordinaire réussi de facture à montant fixé livre le montant demandé ; les frais de routage sont normalement payés par l’expéditeur, pas retranchés de ce montant. Si le chemin ne peut le porter, le paiement peut échouer. Ne pas inventer de longueur minimale de route ni présumer les soldes réels.',
      ],
    },
    neverClaim: {
      en: ['that channel capacity and receivable balance are identical, or that any sender can necessarily route the same amount back'],
      fr: ['que capacité totale et montant recevable sont identiques, ou que tout expéditeur peut forcément renvoyer la même somme'],
    },
  },
  {
    noteId: 'lnd-channel-recovery',
    sourceConceptId: 'lightning-node-backup',
    title: 'Les sauvegardes Lightning',
    additionalSourceTitles: ['Lightning backups'],
    subject: /\b(?:lnd|aezeed|scb)\b/,
    mustState: {
      en: [
        'LND’s seed restores wallet keys, not the latest live channel state. A static channel backup (SCB) requires the appropriate keys; neither the seed alone nor merely reconnecting peers reopens channels unchanged.',
        'Standard SCB recovery uses saved channel and peer information to request peer-assisted force closures and recover funds on-chain, not resume routing from a balance snapshot. Peer availability, valid recovery data, confirmations and applicable timelocks affect recovery and spendability; neither success nor immediate access is guaranteed.',
        'Do not restore an outdated channel.db as if it were current. Follow recovery documentation for the actual LND version; never ask for the seed, keys or private backup files.',
      ],
      fr: [
        'La seed LND restaure les clés, pas le dernier état actif des canaux. Une sauvegarde statique (SCB) exige les clés appropriées ; ni la seed seule ni une simple reconnexion aux pairs ne rouvrent les canaux à l’identique.',
        'La récupération standard par SCB utilise les informations sauvegardées pour demander des fermetures forcées avec les pairs et récupérer on-chain, pas reprendre le routage depuis une copie des soldes. Disponibilité des pairs, données valides, confirmations et timelocks conditionnent récupération et dépense ; ni succès ni accès immédiat ne sont garantis.',
        'Ne traite pas une ancienne channel.db comme un état actuel. Suivre la documentation de récupération de la version LND utilisée ; ne jamais demander seed, clés ou fichiers privés de sauvegarde.',
      ],
    },
    neverClaim: {
      en: ['that an SCB replaces lost keys or guarantees intact channels and immediate routing'],
      fr: ['qu’une SCB remplace les clés perdues ou garantit des canaux intacts et le routage immédiat'],
    },
  },
  {
    noteId: 'lightning-payment-privacy',
    sourceConceptId: 'lightning-privacy-tradeoff',
    title: 'La confidentialité sur Lightning',
    additionalSourceTitles: ['Privacy on Lightning'],
    subject: /^(?=[\s\S]*\blightning\b)(?=[\s\S]*\b(?:privacy|confidential\w*|anonym\w*|identit\w*|trac\w*)\b)/,
    mustState: {
      en: [
        'Individual Lightning payments normally stay off-chain, but channel opening and closure are on-chain transactions, and an announced channel links its funding output to a node key. That can help correlation but does not by itself reveal a real-world identity. Self-custody and off-chain payments do not guarantee anonymity.',
        'Onion routing normally limits a forwarding node to adjacent peers and local HTLC amounts and deadlines, not the full route in plaintext. Direct or short routes and observations at several points can permit inferences or correlation.',
        'The shop can link a received payment to its order or customer account. Do not claim it automatically sees a payer’s on-chain sending address, real-world identity or complete history. Visibility depends on the route, wallet and services; no generic Tor or mixing suggestion guarantees anonymity.',
      ],
      fr: [
        'Les paiements Lightning individuels restent normalement hors chaîne, mais ouverture et fermeture de canal sont des transactions on-chain, et un canal annoncé relie sa sortie de financement à la clé d’un nœud. Cela peut aider des rapprochements sans révéler à lui seul une identité civile. Autogarde et paiements off-chain ne garantissent pas l’anonymat.',
        'Le routage onion limite normalement un relais aux pairs voisins et aux montants et échéances HTLC locaux, pas à toute la route en clair. Routes courtes ou directes et observations en plusieurs points peuvent permettre inférences et corrélations.',
        'Le marchand peut relier un paiement reçu à sa commande ou à un compte client. Ne prétends pas qu’il voit automatiquement l’adresse d’envoi on-chain, l’identité civile ou tout l’historique du payeur. Cela dépend du trajet, du portefeuille et des services ; évoquer Tor ou un mélange ne garantit pas l’anonymat.',
      ],
    },
    neverClaim: {
      en: ['that every routing node automatically sees the sender, recipient and complete route', 'that opening or closing a channel by itself reveals the user’s real-world identity'],
      fr: ['que tout relais voit automatiquement l’expéditeur, le destinataire et la route complète', 'qu’ouvrir ou fermer un canal révèle à lui seul l’identité civile de l’utilisateur'],
    },
  },
  {
    noteId: 'lightning-invoice-contents',
    sourceConceptId: 'lightning-invoice',
    title: 'Les factures Lightning',
    additionalSourceTitles: ['Lightning invoices'],
    subject: /^(?=[\s\S]*\b(?:bolt[ -]?11|invoices?|factur\w*)\b)(?=[\s\S]*\b(?:decod\w*|encod\w*|encrypt\w*|chiffr\w*|reveal\w*|revel\w*|disclos\w*|random|aleatoire|privacy|confidential\w*|publi\w*|post\w*|fields?|champs?|payee|payment hash|hash de paiement|route hints?|routing hints?|hints?|indices? de routage|blank\w*|redact\w*|hid(?:e|ing|den)|mask\w*|masqu\w*|edit\w*|modif\w*|retouch\w*)\b)/,
    mustState: {
      en: [
        'BOLT11 is encoded, not encrypted: anyone with the invoice can decode it. An amount-bearing invoice reveals its encoded amount; timestamp, expiry, description or description hash and optional route hints may also be visible.',
        'The payee node public key is explicit in the n field or recovered from the signature. It is NOT the payment hash (p field), which identifies a payment condition, and neither field is an on-chain receiving address.',
        'A node public key is not proof of a person’s real-world identity. Publishing an invoice can enable correlation but does not itself reveal private keys, a seed or the complete purchase history.',
        'Route hints are optional: they help reach the payee, often through unannounced channels they can expose, and do not show the path the payment will take. Any edit breaks the checksum and signature, so a partly hidden invoice cannot be paid.',
      ],
      fr: [
        'BOLT11 est encodé, pas chiffré : quiconque possède la facture peut la décoder. Une facture avec montant révèle ce montant ; horodatage, expiration, description ou son hash et indices de routage facultatifs peuvent aussi être visibles.',
        'La clé publique du nœud destinataire figure dans le champ n ou se récupère depuis la signature. Ce n’est PAS le hash de paiement (champ p), qui identifie une condition de paiement ; aucun de ces champs n’est une adresse de réception on-chain.',
        'Une clé publique de nœud ne prouve pas une identité civile. Publier une facture peut permettre des rapprochements, sans révéler en soi clés privées, seed ou historique complet des achats.',
        'Les indices de routage sont facultatifs : ils aident à joindre le destinataire, souvent par des canaux non annoncés qu’ils peuvent révéler, et ne montrent pas le trajet du paiement. Toute retouche casse somme de contrôle et signature : une facture partiellement masquée ne peut plus être payée.',
      ],
    },
    neverClaim: {
      en: ['that the payment hash is the payee public key or that an invoice is encrypted to hide its amount', 'that route hints reveal the payment’s path, or that an edited or partly hidden invoice can still be paid'],
      fr: ['que le hash de paiement est la clé publique du destinataire ou que la facture est chiffrée pour cacher son montant', 'que les indices de routage révèlent le trajet du paiement, ou qu’une facture retouchée ou partiellement masquée reste payable'],
    },
  },
  {
    noteId: 'lightning-invoice',
    sourceConceptId: 'lightning-invoice',
    title: 'Les factures Lightning',
    additionalSourceTitles: ['Lightning invoices'],
    subject: /\b(?:expir\w*|pending|in[ -]flight|en cours|rembours\w*|refund\w*|reess\w*|retry\w*|new invoice|fresh invoice|nouvelle facture)\b/,
    mustState: {
      en: [
        'BOLT11 invoice expiry is not proof that an already initiated payment failed or refunded. An in-flight payment can still settle; invoice expiry and the HTLC settlement deadlines are different.',
        'Distinguish InFlight, Succeeded and Failed using the wallet’s actual payment status. Pending funds may remain committed until settlement or failure resolution; do not promise immediate release or invent its time.',
        'Do not pay a fresh invoice for the same purchase while the original payment is unresolved: both may settle and pay the recipient twice. Check the original outcome and reconcile with the recipient before retrying; a new invoice does not cancel the old payment or move its funds.',
      ],
      fr: [
        'L’expiration BOLT11 ne prouve ni échec ni remboursement d’un paiement déjà lancé. Un paiement en cours peut encore aboutir ; l’expiration de facture et les échéances de règlement des HTLC sont distinctes.',
        'Distingue En cours, Réussi et Échoué à partir de l’état réel du paiement dans le portefeuille. Les fonds peuvent rester engagés jusqu’au règlement ou à la résolution de l’échec ; ne promets ni libération immédiate ni délai inventé.',
        'Ne paie pas une nouvelle facture pour le même achat tant que le premier paiement reste indéterminé : les deux peuvent aboutir et payer deux fois le destinataire. Vérifier le premier résultat et se coordonner avec le destinataire avant de réessayer ; la nouvelle facture n’annule pas l’ancien paiement et ne déplace pas ses fonds.',
      ],
    },
    neverClaim: {
      en: ['that expiry alone instantly refunds an in-flight payment, or that a second invoice locks its new funds into the first payment'],
      fr: ['que l’expiration seule rembourse instantanément un paiement en cours, ou que la seconde facture engage ses nouveaux fonds dans le premier paiement'],
    },
  },
  {
    noteId: 'lightning-revoked-state',
    sourceConceptId: 'secondary-lightning-revocation-key',
    title: 'Réagir à un état de canal révoqué',
    additionalSourceTitles: ['Reacting to a revoked channel state', 'The role of a watchtower', 'Le rôle d’une watchtower'],
    subject: /\b(?:revok\w*|revoqu\w*|old (?:channel )?state|ancien etat|watchtower|fraud\w*)\b/,
    // BOLT 5, revoked transaction close: a timely revocation spend, not a
    // replacement commitment and not an automatic refund after the delay.
    mustState: {
      en: [
        "A revoked commitment can be valid on-chain. The victim’s wallet or configured watchtower uses saved revocation data to confirm a penalty spend before the cheating peer’s delay expires. This spends outputs, without cancelling the commitment. The delay restricts the peer’s spending; it does not expire the transaction’s validity. A newer commitment cannot replace the confirmed one.",
        "Bitcoin does not initiate refunds. A configured wallet or watchtower can react automatically; a manual user action is not always required. It needs the right updates and timely confirmation. Without this, funds may be lost; recovery is not guaranteed and a watchtower supplies no routing liquidity.",
      ],
      fr: [
        "Un engagement révoqué peut être valide on-chain. Le portefeuille de la victime ou sa watchtower utilise les données de révocation sauvegardées pour confirmer une pénalité avant la fin du délai du fraudeur. Elle dépense des sorties sans annuler l’engagement. Le délai limite la dépense du pair, pas la validité de la transaction. Un nouvel engagement ne remplace pas celui confirmé.",
        "Bitcoin ne lance pas de remboursement. Le wallet ou la watchtower configurés peuvent réagir automatiquement, sans action manuelle systématique. Il faut les bonnes données et une confirmation à temps, sinon des fonds peuvent être perdus. La récupération n’est pas garantie ; une watchtower n’apporte pas de liquidité.",
      ],
    },
    neverClaim: {
      en: ['that Bitcoin automatically refunds an old-state dispute or that a watchtower guarantees recovery'],
      fr: ['que Bitcoin rembourse automatiquement un litige sur un ancien état ou qu’une watchtower garantit la récupération'],
    },
  },
  {
    noteId: 'transaction-confirmations',
    sourceConceptId: 'bitcoin-transaction-confirmation',
    title: 'Les confirmations',
    additionalSourceTitles: ['Confirmations'],
    subject: /\b(?:confirm\w*|reorg\w*|finalit\w*)\b/,
    mustState: {
      en: [
        'The transaction is included once, in its containing block (confirmation 1). Six confirmations mean that block plus five blocks built after it; those five do not contain the transaction again.',
        'A reorganization switches branches to the valid chain with most cumulative work, not to a longer individual block. A removed confirmation does not prove refund or theft: the transaction may be unconfirmed, included again, or conflict with a spend of the SAME input outpoint (transaction ID and output index). Address receipts or balances alone do not establish that conflict.',
        'Miners include transactions and nodes validate blocks; the sender does not personally confirm a payment. Check the actual transaction and inputs, without assuming its present status.',
        'More confirmations generally reduce reversal risk under specified assumptions; the risk is not mathematically zero. A reorganization need not require majority hash power. Do not invent safe counts for amounts, numerical probabilities or a universally negligible risk.',
      ],
      fr: [
        'La transaction est incluse une seule fois dans son bloc (confirmation 1). Six confirmations comptent ce bloc puis cinq blocs construits après lui ; ces cinq blocs ne contiennent pas à nouveau la transaction.',
        'Une réorganisation bascule vers la branche valide au travail cumulé le plus élevé, pas vers un bloc individuel plus long. Perdre une confirmation ne prouve ni remboursement ni vol : la transaction peut redevenir non confirmée, être réincluse ou concurrencer une dépense du MÊME outpoint d’entrée (identifiant de transaction et indice de sortie). Réceptions et soldes d’adresse ne prouvent pas ce conflit.',
        'Les mineurs incluent les transactions et les nœuds valident les blocs ; l’expéditeur ne confirme pas personnellement son paiement. Vérifier la transaction et ses entrées sans présumer leur état actuel.',
        'Plus de confirmations réduisent généralement le risque selon les hypothèses, sans le rendre mathématiquement nul. Une réorganisation n’exige pas forcément une majorité de calcul. Ne pas inventer de seuil selon le montant, de probabilité chiffrée ni de risque universellement négligeable.',
      ],
    },
    neverClaim: {
      en: ['an invented institutional confirmation threshold, a numerical reversal probability without its assumptions, or guaranteed reinclusion'],
      fr: ['un seuil institutionnel inventé, une probabilité chiffrée sans ses hypothèses ou une réinclusion garantie'],
    },
  },
  {
    noteId: 'ark-rounds-exits',
    sourceConceptId: 'ark-boarding-offboarding-and-exits',
    title: 'Entrer et sortir d’Ark',
    legacyTitles: ['Ark rounds and exits'],
    additionalSourceTitles: ['Les sorties virtuelles d’Ark'],
    mustState: {
      en: [EXIT_WITHOUT_OPERATOR.en, EXIT_MECHANICS.en, EXPIRY_RULE.en],
      fr: [EXIT_WITHOUT_OPERATOR.fr, EXIT_MECHANICS.fr, EXPIRY_RULE.fr],
    },
    neverClaim: {
      en: [NO_OPERATOR_BLOCK.en, NO_FUNDS_LOST.en, NO_EXPIRY_INVERSION.en, NO_INSTANT_EXIT.en, NO_LAYER_ONE.en],
      fr: [NO_OPERATOR_BLOCK.fr, NO_FUNDS_LOST.fr, NO_EXPIRY_INVERSION.fr, NO_INSTANT_EXIT.fr, NO_LAYER_ONE.fr],
    },
    subject: ARK_SUBJECT,
  },
  {
    noteId: 'asp-operator',
    sourceConceptId: 'ark-security-model',
    title: 'Les hypothèses de sécurité d’Ark',
    legacyTitles: ['Ark operator / ASP'],
    additionalSourceTitles: ['Les paiements avec Ark', 'Ark, Bark et Arkade, comprendre les différences'],
    mustState: {
      en: [OPERATOR_POWERS.en, EXIT_WITHOUT_OPERATOR.en, EXIT_MECHANICS.en, EXPIRY_RULE.en],
      fr: [OPERATOR_POWERS.fr, EXIT_WITHOUT_OPERATOR.fr, EXIT_MECHANICS.fr, EXPIRY_RULE.fr],
    },
    neverClaim: {
      en: [NO_OPERATOR_BLOCK.en, NO_FUNDS_LOST.en, NO_EXPIRY_INVERSION.en, NO_LAYER_ONE.en],
      fr: [NO_OPERATOR_BLOCK.fr, NO_FUNDS_LOST.fr, NO_EXPIRY_INVERSION.fr, NO_LAYER_ONE.fr],
    },
    subject: ARK_SUBJECT,
  },
  {
    noteId: 'multisig',
    sourceConceptId: 'multisig',
    title: 'La signature multiple',
    legacyTitles: ['Bitcoin multisig'],
    mustState: {
      en: [
        'An m-of-n wallet signs with any m of its n keys: a 2-of-3 wallet spends with any two of its three keys. Keep the threshold the user states and never assume a higher one.',
        'A quorum of seeds alone may not rebuild the wallet: the complete configuration or descriptor is needed too, with all cosigner public keys, the threshold, the script policy and the derivation paths.',
        'Verify recovery in a safe test with the wallet documentation, without sending seeds or keys to anyone, including a chat or support agent.',
        'Keep the backups of the seeds and of the descriptor in separate failure domains.',
      ],
      fr: [
        "Un portefeuille m de n signe avec m de ses n clés : un 2 de 3 dépense avec deux clés sur trois, quelles qu'elles soient. Garde le seuil indiqué par l'utilisateur et ne suppose jamais un seuil plus élevé.",
        'Un quorum de seeds seul peut ne pas suffire à reconstruire le portefeuille : il faut aussi la configuration complète ou le descripteur, avec les clés publiques de tous les cosignataires, le seuil, la politique de script et les chemins de dérivation.',
        "Vérifie la récupération par un test sûr avec la documentation du portefeuille, sans envoyer de seed ni de clé à qui que ce soit, y compris à un chat ou à un support.",
        'Conserve les sauvegardes des seeds et du descripteur dans des lieux de défaillance séparés.',
      ],
    },
    neverClaim: {
      en: [
        'that a 2-of-3 wallet needs three signatures or the third seed',
        'that the user\'s wallet is 3-of-3, or any threshold the user did not state',
        'that the seeds alone guarantee recovery',
        'that Alice can import the seeds or rebuild a multisig wallet, or any Alice feature absent from the notes',
      ],
      fr: [
        "qu'un portefeuille 2 de 3 a besoin de trois signatures ou de la troisième seed",
        "que le portefeuille de l'utilisateur est un 3 de 3, ou tout seuil qu'il n'a pas indiqué",
        'que les seeds seules garantissent la récupération',
        "qu'Alice peut importer les seeds ou reconstruire un portefeuille multisig, ou toute fonction d'Alice absente des notes",
      ],
    },
  },
  {
    noteId: 'child-pays-for-parent',
    sourceConceptId: 'child-pays-for-parent',
    title: 'Accélérer avec CPFP',
    legacyTitles: ['Child pays for parent'],
    subject: /\b(?:cpfp|child pays for parent|transaction enfant|child transaction)\b/,
    mustState: {
      en: [
        'CPFP (Child Pays For Parent): a child spends an unconfirmed parent output; a recipient controlling it signs with their own keys, without the sender’s keys. CPFP does not replace the parent or require RBF. Miners rate both: (parent fee + child fee) ÷ (both sizes).',
        'The child pays for both sizes, within the value it spends. Check wallet support and relay/mining package policies; confirmation and timing are not guaranteed. Parent age alone does not invalidate it; a conflicting spend can. Alice App explains but cannot construct or sign real CPFP transactions.',
      ],
      fr: [
        'CPFP (Child Pays For Parent) : un enfant dépense une sortie non confirmée du parent ; le destinataire qui la contrôle signe avec ses clés, sans celles de l’expéditeur. CPFP ne remplace pas le parent et n’exige pas RBF.',
        'Les mineurs évaluent le paquet : (frais parent + frais enfant) ÷ (deux tailles). L’enfant paie aussi la taille du parent, dans la limite de la valeur dépensée.',
        'Vérifier portefeuille et politiques de relais/minage ; ni délai ni confirmation garantis. L’âge seul n’invalide pas le parent ; une dépense concurrente peut invalider les deux. Alice App explique mais ne construit ni ne signe de vrai CPFP.',
      ],
    },
    neverClaim: {
      en: ['that only the original sender can use CPFP, that it guarantees confirmation, or that it requires the parent to signal RBF', 'that Alice App can check keys or prepare the child transaction'],
      fr: ['que seul l’expéditeur peut utiliser CPFP, que la confirmation est garantie ou qu’un signal RBF du parent est nécessaire', 'qu’Alice App peut vérifier des clés ou préparer la transaction enfant'],
    },
  },
  {
    noteId: 'replace-by-fee',
    sourceConceptId: 'replace-by-fee',
    title: 'Augmenter les frais avec RBF',
    legacyTitles: ['Replace-by-fee'],
    mustState: {
      en: [
        'RBF (Replace By Fee) replaces an unconfirmed TRANSACTION spending conflicting inputs, not a block. A replacement is not thereby a CPFP child. It requires authorization for the replacement inputs; controlling a recipient output is insufficient.',
        FULL_RBF.en,
        'Recipient addresses or output amounts need not stay identical. Validity requires total outputs no greater than THIS replacement’s total inputs, not a cap at the original payment amount. Check actual replacement and confirmations; wallet visibility does not guarantee settlement.',
        CONFIRMED_IS_FINAL.en, REPLACEMENT_CONDITIONS.en, NO_SECOND_PAYMENT.en],
      fr: [
        'RBF (Replace By Fee) remplace une TRANSACTION non confirmée dépensant des entrées concurrentes, pas un bloc. Un remplacement n’est pas de ce seul fait un enfant CPFP. Il exige les autorisations des entrées ; contrôler une sortie destinataire ne suffit pas.',
        FULL_RBF.fr,
        'Ni les adresses destinataires ni leurs montants ne sont figés. La somme des sorties doit au plus égaler celle des entrées de CE remplacement, sans plafond au montant payé initialement. Vérifier remplacement et confirmations ; son affichage ne garantit pas le règlement.',
        CONFIRMED_IS_FINAL.fr, REPLACEMENT_CONDITIONS.fr, NO_SECOND_PAYMENT.fr],
    },
    neverClaim: {
      en: [NO_OPT_IN_PRECONDITION.en, NO_SECOND_PAYMENT_REMEDY.en, NO_REVERSAL.en],
      fr: [NO_OPT_IN_PRECONDITION.fr, NO_SECOND_PAYMENT_REMEDY.fr, NO_REVERSAL.fr],
    },
  },
  {
    noteId: 'transaction-finality',
    sourceConceptId: 'bitcoin-finality',
    title: 'La finalité progressive',
    legacyTitles: ['Bitcoin finality'],
    // These are replacement/cancellation rules, not the general explanation
    // of probabilistic finality in the same retrieved note.
    subject: /\b(?:rbf|replac\w*|remplac\w*|cancel\w*|annul\w*|refund\w*|rembours\w*)\b/,
    mustState: {
      en: [CONFIRMED_IS_FINAL.en, REPLACEMENT_CONDITIONS.en, FULL_RBF.en, NO_SECOND_PAYMENT.en],
      fr: [CONFIRMED_IS_FINAL.fr, REPLACEMENT_CONDITIONS.fr, FULL_RBF.fr, NO_SECOND_PAYMENT.fr],
    },
    neverClaim: {
      en: [NO_REVERSAL.en, NO_OPT_IN_PRECONDITION.en, NO_SECOND_PAYMENT_REMEDY.en],
      fr: [NO_REVERSAL.fr, NO_OPT_IN_PRECONDITION.fr, NO_SECOND_PAYMENT_REMEDY.fr],
    },
  },
  {
    // The Private Cloud model accepted a photo in a password manager, a phone
    // note and an encrypted cloud file as seed backups (2026-11-02).
    noteId: 'seed-backup',
    sourceConceptId: 'seed-phrase-backup',
    title: 'Sauvegarder la phrase de récupération',
    additionalSourceTitles: ['La phrase de récupération'],
    mustState: {
      en: [SEED_MEDIUM.en, SEED_COPIES.en, SEED_RESTORE_TEST.en],
      fr: [SEED_MEDIUM.fr, SEED_COPIES.fr, SEED_RESTORE_TEST.fr],
    },
    neverClaim: {
      en: [
        'that a photo, a screenshot, a cloud file, a note or a password manager is an acceptable place for the phrase, even encrypted',
        'that a single copy, or a copy kept with the device, is enough',
        'that a support agent, a website or Alice needs the phrase to help',
      ],
      fr: [
        "qu'une photo, une capture d'écran, un fichier dans le cloud, une note ou un gestionnaire de mots de passe convient pour la phrase, même chiffré",
        "qu'une seule copie, ou une copie rangée avec l'appareil, suffit",
        "qu'un support, un site ou Alice a besoin de la phrase pour aider",
      ],
    },
  },
  {
    noteId: 'transaction-inputs-outputs',
    sourceConceptId: 'bitcoin-transaction-output',
    additionalSourceConceptIds: ['change-output', 'change-privacy-linking'],
    title: 'Les sorties d’une transaction',
    additionalSourceTitles: ['The outputs of a transaction', 'Les entrées d’une transaction', 'The inputs of a transaction', 'Understanding UTXOs', 'Comprendre les UTXO'],
    subject: /\b(?:inputs?|outputs?|entrees?|sorties?|change|monnaie|utxos?|pieces?|coins?)\b/,
    mustState: {
      en: [
        "UTXO means Unspent Transaction Output. The blockchain retains transaction history; the UTXO set is the current view of unspent outputs. Applying a valid transaction consumes each input's old output in full and creates new outputs. Signing only authorizes spending. In a database analogy, distinguish retained history from this current view: no historical deletion or partial consumption.",
        "Accounting: sum(inputs) = sum(outputs) + fee. Outputs include payment and change; for one payment, change = inputs - payment - fee. Fees are not an output or a coinbase input: the miner claims them through outputs of a separate coinbase transaction. The remainder after payment can become change and fees. Without supplied amounts, explain the relation without inventing numbers.",
        "Signatures authorize spending, not ownership labels on new outputs. Scripts specify spending conditions, not personal identity. Amounts, output order and spending patterns are only clues, even with one input. An explorer traces public transactions; independent ownership information is needed to establish who owns an output or identify change with certainty.",
      ],
      fr: [
        "UTXO signifie Unspent Transaction Output, sortie non dépensée. La blockchain conserve l’historique ; l’ensemble UTXO est la vue actuelle des sorties non dépensées. Appliquer une transaction valide consomme entièrement les anciennes sorties et crée les nouvelles. Signer autorise seulement la dépense. Dans une analogie de base de données, distingue historique et vue actuelle : ni effacement historique ni consommation partielle.",
        "Comptabilité : total entrées = total sorties + frais. Les sorties comprennent paiement et monnaie ; pour un paiement, monnaie = entrées - paiement - frais. Les frais ne sont pas une sortie. Le mineur les réclame via les sorties d’une transaction coinbase distincte, pas une entrée du paiement. Le reste après paiement se répartit entre monnaie et frais. Sans montants fournis, explique la relation sans inventer de chiffres.",
        "Les signatures autorisent la dépense sans étiqueter les propriétaires des nouvelles sorties. Les scripts définissent des conditions de dépense, pas une identité. Montants, ordre et schémas de dépense sont seulement des indices, même avec une entrée. Un explorateur suit les transactions publiques ; il faut des informations indépendantes sur la propriété pour identifier un propriétaire ou la monnaie avec certitude.",
      ],
    },
    neverClaim: {
      en: ['that the outputs equal the inputs plus the fee, or that signatures or output order reveal the change'],
      fr: ['que les sorties valent les entrées plus les frais, ou que les signatures ou l’ordre des sorties révèlent la monnaie'],
    },
  },
  {
    noteId: 'transaction-fees',
    sourceConceptId: 'transaction-fees',
    title: 'Les frais de transaction',
    subject: /\b(?:fees?|frais|cout\w*|cost\w*)\b/,
    mustState: {
      en: [
        'Fee = virtual size in vB times fee rate in sat/vB, not a percentage of the amount. Input/output count and script types affect size; demand for block space affects the rate. Check the wallet estimate.',
        'An unchanged transaction does not accumulate fees while waiting. A higher fee requires a new spending action, such as a replacement.',
      ],
      fr: [
        'Frais = taille virtuelle en vB multipliée par le taux en sat/vB, pas un pourcentage du montant. Le nombre et le type des entrées/sorties déterminent la taille ; la demande d’espace de bloc influence le taux. Consulte l’estimation du portefeuille.',
        'vB signifie octet virtuel. Une transaction inchangée n’accumule pas de frais en attendant ; une hausse demande une nouvelle action, comme un remplacement.',
      ],
    },
    neverClaim: {
      en: ['that waiting automatically raises a transaction’s fee, or that a fee rate is a live value without a source'],
      fr: ['que l’attente augmente automatiquement les frais, ou qu’un taux fictif est le taux actuel'],
    },
  },
  {
    noteId: 'dust',
    sourceConceptId: 'dust',
    title: 'Le dust et les sorties non rentables',
    subject: /\b(?:dust|non rentable|uneconomic|tiny|petit\w*|small|sats?)\b/,
    mustState: {
      en: [
        'Distinguish the dust relay policy for creating outputs from the wallet’s economic decision to spend an existing output. Spending adds an input; its cost depends on script type and fee rate, with no universal threshold.',
        'Consolidation shares transaction overhead but still pays for every input. If an input alone costs more than its value, grouping it with others does not remove that loss. A lower fee rate may help, without a guarantee.',
      ],
      fr: [
        'Distingue la politique de relais du dust, à la création des sorties, du jugement économique du portefeuille à leur dépense. Chaque sortie dépensée ajoute une entrée ; son coût dépend du script et du taux de frais, sans seuil universel.',
        'La consolidation partage les frais fixes mais paie toujours chaque entrée. Si une entrée coûte à elle seule plus que sa valeur, la regrouper ne supprime pas cette perte. Un taux plus bas peut aider, sans garantie. vB signifie octet virtuel.',
      ],
    },
    neverClaim: {
      en: ['that consolidation removes input fees or guarantees a loss-free spend'],
      fr: ['que la consolidation supprime les frais des entrées ou garantit une dépense sans perte'],
    },
  },
];

const ARK_NOTES = ['ark-rounds-exits', 'asp-operator'] as const;
// A Dictionnaire de Bitcoin definition reaches the model as a Learn excerpt
// headed by its label (knowledge-context-budget.ts), not as a "Topic:" note.
// The Private Cloud model called Ark "a layer-1 scaling protocol" with the
// definition, which says the opposite, in front of it (2026-10-30).
const DICTIONARY_NOTE_LINES: readonly { noteId: string; line: RegExp; subject?: RegExp }[] = [
  { noteId: 'dictionary-ark', line: /^Dictionnaire de Bitcoin · ARK\b/m, subject: ARK_SUBJECT },
];
const SEED_NOTES = ['seed-backup'] as const;
const ARK_LAYER_NOTES = [...ARK_NOTES, 'dictionary-ark'] as const;
const RBF_NOTES = ['replace-by-fee', 'transaction-finality'] as const;

const ARK_EXIT_CORRECTION: Localized = {
  en: "Correction: with valid exit data and enough time to complete the exit before expiry, a unilateral exit requires no operator approval. The wallet must publish the required transactions and allow for fees, confirmations and timelocks. The operator stopping cooperation alone does not remove this path. After expiry, or without the necessary data or time, recovery is not guaranteed and may depend on the operator. VTXO type and implementation matter, including the temporary non-collusion assumption for arkoor transfers.",
  fr: "Correction : avec les données valides et assez de temps pour achever la sortie avant expiration, une sortie unilatérale ne demande pas l’accord de l’opérateur. Le wallet doit publier les transactions et prévoir frais, confirmations et timelocks. Le seul arrêt de coopération ne supprime pas ce chemin. Après expiration, ou sans les données ou le temps nécessaires, la récupération n’est pas garantie et peut dépendre de l’opérateur. Le type de VTXO et l’implémentation comptent, notamment l’hypothèse temporaire de non-collusion pour les transferts arkoor.",
};
const ARK_LAYER_CORRECTION: Localized = {
  en: 'Correction: Ark is not a layer 1 or a base-layer protocol. It is built on top of Bitcoin, like Lightning: its rounds are anchored in ordinary Bitcoin transactions, and the VTXOs it moves live off-chain between those rounds.',
  fr: "Correction : Ark n'est pas une couche 1 ni un protocole de la couche de base. Il est construit par-dessus Bitcoin, comme Lightning : ses rounds sont ancrés dans des transactions Bitcoin ordinaires, et les VTXO qu'il déplace vivent hors chaîne entre ces rounds.",
};
const ARK_EXPIRY_CORRECTION: Localized = {
  en: "Correction: expiry does not unlock unilateral recovery. The vTXO must be renewed, or its exit fully confirmed, before the applicable deadline. After expiry recovery depends on the operator’s cooperation; without it, funds can be lost. Check the wallet and server version for exact timings.",
  fr: "Correction : l’expiration ne débloque pas une récupération unilatérale. Le VTXO doit être renouvelé, ou sa sortie entièrement confirmée, avant l’échéance applicable. Après expiration, la récupération dépend de la coopération de l’opérateur ; sans elle, les fonds peuvent être perdus. Vérifie les délais exacts du wallet et de la version du serveur.",
};
const MULTISIG_QUORUM_CORRECTION: Localized = {
  en: 'Correction: a multisig wallet spends with its threshold of keys, not with all of them: a 2-of-3 wallet signs with any two of its three keys, and a third signature or seed is not required. Do not assume a higher threshold than the one your wallet was set up with. Two seeds alone may still not rebuild the wallet without its complete configuration or descriptor (all cosigner public keys, threshold, script policy and derivation paths), so check that backup and test the recovery safely, without sending seeds or keys to anyone.',
  fr: "Correction : un portefeuille multisig dépense avec son seuil de clés, pas avec toutes : un 2 de 3 signe avec deux clés sur trois, quelles qu'elles soient, et une troisième signature ou seed n'est pas requise. Ne suppose pas un seuil plus élevé que celui avec lequel ton portefeuille a été créé. Deux seeds seules peuvent toutefois ne pas suffire à reconstruire le portefeuille sans sa configuration complète ou son descripteur (clés publiques de tous les cosignataires, seuil, politique de script, chemins de dérivation) : vérifie cette sauvegarde et teste la récupération sans envoyer tes seeds ni tes clés à qui que ce soit.",
};
const MULTISIG_ALICE_CORRECTION: Localized = {
  en: 'Note: nothing in the notes available here describes a multisig import or restore feature in Alice. Follow the documentation of the wallet that created the multisig, and never send seeds or keys to anyone.',
  fr: "Précision : rien dans les notes disponibles ici ne décrit une fonction d'import ou de restauration multisig dans Alice. Suis la documentation du portefeuille qui a créé le multisig, et n'envoie jamais tes seeds ni tes clés à qui que ce soit.",
};
const RBF_OPT_IN_CORRECTION: Localized = {
  en: 'Correction: a replacement does not require that RBF was enabled or signaled when the payment was sent. Nodes and miners applying full-RBF, the default in Bitcoin Core since version 28.0, also accept a replacement of a transaction that did not signal it; signaling improves predictability, it is not a precondition everywhere. Whether a replacement can be attempted depends on your wallet and on node policies, and it is never guaranteed.',
  fr: "Correction : le remplacement n'exige pas que l'option RBF ait été activée ou signalée à l'envoi. Les nœuds et mineurs qui appliquent le full-RBF, comportement par défaut de Bitcoin Core depuis la version 28.0, acceptent aussi le remplacement d'une transaction qui ne l'a pas signalé ; le signal améliore la prévisibilité, ce n'est pas une condition partout. La possibilité de tenter un remplacement dépend de ton portefeuille et des politiques des nœuds, et elle n'est jamais garantie.",
};
const RBF_SECOND_PAYMENT_CORRECTION: Localized = {
  en: 'Correction: a second independent payment is not a way to fix or speed up the first one. If the original confirms, both payments go through and the recipient is paid twice. Only a replacement that spends the same inputs, built and verified in your wallet, can take the place of an unconfirmed transaction.',
  fr: "Correction : un second paiement indépendant ne corrige pas et n'accélère pas le premier. Si la transaction d'origine se confirme, les deux paiements passent et le destinataire est payé deux fois. Seul un remplacement qui dépense les mêmes entrées, construit et vérifié dans ton portefeuille, peut prendre la place d'une transaction non confirmée.",
};
const SEED_DIGITAL_COPY_CORRECTION: Localized = {
  en: 'Correction: a recovery phrase is never kept as a photo, in the cloud, in a note, in an email or in a password manager, even encrypted: a connected device can be compromised, and one exposed phrase gives access to all the funds. Write it by hand on paper or stamp it on metal, keep several copies in separate places, and check with a restore test that the backup works.',
  fr: "Correction : une phrase de récupération ne se garde ni en photo, ni dans le cloud, ni dans une note, ni dans un e-mail, ni dans un gestionnaire de mots de passe, même chiffré : un appareil connecté peut être compromis, et une phrase exposée donne accès à tous les fonds. Écris-la à la main sur papier ou grave-la sur métal, conserve plusieurs copies dans des lieux séparés, et vérifie par un test de restauration que la sauvegarde fonctionne.",
};

// All patterns run on normalized sentences: lowercase, accents stripped,
// typographic quotes and hyphens folded, so "opérateur", "2‑of‑3" and
// "n’était" match their plain forms.
const BLOCKING_VERB = String.raw`(?:block(?:s|ing|ed)?|lock(?:s|ing|ed)?|freez(?:e|es|ing)|froze|prevent(?:s|ing|ed)?|refus(?:e|es|ing|ed|er)|den(?:y|ies|ying|ied)|veto(?:es|ed)?|stop(?:s|ping|ped)? you from|keep(?:s|ing)? you from|bloqu(?:e|er|ent|ant|era)|empech(?:e|er|ent|ant|era)|gel(?:e|er|ent)|verrouill(?:e|er|ent)|interdi(?:t|re|sent)|retien(?:t|nent)|retenir)`;
const EXIT_NOUN = String.raw`(?:exit(?:s|ing)?|withdraw(?:al|als|ing)?|leave|leaving|get(?:ting)? (?:your |the )?(?:funds|coins|money|bitcoins?) (?:out|back)|sortie|sorties|sortir|retrait|retirer|recuperer|quitter)`;
const OPERATOR = String.raw`(?:operator|operators|asp|server|provider|operateur|operateurs|serveur|fournisseur|it|they|il|elle|ils)`;
// A question, a sentence that opens on a quoted claim, or a refutation wording.
const REFUTATION = /\?$|^"[^"]*"|\b(?:myth|mythe|mythes|faux|fausse|false|untrue|not true|not the case|ce qui est faux|idee recue|idees recues|on entend (?:souvent |parfois )?dire|people (?:fear|think|believe|say|assume)|contrary to|contrairement a|misconception|wrongly|a tort)\b/;
// A quorum of three or more keys names another wallet than a 2-of-3.
const HIGH_M = String.raw`(?:[3-9]|\d{2,}|three|trois|four|quatre|five|cinq|six|seven|sept|eight|huit|nine|neuf)`;
const ANY_N = String.raw`(?:\d+|three|trois|four|quatre|five|cinq|six|seven|sept|eight|huit|nine|neuf)`;
const N_ABOVE_THREE = String.raw`(?:[4-9]|\d{2,}|four|quatre|five|cinq|six|seven|sept|eight|huit|nine|neuf)`;
// A contracted negation is part of its verb ("doesn't"), so it is matched as
// a word ending in n't rather than as a separate word.
const NEGATION = String.raw`(?:not|never|no|\w*n't|cannot|can ?not|nor can|neither|nor|unable|without being able|ne|n'|jamais|aucun|aucune|ni|pas|non)`;


const ARK_EXIT_LIMITATION = /\b(?:(?:after|past) (?:its |the |a |vtxo )*(?:expiry|expiration|deadline)|apres (?:son |leur |l'|la |une )?(?:expiration|echeance)|(?:missing|lost|without) (?:the |valid )?(?:exit data|backup)|sans (?:les |des )?donnees de sortie|(?:insufficient|not enough) time|temps insuffisant|(?:before|avant)[^.!?]{0,45}(?:cannot|can't|ne peut pas|impossible)[^.!?]{0,45}(?:confirm|confirmer)|collusion)\b/;
const ARK_LIMITED_SENTENCE = new RegExp(`${REFUTATION.source}|${ARK_EXIT_LIMITATION.source}`);
const COOPERATIVE_EXPIRY_RECOVERY = /\b(?:with (?:the )?operator(?:'s)? cooperation|depends? on (?:the )?operator|requires? (?:the )?operator|avec (?:la cooperation|l'aide|l'accord) de l'operateur|depend de (?:la cooperation|l'operateur)|necessite (?:la cooperation|l'accord) de l'operateur)\b/;

const LAYER_ONE = String.raw`(?:layer[- ]?(?:1|one)|base[- ]layer|first[- ]layer|couche (?:1|une|de base)|premiere couche)`;

// A digital copy of the phrase: the media the reviewed answers accepted, plus
// their neighbours. "note" only in a composed form, since it is also a verb.
const DIGITAL_COPY = String.raw`(?:photos?|photograph|screenshots?|captures? d'ecran|picture|image|scan|cloud|icloud|google drive|drive|dropbox|onedrive|password managers?|gestionnaires? de mots de passe|gestionnaire|notes? app|apple notes|google keep|note (?:on|in) (?:your|the|my) phone|note (?:sur|dans) (?:ton|votre|le|mon) telephone|phone notes?|notes? chiffrees?|encrypted notes?|notes? numeriques?|digital notes?|e-?mail|courriel|encrypted files?|fichiers? chiffres?|text files?|fichiers? textes?|pdf|digital (?:copy|copies|backups?)|copies? numeriques?|sauvegardes? numeriques?|usb (?:stick|key|drive)|cle usb)`;
const STORE_VERB = String.raw`(?:keep|keeping|store|storing|save|saving|back(?:ing)? up|put|putting|upload|uploading|write|writing|type|typing|photograph|take a (?:photo|picture|screenshot)|garder|stocker|conserver|enregistrer|sauvegarder|mettre|noter|copier|photographier|prendre (?:une photo|en photo)|deposer|ranger)`;
const ACCEPTABLE = String.raw`(?:fine|ok|okay|safe|secure|acceptable|reasonable|sufficient|enough|a (?:good|reasonable|valid|safe|secure|solid|sensible|convenient) (?:option|backup|choice|solution|idea|way|place)|better than nothing|raisonnable|suffisant|suffisante|suffit|suffisent|convient|conviennent|securisee?|une (?:bonne|excellente) (?:option|sauvegarde|solution|idee|alternative|pratique)|un bon (?:choix|moyen|compromis)|mieux que rien)`;
// A password manager praised for passwords, not for the phrase.
const FOR_PASSWORDS = String.raw`\b(?:for (?:your |the |other )?(?:\w+ )?(?:passwords|accounts|logins)|pour (?:tes |vos |les |d'autres )?(?:\w+ )?(?:mots de passe|comptes|identifiants))\b`;

// Only concrete wallet operations are checked here. Reading an address/xpub,
// explaining an exit or practising with test coins are real App capabilities.
const APP_REFERENCE = String.raw`(?:alice app|(?:in|into|with|using|dans|avec|sur) (?:the |l'app |l'application |the app )?alice(?! wallet\b))`;
const UNSUPPORTED_OPERATION = String.raw`(?:(?:launch|start|execute|perform|lancer|lance|lancez|effectuer|effectue|executer|execute) (?:an? |une? |your |votre |ta |ton )?(?:ark |arkade )?(?:unilateral exit|sortie unilaterale)|(?:bump|replace|accelerer|remplacer) (?:your |the |votre |ta |la )?(?:transaction|payment|paiement)(?: with rbf| par rbf| via rbf)|(?:send|spend|sign|envoyer|envoyez|depenser|depensez|signer|signez) (?:your |the |vos |tes |de |des |du )?(?:real (?:bitcoin|funds|coins)|vrais bitcoins|fonds reels))`;

// A reward can contain a newly issued subsidy AND fees without calling the
// fees new issuance. Require that composition subject immediately before the
// match and an explicit subsidy component, not just "reward" anywhere nearby.
const REWARD_SUBSIDY_COMPONENT = {
  prefix: /\b(?:(?:reward|remuneration|coinbase(?: outputs?| value)?)\s+(?:includes?|combines?|contains?|comprises?|consists? of)|miner\s+(?:may|can)\s+(?:claim|receive)|(?:recompense|remuneration|coinbase)\s+(?:comprend|combine|contient|inclut)|mineur\s+peut\s+(?:reclamer|recevoir))\s+(?:both |des |de )?$/,
  claim: /^(?:(?:new (?:bitcoins?|coins|money)|newly (?:issued|created|minted) (?:bitcoins?|coins))\s+(?:from |provided by |created by |\()(?:the )?(?:block )?subsidy\)?\s+(?:plus|and)\s+(?:the )?(?:transaction )?fees|(?:nouveaux bitcoins|bitcoins nouvellement (?:emis|crees))\s+(?:issus de |provenant de |de |\()(?:la )?subvention\)?\s+(?:plus|et)\s+(?:les )?frais)$/,
};

export const NEVER_CLAIM_CHECKS: readonly NeverClaimCheck[] = [
  {
    // BOLT 7 permits forwarding fees, including zero policies/direct payments.
    id: 'lightning-unqualified-free-payments', notes: ['lightning-payment-mechanics'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\bpaiements?\s+(?:lightning\s+)?(?:(?:sont|est)\s+)?(?:rapides?\s+et\s+)?gratuits?\b/,
        unless: /\b(?:pas|jamais|peuvent|peut|parfois|direct\w*|taux nul|frais nuls|si|hypothe\w*)\b|\?$/ },
      { test: /\b(?:lightning\s+)?payments?\s+(?:(?:are|is)\s+)?(?:fast\s+and\s+)?free\b/,
        unless: /\b(?:not|never|can|may|sometimes|direct|zero.fee|if|hypothetical)\b|\?$/ },
    ],
    correction: {
      en: 'Correction: Lightning forwarding nodes can charge routing fees. A direct payment or zero-fee route may have no forwarding fee, but a routed payment is not guaranteed to be free. Keeping channels open avoids a separate on-chain transaction for each payment; it does not eliminate all fees.',
      fr: 'Correction : les intermédiaires Lightning peuvent facturer des frais de routage. Un paiement direct ou un chemin à frais nuls peut ne pas avoir de frais de routage, mais rien ne garantit qu’un paiement routé soit gratuit. Garder les canaux ouverts évite une transaction on-chain par paiement, pas tous les frais.',
    },
  },
  {
    // BOLT 5 distinguishes mutual close from unilateral commitment publication.
    id: 'lightning-closure-requires-both', notes: ['lightning-payment-mechanics'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\bcanal\s+(?:se ferme (?:uniquement|seulement)|ne (?:se ferme|peut (?:se )?fermer) que)\s+(?:lorsque|quand|si)\s+les deux (?:parties|pairs)\b[^.!?;]{0,50}\b(?:decident|acceptent|cooperent|accord)\b/,
        unless: /\b(?:cooperati\w*|pas seulement|pas uniquement|pas que|pas necessairement)\b|\?$/ },
      { test: /\bchannel\s+(?:can only (?:close|be closed)|only closes|closes only|is only closed)\s+(?:when|if)\s+both (?:parties|peers)\b[^.!?;]{0,35}\b(?:agree|cooperate|decide)\b/,
        unless: /\b(?:cooperative|mutual|not only|not necessarily)\b|\?$/ },
    ],
    correction: {
      en: 'Correction: mutual closing needs agreement, but either party can instead publish its commitment transaction unilaterally. A normal payment can settle with channels still open. Closing is a separate on-chain operation; fees and delays depend on the outputs and situation.',
      fr: 'Correction : la fermeture coopérative demande un accord, mais un seul pair peut publier son engagement pour fermer unilatéralement. Un paiement ordinaire peut être réglé tout en gardant les canaux ouverts. Fermer est une opération on-chain distincte, avec frais et délais selon les sorties et la situation.',
    },
  },
  {
    // BOLT 5 resolves revoked outputs by spending them, not cancelling history.
    id: 'lightning-penalty-cancels-commitment', notes: ['lightning-revoked-state'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:annuler|invalider) cet engagement\b/,
        previousSentence: /\b(?:engagement|etat(?: de canal)?) revoque\b/,
        unlessInContext: {prefix: /\b(?:pas|jamais|sans|ni)\s*$/, claim: /./} },
      { test: /\b(?:cancel|invalidate) this commitment\b/,
        previousSentence: /\brevoked (?:commitment|channel state)\b/,
        unlessInContext: {prefix: /\b(?:not|never|cannot|can't|without)\s*$/, claim: /./} },
      { test: /\b(?:engagement|etat(?: de canal)?)\b[^.!?;]{0,45}\b(?:reste |est )?valide\b[^.!?;]{0,35}\b(?:tant que|jusqu'a ce que)\b[^.!?;]{0,60}\bdelai\b[^.!?;]{0,40}\b(?:ecoule|expire)\b/,
        unlessMatch: /\b(?:pas valide|jamais valide)\b/ },
      { test: /\b(?:revoked|old) (?:commitment|state)\b[^.!?;]{0,35}\bvalid until\b[^.!?;]{0,40}\b(?:delay|timelock)\b[^.!?;]{0,30}\bexpires\b/ },
      { test: /\b(?:annuler|invalider)\s+(?:cet |un |l')?(?:engagement|etat|transaction)\s+revoque\w*\b/,
        unlessInContext: {prefix: /\b(?:pas|jamais|sans|ni)\s*(?:pour\s*)?$/, claim: /./} },
      { test: /\b(?:cancel|invalidate)\s+(?:this |the |a )?revoked\s+(?:commitment|transaction|state)\b/,
        unlessInContext: {prefix: /\b(?:not|never|cannot|can't|without)\s*$/, claim: /./} },
      { test: /\b(?:etat(?: de canal)?|engagement|transaction)\s+revoque\w*\b[^.!?;]{0,85}\bvalide\b[^.!?;]{0,50}\btant qu'[^.!?;]{0,40}\bconteste\w*\b/,
        unlessMatch: /\bn'est pas valide\b/ },
      { test: /\brevoked\s+(?:commitment|transaction|state)\b[^.!?;]{0,65}\bvalid until\b[^.!?;]{0,35}\b(?:contested|challenged|penalized)\b/,
        unlessMatch: /\bnot valid\b/ },
    ],
    correction: {
      en: 'Correction: a valid confirmed revoked commitment is not cancelled by a dispute or penalty. Using saved revocation data, the victim wallet or its watchtower must get a penalty spend of its relevant outputs confirmed before the cheater’s delay ends. The commitment stays in history and does not expire at the timelock deadline; the delay restricts the peer’s spending. A penalty spends outputs instead of replacing or invalidating it.',
      fr: 'Correction : un engagement révoqué valide et confirmé n’est pas annulé par contestation ou pénalité. Avec les données de révocation sauvegardées, le portefeuille de la victime ou sa watchtower doit faire confirmer une dépense de pénalité des sorties concernées avant la fin du délai du fraudeur. L’engagement reste dans l’historique et n’expire pas à la fin du délai, qui limite la dépense du pair. La pénalité dépense des sorties sans le remplacer ni l’invalider.',
    },
  },
  {
    id: 'lightning-penalty-manual-required', notes: ['lightning-revoked-state'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\bil faut\b[^.!?;]{0,130}\b(?:declencher|publier|envoyer) manuellement\b[^.!?;]{0,45}\b(?:penalite|penalisante)\b/,
        unless: /\b(?:pas toujours|pas necessairement|si|sans watchtower|non configure\w*)\b/ },
      { test: /\b(?:user|you) must\b[^.!?;]{0,35}\bmanually\b[^.!?;]{0,35}\b(?:penalty|justice) (?:transaction|spend)\b/,
        unless: /\b(?:not always|not necessarily|if|without a watchtower|not configured)\b/ },
    ],
    correction: {
      en: 'Correction: a configured wallet or watchtower can detect a revoked commitment and broadcast the penalty automatically using saved data. Bitcoin itself does not initiate a refund. Do not impose a manual user transaction in every case; successful recovery still requires appropriate data and timely confirmation.',
      fr: 'Correction : un portefeuille ou une watchtower configurés peuvent détecter l’engagement révoqué et publier automatiquement la pénalité avec les données sauvegardées. Bitcoin lui-même ne lance pas de remboursement. N’impose pas une transaction manuelle à l’utilisateur dans tous les cas ; la récupération exige les bonnes données et une confirmation à temps.',
    },
    modelOnly: { en: ['Do not impose a manual user transaction in every case;'], fr: ['N’impose pas une transaction manuelle à l’utilisateur dans tous les cas ;'] },
  },
  {
    id: 'proof-of-work-replaces-validation', notes: ['bitcoin-issuance-validation'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\bpreuve de travail\s+(?:seule\s+)?valide\s+(?:le|un) bloc\b/,
        unless: /\bsi toutes les autres (?:regles|verifications) (?:sont satisfaites|sont respectees|reussissent)\b/ },
      { test: /\bproof.of.work\s+(?:alone\s+)?validates?\s+(?:the|a) block\b(?!\s+header\b)/,
        unless: /\bif all other (?:rules|checks) (?:pass|hold|are satisfied)\b/ },
      { test: /\bpreuve de travail\s+garantit que le bloc est valide\b/ },
      { test: /\bproof.of.work\s+guarantees? (?:that )?(?:the |a )?block is valid\b/,
        unless: /\bif all other (?:rules|checks) (?:pass|hold|are satisfied)\b/ },
      { test: /\bproof.of.work\s+(?:only\s+)?(?:validates?|confirms?)\s+(?:the )?computational effort\s+and\s+(?:the )?validity of (?:the )?(?:block(?:'s)? )?transactions\b/ },
      { test: /\bpreuve de travail\s+(?:valide|confirme)\s+l'effort de calcul\s+et\s+la validite des transactions\b/ },
      { test: /\bproof.of.work\s+(?:only\s+)?(?:validates?|confirms?)\s+(?:the )?(?:chain(?:'s)? history|validity of (?:the )?transactions|transactions(?:' validity)?)\b/,
        unlessInContext: {prefix: /\b(?:not|never)\s*$/, claim: /./} },
      { test: /\bpreuve de travail\s+(?:valide|confirme)\s+(?:l'historique|la validite des transactions|les transactions)\b/,
        unlessInContext: {prefix: /\b(?:pas|jamais)\s*$/, claim: /./} },
    ],
    correction: {
      en: 'Correction: satisfying proof of work is one block requirement, not proof that its transactions or issuance are valid. Full nodes independently check transaction rules and the coinbase limit C <= S + F. More work cannot make a rule-breaking block valid. Answer the monetary question directly without an unrelated analogy.',
      fr: 'Correction : satisfaire la preuve de travail est une condition du bloc, pas une preuve de validité des transactions ou de l’émission. Les nœuds vérifient séparément les transactions et la limite coinbase C <= S + F. Plus de travail ne rend pas valide un bloc qui viole ces règles. Réponds directement à la question monétaire, sans analogie hors sujet.',
    },
    modelOnly: { en: ['Answer the monetary question directly without an unrelated analogy.'], fr: ['Réponds directement à la question monétaire, sans analogie hors sujet.'] },
  },
  {
    id: 'lightning-routing-fee-direction', notes: ['lightning-payment-mechanics'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\bfrais demandes\b[^.!?;]{0,30}\btrop eleves\b[^.!?;]{0,70}\bnoeuds intermediaires\b[^.!?;]{0,30}\bprets a accepter\b/, unlessMatch: /\b(?:pas|jamais)\b/ },
      { test: /\brequested fees\b[^.!?;]{0,30}\btoo high\b[^.!?;]{0,60}\b(?:forwarding|intermediate) nodes\b[^.!?;]{0,30}\bwilling to accept\b/, unlessMatch: /\b(?:not|never)\b/ },
    ],
    correction: {
      en: 'Correction: forwarding nodes advertise the fees they charge. The payer’s wallet compares route fees with the payer’s maximum; a fee limit may exclude a route. Do not reverse this into intermediaries refusing to receive fees because they are too high. Search failure itself locks no funds; a committed HTLC can keep its amount pending until resolution.',
      fr: 'Correction : les intermédiaires annoncent les frais qu’ils facturent. Le portefeuille compare les frais du chemin à la limite du payeur ; elle peut exclure un trajet. N’inverse pas ce rapport en disant que les relais refusent de recevoir des frais trop élevés. La recherche seule ne bloque rien ; un HTLC engagé peut garder son montant en attente jusqu’à résolution.',
    },
    modelOnly: { en: ['Do not reverse this into intermediaries refusing to receive fees because they are too high.'], fr: ['N’inverse pas ce rapport en disant que les relais refusent de recevoir des frais trop élevés.'] },
  },
  {
    id: 'lightning-payment-state-unchanged', notes: ['lightning-payment-mechanics'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\bpaiement(?: ordinaire)?\s+ne (?:modifie|change) pas\s+l'etat du canal\b/,
        unless: /\b(?:echou\w*|annul\w*|non regle|sur chaine|on.chain)\b/ },
      { test: /\b(?:ordinary |successful )?payment\s+does not (?:change|update)\s+(?:the )?channel state\b/,
        unless: /\b(?:failed|cancelled|unsettled|on.chain)\b/ },
    ],
    correction: {
      en: 'Correction: a successful ordinary Lightning payment updates channel balances and commitment states off-chain. It does not need a new Bitcoin block or close the channels. Distinguish no on-chain transaction for each payment from no channel-state change.',
      fr: 'Correction : un paiement Lightning ordinaire réussi actualise les soldes et les engagements des canaux hors chaîne. Il ne nécessite ni nouveau bloc Bitcoin ni clôture. L’absence de transaction on-chain par paiement ne signifie pas absence de changement d’état du canal.',
    },
    modelOnly: { en: ['Distinguish no on-chain transaction for each payment from no channel-state change.'], fr: [] },
  },
  {
    id: 'lightning-closure-to-move-funds', notes: ['lightning-payment-mechanics'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:cafe|merchant|recipient|payee)\s+(?:only closes|must close)\b[^.!?;]{0,70}\b(?:move|transfer) funds\b[^.!?;]{0,25}\banother channel\b/ },
      { test: /\b(?:commercant|destinataire)\s+(?:doit fermer|ne ferme)\b[^.!?;]{0,70}\b(?:deplacer|transferer) (?:les |ses )?fonds\b[^.!?;]{0,25}\bautre canal\b/, unlessMatch: /\b(?:pas|jamais)\b/ },
    ],
    correction: {
      en: 'Correction: a channel need not be closed to route value through other channels; usable routes and directional liquidity determine whether that is possible. A cooperative or forced closure is a separate operation settling that channel on-chain. Do not invent an exclusive reason why the merchant closes a channel.',
      fr: 'Correction : router de la valeur à travers d’autres canaux ne nécessite pas en soi de clôture ; cela dépend des chemins utilisables et de la liquidité dans le bon sens. Une clôture coopérative ou forcée est une opération distincte de règlement sur chaîne. N’invente pas une raison exclusive de fermeture par le commerçant.',
    },
    modelOnly: { en: ['Do not invent an exclusive reason why the merchant closes a channel.'], fr: ['N’invente pas une raison exclusive de fermeture par le commerçant.'] },
  },
  {
    id: 'lightning-payer-reveals-preimage', notes: ['lightning-payment-mechanics', 'lightning-invoice'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:your wallet|ton portefeuille|votre portefeuille)\s+(?:sends?|envoie)\s+(?:a |the |une? |la )?pre[- ]?image\b/,
        previousSentence: /\b(?:when you pay|lorsque (?:tu paies|vous payez)|quand (?:tu paies|vous payez))\b/ },
      { test: /\b(?:payer|sender)\s+(?:reveals?|provides?|discloses?|sends?)\s+(?:a |the |their |his )?(?:secret(?: key)?|private key|(?:payment )?pre[- ]?image)\b/,
        unlessInContext: {prefix: /\b(?:not|never)\s+(?:the )?$/, claim: /./} },
      { test: /\b(?:payeur|expediteur)\s+(?:revele|fournit|divulgue)\s+(?:une? |la |le |sa )?(?:cle (?:secrete|privee)|secret|preimage)\b/,
        unlessInContext: {prefix: /\b(?:pas|jamais)\s+(?:le )?$/, claim: /./} },
    ],
    correction: {
      en: 'Correction: for an ordinary invoice-based Lightning payment, the recipient reveals the payment preimage and it is relayed back through the route to fulfill the HTLCs. The payer does not release a private key to let the recipient claim. An in-flight HTLC commits its amount until fulfillment or failure resolution; it is not a guarantee of successful payment.',
      fr: 'Correction : pour un paiement Lightning ordinaire avec facture, le destinataire révèle la préimage de paiement, relayée en retour pour satisfaire les HTLC. Le payeur ne révèle pas de clé privée pour permettre l’encaissement. Un HTLC en cours engage son montant jusqu’au règlement ou à la résolution de l’échec ; il ne garantit pas la réussite.',
    },
  },
  {
    id: 'fees-fixed-by-height', notes: ['bitcoin-issuance-validation', 'transaction-fees'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\bfrais\b[^.!?;]{0,100}\b(?:determines|fixes|fixe|determines par)\b[^.!?;]{0,60}\bhauteur (?:du |de )?bloc\b/,
        unlessMatch: /\b(?:pas|jamais|non)\b/ },
      { test: /\bfees\b[^.!?;]{0,100}\b(?:determined|fixed|set)\b[^.!?;]{0,60}\bblock height\b/,
        unlessMatch: /\b(?:not|never)\b/ },
    ],
    correction: {
      en: 'Correction: block height determines the allowed subsidy, not transaction fees. Fees come from the input-output differences of the included transactions. For the stated example keep S, F and C distinct: permitted coinbase <= S + F; actual net issuance = C - F. More proof of work cannot waive this ceiling.',
      fr: 'Correction : la hauteur détermine la subvention autorisée, pas les frais. Les frais résultent des différences entrées-sorties des transactions incluses. Dans l’exemple donné, distingue S, F et C : coinbase permise <= S + F ; émission nette réelle = C - F. Plus de preuve de travail ne supprime pas ce plafond.',
    },
  },
  {
    id: 'lightning-recipient-no-invoice', notes: ['lightning-payment-mechanics'],
    clauseScoped: true, unlessSentence: REFUTATION,
    unlessQuestion: /\b(?:keysend|spontaneous|spontane\w*|invoice.less|sans facture)\b/,
    patterns: [
      { test: /\b(?:commercant|destinataire|beneficiaire|marchand)\s+ne\s+(?:cree|genere|fournit)\s+pas\s+(?:la|une|de)\s+facture\b/ },
      { test: /\b(?:merchant|recipient|payee)\s+(?:does not|doesn't|never)\s+(?:create|generate|supply|provide)\s+(?:the|an?)\s+invoice\b/ },
    ],
    correction: {
      en: 'Correction: in the ordinary invoice-based payment being explained, the recipient creates and supplies the invoice. Invoice and payment request refer to the same request, signed by the recipient. The payer reads it and routes a payment through channels with sufficient liquidity in the payment direction.',
      fr: 'Correction : dans le paiement ordinaire avec facture expliqué ici, le destinataire crée et fournit la facture. Facture et demande de paiement désignent cette même demande, signée par le destinataire. Le payeur la lit puis route le paiement via des canaux disposant de liquidité dans le sens du paiement.',
    },
  },
  {
    id: 'lightning-instant-guarantee', notes: ['lightning-payment-mechanics'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:le paiement|les paiements)\s+(?:est|sont|sera|seront)\s+(?:alors |toujours |necessairement )?(?:(?:execute|executes|regle|regles|finalise|finalises)\s+)?(?:instantane\w*|immediat\w*)\b/ },
      { test: /\b(?:the payment|payments|the funds|funds)\s+(?:is|are|will be)\s+(?:then |always |necessarily )?(?:(?:executed|settled|completed)\s+)?(?:instant(?:ly|aneous)?|immediate(?:ly)?)\b/ },
    ],
    correction: {
      en: 'Correction: Lightning can settle quickly off-chain, but neither instant execution, low fees nor success is guaranteed. A usable route needs enough liquidity in the payment direction, and routing may fail or require retries. Channel closure is not part of each ordinary payment. Preserve the requested walkthrough: recipient invoice, payer route and HTLCs, recipient revealing the preimage to its peer, fulfillment back to the payer, off-chain balance updates with channels open.',
      fr: 'Correction : Lightning peut régler rapidement un paiement hors chaîne, mais ni exécution instantanée, ni faibles frais, ni succès ne sont garantis. Le chemin doit avoir assez de liquidité dans le sens du paiement ; la recherche peut échouer ou nécessiter des essais. La clôture du canal ne fait pas partie de chaque paiement ordinaire. Conserve le parcours demandé : facture du destinataire, chemin et HTLC du payeur, préimage révélée par le destinataire à son pair, règlement remontant vers le payeur, soldes mis à jour hors chaîne et canaux ouverts.',
    },
    modelOnly: { en: ['Preserve the requested walkthrough: recipient invoice, payer route and HTLCs, recipient revealing the preimage to its peer, fulfillment back to the payer, off-chain balance updates with channels open.'], fr: ['Conserve le parcours demandé : facture du destinataire, chemin et HTLC du payeur, préimage révélée par le destinataire à son pair, règlement remontant vers le payeur, soldes mis à jour hors chaîne et canaux ouverts.'] },
  },
  {
    id: 'lightning-invoice-payer-identity', notes: ['lightning-payment-mechanics','lightning-invoice-contents'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:facture|invoice)\b[^.!?;]{0,90}\b(?:identite du payeur|payer(?:'s)? identity|identity of the payer)\b/,
        unlessMatch: /\b(?:pas|not|never|jamais|sans|without)\b/ },
      { test: /\b(?:preuve|proof)\b[^.!?;]{0,35}\b(?:payeur s'engage|payer (?:commits|has committed))\b/,
        unlessInContext: {prefix: /\b(?:not|never|no|pas|jamais)(?: (?:a|the|une?|la))?\s*$/, claim: /./} },
    ],
    correction: {
      en: 'Correction: an ordinary Lightning invoice is a payment request signed by the recipient, identifying its receiving node, amount and payment hash. It is not proof of the payer’s identity or a commitment already signed by the payer. The payer chooses whether to pay and constructs the route.',
      fr: 'Correction : une facture Lightning ordinaire est une demande de paiement signée par le destinataire, indiquant son nœud de réception, le montant et le hash de paiement. Ce n’est ni une preuve de l’identité du payeur ni un engagement déjà signé par lui. Le payeur choisit de payer et construit le chemin.',
    },
  },
  {
    id: 'utxo-fee-output', notes: ['transaction-inputs-outputs'], clauseScoped: true,
    unlessSentence: REFUTATION,
    patterns: [
      { test: /\bfrais\s+sont\s+(?:eux.memes\s+)?une sortie\b/ },
      { test: /\bfees?\s+(?:is|are)\s+(?:(?:itself|themselves)\s+)?(?:an? |the )?(?:separate |distinct )?output\b/ },
      { test: /\bsorties\b[^.!?;]{0,30}\b(?:contiennent|comprennent|incluent)\b[^.!?;]{0,130}\b(?:et|plus|ainsi que)\s+(?:les )?frais\b/ },
      { test: /\boutputs\b[^.!?;]{0,30}\b(?:contain|include)\b[^.!?;]{0,130}\b(?:and|plus)\s+(?:the )?fees\b/ },
      { test: /\b(?:une? |la |derniere |autre |speciale? )*(?:sortie|ligne)(?: speciale| supplementaire| distincte)?\b[^.!?;]{0,50}\b(?:sert a payer|paie|paye|pour payer|destinee aux|represente|correspond aux)\b[^.!?;]{0,15}\bfrais\b/ },
      { test: /\b(?:an? |the |another |last |special |additional )*(?:output|row)(?: special| additional)?\b[^.!?;]{0,45}\b(?:pays?|for paying|represents?|is for)\b[^.!?;]{0,15}\bfees?\b/ },
    ],
    unless: /\b(?:pas|not|never|jamais|aucune?|no|coinbase|interface|wallet displays|portefeuille affiche)\b/,
    correction: {
      en: 'Correction: an ordinary Bitcoin transaction has no fee output or special fee row. Outputs contain payment and any change; fees are the difference between total input and output values. The block coinbase is a separate transaction through which the miner claims fees. In a database analogy, UTXOs are unspent output records, not an extra fee record.',
      fr: 'Correction : une transaction Bitcoin ordinaire ne contient ni sortie frais ni ligne spéciale pour les frais. Les sorties contiennent paiement et monnaie éventuelle ; les frais sont la différence entre total entrées et sorties. La coinbase du bloc est une transaction distincte par laquelle le mineur réclame les frais. Dans l’analogie, les UTXO sont des enregistrements de sorties non dépensées, pas une ligne de frais supplémentaire.',
    },
  },
  {
    id: 'coinbase-numeric-issuance', notes: ['bitcoin-issuance-validation'], patterns: [],
    evaluateAnswer: coinbaseIssuanceContradiction,
    correction: {
      en: 'Correction: distinguish the permitted subsidy S from the actual net supply increase. With a valid coinbase claim C and included fees F, the net increase is C - F. For an underclaim this is below S. For each claim C, calculate its own C - F: changing C with fixed fees changes net issuance by the same amount. A result for one C does not apply to every claim. Do not replace it with S or invent a different fee total.',
      fr: 'Correction : distingue la subvention autorisée S de l’augmentation nette effective de la quantité de bitcoins. Avec une coinbase valide C et les frais inclus F, l’augmentation nette est C - F. Si le mineur réclame moins que le plafond, elle est inférieure à S. Pour chaque montant C réclamé, calcule son propre C - F : à frais constants, changer C change d’autant l’émission nette. Le résultat pour un C ne vaut pas pour tous les montants réclamés. Ne le remplace pas par S et n’invente pas un autre total de frais.',
    },
    modelOnly: { en: ['Do not replace it with S or invent a different fee total.'], fr: ['Ne le remplace pas par S et n’invente pas un autre total de frais.'] },
  },
  {
    id: 'lightning-fulfillment-omitted', notes: ['lightning-payment-mechanics'], patterns: [], repairOnly: true,
    // A bounded completeness check for an explicit walkthrough, not a general
    // truth verifier and not a requirement for every narrow Lightning answer.
    evaluateAnswer: (answer, question) => isLightningPaymentWalkthrough(question)
      && !/\b(?:pre[ -]?image|secret\b[^.!?]{0,90}\bhash|hash\b[^.!?]{0,90}\bsecret)\b/.test(normalizeAnswerText(answer)),
    correction: {
      en: 'Correction: the requested payment walkthrough is incomplete without fulfillment. Explain the recipient invoice, the payer selecting a route with liquidity in the sending direction, then HTLCs. The recipient reveals the preimage to its adjacent peer; fulfillment propagates back toward the payer and settles channel balances off-chain. Channels stay open. Do not promise instant success or confuse invoice, HTLC and on-chain transaction.',
      fr: 'Correction : le parcours demandé est incomplet sans le règlement. Explique la facture du destinataire, le chemin choisi par le payeur avec liquidité dans le sens de l’envoi, puis les HTLC. Le destinataire révèle la préimage à son pair adjacent ; le règlement remonte vers le payeur et met à jour les soldes hors chaîne. Les canaux restent ouverts. Ne promets pas de succès instantané et ne confonds pas facture, HTLC et transaction sur chaîne.',
    },
  },
  {
    id: 'lightning-invoice-is-htlc', notes: ['lightning-payment-mechanics','lightning-invoice-contents'],
    clauseScoped: true, unlessSentence: REFUTATION,
    unlessScope: 'match', unless: /\b(?:pas|not|never|jamais)\b/,
    patterns: [
      { test: /\b(?:facture|invoice)\b[^.!?;]{0,30}\b(?:is|est|constitue)\b[^.!?;]{0,35}\b(?:htlc|transaction (?:pre.etablie|pre.signed))\b/ },
      { test: /\b(?:commercant|destinataire|recipient|merchant)\b[^.!?;]{0,70}\b(?:genere|cree|generates?|creates?)\b[^.!?;]{0,65}\bhtlc\b[^.!?;]{0,65}\b(?:facture|invoice)\b/ },
    ],
    correction: {
      en: 'Correction: the recipient provides a signed payment request (invoice), not a pre-signed Bitcoin transaction or HTLC. It identifies the requested payment, including its payment hash. The payer reads it, chooses a liquid route and offers HTLCs through channel updates; fulfillment settles the payment off-chain without closing channels.',
      fr: 'Correction : le destinataire fournit une demande de paiement signée (facture), pas une transaction Bitcoin pré-signée ni un HTLC. Elle décrit le paiement demandé, notamment son hash. Le payeur la lit, choisit un chemin avec liquidité et engage des HTLC par mises à jour des canaux ; leur règlement termine le paiement hors chaîne sans fermer les canaux.',
    },
  },
  {
    id: 'lightning-route-failure-locks-funds', notes: ['lightning-payment-mechanics'],
    clauseScoped: true, unlessSentence: REFUTATION,
    unlessScope: 'match', unless: /\b(?:pas|not|never|jamais)\b/,
    patterns: [
      { test: /\b(?:fonds|solde|paiement|funds|balance|payment)\b[^.!?;]{0,30}\b(?:reste(?:nt)? bloques?|est gele|remain(?:s)? (?:locked|frozen)|are (?:locked|frozen))\b[^.!?;]{0,120}\b(?:cloture|fermeture|ferme|closed|closure|closing)\b/,
        unlessInContext: {prefix: /\b(?:htlc|pending|in.flight|deja en cours|engage|litige|dispute|revok\w*|revoqu\w*)\b[^.!?]*$/, claim: /./} },
    ],
    correction: {
      en: 'Correction: finding no route does not freeze a channel balance until closure. The wallet can retry another route or report failure; closure is not required by that failure. An already committed HTLC is a different case: its amount may remain pending until fulfillment or timeout, sometimes requiring on-chain resolution. Keep those cases separate.',
      fr: 'Correction : ne trouver aucun chemin ne gèle pas le solde du canal jusqu’à clôture. Le portefeuille peut tenter un autre chemin ou signaler l’échec ; cet échec n’impose pas de fermeture. Un HTLC déjà engagé est un autre cas : son montant peut rester en attente jusqu’au règlement ou à l’expiration, parfois avec résolution sur chaîne. Ne mélange pas ces situations.',
    },
    modelOnly: { en: ['Keep those cases separate.'], fr: ['Ne mélange pas ces situations.'] },
  },
  {
    id: 'utxo-spending-destroys-history-or-fees',
    notes: ['transaction-inputs-outputs'],
    clauseScoped: true,
    unlessSentence: new RegExp(`${REFUTATION.source}|\\b(?:unclaimed|underclaim\\w*|not claimed|not collected|non reclames|non collectes|renonce|local history|historique local)\\b`),
    unlessScope: 'match',
    unless: /\b(?:not|never|ne|pas|jamais)\b/,
    patterns: [
      { test: /\b(?:fees?|surplus)\b[^.!?]{0,85}\b(?:burned|destroyed|removed from circulation)\b/ },
      { test: /\b(?:frais|surplus)\b[^.!?]{0,85}\b(?:brules|detruits|retires de la circulation)\b/ },
      { test: /\b(?:inputs?|spent outputs?|utxos?|they)\b[^.!?]{0,65}\b(?:erased|deleted)\b[^.!?]{0,25}\bhistory\b/ },
      { test: /\b(?:entrees?|sorties depensees|utxo|elles)\b[^.!?]{0,65}\b(?:effacees?|supprimees?)\b[^.!?]{0,25}\bhistorique\b/ },
    ],
    correction: {
      en: 'Correction: spending removes outputs from the unspent set, not from the blockchain transaction history. Value is allocated to new outputs and fees. Ordinary fees are assigned to the miner through the coinbase, not destroyed by the payment; an unclaimed fee is a separate case.',
      fr: 'Correction : dépenser retire les sorties de l’ensemble non dépensé, pas de l’historique des transactions de la blockchain. La valeur est répartie entre nouvelles sorties et frais. Les frais ordinaires sont attribués au mineur via la coinbase, pas détruits par le paiement ; des frais non réclamés sont un cas distinct.',
    },
  },
  {
    id: 'signature-spends-utxo', notes: ['transaction-inputs-outputs'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\bsignatures?\s+(?:autorise\w*\b[^.!?;]{0,125}\bet\s+)?(?:retire\w*|supprime\w*)\b[^.!?;]{0,100}\b(?:utxo|sorties? non depensees)\b/ },
      { test: /\bsignatures?\s+(?:authoriz\w*\b[^.!?;]{0,125}\band\s+)?(?:removes?|deletes?)\b[^.!?;]{0,80}\butxo\b/ },
    ],
    correction: {
      en: 'Correction: signing authorizes a spend but does not itself spend the output or change the UTXO set. Applying a valid transaction removes its spent outputs from that set and adds the new unspent outputs. Keep the signature, transaction application and ownership attribution distinct.',
      fr: 'Correction : signer autorise une dépense mais ne dépense pas la sortie et ne modifie pas l’ensemble UTXO. Appliquer une transaction valide retire les sorties dépensées de cet ensemble et ajoute les nouvelles sorties non dépensées. Distingue signature, application de la transaction et attribution de propriété.',
    },
    modelOnly: { en: ['Keep the signature, transaction application and ownership attribution distinct.'], fr: ['Distingue signature, application de la transaction et attribution de propriété.'] },
  },
  {
    id: 'transaction-history-proves-owner', notes: ['transaction-inputs-outputs'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\binformations? externes? ou un schema de depense connu\b[^.!?;]{0,70}\b(?:attribution|propriete|proprietaire)\b/,
        unlessMatch: /\b(?:ne|pas|jamais)\b/ },
      { test: /\bexternal (?:ownership )?information or a known spending pattern\b[^.!?;]{0,65}\b(?:identify|prove|determine)\b[^.!?;]{0,25}\b(?:owner|ownership|change)\b/,
        unlessMatch: /\b(?:not|never|cannot|can't)\b/ },
      { test: /\bpour savoir a (?:qui|quoi) appartiennent (?:les |ces )?fonds\b[^.!?;]{0,30}\bil faut suivre l'historique\b/, unless: /\b(?:information\w* (?:externe\w*|independante\w*)|(?:external|independent) (?:ownership |identity )?(?:information|evidence)|hors chaine)\b/ },
      { test: /\bto know who owns (?:the |these )?funds\b[^.!?;]{0,30}\b(?:you must|one must|we must) (?:trace|follow) (?:the )?(?:transaction )?history\b/, unless: /\b(?:information\w* (?:externe\w*|independante\w*)|(?:external|independent) (?:ownership |identity )?(?:information|evidence)|hors chaine)\b/ },
      { test: /\b(?:transaction history|blockchain history)\s+(?:proves?|reveals?|identifies?)\s+(?:the owner|who owns)\b/, unless: /\b(?:information\w* (?:externe\w*|independante\w*)|(?:external|independent) (?:ownership |identity )?(?:information|evidence)|hors chaine)\b/ },
      { test: /\bl'historique (?:des transactions|de la blockchain)\s+(?:prouve|revele|identifie)\s+(?:le proprietaire|a qui)\b/, unless: /\b(?:information\w* (?:externe\w*|independante\w*)|(?:external|independent) (?:ownership |identity )?(?:information|evidence)|hors chaine)\b/ },
    ],
    correction: {
      en: 'Correction: public transaction history shows spending links between outputs, not who owns them. Tracing that history alone cannot prove which new output belongs to the payer. Independent ownership information is needed; amounts, output order and graph patterns are only clues. Input signatures authorize spending, not a personal identity label on the new outputs. Never ask for private keys.',
      fr: 'Correction : l’historique public montre les liens de dépense entre sorties, pas leurs propriétaires. Le suivre seul ne prouve pas quelle nouvelle sortie revient au payeur. Il faut des informations indépendantes sur la propriété ; montants, ordre et schémas du graphe sont des indices. Les signatures autorisent la dépense sans étiqueter l’identité des propriétaires des nouvelles sorties. Ne demande jamais de clé privée.',
    },
    modelOnly: { en: ['Never ask for private keys.'], fr: ['Ne demande jamais de clé privée.'] },
  },
  {
    id: 'validation-reveals-change-owner',
    notes: ['transaction-inputs-outputs'],
    clauseScoped: true,
    unlessSentence: REFUTATION,
    unlessScope: 'match',
    unless: /\b(?:not|never|ne|pas|jamais)\b/,
    patterns: [
      { test: /\bvalidated by the network\b[^.!?]{0,45}\b(?:proves|allows)\b[^.!?]{0,70}\bchange belongs\b/ },
      { test: /\bvalidee par le reseau\b[^.!?]{0,45}\b(?:permet|prouve)\b[^.!?]{0,70}\b(?:change|monnaie) (?:revient|appartient)\b/ },
    ],
    correction: {
      en: 'Correction: network validation checks transaction rules, not personal ownership of outputs. Input signatures and transaction validity do not prove that a particular output is the signer’s change. External change attribution remains a hypothesis without independent ownership information.',
      fr: 'Correction : la validation réseau contrôle les règles de transaction, pas l’identité des propriétaires. Les signatures et la validité ne prouvent pas qu’une sortie donnée est la monnaie du signataire. L’attribution externe de la monnaie reste une hypothèse sans information indépendante sur la propriété.',
    },
  },
  {
    id: 'lightning-revoked-state-replacement',
    notes: ['lightning-revoked-state'],
    clauseScoped: true,
    unlessSentence: REFUTATION,
    unlessScope: 'match',
    unless: /\b(?:not|never|no|ne|pas|jamais)\b/,
    patterns: [
      { test: /\bnetwork (?:treats|considers|accepts)\b[^.!?]{0,35}\b(?:old|revoked) (?:channel )?state\b[^.!?]{0,35}\bvalid until\b[^.!?]{0,25}\b(?:newer|new|latest) (?:channel )?state\b/ },
      { test: /\breseau (?:traite|considere|accepte)\b[^.!?]{0,35}\b(?:ancien etat|etat revoque)\b[^.!?]{0,35}\bvalide jusqu'[^.!?]{0,35}\b(?:nouvel etat|nouveau)\b/ },
      { test: /\b(?:newer|new|latest) (?:commitment|channel state)\b[^.!?]{0,30}\b(?:replaces|overrides|invalidates)\b[^.!?]{0,25}\b(?:published|confirmed|broadcast)\b[^.!?]{0,20}\b(?:commitment|state)\b/ },
      { test: /\b(?:nouvel engagement|nouvel etat)\b[^.!?]{0,30}\b(?:remplace|invalide|annule)\b[^.!?]{0,30}\b(?:etat|engagement)\b[^.!?]{0,20}\b(?:publie|confirme|diffuse)\b/ },
    ],
    correction: {
      en: 'Correction: an old revoked commitment can remain a valid Bitcoin transaction. A newer commitment does not replace it after publication. The remedy is to use saved revocation data to confirm a penalty spend of the relevant outputs before the peer’s delay expires; it is not an automatic refund or acceptance of a newer state by the peer.',
      fr: 'Correction : un engagement révoqué peut rester une transaction Bitcoin valide. Un nouvel engagement ne le remplace pas après publication. Il faut utiliser les données de révocation sauvegardées pour faire confirmer une dépense de pénalité avant la fin du délai du pair ; ce n’est ni un remboursement automatique ni l’acceptation d’un nouvel état par le pair.',
    },
  },
  {
    id: 'utxo-coinbase-as-input', notes: ['transaction-inputs-outputs'],
    clauseScoped: true, unlessSentence: REFUTATION,
    unlessScope: 'match', unless: /\b(?:not|never|pas|jamais|ni)\b/,
    patterns: [
      // Type confusion, not the legitimate special input contained IN coinbase.
      { test: /\b(?:entree|input)\s+(?:speciale?\s*)?\(\s*(?:(?:la|the)\s+)?(?:transaction coinbase|coinbase transaction)\s*\)/ },
      { test: /\b(?:transaction coinbase|coinbase transaction)\s+(?:est|is)\s+(?:une?|an?)\s+(?:speciale?\s+)?(?:entree|input)\b/ },
    ],
    correction: {
      en: 'Correction: the coinbase is a separate transaction, not an input of the payment. Its outputs let the miner claim the subsidy and included fees. Its own special input does not spend an earlier UTXO. For the ordinary payment, fee = input total minus output total; keep payment and change separate from that fee.',
      fr: 'Correction : la coinbase est une transaction distincte, pas une entrée du paiement. Ses sorties permettent au mineur de réclamer subvention et frais inclus. Sa propre entrée spéciale ne dépense pas d’ancien UTXO. Pour le paiement ordinaire, frais = total entrées moins total sorties ; distingue paiement, monnaie et frais.',
    },
  },
  {
    id: 'utxo-unrequested-numeric-example', notes: ['transaction-inputs-outputs'], patterns: [], repairOnly: true,
    evaluateAnswer: (answer, question) => {
      const q = normalizeAnswerText(question);
      // Requested numbers/examples remain supported by the arithmetic path.
      // Only an unsolicited conditional example is withheld, not all numerals.
      if (!q || /\d|\b(?:example|exemple|numeric\w*|chiffre\w*|amount|montant|combien|how much|sats?|satoshis?)\b/.test(q)) return false;
      return /\b(?:if|si|example|exemple)\b[^.!?]{0,100}\b\d+(?:[ ,]\d{3})*\s+sats?\b/.test(normalizeAnswerText(answer));
    },
    correction: {
      en: 'Correction: the question asks for relationships, without numerical amounts or a numerical example. Answer in three short sentences: inputs consume old outputs but keep their history; new outputs contain payment and any change, excluding fees; fee = total inputs - total outputs, claimed through the separate coinbase transaction. Omit the invented numbers and any extra example.',
      fr: 'Correction : la question demande les relations, sans montants ni exemple chiffré. Réponds en trois phrases courtes : les entrées consomment les anciennes sorties sans effacer leur historique ; les nouvelles sorties contiennent paiement et monnaie éventuelle, sans les frais ; frais = total entrées - total sorties, réclamés via la transaction coinbase séparée. Supprime les chiffres inventés et tout exemple supplémentaire.',
    },
  },
  {
    id: 'confirmation-proves-output-owner', notes: ['transaction-inputs-outputs'],
    clauseScoped: true, unlessSentence: REFUTATION,
    unlessScope: 'match',
    patterns: [
      { test: /\b(?:attendre|apres)\b[^.!?;]{0,35}\bconfirmation\b[^.!?;]{0,100}\b(?:savoir avec certitude|prouver)\b[^.!?;]{0,50}\b(?:qui possede|proprietaire|a qui appartient)\b/,
        unlessInContext: {prefix: /\b(?:pas|jamais)\s*$/, claim: /./} },
      { test: /\b(?:wait for|after)\b[^.!?;]{0,35}\bconfirmation\b[^.!?;]{0,100}\b(?:know for certain|prove)\b[^.!?;]{0,50}\b(?:who owns|owner|ownership)\b/ },
    ],
    unless: /\b(?:pas|jamais|not|never|cannot)\b/,
    correction: {
      en: 'Correction: a transaction confirmation does not establish the personal owner of its outputs. Signatures authorize spending the inputs, scripts set conditions for future spending, and amounts/order only offer change heuristics. Confirmation does not turn those heuristics into ownership proof.',
      fr: 'Correction : la confirmation d’une transaction n’établit pas l’identité du propriétaire des sorties. Les signatures autorisent les entrées, les scripts fixent les conditions de dépense, et montants/ordre ne donnent que des indices de monnaie. La confirmation ne transforme pas ces indices en preuve de propriété.',
    },
  },
  {
    id: 'utxo-remainder-must-be-lost', notes: ['transaction-inputs-outputs'],
    unlessSentence: REFUTATION,
    patterns: [
      { test: /\bfees?\b[^.!?;]{0,35}\b(?:leaves?|exit\w*|disappears? from)\s+(?:the )?(?:bitcoin )?system\b/,
        unless: /\b(?:if|unless|when|not|never|unclaimed|underclaim\w*)\b/ },
      { test: /\bfrais\b[^.!?;]{0,35}\b(?:quittent|quitte|disparaissent de|disparait de)\s*(?:le |du )?(?:systeme|reseau bitcoin)\b/,
        unless: /\b(?:si|sauf|lorsque|pas|jamais|non reclames)\b/ },
      { test: /\b(?:difference|reste|frais)\b[^.!?]{0,180}\b(?:doivent|doit)\s+etre\s+perdus?\b/ },
      { test: /\b(?:difference|remainder|fees?)\b[^.!?]{0,180}\bmust\s+be\s+lost\b/ },
    ],
    unless: /\b(?:unclaimed|not claimed|non reclames|non reclame|ne (?:doit|doivent) pas|must not|need not|does not have to)\b/,
    correction: {
      en: 'Correction: consuming an input in full does not force all value beyond the payment to become fees or be lost. Outputs include payment and any change; the difference between ALL inputs and ALL outputs is the fee, claimed by the miner through the separate coinbase transaction. Give the requested relationships without inventing new amounts.',
      fr: 'Correction : consommer toute une entrée n’impose pas de perdre tout le reste après le paiement ni de le donner en frais. Les sorties incluent paiement et monnaie éventuelle ; les frais sont la différence entre TOUTES les entrées et TOUTES les sorties, réclamée par le mineur via la transaction coinbase distincte. Explique les relations demandées sans inventer de nouveaux montants.',
    },
    modelOnly: { en: ['Give the requested relationships without inventing new amounts.'], fr: ['Explique les relations demandées sans inventer de nouveaux montants.'] },
  },
  {
    id: 'lightning-preimage-after-settlement', notes: ['lightning-payment-mechanics'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:once|after)\s+(?:your |the )?payment\s+is\s+(?:confirmed|settled|completed)\b[^.!?;]{0,75}\b(?:reveals?|provides?)\b[^.!?;]{0,35}\bpre[- ]?image\b[^.!?;]{0,35}\b(?:unlock|settle|complete)\b/ },
      { test: /\b(?:une fois|apres que)\s+(?:le |votre )?paiement\b[^.!?;]{0,20}\b(?:confirme|regle|termine)\b[^.!?;]{0,75}\brevele\b[^.!?;]{0,25}\bpreimage\b[^.!?;]{0,35}\b(?:debloquer|regler|terminer)\b/ },
    ],
    unless: /\b(?:pas|jamais|not|never)\b/,
    correction: {
      en: 'Correction: the recipient provides the preimage to fulfill the HTLC and settle the payment; payment settlement is not a precondition that occurs before this fulfillment. The preimage goes to the recipient’s adjacent peer and back along the route, permitting off-chain balance updates with channels open.',
      fr: 'Correction : le destinataire fournit la préimage pour remplir le HTLC et régler le paiement ; le règlement n’est pas un préalable qui aurait lieu avant cette étape. La préimage passe au pair adjacent du destinataire puis revient le long du chemin, permettant le règlement hors chaîne avec les canaux ouverts.',
    },
  },
  {
    id: 'utxo-invented-expansion', notes: ['transaction-inputs-outputs'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\butxos?\s*\(\s*unit(?:e|es|s)\s+(?:de )?transfert?\b/ },
    ],
    correction: {
      en: 'Correction: UTXO means Unspent Transaction Output, an output not yet spent. Do not invent another expansion. Spending removes it from the spendable UTXO set but preserves its historical transaction record.',
      fr: 'Correction : UTXO signifie Unspent Transaction Output, soit une sortie de transaction non dépensée. N’invente pas un autre développement du sigle. La dépense retire la sortie de l’ensemble dépensable, mais conserve son enregistrement historique.',
    },
    modelOnly: { en: ['Do not invent another expansion.'], fr: ['N’invente pas un autre développement du sigle.'] },
  },
  {
    id: 'utxo-source-record-deletion', notes: ['transaction-inputs-outputs'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:annule|supprim(?:e|er|ez|ons)|effac(?:e|er|ez|ons)|detruit)\s+(?:l'existence de )?(?:la |une )?(?:ligne|sortie)\s+(?:source|historique)\b/,
        unless: /\b(?:utxo set|active view|current view|vue active|vue actuelle|ensemble utxo|base locale|local database)\b/,
        unlessInContext: {prefix: /\b(?:ne|pas|jamais|sans)\s*(?:plus\s+)?$/, claim: /./} },
      { test: /\b(?:deletes?|deleting|erases?|erasing|destroys?)\s+(?:the |a )?(?:source|historical)\s+(?:row|record|output)\b/,
        unless: /\b(?:utxo set|active view|current view|vue active|vue actuelle|ensemble utxo|base locale|local database)\b/,
        unlessInContext: {prefix: /\b(?:not|never|without|cannot|don't|doesn't)\s*$/, claim: /./} },
      { test: /\b(?:supprim(?:e|er|ez|ons)|effac(?:e|er|ez|ons))\s+(?:la |une )ligne\s+(?:d'un |de l'|dans l')historique\b/,
        unlessInContext: {prefix: /\b(?:ne|pas|jamais|sans)\s*(?:plus\s+)?$/, claim: /./} },
      { test: /\b(?:deletes?|deleting|erases?|erasing)\s+(?:a |the )?(?:row|record)\s+from\s+(?:the )?(?:transaction |blockchain )?history\b/,
        unlessInContext: {prefix: /\b(?:not|never|without|cannot|don't|doesn't)\s*$/, claim: /./} },
    ],
    correction: {
      en: 'Correction: the historical source transaction/output record remains in the blockchain after spending. Only its availability in the UTXO set ends. In a database analogy, remove it from the active spendable view, not from immutable transaction history.',
      fr: 'Correction : l’enregistrement de la sortie source reste dans l’historique blockchain après dépense. Seule sa disponibilité dans l’ensemble UTXO prend fin. Dans l’analogie, on la retire de la vue dépensable, sans annuler l’existence de la ligne historique.',
    },
  },
  {
    id: 'lightning-invoice-forwarded', notes: ['lightning-payment-mechanics','lightning-invoice-contents'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:envoie|transmet|diffuse)\b[^.!?;]{0,35}\b(?:la facture|la demande de paiement)\b[^.!?;]{0,45}\b(?:chemin|reseau lightning|intermediaires)\b/ },
      { test: /\b(?:le client|le payeur)\b[^.!?;]{0,65}\bla transmet au reseau lightning\b/,
        previousSentence: /\bfacture\b/ },
      { test: /\b(?:sends?|forwards?|broadcasts?)\b[^.!?;]{0,25}\b(?:the invoice|the payment request)\b[^.!?;]{0,45}\b(?:along the route|lightning network|intermediaries)\b/ },
    ],
    unless: /\b(?:pas|jamais|not|never)\b/,
    correction: {
      en: 'Correction: the payer reads the invoice locally and uses its payment information to construct HTLCs and onion routing messages. The invoice itself is not forwarded through the intermediate nodes. The recipient supplies the invoice to the payer; payment fulfillment then relays the preimage back along the route.',
      fr: 'Correction : le payeur lit la facture localement et utilise ses informations pour construire les HTLC et les messages de routage en oignon. La facture elle-même n’est pas transmise aux intermédiaires. Le destinataire fournit la facture au payeur ; lors du règlement, la préimage revient le long du chemin.',
    },
  },
  {
    id: 'lightning-route-search-certainty', notes: ['lightning-payment-mechanics'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\bportefeuille\s+ne trouve\s+aucun chemin\b[^.!?;]{0,120}\b(?:signifie|prouve)\b[^.!?;]{0,100}\b(?:n'existe|aucun (?:chemin|trajet))\b/ },
      { test: /\bwallet\s+(?:cannot find|can't find|finds no)\s+(?:a )?(?:route|path)\b[^.!?;]{0,120}\b(?:means|proves)\b[^.!?;]{0,100}\b(?:no (?:route|path)|does not exist|none exists)\b/ },
      { test: /\b(?:inability to route|failed route search|no route found)\b[^.!?;]{0,55}\b(?:means|proves)\b[^.!?;]{0,150}\b(?:does not exist|no (?:usable|liquid) (?:route|path) exists)\b/ },
      { test: /\b(?:aucun chemin trouve|echec (?:de la recherche|du routage))\b[^.!?;]{0,35}\b(?:signifie|prouve)\b[^.!?;]{0,100}\b(?:aucun chemin|n'existe)\b/ },
    ],
    unless: /\b(?:may mean|might mean|does not (?:mean|prove)|doesn't (?:mean|prove)|ne (?:prouve|signifie) pas|ne prouve jamais|peut signifier)\b/,
    correction: {
      en: 'Correction: a wallet failing to find a route is not proof that no usable route exists. The search uses incomplete information and payment constraints; liquidity, unavailable peers or fees may also cause failure. Before any HTLC is committed, the failed search itself locks no funds. An in-flight HTLC is a separate pending amount requiring fulfillment or failure resolution.',
      fr: 'Correction : ne trouver aucun chemin ne prouve pas qu’aucun chemin utilisable n’existe. La recherche utilise des informations incomplètes et des contraintes de paiement ; liquidité, pairs indisponibles ou frais peuvent aussi causer un échec. Avant tout HTLC engagé, la recherche infructueuse ne bloque pas de fonds. Un HTLC en cours doit, lui, être réglé ou résolu.',
    },
  },
  {
    id: 'utxo-numeric-output-total', notes: ['transaction-inputs-outputs'], patterns: [],
    evaluateAnswer: utxoOutputTotalContradiction,
    correction: {
      en: 'Correction: the total value of the new outputs is total inputs MINUS the fee. Payment plus change equals this smaller output total. The fee goes to the miner via the separate block coinbase. Use the checked example and keep this distinction throughout, including any analogy; do not say the entire input value reaches the payment and change outputs.',
      fr: 'Correction : le total des nouvelles sorties vaut total entrées MOINS frais. Paiement plus monnaie égale ce total plus petit. Les frais vont au mineur via la coinbase distincte du bloc. Utilise le calcul vérifié et garde cette distinction dans toute comparaison ; toute la valeur des entrées ne rejoint pas les sorties paiement et monnaie.',
    },
    modelOnly: { en: ['Use the checked example and keep this distinction throughout, including any analogy; do not say the entire input value reaches the payment and change outputs.'], fr: ['Utilise le calcul vérifié et garde cette distinction dans toute comparaison ;'] },
  },
  {
    id: 'utxo-numeric-change',
    notes: ['transaction-inputs-outputs'],
    patterns: [],
    evaluateAnswer: utxoNumericContradiction,
    correction: {
      en: 'Correction: add all input values, then subtract the stated payment and fee to obtain change. Use the checked hypothetical calculation in context; the payment, change and fee must sum to the full inputs. Change is a new output, while fees are not an output of this transaction.',
      fr: 'Correction : additionne toutes les entrées, puis soustrais le paiement et les frais pour obtenir la monnaie. Utilise le calcul fictif vérifié du contexte ; paiement, monnaie et frais doivent égaler toutes les entrées. La monnaie est une nouvelle sortie, les frais ne sont pas une sortie de cette transaction.',
    },
    modelOnly: { en: ['Use the checked hypothetical calculation in context;'], fr: ['Utilise le calcul fictif vérifié du contexte ;'] },
  },
  {
    id: 'coinbase-numeric-excess', notes: ['bitcoin-issuance-validation'], patterns: [],
    evaluateAnswer: coinbaseExcessContradiction,
    correction: {
      en: 'Correction: the excess above the coinbase ceiling is C - (S + F), not C - S. Fees are allowed within the reward ceiling even though they are existing coins. Use the checked excess from the supplied example and reject the whole block for a positive excess; do not invent another amount as unauthorized.',
      fr: 'Correction : le dépassement du plafond coinbase vaut C - (S + F), pas C - S. Les frais font partie du plafond de récompense, même s’ils sont des bitcoins existants. Utilise le dépassement calculé de l’exemple et rejette le bloc pour un dépassement positif ; n’invente pas un autre montant comme non autorisé.',
    },
    modelOnly: { en: ['Use the checked excess from the supplied example and reject the whole block for a positive excess; do not invent another amount as unauthorized.'], fr: ['Utilise le dépassement calculé de l’exemple et rejette le bloc pour un dépassement positif ; n’invente pas un autre montant comme non autorisé.'] },
  },
  {
    id: 'coinbase-numeric-comparison',
    notes: ['bitcoin-issuance-validation'],
    patterns: [],
    evaluateAnswer: coinbaseNumericContradiction,
    correction: {
      en: 'Correction: for the monetary check, a coinbase claim at or below the permitted subsidy plus fees is allowed, and a greater claim is rejected. Use the checked hypothetical calculations in the context. Do not reject a smaller claim after giving a larger ceiling. The net change in supply is the accepted claim minus fees.',
      fr: 'Correction : pour ce contrôle monétaire, une coinbase inférieure ou égale à subvention autorisée plus frais est permise ; une valeur supérieure est rejetée. Utilise les calculs fictifs vérifiés du contexte. Ne rejette pas une valeur inférieure au plafond annoncé. La variation nette de la quantité de bitcoins vaut montant accepté moins frais.',
    },
    modelOnly: { en: ['Use the checked hypothetical calculations in the context.', 'Do not reject a smaller claim after giving a larger ceiling.'], fr: ['Utilise les calculs fictifs vérifiés du contexte.', 'Ne rejette pas une valeur inférieure au plafond annoncé.'] },
  },
  {
    id: 'difficulty-subsidy-confusion',
    notes: ['bitcoin-issuance-validation'],
    clauseScoped: true,
    unlessScope: 'match',
    patterns: [
      { test: /\b(?:difficulty|difficulty adjustment)\b[^.!?]{0,35}\b(?:changes|sets|determines|influences|reduces)\b[^.!?]{0,20}\b(?:subsidy|halving)\b/ },
      { test: /\b(?:difficulte|ajustement de la difficulte)\b[^.!?]{0,35}\b(?:modifie|determine|influence|reduit)\b[^.!?]{0,20}\b(?:subvention|halving)\b/ },
    ],
    unless: /\b(?:not|never|doesn't|ne|pas|jamais)\b/,
    unlessSentence: /\b(?:myth|mythe|false|faux|fausse|misconception|a tort)\b/,
    correction: {
      en: 'Correction: the permitted subsidy depends on block height and the halving schedule, not on the difficulty adjustment. Difficulty changes the proof-of-work target; it does not set the subsidy per block.',
      fr: 'Correction : la subvention autorisée dépend de la hauteur et du calendrier des halvings, pas de l’ajustement de difficulté. La difficulté modifie la cible de preuve de travail, pas la subvention par bloc.',
    },
  },
  {
    id: 'issuance-fees-transfer-direction',
    notes: ['bitcoin-issuance-validation'],
    clauseScoped: true,
    unlessScope: 'match',
    patterns: [
      { test: /\b(?:creation nette|emission nette|augmentation nette)\b[^.!?;]{0,140}\bmineur reclame\b[^.!?;]{0,30}\bfrais qu'il doit payer\b/ },
      { test: /\b(?:net issuance|net supply increase)\b[^.!?;]{0,90}\b(?:minus|less)\s+(?:the )?fees (?:the )?miner (?:must pay|pays)\b/ },
      { previousSentence: /\b(?:fees|frais)\b/, test: /^(?:ils|elles|they)\b[^.!?]{0,100}\b(?:transferes|transferred|flow)\b[^.!?]{0,30}\b(?:du mineur|from the miner)\b[^.!?]{0,40}\b(?:vers|to|into) (?:le |la |les |the )?(?:autres participants|reseau|other participants|network)\b/ },
      { test: /\b(?:mineur (?:a recu|recoit|reclame))\b[^.!?;]{0,40}\bfrais qu'il (?:a paye|paye)\b/ },
      { test: /\bminer (?:received|receives|claims)\b[^.!?;]{0,40}\bfees (?:he|it) (?:paid|pays)\b/ },
      { test: /\bfees\b[^.!?]{0,120}\b(?:transferred|moving|move|flow)\b[^.!?]{0,30}\bfrom the miner\b[^.!?]{0,40}\b(?:to|into) (?:the )?(?:block|coinbase|other participants|network)\b/ },
      { test: /\bfrais\b[^.!?]{0,140}\b(?:transferes|transferent|circulent)\b[^.!?]{0,30}\bdu mineur\b[^.!?]{0,40}\b(?:vers|a) (?:le |la |les )?(?:bloc|coinbase|autres participants|reseau)\b/ },
    ],
    unless: /\b(?:not|never|ne|pas|jamais)\b/,
    unlessSentence: /\b(?:myth|mythe|false|faux|fausse|misconception|a tort)\b/,
    correction: {
      en: 'Correction: block fees are the input value minus output value of the included ordinary transactions. The coinbase assigns those existing coins to the miner; it does not spend miner inputs to transfer fees into the block.',
      fr: 'Correction : les frais du bloc sont la différence entrées moins sorties des transactions ordinaires incluses. La coinbase attribue ces bitcoins existants au mineur ; elle ne dépense pas des entrées du mineur pour transférer les frais vers le bloc.',
    },
  },
  {
    id: 'alice-app-wallet-capability',
    notes: [],
    always: true,
    patterns: [
      { test: new RegExp(String.raw`\b${APP_REFERENCE}\b[^.!?]{0,100}\b${UNSUPPORTED_OPERATION}\b`) },
      { test: new RegExp(String.raw`\b${UNSUPPORTED_OPERATION}\b[^.!?]{0,100}\b${APP_REFERENCE}\b`) },
      { test: /\b(?:your|a|votre|ton|un) (?:wallet|portefeuille)\s*[,()]?\s*(?:like|such as|comme) alice app\b[^.!?]{0,35}\b(?:pays?|sends?|routes?|finds? (?:a |the )?route|reads? (?:an? |the )?invoice|lit (?:la |une )?facture|(?:cherche|trouve) (?:un |le )?chemin)\b/ },
    ],
    unless: /\b(?:cannot|can't|does not|doesn't|not possible|never|no ability|ne|n'|pas|jamais|impossible|explain|explains|expliquer|explique|understand|comprendre|learn|apprendre|montre comment|shows? how)\b/,
    correction: {
      en: 'Correction: Alice App explains Bitcoin but cannot perform an Ark exit, replace a real transaction or send real funds. Use the relevant wallet for those operations. The Playground only uses worthless test coins.',
      fr: 'Correction : Alice App explique Bitcoin mais ne peut pas effectuer une sortie Ark, remplacer une transaction réelle ni envoyer de vrais fonds. Ces opérations se font dans le portefeuille concerné. Le Playground utilise uniquement des pièces de test sans valeur.',
    },
  },
  {
    id: 'ark-layer-one',
    notes: ARK_LAYER_NOTES,
    patterns: [
      // "Ark is a layer-1 scaling protocol", "Ark est un protocole de couche 1"
      { test: new RegExp(String.raw`\b(?:ark|arkade)\b,? (?:is|est|which is|qui est|remains|reste|works as|fonctionne comme)(?: (?:considered|essentially|basically|considere|essentiellement|fondamentalement))?(?: (?:as|comme))? (?:a|an|un|une|le|la|the) (?:(?:bitcoin|new|nouveau|nouvelle|open-source|native|natif|scaling|batching|joinpool) ){0,2}(?:protocol(?:e)? (?:of|de|on|sur) (?:la |the )?)?${LAYER_ONE}\b`) },
      // "a layer-1 protocol called Ark"
      { test: new RegExp(String.raw`\b${LAYER_ONE}\b[^.!?]{0,30}\b(?:called|named|known as|appele|appelee|nomme|nommee|baptise)\b[^.!?]{0,12}\b(?:ark|arkade)\b`) },
    ],
    unless: new RegExp(String.raw`\b${NEGATION}\b`),
    unlessScope: 'span',
    unlessSentence: REFUTATION,
    correction: ARK_LAYER_CORRECTION,
  },
  {
    id: 'ark-operator-blocks-exit',
    notes: ARK_NOTES,
    patterns: [
      { test: new RegExp(String.raw`\b${OPERATOR}\b[^.!?]*\b${BLOCKING_VERB}\b[^.!?]*\b${EXIT_NOUN}\b`) },
      { test: /\b(?:you(?:'re| are| will be| would be| remain| stay| get| end up)|your (?:funds|coins|money)(?: are| will be| remain| stay)?|the (?:funds|coins))\b[^.!?]{0,40}\b(?:stuck|trapped|locked (?:in|up|out)|frozen)\b/ },
      { test: /\b(?:vous|tu) (?:restez|restes|etes|es|serez|seras|resterez|resteras|vous retrouvez|te retrouves|demeurez)\b[^.!?]{0,30}\b(?:coince|coinces|coincee|coincees|bloque|bloques|bloquee|bloquees|piege|pieges|piegee|piegees)\b/ },
      { test: /\b(?:fonds|bitcoins|pieces)\b[^.!?]{0,30}\b(?:restent|sont|seront) (?:coinces|bloques|pieges|geles)\b/ },
    ],
    unless: new RegExp(String.raw`\b${NEGATION}\b`),
    unlessScope: 'span',
    unlessSentence: ARK_LIMITED_SENTENCE,
    correction: ARK_EXIT_CORRECTION,
  },
  {
    id: 'ark-funds-lost',
    notes: ARK_NOTES,
    patterns: [
      { test: /\b(?:funds|coins|money|bitcoins?|sats|savings)\b[^.!?]{0,60}\b(?:are|is|will be|would be|get|gets|become|becomes) (?:lost|gone|confiscated|seized|forfeited|taken)\b/ },
      { test: /\b(?:fonds|bitcoins?|pieces|argent|sats|economies)\b[^.!?]{0,60}\b(?:sont|est|seront|serait|seraient|deviennent) (?:perdus?|perdues?|confisques?|confisquees?|saisis?|envoles?)\b/ },
    ],
    unless: new RegExp(String.raw`\b${NEGATION}\b|\b(?:exit data|backup|seed|donnees de sortie|sauvegarde)\b`),
    unlessScope: 'span',
    unlessSentence: ARK_LIMITED_SENTENCE,
    correction: ARK_EXIT_CORRECTION,
  },
  {
    id: 'ark-expiry-inverted',
    notes: ARK_NOTES,
    clauseScoped: true,
    patterns: [
      { test: /\b(?:at|after|upon|once|when|past|a l'|apres|une fois|lorsque|quand|passe)\b[^.!?]{0,50}\b(?:expiry|expiration|expires|expired|expire|expirent|deadline|arrive a terme|arrive a expiration|echeance)\b[^.!?]{0,80}\b(?:becomes?|remains?|stays?|is|are|can be|can still be|recoverable|redeemable|claimable|spendable|reclaim(?:ed)?|claim(?:ed)?|recover(?:ed)?|redeem(?:ed)?|devient|deviennent|redevient|redeviennent|reste|restent|est|sont|peut etre|peuvent etre|recuperable|recuperables|recuperer|depensable|depensables|disponible|disponibles|utilisable|utilisables|publier|reclamer|claim)\b/,
        unlessMatch: /\b(?:allow(?:s)? (?:the )?(?:server|operator) to reclaim|(?:server|operator) (?:can|may) reclaim|permet(?:tre)? (?:au serveur|a l'operateur) de recuperer|(?:serveur|operateur) peut recuperer)\b/ },
    ],
    unless: /\b(?:before|prior to|until|revert|reverts|returns? to the operator|goes back to the operator|lost|forfeit|forfeited|refresh|refreshed|no longer|not|cannot|can't|avant|jusqu'a|revient|retourne|reviennent|perd|perdu|perdue|perdus|perdues|rafraichi|rafraichir|rafraichis|ne|n')\b/,
    unlessScope: 'span',
    unlessSentence: new RegExp(`${REFUTATION.source}|${COOPERATIVE_EXPIRY_RECOVERY.source}`),
    correction: ARK_EXPIRY_CORRECTION,
  },
  {
    id: 'multisig-quorum-inflated',
    notes: ['multisig'],
    patterns: [
      // "two seeds are not enough ... 2-of-3" (or "... 3-of-3" asserted for the user)
      { test: /\b(?:two|2|deux)(?: (?:of|de) (?:your|my|vos|mes|tes) (?:3|three|trois))? (?:seed|seeds|seed phrases?|keys?|cles?|signatures?)\b[^.!?]{0,80}\b(?:not enough|insufficient|not sufficient|ne suffi(?:t|sent)|insuffisant(?:s|es?)?|pas suffisant(?:s|es?)?)\b[^.!?]{0,120}\b(?:2|two|deux|3|three|trois)[- ](?:of|sur|de)[- ](?:3|three|trois)\b/ },
      // "the wallet requires three signatures", "il faut 3 signatures"
      {
        test: /\b(?:requires?|required|needs?|needed|must have|takes|il faut|il vous faut|il te faut|necessite|exige|requiert|faut)\b[^.!?]{0,40}\b(?:all )?(?:3|three|trois|les trois|toutes les trois|the three)\b[^.!?]{0,20}\b(?:signatures?|seeds?|keys?|cles?|cosigners?|cosignataires?)\b/,
        unless: /\b(?:any )?(?:two|2|deux) (?:of|sur|de|parmi|out of) (?:the |les |ses |its |your |vos |tes )?(?:three|3|trois)\b/,
      },
      // "you need to recover the third seed"
      { test: /\b(?:need|needs|must|have to|requires?|il (?:vous |te )?faut|devez|devrez|dois|devras)\b[^.!?]{0,30}\b(?:recover|find|retrieve|obtain|get|locate|recuperer|retrouver|obtenir)\b[^.!?]{0,20}\b(?:the |la |le |votre |your |ta |ton )?(?:third|3rd|troisieme|3e) (?:seed|key|cle|signature|cosigner|cosignataire)\b/ },
      // the user's wallet asserted to be 3-of-3
      { test: /\b(?:your|votre|vos|in your case|dans votre cas|dans ton cas|ton|ta|tes)\b[^.!?]{0,80}\b(?:3|three|trois)[- ](?:of|sur|de)[- ](?:3|three|trois)\b/ },
      { test: /\b(?:3|three|trois)[- ](?:of|sur|de)[- ](?:3|three|trois)\b[^.!?]{0,80}\b(?:your|votre|vos|in your case|dans votre cas|dans ton cas)\b/ },
    ],
    unless: /\b(?:descriptor|descripteur|(?:complete|full|wallet|exact) configuration|configuration (?:complete|du portefeuille|du wallet|exacte)|public keys?|cles? publiques?|xpub|derivation|on their own|alone|seules?|a elles seules|without|sans|backup|back up|sauvegard\w*|conserv\w*|store|stored|keep|kept|protect\w*|whether|unless|au cas ou|en cas de|instead of|rather than|plutot que|n'est pas|ne serait pas|different|differe|autre)\b|\b(?:3|three|trois)[- ](?:of|sur|de)[- ](?:3|three|trois)\b[^.!?]{0,40}\b(?:if|si|were|serait|etait|hypoth\w*)\b|\b(?:if|si)\b[^.!?]{0,60}\b(?:3|three|trois)[- ](?:of|sur|de)[- ](?:3|three|trois)\b|\bm[- ]of[- ]n\b|\bm (?:de|sur) n\b/,
    // A 3-of-5 or 4-of-7 named in the sentence is another wallet than the
    // user's 2-of-3; a 3-of-3 asserted for the user stays a claim.
    unlessSentence: new RegExp(String.raw`\b(?:(?:3|three|trois)[- ](?:of|sur|de|out of)[- ]${N_ABOVE_THREE}|${N_ABOVE_THREE}[- ](?:of|sur|de|out of)[- ]${ANY_N})\b`),
    unlessQuestion: new RegExp(String.raw`\b${HIGH_M}[- ]?(?:of|sur|de|out of|on)[- ]?${ANY_N}\b`),
    correction: MULTISIG_QUORUM_CORRECTION,
  },
  {
    id: 'multisig-alice-capability',
    notes: ['multisig'],
    patterns: [
      { test: /\balice(?: wallet)?\b[^.!?]{0,80}\b(?:import(?:er|ez|s|ed|ing)?|restaur(?:er|ez|e)|restor(?:e|es|ing)|recre(?:er|ez|e|ate|ates|ating)|rebuil(?:d|ds|ding)|reconstrui(?:re|t|sez)|supporte?s? (?:les |le |the |a )?multisig|cre(?:er|ez|e) (?:le |un |votre |ton )?portefeuille multisig|create (?:the |a |your )?multisig)\b/ },
      { test: /\b(?:import(?:er|ez)?|restor(?:e|ing)|restaur(?:er|ez)|rebuild|recre(?:er|ate))\b[^.!?]{0,60}\b(?:in|into|dans|sur|avec|with) alice\b/ },
    ],
    unless: new RegExp(String.raw`\b${NEGATION}\b`),
    correction: MULTISIG_ALICE_CORRECTION,
  },
  {
    id: 'rbf-opt-in-precondition',
    notes: RBF_NOTES,
    unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:only|unless|seulement|uniquement|ne fonctionne que|ne marche que|n'est possible que|possible que)\b[^.!?]{0,80}\b(?:rbf|replace[- ]by[- ]fee|replaceable|remplacable|remplacement|replacement|rbf option|option rbf|flag|signal)\b[^.!?]{0,120}\b(?:enabled|activated|turned on|signal(?:l)?ed|flagged|marked|set|opted|checked|activ(?:e|ee|es|ees)|signal(?:e|ee|es|ees)|coch(?:e|ee)|marqu(?:e|ee))\b/ },
      { test: /\b(?:rbf|replace[- ]by[- ]fee|the (?:rbf )?(?:flag|option|signal)|l'option|le signal|le drapeau)\b[^.!?]{0,40}\b(?:(?:was|is|were|wasn't|isn't) not (?:enabled|activated|set|signal(?:l)?ed|turned on|marked)|n'(?:est|etait|a) pas (?:ete )?(?:activ(?:e|ee)|signal(?:e|ee)|coch(?:e|ee)|marqu(?:e|ee)))\b[^.!?]{0,100}\b(?:cannot|can't|can ?not|impossible|not possible|no way|won't be able|unable|ne (?:peut|pourra|pouvez|pourrez|pouvons|pourrons) pas)\b/ },
      { test: /\b(?:without|sans) (?:the |le |l'option |le signal |le drapeau )?(?:rbf|replace[- ]by[- ]fee)(?: flag| signal| option)?\b[^.!?]{0,60}\b(?:cannot|can't|can ?not|impossible|not possible|unable|ne (?:peut|pourra|pouvez|pourrez) pas)\b/ },
      { test: /\b(?:cannot|can't|can ?not|impossible|not possible|ne (?:peut|pourra|pouvez|pourrez) pas)\b[^.!?]{0,60}\b(?:without|sans|unless|a moins)\b[^.!?]{0,30}\b(?:rbf|replace[- ]by[- ]fee|signal|flag|option)\b/ },
    ],
    unless: /\b(?:opt[- ]in|full[- ]?rbf|some nodes|certain nodes|certains n(?:oe|œ)uds|not a precondition|pas une condition|n'exige pas|does not require|not required|improves? predictability|previsibilite|some wallets|wallets? (?:only |may |might )?(?:shows?|offers?|displays?|exposes?)|certains portefeuilles|portefeuilles? (?:ne )?(?:proposent?|affichent?|montrent?))\b/,
    correction: RBF_OPT_IN_CORRECTION,
  },
  {
    // Measured on 2026-11-12: asked whether a sender can still change an
    // unconfirmed payment, the 4B model answered that the outputs were fixed.
    // A merchant who believes it delivers against a payment that can vanish.
    id: 'unconfirmed-payment-final',
    notes: RBF_NOTES,
    clauseScoped: true,
    unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:sender|payer|no one|nobody)\b[^.!?]{0,50}\b(?:cannot|can't|can ?not|is unable to|will not be able to|won't be able to)\b[^.!?]{0,50}\b(?:change|alter|modify|cancel|reverse|replace|redirect|take back)\b[^.!?]{0,140}\b(?:unconfirmed|not (?:yet )?confirmed|in the mempool|zero[- ]conf\w*)\b/ },
      { test: /\b(?:unconfirmed|not (?:yet )?confirmed|in the mempool|zero[- ]conf\w*)\b[^.!?]{0,120}\b(?:cannot|can't|can ?not)\b[^.!?]{0,30}\b(?:be )?(?:changed|altered|modified|cancell?ed|reversed|replaced|redirected)\b/ },
      { test: /\bunconfirmed (?:payment|transaction)s?\b[^.!?]{0,30}\b(?:is|are) (?:final|irreversible|guaranteed|settled|safe to accept)\b/ },
      { test: /\b(?:expediteur|payeur|emetteur|personne)\b[^.!?]{0,50}\bne (?:peut|pourra|peuvent|pourront) (?:plus|pas|jamais)\b[^.!?]{0,50}\b(?:modifier|changer|annuler|remplacer|rediriger|reprendre)\b[^.!?]{0,140}\b(?:non confirmee?s?|pas (?:encore )?confirmee?s?|dans le mempool|sans confirmation)\b/ },
      { test: /\b(?:non confirmee?s?|pas (?:encore )?confirmee?s?|dans le mempool|sans confirmation)\b[^.!?]{0,120}\bne (?:peut|pourra|peuvent|pourront) (?:plus|pas|jamais) etre (?:modifiee?s?|changee?s?|annulee?s?|remplacee?s?|redirigee?s?)\b/ },
      { test: /\b(?:paiement|transaction)s? non confirmee?s?\b[^.!?]{0,30}\b(?:est|sont) (?:definiti\w*|irreversibles?|garanti\w*|regle\w*)\b/ },
    ],
    unless: /\b(?:once (?:it is |it's )?confirmed|after (?:a |its |the )?confirmation|une fois confirmee?|apres (?:une |sa |la )?confirmation|without (?:the |your |their |its )?(?:private )?(?:keys?|signature)|sans (?:la |sa |ta |votre )?(?:cle|signature)|third part\w*|tiers|recipient cannot|destinataire ne peut)\b/,
    correction: {
      en: 'Correction: until a transaction is confirmed, its sender can replace it with another transaction spending the same coins. The replacement may pay a different address or a different amount, or no longer pay the recipient at all. An unconfirmed payment is not settled: wait for a confirmation before treating it as received.',
      fr: 'Correction : tant qu’une transaction n’est pas confirmée, son expéditeur peut la remplacer par une autre transaction qui dépense les mêmes pièces. Ce remplacement peut payer une autre adresse ou un autre montant, ou ne plus rien payer au destinataire. Un paiement non confirmé n’est pas réglé : mieux vaut attendre une confirmation avant de le considérer comme reçu.',
    },
  },
  {
    id: 'rbf-second-payment',
    notes: RBF_NOTES,
    unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:create|creating|send|sending|make|making|broadcast|submit|issue)\b[^.!?]{0,40}\b(?:a |another |one )?(?:new|second|another|fresh|separate|different) (?:transaction|payment|tx)\b[^.!?]{0,80}\b(?:fresh|other|different|new|unrelated|separate) (?:inputs?|utxos?|coins?)\b/ },
      { test: /\b(?:send|sending|make|making|resend|re-send|pay|paying)\b[^.!?]{0,30}\b(?:a |one )?(?:second|another|new|duplicate) (?:payment|transaction|transfer)\b[^.!?]{0,60}\b(?:to (?:the )?same|same (?:recipient|address)|instead|as a (?:substitute|workaround|fix)|to (?:fix|correct|compensate|speed|replace)|the recipient again)\b/ },
      { test: /\b(?:cre(?:er|ez|e)|envoy(?:er|ez|e)|fai(?:re|tes|s)|refai(?:re|tes)|diffus(?:er|ez|e)|emett(?:re|ez))\b[^.!?]{0,40}\b(?:une |un )?(?:nouvelle|nouveau|seconde|second|deuxieme|autre) (?:transaction|paiement|envoi|virement)\b[^.!?]{0,80}\b(?:autres|nouvelles|nouveaux|differentes|differents) (?:entrees|utxos?|pieces|inputs?)\b/ },
      { test: /\b(?:renvoy(?:er|ez|e)|envoy(?:er|ez|e)|refai(?:re|tes)|repay(?:er|ez)|effectu(?:er|ez))\b[^.!?]{0,30}\b(?:un |une )?(?:second|seconde|deuxieme|nouveau|nouvelle|autre) (?:paiement|transaction|envoi|virement)\b[^.!?]{0,60}\b(?:au meme|a la meme|vers la meme|meme destinataire|meme adresse|a la place|en remplacement|pour (?:compenser|corriger|accelerer|remplacer|rattraper))\b/ },
    ],
    unless: /\b(?:do not|don't|never|not a|is not|isn't|should not|shouldn't|avoid|must not|mustn't|rather than|instead of|ne|n'|pas|jamais|evit\w*|sans|keeping|keeps?|same inputs?|original inputs?|replacement|remplacement|memes? entrees?|entrees? d'origine|conserv\w*)\b/,
    correction: RBF_SECOND_PAYMENT_CORRECTION,
  },
  {
    id: 'seed-digital-copy',
    notes: SEED_NOTES,
    patterns: [
      // "Yes, you can keep a photo of your phrase in your password manager"
      { test: new RegExp(String.raw`^(?:yes|oui)\b[^.!?]{0,100}\b${DIGITAL_COPY}\b`) },
      // "you can also save the words in an encrypted file"
      { test: new RegExp(String.raw`\b(?:you (?:can|could|may|might)|it(?:'s| is) (?:fine|ok|okay|safe|acceptable|reasonable|possible) to|feel free to|tu peux|vous pouvez|il est possible de|on peut|rien n'empeche de|libre a toi de)\b[^.!?]{0,30}\b${STORE_VERB}\b[^.!?]{0,80}\b${DIGITAL_COPY}\b`) },
      // "an encrypted file in the cloud is a reasonable backup", "une note sur ton telephone suffit"
      { test: new RegExp(String.raw`\b${DIGITAL_COPY}\b[^.!?]{0,80}\b${ACCEPTABLE}\b`) },
    ],
    unless: new RegExp(String.raw`\b(?:not|never|no|\w*n't|cannot|can't|neither|nor|avoid|unsafe|risky|risks?|danger|dangerous|expos(?:e|es|ed|ing)|compromise[ds]?|bad idea|mistake|instead|rather than|except|jamais|ne|n'|pas|aucun|aucune|evit(?:e|ez|er)|deconseill(?:e|ee)|risqu(?:e|es|ee)|dangereu(?:x|se)|expos(?:e|ee|er)|compromis|mauvaise idee|erreur|interdit|proscrit|plutot|au lieu|sauf)\b|${FOR_PASSWORDS}`),
    unlessSentence: REFUTATION,
    correction: SEED_DIGITAL_COPY_CORRECTION,
  },
  // Free-generation errors observed in 2 evaluation runs of 2026-11-06: each
  // claim contradicts the rule notes that were in context.
  {
    id: 'lightning-invoice-direction',
    notes: ['lightning-payment-mechanics', 'lightning-invoice-contents', 'lightning-invoice'],
    unlessSentence: REFUTATION,
    clauseScoped: true,
    unlessScope: 'match',
    patterns: [
      { test: /\b(?:le client|le payeur)\b[^.!?;]{0,25}\brecoit (?:cette|la) facture\b[^.!?;]{0,85}\bpuis l'envoie\b[^.!?;]{0,20}\b(?:au |a la )(?:librairie|destinataire|marchand|commercant|vendeur)\b/ },
      // Modal/infinitive wording and parenthesized names in real French UI output.
      { test: /\b(?:le payeur|l'expediteur|tu|vous|ton portefeuille|votre portefeuille)\b[^.!?;:]{0,55}\b(?:fournir|donner|envoyer|transmettre|presenter)\b[^.!?;:]{0,20}\b(?:une|la|ta|votre) facture\b[^.!?;:]{0,65}\b(?:au|a la|a ton|a votre) (?:destinataire|beneficiaire|marchand|commercant|vendeur)\b/ },
      // "To send, you give the recipient an invoice."
      { test: /\b(?:you|the payer|the sender|your wallet)\b[^.!?]{0,25}\b(?:give|gives|giving|send|sends|sending|provide|provides|providing|hand|hands|share|shares|present|presents)\b[^.!?]{0,15}\b(?:the |your |their )?(?:recipient|payee|merchant|shop|store|seller|receiver|them)\b[^.!?]{0,10}\b(?:an?|the|your) (?:lightning )?invoice\b/ },
      { test: /\b(?:you|the payer|the sender|your wallet)\b[^.!?]{0,25}\b(?:send|sends|give|gives|provide|provides|hand|hands|create|creates|generate|generates|issue|issues|make|makes)\b[^.!?]{0,10}\b(?:an?|the|your) (?:lightning )?invoice (?:to|for) (?:the )?(?:recipient|payee|merchant|shop|store|seller|receiver)\b/ },
      { test: /\b(?:tu|vous|le payeur|l'expediteur|ton portefeuille|votre portefeuille)\b[^.!?]{0,25}\b(?:donnes?|donnez|envoies?|envoyez|fournis|fournissez|transmets|transmettez|presentes?|presentez)\b[^.!?]{0,15}\b(?:au|a la|a ton|a votre) (?:destinataire|beneficiaire|marchand|commercant|vendeur|boutique)\b[^.!?]{0,10}\bune facture\b/ },
      { test: /\b(?:tu|vous|le payeur|l'expediteur|ton portefeuille|votre portefeuille)\b[^.!?]{0,25}\b(?:donnes?|donnez|envoies?|envoyez|fournis|fournissez|transmets|transmettez|crees?|creez|generes?|generez)\b[^.!?]{0,10}\b(?:une|la|ta|votre) facture (?:au|a la|a ton|a votre|pour le|pour la) (?:destinataire|beneficiaire|marchand|commercant|vendeur|boutique)\b/ },
    ],
    unless: new RegExp(String.raw`\b${NEGATION}\b`),
    correction: {
      en: 'Correction: in a usual Lightning payment, the recipient creates the invoice and gives it to the payer. The payer’s wallet decodes it, shows the details to confirm and looks for a route.',
      fr: 'Correction : dans un paiement Lightning ordinaire, c’est le destinataire qui crée la facture et la donne au payeur. Le portefeuille du payeur la décode, affiche les détails à confirmer et cherche un chemin.',
    },
  },
  {
    id: 'lightning-direct-channel-required',
    notes: ['lightning-payment-mechanics'],
    clauseScoped: true,
    unlessSentence: new RegExp(`${REFUTATION.source}|^\\s*(?:for a new direct channel|when setting up a new direct channel|pour etablir un nouveau canal direct|dans le cas d'un nouveau canal direct)\\b`),
    unlessScope: 'match',
    unless: /\b(?:not|never|no|ne|pas|jamais)\b/,
    patterns: [
      { test: /\b(?:le payeur et le destinataire|vous et (?:votre|le) destinataire|tu et (?:ton|le) destinataire)\b[^.!?;:]{0,25}\b(?:devez|doivent)\s+(?:d'abord )?avoir (?:cree|ouvert|etabli) un canal\b/ },
      { test: /\b(?:the )?(?:payer|sender) and (?:the )?(?:recipient|payee)\b[^.!?;:]{0,25}\bmust have (?:first )?(?:created|opened|established) a (?:payment )?channel\b/ },
      { test: /\b(?:you and (?:your|the) (?:recipient|payee)|(?:the )?(?:payer|sender) and (?:the )?(?:recipient|payee))\b[^.!?;:]{0,35}\bmust (?:first )?(?:open|establish) (?:a |the |a direct |a payment )?channel\b/ },
      { test: /\b(?:you|the payer|the sender)\s+(?:must|need to|has to|have to)\s+(?:first )?(?:open|establish)\s+(?:a )?(?:direct |payment )?channel\s+with\s+(?:the |your |every |each )?(?:recipient|payee)\b/ },
      { test: /\b(?:le payeur et le destinataire|vous et (?:votre|le) destinataire|tu et (?:ton|le) destinataire)\b[^.!?;:]{0,25}\b(?:devez|doivent)\s+(?:d'abord )?ouvrir un canal\b/ },
      { test: /\bavant de (?:pouvoir )?payer[^.!?;:]{0,50}\bdoivent (?:d'abord )?ouvrir un canal\b/ },
    ],
    correction: {
      en: 'Correction: a Lightning payer does not need to open a direct channel with the recipient. A payment can cross existing channels through intermediate nodes, provided a usable route has sufficient directional liquidity. Opening a channel is not a mandatory first step for every payment.',
      fr: 'Correction : le payeur Lightning n’a pas besoin d’ouvrir un canal direct avec le destinataire. Le paiement peut traverser des canaux existants et des nœuds intermédiaires si un chemin dispose de suffisamment de liquidité dans le bon sens. Ouvrir un canal n’est pas une première étape obligatoire pour chaque paiement.',
    },
  },
  {
    id: 'lightning-settlement-on-chain', notes: ['lightning-payment-mechanics'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:met(?:tent)? a jour|actualise\w*)\b[^.!?;]{0,55}\bsoldes\b[^.!?;]{0,55}\bsur la (?:chaine|blockchain)\b/ },
      { test: /\bupdates?\b[^.!?;]{0,55}\bbalances\b[^.!?;]{0,55}\b(?:on.chain|on the blockchain)\b/ },
    ],
    unless: /\b(?:not|never|pas|jamais|clotur\w*|fermeture|close|closes|closing|closure|force\w*|litige|dispute)\b/,
    correction: {
      en: 'Correction: ordinary Lightning payment settlement updates channel balances OFF-CHAIN. The recipient reveals the preimage and it travels back along the route to fulfill the HTLCs; the channels remain open. No Bitcoin blockchain update is needed for each payment. Channel closing is a separate on-chain transaction.',
      fr: 'Correction : le règlement ordinaire Lightning actualise les soldes des canaux HORS CHAÎNE. Le destinataire révèle la préimage, relayée en retour pour régler les HTLC ; les canaux restent ouverts. Chaque paiement ne demande pas de mise à jour sur la blockchain Bitcoin. La clôture est une transaction sur chaîne séparée.',
    },
  },
  {
    id: 'lightning-automatic-closure', notes: ['lightning-payment-mechanics'],
    unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:cloture|fermeture)\b[^.!?;]{0,150}\bautomatique\w*\b/,
        unlessMatch: /\b(?:pas|jamais|aucune?)\b/,
        unlessInContext: {prefix: /\b(?:pas de |aucune )$/, claim: /./} },
      { test: /\b(?:clos(?:ing|ure)|channels? (?:close|closes|is closed|are closed))\b[^.!?;]{0,100}\bautomatic(?:ally)?\b/,
        unlessMatch: /\b(?:not|never|no)\b/,
        unlessInContext: {prefix: /\b(?:no |not an? |never an? )$/, claim: /./} },
    ],
    unless: /\b(?:litige|dispute|force\w*|timeout|expiration|offline|hors ligne|malveillant|malicious|configure\w*|parametr\w*)\b/,
    correction: {
      en: 'Correction: ordinary Lightning payment settlement leaves channels open. Closure does not automatically follow the payment. A participant can separately choose to close, or a dispute can require a force close. Explain settlement through fulfillment of HTLCs and off-chain balance updates; do not add an automatic closing step.',
      fr: 'Correction : le règlement ordinaire Lightning laisse les canaux ouverts. Aucune clôture ne suit automatiquement le paiement. Un participant peut choisir séparément de fermer, ou un litige nécessiter une fermeture forcée. Explique le règlement par les HTLC remplis et les soldes actualisés hors chaîne, sans ajouter une étape de fermeture automatique.',
    },
    modelOnly: { en: ['Explain settlement through fulfillment of HTLCs and off-chain balance updates; do not add an automatic closing step.'], fr: ['Explique le règlement par les HTLC remplis et les soldes actualisés hors chaîne, sans ajouter une étape de fermeture automatique.'] },
  },
  {
    id: 'lightning-attacker-watchtower', notes: ['lightning-revoked-state'],
    clauseScoped: true, unlessSentence: REFUTATION,
    unless: /\b(?:watchtower (?:du|de ce) (?:pair|partenaire|noeud) (?:malhonnete|malveillant)\s+(?:ne protege pas|n'intervient pas|n'est pas)|(?:cheating|malicious|dishonest) peer'?s watchtower\s+(?:does not|doesn't|is not|isn't))\b/,
    patterns: [
      { test: /\bwatchtower\s+(?:du|de ce)\s+(?:pair|partenaire|noeud)\s+(?:malhonnete|malveillant)\b/,
        unlessInContext: {prefix: /\b(?:pas|jamais)\s+(?:la )?$/, claim: /./} },
      { test: /\b(?:cheating|malicious|dishonest)\s+peer'?s\s+watchtower\b/,
        unlessInContext: {prefix: /\b(?:not|never)\s+(?:the )?$/, claim: /./} },
    ],
    correction: {
      en: 'Correction: the protected user’s own wallet or configured watchtower monitors the cheating peer’s revoked commitment. It uses the saved revocation data to get a penalty transaction confirmed before the peer’s delay expires. Recovery does not rely on the attacker’s watchtower and is not guaranteed.',
      fr: 'Correction : c’est le portefeuille de l’utilisateur protégé ou sa propre watchtower qui surveille l’engagement révoqué du pair malhonnête. Il utilise les données de révocation sauvegardées pour faire confirmer une pénalité avant la fin du délai du pair. La récupération ne dépend pas de la watchtower de l’attaquant et n’est pas garantie.',
    },
  },
  {
    id: 'lightning-monitoring-protocol-fees', notes: ['lightning-revoked-state'],
    clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:impose|exige|necessite|requires?)\b[^.!?;]{0,65}\b(?:frais|fees?)\b[^.!?;]{0,40}\b(?:verifier les etats|surveiller|verify (?:the )?states|monitor(?:ing)?)\b/ },
    ],
    unless: /\b(?:pas|not|never|jamais|service|provider|prestataire|abonnement|subscription)\b/,
    correction: {
      en: 'Correction: monitoring for a revoked commitment is not itself a protocol transaction fee. An on-chain penalty spend needs transaction fees; an optional watchtower service may have its own pricing. The wallet or configured watchtower must monitor and get the penalty spend confirmed within the delay using saved revocation data.',
      fr: 'Correction : surveiller un état révoqué n’impose pas en soi de frais de transaction. Une dépense de pénalité sur chaîne demande des frais ; un service de watchtower peut avoir sa propre tarification. Le portefeuille ou la watchtower configurée doit surveiller et faire confirmer la pénalité dans le délai grâce aux données de révocation sauvegardées.',
    },
  },
  {
    id: 'lightning-payment-waits-for-close',
    notes: ['lightning-payment-mechanics'],
    clauseScoped: true,
    unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:une fois (?:le commerce|le commercant|le destinataire) paye|once (?:the )?(?:merchant|recipient) (?:is )?paid)\b[^.!?;]{0,180}\b(?:cloturer|fermer|close)\b[^.!?;]{0,30}\b(?:canaux|canal|channels?)\b/,
        unless: /\b(?:peuvent|peut|choisi\w*|facultatif|option\w*|can|may|choose|separe\w*|separat\w*|pas|not|never|jamais)\b/ },
      { test: /\b(?:commerce|commercant|destinataire|dernier noeud|merchant|recipient|last node)\b[^.!?;]{0,100}\b(?:publie|diffuse|publishes|broadcasts)\b[^.!?;]{0,60}\b(?:blockchain|on.chain)\b[^.!?;]{0,45}\b(?:cloturer|fermer|close)\b[^.!?;]{0,35}\b(?:canal|channel)\b/,
        unless: /\b(?:pas|not|never|jamais|choose|choisi\w*|option|separe\w*|separat\w*|forcee?|forced|revoqu\w*|revok\w*)\b/ },
      { test: /^(?:a ce moment(?: precis)?|ensuite)\b[^.!?]{0,100}\b(?:doivent|doit) publier une transaction\b[^.!?]{0,90}\bpour ["']?(?:cloturer|fermer)["']? le canal\b/,
        previousSentence: /^(?!.*\b(?:pas|jamais)\b).*\bpaiement\b[^.!?]{0,80}\b(?:termine|finalise|regle)\b/ },
      { test: /^(?:at this point|then)\b[^.!?]{0,100}\bmust (?:broadcast|publish) (?:a |an on-chain )transaction\b[^.!?]{0,90}\bto close the channel\b/,
        previousSentence: /^(?!.*\b(?:not|never)\b).*\bpayment\b[^.!?]{0,80}\b(?:complete|completed|finali[sz]ed|settled)\b/ },
      { test: /\b(?:the |a )?payment\s+(?:is|becomes)\s+(?:only\s+(?:finali[sz]ed|complete|completed|settled)\s+(?:when|once|after)|not\s+(?:finali[sz]ed|complete|completed|settled)\s+until)\s+(?:you close|the (?:payment )?channel (?:closes|is closed))\b/ },
      { test: /\ble paiement\s+(?:n'est (?:finalise|termine|regle) que|est (?:seulement|uniquement) (?:finalise|termine|regle))\s+(?:lorsque|quand|apres)\s+(?:le canal (?:est ferme|se ferme)|vous fermez le canal|tu fermes le canal)\b/ },
    ],
    correction: {
      en: 'Correction: a successful Lightning payment completes off-chain while its channels can remain open. Closing a channel separately settles its final balances on the Bitcoin blockchain; the recipient does not have to wait for that closure for the Lightning payment to complete.',
      fr: 'Correction : un paiement Lightning réussi se termine hors chaîne tandis que ses canaux peuvent rester ouverts. La fermeture d’un canal règle séparément ses soldes finaux sur la blockchain Bitcoin ; le destinataire n’a pas à attendre cette fermeture pour que le paiement Lightning soit terminé.',
    },
  },
  {
    id: 'lightning-failure-on-chain',
    notes: ['lightning-payment-mechanics', 'lightning-invoice'],
    unlessSentence: REFUTATION,
    patterns: [
      { test: /\ben cas de (?:blocage|panne|echec)(?: total| complet)?\b[^.!?;]{0,65}\b(?:revient|retourne|repasse|passe|bascule)\b[^.!?;]{0,35}\b(?:blockchain|chaine|on.chain)\b/ },
      { test: /\b(?:wallet|portefeuille)\s+(?:must|has to|doit)\s+(?:then |alors )?(?:use|utiliser)\b[^.!?;]{0,80}\b(?:default payment|paiement par defaut|transaction standard|standard transaction)\b/ },
      // "The payment only appears on the blockchain if the route fails."
      { test: /\b(?:on[- ]chain|on the (?:bitcoin )?(?:blockchain|chain|base layer))\b[^.!?]{0,80}\b(?:if|when|once|whenever|in case)\b[^.!?]{0,40}\b(?:route|routing|path|payment)s?\b[^.!?]{0,25}\b(?:fails?|failed|failing|cannot be found|is not found|isn't found)\b/ },
      { test: /\b(?:if|when|once|whenever|in case)\b[^.!?]{0,40}\b(?:route|routing|path|payment)s?\b[^.!?]{0,25}\b(?:fails?|failed|failing|cannot be found|is not found|isn't found)\b[^.!?]{0,80}\b(?:on[- ]chain|on the (?:bitcoin )?(?:blockchain|chain|base layer))\b/ },
      { test: /\bfall(?:s|ing)? back (?:automatically )?(?:to|on) (?:an? )?(?:on[- ]chain|the blockchain|bitcoin's blockchain)\b/ },
      { test: /\b(?:on[- ]chain|sur la (?:chaine|blockchain))\b[^.!?]{0,80}\b(?:si|lorsque|quand|en cas d'echec)\b[^.!?]{0,40}\b(?:route|routage|chemin|paiement|echec)\b/ },
      { test: /\b(?:si|lorsque|quand)\b[^.!?]{0,40}\b(?:route|routage|chemin|paiement)\b[^.!?]{0,25}\b(?:echoue|echouent|a echoue|n'aboutit|est introuvable)\b[^.!?]{0,80}\b(?:on[- ]chain|sur la (?:chaine|blockchain))\b/ },
      { test: /\bbascul\w* (?:automatiquement )?(?:sur|vers) (?:la chaine|la blockchain|l'on-chain|un paiement on-chain|on-chain)\b/ },
    ],
    unless: new RegExp(String.raw`\b(?:${NEGATION}|nothing|rien|separate|separately|distinct|choose|chooses|chosen|decide|decides|choisi\w*|decid\w*|instead of automatically|unless you|sauf si)\b`),
    correction: {
      en: 'Correction: a failed Lightning payment is not turned into an on-chain payment automatically. The wallet may retry or report the failure. Paying on-chain would be a separate payment the user chooses, to an on-chain address the recipient provides, with its own fees and confirmation time.',
      fr: 'Correction : un paiement Lightning qui échoue ne devient pas automatiquement un paiement on-chain. Le portefeuille peut réessayer ou signaler l’échec. Payer on-chain serait un paiement distinct, choisi par l’utilisateur, vers une adresse on-chain fournie par le destinataire, avec ses propres frais et délais de confirmation.',
    },
  },
  {
    id: 'lightning-channel-identity',
    notes: ['lightning-payment-privacy'],
    unlessSentence: REFUTATION,
    patterns: [
      // "opening and closing channels require on-chain transactions that reveal your identity"
      { test: /\b(?:open(?:s|ing|ed)?|clos(?:e|es|ing|ed)|fund(?:s|ing|ed)?)\b[^.!?]{0,80}\b(?:reveal|reveals|revealing|expose|exposes|exposing|disclose|discloses|disclosing|show|shows|tell|tells|give away|gives away)\b[^.!?]{0,30}\b(?:your|the (?:user|payer|owner|sender)'?s?|their|his|her) (?:real[- ]world |real |legal |civil )?(?:identity|identities|name|who you are)\b/ },
      { test: /\b(?:reveal|reveals|expose|exposes|disclose|discloses)\b[^.!?]{0,15}\b(?:your |their )?(?:real[- ]world |real )?identity\b[^.!?]{0,60}\b(?:open(?:s|ing)?|clos(?:e|ing)|channels?)\b/ },
      { test: /\b(?:ouverture|fermeture|ouvrir|fermer|ouvre|ferme|financement)\b[^.!?]{0,80}\b(?:revel\w*|expos\w*|devoil\w*|trahi\w*)\b[^.!?]{0,30}\b(?:ton |votre |son |leur |l')(?:identite)\b/ },
    ],
    unless: new RegExp(String.raw`\b(?:${NEGATION}|can|could|may|might|possibly|potentially|help\w*|link\w*|correlat\w*|by itself|alone|necessarily|if|peut|peuvent|pourrait|permet\w*|relier|rapproch\w*|a lui seul|forcement|necessairement|si)\b`),
    correction: {
      en: 'Correction: opening or closing a channel publishes an on-chain transaction, and an announced channel links its funding output to a node public key. That can support correlation, but it does not by itself reveal a person’s real-world identity; that takes other links, such as a withdrawal from an identified platform, address reuse or network metadata.',
      fr: 'Correction : ouvrir ou fermer un canal publie une transaction on-chain, et un canal annoncé relie sa sortie de financement à la clé publique d’un nœud. Cela peut faciliter des rapprochements, mais ne révèle pas à lui seul l’identité civile d’une personne ; il faut d’autres liens, comme un retrait depuis une plateforme identifiée, une réutilisation d’adresse ou des métadonnées réseau.',
    },
  },
  {
    id: 'lightning-route-hints-path',
    notes: ['lightning-invoice-contents'],
    unlessSentence: REFUTATION,
    patterns: [
      // "routing hints that can help observers trace the path your payment will take"
      { test: /\b(?:route|routing) hints?\b[^.!?]{0,100}\b(?:trace|traces|tracing|reveal|reveals|revealing|show|shows|showing|expose|exposes|exposing|disclose|discloses|indicate|indicates|determine|determines|dictate|dictates|map|maps|tell|tells)\b[^.!?]{0,50}\b(?:path|route)\b/ },
      { test: /\b(?:route|routing) hints?\b[^.!?]{0,30}\b(?:are|is) (?:mandatory|required|always (?:present|included))\b/ },
      { test: /\b(?:every|each|all) (?:bolt ?11 |lightning )?invoices? (?:contains?|includes?|must (?:contain|include)|has|have) (?:route|routing) hints?\b/ },
      { test: /\bindic(?:es|ations?) de routage\b[^.!?]{0,100}\b(?:revel\w*|montr\w*|expos\w*|trac\w*|indiqu\w*|determin\w*|devoil\w*)\b[^.!?]{0,50}\b(?:chemin|route|trajet|parcours)\b/ },
      { test: /\bindic(?:es|ations?) de routage\b[^.!?]{0,30}\b(?:sont|est) (?:obligatoires?|requis|toujours presents?)\b/ },
    ],
    unless: new RegExp(String.raw`\b(?:${NEGATION}|only (?:the )?(?:last|final)|last hops?|final hops?|toward|towards|derniers? sauts?|vers le destinataire)\b`),
    correction: {
      en: 'Correction: route hints are optional. They help a payer reach the recipient, often through unannounced channels that they can expose, but they do not show the path the payment will take; the payer’s wallet computes that route.',
      fr: 'Correction : les indices de routage sont facultatifs. Ils aident le payeur à joindre le destinataire, souvent par des canaux non annoncés qu’ils peuvent révéler, mais ne montrent pas le trajet que prendra le paiement ; c’est le portefeuille du payeur qui calcule ce chemin.',
    },
  },
  {
    id: 'lightning-invoice-edit',
    notes: ['lightning-invoice-contents'],
    patterns: [
      // "Would you like to know how to obfuscate the invoice text further before posting it?"
      { test: /\b(?:obfuscat\w*|redact\w*|blank(?:ing)? out|black(?:ing)? out|mask(?:ing)?|scrambl\w*|blur(?:ring)?|edit(?:ing)?|alter(?:ing)?|modify(?:ing)?|truncat\w*|hid(?:e|ing) (?:part|parts|some|portions?) of)\b[^.!?]{0,40}\b(?:the |your |this |that |part of the |parts of the |some of the |portions? of the )?(?:invoice|bolt ?11|payment request)\b/ },
      { test: /\b(?:masqu\w*|flout\w*|caviard\w*|brouill\w*|obscurci\w*|modifi\w*|retouch\w*|alter\w*|tronqu\w*|cach\w* (?:une partie|certains champs|des champs|une portion))\b[^.!?]{0,40}\b(?:la |ta |votre |cette |une partie de la |une partie de ta |une partie de votre )?(?:facture|bolt ?11)\b/ },
    ],
    unless: new RegExp(String.raw`\b(?:${NEGATION}|invalid\w*|break\w*|broken|no longer|unpayable|reject\w*|impossible|instead|plutot|casse\w*|plus payable)\b`),
    correction: {
      en: 'Correction: a BOLT11 invoice cannot be partly hidden or edited and still be paid, because its checksum and signature cover the whole text. To ask for help, describe the problem or share only the decoded fields you are comfortable revealing; anyone with the full invoice can read its amount and payee node key.',
      fr: 'Correction : une facture BOLT11 ne peut pas être partiellement masquée ou retouchée et rester payable, car sa somme de contrôle et sa signature couvrent tout le texte. Pour demander de l’aide, décris le problème ou partage seulement les champs décodés que tu acceptes de révéler ; quiconque a la facture complète peut lire son montant et la clé du nœud destinataire.',
    },
  },
  {
    id: 'issuance-fees-new-coins',
    notes: ['bitcoin-issuance-validation'],
    evaluateAnswer: coinbaseCeilingIssuanceContradiction,
    unlessSentence: REFUTATION,
    clauseScoped: true,
    unlessScope: 'match',
    patterns: [
      { test: /\bemettre plus que (?:ce|le) plafond\b[^.!?;]{0,35}\bsubvention\b[^.!?;]{0,15}\b(?:et|plus)\b[^.!?;]{0,15}\bfrais\b/ },
      // "This sum" is meaningful only after the explicit subsidy+fees sum.
      { test: /\b(?:this|that) (?:sum|total) (?:exceeds?|is greater than) (?:the )?(?:permitted|allowed|authorized|new) issuance\b/,
        previousSentence: /^(?!.*\b(?:not|never|don't|doesn't)\b).*\b(?:nodes? (?:calculate|calculates|compute|computes)|sum is)\b[^.!?]{0,80}\bsubsid\w*\b[^.!?]{0,35}\b(?:and|plus)\b[^.!?]{0,25}\bfees\b/ },
      { test: /\b(?:cette somme|ce total) (?:depasse|est superieur a) (?:l'|la )?(?:emission|creation monetaire)\b/,
        previousSentence: /^(?!.*\b(?:pas|jamais)\b).*\b(?:noeuds? calcul\w*|somme est)\b[^.!?]{0,80}\bsubvention\b[^.!?]{0,35}\b(?:et|plus)\b[^.!?]{0,25}\bfrais\b/ },
      { test: /\b(?:transaction )?fees?\b[^.!?]{0,40}\b(?:are|is|count as|counts as|become|becomes|represent|represents|also)\b[^.!?]{0,20}\b(?:new(?:ly)? (?:issued|created|minted)|new (?:bitcoins?|coins|money|issuance)|(?:part of )?(?:the )?(?:new )?issuance|freshly (?:minted|created))\b/ },
      { test: /\b(?:issuance|new (?:bitcoins?|coins|money)|newly (?:issued|created|minted) (?:bitcoins?|coins))\b[^.!?]{0,120}\b(?:subsid\w*|block reward)\b[^.!?]{0,40}\b(?:plus|and|\+)\b[^.!?]{0,30}\b(?:the )?(?:transaction )?fees\b/, unlessInContext: REWARD_SUBSIDY_COMPONENT },
      // Real UI variant: the sum appears before the wrongly stated issuance cap.
      { test: /\b(?:subsid\w*|block reward)\b[^.!?]{0,40}\b(?:plus|and)\b[^.!?]{0,30}\b(?:transaction )?fees\b[^.!?]{0,25}\b(?:must not|should not|may not|cannot|can not|can't|does not|doesn't|do not|don't)\s+exceed\b[^.!?]{0,35}\b(?:issuance|new (?:coins|bitcoins|money))\b/ },
      { test: /\b(?:subvention|recompense de bloc)\b[^.!?]{0,40}\b(?:plus|et)\b[^.!?]{0,30}\bfrais\b[^.!?]{0,25}\bne (?:doit|doivent|peut|peuvent) pas depasser\b[^.!?]{0,35}\b(?:emission|creation monetaire|nouveaux bitcoins)\b/ },
      // "The total issuance cannot exceed the sum of these two values."
      { test: /\b(?:total |new )?issuance\b[^.!?]{0,60}\b(?:sum of|exceed|exceeds|limit)\b[^.!?]{0,40}\b(?:these two|both|subsidy and fees|subsidy plus fees|subsidy and the fees|subsidy plus the fees)\b/ },
      { test: /\bfrais\b[^.!?]{0,40}\b(?:sont|est|constituent|deviennent|comptent comme)\b[^.!?]{0,20}\b(?:de nouveaux bitcoins|des bitcoins (?:nouvellement )?crees|nouvellement (?:emis|crees)|de la creation monetaire|une emission|de l'emission)\b/ },
      { test: /\b(?:emission|creation monetaire|nouveaux bitcoins|bitcoins? (?:nouvellement )?crees)\b[^.!?]{0,120}\b(?:subvention|recompense de bloc)\b[^.!?]{0,40}\b(?:plus|et|\+)\b[^.!?]{0,30}\b(?:les )?frais\b/, unlessInContext: REWARD_SUBSIDY_COMPONENT },
    ],
    // Only a denial of the matched issuance relationship is exculpatory.
    // A later "must not exceed" denies exceeding a limit, not the inclusion
    // of fees in new issuance (real UI regression, 2026-11-10).
    unless: /\b(?:(?:isn't|aren't|cannot be|can't be) (?:the |equal to |the sum of )?(?:subsid\w*|block reward|new(?:ly)?|issuance)|(?:not|never) (?:new(?:ly)?|part of (?:the )?(?:new )?issuance)|(?:not (?:the )?|pas (?:la )?|non (?:la )?)(?:subsid\w*|subvention)[^.!?]{0,30}(?:plus|and|et)[^.!?]{0,15}(?:fees|frais)|(?:are|is|count as|counts as|represent|represents|constitute|constitutes)\s+(?:not|never)\s+(?:(?:newly )?(?:issued|created|minted) as |part of (?:the )?)?(?:new(?:ly)?|issuance)|(?:is|are|equals?|comprises?|includes?|consists? of)\s+(?:not|never)\s+(?:equal to |the sum of |the )?(?:subsid\w*|block reward)|(?:sont|est|constituent|deviennent|comptent comme)\s+(?:pas|jamais)\s+(?:de |des |une |l'|de l'|la )?(?:nouveaux|nouvellement|bitcoins (?:nouvellement )?crees|creation monetaire|emission|subvention|recompense))\b/,
    correction: {
      en: 'Correction: the coinbase ceiling S + F includes existing fees, so it is not the maximum NEW issuance. S is the permitted subsidy, F the existing transaction fees and C the actual coinbase claim. A valid C must be at most S + F; the actual net supply increase is C - F, at most S. If C is below S + F, the net increase is below S because the miner underclaims. Fees are transferred, not newly created.',
      fr: 'Correction : le plafond coinbase S + F inclut les frais existants ; ce n’est pas le maximum de NOUVEAUX bitcoins. S est la subvention permise, F les frais existants et C le montant coinbase réellement réclamé. C doit être au plus S + F ; l’augmentation nette vaut C - F, au plus S. Si C est inférieur à S + F, l’augmentation nette est inférieure à S parce que le mineur réclame moins que le plafond. Les frais sont transférés, pas créés.',
    },
  },
  {
    id: 'transaction-fee-weight-value',
    notes: ['bitcoin-issuance-validation', 'transaction-fees', 'transaction-inputs-outputs'],
    clauseScoped: true,
    unlessSentence: REFUTATION,
    unlessScope: 'match',
    unless: /\b(?:not|never|ne|pas|jamais)\b/,
    patterns: [
      { test: /\bfees?\b[^.!?;:]{0,130}\bdifference between (?:the )?(?:transaction )?(?:weight|size)\b[^.!?;:]{0,35}\band (?:its |the |their )?value\b/ },
      { test: /\bfrais\b[^.!?;:]{0,130}\bdifference entre (?:le poids|la taille)\b[^.!?;:]{0,35}\bet (?:sa |la |leur )?valeur\b/ },
    ],
    correction: {
      en: 'Correction: a transaction fee is the sum of its input values minus the sum of its output values, all measured in bitcoin or satoshis. It is not transaction weight or size minus value. A fee rate multiplied by virtual size can be used to estimate a fee; transaction fees transfer existing coins to the miner.',
      fr: 'Correction : les frais d’une transaction sont la somme des valeurs de ses entrées moins la somme des valeurs de ses sorties, exprimées en bitcoins ou satoshis. Ce n’est pas une différence entre le poids ou la taille et la valeur. Un taux de frais multiplié par la taille virtuelle permet d’estimer des frais ; ceux-ci transfèrent des bitcoins existants au mineur.',
    },
  },
  {
    id: 'issuance-weight-value',
    notes: ['bitcoin-issuance-validation'],
    unlessSentence: REFUTATION,
    patterns: [
      { test: /\b(?:(?:coinbase |total )?(?:amount|value)|(?:block )?(?:subsidy|reward))\s+(?:must not exceed|cannot exceed|does not exceed|is (?:capped|limited) by)\s+(?:the )?(?:block(?:'s)? )?(?:weight|size) limit\b/ },
      { test: /\b(?:montant(?: total)?|valeur(?: totale)?|subvention|recompense)\s+(?:ne (?:doit|peut) pas depasser|ne depasse pas|est limitee? par|est plafonnee? par)\s+(?:la )?limite de (?:poids|taille)\b/ },
    ],
    correction: {
      en: 'Correction: nodes compare the monetary value of coinbase outputs with the permitted subsidy for that height plus fees from included transactions. A block weight or size limit is a separate check, not the permitted amount of bitcoins. Nodes reject a coinbase value exceeding subsidy plus fees even when the block has valid weight and proof of work.',
      fr: 'Correction : les nœuds comparent la valeur monétaire des sorties de coinbase à la subvention autorisée pour cette hauteur plus les frais des transactions incluses. La limite de poids ou de taille du bloc est un contrôle distinct, pas un montant de bitcoins autorisé. Une coinbase dépassant subvention plus frais est rejetée même si le poids et la preuve de travail sont valides.',
    },
  },
  {
    id: 'signature-sets-spending-conditions',
    notes: ['transaction-inputs-outputs'], clauseScoped: true, unlessSentence: REFUTATION,
    patterns: [
      { test: /\bsignatures?\s+(?:(?:authorize|authorise|autorisent)\s+(?:spending|la depense)\s+(?:and|et)\s+)?(?:definissent|specifient|define|defines|specify|specifies)\s+(?:simplement |simply )?(?:la |les |the )?(?:conditions?|spending conditions?)\b/ },
    ],
    correction: {
      en: 'Correction: previous output scripts set the spending conditions. Signatures can satisfy those conditions and authorize a spend; signatures do not define the conditions.',
      fr: 'Correction : les scripts des anciennes sorties fixent les conditions de dépense. Les signatures peuvent satisfaire ces conditions et autoriser une dépense ; elles ne définissent pas les conditions.',
    },
  },
  {
    id: 'signature-reveals-change',
    notes: ['transaction-inputs-outputs'],
    clauseScoped: true,
    unlessScope: 'match',
    unlessSentence: REFUTATION,
    patterns: [
      { test: /\bsignatures?\b[^.!?;]{0,85}\b(?:qui a (?:paye|recu)|who (?:paid|received))\b/ },
      { test: /\b(?:savoir a qui appartient|identifier le proprietaire|identify the owner|know who owns)\b[^.!?;]{0,90}\b(?:analy\w*|examin\w*|inspect\w*|check\w*|verifi\w*)\b[^.!?;]{0,65}\bsignatures?\b/,
        unlessInContext: {prefix: /\b(?:impossible de |cannot |can't |not possible to )$/, claim: /./} },

      { test: /\b(?:identite|proprietaire|ownership|identity|owner)\b[^.!?;]{0,100}\b(?:deduit\w*|deduc\w*|identifi\w*|reveal\w*|determin\w*)\b[^.!?;]{0,75}\bsignatures?\b/,
        unless: /\b(?:ne peut (?:pas |jamais )?(?:etre )?deduit\w*(?!\s+que\b)|cannot|can't|not|never)\b/ },
      { test: /\b(?:signatures?|signing|signed)\b[^.!?]{0,100}\b(?:which (?:output|one) is (?:the |your )?change|(?:identif\w*|reveal\w*|show\w*|tell\w*|determin\w*|prove\w*|indicat\w*) (?:the |your )?(?:change|owner\w*|which output)|who owns)\b/ },
      // "which output belongs to you versus your change ... without verifying the signatures on the inputs"
      { test: /\b(?:which (?:specific )?output|(?:the )?change output|belongs? to (?:you|whom)|versus your change|is (?:your |the )?change)\b[^.!?]{0,120}\b(?:verif\w*|check\w*|inspect\w*|examin\w*|consult\w*|look\w* at)\b[^.!?]{0,30}\bsignatures?\b/,
        unlessInContext: {prefix: /\b(?:cannot|can't|do not|don't|does not|doesn't)\s+(?:prove|determine|identify|know|tell)\s*$/, claim: /^(?!.*\bwithout\b)/} },
      { test: /\bsignatures?\b[^.!?]{0,100}\b(?:quelle sortie est (?:la |ta |votre )?monnaie|(?:identifi\w*|revel\w*|montr\w*|indiqu\w*|determin\w*|prouv\w*) (?:la |le |ta |votre )?(?:monnaie|proprietaire|quelle sortie))\b/ },
      { test: /\b(?:quelle sortie|la monnaie rendue|appartient)\b[^.!?]{0,120}\b(?:verifi\w*|control\w*|examin\w*|consult\w*|regard\w*)\b[^.!?]{0,30}\bsignatures?\b/,
        unless: /\b(?:avec ou sans|meme sans)\b/,
        unlessInContext: {prefix: /\b(?:ne peut pas|ne peux pas|impossible de)\s+(?:identifier|prouver|determiner)\s*$/, claim: /^(?!.*\bsans\b)/} },
    ],
    unless: /\b(?:only prove|prove only|proves only|only show|do not|don't|does not|doesn't|cannot (?:reveal|prove|identify|determine)|can't (?:reveal|prove|identify|determine)|never reveal|not reveal|ne (?:montrent|revelent|prouvent|indiquent|disent)|n'indiquent|ne permettent pas|ne (?:peuvent|peut) pas (?:identifier|reveler|prouver|determiner|montrer)|prouvent seulement|seulement le droit|authoriz\w*|authoris\w*|autoris\w*|right to spend|droit de)\b/,
    correction: {
      en: 'Correction: prior output scripts set spending conditions; signatures help satisfy those conditions, not define them. Input signatures only prove the right to spend those inputs. They do not show which output is change or who owns an output; an observer can only guess change with heuristics, without certainty.',
      fr: 'Correction : les scripts des anciennes sorties fixent les conditions de dépense ; les signatures servent à satisfaire ces conditions, pas à les définir. Les signatures des entrées prouvent seulement le droit de dépenser ces entrées. Elles ne montrent ni quelle sortie est la monnaie, ni à qui appartient une sortie ; un observateur ne peut que supposer la monnaie par heuristiques, sans certitude.',
    },
  },
  {
    id: 'alice-app-key-check',
    notes: [],
    always: true,
    patterns: [
      // "Alice App peut t'aider à vérifier si tes clés permettent de signer une sortie"
      { test: /\b(?:alice app|l'app alice|l'application alice)\b[^.!?]{0,40}\b(?:can|could|will|may|peut|pourra|pourrait|va|helps?|aide|t'aide|vous aide|t'aider|vous aider)\b[^.!?]{0,40}\b(?:verif\w*|check\w*|test\w*|control\w*|examin\w*|inspect\w*|read|reads|reading|lire|scan\w*)\b[^.!?]{0,40}\b(?:cles?|keys?|seed|phrase de recuperation|recovery phrase|signatures?)\b/ },
      // "Alice peut vérifier ta phrase de récupération": the name alone counts
      // only when the keys are the user's own, which an Alice-and-Bob example never says.
      { test: /\balice\b[^.!?]{0,40}\b(?:can|could|will|may|peut|pourra|pourrait|va|helps?|aide|t'aide|vous aide|t'aider|vous aider)\b[^.!?]{0,40}\b(?:verif\w*|check\w*|test\w*|control\w*|examin\w*|inspect\w*|read|reads|reading|lire|scan\w*)\b[^.!?]{0,40}\b(?:your|ta|ton|tes|votre|vos)\b[^.!?]{0,20}\b(?:cles?|keys?|seed|phrase de recuperation|recovery phrase|signatures?)\b/ },
    ],
    unless: new RegExp(String.raw`\b(?:${NEGATION}|explain\w*|expliqu\w*|understand|comprendre|learn|apprendre|shows? (?:you )?how|montrer comment|in your (?:own )?wallet|dans ton (?:propre )?portefeuille|dans votre (?:propre )?portefeuille)\b`),
    unlessScope: 'span',
    // "Alice and Bob" name the parties of a cryptographic example.
    unlessSentence: /\b(?:alice (?:and|et|&) bob|bob (?:and|et|&) alice)\b/,
    correction: {
      en: 'Correction: Alice App cannot read or check your keys, and it cannot build, sign or broadcast a real transaction. Do this in your own wallet, and never share a recovery phrase or private keys.',
      fr: 'Correction : Alice App ne peut ni lire ni vérifier tes clés, et ne construit, ne signe ni ne diffuse de vraie transaction. Fais-le dans ton propre portefeuille, sans jamais partager de phrase de récupération ni de clés privées.',
    },
  },
];

const RULES_BY_NOTE = new Map(ANSWER_RULES.map(rule => [rule.noteId, rule]));

export function normalizeAnswerText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘ʼ]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[‐-―−]/g, '-')
    .replace(/ /g, ' ')
    .replace(/œ/g, 'oe')
    .toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Titles of the other locale variants of each rule's notes (an English
// translation of a French fiche), filled from the corpus when it loads.
const variantTitles = new Map<string, readonly string[]>();

/**
 * Lets a rule follow its notes into every locale: the corpus loader passes
 * its chunks, and each rule also recognizes the titles of the variants that
 * share the conceptId of its source note or of an additional source title.
 */
export function registerAnswerRuleVariantTitles(chunks: readonly { conceptId?: string; title: string }[]): void {
  variantTitles.clear();
  for (const rule of ANSWER_RULES) {
    const known = new Set([rule.title, ...(rule.legacyTitles ?? []), ...(rule.additionalSourceTitles ?? [])]);
    const concepts = new Set([rule.sourceConceptId, ...(rule.additionalSourceConceptIds ?? []), ...chunks
      .filter(chunk => chunk.conceptId && (rule.additionalSourceTitles ?? []).includes(chunk.title))
      .map(chunk => chunk.conceptId!)]);
    const titles = [...new Set(chunks.filter(chunk => chunk.conceptId && concepts.has(chunk.conceptId) && !known.has(chunk.title))
      .map(chunk => chunk.title))];
    if (titles.length) variantTitles.set(rule.noteId, titles);
  }
}

/**
 * The rule notes present in a retrieved-knowledge text, in the order the
 * retrieval wrote them. The detection reads the "Topic:" line the retrieval
 * formats for every note (rag.ts), so it reflects exactly what the model sees,
 * including a note dropped by the context fit.
 */
export function answerRuleNoteIdsIn(text: string): string[] {
  if (!text) return [];
  const found: { index: number; noteId: string }[] = [];
  for (const rule of ANSWER_RULES) {
    const matches = [rule.title, ...(rule.legacyTitles ?? []), ...(rule.additionalSourceTitles ?? []), ...(variantTitles.get(rule.noteId) ?? [])]
      .flatMap(title => {
        const match = new RegExp(`^Topic: ${escapeRegExp(title)}$`, 'm').exec(text);
        return match ? [match.index] : [];
      });
    if (matches.length) found.push({ index: Math.min(...matches), noteId: rule.noteId });
  }
  for (const entry of DICTIONARY_NOTE_LINES) {
    const match = entry.line.exec(text);
    if (match) found.push({ index: match.index, noteId: entry.noteId });
  }
  return found.sort((a, b) => a.index - b.index).map(entry => entry.noteId);
}

/** The rule notes a prepared history carries in its system turns. */
export function answerRuleNoteIdsInMessages(messages: readonly { role: string; content: string }[]): string[] {
  return answerRuleNoteIdsIn(messages.filter(message => message.role === 'system').map(message => message.content).join('\n'));
}

/**
 * Of the rule notes found in context, those whose rules have no subject or
 * whose subject the user's recent turns name. The text is the question with
 * the last user turns, so a follow-up on Ark keeps the Ark rules while a
 * mempool question next to a retrieved Ark note gets none of them.
 */
export function answerRuleNoteIdsOnSubject(noteIds: readonly string[], recentUserText: string): string[] {
  const text = normalizeAnswerText(recentUserText);
  return noteIds.filter(noteId => {
    const subject = RULES_BY_NOTE.get(noteId)?.subject ?? DICTIONARY_NOTE_LINES.find(entry => entry.noteId === noteId)?.subject;
    return !subject || subject.test(text)
      || noteId === 'child-pays-for-parent' && recentUserText.split('\n').some(isImplicitCpfpQuestion)
      || noteId === 'bitcoin-issuance-validation' && recentUserText.split('\n').some(isMonetaryIssuanceQuestion)
      || noteId === 'lightning-payment-privacy' && recentUserText.split('\n').some(isLightningPrivacyQuestion);
  });
}

const BLOCK_HEADER = '[Answer rules]';

const BLOCK_TEXT: Readonly<Record<SupportedLanguage, { intro: string; state: string; never: string }>> = {
  fr: {
    intro: "Les notes récupérées rendent obligatoires les points ci-dessous pour cette réponse. Formule chacun d'eux avec tes mots, dans l'ordre qui convient à la question, et n'affirme jamais l'inverse.",
    state: 'À dire :',
    never: 'À ne jamais affirmer :',
  },
  en: {
    intro: 'The retrieved notes make the points below mandatory for this answer. State each of them in your own words, in the order that fits the question, and never claim the opposite.',
    state: 'State:',
    never: 'Never claim:',
  },
};

function renderBlock(language: SupportedLanguage, state: string[], never: string[]): string {
  const text = BLOCK_TEXT[language];
  const parts = [BLOCK_HEADER, text.intro];
  if (state.length > 0) parts.push(text.state, ...state.map(line => `- ${line}`));
  if (never.length > 0) parts.push(text.never, ...never.map(line => `- ${line}`));
  return parts.join('\n');
}

/**
 * The instruction block for the rule notes of a turn, or '' when none is in
 * context. Sentences shared by two notes appear once. When the merged lines
 * exceed the budget, the last never-claim lines give way first, then the last
 * mandatory points, so the block never crowds out the notes themselves.
 */
export function answerRulesBlock(noteIds: readonly string[], language: SupportedLanguage, maxChars = ANSWER_RULES_MAX_CHARS, question = ''): string {
  const rules = noteIds.map(id => RULES_BY_NOTE.get(id)).filter((rule): rule is AnswerRule => Boolean(rule));
  // Specific recovery/payment-state conditions must survive before broader
  // backup/liquidity advice when both selected notes share the bounded block.
  const priority = (rule: AnswerRule) => rule.noteId === 'majority-hashpower' ? 3 : rule.noteId === 'child-pays-for-parent' ? 2 : rule.noteId === 'bip39-passphrase' || rule.noteId === 'lightning-invoice' || rule.noteId === 'lightning-revoked-state' ? 1 : 0;
  rules.sort((a, b) => priority(b) - priority(a));
  if (rules.length === 0) return '';
  const routeFailure = /\b(?:aucun chemin|no (?:route|path)|cannot find (?:any )?(?:route|path)|failed route|echec du routage)\b/.test(normalizeAnswerText(question));
  // Keep the current follow-up's facts before invoice setup, which is not
  // being asked again. Reorder canonical text only; never inject user prose.
  const state = [...new Set(rules.flatMap(rule => {
    const points = rule.mustState[language];
    return rule.noteId === 'lightning-payment-mechanics' && routeFailure
      ? [points[3], points[4], points[1], points[2], points[0]] : points;
  }))];
  const never = [...new Set(rules.flatMap(rule => rule.neverClaim[language]))];
  let block = renderBlock(language, state, never);
  while (block.length > maxChars && (never.length > 0 || state.length > 0)) {
    if (never.length > 0) never.pop();
    else state.pop();
    block = renderBlock(language, state, never);
  }
  return block.length <= maxChars ? block : '';
}

function sentencesOf(text: string): string[] {
  // Compare meaning-bearing prose, not Markdown delimiters. Keep the output
  // untouched; "not **new bitcoins**" and "**new bitcoins**" need the same
  // lexical treatment on both sides of the negation check.
  const plain = text.replace(/(?<!\w)(\*{1,3}|_{1,3})(?=\S)([^\n]*?\S)\1(?!\w)/g, '$2');
  return normalizeAnswerText(plain).split(/(?<=[.!?])\s+|\n+/).map(sentence => sentence.trim()).filter(Boolean);
}

/** Every correction sentence an answer already carries, in either language. */
/** The correction as displayed: without the sentences meant for the model. */
function displayedCorrection(check: NeverClaimCheck, language: SupportedLanguage): string {
  let text = check.correction[language];
  for (const part of check.modelOnly?.[language] ?? []) {
    const at = text.indexOf(part);
    if (at === -1) continue;
    const rest = text.slice(at + part.length).trimStart();
    text = (text.slice(0, at) + rest.charAt(0).toUpperCase() + rest.slice(1)).trimEnd();
  }
  return text;
}

export function answerRuleCorrectionsIn(answer: string): string[] {
  const found: string[] = [];
  for (const check of NEVER_CLAIM_CHECKS) {
    for (const language of SUPPORTED_LANGUAGE_CODES) {
      const correction = displayedCorrection(check, language);
      if (answer.includes(correction) && !found.includes(correction)) found.push(correction);
    }
  }
  return found;
}

function sentenceClaims(check: NeverClaimCheck, sentence: string, previousSentence = ''): boolean {
  // In a monetary explanation, "fees are not new coins; total issuance is
  // subsidy plus fees" contains two independent claims. A correct denial
  // in one must not exempt the other. Preserve additive "subsidy and fees".
  const clauses = check.clauseScoped
    ? sentence.split(/\s*;\s*|\s*,?\s*\b(?:but|however|while|whereas|mais|pourtant|neanmoins|tandis que)\b\s*|(?:\s*,\s*|\s*,?\s*\b(?:and|et)\s+)(?=(?:the |les |la |le )?(?:(?:transaction )?(?:fees|frais)\s+(?:are|is|ne sont|sont|represent|representent)|coinbase(?: outputs?)?\s+(?:must|may|can|doit|peut)|miner\s+(?:may|can)|mineur\s+peut)\b)/)
    : [sentence];
  for (const clause of clauses) {
    for (const pattern of check.patterns) {
      if (pattern.previousSentence && !pattern.previousSentence.test(previousSentence)) continue;
      const match = pattern.test.exec(clause);
      if (!match) continue;
      if (pattern.unlessMatch?.test(match[0])) continue;
      if (pattern.unless?.test(clause)) continue;
      if (pattern.unlessInContext?.prefix.test(clause.slice(0, match.index))
        && pattern.unlessInContext.claim.test(match[0])) continue;
      if (check.unlessSentence?.test(clause)) continue;
      if (check.unless) {
        const scope = check.unlessScope === 'match' ? match[0]
          : check.unlessScope === 'span'
            ? clause.slice(Math.max(0, match.index - 30), match.index + match[0].length + 30)
            : clause;
        if (check.unless.test(scope)) continue;
      }
      return true;
    }
  }
  return false;
}

export type AnswerRuleRepairGuidance = {
  id: string;
  /** Only source rule IDs present in the caller's active turn. */
  noteIds: string[];
  correction: string;
};

/** Resolve trusted repair text by identity; caller/model text is never copied. */
export function answerRuleRepairGuidance(
  checkIds: readonly string[],
  language: SupportedLanguage,
  noteIds: readonly string[],
): AnswerRuleRepairGuidance[] {
  const requested = new Set(checkIds);
  const active = new Set(noteIds);
  return NEVER_CLAIM_CHECKS.flatMap(check => {
    if (!requested.has(check.id)) return [];
    const sources = check.notes.filter(note => active.has(note));
    if (!check.always && sources.length === 0) return [];
    return [{ id: check.id, noteIds: [...new Set(sources)], correction: check.correction[language] }];
  });
}

export type AnswerRuleCheckResult = {
  text: string;
  /** Ids of the checks that matched and whose correction was appended. */
  applied: string[];
};

/** Detect remaining claims independently from whether a correction was already
 * appended. A model may copy the supplied correction while retaining its false
 * claim; deduplicating displayed corrections must never certify that draft. */
export function answerRuleViolationsIn(
  answer: string, noteIds: readonly string[], question = '', previousUserQuestion = '',
): string[] {
  if (!answer.trim()) return [];
  const active = new Set(noteIds);
  const scanned = answerRuleCorrectionsIn(answer).reduce((text, correction) => text.split(correction).join(' '), answer);
  const sentences = sentencesOf(scanned);
  const normalizedQuestion = normalizeAnswerText(question);
  return NEVER_CLAIM_CHECKS.filter(check =>
    (check.always || check.notes.some(note => active.has(note)))
    && !(check.unlessQuestion && check.unlessQuestion.test(normalizedQuestion))
    && (check.evaluateAnswer?.(scanned, question, previousUserQuestion) || sentences.some((sentence, index) => sentenceClaims(check, sentence, sentences[index - 1]))),
  ).map(check => check.id);
}

/**
 * Tests the answer against the never-claim patterns of the notes that were in
 * context and appends each triggered correction once, in the user's language,
 * after the answer. A correction already present is never repeated, and the
 * correction text itself is not scanned.
 */
export function withAnswerRuleCorrections(
  answer: string,
  language: SupportedLanguage,
  noteIds: readonly string[],
  question = '',
  previousUserQuestion = '',
): AnswerRuleCheckResult {
  if (!answer.trim()) return { text: answer, applied: [] };
  const existing = answerRuleCorrectionsIn(answer);
  const violations = new Set(answerRuleViolationsIn(answer, noteIds, question, previousUserQuestion));
  const applied: string[] = [];
  const corrections: string[] = [];
  for (const check of NEVER_CLAIM_CHECKS) {
    if (!violations.has(check.id) || check.repairOnly) continue;
    const correction = displayedCorrection(check, language);
    if (existing.includes(correction) || corrections.includes(correction)) continue;
    applied.push(check.id);
    corrections.push(correction);
  }
  if (corrections.length === 0) return { text: answer, applied };
  return { text: `${answer.trimEnd()}\n\n${corrections.join('\n\n')}`, applied };
}
