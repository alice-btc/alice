// Answer rules: the points a retrieved note makes mandatory, and the claims
// it rules out. The measured models (Qwen3.5 9B on 2026-10-06, the Private
// Cloud model the same day) kept inverting three subjects with the right
// note in front of them: an Ark exit presented as depending on the operator,
// a multisig quorum inflated to "all three signatures", a replacement made
// conditional on an opt-in flag. Two deterministic layers answer that
// without replacing generation by canned text:
//
// 1. When one of these notes is in the retrieved context of a turn, a short
//    instruction block built from its rules rides with the context
//    (generation-context.ts). It is bounded so it always fits the local
//    context budget next to the notes themselves.
// 2. After generation, each sentence of the answer is tested against the
//    never-claim patterns of the notes that were in context. A match appends
//    a short correction in the user's language, in the spirit of the
//    live-value caveat (live-value-caveat.ts). The answer is never rewritten
//    or blocked, and the match is reported in the generation diagnostics.
//
// The rules are keyed by note id and kept out of the knowledge packs: they
// are instructions for the model and for the output guard, not retrievable
// text, so they change neither the pack schema nor the corpus hash.

import type { SupportedLanguage } from './language-policy.ts';

type Localized = Record<SupportedLanguage, string>;

export type AnswerRule = {
  /** Stable rule identity retained for existing diagnostics and saved contexts. */
  noteId: string;
  sourceConceptId: string;
  /** Prior titles only support saved contexts; they never import retired prose. */
  legacyTitles?: readonly string[];
  /** Additional selected fiches carrying the same safety conditions. */
  additionalSourceTitles?: readonly string[];
  /** The title the retrieval formats as "Topic: <title>" (rag.ts). */
  title: string;
  mustState: Record<SupportedLanguage, readonly string[]>;
  neverClaim: Record<SupportedLanguage, readonly string[]>;
};

export type ClaimPattern = {
  /** Tested on each normalized sentence of the answer. */
  test: RegExp;
  /** A sentence that also matches this states something else. */
  unless?: RegExp;
};

