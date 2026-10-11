// French translations of the off-chain layer fiches (fiche-corpus-layers.ts).
// Same rule as fiche-corpus.fr.ts: only the retrievable surface (title,
// summary, body, extra French retrieval terms) is translated; the guards,
// dates and sources stay on the English source fiche. Dated facts (2,000
// blocks, 100 per transfer, 200 to renew) are kept verbatim.

import type { FicheId, FicheTranslation } from './fiche.ts';

type FrText = Omit<FicheTranslation, 'locale'>;

export const LAYER_FICHE_FR: Record<FicheId, FrText> = {
  FICHE_SPARK_OVERVIEW: {
    title: 'Spark, une couche statechain sur Bitcoin',
    summary: "Spark déplace des bitcoins hors chaîne en passant les pièces de propriétaire en propriétaire avec l'aide d'un groupe d'opérateurs, chaque pièce gardant un chemin présigné de retour vers Bitcoin.",
    body:
      "Spark est une couche hors chaîne construite sur les statechains. Une pièce y entre par " +
      "une transaction de dépôt sur Bitcoin, puis change de mains sans toucher la chaîne : à " +
      "chaque transfert, le propriétaire et les opérateurs Spark signent ensemble, les " +
      "opérateurs déplacent leur part de la clé vers le nouveau propriétaire, et l'ancien " +
      "perd la capacité de dépenser. Les transferts sont instantanés et sans frais on-chain. " +
      "Les opérateurs (sur mainnet : Lightspark, Breez et Flashnet) ne détiennent jamais une " +
      "pièce seuls : dépenser demande toujours le propriétaire. La confiance porte sur " +
      "l'instant : tant qu'un opérateur oublie honnêtement l'ancienne part à chaque " +
      "transfert, personne ne peut revenir sur un transfert passé. Chaque pièce porte aussi " +
      "des transactions présignées qui permettent à son propriétaire de repartir vers " +
      "Bitcoin sans demander à personne (la sortie unilatérale). L'Explorer lit un " +
      "portefeuille Spark directement chez les opérateurs : son solde, ses feuilles (les " +
      "pièces), ses transferts, et pour chaque feuille le chemin de retour vers Bitcoin.",
    retrievalHints: ['spark', 'réseau spark', "c'est quoi spark", 'statechain', 'opérateurs spark', 'hors chaîne', 'couche 2', 'seconde couche'],
  },
  FICHE_SPARK_LEAF_TREE: {
    title: 'Feuille et arbre Spark',
    summary: "Une feuille est une pièce sur Spark. Les feuilles pendent à un arbre de transactions présignées dont la racine dépense un dépôt sur Bitcoin.",
    body:
      "Sur Spark, une pièce s'appelle une feuille. Elle porte un montant en sats, un " +
      "propriétaire (une clé d'identité, qui est aussi son adresse Spark) et un état : " +
      "disponible, verrouillée pendant un transfert ou une division, divisée quand des " +
      "feuilles plus petites l'ont remplacée, sortie quand elle est retournée sur Bitcoin. " +
      "Les feuilles viennent d'un arbre : le dépôt sur Bitcoin est divisé, hors chaîne, en " +
      "sorties de plus en plus petites par des transactions présignées, jusqu'aux montants " +
      "dont un portefeuille a besoin ; les divisions coupent en général le montant en deux, " +
      "d'où des feuilles en puissances de deux sats. La page d'adresse de l'Explorer montre " +
      "les feuilles en bulles proportionnelles au montant et les liste ; la page d'une " +
      "feuille montre son montant, son état, son propriétaire, l'arbre auquel elle " +
      "appartient, le dépôt en haut de l'arbre et le chemin de sortie jusqu'à elle. Un " +
      "transfert ne coupe jamais une feuille : il déplace des feuilles entières, donc payer " +
      "un montant quelconque demande de diviser d'abord ou d'envoyer plusieurs feuilles.",
    retrievalHints: ['feuille', 'feuilles', 'feuille spark', 'arbre spark', 'pièce spark', 'division', 'identifiant de feuille'],
  },
  FICHE_SPARK_DEPOSIT: {
    title: 'Dépôt Spark sur Bitcoin',
    summary: "Un arbre de feuilles Spark part d'une sortie d'une transaction Bitcoin, le dépôt. L'Explorer relie les deux côtés.",
    body:
      "Tout sur Spark pend à Bitcoin. Un portefeuille dépose en payant une adresse qu'il " +
      "contrôle avec les opérateurs ; cette transaction est le dépôt, et sa sortie est la " +
      "racine d'où l'arbre pousse. La transaction racine dépense le dépôt, les divisions " +
      "en dessous partagent le montant, et les feuilles sont les pièces que les gens " +
      "transfèrent. Le dépôt est le seul moment daté et on-chain de l'arbre : la page de " +
      "feuille de l'Explorer montre quand il a confirmé et dans quel bloc, et la page " +
      "Bitcoin d'un dépôt reçoit une carte Spark qui nomme l'arbre qu'il a lancé et la " +
      "feuille d'où tu viens. Sparkscan, l'explorateur public de Spark, n'indexe que le " +
      "côté Spark : le txid d'un dépôt lui est inconnu. L'Explorer d'Alice est l'endroit " +
      "où le dépôt, l'arbre, la feuille et le chemin de sortie se lisent comme une seule " +
      "histoire.",
    retrievalHints: ['dépôt', 'dépôt spark', 'transaction de dépôt', 'racine', "racine de l'arbre", 'dépôt on-chain'],
  },
  FICHE_SPARK_TRANSFER: {
    title: 'Transfert Spark',
    summary: "Un transfert passe des feuilles entières d'une adresse Spark à une autre en les re-signant avec les opérateurs ; il est instantané et ne laisse aucune trace sur Bitcoin.",
    body:
      "Un transfert Spark déplace une ou plusieurs feuilles, entières, d'un expéditeur à un " +
      "destinataire. L'expéditeur le lance, les opérateurs ajustent leur part de clé pour " +
      "que le destinataire devienne le seul à pouvoir dépenser (le key tweak), et le " +
      "destinataire signe la nouvelle transaction de remboursement qui est son propre " +
      "chemin de retour vers Bitcoin. Tant que le destinataire n'a pas fait sa part, le " +
      "transfert est en attente ; il se lit ensuite terminé. Un transfert non réclamé à " +
      "temps expire, ou revient à l'expéditeur. Rien n'est écrit sur Bitcoin et il n'y a " +
      "pas de frais à lire. L'Explorer nomme chaque transfert par son identifiant (un " +
      "UUID), montre l'expéditeur, le destinataire, le montant et les feuilles déplacées, " +
      "et dessine le flux de l'adresse de l'expéditeur vers celle du destinataire. " +
      "Certains transferts ont une forme particulière : un paiement Lightning est un swap " +
      "avec le Spark Service Provider, une sortie coopérative envoie la pièce vers Bitcoin " +
      "avec l'aide des opérateurs, et un dépôt réclamé transforme un dépôt frais en " +
      "feuilles.",
    retrievalHints: ['transfert', 'transfert spark', 'envoyer sur spark', 'recevoir sur spark', 'transfert en attente', 'identifiant de transfert', 'terminé'],
  },
  FICHE_SPARK_EXIT_TIMELOCKS: {
    title: 'Sortie unilatérale et timelocks Spark',
    summary: "Chaque feuille Spark porte des transactions présignées qui permettent à son propriétaire de revenir seul sur Bitcoin. Les timelocks relatifs de ce chemin empêchent un ancien propriétaire de doubler le nouveau.",
    body:
      "Le propriétaire d'une feuille peut quitter Spark sans l'aide de personne : diffuser " +
      "les transactions présignées des nœuds, de la racine de l'arbre jusqu'à la feuille, " +
      "puis la transaction de remboursement qui le paie. Chacune de ces transactions " +
      "attend un timelock relatif après la confirmation de son parent. Une feuille neuve " +
      "démarre avec une attente de 2 000 blocs sur son remboursement ; chaque transfert la " +
      "réduit de 100 blocs, parce que le remboursement du nouveau propriétaire doit " +
      "pouvoir confirmer avant celui de l'ancien ; sous 200 blocs, la feuille est " +
      "renouvelée, ce qui remet l'attente à neuf. La somme des timelocks du chemin est le " +
      "temps que prend une sortie au pire, environ deux semaines pour une feuille neuve. " +
      "La page de feuille de l'Explorer dessine ce chemin en entonnoir : le dépôt, les " +
      "divisions, la feuille, le remboursement, avec l'attente de chaque transaction, et " +
      "les additionne sous THEN WAIT. La sortie coopérative est l'alternative rapide : les " +
      "opérateurs signent un paiement direct vers Bitcoin, sans timelock à subir.",
    retrievalHints: ['sortie unilatérale', 'sortie spark', 'timelock', 'timelock spark', 'transaction de remboursement', 'chemin de sortie', 'quitter spark', 'sortie coopérative', 'délai de sortie'],
  },
  FICHE_SPARK_OPERATORS_SSP: {
    title: 'Opérateurs Spark et Spark Service Provider',
    summary: "Un petit groupe d'opérateurs cosigne chaque transfert Spark, et un fournisseur de service relie Spark à Lightning et à Bitcoin. La confiance en eux est bornée, pas absente.",
    body:
      "Spark tourne sur un groupe fixe d'opérateurs ; sur mainnet ce sont Lightspark, Breez " +
      "et Flashnet. Ensemble, ils détiennent une part de la clé de chaque pièce et signent " +
      "les transferts avec le propriétaire par une signature à seuil. Ils peuvent refuser " +
      "de cosigner (un risque de disponibilité, auquel répond la sortie unilatérale), et " +
      "ils voient chaque transfert, donc Spark n'est pas privé vis-à-vis de ses " +
      "opérateurs ; mais ils ne peuvent pas dépenser une pièce sans son propriétaire, et " +
      "tant que l'un d'eux oublie honnêtement l'ancienne part à chaque transfert, un " +
      "ancien propriétaire ne peut pas reprendre la pièce. Le Spark Service Provider " +
      "(SSP), tenu par Lightspark, est un portefeuille comme un autre avec un rôle public : " +
      "il paie et reçoit des factures Lightning pour le compte des portefeuilles Spark, et " +
      "il exécute les sorties coopératives vers Bitcoin. Dans l'Explorer, un transfert " +
      "dont la contrepartie est le SSP se lit comme un paiement Lightning ; les points " +
      "d'accès et les clés des opérateurs sont listés sur la page d'accueil Spark, et " +
      "chaque page d'adresse dit quels opérateurs ont été lus.",
    retrievalHints: ['opérateur', 'opérateur spark', 'opérateurs spark', 'ssp', 'fournisseur de service spark', 'lightning sur spark', 'modèle de confiance', 'qui fait tourner spark', 'signature à seuil'],
  },
  FICHE_SPARK_ADDRESS: {
    title: 'Adresse Spark',
    summary: "Une adresse Spark est la clé d'identité d'un portefeuille, écrite en bech32m avec le préfixe spark1. Une adresse, un portefeuille : la réutilisation est dans la conception.",
    body:
      "Une adresse Spark encode la clé publique d'identité du portefeuille, celle avec " +
      "laquelle les opérateurs signent pour lui ; les adresses actuelles commencent par " +
      "spark1, les anciennes par sp1 et portent la même clé. Comme l'adresse est la clé, " +
      "un portefeuille Spark a une seule adresse pour toute sa vie : chaque transfert " +
      "qu'il envoie ou reçoit lui est rattaché, à l'inverse de l'adresse neuve par " +
      "paiement de Bitcoin. L'Explorer lit une adresse chez les opérateurs et montre son " +
      "solde, ses feuilles en bulles et en liste, ses transferts (envoyés et reçus), sa " +
      "première apparition, l'âge moyen de ses pièces, et une courbe de solde reconstruite " +
      "à partir des transferts. Les lignes de jetons, sous le mot token, viennent de " +
      "Sparkscan. Un portefeuille qui a activé la confidentialité ne répond rien à ces " +
      "lectures publiques : il ressemble exactement à un portefeuille vide, et la page le " +
      "dit.",
    retrievalHints: ['adresse spark', 'spark1', 'sp1', "clé d'identité", 'clé publique d\'identité', 'solde spark', 'adresse sur spark'],
  },
  FICHE_SPARK_PRIVACY: {
    title: 'Ce que Spark montre en public',
    summary: "Le solde, les feuilles et les transferts d'un portefeuille Spark public se lisent chez les opérateurs par n'importe qui ; un portefeuille privé se lit comme vide. Les opérateurs voient tout dans les deux cas.",
    body:
      "Les opérateurs Spark répondent aux requêtes de solde, de feuilles et de transferts " +
      "pour n'importe quelle adresse, sans authentification, sauf si le portefeuille a " +
      "activé le mode privé ; les lectures d'un portefeuille privé reviennent vides, " +
      "indiscernables d'un portefeuille vide, et la page d'adresse de l'Explorer dit " +
      "« Empty, or private » plutôt que de deviner. Sparkscan, l'explorateur public, liste " +
      "les mêmes données publiques plus un fil en direct du réseau. Ce que cela veut dire " +
      "pour la vie privée : sur Spark, la question n'est pas qui peut lire la chaîne, " +
      "puisque les transferts ne la touchent pas, mais qui peut lire les opérateurs. Avec " +
      "un portefeuille public, tout le monde ; avec un portefeuille privé, les opérateurs " +
      "eux-mêmes, puisqu'ils cosignent chaque transfert et en connaissent les deux côtés. " +
      "Un dépôt et une sortie sont les deux moments qui touchent Bitcoin et s'y lisent par " +
      "n'importe qui, comme toute transaction.",
    retrievalHints: ['confidentialité spark', 'vie privée spark', 'mode privé', 'portefeuille privé', 'portefeuille public', 'qui voit spark', 'vide ou privé'],
  },
  FICHE_SPARK_TOKENS: {
    title: 'Jetons sur Spark',
    summary: "Spark transporte aussi des jetons émis sur lui. L'Explorer les montre comme des lignes token, sans nom, sans ticker et sans montant.",
    body:
      "En plus du bitcoin, Spark transporte des jetons : des actifs émis sur Spark et " +
      "transférés par les mêmes opérateurs, chacun nommé par un identifiant qui commence " +
      "par btkn1. Une transaction de jeton est identifiée par un identifiant hexadécimal " +
      "de 64 caractères, comme un txid Bitcoin, et elle peut déplacer un jeton entre " +
      "plusieurs portefeuilles à la fois. L'Explorer d'Alice les montre délibérément comme " +
      "des lignes « token » sur une page d'adresse, et comme une carte token quand on en " +
      "ouvre une : il dit quels portefeuilles ont participé et quand, mais il ne nomme " +
      "pas le jeton, ne montre ni son ticker ni son montant. C'est un choix, pas une " +
      "limite des données : Alice explique le bitcoin et ne fait pas la promotion " +
      "d'autres actifs. Les lignes de jetons viennent de Sparkscan, pas des requêtes " +
      "bitcoin des opérateurs.",
    retrievalHints: ['jeton', 'jetons', 'jeton spark', 'jetons spark', 'token', 'btkn', 'transaction de jeton'],
  },
  FICHE_SPARKSCAN: {
    title: 'Sparkscan',
    summary: "Sparkscan est l'explorateur public de Spark. Alice s'en sert pour le fil en direct et les lignes de jetons, et ajoute ce qui lui manque : le côté Bitcoin.",
    body:
      "Sparkscan (sparkscan.io) indexe le réseau Spark : un fil en direct des transferts, " +
      "une page par adresse avec son historique, et une page par transaction, jetons " +
      "compris. L'Explorer d'Alice s'en sert pour ce que les opérateurs n'offrent pas : le " +
      "fil en direct de tout le réseau sur la page d'accueil Spark, la taille de " +
      "l'historique d'une adresse, et les lignes de jetons. Tout le reste, soldes, " +
      "feuilles, transferts et arbres de sortie, est lu directement chez les opérateurs. " +
      "Sparkscan s'arrête au bord de Spark : la transaction Bitcoin d'un dépôt, l'arbre " +
      "qu'elle a lancé et le chemin de sortie présigné n'y sont pas. Alice dessine ce " +
      "côté-là, du bloc Bitcoin jusqu'à la feuille, et marque un dépôt sur sa page de " +
      "transaction Bitcoin. Sparkscan écrit les adresses dans l'ancienne forme sp1 dans " +
      "son fil ; l'Explorer montre la forme actuelle spark1, la même clé.",
    retrievalHints: ['sparkscan', 'explorateur spark', 'fil en direct', 'explorateur public spark'],
  },
  FICHE_ARK_OVERVIEW: {
    title: 'Ark, Arkade et Bark',
    summary: "Ark est un protocole hors chaîne où un opérateur regroupe les pièces des utilisateurs dans des transactions Bitcoin partagées. Arkade et Bark sont deux implémentations que l'Explorer lit.",
    body:
      "Ark est un protocole de paiements bitcoin hors chaîne construit autour d'un " +
      "opérateur (appelé Ark Service Provider ou serveur). Les utilisateurs détiennent des " +
      "pièces virtuelles, les VTXO, qui vivent dans un arbre de transactions présignées " +
      "pendu à une seule transaction on-chain que l'opérateur fait pour tout un lot " +
      "d'utilisateurs. Les paiements sont cosignés par le propriétaire et l'opérateur et " +
      "se règlent instantanément ; périodiquement, les pièces sont rafraîchies dans un " +
      "nouveau lot, et une pièce jamais rafraîchie expire et peut être balayée par " +
      "l'opérateur. Un propriétaire peut toujours partir seul en diffusant la branche de " +
      "l'arbre qui mène à sa pièce, puis en attendant un délai de sortie. L'Explorer lit " +
      "deux implémentations : Arkade (adresses ark1q…), dont l'opérateur publie un index " +
      "des pièces, des transactions virtuelles et des transactions d'engagement, et Bark " +
      "par Second (adresses ark1p…), dont le serveur publie ses tours et répond pour une " +
      "pièce par son identifiant. Aucun des deux ne publie la liste des tours passés, donc " +
      "l'Explorer les retrouve en parcourant le portefeuille de l'opérateur sur Bitcoin.",
    retrievalHints: ['ark', 'protocole ark', 'arkade', 'bark', 'second', "c'est quoi ark", 'serveur ark', 'opérateur ark', 'fournisseur de service ark'],
  },
  FICHE_ARK_VTXO: {
    title: 'VTXO, une pièce virtuelle',
    summary: "Un VTXO est une pièce hors chaîne sur Ark : une sortie d'une transaction présignée, adossée à un lot ancré sur Bitcoin, avec une expiration.",
    body:
      "Un VTXO (virtual transaction output, sortie de transaction virtuelle) est une pièce " +
      "qui existe hors chaîne : une sortie d'une transaction présignée dans un arbre pendu " +
      "à un lot on-chain. Elle a un montant, un script de propriétaire (la clé du " +
      "propriétaire avec celle de l'opérateur), et une expiration après laquelle " +
      "l'opérateur peut balayer le lot ; rafraîchir la pièce dans un nouveau lot avant " +
      "cela la garde en vie. Sur Arkade, une pièce est préconfirmée quand l'opérateur l'a " +
      "cosignée sans qu'elle soit encore dans un lot, réglée une fois qu'une transaction " +
      "d'engagement l'ancre, dépensée quand une transaction virtuelle ultérieure l'a " +
      "consommée, balayée quand elle a expiré. Sur Bark, une pièce vient d'un tour, d'un " +
      "board (une sortie on-chain transformée directement en pièce), ou d'un paiement " +
      "arkoor fait hors tour et cosigné par le serveur. La page VTXO de l'Explorer montre " +
      "l'identifiant de la pièce (txid:vout), son montant, son état, son expiration, d'où " +
      "elle vient, et son chemin de sortie dessiné en entonnoir.",
    retrievalHints: ['vtxo', 'pièce virtuelle', 'utxo virtuel', 'expiration vtxo', 'préconfirmé', 'réglé', 'balayé', 'arkoor', 'board', 'vtxo arkade', 'vtxo bark'],
  },
  FICHE_ARK_COMMITMENT_ROUND: {
    title: "Transaction d'engagement et tour",
    summary: "La transaction on-chain qui ancre un lot de pièces Ark : une transaction d'engagement sur Arkade, un tour sur Bark. Pas un paiement entre deux personnes.",
    body:
      "Chaque lot de pièces Ark pend à une transaction Bitcoin faite par l'opérateur : " +
      "Arkade l'appelle transaction d'engagement (commitment transaction), Bark l'appelle " +
      "tour (round). Elle dépense les fonds propres de l'opérateur et les pièces " +
      "abandonnées des utilisateurs qui ont réglé, et crée la sortie de lot à laquelle le " +
      "nouvel arbre pend (plus, souvent, une sortie de connecteur qui servira à abandonner " +
      "des pièces plus tard). L'Explorer marque ces transactions d'un badge ARKADE " +
      "COMMITMENT TX ou BARK ROUND sur leur page Bitcoin, liste le lot et les pièces qu'il " +
      "porte, et montre les dernières dans un fil en direct sur la page d'accueil de " +
      "chaque réseau. La lire comme un paiement tromperait : ses entrées et ses sorties " +
      "appartiennent à la fois à de nombreux utilisateurs et à l'opérateur, donc les " +
      "heuristiques habituelles de vie privée (détection du change, propriété commune des " +
      "entrées) ne s'appliquent pas ; l'Explorer le dit par une note « Ark round settled " +
      "on-chain » au lieu de les lancer. Les listes de tours passés viennent du parcours " +
      "du portefeuille de l'opérateur, elles peuvent donc être incomplètes.",
    retrievalHints: ["transaction d'engagement", 'commitment', 'tour', 'tour bark', 'engagement arkade', 'lot', 'règlement', 'règlement ark', 'abandon', 'connecteur'],
  },
  FICHE_ARK_EXIT: {
    title: 'Sortie unilatérale Ark',
    summary: "Le propriétaire d'une pièce Ark peut partir sans l'opérateur en diffusant la branche de l'arbre qui mène à sa pièce, puis en attendant le délai de sortie.",
    body:
      "L'arbre présigné derrière un lot Ark est la garantie du propriétaire : pour partir " +
      "sans l'aide de l'opérateur, il diffuse les transactions du chemin qui va de la " +
      "sortie de lot jusqu'à sa pièce, chacune dépensant la précédente, puis attend un " +
      "délai avant de pouvoir dépenser la pièce sur Bitcoin. Sur Arkade, ce délai est le " +
      "délai de sortie unilatérale de l'opérateur ; sur Bark, chaque étape attend un delta " +
      "de sortie en blocs. Partir ainsi coûte des frais on-chain pour chaque transaction " +
      "diffusée et prend du temps, c'est pourquoi la voie normale est coopérative : " +
      "l'opérateur cosigne un paiement direct vers Bitcoin. La page VTXO de l'Explorer " +
      "dessine le chemin de sortie en entonnoir, de la transaction d'engagement ou du " +
      "tour en haut jusqu'à la pièce en bas, avec les sorties de chaque transaction et la " +
      "branche de la pièce en surbrillance, et additionne l'attente sous THEN WAIT. Une " +
      "pièce expirée, balayée par l'opérateur, n'a plus de sortie : rafraîchir avant " +
      "l'expiration est ce qui garde le chemin valide.",
    retrievalHints: ['sortie unilatérale', 'délai de sortie', 'chemin de sortie', 'quitter ark', 'balayage', 'expiration', 'rafraîchir', 'arbre de sortie'],
  },
  FICHE_ARK_ADDRESS: {
    title: 'Adresses Ark',
    summary: "Une adresse ark1 nomme une destination hors chaîne. Celles d'Arkade (ark1q) portent le script du propriétaire et la clé de l'opérateur ; celles de Bark (ark1p) portent une politique et une boîte aux lettres.",
    body:
      "Les adresses Ark commencent par ark1 et disent à quelle implémentation elles " +
      "appartiennent par leur version : celles d'Arkade commencent par ark1q et encodent " +
      "la clé de signature de l'opérateur avec le script taproot sur lequel les pièces " +
      "reposent ; celles de Bark commencent par ark1p et encodent l'identifiant du serveur, " +
      "la clé du propriétaire (la politique) et une boîte aux lettres où le serveur livre " +
      "les paiements. Pour une adresse Arkade, l'Explorer interroge l'index de l'opérateur " +
      "et montre l'adresse comme une adresse Bitcoin : solde dépensable, pièces en bulles " +
      "et en liste, transactions virtuelles, courbe de solde. Une adresse Bark ne peut pas " +
      "être listée ainsi : le serveur ne parle des pièces d'une adresse qu'à son " +
      "propriétaire, donc la page décode ce que l'adresse dit d'elle-même (quel serveur, " +
      "quelle clé, quelle boîte aux lettres) et rien de plus. Une adresse Ark est " +
      "réutilisable par conception et liée à un seul opérateur : une pièce qui lui est " +
      "payée n'existe qu'avec l'aide de cet opérateur.",
    retrievalHints: ['adresse ark', 'adresse arkade', 'adresse bark', 'ark1', 'ark1q', 'ark1p', 'boîte aux lettres', 'politique'],
  },
};