export type NeverClaimCheck = {
  id: string;
  /** Active only when one of these notes was in the retrieved context. */
  notes: readonly string[];
  /** Any matching pattern counts. */
  patterns: readonly ClaimPattern[];
  /**
   * Denial or hedge words. Tested on the whole sentence, or, with the
   * 'span' scope, on the matched claim and a short margin around it, so
   * a negation elsewhere in a long French sentence does not hide the claim.
   */
  unless?: RegExp;
  unlessScope?: 'sentence' | 'span';
  /**
   * Tested on the whole sentence whatever the scope of `unless`: a question,
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
  en: "The operator coordinates normal payments and can stop cooperating. Guarantees depend on the VTXO type; arkoor transfers add a temporary non-collusion assumption involving former senders and the server.",
  fr: "L’opérateur coordonne les paiements et peut cesser de coopérer. Les garanties dépendent du type de VTXO ; un transfert arkoor ajoute une hypothèse temporaire de non-collusion entre anciens émetteurs et serveur.",
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

export const ANSWER_RULES: readonly AnswerRule[] = [
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
      en: [NO_OPERATOR_BLOCK.en, NO_FUNDS_LOST.en, NO_EXPIRY_INVERSION.en, NO_INSTANT_EXIT.en],
      fr: [NO_OPERATOR_BLOCK.fr, NO_FUNDS_LOST.fr, NO_EXPIRY_INVERSION.fr, NO_INSTANT_EXIT.fr],
    },
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
      en: [NO_OPERATOR_BLOCK.en, NO_FUNDS_LOST.en, NO_EXPIRY_INVERSION.en],
      fr: [NO_OPERATOR_BLOCK.fr, NO_FUNDS_LOST.fr, NO_EXPIRY_INVERSION.fr],
    },
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
        'that Alice Wallet can import the seeds or rebuild a multisig wallet, or any Alice feature absent from the notes',
      ],
      fr: [
        "qu'un portefeuille 2 de 3 a besoin de trois signatures ou de la troisième seed",
        "que le portefeuille de l'utilisateur est un 3 de 3, ou tout seuil qu'il n'a pas indiqué",
        'que les seeds seules garantissent la récupération',
        "qu'Alice Wallet peut importer les seeds ou reconstruire un portefeuille multisig, ou toute fonction d'Alice absente des notes",
      ],
    },
  },
  {
    noteId: 'replace-by-fee',
    sourceConceptId: 'replace-by-fee',
    title: 'Augmenter les frais avec RBF',
    legacyTitles: ['Replace-by-fee'],
    mustState: {
      en: [CONFIRMED_IS_FINAL.en, REPLACEMENT_CONDITIONS.en, FULL_RBF.en, NO_SECOND_PAYMENT.en],
      fr: [CONFIRMED_IS_FINAL.fr, REPLACEMENT_CONDITIONS.fr, FULL_RBF.fr, NO_SECOND_PAYMENT.fr],
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
    mustState: {
      en: [CONFIRMED_IS_FINAL.en, REPLACEMENT_CONDITIONS.en, FULL_RBF.en, NO_SECOND_PAYMENT.en],
      fr: [CONFIRMED_IS_FINAL.fr, REPLACEMENT_CONDITIONS.fr, FULL_RBF.fr, NO_SECOND_PAYMENT.fr],
    },
    neverClaim: {
      en: [NO_REVERSAL.en, NO_OPT_IN_PRECONDITION.en, NO_SECOND_PAYMENT_REMEDY.en],
      fr: [NO_REVERSAL.fr, NO_OPT_IN_PRECONDITION.fr, NO_SECOND_PAYMENT_REMEDY.fr],
    },
  },
];

const ARK_NOTES = ['ark-rounds-exits', 'asp-operator'] as const;
const RBF_NOTES = ['replace-by-fee', 'transaction-finality'] as const;

const ARK_EXIT_CORRECTION: Localized = {
  en: "Correction: with valid exit data and enough time to complete the exit before expiry, a unilateral exit requires no operator approval. The wallet must publish the required transactions and allow for fees, confirmations and timelocks. The operator stopping cooperation alone does not remove this path. After expiry, or without the necessary data or time, recovery is not guaranteed and may depend on the operator. VTXO type and implementation matter, including the temporary non-collusion assumption for arkoor transfers.",
  fr: "Correction : avec les données valides et assez de temps pour achever la sortie avant expiration, une sortie unilatérale ne demande pas l’accord de l’opérateur. Le wallet doit publier les transactions et prévoir frais, confirmations et timelocks. Le seul arrêt de coopération ne supprime pas ce chemin. Après expiration, ou sans les données ou le temps nécessaires, la récupération n’est pas garantie et peut dépendre de l’opérateur. Le type de VTXO et l’implémentation comptent, notamment l’hypothèse temporaire de non-collusion pour les transferts arkoor.",
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
  en: 'Note: nothing in the notes available here describes a multisig import or restore feature in Alice Wallet. Follow the documentation of the wallet that created the multisig, and never send seeds or keys to anyone.',
  fr: "Précision : rien dans les notes disponibles ici ne décrit une fonction d'import ou de restauration multisig dans Alice Wallet. Suis la documentation du portefeuille qui a créé le multisig, et n'envoie jamais tes seeds ni tes clés à qui que ce soit.",
};
const RBF_OPT_IN_CORRECTION: Localized = {
  en: 'Correction: a replacement does not require that RBF was enabled or signaled when the payment was sent. Nodes and miners applying full-RBF, the default in Bitcoin Core since version 28.0, also accept a replacement of a transaction that did not signal it; signaling improves predictability, it is not a precondition everywhere. Whether a replacement can be attempted depends on your wallet and on node policies, and it is never guaranteed.',
  fr: "Correction : le remplacement n'exige pas que l'option RBF ait été activée ou signalée à l'envoi. Les nœuds et mineurs qui appliquent le full-RBF, comportement par défaut de Bitcoin Core depuis la version 28.0, acceptent aussi le remplacement d'une transaction qui ne l'a pas signalé ; le signal améliore la prévisibilité, ce n'est pas une condition partout. La possibilité de tenter un remplacement dépend de ton portefeuille et des politiques des nœuds, et elle n'est jamais garantie.",
};
const RBF_SECOND_PAYMENT_CORRECTION: Localized = {
  en: 'Correction: a second independent payment is not a way to fix or speed up the first one. If the original confirms, both payments go through and the recipient is paid twice. Only a replacement that spends the same inputs, built and verified in your wallet, can take the place of an unconfirmed transaction.',
  fr: "Correction : un second paiement indépendant ne corrige pas et n'accélère pas le premier. Si la transaction d'origine se confirme, les deux paiements passent et le destinataire est payé deux fois. Seul un remplacement qui dépense les mêmes entrées, construit et vérifié dans ton portefeuille, peut prendre la place d'une transaction non confirmée.",
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
const NEGATION = String.raw`(?:not|never|no|n't|cannot|can ?not|nor can|unable|without being able|ne|n'|jamais|aucun|aucune|ni|pas|non)`;


const ARK_EXIT_LIMITATION = /\b(?:(?:after|past) (?:its |the |a |vtxo )*(?:expiry|expiration|deadline)|apres (?:son |leur |l'|la |une )?(?:expiration|echeance)|(?:missing|lost|without) (?:the |valid )?(?:exit data|backup)|sans (?:les |des )?donnees de sortie|(?:insufficient|not enough) time|temps insuffisant|(?:before|avant)[^.!?]{0,45}(?:cannot|can't|ne peut pas|impossible)[^.!?]{0,45}(?:confirm|confirmer)|collusion)\b/;
const ARK_LIMITED_SENTENCE = new RegExp(`${REFUTATION.source}|${ARK_EXIT_LIMITATION.source}`);
const COOPERATIVE_EXPIRY_RECOVERY = /\b(?:with (?:the )?operator(?:'s)? cooperation|depends? on (?:the )?operator|requires? (?:the )?operator|avec (?:la cooperation|l'aide|l'accord) de l'operateur|depend de (?:la cooperation|l'operateur)|necessite (?:la cooperation|l'accord) de l'operateur)\b/;

export const NEVER_CLAIM_CHECKS: readonly NeverClaimCheck[] = [
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
    patterns: [
      { test: /\b(?:at|after|upon|once|when|past|a l'|apres|une fois|lorsque|quand|passe)\b[^.!?]{0,50}\b(?:expiry|expiration|expires|expired|expire|expirent|deadline|arrive a terme|arrive a expiration|echeance)\b[^.!?]{0,80}\b(?:becomes?|remains?|stays?|is|are|can be|can still be|recoverable|redeemable|claimable|spendable|reclaim(?:ed)?|claim(?:ed)?|recover(?:ed)?|redeem(?:ed)?|devient|deviennent|redevient|redeviennent|reste|restent|est|sont|peut etre|peuvent etre|recuperable|recuperables|recuperer|depensable|depensables|disponible|disponibles|utilisable|utilisables|publier|reclamer|claim)\b/ },
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
    id: 'rbf-second-payment',
    notes: RBF_NOTES,
    patterns: [
      { test: /\b(?:create|creating|send|sending|make|making|broadcast|submit|issue)\b[^.!?]{0,40}\b(?:a |another |one )?(?:new|second|another|fresh|separate|different) (?:transaction|payment|tx)\b[^.!?]{0,80}\b(?:fresh|other|different|new|unrelated|separate) (?:inputs?|utxos?|coins?)\b/ },
      { test: /\b(?:send|sending|make|making|resend|re-send|pay|paying)\b[^.!?]{0,30}\b(?:a |one )?(?:second|another|new|duplicate) (?:payment|transaction|transfer)\b[^.!?]{0,60}\b(?:to (?:the )?same|same (?:recipient|address)|instead|as a (?:substitute|workaround|fix)|to (?:fix|correct|compensate|speed|replace)|the recipient again)\b/ },
      { test: /\b(?:cre(?:er|ez|e)|envoy(?:er|ez|e)|fai(?:re|tes|s)|refai(?:re|tes)|diffus(?:er|ez|e)|emett(?:re|ez))\b[^.!?]{0,40}\b(?:une |un )?(?:nouvelle|nouveau|seconde|second|deuxieme|autre) (?:transaction|paiement|envoi|virement)\b[^.!?]{0,80}\b(?:autres|nouvelles|nouveaux|differentes|differents) (?:entrees|utxos?|pieces|inputs?)\b/ },
      { test: /\b(?:renvoy(?:er|ez|e)|envoy(?:er|ez|e)|refai(?:re|tes)|repay(?:er|ez)|effectu(?:er|ez))\b[^.!?]{0,30}\b(?:un |une )?(?:second|seconde|deuxieme|nouveau|nouvelle|autre) (?:paiement|transaction|envoi|virement)\b[^.!?]{0,60}\b(?:au meme|a la meme|vers la meme|meme destinataire|meme adresse|a la place|en remplacement|pour (?:compenser|corriger|accelerer|remplacer|rattraper))\b/ },
    ],
    unless: /\b(?:do not|don't|never|not a|is not|isn't|should not|shouldn't|avoid|must not|mustn't|rather than|instead of|ne|n'|pas|jamais|evit\w*|sans|keeping|keeps?|same inputs?|original inputs?|replacement|remplacement|memes? entrees?|entrees? d'origine|conserv\w*)\b/,
    correction: RBF_SECOND_PAYMENT_CORRECTION,
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
    const matches = [rule.title, ...(rule.legacyTitles ?? []), ...(rule.additionalSourceTitles ?? [])]
      .flatMap(title => {
        const match = new RegExp(`^Topic: ${escapeRegExp(title)}$`, 'm').exec(text);
        return match ? [match.index] : [];
      });
    if (matches.length) found.push({ index: Math.min(...matches), noteId: rule.noteId });
  }
  return found.sort((a, b) => a.index - b.index).map(entry => entry.noteId);
}

/** The rule notes a prepared history carries in its system turns. */
export function answerRuleNoteIdsInMessages(messages: readonly { role: string; content: string }[]): string[] {
  return answerRuleNoteIdsIn(messages.filter(message => message.role === 'system').map(message => message.content).join('\n'));
}

const BLOCK_HEADER = '[Answer rules]';

function blockIntro(language: SupportedLanguage): string {
  return language === 'fr'
    ? "Les notes récupérées rendent obligatoires les points ci-dessous pour cette réponse. Formule chacun d'eux avec tes mots, dans l'ordre qui convient à la question, et n'affirme jamais l'inverse."
    : 'The retrieved notes make the points below mandatory for this answer. State each of them in your own words, in the order that fits the question, and never claim the opposite.';
}

function renderBlock(language: SupportedLanguage, state: string[], never: string[]): string {
  const parts = [BLOCK_HEADER, blockIntro(language)];
  if (state.length > 0) parts.push(language === 'fr' ? 'À dire :' : 'State:', ...state.map(line => `- ${line}`));
  if (never.length > 0) parts.push(language === 'fr' ? 'À ne jamais affirmer :' : 'Never claim:', ...never.map(line => `- ${line}`));
  return parts.join('\n');
}

/**
 * The instruction block for the rule notes of a turn, or '' when none is in
 * context. Sentences shared by two notes appear once. When the merged lines
 * exceed the budget, the last never-claim lines give way first, then the last
 * mandatory points, so the block never crowds out the notes themselves.
 */
export function answerRulesBlock(noteIds: readonly string[], language: SupportedLanguage, maxChars = ANSWER_RULES_MAX_CHARS): string {
  const rules = noteIds.map(id => RULES_BY_NOTE.get(id)).filter((rule): rule is AnswerRule => Boolean(rule));
  if (rules.length === 0) return '';
  const state = [...new Set(rules.flatMap(rule => rule.mustState[language]))];
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
  return normalizeAnswerText(text).split(/(?<=[.!?])\s+|\n+/).map(sentence => sentence.trim()).filter(Boolean);
}

/** Every correction sentence an answer already carries, in either language. */
export function answerRuleCorrectionsIn(answer: string): string[] {
  const found: string[] = [];
  for (const check of NEVER_CLAIM_CHECKS) {
    for (const language of ['en', 'fr'] as const) {
      const correction = check.correction[language];
      if (answer.includes(correction) && !found.includes(correction)) found.push(correction);
    }
  }
  return found;
}

function sentenceClaims(check: NeverClaimCheck, sentence: string): boolean {
  for (const pattern of check.patterns) {
    const match = pattern.test.exec(sentence);
    if (!match) continue;
    if (pattern.unless?.test(sentence)) continue;
    if (check.unlessSentence?.test(sentence)) continue;
    if (check.unless) {
      const scope = check.unlessScope === 'span'
        ? sentence.slice(Math.max(0, match.index - 30), match.index + match[0].length + 30)
        : sentence;
      if (check.unless.test(scope)) continue;
    }
    return true;
  }
  return false;
}

export type AnswerRuleCheckResult = {
  text: string;
  /** Ids of the checks that matched and whose correction was appended. */
  applied: string[];
};

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
): AnswerRuleCheckResult {
  if (!answer.trim() || noteIds.length === 0) return { text: answer, applied: [] };
  const active = new Set(noteIds);
  const existing = answerRuleCorrectionsIn(answer);
  const scanned = existing.reduce((text, correction) => text.split(correction).join(' '), answer);
  const sentences = sentencesOf(scanned);
  const normalizedQuestion = normalizeAnswerText(question);
  const applied: string[] = [];
  const corrections: string[] = [];
  for (const check of NEVER_CLAIM_CHECKS) {
    if (!check.notes.some(note => active.has(note))) continue;
    if (check.unlessQuestion && check.unlessQuestion.test(normalizedQuestion)) continue;
    if (!sentences.some(sentence => sentenceClaims(check, sentence))) continue;
    const correction = check.correction[language];
    if (existing.includes(correction) || corrections.includes(correction)) continue;
    applied.push(check.id);
    corrections.push(correction);
  }
  if (corrections.length === 0) return { text: answer, applied };
  return { text: `${answer.trimEnd()}\n\n${corrections.join('\n\n')}`, applied };
}
