// Rebuild with: node scripts/build-curated-rag.mjs
// Selected corpus; review methods do not imply exhaustive fact-checking.
import type { KnowledgeChunk } from '../knowledge-packs';

export const CURATED_CORPUS_VERSION = "curated-c0aa6d5273745070ac25";

export const GENERATED_CURATED_KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    "id": "curated-51-attack",
    "conceptId": "51-attack",
    "title": "L’attaque majoritaire",
    "keywords": [
      "L’attaque majoritaire",
      "51% Attack",
      "Que permet et que ne permet pas une attaque à 51 % ?",
      "Minage et énergie",
      "51 attack"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne attaque majoritaire utilise une majorité malveillante de la puissance de calcul pour concurrencer la chaîne suivie par le réseau. Elle peut viser des doubles dépenses ou la censure de transactions.\n\nExplication\nL’attaquant cherche à produire une chaîne valide avec davantage de travail accumulé. Une réorganisation peut alors retirer des confirmations à des transactions et permettre de remplacer ses propres paiements. Plus la réorganisation remonte loin, plus il faut refaire de travail ; aucune règle générale ne la limite aux seuls derniers blocs.\n\nLa puissance de calcul ne donne pas les clés privées des autres utilisateurs. Elle ne permet pas non plus d’imposer une subvention interdite aux nœuds qui appliquent leurs règles. Le coût pratique dépend du matériel, de l’énergie, de la durée et de la profondeur de l’attaque.\n\nLimites et confusions\nLe terme « Goldfinger » désigne, dans les travaux de Kroll, Davey et Felten, une motivation de sabotage visant un avantage extérieur au système. Une attaque majoritaire peut servir cette motivation, mais les expressions ne sont pas synonymes.\n\nCette description ne chiffre pas le risque actuel ni ne garantit une détection préalable. Une chaîne concurrente peut être préparée sans être immédiatement publiée.",
    "parentIds": [],
    "relatedIds": [
      "mining-centralization",
      "bitcoin-consensus"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://econinfosec.org/archive/weis2013/papers/KrollDaveyFeltenWEIS2013.pdf",
      "https://bitcoin.org/bitcoin.pdf"
    ],
    "questions": [
      "Que permet et que ne permet pas une attaque à 51 % ?"
    ],
    "status": "reviewed",
    "sourceHash": "62785daba4505a98ba8b3bf69f66971d0d896f7f5f0c094b743274191bca7a0b",
    "sourcePath": "data/alice-corpus/examples/51-attack.fr.md",
    "theme": "Minage et énergie"
  },
  {
    "id": "curated-address-reuse",
    "conceptId": "address-reuse",
    "title": "La réutilisation des adresses",
    "keywords": [
      "La réutilisation des adresses",
      "Address Reuse",
      "Pourquoi éviter de réutiliser une adresse ?",
      "privacy",
      "address reuse"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nRéutiliser une adresse pour plusieurs réceptions permet de relier facilement ces paiements au même identifiant. Cela peut révéler un historique à des personnes qui n’avaient connaissance que d’une interaction.\n\nExplication\nUn client ou un donateur connaissant une adresse peut observer les autres transactions qui lui sont associées. Un portefeuille HD permet de créer de nouvelles adresses sans créer un nouveau secret de sauvegarde pour chacune.\n\nLa séparation des adresses limite ce regroupement immédiat. Des mécanismes de réception réutilisable, comme les Silent Payments, cherchent aussi à éviter de publier toujours la même destination on-chain, avec leurs propres contraintes de support.\n\nLimites et confusions\nUne adresse nouvelle n’efface pas les autres liens. Dépenser ensemble plusieurs fonds ou transmettre des informations à un serveur peut encore révéler leur relation. Une ancienne adresse ne devient pas automatiquement invalide après usage ; la question est surtout la confidentialité. La rotation des adresses ne protège pas, à elle seule, contre une substitution dans le presse-papiers.",
    "parentIds": [],
    "relatedIds": [
      "hd-wallet",
      "silent-payments",
      "address-spoofing",
      "secondary-privacy-bip47-reusable-payment-codes"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc204 — Privacy on Bitcoin",
      "PlanB Extraction — 2026-05-24 — Glossary"
    ],
    "questions": [
      "Pourquoi éviter de réutiliser une adresse ?"
    ],
    "status": "reviewed",
    "sourceHash": "347c87325866e92de0c6b3385b23010dec3c083251fef418272bd3d459a7c568",
    "sourcePath": "data/alice-corpus/examples/address-reuse.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-address-spoofing",
    "conceptId": "address-spoofing",
    "title": "La substitution d’adresse",
    "keywords": [
      "La substitution d’adresse",
      "Address Spoofing",
      "Pourquoi vérifier l’adresse de destination ?",
      "security",
      "address spoofing"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa substitution d’adresse détourne un paiement vers une destination contrôlée par un attaquant. Une adresse qui ressemble à une autre n’est pas une preuve qu’elle appartient au destinataire voulu.\n\nExplication\nUn logiciel malveillant peut remplacer le contenu du presse-papiers. Un autre mécanisme consiste à faire apparaître une adresse ressemblante dans un historique, dans l’espoir qu’elle soit recopiée. Ces attaques sont distinctes et ne se résolvent pas simplement en changeant souvent d’adresse.\n\nAvec un hardware wallet, son écran sert de référence pour ce qui sera signé. Il faut comparer l’adresse entière et le montant à des informations obtenues de manière fiable auprès du destinataire, pas seulement aux caractères visibles sur l’ordinateur.\n\nLimites et confusions\nL’appareil ne devine pas l’intention humaine. Une mauvaise adresse confirmée sur son écran reste une mauvaise destination. Les études citées dans la note source ne mesurent pas toutes la fréquence de ces attaques sur Bitcoin ; leurs résultats ne doivent pas être transposés comme des statistiques Bitcoin.",
    "parentIds": [],
    "relatedIds": [
      "hardware-wallet",
      "bitcoin-uri",
      "phishing-and-social-engineering"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device",
      "https://arxiv.org/abs/2501.16681",
      "https://arxiv.org/abs/2108.14004"
    ],
    "questions": [
      "Pourquoi vérifier l’adresse de destination ?"
    ],
    "status": "reviewed",
    "sourceHash": "9b65dac4f2f0ffafed5e49787af8e6992572732a0fad15d25ea117dd8a0044cf",
    "sourcePath": "data/alice-corpus/examples/address-spoofing.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-alice-app-overview",
    "conceptId": "alice-app-overview",
    "title": "Se repérer dans Alice App",
    "keywords": [
      "Se repérer dans Alice App",
      "les espaces d’Alice",
      "navigation dans Alice",
      "À quoi servent Chat, Explorer, Learn et Playground ?",
      "Par où commencer pour découvrir Bitcoin avec Alice ?",
      "alice-app",
      "learning",
      "alice app overview"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nAlice App propose 4 espaces complémentaires. Chat sert à poser des questions, Explorer à observer des données, Learn à suivre des cours et Playground à pratiquer avec des sats de test.\n\nExplication\nDans Chat, on échange avec l’assistant pour demander une explication ou approfondir une notion.\n\nExplorer permet de chercher des transactions, des adresses ou des blocs, et d’observer certains indices de confidentialité. L’accompagnement par IA y est facultatif.\n\nLearn rassemble des cours et tutoriels, avec des chapitres, des quiz lorsqu’ils sont disponibles et un suivi de progression. On peut solliciter Alice pour éclaircir un passage.\n\nPlayground propose un portefeuille de pratique sur Mutinynet. Il permet de découvrir des opérations on-chain sans utiliser des bitcoins du réseau principal.\n\nLimites et confusions\nLes fonctions n’ont pas toutes les mêmes besoins de connexion. Disposer d’une IA locale ne rend pas les données récentes de la chaîne disponibles hors ligne. Une réponse de l’assistant peut aussi nécessiter une vérification.",
    "parentIds": [],
    "relatedIds": [
      "alice-explorer",
      "alice-learn",
      "alice-playground",
      "alice-offline-limits"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "alice-repo:apps/app-web/src/components/Sidebar.tsx",
      "alice-repo:apps/app-web/src/components/ExplorerPanel.tsx",
      "alice-repo:apps/app-web/src/components/LearnPanel.tsx",
      "alice-repo:apps/app-web/src/lib/playground.ts",
      "alice-repo:apps/app-web/src/components/settings/AiTab.tsx"
    ],
    "questions": [
      "À quoi servent Chat, Explorer, Learn et Playground ?",
      "Par où commencer pour découvrir Bitcoin avec Alice ?"
    ],
    "status": "reviewed",
    "sourceHash": "30a7eb55ec1f1b5cda388c8f9eebc8225ab93edf22a1a9ce19f0037c4a7e70a3",
    "sourcePath": "data/alice-corpus/examples/alice-app-overview.fr.md",
    "theme": "alice-app"
  },
  {
    "id": "curated-alice-explorer",
    "conceptId": "alice-explorer",
    "title": "Comprendre Explorer",
    "keywords": [
      "Comprendre Explorer",
      "explorateur d’Alice",
      "Que peut-on observer dans Explorer ?",
      "Ses indices de confidentialité prouvent-ils qui possède des bitcoins ?",
      "alice-app",
      "privacy",
      "alice explorer"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nExplorer permet de consulter des blocs, transactions et adresses, puis de suivre leurs relations. Il présente aussi des indices de confidentialité. On peut l’utiliser sans demander une analyse à l’IA.\n\nExplication\nSur Bitcoin, une transaction montre des entrées, des sorties et, selon les données disponibles, ses frais et sa confirmation. Une adresse permet de consulter son activité accessible auprès du fournisseur choisi.\n\nLes vues Liquid, Arkade, Bark et Spark montrent des informations différentes. Certaines viennent d’une chaîne, d’autres de services ou d’opérateurs de ces couches. Leur couverture n’est donc pas identique à celle de Bitcoin.\n\nLes indices de confidentialité cherchent notamment des réutilisations d’adresses ou une sortie susceptible d’être la monnaie rendue. Ils aident à comprendre ce qu’un observateur pourrait inférer.\n\nLimites et confusions\nUn indice calculé selon une règle reproductible reste parfois une hypothèse. Il ne prouve pas l’identité d’une personne ni la propriété commune de tous les fonds concernés. Les données récentes nécessitent une connexion et dépendent des informations accessibles au fournisseur. Un montant confidentiel peut rester inconnu.",
    "parentIds": [],
    "relatedIds": [
      "alice-app-overview",
      "alice-learn",
      "alice-playground",
      "alice-offline-limits",
      "spark-trust-and-exits",
      "ark-implementations-bark-arkade"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "alice-repo:apps/app-web/src/components/ExplorerPanel.tsx",
      "alice-repo:apps/app-web/src/components/ExplorerIntroModal.tsx",
      "alice-repo:apps/app-web/src/lib/explorer/networks.ts",
      "alice-repo:apps/app-web/src/lib/explorer/provider.ts",
      "alice-repo:apps/app-web/src/lib/explorer/heuristics.ts"
    ],
    "questions": [
      "Que peut-on observer dans Explorer ?",
      "Ses indices de confidentialité prouvent-ils qui possède des bitcoins ?"
    ],
    "status": "reviewed",
    "sourceHash": "0e9d2b1b45f09fed4125acdb2562318000bc416cb4c84ed83ad93e53102101c1",
    "sourcePath": "data/alice-corpus/examples/alice-explorer.fr.md",
    "theme": "alice-app"
  },
  {
    "id": "curated-alice-learn",
    "conceptId": "alice-learn",
    "title": "Apprendre avec Learn",
    "keywords": [
      "Apprendre avec Learn",
      "cours dans Alice",
      "bibliothèque Learn",
      "À quoi sert l’espace Learn ?",
      "Quelle différence entre lire un cours et demander une réponse à Alice ?",
      "alice-app",
      "learning",
      "alice learn"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLearn est une bibliothèque de cours et tutoriels sur Bitcoin. On peut lire les chapitres, suivre sa progression et faire les quiz disponibles. Alice peut expliquer un passage à la demande.\n\nExplication\nLes contenus proviennent de Plan ₿ Academy, sous licence CC BY-SA 4.0. La lecture du cours et l’explication générée par l’assistant sont 2 contenus distincts.\n\nLe parcours permet de commencer un cours, ouvrir ses chapitres et reprendre une lecture. La progression est enregistrée localement lorsque le stockage de l’application est disponible. Certains contenus proposent des liens vers Explorer pour observer des exemples.\n\nLe français et l’anglais sont prévus dans les contenus embarqués de l’application. Les autres langues peuvent nécessiter un téléchargement depuis une source distante. La langue de lecture se choisit indépendamment de celle de la conversation.\n\nLimites et confusions\nTous les cours ne disposent pas d’un quiz. Un chapitre marqué comme lu ne certifie pas sa maîtrise. Télécharger une langue ne garantit pas que chaque contenu restera accessible hors ligne ; la disponibilité dépend des fichiers effectivement présents et conservés. Les explications d’Alice peuvent comporter des erreurs.",
    "parentIds": [],
    "relatedIds": [
      "alice-app-overview",
      "alice-explorer",
      "alice-playground",
      "alice-offline-limits"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "alice-repo:apps/app-web/src/components/LearnPanel.tsx",
      "alice-repo:apps/app-web/src/components/learn/LearnIntroModal.tsx",
      "alice-repo:apps/app-web/src/lib/learn/packs.ts",
      "alice-repo:apps/app-web/src/lib/learn/packs-base.ts",
      "alice-repo:apps/app-web/src/lib/learn/language-downloads.ts",
      "alice-repo:apps/app-web/src/lib/learn/progress.ts",
      "alice-repo:apps/app-web/src/lib/learn/language.ts"
    ],
    "questions": [
      "À quoi sert l’espace Learn ?",
      "Quelle différence entre lire un cours et demander une réponse à Alice ?"
    ],
    "status": "reviewed",
    "sourceHash": "90bfb38ec8f28997102e94e9adecb1940635b540a8fb7d82cd65824c04cbfe9b",
    "sourcePath": "data/alice-corpus/examples/alice-learn.fr.md",
    "theme": "alice-app"
  },
  {
    "id": "curated-alice-local-encryption",
    "conceptId": "alice-local-encryption",
    "title": "Les données locales d’Alice App",
    "keywords": [
      "Les données locales d’Alice App",
      "docs/security/local-chat-encryption.md",
      "Que protège le chiffrement local de l’application ?",
      "Alice App et apprentissage",
      "alice local encryption"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nAlice chiffre les données locales prises en charge lorsque son mécanisme de chiffrement est disponible. Cette protection au repos ne garantit pas la sécurité de toutes les données ni celle d’une session déjà ouverte.\n\nExplication\nLa documentation au commit 46e2e9da distingue le navigateur et le desktop. Dans le navigateur, une clé WebCrypto non exportable est conservée via IndexedDB. Sur desktop, le mécanisme utilise le trousseau du système. Les discussions et plusieurs données gérées par Explorer et le Playground passent par le stockage prévu à cet effet.\n\nCertaines préférences et le cache de données publiques ne sont pas dans ce périmètre. Lorsque le mécanisme de chiffrement n’est pas disponible, les stockages concernés peuvent conserver leur comportement en clair. La plateforme et l’environnement doivent donc être précisés.\n\nLimites et confusions\n« Non exportable » signifie que l’API WebCrypto n’autorise pas l’export de la clé. Cela ne démontre pas une protection contre la copie complète du profil navigateur. Aucun essai de ce type n’est revendiqué ici. Un script de la même origine peut encore utiliser la clé.\n\nLe chiffrement ne protège pas contre une personne utilisant l’application dans une session déverrouillée ni contre tout logiciel ayant accès à cette session. Il faut éviter la formule générale « toutes les données sont protégées ».",
    "parentIds": [],
    "relatedIds": [
      "encryption",
      "alice-user-memory",
      "secondary-bitcoin-authenticated-encryption"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "alice-repo:46e2e9da:docs/security/local-chat-encryption.md",
      "https://www.w3.org/TR/webcrypto/#security-considerations"
    ],
    "questions": [
      "Que protège le chiffrement local de l’application ?"
    ],
    "status": "reviewed",
    "sourceHash": "d451d89c9bce7f9612037fe209da96d432c9fb0531c85abc5909af5e05dd2174",
    "sourcePath": "data/alice-corpus/examples/alice-local-encryption.fr.md",
    "theme": "Alice App et apprentissage"
  },
  {
    "id": "curated-alice-offline-limits",
    "conceptId": "alice-offline-limits",
    "title": "Les limites du mode hors ligne",
    "keywords": [
      "Les limites du mode hors ligne",
      "Alice sans connexion",
      "fonctionnement hors ligne",
      "Quelles fonctions nécessitent encore une connexion ?",
      "Une IA locale permet-elle de tout faire hors ligne ?",
      "alice-app",
      "learning",
      "alice offline limits"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’absence de connexion n’a pas le même effet sur chaque fonction. Des contenus déjà présents et une IA locale prête peuvent rester utilisables dans une application compatible. Les services distants, les données récentes et la diffusion des paiements nécessitent le réseau.\n\nExplication\nL’IA locale dépend d’une application équipée et d’un modèle disponible. L’onglet navigateur ne propose pas cette IA locale. L’IA cloud demande une connexion.\n\nDans Learn, le français et l’anglais sont prévus comme contenus embarqués. Les autres langues peuvent venir d’une source distante. Leur téléchargement tente de récupérer les fichiers, mais ne garantit pas leur conservation complète hors ligne.\n\nExplorer doit joindre ses fournisseurs pour obtenir des données récentes. Une donnée déjà consultée ne garantit pas l’accès à tout l’historique ni une information à jour.\n\nDans Playground, certains calculs et la signature sont locaux. Le parcours d’envoi peut néanmoins demander des informations du réseau ; actualiser les fonds, obtenir des sats au faucet et diffuser une transaction nécessitent une connexion.\n\nLimites et confusions\n« Local » ne signifie pas « tout disponible hors ligne ». Cette fiche décrit les dépendances observées dans le code ; elle ne certifie pas un fonctionnement complet hors ligne sur chaque appareil ou installation.",
    "parentIds": [],
    "relatedIds": [
      "alice-app-overview",
      "alice-explorer",
      "alice-learn",
      "alice-playground"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "alice-repo:apps/app-web/src/components/settings/AiTab.tsx",
      "alice-repo:apps/app-web/src/lib/explorer/provider.ts",
      "alice-repo:apps/app-web/src/lib/explorer/networks.ts",
      "alice-repo:apps/app-web/src/lib/learn/packs.ts",
      "alice-repo:apps/app-web/src/lib/learn/packs-base.ts",
      "alice-repo:apps/app-web/src/lib/learn/language-downloads.ts",
      "alice-repo:apps/app-web/src/lib/playground.ts"
    ],
    "questions": [
      "Quelles fonctions nécessitent encore une connexion ?",
      "Une IA locale permet-elle de tout faire hors ligne ?"
    ],
    "status": "reviewed",
    "sourceHash": "ff99e1b50839b44b3509e921c180f262cf0397d181b91f7c96280de21a1dfd8e",
    "sourcePath": "data/alice-corpus/examples/alice-offline-limits.fr.md",
    "theme": "alice-app"
  },
  {
    "id": "curated-alice-playground",
    "conceptId": "alice-playground",
    "title": "Le wallet playground d’Alice App",
    "keywords": [
      "Le wallet playground d’Alice App",
      "playground",
      "wallet de test",
      "À quoi sert le wallet playground d’Alice App ?",
      "Est-ce que j’y utilise de vrais bitcoins ?",
      "alice-app",
      "learning",
      "alice playground"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe wallet playground est l’espace de pratique d’Alice App. Il sert à expérimenter des opérations on-chain avec des sats de test sur Mutinynet.\n\nExplication\nOn peut y découvrir la préparation, la signature et la diffusion d’un paiement on-chain, puis consulter le solde, les UTXO et l’historique sur le réseau de test.\n\nLe playground crée sur place sa propre phrase de récupération BIP39 de 12 mots. Le parcours actuel ne propose pas d’importer une phrase existante. La sauvegarde de ces mots fait partie de l’exercice ; ils contrôlent ce portefeuille de pratique. Les sats de test ne sont pas des bitcoins mainnet.\n\nLimites et confusions\nNe jamais saisir la phrase d’un portefeuille contenant des fonds réels dans un outil de test, un site ou une conversation. Le playground ne démontre pas à lui seul le comportement des frais ou délais du réseau principal.",
    "parentIds": [],
    "relatedIds": [
      "playground-testnet-limits",
      "alice-app-overview",
      "alice-offline-limits"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "alice-repo:apps/app-web/src/lib/playground.ts",
      "alice-repo:packages/practice-wallet/src/practice-keys.ts",
      "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki",
      "https://github.com/MutinyWallet/mutiny-net"
    ],
    "questions": [
      "À quoi sert le wallet playground d’Alice App ?",
      "Est-ce que j’y utilise de vrais bitcoins ?"
    ],
    "status": "reviewed",
    "sourceHash": "6769f3c2b89ae9b64800ed72711fe93f68d44fee72cc678248ea21e4a3ccdf94",
    "sourcePath": "data/alice-corpus/examples/alice-playground.fr.md",
    "theme": "alice-app"
  },
  {
    "id": "curated-alice-practice-faucet",
    "conceptId": "alice-practice-faucet",
    "title": "Obtenir des sats de test",
    "keywords": [
      "Obtenir des sats de test",
      "docs/test-wallet-faucet.md",
      "Comment fonctionne la distribution de sats pour s’entraîner ?",
      "Alice App et apprentissage",
      "alice practice faucet"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe faucet d’Alice fournit des sats de test pour apprendre dans le wallet playground. Ces unités appartiennent au réseau Mutinynet et ne sont pas des bitcoins utilisables sur le réseau principal.\n\nExplication\nDans la version documentaire relue au commit 46e2e9da, Alice distribue 2 100 sats depuis son propre portefeuille de test. Elle ne relaie pas automatiquement une demande au faucet public. La distribution est limitée à 1 demande par installation et à 100 distributions par jour pour la plateforme.\n\nCes limites protègent la réserve et répartissent son usage. La limite par installation n’est pas une preuve d’identité ; la documentation précise qu’effacer les données peut renouveler cet identifiant. La disponibilité dépend aussi du financement et de la configuration du service.\n\nLimites et confusions\nSi le service ne peut pas distribuer, le parcours prévu ouvre le faucet public Mutinynet avec l’adresse de test à utiliser. Ce repli ne garantit pas que ce service externe acceptera immédiatement la demande.\n\nNe jamais utiliser de fonds réels ni une phrase de récupération d’un portefeuille réel dans ce parcours. Le montant et les limites décrivent la version consultée ; cette adaptation n’a pas exécuté de distribution ni vérifié le service déployé.",
    "parentIds": [],
    "relatedIds": [
      "playground-testnet-limits",
      "alice-playground",
      "secondary-history-bitcoin-faucet"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "alice-repo:46e2e9da:docs/test-wallet-faucet.md"
    ],
    "questions": [
      "Comment fonctionne la distribution de sats pour s’entraîner ?"
    ],
    "status": "reviewed",
    "sourceHash": "a06186aff56810562cd05ee91c6490664317844d2d72ecbe1184e3e3486549ed",
    "sourcePath": "data/alice-corpus/examples/alice-practice-faucet.fr.md",
    "theme": "Alice App et apprentissage"
  },
  {
    "id": "curated-alice-private-cloud",
    "conceptId": "alice-private-cloud",
    "title": "Comprendre le mode Private Cloud",
    "keywords": [
      "Comprendre le mode Private Cloud",
      "docs/security/private-cloud-e2ee.md",
      "Quelles protections et quelles limites faut-il comprendre ?",
      "Alice App et apprentissage",
      "alice private cloud"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe mode Private Cloud chiffre la requête sur l’appareil et fait traiter son contenu dans une enclave matérielle distante. Il ne faut pas le confondre avec le mode local, où le modèle fonctionne sur l’appareil.\n\nExplication\nLe trajet documenté protège le contenu en transit à travers les relais, puis le déchiffre dans l’enclave pour que le modèle puisse répondre. La réponse revient chiffrée. Les intermédiaires peuvent encore observer des métadonnées, comme le modèle demandé, les tailles et les horaires de requête.\n\nLa documentation relue au commit 46e2e9da décrit une vérification de l’attestation matérielle et de la liaison avec la clé avant chaque envoi. Elle précise toutefois que les références permettant de vérifier le logiciel exact exécuté ne sont pas encore activées. Le niveau atteint est nommé attested-unpinned.\n\nLimites et confusions\nIl serait excessif d’affirmer qu’Alice vérifie intégralement tout le code exécuté dans le cloud. L’attestation GPU reste également une limite documentée. Le chiffrement et la vérification du logiciel sont des garanties distinctes.\n\nLe contexte nécessaire à la réponse, y compris certains éléments de mémoire, peut accompagner le message chiffré. Cette fiche décrit le périmètre documenté à une version précise ; elle ne rapporte ni un nouvel audit de sécurité ni un test du service en production.",
    "parentIds": [],
    "relatedIds": [
      "alice-user-memory",
      "alice-offline-limits"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "alice-repo:46e2e9da:docs/security/private-cloud-e2ee.md"
    ],
    "questions": [
      "Quelles protections et quelles limites faut-il comprendre ?"
    ],
    "status": "reviewed",
    "sourceHash": "c2c4f8d5ab78bdb4f09b71dd715a65cbe0f75b397b8798974c4685c0e98805e6",
    "sourcePath": "data/alice-corpus/examples/alice-private-cloud.fr.md",
    "theme": "Alice App et apprentissage"
  },
  {
    "id": "curated-alice-rag",
    "conceptId": "alice-rag",
    "title": "Les connaissances consultées par Alice",
    "keywords": [
      "Les connaissances consultées par Alice",
      "docs/RAG_EVALUATION.md",
      "Pourquoi une réponse peut-elle citer des connaissances du corpus ?",
      "Alice App et apprentissage",
      "alice rag"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe RAG permet à Alice de rechercher des passages dans un corpus documentaire avant de répondre. Il aide à fournir un contexte pertinent au modèle, mais ne garantit pas que la réponse sera correcte.\n\nExplication\nLa recherche et la rédaction sont des étapes distinctes. Alice peut retrouver la bonne note et néanmoins mal la résumer, omettre une condition ou inventer un lien entre plusieurs passages. L’évaluation doit donc vérifier à la fois les documents retenus et le contenu produit.\n\nLa documentation au commit 46e2e9da décrit des jeux de questions séparant le développement et l’acceptation. Les verdicts automatiques constituent un indicateur reproductible selon la méthode utilisée, pas une validation humaine exhaustive. Les résultats d’une version et d’un modèle ne doivent pas être attribués automatiquement aux autres.\n\nLimites et confusions\nLe corpus préparé avec un socle et des approfondissements exprime une politique documentaire. Sa présence dans des fichiers ne prouve pas que le moteur actif l’importe ni qu’il applique déjà le routage à 2 niveaux.\n\nAlice doit présenter les sources comme des appuis à examiner et conserver leurs limites. Une note secondaire n’est pas moins vraie par définition ; elle est consultée pour apporter un détail utile sans encombrer une réponse d’introduction. Le bon passage doit rester accessible dès qu’une question le nécessite.",
    "parentIds": [],
    "relatedIds": [
      "alice-app-overview",
      "alice-user-memory"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "alice-repo:46e2e9da:docs/RAG_EVALUATION.md"
    ],
    "questions": [
      "Pourquoi une réponse peut-elle citer des connaissances du corpus ?"
    ],
    "status": "reviewed",
    "sourceHash": "355d7e59f54b04d95d0ee7a78ff2dac10a190ead9741deb0ede11979d2878513",
    "sourcePath": "data/alice-corpus/examples/alice-rag.fr.md",
    "theme": "Alice App et apprentissage"
  },
  {
    "id": "curated-alice-user-memory",
    "conceptId": "alice-user-memory",
    "title": "La mémoire personnelle d’Alice",
    "keywords": [
      "La mémoire personnelle d’Alice",
      "docs/ALICE_USER_MEMORY.md",
      "Que signifie la mémoire d’Alice et comment la distinguer du corpus Bitcoin ?",
      "Alice App et apprentissage",
      "alice user memory"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa mémoire personnelle d’Alice sert à adapter ses explications à des préférences ou à des éléments déclarés par l’utilisateur. Elle est distincte du corpus de connaissances Bitcoin et de l’historique des conversations.\n\nExplication\nLa documentation relue distingue une mémoire de petits faits personnels et un profil d’apprentissage par concept. Ces informations ajustent le vocabulaire, les prérequis et la profondeur de réponse ; elles ne constituent pas des preuves sur Bitcoin et ne doivent pas remplacer la demande actuelle.\n\nL’écran « What Alice remembers » permet de voir, modifier ou supprimer des éléments. Désactiver la mémoire personnelle n’équivaut pas à supprimer les conversations ni à désactiver toutes les traces d’apprentissage. Les commandes de suppression ont des périmètres différents.\n\nLimites et confusions\nLes filtres cherchent à exclure les secrets, les montants et les identifiants, mais peuvent se tromper. Ne pas transmettre à Alice de phrase de récupération ou de clé privée en comptant sur ce filtre.\n\nLe stockage local ne signifie pas que le contexte reste toujours sur l’appareil. Les éléments sélectionnés peuvent accompagner la requête vers le moteur choisi ; en Private Cloud, ils voyagent dans le corps chiffré. En mode local, l’inférence est locale. Cette fiche décrit la documentation au commit 46e2e9da, sans nouvel essai fonctionnel.",
    "parentIds": [],
    "relatedIds": [
      "alice-local-encryption",
      "alice-private-cloud"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "alice-repo:46e2e9da:docs/ALICE_USER_MEMORY.md"
    ],
    "questions": [
      "Que signifie la mémoire d’Alice et comment la distinguer du corpus Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "e66263aab4a9a1752697249f51dce05c5c473101c84142daa7ba9ac45a045ed2",
    "sourcePath": "data/alice-corpus/examples/alice-user-memory.fr.md",
    "theme": "Alice App et apprentissage"
  },
  {
    "id": "curated-ark-boarding-offboarding-and-exits",
    "conceptId": "ark-boarding-offboarding-and-exits",
    "title": "Entrer et sortir d’Ark",
    "keywords": [
      "Entrer et sortir d’Ark",
      "Ark Boarding Offboarding and Exits",
      "Comment distinguer une sortie coopérative d’une sortie unilatérale ?",
      "Ark et autres couches",
      "ark boarding offboarding and exits"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nEntrer dans Ark, sortir avec l’opérateur et sortir sans sa coopération sont des opérations différentes. Elles n’ont ni les mêmes frais ni les mêmes délais ni les mêmes conditions.\n\nExplication\nLe boarding apporte des bitcoins on-chain pour créer un VTXO. Le chemin exact dépend de l’implémentation et du wallet ; certaines interfaces utilisent aussi des services de swap. Recevoir un paiement Ark n’exige pas nécessairement de réaliser soi-même un boarding.\n\nL’offboarding coopératif transforme le droit hors chaîne en paiement Bitcoin avec l’aide du serveur. Une sortie d’urgence utilise au contraire les transactions pré-signées et les délais prévus pour récupérer sans cette coopération. Elle peut nécessiter plusieurs publications successives et une gestion attentive des frais.\n\nLimites et confusions\nUne sortie d’urgence n’est pas un retrait instantané gratuit. Sa faisabilité dépend du type de VTXO, des données conservées et de l’échéance. Chez Second, elle doit être entièrement confirmée avant expiration.\n\nLe wallet doit distinguer une opération coopérative habituelle d’un recours d’urgence. Les procédures de Bark ne doivent pas être appliquées aveuglément à Arkade ou à une autre implémentation. Pour une opération concrète, consulter les indications de la version utilisée.",
    "parentIds": [],
    "relatedIds": [
      "ark-security-model",
      "ark-implementations-bark-arkade"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "Second, Ark boarding et Ark offboarding, documentation citée dans la note source",
      "Arkade, Ramps: Onboarding & Offboarding, documentation citée dans la note source"
    ],
    "questions": [
      "Comment distinguer une sortie coopérative d’une sortie unilatérale ?"
    ],
    "status": "reviewed",
    "sourceHash": "a29dd6a4c14aa72d48beabed3455f2844fa153384def0c2bee0ad3547b6b382b",
    "sourcePath": "data/alice-corpus/examples/ark-boarding-offboarding-and-exits.fr.md",
    "theme": "Ark et autres couches"
  },
  {
    "id": "curated-ark-fees-and-liquidity",
    "conceptId": "ark-fees-and-liquidity",
    "title": "Les frais et la liquidité d’Ark",
    "keywords": [
      "Les frais et la liquidité d’Ark",
      "Ark Fees and Liquidity",
      "Quels coûts et contraintes faut-il comprendre avec Ark ?",
      "Ark et autres couches",
      "ark fees and liquidity"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nArk simplifie la gestion de liquidité côté utilisateur, mais ne fait pas disparaître son coût. Le serveur mobilise du capital pour certaines opérations, notamment le renouvellement ou les paiements vers d’autres systèmes.\n\nExplication\nLors d’un renouvellement, l’opérateur peut financer de nouveaux VTXO avant de récupérer les anciens. Une sortie coopérative ou un paiement Lightning peut aussi lui demander d’avancer des fonds. La durée de cette immobilisation contribue au coût du service.\n\nUn paiement interne peut avoir un coût marginal faible, tandis qu’une sortie on-chain implique les frais de Bitcoin. Il faut donc distinguer les frais du serveur, le coût des transactions Bitcoin et les éventuels frais de routage Lightning. L’interface devrait montrer le devis de l’opération effectivement demandée.\n\nLimites et confusions\nUn ancien barème n’est pas un tarif garanti. Les paramètres sont configurables selon l’opérateur, le type d’opération et le temps restant avant expiration. Cette fiche ne reprend pas les pourcentages historiques comme des tarifs actuels.\n\nAttendre pour réduire certains frais ne doit pas conduire à manquer l’échéance d’un VTXO. L’économie d’un renouvellement et la marge nécessaire pour récupérer ses fonds sont 2 contraintes à examiner ensemble.",
    "parentIds": [],
    "relatedIds": [
      "ark-security-model",
      "ark-implementations-bark-arkade"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://second.tech/docs/learn/fees",
      "https://second.tech/docs/learn/liquidity"
    ],
    "questions": [
      "Quels coûts et contraintes faut-il comprendre avec Ark ?"
    ],
    "status": "reviewed",
    "sourceHash": "031a0b6b3082477494d90da872eaf8c6cf42128359a97178d2debacb201cf7ed",
    "sourcePath": "data/alice-corpus/examples/ark-fees-and-liquidity.fr.md",
    "theme": "Ark et autres couches"
  },
  {
    "id": "curated-ark-implementations-bark-arkade",
    "conceptId": "ark-implementations-bark-arkade",
    "title": "Ark, Bark et Arkade, comprendre les différences",
    "keywords": [
      "Ark, Bark et Arkade, comprendre les différences",
      "Bark",
      "Second",
      "Arkade",
      "implémentations Ark",
      "Ark, Bark et Arkade désignent-ils le même logiciel ?",
      "Quels usages et quelles conditions de sortie faut-il comparer ?",
      "bitcoin-layers",
      "ark",
      "custody",
      "ark implementations bark arkade"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nArk désigne une famille de protocoles utilisant des sorties virtuelles, ou VTXO. Bark est l’implémentation développée par Second pour les paiements. Arkade développe aussi des outils de paiement, de contrats et d’actifs autour des VTXO. Leurs fonctionnalités et garanties doivent être étudiées séparément.\n\nExplication\nBark propose des outils pour envoyer et recevoir via Ark, Lightning et Bitcoin, avec un serveur qui coordonne les opérations. Son utilisateur n’a pas à administrer ses propres canaux Lightning pour utiliser les fonctions proposées par le service.\n\nArkade expose des transactions virtuelles, un règlement par lots et des conditions de dépense programmables. La documentation distingue l’exécution rapide hors chaîne de son ancrage dans Bitcoin. Les garanties d’un actif émis ajoutent notamment les conditions de son émetteur.\n\nDans les 2 cas, il faut examiner l’état du VTXO, les transactions nécessaires à sa sortie, les frais et l’expiration. Une sortie d’urgence doit pouvoir aboutir à temps, avec les données nécessaires. Après expiration, une récupération peut dépendre de la coopération de l’opérateur ; le renouvellement automatique dépend du fonctionnement réel du wallet ou du délégué.\n\nLimites et confusions\nLes noms ne sont pas interchangeables. Les exigences d’une implémentation ne doivent pas devenir une règle universelle d’Ark.\n\nLa présentation d’Offchain Media est un point d’entrée pédagogique. Les documentations Second et Arkade ont été consultées le 2026-10-11 ; leurs annonces de sécurité décrivent leur modèle et ne constituent pas un audit indépendant des déploiements. Aucun test de sortie ni vérification de l’attestation matérielle d’un opérateur n’est revendiqué ici.",
    "parentIds": [
      "ark-vtxos",
      "ark-payments",
      "ark-security-model",
      "bitcoin-layered-architecture"
    ],
    "relatedIds": [
      "spark-trust-and-exits",
      "fedimint-custody-and-privacy",
      "alice-explorer"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://offchain.media/article/what-is-ark-bitcoin",
      "https://second.tech/docs",
      "https://second.tech/docs/learn/lifetime",
      "https://docs.arkadeos.com/",
      "https://docs.arkadeos.com/learn/core-concepts/security-and-trust-model",
      "https://docs.arkadeos.com/learn/core-concepts/vtxo-lifecycle-and-liveness"
    ],
    "questions": [
      "Ark, Bark et Arkade désignent-ils le même logiciel ?",
      "Quels usages et quelles conditions de sortie faut-il comparer ?"
    ],
    "status": "reviewed",
    "sourceHash": "fb42279f2fd4ebd28149774e7f0e08688b7c2610a4d93410980034c467134434",
    "sourcePath": "data/alice-corpus/examples/ark-implementations-bark-arkade.fr.md",
    "theme": "bitcoin-layers"
  },
  {
    "id": "curated-ark-payments",
    "conceptId": "ark-payments",
    "title": "Les paiements avec Ark",
    "keywords": [
      "Les paiements avec Ark",
      "Ark Payments",
      "Comment situer un paiement Ark par rapport à un paiement on-chain ?",
      "Ark et autres couches",
      "ark payments"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nArk permet des paiements hors chaîne sans demander à chaque utilisateur de gérer des canaux Lightning. Chez Second/Bark, les paiements arkoor créent rapidement de nouveaux VTXO à partir d’une structure existante.\n\nExplication\nLe paiement peut laisser une partie en monnaie rendue à l’émetteur et attribuer un nouveau droit au destinataire. Selon le wallet, celui-ci peut recevoir sans être connecté au même moment. Le serveur coopère au fonctionnement normal.\n\nUn VTXO reçu par arkoor comporte une hypothèse de non-collusion entre les anciens émetteurs et le serveur. Le renouvellement dans un round permet de revenir au modèle standard décrit par l’implémentation. Ce compromis explique pourquoi un paiement rapide et une sortie unilatérale ne doivent pas être confondus avec une garantie sans aucune hypothèse.\n\nLimites et confusions\nLa réputation d’un opérateur et ses revenus attendus peuvent décourager la triche. Ils ne constituent pas une garantie cryptographique contre la collusion.\n\nL’absence de gestion de canaux côté utilisateur ne rend pas tous les coûts nuls. Les renouvellements, les sorties et certaines connexions à Lightning mobilisent de la liquidité et des frais. Les politiques du wallet et les échéances des VTXO doivent rester visibles.",
    "parentIds": [],
    "relatedIds": [
      "ark-implementations-bark-arkade",
      "ark-security-model"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://second.tech/docs/learn/payments"
    ],
    "questions": [
      "Comment situer un paiement Ark par rapport à un paiement on-chain ?"
    ],
    "status": "reviewed",
    "sourceHash": "b7aa01c02a2459666d2f84d72ffd825569e63eb2abbd55d863d0b977d2f9a856",
    "sourcePath": "data/alice-corpus/examples/ark-payments.fr.md",
    "theme": "Ark et autres couches"
  },
  {
    "id": "curated-ark-security-model",
    "conceptId": "ark-security-model",
    "title": "Les hypothèses de sécurité d’Ark",
    "keywords": [
      "Les hypothèses de sécurité d’Ark",
      "Ark Security Model",
      "De qui dépend-on lorsqu’on utilise Ark ?",
      "Ark et autres couches",
      "ark security model"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nArk combine une voie normale coopérative avec des mécanismes de sortie vers Bitcoin. La possibilité de sortir seul dépend du VTXO, de son échéance, des données disponibles et de l’implémentation.\n\nExplication\nDétenir les clés est nécessaire, mais ne résume pas toute la sécurité. Il faut aussi conserver les transactions de récupération et pouvoir payer leur publication. Chez Second, une sortie doit être entièrement confirmée avant l’expiration du VTXO. Lancer la procédure juste avant l’échéance ne suffit donc pas.\n\nAprès expiration, l’utilisateur ne peut plus récupérer seul les fonds et dépend de la coopération de l’opérateur. Une perte devient possible si cette coopération manque. Le wallet doit renouveler les VTXO à temps. Les paiements arkoor ajoutent temporairement une hypothèse de non-collusion qui doit être distinguée de ce risque d’expiration.\n\nLimites et confusions\nUne sortie massive peut rendre les frais élevés, surtout pour de petits montants ou des chemins longs. La sortie théoriquement disponible n’est pas nécessairement économique dans toutes les conditions.\n\nLes mécanismes de Second/Bark et d’Arkade ne sont pas identiques. Les dispositifs matériels ou de signature d’une implémentation ne doivent pas être présentés comme des garanties communes à tout Ark.",
    "parentIds": [],
    "relatedIds": [
      "ark-implementations-bark-arkade",
      "ark-boarding-offboarding-and-exits"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://second.tech/docs/learn/lifetime",
      "https://second.tech/docs/learn/exit"
    ],
    "questions": [
      "De qui dépend-on lorsqu’on utilise Ark ?"
    ],
    "status": "reviewed",
    "sourceHash": "390ffd7f8385c9e001073934b19e4895b1eb3e097f32779ee41c1bf0f954dab3",
    "sourcePath": "data/alice-corpus/examples/ark-security-model.fr.md",
    "theme": "Ark et autres couches"
  },
  {
    "id": "curated-ark-vtxos",
    "conceptId": "ark-vtxos",
    "title": "Les sorties virtuelles d’Ark",
    "keywords": [
      "Les sorties virtuelles d’Ark",
      "Ark VTXOs",
      "Qu’est-ce qu’un VTXO ?",
      "Ark et autres couches",
      "ark vtxos"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn VTXO est une sortie virtuelle utilisée dans Ark. Il représente un droit sur des bitcoins à travers des transactions pré-signées, avec des conditions de paiement et de récupération propres à son type.\n\nExplication\nPlusieurs utilisateurs peuvent partager une structure de transactions ancrée sur Bitcoin, tout en disposant de chemins de sortie individuels. Tant que le fonctionnement est coopératif, les paiements restent hors chaîne. Une sortie d’urgence publie les transactions nécessaires pour revenir à des UTXO Bitcoin.\n\nChez Second/Bark, la provenance distingue notamment les VTXO issus d’une entrée on-chain, d’un renouvellement et d’un paiement arkoor. Ces derniers ajoutent une hypothèse temporaire de non-collusion entre les précédents émetteurs et le serveur. Le nom VTXO ne suffit donc pas à déterminer toutes les garanties.\n\nLimites et confusions\nUn VTXO a une échéance. Dans les mécanismes documentés, la récupération unilatérale doit aboutir à temps ; chez Second, elle doit être entièrement confirmée avant expiration. Les données de récupération et les frais nécessaires doivent être disponibles.\n\nIl ne faut pas présenter le VTXO comme une sortie Bitcoin ordinaire déjà dépensable directement. Son historique, son ancrage et l’implémentation déterminent le chemin de récupération.",
    "parentIds": [],
    "relatedIds": [
      "ark-implementations-bark-arkade",
      "ark-security-model"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://second.tech/docs/learn/exit",
      "https://second.tech/docs/learn/lifetime",
      "https://docs.arkadeos.com/learn/core-concepts/vtxo-lifecycle-and-liveness"
    ],
    "questions": [
      "Qu’est-ce qu’un VTXO ?"
    ],
    "status": "reviewed",
    "sourceHash": "66bf3ff324c28ee79766fdb3b4bdcadeab3ce0a12369950805f87164e074f105",
    "sourcePath": "data/alice-corpus/examples/ark-vtxos.fr.md",
    "theme": "Ark et autres couches"
  },
  {
    "id": "curated-asic-heat-reuse",
    "conceptId": "asic-heat-reuse",
    "title": "La récupération de chaleur",
    "keywords": [
      "La récupération de chaleur",
      "ASIC Heat Reuse",
      "Peut-on utiliser la chaleur des machines ?",
      "Minage et énergie",
      "asic heat reuse"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn ASIC transforme presque toute son électricité en chaleur. Cette chaleur peut servir au chauffage si elle est captée au bon endroit et au bon moment, en plus du travail de minage effectué.\n\nExplication\nLe gain thermique vient du chauffage remplacé. Si le logement aurait utilisé un radiateur électrique, la chaleur d’un ASIC peut assurer une partie du même service. En revanche, produire de la chaleur dans une pièce déjà trop chaude n’évite aucune consommation utile et peut demander du refroidissement supplémentaire.\n\nLe bilan doit donc préciser le besoin, la saison, les pertes de récupération, le prix de l’électricité et l’équipement remplacé. Le revenu minier peut réduire le coût net, mais varie avec la difficulté, les frais des blocs et le prix du bitcoin. Bruit, ventilation et sécurité de l’installation comptent aussi dans l’usage réel.\n\nLimites et confusions\nUne pompe à chaleur peut fournir davantage de chaleur utile par kWh électrique qu’un ASIC seul. Il faut comparer le même service thermique, pas seulement la puissance nominale des appareils.\n\nRécupérer la chaleur n’annule pas automatiquement l’empreinte énergétique ou les émissions. Le bénéfice dépend du scénario de référence et de la chaleur réellement valorisée sur l’année.",
    "parentIds": [],
    "relatedIds": [
      "mining-heat-reuse-details",
      "bitcoin-energy-debate",
      "secondary-bitcoin-asic-noise-reduction",
      "secondary-bitcoin-home-bitcoin-mining"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://www.energy.gov/energysaver/heat-pump-systems"
    ],
    "questions": [
      "Peut-on utiliser la chaleur des machines ?"
    ],
    "status": "reviewed",
    "sourceHash": "a6f5d10c0bfd6c7f3a64e85900f011b0c82afe20c061fce36b98a12ff932016d",
    "sourcePath": "data/alice-corpus/examples/asic-heat-reuse.fr.md",
    "theme": "Minage et énergie"
  },
  {
    "id": "curated-asic-mining",
    "conceptId": "asic-mining",
    "title": "Les machines spécialisées",
    "keywords": [
      "Les machines spécialisées",
      "ASIC Mining",
      "Pourquoi ne mine-t-on généralement pas avec un ordinateur ordinaire ?",
      "Minage et énergie",
      "asic mining"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn ASIC est un circuit conçu pour une tâche spécialisée. Pour Bitcoin, les machines de minage utilisent des ASIC optimisés pour les calculs de preuve de travail fondés sur SHA-256.\n\nExplication\nCette spécialisation permet bien davantage de calculs par unité d’électricité qu’un ordinateur généraliste pour la même tâche. Par extension, « ASIC » désigne souvent la machine complète, avec ses puces, son alimentation et son refroidissement.\n\nLa comparaison entre machines porte notamment sur leur puissance de calcul, leur consommation et leur efficacité énergétique. Il faut aussi tenir compte du bruit, de la chaleur et des conditions d’exploitation. Un ordinateur capable de vérifier Bitcoin n’a pas besoin d’être un ASIC ; vérifier les règles et participer à la compétition du minage sont des activités distinctes.\n\nLimites et confusions\n« Plus efficace » ne signifie pas que la machine consomme peu en valeur absolue ni qu’elle sera rentable. Une installation peut employer de nombreuses machines puissantes. Le prix de l’électricité, le coût d’achat et la difficulté changent le résultat économique.\n\nLa spécialisation crée aussi des dépendances aux fabricants et à l’approvisionnement. Un ancien modèle peut avoir un intérêt pédagogique ou thermique sans être compétitif pour vendre uniquement son revenu minier.",
    "parentIds": [],
    "relatedIds": [
      "mining-profitability",
      "asic-heat-reuse",
      "secondary-bitcoin-asic-noise-reduction",
      "secondary-bitcoin-bitaxe",
      "secondary-bitcoin-open-source-mining-hardware",
      "secondary-bitcoin-stratum-mining-protocol"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB min101 — Introduction to Bitcoin mining",
      "PlanB min304 — Heat your home while mining bitcoins"
    ],
    "questions": [
      "Pourquoi ne mine-t-on généralement pas avec un ordinateur ordinaire ?"
    ],
    "status": "reviewed",
    "sourceHash": "a0620cc490bac094db2adda69b74f7b96e763cb5507c6d79672d94b00a51ac4b",
    "sourcePath": "data/alice-corpus/examples/asic-mining.fr.md",
    "theme": "Minage et énergie"
  },
  {
    "id": "curated-atomic-swap",
    "conceptId": "atomic-swap",
    "title": "Les échanges atomiques",
    "keywords": [
      "Les échanges atomiques",
      "Atomic Swap",
      "Que signifie échanger sans qu’une partie puisse garder les 2 actifs ?",
      "Ark et autres couches",
      "atomic swap"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn échange atomique lie les paiements de 2 parties pour permettre l’échange complet ou la récupération selon les conditions du protocole. Il réduit le besoin de confier simultanément les fonds à un intermédiaire.\n\nExplication\nLes mécanismes peuvent utiliser des contrats fondés sur un secret et des délais, ou des signatures adaptatrices. Le choix dépend des primitives disponibles et de la compatibilité des systèmes. Les conditions organisent le règlement et les recours si une partie cesse de coopérer.\n\nL’atomicité concerne la liaison entre les dépenses. Elle ne garantit pas que la contrepartie acceptera de commencer, que la liquidité sera disponible ou que l’expérience sera instantanée. Les participants doivent conserver leurs données et pouvoir agir sur les réseaux concernés dans les délais.\n\nLimites et confusions\nUne tentative abandonnée peut immobiliser les fonds et coûter des frais, même si le principal reste récupérable. Un défaut d’implémentation ou une échéance mal choisie peut remettre en cause la sécurité attendue.\n\nLes signatures adaptatrices ne sont pas un remplacement universel des autres mécanismes ni une preuve d’anonymat. Pour comparer un service concret, vérifier le protocole réellement utilisé, ses hypothèses et qui peut déclencher une récupération.",
    "parentIds": [],
    "relatedIds": [
      "counterparty-risk",
      "bitcoin-layered-architecture",
      "secondary-addresses-hashlock",
      "secondary-bitcoin-adaptor-signature",
      "secondary-bitcoin-dlc",
      "secondary-lightning-submarine-swap"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/BlockstreamResearch/scriptless-scripts/blob/master/md/atomic-swap.md",
      "https://docs.lightning.engineering/the-lightning-network/multihop-payments/hash-time-lock-contract-htlc"
    ],
    "questions": [
      "Que signifie échanger sans qu’une partie puisse garder les 2 actifs ?"
    ],
    "status": "reviewed",
    "sourceHash": "da0541e82fd247a30d5f004f4d2ee3a38f7c1b00d75d1e5582781c28b8112651",
    "sourcePath": "data/alice-corpus/examples/atomic-swap.fr.md",
    "theme": "Ark et autres couches"
  },
  {
    "id": "curated-bip39-passphrase",
    "conceptId": "bip39-passphrase",
    "title": "La passphrase optionnelle",
    "keywords": [
      "La passphrase optionnelle",
      "BIP39 Passphrase",
      "Une passphrase est-elle simplement un mot de passe ?",
      "wallets",
      "bip39 passphrase"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa passphrase BIP39 est un secret optionnel qui modifie la seed dérivée des mots de récupération. Elle ne se limite pas à déverrouiller l’interface comme un mot de passe d’application.\n\nExplication\nAvec la même phrase de récupération, une passphrase différente produit un autre portefeuille. La combinaison exacte doit donc rester récupérable. Une erreur de saisie peut conduire à des adresses différentes plutôt qu’à un message signalant un mauvais mot de passe.\n\nCette séparation peut limiter les conséquences de la découverte des seuls mots. Elle introduit aussi un risque de perte supplémentaire si le détenteur ou ses proches ne disposent plus de la bonne passphrase.\n\nLimites et confusions\nAjouter une passphrase n’améliore pas automatiquement la sécurité. Son intérêt dépend de sa qualité, de sa conservation et de la compréhension de son rôle. Elle ne remplace pas une sauvegarde complète ni les paramètres nécessaires à la restauration. La présenter simplement comme un « mot supplémentaire » peut masquer son fonctionnement et ses contraintes de compatibilité.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-seed",
      "wallet-backup",
      "bitcoin-inheritance-plan",
      "secondary-bitcoin-pbkdf2"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Une passphrase est-elle simplement un mot de passe ?"
    ],
    "status": "reviewed",
    "sourceHash": "bfa29bb05a64dcf1b6252c453008e81e2b187730f24ec916c6ad0b32cdc06894",
    "sourcePath": "data/alice-corpus/examples/bip39-passphrase.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-bitcoin-address",
    "conceptId": "bitcoin-address",
    "title": "Comprendre une adresse Bitcoin",
    "keywords": [
      "Comprendre une adresse Bitcoin",
      "Bitcoin Address",
      "Une adresse est-elle mon compte Bitcoin ?",
      "transactions",
      "bitcoin address"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne adresse est une représentation pratique des conditions destinées à recevoir des bitcoins. Ce n’est ni un compte personnel global, ni une clé privée, ni tout le portefeuille.\n\nExplication\nLe portefeuille peut produire de nombreuses adresses à partir de ses informations de clés. Un destinataire communique une adresse ; le payeur l’utilise pour construire une sortie de transaction. La dépense ultérieure devra respecter les conditions associées à cette sortie.\n\nLes formats d’adresses ont évolué. Des préfixes différents correspondent à des familles de sorties différentes et à des besoins de compatibilité. Changer d’adresse de réception ne signifie donc pas nécessairement changer de portefeuille.\n\nLimites et confusions\nUne adresse révèle des informations sur les transactions qui lui sont associées. La publier ou la réutiliser peut faciliter les rapprochements. Son format ne prouve pas l’identité de son propriétaire. Pour une opération avec un hardware wallet, l’adresse affichée sur l’appareil doit être comparée intégralement à une information fiable ; une simple ressemblance du début et de la fin ne suffit pas.",
    "parentIds": [],
    "relatedIds": [
      "legacy-address",
      "address-reuse",
      "address-spoofing",
      "bitcoin-address-scripts",
      "secondary-bitcoin-base58check-encoding",
      "secondary-bitcoin-confidential-address",
      "secondary-bitcoin-hash160"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Une adresse est-elle mon compte Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "e839e7a6b7eedf7415afab9d7ffb448ab65ed9ac88788978e5557b54a705bff4",
    "sourcePath": "data/alice-corpus/examples/bitcoin-address.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-bitcoin-address-scripts",
    "conceptId": "bitcoin-address-scripts",
    "title": "Adresses, scripts et conditions de dépense",
    "keywords": [
      "Adresses, scripts et conditions de dépense",
      "types de sorties",
      "SegWit imbriqué",
      "P2WPKH",
      "P2WSH",
      "P2TR",
      "Une adresse en `3` utilise-t-elle forcément un ancien type de dépense ?",
      "Quelle différence entre P2WPKH, P2WSH et P2TR ?",
      "Que peut-on déduire d’une adresse, et qu’est-ce qui reste caché ?",
      "transactions",
      "bitcoin address scripts"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nIl faut distinguer l’encodage de l’adresse, le type de sortie et les conditions qui permettront de la dépenser. Plusieurs constructions peuvent partager le même début d’adresse. Une adresse n’est pas une description complète du wallet ni de toutes ses clés.\n\nExplication\n| Type de sortie ou construction | Repère courant sur mainnet | Principe |\n|---|---|---|\n| P2PKH | `1…` | La dépense fournit une clé publique correspondant à l’empreinte et une signature valide. |\n| P2SH | `3…` | La sortie engage une empreinte de script. La dépense révèle le script et satisfait les conditions applicables. |\n| P2SH-P2WPKH ou P2SH-P2WSH | `3…` | Un programme SegWit de version 0 est enveloppé dans P2SH. Le préfixe P2SH seul ne révèle pas cette construction. |\n| P2WPKH | `bc1q…` | SegWit natif de version 0 avec programme de 20 octets, correspondant à une empreinte de clé publique. |\n| P2WSH | `bc1q…` | SegWit natif de version 0 avec programme de 32 octets, correspondant à une empreinte de script. La dépense révèle et satisfait ce script. |\n| P2TR | `bc1p…` | Taproot utilise un programme witness de version 1 de 32 octets. Une dépense peut passer par la clé de sortie ou par un chemin de script engagé dans cette clé. |\n\nUne dépense Taproot par clé ne révèle pas les éventuels scripts alternatifs. Une dépense par script révèle le script utilisé et les éléments nécessaires pour vérifier son engagement, sans devoir révéler tous les autres scripts. Cela ne rend pas automatiquement les transactions anonymes.\n\nBech32 est utilisé pour la version witness 0. Bech32m est utilisé pour les versions 1 à 16. Le préfixe `bc1p` indique la version 1 ; la longueur et les autres règles permettent de reconnaître une sortie Taproot valide. Les versions supplémentaires prévues par l’encodage ne sont pas toutes des mécanismes de dépense déjà déployés.\n\nLe poids facturé dépend de la transaction réelle. SegWit applique un traitement distinct aux données witness. L’enveloppe P2SH ajoute des données par rapport à une construction native comparable. Pour Taproot, le chemin utilisé et les conditions satisfaites comptent aussi. Comparer seulement les préfixes ne donne donc pas un classement universel des frais.\n\nLimites et confusions\nCette liste couvre les principaux types adressables utilisés par les wallets. Des sorties telles que P2PK ou certaines sorties de données n’utilisent pas nécessairement un format d’adresse de réception usuel. Une transaction Bitcoin peut donc contenir des sorties qui ne correspondent pas à une ligne de ce tableau.\n\nP2SH et P2WSH peuvent représenter du multisig, mais leur adresse ne suffit pas à prouver que c’est le cas. Une clé Taproot peut également résulter d’une construction impliquant plusieurs participants. Le format ne remplace pas les informations nécessaires à une sauvegarde ou à une restauration.\n\nLes repères du tableau concernent mainnet. Sur les réseaux de test, les préfixes changent et certains sont partagés. La compatibilité d’un wallet doit être vérifiée pour le réseau et le type de sortie concernés.",
    "parentIds": [
      "legacy-address",
      "bitcoin-address",
      "segwit-address",
      "taproot"
    ],
    "relatedIds": [],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://developer.bitcoin.org/devguide/transactions.html",
      "https://github.com/bitcoin/bips/blob/master/bip-0013.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki"
    ],
    "questions": [
      "Une adresse en `3` utilise-t-elle forcément un ancien type de dépense ?",
      "Quelle différence entre P2WPKH, P2WSH et P2TR ?",
      "Que peut-on déduire d’une adresse, et qu’est-ce qui reste caché ?"
    ],
    "status": "reviewed",
    "sourceHash": "d03e316f784a16bd45dae4d3d0b8e2c5af06a720011f6c5ea7f8e927fe33f251",
    "sourcePath": "data/alice-corpus/examples/bitcoin-address-scripts.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-bitcoin-base-layer",
    "conceptId": "bitcoin-base-layer",
    "title": "La couche de base de Bitcoin",
    "keywords": [
      "La couche de base de Bitcoin",
      "Bitcoin Base Layer",
      "Que veut dire payer on-chain ?",
      "fundamentals",
      "bitcoin base layer"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nPayer sur la couche de base, ou « on-chain », signifie faire inscrire une transaction dans les blocs de Bitcoin. Les nœuds en vérifient les règles et les confirmations renforcent progressivement sa stabilité.\n\nExplication\nL’espace disponible dans les blocs est limité. Les paiements entrent donc en concurrence pour cet espace, notamment par leur taux de frais. Le coût dépend de la taille virtuelle de la transaction et des conditions de demande, pas simplement du montant envoyé.\n\nD’autres protocoles organisent des paiements en dehors de chaque inscription individuelle sur cette chaîne. Ils peuvent améliorer certains usages, mais ajoutent leurs propres conditions, dépendances et limites. La couche de base reste alors un point de règlement ou de sortie selon le protocole.\n\nLimites et confusions\nPlus une transaction accumule de confirmations, plus le risque d’annulation devient faible. Aucun montant minimum d’usage n’est imposé par une règle réservant Bitcoin aux gros règlements. Le choix entre couches dépend des frais, des délais, des besoins et du modèle de confiance ; « hors chaîne » ne décrit pas à lui seul le niveau de sécurité.",
    "parentIds": [],
    "relatedIds": [
      "transaction-fees",
      "bitcoin-finality",
      "lightning-network"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://bitcoin.org/bitcoin.pdf",
      "https://developer.bitcoin.org/devguide/block_chain.html"
    ],
    "questions": [
      "Que veut dire payer on-chain ?"
    ],
    "status": "reviewed",
    "sourceHash": "39965e5a16eb6ada295be60f9603f6fb12acd2883bc4b2856094c3e889b831f5",
    "sourcePath": "data/alice-corpus/examples/bitcoin-base-layer.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-bitcoin-censorship-resistance",
    "conceptId": "bitcoin-censorship-resistance",
    "title": "La résistance à la censure",
    "keywords": [
      "La résistance à la censure",
      "Bitcoin Censorship Resistance",
      "Un paiement Bitcoin peut-il être bloqué ?",
      "fundamentals",
      "bitcoin censorship resistance"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa résistance à la censure rend difficile l’exclusion durable d’un paiement valide par une autorité unique. Elle ne signifie pas qu’aucun participant ne peut refuser ou retarder une transaction.\n\nExplication\nUn mineur choisit le contenu de ses blocs et peut omettre un paiement. Si d’autres mineurs restent disposés à l’inclure, ce refus ne suffit pas à bloquer définitivement la transaction. De même, un utilisateur n’est pas obligé de dépendre d’un seul service pour accéder au réseau.\n\nLa diversité des mineurs, des nœuds et des voies d’accès limite les points de contrôle. La validation indépendante permet aussi de refuser un bloc qui violerait les règles, même s’il provient d’un acteur puissant.\n\nLimites et confusions\nUne plateforme peut bloquer un retrait ou refuser une adresse ; cela ne prouve pas que le protocole interdit cette adresse. Inversement, une forte concentration du minage ou des accès peut fragiliser cette résistance. Les frais, les règles locales et les conditions de connexion peuvent retarder une transaction sans constituer une censure ciblée.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-decentralization",
      "bitcoin-permissionlessness",
      "bitcoin-mempool-policy"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Un paiement Bitcoin peut-il être bloqué ?"
    ],
    "status": "reviewed",
    "sourceHash": "5e76700c5f7bc17a34f6b8ba885771300480ba9b30aae6d43be9076e4da67e09",
    "sourcePath": "data/alice-corpus/examples/bitcoin-censorship-resistance.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-bitcoin-chain-analysis",
    "conceptId": "bitcoin-chain-analysis",
    "title": "L’analyse de chaîne",
    "keywords": [
      "L’analyse de chaîne",
      "Bitcoin Chain Analysis",
      "Comment des transactions peuvent-elles être reliées ?",
      "privacy",
      "bitcoin chain analysis"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’analyse de chaîne exploite les transactions publiques et des données externes pour comprendre des flux et proposer des liens entre acteurs. Ses conclusions de propriété reposent souvent sur des heuristiques.\n\nExplication\nUne heuristique est une règle d’interprétation fréquemment utile, mais qui peut se tromper. Les entrées dépensées ensemble, une sortie ressemblant à de la monnaie rendue ou un schéma de montants peuvent fournir des indices. Une information extérieure, comme l’identification d’un compte, peut renforcer un lien.\n\nIl faut préciser ce qui est observé directement et ce qui est déduit. Les données de transaction sont visibles ; le nom de leur propriétaire ne découle pas automatiquement d’un calcul unique.\n\nLimites et confusions\nCertains liens sont établis par des informations directes, d’autres restent incertains. Il serait donc aussi trompeur de présenter toute attribution comme une certitude que de présenter toutes les données comme inutilisables. Les transactions collaboratives peuvent contredire des hypothèses habituelles. Multiplier des indices dépendants ne donne pas nécessairement plusieurs preuves indépendantes.",
    "parentIds": [],
    "relatedIds": [
      "common-input-ownership-heuristic",
      "coinjoin",
      "kyc-data-leakage",
      "secondary-bitcoin-dormant-bitcoin-address",
      "secondary-bitcoin-privacy-by-obfuscation",
      "secondary-privacy-transaction-heuristics"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc204 — Privacy on Bitcoin",
      "PlanB Extraction — 2026-05-24 — Glossary"
    ],
    "questions": [
      "Comment des transactions peuvent-elles être reliées ?"
    ],
    "status": "reviewed",
    "sourceHash": "10701f719f52825b04a75fdc2f67774ae6972d3941d490ca216ed720fb7ae3e9",
    "sourcePath": "data/alice-corpus/examples/bitcoin-chain-analysis.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-bitcoin-consensus",
    "conceptId": "bitcoin-consensus",
    "title": "Le consensus",
    "keywords": [
      "Le consensus",
      "Bitcoin Consensus",
      "Comment des nœuds indépendants appliquent-ils les mêmes règles ?",
      "Cryptographie et limites du protocole",
      "bitcoin consensus"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe consensus Bitcoin permet aux nœuds de converger vers un même historique valide. Chaque nœud applique des règles de validité et compare le travail accumulé des chaînes qui les respectent.\n\nExplication\nLes mineurs proposent des blocs. Les nœuds vérifient notamment les transactions, les conditions de dépense et l’émission autorisée. Une quantité élevée de travail ne rend pas acceptable un bloc invalide selon leurs règles.\n\nDes blocs concurrents peuvent apparaître temporairement. La progression du travail accumulé aide les nœuds à départager les chaînes valides. C’est pourquoi une confirmation n’offre pas la même assurance que plusieurs blocs supplémentaires construits après la transaction.\n\nLimites et confusions\nLe consensus n’est pas un vote simple où chaque ordinateur ou chaque mineur disposerait d’une voix pour changer les règles à volonté. Produire des blocs et choisir les règles à vérifier sont des rôles distincts.\n\nUne divergence de règles peut conduire des groupes à suivre des historiques incompatibles. La gouvernance, qui organise la discussion et l’adoption des changements, complète donc le mécanisme technique sans se confondre avec lui. Le modèle suppose aussi des conditions de réseau et de puissance de calcul ; il ne garantit pas l’absence absolue d’attaque.",
    "parentIds": [],
    "relatedIds": [
      "51-attack",
      "bitcoin-governance",
      "secondary-bitcoin-bitcoin-security-assumptions",
      "secondary-bitcoin-consensus-critical-dependency-risk",
      "secondary-bitcoin-sybil-attack",
      "secondary-governance-chain-split-risk",
      "secondary-history-bip50-chain-split"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc101 — The Bitcoin Journey"
    ],
    "questions": [
      "Comment des nœuds indépendants appliquent-ils les mêmes règles ?"
    ],
    "status": "reviewed",
    "sourceHash": "1ff6c11795c0acda97c12b0a187c83aa8f3bb5794f6572db2d60a10584ce8ee6",
    "sourcePath": "data/alice-corpus/examples/bitcoin-consensus.fr.md",
    "theme": "Cryptographie et limites du protocole"
  },
  {
    "id": "curated-bitcoin-core",
    "conceptId": "bitcoin-core",
    "title": "Le logiciel Bitcoin Core",
    "keywords": [
      "Le logiciel Bitcoin Core",
      "Bitcoin Core",
      "Quelle différence entre Bitcoin et Bitcoin Core ?",
      "nodes",
      "bitcoin core"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBitcoin Core est un logiciel qui implémente les règles de Bitcoin et permet notamment de faire fonctionner un nœud. Le logiciel, le protocole et le réseau d’utilisateurs sont 3 réalités distinctes.\n\nExplication\nLe logiciel vérifie les blocs et les transactions, échange avec des pairs et propose des fonctions locales. Son code évolue par des contributions et des revues. Une version publiée doit encore être adoptée par les personnes qui exploitent des nœuds.\n\nCette distinction aide à comprendre les débats. Une modification de politique de relais locale n’est pas nécessairement une modification des règles de consensus. Les développeurs ne possèdent pas un bouton permettant de modifier les soldes de tous les utilisateurs.\n\nLimites et confusions\nL’importance de Bitcoin Core ne signifie pas que tout utilisateur exécute le même logiciel ou la même version. Le caractère ouvert du code facilite l’examen sans garantir l’absence de bug. Il faut dater les affirmations sur une version précise et vérifier les notes de changement avant de présenter une fonctionnalité comme disponible.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-protocol",
      "bitcoin-mempool-policy",
      "software-integrity-verification",
      "secondary-bitcoin-bitcoin-core-development-funding",
      "secondary-bitcoin-bitcoin-core-maintenance",
      "secondary-bitcoin-consensus-critical-dependency-risk",
      "secondary-bitcoin-open-source-security-review",
      "secondary-nodes-bitcoin-indexer",
      "secondary-nodes-node-in-a-box"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB Extraction — 2026-05-23",
      "PlanB btc202 — Setting up your first Bitcoin node"
    ],
    "questions": [
      "Quelle différence entre Bitcoin et Bitcoin Core ?"
    ],
    "status": "reviewed",
    "sourceHash": "e11f992d61a9186ba2881b873220a6dea3fab94d2796f202c6cdd4bf96b1138e",
    "sourcePath": "data/alice-corpus/examples/bitcoin-core.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-bitcoin-decentralization",
    "conceptId": "bitcoin-decentralization",
    "title": "La décentralisation",
    "keywords": [
      "La décentralisation",
      "Bitcoin Decentralization",
      "Que signifie décentralisé pour Bitcoin ?",
      "fundamentals",
      "bitcoin decentralization"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa décentralisation répartit les fonctions et les pouvoirs entre des participants indépendants. Elle permet notamment aux utilisateurs de vérifier les règles et rend plus difficile le blocage durable des paiements par un acteur unique.\n\nExplication\nLes nœuds vérifient les blocs selon leurs propres règles. Les mineurs choisissent les transactions qu’ils souhaitent inclure et produisent des blocs. Les développeurs proposent des logiciels ; leurs propositions ne s’imposent pas automatiquement aux utilisateurs.\n\nCes fonctions ne doivent pas être confondues. Un mineur peut omettre une transaction de son bloc. D’autres mineurs peuvent l’inclure ensuite. À l’inverse, produire un bloc ne donne pas le pouvoir de faire accepter une création monétaire contraire aux règles des nœuds.\n\nLimites et confusions\nDécentralisé ne signifie ni absence de concentrations ni égalité parfaite entre participants. Les pools, logiciels dominants et intermédiaires peuvent introduire des dépendances. Le nombre de nœuds seul ne mesure pas toute la décentralisation. C’est une propriété à préserver par des choix techniques et des usages, pas une garantie automatique contre toute censure.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-censorship-resistance",
      "bitcoin-node",
      "bitcoin-mining",
      "secondary-bitcoin-dns-seeds"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://developer.bitcoin.org/devguide/mining.html",
      "https://bitcoin.org/bitcoin.pdf"
    ],
    "questions": [
      "Que signifie décentralisé pour Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "5bf31d3276e100b74897054725dd604bce9d812b730b5851f5adee6f1ad98aad",
    "sourcePath": "data/alice-corpus/examples/bitcoin-decentralization.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-bitcoin-energy-debate",
    "conceptId": "bitcoin-energy-debate",
    "title": "Bitcoin et énergie — comprendre les coûts et les usages utiles",
    "keywords": [
      "Bitcoin et énergie — comprendre les coûts et les usages utiles",
      "Bitcoin Energy Debate",
      "À quoi sert l’électricité consommée par Bitcoin ?",
      "Le minage peut-il contribuer à la transition énergétique ?",
      "Consommer de l’électricité signifie-t-il forcément gaspiller ?",
      "mining",
      "energy",
      "bitcoin energy debate"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe minage dépense de l’électricité pour participer à la preuve de travail de Bitcoin. Il peut aussi rendre des services énergétiques concrets, en achetant une production sans débouché local, en réduisant sa demande quand le réseau en a besoin, en finançant la capture de méthane ou en fournissant du chauffage. Le bilan dépend de l’installation et de ce qui se passerait sans elle.\n\nExplication\n3 questions permettent de comprendre un projet. Quelle énergie consomme-t-il ? Quel service fournit-il ? Que remplace-t-il réellement ? Une électricité éolienne qui aurait été écrêtée et une production au gaz supplémentaire n’ont pas le même effet climatique.\n\nDans son enquête publiée en 2025, Cambridge rapporte 52,4 % d’électricité dite durable chez les mineurs interrogés, dont 42,6 % renouvelable et 9,8 % nucléaire. L’échantillon représente environ 48 % du hashrate au moment de la collecte. Ce résultat décrit un périmètre daté, pas chaque mine ni une mesure exhaustive du réseau.\n\n*Orange is the New Green*, Alexandre Stachtchenko et Daniel Batten mettent en avant ces usages productifs de l’énergie. Leurs arguments se vérifient projet par projet, avec les données de consommation, d’effacement et d’émissions évitées.\n\nLimites et confusions\nUne énergie bon marché n’est pas nécessairement perdue. Le minage ne stocke pas l’électricité pour la restituer plus tard. Le caractère souhaitable de la monnaie Bitcoin relève aussi d’un jugement sur ses usages ; les mesures énergétiques ne tranchent pas seules ce jugement.",
    "parentIds": [],
    "relatedIds": [
      "mining-curtailed-energy",
      "mining-grid-flexibility",
      "mining-renewable-projects",
      "mining-methane-mitigation",
      "mining-heat-reuse-details",
      "secondary-bitcoin-behind-the-meter",
      "secondary-economics-opportunity-cost"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://www.jbs.cam.ac.uk/faculty-research/centres/alternative-finance/publications/cambridge-digital-mining-industry-report/",
      "https://offchain.media/article/orange-is-the-new-green/",
      "https://medium.com/@AlexStach/bitcoin-une-solution-contre-intuitive-au-changement-climatique-668364b0c205",
      "https://batcoinz.com/beest/"
    ],
    "questions": [
      "À quoi sert l’électricité consommée par Bitcoin ?",
      "Le minage peut-il contribuer à la transition énergétique ?",
      "Consommer de l’électricité signifie-t-il forcément gaspiller ?"
    ],
    "status": "reviewed",
    "sourceHash": "d27a91a207407adcb79fbc8fc2277698c1ca67df77f8e592f749f1443a39df1a",
    "sourcePath": "data/alice-corpus/examples/bitcoin-energy-debate.fr.md",
    "theme": "mining"
  },
  {
    "id": "curated-bitcoin-exchange",
    "conceptId": "bitcoin-exchange",
    "title": "Le rôle des plateformes d’échange",
    "keywords": [
      "Le rôle des plateformes d’échange",
      "Bitcoin Exchange",
      "À quoi sert une plateforme d’échange ?",
      "Usages et comparaisons",
      "bitcoin exchange"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne plateforme d’échange facilite l’achat et la vente de bitcoin contre une monnaie ou un autre actif. Elle peut également conserver les fonds, mais la fonction d’échange et la fonction de garde sont distinctes.\n\nExplication\nUn service centralisé combine souvent un compte utilisateur, des ordres de marché et un solde interne. Les transactions entre clients ne correspondent pas nécessairement à autant de paiements on-chain. Le retrait vers une adresse contrôlée par l’utilisateur est une opération séparée.\n\nPour comprendre les coûts, il faut regarder les commissions, l’écart entre prix d’achat et de vente, les frais de retrait et les éventuels frais de conversion. La liquidité influence également le prix réellement obtenu. Les conditions de collecte d’identité et d’accès varient selon le service.\n\nLimites et confusions\nUn solde visible ne démontre pas à lui seul la présence de fonds disponibles pour tous les retraits. L’utilisateur dépend de la solvabilité, de la sécurité et des décisions de l’opérateur tant que celui-ci garde les clés.\n\nUn service P2P ou non custodial réduit certaines dépendances mais peut ajouter d’autres contraintes. Alice ne doit pas classer les plateformes uniquement par leur popularité ni présenter un service comme sûr sans examiner sa structure et ses conditions actuelles.",
    "parentIds": [],
    "relatedIds": [
      "counterparty-risk",
      "p2p-bitcoin-acquisition"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins"
    ],
    "questions": [
      "À quoi sert une plateforme d’échange ?"
    ],
    "status": "reviewed",
    "sourceHash": "23e11170bc3f1c08f4b067a5c536cbc24822f2c1a4baf5f54f1266f4a6d579fa",
    "sourcePath": "data/alice-corpus/examples/bitcoin-exchange.fr.md",
    "theme": "Usages et comparaisons"
  },
  {
    "id": "curated-bitcoin-finality",
    "conceptId": "bitcoin-finality",
    "title": "La finalité progressive",
    "keywords": [
      "La finalité progressive",
      "Bitcoin Finality",
      "Une transaction confirmée est-elle irréversible ?",
      "transactions",
      "bitcoin finality"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa finalité de Bitcoin est progressive. Plus une transaction accumule de confirmations, plus le risque qu’une réorganisation l’annule devient faible.\n\nExplication\nDes nœuds peuvent recevoir temporairement des blocs concurrents. Ils appliquent les règles de validité et la sélection de chaîne fondée sur le travail accumulé. Un bloc précédemment retenu peut alors être remplacé dans leur historique.\n\nRevenir sur une transaction ancienne exige de remplacer aussi les blocs qui la suivent. Cette accumulation de travail explique pourquoi les confirmations renforcent la confiance dans le règlement. Il faut distinguer ce mécanisme d’un bouton d’annulation à la disposition du payeur ou d’un service client.\n\nLimites et confusions\nUne faible probabilité n’est pas une impossibilité mathématique. La sécurité dépend notamment des ressources d’un attaquant et de l’état du réseau. Une erreur de destinataire ne donne pas au payeur un droit technique de reprise des fonds. Le remboursement éventuel constitue une nouvelle transaction consentie par celui qui les contrôle.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-transaction-confirmation",
      "double-spending",
      "bitcoin-base-layer",
      "secondary-bitcoin-fee-sniping"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB sur Liquid et Bitcoin",
      "PlanB sid302 — Liquid Bootcamp Essentials"
    ],
    "questions": [
      "Une transaction confirmée est-elle irréversible ?"
    ],
    "status": "reviewed",
    "sourceHash": "a3db0ea9c09979aad75d4de83e731609e37bca0a3befafb6b71f4fb2b3c2341f",
    "sourcePath": "data/alice-corpus/examples/bitcoin-finality.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-bitcoin-finite-supply",
    "conceptId": "bitcoin-finite-supply",
    "title": "La limite de l’offre de bitcoins",
    "keywords": [
      "La limite de l’offre de bitcoins",
      "Bitcoin Finite Supply",
      "Pourquoi parle-t-on de 21 millions ?",
      "fundamentals",
      "bitcoin finite supply"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe plafond couramment résumé à 21 millions de BTC découle des règles d’émission de Bitcoin. Les nœuds refusent les blocs qui créent davantage que la subvention autorisée.\n\nExplication\nLa subvention commence à un montant déterminé puis diminue par halvings successifs. Avec des montants entiers en satoshis, elle finit par devenir nulle. La somme de cette émission reste légèrement inférieure à 21 millions. Ce mécanisme est distinct des frais, qui transfèrent des bitcoins existants aux mineurs.\n\nIl faut aussi distinguer l’offre théoriquement émise et l’offre encore utilisable. Certains bitcoins sont devenus impossibles à dépenser ou leurs détenteurs ont perdu les moyens de les récupérer. Ces pertes ne provoquent pas une émission compensatoire.\n\nLimites et confusions\nLa rareté ne garantit ni demande, ni pouvoir d’achat, ni hausse de prix. Un changement de logiciel ne peut pas imposer automatiquement un nouveau plafond aux nœuds qui gardent les règles précédentes. Le code comprend aussi des contrôles de montant ; le calendrier d’émission explique le total, plutôt qu’un compteur central arrêtant les paiements.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-monetary-policy",
      "bitcoin-halving",
      "lost-bitcoins",
      "secondary-economics-coin-clipping",
      "secondary-economics-stock-to-flow-ratio"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Pourquoi parle-t-on de 21 millions ?"
    ],
    "status": "reviewed",
    "sourceHash": "d289667a1e8fbf6976f618ba8671347380ac8dccbaf8acc0d7b4d4e964a35c19",
    "sourcePath": "data/alice-corpus/examples/bitcoin-finite-supply.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-bitcoin-fungibility",
    "conceptId": "bitcoin-fungibility",
    "title": "La fongibilité",
    "keywords": [
      "La fongibilité",
      "Bitcoin Fungibility",
      "Tous les bitcoins sont-ils interchangeables en pratique ?",
      "Cryptographie et limites du protocole",
      "bitcoin fungibility"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa fongibilité est la possibilité d’échanger des unités d’un même bien sans distinction particulière. Pour Bitcoin, il faut distinguer la validité des unités dans le protocole et leur acceptation pratique par des services.\n\nExplication\nLes transactions on-chain laissent un historique public. Des acteurs peuvent analyser cet historique et appliquer leurs propres politiques aux fonds qu’ils acceptent. Ces décisions peuvent créer des différences de traitement, même si les sorties satisfont les règles du réseau.\n\nLa confidentialité joue donc un rôle dans l’usage monétaire. Éviter des rapprochements inutiles entre transactions ou utiliser des outils adaptés peut réduire certaines informations accessibles. La question ne se limite pas au secret du nom de l’utilisateur ; elle concerne aussi les liens entre ses activités.\n\nLimites et confusions\nUne étiquette attribuée par une entreprise d’analyse n’est pas une règle universelle de Bitcoin ni une preuve certaine de propriété ou d’intention. Les classifications peuvent être incomplètes ou erronées.\n\nUne technique de confidentialité ne garantit pas que chaque service acceptera les fonds. Il faut éviter les promesses de bitcoins rendus « propres » ou impossibles à relier. Alice doit expliquer les limites des inférences et des politiques plutôt que présenter une catégorie commerciale comme une propriété absolue des sats.",
    "parentIds": [],
    "relatedIds": [
      "change-privacy-linking",
      "financial-censorship",
      "secondary-bitcoin-virgin-bitcoin"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "Tous les bitcoins sont-ils interchangeables en pratique ?"
    ],
    "status": "reviewed",
    "sourceHash": "c4765583fbe2a2ac027bc39f7c95fcacea3348e7a4b352e30ad3ca7b19488a74",
    "sourcePath": "data/alice-corpus/examples/bitcoin-fungibility.fr.md",
    "theme": "Cryptographie et limites du protocole"
  },
  {
    "id": "curated-bitcoin-genesis-block",
    "conceptId": "bitcoin-genesis-block",
    "title": "Le premier bloc",
    "keywords": [
      "Le premier bloc",
      "Bitcoin Genesis Block",
      "Qu’est-ce que le bloc genesis ?",
      "Histoire et évolution du protocole",
      "bitcoin genesis block"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe bloc genesis est le premier bloc de Bitcoin, daté du 2009-01-03. Il contient une référence au journal The Times et aux difficultés du système bancaire de l’époque.\n\nExplication\nLe texte exact intégré dans le champ scriptSig de l’entrée de sa transaction coinbase est :\n\n> The Times 03/Jan/2009 Chancellor on brink of second bailout for banks\n\nCette référence fournit un repère historique et un contexte de date. Elle est souvent lue comme une critique des sauvetages bancaires. La chaîne part de ce bloc particulier, dont les paramètres sont conservés dans le logiciel. L’annonce du livre blanc avait précédé ce lancement.\n\nLimites et confusions\nLe texte observé est un fait ; l’ensemble des motivations de Satoshi reste une interprétation. Il ne faut pas transformer cette phrase en preuve complète de son identité ou de ses positions sur chaque politique économique.\n\nLe bloc genesis n’est pas une transaction ordinaire choisie dans une mempool moderne. Pour expliquer ses particularités techniques, consulter le code correspondant plutôt que déduire son fonctionnement de l’analogie avec les blocs suivants. La date d’un article constitue un indice contextuel, pas à elle seule une horloge parfaite de toutes les étapes de création.",
    "parentIds": [],
    "relatedIds": [
      "satoshi-nakamoto",
      "cypherpunk-movement",
      "secondary-history-first-bitcoin-transaction"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp"
    ],
    "questions": [
      "Qu’est-ce que le bloc genesis ?"
    ],
    "status": "reviewed",
    "sourceHash": "768534790a6f504dbe87875e6bb5e4ed61f1432750586493a98e63d81f270ebf",
    "sourcePath": "data/alice-corpus/examples/bitcoin-genesis-block.fr.md",
    "theme": "Histoire et évolution du protocole"
  },
  {
    "id": "curated-bitcoin-governance",
    "conceptId": "bitcoin-governance",
    "title": "L’évolution des règles",
    "keywords": [
      "L’évolution des règles",
      "Bitcoin Governance",
      "Qui peut changer Bitcoin ?",
      "Histoire et évolution du protocole",
      "bitcoin governance"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBitcoin évolue par la proposition, la revue de logiciels et la coordination entre participants. Aucun dirigeant unique ne peut imposer à tous les nœuds des règles incompatibles avec celles qu’ils choisissent d’appliquer.\n\nExplication\nLes développeurs proposent et examinent du code. Les mainteneurs organisent l’intégration dans certains logiciels. Les utilisateurs décident de les employer ; les mineurs produisent des blocs que les nœuds vérifient. Les acteurs économiques comptent également dans l’acceptation des usages et des chaînes.\n\nModifier le code d’un dépôt ne modifie donc pas instantanément le réseau. Une proposition doit être comprise, implémentée puis adoptée selon un mécanisme approprié. Des divergences peuvent conduire à des logiciels ou à des chaînes incompatibles.\n\nLimites et confusions\nAbsence d’autorité unique ne signifie pas absence d’influence, de conflits ou de dépendances. La revue et la coordination peuvent protéger la stabilité tout en retardant des améliorations. Leur lenteur n’est pas à elle seule une preuve de sécurité.\n\nIl faut distinguer gouvernance sociale et consensus technique. Les règles disent quels blocs sont valides pour un nœud ; le choix de changer ces règles relève d’un processus plus large que le calcul des mineurs.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-improvement-proposal",
      "block-size-war",
      "secondary-bitcoin-bitcoin-core-development-funding",
      "secondary-bitcoin-bitcoin-core-maintenance",
      "secondary-history-bip50-chain-split"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://bitcoin.org/en/faq#who-controls-the-bitcoin-network",
      "https://bitcoincore.org/en/2015/12/07/roadmap/"
    ],
    "questions": [
      "Qui peut changer Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "d8e06539bf341d89e0ccfc1c5ac71d270f7c27da939350df1425063e6f6b2476",
    "sourcePath": "data/alice-corpus/examples/bitcoin-governance.fr.md",
    "theme": "Histoire et évolution du protocole"
  },
  {
    "id": "curated-bitcoin-halving",
    "conceptId": "bitcoin-halving",
    "title": "Le halving",
    "keywords": [
      "Le halving",
      "Bitcoin Halving",
      "Que change un halving ?",
      "fundamentals",
      "bitcoin halving"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe halving divise par 2 la subvention de bloc tous les 210 000 blocs sur le réseau principal, soit environ tous les 4 ans. Il réduit la création de nouveaux bitcoins.\n\nExplication\nLa rémunération d’un mineur comporte 2 éléments distincts. La subvention crée de nouveaux bitcoins ; les frais proviennent des transactions incluses dans le bloc. Le halving concerne seulement la subvention. Il ne divise ni les frais de transaction ni le solde des détenteurs.\n\nLe seuil est une hauteur de bloc. Sa date civile dépend donc du rythme réel de production des blocs et n’est connue à l’avance que par estimation. Les halvings successifs font décroître l’émission vers son plafond.\n\nLimites et confusions\nUn halving ne promet aucune hausse du cours. Ses effets de marché dépendent notamment de la demande, des anticipations et des conditions économiques. La rentabilité des mineurs dépend aussi du prix, des frais, du coût d’exploitation et de la concurrence. Dire « récompense divisée par 2 » est imprécis si cette récompense inclut les frais.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-monetary-policy",
      "bitcoin-finite-supply",
      "bitcoin-mining",
      "secondary-bitcoin-fee-only-security-model",
      "secondary-economics-stock-to-flow-ratio"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp",
      "https://developer.bitcoin.org/devguide/block_chain.html"
    ],
    "questions": [
      "Que change un halving ?"
    ],
    "status": "reviewed",
    "sourceHash": "8569928af73210a897f4d211d79680f2e353b9d28c9ebee2119fe03aa9193bca",
    "sourcePath": "data/alice-corpus/examples/bitcoin-halving.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-bitcoin-improvement-proposal",
    "conceptId": "bitcoin-improvement-proposal",
    "title": "Les propositions BIP",
    "keywords": [
      "Les propositions BIP",
      "Bitcoin Improvement Proposal",
      "À quoi sert un BIP ?",
      "Histoire et évolution du protocole",
      "bitcoin improvement proposal"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn BIP est un document qui propose ou décrit une spécification, une information ou un processus lié à Bitcoin. Recevoir un numéro de BIP ne signifie pas que le réseau a adopté la proposition.\n\nExplication\nLe dépôt des BIP organise des documents et leurs évolutions. Les éditeurs vérifient des critères éditoriaux et administrent cette publication. Ils sont distincts des mainteneurs de Bitcoin Core et ne disposent pas, par ce rôle, du pouvoir de modifier les règles appliquées par les nœuds.\n\nUn BIP peut concerner un format de wallet, une convention ou un mécanisme de consensus. Son implémentation dans un logiciel et son activation éventuelle sont des étapes différentes. Pour savoir ce qui fonctionne réellement, il faut examiner le texte, ses conditions et les logiciels qui le prennent en charge.\n\nLimites et confusions\nLe processus et les statuts peuvent évoluer. Le BIP 3 est la référence du processus consultée dans la correction du 2026-10-11 ; son état doit être revérifié pour une description actuelle détaillée.\n\nUn document publié n’est ni une recommandation universelle ni une garantie de sécurité. Alice doit éviter les formules comme « Bitcoin a adopté » lorsqu’elle dispose seulement d’une proposition ou d’un numéro.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-governance",
      "soft-fork",
      "secondary-lightning-bolts"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bips/blob/master/bip-0003.md"
    ],
    "questions": [
      "À quoi sert un BIP ?"
    ],
    "status": "reviewed",
    "sourceHash": "6447e76c970cf6ef269f3eaa21b4847370ddaa6aeb02ed5a72a71e931b50b28c",
    "sourcePath": "data/alice-corpus/examples/bitcoin-improvement-proposal.fr.md",
    "theme": "Histoire et évolution du protocole"
  },
  {
    "id": "curated-bitcoin-inheritance-plan",
    "conceptId": "bitcoin-inheritance-plan",
    "title": "Préparer la transmission",
    "keywords": [
      "Préparer la transmission",
      "Bitcoin Inheritance Plan",
      "Comment penser la transmission sans exposer ses clés ?",
      "wallets",
      "bitcoin inheritance plan"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nPréparer la transmission consiste à rendre les fonds identifiables et récupérables par les personnes autorisées si leur détenteur disparaît ou devient incapable d’agir. La compréhension de la procédure compte autant que les secrets conservés.\n\nExplication\nLes proches doivent pouvoir reconnaître les outils, comprendre où trouver les informations nécessaires et distinguer un interlocuteur fiable d’un faux support. Ils ne seront pas forcément familiers avec les mots de récupération, la passphrase ou le multisig.\n\nLa documentation peut décrire l’organisation sans exposer tous les secrets à toute personne qui la lit. Elle doit rester cohérente après un changement de portefeuille, de domicile ou de personnes impliquées.\n\nLimites et confusions\nUne procédure techniquement possible ne règle pas, à elle seule, les questions successorales et juridiques. Cette fiche ne détermine aucun droit d’héritage. Une organisation complexe et parfaitement mémorisée par son créateur peut devenir inutilisable pour ses proches. Il faut distinguer les instructions de compréhension des informations qui permettent immédiatement de dépenser.",
    "parentIds": [],
    "relatedIds": [
      "wallet-backup",
      "bip39-passphrase",
      "multisig",
      "secondary-bitcoin-bitcoin-inheritance-support-protocol",
      "secondary-privacy-digital-inheritance"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Comment penser la transmission sans exposer ses clés ?"
    ],
    "status": "reviewed",
    "sourceHash": "ae9d2364b9ed857f2276b76de0059508d3863db095beb7db5999835716d7a032",
    "sourcePath": "data/alice-corpus/examples/bitcoin-inheritance-plan.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-bitcoin-layered-architecture",
    "conceptId": "bitcoin-layered-architecture",
    "title": "Les couches de Bitcoin",
    "keywords": [
      "Les couches de Bitcoin",
      "Bitcoin Layered Architecture",
      "Pourquoi construire des systèmes au-dessus de Bitcoin ?",
      "Ark et autres couches",
      "bitcoin layered architecture"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBitcoin peut servir de base à plusieurs systèmes de paiement et d’usage. Ces couches apportent des fonctions différentes, avec leurs propres conditions de sécurité, de garde et de sortie.\n\nExplication\nLa chaîne Bitcoin publie et vérifie les transactions selon les règles communes du réseau. Lightning organise des paiements à travers des canaux. Ark regroupe des droits de sortie et des paiements hors chaîne avec un opérateur. Une sidechain comme Liquid possède sa propre chaîne et un mécanisme de conversion. Un système d’ecash utilise des jetons émis par un mint.\n\nLa bonne comparaison commence par des questions concrètes. Qui contrôle les clés ? Qui garde les BTC ? Peut-on sortir sans coopération, dans quels délais et à quel coût ? Quelles informations deviennent publiques ou visibles à un opérateur ?\n\nLimites et confusions\nLe mot « couche » ne garantit pas l’héritage intégral de la sécurité Bitcoin. Une créance gérée par un tiers n’est pas équivalente à un UTXO dont on contrôle les conditions de dépense.\n\nUne interface similaire peut cacher des architectures différentes. Il faut expliquer les garanties de la solution réellement utilisée, sans déduire son modèle du seul fait qu’elle accepte des paiements en sats.",
    "parentIds": [],
    "relatedIds": [
      "ark-implementations-bark-arkade",
      "spark-trust-and-exits",
      "fedimint-custody-and-privacy",
      "secondary-economics-layered-money"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins"
    ],
    "questions": [
      "Pourquoi construire des systèmes au-dessus de Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "acc2a3a686812fb59bf368937424a66fc54882d5f9af8e1653742144c9f54c41",
    "sourcePath": "data/alice-corpus/examples/bitcoin-layered-architecture.fr.md",
    "theme": "Ark et autres couches"
  },
  {
    "id": "curated-bitcoin-mempool",
    "conceptId": "bitcoin-mempool",
    "title": "La file d’attente des transactions",
    "keywords": [
      "La file d’attente des transactions",
      "Bitcoin Mempool",
      "Où se trouve une transaction non confirmée ?",
      "transactions",
      "bitcoin mempool"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa mempool est la collection locale de transactions non confirmées qu’un nœud conserve. Il existe des mempools, et non une file d’attente mondiale unique.\n\nExplication\nUn nœud reçoit une transaction, la vérifie et applique sa politique locale avant de l’accepter et éventuellement la relayer. Ses voisins peuvent connaître d’autres transactions ou appliquer d’autres limites. Les mineurs puisent notamment dans cette information pour préparer leurs blocs.\n\nUn explorateur montre donc une vue utile, pas une photographie universelle du réseau. Une transaction peut disparaître d’une mempool sans avoir été confirmée, par exemple après une éviction ou un remplacement.\n\nLimites et confusions\nL’ordre d’arrivée ne fixe pas un ordre obligatoire d’inclusion. Les taux de frais et les dépendances entre transactions comptent. Le message P2P mempool décrit par BIP35 demande des informations à un pair ; il n’a pas créé le relais des transactions non confirmées. L’accès à cette requête peut être limité et ne se confond pas avec une commande locale du nœud.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-mempool-policy",
      "replace-by-fee",
      "transaction-fees"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bips/blob/master/bip-0035.mediawiki",
      "https://github.com/bitcoin/bitcoin/blob/v31.1/src/net_processing.cpp",
      "https://bitcoincore.org/en/releases/0.19.0.1/"
    ],
    "questions": [
      "Où se trouve une transaction non confirmée ?"
    ],
    "status": "reviewed",
    "sourceHash": "d53d40622af283cf6c67cbff81d2341abadfc5578245bd6a1d491370630013b1",
    "sourcePath": "data/alice-corpus/examples/bitcoin-mempool.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-bitcoin-mempool-policy",
    "conceptId": "bitcoin-mempool-policy",
    "title": "Règles locales et consensus",
    "keywords": [
      "Règles locales et consensus",
      "Bitcoin Mempool Policy",
      "Pourquoi 2 nœuds n’ont-ils pas forcément les mêmes transactions en attente ?",
      "nodes",
      "bitcoin mempool policy"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa politique de mempool définit ce qu’un nœud accepte, conserve et relaie avant confirmation. Elle se distingue du consensus, qui détermine ce qu’un bloc valide peut contenir.\n\nExplication\nLes nœuds appliquent des conditions de frais, de taille, de remplacement et de formes de transactions. Ces choix protègent leurs ressources et organisent leur participation au relais. Ils peuvent différer entre logiciels, versions et réglages.\n\nUne transaction refusée par la politique d’un nœud peut donc rester valide au regard du consensus et parvenir à un mineur par un autre chemin. Si elle figure ensuite dans un bloc valide, son absence préalable dans cette mempool ne rend pas automatiquement le bloc invalide.\n\nLimites et confusions\nUn filtre local n’interdit pas à tout le réseau de transmettre une transaction. À l’inverse, accepter une transaction dans une mempool ne garantit pas son inclusion future. Les débats sur le relais doivent préciser s’ils visent une préférence de transmission ou une nouvelle règle de validation des blocs.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-mempool",
      "replace-by-fee",
      "bitcoin-protocol",
      "secondary-bitcoin-op-return"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc202 — Setting up your first Bitcoin node"
    ],
    "questions": [
      "Pourquoi 2 nœuds n’ont-ils pas forcément les mêmes transactions en attente ?"
    ],
    "status": "reviewed",
    "sourceHash": "ff3f2a60461fff49204c29e4a0c064d0f5b0c07285070019b65bc26cbf656edf",
    "sourcePath": "data/alice-corpus/examples/bitcoin-mempool-policy.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-bitcoin-mining",
    "conceptId": "bitcoin-mining",
    "title": "Comprendre le minage",
    "keywords": [
      "Comprendre le minage",
      "minage",
      "mining",
      "À quoi sert le minage de Bitcoin ?",
      "Les mineurs décident-ils seuls des règles ?",
      "bitcoin mining"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe minage ajoute des blocs à la chaîne et rend coûteuse la réécriture de l’historique. Les mineurs recherchent une preuve de travail ; chaque nœud vérifie que le bloc respecte ses règles. La subvention autorisée met aussi de nouveaux bitcoins en circulation.\n\nExplication\nLes mineurs choisissent les transactions qu’ils proposent dans leurs blocs, généralement en tenant compte des frais. Ils peuvent retarder certaines transactions en les omettant de leurs propres blocs. Ils ne peuvent pas imposer aux autres nœuds un bloc que ceux-ci jugent invalide.\n\nLe calcul consiste à chercher une empreinte de l’en-tête du bloc inférieure ou égale à une valeur cible. Trouver cette preuve demande de nombreux essais ; la vérifier est rapide. La transaction coinbase peut attribuer au mineur au plus la subvention autorisée et les frais des transactions incluses. Ces revenus incitent au minage ; ils ne remplacent pas le rôle de la preuve de travail dans la protection de l’historique.\n\nLimites et confusions\nUne grande puissance de calcul ne permet pas de faire accepter automatiquement un bloc invalide. Le temps entre 2 blocs varie. Miner ne garantit ni revenu régulier ni bénéfice.",
    "parentIds": [],
    "relatedIds": [
      "mining-difficulty-details",
      "bitcoin-energy-debate",
      "mining-curtailed-energy",
      "mining-grid-flexibility",
      "mining-heat-reuse-details",
      "mining-methane-mitigation",
      "mining-renewable-projects",
      "secondary-bitcoin-stale-block",
      "secondary-bitcoin-validationless-mining"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://developer.bitcoin.org/devguide/mining.html",
      "https://bitcoin.org/bitcoin.pdf",
      "https://developer.bitcoin.org/devguide/block_chain.html"
    ],
    "questions": [
      "À quoi sert le minage de Bitcoin ?",
      "Les mineurs décident-ils seuls des règles ?"
    ],
    "status": "reviewed",
    "sourceHash": "066a6d47fcb2ad5155894e0dd49f027dc2c59a2df443b56c2a14e99db3ac31c6",
    "sourcePath": "data/alice-corpus/examples/bitcoin-mining.fr.md",
    "theme": "mining"
  },
  {
    "id": "curated-bitcoin-monetary-policy",
    "conceptId": "bitcoin-monetary-policy",
    "title": "L’émission monétaire de Bitcoin",
    "keywords": [
      "L’émission monétaire de Bitcoin",
      "Bitcoin Monetary Policy",
      "Comment les nouveaux bitcoins sont-ils émis ?",
      "fundamentals",
      "bitcoin monetary policy"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes nouveaux bitcoins sont émis sous forme de subvention de bloc. Les règles fixent sa diminution au fil des blocs ; aucun comité ne décide périodiquement d’augmenter la quantité pour répondre à la conjoncture.\n\nExplication\nLe mineur d’un bloc valide peut recevoir la subvention autorisée et les frais des transactions incluses. La subvention correspond à de nouveaux bitcoins. Les frais correspondent à des bitcoins déjà existants. Les nœuds contrôlent que la transaction de rémunération du bloc ne réclame pas davantage que ce total.\n\nLe calendrier est défini par la hauteur des blocs. Il n’est donc pas un calendrier civil parfaitement régulier. La durée entre 2 blocs varie, même si l’ajustement de difficulté vise une moyenne d’environ 10 minutes.\n\nLimites et confusions\nL’émission prévisible n’implique pas un prix prévisible. Le halving réduit le flux de création monétaire, pas tous les revenus des mineurs ni la quantité déjà détenue dans les portefeuilles. Les débats sur les effets économiques doivent rester distincts de ces règles vérifiables du protocole.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-halving",
      "bitcoin-finite-supply",
      "block-reward",
      "secondary-economics-denationalization-of-money",
      "secondary-economics-sound-money"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc101 — The Bitcoin Journey",
      "PlanB Extraction — 2026-05-23 — btc303"
    ],
    "questions": [
      "Comment les nouveaux bitcoins sont-ils émis ?"
    ],
    "status": "reviewed",
    "sourceHash": "988f45b51c8c03fa77f5f2fd49199e644a5c6c6d45400993d36daaf73825f32b",
    "sourcePath": "data/alice-corpus/examples/bitcoin-monetary-policy.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-bitcoin-network-vs-asset",
    "conceptId": "bitcoin-network-vs-asset",
    "title": "Bitcoin, réseau et monnaie",
    "keywords": [
      "Bitcoin, réseau et monnaie",
      "Bitcoin Network vs Asset",
      "Quelle différence entre Bitcoin et un bitcoin ?",
      "fundamentals",
      "bitcoin network vs asset"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBitcoin désigne à la fois un réseau de paiement et l’actif qui s’y échange. Le réseau applique des règles communes ; les bitcoins sont les unités dont les transactions changent les conditions de dépense.\n\nExplication\nLa distinction ressemble à celle entre une infrastructure de règlement et la monnaie qu’elle permet de transférer. Les nœuds vérifient les transactions et les blocs ; les portefeuilles aident leurs utilisateurs à recevoir et à autoriser des dépenses. Le prix d’un BTC, exprimé en euros, relève des échanges sur les marchés.\n\nOn peut donc étudier séparément le fonctionnement du réseau, ses usages et la valeur attribuée à l’actif. Une baisse de prix ne signifie pas, à elle seule, que les transactions ont cessé de fonctionner.\n\nLimites et confusions\nLa distinction ne rend pas ces 2 aspects indépendants. Les incitations économiques participent à la sécurité du réseau. L’utilité technique ne garantit aucun prix ni aucune rentabilité. Un solde affiché par une plateforme peut aussi représenter une créance sur cette plateforme plutôt que des bitcoins contrôlés directement.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-protocol",
      "bitcoin-wallet",
      "custodial-wallet"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Quelle différence entre Bitcoin et un bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "051c7e6dc9ce03bb394d841b32466ed9938259c2b1a9e804e177f92a2dffdffa",
    "sourcePath": "data/alice-corpus/examples/bitcoin-network-vs-asset.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-bitcoin-node",
    "conceptId": "bitcoin-node",
    "title": "Le rôle d’un nœud Bitcoin",
    "keywords": [
      "Le rôle d’un nœud Bitcoin",
      "nœud Bitcoin",
      "node",
      "À quoi sert un nœud si je ne mine pas ?",
      "Un nœud complet doit-il conserver tous les blocs ?",
      "nodes",
      "bitcoin node"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn nœud de validation vérifie les blocs et les transactions selon les règles qu’il applique. Il permet de contrôler les données reçues au lieu de dépendre uniquement du résultat fourni par un service.\n\nExplication\nMiner et vérifier sont 2 fonctions différentes. Un nœud peut vérifier sans participer au minage. La validation complète n’impose pas de conserver éternellement les anciens fichiers de blocs : un nœud élagué peut les supprimer après traitement.\n\nLimites et confusions\nFaire tourner un nœud ne signifie pas que toutes les applications l’utilisent. Leur connexion doit être configurée. Un nœud ne remplace pas la sauvegarde des clés.",
    "parentIds": [],
    "relatedIds": [
      "pruned-node-history",
      "node-initial-sync",
      "secondary-bitcoin-eclipse-attack",
      "secondary-nodes-node-in-a-box"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://developer.bitcoin.org/devguide/operating_modes.html",
      "https://developer.bitcoin.org/devguide/p2p_network.html",
      "https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning"
    ],
    "questions": [
      "À quoi sert un nœud si je ne mine pas ?",
      "Un nœud complet doit-il conserver tous les blocs ?"
    ],
    "status": "reviewed",
    "sourceHash": "2908ad55dc3ac1438c5bc02933acf915b5429867126d7e6fa9fe74d2647eb80e",
    "sourcePath": "data/alice-corpus/examples/bitcoin-node.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-bitcoin-p2p-network",
    "conceptId": "bitcoin-p2p-network",
    "title": "Le réseau de pairs",
    "keywords": [
      "Le réseau de pairs",
      "Bitcoin P2P Network",
      "Comment les nœuds communiquent-ils ?",
      "nodes",
      "bitcoin p2p network"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe réseau pair-à-pair relie les nœuds qui échangent les transactions et les blocs. Aucun serveur central unique n’est chargé de distribuer tout l’historique.\n\nExplication\nChaque nœud communique avec un ensemble de pairs. Il peut recevoir des annonces, demander des données et transmettre ce qu’il accepte selon ses règles. La propagation ne se produit pas instantanément partout, ce qui explique des différences temporaires de connaissance.\n\nLa diversité et la qualité des connexions comptent pour la disponibilité et la résistance aux manipulations. Un nœud qui ne reçoit ses informations que d’acteurs hostiles peut avoir une vue limitée, même s’il continue de vérifier la validité des données reçues.\n\nLimites et confusions\nRecevoir un bloc d’un pair ne signifie pas lui faire confiance sur sa validité. Les règles locales de vérification restent essentielles. Inversement, vérifier les données ne garantit pas qu’on reçoit toute l’information disponible. La confidentialité réseau est aussi distincte de la confidentialité des montants et relations publiés dans la chaîne.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-node",
      "bitcoin-mempool",
      "bitcoin-p2p-privacy",
      "secondary-bitcoin-dns-seeds",
      "secondary-bitcoin-eclipse-attack",
      "secondary-bitcoin-sybil-attack"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy",
      "PlanB Extraction — 2026-05-23 — pro202"
    ],
    "questions": [
      "Comment les nœuds communiquent-ils ?"
    ],
    "status": "reviewed",
    "sourceHash": "729fa9d1f790a147e34a8caa82ed7383af0d45756c111f0f8467b4fd215ae566",
    "sourcePath": "data/alice-corpus/examples/bitcoin-p2p-network.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-bitcoin-p2p-privacy",
    "conceptId": "bitcoin-p2p-privacy",
    "title": "La confidentialité sur le réseau",
    "keywords": [
      "La confidentialité sur le réseau",
      "Bitcoin P2P Privacy",
      "Mon adresse IP peut-elle être associée à une transaction ?",
      "privacy",
      "bitcoin p2p privacy"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa confidentialité Bitcoin dépend aussi des connexions réseau. Un observateur peut recueillir des indices sur l’adresse IP et le moment où une transaction est diffusée, même si la chaîne ne contient pas de nom.\n\nExplication\nLes protections ne répondent pas toutes au même problème. Tor masque l’adresse d’origine vis-à-vis de certains interlocuteurs. Le transport P2P v2 chiffre les échanges entre pairs, mais ne cache pas leurs adresses IP ni toutes les informations de taille et de temps.\n\nDes propositions comme Dandelion portent sur la propagation initiale. Leur présence dans un document de spécification ne signifie pas que le logiciel utilisé les applique. Il faut distinguer un principe, une proposition et une fonction réellement disponible.\n\nLimites et confusions\nAucun de ces outils n’efface les liens déjà publiés dans les transactions ou transmis à une plateforme. La 1re observation d’une transaction donne un indice, pas automatiquement une preuve de son auteur. Les propriétés doivent être rapportées à la configuration, aux pairs et à l’adversaire considéré, sans promesse générale d’anonymat.",
    "parentIds": [],
    "relatedIds": [
      "tor-browser",
      "wallet-node-connection",
      "non-blockchain-privacy-leaks",
      "secondary-privacy-vpn"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bips/blob/master/bip-0324.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0156.mediawiki"
    ],
    "questions": [
      "Mon adresse IP peut-elle être associée à une transaction ?"
    ],
    "status": "reviewed",
    "sourceHash": "cfaf68e65868871655cebb86d48b2b29cd41d420060dd724a6f354f479dfe65f",
    "sourcePath": "data/alice-corpus/examples/bitcoin-p2p-privacy.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-bitcoin-payments-for-merchants",
    "conceptId": "bitcoin-payments-for-merchants",
    "title": "Accepter un paiement Bitcoin",
    "keywords": [
      "Accepter un paiement Bitcoin",
      "Bitcoin Payments for Merchants",
      "Quelles questions un commerçant doit-il se poser ?",
      "Usages et comparaisons",
      "bitcoin payments for merchants"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn commerçant peut accepter Bitcoin directement ou par un prestataire, sur la chaîne ou via Lightning. Le bon fonctionnement demande d’organiser le prix, la réception, le suivi et les éventuels remboursements.\n\nExplication\nLe marchand choisit d’abord qui contrôle les fonds et s’il les conserve en BTC ou les convertit. Il doit ensuite définir la durée d’une facture, le montant attendu et les conditions qui permettent de considérer le paiement reçu. Sur Lightning, la disponibilité et la liquidité de réception comptent ; sur la chaîne, les confirmations et les frais interviennent.\n\nLes coûts peuvent inclure réseau, hébergement, liquidité, conversion et commission du prestataire. BTCPay Server illustre un logiciel sans commission logicielle de traitement, mais l’infrastructure et les opérations restent susceptibles de coûter.\n\nLimites et confusions\n« Accepter Bitcoin » ne signifie pas que toutes les solutions ont le même modèle de garde ni les mêmes frais. Une conversion automatique peut faciliter certains usages tout en ajoutant un intermédiaire.\n\nLes obligations de facturation et de comptabilité dépendent de la juridiction et de l’activité. Conserver le montant, la date, les frais et le taux utilisé peut être nécessaire, mais aucune liste générique ne remplace une vérification du cadre applicable.",
    "parentIds": [],
    "relatedIds": [
      "btcpay-server",
      "unit-of-account",
      "secondary-bitcoin-bitcoin-circular-economy",
      "secondary-bitcoin-bitcoin-payment-conversion-policy",
      "secondary-bitcoin-btc-map",
      "secondary-bitcoin-btcpay-invoices",
      "secondary-bitcoin-exchange-rate-risk",
      "secondary-bitcoin-self-hosted-payment-processor"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://docs.btcpayserver.org/BTCPayVsOthers/"
    ],
    "questions": [
      "Quelles questions un commerçant doit-il se poser ?"
    ],
    "status": "reviewed",
    "sourceHash": "fb4255dd580f450284ba1e1ef884e063e3498bf9ff687409ab04bf05dd728b08",
    "sourcePath": "data/alice-corpus/examples/bitcoin-payments-for-merchants.fr.md",
    "theme": "Usages et comparaisons"
  },
  {
    "id": "curated-bitcoin-permissionlessness",
    "conceptId": "bitcoin-permissionlessness",
    "title": "Un réseau sans autorisation préalable",
    "keywords": [
      "Un réseau sans autorisation préalable",
      "Bitcoin Permissionlessness",
      "Faut-il une permission pour utiliser Bitcoin ?",
      "fundamentals",
      "bitcoin permissionlessness"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBitcoin permet de participer sans obtenir l’autorisation d’une autorité centrale du protocole. Un utilisateur peut créer des clés, recevoir et proposer des transactions qui respectent les règles.\n\nExplication\nCette ouverture concerne plusieurs rôles. Des développeurs peuvent proposer des logiciels ; des nœuds peuvent vérifier le registre ; des mineurs peuvent tenter de produire des blocs valides. Personne n’a besoin de créer un compte auprès d’un administrateur de Bitcoin pour obtenir une adresse.\n\nCela distingue le réseau de nombreux services qui l’entourent. Une plateforme d’échange peut exiger une inscription et des justificatifs. Ces conditions appartiennent à son fonctionnement, pas au mécanisme de création des clés du protocole.\n\nLimites et confusions\nL’absence d’autorisation centrale ne supprime ni les coûts, ni les obstacles d’accès, ni les lois applicables. Elle ne garantit pas qu’un mineur inclura immédiatement un paiement, qu’un service acceptera un client ou qu’un portefeuille offrira toutes les fonctions. Un accès à Bitcoin fourni par un intermédiaire peut être beaucoup plus restrictif que le réseau lui-même.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-censorship-resistance",
      "bitcoin-wallet",
      "custodial-wallet"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Faut-il une permission pour utiliser Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "79ac085916226919265d854c019f750dcd311b1a4efdebd72511b5f7f9b23737",
    "sourcePath": "data/alice-corpus/examples/bitcoin-permissionlessness.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-bitcoin-pizza-day",
    "conceptId": "bitcoin-pizza-day",
    "title": "Les premiers usages marchands",
    "keywords": [
      "Les premiers usages marchands",
      "Bitcoin Pizza Day",
      "Que représente le Bitcoin Pizza Day ?",
      "Histoire et évolution du protocole",
      "bitcoin pizza day"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBitcoin Pizza Day commémore l’échange de 10 000 BTC contre 2 pizzas annoncé par Laszlo Hanyecz le 2010-05-22. Un autre utilisateur, jercos, en a organisé la livraison.\n\nExplication\nLe fil original de BitcoinTalk contient la proposition puis la confirmation de l’échange. L’épisode illustre le passage d’une expérimentation technique à l’achat d’un bien réel. Il ne signifie pas que la pizzeria a elle-même encaissé des bitcoins.\n\nLe montant semble très élevé quand on applique rétrospectivement un prix ultérieur. Cette comparaison ne décrit pas les informations ni les possibilités disponibles aux participants à l’époque. L’intérêt historique réside surtout dans la mise en pratique d’un moyen d’échange et dans la formation progressive d’usages.\n\nLimites et confusions\nLe récit documente un échange célèbre ; il ne prouve pas qu’aucune transaction marchande antérieure n’a existé. Il vaut donc mieux parler d’un des premiers usages documentés que d’annoncer une priorité absolue sans preuve.\n\nIl ne faut pas utiliser cet épisode pour culpabiliser le fait de dépenser ses bitcoins ou pour promettre une hausse future. Une monnaie utilisée pour payer remplit une fonction différente de sa seule conservation spéculative.",
    "parentIds": [],
    "relatedIds": [
      "medium-of-exchange",
      "price-discovery",
      "secondary-history-bitcoin-faucet",
      "secondary-history-first-bitcoin-transaction"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://bitcointalk.org/index.php?topic=137.0"
    ],
    "questions": [
      "Que représente le Bitcoin Pizza Day ?"
    ],
    "status": "reviewed",
    "sourceHash": "1c4e69b674500f4f1fa642d33f31271781091a92d9c94f5c02ee6ed46a99e14f",
    "sourcePath": "data/alice-corpus/examples/bitcoin-pizza-day.fr.md",
    "theme": "Histoire et évolution du protocole"
  },
  {
    "id": "curated-bitcoin-ponzi-scheme",
    "conceptId": "bitcoin-ponzi-scheme",
    "title": "Bitcoin et la notion de Ponzi",
    "keywords": [
      "Bitcoin et la notion de Ponzi",
      "Bitcoin Ponzi Scheme",
      "Quels critères permettent d’examiner l’accusation de Ponzi ?",
      "Monnaie et économie",
      "bitcoin ponzi scheme"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn Ponzi est un placement frauduleux dont les paiements aux anciens participants viennent des apports des nouveaux. Utiliser des BTC dans une escroquerie ne rend pas le protocole Bitcoin lui-même équivalent à ce montage.\n\nExplication\nPour analyser une offre, il faut identifier l’opérateur, les rendements promis et l’origine réelle des versements. Bitcoin Savings and Trust fournit un exemple documenté de fraude utilisant des bitcoins, avec un jugement rapporté par la SEC en 2014.\n\nLe protocole Bitcoin organise des transferts et leur validation. Il ne prévoit pas de rendement versé aux anciens acheteurs à partir des dépôts des suivants. Une hausse du prix provoquée par une nouvelle demande ne suffit donc pas à établir le mécanisme frauduleux d’un Ponzi.\n\nLimites et confusions\nCette distinction ne rend pas fiables tous les placements qui mentionnent Bitcoin. Des promesses de rendement fixe, des retraits difficiles ou un financement mal expliqué doivent être examinés pour eux-mêmes.\n\nNe pas être un Ponzi ne signifie pas absence de volatilité, de fraude périphérique ou de risque de perte. Alice doit expliquer les critères plutôt que défendre un service par association avec le protocole ou qualifier juridiquement une offre particulière sans éléments suffisants.",
    "parentIds": [],
    "relatedIds": [
      "counterparty-risk",
      "bitcoin-volatility"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://www.investor.gov/protect-your-investments/fraud/types-fraud/ponzi-scheme",
      "https://www.sec.gov/enforcement-litigation/litigation-releases/lr-23090",
      "https://bitcoin.org/bitcoin.pdf"
    ],
    "questions": [
      "Quels critères permettent d’examiner l’accusation de Ponzi ?"
    ],
    "status": "reviewed",
    "sourceHash": "669966f57c1f7ecb314ecae6565af528a2ec0fe344651891b2687c0dfb785b77",
    "sourcePath": "data/alice-corpus/examples/bitcoin-ponzi-scheme.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-bitcoin-private-key",
    "conceptId": "bitcoin-private-key",
    "title": "La clé privée",
    "keywords": [
      "La clé privée",
      "Bitcoin Private Key",
      "À quoi sert une clé privée ?",
      "wallets",
      "bitcoin private key"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne clé privée est un secret numérique permettant de produire des signatures. Ces signatures servent à satisfaire les conditions de dépense des sorties associées.\n\nExplication\nLe réseau vérifie une signature à l’aide d’informations publiques, sans avoir besoin de connaître le secret. Beaucoup de portefeuilles dérivent plusieurs clés depuis une seed plutôt que de demander à l’utilisateur de conserver chaque clé séparément.\n\nLa protection vise à empêcher un tiers de signer à la place du détenteur, tout en conservant une possibilité de récupération. La phrase de récupération peut donc être aussi sensible que les clés qu’elle permet de reconstruire.\n\nLimites et confusions\nPerdre 1 copie ou 1 appareil ne rend pas les fonds définitivement inaccessibles si une sauvegarde permet de récupérer les moyens nécessaires. En multisig, la possibilité de dépenser dépend du seuil et des conditions prévues. Une adresse ou une clé publique seule ne remplace pas une clé privée. Aucun support légitime n’a besoin de la phrase secrète pour simplement examiner un problème de réception.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-public-key",
      "wallet-recovery-phrase",
      "wallet-backup",
      "secondary-bitcoin-casascius-physical-bitcoins",
      "secondary-bitcoin-extended-private-key",
      "secondary-bitcoin-pseudorandom-number-generator"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki",
      "https://developer.bitcoin.org/devguide/transactions.html"
    ],
    "questions": [
      "À quoi sert une clé privée ?"
    ],
    "status": "reviewed",
    "sourceHash": "80a5abc54c77e52141342b2f4707f6cf444d10e5aa108c269a6f38119801a282",
    "sourcePath": "data/alice-corpus/examples/bitcoin-private-key.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-bitcoin-protocol",
    "conceptId": "bitcoin-protocol",
    "title": "Les règles de Bitcoin",
    "keywords": [
      "Les règles de Bitcoin",
      "Bitcoin Protocol",
      "Qu’est-ce qui définit Bitcoin ?",
      "fundamentals",
      "bitcoin protocol"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe protocole Bitcoin est l’ensemble des règles qui permettent de construire, échanger et vérifier des transactions et des blocs sans administrateur central du registre.\n\nExplication\nUn portefeuille prépare une transaction et les signatures nécessaires. Les nœuds vérifient qu’elle respecte leurs règles et peuvent la transmettre à leurs pairs. Les mineurs proposent des blocs ; les nœuds rejettent ceux qui enfreignent les règles de consensus qu’ils appliquent.\n\nCes règles encadrent notamment les dépenses autorisées, l’absence de double dépense et la création de nouveaux bitcoins. Elles sont exécutées par des logiciels. Bitcoin Core est une implémentation importante, mais le protocole n’est pas le compte d’une entreprise ni une base de données administrée par ses développeurs.\n\nLimites et confusions\nLe protocole, le logiciel et les usages ne sont pas synonymes. Publier un nouveau logiciel ne contraint pas tous les utilisateurs à l’adopter. Certaines règles de transmission des transactions sont locales aux nœuds et se distinguent des règles qui rendent un bloc valide. Les évolutions demandent donc de préciser ce qui change et qui l’applique.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-node",
      "bitcoin-core",
      "bitcoin-mempool-policy"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc101 — The Bitcoin Journey",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Qu’est-ce qui définit Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "e46188ac39ea7383343f086e73e757d521563f13fdb2abb65e0cf8b939d49329",
    "sourcePath": "data/alice-corpus/examples/bitcoin-protocol.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-bitcoin-pseudonymity",
    "conceptId": "bitcoin-pseudonymity",
    "title": "Pseudonyme ne veut pas dire anonyme",
    "keywords": [
      "Pseudonyme ne veut pas dire anonyme",
      "Bitcoin Pseudonymity",
      "Mes paiements Bitcoin sont-ils anonymes ?",
      "privacy",
      "bitcoin pseudonymity"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBitcoin est pseudonyme, pas anonyme par défaut. La chaîne ne demande pas un nom civil pour chaque paiement, mais ses données publiques peuvent être reliées à une personne par d’autres informations.\n\nExplication\nUne adresse agit comme un identifiant cryptographique. Plusieurs adresses peuvent être créées par le même portefeuille. Les montants et les relations entre transactions restent cependant observables dans le registre.\n\nUn marchand connaît parfois son client ; une plateforme peut associer un retrait à un compte identifié. La réutilisation d’une adresse ou certains regroupements de fonds peuvent étendre ces liens à d’autres transactions. Les données recueillies à différents moments peuvent être combinées.\n\nLimites et confusions\nUne nouvelle adresse ne garantit pas de repartir avec un historique impossible à relier. À l’inverse, une hypothèse d’analyse ne prouve pas toujours l’identité d’un utilisateur. Il faut distinguer les faits visibles, les données apportées par un tiers et les déductions. La confidentialité dépend d’un ensemble de pratiques, des outils et des informations déjà divulguées.",
    "parentIds": [],
    "relatedIds": [
      "blockchain-privacy-leaks",
      "bitcoin-chain-analysis",
      "non-blockchain-privacy-leaks",
      "secondary-bitcoin-cypherpunk-manifesto",
      "secondary-bitcoin-no-kyc-mining-rewards",
      "secondary-bitcoin-virgin-bitcoin"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Mes paiements Bitcoin sont-ils anonymes ?"
    ],
    "status": "reviewed",
    "sourceHash": "582fde0194ad81e03596ffcb7d9e3c1dd28afaac123f3b95bb5766a6813dcfb0",
    "sourcePath": "data/alice-corpus/examples/bitcoin-pseudonymity.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-bitcoin-public-key",
    "conceptId": "bitcoin-public-key",
    "title": "La clé publique",
    "keywords": [
      "La clé publique",
      "Bitcoin Public Key",
      "Que peut faire quelqu’un avec ma clé publique ?",
      "wallets",
      "bitcoin public key"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne clé publique permet de vérifier des signatures produites avec une clé privée correspondante. La connaître ne donne normalement pas le pouvoir de créer ces signatures ni de dépenser les fonds.\n\nExplication\nLa clé publique est calculée à partir de la clé privée par les opérations cryptographiques de Bitcoin. Les adresses peuvent être dérivées d’une clé publique ou représenter des conditions plus complexes. Clé publique et adresse ne sont donc pas des termes interchangeables.\n\nLes vérificateurs utilisent les données publiques pour contrôler les autorisations de dépense. Cette séparation permet au secret de rester dans le portefeuille ou l’appareil de signature.\n\nLimites et confusions\nPublic ne signifie pas sans conséquence pour la confidentialité. Des informations publiques peuvent aider à rapprocher des transactions. Une clé publique étendue donne accès à davantage d’informations qu’une clé isolée et mérite une attention particulière. Cette explication repose sur la sécurité des primitives employées ; le risque quantique éventuel se traite séparément, sans affirmer qu’une attaque pratique est disponible.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-private-key",
      "extended-public-key",
      "bitcoin-quantum-threat",
      "secondary-bitcoin-elliptic-curve-cryptography",
      "secondary-bitcoin-secp256k1"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Que peut faire quelqu’un avec ma clé publique ?"
    ],
    "status": "reviewed",
    "sourceHash": "fdd54d334b2a5184a205bbc7c51251ba6c9a6db094e5a8f77496cdc36d926c67",
    "sourcePath": "data/alice-corpus/examples/bitcoin-public-key.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-bitcoin-quantum-threat",
    "conceptId": "bitcoin-quantum-threat",
    "title": "Comprendre le risque quantique",
    "keywords": [
      "Comprendre le risque quantique",
      "risque quantique Bitcoin",
      "ordinateur quantique",
      "Que pourrait changer un ordinateur quantique pour Bitcoin ?",
      "Quel lien existe entre ordinateur quantique, clé publique et signature ?",
      "Une étude annonce-t-elle que Bitcoin a déjà été cassé ?",
      "Bitcoin dispose-t-il déjà d’une protection complète contre ce risque ?",
      "bitcoin",
      "security",
      "bitcoin quantum threat"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn ordinateur quantique suffisamment puissant pourrait retrouver certaines clés privées à partir de clés publiques et permettre des dépenses non autorisées. C’est un risque cryptographique étudié, pas la démonstration d’une attaque déjà réalisée contre Bitcoin. Les estimations de ressources et les propositions de protection ne permettent pas de fixer une date certaine.\n\nExplication\nUne signature permet à un nœud de vérifier qu’une dépense a été autorisée avec les clés nécessaires. La sécurité des signatures utilisées par Bitcoin repose notamment sur un problème mathématique difficile à résoudre avec les ordinateurs classiques. Un ordinateur quantique adapté pourrait changer cette difficulté.\n\nL’exposition de la clé publique compte. Une clé déjà visible donne plus de temps à un attaquant ; une clé révélée pendant une dépense crée une fenêtre plus courte. Les différents types de sorties et les pratiques d’utilisation ne présentent donc pas tous la même exposition.\n\nDes chercheurs évaluent les ressources nécessaires à une attaque, tandis que des développeurs discutent d’évolutions possibles de Bitcoin. Une migration demanderait des décisions de protocole, une adoption par les participants et des adaptations des portefeuilles. Une proposition publiée ne signifie pas que ces étapes sont accomplies.\n\nLimites et confusions\n- Une estimation sous hypothèses ne décrit pas une machine déjà construite.\n- Le nombre de qubits annoncé ne suffit pas à comparer des machines. Leur qualité, la correction des erreurs et la vitesse des opérations comptent.\n- Le risque sur les signatures ne doit pas être confondu avec une disparition automatique de toutes les protections de Bitcoin.\n- Aucun calendrier certain d’attaque ni protection complète déjà acquise n’est présenté ici.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-quantum-threat-details"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://arxiv.org/abs/2603.28846v2",
      "https://github.com/bitcoin/bips/blob/master/bip-0360.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0361.mediawiki"
    ],
    "questions": [
      "Que pourrait changer un ordinateur quantique pour Bitcoin ?",
      "Quel lien existe entre ordinateur quantique, clé publique et signature ?",
      "Une étude annonce-t-elle que Bitcoin a déjà été cassé ?",
      "Bitcoin dispose-t-il déjà d’une protection complète contre ce risque ?"
    ],
    "status": "reviewed",
    "sourceHash": "708372d09f0a3bdf90f28236e09a5f75185f00036fb65abed7a1f812d410209f",
    "sourcePath": "data/alice-corpus/examples/bitcoin-quantum-threat.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-bitcoin-quantum-threat-details",
    "conceptId": "bitcoin-quantum-threat-details",
    "title": "Estimations et propositions face au risque quantique",
    "keywords": [
      "Estimations et propositions face au risque quantique",
      "BIP 360",
      "BIP 361",
      "P2MR",
      "signatures post-quantiques",
      "Que signifie l’estimation de moins de 500 000 qubits physiques ?",
      "Quelle différence entre qubits physiques et logiques ?",
      "Comment distinguer exposition longue et exposition courte d’une clé publique ?",
      "Que proposent les BIP 360 et 361, et que ne garantissent-ils pas ?",
      "Peut-on annoncer une date de migration ou de première attaque ?",
      "bitcoin",
      "security",
      "bitcoin quantum threat details"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes estimations dépendent d’hypothèses matérielles et algorithmiques. Elles ne prouvent pas qu’une machine capable d’attaquer Bitcoin a été construite. Les BIP 360 et 361 sont des propositions au statut `Draft` dans les textes consultés le 2026-10-11 ; ils ne constituent ni une protection complète activée ni un calendrier adopté.\n\nExplication\n### Une estimation datée, pas une machine construite\n\nL’étude de Ryan Babbush et ses coauteurs, **arXiv 2603.28846v2, révisée le 15 avril 2026**, estime qu’une attaque sur le problème du logarithme discret elliptique de 256 bits pourrait utiliser **moins de 500 000 qubits physiques** avec une architecture supraconductrice, une connectivité planaire et un taux d’erreur physique de **10⁻³**. Ce résultat modélise des ressources sous hypothèses ; il ne rapporte pas la construction de cette machine ni une attaque réalisée. [Résumé et version originale](https://arxiv.org/abs/2603.28846v2).\n\nUn qubit physique est un composant matériel. Un qubit logique est une unité rendue plus fiable par la correction des erreurs. Le rapport entre les 2 dépend de l’architecture et des erreurs. Un décompte de qubits isolé ne suffit donc pas à comparer des machines ou à prédire une échéance.\n\n### Des propositions dont la portée diffère\n\n| Texte consulté le 2026-10-11 | Portée proposée | Limite à conserver |\n|---|---|---|\n| BIP 360, `Draft`, P2MR | Propose une sortie engagée sur un arbre de scripts, sans chemin de dépense par clé comme celui de Taproot. Vise l’exposition longue des clés publiques. | N’introduit pas à lui seul des signatures post-quantiques complètes. Une clé révélée pendant une transaction en attente peut rester une cible ; une protection contre ces attaques courtes demande davantage. [Texte original](https://github.com/bitcoin/bips/blob/master/bip-0360.mediawiki). |\n| BIP 361, `Draft`, type `Informational` | Propose une migration puis des restrictions sur l’usage des anciennes signatures. | Dépend d’un futur BIP de signatures post-quantiques encore indiqué comme non défini. Son calendrier est une proposition relative à une éventuelle activation, pas une échéance adoptée par Bitcoin. [Texte original](https://github.com/bitcoin/bips/blob/master/bip-0361.mediawiki). |\n\nL’exposition longue donne à l’attaquant le temps d’exploiter une clé publique déjà connue. L’exposition courte concerne notamment sa révélation pendant l’attente d’une confirmation. Cacher une clé jusqu’à la dépense ne résout pas à lui seul le scénario d’une attaque assez rapide pendant cette attente.\n\nUne migration pose aussi des questions d’accès aux fonds et de traitement des sorties qui ne migreraient pas. Les restrictions proposées demandent un examen de leurs conséquences ; leur intention protectrice ne vaut pas adoption ni garantie de résultat.\n\nLimites et confusions\n- Aucun classement des machines les plus avancées sur un simple nombre de qubits n’est déduit ici.\n- Les dates d’une étude, d’une révision et d’un BIP sont des dates de publication, pas des dates prédites d’attaque.\n- Un BIP numéroté ou au statut `Draft` ne prouve pas son activation dans Bitcoin.\n- Les hypothèses matérielles, les estimations et les textes de migration doivent être revérifiés avant une mise à jour. Cette fiche rapporte leur état documentaire, sans validation expérimentale indépendante.",
    "parentIds": [
      "bitcoin-quantum-threat"
    ],
    "relatedIds": [],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://arxiv.org/abs/2603.28846v2",
      "https://github.com/bitcoin/bips/blob/master/bip-0360.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0361.mediawiki"
    ],
    "questions": [
      "Que signifie l’estimation de moins de 500 000 qubits physiques ?",
      "Quelle différence entre qubits physiques et logiques ?",
      "Comment distinguer exposition longue et exposition courte d’une clé publique ?",
      "Que proposent les BIP 360 et 361, et que ne garantissent-ils pas ?",
      "Peut-on annoncer une date de migration ou de première attaque ?"
    ],
    "status": "reviewed",
    "sourceHash": "528be456d561101288740ff5d024e926bfbd00b36b3d3344578d36f4f9a23cd4",
    "sourcePath": "data/alice-corpus/examples/bitcoin-quantum-threat-details.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-bitcoin-scalability-problem",
    "conceptId": "bitcoin-scalability-problem",
    "title": "Les limites de capacité",
    "keywords": [
      "Les limites de capacité",
      "Bitcoin Scalability Problem",
      "Quels compromis implique une augmentation de la capacité de Bitcoin ?",
      "Cryptographie et limites du protocole",
      "bitcoin scalability problem"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa capacité de la chaîne Bitcoin est limitée, tandis qu’un grand nombre d’utilisateurs peuvent vouloir payer. Augmenter cette capacité implique des compromis sur les ressources nécessaires pour vérifier le réseau.\n\nExplication\nChaque transaction on-chain doit être propagée, conservée selon les besoins du nœud et vérifiée. Des blocs plus volumineux peuvent permettre davantage d’inscriptions, tout en augmentant certains coûts. Préserver une validation accessible fait donc partie du problème.\n\nLes couches de paiement déplacent une partie des échanges hors chaîne. Lightning utilise des canaux ; d’autres systèmes emploient des arbres de transactions, des fédérations ou des intermédiaires. Ils peuvent améliorer l’expérience de paiement, mais ajoutent leurs contraintes de liquidité, de disponibilité, de sauvegarde ou de confiance.\n\nLimites et confusions\nIl n’existe pas un seul chiffre universel de « paiements par seconde » qui résume tous ces usages. Une transaction peut regrouper plusieurs sorties et une opération sur une couche peut correspondre à un règlement différent sur Bitcoin.\n\nDavantage de capacité n’est pas automatiquement davantage d’autonomie. À l’inverse, limiter la chaîne sans alternatives pratiques peut pousser vers la garde centralisée. La comparaison doit expliciter à la fois les gains et les dépendances ajoutées.",
    "parentIds": [],
    "relatedIds": [
      "block-space",
      "bitcoin-layered-architecture"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "Quels compromis implique une augmentation de la capacité de Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "046ee26d4289f166d18090f7430d8f99291ccc5f4c78ac0767c100902fa078da",
    "sourcePath": "data/alice-corpus/examples/bitcoin-scalability-problem.fr.md",
    "theme": "Cryptographie et limites du protocole"
  },
  {
    "id": "curated-bitcoin-scams",
    "conceptId": "bitcoin-scams",
    "title": "Reconnaître les escroqueries",
    "keywords": [
      "Reconnaître les escroqueries",
      "Bitcoin Scams",
      "Quels signaux doivent alerter face à une offre Bitcoin ?",
      "security",
      "bitcoin scams"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes escroqueries utilisent souvent Bitcoin comme prétexte pour obtenir un paiement, un secret ou un accès. Une promesse de gain garanti, une urgence artificielle ou une demande de phrase de récupération doit alerter.\n\nExplication\nLes scénarios incluent les faux supports, les fausses applications, les cadeaux conditionnés à un versement et les placements présentés comme sans risque. Le fraudeur cherche fréquemment à faire agir avant que la personne vérifie l’identité et le contexte.\n\nLa présence d’un logo connu, d’un compte social ou d’un site soigné ne prouve rien à elle seule. Une personne légitime peut aussi voir son compte compromis. La vérification doit passer par une voie indépendante du message reçu.\n\nLimites et confusions\nUne escroquerie utilisant des BTC ne démontre pas que le protocole Bitcoin est lui-même le montage frauduleux. Inversement, la sécurité du protocole ne rend pas fiables les offres qui utilisent son nom. La compréhension technique ne dispense pas de prudence face aux manipulations humaines. Cette fiche n’offre aucune méthode de récupération miraculeuse après un transfert.",
    "parentIds": [],
    "relatedIds": [
      "phishing-and-social-engineering",
      "software-download-hygiene",
      "wallet-recovery-phrase",
      "secondary-bitcoin-cloud-mining-risk"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins"
    ],
    "questions": [
      "Quels signaux doivent alerter face à une offre Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "b877b9cf45fe162548bc79525dc9c83a802bcdd08532a3b123ca9f0fd4cf4068",
    "sourcePath": "data/alice-corpus/examples/bitcoin-scams.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-bitcoin-script",
    "conceptId": "bitcoin-script",
    "title": "Les conditions de dépense",
    "keywords": [
      "Les conditions de dépense",
      "Bitcoin Script",
      "Que vérifie un script Bitcoin ?",
      "Cryptographie et limites du protocole",
      "bitcoin script"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBitcoin Script exprime des conditions qui doivent être satisfaites pour dépenser une sortie. Il relie les fonds à des preuves, comme des signatures, plutôt qu’à un nom de personne.\n\nExplication\nUne transaction crée des UTXO associés à des conditions de dépense. Une transaction ultérieure doit fournir les éléments nécessaires. Selon la construction, il peut s’agir d’une signature, de plusieurs signatures ou de conditions comprenant un délai.\n\nUne adresse est généralement une représentation destinée au portefeuille pour construire un certain type de sortie. Elle n’est pas un compte contenant une identité et toutes les transactions de son propriétaire. Les formats d’adresses correspondent à différentes manières d’exprimer ou d’engager ces conditions.\n\nLimites et confusions\nConnaître une adresse ne donne pas le pouvoir de dépenser. À l’inverse, posséder 1 clé ne suffit pas toujours si la sortie demande plusieurs signatures ou une autre condition.\n\nTaproot modifie la représentation et l’usage de certaines conditions, sans rendre toutes les dépenses identiques. Il faut éviter de confondre condition choisie pour une sortie et restriction centrale sur les achats. Le protocole vérifie les données de dépense ; il ne connaît pas l’intention commerciale de l’utilisateur.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-address-scripts",
      "legacy-address",
      "secondary-addresses-hashlock",
      "secondary-bitcoin-bitcoin-covenants",
      "secondary-bitcoin-dlc",
      "secondary-bitcoin-op-return"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture",
      "PlanB his203 — Bitcoin’s Pioneering Era"
    ],
    "questions": [
      "Que vérifie un script Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "dd67733558441348a4a429e16a1eb8fa415c5c930ab7a1272285e77d5e40769d",
    "sourcePath": "data/alice-corpus/examples/bitcoin-script.fr.md",
    "theme": "Cryptographie et limites du protocole"
  },
  {
    "id": "curated-bitcoin-seed",
    "conceptId": "bitcoin-seed",
    "title": "De la phrase aux clés",
    "keywords": [
      "De la phrase aux clés",
      "Bitcoin Seed",
      "Quelle différence entre phrase, seed et clé privée ?",
      "wallets",
      "bitcoin seed"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa seed est un secret binaire servant à construire l’arbre de clés d’un portefeuille déterministe. Dans BIP39, elle est dérivée de la phrase de récupération et de l’éventuelle passphrase.\n\nExplication\nLes mots sont une représentation pratique pour la sauvegarde humaine ; la seed est une donnée utilisée par les calculs. BIP32 organise ensuite la dérivation de nombreuses clés à partir de ce point de départ. La phrase, la seed et chaque clé privée remplissent donc des rôles différents.\n\nCela explique pourquoi 1 sauvegarde peut permettre de retrouver beaucoup d’adresses, et pourquoi le même ensemble de mots associé à une autre passphrase conduit à un autre portefeuille.\n\nLimites et confusions\nBIP32 n’impose pas d’utiliser BIP39. Une seed ne provient donc pas forcément d’une phrase de récupération. Posséder le secret de départ ne suffit pas toujours à retrouver les fonds dans n’importe quel logiciel ; les chemins, types de scripts et informations de coordination peuvent compter. La compromission du secret de départ affecte l’ensemble des clés qu’il permet de dériver.",
    "parentIds": [],
    "relatedIds": [
      "wallet-recovery-phrase",
      "hd-wallet",
      "derivation-path",
      "secondary-bitcoin-pbkdf2",
      "secondary-bitcoin-random-number-generation"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki"
    ],
    "questions": [
      "Quelle différence entre phrase, seed et clé privée ?"
    ],
    "status": "reviewed",
    "sourceHash": "4a97ff6fb22b52a8b8b5504ec9ccd38e9998f57cc80d2d3faf779c93870be83d",
    "sourcePath": "data/alice-corpus/examples/bitcoin-seed.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-bitcoin-transaction-confirmation",
    "conceptId": "bitcoin-transaction-confirmation",
    "title": "Les confirmations",
    "keywords": [
      "Les confirmations",
      "Bitcoin Transaction Confirmation",
      "Que signifie 1 confirmation ?",
      "transactions",
      "bitcoin transaction confirmation"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\n1 confirmation signifie qu’une transaction figure dans un bloc de la chaîne retenue. Chaque bloc ajouté après celui-ci lui apporte une confirmation supplémentaire.\n\nExplication\nAvant son inclusion, une transaction peut être connue des nœuds tout en restant non confirmée. Une fois incluse, elle participe à l’historique vérifié. Les blocs suivants ajoutent du travail au-dessus d’elle et rendent un remplacement de cet historique plus difficile.\n\nLes interfaces affichent souvent ce nombre pour aider à distinguer un paiement en attente d’un paiement plus solidement inscrit. Le délai entre 2 confirmations varie, car la découverte des blocs est irrégulière. Une moyenne ne constitue pas une échéance.\n\nLimites et confusions\nLe nombre de confirmations attendu dépend du contexte et du risque accepté. Il n’existe pas une règle universelle garantissant tout paiement après un nombre magique de blocs. Une transaction confirmée peut perdre des confirmations lors d’une réorganisation. Plus elle en accumule, plus ce risque devient faible dans les conditions normales de fonctionnement du réseau.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-finality",
      "bitcoin-mempool",
      "proof-of-work",
      "secondary-bitcoin-coinbase-maturity",
      "secondary-bitcoin-stale-block"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB min101 — Introduction to Bitcoin mining"
    ],
    "questions": [
      "Que signifie 1 confirmation ?"
    ],
    "status": "reviewed",
    "sourceHash": "4e9a0e13ce38f34294fdd25b0336f62e8e25f7eb79162725e1cb2e1cd9713743",
    "sourcePath": "data/alice-corpus/examples/bitcoin-transaction-confirmation.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-bitcoin-transaction-input",
    "conceptId": "bitcoin-transaction-input",
    "title": "Les entrées d’une transaction",
    "keywords": [
      "Les entrées d’une transaction",
      "Bitcoin Transaction Input",
      "D’où viennent les bitcoins dépensés ?",
      "transactions",
      "bitcoin transaction input"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne entrée désigne une sortie de transaction antérieure que l’on veut dépenser. Bitcoin dépense ainsi des morceaux précis de valeur plutôt que de débiter directement un compte global.\n\nExplication\nChaque entrée identifie la transaction précédente et la position de la sortie concernée. La transaction fournit aussi les données nécessaires pour respecter les conditions de dépense, souvent des signatures. Plusieurs entrées peuvent être réunies pour atteindre le montant souhaité.\n\nSi une entrée vaut 20 000 sats, elle est consommée entièrement. Le paiement, la monnaie rendue éventuelle et les frais expliquent ensuite comment cette valeur est répartie. Le portefeuille effectue généralement cette construction sans demander à l’utilisateur de sélectionner chaque entrée.\n\nLimites et confusions\nAjouter des entrées augmente habituellement le poids et les frais à taux identique. Cela peut aussi révéler des liens entre fonds. La transaction coinbase qui rémunère le mineur est une exception au modèle de dépense d’anciennes sorties. Le détail technique des données de signature dépend du type de sortie dépensée.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-utxo",
      "bitcoin-transaction-output",
      "coin-selection-tradeoffs",
      "secondary-bitcoin-coinbase-transaction"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB pro202 — Programming Bitcoin"
    ],
    "questions": [
      "D’où viennent les bitcoins dépensés ?"
    ],
    "status": "reviewed",
    "sourceHash": "fed02843f511b2d26e76db447d33f7d3a79f1758d14b2f24082cfd79752d948f",
    "sourcePath": "data/alice-corpus/examples/bitcoin-transaction-input.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-bitcoin-transaction-lifecycle",
    "conceptId": "bitcoin-transaction-lifecycle",
    "title": "Le parcours d’une transaction",
    "keywords": [
      "Le parcours d’une transaction",
      "Bitcoin Transaction Lifecycle",
      "Que se passe-t-il entre l’envoi et la confirmation ?",
      "transactions",
      "bitcoin transaction lifecycle"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne transaction est préparée par un portefeuille, signée, diffusée puis éventuellement incluse dans un bloc. Elle obtient sa 1re confirmation lorsque ce bloc appartient à la chaîne retenue par les nœuds.\n\nExplication\nLe portefeuille choisit des fonds à dépenser et les nouvelles sorties, dont une éventuelle monnaie rendue. Les signatures autorisent la dépense selon les conditions de ces fonds. Après diffusion, les nœuds vérifient la transaction et peuvent la transmettre à leurs pairs.\n\nUn mineur sélectionne des transactions pour son bloc candidat. Si le bloc est trouvé et accepté, les sorties dépensées sont remplacées dans l’état du registre par les nouvelles sorties. Les blocs suivants ajoutent des confirmations.\n\nLimites et confusions\nSigner ne signifie pas diffuser, et diffuser ne signifie pas confirmer. Les mempools ne sont pas identiques et une transaction peut être remplacée, évincée ou rester longtemps en attente. Un portefeuille affichant « envoyé » doit donc être interprété selon son indicateur réel. Une confirmation n’est pas une garantie absolue contre une réorganisation.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-mempool",
      "bitcoin-transaction-confirmation",
      "replace-by-fee"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc101 — The Bitcoin Journey"
    ],
    "questions": [
      "Que se passe-t-il entre l’envoi et la confirmation ?"
    ],
    "status": "reviewed",
    "sourceHash": "0b31a28c02dfd75cb6fc746f3ce701875e66ae6d48a42294cd9c46e7c9a89677",
    "sourcePath": "data/alice-corpus/examples/bitcoin-transaction-lifecycle.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-bitcoin-transaction-output",
    "conceptId": "bitcoin-transaction-output",
    "title": "Les sorties d’une transaction",
    "keywords": [
      "Les sorties d’une transaction",
      "Bitcoin Transaction Output",
      "Pourquoi une transaction a-t-elle plusieurs sorties ?",
      "transactions",
      "bitcoin transaction output"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne sortie attribue un montant à des conditions de dépense. Une transaction peut en créer plusieurs, notamment pour payer un destinataire et rendre la monnaie au payeur.\n\nExplication\nUne sortie contient un montant en satoshis et un script indiquant comment ce montant pourra être dépensé. L’adresse utilisée dans un portefeuille représente généralement ces conditions sous une forme pratique à copier ou scanner. Les sorties dépensables encore disponibles constituent les UTXO.\n\nUne transaction regroupant plusieurs paiements peut créer plusieurs sorties destinataires. À l’inverse, toutes les sorties visibles dans un explorateur ne correspondent pas à des achats distincts. Une partie peut revenir au même portefeuille.\n\nLimites et confusions\nLes frais ne sont pas une sortie supplémentaire du paiement. Ils résultent de la différence entre le total des entrées et celui des sorties, puis sont attribués au mineur dans la transaction coinbase du bloc. L’ordre des sorties ne suffit pas à savoir laquelle est la monnaie rendue. Un observateur peut formuler des hypothèses sans disposer d’une preuve.",
    "parentIds": [],
    "relatedIds": [
      "change-output",
      "bitcoin-address",
      "transaction-batching"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB pro202 — Programming Bitcoin"
    ],
    "questions": [
      "Pourquoi une transaction a-t-elle plusieurs sorties ?"
    ],
    "status": "reviewed",
    "sourceHash": "d01f9c85658d91ebd4d6b8e8e8bb9575d0fbea6fbf485a4209e1781e424aeb0b",
    "sourcePath": "data/alice-corpus/examples/bitcoin-transaction-output.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-bitcoin-transaction-structure",
    "conceptId": "bitcoin-transaction-structure",
    "title": "Lire une transaction dans un explorateur",
    "keywords": [
      "Lire une transaction dans un explorateur",
      "Bitcoin Transaction Structure",
      "Comment reconnaître les informations d’une transaction ?",
      "transactions",
      "bitcoin transaction structure"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn explorateur montre les entrées, les sorties et l’état de confirmation d’une transaction. Ces données décrivent des mouvements de sorties monétaires, pas directement l’identité ni l’intention des personnes.\n\nExplication\nLes entrées référencent des fonds antérieurs. Les sorties définissent les montants et les nouvelles conditions de dépense. La différence entre les 2 totaux constitue les frais. Une sortie peut être le paiement, une autre la monnaie rendue, mais leur ordre ne le démontre pas.\n\nLe nombre de confirmations indique la place du paiement dans la chaîne connue de l’explorateur. Pour une transaction non confirmée, l’outil dépend de sa propre connaissance de la mempool.\n\nLimites et confusions\nAdditionner toutes les sorties ne donne pas nécessairement le montant d’un achat. Une transaction peut regrouper plusieurs paiements, consolider des fonds ou associer plusieurs participants. Les étiquettes d’un explorateur et les interprétations de monnaie rendue restent des informations à évaluer. Consulter une adresse auprès d’un service externe peut aussi lui révéler un intérêt pour cette adresse.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-transaction-input",
      "bitcoin-transaction-output",
      "bitcoin-chain-analysis",
      "secondary-bitcoin-utxo-vs-account-based-model"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc204 — Privacy on Bitcoin",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Comment reconnaître les informations d’une transaction ?"
    ],
    "status": "reviewed",
    "sourceHash": "caadd726d385561eb0c7bf164d167a7cc04c335a3b26bf28af43b36a7344f7d1",
    "sourcePath": "data/alice-corpus/examples/bitcoin-transaction-structure.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-bitcoin-trustlessness",
    "conceptId": "bitcoin-trustlessness",
    "title": "Vérifier plutôt que faire confiance",
    "keywords": [
      "Vérifier plutôt que faire confiance",
      "Bitcoin Trustlessness",
      "À qui faut-il faire confiance avec Bitcoin ?",
      "fundamentals",
      "bitcoin trustlessness"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBitcoin permet de vérifier les règles du registre sans confier cette vérification à une institution centrale. Cela réduit certains besoins de confiance ; cela ne supprime pas toute confiance dans le monde réel.\n\nExplication\nUn nœud complet contrôle les blocs, les dépenses et l’émission monétaire. Son utilisateur n’a donc pas besoin de croire un explorateur sur la validité de l’historique qu’il vérifie. En garde personnelle, les autorisations de dépense reposent sur ses propres clés plutôt que sur une promesse de retrait d’une plateforme.\n\nDans la pratique, la plupart des personnes utilisent des logiciels et du matériel qu’elles n’ont pas fabriqués ni audités intégralement. Un portefeuille connecté à un serveur tiers dépend aussi de ce serveur pour certaines informations.\n\nLimites et confusions\n« Sans tiers de confiance » décrit un objectif et certaines propriétés du protocole, pas l’infaillibilité de chaque produit. Un nœud ne protège pas contre la divulgation d’une phrase de récupération. Un hardware wallet ne garantit pas que le destinataire choisi est honnête. Il faut identifier quelle fonction reste confiée à quel outil.",
    "parentIds": [],
    "relatedIds": [
      "full-node",
      "self-custody",
      "threat-model",
      "secondary-bitcoin-bitcoin-security-assumptions"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "À qui faut-il faire confiance avec Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "caa0a0e382a4bd6ed0da366efde5a3c113976b1a797cf888149a5a46fd0c77fa",
    "sourcePath": "data/alice-corpus/examples/bitcoin-trustlessness.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-bitcoin-uri",
    "conceptId": "bitcoin-uri",
    "title": "Les demandes de paiement et QR codes",
    "keywords": [
      "Les demandes de paiement et QR codes",
      "Bitcoin URI",
      "Que contient un QR code de paiement Bitcoin ?",
      "transactions",
      "bitcoin uri"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne URI Bitcoin est un lien de demande de paiement, souvent placé dans un QR code. Elle peut transmettre une adresse, un montant et des informations complémentaires au portefeuille.\n\nExplication\nLa forme simple commence par bitcoin:. Un montant indiqué dans le paramètre amount s’exprime en BTC, avec un point décimal. Le lien évite de saisir chaque champ séparément ; le portefeuille interprète ensuite les instructions qu’il prend en charge.\n\nLes notes corrigées distinguent BIP21, le format historique, et BIP321, qui précise notamment des instructions complémentaires et les formats modernes. Un standard documenté ne signifie pas que toutes ses possibilités fonctionnent dans tous les portefeuilles.\n\nLimites et confusions\nScanner un QR code ne prouve pas que son contenu est honnête. Le lien prépare une demande ; il ne remplace pas la vérification de la destination, du montant et des frais avant signature. Un nom ou un message dans le lien ne certifie pas l’identité du destinataire. Avec un hardware wallet, les informations de l’appareil doivent être confrontées à une destination connue de manière fiable.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-address",
      "address-spoofing",
      "hardware-wallet"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bips/blob/master/bip-0321.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki"
    ],
    "questions": [
      "Que contient un QR code de paiement Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "8caf1b4a47310e2b25b5b0a167cb28474d5b53bff25c5464f26e38f3682fcf79",
    "sourcePath": "data/alice-corpus/examples/bitcoin-uri.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-bitcoin-utxo",
    "conceptId": "bitcoin-utxo",
    "title": "Comprendre les UTXO",
    "keywords": [
      "Comprendre les UTXO",
      "UTXO",
      "sortie non dépensée",
      "Pourquoi mon solde est-il composé de plusieurs morceaux ?",
      "C’est quoi un UTXO ?",
      "transactions",
      "bitcoin utxo"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn UTXO est une sortie de transaction qui n’a pas encore été dépensée. Le solde d’un portefeuille peut réunir plusieurs UTXO, comme plusieurs pièces disponibles pour payer.\n\nExplication\nPour effectuer un paiement ordinaire, une transaction consomme des UTXO et crée de nouvelles sorties. Exemple fictif avec 1 entrée de 10 000 sats : 6 000 sats vont au destinataire, 3 500 sats reviennent en monnaie rendue et 500 sats constituent les frais. L’entrée initiale est consommée entièrement. Les frais sont la différence entre le total des entrées et celui des sorties ; ils ne forment pas 1 sortie supplémentaire dans cette transaction.\n\nLimites et confusions\nLa transaction coinbase du bloc constitue une exception. Elle crée la subvention et attribue les frais au mineur sans consommer d’ancien UTXO.\n\nChaque UTXO dépensé ajoute une entrée et du poids à la transaction. À taux de frais identique, dépenser de nombreux petits UTXO coûte généralement plus cher que dépenser quelques gros UTXO. Quand le taux monte, le coût supplémentaire pour dépenser un très petit UTXO peut dépasser sa valeur ; il reste présent, mais sa dépense devient économiquement défavorable.\n\nCette comparaison avec des pièces explique le mécanisme, pas la confidentialité. Une adresse ne représente pas nécessairement tout le solde du portefeuille.",
    "parentIds": [],
    "relatedIds": [
      "coin-selection-tradeoffs",
      "change-privacy-linking",
      "secondary-bitcoin-utxo-vs-account-based-model"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://developer.bitcoin.org/devguide/transactions.html",
      "https://developer.bitcoin.org/devguide/block_chain.html",
      "https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki",
      "https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp"
    ],
    "questions": [
      "Pourquoi mon solde est-il composé de plusieurs morceaux ?",
      "C’est quoi un UTXO ?"
    ],
    "status": "reviewed",
    "sourceHash": "8a5913e1d4546425cfce834eca2ee01476318caefa652176f2e1d9f2040fd8f6",
    "sourcePath": "data/alice-corpus/examples/bitcoin-utxo.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-bitcoin-volatility",
    "conceptId": "bitcoin-volatility",
    "title": "La volatilité de Bitcoin",
    "keywords": [
      "La volatilité de Bitcoin",
      "Bitcoin Volatility",
      "Pourquoi le prix peut-il varier fortement ?",
      "Monnaie et économie",
      "bitcoin volatility"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa volatilité décrit l’amplitude des variations du prix de Bitcoin sur une période. Elle est distincte de ses règles techniques et peut rendre imprévisible son pouvoir d’achat à court terme.\n\nExplication\nLa liquidité des marchés, les attentes, la spéculation et les chocs économiques ou réglementaires influencent les prix. Une même quantité de BTC peut donc correspondre à des montants très différents dans une autre monnaie.\n\nCertaines lectures bitcoiners interprètent cette volatilité comme une étape de monétisation d’un bien émergent. C’est une interprétation économique, pas une preuve que le cours convergera vers une valeur donnée. Une offre limitée ne garantit ni une demande croissante ni un prix futur.\n\nLimites et confusions\nUn horizon long n’assure pas de récupérer une baisse. Le levier peut amplifier les pertes et déclencher une liquidation avant un éventuel mouvement ultérieur.\n\nL’achat périodique à montant fixe répartit les dates d’achat, sans garantir un profit ni un meilleur prix moyen. Alice peut expliquer ce mécanisme et les risques sans prescrire de montant, de calendrier ou d’allocation. Une fonction de paiement utile ne doit pas être transformée en promesse de performance financière.",
    "parentIds": [],
    "relatedIds": [
      "store-of-value",
      "price-discovery",
      "secondary-bitcoin-bitcoin-payment-conversion-policy",
      "secondary-bitcoin-bitcoin-production-cost-floor",
      "secondary-bitcoin-exchange-rate-risk"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://www.investor.gov/introduction-investing/investing-basics/glossary/dollar-cost-averaging",
      "https://syndication.finra.org/content/benefits-and-limitations-dollar-cost-averaging"
    ],
    "questions": [
      "Pourquoi le prix peut-il varier fortement ?"
    ],
    "status": "reviewed",
    "sourceHash": "059ec4dd9300161bb52c9bd59d9b862072c8178fb03d9a658dfde1b884401b0c",
    "sourcePath": "data/alice-corpus/examples/bitcoin-volatility.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-bitcoin-vs-crypto",
    "conceptId": "bitcoin-vs-crypto",
    "title": "Bitcoin et les autres cryptomonnaies",
    "keywords": [
      "Bitcoin et les autres cryptomonnaies",
      "Bitcoin vs Crypto",
      "Quelles différences entre Bitcoin et les autres cryptomonnaies ?",
      "fundamentals",
      "bitcoin vs crypto"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe mot « crypto » regroupe des systèmes très différents. Bitcoin doit être examiné selon ses propres règles, son émission et son mode de validation, sans attribuer automatiquement ces propriétés aux autres projets.\n\nExplication\nBitcoin utilise la preuve de travail et des règles monétaires vérifiées par les nœuds. D’autres systèmes peuvent dépendre d’un émetteur, d’une fondation, d’une réserve d’actifs ou d’un autre mécanisme de consensus. Un token émis sur une plateforme n’est pas nécessairement une monnaie fonctionnant comme Bitcoin.\n\nPour comparer, les questions utiles portent sur les droits de modification, les conditions d’émission, la garde, la vérification et les possibilités de blocage. Un nom, un logo ou l’utilisation du mot blockchain ne suffisent pas à répondre.\n\nLimites et confusions\nLa comparaison n’autorise pas à classer tous les autres projets comme identiques ou frauduleux. Elle n’efface pas non plus les risques liés à Bitcoin ou à ses intermédiaires. Les promesses commerciales et de rendement doivent être distinguées des propriétés démontrables du système. Cette fiche explique des différences ; elle ne recommande aucun achat.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-protocol",
      "bitcoin-scams",
      "custodial-wallet",
      "secondary-economics-proof-of-stake"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Quelles différences entre Bitcoin et les autres cryptomonnaies ?"
    ],
    "status": "reviewed",
    "sourceHash": "f390fb67ec175365ec4e005e3ace26e775eef3748d5259fc0de5bc94cf787540",
    "sourcePath": "data/alice-corpus/examples/bitcoin-vs-crypto.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-bitcoin-vs-stablecoins",
    "conceptId": "bitcoin-vs-stablecoins",
    "title": "Bitcoin et les stablecoins",
    "keywords": [
      "Bitcoin et les stablecoins",
      "Bitcoin vs Stablecoins",
      "Fiat-Backed Stablecoin",
      "Pourquoi un stablecoin en dollars n’est-il pas du bitcoin ?",
      "Usages et comparaisons",
      "bitcoin vs stablecoins"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBitcoin et les stablecoins ne proposent pas les mêmes garanties. Bitcoin suit une émission sans émetteur central et son prix varie ; un stablecoin cherche généralement à suivre une unité de référence, avec un mécanisme d’adossement ou de stabilisation.\n\nExplication\nPour un stablecoin adossé à une monnaie fiat, l’objectif est de limiter les variations par rapport à cette unité. Il faut alors examiner les réserves, les droits de conversion et le rôle de l’émetteur. Maintenir une valeur proche du dollar ne supprime pas la variation du pouvoir d’achat du dollar.\n\nAvec Bitcoin en self-custody, le détenteur peut contrôler ses clés sans détenir une créance sur un émetteur de BTC. Il reste exposé aux erreurs de garde et à la volatilité du marché. Un solde Bitcoin laissé sur une plateforme réintroduit un intermédiaire.\n\nLimites et confusions\nTous les stablecoins ne fonctionnent pas de la même façon. Une présentation des réserves fiat ne doit pas être appliquée automatiquement à un autre mécanisme. La stabilité visée n’est jamais synonyme d’absence de risque.\n\nLa comparaison doit distinguer volatilité, censure, confidentialité, liquidité et récupération. Elle explique des compromis d’usage sans recommander automatiquement un actif ou une allocation personnelle.",
    "parentIds": [],
    "relatedIds": [
      "stablecoin-reserve-risk",
      "counterparty-risk",
      "secondary-economics-currency-crisis",
      "secondary-economics-dollarization",
      "secondary-stablecoins-algorithmic-stablecoin",
      "secondary-stablecoins-commodity-backed-stablecoin",
      "secondary-stablecoins-criteres-de-risque-stablecoin",
      "secondary-stablecoins-stablecoin-peg",
      "secondary-stablecoins-stablecoin-use-cases"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Pourquoi un stablecoin en dollars n’est-il pas du bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "2ecae709e9202ea9e1efdcdc850ea199e1a53881120e97bad72c3a910ed0fb1b",
    "sourcePath": "data/alice-corpus/examples/bitcoin-vs-stablecoins.fr.md",
    "theme": "Usages et comparaisons"
  },
  {
    "id": "curated-bitcoin-wallet",
    "conceptId": "bitcoin-wallet",
    "title": "Le rôle d’un portefeuille Bitcoin",
    "keywords": [
      "Le rôle d’un portefeuille Bitcoin",
      "Bitcoin Wallet",
      "Que contient réellement un portefeuille ?",
      "wallets",
      "bitcoin wallet"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn portefeuille Bitcoin gère des clés ou coordonne leur utilisation, prépare des transactions et suit les fonds. Les bitcoins ne sont pas des fichiers stockés dans le téléphone ; leur état est décrit dans le registre.\n\nExplication\nLe portefeuille calcule des adresses et recherche les sorties qui correspondent à ses conditions de dépense. Pour envoyer, il choisit des fonds et organise les signatures. Un appareil séparé peut détenir les clés, tandis que l’interface sur ordinateur sert à préparer et consulter.\n\nLe portefeuille a aussi besoin d’informations sur la chaîne. Il peut les obtenir auprès d’un nœud personnel ou d’un serveur tiers. Gérer ses propres clés et vérifier soi-même les règles sont donc 2 fonctions distinctes.\n\nLimites et confusions\nUne application appelée wallet peut être un service de garde où l’opérateur contrôle les fonds. Un portefeuille en lecture seule peut afficher des soldes sans pouvoir signer. Avant de comparer des produits, il faut identifier qui détient les clés, comment se fait la récupération et d’où proviennent les informations affichées.",
    "parentIds": [],
    "relatedIds": [
      "self-custody",
      "custodial-wallet",
      "wallet-node-connection"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc202 — Setting up your first Bitcoin node",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Que contient réellement un portefeuille ?"
    ],
    "status": "reviewed",
    "sourceHash": "e91540562a29f5ac31fdd75135ae78283de87deda22521494b04c0384f6711e6",
    "sourcePath": "data/alice-corpus/examples/bitcoin-wallet.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-bitcoin-white-paper",
    "conceptId": "bitcoin-white-paper",
    "title": "Lire l’idée du livre blanc",
    "keywords": [
      "Lire l’idée du livre blanc",
      "Bitcoin White Paper",
      "Quel problème le livre blanc cherche-t-il à résoudre ?",
      "fundamentals",
      "bitcoin white paper"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe livre blanc présente un système de paiement électronique pair-à-pair. Son problème central est d’empêcher la double dépense sans demander à une institution unique de tenir les comptes.\n\nExplication\nPublié sous le nom Satoshi Nakamoto le 31 octobre 2008, ce texte décrit l’usage de signatures, d’un historique de transactions et de preuve de travail. Les participants peuvent vérifier les paiements et comparer des historiques concurrents selon le travail accumulé.\n\nL’idée est de remplacer le rôle d’un arbitre central par des règles de vérification partagées et des incitations. Cela explique pourquoi les blocs et les confirmations sont importants pour un paiement. Le texte expose le principe du système ; il ne constitue pas le manuel détaillé de toutes les versions ultérieures de Bitcoin.\n\nLimites et confusions\nLes interprétations politiques de Bitcoin ne sont pas toutes des conclusions techniques du livre blanc. Celui-ci ne suffit pas à expliquer le fonctionnement actuel des portefeuilles ou de Lightning. Il ne faut pas lui attribuer une démonstration du plafond de 21 millions qui relève du mécanisme d’émission implémenté.",
    "parentIds": [],
    "relatedIds": [
      "double-spending",
      "proof-of-work",
      "bitcoin-finite-supply"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB phi305 — Spinoza and Bitcoin",
      "PlanB Extraction — 2026-05-24 — soc104"
    ],
    "questions": [
      "Quel problème le livre blanc cherche-t-il à résoudre ?"
    ],
    "status": "reviewed",
    "sourceHash": "4a91a476de72fbda8b4d7f2cd0c7707eec96179799eabaf7f184fe0bcff3bcec",
    "sourcePath": "data/alice-corpus/examples/bitcoin-white-paper.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-block-reward",
    "conceptId": "block-reward",
    "title": "La rémunération d’un bloc",
    "keywords": [
      "La rémunération d’un bloc",
      "Block Reward",
      "Que reçoit le mineur qui trouve un bloc ?",
      "Minage et énergie",
      "block reward"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa rémunération maximale d’un bloc réunit la subvention, qui crée de nouveaux bitcoins, et les frais des transactions incluses. Le halving réduit la subvention, pas les frais.\n\nExplication\nLe mineur inscrit cette rémunération dans la transaction coinbase du bloc. Les nœuds vérifient que le montant ne dépasse pas ce que les règles autorisent. Disposer de beaucoup de puissance de calcul ne permet donc pas de créer une subvention arbitraire.\n\nLes frais proviennent de la différence entre les entrées et les sorties des transactions ordinaires. Leur niveau dépend de la demande d’espace dans les blocs. La subvention suit, elle, un calendrier de réduction indépendant de cette demande. Ces revenus contribuent à financer les machines, l’électricité et l’exploitation des mineurs.\n\nLimites et confusions\nLe revenu brut n’est pas le bénéfice du mineur. Un pool applique également ses règles de répartition et ses frais.\n\nLa part des frais peut augmenter ou diminuer d’une période à l’autre. Après extinction de la subvention, les règles prévoient une rémunération par les frais ; leur niveau futur et la puissance de calcul qu’ils financeront ne sont pas garantis.",
    "parentIds": [],
    "relatedIds": [
      "mining-pool",
      "mining-profitability",
      "secondary-bitcoin-coinbase-maturity",
      "secondary-bitcoin-coinbase-transaction",
      "secondary-bitcoin-fee-only-security-model",
      "secondary-bitcoin-fee-sniping"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://developer.bitcoin.org/devguide/mining.html",
      "https://bitcoin.org/bitcoin.pdf"
    ],
    "questions": [
      "Que reçoit le mineur qui trouve un bloc ?"
    ],
    "status": "reviewed",
    "sourceHash": "d04d22d944ea4f0c8368d2454128572e9a2d6a09424425280f1341856e6babce",
    "sourcePath": "data/alice-corpus/examples/block-reward.fr.md",
    "theme": "Minage et énergie"
  },
  {
    "id": "curated-block-size-war",
    "conceptId": "block-size-war",
    "title": "Le débat sur la taille des blocs",
    "keywords": [
      "Le débat sur la taille des blocs",
      "Block Size War",
      "Quels désaccords ont animé la guerre des blocs ?",
      "Histoire et évolution du protocole",
      "block size war"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe débat sur la taille des blocs a opposé plusieurs visions de la capacité et de la gouvernance de Bitcoin. Il portait autant sur le coût des paiements que sur la possibilité de vérifier soi-même les règles.\n\nExplication\nLes partisans de blocs plus grands soulignaient les frais et l’adoption des paiements on-chain. Les défenseurs de limites plus prudentes mettaient en avant les ressources nécessaires aux nœuds et les solutions en couches. Ces positions doivent être attribuées plutôt que présentées comme des faits indiscutables.\n\nEn 2017, le récit comprend la scission Bitcoin Cash, l’activation de SegWit et l’abandon du hard fork SegWit2x prévu. Ses promoteurs ont annoncé sa suspension le 2017-11-08, en invoquant l’absence de consensus suffisant. Arrêter la chronologie au mois d’août omet donc une étape importante.\n\nLimites et confusions\nIl ne s’agissait pas d’un simple vote où 1 groupe aurait possédé une autorité centrale. Le logiciel utilisé, la validation des nœuds, le minage et l’acceptation économique interagissaient.\n\nL’interprétation de l’issue comme victoire de l’autonomie ou de la prudence est une lecture de gouvernance. Elle doit rester distincte des dates, des changements activés et des propositions abandonnées.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-governance",
      "block-space"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://bitcointalk.org/index.php?topic=2376285.0",
      "https://bitflyer.com/pub/policy-and-stance-regarding-segwit2x-en.pdf",
      "https://github.com/bitcoin/bips/blob/master/bip-0101.mediawiki",
      "https://bitcoincore.org/en/2015/12/07/roadmap/"
    ],
    "questions": [
      "Quels désaccords ont animé la guerre des blocs ?"
    ],
    "status": "reviewed",
    "sourceHash": "c3d324b75b281f5c97cbf3db4e6499afda0a428c2b1f5ceffbe9b39b83a0d7e8",
    "sourcePath": "data/alice-corpus/examples/block-size-war.fr.md",
    "theme": "Histoire et évolution du protocole"
  },
  {
    "id": "curated-block-space",
    "conceptId": "block-space",
    "title": "La place disponible dans les blocs",
    "keywords": [
      "La place disponible dans les blocs",
      "Block Space",
      "Pourquoi tout ne peut-il pas être inscrit immédiatement ?",
      "Cryptographie et limites du protocole",
      "block space"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’espace dans les blocs Bitcoin est limité. Lorsque beaucoup de transactions cherchent une confirmation, elles entrent en concurrence et les frais influencent leur priorité d’inclusion.\n\nExplication\nLes nœuds doivent recevoir et vérifier les blocs. Augmenter la capacité peut accroître les ressources nécessaires ; la réduire excessivement peut renchérir l’accès direct à la chaîne. La discussion porte donc sur un compromis entre usages, coûts de validation et autonomie.\n\nLes transactions n’occupent pas toutes le même espace utile. Leur structure et leur taille virtuelle comptent dans le coût payé à un taux de frais donné. Regrouper des paiements ou utiliser des couches comme Lightning peut réduire certaines demandes d’inscription individuelle sur la chaîne.\n\nLimites et confusions\nUn taux de frais élevé n’est pas une garantie de confirmation à une heure exacte. Les mineurs choisissent leurs transactions et le rythme des blocs reste probabiliste.\n\nUne limite de bloc ne mesure pas à elle seule la décentralisation. Les ressources matérielles, les logiciels et les usages comptent aussi. Comparer Bitcoin à un réseau de cartes uniquement par un nombre de transactions ignore les différences entre enregistrement sur la chaîne, règlement et paiements organisés ailleurs.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-scalability-problem",
      "bitcoin-layered-architecture"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://bitcoincore.org/en/2015/12/07/roadmap/",
      "https://bitcoincore.org/en/2016/10/28/segwit-costs/"
    ],
    "questions": [
      "Pourquoi tout ne peut-il pas être inscrit immédiatement ?"
    ],
    "status": "reviewed",
    "sourceHash": "148f08dd13a88df8aa16208c6952eb3c085fb24840a00f33b0485642a0a827e9",
    "sourcePath": "data/alice-corpus/examples/block-space.fr.md",
    "theme": "Cryptographie et limites du protocole"
  },
  {
    "id": "curated-block-time",
    "conceptId": "block-time",
    "title": "Le temps entre les blocs",
    "keywords": [
      "Le temps entre les blocs",
      "Block Time",
      "Pourquoi un bloc peut-il prendre plus de 10 minutes ?",
      "Minage et énergie",
      "block time"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBitcoin vise 1 bloc toutes les 10 minutes en moyenne. Le prochain bloc peut arriver beaucoup plus vite ou beaucoup plus tard ; ce délai n’est pas un rendez-vous garanti.\n\nExplication\nLes mineurs effectuent un grand nombre de tentatives indépendantes. Trouver un résultat conforme à la difficulté reste probabiliste. Attendre déjà 10 minutes ne signifie donc pas que le bloc doit tomber immédiatement.\n\nL’ajustement de difficulté réagit aux variations de puissance de calcul pour rapprocher la cadence moyenne de sa cible. Une baisse soudaine du hashrate peut ralentir les blocs avant cet ajustement. Cette cadence influence l’attente des confirmations et le rythme d’émission des nouveaux bitcoins.\n\nLimites et confusions\nLe délai du prochain bloc ne donne pas à lui seul le délai de confirmation de votre paiement. La transaction doit aussi être connue des mineurs et retenue dans un bloc, ce qui dépend notamment de ses frais.\n\nAttendre davantage de confirmations réduit le risque de réorganisation dans le modèle de sécurité habituel ; cela ne fournit pas une irréversibilité mathématique. La cible de 10 minutes décrit le protocole sans prouver toutes les intentions historiques de son créateur.",
    "parentIds": [],
    "relatedIds": [
      "mining-difficulty-details",
      "bitcoin-utxo"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://bitcoin.org/bitcoin.pdf",
      "https://developer.bitcoin.org/devguide/block_chain.html"
    ],
    "questions": [
      "Pourquoi un bloc peut-il prendre plus de 10 minutes ?"
    ],
    "status": "reviewed",
    "sourceHash": "a174f9443b145b3a15ba1d05f52e72fce8c60bec1e03b7a95689f37e67e14242",
    "sourcePath": "data/alice-corpus/examples/block-time.fr.md",
    "theme": "Minage et énergie"
  },
  {
    "id": "curated-block-weight",
    "conceptId": "block-weight",
    "title": "La taille virtuelle et le poids",
    "keywords": [
      "La taille virtuelle et le poids",
      "Block Weight",
      "Pourquoi les frais dépendent-ils de la taille de la transaction ?",
      "transactions",
      "block weight"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa taille virtuelle mesure l’espace économique occupé par une transaction selon le système de poids de Bitcoin. Elle permet de comparer les taux de frais entre transactions de structures différentes.\n\nExplication\nSegWit distingue certaines données de signature, appelées données de témoin, des autres données. Elles ne contribuent pas de la même manière au poids. Le bloc est limité à 4 000 000 unités de poids.\n\nPour un utilisateur, l’enjeu est pratique. Ajouter des entrées, des sorties ou certaines conditions de dépense modifie la taille de la transaction. À taux de frais identique, une transaction plus grande coûte davantage. Le montant monétaire envoyé n’est donc pas un bon indicateur de cette taille.\n\nLimites et confusions\nUn bloc de Bitcoin ne se résume pas à un nombre fixe de paiements. Une transaction peut regrouper plusieurs destinataires, et toutes les transactions n’ont pas le même poids. Les formats d’adresse influencent le coût de certaines dépenses, sans garantir à eux seuls le paiement le moins cher dans chaque situation.",
    "parentIds": [],
    "relatedIds": [
      "transaction-fees",
      "segwit-address",
      "transaction-batching"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB pro202 — Programming Bitcoin"
    ],
    "questions": [
      "Pourquoi les frais dépendent-ils de la taille de la transaction ?"
    ],
    "status": "reviewed",
    "sourceHash": "a0f38a8df047cf6441105cd54c79c3418f1e6582d8692c085d77c5f385c0912c",
    "sourcePath": "data/alice-corpus/examples/block-weight.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-blockchain-privacy-leaks",
    "conceptId": "blockchain-privacy-leaks",
    "title": "Les informations publiques sur la chaîne",
    "keywords": [
      "Les informations publiques sur la chaîne",
      "Blockchain Privacy Leaks",
      "Quelles données une transaction révèle-t-elle ?",
      "privacy",
      "blockchain privacy leaks"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes transactions Bitcoin publient des montants, des entrées, des sorties et des relations avec des transactions antérieures. Ces données servent à vérifier les dépenses, mais permettent aussi d’étudier les flux.\n\nExplication\nUne réutilisation d’adresse relie directement plusieurs réceptions au même identifiant. Une dépense réunissant plusieurs entrées peut suggérer un contrôle commun. Les montants et la monnaie rendue donnent d’autres indices sur la structure d’un paiement.\n\nCes observations prennent davantage de sens lorsqu’un acteur possède des données externes, comme une facture ou l’identité d’un client. Les traces restent disponibles pour de nouvelles analyses après leur publication.\n\nLimites et confusions\nLa chaîne ne raconte pas toute l’histoire économique. Une transaction peut être un transfert entre portefeuilles d’une même personne, un paiement groupé ou une collaboration. Les interprétations de propriété et de monnaie rendue doivent donc rester distinctes des données certaines. Réduire une fuite ne garantit pas l’absence de liens par un autre canal.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-transaction-structure",
      "common-input-ownership-heuristic",
      "change-privacy-linking",
      "secondary-bitcoin-confidential-transactions"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Quelles données une transaction révèle-t-elle ?"
    ],
    "status": "reviewed",
    "sourceHash": "c53f137d3c6744575fc10b79e84b4ef2e233ea9435f7546a9a7be8774a1696d7",
    "sourcePath": "data/alice-corpus/examples/blockchain-privacy-leaks.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-bolt12-offers",
    "conceptId": "bolt12-offers",
    "title": "Les offres BOLT12",
    "keywords": [
      "Les offres BOLT12",
      "BOLT12 Offers",
      "Que change une offre réutilisable ?",
      "Lightning",
      "bolt12 offers"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne offre BOLT12 est une information de paiement réutilisable à partir de laquelle un portefeuille compatible peut demander une nouvelle facture Lightning. L’offre et la facture ne sont pas le même objet.\n\nExplication\nLe payeur part de l’offre, envoie une demande de facture, reçoit une facture propre à l’opération, puis la règle. Ce dialogue peut passer par les messages onion de Lightning plutôt que par un serveur HTTP dédié.\n\nLes mécanismes de chemins masqués peuvent limiter certaines informations révélées sur le destinataire. Le but est de rendre la réception plus pratique tout en améliorant certains aspects de confidentialité. Le même support affiché par un marchand peut ainsi servir à plusieurs demandes, sans transformer une facture individuelle en facture éternellement réutilisable.\n\nLimites et confusions\nLa présence du format dans la spécification ne signifie pas que tous les wallets savent créer ou payer une offre. Pour un usage concret, vérifier les fonctions et la version du logiciel.\n\nUne amélioration de confidentialité n’est pas une garantie d’anonymat. Le routage, le service employé et les informations échangées avec le marchand peuvent encore révéler des données. Une offre ne garantit pas non plus qu’une route liquide sera disponible au moment de payer.",
    "parentIds": [],
    "relatedIds": [
      "lightning-invoice",
      "lightning-privacy-tradeoff",
      "secondary-bitcoin-onion-messaging",
      "secondary-lightning-blinded-paths"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/lightning/bolts/blob/master/12-offer-encoding.md"
    ],
    "questions": [
      "Que change une offre réutilisable ?"
    ],
    "status": "reviewed",
    "sourceHash": "870cea742bc30512bb02ffa1d09acd42e37d9d990b75996720df6f581eda2a6d",
    "sourcePath": "data/alice-corpus/examples/bolt12-offers.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-btcpay-server",
    "conceptId": "btcpay-server",
    "title": "Comprendre BTCPay Server",
    "keywords": [
      "Comprendre BTCPay Server",
      "BTCPay Server",
      "À quoi sert un serveur de paiement auto-hébergé ?",
      "Usages et comparaisons",
      "btcpay server"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBTCPay Server est un logiciel open source permettant d’accepter des paiements Bitcoin, notamment on-chain et Lightning. Il peut être auto-hébergé afin de garder davantage de contrôle sur l’infrastructure marchande.\n\nExplication\nLe logiciel organise des boutiques, des demandes de paiement et leur suivi. Il peut être relié aux composants nécessaires pour observer la chaîne et, pour Lightning, à une infrastructure adaptée. L’intégration au commerce peut concerner une caisse, un site ou des factures.\n\nLa maîtrise de l’hébergement et des clés permet de réduire certaines dépendances à un processeur custodial. Elle demande aussi de gérer les mises à jour, la disponibilité, les accès et les sauvegardes. Déléguer une partie de l’hébergement ne dispense pas de comprendre qui voit les données et qui contrôle les fonds.\n\nLimites et confusions\nUn logiciel open source n’élimine pas tous les coûts. L’hébergement, le réseau, la liquidité Lightning ou des services tiers peuvent être facturés. Il ne suffit pas non plus à assurer la conformité comptable de chaque activité.\n\nLes fonctions disponibles dépendent de la configuration et de la version. Cette fiche ne constitue pas un guide de déploiement ni un test d’une installation donnée. Pour une procédure, partir de la documentation correspondant à l’environnement réellement utilisé.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-payments-for-merchants",
      "lightning-node-backup",
      "secondary-bitcoin-btcpay-extended-public-key",
      "secondary-bitcoin-btcpay-hardware-wallet-integration",
      "secondary-bitcoin-btcpay-hot-wallet",
      "secondary-bitcoin-btcpay-invoices",
      "secondary-bitcoin-btcpay-security",
      "secondary-bitcoin-self-hosted-payment-processor"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins"
    ],
    "questions": [
      "À quoi sert un serveur de paiement auto-hébergé ?"
    ],
    "status": "reviewed",
    "sourceHash": "aa89141ab3caf59c3a6259d8485a0a7a3eaacfec06bc080743dccb0281011086",
    "sourcePath": "data/alice-corpus/examples/btcpay-server.fr.md",
    "theme": "Usages et comparaisons"
  },
  {
    "id": "curated-cashu-et-confiance-dans-le-mint",
    "conceptId": "cashu-et-confiance-dans-le-mint",
    "title": "L’ecash et la confiance dans un mint",
    "keywords": [
      "L’ecash et la confiance dans un mint",
      "Cashu et confiance dans le mint",
      "Qui doit-on croire lorsqu’on utilise un mint Cashu ?",
      "Ark et autres couches",
      "cashu et confiance dans le mint"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nCashu utilise des jetons numériques au porteur émis par un mint. Le wallet conserve ces jetons, tandis que le mint garde les bitcoins qui doivent permettre leur conversion en paiements.\n\nExplication\nLes signatures aveugles limitent le rapprochement entre l’émission et la dépense des jetons. Cette propriété vise la confidentialité de l’ecash. Elle ne retire pas au mint la garde des BTC sous-jacents.\n\nChaque mint émet ses propres jetons. Pour passer de l’un à l’autre, il faut une conversion, par exemple via Lightning. La réception d’un jeton d’un mint donné expose donc au fonctionnement de ce mint, pas à une créance universellement interchangeable entre tous les opérateurs.\n\nLimites et confusions\nDétenir les fichiers ou jetons dans son téléphone ne signifie pas contrôler les clés des bitcoins de réserve. Le mint peut être indisponible, insolvable ou refuser la conversion.\n\nLa confidentialité cryptographique ne cache pas automatiquement toutes les métadonnées réseau ou toutes les informations fournies au service. Il faut distinguer l’avantage des signatures aveugles du modèle de garde. Alice doit présenter l’ecash comme un compromis de paiement et de confidentialité, sans le qualifier de self-custody Bitcoin sur la seule présence locale des jetons.",
    "parentIds": [],
    "relatedIds": [
      "fedimint-custody-and-privacy",
      "custodial-lightning-wallet",
      "secondary-bitcoin-blind-signatures",
      "secondary-bitcoin-digicash"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://docs.cashu.space/faq"
    ],
    "questions": [
      "Qui doit-on croire lorsqu’on utilise un mint Cashu ?"
    ],
    "status": "reviewed",
    "sourceHash": "96e4608c32865b357159e31658314ddf8983291caf0426aec5ed0f096339ce6b",
    "sourcePath": "data/alice-corpus/examples/cashu-et-confiance-dans-le-mint.fr.md",
    "theme": "Ark et autres couches"
  },
  {
    "id": "curated-cbdc",
    "conceptId": "cbdc",
    "title": "Les monnaies numériques de banque centrale",
    "keywords": [
      "Les monnaies numériques de banque centrale",
      "CBDC",
      "Qu’est-ce qu’une MNBC ?",
      "Monnaie et économie",
      "cbdc"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne MNBC, ou CBDC en anglais, est une monnaie numérique de banque centrale. Son architecture peut donner des pouvoirs de contrôle et de surveillance différents de ceux du cash ou de Bitcoin.\n\nExplication\nLes projets peuvent viser des paiements de détail ou des usages de règlement entre institutions. Leurs promoteurs mettent en avant l’accès à la monnaie publique et l’efficacité des paiements. Les critiques examinent qui voit les transactions, qui peut bloquer un utilisateur et quelles restrictions peuvent être imposées.\n\nCes questions sont particulièrement importantes lorsque les paiements deviennent traçables ou conditionnels. Les fonctions possibles ne sont toutefois pas les mêmes dans tous les systèmes. L’architecture, les intermédiaires et les règles applicables déterminent les pouvoirs effectivement disponibles.\n\nLimites et confusions\nUne possibilité technique n’établit pas que tous les projets ont déjà adopté cette fonction ni qu’ils partagent une intention cachée. Les promesses officielles doivent être distinguées des capacités du système et des scénarios d’évolution.\n\nUne MNBC reste rattachée à une autorité monétaire. Elle ne reproduit pas le modèle d’émission et de validation ouverte de Bitcoin. Alice peut garder une lecture critique sur les restrictions d’usage en précisant ce qui est constaté, annoncé ou seulement possible.",
    "parentIds": [],
    "relatedIds": [
      "programmable-money",
      "financial-censorship"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Qu’est-ce qu’une MNBC ?"
    ],
    "status": "reviewed",
    "sourceHash": "5d70c38e7db1eb3475b1934cc6902d49d8407e179789ec4a194d7cccbc7c3ed1",
    "sourcePath": "data/alice-corpus/examples/cbdc.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-central-banking",
    "conceptId": "central-banking",
    "title": "Les banques centrales",
    "keywords": [
      "Les banques centrales",
      "Central Banking",
      "Quel rôle joue une banque centrale ?",
      "Monnaie et économie",
      "central banking"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne banque centrale conduit la politique monétaire et participe au fonctionnement des paiements selon son mandat. Elle agit notamment sur les taux et la liquidité du système financier.\n\nExplication\nLes taux directeurs influencent les conditions de financement sans fixer individuellement tous les crédits. En crise, une banque centrale peut fournir de la liquidité ou intervenir comme prêteur en dernier ressort. Certaines politiques utilisent des achats d’actifs et modifient la taille de son bilan.\n\nCes actions peuvent affecter l’activité, l’emploi, les prix et la répartition des revenus ou du patrimoine. Les critiques autrichiennes soulignent notamment la distorsion de signaux de marché et la socialisation de certains risques. Ces jugements doivent être attribués, tout en expliquant les mécanismes qu’ils visent.\n\nLimites et confusions\nUn effet distributif ne démontre pas automatiquement une augmentation nette de toutes les mesures d’inégalité. La période, le pays et l’indicateur changent l’évaluation.\n\nBitcoin n’a pas de comité qui ajuste sa règle d’émission aux conditions économiques. Cette différence de gouvernance n’empêche pas son prix d’être influencé par l’environnement financier. Alice doit distinguer description institutionnelle, résultats d’études et préférences politiques.",
    "parentIds": [],
    "relatedIds": [
      "inflation-monetary-perspectives",
      "money-supply",
      "secondary-economics-free-banking",
      "secondary-economics-interest-rates",
      "secondary-economics-lender-of-last-resort",
      "secondary-economics-moral-hazard",
      "secondary-economics-quantitative-easing"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://www.bankofengland.co.uk/quarterly-bulletin/2012/q3/the-distributional-effects-of-asset-purchases",
      "https://www.bankofengland.co.uk/working-paper/2018/the-distributional-impact-of-monetary-policy-easing-in-the-uk-between-2008-and-2014"
    ],
    "questions": [
      "Quel rôle joue une banque centrale ?"
    ],
    "status": "reviewed",
    "sourceHash": "08aee527f894376baf965ba4010792d7105af5556bebed50bb7eeaf7532131ae",
    "sourcePath": "data/alice-corpus/examples/central-banking.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-change-output",
    "conceptId": "change-output",
    "title": "La monnaie rendue",
    "keywords": [
      "La monnaie rendue",
      "Change Output",
      "Pourquoi une partie du paiement revient-elle à une autre adresse ?",
      "transactions",
      "change output"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa monnaie rendue, ou « change », est une sortie qui renvoie au payeur la valeur non utilisée pour le paiement et les frais. Elle apparaît parce qu’un UTXO est dépensé entièrement.\n\nExplication\nExemple fictif avec 1 entrée de 10 000 sats. Un paiement de 6 000 sats et 500 sats de frais laissent 3 500 sats de monnaie rendue. Le portefeuille crée normalement une sortie contrôlée par ses propres clés pour ce reste. L’adresse peut être nouvelle sans que les fonds aient quitté le portefeuille.\n\nCela explique pourquoi une transaction simple peut montrer plusieurs sorties et un montant total transféré supérieur au paiement commercial. Le portefeuille suit ses propres sorties pour calculer le solde restant.\n\nLimites et confusions\nToutes les transactions n’ont pas de monnaie rendue. Son montant doit aussi tenir compte des frais. La supprimer sans modifier correctement la transaction peut accroître les frais. Utiliser une nouvelle adresse améliore certaines pratiques, mais des observateurs peuvent encore essayer d’identifier la monnaie rendue par des heuristiques.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-utxo",
      "change-privacy-linking",
      "coin-selection-tradeoffs"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB pro202 — Programming Bitcoin"
    ],
    "questions": [
      "Pourquoi une partie du paiement revient-elle à une autre adresse ?"
    ],
    "status": "reviewed",
    "sourceHash": "3acab027a21ae8b09352467166d0a0c8e0079e878c51ea5c4598296e7810aec8",
    "sourcePath": "data/alice-corpus/examples/change-output.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-change-privacy-linking",
    "conceptId": "change-privacy-linking",
    "title": "Monnaie rendue et liens de confidentialité",
    "keywords": [
      "Monnaie rendue et liens de confidentialité",
      "change",
      "monnaie rendue",
      "Comment la monnaie rendue peut-elle être reconnue ?",
      "Une nouvelle adresse efface-t-elle l’historique ?",
      "privacy",
      "transactions",
      "change privacy linking"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa monnaie rendue crée une nouvelle sortie, mais reste reliée publiquement à la transaction qui l’a créée. Changer d’adresse ne supprime pas ce lien.\n\nExplication\nUn observateur peut tenter d’identifier le change à partir du type de sortie, des montants ou de dépenses ultérieures. Ce sont des hypothèses. Réunir ensuite ce change avec d’autres fonds peut fournir des indices supplémentaires.\n\nPour limiter certains indices, un portefeuille peut créer le change avec le même type d’adresse qu’une sortie de paiement. Bitcoin Core a intégré ce principe dans une modification fusionnée le 2021-12-20. Cela réduit un indice lié au format des sorties, sans effacer les liens de la transaction ni garantir que le change soit indétectable.\n\nLimites et confusions\nLe risque pour la confidentialité dépend du contexte et des dépenses suivantes. Aucune de ces observations ne prouve à elle seule une identité. Il faut distinguer information visible et interprétation.",
    "parentIds": [
      "bitcoin-utxo"
    ],
    "relatedIds": [
      "coin-selection-tradeoffs"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://github.com/bitcoin/bips/blob/master/bip-0078.mediawiki",
      "https://github.com/bitcoin/bitcoin/pull/23789"
    ],
    "questions": [
      "Comment la monnaie rendue peut-elle être reconnue ?",
      "Une nouvelle adresse efface-t-elle l’historique ?"
    ],
    "status": "reviewed",
    "sourceHash": "67e36c85e7ce2f7f02b0e53b6f207ff67867c18eafd40c8cbdfd729d1d21565b",
    "sourcePath": "data/alice-corpus/examples/change-privacy-linking.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-channel-closure",
    "conceptId": "channel-closure",
    "title": "Fermer un canal",
    "keywords": [
      "Fermer un canal",
      "Channel Closure",
      "Comment les fonds reviennent-ils sur la chaîne ?",
      "Lightning",
      "channel closure"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nFermer un canal Lightning règle ses fonds sur la chaîne Bitcoin. Une fermeture coopérative repose sur l’accord des participants ; une fermeture unilatérale publie un engagement sans obtenir cet accord au même moment.\n\nExplication\nPendant la vie du canal, les participants mettent à jour la répartition des fonds hors chaîne. La fermeture transforme ce règlement en sorties Bitcoin utilisables selon les règles et délais applicables. Les frais on-chain redeviennent donc directement importants.\n\nSi les participants coopèrent, ils peuvent négocier la fermeture. Si un pair ne répond plus, l’autre dispose d’un recours unilatéral fondé sur ses transactions et données de canal. La publication d’un ancien état révoqué est un autre cas, qui déclenche des mécanismes de protection contre la triche.\n\nLimites et confusions\nUne fermeture forcée n’est pas en elle-même une tentative de vol. Elle peut être nécessaire pour récupérer des fonds quand un pair est indisponible. Elle peut cependant imposer un délai et des transactions supplémentaires.\n\nLa capacité totale du canal ne revient pas à 1 seul participant. Le règlement dépend de la part de chacun, des paiements en cours et des frais. Pour récupérer un canal, suivre la procédure du logiciel plutôt que restaurer au hasard une ancienne base de données.",
    "parentIds": [],
    "relatedIds": [
      "lightning-force-close",
      "lightning-node-backup",
      "secondary-lightning-static-channel-backup"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB lnp201 — Lightning Network Theory"
    ],
    "questions": [
      "Comment les fonds reviennent-ils sur la chaîne ?"
    ],
    "status": "reviewed",
    "sourceHash": "0c175e2457d068609a55628b7adfd0aa712ee9ad0e2e6a0148838d75279623f8",
    "sourcePath": "data/alice-corpus/examples/channel-closure.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-coin-control",
    "conceptId": "coin-control",
    "title": "Choisir les fonds à dépenser",
    "keywords": [
      "Choisir les fonds à dépenser",
      "Coin Control",
      "À quoi sert le coin control ?",
      "privacy",
      "coin control"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe coin control permet de choisir quels UTXO financeront une transaction au lieu de laisser uniquement le portefeuille décider. Ce choix peut influencer les frais et les liens publiquement créés entre des fonds.\n\nExplication\nLes UTXO peuvent provenir de contextes différents. Les réunir dans un paiement permet à un observateur de supposer un contrôle commun. Des étiquettes d’origine aident à comprendre ce que l’on rapproche, et à suivre la monnaie rendue issue d’une dépense.\n\nLe nombre d’entrées compte aussi pour le poids. Sélectionner beaucoup de petits fonds peut augmenter les frais ; choisir un montant trop grand peut créer une nouvelle sortie de monnaie rendue.\n\nLimites et confusions\nLa sélection manuelle n’est pas automatiquement meilleure que celle du logiciel. Elle exige de comprendre les montants, les frais et les conséquences de confidentialité. Éviter un regroupement ne garantit pas l’absence d’autres liens par les adresses, les serveurs ou les données externes. Cette fiche expose les compromis plutôt qu’une règle universelle de sélection.",
    "parentIds": [],
    "relatedIds": [
      "coin-selection-tradeoffs",
      "utxo-labeling",
      "change-privacy-linking"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc204 — Privacy on Bitcoin",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "À quoi sert le coin control ?"
    ],
    "status": "reviewed",
    "sourceHash": "232f289f43bb5108458962c5cef8dd8af0f2ef96f5519cbb753874345487d231",
    "sourcePath": "data/alice-corpus/examples/coin-control.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-coin-selection-tradeoffs",
    "conceptId": "coin-selection-tradeoffs",
    "title": "Sélection des UTXO et compromis",
    "keywords": [
      "Sélection des UTXO et compromis",
      "coin selection",
      "choix des entrées",
      "Pourquoi ne pas toujours choisir les plus petits UTXO ?",
      "Pourquoi 2 transactions de même montant ont-elles des frais différents ?",
      "transactions",
      "privacy",
      "coin selection tradeoffs"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa sélection des UTXO choisit les entrées utilisées pour payer. Elle doit couvrir le montant et les frais tout en tenant compte de la taille de la transaction et des liens qu’elle rend publics.\n\nExplication\nChoisir systématiquement les plus petits UTXO multiplie souvent les entrées. Chaque entrée augmente généralement le poids de la transaction et donc les frais au même taux. Cette stratégie peut toutefois éviter de devoir dépenser ces petits UTXO plus tard, à un taux peut-être supérieur. Le choix dépend donc aussi des frais futurs envisagés.\n\nAjouter des entrées augmente généralement la quantité de données à signer et à transmettre. Réunir des fonds reçus dans des contextes distincts peut aussi suggérer un contrôle commun. Une sélection évitant la monnaie rendue peut être intéressante dans certains cas, mais ne constitue pas une règle universelle.\n\nLimites et confusions\nLes frais dépendent de la taille virtuelle de la transaction, influencée par les types d’entrées et de sorties, et du taux choisi en sats/vB. Exemple fictif avec une transaction de 200 vB à 5 sats/vB — les frais sont de 1 000 sats, quel que soit le montant envoyé. Un petit paiement peut donc coûter plus cher qu’un gros paiement si sa transaction est plus lourde.\n\nLes transactions collaboratives montrent que des entrées communes ne prouvent pas toujours un propriétaire unique.",
    "parentIds": [
      "bitcoin-utxo"
    ],
    "relatedIds": [
      "change-privacy-linking"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://developer.bitcoin.org/devguide/transactions.html",
      "https://github.com/bitcoin/bips/blob/master/bip-0078.mediawiki",
      "https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp",
      "https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki"
    ],
    "questions": [
      "Pourquoi ne pas toujours choisir les plus petits UTXO ?",
      "Pourquoi 2 transactions de même montant ont-elles des frais différents ?"
    ],
    "status": "reviewed",
    "sourceHash": "4bb37df16e16d60b8dd7c8c69310c8eabe96a660c80a8671c6eccc8aff948d05",
    "sourcePath": "data/alice-corpus/examples/coin-selection-tradeoffs.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-coinjoin",
    "conceptId": "coinjoin",
    "title": "Comprendre CoinJoin",
    "keywords": [
      "Comprendre CoinJoin",
      "CoinJoin",
      "Que fait un CoinJoin et que ne garantit-il pas ?",
      "privacy",
      "coinjoin"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn CoinJoin est une transaction construite par plusieurs participants. Il vise à rendre moins certaine l’association entre leurs entrées et leurs sorties, sans cacher l’existence de la transaction.\n\nExplication\nLa structure Bitcoin permet de réunir plusieurs entrées et sorties avec les autorisations nécessaires. Selon le protocole, certaines sorties présentent des caractéristiques communes qui rendent l’interprétation plus ambiguë. L’hypothèse selon laquelle toutes les entrées ont un propriétaire unique peut alors être fausse.\n\nLes modalités de coordination, les frais et la confidentialité varient selon l’implémentation. Les usages ultérieurs des fonds peuvent aussi recréer des liens ; la transaction collaborative ne réinitialise pas magiquement tout l’historique.\n\nLimites et confusions\nCoinJoin ne garantit pas un anonymat absolu et ne supprime pas les montants ni les transactions de la chaîne. Il ne faut pas confondre ce principe avec un service qui reçoit les fonds en garde et promet de les rendre. La disponibilité actuelle et les propriétés d’un produit précis exigent une vérification séparée ; les noms historiques de la source ne sont pas des recommandations.",
    "parentIds": [],
    "relatedIds": [
      "common-input-ownership-heuristic",
      "coin-control",
      "payjoin",
      "secondary-bitcoin-blind-signatures",
      "secondary-bitcoin-joinmarket",
      "secondary-bitcoin-privacy-by-obfuscation"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc204 — Privacy on Bitcoin",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Que fait un CoinJoin et que ne garantit-il pas ?"
    ],
    "status": "reviewed",
    "sourceHash": "ff7d2ac90eaa5adbde0c790f54ed7b699c2a7d3160575cfde1e4ecd9db1f01f9",
    "sourcePath": "data/alice-corpus/examples/coinjoin.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-cold-storage",
    "conceptId": "cold-storage",
    "title": "La conservation hors ligne",
    "keywords": [
      "La conservation hors ligne",
      "Cold Storage",
      "Que signifie conserver ses clés hors ligne ?",
      "wallets",
      "cold storage"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa conservation hors ligne cherche à isoler les clés de signature des environnements connectés. Elle vise surtout à réduire l’exposition aux attaques à distance.\n\nExplication\nUn appareil de signature dédié est une possibilité ; d’autres organisations séparent aussi préparation et signature. Les informations publiques peuvent rester dans un portefeuille de consultation tandis que le secret sert uniquement lors d’une autorisation.\n\nLa sécurité dépend de toute la chaîne. La génération des clés, leur sauvegarde, le transfert des données à signer et la vérification de la destination doivent être cohérents. Un secret initialement exposé ne redevient pas inconnu des attaquants simplement parce que l’appareil est ensuite déconnecté.\n\nLimites et confusions\nHors ligne ne signifie pas invulnérable. Perte, destruction, erreur de récupération et accès physique restent possibles. Une organisation trop compliquée peut créer un risque de blocage supérieur à celui qu’elle cherche à réduire. Les termes cold storage et hardware wallet se recouvrent partiellement, mais désignent respectivement une organisation de conservation et une catégorie d’appareils.",
    "parentIds": [],
    "relatedIds": [
      "watch-only-wallet",
      "partially-signed-bitcoin-transaction",
      "secure-backups",
      "secondary-bitcoin-paper-wallet"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Que signifie conserver ses clés hors ligne ?"
    ],
    "status": "reviewed",
    "sourceHash": "169e19b3a68197bbb31ebfe2d24982fa2e71241e7deb46f6cacdc2c4e901ff7b",
    "sourcePath": "data/alice-corpus/examples/cold-storage.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-commodity-money",
    "conceptId": "commodity-money",
    "title": "La monnaie marchandise",
    "keywords": [
      "La monnaie marchandise",
      "Commodity Money",
      "Pourquoi certaines marchandises ont-elles servi de monnaie ?",
      "Monnaie et économie",
      "commodity money"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne monnaie marchandise utilise un bien comme intermédiaire d’échange. Ses propriétés matérielles, son acceptation et sa rareté influencent son utilité monétaire.\n\nExplication\nUn bien durable, transportable, divisible et vérifiable est plus facile à employer pour payer qu’un objet qui se dégrade rapidement ou dont la qualité est difficile à reconnaître. Les métaux précieux offrent plusieurs de ces propriétés, mais leur transport et leur contrôle ont aussi des coûts.\n\nL’acceptation compte autant que la matière. Détenir un objet rare ne suffit pas à en faire une monnaie si personne ne souhaite le recevoir. À l’inverse, une production plus facile ou une nouvelle source d’approvisionnement peut modifier sa rareté et son pouvoir d’achat.\n\nLimites et confusions\nLes récits qui font passer toutes les sociétés par une succession unique du troc à une monnaie marchandise simplifient une histoire diverse. Cette fiche décrit un modèle d’usage, pas une origine universelle de la monnaie.\n\nLa comparaison avec Bitcoin porte sur des propriétés comme la divisibilité ou la vérifiabilité ; Bitcoin n’est pas une matière physique avec des usages industriels comparables à ceux de l’or. La rareté ne garantit jamais, à elle seule, une valeur de marché.",
    "parentIds": [],
    "relatedIds": [
      "money-functions",
      "gold-standard",
      "secondary-economics-barter-myth",
      "secondary-economics-coin-clipping",
      "secondary-economics-debt-money-theory",
      "secondary-economics-gresham-law",
      "secondary-economics-monetary-debasement",
      "secondary-economics-monetary-premium"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Pourquoi certaines marchandises ont-elles servi de monnaie ?"
    ],
    "status": "reviewed",
    "sourceHash": "5b4d8aa5482167e83c29e5bc63502002bbfb73ed0242a30789e860975f583ad8",
    "sourcePath": "data/alice-corpus/examples/commodity-money.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-common-input-ownership-heuristic",
    "conceptId": "common-input-ownership-heuristic",
    "title": "L’hypothèse des entrées communes",
    "keywords": [
      "L’hypothèse des entrées communes",
      "Common Input Ownership Heuristic",
      "Pourquoi dépenser plusieurs UTXO ensemble peut-il les relier ?",
      "privacy",
      "common input ownership heuristic"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’heuristique des entrées communes suppose que les fonds dépensés ensemble appartiennent au même acteur. Elle est souvent utile pour une transaction ordinaire, mais n’est pas une règle du protocole.\n\nExplication\nUn portefeuille choisit couramment plusieurs UTXO pour financer un paiement. L’observateur en déduit que la même entité avait la capacité de les mobiliser. Une consolidation rend ce rapprochement particulièrement visible puisqu’elle regroupe plusieurs fonds.\n\nBitcoin permet toutefois de construire une transaction avec plusieurs participants. Ils peuvent chacun autoriser leurs propres entrées. Un CoinJoin ou un PayJoin peut donc réunir des fonds qui n’appartiennent pas au même payeur.\n\nLimites et confusions\nDes signatures valides prouvent le respect des conditions de dépense, pas l’existence d’un propriétaire humain unique. L’heuristique ne doit pas être formulée comme « toutes les entrées appartiennent forcément à la même personne ». La connaissance du contexte et du type de transaction est nécessaire avant une attribution. Les étiquettes conservées par le détenteur peuvent aider à éviter des rapprochements non souhaités.",
    "parentIds": [],
    "relatedIds": [
      "coin-control",
      "coinjoin",
      "payjoin",
      "secondary-privacy-transaction-heuristics"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc204 — Privacy on Bitcoin"
    ],
    "questions": [
      "Pourquoi dépenser plusieurs UTXO ensemble peut-il les relier ?"
    ],
    "status": "reviewed",
    "sourceHash": "f277f55a2befd4fa5153eb7ce0eba4acbf06921c563eb3aa31d2da131c496498",
    "sourcePath": "data/alice-corpus/examples/common-input-ownership-heuristic.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-consolidation-transaction",
    "conceptId": "consolidation-transaction",
    "title": "La consolidation des UTXO",
    "keywords": [
      "La consolidation des UTXO",
      "Consolidation Transaction",
      "Pourquoi regrouper des UTXO et quels compromis cela implique-t-il ?",
      "privacy",
      "consolidation transaction"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne consolidation réunit plusieurs UTXO dans un nombre plus réduit de sorties. Elle peut simplifier les dépenses futures, tout en créant un lien public entre des fonds auparavant séparés.\n\nExplication\nDépenser de nombreux petits UTXO exige plusieurs entrées. Les regrouper peut diminuer le nombre d’entrées nécessaire à une opération ultérieure. Le raisonnement économique dépend des frais payés maintenant et de ceux qui seraient payés plus tard ; les frais futurs ne sont pas connus avec certitude.\n\nDu point de vue de la confidentialité, la transaction associe explicitement ces fonds. Un observateur peut appliquer l’hypothèse de contrôle commun et rapprocher leurs historiques.\n\nLimites et confusions\nUne consolidation n’est donc pas une simple optimisation sans contrepartie. Elle peut aussi créer de la monnaie rendue lors d’un futur paiement. Il faut la distinguer du batching, qui regroupe plusieurs paiements à des destinataires. La fiche explique un compromis général et ne recommande pas de réunir automatiquement tous les fonds d’un portefeuille.",
    "parentIds": [],
    "relatedIds": [
      "coin-control",
      "common-input-ownership-heuristic",
      "transaction-batching"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc204 — Privacy on Bitcoin",
      "PlanB Extraction — 2026-05-23 — btc303"
    ],
    "questions": [
      "Pourquoi regrouper des UTXO et quels compromis cela implique-t-il ?"
    ],
    "status": "reviewed",
    "sourceHash": "2613cb6bde1ac7a591b0b7f21d40a134588c0208c5a31b8a944da550c0a2500a",
    "sourcePath": "data/alice-corpus/examples/consolidation-transaction.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-counterparty-risk",
    "conceptId": "counterparty-risk",
    "title": "Le risque de contrepartie",
    "keywords": [
      "Le risque de contrepartie",
      "Counterparty Risk",
      "Que se passe-t-il si l’intermédiaire ne tient pas sa promesse ?",
      "Monnaie et économie",
      "counterparty risk"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe risque de contrepartie est le risque qu’un acteur ne respecte pas son engagement. Une plateforme qui conserve des fonds peut devenir indisponible, insolvable ou refuser un retrait.\n\nExplication\nUn solde affiché sur un service n’est pas toujours un actif que l’utilisateur contrôle directement. Il peut représenter une créance sur l’opérateur. Ce dernier peut subir une panne, un vol ou une contrainte extérieure, ou avoir pris des engagements qu’il ne peut plus honorer.\n\nDans Bitcoin, contrôler les clés et pouvoir dépenser sans autorisation de l’intermédiaire réduit certains de ces risques de garde. Cela transfère cependant à l’utilisateur des responsabilités de sauvegarde et de sécurité. La comparaison doit porter sur les droits réels et les moyens de récupération.\n\nLimites et confusions\nTous les intermédiaires ne présentent pas les mêmes risques et toutes les dépendances ne sont pas de la garde. Un fournisseur de connexion, de liquidité ou d’interface peut être nécessaire sans détenir directement les fonds.\n\nLa transparence déclarée ne remplace pas la capacité effective à honorer une promesse. Il faut demander qui contrôle les actifs, ce qui se passe en cas de panne et quels recours restent possibles. Le nom commercial ou la qualité de l’interface ne répond pas à ces questions.",
    "parentIds": [],
    "relatedIds": [
      "custodial-lightning-wallet",
      "paper-bitcoin",
      "secondary-economics-gold-backed-paper-currency",
      "secondary-economics-layered-money",
      "secondary-economics-lender-of-last-resort",
      "secondary-economics-moral-hazard",
      "secondary-stablecoins-commodity-backed-stablecoin",
      "secondary-stablecoins-usdc-depeg-2023"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB biz101 — Bitcoin for Business"
    ],
    "questions": [
      "Que se passe-t-il si l’intermédiaire ne tient pas sa promesse ?"
    ],
    "status": "reviewed",
    "sourceHash": "c68ab82de12d0388a732406fc20b2fde5239959dbf55c6042d308447b7b0e0c7",
    "sourcePath": "data/alice-corpus/examples/counterparty-risk.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-cryptographic-hash-function",
    "conceptId": "cryptographic-hash-function",
    "title": "L’empreinte cryptographique",
    "keywords": [
      "L’empreinte cryptographique",
      "Cryptographic Hash Function",
      "À quoi sert un hash dans Bitcoin ?",
      "Cryptographie et limites du protocole",
      "cryptographic hash function"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne fonction de hachage cryptographique transforme des données en une empreinte de taille fixe. Elle permet de les identifier et de vérifier leur cohérence sans recopier tout leur contenu.\n\nExplication\nLa même entrée donne la même empreinte. Modifier les données change normalement le résultat. Bitcoin utilise ces empreintes notamment pour les transactions, les blocs et les arbres de Merkle.\n\nLa sécurité demande plusieurs propriétés. Il doit être difficile de retrouver une entrée à partir d’une empreinte, de trouver une seconde entrée correspondant à une donnée connue ou de trouver 2 entrées distinctes ayant la même empreinte. Ces problèmes sont liés, mais ne sont pas identiques.\n\nLimites et confusions\nLes collisions existent mathématiquement quand les entrées possibles sont plus nombreuses que les empreintes. La propriété recherchée est la difficulté pratique de les trouver, pas leur impossibilité absolue. Une sortie qui ressemble à de l’aléatoire ne suffit pas à démontrer cette sécurité.\n\nLe hachage n’est pas un chiffrement et n’utilise pas de clé pour retrouver le contenu. Si les entrées sont prévisibles, quelqu’un peut néanmoins les essayer et comparer les empreintes. Hacher une information courte ou connue ne garantit donc pas sa confidentialité.",
    "parentIds": [],
    "relatedIds": [
      "merkle-tree",
      "document-timestamping",
      "secondary-bitcoin-collision-resistance",
      "secondary-bitcoin-cryptographic-commitment",
      "secondary-bitcoin-hash160",
      "secondary-bitcoin-message-integrity",
      "secondary-bitcoin-pedersen-commitment",
      "secondary-bitcoin-preimage-resistance",
      "secondary-bitcoin-sha-256"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://csrc.nist.gov/glossary/term/cryptographic_hash_function"
    ],
    "questions": [
      "À quoi sert un hash dans Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "b0b734becf6b0915262434fee97fa3a438795dbdf0d8e0544d6981672ec66615",
    "sourcePath": "data/alice-corpus/examples/cryptographic-hash-function.fr.md",
    "theme": "Cryptographie et limites du protocole"
  },
  {
    "id": "curated-custodial-lightning-wallet",
    "conceptId": "custodial-lightning-wallet",
    "title": "La garde sur Lightning",
    "keywords": [
      "La garde sur Lightning",
      "Custodial Lightning Wallet",
      "Qui détient les clés selon le service utilisé ?",
      "Lightning",
      "custodial lightning wallet"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn wallet Lightning custodial affiche un solde tenu par un opérateur qui contrôle les clés et les canaux. L’utilisateur dépend de cet opérateur pour exécuter ses paiements ou récupérer ses bitcoins.\n\nExplication\nLe service s’occupe de la liquidité, de la disponibilité et du routage. L’expérience peut donc être simple, mais le solde correspond à une créance ou à une écriture chez ce service. Un paiement Lightning reçu par l’opérateur ne donne pas automatiquement à l’utilisateur le contrôle de bitcoins on-chain.\n\nPour identifier le modèle, examiner qui signe les dépenses et comment les fonds seraient récupérés si l’entreprise cessait de répondre. Le nom de l’application, la présence d’un QR code ou l’emploi du mot « Lightning » ne suffit pas.\n\nLimites et confusions\nL’opérateur peut être indisponible, devenir insolvable ou bloquer un compte. L’autonomie est différente de celle d’un wallet dont l’utilisateur contrôle les clés et les mécanismes de sortie.\n\nUne même application peut proposer plusieurs modes de garde selon ses versions ou les régions. Il faut vérifier le mode réellement activé, sans classer définitivement une marque. Un LSP qui aide un wallet autonome n’est pas automatiquement le gardien de ses fonds.",
    "parentIds": [],
    "relatedIds": [
      "lightning-service-provider",
      "spark-trust-and-exits",
      "secondary-lightning-nostr-wallet-connect"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB lnp202 — Set up Your First Lightning Node"
    ],
    "questions": [
      "Qui détient les clés selon le service utilisé ?"
    ],
    "status": "reviewed",
    "sourceHash": "58760c18f31ca122064e92a629c697abc8a1b84eeff50e129a3d63e5740ca9a3",
    "sourcePath": "data/alice-corpus/examples/custodial-lightning-wallet.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-custodial-wallet",
    "conceptId": "custodial-wallet",
    "title": "La garde déléguée",
    "keywords": [
      "La garde déléguée",
      "Custodial Wallet",
      "Qui contrôle les fonds d’un service de garde ?",
      "wallets",
      "custodial wallet"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nDans un service de garde, un tiers contrôle les clés ou la capacité effective de dépenser les fonds. L’utilisateur accède à un compte et dépend du service pour effectuer un retrait.\n\nExplication\nLe solde affiché représente alors ce que le service reconnaît devoir ou mettre à disposition. Un transfert entre clients peut être traité dans sa comptabilité interne sans transaction Bitcoin pour chacun. Un mot de passe ou une double authentification protège l’accès au compte, pas la maîtrise directe des clés du dépositaire.\n\nCette organisation peut simplifier l’usage et la récupération d’accès. Elle ajoute toutefois une dépendance à la sécurité, à la solvabilité et aux règles de l’opérateur.\n\nLimites et confusions\nLa facilité d’utilisation ne supprime pas les risques de gel, de faillite, de piratage ou de restrictions de retrait. Une preuve de possession de bitcoins ne montre pas à elle seule toutes les obligations d’un service. La distinction avec la garde personnelle doit être expliquée avant d’assimiler un compte applicatif à des fonds contrôlés par ses propres clés.",
    "parentIds": [],
    "relatedIds": [
      "self-custody",
      "exchange-custody-risk",
      "two-factor-authentication"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins",
      "PlanB Extraction — 2026-05-23 — eco104"
    ],
    "questions": [
      "Qui contrôle les fonds d’un service de garde ?"
    ],
    "status": "reviewed",
    "sourceHash": "b3a1a315bf35a5f7b8e2d0637531c122f46eabcd80fefe10cea1665cab505bc8",
    "sourcePath": "data/alice-corpus/examples/custodial-wallet.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-cypherpunk-movement",
    "conceptId": "cypherpunk-movement",
    "title": "Les origines cypherpunks",
    "keywords": [
      "Les origines cypherpunks",
      "Cypherpunk Movement",
      "Quelles idées ont précédé Bitcoin ?",
      "Histoire et évolution du protocole",
      "cypherpunk movement"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes cypherpunks défendent la vie privée et l’autonomie par des outils cryptographiques. Bitcoin s’inscrit dans cette histoire de recherches sur les communications protégées et la monnaie numérique.\n\nExplication\nLe mouvement réunit des programmeurs, des cryptographes et des militants autour de discussions, de textes et de logiciels. Leur démarche consiste à construire des protections utilisables plutôt qu’à compter uniquement sur des promesses institutionnelles.\n\nLes travaux sur l’ecash, les preuves de travail et les monnaies numériques ont précédé Bitcoin. Des projets comme Hashcash, b-money ou Bit Gold éclairent ce contexte sans être identiques au système proposé par Satoshi. Le réseau Bitcoin combine des mécanismes cryptographiques et des incitations pour organiser un historique de transactions sans autorité centrale unique.\n\nLimites et confusions\nCette filiation ne signifie pas que tous les participants partageaient les mêmes opinions ou que chaque invention provenait d’une organisation commune. Il faut distinguer contributions techniques, échanges publics et interprétations politiques.\n\nConnaître un précurseur ne permet pas d’identifier Satoshi. Les ressemblances d’intérêts ou de compétences sont des indices faibles, pas une preuve. L’intérêt pédagogique est de comprendre les problèmes que ces chercheurs cherchaient à résoudre, notamment la surveillance et la dépendance aux intermédiaires.",
    "parentIds": [],
    "relatedIds": [
      "satoshi-identity-hypotheses",
      "financial-censorship",
      "secondary-bitcoin-crypto-anarchist-manifesto",
      "secondary-bitcoin-cypherpunk-manifesto",
      "secondary-bitcoin-digicash",
      "secondary-bitcoin-rpow"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB his201 — The History of Bitcoin's Creation",
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Quelles idées ont précédé Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "63890b890398ef78b2eb8c819ababe21f66d2bc97bbe811ad430fe8320856a0e",
    "sourcePath": "data/alice-corpus/examples/cypherpunk-movement.fr.md",
    "theme": "Histoire et évolution du protocole"
  },
  {
    "id": "curated-derivation-path",
    "conceptId": "derivation-path",
    "title": "Le chemin de dérivation",
    "keywords": [
      "Le chemin de dérivation",
      "Derivation Path",
      "Pourquoi 2 logiciels ne retrouvent-ils pas toujours les mêmes adresses ?",
      "wallets",
      "derivation path"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe chemin de dérivation indique la position d’une clé dans l’arbre d’un portefeuille HD. Il aide à retrouver les mêmes comptes et adresses dans un logiciel compatible.\n\nExplication\nDes conventions organisent l’arbre selon le type d’usage, le réseau ou actif, le compte, les adresses de réception et la monnaie rendue. Le chemin est une description de cette organisation, distincte du secret qui permet de calculer les clés.\n\nLors d’une restauration, 2 logiciels peuvent utiliser les mêmes mots mais examiner des branches différentes. Ils n’affichent alors pas les mêmes adresses. Le type de sortie attendu doit aussi correspondre.\n\nLimites et confusions\nLe chemin seul ne permet pas de dépenser des fonds. À l’inverse, les mots seuls ne garantissent pas une récupération automatique dans toute application. Les notations techniques et dérivations renforcées doivent être reprises depuis la documentation du portefeuille concerné. Cette fiche explique la compatibilité ; elle n’invite pas à tester au hasard des secrets sur des sites ou logiciels inconnus.",
    "parentIds": [],
    "relatedIds": [
      "hd-wallet",
      "wallet-backup",
      "descriptor-wallet",
      "secondary-bitcoin-hardened-derivation"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Pourquoi 2 logiciels ne retrouvent-ils pas toujours les mêmes adresses ?"
    ],
    "status": "reviewed",
    "sourceHash": "33c6c7556c624e0e9908ec5f39ee060ade9682b95b45c605a9713e91bed11369",
    "sourcePath": "data/alice-corpus/examples/derivation-path.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-descriptor-wallet",
    "conceptId": "descriptor-wallet",
    "title": "Les portefeuilles à descripteurs",
    "keywords": [
      "Les portefeuilles à descripteurs",
      "Descriptor Wallet",
      "Pourquoi une sauvegarde peut-elle contenir des descripteurs ?",
      "wallets",
      "descriptor wallet"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn descripteur décrit explicitement comment retrouver les sorties d’un portefeuille à partir de scripts, de clés et de chemins. Il rend sa configuration plus reproductible entre outils compatibles.\n\nExplication\nLe portefeuille a besoin de savoir quelles conditions de dépense rechercher sur la chaîne. Un descripteur fournit cette description plutôt que de laisser le logiciel deviner le type d’adresse et la dérivation. Il est particulièrement utile pour les configurations multisig et la préparation de transactions.\n\nUn descripteur public peut suffire à suivre les fonds ou à construire des adresses. Les signatures nécessitent toujours l’accès aux clés privées exigées par les conditions de dépense.\n\nLimites et confusions\nCe sont les transactions qui sont signées, pas les adresses. Un descripteur ne remplace donc pas automatiquement les secrets de sauvegarde. Certains descripteurs peuvent contenir des informations privées ; leur sensibilité dépend du contenu. En multisig, conserver la configuration complète et le nombre de clés nécessaires reste indispensable, même si un logiciel sait déjà afficher le solde.",
    "parentIds": [],
    "relatedIds": [
      "wallet-backup",
      "multisig",
      "watch-only-wallet"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki",
      "https://github.com/bitcoin/bitcoin/blob/v31.1/doc/descriptors.md"
    ],
    "questions": [
      "Pourquoi une sauvegarde peut-elle contenir des descripteurs ?"
    ],
    "status": "reviewed",
    "sourceHash": "0b02955581f93e4d73de9fbdcc897d84ad0c799a6a952fb7692982e931b2651c",
    "sourcePath": "data/alice-corpus/examples/descriptor-wallet.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-difficulty-adjustment",
    "conceptId": "difficulty-adjustment",
    "title": "L’ajustement de difficulté",
    "keywords": [
      "L’ajustement de difficulté",
      "Difficulty Adjustment",
      "Comment Bitcoin réagit-il quand des mineurs arrivent ou partent ?",
      "mining",
      "difficulty adjustment"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nSur le réseau principal, Bitcoin recalcule la difficulté tous les 2 016 blocs pour viser une cadence moyenne de 10 minutes. Il réagit à la vitesse observée, pas à une décision d’un comité.\n\nExplication\nSi la puissance augmente et que les blocs arrivent plus vite, la difficulté tend à monter. Si beaucoup de mineurs s’arrêtent et que les blocs ralentissent, elle tend à baisser. Entre les ajustements, le temps d’attente peut donc s’écarter durablement de la moyenne visée.\n\nCe mécanisme évite que l’amélioration du matériel accélère sans limite le calendrier d’émission. Il ne modifie pas la quantité autorisée de subvention à une hauteur donnée.\n\nLimites et confusions\nL’ajustement a des bornes. Une très forte variation de puissance peut demander plusieurs périodes avant un retour vers la cadence attendue. Les limites usuelles sont ÷4, soit −75 %, et ×4, soit +300 % de difficulté, sous les contraintes de cible maximale et d’encodage. La différence entre 2 016 blocs et 2 015 intervalles mesurés est détaillée dans l’approfondissement.",
    "parentIds": [],
    "relatedIds": [
      "mining-difficulty",
      "mining-difficulty-details",
      "bitcoin-monetary-policy"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp",
      "https://github.com/bitcoin/bitcoin/blob/v28.0/src/kernel/chainparams.cpp"
    ],
    "questions": [
      "Comment Bitcoin réagit-il quand des mineurs arrivent ou partent ?"
    ],
    "status": "reviewed",
    "sourceHash": "7753a38fed4a2c26e57fd14d3e615cd5cd12c7d94807023c3f0af3e38b19fd91",
    "sourcePath": "data/alice-corpus/examples/difficulty-adjustment.fr.md",
    "theme": "mining"
  },
  {
    "id": "curated-digital-signature",
    "conceptId": "digital-signature",
    "title": "La signature numérique",
    "keywords": [
      "La signature numérique",
      "Digital Signature",
      "PGP Signature Verification",
      "Comment prouver l’autorisation de dépenser sans révéler la clé ?",
      "Cryptographie et limites du protocole",
      "digital signature"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne signature numérique permet de vérifier qu’une clé privée a autorisé des données précises, sans révéler cette clé. Dans Bitcoin, elle participe à la vérification des conditions de dépense.\n\nExplication\nLe portefeuille prépare les informations à signer selon les règles de la transaction. La clé privée produit une signature ; les nœuds peuvent vérifier celle-ci à l’aide de la clé publique et des conditions correspondantes. Une signature invalide ne satisfait pas la condition qu’elle est censée remplir.\n\nLa signature relie donc une autorisation à un message, mais ne cache pas nécessairement ce message. Bitcoin emploie notamment ECDSA et Schnorr selon les types de dépense. Un utilisateur n’a pas besoin d’en maîtriser le calcul pour comprendre qu’il doit protéger la clé et vérifier ce qu’il autorise.\n\nLimites et confusions\nUne signature valide ne prouve pas l’identité civile de la personne derrière la clé, son consentement éclairé ou la légitimité d’un destinataire. Un appareil compromis peut demander de signer une mauvaise opération.\n\nAvec un hardware wallet, les informations affichées par l’appareil doivent être comparées à la demande fiable du destinataire. L’ordinateur peut transmettre une transaction différente de l’intention initiale ; l’appareil ne devine pas cette intention. Ne jamais partager une clé pour permettre une vérification de signature.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-script",
      "encryption",
      "secondary-bitcoin-adaptor-signature",
      "secondary-bitcoin-deterministic-ecdsa-nonce",
      "secondary-bitcoin-ecdsa-signature",
      "secondary-bitcoin-elliptic-curve-cryptography",
      "secondary-bitcoin-message-authenticity",
      "secondary-bitcoin-schnorr-signature",
      "secondary-bitcoin-secp256k1",
      "secondary-bitcoin-wallet-as-identity"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Comment prouver l’autorisation de dépenser sans révéler la clé ?"
    ],
    "status": "reviewed",
    "sourceHash": "4b120a75cc020765d2e8f430ef96ed6cfb9e6c880bb27c4b4b8c6c021d622874",
    "sourcePath": "data/alice-corpus/examples/digital-signature.fr.md",
    "theme": "Cryptographie et limites du protocole"
  },
  {
    "id": "curated-document-timestamping",
    "conceptId": "document-timestamping",
    "title": "L’horodatage de documents",
    "keywords": [
      "L’horodatage de documents",
      "Document Timestamping",
      "Que peut prouver l’ancrage d’une empreinte dans Bitcoin ?",
      "Usages et comparaisons",
      "document timestamping"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’horodatage cryptographique permet de prouver qu’une empreinte de données existait au plus tard à un certain repère. Un ancrage dans Bitcoin peut fournir ce repère sans publier le document lui-même.\n\nExplication\nLe service calcule ou utilise une empreinte du document et l’engage dans une structure liée à la chaîne. Pour vérifier plus tard, on fournit le document correspondant et la preuve permettant de relier son empreinte à l’ancrage. OpenTimestamps est un exemple de système qui produit ce type de preuve.\n\nChanger le document modifie normalement son empreinte ; la preuve concerne donc la version correspondante. Conserver le fichier et les éléments de vérification est essentiel. La blockchain apporte un historique ordonné, mais n’est pas une horloge d’une précision absolue.\n\nLimites et confusions\nCette preuve ne démontre ni l’identité de l’auteur, ni la vérité du contenu, ni sa propriété juridique. Elle ne remplace pas automatiquement les exigences d’un contrat ou d’une procédure légale.\n\nLe document n’est pas enregistré automatiquement sur Bitcoin. Hacher des données ne les rend pas secrètes si quelqu’un peut deviner les entrées et comparer les empreintes. Il faut donc distinguer preuve d’existence, conservation du fichier et confidentialité de son contenu.",
    "parentIds": [],
    "relatedIds": [
      "cryptographic-hash-function",
      "merkle-tree"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://opentimestamps.org/"
    ],
    "questions": [
      "Que peut prouver l’ancrage d’une empreinte dans Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "7172cfe0262e9c3730877f81be5fb6c54789bc85dfed10cd26dffb8c171805b8",
    "sourcePath": "data/alice-corpus/examples/document-timestamping.fr.md",
    "theme": "Usages et comparaisons"
  },
  {
    "id": "curated-double-spending",
    "conceptId": "double-spending",
    "title": "Le problème de la double dépense",
    "keywords": [
      "Le problème de la double dépense",
      "Double Spending",
      "Pourquoi un paiement numérique ne peut-il pas être copié ?",
      "fundamentals",
      "double spending"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa double dépense consiste à tenter d’utiliser les mêmes fonds pour 2 paiements incompatibles. Bitcoin empêche de les accepter ensemble dans un même historique valide.\n\nExplication\nUn fichier peut être copié sans priver son propriétaire de l’original. Une monnaie doit au contraire permettre de déterminer quelles unités sont encore dépensables. Bitcoin référence des sorties de transactions précises, les UTXO. Une fois une sortie dépensée, un autre paiement ne peut pas la dépenser à nouveau dans le même historique.\n\nLes nœuds vérifient cette règle. La preuve de travail et les confirmations permettent de départager les historiques concurrents. Une transaction simplement diffusée peut encore être remplacée ou ne jamais être confirmée ; l’avoir vue sur un écran ne suffit pas à la rendre définitive.\n\nLimites et confusions\nLa mempool n’est pas un registre définitif partagé. Chaque nœud conserve ses propres transactions en attente. Plus une transaction accumule de confirmations, plus le risque d’annulation par réorganisation devient faible, sans garantie absolue. Une copie du fichier décrivant une transaction ne crée aucun bitcoin supplémentaire.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-utxo",
      "bitcoin-finality",
      "bitcoin-mempool"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB his201 — The History of Bitcoin's Creation"
    ],
    "questions": [
      "Pourquoi un paiement numérique ne peut-il pas être copié ?"
    ],
    "status": "reviewed",
    "sourceHash": "4201e4fe4ea845ed8de0b5501f68f1732fc21738de13bfb3ba1004600e9bd962",
    "sourcePath": "data/alice-corpus/examples/double-spending.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-earn-bitcoin",
    "conceptId": "earn-bitcoin",
    "title": "Recevoir du bitcoin pour un travail",
    "keywords": [
      "Recevoir du bitcoin pour un travail",
      "Earn Bitcoin",
      "Peut-on obtenir des bitcoins sans en acheter ?",
      "Usages et comparaisons",
      "earn bitcoin"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nRecevoir du bitcoin pour un travail ou une vente permet d’en obtenir sans passer d’abord par un achat sur une plateforme. Cela suppose un accord clair sur le prix et les modalités de paiement.\n\nExplication\nLes parties doivent distinguer l’unité dans laquelle le prix est fixé de l’actif versé. Une prestation peut être facturée dans une monnaie locale puis réglée en BTC au taux convenu, ou être tarifée directement en sats. Le moment de conversion et la validité de la demande doivent être compris de chaque côté.\n\nLe choix entre réception on-chain, Lightning ou service intermédiaire change les frais, la garde et l’expérience. Une fois reçu, le paiement peut être conservé ou converti ; la réception ne supprime pas les risques associés à cette décision.\n\nLimites et confusions\nLe cours cité présente parfois cet usage comme une adoption plus organique que l’achat spéculatif. C’est une appréciation de l’usage, pas une garantie de moindre risque ou de revenu supplémentaire.\n\nLes obligations comptables et fiscales dépendent du pays, de l’activité et de la date. Cette fiche explique le mécanisme général sans donner une règle juridique universelle. La volatilité reste importante entre la fixation du prix, la réception et l’utilisation ultérieure des fonds.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-payments-for-merchants",
      "unit-of-account",
      "secondary-bitcoin-bitcoin-circular-economy",
      "secondary-bitcoin-btc-map"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc101 — The Bitcoin Journey"
    ],
    "questions": [
      "Peut-on obtenir des bitcoins sans en acheter ?"
    ],
    "status": "reviewed",
    "sourceHash": "d7a18e5def611601aa1615a214529b64ab7252ac8b8f773f12c414e7d38fd28d",
    "sourcePath": "data/alice-corpus/examples/earn-bitcoin.fr.md",
    "theme": "Usages et comparaisons"
  },
  {
    "id": "curated-encryption",
    "conceptId": "encryption",
    "title": "Chiffrement et signature",
    "keywords": [
      "Chiffrement et signature",
      "Encryption",
      "Quelle différence entre cacher un message et le signer ?",
      "Cryptographie et limites du protocole",
      "encryption"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe chiffrement protège la confidentialité d’un contenu en le transformant avec une clé. La signature sert à vérifier une autorisation ou une authenticité ; ces fonctions ne sont pas interchangeables.\n\nExplication\nUn contenu chiffré doit être déchiffré avec les éléments appropriés pour redevenir lisible. Selon le système, une même clé secrète ou une paire de clés peut intervenir. Une signature, elle, peut être vérifiée publiquement sans que cela révèle la clé privée qui l’a produite.\n\nBitcoin utilise des signatures pour autoriser des dépenses. Cela ne rend pas les transactions publiques secrètes. Une application peut aussi chiffrer localement ses données ou protéger les messages échangés avec un service ; il faut préciser quel contenu et quel trajet sont concernés.\n\nLimites et confusions\n« Chiffré » ne veut pas dire « protégé contre tout ». La gestion des clés, l’intégrité des messages, l’état de l’appareil et les données encore visibles déterminent la protection réelle. Un système doit généralement combiner confidentialité et mécanismes d’authentification appropriés.\n\nUne personne qui contrôle la session déverrouillée ou le logiciel peut accéder à des données pendant leur utilisation. De même, chiffrer un stockage ne démontre pas à lui seul sa résistance à une copie complète du profil ou à une compromission de l’appareil.",
    "parentIds": [],
    "relatedIds": [
      "digital-signature",
      "alice-local-encryption",
      "secondary-bitcoin-authenticated-encryption",
      "secondary-bitcoin-kerckhoffs-principle",
      "secondary-bitcoin-message-authenticity",
      "secondary-privacy-file-encryption",
      "secondary-privacy-full-disk-encryption"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB cyp302 — Modern Cryptography Fundamentals"
    ],
    "questions": [
      "Quelle différence entre cacher un message et le signer ?"
    ],
    "status": "reviewed",
    "sourceHash": "634a8b507f5a99972492d5b2c76ee0f021c54d846e288de6ef74d7802904810e",
    "sourcePath": "data/alice-corpus/examples/encryption.fr.md",
    "theme": "Cryptographie et limites du protocole"
  },
  {
    "id": "curated-entropy",
    "conceptId": "entropy",
    "title": "L’aléa nécessaire aux clés",
    "keywords": [
      "L’aléa nécessaire aux clés",
      "Entropy",
      "Pourquoi les clés ne doivent-elles pas être prévisibles ?",
      "Cryptographie et limites du protocole",
      "entropy"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’entropie désigne l’imprévisibilité nécessaire pour produire des secrets difficiles à deviner. Une clé ou une phrase longue mais prévisible peut être beaucoup moins sûre qu’elle n’en a l’air.\n\nExplication\nUn portefeuille doit employer un générateur cryptographiquement adapté. Celui-ci peut combiner des mécanismes logiciels ou matériels ; la présence d’une puce ne garantit pas à elle seule un bon aléa.\n\nDans BIP39, la phrase encode de 128 à 256 bits d’entropie, par multiples de 32, avec un contrôle d’erreur. Ce contrôle aide à détecter certaines erreurs, mais n’ajoute pas de secret imprévisible. Choisir soi-même des mots qui paraissent originaux n’est pas une méthode sûre de génération.\n\nLimites et confusions\nAllonger une phrase connue ou une suite répétitive n’apporte pas automatiquement plus d’entropie. La sécurité dépend de la façon dont le secret a été produit, pas simplement de son aspect.\n\nDes dés peuvent participer à certaines procédures documentées, à condition d’avoir suffisamment de tirages indépendants et non biaisés ainsi qu’une conversion correcte. Il faut suivre la procédure vérifiée du logiciel, sans improviser un nombre de lancers. Alice ne doit jamais demander la phrase produite pour en « vérifier » la qualité.",
    "parentIds": [],
    "relatedIds": [
      "digital-signature",
      "cryptographic-hash-function",
      "secondary-bitcoin-deterministic-ecdsa-nonce",
      "secondary-bitcoin-pseudorandom-number-generator",
      "secondary-bitcoin-random-number-generation"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki",
      "https://coldcard.com/docs/verifying-dice-roll-math/"
    ],
    "questions": [
      "Pourquoi les clés ne doivent-elles pas être prévisibles ?"
    ],
    "status": "reviewed",
    "sourceHash": "ac3b7f24d3725ecc4a59ee2cd50103205af4cc17edd291a05cf4992113a0d8fa",
    "sourcePath": "data/alice-corpus/examples/entropy.fr.md",
    "theme": "Cryptographie et limites du protocole"
  },
  {
    "id": "curated-exchange-custody-risk",
    "conceptId": "exchange-custody-risk",
    "title": "Le risque de laisser ses fonds à une plateforme",
    "keywords": [
      "Le risque de laisser ses fonds à une plateforme",
      "Exchange Custody Risk",
      "Quels risques subsistent quand un service détient mes clés ?",
      "security",
      "exchange custody risk"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLorsque des fonds restent sur une plateforme, leur disponibilité dépend de cet intermédiaire. Un solde affiché ne donne pas à l’utilisateur le contrôle direct des UTXO correspondants.\n\nExplication\nLa plateforme peut subir une attaque, manquer de fonds ou restreindre les retraits. Les raisons techniques, économiques et réglementaires sont distinctes, mais peuvent toutes affecter l’accès. Protéger son mot de passe ne résout pas la solvabilité ou les obligations du service.\n\nLa garde personnelle remplace ce risque par d’autres responsabilités, notamment la sauvegarde et la sécurité des clés. Comparer les modèles demande donc d’identifier qui peut réellement dépenser et dans quelles conditions l’utilisateur peut récupérer ses fonds.\n\nLimites et confusions\nLa réputation, une interface fonctionnelle ou une preuve partielle de réserves ne démontrent pas à elles seules toute la situation du dépositaire. Les services d’identification exposent aussi des données personnelles. Cette fiche décrit les risques de garde ; elle ne porte pas de jugement actualisé sur une plateforme précise et ne recommande pas une opération financière.",
    "parentIds": [],
    "relatedIds": [
      "custodial-wallet",
      "self-custody",
      "kyc-data-leakage"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins"
    ],
    "questions": [
      "Quels risques subsistent quand un service détient mes clés ?"
    ],
    "status": "reviewed",
    "sourceHash": "44d26f8d903f24f7771ddf43f52306517b2972e1271852a81c98fa1406af8e5e",
    "sourcePath": "data/alice-corpus/examples/exchange-custody-risk.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-extended-public-key",
    "conceptId": "extended-public-key",
    "title": "La clé publique étendue",
    "keywords": [
      "La clé publique étendue",
      "Extended Public Key",
      "Que révèle une xpub ?",
      "wallets",
      "extended public key"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne clé publique étendue, souvent appelée xpub, permet de dériver un ensemble de clés publiques dans une branche de portefeuille. Elle facilite le suivi sans donner, à elle seule, la capacité de signer.\n\nExplication\nUn outil de consultation ou de réception peut l’utiliser avec les paramètres adaptés pour produire des adresses et rechercher leurs transactions. Il n’a pas besoin de recevoir les clés privées correspondantes. Cette séparation est notamment utilisée avec les portefeuilles en lecture seule.\n\nLe partage dépasse cependant une adresse isolée. Selon la branche transmise, il peut exposer un historique et des adresses futures. Un serveur qui reçoit ces informations obtient donc une vue durable sur une partie du portefeuille.\n\nLimites et confusions\nUne xpub doit être protégée comme une information de confidentialité. Elle ne représente pas nécessairement tout le portefeuille ni tous ses comptes. Elle ne remplace pas le type de script et le chemin nécessaires pour retrouver les bonnes adresses. Les interactions avec une fuite de certaines clés privées relèvent d’un risque technique supplémentaire à traiter dans un approfondissement.",
    "parentIds": [],
    "relatedIds": [
      "watch-only-wallet",
      "derivation-path",
      "descriptor-wallet",
      "secondary-bitcoin-btcpay-extended-public-key",
      "secondary-bitcoin-hardened-derivation",
      "secondary-bitcoin-non-hardened-derivation"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Que révèle une xpub ?"
    ],
    "status": "reviewed",
    "sourceHash": "962d8d97cc56a7d7ae4e46d4860b6f51836bf523aee654cca501b1486a0f45a1",
    "sourcePath": "data/alice-corpus/examples/extended-public-key.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-fedimint-custody-and-privacy",
    "conceptId": "fedimint-custody-and-privacy",
    "title": "Fedimint, garde fédérée et confidentialité",
    "keywords": [
      "Fedimint, garde fédérée et confidentialité",
      "Fedimint",
      "gardiens",
      "ecash fédéré",
      "Qui garde les bitcoins dans Fedimint ?",
      "Que protègent les signatures aveugles ?",
      "Une fédération remplace-t-elle la garde personnelle des clés ?",
      "bitcoin-layers",
      "custody",
      "privacy",
      "fedimint custody and privacy"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nFedimint organise une garde collective des BTC par des gardiens. L’utilisateur détient des unités d’e-cash échangeables auprès de la fédération. La confidentialité des transferts peut être améliorée tout en conservant une dépendance envers ces gardiens.\n\nExplication\nLes gardiens détiennent les clés permettant de gérer la réserve de bitcoins selon le seuil configuré. L’utilisateur reçoit des unités numériques dont la validation repose sur des signatures aveugles. Ce mécanisme limite le lien que la fédération peut établir entre leur émission et leur utilisation.\n\nL’utilisateur n’a pas, avec ces unités seules, les clés qui lui permettraient de dépenser directement une part de la réserve Bitcoin. La fédération doit fonctionner et honorer les conversions. Une collusion suffisante, une indisponibilité ou une émission non couverte peuvent compromettre les fonds.\n\nLe modèle repose donc sur des garanties cryptographiques et sur une confiance explicite envers une communauté de gardiens. La réputation peut inciter à bien agir ; elle ne garantit pas l’absence de collusion.\n\nLimites et confusions\nConfidentialité des unités, métadonnées réseau et données observées par les passerelles Lightning sont des sujets distincts. La signature aveugle ne rend pas toute l’activité invisible.\n\nTransmettre une unité hors ligne ne prouve pas à lui seul qu’elle n’a pas déjà été dépensée. Ne pas promettre une validation complète hors ligne pour toute application Fedimint.\n\nLa synthèse d’Offchain Media est recoupée avec les documents Fedimint consultés le 2026-10-11. Aucun audit de réserve, de fédération ou de wallet précis n’a été réalisé.",
    "parentIds": [
      "cashu-et-confiance-dans-le-mint",
      "bitcoin-layered-architecture",
      "self-custody"
    ],
    "relatedIds": [
      "spark-trust-and-exits",
      "ark-implementations-bark-arkade"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://offchain.media/article/what-ecash-david-chaums-confidential-transaction-protocol-bitcoin/",
      "https://fedimint.org/docs/TradeOffs/Trust-Trade-Offs/",
      "https://fedimint.org/guardians/intro",
      "https://fedimint.org/users/intro"
    ],
    "questions": [
      "Qui garde les bitcoins dans Fedimint ?",
      "Que protègent les signatures aveugles ?",
      "Une fédération remplace-t-elle la garde personnelle des clés ?"
    ],
    "status": "reviewed",
    "sourceHash": "b17dc213030c7c8ef6174ab5922c872f47954e60ebf648c326f1749072c34b19",
    "sourcePath": "data/alice-corpus/examples/fedimint-custody-and-privacy.fr.md",
    "theme": "bitcoin-layers"
  },
  {
    "id": "curated-fiat-money",
    "conceptId": "fiat-money",
    "title": "La monnaie fiduciaire",
    "keywords": [
      "La monnaie fiduciaire",
      "Fiat Money",
      "Que signifie monnaie fiat ?",
      "Monnaie et économie",
      "fiat money"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa monnaie fiat n’est pas directement convertible en une quantité définie d’or ou d’un autre bien rare. Son acceptation repose sur des institutions, la confiance et les usages économiques et juridiques.\n\nExplication\nLes billets et les dépôts bancaires sont utilisés dans un système dont l’offre peut évoluer. La banque centrale agit sur la politique monétaire et les banques commerciales créent notamment des dépôts lorsqu’elles accordent des crédits. Cette élasticité diffère de la règle d’émission limitée de Bitcoin.\n\nSes défenseurs présentent cette souplesse comme un moyen de répondre aux besoins de financement et aux crises. Les critiques, notamment autrichiennes et libertariennes, soulignent les risques de dilution du pouvoir d’achat, de dépendance bancaire et de décisions discrétionnaires.\n\nLimites et confusions\nCréer davantage d’unités monétaires ne crée pas automatiquement davantage de biens réels. L’effet sur les prix dépend toutefois de la demande de monnaie, de la production et de la manière dont la monnaie circule.\n\nUne critique politique de l’émission doit rester distincte d’une description du mécanisme. De même, monnaie fiat numérique, dépôt bancaire, stablecoin et MNBC ne désignent pas nécessairement la même créance ni les mêmes pouvoirs de contrôle.",
    "parentIds": [],
    "relatedIds": [
      "money-supply",
      "inflation-monetary-perspectives",
      "secondary-economics-bretton-woods",
      "secondary-economics-denationalization-of-money",
      "secondary-economics-gresham-law",
      "secondary-economics-nixon-shock"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Que signifie monnaie fiat ?"
    ],
    "status": "reviewed",
    "sourceHash": "23ac39b479b8f0c6c02d47c59ad800985f92dade766695e1211c2c7da74e0261",
    "sourcePath": "data/alice-corpus/examples/fiat-money.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-financial-censorship",
    "conceptId": "financial-censorship",
    "title": "La censure financière",
    "keywords": [
      "La censure financière",
      "Financial Censorship",
      "Comment l’accès à un moyen de paiement peut-il être restreint ?",
      "Monnaie et économie",
      "financial censorship"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa censure financière désigne le blocage ou la restriction de l’accès aux fonds et aux paiements par un acteur qui en contrôle un passage. Elle peut prendre la forme d’un compte gelé, d’un retrait refusé ou d’un paiement empêché.\n\nExplication\nUn intermédiaire bancaire, une plateforme ou un émetteur numérique peut disposer de pouvoirs différents. Il faut identifier où s’exerce la décision et ce que l’utilisateur peut encore faire sans sa coopération. La surveillance des transactions peut aussi accroître la capacité de cibler certaines activités.\n\nBitcoin utilisé avec ses propres clés réduit la dépendance à un gardien des fonds. Cette propriété explique son intérêt pour la souveraineté financière. Elle ne rend pas inutiles l’accès au réseau, la protection des clés et les moyens de faire accepter un paiement.\n\nLimites et confusions\nRésister à la censure ne signifie pas qu’aucune transaction ne peut être retardée ni qu’aucun utilisateur ne subit de pression. Les plateformes, les services de conversion et certaines couches peuvent réintroduire des points de contrôle.\n\nLe caractère justifié ou abusif d’une restriction relève aussi du droit et du jugement politique. Alice doit expliquer le mécanisme concret et ses effets plutôt que supposer que toutes les restrictions se ressemblent ou que tout instrument numérique apporte les mêmes garanties.",
    "parentIds": [],
    "relatedIds": [
      "counterparty-risk",
      "programmable-money",
      "secondary-politics-bitcoin-self-custody-under-censorship",
      "secondary-stablecoins-stablecoin-centralization-risk"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Comment l’accès à un moyen de paiement peut-il être restreint ?"
    ],
    "status": "reviewed",
    "sourceHash": "a0d2a8a7dc61e065345cdd03f20c3515dcf1ae6518ed8366e173aee1426dcfb0",
    "sourcePath": "data/alice-corpus/examples/financial-censorship.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-financial-inclusion",
    "conceptId": "financial-inclusion",
    "title": "L’accès aux paiements",
    "keywords": [
      "L’accès aux paiements",
      "Financial Inclusion",
      "Quels obstacles Bitcoin peut-il réduire et lesquels subsistent ?",
      "Usages et comparaisons",
      "financial inclusion"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’inclusion financière est l’accès effectif à des outils pour payer, recevoir un revenu, épargner et commercer. Pouvoir installer un wallet ne suffit pas à démontrer que tous ces usages deviennent accessibles.\n\nExplication\nLes barrières peuvent venir des coûts, des documents demandés, des horaires, des frontières ou de restrictions de compte. Un réseau de paiement ouvert peut réduire certaines de ces frictions. Par exemple, une personne peut recevoir un paiement dans un wallet compatible sans attendre l’ouverture d’une agence bancaire.\n\nCet exemple décrit une possibilité technique, pas une réussite individuelle attestée. Pour l’utiliser réellement, il faut encore un appareil, une connexion adaptée, des connaissances de base et des personnes ou commerces qui acceptent le paiement. Une conversion peut aussi exiger une liquidité locale.\n\nLimites et confusions\nLa volatilité, la garde, les escroqueries et la perte d’accès aux clés peuvent créer de nouvelles difficultés. Un service simple mais custodial peut réduire certaines barrières tout en réintroduisant une dépendance au prestataire.\n\nL’évaluation doit regarder coût, autonomie et disponibilité concrète plutôt que le seul nombre de wallets. Aucun témoignage non recoupé n’est utilisé ici. Les règles d’accès ou de conversion dans un pays doivent être vérifiées séparément.",
    "parentIds": [],
    "relatedIds": [
      "financial-censorship",
      "bitcoin-vs-stablecoins",
      "secondary-stablecoins-stablecoin-use-cases"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Quels obstacles Bitcoin peut-il réduire et lesquels subsistent ?"
    ],
    "status": "reviewed",
    "sourceHash": "174bbcf6437dc2aab8f6017ca18ed0b173a1415c2603886dd9b6e1e2bb96e4fd",
    "sourcePath": "data/alice-corpus/examples/financial-inclusion.fr.md",
    "theme": "Usages et comparaisons"
  },
  {
    "id": "curated-fractional-reserve-banking",
    "conceptId": "fractional-reserve-banking",
    "title": "Les réserves bancaires fractionnaires",
    "keywords": [
      "Les réserves bancaires fractionnaires",
      "Fractional Reserve Banking",
      "Comment distinguer un dépôt bancaire de billets détenus directement ?",
      "Monnaie et économie",
      "fractional reserve banking"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes banques ne conservent pas chaque dépôt sous forme de monnaie immédiatement disponible. Elles détiennent aussi des prêts et d’autres actifs, ce qui crée une différence entre les promesses de retrait et leur liquidité.\n\nExplication\nDans le système moderne, accorder un prêt crée généralement un dépôt. La banque ne se contente pas de reprendre une somme préexistante pour la prêter à quelqu’un d’autre. Cette création reste contrainte par son capital, son financement, sa liquidité, la réglementation, la rentabilité et la demande de crédit.\n\nDes dépôts retirables rapidement financent ainsi des actifs dont le remboursement peut être beaucoup plus lent. Si de nombreux déposants demandent leur argent simultanément, la banque peut rencontrer un problème de liquidité. Un problème de solvabilité, lorsque ses actifs ne couvrent plus ses engagements, est une question distincte.\n\nLimites et confusions\nLe mécanisme ne se résume pas à un multiplicateur fixe appliqué aux réserves. Les règles et les pratiques diffèrent selon les systèmes bancaires.\n\nLa garantie des dépôts et le prêteur en dernier ressort répondent à certains risques, selon leurs conditions. Les critiques de l’expansion du crédit doivent être distinguées de la description comptable. Une créance bancaire n’est pas équivalente à des bitcoins directement contrôlés par leurs clés.",
    "parentIds": [],
    "relatedIds": [
      "counterparty-risk",
      "money-supply",
      "secondary-economics-credit-expansion",
      "secondary-economics-free-banking"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy",
      "https://www.bundesbank.de/resource/blob/654284/df66c4444d065a7f519e2ab0c476df58/mL/2017-04-money-creation-process-data.pdf"
    ],
    "questions": [
      "Comment distinguer un dépôt bancaire de billets détenus directement ?"
    ],
    "status": "reviewed",
    "sourceHash": "0cff170295b658dee053185eb450093dc566af3b8f60fb34bfa747202881ff59",
    "sourcePath": "data/alice-corpus/examples/fractional-reserve-banking.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-full-node",
    "conceptId": "full-node",
    "title": "La validation complète",
    "keywords": [
      "La validation complète",
      "Full Node",
      "Que vérifie un nœud complet ?",
      "nodes",
      "full node"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn nœud complet vérifie les règles des blocs et des transactions, au lieu de déléguer cette validation à un serveur. Le stockage de tout l’historique est une question distincte.\n\nExplication\nLe nœud contrôle notamment les dépenses, l’émission monétaire et la preuve de travail. Il entretient l’état nécessaire pour vérifier les nouveaux blocs. Un portefeuille connecté à ce nœud peut utiliser les informations qu’il a lui-même vérifiées.\n\nUn nœud d’archive conserve les anciens blocs. Un nœud élagué peut supprimer certains fichiers après traitement tout en restant un nœud de validation complète. Le qualificatif « complet » ne doit donc pas être opposé automatiquement à « élagué ».\n\nLimites et confusions\nLe démarrage et les optimisations de synchronisation demandent de préciser quelles vérifications sont effectuées et à quel moment. Un nœud ne protège pas contre le vol des clés d’un portefeuille ni contre une adresse malveillante approuvée. Il faut réellement relier le portefeuille au nœud pour bénéficier de ses données ; le simple fait d’en faire tourner un ailleurs ne suffit pas.",
    "parentIds": [],
    "relatedIds": [
      "pruned-node",
      "node-initial-sync",
      "wallet-node-connection",
      "secondary-bitcoin-validationless-mining"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://developer.bitcoin.org/devguide/p2p_network.html",
      "https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning"
    ],
    "questions": [
      "Que vérifie un nœud complet ?"
    ],
    "status": "reviewed",
    "sourceHash": "10c0a0fe5a13224cd6ddae98e37b2255380c0f1a557eacc29853b57f19503f4f",
    "sourcePath": "data/alice-corpus/examples/full-node.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-gold-standard",
    "conceptId": "gold-standard",
    "title": "L’étalon-or",
    "keywords": [
      "L’étalon-or",
      "Gold Standard",
      "Comment fonctionnait un système lié à l’or ?",
      "Monnaie et économie",
      "gold standard"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’étalon-or lie une unité monétaire à une quantité définie d’or, avec des conditions de convertibilité. Il faut distinguer ce système de la détention directe de pièces ou de lingots.\n\nExplication\nLes utilisateurs peuvent faire circuler des billets ou des dépôts tout en comptant sur une promesse de conversion. Le lien avec les réserves d’or contraint l’émission selon les règles du régime. Il dépend aussi des institutions qui conservent le métal et honorent cette promesse.\n\nLes modalités ont changé selon les pays et les périodes. Qui peut convertir, à quel taux et sous quelles restrictions sont des questions essentielles. Les suspensions de convertibilité montrent que le droit promis et la disponibilité effective ne se confondent pas.\n\nLimites et confusions\nUn système adossé à l’or n’élimine pas tout crédit ni tout risque de contrepartie. Un billet convertible n’est pas identique à de l’or déjà sous le contrôle de son détenteur.\n\nLa comparaison avec Bitcoin doit préserver cette distinction. La règle d’émission du protocole n’est pas une promesse de convertir chaque bitcoin en métal. Les arguments de « discipline monétaire » décrivent un mécanisme et une lecture économique, pas une garantie universelle de stabilité.",
    "parentIds": [],
    "relatedIds": [
      "commodity-money",
      "counterparty-risk",
      "secondary-economics-bretton-woods",
      "secondary-economics-gold-backed-paper-currency",
      "secondary-economics-nixon-shock"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Comment fonctionnait un système lié à l’or ?"
    ],
    "status": "reviewed",
    "sourceHash": "56cad0c56e4307aa73df03aa4ff5730537a81fbe74789f8d83d3955f5c2dbe94",
    "sourcePath": "data/alice-corpus/examples/gold-standard.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-hard-fork",
    "conceptId": "hard-fork",
    "title": "Les hard forks",
    "keywords": [
      "Les hard forks",
      "Hard Fork",
      "Qu’est-ce qu’un hard fork ?",
      "Histoire et évolution du protocole",
      "hard fork"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn hard fork introduit des règles qui autorisent certains blocs rejetés par les anciennes règles. Les nœuds non mis à jour refusent ces blocs lorsqu’ils les rencontrent.\n\nExplication\nLa différence porte sur la validité, pas simplement sur la version affichée par un logiciel. Si des participants maintiennent des règles incompatibles et produisent des chaînes correspondantes, une séparation durable devient possible. L’acceptation de chaque chaîne dépend ensuite de ses utilisateurs et de ses acteurs économiques.\n\nLa coordination doit donc préciser ce qui change, quand les nouvelles règles s’appliquent et comment les participants choisissent leur logiciel. Le travail accumulé ne rend pas valide, pour un nœud, un bloc qui enfreint ses règles.\n\nLimites et confusions\nPublier une copie modifiée du code n’est pas à lui seul un hard fork du réseau. Une scission durable ne se crée pas automatiquement à chaque mise à jour ni à chaque branche de développement.\n\n« Soft » et « hard » décrivent une relation de compatibilité, pas un classement moral ou une garantie de sécurité. Pour comprendre une controverse, il faut examiner les nouvelles règles et leurs conséquences concrètes plutôt que déduire la qualité de la proposition de son étiquette.",
    "parentIds": [],
    "relatedIds": [
      "soft-fork",
      "bitcoin-governance",
      "secondary-governance-chain-split-risk"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://developer.bitcoin.org/devguide/block_chain.html#consensus-rule-changes",
      "https://github.com/bitcoin/bips/blob/master/bip-0099.mediawiki"
    ],
    "questions": [
      "Qu’est-ce qu’un hard fork ?"
    ],
    "status": "reviewed",
    "sourceHash": "c34aa9436b86b1fbc87138b6f54de6ec129b0d243ae26d5e860d4821328f1ce8",
    "sourcePath": "data/alice-corpus/examples/hard-fork.fr.md",
    "theme": "Histoire et évolution du protocole"
  },
  {
    "id": "curated-hardware-wallet",
    "conceptId": "hardware-wallet",
    "title": "Le rôle d’un appareil de signature",
    "keywords": [
      "Le rôle d’un appareil de signature",
      "Hardware Wallet",
      "Que protège un hardware wallet ?",
      "wallets",
      "hardware wallet"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn hardware wallet est un appareil de signature qui isole les clés privées de l’ordinateur ou du téléphone utilisé pour préparer les paiements. Il réduit leur exposition aux logiciels malveillants de cet appareil hôte.\n\nExplication\nLe portefeuille sur ordinateur prépare les données ; le hardware wallet affiche les informations qu’il va signer et demande une confirmation. Pour cette vérification, son écran doit servir de référence plutôt que celui du PC ou du téléphone.\n\nL’adresse entière et le montant affichés sur l’appareil doivent être comparés aux informations du destinataire obtenues de manière fiable. Cette étape permet de repérer une substitution par l’ordinateur. L’appareil ne connaît pas l’intention de l’utilisateur et ne peut pas deviner qu’une adresse déjà fournie est frauduleuse.\n\nLimites et confusions\nL’isolation ne rend pas le matériel ou son logiciel infaillible. La sauvegarde reste sensible et doit permettre la récupération si l’appareil est perdu. Un hardware wallet ne protège pas contre un secret volontairement communiqué, une mauvaise destination approuvée ou toutes les formes d’attaque physique. Il constitue une protection particulière dans une procédure plus large.",
    "parentIds": [],
    "relatedIds": [
      "address-spoofing",
      "wallet-recovery-phrase",
      "partially-signed-bitcoin-transaction",
      "secondary-bitcoin-attack-surface",
      "secondary-bitcoin-btcpay-hardware-wallet-integration"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device"
    ],
    "questions": [
      "Que protège un hardware wallet ?"
    ],
    "status": "reviewed",
    "sourceHash": "0243af7ea6252bfe4b8264076ed417062cf4abda121629c0c2bbc410bb1729b3",
    "sourcePath": "data/alice-corpus/examples/hardware-wallet.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-hashrate",
    "conceptId": "hashrate",
    "title": "La puissance de calcul",
    "keywords": [
      "La puissance de calcul",
      "Hashrate",
      "Que mesure le hashrate ?",
      "mining",
      "hashrate"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe hashrate mesure un débit d’essais de hachage par seconde. Il décrit la puissance engagée dans la recherche de preuves de travail par une machine, un groupe ou le réseau.\n\nExplication\nÀ difficulté donnée, davantage d’essais augmente la probabilité de trouver un bloc dans un temps donné. Cela ne garantit pas l’heure du prochain succès. Pour comparer la part d’un mineur, il faut aussi tenir compte de la puissance de ses concurrents.\n\nLe hashrate global n’est pas directement compté par un compteur central. Les estimations utilisent notamment la difficulté et le rythme des blocs observés. Une estimation sur une période courte peut donc fluctuer en partie à cause du hasard.\n\nLimites et confusions\nLe hashrate n’est ni une consommation électrique ni un revenu. Des matériels différents n’utilisent pas la même énergie pour produire le même nombre d’essais. Les coûts et la rentabilité demandent d’autres données. Une variation de prix ne provoque pas non plus une variation mécanique instantanée de la puissance disponible.",
    "parentIds": [],
    "relatedIds": [
      "mining-difficulty",
      "difficulty-adjustment",
      "bitcoin-energy-debate",
      "secondary-bitcoin-mining-shares"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB min101 — Introduction to Bitcoin mining",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Que mesure le hashrate ?"
    ],
    "status": "reviewed",
    "sourceHash": "90094c416047ac38ec2fe342633a8b0502e4f6d69804b7eb1de0959c325e1973",
    "sourcePath": "data/alice-corpus/examples/hashrate.fr.md",
    "theme": "mining"
  },
  {
    "id": "curated-hd-wallet",
    "conceptId": "hd-wallet",
    "title": "Les portefeuilles déterministes",
    "keywords": [
      "Les portefeuilles déterministes",
      "HD Wallet",
      "Comment 1 sauvegarde retrouve-t-elle plusieurs adresses ?",
      "wallets",
      "hd wallet"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn portefeuille hiérarchique déterministe, ou HD, dérive de nombreuses clés depuis une seed. Il peut ainsi créer de nouvelles adresses sans demander une sauvegarde indépendante de chaque clé.\n\nExplication\nL’organisation ressemble à un arbre. Des branches distinguent notamment les comptes et les usages ; des positions identifient les clés successives. Le chemin de dérivation indique où chercher dans cet arbre. Avec les mêmes données de départ et les mêmes règles, le calcul reproduit les mêmes clés.\n\nCette propriété rend les sauvegardes plus pratiques et facilite la séparation entre un outil d’observation et un appareil qui signe. Elle ne signifie pas que toutes les informations du portefeuille sont contenues dans les mots.\n\nLimites et confusions\nLa restauration peut demander la passphrase, les chemins, le type de scripts et, en multisig, la configuration des cosignataires. Les étiquettes et autres données d’usage peuvent nécessiter leur propre sauvegarde. Un portefeuille apparemment vide après restauration ne prouve donc pas immédiatement que les fonds ont disparu ou que la phrase est fausse.",
    "parentIds": [],
    "relatedIds": [
      "derivation-path",
      "wallet-backup",
      "extended-public-key",
      "secondary-bitcoin-extended-private-key"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki"
    ],
    "questions": [
      "Comment 1 sauvegarde retrouve-t-elle plusieurs adresses ?"
    ],
    "status": "reviewed",
    "sourceHash": "afa6257960d282e704101c0e7ed38bd21a843ee5c83eb7b34b9f54a1032a78ac",
    "sourcePath": "data/alice-corpus/examples/hd-wallet.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-hot-wallet",
    "conceptId": "hot-wallet",
    "title": "Le portefeuille connecté",
    "keywords": [
      "Le portefeuille connecté",
      "Hot Wallet",
      "Qu’est-ce qu’un hot wallet ?",
      "wallets",
      "hot wallet"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn hot wallet conserve les clés utilisables sur un appareil connecté à Internet. Il facilite les paiements fréquents, mais expose ces clés aux risques de cet environnement.\n\nExplication\nUn portefeuille mobile ou de bureau peut remplir ce rôle. Sa sécurité dépend notamment du système, des applications installées, de la protection de l’accès et de la gestion des sauvegardes. Un logiciel malveillant ou un faux support peut viser le secret ou manipuler une opération.\n\nLe choix se raisonne selon l’usage, les fonds concernés et les conséquences d’une compromission. Séparer les besoins de dépense quotidienne des besoins de conservation peut limiter l’exposition sans supprimer tous les risques.\n\nLimites et confusions\nUne interface sur ordinateur n’est pas forcément un hot wallet si les signatures sont produites par un appareil séparé. Inversement, un appareil rarement utilisé n’est pas automatiquement un dispositif sûr de conservation hors ligne. « Hot » décrit l’exposition des clés ; « custodial » décrit qui les contrôle. Ces catégories répondent à des questions différentes.",
    "parentIds": [],
    "relatedIds": [
      "cold-storage",
      "hardware-wallet",
      "threat-model",
      "secondary-bitcoin-btcpay-hot-wallet"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Qu’est-ce qu’un hot wallet ?"
    ],
    "status": "reviewed",
    "sourceHash": "49aff3c66b2fa21e82a55447341e49602f3dc32ee0fc240931e7e9387da44be0",
    "sourcePath": "data/alice-corpus/examples/hot-wallet.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-hyperinflation",
    "conceptId": "hyperinflation",
    "title": "L’hyperinflation",
    "keywords": [
      "L’hyperinflation",
      "Hyperinflation",
      "Que décrit une hyperinflation ?",
      "Monnaie et économie",
      "hyperinflation"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’hyperinflation est une hausse extrêmement rapide des prix accompagnée d’une perte de confiance dans la monnaie. Le seuil souvent associé à Cagan est une inflation supérieure à 50 % par mois.\n\nExplication\nÀ un tel rythme, les salaires, l’épargne et les contrats deviennent difficiles à interpréter en pouvoir d’achat réel. Les personnes peuvent chercher à dépenser très vite ou à utiliser d’autres unités, ce qui modifie encore la demande de monnaie.\n\nLe phénomène ne se réduit pas à l’impression de billets. Il se comprend dans un contexte de financement, de production, d’institutions et de confiance. Les analyses économiques débattent du poids et de l’enchaînement de ces mécanismes. Un indicateur mensuel ne doit pas être confondu avec une variation annuelle.\n\nLimites et confusions\nToute inflation élevée n’est pas une hyperinflation selon cette convention. Le seuil est un outil de classification, pas une loi naturelle unique.\n\nL’intérêt pour une autre monnaie dans une crise ne prouve pas que celle-ci supprime tous les risques. Bitcoin reste volatil ; les stablecoins ajoutent un émetteur et un adossement. Décrire ces options n’implique pas de recommander une allocation personnelle ou de garantir la protection d’un revenu.",
    "parentIds": [],
    "relatedIds": [
      "inflation-monetary-perspectives",
      "fiat-money",
      "secondary-economics-currency-crisis",
      "secondary-economics-dollarization",
      "secondary-economics-redenomination"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco204 — Hyperinflation Case Studies",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Que décrit une hyperinflation ?"
    ],
    "status": "reviewed",
    "sourceHash": "bfa544192d8c81493cbec2bdbe9e4f5c0490219a17fe85b1079bded240776928",
    "sourcePath": "data/alice-corpus/examples/hyperinflation.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-inbound-liquidity",
    "conceptId": "inbound-liquidity",
    "title": "La capacité de réception",
    "keywords": [
      "La capacité de réception",
      "Inbound Liquidity",
      "Lightning Inbound Liquidity Market",
      "Pourquoi ne puis-je pas recevoir ce montant ?",
      "Lightning",
      "inbound liquidity"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa liquidité entrante est la capacité de recevoir sur Lightning. Il faut que des fonds situés du côté distant de vos canaux puissent être transférés vers vous.\n\nExplication\nLorsque vous financez seul un nouveau canal, les fonds sont principalement de votre côté. Cela donne de la capacité d’envoi, mais pas automatiquement une capacité équivalente de réception. Après un paiement sortant, une part de la liquidité se trouve chez votre pair et peut permettre une réception ultérieure.\n\nOn peut aussi obtenir de la capacité entrante par un canal financé par un autre participant, un service de liquidité ou certaines opérations de swap. Ces mécanismes ont des frais et des dépendances qu’il faut comprendre. La réception requiert également une route praticable jusqu’à vos canaux.\n\nLimites et confusions\nLa somme théorique des capacités entrantes ne garantit pas qu’un paiement précis passera. La répartition entre canaux et les contraintes sur les routes comptent. Un paiement en plusieurs parties peut aider sans résoudre tous les blocages.\n\nUn service custodial peut gérer tout cela pour l’utilisateur ; cette simplicité ne démontre pas que l’utilisateur détient lui-même les clés. Il faut distinguer la gestion de liquidité de la garde des fonds.",
    "parentIds": [],
    "relatedIds": [
      "lightning-liquidity-path",
      "lightning-service-provider",
      "secondary-lightning-just-in-time-lightning-channel"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB lnp201 — Lightning Network Theory"
    ],
    "questions": [
      "Pourquoi ne puis-je pas recevoir ce montant ?"
    ],
    "status": "reviewed",
    "sourceHash": "14a9ecb40178d46108ac600f56b1ce9bd7c0e3e61e895ca61777fe1dc3b6eb7b",
    "sourcePath": "data/alice-corpus/examples/inbound-liquidity.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-inflation",
    "conceptId": "inflation",
    "title": "Comprendre l’inflation",
    "keywords": [
      "Comprendre l’inflation",
      "inflation des prix",
      "pouvoir d’achat",
      "C’est quoi l’inflation ?",
      "Pourquoi une même somme permet-elle d’acheter moins ?",
      "Quelle différence entre hausse des prix et augmentation de la monnaie ?",
      "economics",
      "inflation"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nDans l’usage courant et statistique, l’inflation désigne une hausse durable et généralisée des prix. Certains auteurs emploient aussi ce mot pour l’expansion monétaire ; il faut préciser ce sens.\n\nExplication\nExemple fictif — si un panier coûte 100 € puis 105 €, son prix a augmenté de 5 %. Avec 100 €, on peut en acheter moins. Un indice d’inflation suit un panier moyen, qui peut différer des dépenses d’une personne.\n\nLa quantité de monnaie et les prix ne sont pas la même mesure. Leur relation dépend notamment de la production, de la demande de monnaie, du crédit et de la circulation. La création monétaire peut contribuer à une hausse des prix sans produire une hausse immédiatement proportionnelle.\n\nLimites et confusions\nL’augmentation du prix d’un seul produit n’établit pas une inflation générale. Une mesure statistique décrit l’évolution d’un panier ; elle ne tranche pas à elle seule les causes ou les jugements sur une politique monétaire. L’offre limitée de Bitcoin ne garantit pas un pouvoir d’achat stable.",
    "parentIds": [],
    "relatedIds": [
      "inflation-monetary-perspectives",
      "money-supply",
      "secondary-economics-cantillon-effect",
      "secondary-economics-monetary-debasement"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://www.ecb.europa.eu/ecb-and-you/explainers/tell-me-more/html/what_is_inflation.en.html",
      "https://mises.org/mises-wire/inflation-and-deflation-austrian-definitions"
    ],
    "questions": [
      "C’est quoi l’inflation ?",
      "Pourquoi une même somme permet-elle d’acheter moins ?",
      "Quelle différence entre hausse des prix et augmentation de la monnaie ?"
    ],
    "status": "reviewed",
    "sourceHash": "872786c86f1b3a6fb6ee79991b841ac74151d4c98e3a047048228adca408f6d5",
    "sourcePath": "data/alice-corpus/examples/inflation.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-inflation-monetary-perspectives",
    "conceptId": "inflation-monetary-perspectives",
    "title": "Création monétaire, inflation et lectures économiques",
    "keywords": [
      "Création monétaire, inflation et lectures économiques",
      "inflation monétaire",
      "effet Cantillon",
      "théorie quantitative",
      "Pourquoi certains parlent-ils d’inflation dès que la quantité de monnaie augmente ?",
      "Qui bénéficie de la création monétaire ?",
      "Créer de la monnaie produit-il forcément une hausse proportionnelle des prix ?",
      "economics",
      "inflation monetary perspectives"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne définition ne démontre pas une cause. La croissance monétaire, les prix et les effets redistributifs doivent être distingués. Les critiques autrichiennes examinent notamment les canaux de création du crédit et les bénéficiaires de la monnaie nouvelle ; ces mécanismes ne donnent pas un résultat identique dans chaque contexte.\n\nExplication\nDans le vocabulaire de certains auteurs autrichiens, « inflation » désigne l’expansion monétaire. Per Bylund rappelle toutefois que la définition de Mises inclut la demande de monnaie et que les usages varient. Cela ne se confond pas avec l’inflation des prix mesurée par un indice.\n\nUne banque commerciale crée généralement un dépôt lorsqu’elle accorde un prêt. Capital, liquidité, financement, réglementation et demande de crédit limitent cette création ; les banques ne prêtent pas simplement un stock fixe de dépôts préexistants.\n\nL’analogie d’un gâteau découpé en davantage de parts illustre des unités supplémentaires face à une quantité de biens inchangée. Elle devient trompeuse si production, dépenses ou demande de monnaie changent. Elle ne permet pas de calculer automatiquement un taux d’inflation.\n\nCantillon décrit une diffusion par des canaux spécifiques qui modifie les dépenses et les prix relatifs. La critique autrichienne met l’accent sur l’avantage potentiel des premiers receveurs et la distorsion des signaux. Les travaux sur les achats d’actifs étudient aussi ces effets, avec des résultats dépendant du patrimoine, de l’emploi et des indicateurs retenus.\n\nLimites et confusions\nDire que des effets redistributifs existent ne prouve pas que toute politique enrichit toujours les mêmes personnes ou accroît tous les indicateurs d’inégalités. L’étude britannique de 2018 citée estime un effet limité sur les mesures relatives usuelles ; elle ne réfute pas tout effet distributif et ne s’étend pas automatiquement à d’autres pays.\n\nLes critiques politiques de l’émission discrétionnaire peuvent être exposées et argumentées. Elles doivent être identifiées comme analyses, sans présenter les objectifs annoncés d’une banque centrale comme une preuve de l’absence de coûts.",
    "parentIds": [
      "inflation"
    ],
    "relatedIds": [
      "money-supply",
      "central-banking"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://mises.org/mises-wire/inflation-and-deflation-austrian-definitions",
      "https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy",
      "https://www.econlib.org/library/NPDBooks/Cantillon/cntNT.html?chapter_num=25",
      "https://www.bankofengland.co.uk/quarterly-bulletin/2012/q3/the-distributional-effects-of-asset-purchases",
      "https://www.bankofengland.co.uk/working-paper/2018/the-distributional-impact-of-monetary-policy-easing-in-the-uk-between-2008-and-2014"
    ],
    "questions": [
      "Pourquoi certains parlent-ils d’inflation dès que la quantité de monnaie augmente ?",
      "Qui bénéficie de la création monétaire ?",
      "Créer de la monnaie produit-il forcément une hausse proportionnelle des prix ?"
    ],
    "status": "reviewed",
    "sourceHash": "6a942aa4bd7dfc425c342c4c2f96a2b3c40693bba213cdae83266fb1d0c3afcc",
    "sourcePath": "data/alice-corpus/examples/inflation-monetary-perspectives.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-initial-block-download",
    "conceptId": "initial-block-download",
    "title": "La synchronisation initiale",
    "keywords": [
      "La synchronisation initiale",
      "Initial Block Download",
      "Pourquoi un nouveau nœud doit-il se synchroniser ?",
      "nodes",
      "initial block download"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa synchronisation initiale permet à un nouveau nœud d’atteindre un état cohérent de la chaîne. Il obtient les données nécessaires et effectue les traitements de validation prévus par sa configuration.\n\nExplication\nLe temps dépend du réseau, du stockage, du processeur, de la mémoire disponible et des réglages. Le nœud doit reconstruire et maintenir les sorties encore dépensables, pas seulement recopier une liste de blocs. Après cette phase, suivre les nouveaux blocs demande généralement moins de travail que traiter tout l’historique.\n\nLes mécanismes AssumeValid et AssumeUTXO répondent à des étapes différentes de ce démarrage. Leur rôle et leurs hypothèses sont expliqués en secondaire, plutôt que regroupés sous une promesse vague de téléchargement accéléré.\n\nLimites et confusions\nRéduire l’espace conservé par élagage ne supprime pas toutes les étapes de synchronisation. Une indication « prêt » ou un pourcentage doit être interprété selon ce qui reste à vérifier. Augmenter la mémoire allouée n’aide que dans les limites de l’appareil et des autres besoins ; aucun délai universel ne peut être annoncé pour tous les nœuds.",
    "parentIds": [],
    "relatedIds": [
      "node-initial-sync",
      "pruned-node",
      "utxo-set"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc202 — Setting up your first Bitcoin node"
    ],
    "questions": [
      "Pourquoi un nouveau nœud doit-il se synchroniser ?"
    ],
    "status": "reviewed",
    "sourceHash": "335e6cac2bbb9e14d2375c3e4ac397a8c3fcd7274dabd6aad2287306cb229c5d",
    "sourcePath": "data/alice-corpus/examples/initial-block-download.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-kyc-data-leakage",
    "conceptId": "kyc-data-leakage",
    "title": "Les données d’identification exposées",
    "keywords": [
      "Les données d’identification exposées",
      "KYC Data Leakage",
      "Pourquoi une fuite de données KYC peut-elle me concerner ?",
      "privacy",
      "kyc data leakage"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes données d’identification collectées par des services peuvent relier une personne à des achats ou à des fonds supposés. Leur fuite crée des risques de confidentialité, d’usurpation et parfois de sécurité physique.\n\nExplication\nCes bases peuvent contenir des noms, des coordonnées, des justificatifs et des historiques. Elles peuvent être exposées par un piratage, une erreur ou un usage abusif. Les plateformes ne sont pas les seules concernées ; les marchands, les livraisons et les outils de support détiennent aussi des informations.\n\nUne adresse Bitcoin associée à une identité peut permettre de relire des transactions passées et d’étudier certains liens futurs. Changer un mot de passe ne retire pas ces données du registre public.\n\nLimites et confusions\nUne fuite ne démontre pas qu’une personne détient encore un montant donné. Il faut éviter d’attribuer un incident physique à une base précise sans preuve. Réduire les données transmises limite certaines expositions, sans supprimer toutes les obligations ou tous les risques. La fiche expose les conséquences documentaires et pratiques ; elle ne formule pas de conseil juridique.",
    "parentIds": [],
    "relatedIds": [
      "physical-security-for-bitcoiners",
      "bitcoin-chain-analysis",
      "non-blockchain-privacy-leaks",
      "secondary-bitcoin-know-your-customer",
      "secondary-opsec-data-breach-monitoring",
      "secondary-privacy-kyc-bitcoin-acquisition"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB Extraction — 2026-05-23",
      "PlanB btc204 — Privacy on Bitcoin"
    ],
    "questions": [
      "Pourquoi une fuite de données KYC peut-elle me concerner ?"
    ],
    "status": "reviewed",
    "sourceHash": "c5c6a5153ae2d8353938b7739fd4e5015e770f5d48c63c0b1ace0e738c40338f",
    "sourcePath": "data/alice-corpus/examples/kyc-data-leakage.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-legacy-address",
    "conceptId": "legacy-address",
    "title": "Comparer les formats d’adresses Bitcoin",
    "keywords": [
      "Comparer les formats d’adresses Bitcoin",
      "formats d’adresses",
      "adresse legacy",
      "P2PKH",
      "P2SH",
      "SegWit",
      "Taproot",
      "Pourquoi les adresses Bitcoin n’ont-elles pas toutes le même début ?",
      "Quelle différence entre anciens formats, SegWit et Taproot ?",
      "Le format d’adresse change-t-il les frais ou la compatibilité ?",
      "transactions",
      "legacy address"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne adresse encode une destination de paiement correspondant à des conditions de dépense. Les formats courants diffèrent selon le type de sortie et le réseau. Ils ne représentent pas des bitcoins différents ni des comptes distincts par nature.\n\nExplication\nSur le réseau principal, les principaux formats utilisés par les wallets se reconnaissent notamment aux débuts suivants.\n\n| Début habituel | Format | Ce qu’il faut comprendre |\n|---|---|---|\n| `1…` | P2PKH, généralement appelé legacy | Format historique associé à une empreinte de clé publique. |\n| `3…` | P2SH | Format associé à une empreinte de script. Il peut servir à plusieurs conditions de dépense, dont du multisig ou du SegWit imbriqué. Une adresse en `3` ne signifie donc pas nécessairement absence de SegWit. |\n| `bc1q…` | SegWit natif de version 0, en Bech32 | Peut correspondre à une empreinte de clé publique ou de script. Il évite l’enveloppe P2SH du SegWit imbriqué. |\n| `bc1p…` pour Taproot | P2TR, version 1 avec programme de 32 octets, en Bech32m | Permet une dépense par clé ou, selon la construction, par un script engagé dans la sortie. |\n\nUn wallet doit prendre en charge le format pour créer correctement un paiement. La prise en charge des formats récents dépend du logiciel et de sa version.\n\nLes frais dépendent du poids de la transaction et du taux choisi. Le type des entrées et des sorties intervient dans ce poids. SegWit peut réduire le poids facturé de certaines dépenses comparables ; Taproot ne garantit pas les frais les plus bas pour toute transaction. Une adresse de réception ne suffit pas à connaître le coût total du paiement.\n\nLimites et confusions\nCes repères concernent les formats courants sur mainnet, pas tous les scripts possibles ni toutes les futures versions de programmes witness. Le début d’une chaîne ne suffit pas à valider une adresse. Il faut contrôler son encodage, sa somme de contrôle, son réseau et la prise en charge de sa destination.\n\nLes réseaux de test utilisent d’autres repères et peuvent partager certains préfixes. Un format ne prouve ni l’identité du destinataire, ni une configuration multisig, ni l’anonymat. Une Lightning Address est un autre mécanisme et n’est pas une adresse on-chain.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-address",
      "segwit-address",
      "taproot",
      "bitcoin-address-scripts",
      "secondary-bitcoin-base58check-encoding"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://developer.bitcoin.org/devguide/transactions.html",
      "https://github.com/bitcoin/bips/blob/master/bip-0013.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki"
    ],
    "questions": [
      "Pourquoi les adresses Bitcoin n’ont-elles pas toutes le même début ?",
      "Quelle différence entre anciens formats, SegWit et Taproot ?",
      "Le format d’adresse change-t-il les frais ou la compatibilité ?"
    ],
    "status": "reviewed",
    "sourceHash": "adc855b4124d65b933555bf0010c6e597273d51f9512e5bcf9a9ca155a38fa84",
    "sourcePath": "data/alice-corpus/examples/legacy-address.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-lightning-address",
    "conceptId": "lightning-address",
    "title": "Les adresses Lightning",
    "keywords": [
      "Les adresses Lightning",
      "Lightning Address",
      "Une adresse Lightning fonctionne-t-elle comme une adresse Bitcoin ?",
      "Lightning",
      "lightning address"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne Lightning Address est un identifiant de paiement qui ressemble à une adresse email. Elle permet à un portefeuille compatible de demander au service associé une facture Lightning.\n\nExplication\nAu lieu de transmettre une longue facture à chaque fois, le destinataire communique un identifiant lisible. L’infrastructure repose généralement sur LNURL-pay. Le wallet contacte le service lié au domaine, obtient les informations de paiement, puis utilise une facture Lightning pour régler.\n\nL’adresse peut être réutilisée, mais les demandes de paiement obtenues sont distinctes. La simplicité vient de cette résolution automatique. Elle ne remplace pas les canaux ni les contraintes de liquidité du réseau Lightning.\n\nLimites et confusions\nUne Lightning Address n’est ni une adresse Bitcoin on-chain ni nécessairement une boîte email. Envoyer des BTC on-chain à cet identifiant n’a pas de sens sans mécanisme de conversion prévu par un service.\n\nLe domaine et le serveur deviennent des dépendances de disponibilité et peuvent observer certaines métadonnées. Le format ne révèle pas le mode de garde du portefeuille derrière l’adresse. Avant de payer, vérifier l’identité du destinataire et les informations présentées par le wallet ; un nom lisible peut lui aussi être trompeur.",
    "parentIds": [],
    "relatedIds": [
      "lnurl",
      "lightning-invoice"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "Une adresse Lightning fonctionne-t-elle comme une adresse Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "76b3dd6d6e5516efc10f429c0b8b5ae131475d6641ee918f0f6d9409d8fab97d",
    "sourcePath": "data/alice-corpus/examples/lightning-address.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-lightning-channel",
    "conceptId": "lightning-channel",
    "title": "Les canaux Lightning",
    "keywords": [
      "Les canaux Lightning",
      "Lightning Channel",
      "Qu’est-ce qu’un canal de paiement ?",
      "Lightning",
      "lightning channel"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn canal Lightning permet à 2 nœuds d’échanger des paiements en mettant à jour la répartition de bitcoins engagés sur la chaîne. Chaque paiement ne demande pas une nouvelle transaction Bitcoin publique.\n\nExplication\nLa capacité totale représente les fonds engagés dans le canal. À un instant donné, une part revient à chaque participant. Un paiement déplace cette répartition et de nouveaux engagements signés remplacent les précédents. À la fermeture, le règlement revient sur la chaîne Bitcoin.\n\nLe montant envoyable n’est pas simplement la capacité totale. Il dépend du côté où se trouvent les fonds, des réserves et des paiements en cours. Une succession de paiements dans les 2 sens peut faire circuler un volume cumulé bien supérieur à la capacité initiale. Un canal sert aussi de segment pour acheminer des paiements vers d’autres nœuds.\n\nLimites et confusions\nUne réserve reste dans la part de son propriétaire mais peut limiter l’envoi tant que le canal est ouvert. Elle n’est pas un montant confisqué. Le libellé « solde » affiché dépend du logiciel.\n\nLes confirmations d’ouverture, les frais et les conditions de fermeture restent importants. Ajouter des fonds par splicing, quand le logiciel le permet, exige une opération coordonnée ; un paiement on-chain quelconque ne suffit pas.",
    "parentIds": [],
    "relatedIds": [
      "lightning-liquidity-path",
      "lightning-splicing",
      "secondary-bitcoin-dual-funded-channels",
      "secondary-lightning-commitment-transaction",
      "secondary-lightning-lightning-private-channel",
      "secondary-lightning-lightning-public-channel",
      "secondary-lightning-revocation-key"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/lightning/bolts/blob/master/02-peer-protocol.md"
    ],
    "questions": [
      "Qu’est-ce qu’un canal de paiement ?"
    ],
    "status": "reviewed",
    "sourceHash": "7c183069fa18a76bc66309b4c399738f6e865110b13d9564e7e4437d2907d4ba",
    "sourcePath": "data/alice-corpus/examples/lightning-channel.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-lightning-fee-policy",
    "conceptId": "lightning-fee-policy",
    "title": "Les frais Lightning",
    "keywords": [
      "Les frais Lightning",
      "Lightning Fee Policy",
      "Pourquoi un paiement Lightning peut-il avoir des frais ?",
      "Lightning",
      "lightning fee policy"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes frais Lightning rémunèrent notamment les intermédiaires qui acheminent un paiement. Une politique de routage combine souvent une part fixe et une part proportionnelle au montant transmis.\n\nExplication\nLa part proportionnelle est couramment exprimée en parties par million, ou ppm. Le portefeuille évalue les frais des chemins possibles et présente un coût ou une limite avant de payer. Chaque canal traversé peut avoir sa propre politique.\n\nPour un opérateur, ces tarifs servent aussi à gérer la rareté de sa liquidité. Des prix élevés peuvent réduire le trafic ; des prix trop faibles peuvent rémunérer insuffisamment les ressources mobilisées. Le revenu de routage doit être comparé aux frais d’ouverture, de fermeture, de rééquilibrage et d’exploitation.\n\nLimites et confusions\nLightning n’impose pas un tarif universel et constant par paiement. Les frais de routage sont distincts des frais d’un service de garde, d’une conversion ou d’une ouverture de canal à la demande.\n\nUn revenu positif en frais ne prouve pas la rentabilité d’un nœud. Une politique qui fonctionne sur un ensemble de canaux peut échouer ailleurs. Alice peut expliquer le calcul et les compromis sans promettre un revenu passif.",
    "parentIds": [],
    "relatedIds": [
      "lightning-routing",
      "lightning-service-provider"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB lnp404 — Navigating Your Node with Terminal"
    ],
    "questions": [
      "Pourquoi un paiement Lightning peut-il avoir des frais ?"
    ],
    "status": "reviewed",
    "sourceHash": "6ee8c65de30186ca63bfc631e884dbb60462d8ba6bf6c5bc91e164693104f13b",
    "sourcePath": "data/alice-corpus/examples/lightning-fee-policy.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-lightning-force-close",
    "conceptId": "lightning-force-close",
    "title": "La fermeture forcée",
    "keywords": [
      "La fermeture forcée",
      "Lightning Force Close",
      "Pourquoi une fermeture peut-elle imposer une attente ?",
      "Lightning",
      "lightning force close"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne fermeture forcée publie sur Bitcoin une transaction d’engagement du canal sans coopération immédiate de l’autre participant. C’est un recours utile, mais ses fonds peuvent rester immobilisés pendant des délais de sécurité.\n\nExplication\nLe canal possède des engagements signés qui permettent de revenir à la chaîne. La publication d’un engagement valide ne suppose pas que le pair accepte une nouvelle fermeture. Après confirmation, certaines sorties peuvent demander une attente et des opérations de récupération supplémentaires.\n\nCe mécanisme sert notamment lorsque le pair ne coopère plus ou dans certaines procédures de restauration. Il faut prévoir les frais on-chain et disposer des données nécessaires. Les détails du délai et des dépenses dépendent du canal et du logiciel.\n\nLimites et confusions\nForcer la fermeture ne signifie ni récupérer instantanément tous les fonds ni perdre automatiquement leur propriété. Il faut distinguer la transaction publiée, ses confirmations et la disponibilité finale des sorties.\n\nPublier un ancien état révoqué peut être dangereux et exposer à une pénalité. Une copie ancienne de la base de données ne doit donc pas être relancée comme si elle était à jour. Une watchtower surveille certaines triches, mais ne remplace pas une sauvegarde ni toutes les étapes de récupération.",
    "parentIds": [],
    "relatedIds": [
      "lightning-node-backup",
      "watchtower",
      "secondary-lightning-commitment-transaction"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB lnp202 — Set up Your First Lightning Node"
    ],
    "questions": [
      "Pourquoi une fermeture peut-elle imposer une attente ?"
    ],
    "status": "reviewed",
    "sourceHash": "aee6904f492856ebc2127b2d6603ec4c20642aa20c175bfb0bd31a020cea41c8",
    "sourcePath": "data/alice-corpus/examples/lightning-force-close.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-lightning-invoice",
    "conceptId": "lightning-invoice",
    "title": "Les factures Lightning",
    "keywords": [
      "Les factures Lightning",
      "Lightning Invoice",
      "Pourquoi une facture Lightning peut-elle expirer ?",
      "Lightning",
      "lightning invoice"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne facture Lightning est une demande de paiement lisible par un portefeuille compatible. Elle fournit les informations nécessaires pour payer, avec notamment une destination, une échéance et parfois un montant fixé.\n\nExplication\nDans l’usage classique, le destinataire génère une facture BOLT11 et la transmet sous forme de texte ou de QR code. Le portefeuille du payeur la décode pour présenter les informations avant confirmation. La facture peut demander un montant précis ou laisser le payeur en choisir un.\n\nL’échéance évite qu’une ancienne demande reste utilisée indéfiniment. Des informations de routage aident à atteindre le destinataire. La facture contient aussi des éléments cryptographiques employés par le mécanisme de règlement. Elle décrit une demande ; elle ne prouve pas à elle seule que le paiement a eu lieu.\n\nLimites et confusions\nUne facture Lightning n’est pas une adresse Bitcoin on-chain. Un QR code peut contenir différents formats ; son apparence ne suffit pas à savoir comment payer.\n\nPour une nouvelle demande, il est préférable d’obtenir une facture fraîche plutôt que de supposer qu’une facture déjà réglée sera réutilisable. Une offre BOLT12 ou une Lightning Address peut rester stable tout en servant à obtenir de nouvelles factures.",
    "parentIds": [],
    "relatedIds": [
      "bolt12-offers",
      "lightning-address"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB lnp201 — Lightning Network Theory"
    ],
    "questions": [
      "Pourquoi une facture Lightning peut-elle expirer ?"
    ],
    "status": "reviewed",
    "sourceHash": "3d68be6b16dbab7ebb1a638617e435e28d41b099adab1e9ded7669017e917f68",
    "sourcePath": "data/alice-corpus/examples/lightning-invoice.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-lightning-liquidity",
    "conceptId": "lightning-liquidity",
    "title": "La liquidité d’un canal",
    "keywords": [
      "La liquidité d’un canal",
      "Lightning Liquidity",
      "Pourquoi avoir un solde ne suffit-il pas toujours pour payer ou recevoir ?",
      "Lightning",
      "lightning liquidity"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa liquidité Lightning est la capacité effective d’envoyer ou de recevoir. Elle dépend de la répartition des fonds dans les canaux et de la présence d’un chemin utilisable jusqu’au destinataire.\n\nExplication\nUne capacité totale importante ne suffit pas. Pour envoyer, il faut des fonds utilisables du côté local ; pour recevoir, des fonds doivent pouvoir venir du côté distant. Un paiement modifie cette répartition.\n\nLe routage ajoute une autre condition. Chaque segment du chemin doit laisser passer le montant demandé, dans le bon sens. Le portefeuille peut chercher une autre route ou diviser un paiement si les logiciels le permettent. Des canaux entrants, des swaps ou des rééquilibrages peuvent aider à gérer ces contraintes, avec leurs propres coûts et conditions.\n\nLimites et confusions\nLa part qui vous revient dans un canal, le montant envoyable et le solde affiché par un wallet ne sont pas forcément le même indicateur. Des réserves et des paiements en cours peuvent réduire la disponibilité immédiate sans retirer la propriété de ces fonds.\n\nDans un portefeuille custodial, l’opérateur masque souvent cette gestion. L’utilisateur voit alors une créance sur le service, ce qui change le modèle de garde.",
    "parentIds": [],
    "relatedIds": [
      "lightning-liquidity-path",
      "inbound-liquidity",
      "outbound-liquidity",
      "lightning-splicing",
      "secondary-bitcoin-dual-funded-channels",
      "secondary-lightning-submarine-swap"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB lnp201 — Lightning Network Theory"
    ],
    "questions": [
      "Pourquoi avoir un solde ne suffit-il pas toujours pour payer ou recevoir ?"
    ],
    "status": "reviewed",
    "sourceHash": "331f236fbfc37343003750139f25851264fe5bca6b5f7800c30b547777eb30d7",
    "sourcePath": "data/alice-corpus/examples/lightning-liquidity.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-lightning-liquidity-path",
    "conceptId": "lightning-liquidity-path",
    "title": "Liquidité et chemins de paiement Lightning",
    "keywords": [
      "Liquidité et chemins de paiement Lightning",
      "liquidité entrante",
      "liquidité sortante",
      "route",
      "Pourquoi un paiement échoue-t-il alors que j’ai assez de sats ?",
      "Pourquoi la capacité totale ne suffit-elle pas ?",
      "lightning",
      "lightning liquidity path"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn paiement exige de la liquidité utilisable dans le bon sens, sur 1 ou plusieurs chemins selon le mode de paiement. Un solde total suffisant ne garantit pas que ce chemin existe.\n\nExplication\nPour envoyer, des fonds doivent pouvoir partir de ton côté. Pour recevoir, le pair qui partage un canal avec le portefeuille doit pouvoir transférer des fonds de son côté vers ce portefeuille. Cette possibilité constitue la liquidité entrante. La part détenue par le pair ne correspond pas nécessairement au montant entièrement recevable, car les réserves et limites du canal interviennent aussi. Chaque étape ajoute ses propres contraintes, dont les frais et les limites acceptées. Les informations publiques du réseau ne révèlent pas tous les soldes exacts des canaux.\n\nIl faut distinguer le montant total du canal, la part qui revient à chaque participant et le montant actuellement envoyable. La réserve du canal impose de conserver un minimum de sa part dans le canal, pour garder des fonds exposés à une pénalité en cas de publication d’un ancien état révoqué. Elle peut donc réduire le montant envoyable sans retirer ces fonds de la part du participant. Les paiements en cours, les limites de HTLC et certaines provisions pour frais peuvent également intervenir.\n\nCore Lightning fournit des indicateurs séparés. `total_msat` représente le total du canal ; `to_us_msat` représente la part qui nous revient ; `spendable_msat` estime le montant envoyable. Ce dernier reste une estimation, notamment parce que les frais et l’état des paiements peuvent changer. Une interface peut afficher un solde brut, un montant disponible ou plusieurs indicateurs. Il ne faut pas déduire une réserve une seconde fois si elle est déjà prise en compte dans le montant affiché.\n\nLimites et confusions\nUn échec ne prouve pas une perte de fonds ni un manque de liquidité unique. Il peut aussi venir d’une facture expirée ou d’un participant indisponible. Un paiement peut aussi rester en attente, avec des fonds temporairement engagés dans des HTLC. Ils peuvent être libérés après un échec ou récupérés par la procédure prévue après expiration, éventuellement avec une fermeture et un règlement on-chain. La durée dépend des échéances et de l’état du canal ; attendre ne signifie pas que les fonds sont perdus. Le diagnostic doit partir des informations réellement connues.\n\nLa réserve n’est pas une confiscation ni un montant à transférer au partenaire. À la fermeture, le montant récupéré dépend notamment du dernier état valide, des paiements en cours, des frais et du type de fermeture ; les délais éventuels sont une autre question. Le montant envoyable par Lightning et le montant récupérable on-chain ne sont donc pas des indicateurs interchangeables. Cette fiche ne présume pas ce qu’un wallet particulier affiche et ne présente pas un pourcentage de réserve comme une règle universelle.",
    "parentIds": [
      "lightning-network"
    ],
    "relatedIds": [
      "lightning-splicing"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://github.com/lightning/bolts/blob/master/02-peer-protocol.md",
      "https://github.com/lightning/bolts/blob/master/07-routing-gossip.md",
      "https://docs.corelightning.org/reference/listpeerchannels",
      "https://docs.lightning.engineering/the-lightning-network/multihop-payments/hash-time-lock-contract-htlc"
    ],
    "questions": [
      "Pourquoi un paiement échoue-t-il alors que j’ai assez de sats ?",
      "Pourquoi la capacité totale ne suffit-elle pas ?"
    ],
    "status": "reviewed",
    "sourceHash": "1330ba6957b3265ca92ae847b6e30f4e57f4dcfcb4afcca2f635d0189df5c2cc",
    "sourcePath": "data/alice-corpus/examples/lightning-liquidity-path.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-lightning-network",
    "conceptId": "lightning-network",
    "title": "Comprendre Lightning",
    "keywords": [
      "Comprendre Lightning",
      "Lightning",
      "réseau Lightning",
      "Pourquoi utiliser Lightning plutôt que la couche de base ?",
      "Faut-il un canal direct avec chaque destinataire ?",
      "lightning",
      "lightning network"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLightning est un réseau de canaux de paiement construit au-dessus de Bitcoin. Des paiements peuvent y circuler sans inscrire chacun d’eux dans un nouveau bloc. Ils peuvent ainsi se régler en quelques secondes avec de faibles frais, ce qui est utile pour les paiements fréquents ou de petit montant.\n\nExplication\nLes participants mettent à jour leurs engagements dans les canaux. Un paiement peut passer par plusieurs intermédiaires, sur 1 ou plusieurs chemins appropriés. Un canal direct avec chaque destinataire n’est donc pas nécessaire. La chaîne Bitcoin reste utilisée notamment pour établir ou régler les canaux.\n\nLimites et confusions\nLa rapidité et les frais dépendent de la situation. La disponibilité, la liquidité et le modèle de garde du service comptent. Lightning n’offre pas une capacité illimitée ni une réception garantie.\n\nEn garde personnelle, les sauvegardes nécessaires dépendent du logiciel. La phrase de récupération seule ne suffit pas toujours à récupérer les fonds de canaux ouverts ; LND et Core Lightning prévoient des données et procédures spécifiques. Réutiliser un ancien état puis publier une transaction révoquée peut entraîner une pénalité.\n\nUne fermeture forcée peut rendre certains fonds indisponibles pendant un délai exprimé en blocs, éventuellement plusieurs jours. Ce délai dépend du canal, de la sortie et du type de fermeture ; il ne s’applique pas uniformément à tous les fonds.",
    "parentIds": [],
    "relatedIds": [
      "lightning-liquidity-path",
      "lightning-splicing",
      "secondary-lightning-bolts",
      "secondary-lightning-lightning-node-implementation",
      "secondary-lightning-nostr-wallet-connect",
      "secondary-tx-model-transaction-malleability"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://github.com/lightning/bolts/blob/master/02-peer-protocol.md",
      "https://github.com/lightning/bolts/blob/master/04-onion-routing.md",
      "https://github.com/lnbook/lnbook/blob/develop/01_introduction.asciidoc",
      "https://github.com/lightningnetwork/lnd/blob/master/docs/recovery.md",
      "https://docs.corelightning.org/docs/recovery",
      "https://github.com/lightning/bolts/blob/master/03-transactions.md"
    ],
    "questions": [
      "Pourquoi utiliser Lightning plutôt que la couche de base ?",
      "Faut-il un canal direct avec chaque destinataire ?"
    ],
    "status": "reviewed",
    "sourceHash": "4190d41c7450694ebd16cf9ca21cda44c909635c0c262e967a842208c1c01ecc",
    "sourcePath": "data/alice-corpus/examples/lightning-network.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-lightning-node-backup",
    "conceptId": "lightning-node-backup",
    "title": "Les sauvegardes Lightning",
    "keywords": [
      "Les sauvegardes Lightning",
      "Lightning Node Backup",
      "Pourquoi sauvegarder Lightning demande-t-il une attention particulière ?",
      "Lightning",
      "lightning node backup"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nSauvegarder Lightning demande de tenir compte de l’état vivant des canaux, pas seulement des clés. La procédure dépend du logiciel ; une recette prévue pour LND ne s’applique pas automatiquement aux autres nœuds.\n\nExplication\nPour LND, la seed seule ne suffit pas à restaurer les canaux ouverts. La sauvegarde statique des canaux, ou SCB, aide à retrouver les pairs et à demander un règlement des canaux dans la procédure de récupération. Elle ne remet pas le nœud en fonctionnement avec tous ses anciens canaux intacts.\n\nLa base channel.db contient un état dynamique. Reprendre une vieille copie peut conduire à utiliser un engagement périmé et mettre les fonds en danger. Il faut préparer une sauvegarde cohérente avec la documentation de la version employée avant qu’une panne survienne.\n\nLimites et confusions\nUne sauvegarde on-chain et une sauvegarde Lightning ne couvrent pas le même besoin. Une watchtower ne remplace pas les données de récupération.\n\nAlice doit demander quel logiciel est utilisé avant de proposer une procédure précise. Elle ne doit jamais demander à l’utilisateur de publier sa seed, ses clés ou ses fichiers secrets dans la conversation. Une explication générale ne constitue pas un test de restauration effectivement réussi.",
    "parentIds": [],
    "relatedIds": [
      "lightning-force-close",
      "watchtower",
      "secondary-lightning-lightning-node-implementation",
      "secondary-lightning-lightning-node-recovery-tradeoff",
      "secondary-lightning-lnd-aezeed",
      "secondary-lightning-static-channel-backup"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://docs.lightning.engineering/lightning-network-tools/lnd/recovery-planning-for-failure"
    ],
    "questions": [
      "Pourquoi sauvegarder Lightning demande-t-il une attention particulière ?"
    ],
    "status": "reviewed",
    "sourceHash": "37878c41707f815dd86e3b5b25d4701aeec956c9d7c4325d7102fa3c315df114",
    "sourcePath": "data/alice-corpus/examples/lightning-node-backup.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-lightning-node-online-status",
    "conceptId": "lightning-node-online-status",
    "title": "La disponibilité du nœud",
    "keywords": [
      "La disponibilité du nœud",
      "Lightning Node Online Status",
      "Dois-je être en ligne pour utiliser Lightning ?",
      "Lightning",
      "lightning node online status"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn nœud Lightning doit être joignable pour participer normalement aux paiements et au routage. Sa disponibilité compte aussi pour surveiller les événements qui concernent ses canaux.\n\nExplication\nUn opérateur de routage fournit un service aux autres participants. Les interruptions rendent ses chemins moins fiables et peuvent provoquer des échecs ou des tentatives supplémentaires. Le suivi du processus, de la connexion et de la synchronisation aide à distinguer un nœud allumé d’un nœud réellement opérationnel.\n\nPour un utilisateur mobile, une partie de cette disponibilité peut être organisée par l’architecture du wallet ou par un fournisseur. Il faut comprendre qui reste connecté et quelles informations ou fonctions lui sont confiées.\n\nLimites et confusions\nÊtre brièvement hors ligne ne signifie pas que tous les fonds disparaissent. Les conséquences dépendent des paiements en cours, des délais du canal et des protections disponibles. Une indisponibilité prolongée peut cependant empêcher d’agir dans une fenêtre importante.\n\nUne watchtower couvre certaines tentatives de triche lors du règlement ; elle n’effectue pas tout le travail du nœud. De même, un LSP peut améliorer l’accès aux paiements sans supprimer toutes les dépendances réseau.",
    "parentIds": [],
    "relatedIds": [
      "watchtower",
      "lightning-service-provider",
      "secondary-bitcoin-lightning-offline-receiving-problem",
      "secondary-lightning-lightning-remote-wallet-connection",
      "secondary-lightning-macaroon"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB lnp404 — Navigating Your Node with Terminal"
    ],
    "questions": [
      "Dois-je être en ligne pour utiliser Lightning ?"
    ],
    "status": "reviewed",
    "sourceHash": "5635aee8c477aa2bab141b6f4f245592af03ce764bd450813f636ae3af901dd2",
    "sourcePath": "data/alice-corpus/examples/lightning-node-online-status.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-lightning-privacy-tradeoff",
    "conceptId": "lightning-privacy-tradeoff",
    "title": "La confidentialité sur Lightning",
    "keywords": [
      "La confidentialité sur Lightning",
      "Lightning Privacy Tradeoff",
      "Quelles informations un paiement Lightning peut-il révéler ?",
      "Lightning",
      "lightning privacy tradeoff"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLightning réduit la publication de chaque paiement sur la chaîne, mais ne garantit pas l’anonymat. Les informations visibles dépendent du routage, du wallet et des services utilisés.\n\nExplication\nLe routage onion limite ce que chaque intermédiaire apprend sur le trajet. D’autres informations peuvent néanmoins circuler, notamment des montants, des horaires ou des besoins de liquidité. Un fournisseur de services, un nœud hébergé ou une infrastructure de factures peut observer des éléments qui resteraient locaux avec une autre architecture.\n\nIl faut analyser qui voit quoi. Détenir soi-même les clés répond à la question de la garde ; cela ne répond pas à toutes les questions de confidentialité. La protection contre un pair curieux peut également différer de celle contre un opérateur observant plusieurs endroits du parcours.\n\nLimites et confusions\nNe pas attribuer à tous les fournisseurs la même visibilité sans examiner leur fonctionnement. Le simple mot « cloud » ne prouve pas que le fournisseur voit chaque destination ; inversement, « non custodial » ne prouve pas qu’il ne voit rien.\n\nPour une réponse débutante, expliquer les acteurs et les données exposées. Les garanties détaillées doivent être rattachées à une implémentation et à sa version, pas généralisées à tout Lightning.",
    "parentIds": [],
    "relatedIds": [
      "lightning-liquidity-path",
      "lightning-service-provider",
      "secondary-bitcoin-onion-messaging",
      "secondary-bitcoin-privacy-by-omission",
      "secondary-lightning-blinded-paths",
      "secondary-lightning-lightning-gossip-protocol",
      "secondary-lightning-lightning-private-channel",
      "secondary-lightning-onion-routing"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB dev303 — Learning Rust with Bitcoin"
    ],
    "questions": [
      "Quelles informations un paiement Lightning peut-il révéler ?"
    ],
    "status": "reviewed",
    "sourceHash": "b16fee13a8927844c7a1da24a55ea3a14dfb3a547dd2eb80b97e4382b148b107",
    "sourcePath": "data/alice-corpus/examples/lightning-privacy-tradeoff.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-lightning-routing",
    "conceptId": "lightning-routing",
    "title": "Le routage d’un paiement",
    "keywords": [
      "Le routage d’un paiement",
      "Lightning Routing",
      "Comment un paiement traverse-t-il plusieurs canaux ?",
      "Lightning",
      "lightning routing"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe routage Lightning cherche 1 ou plusieurs chemins de canaux entre le payeur et le destinataire. Ils n’ont pas besoin de posséder un canal direct entre eux.\n\nExplication\nLes nœuds disposent d’informations sur une partie de la topologie et sur les politiques de frais. Le wallet cherche un trajet compatible avec le montant et ses contraintes, puis peut réessayer si la route échoue.\n\nLa capacité annoncée d’un canal ne révèle pas toute sa liquidité utilisable dans chaque sens. Un chemin qui paraît possible peut donc ne pas permettre le paiement au moment de l’essai. Les paiements en plusieurs parties répartissent le montant entre des chemins pour mieux utiliser une liquidité fragmentée. Ils demandent aussi une coordination à destination.\n\nLimites et confusions\nAvoir un canal ouvert ne garantit pas de pouvoir payer tous les destinataires à tout moment. Des nœuds indisponibles, des politiques de frais ou une liquidité mal répartie peuvent empêcher la route.\n\nLe routage onion limite les informations visibles par chaque intermédiaire, mais ne rend pas toutes les métadonnées invisibles. Pour expliquer un échec, distinguer les fonds disponibles au départ, la réception à destination et les contraintes des chemins intermédiaires.",
    "parentIds": [],
    "relatedIds": [
      "lightning-liquidity-path",
      "multi-path-payment",
      "secondary-lightning-lightning-gossip-protocol",
      "secondary-lightning-lightning-public-channel",
      "secondary-lightning-onion-routing"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB lnp201 — Lightning Network Theory"
    ],
    "questions": [
      "Comment un paiement traverse-t-il plusieurs canaux ?"
    ],
    "status": "reviewed",
    "sourceHash": "49aa780b7a221b019beccdd27c06662a6b2b09d83945a01a756d8bc98c3260a7",
    "sourcePath": "data/alice-corpus/examples/lightning-routing.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-lightning-service-provider",
    "conceptId": "lightning-service-provider",
    "title": "Les fournisseurs de services Lightning",
    "keywords": [
      "Les fournisseurs de services Lightning",
      "Lightning Service Provider",
      "Lightning Inbound Liquidity Market",
      "Que fait un LSP ?",
      "Lightning",
      "lightning service provider"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn Lightning Service Provider, ou LSP, aide un portefeuille à obtenir des canaux, de la liquidité et une meilleure disponibilité. Il peut simplifier l’usage sans nécessairement détenir les clés de l’utilisateur.\n\nExplication\nUn nouveau wallet peut manquer de capacité de réception ou avoir du mal à rester disponible. Selon son architecture, le LSP facilite l’ouverture de canaux, apporte de la liquidité ou maintient une connexion adaptée. Certaines fonctions peuvent être déclenchées au moment du premier paiement.\n\nCette organisation évite à l’utilisateur de gérer chaque détail opérationnel. Elle introduit cependant un service avec des tarifs, des contraintes et des informations visibles. L’utilisateur doit savoir ce qui se passe si ce prestataire devient indisponible.\n\nLimites et confusions\nLSP et portefeuille custodial ne sont pas des synonymes. Le critère principal reste le contrôle des clés et la possibilité de récupérer les fonds sans dépendre d’une décision discrétionnaire du fournisseur. Cette récupération peut elle-même avoir des délais et des coûts.\n\n« Non custodial » ne signifie pas absence de dépendance ni confidentialité totale. Le fournisseur peut observer des montants, des horaires ou des besoins de liquidité selon le fonctionnement du wallet.",
    "parentIds": [],
    "relatedIds": [
      "lightning-privacy-tradeoff",
      "inbound-liquidity",
      "secondary-bitcoin-lightning-offline-receiving-problem",
      "secondary-lightning-just-in-time-lightning-channel",
      "secondary-lightning-lightning-node-recovery-tradeoff"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "Que fait un LSP ?"
    ],
    "status": "reviewed",
    "sourceHash": "6064771232a720f51073e35da167684f9652b2731577e726ce35755573b787fc",
    "sourcePath": "data/alice-corpus/examples/lightning-service-provider.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-lightning-splicing",
    "conceptId": "lightning-splicing",
    "title": "Modifier les fonds d’un canal avec le splicing",
    "keywords": [
      "Modifier les fonds d’un canal avec le splicing",
      "splicing",
      "splice-in",
      "splice-out",
      "Comment augmenter la capacité d’un canal sans le fermer complètement ?",
      "Quelle différence entre splice-in et splice-out ?",
      "Recevoir un paiement Bitcoin suffit-il à alimenter un canal ?",
      "Le splicing résout-il tous les problèmes de liquidité ?",
      "lightning",
      "lightning splicing"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe splicing modifie les fonds d’un canal Lightning existant à l’aide d’une transaction Bitcoin coordonnée avec son partenaire. Un splice-in ajoute des fonds ; un splice-out en retire vers une sortie on-chain. Les logiciels des participants doivent prendre en charge une version compatible du mécanisme.\n\nExplication\nUne transaction de splicing remplace le financement du canal. Elle permet de modifier sa capacité sans effectuer une fermeture complète suivie d’une nouvelle ouverture. Elle exige des frais on-chain et une coordination entre les participants.\n\nLorsque tu apportes tes propres fonds par un splice-in, tu augmentes ta liquidité locale, donc ta capacité à envoyer une fois ces fonds utilisables. Cela n’ajoute pas automatiquement des fonds du côté de ton partenaire et ne garantit pas que tu pourras recevoir davantage.\n\nUn paiement Bitcoin reçu dans ton portefeuille on-chain peut fournir des fonds pour un splice-in. Sa simple réception ne modifie pas automatiquement le canal. Certains portefeuilles peuvent organiser cette opération pour l’utilisateur ; ce comportement dépend du produit.\n\nUn splice-out permet de transférer une partie des fonds du canal vers une adresse Bitcoin. Il réduit les fonds laissés dans le canal et peut modifier sa capacité utile.\n\nLimites et confusions\n- La capacité totale et la liquidité disponible dans chaque sens restent 2 notions différentes.\n- Le splicing ne garantit pas la liquidité des autres canaux d’un chemin de paiement.\n- Les frais, les confirmations et le comportement pendant la transition dépendent du logiciel et de la configuration. La documentation Eclair 0.14.0 décrit l’utilisation des fonds ajoutés après confirmation. La documentation Core Lightning décrit aussi des limites de solde utilisable pendant l’attente ; il ne faut pas promettre un montant immédiatement disponible partout.\n- Les anciens prototypes et les versions normalisées ne sont pas nécessairement compatibles. Vérifier les versions des 2 participants.\n- Cette fiche explique le mécanisme. Elle ne constate pas son activation dans Alice ni dans le nœud personnel de l’utilisateur.",
    "parentIds": [
      "lightning-channel",
      "lightning-liquidity",
      "lightning-network"
    ],
    "relatedIds": [
      "lightning-liquidity-path"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://docs.corelightning.org/reference/splice_init",
      "https://github.com/ACINQ/eclair/blob/master/docs/release-notes/eclair-v0.14.0.md",
      "https://docs.corelightning.org/reference/lightningd-config"
    ],
    "questions": [
      "Comment augmenter la capacité d’un canal sans le fermer complètement ?",
      "Quelle différence entre splice-in et splice-out ?",
      "Recevoir un paiement Bitcoin suffit-il à alimenter un canal ?",
      "Le splicing résout-il tous les problèmes de liquidité ?"
    ],
    "status": "reviewed",
    "sourceHash": "d54ceddc851dd556cd0bf50ac0df844b4543d7f8e0f0280d8b7dfab9e0176911",
    "sourcePath": "data/alice-corpus/examples/lightning-splicing.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-liquid-network",
    "conceptId": "liquid-network",
    "title": "Comprendre Liquid",
    "keywords": [
      "Comprendre Liquid",
      "Liquid Network",
      "Quelles différences entre Liquid et Bitcoin ?",
      "Ark et autres couches",
      "liquid network"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLiquid est une sidechain fédérée liée à Bitcoin. Elle utilise notamment L-BTC pour représenter des bitcoins et permet d’autres actifs, avec une sécurité et un mécanisme de sortie différents de Bitcoin on-chain.\n\nExplication\nLes transactions sont traitées par l’architecture de la sidechain et sa fédération. Les fonctions de confidentialité peuvent masquer certains montants et types d’actifs ; elles ne rendent pas toutes les informations invisibles. La reconversion de L-BTC dépend du mécanisme de peg et de ses acteurs.\n\nLe rapport de Blockstream publié sur le blog Liquid le 2026-09-25 décrit un incident du 2026-09-06. Une faille d’Elements a permis de créer environ 4 000 L-BTC sans contrepartie, puis de retirer les BTC correspondants. Le bilan rapporte 3 400 BTC rendus et environ 602 BTC restant à récupérer.\n\nLimites et confusions\nCet incident n’est pas une création de BTC sur Bitcoin. Il illustre un risque du logiciel de sidechain et de sa conversion. Le bilan émane de l’organisation impliquée.\n\nLes chiffres décrivent le rapport daté, pas un état en temps réel. La disponibilité actuelle des sorties, le solde récupéré et les conditions de conversion doivent être revérifiés avant une réponse opérationnelle. Le correctif logiciel et le rétablissement des retraits sont des questions distinctes.",
    "parentIds": [],
    "relatedIds": [
      "sidechains",
      "counterparty-risk",
      "secondary-bitcoin-confidential-address",
      "secondary-bitcoin-confidential-transactions",
      "secondary-bitcoin-cryptographic-commitment",
      "secondary-bitcoin-pedersen-commitment"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://blog.liquid.net/liquid-network-security-incident-assessment/"
    ],
    "questions": [
      "Quelles différences entre Liquid et Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "5d6cd7991047d0205a586eb76e8ee32acc3cc928c0b141329e25538224ef2f2d",
    "sourcePath": "data/alice-corpus/examples/liquid-network.fr.md",
    "theme": "Ark et autres couches"
  },
  {
    "id": "curated-lnurl",
    "conceptId": "lnurl",
    "title": "Les liens LNURL",
    "keywords": [
      "Les liens LNURL",
      "LNURL",
      "À quoi sert LNURL ?",
      "Lightning",
      "lnurl"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLNURL regroupe des protocoles qui facilitent certaines interactions Lightning à partir d’un lien ou d’un QR code. Selon le type de demande, il peut servir à payer, retirer des sats ou s’authentifier.\n\nExplication\nLNURL-pay permet à un wallet de demander une facture à une destination réutilisable. LNURL-withdraw permet de présenter sa propre facture à un service qui propose un retrait. LNURL-auth sert à une authentification fondée sur des clés. Ces usages sont distincts même s’ils se présentent tous sous une forme facile à scanner.\n\nLa communication avec un service web apporte l’automatisation qui manquerait à une facture copiée manuellement. Elle s’ajoute au réseau Lightning plutôt que de remplacer son mécanisme de paiement.\n\nLimites et confusions\nUn QR code LNURL n’est pas automatiquement une demande de paiement. Le portefeuille doit indiquer l’action demandée avant que l’utilisateur l’autorise. Scanner un code de retrait ne doit pas être interprété comme payer son émetteur.\n\nLa disponibilité du serveur et la confidentialité de l’interaction comptent. LNURL ne prouve ni la solvabilité du service ni le mode de garde des fonds. Le soutien de chaque variante dépend également du portefeuille utilisé.",
    "parentIds": [],
    "relatedIds": [
      "lightning-address",
      "lightning-invoice",
      "secondary-bitcoin-lnurl-auth",
      "secondary-bitcoin-wallet-as-identity"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB lnp201 — Lightning Network Theory"
    ],
    "questions": [
      "À quoi sert LNURL ?"
    ],
    "status": "reviewed",
    "sourceHash": "ebf08bcc8f5c6f482ed7fdf399079ffbe2378e7d18d2a7f613fff81eac673ffd",
    "sourcePath": "data/alice-corpus/examples/lnurl.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-lost-bitcoins",
    "conceptId": "lost-bitcoins",
    "title": "Les bitcoins perdus",
    "keywords": [
      "Les bitcoins perdus",
      "Lost Bitcoins",
      "Que deviennent les bitcoins dont les clés sont perdues ?",
      "fundamentals",
      "lost bitcoins"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nDes bitcoins sont considérés comme perdus lorsque personne ne dispose plus des moyens nécessaires pour les dépenser. Ils ne sont pas automatiquement redistribués et ne modifient pas le calendrier d’émission.\n\nExplication\nLes bitcoins restent décrits dans le registre, mais leurs conditions de dépense ne peuvent plus être satisfaites par leur détenteur. Cela peut résulter de la perte des clés et de toutes leurs sauvegardes, ou d’un verrouillage rendant la dépense impossible.\n\nPerdre un téléphone ou un appareil de signature ne signifie donc pas nécessairement perdre ses fonds. Une sauvegarde compatible, complète et accessible peut permettre de retrouver les clés. La sauvegarde doit aussi tenir compte d’une éventuelle passphrase et des informations nécessaires au portefeuille.\n\nLimites et confusions\nUne adresse inactive depuis longtemps n’est pas une preuve de perte. Elle peut appartenir à quelqu’un qui conserve volontairement ses bitcoins. Le total perdu ne peut donc pas être mesuré précisément à partir de l’inactivité. Il faut distinguer perte d’un appareil, perte d’une copie de clé et impossibilité définitive de satisfaire les conditions de dépense.",
    "parentIds": [],
    "relatedIds": [
      "wallet-backup",
      "wallet-backup-test",
      "bitcoin-inheritance-plan",
      "secondary-bitcoin-dormant-bitcoin-address"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Que deviennent les bitcoins dont les clés sont perdues ?"
    ],
    "status": "reviewed",
    "sourceHash": "ab861b204cd5e5395ec0ddf78c20ccb6bb083c582d54e07de6ca8c96daff5f42",
    "sourcePath": "data/alice-corpus/examples/lost-bitcoins.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-malware",
    "conceptId": "malware",
    "title": "Les logiciels malveillants",
    "keywords": [
      "Les logiciels malveillants",
      "Malware",
      "Comment un appareil infecté menace-t-il mes clés ?",
      "security",
      "malware"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn logiciel malveillant peut voler des données, modifier ce qui est affiché ou contrôler un appareil. Dans un usage Bitcoin, il peut viser les clés, le presse-papiers ou les informations d’un paiement.\n\nExplication\nL’infection peut venir d’un téléchargement, d’une pièce jointe ou de l’exploitation d’une faille. Une attaque ne cherche pas forcément à casser la cryptographie. Remplacer une adresse copiée, lire un secret stocké ou convaincre l’utilisateur de signer peut suffire.\n\nL’isolation des clés dans un appareil dédié réduit certains risques, à condition de vérifier les informations sur cet appareil. L’origine des logiciels, les mises à jour et la gestion des secrets participent aussi à la protection.\n\nLimites et confusions\nUn antivirus ou un scan sans alerte ne prouve pas l’absence de compromission. Une sauvegarde copiée sur un appareil infecté peut devenir une nouvelle exposition. Le simple fait de déconnecter l’appareil ne garantit pas que les secrets n’ont pas déjà été transmis. L’évaluation dépend des données accessibles et des actions effectivement possibles pour l’attaquant.",
    "parentIds": [],
    "relatedIds": [
      "address-spoofing",
      "hardware-wallet",
      "software-updates",
      "secondary-privacy-browser-extensions-risk",
      "secondary-privacy-incident-response-after-infection",
      "secondary-privacy-principle-of-least-privilege",
      "secondary-privacy-ransomware"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Comment un appareil infecté menace-t-il mes clés ?"
    ],
    "status": "reviewed",
    "sourceHash": "2e518eaa23ac9374bb6a5836d9719d6fbc2ebaa7f735e1d7b7109a05d64a8f43",
    "sourcePath": "data/alice-corpus/examples/malware.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-medium-of-exchange",
    "conceptId": "medium-of-exchange",
    "title": "Le moyen d’échange",
    "keywords": [
      "Le moyen d’échange",
      "Medium of Exchange",
      "Qu’est-ce qui rend une monnaie utilisable pour payer ?",
      "Monnaie et économie",
      "medium of exchange"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn moyen d’échange est un bien ou un instrument accepté pour régler des achats. Il facilite les échanges sans demander que chaque vendeur souhaite exactement ce que l’acheteur pourrait lui fournir en retour.\n\nExplication\nSon utilité dépend de l’acceptation, de la facilité de transfert, de la divisibilité et du coût des paiements. L’usage de Bitcoin peut passer par la chaîne ou par des systèmes comme Lightning, avec des contraintes différentes de frais, de disponibilité et de garde.\n\nUn marchand peut accepter un paiement en bitcoin tout en calculant son prix dans une autre monnaie. Le moyen de paiement et l’unité de compte restent alors distincts. De même, la réception peut être conservée en BTC ou convertie par un service, ce qui change les dépendances.\n\nLimites et confusions\nLa possibilité technique de payer ne garantit pas l’acceptation par un vendeur ni la disponibilité d’une route Lightning. Le règlement, les erreurs de montant et les remboursements doivent être organisés.\n\nLes stablecoins offrent souvent un moyen de transférer une unité fiat numérique, mais leur fonctionnement dépend de l’adossement et de l’émetteur. Comparer des moyens d’échange exige donc de regarder le contrôle des fonds et les conditions réelles du paiement.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-payments-for-merchants",
      "unit-of-account",
      "secondary-economics-barter-double-coincidence"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Qu’est-ce qui rend une monnaie utilisable pour payer ?"
    ],
    "status": "reviewed",
    "sourceHash": "9fe45fbc221079b10712fb14c4f8d435c68edabd3db617198b8dcee342daae1a",
    "sourcePath": "data/alice-corpus/examples/medium-of-exchange.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-merkle-tree",
    "conceptId": "merkle-tree",
    "title": "Les arbres de Merkle",
    "keywords": [
      "Les arbres de Merkle",
      "Merkle Tree",
      "Comment résumer les transactions d’un bloc ?",
      "Cryptographie et limites du protocole",
      "merkle tree"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn arbre de Merkle combine des empreintes pour résumer un ensemble de données dans une racine. Dans Bitcoin, cette structure permet notamment de prouver l’inclusion d’une transaction dans un bloc.\n\nExplication\nLes empreintes de transactions sont combinées progressivement jusqu’à obtenir une empreinte racine engagée dans l’en-tête du bloc. Pour vérifier l’inclusion d’une transaction, une preuve fournit les empreintes nécessaires le long du chemin. Il n’est pas nécessaire de transmettre toutes les autres transactions pour cette vérification précise.\n\nCette construction rend possible une preuve compacte liée au contenu du bloc. Si une donnée change, les valeurs calculées sur le chemin ne correspondent plus à la racine attendue, sous les hypothèses de sécurité du hachage.\n\nLimites et confusions\nUne preuve d’inclusion ne prouve pas à elle seule que toutes les règles du bloc ont été correctement appliquées. Elle ne démontre pas non plus que la sortie est encore non dépensée ni que le bloc restera dans la chaîne suivie.\n\nLes clients légers et les nœuds complets n’effectuent donc pas nécessairement les mêmes vérifications. L’arbre de Merkle est une brique utile, pas un substitut universel à la validation des transactions et au suivi de l’historique.",
    "parentIds": [],
    "relatedIds": [
      "cryptographic-hash-function",
      "bitcoin-node",
      "secondary-addresses-mast",
      "secondary-bitcoin-collision-resistance",
      "secondary-bitcoin-merkle-proof"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB min101 — Introduction to Bitcoin mining"
    ],
    "questions": [
      "Comment résumer les transactions d’un bloc ?"
    ],
    "status": "reviewed",
    "sourceHash": "96fea5f5674b21040831f98b84c0576a23805c8e3cb417b6122bd8289fc469f8",
    "sourcePath": "data/alice-corpus/examples/merkle-tree.fr.md",
    "theme": "Cryptographie et limites du protocole"
  },
  {
    "id": "curated-mining-centralization",
    "conceptId": "mining-centralization",
    "title": "La concentration du minage",
    "keywords": [
      "La concentration du minage",
      "Mining Centralization",
      "Quels risques pose la concentration des mineurs ou des pools ?",
      "Minage et énergie",
      "mining centralization"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa concentration du minage peut concerner les machines, les pools, les fabricants ou les lieux d’exploitation. Un seul pourcentage ne décrit pas toutes ces dépendances.\n\nExplication\nUn pool peut sélectionner beaucoup de blocs sans posséder les machines qui calculent pour lui. Inversement, un propriétaire de matériel peut répartir ses machines entre plusieurs pools. Il faut donc distinguer la production physique du hashrate et le choix des transactions à inclure.\n\nLa concentration géographique expose des installations à des contraintes communes, comme l’électricité, une réglementation ou une interruption locale. La concentration industrielle crée d’autres dépendances, notamment pour acheter ou réparer les ASIC. Ces dimensions peuvent se renforcer, mais elles ne sont pas interchangeables.\n\nLimites et confusions\nDisperser les machines réduit certains points de concentration. Cela ne garantit pas à chaque mineur le choix des transactions si son pool construit les blocs. L’effet du minage domestique sur la résistance à la censure dépend aussi de son poids réel et des juridictions concernées.\n\nIl ne faut pas confondre ce pouvoir de production avec le pouvoir de changer seul les règles. Les nœuds continuent de vérifier la validité des blocs qu’ils reçoivent.",
    "parentIds": [],
    "relatedIds": [
      "mining-pool",
      "51-attack",
      "secondary-bitcoin-open-source-mining-hardware"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://developer.bitcoin.org/devguide/mining.html"
    ],
    "questions": [
      "Quels risques pose la concentration des mineurs ou des pools ?"
    ],
    "status": "reviewed",
    "sourceHash": "a2a3763921044d9d438d4a8f7b395aec5370b6750b29a63c0d5728b97bf3ccf3",
    "sourcePath": "data/alice-corpus/examples/mining-centralization.fr.md",
    "theme": "Minage et énergie"
  },
  {
    "id": "curated-mining-curtailed-energy",
    "conceptId": "mining-curtailed-energy",
    "title": "Quand le minage valorise une énergie sans débouché",
    "keywords": [
      "Quand le minage valorise une énergie sans débouché",
      "Que signifie miner avec un surplus ou une énergie échouée ?",
      "Les mineurs consomment-ils une énergie qui aurait été gaspillée ?",
      "Pourquoi ne pas envoyer cette électricité aux particuliers ?",
      "mining",
      "energy",
      "mining curtailed energy"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe minage peut acheter une production électrique qui ne trouve pas de consommateur au même endroit et au même moment. Cela donne une recette au producteur et peut réduire l’écrêtement. Il faut identifier ce surplus sur le site concerné ; le faible prix du courant ne suffit pas à le prouver.\n\nExplication\nL’écrêtement consiste à réduire volontairement la production disponible. Une éolienne peut être bridée parce que la ligne électrique est saturée ou que la demande est faible. Dans ce cas, l’électricité correspondante n’est souvent pas produite, plutôt que produite puis jetée. Le NREL expliquait en 2022 que conserver une capacité de production supérieure à la demande de certaines heures peut aussi être un choix rationnel pour la fiabilité du système.\n\nL’énergie échouée désigne ici une ressource difficile à valoriser à cause de l’isolement, d’un raccordement absent ou d’une demande insuffisante. Le minage peut déplacer ses équipements près de la ressource, utiliser une connexion Internet et vendre sa production numérique sans transporter l’électricité jusqu’à un autre pays. Il reste soumis aux routes, aux équipements électriques, au refroidissement et à la maintenance.\n\nPrenons un exemple fictif. Une petite centrale peut fournir 1 MW pendant certaines heures, mais les clients raccordés n’en demandent que 600 kW. Une mine pourrait acheter une partie des 400 kW disponibles. Quand la demande locale augmente, ce surplus diminue. Un pilotage et un contrat donnant priorité aux autres clients permettent alors de réduire le minage. Les 400 kW ne constituent pas une disponibilité annuelle garantie.\n\nGridless décrit un modèle de ce type sur des sites hydroélectriques africains. L’exploitant présente le minage comme un acheteur flexible de l’électricité inutilisée, avec priorité aux besoins locaux. Cela documente un modèle opérationnel déclaré ; les quantités évitées, les tarifs et le respect de cette priorité se contrôlent pour chaque site. La synthèse de Velický publiée par ACS en 2023 examine également l’intérêt de la mobilité et de la flexibilité du minage pour les producteurs.\n\nLimites et confusions\nAcheter de l’électricité à bas prix peut aussi signifier profiter d’un tarif subventionné, d’un contrat favorable ou d’une production fossile bon marché. Sur un réseau partagé, cette nouvelle demande peut modifier la production, les prix et les besoins de raccordement. Il n’existe donc pas de règle générale selon laquelle les mineurs ne concurrencent jamais les particuliers.\n\nLe bon comparatif inclut les solutions accessibles sur place. Une ligne, une batterie, du pompage, une consommation industrielle ou de nouveaux clients peuvent mieux valoriser la ressource. L’IEA traite ces solutions comme complémentaires. Miner transforme l’électricité en calcul et en chaleur ; cela ne permet pas de la récupérer électriquement le soir comme avec une batterie.\n\nUn projet convaincant précise les heures de surplus, le compteur utilisé, le fonctionnement sans mine et les règles de réduction de charge. Il montre aussi que le revenu espéré couvre les équipements même avec une utilisation intermittente.",
    "parentIds": [
      "bitcoin-energy-debate",
      "bitcoin-mining"
    ],
    "relatedIds": [
      "mining-grid-flexibility",
      "mining-renewable-projects"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://www.nlr.gov/news/detail/program/2022/reframing-curtailment",
      "https://www.iea.org/reports/integrating-solar-and-wind/executive-summary",
      "https://gridlesscompute.com/",
      "https://pubs.acs.org/doi/10.1021/acssuschemeng.2c06077",
      "https://offchain.media/article/orange-is-the-new-green/"
    ],
    "questions": [
      "Que signifie miner avec un surplus ou une énergie échouée ?",
      "Les mineurs consomment-ils une énergie qui aurait été gaspillée ?",
      "Pourquoi ne pas envoyer cette électricité aux particuliers ?"
    ],
    "status": "reviewed",
    "sourceHash": "bec26a9d060605cf6c8411945dbee9220dbc61df181be3a4ec0a5d002175516a",
    "sourcePath": "data/alice-corpus/examples/mining-curtailed-energy.fr.md",
    "theme": "mining"
  },
  {
    "id": "curated-mining-difficulty",
    "conceptId": "mining-difficulty",
    "title": "La difficulté de minage",
    "keywords": [
      "La difficulté de minage",
      "Mining Difficulty",
      "Que signifie une hausse de difficulté ?",
      "mining",
      "mining difficulty"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa difficulté exprime à quel point il est exigeant de trouver une preuve de travail par rapport à une référence. Une hausse signifie qu’il faut en moyenne davantage d’essais pour produire un bloc.\n\nExplication\nLes mineurs cherchent un hash inférieur ou égal à une cible. Une cible plus basse rend la condition plus difficile à satisfaire. Cela ne transforme pas l’essai individuel en calcul plus complexe ; cela réduit la proportion de résultats acceptables.\n\nSur le réseau principal, la difficulté est ajustée tous les 2 016 blocs afin de viser une moyenne d’environ 10 minutes. Le mécanisme réagit au rythme observé, notamment quand la puissance de calcul change.\n\nLimites et confusions\nLa difficulté n’est pas le hashrate, même si les 2 sont liés. Elle ne garantit pas un bloc exactement toutes les 10 minutes et ne mesure pas à elle seule la rentabilité d’un mineur. Les limites d’ajustement et la mesure de 2 015 intervalles demandent un niveau de détail supplémentaire, conservé dans la fiche secondaire.",
    "parentIds": [],
    "relatedIds": [
      "hashrate",
      "difficulty-adjustment",
      "mining-difficulty-details"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp"
    ],
    "questions": [
      "Que signifie une hausse de difficulté ?"
    ],
    "status": "reviewed",
    "sourceHash": "039b7a6114154876191603fcd551d2d54f46da21f351d9de97eca3ad2170ded6",
    "sourcePath": "data/alice-corpus/examples/mining-difficulty.fr.md",
    "theme": "mining"
  },
  {
    "id": "curated-mining-difficulty-details",
    "conceptId": "mining-difficulty-details",
    "title": "L’ajustement de difficulté en détail",
    "keywords": [
      "L’ajustement de difficulté en détail",
      "retarget",
      "cible de difficulté",
      "Pourquoi le réseau ne retrouve-t-il pas immédiatement sa cadence après une baisse de hashrate ?",
      "mining",
      "mining difficulty details"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nSur Bitcoin mainnet, la cible de preuve de travail est réajustée à chaque période de 2 016 blocs. L’objectif de cadence est d’environ 10 minutes par bloc.\n\nExplication\nSi la puissance de calcul baisse entre 2 ajustements, trouver les blocs peut prendre davantage de temps. Le prochain ajustement répond au temps observé pour la période selon les règles du protocole. Une cible plus élevée facilite la recherche d’une preuve ; une cible plus basse la rend plus difficile.\n\nSur mainnet, 1 ajustement ne peut pas diviser la difficulté par plus de 4 (baisse maximale de 75 %, soit −75 %), ni la multiplier par plus de 4 (hausse maximale de 300 %, soit +300 %). Après une variation très importante de la puissance de calcul, plusieurs ajustements peuvent donc être nécessaires pour retrouver la cadence moyenne visée, si la puissance de calcul se stabilise.\n\nL’ajustement intervient tous les 2 016 blocs, mais la durée observée est calculée entre les horodatages du premier et du dernier bloc de cette période. Cela représente 2 015 intervalles entre blocs. Cette durée est comparée à la durée cible de 2 016 × 10 minutes, soit 14 jours. Cette particularité du calcul explique pourquoi une formule simplifiée peut différer de l’implémentation.\n\nLimites et confusions\nLa cadence est statistique, pas un rendez-vous toutes les 10 minutes. Les réseaux de test peuvent appliquer d’autres paramètres. Cette fiche ne donne pas une formule d’implémentation exacte ni une prédiction de rentabilité.",
    "parentIds": [
      "bitcoin-mining"
    ],
    "relatedIds": [],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://developer.bitcoin.org/devguide/block_chain.html",
      "https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp"
    ],
    "questions": [
      "Pourquoi le réseau ne retrouve-t-il pas immédiatement sa cadence après une baisse de hashrate ?"
    ],
    "status": "reviewed",
    "sourceHash": "5d9ee4116c133269f830aa6b1618952e8156781baed7794f16eec4ed8c981f1c",
    "sourcePath": "data/alice-corpus/examples/mining-difficulty-details.fr.md",
    "theme": "mining"
  },
  {
    "id": "curated-mining-grid-flexibility",
    "conceptId": "mining-grid-flexibility",
    "title": "Comment les mineurs peuvent aider à équilibrer un réseau électrique",
    "keywords": [
      "Comment les mineurs peuvent aider à équilibrer un réseau électrique",
      "Comment arrêter des mineurs peut-il aider le réseau ?",
      "Qu’a-t-on réellement observé au Texas ?",
      "Une mine est-elle une réserve d’électricité ?",
      "mining",
      "energy",
      "mining grid flexibility"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne mine pilotable peut réduire rapidement sa consommation quand l’électricité manque ou devient chère. Cette baisse de demande laisse de la puissance disponible pour d’autres usages. Pour le gestionnaire du réseau, sa valeur dépend de la réponse réellement fournie, des engagements du mineur et des contraintes locales.\n\nExplication\nLe réseau doit équilibrer production et consommation. Une ferme de minage peut interrompre une partie de ses machines et renoncer temporairement à des recettes. Elle n’a pas nécessairement les mêmes contraintes de continuité qu’un hôpital ou qu’un procédé industriel qui perdrait sa production en s’arrêtant. C’est cette possibilité de modulation, soulignée par Alexandre Stachtchenko, qui permet de fournir un service énergétique.\n\nPlusieurs mécanismes coexistent. Le mineur peut s’arrêter volontairement parce que le prix de l’électricité dépasse ses recettes attendues. Il peut aussi répondre à une demande de l’opérateur, ou participer à un service rémunéré après qualification. ERCOT distingue notamment les réponses aux prix, les services d’urgence et les services auxiliaires. Ces engagements n’ont ni les mêmes obligations ni les mêmes modalités de rémunération.\n\nUn résultat observé illustre cette flexibilité. Pendant la tempête hivernale de décembre 2022, ERCOT rapporte que les grandes charges flexibles enregistrées ont réduit leur consommation de 1 530 à 130 MW au pic de demande, soit 91,5 %. Ce groupe comprend des installations de minage Bitcoin et d’autres centres de données. Le chiffre ne doit donc pas être attribué intégralement à Bitcoin. Le programme annoncé par ERCOT le 6 décembre 2022 était volontaire ; il ne décrit pas à lui seul les règles de tous les contrats actuels.\n\nUne mine qui consommait 10 MW et descend à 1 MW réduit la demande de 9 MW. Elle n’injecte pas 9 MW supplémentaires dans le réseau. Pour savoir si sa présence améliore le système sur l’année, il faut aussi examiner les périodes où elle fonctionne, son raccordement et les capacités de production qu’elle sollicite.\n\nLimites et confusions\nLa capacité technique à s’arrêter ne prouve pas que le mineur s’arrêtera au bon moment. Une prévision ERCOT pour janvier 2025 modélisait les coupures selon le prix du courant et les revenus du minage, avec une consommation résiduelle pour les auxiliaires. Il s’agit d’une hypothèse économique de planification, pas d’une garantie physique universelle.\n\nPour évaluer un service réel, on recherche une charge de référence, des mesures horodatées, une commande ou un signal de prix, une durée d’effacement et les conditions de reprise. La baisse doit se produire au bon endroit ; arrêter une mine derrière une autre contrainte du réseau peut rendre un service différent.\n\nL’IEA décrit aussi la contribution des batteries, des autres charges flexibles et des réseaux. Le minage peut compléter ces ressources. Sa participation ne démontre pas automatiquement une baisse de la facture des habitants ou des émissions ; ces résultats demandent une comparaison avec le système sans cette mine.\n\nUne étude économétrique de Gill, Stinner et Tyrell publiée en septembre 2026 sur le Texas entre 2021 et 2024 trouve un effet sur les prix de gros nocturnes locaux et ne constate pas la même flexibilité sur les cycles ordinaires que lors des pénuries extrêmes. Ce résultat local ne mesure pas directement la facture des ménages et ne contredit pas l’effacement observé pendant la tempête de 2022. Il invite à vérifier le comportement habituel, en plus des jours de crise.",
    "parentIds": [
      "bitcoin-energy-debate",
      "bitcoin-mining"
    ],
    "relatedIds": [
      "mining-curtailed-energy",
      "mining-renewable-projects"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://www.ercot.com/news/release/2022-12-06-ercot-creates-voluntary",
      "https://www.ercot.com/files/docs/2023/03/27/December-2022-Cold-Weather-Operations-Public-Report.pdf",
      "https://www.ercot.com/services/programs/load",
      "https://www.ercot.com/files/docs/2024/11/01/MORA_January2025.pdf",
      "https://www.iea.org/reports/electricity-2026/flexibility",
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC13634397/",
      "https://medium.com/@AlexStach/bitcoin-une-solution-contre-intuitive-au-changement-climatique-668364b0c205"
    ],
    "questions": [
      "Comment arrêter des mineurs peut-il aider le réseau ?",
      "Qu’a-t-on réellement observé au Texas ?",
      "Une mine est-elle une réserve d’électricité ?"
    ],
    "status": "reviewed",
    "sourceHash": "d79780d06e1e5d2dea6bc928e9b98fc8d5dafd1ff9407410883de36b353efdcc",
    "sourcePath": "data/alice-corpus/examples/mining-grid-flexibility.fr.md",
    "theme": "mining"
  },
  {
    "id": "curated-mining-heat-reuse-details",
    "conceptId": "mining-heat-reuse-details",
    "title": "Réutiliser la chaleur du minage pour chauffer",
    "keywords": [
      "Réutiliser la chaleur du minage pour chauffer",
      "Un ASIC peut-il remplacer un radiateur ?",
      "Est-ce du chauffage gratuit ou plus efficace ?",
      "Comment calculer l’énergie et les émissions réellement économisées ?",
      "mining",
      "energy",
      "mining heat reuse details"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa quasi-totalité de l’électricité consommée par un ASIC finit en chaleur. Si cette chaleur est récupérée au bon endroit et au bon moment, elle peut remplacer une partie d’un chauffage existant, pendant que l’appareil participe au minage. L’intérêt dépend du chauffage remplacé, de la chaleur utile et des coûts complets de l’installation.\n\nExplication\nUn appareil consommant 1 kW pendant 1 heure utilise 1 kWh d’électricité. À l’échelle du local et hors pertes vers l’extérieur, cela donne approximativement 1 kWh de chaleur. Le calcul n’absorbe pas une fraction d’énergie qui disparaîtrait ensuite ; le traitement informatique et la dissipation thermique font partie du même fonctionnement.\n\nLa chaleur peut être récupérée par l’air ou par un circuit liquide avec échangeur. Pour chauffer un bâtiment ou de l’eau, il faut une température compatible, des conduites, une régulation et parfois un équipement complémentaire. Toute la chaleur dissipée par les machines n’arrive donc pas nécessairement jusqu’à l’usage recherché.\n\nUn exemple annoncé par MARA en juin 2024 est un pilote de 2 MW en Finlande raccordé à un réseau de chaleur desservant environ 11 000 habitants. Cela ne signifie pas que ces seuls mineurs couvrent tous leurs besoins de chauffage. L’annonce de l’exploitant montre une intégration concrète ; la production thermique livrée et le combustible évité s’évaluent avec les données d’exploitation.\n\nL’argument de *Orange is the New Green* prend ici une forme pratique. Au lieu d’évacuer toute la chaleur d’un calculateur, on l’utilise pour un besoin existant. Face à un radiateur électrique résistif, le revenu minier peut réduire le coût net du chauffage, sans augmenter automatiquement son rendement thermique.\n\nLimites et confusions\nLa comparaison change face à une pompe à chaleur. Celle-ci déplace de la chaleur et peut fournir plusieurs kWh de chaleur avec 1 kWh électrique, selon les conditions. Un ASIC seul dissipe l’électricité qu’il consomme. Le DOE décrit cet avantage des pompes à chaleur ; il faut donc comparer le même service rendu, pas seulement 2 factures électriques.\n\nExemple fictif, sans prévision de rentabilité. Un ASIC consomme 3 kWh et fournit 2,4 kWh de chaleur utile après les pertes du système. Un radiateur résistif aurait besoin d’environ 2,4 kWh pour ce service ; une pompe à chaleur ayant un coefficient de performance de 3 aurait besoin d’environ 0,8 kWh. Le revenu du minage peut modifier le coût financier, mais ne supprime pas cette différence de consommation.\n\nLe bilan économique annuel compte l’électricité, les machines, l’échangeur, les auxiliaires et la maintenance, puis retranche le chauffage effectivement évité et le revenu du minage. Ce dernier varie ; bruit, disponibilité et besoin de chaleur déterminent aussi si le système convient au lieu.\n\nEn été, produire une chaleur sans débouché ne donne aucune économie de chauffage. Si une climatisation doit ensuite l’évacuer, elle ajoute une consommation. Une réutilisation saisonnière peut rester utile, à condition de mesurer cette saisonnalité.\n\nL’empreinte carbone n’est donc ni automatiquement divisée par 2 parce que l’appareil rend 2 services, ni automatiquement nulle. Le gain dépend des équipements et combustibles réellement remplacés, de l’électricité supplémentaire et du cycle de vie des installations. La répartition comptable des émissions entre minage et chauffage est une convention à expliciter.",
    "parentIds": [
      "bitcoin-energy-debate",
      "asic-heat-reuse",
      "bitcoin-mining"
    ],
    "relatedIds": [
      "mining-curtailed-energy",
      "mining-methane-mitigation"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://www.mara.com/posts/recycling-heat-from-data-centers-to-warm-a-community-in-finland",
      "https://www.energy.gov/energysaver/heat-pump-systems",
      "https://www.energy.gov.au/households/heating-and-cooling",
      "https://betterbuildingssolutioncenter.energy.gov/sites/default/files/attachments/87812.pdf",
      "https://offchain.media/article/orange-is-the-new-green/"
    ],
    "questions": [
      "Un ASIC peut-il remplacer un radiateur ?",
      "Est-ce du chauffage gratuit ou plus efficace ?",
      "Comment calculer l’énergie et les émissions réellement économisées ?"
    ],
    "status": "reviewed",
    "sourceHash": "4fd2a5a25aeb6a8f83b194547a2ea98e461b9012ce9caf81ba5b58924ba898da",
    "sourcePath": "data/alice-corpus/examples/mining-heat-reuse-details.fr.md",
    "theme": "mining"
  },
  {
    "id": "curated-mining-methane-mitigation",
    "conceptId": "mining-methane-mitigation",
    "title": "Quand le minage peut financer une réduction des émissions de méthane",
    "keywords": [
      "Quand le minage peut financer une réduction des émissions de méthane",
      "Comment miner avec du méthane peut-il réduire des émissions ?",
      "Quelle différence entre gaz éventé et gaz torché ?",
      "A-t-on des projets réels ou seulement des modèles ?",
      "mining",
      "energy",
      "mining methane mitigation"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn générateur peut brûler du méthane récupéré et alimenter des mineurs. Leur revenu peut financer une collecte qui manquerait autrement de débouché. Le gain climatique provient du méthane effectivement empêché d’atteindre l’atmosphère, après prise en compte de la combustion, des fuites et du scénario sans projet.\n\nExplication\nLe méthane peut provenir de la décomposition des déchets ou être associé à l’extraction d’hydrocarbures. L’éventage libère le gaz sans le brûler. Le torchage le brûle sans utiliser directement son énergie. Ces situations ne fournissent pas le même point de comparaison.\n\nSi le gaz était relâché, le capter et le brûler efficacement transforme une grande partie de son méthane en CO₂. Cela peut réduire fortement l’effet de réchauffement associé au rejet initial. Si une torchère le détruisait déjà correctement, le bénéfice supplémentaire est différent. Il dépend notamment de la combustion comparée des équipements et de l’usage de l’électricité produite. L’IEA documente les émissions liées aux torchères inefficaces ou éteintes ; aucun rendement unique ne représente tous les sites.\n\nDans une décharge isolée, vendre du gaz ou de l’électricité peut demander des infrastructures coûteuses. Des mineurs installés sur place fournissent un client au générateur. L’EPA décrit plusieurs autres débouchés du gaz de décharge, dont la chaleur et l’électricité. L’intérêt propre du minage est d’ajouter une possibilité de vente lorsque ces débouchés sont limités.\n\nUn cas réel a été annoncé par Nodal Power en novembre 2023. L’entreprise décrit un pilote de minage de 280 kW avec Marathon en Utah, déjà en fonctionnement et alimenté au gaz de décharge. Cette déclaration d’exploitant documente une réalisation ; elle ne constitue pas à elle seule une mesure indépendante des émissions nettes évitées.\n\nRudd, Jones, Sechrest, Batten et Porter ont aussi publié un modèle dans le Journal of Cleaner Production en 2024, précédé d’un dépôt SSRN. Leur simulation Monte-Carlo examine la viabilité d’une association entre captage et minage. Elle montre des possibilités de recettes, avec des résultats sensibles aux coûts et au revenu minier. Son scénario d’émissions porte notamment sur une décharge auparavant non équipée, supposée éventer le gaz. Ce n’est pas un résultat transposable à une décharge déjà dotée d’une torchère.\n\nLimites et confusions\nUn bilan crédible mesure le gaz collecté, sa teneur en méthane, les fuites, les arrêts, l’efficacité de destruction et les émissions du moteur. Il précise l’horizon retenu pour convertir le méthane en équivalent CO₂. Les émissions de fabrication et d’exploitation des équipements font partie du périmètre à examiner.\n\nL’énergie contenue dans le gaz n’est pas intégralement transformée en électricité. Le rendement du générateur et ses auxiliaires doivent être déduits. Une estimation en kWh de gaz ne peut pas être présentée directement comme autant de kWh électriques disponibles pour les ASIC.\n\nLe bénéfice additionnel dépend de ce qui aurait été fait sans le minage, y compris une obligation de captage ou une autre valorisation. Sur un site pétrolier, il faut aussi examiner si cette recette contribue à prolonger la production. Une réduction d’émissions par rapport à un scénario de référence ne signifie pas retrait de CO₂ déjà présent dans l’air.\n\nDaniel Batten est coauteur du modèle et déclare une participation dans CH4 Capital, actif dans le financement de ce type d’opération. Cet intérêt est à connaître pour évaluer les hypothèses, sans annuler les mécanismes physiques décrits.",
    "parentIds": [
      "bitcoin-energy-debate",
      "bitcoin-mining"
    ],
    "relatedIds": [
      "mining-curtailed-energy",
      "mining-heat-reuse-details"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://doi.org/10.1016/j.jclepro.2024.143516",
      "https://www.satoshiaction.io/docs/resources/Bitcoin_Mining_and_Methane_Mitigation_Peer_Reviewed_Paper.pdf",
      "https://ssrn.com/abstract=4810964",
      "https://www.iea.org/reports/global-methane-tracker-2024/understanding-methane-emissions",
      "https://www.epa.gov/lmop/frequent-questions-about-landfill-gas",
      "https://www.epa.gov/lmop/benefits-landfill-gas-energy-projects",
      "https://www.nodalpowersystems.com/news-media/nodal-marathon-pilot-q42023"
    ],
    "questions": [
      "Comment miner avec du méthane peut-il réduire des émissions ?",
      "Quelle différence entre gaz éventé et gaz torché ?",
      "A-t-on des projets réels ou seulement des modèles ?"
    ],
    "status": "reviewed",
    "sourceHash": "b4d1da4b346c4e7242a996c434dcccd4cbfa0412b08fbe70b582509bd3afe485",
    "sourcePath": "data/alice-corpus/examples/mining-methane-mitigation.fr.md",
    "theme": "mining"
  },
  {
    "id": "curated-mining-pool",
    "conceptId": "mining-pool",
    "title": "Les pools de minage",
    "keywords": [
      "Les pools de minage",
      "Mining Pool",
      "Pourquoi des mineurs se regroupent-ils ?",
      "Minage et énergie",
      "mining pool"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn pool de minage mutualise les contributions de plusieurs mineurs et répartit les revenus selon ses règles. Il rend généralement les paiements plus réguliers que le minage en solo.\n\nExplication\nUn petit mineur peut attendre très longtemps avant de trouver seul un bloc. Dans un pool classique, il soumet des preuves de travail partielles, appelées shares, qui permettent d’estimer sa contribution. Le mode de paiement précise comment cette contribution est rémunérée et quels risques restent supportés par le mineur ou le pool.\n\nLe pool peut fournir les blocs candidats sur lesquels travaillent les machines. Cela distingue la propriété du matériel du pouvoir de sélectionner les transactions. Plusieurs propriétaires de machines peuvent ainsi dépendre du même opérateur pour la construction des blocs.\n\nLimites et confusions\nUn pool ne crée pas de bitcoins supplémentaires pour une même quantité de travail. Il change principalement la répartition des revenus et leur variabilité, avec des frais et des conditions propres.\n\nUn service de « solo pool » fournit une infrastructure mais ne mutualise pas nécessairement les gains. Il faut regarder le mode de paiement, les seuils de retrait et la gestion des blocs, plutôt que le nom du service.",
    "parentIds": [],
    "relatedIds": [
      "solo-bitcoin-mining",
      "mining-centralization",
      "secondary-bitcoin-mining-shares",
      "secondary-bitcoin-mining-variance",
      "secondary-bitcoin-no-kyc-mining-rewards",
      "secondary-bitcoin-pool-payout-methods",
      "secondary-bitcoin-stratum-mining-protocol"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB min101 — Introduction to Bitcoin mining",
      "PlanB min304 — Heat your home while mining bitcoins"
    ],
    "questions": [
      "Pourquoi des mineurs se regroupent-ils ?"
    ],
    "status": "reviewed",
    "sourceHash": "9c719a4850c1f52e870d091f7f5172a73a6d948a6c19c3d4b8287f7dbe76236b",
    "sourcePath": "data/alice-corpus/examples/mining-pool.fr.md",
    "theme": "Minage et énergie"
  },
  {
    "id": "curated-mining-profitability",
    "conceptId": "mining-profitability",
    "title": "Les coûts du minage",
    "keywords": [
      "Les coûts du minage",
      "Mining Profitability",
      "De quoi dépend la rentabilité d’un mineur ?",
      "Minage et énergie",
      "mining profitability"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe minage est rentable seulement si ses revenus couvrent l’ensemble de ses coûts. Un calculateur donne un scénario fondé sur des hypothèses, pas un revenu futur garanti.\n\nExplication\nLe revenu dépend notamment de la puissance de calcul, de la difficulté, de la subvention, des frais des blocs et du cours utilisé pour convertir les bitcoins reçus. Les coûts comprennent l’électricité, l’achat et l’amortissement du matériel, son entretien, les frais du pool et les interruptions.\n\nLa chaleur peut avoir une valeur si elle remplace un chauffage réellement nécessaire. Cette économie doit être calculée séparément et sur une durée réaliste. Une chaleur inutilisée en été ne constitue pas un revenu thermique. Comparer plusieurs hypothèses de difficulté, de disponibilité et de coût électrique rend le calcul plus informatif qu’une estimation unique.\n\nLimites et confusions\nUn revenu exprimé en euros peut varier même si la quantité de bitcoins reçue reste identique. Inversement, la quantité reçue peut diminuer si la concurrence augmente.\n\nLe coût moyen de production n’impose pas un prix plancher au bitcoin. Alice peut expliquer ces mécanismes et montrer un exemple fictif ; elle ne doit pas transformer ce calcul en conseil personnel d’achat d’ASIC ou de placement.",
    "parentIds": [],
    "relatedIds": [
      "asic-heat-reuse",
      "block-reward",
      "secondary-bitcoin-behind-the-meter",
      "secondary-bitcoin-bitcoin-production-cost-floor",
      "secondary-bitcoin-cloud-mining-risk",
      "secondary-bitcoin-pool-payout-methods",
      "secondary-economics-opportunity-cost"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB min304 — Heat your home while mining bitcoins"
    ],
    "questions": [
      "De quoi dépend la rentabilité d’un mineur ?"
    ],
    "status": "reviewed",
    "sourceHash": "0236ad24043236909c27d46dff18e41299f5d8bb0dbff5bbfab51e6c045c6008",
    "sourcePath": "data/alice-corpus/examples/mining-profitability.fr.md",
    "theme": "Minage et énergie"
  },
  {
    "id": "curated-mining-renewable-projects",
    "conceptId": "mining-renewable-projects",
    "title": "Comment le minage peut soutenir un projet renouvelable",
    "keywords": [
      "Comment le minage peut soutenir un projet renouvelable",
      "Pourquoi un producteur renouvelable ferait-il miner sur son site ?",
      "Le minage peut-il aider à financer une centrale ?",
      "Quelles preuves distinguent une possibilité d’un bénéfice réalisé ?",
      "mining",
      "energy",
      "mining renewable projects"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne installation de minage peut fournir un débouché supplémentaire à un producteur renouvelable. Les recettes peuvent soutenir son exploitation ou certains investissements, notamment lorsque le raccordement ou la demande locale n’est pas encore suffisant. Le résultat dépend du contrat, de l’énergie disponible et de l’économie du minage.\n\nExplication\nUn producteur engage des dépenses avant de vendre son électricité. Si une centrale fonctionne mais ne peut pas encore tout exporter, un acheteur installé sur place peut commencer à payer une partie de sa production. Il peut ensuite réduire sa consommation quand le réseau ou les clients locaux absorbent davantage. L’intérêt réside dans cette adaptation à la situation du producteur.\n\nL’étude de Lal et You publiée par ACS en 2023 examine une utilisation pendant la phase précédant le raccordement commercial de projets éoliens et solaires américains. Ses résultats sont des simulations économiques, pas les comptes de mines effectivement installées. Elle estime, pour son ensemble de 32 projets texans et ses hypothèses, un potentiel combiné de profits de 47 millions de dollars. Ce chiffre historique ne prédit pas le rendement d’un projet lancé aujourd’hui.\n\nGridless présente un autre cas, celui de petites installations renouvelables africaines dont la demande locale se développe progressivement. L’entreprise décrit un acheteur flexible qui valorise l’électricité disponible pendant cette montée en charge. Sa documentation permet de comprendre le modèle et ses réalisations déclarées ; établir l’effet causal sur la construction d’une centrale exige aussi les contrats et le financement du projet.\n\nDaniel Batten insiste sur ces situations que des statistiques fondées uniquement sur un mix électrique national peuvent mal représenter. Son modèle BEEST ajoute des informations sur les sites et leurs sources d’énergie. Ce travail constitue une piste documentaire pour identifier des opérations ; le classement d’un site dans un mix bas carbone n’établit pas à lui seul qu’une nouvelle centrale a été construite grâce au minage.\n\nLimites et confusions\nIl faut distinguer 3 résultats. Acheter une électricité renouvelable est un achat. Donner une recette à un producteur est un effet économique. Provoquer une capacité renouvelable supplémentaire est un effet d’investissement qui demande une démonstration distincte. Les 3 peuvent se rejoindre, mais ne sont pas interchangeables.\n\nLe calcul du projet doit intégrer l’achat des machines, leur durée d’utilisation, le raccordement local, les frais de fonctionnement et le revenu par unité de calcul. Le prix du bitcoin, la difficulté et les frais de transaction font varier ce revenu. Les périodes d’arrêt et la valeur de revente du matériel changent aussi le bilan. Aucun contrat d’électricité bon marché ne garantit à lui seul un bénéfice.\n\nUne source renouvelable disponible peut servir à d’autres clients, à du stockage ou à un futur raccordement. Le projet le plus utile est celui dont le contrat accompagne cette évolution. Une recette du minage ne remplace pas une analyse des besoins locaux ni l’évaluation des autres acheteurs possibles.\n\nLa publication MDPI de Rudd et ses coauteurs en 2023 propose notamment un programme de recherche sur ces interactions. Son statut de publication ne transforme pas ses bénéfices possibles en effets déjà mesurés partout.",
    "parentIds": [
      "bitcoin-energy-debate",
      "bitcoin-mining"
    ],
    "relatedIds": [
      "mining-curtailed-energy",
      "mining-grid-flexibility"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://doi.org/10.1021/acssuschemeng.3c05445",
      "https://www.resistance.money/class/readings/mining_mitigation.pdf",
      "https://gridlesscompute.com/",
      "https://gridlesscompute.com/wp-content/uploads/2023/05/blueprint-energy-bitcoin-africa.pdf",
      "https://pubs.acs.org/doi/10.1021/acssuschemeng.2c06077",
      "https://www.mdpi.com/2078-1547/14/4/47",
      "https://batcoinz.com/beest/"
    ],
    "questions": [
      "Pourquoi un producteur renouvelable ferait-il miner sur son site ?",
      "Le minage peut-il aider à financer une centrale ?",
      "Quelles preuves distinguent une possibilité d’un bénéfice réalisé ?"
    ],
    "status": "reviewed",
    "sourceHash": "2757fcae38f96f940e370e6bdb998854a7759da38393c16a94fc3b39c8a9dc51",
    "sourcePath": "data/alice-corpus/examples/mining-renewable-projects.fr.md",
    "theme": "mining"
  },
  {
    "id": "curated-money-functions",
    "conceptId": "money-functions",
    "title": "Les fonctions de la monnaie",
    "keywords": [
      "Les fonctions de la monnaie",
      "Money Functions",
      "À quoi sert une monnaie ?",
      "Monnaie et économie",
      "money functions"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes fonctions classiques de la monnaie sont de faciliter les échanges, conserver du pouvoir d’achat et exprimer les prix dans une unité commune. Un même instrument peut remplir ces fonctions à des degrés différents.\n\nExplication\nComme moyen d’échange, la monnaie évite de devoir trouver une personne qui souhaite exactement le bien que l’on propose. Comme réserve de valeur, elle permet de reporter une dépense. Comme unité de compte, elle aide à comparer les prix et à tenir des comptes.\n\nCes fonctions permettent de décrire Bitcoin sans le réduire à sa cotation. Une personne peut le recevoir en paiement, une autre le conserver, tandis qu’un marchand continue d’afficher ses prix en euros et convertit au moment de vendre. Les usages ne sont donc pas obligatoirement identiques.\n\nLimites et confusions\nCes fonctions ne constituent pas une garantie de réussite économique. La volatilité peut rendre difficile la conservation d’un pouvoir d’achat à court terme ; la possibilité technique de payer ne garantit pas l’acceptation par tous les commerçants.\n\nUn stablecoin adossé au dollar utilise généralement une unité de compte existante, avec les risques de son émetteur et de son adossement. Le comparer à Bitcoin exige de regarder séparément chaque fonction et le contrôle des fonds.",
    "parentIds": [],
    "relatedIds": [
      "store-of-value",
      "medium-of-exchange",
      "unit-of-account",
      "secondary-economics-barter-double-coincidence",
      "secondary-economics-barter-myth",
      "secondary-economics-debt-money-theory",
      "secondary-economics-emergence-of-money",
      "secondary-economics-mises-regression-theorem",
      "secondary-economics-time-preference"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc101 — The Bitcoin Journey",
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "À quoi sert une monnaie ?"
    ],
    "status": "reviewed",
    "sourceHash": "2cc9fc48fe18aa616cd2bc486ae727306830f725d2fae0cde61f5fa3bc09cc29",
    "sourcePath": "data/alice-corpus/examples/money-functions.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-money-supply",
    "conceptId": "money-supply",
    "title": "La masse monétaire",
    "keywords": [
      "La masse monétaire",
      "Money Supply",
      "Que mesure la quantité de monnaie ?",
      "Monnaie et économie",
      "money supply"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa masse monétaire mesure la quantité de monnaie selon un périmètre défini. Elle ne doit pas être confondue avec la seule quantité de billets ou avec toute la richesse d’une économie.\n\nExplication\nLes agrégats peuvent inclure le cash, des dépôts bancaires et d’autres formes de liquidité. Leurs définitions varient selon les institutions. Comparer des chiffres exige donc de préciser le pays, la période et le périmètre.\n\nDans le système bancaire moderne, les crédits créent généralement des dépôts, sous des contraintes de capital, de liquidité et de demande. Créer des unités monétaires ne produit pas directement des biens réels. Leur circulation peut modifier les prix relatifs et la répartition du pouvoir d’achat selon les canaux d’entrée.\n\nLimites et confusions\nUne hausse d’un agrégat n’entraîne pas mécaniquement une hausse identique de tous les prix. La production, la demande de monnaie et les conditions de crédit comptent également.\n\nL’offre de BTC vérifiable par les nœuds relève d’un autre mécanisme. Des créances sur des bitcoins détenus par des intermédiaires ne créent pas pour autant des BTC supplémentaires valides sur la chaîne. Cette distinction permet de comparer les systèmes sans confondre base monétaire et promesses financières.",
    "parentIds": [],
    "relatedIds": [
      "fractional-reserve-banking",
      "inflation-monetary-perspectives",
      "secondary-economics-cantillon-effect",
      "secondary-economics-credit-expansion",
      "secondary-economics-interest-rates",
      "secondary-economics-quantitative-easing"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy",
      "https://www.econlib.org/library/NPDBooks/Cantillon/cntNT.html?chapter_num=25",
      "https://www.bankofengland.co.uk/quarterly-bulletin/2012/q3/the-distributional-effects-of-asset-purchases"
    ],
    "questions": [
      "Que mesure la quantité de monnaie ?"
    ],
    "status": "reviewed",
    "sourceHash": "336fab7656dce2594d24c0743efaec416c3167548d72e0c977f7221f84142bd3",
    "sourcePath": "data/alice-corpus/examples/money-supply.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-mt-gox",
    "conceptId": "mt-gox",
    "title": "La leçon de Mt. Gox",
    "keywords": [
      "La leçon de Mt. Gox",
      "Mt. Gox",
      "Pourquoi l’histoire de Mt. Gox reste-t-elle importante ?",
      "Histoire et évolution du protocole",
      "mt gox"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nMt. Gox a été une des premières grandes plateformes d’échange de bitcoins. Son effondrement est devenu un exemple majeur du risque associé à la garde de fonds chez un intermédiaire.\n\nExplication\nUne plateforme facilite la rencontre entre acheteurs et vendeurs et contribue à la liquidité du marché. Lorsqu’elle conserve également les actifs, le solde visible par le client dépend de son infrastructure et de sa capacité à honorer les retraits.\n\nL’histoire de Mt. Gox montre que l’accès à un compte n’est pas équivalent au contrôle direct de clés Bitcoin. Une plateforme peut cesser de rendre les fonds disponibles alors que le protocole continue de fonctionner. Les utilisateurs doivent alors dépendre des procédures de l’entreprise et des recours possibles.\n\nLimites et confusions\nUn incident de plateforme n’est pas automatiquement une faille du protocole Bitcoin. Inversement, la robustesse du protocole ne protège pas contre les erreurs ou fraudes d’un gardien.\n\nCette fiche donne la leçon durable de garde, sans prétendre résumer la situation actuelle des remboursements. Les montants, bénéficiaires et calendriers doivent être vérifiés à partir de documents datés avant d’en parler. Les comparaisons avec d’autres services doivent porter sur leur fonctionnement réel, pas uniquement sur leur ancienneté ou leur réputation.",
    "parentIds": [],
    "relatedIds": [
      "counterparty-risk",
      "bitcoin-exchange"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB his201 — The History of Bitcoin's Creation",
      "PlanB his203 — Bitcoin’s Pioneering Era"
    ],
    "questions": [
      "Pourquoi l’histoire de Mt. Gox reste-t-elle importante ?"
    ],
    "status": "reviewed",
    "sourceHash": "88e70a163c7ad3b2b87d2f5a6b2f8a4ffed8ed086b3c939664f446e9e0bab15a",
    "sourcePath": "data/alice-corpus/examples/mt-gox.fr.md",
    "theme": "Histoire et évolution du protocole"
  },
  {
    "id": "curated-multi-path-payment",
    "conceptId": "multi-path-payment",
    "title": "Le paiement en plusieurs chemins",
    "keywords": [
      "Le paiement en plusieurs chemins",
      "Multi-Path Payment",
      "Un paiement peut-il être réparti sur plusieurs routes ?",
      "Lightning",
      "multi path payment"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn paiement Lightning en plusieurs parties répartit le montant entre plusieurs fragments, éventuellement par des chemins différents. Cela aide à utiliser une liquidité que ne pourrait pas mobiliser une seule route.\n\nExplication\nLe destinataire réunit les fragments pour le règlement. Dans le MPP de base, ils partagent le même hash de paiement. BOLT 4 impose d’attendre le total annoncé avant de régler un fragment, puis de régler l’ensemble si un fragment est réglé. Présenter ce mécanisme comme généralement non atomique serait incorrect.\n\nAMP, une variante proposée dans LND, utilise des hashes distincts et des parts de secret. Leur reconstruction exige l’ensemble des fragments. Il faut distinguer cette construction cryptographique de la règle d’attente du MPP de base.\n\nLimites et confusions\nUn paiement fragmenté n’a pas une garantie de succès. Il faut encore suffisamment de liquidité, des chemins accessibles et une coordination dans les délais. Un ensemble incomplet doit échouer plutôt que laisser le destinataire considérer arbitrairement le paiement total comme reçu.\n\nAMP n’est pas universellement préférable ni compatible partout. Le hash commun de MPP peut faciliter certains rapprochements ; le supprimer ne garantit pas l’anonymat. Les preuves de paiement dépendent aussi du mécanisme utilisé.",
    "parentIds": [],
    "relatedIds": [
      "lightning-liquidity-path",
      "lightning-routing"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/lightning/bolts/blob/master/04-onion-routing.md#basic-multi-part-payments",
      "https://docs.lightning.engineering/lightning-network-tools/lnd/amp"
    ],
    "questions": [
      "Un paiement peut-il être réparti sur plusieurs routes ?"
    ],
    "status": "reviewed",
    "sourceHash": "9ec2f77e49cd649891e24fd7827a694036d6d989611e54edde1830eb8a3d7552",
    "sourcePath": "data/alice-corpus/examples/multi-path-payment.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-multisig",
    "conceptId": "multisig",
    "title": "La signature multiple",
    "keywords": [
      "La signature multiple",
      "Multisig",
      "Que signifie une configuration 2 sur 3 ?",
      "wallets",
      "multisig"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne configuration multisig exige plusieurs signatures parmi un ensemble de clés. Dans un schéma 2 sur 3, 2 clés distinctes parmi les 3 prévues doivent autoriser la dépense.\n\nExplication\nCette organisation peut répartir le contrôle entre appareils, lieux ou personnes. Une seule clé compromise ne suffit alors pas à satisfaire ce seuil, et la perte d’une clé peut rester tolérable si les autres moyens nécessaires sont disponibles.\n\nLa sauvegarde doit décrire les conditions exactes, les clés publiques des cosignataires et les chemins ou descripteurs. Conserver uniquement les mots d’un appareil ne reconstitue pas forcément le portefeuille complet.\n\nLimites et confusions\nLe multisig n’est pas automatiquement plus sûr. Placer les clés et leurs sauvegardes au même endroit peut annuler le bénéfice de séparation. Une procédure incomprise complique la récupération et la transmission. Le nombre d’appareils ne prouve pas leur indépendance. Il faut distinguer le seuil de signature de la simple double authentification d’un compte centralisé.",
    "parentIds": [],
    "relatedIds": [
      "descriptor-wallet",
      "wallet-backup",
      "partially-signed-bitcoin-transaction",
      "secondary-bitcoin-defense-in-depth",
      "secondary-bitcoin-musig"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB pro202 — Programming Bitcoin"
    ],
    "questions": [
      "Que signifie une configuration 2 sur 3 ?"
    ],
    "status": "reviewed",
    "sourceHash": "72fb2d53af6943eeb9bf3b4209e67307c1d73323e99d61a4f0334de54a5d2182",
    "sourcePath": "data/alice-corpus/examples/multisig.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-network-effects-in-money",
    "conceptId": "network-effects-in-money",
    "title": "Les effets de réseau monétaires",
    "keywords": [
      "Les effets de réseau monétaires",
      "Network Effects in Money",
      "Pourquoi le nombre d’utilisateurs peut-il compter ?",
      "Monnaie et économie",
      "network effects in money"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne monnaie devient plus utile lorsque davantage de personnes peuvent la recevoir et l’employer. Ces effets de réseau favorisent l’adoption, mais donnent aussi une forte inertie aux monnaies déjà établies.\n\nExplication\nUn utilisateur tient compte de ce qu’il pourra faire après avoir reçu une monnaie. Les commerçants, les outils de paiement, la liquidité des échanges et les habitudes comptables contribuent à cette utilité. Les effets de réseau ne se limitent donc pas au nombre de comptes créés.\n\nPour Bitcoin, ils incluent aussi l’infrastructure, les développeurs, les nœuds et l’expérience accumulée. Copier le code d’un logiciel ne reproduit pas automatiquement cet ensemble de relations et de confiance. Une innovation technique doit encore être comprise, utilisée et entretenue.\n\nLimites et confusions\nUn effet de réseau ne garantit pas une adoption universelle ni une hausse permanente du prix. Les contraintes d’usage, les alternatives et les risques de garde peuvent limiter son développement.\n\nIl faut distinguer personnes réellement actives, volumes utiles et indicateurs faciles à gonfler. Le concept explique une dynamique possible ; il ne fournit pas une formule fiable pour valoriser Bitcoin ou prédire sa domination. Il reste utile pour comparer adoption technique et adoption monétaire.",
    "parentIds": [],
    "relatedIds": [
      "money-functions",
      "medium-of-exchange",
      "secondary-economics-emergence-of-money"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco205 — The Austrian school of economics"
    ],
    "questions": [
      "Pourquoi le nombre d’utilisateurs peut-il compter ?"
    ],
    "status": "reviewed",
    "sourceHash": "aa3af6bb52f079a3d70b0ab881204f29dbe30ea5e8d9718096eef850e8835d45",
    "sourcePath": "data/alice-corpus/examples/network-effects-in-money.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-node-initial-sync",
    "conceptId": "node-initial-sync",
    "title": "Comprendre la première synchronisation",
    "keywords": [
      "Comprendre la première synchronisation",
      "IBD",
      "initial block download",
      "Pourquoi une première synchronisation est-elle longue ?",
      "Pourquoi l’élagage ne supprime-t-il pas tout le travail initial ?",
      "nodes",
      "node initial sync"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa première synchronisation construit l’état de chaîne dont le nœud a besoin à partir des données du réseau. Elle implique du téléchargement et du traitement local.\n\nExplication\nLa durée dépend du processeur, du disque, de la connexion, de la mémoire disponible et de la configuration du cache. Un cache plus grand peut réduire les accès au disque pendant la validation, dans les limites de la mémoire réellement disponible. Réduire la conservation des anciens blocs n’annule pas automatiquement leur traitement. Les mécanismes de démarrage optimisé doivent être distingués du parcours classique et évalués selon leurs hypothèses.\n\nBitcoin Core propose notamment 2 mécanismes distincts.\n\n- `assumevalid` permet, sous certaines conditions, de ne pas refaire la vérification des scripts et signatures de blocs anciens précédant un bloc de référence considéré valide. Les blocs sont toujours téléchargés et les autres règles restent vérifiées. Ce mécanisme réduit du travail de calcul ; il ne remplace pas l’historique par un état téléchargé. Il peut être désactivé pour vérifier aussi ces scripts.\n- AssumeUTXO permet de charger un instantané de l’ensemble des UTXO à une hauteur reconnue par le logiciel. Son empreinte doit correspondre à celle inscrite dans Bitcoin Core. Le nœud peut alors rejoindre la pointe de la chaîne depuis cet état pendant qu’une autre synchronisation traite l’historique en arrière-plan. L’état reconstruit est comparé à l’état attendu une fois cette vérification historique terminée. Bitcoin Core 28.0 documente cette possibilité sur mainnet à la hauteur 840 000.\n\nLimites et confusions\nAucune durée universelle n’est garantie. Un pourcentage d’avancement ne prédit pas toujours un temps restant constant. Cette fiche n’affirme pas que toutes les configurations exécutent exactement les mêmes vérifications historiques.\n\nAvec AssumeUTXO, disponibilité plus rapide et vérification historique terminée sont 2 étapes distinctes. Le travail historique n’est pas supprimé. Le téléchargement des blocs, les index et l’espace disque temporaire restent des contraintes ; un instantané ne fournit pas à lui seul l’historique des transactions d’un wallet. Ces descriptions concernent les mécanismes documentés dans Bitcoin Core, sans affirmer qu’Alice les configure ou les utilise.",
    "parentIds": [
      "bitcoin-node"
    ],
    "relatedIds": [
      "pruned-node-history"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://developer.bitcoin.org/devguide/p2p_network.html",
      "https://bitcoincore.org/en/releases/0.14.0/",
      "https://bitcoincore.org/en/releases/28.0/",
      "https://github.com/bitcoin/bitcoin/blob/v28.0/doc/design/assumeutxo.md"
    ],
    "questions": [
      "Pourquoi une première synchronisation est-elle longue ?",
      "Pourquoi l’élagage ne supprime-t-il pas tout le travail initial ?"
    ],
    "status": "reviewed",
    "sourceHash": "4af37e8faa561f9ab437d1b923b07070de7d35889cc02e28ec02e114538879a8",
    "sourcePath": "data/alice-corpus/examples/node-initial-sync.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-non-blockchain-privacy-leaks",
    "conceptId": "non-blockchain-privacy-leaks",
    "title": "Les fuites hors de la blockchain",
    "keywords": [
      "Les fuites hors de la blockchain",
      "Non-Blockchain Privacy Leaks",
      "Quelles habitudes peuvent révéler mes usages Bitcoin ?",
      "privacy",
      "non blockchain privacy leaks"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa confidentialité peut être compromise sans analyser directement la blockchain. Les comptes, les appareils, les achats et les échanges humains donnent souvent le contexte qui relie une transaction à une personne.\n\nExplication\nUn serveur de portefeuille peut observer les adresses consultées. Un marchand connaît une livraison. Un support peut recevoir une capture d’écran révélant un solde ou un historique. Une publication publique peut faire connaître des habitudes et des avoirs supposés.\n\nCes éléments peuvent être combinés avec le registre public. Une bonne pratique on-chain ne suffit donc pas si les mêmes informations sont ensuite publiées ou transmises sans nécessité à un tiers.\n\nLimites et confusions\nUn outil de confidentialité protège un périmètre précis. Tor agit sur une partie du réseau ; le coin control agit sur la sélection des fonds ; aucun ne retire une identité déjà communiquée dans une conversation ou une base client. Les mesures utiles dépendent des informations sensibles et des acteurs capables de les rapprocher.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-p2p-privacy",
      "kyc-data-leakage",
      "utxo-labeling",
      "secondary-bitcoin-privacy-by-omission",
      "secondary-opsec-bitcoin-discretion",
      "secondary-privacy-browser-compartmentalization",
      "secondary-privacy-metadata-hygiene",
      "secondary-privacy-private-browsing-mode",
      "secondary-privacy-public-wi-fi-risk"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Quelles habitudes peuvent révéler mes usages Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "a5e4221629e50cd18e5b8fba720c8e73fed3ff68bf3918bc70add0d9fedca42d",
    "sourcePath": "data/alice-corpus/examples/non-blockchain-privacy-leaks.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-outbound-liquidity",
    "conceptId": "outbound-liquidity",
    "title": "La capacité d’envoi",
    "keywords": [
      "La capacité d’envoi",
      "Outbound Liquidity",
      "Quelle quantité puis-je envoyer par un canal ?",
      "Lightning",
      "outbound liquidity"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa liquidité sortante est la capacité d’envoyer des sats par vos canaux Lightning. Elle dépend des fonds disponibles de votre côté, puis des routes permettant de rejoindre le destinataire.\n\nExplication\nFinancer un canal apporte généralement de la capacité d’envoi à celui qui fournit les fonds. Quand il paie, la répartition se déplace vers le pair ; quand il reçoit, des fonds reviennent de son côté. La capacité totale du canal peut rester identique pendant ces échanges.\n\nIl faut distinguer la part locale brute du montant effectivement envoyable. Les réserves de canal, les frais nécessaires et les paiements déjà engagés peuvent limiter l’envoi immédiat. Un portefeuille peut déjà tenir compte de ces contraintes dans son affichage, selon l’indicateur choisi.\n\nLimites et confusions\nAvoir assez de fonds au départ ne garantit pas que toutes les routes possèdent assez de liquidité jusqu’au destinataire. Inversement, un échec ne signifie pas nécessairement que les fonds ont disparu.\n\nLa réserve n’est pas une somme confisquée par l’autre participant. Elle reste liée au règlement du canal mais limite certains paiements lorsqu’il est ouvert. Pour une opération réelle, utiliser le montant envoyable indiqué par le logiciel et examiner le devis de frais.",
    "parentIds": [],
    "relatedIds": [
      "lightning-liquidity-path",
      "lightning-routing"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB lnp202 — Set up Your First Lightning Node"
    ],
    "questions": [
      "Quelle quantité puis-je envoyer par un canal ?"
    ],
    "status": "reviewed",
    "sourceHash": "3870e4087008bb2933a200bf688a063b080df12eb3a232e2a482ee93ebc0605c",
    "sourcePath": "data/alice-corpus/examples/outbound-liquidity.fr.md",
    "theme": "Lightning"
  },
  {
    "id": "curated-p2p-bitcoin-acquisition",
    "conceptId": "p2p-bitcoin-acquisition",
    "title": "Les échanges entre personnes",
    "keywords": [
      "Les échanges entre personnes",
      "P2P Bitcoin Acquisition",
      "Que signifie acheter ou vendre en pair à pair ?",
      "Usages et comparaisons",
      "p2p bitcoin acquisition"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn échange P2P met directement en relation des personnes qui souhaitent acheter ou vendre du bitcoin. Il peut réduire certaines dépendances à une plateforme centrale, mais ne supprime pas les risques de transaction.\n\nExplication\nLes échanges peuvent utiliser différents moyens de paiement et parfois un service de mise en relation ou de séquestre. Il faut comprendre qui contrôle les fonds à chaque étape, comment un litige serait traité et quelles conditions déclenchent leur libération.\n\nLa confidentialité dépend aussi du moyen de paiement. Un virement, une conversation ou un rendez-vous peut révéler des informations même en l’absence d’un dossier d’identité centralisé. Les frais et les écarts de prix peuvent rémunérer le service ou refléter une liquidité limitée.\n\nLimites et confusions\nP2P ne signifie ni anonyme ni sans intermédiaire. Un séquestre peut ajouter une dépendance, et un échange direct expose à la fraude ou à des risques de sécurité personnelle. Une preuve de paiement présentée par l’autre personne n’équivaut pas toujours à un règlement définitif.\n\nAlice doit expliquer les mécanismes et les risques sans promettre l’absence de traces ni donner une règle juridique valable partout. La disponibilité et les conditions d’un service concret doivent être vérifiées séparément.",
    "parentIds": [],
    "relatedIds": [
      "counterparty-risk",
      "bitcoin-exchange"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins"
    ],
    "questions": [
      "Que signifie acheter ou vendre en pair à pair ?"
    ],
    "status": "reviewed",
    "sourceHash": "2ef983b3ff4d8f8083471080ff693e711d8bed5907c75d4796a7fcaf5b5eb5a1",
    "sourcePath": "data/alice-corpus/examples/p2p-bitcoin-acquisition.fr.md",
    "theme": "Usages et comparaisons"
  },
  {
    "id": "curated-paper-bitcoin",
    "conceptId": "paper-bitcoin",
    "title": "Bitcoin détenu et exposition au prix",
    "keywords": [
      "Bitcoin détenu et exposition au prix",
      "Paper Bitcoin",
      "Quelle différence entre posséder des clés et détenir une créance ?",
      "Usages et comparaisons",
      "paper bitcoin"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\n« Paper Bitcoin » désigne informellement une exposition au bitcoin sans contrôle direct de ses clés. Un ETF, un contrat dérivé et un solde sur une plateforme sont cependant des structures différentes.\n\nExplication\nCertains produits détiennent effectivement des BTC pour leurs investisseurs ; d’autres reposent sur des contrats ou des créances. Le détenteur du produit dépend de ses règles, de ses prestataires et de ses modalités de sortie. Il ne peut pas supposer qu’il peut dépenser directement les bitcoins sous-jacents.\n\nLes possibilités de prêt, de garantie ou de réhypothèque doivent être vérifiées produit par produit. Par exemple, le prospectus IBIT du 2025-07-31 interdit en principe ces usages des actifs, avec une exception concernant les crédits de négociation. Cette règle datée n’est pas une vérification indépendante de toutes les opérations.\n\nLimites et confusions\nIl est incorrect de supposer que tous les ETF créent une exposition sans réserves ou réutilisent systématiquement les BTC. La critique de la dépendance aux intermédiaires reste pertinente, mais doit être séparée d’accusations factuelles non établies.\n\nLa crainte que la financiarisation réduise l’usage direct est une analyse économique. Enfin, un paper wallet est un support de clés ; le mot « papier » n’en fait pas une créance financière.",
    "parentIds": [],
    "relatedIds": [
      "counterparty-risk",
      "bitcoin-exchange"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://www.sec.gov/Archives/edgar/data/1980994/000143774925024228/bit20250731_424b3.htm"
    ],
    "questions": [
      "Quelle différence entre posséder des clés et détenir une créance ?"
    ],
    "status": "reviewed",
    "sourceHash": "93826c7ad8640be391648109b1df4e5a2fdd37a120ecf72046bdee5425abf45d",
    "sourcePath": "data/alice-corpus/examples/paper-bitcoin.fr.md",
    "theme": "Usages et comparaisons"
  },
  {
    "id": "curated-partially-signed-bitcoin-transaction",
    "conceptId": "partially-signed-bitcoin-transaction",
    "title": "Préparer et signer une transaction avec PSBT",
    "keywords": [
      "Préparer et signer une transaction avec PSBT",
      "Partially Signed Bitcoin Transaction",
      "Comment séparer préparation et signature ?",
      "transactions",
      "partially signed bitcoin transaction"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nPSBT est un format d’échange pour préparer et signer une transaction Bitcoin entre plusieurs outils. Il permet de séparer la construction, la vérification, la signature et la diffusion.\n\nExplication\nUn ordinateur peut préparer la transaction avec ses entrées, ses sorties et les informations utiles. Un appareil de signature reçoit ensuite ces éléments, vérifie ce qu’il peut en comprendre et ajoute les signatures autorisées. Une fois les signatures nécessaires réunies, la transaction peut être finalisée puis diffusée.\n\nCe modèle est utile pour un hardware wallet, une conservation hors ligne ou une configuration multisig. Les clés privées n’ont pas besoin d’être transmises à l’ordinateur qui coordonne le paiement.\n\nLimites et confusions\nUne PSBT peut contenir des informations sensibles pour la confidentialité. Son format ne garantit ni la bonne destination ni l’absence de logiciel malveillant. Le signataire doit contrôler ce qu’il autorise sur son interface de confiance. « Partiellement signée » désigne le format et le processus ; le fichier peut aussi circuler avant toute signature.",
    "parentIds": [],
    "relatedIds": [
      "hardware-wallet",
      "multisig",
      "cold-storage"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB pos305 — Mastering BTC Pay Server",
      "PlanB Extraction — 2026-05-23 — csv404"
    ],
    "questions": [
      "Comment séparer préparation et signature ?"
    ],
    "status": "reviewed",
    "sourceHash": "3e15d4684f07e81ebdd4e3ff49511646fec5418f64769a226490a98815fd24d9",
    "sourcePath": "data/alice-corpus/examples/partially-signed-bitcoin-transaction.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-password-manager",
    "conceptId": "password-manager",
    "title": "Les gestionnaires de mots de passe",
    "keywords": [
      "Les gestionnaires de mots de passe",
      "Password Manager",
      "À quoi sert un gestionnaire pour mes comptes ?",
      "security",
      "password manager"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn gestionnaire de mots de passe aide à créer et conserver des mots de passe distincts pour chaque compte. Il réduit notamment le risque qu’une fuite sur un service donne accès à tous les autres.\n\nExplication\nLe coffre permet de ne pas mémoriser chaque secret individuel. Sa protection et sa récupération deviennent alors essentielles. Le remplissage associé au bon domaine peut aider à repérer certaines imitations, mais ne remplace pas toute vérification de l’origine d’un site.\n\nCette protection concerne les comptes de messagerie, les plateformes et les services associés à l’usage de Bitcoin. Elle s’articule avec un second facteur et avec les procédures de récupération du service.\n\nLimites et confusions\nLe gestionnaire ne rend pas sûr un appareil compromis. Perdre tout accès au coffre peut aussi bloquer des comptes si la récupération n’a pas été pensée. Les mots de passe applicatifs et la phrase de récupération Bitcoin n’ont pas le même rôle ; une stratégie de coffre en ligne ne doit pas être automatiquement transposée aux secrets de garde des bitcoins.",
    "parentIds": [],
    "relatedIds": [
      "two-factor-authentication",
      "phishing-and-social-engineering",
      "wallet-recovery-phrase",
      "secondary-opsec-data-breach-monitoring",
      "secondary-privacy-digital-inheritance",
      "secondary-privacy-strong-password"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB scu202 — Improve Your Personal Digital Security",
      "PlanB Extraction — 2026-05-23 — scu101"
    ],
    "questions": [
      "À quoi sert un gestionnaire pour mes comptes ?"
    ],
    "status": "reviewed",
    "sourceHash": "5b24fe736d6c6b5414add7fa127a9fbafb67fd241d6b84e8142e187d8ddac3f2",
    "sourcePath": "data/alice-corpus/examples/password-manager.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-payjoin",
    "conceptId": "payjoin",
    "title": "Comprendre PayJoin",
    "keywords": [
      "Comprendre PayJoin",
      "PayJoin",
      "Comment un PayJoin modifie-t-il la lecture d’un paiement ?",
      "privacy",
      "payjoin"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn PayJoin est un paiement collaboratif dans lequel le destinataire apporte aussi une entrée. Il contredit ainsi l’hypothèse simple selon laquelle toutes les entrées appartiennent au payeur.\n\nExplication\nLes participants préparent une transaction commune qui conserve l’objectif du paiement tout en combinant leurs apports. Pour un observateur extérieur, cette transaction peut ressembler à un paiement ordinaire plutôt qu’à une opération explicitement dédiée à la confidentialité.\n\nCette organisation dépend de la compatibilité des outils et du mécanisme de coordination. Elle peut aussi modifier la gestion des UTXO du destinataire, puisque celui-ci participe avec ses propres fonds.\n\nLimites et confusions\nLes montants et la transaction restent publics. Le bénéfice porte sur l’interprétation des relations, pas sur leur disparition complète. Le payeur et le destinataire connaissent des informations liées à leur propre échange ; les autres canaux de données comptent toujours. Toutes les transactions à plusieurs entrées ne sont pas des PayJoin, et tout portefeuille ne les prend pas en charge.",
    "parentIds": [],
    "relatedIds": [
      "common-input-ownership-heuristic",
      "coinjoin",
      "bitcoin-chain-analysis"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc204 — Privacy on Bitcoin",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Comment un PayJoin modifie-t-il la lecture d’un paiement ?"
    ],
    "status": "reviewed",
    "sourceHash": "c5256f262871e53cf66f3f44a596ff8f7dc74fc5839379a05ed8b9f1f953f9cc",
    "sourcePath": "data/alice-corpus/examples/payjoin.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-phishing-and-social-engineering",
    "conceptId": "phishing-and-social-engineering",
    "title": "Les faux supports et le phishing",
    "keywords": [
      "Les faux supports et le phishing",
      "Phishing and Social Engineering",
      "Comment un faux support essaie-t-il de voler mes fonds ?",
      "security",
      "phishing and social engineering"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe phishing et l’ingénierie sociale cherchent à faire révéler un secret ou autoriser une action en trompant la personne. L’attaque exploite sa confiance plutôt qu’une faiblesse de la cryptographie Bitcoin.\n\nExplication\nUn message peut imiter un support, annoncer une urgence ou proposer une fausse mise à jour. Les canaux incluent les courriels, les SMS, les appels, les réseaux sociaux et les sites imités. Les cibles peuvent être la phrase de récupération, le mot de passe, un code d’authentification ou l’accès à distance.\n\nLa bonne question est de savoir comment l’identité de l’interlocuteur est établie. Répondre au même message ou suivre son lien ne constitue pas une vérification indépendante.\n\nLimites et confusions\nUn mot de passe unique et la double authentification réduisent certains risques sans rendre tous les échanges sûrs. Un code peut lui aussi être demandé frauduleusement. Un support n’a pas besoin de recevoir les mots de récupération pour expliquer le fonctionnement d’un portefeuille. Un message rassurant et sans faute peut néanmoins être malveillant.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-scams",
      "two-factor-authentication",
      "software-download-hygiene",
      "secondary-privacy-browser-extensions-risk",
      "secondary-privacy-https-verification",
      "secondary-privacy-secure-email-account"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB scu202 — Improve Your Personal Digital Security",
      "PlanB Extraction — 2026-05-23 — scu101"
    ],
    "questions": [
      "Comment un faux support essaie-t-il de voler mes fonds ?"
    ],
    "status": "reviewed",
    "sourceHash": "5636118e7854240fa237a04450ffbac215ae6757e7b7708addb621b7081d7dda",
    "sourcePath": "data/alice-corpus/examples/phishing-and-social-engineering.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-physical-security-for-bitcoiners",
    "conceptId": "physical-security-for-bitcoiners",
    "title": "La sécurité physique",
    "keywords": [
      "La sécurité physique",
      "Physical Security for Bitcoiners",
      "Pourquoi la discrétion compte-t-elle aussi ?",
      "security",
      "physical security for bitcoiners"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa sécurité des bitcoins dépend aussi de la protection des personnes. Relier une identité, une adresse physique et des avoirs supposés peut créer une exposition qui dépasse les risques informatiques.\n\nExplication\nDes informations proviennent des publications, des achats, des livraisons, des rencontres ou de fuites de données d’identification. Leur combinaison peut donner à un tiers une idée des habitudes et des fonds d’une personne, même si cette idée est inexacte.\n\nLa discrétion et la limitation des données diffusées participent donc à la sécurité. Une organisation de garde doit être réfléchie avec les conséquences pour les proches et la compréhension des procédures, pas seulement avec des critères cryptographiques.\n\nLimites et confusions\nUn bon appareil de signature ne supprime pas la vulnérabilité physique du détenteur. Les bases d’incidents publics reflètent aussi les cas médiatisés et les méthodes de classement ; elles ne donnent pas automatiquement la fréquence réelle du risque. Cette fiche expose un principe de protection et ne prétend pas prévoir le risque individuel à partir du seul montant détenu.",
    "parentIds": [],
    "relatedIds": [
      "kyc-data-leakage",
      "non-blockchain-privacy-leaks",
      "threat-model",
      "secondary-opsec-bitcoin-discretion",
      "secondary-privacy-full-disk-encryption",
      "secondary-privacy-metadata-hygiene"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "Marius Farashi — Face à la hausse des agressions et enlèvements crypto, une boutique Bitcoin ferme ses portes à Paris",
      "Jameson Lopp — Physical Bitcoin Attacks"
    ],
    "questions": [
      "Pourquoi la discrétion compte-t-elle aussi ?"
    ],
    "status": "reviewed",
    "sourceHash": "8762b47d737f8e91dec0639aac8245dcffe7d7fde0cbe104e936136c8634e317",
    "sourcePath": "data/alice-corpus/examples/physical-security-for-bitcoiners.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-playground-testnet-limits",
    "conceptId": "playground-testnet-limits",
    "title": "Ce que le playground permet de tester",
    "keywords": [
      "Ce que le playground permet de tester",
      "Mutinynet",
      "réseau de test",
      "Si un paiement marche sur Mutinynet, fonctionnera-t-il de la même façon sur mainnet ?",
      "Le préfixe d’adresse suffit-il pour identifier le réseau ?",
      "alice-app",
      "learning",
      "playground testnet limits"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe playground permet de pratiquer un parcours de transaction sur un réseau de test. Il ne garantit pas les mêmes frais, délais ou conditions d’utilisation sur mainnet.\n\nExplication\nMutinynet est un signet personnalisé, un réseau de test où les blocs doivent porter les signatures autorisées par sa configuration. Sa documentation annonce une cadence d’environ 30 secondes par bloc, contre environ 10 minutes en moyenne sur Bitcoin mainnet. Cela ne garantit pas une confirmation dans les 30 secondes. Ses sats sont destinés aux essais et n’ont pas de valeur monétaire.\n\nPour les formats usuels, les préfixes distinguent mainnet (`bc1`, `1`, `3`) des réseaux de test (`tb1`, `m`, `n`, `2`). En revanche, plusieurs réseaux de test partagent leurs préfixes. Une adresse `tb1` ne suffit donc pas à identifier Mutinynet ; il faut vérifier le réseau choisi et le service interrogé.\n\nLe playground dépend d’une infrastructure tierce pour consulter et diffuser les transactions. Une indisponibilité de ces services peut interrompre l’exercice, sans signifier une panne de Bitcoin mainnet.\n\nLimites et confusions\nUn résultat observé sur Mutinynet reste un résultat de test. Les frais, la cadence des blocs, les conditions de validation et la disponibilité des services peuvent différer de mainnet. Réussir un paiement ici ne suffit pas à prévoir ses conditions sur le réseau principal.",
    "parentIds": [
      "alice-playground"
    ],
    "relatedIds": [],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "alice-repo:apps/app-web/src/lib/playground.ts",
      "alice-repo:packages/practice-wallet/src/practice-keys.ts",
      "https://github.com/MutinyWallet/mutiny-net",
      "https://github.com/bitcoin/bips/blob/master/bip-0325.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki",
      "https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp"
    ],
    "questions": [
      "Si un paiement marche sur Mutinynet, fonctionnera-t-il de la même façon sur mainnet ?",
      "Le préfixe d’adresse suffit-il pour identifier le réseau ?"
    ],
    "status": "reviewed",
    "sourceHash": "ffc5a089125733ef5f57ea04e379fb948ae7ea818b6fc4eb2145a0d9cf3dbc97",
    "sourcePath": "data/alice-corpus/examples/playground-testnet-limits.fr.md",
    "theme": "alice-app"
  },
  {
    "id": "curated-price-discovery",
    "conceptId": "price-discovery",
    "title": "La formation des prix",
    "keywords": [
      "La formation des prix",
      "Price Discovery",
      "Comment un prix de marché se forme-t-il ?",
      "Monnaie et économie",
      "price discovery"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa formation des prix résulte des offres, des demandes et des échanges. Elle rassemble des informations dispersées sans garantir que le prix obtenu soit juste, stable ou impossible à manipuler.\n\nExplication\nLes participants n’accordent pas nécessairement la même valeur à un bien et n’ont pas les mêmes besoins de liquidité. Leurs décisions font émerger des prix de transaction. La profondeur des marchés et l’accès à l’information influencent la manière dont une nouvelle demande se traduit dans le cours.\n\nL’école autrichienne insiste sur les évaluations subjectives et les signaux transmis par les échanges. Cette grille de lecture aide à comprendre certains arguments bitcoiners, mais doit être attribuée lorsqu’elle devient une interprétation générale de l’économie.\n\nLimites et confusions\nUn prix observable n’est pas une mesure certaine d’une valeur intrinsèque ni une prévision du prix suivant. Des contraintes d’accès, des manipulations ou une liquidité faible peuvent altérer la qualité du signal.\n\nLe coût de production d’un bitcoin ne fixe pas automatiquement son cours. Un acheteur n’est pas obligé de couvrir les dépenses d’un mineur. Décrire la découverte des prix ne permet donc pas de recommander un point d’entrée ou d’annoncer un plancher garanti.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-volatility",
      "mining-profitability",
      "secondary-economics-hayek-knowledge-problem",
      "secondary-economics-marginal-utility",
      "secondary-economics-mises-regression-theorem",
      "secondary-economics-subjective-theory-of-value"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco205 — The Austrian school of economics"
    ],
    "questions": [
      "Comment un prix de marché se forme-t-il ?"
    ],
    "status": "reviewed",
    "sourceHash": "394cf2ad085a93f6e90f33f199051766a784f23960f27255db8b735b01aa1c52",
    "sourcePath": "data/alice-corpus/examples/price-discovery.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-programmable-money",
    "conceptId": "programmable-money",
    "title": "La monnaie programmable",
    "keywords": [
      "La monnaie programmable",
      "Programmable Money",
      "Que peut signifier programmer une monnaie ou un paiement ?",
      "Monnaie et économie",
      "programmable money"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa monnaie programmable peut désigner des paiements conditionnels ou des restrictions imposées à l’usage des fonds. Il faut préciser qui écrit les conditions et qui peut les modifier.\n\nExplication\nLes participants peuvent choisir des règles pour une opération, comme exiger plusieurs signatures ou attendre un délai. Un émetteur central peut, dans une autre architecture, limiter les destinataires ou les catégories de dépenses. Ces mécanismes ne distribuent pas le même pouvoir.\n\nBitcoin Script permet des conditions de dépense fixées lors de la création d’une sortie. Cela ne signifie pas qu’une autorité centrale du protocole décide quels achats chaque utilisateur peut effectuer. Un service utilisé autour de Bitcoin peut néanmoins imposer ses propres règles à ses clients.\n\nLimites et confusions\nAutomatiser un paiement ne revient pas nécessairement à rendre chaque unité monétaire utilisable seulement dans certains commerces. L’expression générale « programmable » masque parfois cette différence.\n\nUne fonction peut faciliter un usage légitime et accroître en même temps les possibilités de contrôle. L’évaluation doit décrire les pouvoirs concrets, les données accessibles et les recours. Les restrictions d’une MNBC ou d’un stablecoin doivent être rapportées au système concerné, sans être supposées identiques partout.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-script",
      "cbdc"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://developer.bitcoin.org/devguide/transactions.html",
      "https://developer.bitcoin.org/devguide/contracts.html"
    ],
    "questions": [
      "Que peut signifier programmer une monnaie ou un paiement ?"
    ],
    "status": "reviewed",
    "sourceHash": "d4dda45088223fe845720790fc84e824df6d8e64375bcdb44310bf83062f30c4",
    "sourcePath": "data/alice-corpus/examples/programmable-money.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-proof-of-work",
    "conceptId": "proof-of-work",
    "title": "La preuve de travail",
    "keywords": [
      "La preuve de travail",
      "Proof of Work",
      "Pourquoi produire une preuve de travail ?",
      "mining",
      "proof of work"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa preuve de travail permet aux mineurs de proposer des blocs en fournissant un résultat coûteux à produire et facile à vérifier. Les nœuds retiennent la chaîne valide qui représente le plus de travail accumulé.\n\nExplication\nLes mineurs essaient des variantes d’en-tête de bloc jusqu’à obtenir un hash inférieur ou égal à la cible. Ils ne disposent pas d’un raccourci leur garantissant la prochaine réussite. Les nœuds peuvent ensuite contrôler le résultat et la validité du bloc avec bien moins de calcul.\n\nRefaire un historique demande de produire du travail concurrent. La difficulté règle la fréquence attendue des réussites en fonction des conditions de production observées.\n\nLimites et confusions\nLes mineurs proposent les blocs, mais ne peuvent pas imposer aux nœuds un bloc contraire à leurs règles. Détenir des BTC ne donne pas directement un vote dans ce mécanisme. Le capital peut cependant financer matériel et énergie ; la preuve de travail ne supprime pas le pouvoir économique. Production des blocs et vérification par les nœuds ont des coûts distincts.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-mining",
      "hashrate",
      "mining-difficulty",
      "secondary-bitcoin-merged-mining",
      "secondary-bitcoin-rpow",
      "secondary-bitcoin-sha-256",
      "secondary-economics-proof-of-stake"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp",
      "https://bitcoin.org/bitcoin.pdf"
    ],
    "questions": [
      "Pourquoi produire une preuve de travail ?"
    ],
    "status": "reviewed",
    "sourceHash": "aaccd7b29350270a3aa34f8a55611df1b6ea3d9b24d6a8fe5b5bd1d583418e22",
    "sourcePath": "data/alice-corpus/examples/proof-of-work.fr.md",
    "theme": "mining"
  },
  {
    "id": "curated-pruned-node",
    "conceptId": "pruned-node",
    "title": "Le nœud élagué",
    "keywords": [
      "Le nœud élagué",
      "Pruned Node",
      "Peut-on vérifier Bitcoin sans stocker tous les anciens blocs ?",
      "nodes",
      "pruned node"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn nœud élagué vérifie Bitcoin puis supprime une partie des anciens fichiers de blocs pour réduire l’espace disque. Il conserve l’état nécessaire à la validation des nouveaux blocs.\n\nExplication\nL’élagage sépare validation et conservation de l’historique. Le nœud ne transforme pas les anciens blocs en éléments invalides ; il cesse simplement de garder certaines de leurs données sur son disque. Cela permet de réduire les besoins de stockage sans remplacer la validation par une simple confiance dans un serveur.\n\nCette économie limite en revanche certaines recherches historiques et certains services d’indexation. Le logiciel doit retrouver ailleurs les données supprimées lorsqu’un nouvel usage en a besoin.\n\nLimites et confusions\nÉlagué ne signifie pas SPV. La récupération d’un ancien bloc dépend des pairs, du logiciel et de leur disponibilité. Selon l’opération, un bloc précis peut suffire ou davantage d’historique peut être nécessaire. Il est donc imprécis d’affirmer qu’il faut toujours tout télécharger à nouveau ou qu’un ancien bloc sera toujours immédiatement accessible.",
    "parentIds": [],
    "relatedIds": [
      "full-node",
      "pruned-node-history",
      "node-initial-sync"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc202 — Setting up your first Bitcoin node",
      "PlanB Extraction — 2026-05-23 — lnp404"
    ],
    "questions": [
      "Peut-on vérifier Bitcoin sans stocker tous les anciens blocs ?"
    ],
    "status": "reviewed",
    "sourceHash": "b4924fc8f6f00816cbf438a793a0683bc2566da8cfc77b000eae9e3ad2499963",
    "sourcePath": "data/alice-corpus/examples/pruned-node.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-pruned-node-history",
    "conceptId": "pruned-node-history",
    "title": "Élagage et accès à l’historique",
    "keywords": [
      "Élagage et accès à l’historique",
      "pruning",
      "blocs élagués",
      "Pourquoi mon nœud élagué ne retrouve-t-il pas un ancien bloc ?",
      "Élagué veut-il dire vérification incomplète ?",
      "nodes",
      "pruned node history"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’élagage réduit les fichiers de blocs conservés. Il ne transforme pas, à lui seul, un nœud de validation complète en client léger.\n\nExplication\nAprès avoir traité les blocs, le nœud conserve l’état nécessaire à la validation courante et peut supprimer des données anciennes. Une demande portant sur un bloc supprimé ne peut pas être servie depuis ce fichier local absent. Une opération historique peut donc nécessiter de récupérer à nouveau des données.\n\nIl faut distinguer la consultation d’un bloc précis et une opération nécessitant une longue période d’historique. Bitcoin Core 30.0 documente `getblockfrompeer`, qui permet de demander un bloc à un pair connecté lorsque son en-tête est connu. Cela peut éviter de reprendre toute la chaîne pour cette seule consultation. La requête ne garantit pas que le pair fournira le bloc ; une réponse indiquant que la demande est planifiée n’est pas une confirmation de réception.\n\nUne opération couvrant beaucoup de transactions anciennes peut nécessiter davantage de blocs, l’utilisation d’une autre source d’historique ou un retéléchargement plus large. L’étendue dépend du besoin, des données conservées et des capacités du logiciel. Il ne faut donc affirmer ni qu’un bloc isolé suffit toujours, ni que toute demande historique impose de retélécharger la chaîne entière.\n\nLimites et confusions\nLes possibilités de récupération et d’indexation dépendent du logiciel et de sa version. La source historique citée documente le principe ; ses limites logicielles de 2015 ne sont pas présentées comme les capacités actuelles.\n\nSelon la documentation Bitcoin Core 30.0, le bloc récupéré auprès d’un pair peut être élagué à nouveau dès sa réception. Cette récupération ne recrée pas les données d’annulation du bloc, ce qui limite les usages qui en dépendent. Récupérer un bloc ne transforme donc pas le nœud en nœud d’archive et ne reconstitue pas automatiquement tout l’historique nécessaire à une autre opération.",
    "parentIds": [
      "bitcoin-node"
    ],
    "relatedIds": [
      "node-initial-sync"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning",
      "https://bitcoincore.org/en/doc/30.0.0/rpc/blockchain/getblockfrompeer/"
    ],
    "questions": [
      "Pourquoi mon nœud élagué ne retrouve-t-il pas un ancien bloc ?",
      "Élagué veut-il dire vérification incomplète ?"
    ],
    "status": "reviewed",
    "sourceHash": "b9c97f2cf9927dd9bd3c197845aff9fa1fb4112e8d8dd9050595c4cf4725f2cd",
    "sourcePath": "data/alice-corpus/examples/pruned-node-history.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-replace-by-fee",
    "conceptId": "replace-by-fee",
    "title": "Augmenter les frais avec RBF",
    "keywords": [
      "Augmenter les frais avec RBF",
      "Replace-By-Fee",
      "Peut-on accélérer une transaction en attente ?",
      "transactions",
      "replace by fee"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nRBF permet de proposer le remplacement d’une transaction non confirmée par une autre qui paie davantage de frais. Cela peut améliorer ses chances d’être incluse prochainement.\n\nExplication\nLe portefeuille prépare et signe une transaction concurrente utilisant des fonds déjà engagés dans la précédente. Les nœuds décident de l’accepter selon leur politique de remplacement et ses conditions. Le remplacement relève ainsi de la gestion des transactions en attente.\n\nUne politique full-RBF peut accepter ce remplacement même si la transaction d’origine ne l’avait pas signalé. La possibilité concrète dépend aussi du logiciel du portefeuille et des moyens de signature disponibles.\n\nLimites et confusions\nAugmenter les frais ne garantit pas une inclusion immédiate. RBF ne permet pas de modifier librement une transaction déjà confirmée dans la chaîne. L’absence de signalement RBF n’est pas une garantie de sécurité pour un paiement sans confirmation. Cette explication ne constitue pas une instruction pour remplacer un paiement réel ; il faut vérifier les montants, la destination et le coût proposés par le portefeuille.",
    "parentIds": [],
    "relatedIds": [
      "transaction-fees",
      "bitcoin-mempool-policy",
      "bitcoin-transaction-confirmation"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://raw.githubusercontent.com/bitcoin/bitcoin/v28.0/doc/release-notes.md"
    ],
    "questions": [
      "Peut-on accélérer une transaction en attente ?"
    ],
    "status": "reviewed",
    "sourceHash": "ed10585d53d92dba1df7dcceb176f794d7c720c2745fdc7398693600cb86f567",
    "sourcePath": "data/alice-corpus/examples/replace-by-fee.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-satoshi",
    "conceptId": "satoshi",
    "title": "Comprendre les satoshis",
    "keywords": [
      "Comprendre les satoshis",
      "Satoshi",
      "Peut-on détenir moins de 1 bitcoin ?",
      "fundamentals",
      "satoshi"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe satoshi, abrégé sat, est une unité de bitcoin. 1 BTC vaut 100 000 000 sats. Il n’est donc pas nécessaire de détenir 1 bitcoin entier pour utiliser Bitcoin.\n\nExplication\nUn montant de 0,001 BTC correspond à 100 000 sats. Changer l’unité d’affichage ne change ni les fonds détenus ni leur valeur. C’est comparable à l’affichage d’une somme en euros ou en centimes.\n\nLes sats rendent les petits montants plus lisibles et sont fréquents dans les interfaces de paiement. Ils servent aussi à exprimer des frais. Il faut alors distinguer un montant total en sats d’un taux en sats par unité de taille de transaction. Le portefeuille convertit les unités, mais l’utilisateur doit savoir laquelle il lit.\n\nLimites et confusions\nLe satoshi est la plus petite unité de montant sur la couche de base. D’autres couches peuvent utiliser des unités comptables plus fines en interne. Un taux de frais n’est pas le coût total d’un paiement. Le mot « satoshi » peut également désigner, selon le contexte, le pseudonyme du créateur de Bitcoin.",
    "parentIds": [],
    "relatedIds": [
      "transaction-fees",
      "bitcoin-network-vs-asset",
      "satoshi-nakamoto"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins"
    ],
    "questions": [
      "Peut-on détenir moins de 1 bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "d1d4aed507bec1a34fc8afdef8855aa806392d6ab74083aab2a62ce9ce34e0b8",
    "sourcePath": "data/alice-corpus/examples/satoshi.fr.md",
    "theme": "fundamentals"
  },
  {
    "id": "curated-satoshi-identity-hypotheses",
    "conceptId": "satoshi-identity-hypotheses",
    "title": "Hypothèses sur l’identité de Satoshi",
    "keywords": [
      "Hypothèses sur l’identité de Satoshi",
      "identité de Satoshi",
      "hypothèses Satoshi",
      "théorie CIA Bitcoin",
      "Pourquoi Adam Back, Hal Finney, Len Sassaman, Nick Szabo ou Peter Todd sont-ils évoqués ?",
      "Quels arguments soutiennent ou fragilisent ces rapprochements ?",
      "Satoshi pourrait-il être un groupe ?",
      "Existe-t-il une preuve d’une création de Bitcoin par la CIA ?",
      "Comment distinguer faits historiques, hypothèses et conclusions d’enquête ?",
      "bitcoin",
      "satoshi identity hypotheses"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nPlusieurs recherches rapprochent le pseudonyme Satoshi Nakamoto de personnes du milieu cypherpunk. Elles n’ont pas établi son identité. Un fait documenté sur un candidat peut soutenir une hypothèse sans la démontrer. Le panorama ci-dessous ne classe pas les personnes et ne leur attribue pas la création de Bitcoin.\n\nExplication\n### Personnes citées et limites des rapprochements\n\n| Hypothèse | Arguments documentés | Limites et objections |\n|---|---|---|\n| Adam Back | Il a créé Hashcash, cité dans le whitepaper. Son témoignage judiciaire rapporte des courriels avec Satoshi à partir du 20 août 2008, avant la publication de Bitcoin. | Cela documente un précurseur technique et une correspondance, pas une identité. Les courriels présentent 2 interlocuteurs ; prétendre qu’il s’est écrit à lui-même ajouterait une hypothèse qui demande ses propres preuves. [Témoignage de Back, 2023](https://bitcoindefense.org/assets/documents/First-Witness-Statement-of-Dr-Adam-Back.pdf). |\n| Hal Finney | Son travail sur RPOW et sa participation aux premiers essais de Bitcoin le placent parmi les pionniers. Il raconte avoir reçu 10 BTC de Satoshi et échangé avec lui pour corriger des bugs. | Son [récit personnel de 2013](https://bitcointalk.org/index.php?topic=155054.0) présente Satoshi comme un autre interlocuteur. L’[enquête de Jameson Lopp de 2023](https://blog.lopp.net/hal-finney-was-not-satoshi-nakamoto/) rapproche une course photographiée de Finney d’échanges de Satoshi contemporains. Cela fragilise l’hypothèse d’un Finney agissant seul ; une participation à un groupe reste une proposition distincte, non démontrée. |\n| Len Sassaman | Evan Hatch rapproche ses travaux sur PGP et les remailers, son milieu cypherpunk et son décès en juillet 2011 du retrait de Satoshi quelques mois auparavant. | Ces rapprochements sont circonstanciels. L’[article de Hatch](https://evanhatch.medium.com/len-sassaman-and-satoshi-e483c85c2b10) est la source d’une hypothèse, pas une preuve d’identité. Meredith Patterson a contesté l’identification dans un [entretien direct en 2024](https://www.dlnews.com/articles/people-culture/len-sassaman-the-bitcoin-creator-satoshi-nakamoto/) ; son témoignage doit également être attribué, sans lui faire trancher seul le dossier. |\n| Nick Szabo | Son [texte Bit Gold de 2005](https://nakamotoinstitute.org/library/bit-gold/) décrit preuve de travail, horodatage et titres de propriété distribués, avant Bitcoin. | Cette proximité documente un antécédent intellectuel, sans prouver qu’il a écrit le logiciel Bitcoin. Bit Gold et Bitcoin ne sont pas des systèmes identiques. Les statistiques ou conclusions stylométriques ne sont pas reprises ici faute de référence exacte recoupée. |\n| Peter Todd | Le documentaire HBO de 2024 interprète sa réponse à un message de Satoshi en 2010 comme un possible changement accidentel de compte. | C’est l’interprétation du réalisateur. Le message original n’a pas été recoupé directement pour cette fiche. Todd a explicitement démenti dans un [courriel adressé à CoinDesk](https://www.coindesk.com/business/2024/10/08/former-bitcoin-dev-peter-todd-denies-hes-satoshi-hours-before-hbo-documentary-airs). Ses plaisanteries sur le fait d’être Satoshi ne constituent pas un aveu. |\n\n### Un groupe derrière le pseudonyme\n\nUn pseudonyme peut être partagé, et Bitcoin combine plusieurs domaines de compétence. Cela rend une collaboration concevable, sans constituer une preuve que plusieurs personnes utilisaient le nom Satoshi. Il faut distinguer l’auteur du projet, ses précurseurs, ses relecteurs et ses premiers contributeurs.\n\nLe documentaire *Finding Satoshi*, sorti le 22 avril 2026, défend une collaboration Finney–Sassaman. Sa sortie est confirmée par le [producteur](https://www.tooleyentertainment.com/documentary/finding-satoshi). L’[entretien direct avec l’enquêteur Tyler Maroney](https://www.theblock.co/news/ecosystems/2026-04-22-finding-satoshi-documentary-makes-case-hal-finney-len-sassaman-bitcoins-co-creators-398423) expose notamment des rapprochements de compétences et de rythmes d’activité, ainsi que des objections. Cette fiche s’appuie sur cet entretien, pas sur un visionnage intégral du film. Une conclusion d’enquête ne devient pas automatiquement une identification établie.\n\n### La théorie de la CIA\n\nLe fait documenté est l’[annonce originale de Gavin Andresen, le 27 avril 2011](https://bitcointalk.org/?topic=6652.0), d’une présentation de Bitcoin prévue à la CIA en juin. Une invitation à présenter un projet déjà public ne démontre pas que l’organisme l’a créé. La proximité chronologique avec le retrait de Satoshi ne démontre pas non plus une causalité. Aucune preuve d’une création de Bitcoin par la CIA n’est établie dans les sources vérifiées ici.\n\n### L’évolution du logiciel depuis Satoshi\n\nDans une publication du 30 juillet 2023, Jameson Lopp estimait que **0,06 % des lignes du dépôt Bitcoin Core étaient restées inchangées depuis Satoshi**. Ce chiffre est attribué à son auteur et à cette date ; ce n’est pas une mesure de 2026. Il ne représente ni la proportion des idées de Satoshi encore présentes ni son influence sur le protocole. La publication ne détaille pas suffisamment la méthode pour reproduire cette estimation à elle seule. [Archive officielle de la publication](https://www.lopp.net/tweets/lopp/status/1685616945368805377/).\n\nDans son bilan publié le 5 janvier 2025, Lopp rapporte aussi **276 000 lignes ajoutées ou supprimées en 2024** dans Bitcoin Core. La commande publiée additionne les insertions et suppressions des commits ; une même ligne peut donc être comptée plusieurs fois. Ce total décrit l’activité de développement de 2024, pas des lignes uniques ni un bilan depuis 2009. Aucun recalcul n’est présenté ici. [Bilan 2024 et méthode publiée](https://blog.lopp.net/bitcoin-2024-annual-review/).\n\nLimites et confusions\n- Séparer l’observation, l’interprétation et l’attribution. « A créé Hashcash » est un fait documenté ; « aurait donc créé Bitcoin » est une inférence supplémentaire.\n- Une analyse de langage dépend du corpus, du choix des candidats et de la méthode. Une ressemblance ne suffit pas à prouver une identité.\n- Une signature vérifiable peut démontrer le contrôle d’une clé. Elle n’établit pas à elle seule une identité civile ni que la personne contrôlait cette clé à l’époque de la création de Bitcoin.\n- Les scénarios sur les motivations, l’anonymat, les clés perdues ou l’absence de dépenses restent hypothétiques. Ils ne prouvent ni identité ni patrimoine.\n- Patoshi est le nom donné à une analyse de motifs de minage anciens. Son association avec Satoshi et le contrôle actuel des clés sont des questions distinctes.\n- Une source primaire atteste ce qu’un témoin ou un enquêteur dit. Elle ne garantit pas que toutes ses interprétations sont correctes.\n- Connaître l’identité du créateur ne donnerait aucun pouvoir protocolaire spécial pour imposer des changements. La vérification du code et des règles reste possible sans la connaître ; cette possibilité n’est pas une garantie d’absence de défaut.",
    "parentIds": [
      "satoshi-nakamoto"
    ],
    "relatedIds": [],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://bitcoindefense.org/assets/documents/First-Witness-Statement-of-Dr-Adam-Back.pdf",
      "https://bitcointalk.org/index.php?topic=155054.0",
      "https://blog.lopp.net/hal-finney-was-not-satoshi-nakamoto/",
      "https://evanhatch.medium.com/len-sassaman-and-satoshi-e483c85c2b10",
      "https://www.dlnews.com/articles/people-culture/len-sassaman-the-bitcoin-creator-satoshi-nakamoto/",
      "https://nakamotoinstitute.org/library/bit-gold/",
      "https://www.coindesk.com/business/2024/10/08/former-bitcoin-dev-peter-todd-denies-hes-satoshi-hours-before-hbo-documentary-airs",
      "https://bitcointalk.org/?topic=6652.0",
      "https://www.tooleyentertainment.com/documentary/finding-satoshi",
      "https://www.theblock.co/news/ecosystems/2026-04-22-finding-satoshi-documentary-makes-case-hal-finney-len-sassaman-bitcoins-co-creators-398423",
      "https://www.lopp.net/tweets/lopp/status/1685616945368805377/",
      "https://blog.lopp.net/bitcoin-2024-annual-review/"
    ],
    "questions": [
      "Pourquoi Adam Back, Hal Finney, Len Sassaman, Nick Szabo ou Peter Todd sont-ils évoqués ?",
      "Quels arguments soutiennent ou fragilisent ces rapprochements ?",
      "Satoshi pourrait-il être un groupe ?",
      "Existe-t-il une preuve d’une création de Bitcoin par la CIA ?",
      "Comment distinguer faits historiques, hypothèses et conclusions d’enquête ?"
    ],
    "status": "reviewed",
    "sourceHash": "92607c16eb6dc3420036698924f63e3f2568f60b17ddcc29c95412a5233c7cb3",
    "sourcePath": "data/alice-corpus/examples/satoshi-identity-hypotheses.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-satoshi-nakamoto",
    "conceptId": "satoshi-nakamoto",
    "title": "Satoshi Nakamoto",
    "keywords": [
      "Satoshi Nakamoto",
      "créateur de Bitcoin",
      "Que sait-on de Satoshi Nakamoto ?",
      "Quelles hypothèses existent sur son identité ?",
      "Faut-il connaître le créateur pour vérifier Bitcoin ?",
      "Satoshi pourrait-il imposer une modification de Bitcoin ?",
      "bitcoin",
      "satoshi nakamoto"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nSatoshi Nakamoto est le pseudonyme sous lequel le whitepaper de Bitcoin a été publié en 2008, puis son premier logiciel en 2009. L’identité de la personne ou des personnes derrière ce nom reste inconnue. Plusieurs hypothèses évoquent notamment Adam Back, Hal Finney, Len Sassaman, Nick Szabo ou Peter Todd ; d’autres envisagent un groupe. Aucune identification n’est démontrée.\n\nExplication\nLe whitepaper décrit un système de paiement sans tiers de confiance chargé de tenir le registre. Son annonce du 31 octobre 2008 est conservée dans les archives de la liste Cryptography. Ce sont des documents historiques accessibles, contrairement à l’identité civile de leur auteur.\n\nLes recherches sur Satoshi combinent histoire de la cryptographie, correspondances, analyses de langage et chronologies. Elles peuvent documenter des rapprochements sans établir une identité. La théorie d’une création par la CIA existe aussi, mais aucune preuve ne l’étaye dans les sources vérifiées pour cette fiche. Elle ne possède pas le même niveau de documentation que les recherches historiques sur les personnes citées.\n\nConnaître le créateur n’est pas nécessaire pour examiner le code ni les règles appliquées par un nœud. Le créateur ne bénéficie d’aucun pouvoir protocolaire spécial. Les participants choisissent leur logiciel ; une modification proposée ne s’impose pas aux autres du seul fait de son auteur. Le logiciel a évolué avec les contributions de nombreux développeurs. L’identité de Satoshi pourrait avoir une influence sociale ou économique, sans créer une autorité particulière dans le protocole.\n\nLimites et confusions\n- La ressemblance d’un style, une compétence technique ou une coïncidence de calendrier ne suffit pas à identifier quelqu’un.\n- Un démenti ou une conviction exprimée par un enquêteur ne tranche pas à lui seul la question.\n- Le code ouvert rend son examen possible. Des audits et des années d’utilisation ne garantissent pas l’absence de défaut. Bitcoin Core publie des avis de sécurité sur des vulnérabilités identifiées.\n- Cette fiche ne transforme ni une estimation des bitcoins minés aux débuts du réseau ni une analyse de minage en patrimoine démontré de Satoshi.",
    "parentIds": [],
    "relatedIds": [
      "satoshi-identity-hypotheses"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://www.metzdowd.com/pipermail/cryptography/2008-October/014810.html",
      "https://bitcoin.org/bitcoin.pdf",
      "https://bitcoin.org/en/faq#who-controls-the-bitcoin-network",
      "https://bitcoincore.org/en/security-advisories/"
    ],
    "questions": [
      "Que sait-on de Satoshi Nakamoto ?",
      "Quelles hypothèses existent sur son identité ?",
      "Faut-il connaître le créateur pour vérifier Bitcoin ?",
      "Satoshi pourrait-il imposer une modification de Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "90426efccdefd896a0347d2545db932ad395c82df009d3b3c40971954ec6c57e",
    "sourcePath": "data/alice-corpus/examples/satoshi-nakamoto.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-addresses-hashlock",
    "conceptId": "secondary-addresses-hashlock",
    "title": "Les conditions de dépense par secret",
    "keywords": [
      "Les conditions de dépense par secret",
      "Hashlock",
      "À quoi sert un hashlock ?",
      "addresses",
      "secondary addresses hashlock"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn hashlock verrouille une dépense à la révélation d’une préimage correspondant à un hash donné.\n\nExplication\n- Le script ne connaît que le hash, pas le secret.\n- Le dépensier révèle la préimage pour satisfaire la condition.\n- Les hashlocks sont utiles dans plusieurs protocoles off-chain.\n- Seuls, ils peuvent être vulnérables au front-running si aucune signature ne lie la dépense.\n\nLimites et confusions\nLe secret seul ne protège pas tous les contrats ; des signatures et délais peuvent être nécessaires.",
    "parentIds": [
      "atomic-swap",
      "bitcoin-script"
    ],
    "relatedIds": [
      "atomic-swap",
      "bitcoin-script"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro202 — Programming Bitcoin"
    ],
    "questions": [
      "À quoi sert un hashlock ?"
    ],
    "status": "reviewed",
    "sourceHash": "0e888a7ff66f66114668dfda68909edae540e09fff52e0c154f76b7ee44fb03e",
    "sourcePath": "data/alice-corpus/examples/secondary-addresses-hashlock.fr.md",
    "theme": "addresses"
  },
  {
    "id": "curated-secondary-addresses-mast",
    "conceptId": "secondary-addresses-mast",
    "title": "Les arbres de conditions de dépense",
    "keywords": [
      "Les arbres de conditions de dépense",
      "MAST",
      "Comment Taproot peut-il ne révéler qu’une condition utilisée ?",
      "addresses",
      "secondary addresses mast"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nMAST désigne l’idée d’organiser des branches de script dans un arbre de Merkle pour ne révéler que la branche utilisée.\n\nExplication\n- Cela limite la révélation de conditions non utilisées.\n- Taproot reprend cet esprit avec ses scripts alternatifs.\n- MAST améliore confidentialité et efficience pour scripts complexes.\n- Le concept relie Merkle trees et conditions de dépense.\n\nLimites et confusions\nRévéler une seule branche ne masque pas toutes les métadonnées de la transaction.",
    "parentIds": [
      "taproot",
      "merkle-tree"
    ],
    "relatedIds": [
      "taproot",
      "merkle-tree"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Comment Taproot peut-il ne révéler qu’une condition utilisée ?"
    ],
    "status": "reviewed",
    "sourceHash": "98faa5254105b091d96a5c5f495951f5f43990c80477971959fff6762754e5fe",
    "sourcePath": "data/alice-corpus/examples/secondary-addresses-mast.fr.md",
    "theme": "addresses"
  },
  {
    "id": "curated-secondary-bitcoin-adaptor-signature",
    "conceptId": "secondary-bitcoin-adaptor-signature",
    "title": "Les signatures adaptatrices",
    "keywords": [
      "Les signatures adaptatrices",
      "Adaptor Signature",
      "Comment une signature peut-elle être liée à la révélation d’un secret ?",
      "bitcoin",
      "secondary bitcoin adaptor signature"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne signature adaptatrice lie la finalisation d'une signature à un secret, utilisé notamment dans certaines constructions d'échange atomique.\n\nExplication\n- Une partie prépare une donnée de signature liée à un secret ; la signature finalisée et les données préparées peuvent permettre d’extraire ce secret.\n- Ce lien peut coordonner des règlements entre participants, mais ne supprime ni les délais ni les risques du protocole complet.\n\nLimites et confusions\nL'extraction du secret requiert les données adaptées de la construction, pas n'importe quelle signature publique.",
    "parentIds": [
      "atomic-swap",
      "digital-signature"
    ],
    "relatedIds": [
      "atomic-swap",
      "digital-signature"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "Synthèse du vault — Adaptor Signature ; référence externe non précisée dans la note source."
    ],
    "questions": [
      "Comment une signature peut-elle être liée à la révélation d’un secret ?"
    ],
    "status": "reviewed",
    "sourceHash": "062e24f89ed795adf28ed748f11bb6e704fc92dcde40e79bc1a9279ea6c9dc33",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-adaptor-signature.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-asic-noise-reduction",
    "conceptId": "secondary-bitcoin-asic-noise-reduction",
    "title": "Le bruit des machines de minage",
    "keywords": [
      "Le bruit des machines de minage",
      "ASIC Noise Reduction",
      "Peut-on réduire le bruit d’un ASIC sans compromettre son refroidissement ?",
      "bitcoin",
      "secondary bitcoin asic noise reduction"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes ASIC industriels peuvent produire un bruit important. Réduire ce bruit suppose de préserver le refroidissement et de tenir compte de la puissance.\n\nExplication\n- Le bruit vient notamment de la ventilation nécessaire pour évacuer une forte chaleur dans un petit volume.\n- Réduire les ventilateurs sans adapter la dissipation peut exposer le matériel et l’installation à la surchauffe.\n\nLimites et confusions\nNe pas modifier ventilateurs ou boîtiers sans vérifier les limites du fabricant et la sécurité électrique.",
    "parentIds": [
      "asic-heat-reuse",
      "asic-mining"
    ],
    "relatedIds": [
      "asic-heat-reuse",
      "asic-mining"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min304 — Heat your home while mining bitcoins"
    ],
    "questions": [
      "Peut-on réduire le bruit d’un ASIC sans compromettre son refroidissement ?"
    ],
    "status": "reviewed",
    "sourceHash": "b81b6ca36cd114ff0914d1c7539da2607270d0b8d314b6a0b217217d577598b5",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-asic-noise-reduction.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-attack-surface",
    "conceptId": "secondary-bitcoin-attack-surface",
    "title": "La surface d’attaque",
    "keywords": [
      "La surface d’attaque",
      "Attack Surface",
      "Pourquoi limiter les interfaces et les logiciels exposés ?",
      "bitcoin",
      "secondary bitcoin attack surface"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa surface d'attaque regroupe les interfaces et chemins qu'un attaquant peut exploiter. Réduire les services et permissions inutiles peut limiter l'exposition.\n\nExplication\n- Un ordinateur polyvalent expose de nombreux logiciels et services ; un dispositif de signature spécialisé réduit certaines de ces interfaces.\n- La sécurité finale dépend néanmoins du matériel, du logiciel et des opérations réellement confirmées par l’utilisateur.\n\nLimites et confusions\nUn hardware wallet réduit certains risques sans supprimer firmware, interfaces, chaîne d'approvisionnement et erreur humaine.",
    "parentIds": [
      "hardware-wallet",
      "threat-model"
    ],
    "relatedIds": [
      "hardware-wallet",
      "threat-model"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "Synthèse du vault — Attack Surface ; référence externe non précisée dans la note source."
    ],
    "questions": [
      "Pourquoi limiter les interfaces et les logiciels exposés ?"
    ],
    "status": "reviewed",
    "sourceHash": "faef78f0864451a24e4004765e9c1b93177268cc29a3458b71ca1b7885ca15d0",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-attack-surface.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-authenticated-encryption",
    "conceptId": "secondary-bitcoin-authenticated-encryption",
    "title": "Le chiffrement authentifié",
    "keywords": [
      "Le chiffrement authentifié",
      "Authenticated Encryption",
      "Pourquoi chiffrer ne suffit-il pas toujours à protéger un message ?",
      "bitcoin",
      "secondary bitcoin authenticated encryption"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe chiffrement authentifié protège le contenu et permet de détecter certaines modifications non autorisées. Les données associées peuvent être authentifiées sans être chiffrées.\n\nExplication\n- Elle évite de bricoler séparément chiffrement et MAC.\n- Les modes AEAD ajoutent souvent des associated data non chiffrées mais authentifiées.\n- Elle est recommandée pour beaucoup de protocoles modernes.\n- Elle protège contre des attaques actives absentes du simple chiffrement.\n\nLimites et confusions\nLa sécurité dépend aussi de la gestion des clés et des nonces ; elle ne protège pas un appareil déjà déverrouillé et compromis.",
    "parentIds": [
      "encryption",
      "alice-local-encryption"
    ],
    "relatedIds": [
      "encryption",
      "alice-local-encryption"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp302 — Modern Cryptography Fundamentals"
    ],
    "questions": [
      "Pourquoi chiffrer ne suffit-il pas toujours à protéger un message ?"
    ],
    "status": "reviewed",
    "sourceHash": "b3f9e005249e9e1469d852f39676d07a14f0579a0320f0feff5086c6726ac01f",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-authenticated-encryption.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-base58check-encoding",
    "conceptId": "secondary-bitcoin-base58check-encoding",
    "title": "L’encodage Base58Check",
    "keywords": [
      "L’encodage Base58Check",
      "Base58Check Encoding",
      "À quoi sert la somme de contrôle d’une adresse Bitcoin historique ?",
      "bitcoin",
      "secondary bitcoin base58check encoding"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBase58Check encode notamment des adresses historiques et des clés étendues avec un préfixe et une somme de contrôle.\n\nExplication\n- Des informations de version et une somme de contrôle sont encodées avec la charge utile.\n- La détection d’erreur aide à éviter certaines fautes de saisie mais ne remplace pas la vérification du destinataire sur le dispositif de signature.\n\nLimites et confusions\nLe checksum détecte certaines erreurs de saisie ; il ne garantit pas que l'adresse appartient au bon destinataire.",
    "parentIds": [
      "legacy-address",
      "bitcoin-address"
    ],
    "relatedIds": [
      "legacy-address",
      "bitcoin-address"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro202 — Programming Bitcoin"
    ],
    "questions": [
      "À quoi sert la somme de contrôle d’une adresse Bitcoin historique ?"
    ],
    "status": "reviewed",
    "sourceHash": "92ec51aab761b2063c5d6cbf31eb491c5722be014353ff57d7abbc79fb856e39",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-base58check-encoding.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-behind-the-meter",
    "conceptId": "secondary-bitcoin-behind-the-meter",
    "title": "Le minage derrière le compteur",
    "keywords": [
      "Le minage derrière le compteur",
      "Behind the Meter",
      "Que signifie alimenter un mineur derrière le compteur électrique ?",
      "bitcoin",
      "secondary bitcoin behind the meter"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne installation derrière le compteur produit ou consomme localement de l'énergie, en amont de certains échanges mesurés avec le réseau.\n\nExplication\n- Une production locale peut alimenter une consommation sur le même site plutôt que transiter intégralement par le réseau public.\n- Le résultat économique dépend des équipements, du raccordement et du coût d’opportunité des autres usages de cette énergie.\n\nLimites et confusions\nElle peut rester raccordée au réseau ; économies, frais et taxes dépendent du site et de la juridiction.",
    "parentIds": [
      "bitcoin-energy-debate",
      "mining-profitability"
    ],
    "relatedIds": [
      "bitcoin-energy-debate",
      "mining-profitability"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "Synthèse du vault — Behind the Meter ; référence externe non précisée dans la note source."
    ],
    "questions": [
      "Que signifie alimenter un mineur derrière le compteur électrique ?"
    ],
    "status": "reviewed",
    "sourceHash": "bf0780c332af20269a123f1a90753db3e29b36af109ac4aebbd7dcc69131d63a",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-behind-the-meter.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-bitaxe",
    "conceptId": "secondary-bitcoin-bitaxe",
    "title": "Les mineurs Bitaxe",
    "keywords": [
      "Les mineurs Bitaxe",
      "Bitaxe",
      "À quoi sert un petit mineur ouvert comme Bitaxe ?",
      "bitcoin",
      "secondary bitcoin bitaxe"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBitaxe est une famille de projets de mineurs ASIC ouverts favorisant l'expérimentation et l'apprentissage.\n\nExplication\n- Les conceptions ouvertes facilitent l’apprentissage du fonctionnement physique du minage.\n- Avec une petite part du hashrate, les chances de trouver seul un bloc restent très faibles sur une période donnée.\n\nLimites et confusions\nL'ouverture du design ne garantit pas rentabilité, fabrication entièrement ouverte ni découverte régulière de blocs.",
    "parentIds": [
      "asic-mining",
      "solo-bitcoin-mining"
    ],
    "relatedIds": [
      "asic-mining",
      "solo-bitcoin-mining"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min306 — Bitaxe Open Source Mining Mastery"
    ],
    "questions": [
      "À quoi sert un petit mineur ouvert comme Bitaxe ?"
    ],
    "status": "reviewed",
    "sourceHash": "689c4b44fc49cc774d8a4dacb93f090d40ce66b3037c72d04fb2e2f5af57c7b9",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-bitaxe.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-bitcoin-circular-economy",
    "conceptId": "secondary-bitcoin-bitcoin-circular-economy",
    "title": "Les économies circulaires Bitcoin",
    "keywords": [
      "Les économies circulaires Bitcoin",
      "Bitcoin Circular Economy",
      "Que signifie gagner et redépenser des sats dans une communauté locale ?",
      "bitcoin",
      "secondary bitcoin bitcoin circular economy"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne économie circulaire Bitcoin permet de gagner puis redépenser des sats auprès d'autres participants, au lieu de convertir systématiquement vers une autre monnaie.\n\nExplication\n- Le même revenu en sats peut circuler entre clients, travailleurs et commerces si chacun trouve un usage local.\n- La possibilité de dépenser dépend des prix, des équipements et de l’acceptation réelle, au-delà du nombre d’enseignes annoncées.\n\nLimites et confusions\nLa densité de commerces, les besoins et la liquidité déterminent la réalité de cette boucle.",
    "parentIds": [
      "earn-bitcoin",
      "bitcoin-payments-for-merchants"
    ],
    "relatedIds": [
      "earn-bitcoin",
      "bitcoin-payments-for-merchants"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc304 — How to Create a Bitcoin Community"
    ],
    "questions": [
      "Que signifie gagner et redépenser des sats dans une communauté locale ?"
    ],
    "status": "reviewed",
    "sourceHash": "84c537a9c45913318b3f7adbb2de08bdf8390d2e66d107b9cfa9ebb6e1a0cb51",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-bitcoin-circular-economy.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-bitcoin-core-development-funding",
    "conceptId": "secondary-bitcoin-bitcoin-core-development-funding",
    "title": "Le financement du développement de Bitcoin Core",
    "keywords": [
      "Le financement du développement de Bitcoin Core",
      "Bitcoin Core Development Funding",
      "Qui finance le travail des développeurs de Bitcoin Core ?",
      "bitcoin",
      "secondary bitcoin bitcoin core development funding"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes développeurs de Bitcoin Core peuvent être financés par des subventions, dons ou entreprises indépendantes. Le financement n'accorde pas le pouvoir d'imposer une nouvelle règle au réseau.\n\nExplication\n- Bitcoin Core ne vend pas un logiciel propriétaire classique.\n- Les développeurs peuvent être financés par des organisations différentes.\n- La diversité de financement réduit certains risques de capture.\n- Le financement durable reste un défi de l’open source critique.\n\nLimites et confusions\nLa diversité des soutiens peut réduire certains risques de dépendance sans garantir l'absence d'influence.",
    "parentIds": [
      "bitcoin-core",
      "bitcoin-governance"
    ],
    "relatedIds": [
      "bitcoin-core",
      "bitcoin-governance"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "Qui finance le travail des développeurs de Bitcoin Core ?"
    ],
    "status": "reviewed",
    "sourceHash": "cdb74b8d20ecca506ee2284558e930fd4be8db17b0648cb233454d87ad3f3f14",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-bitcoin-core-development-funding.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-bitcoin-core-maintenance",
    "conceptId": "secondary-bitcoin-bitcoin-core-maintenance",
    "title": "Le rôle des responsables de maintenance de Bitcoin Core",
    "keywords": [
      "Le rôle des responsables de maintenance de Bitcoin Core",
      "Bitcoin Core Maintenance",
      "Les responsables du dépôt peuvent-ils imposer de nouvelles règles à Bitcoin ?",
      "bitcoin",
      "secondary bitcoin bitcoin core maintenance"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes maintainers gèrent notamment la fusion des contributions au dépôt Bitcoin Core. Les utilisateurs choisissent toujours quel logiciel et quelles règles ils exécutent.\n\nExplication\n- N’importe qui peut cloner le dépôt et créer un fork.\n- Les maintainers disposent d’un rôle pratique de fusion, pas du pouvoir de changer les règles acceptées par les utilisateurs.\n- Les pull requests peuvent attendre longtemps faute de review qualifiée.\n- Si le point focal devient indigne de confiance, un autre point focal peut émerger.\n\nLimites et confusions\nLa possibilité de créer un fork logiciel ne garantit pas son adoption ni sa sécurité.",
    "parentIds": [
      "bitcoin-core",
      "bitcoin-governance"
    ],
    "relatedIds": [
      "bitcoin-core",
      "bitcoin-governance"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Les responsables du dépôt peuvent-ils imposer de nouvelles règles à Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "e4270d68b0bd2c204a577fe3a6b72a567274de053c230c2bd52035d99a4a2ebb",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-bitcoin-core-maintenance.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-bitcoin-covenants",
    "conceptId": "secondary-bitcoin-bitcoin-covenants",
    "title": "Les restrictions de dépenses futures",
    "keywords": [
      "Les restrictions de dépenses futures",
      "Bitcoin Covenants",
      "Que permettent les covenants proposés pour Bitcoin ?",
      "bitcoin",
      "secondary bitcoin bitcoin covenants"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes covenants restreignent certaines possibilités de dépense future d'un UTXO. Les constructions et garanties dépendent des mécanismes disponibles ou proposés.\n\nExplication\n- Le propriétaire accepte une règle de dépense qui peut limiter la forme ou les destinations des transactions ultérieures.\n- Les usages discutés incluent coffres de protection et gestion de congestion ; les différentes propositions n’offrent pas les mêmes capacités.\n\nLimites et confusions\nOP_CAT et OP_CTV ne doivent pas être présentés comme activés sans vérification datée.",
    "parentIds": [
      "bitcoin-script",
      "soft-fork"
    ],
    "relatedIds": [
      "bitcoin-script",
      "soft-fork"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "Article ou ressource du vault — Covenants, OP_CAT et OP_CTV : Tout savoir sur la prochaine mise à jour de Bitcoin",
      "Article ou ressource du vault — Qu'est-ce qu'une Drivechain et pourquoi cela divise autant la communauté Bitcoin ?"
    ],
    "questions": [
      "Que permettent les covenants proposés pour Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "1b29a3479db243aab0f80cced193fcd9cb8093df6dcc3264b5fc182074640f7d",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-bitcoin-covenants.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-bitcoin-inheritance-support-protocol",
    "conceptId": "secondary-bitcoin-bitcoin-inheritance-support-protocol",
    "title": "Aider des proches lors d’une succession Bitcoin",
    "keywords": [
      "Aider des proches lors d’une succession Bitcoin",
      "Bitcoin Inheritance Support Protocol",
      "Comment aider une famille sans récupérer ses clés privées ?",
      "bitcoin",
      "secondary bitcoin bitcoin inheritance support protocol"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn accompagnement à la succession peut expliquer les principes et orienter les proches sans demander les clés privées. La récupération doit respecter les droits des ayants droit et la configuration de sauvegarde.\n\nExplication\n- Ne jamais demander ni recevoir de clés privées ou wallets physiques lors d’un meetup.\n- L’objectif doit rester éducatif : expliquer Bitcoin, les risques et les prochaines étapes.\n- La famille doit être orientée vers les règles légales locales sur héritage, donation et conversion.\n- Une procédure standard réduit les risques de vol, abus ou responsabilité morale floue.\n\nLimites et confusions\nNe jamais transmettre les secrets au groupe d'entraide ; les règles successorales doivent être vérifiées localement.",
    "parentIds": [
      "bitcoin-inheritance-plan",
      "wallet-backup"
    ],
    "relatedIds": [
      "bitcoin-inheritance-plan",
      "wallet-backup"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc304 — How to Create a Bitcoin Community"
    ],
    "questions": [
      "Comment aider une famille sans récupérer ses clés privées ?"
    ],
    "status": "reviewed",
    "sourceHash": "e3cf34cdf21d2255991dcbf01442e85dfff9de6e77ea9951f258a841f3915269",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-bitcoin-inheritance-support-protocol.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-bitcoin-payment-conversion-policy",
    "conceptId": "secondary-bitcoin-bitcoin-payment-conversion-policy",
    "title": "Conserver ou convertir les paiements reçus",
    "keywords": [
      "Conserver ou convertir les paiements reçus",
      "Bitcoin Payment Conversion Policy",
      "Quelles conséquences pour un marchand qui garde ou convertit les BTC reçus ?",
      "bitcoin",
      "secondary bitcoin bitcoin payment conversion policy"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn marchand peut choisir de conserver les BTC reçus ou d'en convertir une partie pour ses dépenses dans une autre monnaie.\n\nExplication\n- Des recettes en BTC et des charges dans une autre monnaie créent une exposition au taux de change.\n- Conservation et conversion peuvent être choisies selon les besoins de trésorerie, avec leurs coûts et dépendances propres.\n\nLimites et confusions\nUne conversion rapide réduit l'exposition future au taux de change sans éliminer frais, contrepartie ni variations pendant le traitement.",
    "parentIds": [
      "bitcoin-payments-for-merchants",
      "bitcoin-volatility"
    ],
    "relatedIds": [
      "bitcoin-payments-for-merchants",
      "bitcoin-volatility"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB biz101 — Bitcoin for Business"
    ],
    "questions": [
      "Quelles conséquences pour un marchand qui garde ou convertit les BTC reçus ?"
    ],
    "status": "reviewed",
    "sourceHash": "aa2e30f03d94e0b2cb0148d2f487e0a49c5245d32e989cc41333ac4257ff3cf3",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-bitcoin-payment-conversion-policy.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-bitcoin-production-cost-floor",
    "conceptId": "secondary-bitcoin-bitcoin-production-cost-floor",
    "title": "Le coût de minage n’est pas un prix plancher",
    "keywords": [
      "Le coût de minage n’est pas un prix plancher",
      "Bitcoin Production Cost Floor",
      "Le bitcoin doit-il forcément valoir plus que son coût de production ?",
      "bitcoin",
      "secondary bitcoin bitcoin production cost floor"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe coût de minage indique la rentabilité d'une installation, pas un prix plancher garanti du bitcoin.\n\nExplication\n- Quand le prix ne couvre plus les coûts d’une installation, celle-ci peut réduire ou arrêter sa production.\n- L’ajustement de difficulté modifie ensuite la concurrence minière ; il n’oblige pas les acheteurs de BTC à payer un prix minimal.\n\nLimites et confusions\nCoûts et prix peuvent diverger ; les estimations d'un groupe de mineurs ne représentent pas tout le réseau.",
    "parentIds": [
      "mining-profitability",
      "bitcoin-volatility"
    ],
    "relatedIds": [
      "mining-profitability",
      "bitcoin-volatility"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "Article ou ressource du vault — JPMorgan Bitcoin Mining Costs Have 'Worsened' As BTC Trades Below Production Cost",
      "Article ou ressource du vault — Bitcoin miners near breakeven as network reacts more sharply to price swings JPMorgan",
      "Article ou ressource du vault — Grok — Bitcoin production cost floor debunk 2026-06-30"
    ],
    "questions": [
      "Le bitcoin doit-il forcément valoir plus que son coût de production ?"
    ],
    "status": "reviewed",
    "sourceHash": "a3ee13cbd26e609cf66a639bceb034cf9b005556b6885909ba08e2ab920bde5d",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-bitcoin-production-cost-floor.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-bitcoin-security-assumptions",
    "conceptId": "secondary-bitcoin-bitcoin-security-assumptions",
    "title": "Les hypothèses de sécurité de Bitcoin",
    "keywords": [
      "Les hypothèses de sécurité de Bitcoin",
      "Bitcoin Security Assumptions",
      "Sur quelles hypothèses repose la sécurité de Bitcoin ?",
      "bitcoin",
      "secondary bitcoin bitcoin security assumptions"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa sécurité de Bitcoin dépend d'hypothèses cryptographiques et de comportements réseau, économiques et opérationnels.\n\nExplication\n- Certaines hypothèses sont cryptographiques, d’autres économiques ou sociales.\n- Bitcoin n’a pas de modèle de sécurité formel complet comparable à un petit protocole isolé.\n- On étudie donc les incitations et comportements d’acteurs dans un système complexe.\n- Quand une hypothèse devient fausse, il faut adapter le design ou reconnaître une limite.\n\nLimites et confusions\nLa validité d'une primitive cryptographique ne prouve pas à elle seule la sécurité de tout le système.",
    "parentIds": [
      "bitcoin-consensus",
      "bitcoin-trustlessness"
    ],
    "relatedIds": [
      "bitcoin-consensus",
      "bitcoin-trustlessness"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Sur quelles hypothèses repose la sécurité de Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "652a673c1ccb69a6424dc3e664cbbb0152e89e750877b2990b1c88a767890b41",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-bitcoin-security-assumptions.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-blind-signatures",
    "conceptId": "secondary-bitcoin-blind-signatures",
    "title": "Les signatures aveugles",
    "keywords": [
      "Les signatures aveugles",
      "Blind Signatures",
      "Comment un émetteur peut-il signer un jeton sans en voir le contenu ?",
      "bitcoin",
      "secondary bitcoin blind signatures"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne signature aveugle permet de signer un message sans en voir le contenu. Elle aide un mint ecash à valider des jetons sans relier directement leur émission à leur dépense.\n\nExplication\n- Elles séparent autorisation et traçabilité directe.\n- Elles sont centrales dans le modèle eCash chaumien.\n- Elles inspirent aussi des constructions de confidentialité comme certains coinjoins chaumiens.\n- Elles ne suffisent pas à créer une monnaie décentralisée sans émetteur.\n\nLimites et confusions\nElle ne supprime ni la garde ni les autres métadonnées du système.",
    "parentIds": [
      "cashu-et-confiance-dans-le-mint",
      "coinjoin"
    ],
    "relatedIds": [
      "cashu-et-confiance-dans-le-mint",
      "coinjoin"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his201 — The History of Bitcoin's Creation"
    ],
    "questions": [
      "Comment un émetteur peut-il signer un jeton sans en voir le contenu ?"
    ],
    "status": "reviewed",
    "sourceHash": "1368599cb8901fbe6e53786a38f548c0229e3daa42c9c19a456c07c3b4f359e5",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-blind-signatures.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-btc-map",
    "conceptId": "secondary-bitcoin-btc-map",
    "title": "Trouver des commerces avec BTC Map",
    "keywords": [
      "Trouver des commerces avec BTC Map",
      "BTC Map",
      "Comment repérer des commerces acceptant Bitcoin ?",
      "bitcoin",
      "secondary bitcoin btc map"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBTC Map permet de repérer des lieux acceptant des paiements Bitcoin grâce à des contributions communautaires.\n\nExplication\n- La carte sert de point de départ pour chercher des commerçants, sans remplacer une confirmation auprès du lieu concerné.\n- Une donnée communautaire peut être ancienne ou incomplète ; les moyens de paiement acceptés peuvent changer.\n\nLimites et confusions\nUne présence sur la carte ne garantit pas que le commerce accepte encore Bitcoin ; confirmer localement.",
    "parentIds": [
      "bitcoin-payments-for-merchants",
      "earn-bitcoin"
    ],
    "relatedIds": [
      "bitcoin-payments-for-merchants",
      "earn-bitcoin"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc304 — How to Create a Bitcoin Community"
    ],
    "questions": [
      "Comment repérer des commerces acceptant Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "c06d5853b1209fad2c13870568a9ee313e7faff7bbe9bd4755337eb64a661244",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-btc-map.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-btcpay-extended-public-key",
    "conceptId": "secondary-bitcoin-btcpay-extended-public-key",
    "title": "Recevoir avec une clé publique étendue dans BTCPay",
    "keywords": [
      "Recevoir avec une clé publique étendue dans BTCPay",
      "BTCPay Extended Public Key",
      "BTCPay peut-il créer des adresses sans détenir mes clés privées ?",
      "bitcoin",
      "secondary bitcoin btcpay extended public key"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBTCPay peut dériver des adresses de réception depuis une clé publique étendue sans détenir les clés permettant de dépenser.\n\nExplication\n- Il permet un wallet watch-only côté serveur.\n- Sa fuite expose l’historique et les futures adresses de la branche.\n- Il doit être traité comme une donnée sensible de confidentialité.\n- Il facilite l’évitement de réutilisation d’adresse.\n\nLimites et confusions\nL'exposition de cette clé publique étendue peut révéler l'historique et les adresses dérivées de la branche concernée.",
    "parentIds": [
      "btcpay-server",
      "extended-public-key"
    ],
    "relatedIds": [
      "btcpay-server",
      "extended-public-key"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pos305 — Mastering BTC Pay Server"
    ],
    "questions": [
      "BTCPay peut-il créer des adresses sans détenir mes clés privées ?"
    ],
    "status": "reviewed",
    "sourceHash": "938f51d2467da660f18c87318c35a45feaab078fff4407a2328a95be8691653f",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-btcpay-extended-public-key.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-btcpay-hardware-wallet-integration",
    "conceptId": "secondary-bitcoin-btcpay-hardware-wallet-integration",
    "title": "Signer les dépenses BTCPay avec un appareil dédié",
    "keywords": [
      "Signer les dépenses BTCPay avec un appareil dédié",
      "BTCPay Hardware Wallet Integration",
      "Comment utiliser un hardware wallet avec BTCPay ?",
      "bitcoin",
      "secondary bitcoin btcpay hardware wallet integration"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn marchand peut recevoir via BTCPay et signer les dépenses avec un appareil distinct, notamment au moyen de PSBT.\n\nExplication\n- Le serveur peut préparer les données de dépense alors que les clés de signature restent sur un appareil séparé.\n- Le signataire doit comparer les destinataires, montants et frais affichés par l’appareil avant d’autoriser la dépense.\n\nLimites et confusions\nVérifier les détails sur l'écran fiable du dispositif de signature ; l'ordinateur ou serveur peut être compromis.",
    "parentIds": [
      "btcpay-server",
      "hardware-wallet"
    ],
    "relatedIds": [
      "btcpay-server",
      "hardware-wallet"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pos305 — Mastering BTC Pay Server"
    ],
    "questions": [
      "Comment utiliser un hardware wallet avec BTCPay ?"
    ],
    "status": "reviewed",
    "sourceHash": "22feb9fad9beaf1a3e8dff8c852fe028c11446f408a6ad41ff884b98a824fff7",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-btcpay-hardware-wallet-integration.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-btcpay-hot-wallet",
    "conceptId": "secondary-bitcoin-btcpay-hot-wallet",
    "title": "Les clés privées sur un serveur BTCPay",
    "keywords": [
      "Les clés privées sur un serveur BTCPay",
      "BTCPay Hot Wallet",
      "Quel risque ajoute un portefeuille connecté au serveur marchand ?",
      "bitcoin",
      "secondary bitcoin btcpay hot wallet"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn portefeuille à clés privées sur le serveur peut automatiser des dépenses mais expose les fonds à la compromission de cette infrastructure.\n\nExplication\n- La présence de clés sur le serveur facilite l’automatisation mais étend l’impact d’un compte ou serveur compromis.\n- Une architecture sans clés privées sur le serveur limite ce pouvoir de dépense, au prix d’étapes de signature supplémentaires.\n\nLimites et confusions\nLe risque dépend des accès, sauvegardes et permissions ; 'petit montant' ne rend pas un serveur sûr.",
    "parentIds": [
      "btcpay-server",
      "hot-wallet"
    ],
    "relatedIds": [
      "btcpay-server",
      "hot-wallet"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pos305 — Mastering BTC Pay Server"
    ],
    "questions": [
      "Quel risque ajoute un portefeuille connecté au serveur marchand ?"
    ],
    "status": "reviewed",
    "sourceHash": "5c1a997e1cd83e939329c974bf5e89572038ba403e2e127d149d23d9f7782d4f",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-btcpay-hot-wallet.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-btcpay-invoices",
    "conceptId": "secondary-bitcoin-btcpay-invoices",
    "title": "Les factures BTCPay",
    "keywords": [
      "Les factures BTCPay",
      "BTCPay Invoices",
      "Quelle différence entre une facture BTCPay et un paiement confirmé ?",
      "bitcoin",
      "secondary bitcoin btcpay invoices"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne facture BTCPay est une demande de paiement avec montant, expiration et méthodes acceptées. Elle sert à suivre le règlement du client.\n\nExplication\n- Elles définissent montant, devise, expiration et méthodes de paiement disponibles.\n- Elles permettent de suivre statut et confirmation.\n- Elles peuvent être générées par PoS, crowdfund, API ou payment request.\n- Leur cycle de vie est central dans un workflow marchand.\n\nLimites et confusions\nAfficher une facture ou un retour navigateur ne prouve pas le règlement final ; le statut doit être contrôlé.",
    "parentIds": [
      "btcpay-server",
      "bitcoin-payments-for-merchants"
    ],
    "relatedIds": [
      "btcpay-server",
      "bitcoin-payments-for-merchants"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pos305 — Mastering BTC Pay Server"
    ],
    "questions": [
      "Quelle différence entre une facture BTCPay et un paiement confirmé ?"
    ],
    "status": "reviewed",
    "sourceHash": "40a1685461279738bc45e1979120c9b87f605fd201adada2268d0d64d20bd3ee",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-btcpay-invoices.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-btcpay-security",
    "conceptId": "secondary-bitcoin-btcpay-security",
    "title": "Sécuriser une installation BTCPay",
    "keywords": [
      "Sécuriser une installation BTCPay",
      "BTCPay Security",
      "Que faut-il protéger en plus du mot de passe du compte BTCPay ?",
      "bitcoin",
      "secondary bitcoin btcpay security"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa sécurité BTCPay concerne à la fois les comptes, droits, tokens d'intégration, serveur et clés du portefeuille.\n\nExplication\n- La 2FA protège l’accès utilisateur mais ne remplace pas une bonne gestion des clés Bitcoin.\n- Les access tokens doivent être limités et révocables.\n- Les rôles doivent respecter le principe du moindre privilège.\n- Les hot wallets et payouts demandent une prudence particulière.\n\nLimites et confusions\nLa 2FA d'un compte ne protège pas à elle seule des clés privées exposées sur le serveur.",
    "parentIds": [
      "btcpay-server",
      "two-factor-authentication"
    ],
    "relatedIds": [
      "btcpay-server",
      "two-factor-authentication"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pos305 — Mastering BTC Pay Server"
    ],
    "questions": [
      "Que faut-il protéger en plus du mot de passe du compte BTCPay ?"
    ],
    "status": "reviewed",
    "sourceHash": "e4a97a50a03e97c84b9a4ae11148bfd58059d02b65ac270263cd8a8cd4765741",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-btcpay-security.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-casascius-physical-bitcoins",
    "conceptId": "secondary-bitcoin-casascius-physical-bitcoins",
    "title": "Les pièces physiques Casascius",
    "keywords": [
      "Les pièces physiques Casascius",
      "Casascius Physical Bitcoins",
      "Que contient réellement une pièce physique associée à des bitcoins ?",
      "bitcoin",
      "secondary bitcoin casascius physical bitcoins"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes pièces Casascius cachaient une clé privée sous un hologramme. Leur valeur en bitcoins dépend des fonds encore contrôlés par cette clé.\n\nExplication\n- Elles matérialisent des bitcoins virtuels sous forme d’objet de collection.\n- Elles rendent Bitcoin tangible pour le public.\n- Elles posent un modèle custodial/trust initial envers le fabricant.\n\nLimites et confusions\nL'objet physique ne prouve ni que la clé est secrète ni que les fonds sont toujours présents.",
    "parentIds": [
      "bitcoin-private-key",
      "self-custody"
    ],
    "relatedIds": [
      "bitcoin-private-key",
      "self-custody"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his203 — Bitcoin’s Pioneering Era"
    ],
    "questions": [
      "Que contient réellement une pièce physique associée à des bitcoins ?"
    ],
    "status": "reviewed",
    "sourceHash": "4b35ce88c6f303e1483dfd09cc1d74a1bf6dbdcf5e222614a5438751c98062ea",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-casascius-physical-bitcoins.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-cloud-mining-risk",
    "conceptId": "secondary-bitcoin-cloud-mining-risk",
    "title": "Les risques du minage à distance",
    "keywords": [
      "Les risques du minage à distance",
      "Cloud Mining Risk",
      "Quels risques cache une offre de cloud mining ?",
      "bitcoin",
      "secondary bitcoin cloud mining risk"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe cloud mining expose au fournisseur qui promet une part de puissance ou de revenus sans donner le contrôle du matériel.\n\nExplication\n- Le client dépend des contrats, des comptes rendus et de la capacité du fournisseur à distribuer les revenus annoncés.\n- Les interruptions, coûts réels et clauses de résiliation peuvent rendre le rendement bien différent des projections commerciales.\n\nLimites et confusions\nRentabilité, frais, réalité des machines et conditions de retrait doivent être vérifiés ; un rendement garanti est un signal d'alerte.",
    "parentIds": [
      "bitcoin-scams",
      "mining-profitability"
    ],
    "relatedIds": [
      "bitcoin-scams",
      "mining-profitability"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min304 — Heat your home while mining bitcoins"
    ],
    "questions": [
      "Quels risques cache une offre de cloud mining ?"
    ],
    "status": "reviewed",
    "sourceHash": "2bda34e0b19dd52f47077442c8785c37bdd971006c6ab8e5cf81114e4293617e",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-cloud-mining-risk.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-coinbase-maturity",
    "conceptId": "secondary-bitcoin-coinbase-maturity",
    "title": "La maturité des récompenses de bloc",
    "keywords": [
      "La maturité des récompenses de bloc",
      "Coinbase Maturity",
      "Quand un mineur peut-il dépenser les sorties de sa transaction coinbase ?",
      "bitcoin",
      "secondary bitcoin coinbase maturity"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne sortie coinbase créée à la hauteur h ne peut être dépensée dans un bloc avant h + 100.\n\nExplication\n- Les sorties de la transaction coinbase ont un délai particulier avant leur dépense, distinct des paiements ordinaires.\n- Ce délai réduit certaines conséquences d’une disparition de récompense lors d’une réorganisation récente.\n\nLimites et confusions\nCette règle ne rend pas impossible une réorganisation plus profonde et ne s'applique pas à toutes les sorties ordinaires.",
    "parentIds": [
      "block-reward",
      "bitcoin-transaction-confirmation"
    ],
    "relatedIds": [
      "block-reward",
      "bitcoin-transaction-confirmation"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min101 — Introduction to Bitcoin mining"
    ],
    "questions": [
      "Quand un mineur peut-il dépenser les sorties de sa transaction coinbase ?"
    ],
    "status": "reviewed",
    "sourceHash": "6e3c98d42cd847de65cbbddeba6487c356ae2bf4f8fc684120f555eab42cfd53",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-coinbase-maturity.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-coinbase-transaction",
    "conceptId": "secondary-bitcoin-coinbase-transaction",
    "title": "La transaction coinbase",
    "keywords": [
      "La transaction coinbase",
      "Coinbase Transaction",
      "Pourquoi la première transaction d’un bloc est-elle particulière ?",
      "bitcoin",
      "secondary bitcoin coinbase transaction"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa coinbase est la première transaction du bloc et n'utilise pas une entrée ordinaire dépensant un ancien UTXO. Elle peut attribuer jusqu'à la subvention autorisée plus les frais du bloc.\n\nExplication\n- Les entrées ordinaires dépensent des sorties antérieures ; la coinbase suit un format spécial lié au bloc.\n- La somme qu’elle peut attribuer est encadrée par la subvention à cette hauteur et les frais du bloc ; les nœuds vérifient cette limite.\n\nLimites et confusions\nLe mineur peut réclamer moins que le maximum ; les sorties sont soumises à maturité.",
    "parentIds": [
      "block-reward",
      "bitcoin-transaction-input"
    ],
    "relatedIds": [
      "block-reward",
      "bitcoin-transaction-input"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min101 — Introduction to Bitcoin mining"
    ],
    "questions": [
      "Pourquoi la première transaction d’un bloc est-elle particulière ?"
    ],
    "status": "reviewed",
    "sourceHash": "c0b27ed9da85eb5aa87c7eb0b90991a6675199e7c210f7154aece2f1f1ddfe1d",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-coinbase-transaction.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-collision-resistance",
    "conceptId": "secondary-bitcoin-collision-resistance",
    "title": "La résistance aux collisions",
    "keywords": [
      "La résistance aux collisions",
      "Collision Resistance",
      "Deux données différentes peuvent-elles avoir la même empreinte ?",
      "bitcoin",
      "secondary bitcoin collision resistance"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nRésister aux collisions signifie qu'il est impraticable de trouver 2 entrées distinctes produisant la même empreinte.\n\nExplication\n- Une collision menace l’intégrité des engagements.\n- La difficulté attendue est liée au birthday bound.\n- Elle est cruciale pour structures comme Merkle trees et signatures sur hash.\n- Elle est différente de la résistance à la préimage.\n\nLimites et confusions\nUne empreinte de taille finie a forcément des collisions ; la propriété porte sur la difficulté de les trouver.",
    "parentIds": [
      "cryptographic-hash-function",
      "merkle-tree"
    ],
    "relatedIds": [
      "cryptographic-hash-function",
      "merkle-tree"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp302 — Modern Cryptography Fundamentals"
    ],
    "questions": [
      "Deux données différentes peuvent-elles avoir la même empreinte ?"
    ],
    "status": "reviewed",
    "sourceHash": "c911190fcae227263e556d69071e9e9892c122c38a02792f6273d2c3989b6723",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-collision-resistance.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-compact-block-filters",
    "conceptId": "secondary-bitcoin-compact-block-filters",
    "title": "Les filtres compacts de blocs",
    "keywords": [
      "Les filtres compacts de blocs",
      "Compact Block Filters",
      "Comment un portefeuille léger cherche-t-il ses transactions sans révéler toutes ses adresses ?",
      "bitcoin",
      "secondary bitcoin compact block filters"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nDes filtres compacts aident un portefeuille à repérer localement les blocs susceptibles de contenir ses transactions sans communiquer directement toutes ses adresses.\n\nExplication\n- Le portefeuille compare localement ses scripts aux filtres et récupère les blocs susceptibles de le concerner.\n- Les faux positifs entraînent des téléchargements supplémentaires ; des pairs et données fiables restent nécessaires.\n\nLimites et confusions\nLes garanties supposent des données conformes ; un pair malveillant ou des requêtes corrélées peuvent encore poser problème.",
    "parentIds": [
      "spv-node",
      "wallet-node-connection"
    ],
    "relatedIds": [
      "spv-node",
      "wallet-node-connection"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro202 — Programming Bitcoin"
    ],
    "questions": [
      "Comment un portefeuille léger cherche-t-il ses transactions sans révéler toutes ses adresses ?"
    ],
    "status": "reviewed",
    "sourceHash": "64d06c5f96ec270eead7e80fedcb71d29ff080566ee8f854e12359a82c7abb12",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-compact-block-filters.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-confidential-address",
    "conceptId": "secondary-bitcoin-confidential-address",
    "title": "Les adresses confidentielles de Liquid",
    "keywords": [
      "Les adresses confidentielles de Liquid",
      "Confidential Address",
      "À quoi sert une adresse confidentielle sur Liquid ?",
      "bitcoin",
      "secondary bitcoin confidential address"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne adresse confidentielle Liquid inclut des informations de masquage permettant à l'expéditeur de dissimuler les montants au public.\n\nExplication\n- L’expéditeur a besoin d’informations cryptographiques supplémentaires pour construire un montant masqué que le destinataire pourra interpréter.\n- Cette information de réception doit être distinguée des clés autorisant la dépense.\n\nLimites et confusions\nUne adresse confidentielle ne garantit pas à elle seule l'anonymat des parties.",
    "parentIds": [
      "liquid-network",
      "bitcoin-address"
    ],
    "relatedIds": [
      "liquid-network",
      "bitcoin-address"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB sid202 — Building with Elements and Liquid Network"
    ],
    "questions": [
      "À quoi sert une adresse confidentielle sur Liquid ?"
    ],
    "status": "reviewed",
    "sourceHash": "b04ba01e7d7d5511162332fcfb59a938c1b972b9f44d742c38add2845bfc33c3",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-confidential-address.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-confidential-transactions",
    "conceptId": "secondary-bitcoin-confidential-transactions",
    "title": "Les transactions confidentielles",
    "keywords": [
      "Les transactions confidentielles",
      "Confidential Transactions",
      "Comment vérifier des montants sans les rendre publics ?",
      "bitcoin",
      "secondary bitcoin confidential transactions"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes transactions confidentielles cachent les montants tout en permettant de vérifier certaines contraintes comptables. Dans Liquid, le type d'actif peut aussi être masqué.\n\nExplication\n- Liquid ajoute aussi le masquage du type d’actif.\n- Elles reposent sur des commitments et proofs pour empêcher l’inflation cachée.\n- Elles servent surtout la confidentialité commerciale et financière.\n\nLimites et confusions\nElles ne rendent pas automatiquement anonymes les participants et n'éliminent pas les bugs d'implémentation.",
    "parentIds": [
      "liquid-network",
      "blockchain-privacy-leaks"
    ],
    "relatedIds": [
      "liquid-network",
      "blockchain-privacy-leaks"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB sid302 — Liquid Bootcamp Essentials"
    ],
    "questions": [
      "Comment vérifier des montants sans les rendre publics ?"
    ],
    "status": "reviewed",
    "sourceHash": "d4d51bd7decb9cee2ebe2c0ef0baab95b314c0a86419519868e8d0646c700ece",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-confidential-transactions.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-consensus-critical-dependency-risk",
    "conceptId": "secondary-bitcoin-consensus-critical-dependency-risk",
    "title": "Les dépendances logicielles critiques pour le consensus",
    "keywords": [
      "Les dépendances logicielles critiques pour le consensus",
      "Consensus-Critical Dependency Risk",
      "Pourquoi une bibliothèque logicielle peut-elle provoquer une divergence entre nœuds ?",
      "bitcoin",
      "secondary bitcoin consensus critical dependency risk"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nSi des versions de logiciel ou bibliothèques interprètent différemment une même donnée, les nœuds peuvent diverger sur la validité d'un bloc.\n\nExplication\n- Des parseurs différents peuvent accepter ou refuser des signatures différemment.\n- Une mise à jour de bibliothèque peut créer une divergence de consensus même si elle corrige un bug ailleurs.\n- Bitcoin cherche à minimiser les dépendances qui touchent au consensus.\n- BIP66 a réduit une dépendance problématique à OpenSSL pour l’encodage DER.\n\nLimites et confusions\nUne correction logicielle isolée peut donc nécessiter des précautions de consensus supplémentaires.",
    "parentIds": [
      "bitcoin-consensus",
      "bitcoin-core"
    ],
    "relatedIds": [
      "bitcoin-consensus",
      "bitcoin-core"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Pourquoi une bibliothèque logicielle peut-elle provoquer une divergence entre nœuds ?"
    ],
    "status": "reviewed",
    "sourceHash": "c5ca5c26e0fd75cb07015ea2e41d80be53b13c9ba206096339aa7df473795c11",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-consensus-critical-dependency-risk.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-crypto-anarchist-manifesto",
    "conceptId": "secondary-bitcoin-crypto-anarchist-manifesto",
    "title": "Le manifeste crypto-anarchiste",
    "keywords": [
      "Le manifeste crypto-anarchiste",
      "Crypto Anarchist Manifesto",
      "Quelles idées Timothy May associait-il à la cryptographie ?",
      "bitcoin",
      "secondary bitcoin crypto anarchist manifesto"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe manifeste crypto-anarchiste de Timothy May présente la cryptographie comme moyen de transformer le contrôle des échanges et communications.\n\nExplication\n- Le texte lie possibilités techniques de la cryptographie et transformation des rapports de pouvoir.\n- Il sert de contexte intellectuel aux cypherpunks ; il faut distinguer ce programme politique des mécanismes techniques de Bitcoin.\n\nLimites et confusions\nC'est une position politique historique, pas une description neutre des effets garantis du protocole.",
    "parentIds": [
      "cypherpunk-movement"
    ],
    "relatedIds": [
      "cypherpunk-movement"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB phi305 — Spinoza and Bitcoin"
    ],
    "questions": [
      "Quelles idées Timothy May associait-il à la cryptographie ?"
    ],
    "status": "reviewed",
    "sourceHash": "3c75a34f73cbffd82831814cb137275a23cc6a92e4f6c1d4a2a45fc0b3361912",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-crypto-anarchist-manifesto.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-cryptographic-commitment",
    "conceptId": "secondary-bitcoin-cryptographic-commitment",
    "title": "Les engagements cryptographiques",
    "keywords": [
      "Les engagements cryptographiques",
      "Cryptographic Commitment",
      "Comment s’engager sur une valeur sans la révéler immédiatement ?",
      "bitcoin",
      "secondary bitcoin cryptographic commitment"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn engagement cryptographique permet de fixer une valeur tout en la cachant, puis de démontrer plus tard quelle valeur avait été choisie.\n\nExplication\n- Il combine une propriété de masquage et une propriété d’engagement.\n- Les Pedersen commitments sont une forme utilisée dans les transactions confidentielles.\n- Cette primitive permet de vérifier des contraintes sans révéler les données brutes.\n\nLimites et confusions\nLes propriétés exactes de masquage et d'engagement dépendent de la construction.",
    "parentIds": [
      "cryptographic-hash-function",
      "liquid-network"
    ],
    "relatedIds": [
      "cryptographic-hash-function",
      "liquid-network"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB sid302 — Liquid Bootcamp Essentials"
    ],
    "questions": [
      "Comment s’engager sur une valeur sans la révéler immédiatement ?"
    ],
    "status": "reviewed",
    "sourceHash": "8b15600fa265a12c6bf30e92a0b426cc6e9f6c065f828aa6bb9adc6d0c90ace0",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-cryptographic-commitment.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-cypherpunk-manifesto",
    "conceptId": "secondary-bitcoin-cypherpunk-manifesto",
    "title": "Le manifeste cypherpunk",
    "keywords": [
      "Le manifeste cypherpunk",
      "Cypherpunk Manifesto",
      "Quelle conception de la vie privée défendait Eric Hughes ?",
      "bitcoin",
      "secondary bitcoin cypherpunk manifesto"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe manifeste d'Eric Hughes défend la vie privée et la possibilité de choisir les informations révélées grâce à la cryptographie.\n\nExplication\n- Le texte insiste sur la capacité des individus à choisir quelles informations révéler.\n- La construction de logiciels est présentée comme une manière de rendre cette confidentialité praticable.\n\nLimites et confusions\nLes positions d'un manifeste ne représentent pas nécessairement tous les utilisateurs de Bitcoin.",
    "parentIds": [
      "cypherpunk-movement",
      "bitcoin-pseudonymity"
    ],
    "relatedIds": [
      "cypherpunk-movement",
      "bitcoin-pseudonymity"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB phi305 — Spinoza and Bitcoin"
    ],
    "questions": [
      "Quelle conception de la vie privée défendait Eric Hughes ?"
    ],
    "status": "reviewed",
    "sourceHash": "33926a0c57b79438a6f4e51fe2a05dc8497d8cbe77d03aaacda7f533e95d850d",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-cypherpunk-manifesto.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-defense-in-depth",
    "conceptId": "secondary-bitcoin-defense-in-depth",
    "title": "Combiner plusieurs protections",
    "keywords": [
      "Combiner plusieurs protections",
      "Defense in Depth",
      "Comment ajouter des protections sans rendre sa récupération trop complexe ?",
      "bitcoin",
      "secondary bitcoin defense in depth"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa défense en profondeur combine des protections couvrant des risques différents afin qu'une seule défaillance ne compromette pas tout.\n\nExplication\n- Exemples : hardware wallet, multisig, 2FA, séparation des rôles, backups et validation logicielle.\n- Chaque couche doit couvrir des scénarios différents.\n- Trop de couches mal comprises peut aussi créer des risques d’erreur.\n- Elle doit rester testable et récupérable.\n\nLimites et confusions\nAccumuler des couches mal comprises peut augmenter le risque de perte ; les procédures doivent rester testables.",
    "parentIds": [
      "threat-model",
      "multisig"
    ],
    "relatedIds": [
      "threat-model",
      "multisig"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "Comment ajouter des protections sans rendre sa récupération trop complexe ?"
    ],
    "status": "reviewed",
    "sourceHash": "63c6d0936ae4cc4fe45788e50c93ddfe442554c7d35c843ba26c4bd2a48c45e2",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-defense-in-depth.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-deterministic-ecdsa-nonce",
    "conceptId": "secondary-bitcoin-deterministic-ecdsa-nonce",
    "title": "Les nonces déterministes d’ECDSA",
    "keywords": [
      "Les nonces déterministes d’ECDSA",
      "Deterministic ECDSA Nonce",
      "Pourquoi un mauvais nonce de signature peut-il exposer une clé privée ?",
      "bitcoin",
      "secondary bitcoin deterministic ecdsa nonce"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nECDSA utilise un nonce secret par message signé. Une génération déterministe bien conçue réduit le risque d'un générateur aléatoire défaillant lors de la signature.\n\nExplication\n- ECDSA exige un nonce unique et imprévisible pour chaque signature.\n- Réutiliser ou révéler K peut exposer la clé privée.\n- RFC 6979 est la méthode moderne courante pour générer K de manière déterministe.\n- Cette pratique réduit fortement la dépendance à un générateur aléatoire au moment de signer.\n\nLimites et confusions\nRéutiliser un nonce pour des messages différents peut exposer la clé ; on utilise une bibliothèque éprouvée, pas une recette artisanale.",
    "parentIds": [
      "digital-signature",
      "entropy"
    ],
    "relatedIds": [
      "digital-signature",
      "entropy"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro202 — Programming Bitcoin"
    ],
    "questions": [
      "Pourquoi un mauvais nonce de signature peut-il exposer une clé privée ?"
    ],
    "status": "reviewed",
    "sourceHash": "1e27bfc38c6aa66b56d59dbe160231e528a5e8e3aeeed194663a94fd7b74526f",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-deterministic-ecdsa-nonce.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-digicash",
    "conceptId": "secondary-bitcoin-digicash",
    "title": "DigiCash avant Bitcoin",
    "keywords": [
      "DigiCash avant Bitcoin",
      "DigiCash",
      "Pourquoi l’ecash de DigiCash dépendait-il encore d’intermédiaires ?",
      "bitcoin",
      "secondary bitcoin digicash"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nDigiCash commercialisait l'ecash de David Chaum avec des émetteurs partenaires, avant Bitcoin.\n\nExplication\n- Le système associait des techniques de signatures aveugles à un modèle avec émetteurs partenaires.\n- Cette architecture illustre qu’une monnaie peut avoir une confidentialité forte tout en dépendant d’intermédiaires.\n\nLimites et confusions\nLa confidentialité cryptographique ne supprimait pas la dépendance à l'émetteur et à l'entreprise.",
    "parentIds": [
      "cashu-et-confiance-dans-le-mint",
      "cypherpunk-movement"
    ],
    "relatedIds": [
      "cashu-et-confiance-dans-le-mint",
      "cypherpunk-movement"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his201 — The History of Bitcoin's Creation"
    ],
    "questions": [
      "Pourquoi l’ecash de DigiCash dépendait-il encore d’intermédiaires ?"
    ],
    "status": "reviewed",
    "sourceHash": "bf284dabdd70baad56b174b0769e83f59216fd1cd4da3895bda0c68409419b5a",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-digicash.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-dlc",
    "conceptId": "secondary-bitcoin-dlc",
    "title": "Les contrats DLC et leurs oracles",
    "keywords": [
      "Les contrats DLC et leurs oracles",
      "DLC",
      "Comment un contrat Bitcoin peut-il dépendre d’un événement extérieur ?",
      "bitcoin",
      "secondary bitcoin dlc"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn DLC permet de conditionner le règlement d'un contrat à une attestation cryptographique d'oracle, sans publier tous les termes du contrat dans la chaîne.\n\nExplication\n- Les parties définissent à l’avance des règlements correspondant aux résultats possibles et à l’attestation attendue de l’oracle.\n- L’oracle peut influencer le règlement par ce qu’il atteste ; l’absence de garde des fonds ne rend donc pas son rôle sans risque.\n\nLimites et confusions\nL'oracle ne détient normalement pas les clés des fonds mais peut mentir, disparaître ou colluder ; le résultat n'est pas forcément lisible publiquement.",
    "parentIds": [
      "atomic-swap",
      "bitcoin-script"
    ],
    "relatedIds": [
      "atomic-swap",
      "bitcoin-script"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "Synthèse du vault — DLC ; référence externe non précisée dans la note source."
    ],
    "questions": [
      "Comment un contrat Bitcoin peut-il dépendre d’un événement extérieur ?"
    ],
    "status": "reviewed",
    "sourceHash": "a1f14eac7de596d0bb9ccb388cf04f643c306bc34686adf81d490836e688cc3d",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-dlc.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-dns-seeds",
    "conceptId": "secondary-bitcoin-dns-seeds",
    "title": "La découverte de pairs par DNS",
    "keywords": [
      "La découverte de pairs par DNS",
      "DNS Seeds",
      "Comment un nouveau nœud trouve-t-il ses premiers pairs ?",
      "bitcoin",
      "secondary bitcoin dns seeds"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes DNS seeds aident un nouveau nœud à découvrir des pairs. Les adresses reçues ne décident pas des règles de validité des blocs.\n\nExplication\n- Ils aident un nœud sans carnet d’adresses à rejoindre le réseau.\n- Ils sont maintenus par des contributeurs ou développeurs reconnus.\n- Après bootstrap, le nœud apprend d’autres pairs via le réseau lui-même.\n- Ils ne sont pas consensus-critical et ne contrôlent pas la validité des blocs.\n\nLimites et confusions\nUne mauvaise découverte de pairs peut néanmoins affecter disponibilité ou isolation du nœud.",
    "parentIds": [
      "bitcoin-p2p-network",
      "bitcoin-decentralization"
    ],
    "relatedIds": [
      "bitcoin-p2p-network",
      "bitcoin-decentralization"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro202 — Programming Bitcoin"
    ],
    "questions": [
      "Comment un nouveau nœud trouve-t-il ses premiers pairs ?"
    ],
    "status": "reviewed",
    "sourceHash": "eba37d581936c4c4618226de47dbb25042509943a67e81eb96ecfdb5cc4a95a5",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-dns-seeds.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-dormant-bitcoin-address",
    "conceptId": "secondary-bitcoin-dormant-bitcoin-address",
    "title": "Le déplacement de bitcoins longtemps immobiles",
    "keywords": [
      "Le déplacement de bitcoins longtemps immobiles",
      "Dormant Bitcoin Address",
      "De vieux bitcoins qui bougent annoncent-ils forcément une vente ?",
      "bitcoin",
      "secondary bitcoin dormant bitcoin address"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe déplacement de bitcoins restés longtemps immobiles peut correspondre à une vente, mais aussi à une migration de portefeuille, une succession ou une simple réorganisation.\n\nExplication\n- Un réveil d'adresse ne signifie pas automatiquement une vente : il peut s'agir d'un transfert interne, d'une migration technique, d'un paiement, d'un héritage, d'une récupération de clés ou d'une prise de profits.\n- L'analyse doit distinguer destination, change, dust, labels d'exchanges et trajectoire ultérieure des UTXO.\n- Les très vieux BTC qui bougent sont souvent interprétés comme un signal de marché, mais cette lecture reste probabiliste.\n\nLimites et confusions\nL'ancienneté et le mouvement on-chain seuls ne prouvent ni identité ni intention.",
    "parentIds": [
      "bitcoin-chain-analysis",
      "lost-bitcoins"
    ],
    "relatedIds": [
      "bitcoin-chain-analysis",
      "lost-bitcoins"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "Article ou ressource du vault — Mineur Satoshi-era - transfert de 203M en BTC"
    ],
    "questions": [
      "De vieux bitcoins qui bougent annoncent-ils forcément une vente ?"
    ],
    "status": "reviewed",
    "sourceHash": "690db1e51194a1c502fab282db3ae2d81ea9e030466cdaa18137a96221358c71",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-dormant-bitcoin-address.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-dual-funded-channels",
    "conceptId": "secondary-bitcoin-dual-funded-channels",
    "title": "Les canaux financés par les 2 participants",
    "keywords": [
      "Les canaux financés par les 2 participants",
      "Dual-Funded Channels",
      "Les 2 participants peuvent-ils apporter des fonds à l’ouverture d’un canal ?",
      "bitcoin",
      "secondary bitcoin dual funded channels"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nDans un canal à financement partagé, les 2 participants peuvent apporter des fonds à l'ouverture, ce qui répartit la liquidité initiale.\n\nExplication\n- Ils améliorent la distribution initiale de liquidité.\n- Ils nécessitent une coordination plus riche à l’ouverture.\n- Ils peuvent aider l’onboarding marchand ou wallet.\n- Ils réduisent certains besoins de rebalancing initial.\n\nLimites et confusions\nCela dépend de la compatibilité des implémentations et ne garantit pas une liquidité équilibrée ou suffisante ensuite.",
    "parentIds": [
      "lightning-channel",
      "lightning-liquidity"
    ],
    "relatedIds": [
      "lightning-channel",
      "lightning-liquidity"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "Les 2 participants peuvent-ils apporter des fonds à l’ouverture d’un canal ?"
    ],
    "status": "reviewed",
    "sourceHash": "64869de0ecae7731a1a93993cddcdb8fae291d9e7af0cce97e35dfd1a6ee6937",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-dual-funded-channels.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-ecdsa-signature",
    "conceptId": "secondary-bitcoin-ecdsa-signature",
    "title": "Les signatures ECDSA dans Bitcoin",
    "keywords": [
      "Les signatures ECDSA dans Bitcoin",
      "ECDSA Signature",
      "Bitcoin utilise-t-il encore ECDSA depuis Taproot ?",
      "bitcoin",
      "secondary bitcoin ecdsa signature"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBitcoin utilise ECDSA pour plusieurs formats de dépense et Schnorr pour Taproot. La protection du nonce de signature est essentielle avec ECDSA.\n\nExplication\n- Les formats historiques et SegWit v0 continuent d’utiliser ECDSA ; Taproot introduit Schnorr pour ses propres dépenses.\n- La signature permet de vérifier l’autorisation d’une dépense, sans chiffrer la transaction ni cacher ses montants.\n\nLimites et confusions\nTaproot n'a pas remplacé toutes les signatures ECDSA existantes.",
    "parentIds": [
      "digital-signature",
      "taproot"
    ],
    "relatedIds": [
      "digital-signature",
      "taproot"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Bitcoin utilise-t-il encore ECDSA depuis Taproot ?"
    ],
    "status": "reviewed",
    "sourceHash": "5dcf6c668a6bfd55b5de5d04e50efb3ca48ff957a131444cefa48916b30d4683",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-ecdsa-signature.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-eclipse-attack",
    "conceptId": "secondary-bitcoin-eclipse-attack",
    "title": "L’isolement d’un nœud par attaque eclipse",
    "keywords": [
      "L’isolement d’un nœud par attaque eclipse",
      "Eclipse Attack",
      "Un attaquant peut-il cacher le réseau à un nœud Bitcoin ?",
      "bitcoin",
      "secondary bitcoin eclipse attack"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne attaque eclipse cherche à contrôler les connexions d'un nœud pour l'isoler des pairs honnêtes et lui cacher ou retarder des informations.\n\nExplication\n- Elle peut aider à retarder ou cacher des transactions et blocs.\n- Elle s’appuie souvent sur une forme de contrôle Sybil des connexions.\n- Bitcoin Core utilise plusieurs heuristiques pour réduire ce risque.\n\nLimites et confusions\nElle ne rend pas valides des blocs invalides au regard des règles que le nœud vérifie.",
    "parentIds": [
      "bitcoin-p2p-network",
      "bitcoin-node"
    ],
    "relatedIds": [
      "bitcoin-p2p-network",
      "bitcoin-node"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Un attaquant peut-il cacher le réseau à un nœud Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "41b43930ab394d320c507007488acae121fb96a1f3a94fef5193948d9f1296f1",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-eclipse-attack.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-elliptic-curve-cryptography",
    "conceptId": "secondary-bitcoin-elliptic-curve-cryptography",
    "title": "La cryptographie sur courbes elliptiques",
    "keywords": [
      "La cryptographie sur courbes elliptiques",
      "Elliptic Curve Cryptography",
      "Comment une clé publique est-elle liée à une clé privée ?",
      "bitcoin",
      "secondary bitcoin elliptic curve cryptography"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa cryptographie sur courbes elliptiques relie des clés privées, des clés publiques et des signatures vérifiables. Bitcoin utilise notamment la courbe secp256k1.\n\nExplication\n- Une opération sur la courbe permet de calculer une clé publique à partir d’une clé privée.\n- Les signatures permettent ensuite de démontrer une autorisation sans transmettre directement le secret.\n\nLimites et confusions\nL'impossibilité d'inversion est une hypothèse de difficulté calculatoire avec les moyens connus, pas une impossibilité mathématique absolue.",
    "parentIds": [
      "bitcoin-public-key",
      "digital-signature"
    ],
    "relatedIds": [
      "bitcoin-public-key",
      "digital-signature"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Comment une clé publique est-elle liée à une clé privée ?"
    ],
    "status": "reviewed",
    "sourceHash": "cef81803f361a54b5ee3d9f5edc1ae658c60a70aaa05180ce447f719b30bed33",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-elliptic-curve-cryptography.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-exchange-rate-risk",
    "conceptId": "secondary-bitcoin-exchange-rate-risk",
    "title": "Le risque de change lors d’un paiement",
    "keywords": [
      "Le risque de change lors d’un paiement",
      "Exchange Rate Risk",
      "Le prix peut-il varier entre la facture et la conversion des bitcoins ?",
      "bitcoin",
      "secondary bitcoin exchange rate risk"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe prix du bitcoin peut varier entre le devis, le paiement et la conversion éventuelle ; une facture expirant limite la durée d'un taux proposé.\n\nExplication\n- Un commerçant peut fixer ses prix dans une devise et calculer la quantité de BTC demandée au moment de la facture.\n- Après encaissement, la valeur du BTC conservé continue de varier par rapport à cette devise.\n\nLimites et confusions\nL'expiration de la facture ne stabilise pas la valeur des bitcoins déjà reçus.",
    "parentIds": [
      "bitcoin-payments-for-merchants",
      "bitcoin-volatility"
    ],
    "relatedIds": [
      "bitcoin-payments-for-merchants",
      "bitcoin-volatility"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pos305 — Mastering BTC Pay Server"
    ],
    "questions": [
      "Le prix peut-il varier entre la facture et la conversion des bitcoins ?"
    ],
    "status": "reviewed",
    "sourceHash": "63efd438698423f8335afc3c09d03bef7e0bc3b9aa7b25c722dee9e36a2ae0fd",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-exchange-rate-risk.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-extended-private-key",
    "conceptId": "secondary-bitcoin-extended-private-key",
    "title": "Les clés privées étendues",
    "keywords": [
      "Les clés privées étendues",
      "Extended Private Key",
      "Pourquoi une clé privée étendue est-elle particulièrement sensible ?",
      "bitcoin",
      "secondary bitcoin extended private key"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne clé privée étendue permet de dériver des clés privées enfants dans une hiérarchie de portefeuille.\n\nExplication\n- Elle est souvent représentée par des préfixes comme xprv, yprv ou zprv selon contexte.\n- Sa fuite peut compromettre une branche entière du wallet.\n- Elle contient ou implique un chain code.\n- Elle peut produire l’extended public key correspondante.\n\nLimites et confusions\nSa fuite peut compromettre une branche entière ; elle doit rester secrète, contrairement à une simple donnée de réception.",
    "parentIds": [
      "hd-wallet",
      "bitcoin-private-key"
    ],
    "relatedIds": [
      "hd-wallet",
      "bitcoin-private-key"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Pourquoi une clé privée étendue est-elle particulièrement sensible ?"
    ],
    "status": "reviewed",
    "sourceHash": "1ea3205493d2e3c77b6336b99de8b082c394f3d1217eff46dcdac936c9bf4556",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-extended-private-key.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-fee-only-security-model",
    "conceptId": "secondary-bitcoin-fee-only-security-model",
    "title": "La rémunération minière fondée sur les frais",
    "keywords": [
      "La rémunération minière fondée sur les frais",
      "Fee-Only Security Model",
      "Que pourrait-il se passer lorsque la subvention de bloc devient négligeable ?",
      "bitcoin",
      "secondary bitcoin fee only security model"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nÀ mesure que la subvention diminue, les frais prennent une place potentiellement plus importante dans la rémunération des mineurs.\n\nExplication\n- La transition déplace le coût de sécurité des détenteurs dilués par la subvention vers les utilisateurs qui paient des frais.\n- L’équilibre dépendra de la demande d’espace de bloc, du prix de BTC et des comportements de mineurs.\n- Un mempool peu rémunérateur peut créer des incitations à réorganiser des blocs riches en frais.\n- Le sujet est important mais très incertain à horizon 2140.\n\nLimites et confusions\nLe niveau futur des frais, du hashrate et de sécurité reste incertain ; aucune rentabilité future n'est garantie.",
    "parentIds": [
      "block-reward",
      "bitcoin-halving"
    ],
    "relatedIds": [
      "block-reward",
      "bitcoin-halving"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Que pourrait-il se passer lorsque la subvention de bloc devient négligeable ?"
    ],
    "status": "reviewed",
    "sourceHash": "156357c5d57fac1ce1eb9c8ab38b0685a8dee71fd0e8bf9edf446d7688457c8e",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-fee-only-security-model.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-fee-sniping",
    "conceptId": "secondary-bitcoin-fee-sniping",
    "title": "La tentative de récupérer les frais d’un bloc récent",
    "keywords": [
      "La tentative de récupérer les frais d’un bloc récent",
      "Fee Sniping",
      "Qu’appelle-t-on fee sniping ?",
      "bitcoin",
      "secondary bitcoin fee sniping"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn mineur peut envisager de reconstruire un bloc récent particulièrement rémunérateur pour tenter d'en récupérer les frais.\n\nExplication\n- Le mineur compare le revenu attendu d’une tentative de remplacement à celui d’un nouveau bloc sur la pointe courante.\n- Un fort écart de frais entre blocs peut modifier ses incitations, mais le risque d’échec de la tentative reste déterminant.\n\nLimites et confusions\nL'intérêt dépend des probabilités de réussite et du revenu abandonné ; ce n'est pas un comportement inévitable.",
    "parentIds": [
      "block-reward",
      "bitcoin-finality"
    ],
    "relatedIds": [
      "block-reward",
      "bitcoin-finality"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Qu’appelle-t-on fee sniping ?"
    ],
    "status": "reviewed",
    "sourceHash": "096c92d2b067e09e8e1974832bdf28767dbccb2885e6b623845f49690f0b70b6",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-fee-sniping.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-hardened-derivation",
    "conceptId": "secondary-bitcoin-hardened-derivation",
    "title": "La dérivation renforcée des clés",
    "keywords": [
      "La dérivation renforcée des clés",
      "Hardened Derivation",
      "Que signifie hardened dans un chemin de dérivation ?",
      "bitcoin",
      "secondary bitcoin hardened derivation"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa dérivation hardened nécessite la clé privée parent et empêche de dériver cette branche depuis le seul xpub parent.\n\nExplication\n- Elle est notée avec une apostrophe ou un h dans les chemins.\n- Elle protège mieux certaines frontières hiérarchiques.\n- Elle empêche un xpub parent de dériver cette branche.\n- Elle est généralement utilisée aux niveaux élevés comme purpose, coin type et account.\n\nLimites et confusions\nElle ne protège pas contre la fuite de la clé privée de la branche ni contre une sauvegarde compromise.",
    "parentIds": [
      "derivation-path",
      "extended-public-key"
    ],
    "relatedIds": [
      "derivation-path",
      "extended-public-key"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Que signifie hardened dans un chemin de dérivation ?"
    ],
    "status": "reviewed",
    "sourceHash": "c2f78a1783edf80f49d779c56b632494415d6e9438ba545b11db3abe091cce4c",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-hardened-derivation.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-hash160",
    "conceptId": "secondary-bitcoin-hash160",
    "title": "La fonction HASH160",
    "keywords": [
      "La fonction HASH160",
      "HASH160",
      "Pourquoi certains formats Bitcoin utilisent-ils une empreinte de 160 bits ?",
      "bitcoin",
      "secondary bitcoin hash160"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nHASH160 applique SHA-256 puis RIPEMD-160 et produit une empreinte de 160 bits, utilisée notamment dans les sorties P2PKH.\n\nExplication\n- La composition applique d’abord SHA-256, puis RIPEMD-160 au résultat.\n- Certaines sorties engagent une empreinte de clé publique ; le format d’adresse encode ensuite cette donnée avec des informations de type et de réseau.\n\nLimites et confusions\nNe pas assimiler cette empreinte à une clé publique ni à tous les formats d'adresses.",
    "parentIds": [
      "bitcoin-address",
      "cryptographic-hash-function"
    ],
    "relatedIds": [
      "bitcoin-address",
      "cryptographic-hash-function"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Pourquoi certains formats Bitcoin utilisent-ils une empreinte de 160 bits ?"
    ],
    "status": "reviewed",
    "sourceHash": "65108fa5d8bd82a0aded9df28d951c2197f3d6e4597263134821b045d709b07e",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-hash160.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-home-bitcoin-mining",
    "conceptId": "secondary-bitcoin-home-bitcoin-mining",
    "title": "Le minage à domicile",
    "keywords": [
      "Le minage à domicile",
      "Home Bitcoin Mining",
      "Quelles contraintes faut-il comprendre avant de miner chez soi ?",
      "bitcoin",
      "secondary bitcoin home bitcoin mining"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nMiner chez soi peut servir à apprendre ou à réutiliser de la chaleur, avec des contraintes de bruit, de consommation et de sécurité.\n\nExplication\n- Le coût d’achat, l’électricité, la ventilation, le bruit et la disponibilité interviennent dans l’économie d’un équipement domestique.\n- Une chaleur récupérée n’a de valeur de remplacement que lorsqu’un besoin thermique existe réellement.\n\nLimites et confusions\nUne activité pédagogique n'est pas nécessairement rentable ni préférable à l'achat de bitcoins.",
    "parentIds": [
      "solo-bitcoin-mining",
      "asic-heat-reuse"
    ],
    "relatedIds": [
      "solo-bitcoin-mining",
      "asic-heat-reuse"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min304 — Heat your home while mining bitcoins"
    ],
    "questions": [
      "Quelles contraintes faut-il comprendre avant de miner chez soi ?"
    ],
    "status": "reviewed",
    "sourceHash": "d17018e135515b09a9d239ffa77e456418f70b0920c50a9f59a834629e302f5d",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-home-bitcoin-mining.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-joinmarket",
    "conceptId": "secondary-bitcoin-joinmarket",
    "title": "Le fonctionnement de JoinMarket",
    "keywords": [
      "Le fonctionnement de JoinMarket",
      "JoinMarket",
      "Comment JoinMarket organise-t-il des transactions CoinJoin ?",
      "bitcoin",
      "secondary bitcoin joinmarket"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nJoinMarket organise des CoinJoin avec des participants qui proposent de la liquidité et d'autres qui rémunèrent cette participation.\n\nExplication\n- Les makers proposent de participer à des transactions et les takers organisent des CoinJoin en rémunérant cette participation.\n- Les fonds sont signés selon le protocole collaboratif ; les dépenses ultérieures peuvent cependant recréer des liens entre participants et sorties.\n\nLimites et confusions\nLa confidentialité dépend aussi des transactions suivantes et des données externes ; la compatibilité de test doit être vérifiée.",
    "parentIds": [
      "coinjoin"
    ],
    "relatedIds": [
      "coinjoin"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "Comment JoinMarket organise-t-il des transactions CoinJoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "b7b065a8f4fb21491cdf3f639f3594edb04dad546479a28acdef405f4be026ee",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-joinmarket.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-kerckhoffs-principle",
    "conceptId": "secondary-bitcoin-kerckhoffs-principle",
    "title": "Le principe de Kerckhoffs",
    "keywords": [
      "Le principe de Kerckhoffs",
      "Kerckhoffs Principle",
      "Comment un algorithme public peut-il rester sûr ?",
      "bitcoin",
      "secondary bitcoin kerckhoffs principle"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nSelon Kerckhoffs, la sécurité d'un système cryptographique doit pouvoir reposer sur le secret des clés même si l'algorithme est public.\n\nExplication\n- La sécurité ne doit pas dépendre du secret de l’algorithme.\n- Les algorithmes publics peuvent être examinés et attaqués par la communauté.\n- Le secret est concentré dans les clés.\n- Ce principe justifie l’open review des primitives modernes.\n\nLimites et confusions\nUn algorithme public n'est pas automatiquement sûr ; il doit être analysé et correctement implémenté.",
    "parentIds": [
      "encryption",
      "software-integrity-verification"
    ],
    "relatedIds": [
      "encryption",
      "software-integrity-verification"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp302 — Modern Cryptography Fundamentals"
    ],
    "questions": [
      "Comment un algorithme public peut-il rester sûr ?"
    ],
    "status": "reviewed",
    "sourceHash": "091b5a996ee5003fd371d07c9075156db24f7f65813651d877f229b6257475f1",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-kerckhoffs-principle.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-know-your-customer",
    "conceptId": "secondary-bitcoin-know-your-customer",
    "title": "Les contrôles d’identité KYC",
    "keywords": [
      "Les contrôles d’identité KYC",
      "Know Your Customer",
      "Quelles informations un service financier demande-t-il avec le KYC ?",
      "bitcoin",
      "secondary bitcoin know your customer"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe KYC regroupe les contrôles d'identité et de connaissance du client mis en place par les services financiers.\n\nExplication\n- L’identification peut porter sur la personne, les bénéficiaires d’une entreprise et l’origine ou la finalité des opérations.\n- La collecte de documents crée une dépendance envers la sécurité et la politique de conservation du prestataire.\n\nLimites et confusions\nLes documents exigés et obligations dépendent du service et de la juridiction.",
    "parentIds": [
      "kyc-data-leakage"
    ],
    "relatedIds": [
      "kyc-data-leakage"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB biz101 — Bitcoin for Business"
    ],
    "questions": [
      "Quelles informations un service financier demande-t-il avec le KYC ?"
    ],
    "status": "reviewed",
    "sourceHash": "64374a84d19a6f3968968ce93295b0b5a6b83bccf14812c5e51ebf04a21a567d",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-know-your-customer.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-lightning-offline-receiving-problem",
    "conceptId": "secondary-bitcoin-lightning-offline-receiving-problem",
    "title": "Recevoir sur Lightning en étant hors ligne",
    "keywords": [
      "Recevoir sur Lightning en étant hors ligne",
      "Lightning Offline Receiving Problem",
      "Pourquoi recevoir sur Lightning demande-t-il une infrastructure disponible ?",
      "bitcoin",
      "secondary bitcoin lightning offline receiving problem"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nRecevoir un paiement Lightning nécessite généralement qu'une infrastructure participant au règlement soit disponible. Un wallet peut déléguer ou différer une partie du travail selon sa conception.\n\nExplication\n- Contrairement à une adresse on-chain, une invoice Lightning implique interactivité.\n- Les wallets peuvent s’appuyer sur LSPs ou custodians pour masquer ce problème.\n- Les solutions doivent préserver sécurité et non-custody autant que possible.\n- C’est un obstacle majeur à l’UX grand public.\n\nLimites et confusions\nUne interface qui fonctionne hors ligne ne prouve pas absence de tiers ni autonomie complète de règlement.",
    "parentIds": [
      "lightning-node-online-status",
      "lightning-service-provider"
    ],
    "relatedIds": [
      "lightning-node-online-status",
      "lightning-service-provider"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "Pourquoi recevoir sur Lightning demande-t-il une infrastructure disponible ?"
    ],
    "status": "reviewed",
    "sourceHash": "d5d4ae9dd90d51bbdcd535291524edd56bc2e434669471157e7f472c9189656a",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-lightning-offline-receiving-problem.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-lnurl-auth",
    "conceptId": "secondary-bitcoin-lnurl-auth",
    "title": "S’authentifier avec LNURL-AUTH",
    "keywords": [
      "S’authentifier avec LNURL-AUTH",
      "LNURL Auth",
      "Comment un portefeuille peut-il remplacer un mot de passe pour un service compatible ?",
      "bitcoin",
      "secondary bitcoin lnurl auth"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLNURL-AUTH permet à un portefeuille compatible de répondre cryptographiquement à une demande d'authentification sans mot de passe classique.\n\nExplication\n- Il remplace certains comptes par une preuve cryptographique via wallet.\n- Il réduit le besoin de stocker mots de passe et données sensibles.\n- Il peut simplifier achats, abonnements et accès à des services.\n- Il doit être compris comme une brique UX, pas comme une solution universelle d’identité.\n\nLimites et confusions\nCela ne constitue pas une preuve d'identité civile et la perte des données de clé peut affecter l'accès au service.",
    "parentIds": [
      "lnurl",
      "two-factor-authentication"
    ],
    "relatedIds": [
      "lnurl",
      "two-factor-authentication"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB biz101 — Bitcoin for Business"
    ],
    "questions": [
      "Comment un portefeuille peut-il remplacer un mot de passe pour un service compatible ?"
    ],
    "status": "reviewed",
    "sourceHash": "ea439d712f7612c84c3d6159a1af6ca2021225d61c996c6386e5c87d15d70d1a",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-lnurl-auth.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-merged-mining",
    "conceptId": "secondary-bitcoin-merged-mining",
    "title": "Le minage fusionné",
    "keywords": [
      "Le minage fusionné",
      "Merged Mining",
      "Une même preuve de travail peut-elle servir à plusieurs chaînes ?",
      "bitcoin",
      "secondary bitcoin merged mining"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe minage fusionné permet à une même recherche de preuve de travail de participer à la validation d'une chaîne auxiliaire compatible.\n\nExplication\n- Une chaîne auxiliaire accepte une construction lui permettant de réutiliser une preuve de travail effectuée dans un autre processus de minage.\n- La sécurité auxiliaire dépend des mineurs qui participent effectivement et des règles propres à cette chaîne.\n\nLimites et confusions\nLa chaîne auxiliaire ne reçoit pas automatiquement toutes les garanties ni tout le hashrate de Bitcoin.",
    "parentIds": [
      "proof-of-work",
      "sidechains"
    ],
    "relatedIds": [
      "proof-of-work",
      "sidechains"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his203 — Bitcoin’s Pioneering Era"
    ],
    "questions": [
      "Une même preuve de travail peut-elle servir à plusieurs chaînes ?"
    ],
    "status": "reviewed",
    "sourceHash": "1880dcf402817a188a8be7d4017fa7674e8aa0aabbb23e6e34deb102f588fcef",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-merged-mining.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-merkle-proof",
    "conceptId": "secondary-bitcoin-merkle-proof",
    "title": "Les preuves de Merkle",
    "keywords": [
      "Les preuves de Merkle",
      "Merkle Proof",
      "Que prouve l’inclusion d’une transaction dans un bloc ?",
      "bitcoin",
      "secondary bitcoin merkle proof"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne preuve de Merkle permet de vérifier qu'une donnée figure dans l'arbre associé à une racine connue, sans télécharger toutes les feuilles.\n\nExplication\n- La taille de la preuve croît logarithmiquement avec le nombre de transactions.\n- Les clients légers peuvent l’utiliser avec les headers de bloc.\n- Elle ne prouve pas seule que la transaction est valide, seulement son inclusion dans un bloc donné.\n- Taproot réutilise l’idée pour révéler seulement une branche de conditions de dépense.\n\nLimites et confusions\nL'inclusion d'une transaction dans un bloc ne prouve pas à elle seule la validité du bloc ni l'absence de double dépense.",
    "parentIds": [
      "merkle-tree",
      "spv-node"
    ],
    "relatedIds": [
      "merkle-tree",
      "spv-node"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro202 — Programming Bitcoin"
    ],
    "questions": [
      "Que prouve l’inclusion d’une transaction dans un bloc ?"
    ],
    "status": "reviewed",
    "sourceHash": "dfae908dcd8a9f44298563056769fa9cb3542153f0b0ab3a540a6958bd560881",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-merkle-proof.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-message-authenticity",
    "conceptId": "secondary-bitcoin-message-authenticity",
    "title": "L’authenticité d’un message",
    "keywords": [
      "L’authenticité d’un message",
      "Message Authenticity",
      "Que prouve réellement une signature sur un message ?",
      "bitcoin",
      "secondary bitcoin message authenticity"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nAuthentifier un message permet de vérifier son lien avec la clé attendue. Une signature ou un MAC peut contribuer à cette vérification.\n\nExplication\n- Elle peut être symétrique via MAC.\n- Elle peut être asymétrique via signature numérique.\n- Elle est distincte de la confidentialité.\n- Elle est essentielle pour éviter l’injection ou l’usurpation de messages.\n\nLimites et confusions\nLa preuve porte sur la clé ; son association à une personne et sa non-compromission restent à établir.",
    "parentIds": [
      "digital-signature",
      "encryption"
    ],
    "relatedIds": [
      "digital-signature",
      "encryption"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp302 — Modern Cryptography Fundamentals"
    ],
    "questions": [
      "Que prouve réellement une signature sur un message ?"
    ],
    "status": "reviewed",
    "sourceHash": "259d6f4fceef18d94dfc5f37a72ea894d0a9bf4e6c276bed0b866da151816feb",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-message-authenticity.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-message-integrity",
    "conceptId": "secondary-bitcoin-message-integrity",
    "title": "L’intégrité d’un message",
    "keywords": [
      "L’intégrité d’un message",
      "Message Integrity",
      "Comment détecter une modification et pourquoi un hash seul ne suffit-il pas toujours ?",
      "bitcoin",
      "secondary bitcoin message integrity"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL'intégrité permet de détecter des modifications d'un message. Un hash doit être obtenu par une voie fiable, ou complété par une signature ou un MAC, pour résister à un remplacement malveillant.\n\nExplication\n- Elle peut être protégée par MAC, signatures ou constructions authentifiées.\n- Un hash seul ne suffit pas toujours si l’adversaire peut recalculer le hash.\n- Elle est aussi importante que le secret dans des protocoles ouverts.\n- Bitcoin dépend de l’intégrité des transactions, blocs et états.\n\nLimites et confusions\nVérifier le hash publié sur la même source compromise ne prouve pas l'authenticité du fichier.",
    "parentIds": [
      "cryptographic-hash-function",
      "software-integrity-verification"
    ],
    "relatedIds": [
      "cryptographic-hash-function",
      "software-integrity-verification"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp302 — Modern Cryptography Fundamentals"
    ],
    "questions": [
      "Comment détecter une modification et pourquoi un hash seul ne suffit-il pas toujours ?"
    ],
    "status": "reviewed",
    "sourceHash": "7965a81d1b611b22d1bd7b7b841301a84b3112d7aa0ee86aa2b0866081b52bfe",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-message-integrity.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-mining-shares",
    "conceptId": "secondary-bitcoin-mining-shares",
    "title": "Les parts de travail des pools",
    "keywords": [
      "Les parts de travail des pools",
      "Mining Shares",
      "Que représente une share envoyée à un pool de minage ?",
      "bitcoin",
      "secondary bitcoin mining shares"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne share est une preuve répondant à une difficulté choisie par le pool pour estimer la contribution du mineur. La plupart ne satisfont pas la difficulté requise pour un bloc Bitcoin.\n\nExplication\n- Un share respecte une difficulté plus faible que la difficulté réseau.\n- Le pool utilise les shares pour répartir les paiements.\n- Plus un mineur soumet de shares valides, plus sa contribution estimée est élevée.\n- Les shares rendent mesurable un travail qui autrement ne produit des blocs que rarement.\n\nLimites et confusions\nLes shares mesurent une contribution statistique ; elles ne constituent pas chacune une récompense de bloc.",
    "parentIds": [
      "mining-pool",
      "hashrate"
    ],
    "relatedIds": [
      "mining-pool",
      "hashrate"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min101 — Introduction to Bitcoin mining"
    ],
    "questions": [
      "Que représente une share envoyée à un pool de minage ?"
    ],
    "status": "reviewed",
    "sourceHash": "bd950c0aaac00c50780b02383fb5f2ba01fc7f59eb6b30c0b9321ee0cd552a04",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-mining-shares.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-mining-variance",
    "conceptId": "secondary-bitcoin-mining-variance",
    "title": "L’irrégularité des résultats du minage",
    "keywords": [
      "L’irrégularité des résultats du minage",
      "Mining Variance",
      "Pourquoi un mineur peut-il attendre très longtemps sans trouver de bloc ?",
      "bitcoin",
      "secondary bitcoin mining variance"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa découverte de blocs est aléatoire ; un petit mineur peut attendre très longtemps malgré une espérance de gains calculable.\n\nExplication\n- Une espérance de découverte est une moyenne statistique, pas une échéance garantissant le prochain bloc.\n- Les pools partagent les revenus selon leurs règles et réduisent l’irrégularité supportée directement par les participants.\n\nLimites et confusions\nPlus de hashrate ou un pool réduit surtout l'incertitude relative des revenus, pas nécessairement leur variance absolue.",
    "parentIds": [
      "solo-bitcoin-mining",
      "mining-pool"
    ],
    "relatedIds": [
      "solo-bitcoin-mining",
      "mining-pool"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min101 — Introduction to Bitcoin mining"
    ],
    "questions": [
      "Pourquoi un mineur peut-il attendre très longtemps sans trouver de bloc ?"
    ],
    "status": "reviewed",
    "sourceHash": "ba1d5d3a57d68d0080e0ec3b9867d889ba04e9843ed9dfd2b26602ed83b8f32c",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-mining-variance.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-musig",
    "conceptId": "secondary-bitcoin-musig",
    "title": "Les signatures communes avec MuSig",
    "keywords": [
      "Les signatures communes avec MuSig",
      "MuSig",
      "Comment plusieurs personnes peuvent-elles produire une seule signature Schnorr ?",
      "bitcoin",
      "secondary bitcoin musig"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nMuSig désigne des protocoles permettant à plusieurs détenteurs de clés de produire une signature Schnorr commune.\n\nExplication\n- Plusieurs participants coopèrent avec leurs clés pour produire une signature commune vérifiable comme une signature Schnorr.\n- La coordination et la gestion sûre des nonces font partie du protocole ; l’agrégation n’est pas un simple collage de signatures indépendantes.\n\nLimites et confusions\nNe pas confondre automatiquement multisignature agrégée et n'importe quel seuil m-sur-n.",
    "parentIds": [
      "multisig",
      "taproot"
    ],
    "relatedIds": [
      "multisig",
      "taproot"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "Comment plusieurs personnes peuvent-elles produire une seule signature Schnorr ?"
    ],
    "status": "reviewed",
    "sourceHash": "2a02c3613b6de10f2e2dbf7f0852902093cebd373a22ffeb0e023e7cfaf9a0a6",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-musig.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-no-kyc-mining-rewards",
    "conceptId": "secondary-bitcoin-no-kyc-mining-rewards",
    "title": "Recevoir des récompenses sans KYC",
    "keywords": [
      "Recevoir des récompenses sans KYC",
      "No-KYC Mining Rewards",
      "Le minage sans contrôle d’identité rend-il les revenus anonymes ?",
      "bitcoin",
      "secondary bitcoin no kyc mining rewards"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nSelon le pool, les récompenses de minage peuvent être reçues sans passer par une plateforme d'achat avec KYC.\n\nExplication\n- Les coins minés n’ont pas l’historique d’un achat exchange.\n- La privacy dépend du pool, de l’adresse de payout, du réseau et des montants.\n- Les seuils de retrait et frais peuvent forcer une accumulation chez le pool.\n- Ne pas confondre non-KYC avec anonymat absolu.\n\nLimites et confusions\nLe pool, les adresses de versement et les données réseau peuvent néanmoins permettre des corrélations.",
    "parentIds": [
      "bitcoin-pseudonymity",
      "mining-pool"
    ],
    "relatedIds": [
      "bitcoin-pseudonymity",
      "mining-pool"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min304 — Heat your home while mining bitcoins"
    ],
    "questions": [
      "Le minage sans contrôle d’identité rend-il les revenus anonymes ?"
    ],
    "status": "reviewed",
    "sourceHash": "a9f18e77837992af708514c175b8ce6356cedcadf231dbc60961f0e6ca38dcfe",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-no-kyc-mining-rewards.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-non-hardened-derivation",
    "conceptId": "secondary-bitcoin-non-hardened-derivation",
    "title": "La dérivation publique des clés enfants",
    "keywords": [
      "La dérivation publique des clés enfants",
      "Non-Hardened Derivation",
      "Comment un xpub peut-il générer des adresses sans connaître les clés privées ?",
      "bitcoin",
      "secondary bitcoin non hardened derivation"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa dérivation non hardened permet de calculer des clés publiques enfants depuis une clé publique étendue sans disposer de la clé privée parent.\n\nExplication\n- Une clé publique étendue permet de préparer des adresses sans transférer les clés privées au système de réception.\n- Cette commodité a des limites de confidentialité et de compartimentation qu’il faut connaître avant de partager un xpub.\n\nLimites et confusions\nLa combinaison d'un xpub parent et d'une clé privée enfant non hardened peut compromettre le parent ; conserver la séparation des secrets.",
    "parentIds": [
      "extended-public-key",
      "watch-only-wallet"
    ],
    "relatedIds": [
      "extended-public-key",
      "watch-only-wallet"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Comment un xpub peut-il générer des adresses sans connaître les clés privées ?"
    ],
    "status": "reviewed",
    "sourceHash": "c455f992519776527a8bef9346ccd21aca1a743c9d203f40e2c24143cada4154",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-non-hardened-derivation.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-onion-messaging",
    "conceptId": "secondary-bitcoin-onion-messaging",
    "title": "Les messages onion de Lightning",
    "keywords": [
      "Les messages onion de Lightning",
      "Onion Messaging",
      "À quoi servent les messages Lightning en dehors des paiements ?",
      "bitcoin",
      "secondary bitcoin onion messaging"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes messages onion permettent des échanges de messages routés dans Lightning, notamment pour demander une facture à partir d'une offre BOLT12.\n\nExplication\n- BOLT12 s’appuie sur onion messaging.\n- Il évite certains besoins de serveurs web hors Lightning.\n- Il améliore la confidentialité de certaines interactions.\n- Il permet plus que de simples paiements : requêtes et réponses chiffrées.\n\nLimites et confusions\nLes messages ne constituent pas eux-mêmes un paiement et ne garantissent pas anonymat ou livraison.",
    "parentIds": [
      "bolt12-offers",
      "lightning-privacy-tradeoff"
    ],
    "relatedIds": [
      "bolt12-offers",
      "lightning-privacy-tradeoff"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "À quoi servent les messages Lightning en dehors des paiements ?"
    ],
    "status": "reviewed",
    "sourceHash": "cbf488f199f22f2b31baaaab43134a28f9a5faef074a0e36f55807934b35630a",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-onion-messaging.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-op-return",
    "conceptId": "secondary-bitcoin-op-return",
    "title": "Les sorties OP_RETURN",
    "keywords": [
      "Les sorties OP_RETURN",
      "OP_RETURN",
      "Pourquoi certaines données Bitcoin ne créent-elles pas d’UTXO dépensable ?",
      "bitcoin",
      "secondary bitcoin op return"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne sortie OP_RETURN est non dépensable et peut porter des données ou engagements. Les règles de relais sont distinctes des règles de consensus.\n\nExplication\n- Les sorties explicitement non dépensables peuvent être écartées de l’ensemble des sorties dépensables tout en restant inscrites dans le bloc.\n- Accepter de relayer une transaction et accepter un bloc contenant cette transaction sont des décisions régies par des ensembles de règles différents.\n\nLimites et confusions\nLa place occupée dans un bloc demeure un coût même sans ajout durable à l'ensemble des UTXO dépensables.",
    "parentIds": [
      "bitcoin-mempool-policy",
      "bitcoin-script"
    ],
    "relatedIds": [
      "bitcoin-mempool-policy",
      "bitcoin-script"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB csv402 — RGB programming",
      "Article ou ressource du vault — Bitcoin Spam - Why We Can't Stop It"
    ],
    "questions": [
      "Pourquoi certaines données Bitcoin ne créent-elles pas d’UTXO dépensable ?"
    ],
    "status": "reviewed",
    "sourceHash": "d4a98c260018b45bf25d071d1dd0540fc7495e6f96d57f528a4f520a9e8979d0",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-op-return.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-open-source-mining-hardware",
    "conceptId": "secondary-bitcoin-open-source-mining-hardware",
    "title": "Le matériel de minage ouvert",
    "keywords": [
      "Le matériel de minage ouvert",
      "Open Source Mining Hardware",
      "Que peut-on réellement inspecter dans un mineur open source ?",
      "bitcoin",
      "secondary bitcoin open source mining hardware"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes projets de matériel de minage ouvert publient certains plans, logiciels et procédures pour faciliter inspection et réparation.\n\nExplication\n- L’accès aux plans de cartes et au firmware permet inspection, adaptation et réparation par davantage de personnes.\n- La fabrication des puces, l’approvisionnement et les performances restent soumis à des contraintes industrielles.\n\nLimites et confusions\nCela ne signifie pas que les puces ASIC ou tous les composants sont eux-mêmes ouverts.",
    "parentIds": [
      "asic-mining",
      "mining-centralization"
    ],
    "relatedIds": [
      "asic-mining",
      "mining-centralization"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min306 — Bitaxe Open Source Mining Mastery"
    ],
    "questions": [
      "Que peut-on réellement inspecter dans un mineur open source ?"
    ],
    "status": "reviewed",
    "sourceHash": "98593124d97a2f1db0eea4364166df52f41e6c385450f6a6b9ebe0bbef1c718f",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-open-source-mining-hardware.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-open-source-security-review",
    "conceptId": "secondary-bitcoin-open-source-security-review",
    "title": "La revue de sécurité du code ouvert",
    "keywords": [
      "La revue de sécurité du code ouvert",
      "Open Source Security Review",
      "Un logiciel open source est-il forcément audité et sûr ?",
      "bitcoin",
      "secondary bitcoin open source security review"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn code ouvert peut être inspecté par des tiers et faire l'objet de revues indépendantes. Cela facilite la détection de vulnérabilités.\n\nExplication\n- La transparence ne garantit pas automatiquement sécurité mais permet inspection.\n- Les vulnérabilités peuvent être détectées par une communauté large.\n- Les logiciels Bitcoin critiques doivent privilégier code auditable et signatures vérifiables.\n- Les entreprises qui construisent sur Bitcoin doivent intégrer pratiques FLOSS et sécurité.\n\nLimites et confusions\nOuvert ou auditable ne signifie pas qu'un audit complet a eu lieu ni qu'aucune faille n'existe.",
    "parentIds": [
      "software-integrity-verification",
      "bitcoin-core"
    ],
    "relatedIds": [
      "software-integrity-verification",
      "bitcoin-core"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB biz205 — Biz School Previous Edition"
    ],
    "questions": [
      "Un logiciel open source est-il forcément audité et sûr ?"
    ],
    "status": "reviewed",
    "sourceHash": "9bcfbba508b28036ce2bf049fe8d26c997f84779c7095fe9d4b6af8813721afe",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-open-source-security-review.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-paper-wallet",
    "conceptId": "secondary-bitcoin-paper-wallet",
    "title": "Les anciens portefeuilles papier",
    "keywords": [
      "Les anciens portefeuilles papier",
      "Paper Wallet",
      "Un paper wallet est-il la même chose qu’une phrase de récupération sur papier ?",
      "bitcoin",
      "secondary bitcoin paper wallet"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn paper wallet historique contient souvent une clé privée isolée sur papier. Une phrase de récupération notée sur papier est une sauvegarde de portefeuille d'un autre type.\n\nExplication\n- Une clé privée isolée ne fournit pas nécessairement la récupération déterministe d’un portefeuille moderne avec plusieurs adresses.\n- La sauvegarde papier doit aussi résister aux pertes physiques et à l’exposition des secrets lors de sa création ou utilisation.\n\nLimites et confusions\nImpression, génération, import et monnaie rendue peuvent créer des risques ; le papier ne prouve pas que le secret n'a jamais été exposé.",
    "parentIds": [
      "cold-storage",
      "wallet-backup"
    ],
    "relatedIds": [
      "cold-storage",
      "wallet-backup"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his203 — Bitcoin’s Pioneering Era"
    ],
    "questions": [
      "Un paper wallet est-il la même chose qu’une phrase de récupération sur papier ?"
    ],
    "status": "reviewed",
    "sourceHash": "cec58e52f2e24b19dd517d752481b6be75e34ae568e9407a0f5568b158a31581",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-paper-wallet.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-pbkdf2",
    "conceptId": "secondary-bitcoin-pbkdf2",
    "title": "La dérivation BIP39 avec PBKDF2",
    "keywords": [
      "La dérivation BIP39 avec PBKDF2",
      "PBKDF2",
      "Comment les mots de récupération et la passphrase produisent-ils une seed ?",
      "bitcoin",
      "secondary bitcoin pbkdf2"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBIP39 utilise PBKDF2-HMAC-SHA512 pour dériver une seed à partir de la phrase mnémonique et d'une passphrase optionnelle.\n\nExplication\n- La phrase de récupération et la passphrase éventuelle servent d’entrées à une dérivation déterministe.\n- Une passphrase différente produit une autre seed ; le mécanisme ne sait pas distinguer une faute de frappe d’un choix volontaire.\n\nLimites et confusions\nLes itérations ne rendent pas une passphrase faible résistante à toute attaque ; PBKDF2 a aussi d'autres usages.",
    "parentIds": [
      "bitcoin-seed",
      "bip39-passphrase"
    ],
    "relatedIds": [
      "bitcoin-seed",
      "bip39-passphrase"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Comment les mots de récupération et la passphrase produisent-ils une seed ?"
    ],
    "status": "reviewed",
    "sourceHash": "7b77114c6bcd45fbafad2c6269d021013acceca33986c87db63bd8ca5390cad1",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-pbkdf2.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-pedersen-commitment",
    "conceptId": "secondary-bitcoin-pedersen-commitment",
    "title": "Les engagements de Pedersen",
    "keywords": [
      "Les engagements de Pedersen",
      "Pedersen Commitment",
      "Comment vérifier une relation entre des montants cachés ?",
      "bitcoin",
      "secondary bitcoin pedersen commitment"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes engagements de Pedersen permettent de masquer des valeurs tout en vérifiant certaines relations algébriques ; des preuves d'intervalle complètent le dispositif.\n\nExplication\n- Des engagements peuvent être combinés pour vérifier une égalité comptable sans révéler directement les montants.\n- Les preuves d’intervalle ajoutent des contraintes sur les valeurs cachées ; la seule égalité des engagements ne suffit pas.\n\nLimites et confusions\nLa sécurité dépend des preuves et de leur implémentation correcte, pas du seul nom de la primitive.",
    "parentIds": [
      "liquid-network",
      "cryptographic-hash-function"
    ],
    "relatedIds": [
      "liquid-network",
      "cryptographic-hash-function"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB sid302 — Liquid Bootcamp Essentials"
    ],
    "questions": [
      "Comment vérifier une relation entre des montants cachés ?"
    ],
    "status": "reviewed",
    "sourceHash": "9cc6eb070c87c57e3b8100d8b43ba92ac88bc6f808eb438d1afd3d4f5c812fe5",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-pedersen-commitment.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-pool-payout-methods",
    "conceptId": "secondary-bitcoin-pool-payout-methods",
    "title": "Les méthodes de rémunération des pools",
    "keywords": [
      "Les méthodes de rémunération des pools",
      "Pool Payout Methods",
      "Quelle différence entre PPS, FPPS et PPLNS ?",
      "bitcoin",
      "secondary bitcoin pool payout methods"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes pools répartissent les revenus selon différentes méthodes, qui distribuent différemment variance, frais et risque de non-paiement.\n\nExplication\n- En PPS, le pool assume une grande partie de la variabilité liée à la découverte de blocs ; en PPLNS, le versement dépend davantage des blocs trouvés.\n- Les seuils de versement, les frais et la solvabilité du pool doivent être évalués avec la méthode annoncée.\n\nLimites et confusions\nLes contrats, seuils et frais de chaque pool comptent autant que le sigle de la méthode.",
    "parentIds": [
      "mining-pool",
      "mining-profitability"
    ],
    "relatedIds": [
      "mining-pool",
      "mining-profitability"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min101 — Introduction to Bitcoin mining"
    ],
    "questions": [
      "Quelle différence entre PPS, FPPS et PPLNS ?"
    ],
    "status": "reviewed",
    "sourceHash": "5af59137a5cae8c6978fa7ca8c1c130d8d1ee83d2457c91e518425f53719bc29",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-pool-payout-methods.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-preimage-resistance",
    "conceptId": "secondary-bitcoin-preimage-resistance",
    "title": "La résistance à la préimage",
    "keywords": [
      "La résistance à la préimage",
      "Preimage Resistance",
      "Peut-on retrouver une donnée à partir de son empreinte ?",
      "bitcoin",
      "secondary bitcoin preimage resistance"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa résistance à la préimage rend impraticable la recherche d'une entrée produisant une empreinte donnée.\n\nExplication\n- Elle protège les engagements et certaines constructions de mots de passe.\n- Elle dépend de la taille de sortie et de la conception du hash.\n- Elle diffère de la résistance aux collisions.\n- Bitcoin s’appuie sur cette propriété dans plusieurs contextes.\n\nLimites et confusions\nUn petit ensemble d'entrées prévisibles peut malgré tout être testé ; hacher ne transforme pas un mot de passe faible en secret fort.",
    "parentIds": [
      "cryptographic-hash-function"
    ],
    "relatedIds": [
      "cryptographic-hash-function"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp302 — Modern Cryptography Fundamentals"
    ],
    "questions": [
      "Peut-on retrouver une donnée à partir de son empreinte ?"
    ],
    "status": "reviewed",
    "sourceHash": "795d7079a227b0c4faa7e263220d6e09514c1f841570b09a8499cca993a4ee8d",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-preimage-resistance.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-privacy-by-obfuscation",
    "conceptId": "secondary-bitcoin-privacy-by-obfuscation",
    "title": "La confidentialité par ambiguïté des liens",
    "keywords": [
      "La confidentialité par ambiguïté des liens",
      "Privacy by Obfuscation",
      "Comment une transaction collaborative complique-t-elle l’analyse de chaîne ?",
      "bitcoin",
      "secondary bitcoin privacy by obfuscation"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nCertaines techniques de confidentialité rendent plus ambigu le lien entre entrées, sorties et utilisateurs.\n\nExplication\n- Une transaction collaborative peut offrir plusieurs associations plausibles entre entrées et sorties.\n- Des choix de montants, de chronologie ou des informations d’identité externes peuvent réduire cette ambiguïté.\n\nLimites et confusions\nL'ambiguïté observée ne garantit pas anonymat ; des métadonnées extérieures peuvent rétablir un lien.",
    "parentIds": [
      "coinjoin",
      "bitcoin-chain-analysis"
    ],
    "relatedIds": [
      "coinjoin",
      "bitcoin-chain-analysis"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "Comment une transaction collaborative complique-t-elle l’analyse de chaîne ?"
    ],
    "status": "reviewed",
    "sourceHash": "c44433906dd4cfdff5f799944f256aecdb23ee406443aa29aa6c11e98d327189",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-privacy-by-obfuscation.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-privacy-by-omission",
    "conceptId": "secondary-bitcoin-privacy-by-omission",
    "title": "La confidentialité par réduction des données publiées",
    "keywords": [
      "La confidentialité par réduction des données publiées",
      "Privacy by Omission",
      "Pourquoi ne pas publier chaque paiement peut-il améliorer la confidentialité ?",
      "bitcoin",
      "secondary bitcoin privacy by omission"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne manière de préserver la confidentialité consiste à ne pas publier chaque détail de paiement sur la chaîne. Des paiements intermédiaires Lightning restent hors de ce registre public.\n\nExplication\n- Lightning peut réduire l’information inscrite dans la blockchain pour des paiements intermédiaires.\n- Moins de données publiques peut améliorer scalabilité et confidentialité.\n- Cette approche dépend souvent de protocoles hors chaîne ou client-side.\n- Elle ne supprime pas toutes les métadonnées réseau ou applicatives.\n\nLimites et confusions\nDes participants, prestataires ou observateurs réseau peuvent encore détenir des métadonnées.",
    "parentIds": [
      "lightning-privacy-tradeoff",
      "non-blockchain-privacy-leaks"
    ],
    "relatedIds": [
      "lightning-privacy-tradeoff",
      "non-blockchain-privacy-leaks"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "Pourquoi ne pas publier chaque paiement peut-il améliorer la confidentialité ?"
    ],
    "status": "reviewed",
    "sourceHash": "49ac29354a18b1197f0cda54d77c035bfd9c44b89eeab6909c1e346c26fc4a90",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-privacy-by-omission.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-pseudorandom-number-generator",
    "conceptId": "secondary-bitcoin-pseudorandom-number-generator",
    "title": "Les générateurs pseudo-aléatoires cryptographiques",
    "keywords": [
      "Les générateurs pseudo-aléatoires cryptographiques",
      "Pseudorandom Number Generator",
      "Un générateur pseudo-aléatoire peut-il servir à créer des clés ?",
      "bitcoin",
      "secondary bitcoin pseudorandom number generator"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn générateur pseudo-aléatoire cryptographique étend un état secret en valeurs imprévisibles pour l'attaquant. La qualité de son initialisation est essentielle.\n\nExplication\n- Il doit être adapté à un usage cryptographique, pas seulement statistique.\n- La graine doit avoir suffisamment d’entropie.\n- Des sorties prévisibles peuvent révéler clés ou nonces.\n- Il est différent d’un générateur pseudo-aléatoire non sécurisé utilisé pour simulations.\n\nLimites et confusions\nUn générateur statistiquement satisfaisant n'est pas nécessairement adapté aux clés Bitcoin.",
    "parentIds": [
      "entropy",
      "bitcoin-private-key"
    ],
    "relatedIds": [
      "entropy",
      "bitcoin-private-key"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp302 — Modern Cryptography Fundamentals"
    ],
    "questions": [
      "Un générateur pseudo-aléatoire peut-il servir à créer des clés ?"
    ],
    "status": "reviewed",
    "sourceHash": "0a7ccd86e8a05802dbceb441c05411f20f4a8155c7db28989b376ae76d33a976",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-pseudorandom-number-generator.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-random-number-generation",
    "conceptId": "secondary-bitcoin-random-number-generation",
    "title": "La génération de secrets aléatoires",
    "keywords": [
      "La génération de secrets aléatoires",
      "Random Number Generation",
      "Pourquoi la qualité du hasard compte-t-elle autant que la longueur d’une clé ?",
      "bitcoin",
      "secondary bitcoin random number generation"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes clés et phrases de récupération doivent partir d'une entropie suffisante, produite par un mécanisme adapté à la cryptographie.\n\nExplication\n- L’entropie initiale conditionne le nombre effectif de secrets possibles, au-delà de la longueur apparente de la clé.\n- Un format correct peut ainsi contenir une clé vulnérable si le processus de génération est prévisible.\n\nLimites et confusions\nUne procédure manuelle mal comprise ou un générateur prévisible peut réduire fortement l'espace réel de secrets.",
    "parentIds": [
      "entropy",
      "bitcoin-seed"
    ],
    "relatedIds": [
      "entropy",
      "bitcoin-seed"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Pourquoi la qualité du hasard compte-t-elle autant que la longueur d’une clé ?"
    ],
    "status": "reviewed",
    "sourceHash": "9199cca303462c55f8a4fece3e5e848efef69b6e8f1abaed5a495e544629f034",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-random-number-generation.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-rpow",
    "conceptId": "secondary-bitcoin-rpow",
    "title": "Les preuves de travail réutilisables de Hal Finney",
    "keywords": [
      "Les preuves de travail réutilisables de Hal Finney",
      "RPOW",
      "Quel était le principe de RPOW avant Bitcoin ?",
      "bitcoin",
      "secondary bitcoin rpow"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nHal Finney a conçu RPOW pour rendre réutilisables des preuves de travail ; le système conservait des composants de confiance.\n\nExplication\n- RPOW se situe dans la recherche sur la transformation d’une preuve de travail en objet numérique réutilisable.\n- Son dispositif de confiance diffère du réseau Bitcoin qui coordonne les dépenses à travers une chaîne validée par les nœuds.\n\nLimites et confusions\nCe précédent n'offrait pas à lui seul le consensus décentralisé de Bitcoin.",
    "parentIds": [
      "proof-of-work",
      "cypherpunk-movement"
    ],
    "relatedIds": [
      "proof-of-work",
      "cypherpunk-movement"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his201 — The History of Bitcoin's Creation"
    ],
    "questions": [
      "Quel était le principe de RPOW avant Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "8cf6a0f2e90e5aad38ef38696386dc38e372f624373b6efd2967ac35f4573f7d",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-rpow.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-schnorr-signature",
    "conceptId": "secondary-bitcoin-schnorr-signature",
    "title": "Les signatures Schnorr",
    "keywords": [
      "Les signatures Schnorr",
      "Schnorr Signature",
      "Qu’apportent les signatures Schnorr utilisées par Taproot ?",
      "bitcoin",
      "secondary bitcoin schnorr signature"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nTaproot utilise des signatures Schnorr qui facilitent certaines constructions à plusieurs signataires.\n\nExplication\n- Les propriétés algébriques de Schnorr facilitent des protocoles comme MuSig, où plusieurs signataires participent à une signature commune.\n- La confidentialité potentielle vient de la construction complète et de son utilisation, pas uniquement de l’algorithme de signature.\n\nLimites et confusions\nL'agrégation n'est pas automatique pour tous les inputs d'une transaction et nécessite un protocole approprié.",
    "parentIds": [
      "taproot",
      "digital-signature"
    ],
    "relatedIds": [
      "taproot",
      "digital-signature"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Qu’apportent les signatures Schnorr utilisées par Taproot ?"
    ],
    "status": "reviewed",
    "sourceHash": "2578c3ffa75963bcd16635dcc80c570d1cef61d5c5894cefac40dcf08d5cc395",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-schnorr-signature.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-secp256k1",
    "conceptId": "secondary-bitcoin-secp256k1",
    "title": "La courbe secp256k1",
    "keywords": [
      "La courbe secp256k1",
      "secp256k1",
      "Que désigne secp256k1 dans Bitcoin ?",
      "bitcoin",
      "secondary bitcoin secp256k1"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nsecp256k1 est la courbe utilisée dans Bitcoin pour ECDSA et Schnorr. La clé publique est dérivée d'une clé privée valide par une opération sur cette courbe.\n\nExplication\n- La clé privée correspond à un scalaire valide et la clé publique à un point obtenu par multiplication d’un point de référence.\n- ECDSA et Schnorr utilisent cette même courbe dans Bitcoin, mais leurs procédures de signature diffèrent.\n\nLimites et confusions\nComprendre son nom ne suffit pas à implémenter soi-même la cryptographie d'un portefeuille.",
    "parentIds": [
      "digital-signature",
      "bitcoin-public-key"
    ],
    "relatedIds": [
      "digital-signature",
      "bitcoin-public-key"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Que désigne secp256k1 dans Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "1a92f71bc793360f8e82818fd914f6e51121b4f6cc551302264dc8cec825f283",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-secp256k1.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-self-hosted-payment-processor",
    "conceptId": "secondary-bitcoin-self-hosted-payment-processor",
    "title": "Auto-héberger son traitement de paiement",
    "keywords": [
      "Auto-héberger son traitement de paiement",
      "Self-Hosted Payment Processor",
      "Quel contrôle et quelles responsabilités apporte un processeur de paiement auto-hébergé ?",
      "bitcoin",
      "secondary bitcoin self hosted payment processor"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nAuto-héberger son processeur de paiement donne davantage de contrôle sur le traitement des demandes et les données.\n\nExplication\n- Il réduit le risque de censure ou blocage par un prestataire.\n- Il demande maintenance, sécurité, backups et supervision.\n- Il peut être connecté à son propre nœud Bitcoin/Lightning.\n- Il donne plus de contrôle mais augmente la responsabilité opérationnelle.\n\nLimites et confusions\nL'utilisateur doit assurer maintenance, sécurité et sauvegardes ; l'hébergeur et la connectivité peuvent encore créer des dépendances.",
    "parentIds": [
      "btcpay-server",
      "bitcoin-payments-for-merchants"
    ],
    "relatedIds": [
      "btcpay-server",
      "bitcoin-payments-for-merchants"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pos305 — Mastering BTC Pay Server"
    ],
    "questions": [
      "Quel contrôle et quelles responsabilités apporte un processeur de paiement auto-hébergé ?"
    ],
    "status": "reviewed",
    "sourceHash": "20059474d780ec23ef8a8e931069433ed53954c9b9492ae0a5905bca8aa7537a",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-self-hosted-payment-processor.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-sha-256",
    "conceptId": "secondary-bitcoin-sha-256",
    "title": "SHA-256 et la preuve de travail",
    "keywords": [
      "SHA-256 et la preuve de travail",
      "SHA-256",
      "Quel calcul les mineurs Bitcoin répètent-ils ?",
      "bitcoin",
      "secondary bitcoin sha 256"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nSHA-256 produit une empreinte de 256 bits. Pour la preuve de travail Bitcoin, les mineurs recherchent un double SHA-256 d'en-tête satisfaisant la cible.\n\nExplication\n- L’en-tête change lorsque le mineur modifie certaines données du bloc candidat et provoque une nouvelle empreinte.\n- La plupart des essais ne satisfont pas la cible ; trouver une empreinte conforme est difficile, la contrôler est rapide.\n\nLimites et confusions\nLa propriété recherchée est une difficulté calculatoire ; ce n'est ni un chiffrement ni une preuve d'identité.",
    "parentIds": [
      "cryptographic-hash-function",
      "proof-of-work"
    ],
    "relatedIds": [
      "cryptographic-hash-function",
      "proof-of-work"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min101 — Introduction to Bitcoin mining"
    ],
    "questions": [
      "Quel calcul les mineurs Bitcoin répètent-ils ?"
    ],
    "status": "reviewed",
    "sourceHash": "6a93346d8f8c37bab8fe39c0513b491a367728bbf552c7b1bd325faee8a73013",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-sha-256.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-stale-block",
    "conceptId": "secondary-bitcoin-stale-block",
    "title": "Les blocs valides non retenus",
    "keywords": [
      "Les blocs valides non retenus",
      "Stale Block",
      "Pourquoi un bloc valide peut-il ne pas rester dans la chaîne active ?",
      "bitcoin",
      "secondary bitcoin stale block"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn bloc stale est un bloc valide qui n'appartient finalement pas à la chaîne retenue, par exemple après concurrence entre 2 blocs proches.\n\nExplication\n- Le phénomène augmente lorsque les blocs se propagent ou se valident lentement.\n- Les mineurs perdent la récompense des blocs devenus stale.\n- La peur du stale peut encourager validationless mining ou centralisation vers des pools mieux connectés.\n- Le terme est souvent plus précis que “orphan block” pour Bitcoin moderne.\n\nLimites et confusions\nLes transactions peuvent être reconfirmées ailleurs ; la récompense coinbase du bloc abandonné n'est pas conservée dans la chaîne active.",
    "parentIds": [
      "bitcoin-transaction-confirmation",
      "bitcoin-mining"
    ],
    "relatedIds": [
      "bitcoin-transaction-confirmation",
      "bitcoin-mining"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Pourquoi un bloc valide peut-il ne pas rester dans la chaîne active ?"
    ],
    "status": "reviewed",
    "sourceHash": "129b97db71d804d70101845dd08390d33fe2d075c25099dbaaae5b2e08cdfebe",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-stale-block.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-stratum-mining-protocol",
    "conceptId": "secondary-bitcoin-stratum-mining-protocol",
    "title": "Le protocole Stratum",
    "keywords": [
      "Le protocole Stratum",
      "Stratum Mining Protocol",
      "Comment les ASIC échangent-ils leur travail avec un pool ?",
      "bitcoin",
      "secondary bitcoin stratum mining protocol"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nStratum relie les mineurs à un serveur de pool pour distribuer du travail et transmettre les shares trouvées.\n\nExplication\n- Le serveur attribue des travaux de minage et le mineur renvoie les résultats satisfaisant la difficulté demandée pour les shares.\n- Les choix de construction du bloc et de protection des échanges dépendent des fonctions effectivement utilisées.\n\nLimites et confusions\nLes fonctions et garanties diffèrent entre versions et implémentations ; ne pas supposer que tout mineur choisit ses transactions.",
    "parentIds": [
      "mining-pool",
      "asic-mining"
    ],
    "relatedIds": [
      "mining-pool",
      "asic-mining"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min306 — Bitaxe Open Source Mining Mastery"
    ],
    "questions": [
      "Comment les ASIC échangent-ils leur travail avec un pool ?"
    ],
    "status": "reviewed",
    "sourceHash": "6772f2df82d631780971cda2e6dcaa64fdb4d583a814cc95d32c2ace00dea757",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-stratum-mining-protocol.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-sybil-attack",
    "conceptId": "secondary-bitcoin-sybil-attack",
    "title": "Les attaques Sybil",
    "keywords": [
      "Les attaques Sybil",
      "Sybil Attack",
      "Que peut faire un attaquant qui crée de nombreux faux participants ?",
      "bitcoin",
      "secondary bitcoin sybil attack"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne attaque Sybil multiplie les identités contrôlées par un même adversaire. Elle peut notamment faciliter l'isolement réseau d'une cible.\n\nExplication\n- Bitcoin ne vote pas par nombre de nœuds, ce qui limite certains effets directs.\n- Les attaques Sybil peuvent aider à isoler une cible ou renforcer une eclipse attack.\n- Une variante sociale peut cibler les débats de gouvernance et de développement.\n\nLimites et confusions\nBitcoin ne choisit pas sa chaîne par un simple vote où chaque identité réseau compterait pour 1 voix.",
    "parentIds": [
      "bitcoin-p2p-network",
      "bitcoin-consensus"
    ],
    "relatedIds": [
      "bitcoin-p2p-network",
      "bitcoin-consensus"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Que peut faire un attaquant qui crée de nombreux faux participants ?"
    ],
    "status": "reviewed",
    "sourceHash": "c8fe1549a1e1b277cb3802dfdbe87919f67c97469acd6147059120376ba887e5",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-sybil-attack.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-utxo-vs-account-based-model",
    "conceptId": "secondary-bitcoin-utxo-vs-account-based-model",
    "title": "Les UTXO comparés aux comptes",
    "keywords": [
      "Les UTXO comparés aux comptes",
      "UTXO vs Account-Based Model",
      "Quelle différence entre des sorties à dépenser et un solde de compte ?",
      "bitcoin",
      "secondary bitcoin utxo vs account based model"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe modèle UTXO consomme des sorties et en crée de nouvelles, tandis qu'un modèle à comptes modifie des soldes ou états attachés aux comptes.\n\nExplication\n- Le modèle UTXO favorise une construction transactionnelle explicite : inputs, outputs, conditions de dépense.\n- Le modèle account-based facilite certains patterns applicatifs, mais concentre l’état dans des comptes et contrats.\n- Liquid hérite du modèle UTXO et y ajoute assets et confidentialité.\n- Le développeur doit gérer sélection d’UTXO, blinding, frais, remboursements et signatures partielles.\n\nLimites et confusions\nLes compromis dépendent de l'application ; aucun des modèles n'élimine toutes les erreurs ou fuites de confidentialité.",
    "parentIds": [
      "bitcoin-utxo",
      "bitcoin-transaction-structure"
    ],
    "relatedIds": [
      "bitcoin-utxo",
      "bitcoin-transaction-structure"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB sid406 — Mastering Liquid Development"
    ],
    "questions": [
      "Quelle différence entre des sorties à dépenser et un solde de compte ?"
    ],
    "status": "reviewed",
    "sourceHash": "56a2d186154db8dcdff0e30b4388d61e9bf804b5d996c02a1c6bfe2e7899e297",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-utxo-vs-account-based-model.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-validationless-mining",
    "conceptId": "secondary-bitcoin-validationless-mining",
    "title": "Miner sans avoir validé le bloc précédent",
    "keywords": [
      "Miner sans avoir validé le bloc précédent",
      "Validationless Mining",
      "Quel risque prend un mineur qui commence à travailler trop vite sur un bloc reçu ?",
      "bitcoin",
      "secondary bitcoin validationless mining"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nMiner sur un bloc reçu avant de l'avoir validé peut prolonger une branche invalide et faire perdre des revenus au mineur.\n\nExplication\n- Le mineur vérifie éventuellement seulement le header et la preuve de travail.\n- Cette pratique peut étendre une chaîne invalide si le bloc parent est invalide.\n- BIP66 a produit des splits temporaires à cause de mineurs qui signalaient sans valider.\n- Elle montre pourquoi les mineurs eux-mêmes doivent utiliser de vrais full nodes.\n\nLimites et confusions\nUne preuve de travail valide ne suffit pas à prouver que toutes les règles du bloc sont respectées.",
    "parentIds": [
      "bitcoin-mining",
      "full-node"
    ],
    "relatedIds": [
      "bitcoin-mining",
      "full-node"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Quel risque prend un mineur qui commence à travailler trop vite sur un bloc reçu ?"
    ],
    "status": "reviewed",
    "sourceHash": "771c77a2a55112179d4656364ba3c5a31ec9c1a9dd615d1c3ab0e8d9972c735d",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-validationless-mining.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-virgin-bitcoin",
    "conceptId": "secondary-bitcoin-virgin-bitcoin",
    "title": "Les bitcoins fraîchement minés",
    "keywords": [
      "Les bitcoins fraîchement minés",
      "Virgin Bitcoin",
      "Que signifie l’expression virgin bitcoin ?",
      "bitcoin",
      "secondary bitcoin virgin bitcoin"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL'expression virgin bitcoin désigne généralement des bitcoins issus directement d'une récompense de bloc, sans historique antérieur de dépense.\n\nExplication\n- Une sortie coinbase est identifiable dans la chaîne ; les versements ultérieurs peuvent déjà lui ajouter un historique de transaction.\n- L’idée d’une prime de pureté relève de pratiques de marché et soulève un débat de fongibilité, pas d’une catégorie de bitcoins créée par le consensus.\n\nLimites et confusions\nUn paiement de pool peut provenir d'une transaction ordinaire ; absence d'historique ne signifie ni anonymat ni prime de prix garantie.",
    "parentIds": [
      "bitcoin-fungibility",
      "bitcoin-pseudonymity"
    ],
    "relatedIds": [
      "bitcoin-fungibility",
      "bitcoin-pseudonymity"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB min304 — Heat your home while mining bitcoins"
    ],
    "questions": [
      "Que signifie l’expression virgin bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "657fe82344e3e12c226ba4c7c4859f110ee65896cee62599f7359d7674f966a5",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-virgin-bitcoin.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-bitcoin-wallet-as-identity",
    "conceptId": "secondary-bitcoin-wallet-as-identity",
    "title": "Le portefeuille comme moyen d’authentification",
    "keywords": [
      "Le portefeuille comme moyen d’authentification",
      "Wallet as Identity",
      "Prouver le contrôle d’une clé permet-il de prouver son identité ?",
      "bitcoin",
      "secondary bitcoin wallet as identity"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn portefeuille peut servir à s'authentifier auprès d'un service en prouvant le contrôle d'une clé.\n\nExplication\n- Une demande d’authentification vérifie une signature ou une réponse liée à une clé connue du service.\n- Cela identifie un moyen de contrôle cryptographique ; cela ne prouve pas à soi seul la personne réelle ni son droit sur un compte.\n\nLimites et confusions\nNostr Wallet Connect est d'abord une délégation de fonctions de paiement, pas une preuve universelle d'identité ; une clé stable peut faciliter le suivi.",
    "parentIds": [
      "lnurl",
      "digital-signature"
    ],
    "relatedIds": [
      "lnurl",
      "digital-signature"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB biz101 — Bitcoin for Business"
    ],
    "questions": [
      "Prouver le contrôle d’une clé permet-il de prouver son identité ?"
    ],
    "status": "reviewed",
    "sourceHash": "fc407097c92dbd77e3bf4eb8de617ffff3b45cf9598453f250c5903528bf4498",
    "sourcePath": "data/alice-corpus/examples/secondary-bitcoin-wallet-as-identity.fr.md",
    "theme": "bitcoin"
  },
  {
    "id": "curated-secondary-economics-barter-double-coincidence",
    "conceptId": "secondary-economics-barter-double-coincidence",
    "title": "La double coïncidence des besoins",
    "keywords": [
      "La double coïncidence des besoins",
      "Barter Double Coincidence",
      "La double coïncidence des besoins — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics barter double coincidence"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn échange par troc suppose que chaque partie souhaite ce que propose l’autre. Un moyen d’échange accepté plus largement permet de dissocier la vente d’un bien de l’achat d’un autre.\n\nExplication\n- Le problème porte sur la rencontre simultanée des besoins.\n- Un intermédiaire d’échange réduit cette contrainte.\n- Les théories historiques de l’origine de la monnaie restent distinctes de ce modèle pédagogique.\n\nLimites et confusions\nCe modèle explique une difficulté de l’échange direct ; il ne prouve pas que toutes les sociétés sont historiquement passées du troc à la monnaie.",
    "parentIds": [
      "medium-of-exchange",
      "money-functions"
    ],
    "relatedIds": [
      "medium-of-exchange",
      "money-functions"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "La double coïncidence des besoins — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "a1caa14a4b6e85b9d66bea30b8876a28225101861f3c45976e56b3ca1b6c8098",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-barter-double-coincidence.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-barter-myth",
    "conceptId": "secondary-economics-barter-myth",
    "title": "Le débat sur le récit historique du troc",
    "keywords": [
      "Le débat sur le récit historique du troc",
      "Barter Myth",
      "Le débat sur le récit historique du troc — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics barter myth"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe mythe du troc est la critique anthropologique de l’idée selon laquelle les sociétés primitives auraient d’abord utilisé massivement le troc direct avant d’inventer la monnaie.\n\nExplication\n- David Graeber affirme que les sociétés primitives fonctionnent surtout par crédit, don, dette et obligation sociale.\n- Cette critique ne nie pas l’existence du troc entre étrangers ou groupes distincts.\n- Elle demande de distinguer sociétés primitives, grandes civilisations antiques et échanges internationaux.\n\nLimites et confusions\nLa critique vise un récit historique universel du troc. Elle ne nie ni son existence ni l’utilité de la monnaie pour faciliter des échanges ; les positions doivent rester attribuées.",
    "parentIds": [
      "money-functions",
      "commodity-money"
    ],
    "relatedIds": [
      "money-functions",
      "commodity-money"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Le débat sur le récit historique du troc — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "91fe20758212dfc5d995e88fc12f6a69ca8e23ea5aa4e0d56ad2c3efa94d4c5f",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-barter-myth.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-bretton-woods",
    "conceptId": "secondary-economics-bretton-woods",
    "title": "Le système de Bretton Woods",
    "keywords": [
      "Le système de Bretton Woods",
      "Bretton Woods",
      "Le système de Bretton Woods — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics bretton woods"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBretton Woods organise après 1944 un système où le dollar est convertible en or pour les banques centrales et les autres monnaies sont liées au dollar.\n\nExplication\n- Il donne aux États-Unis un rôle monétaire international central.\n- Le système dépend de la discipline américaine à maintenir convertibilité et réserves suffisantes.\n- Les tensions de déficits et d’émission conduisent au Nixon Shock.\n\nLimites et confusions\nLa convertibilité en or concernait les autorités monétaires étrangères, pas une garantie d’échange pour chaque particulier. Les parités n’étaient pas immuables.",
    "parentIds": [
      "gold-standard",
      "fiat-money"
    ],
    "relatedIds": [
      "gold-standard",
      "fiat-money"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Le système de Bretton Woods — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "9b0e21ef70121e71ef978754e82cc59981cd3702d97aa68c04a32e1f74996c8d",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-bretton-woods.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-cantillon-effect",
    "conceptId": "secondary-economics-cantillon-effect",
    "title": "Les canaux de création monétaire et l’effet Cantillon",
    "keywords": [
      "Les canaux de création monétaire et l’effet Cantillon",
      "Cantillon Effect",
      "Les canaux de création monétaire et l’effet Cantillon — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics cantillon effect"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’effet Cantillon désigne un mécanisme décrit par Richard Cantillon, puis mobilisé notamment par l’école autrichienne. Une monnaie nouvelle entre par des canaux précis et peut modifier les dépenses et les prix relatifs avant de se diffuser. Ses premiers receveurs peuvent acheter avant certains ajustements de prix.\n\nExplication\n- La monnaie nouvelle entre par des canaux spécifiques.\n- Les critiques autrichiennes et bitcoiners soulignent l’avantage possible des premiers receveurs, notamment ceux ayant accès au crédit ou aux dépenses publiques.\n- Les prix relatifs peuvent changer, pas seulement le niveau général des prix.\n- Le mécanisme ne suffit pas à prouver une hausse systématique des inégalités ; les bénéficiaires et l’effet net dépendent des canaux, de l’emploi et des ajustements de prix et de revenus.\n- L’effet nourrit les critiques bitcoiners des politiques monétaires discrétionnaires.\n\nLimites et confusions\nL’existence de canaux d’entrée différents ne permet pas de déduire automatiquement les gagnants, les perdants ou l’évolution nette des inégalités d’une politique donnée.",
    "parentIds": [
      "inflation",
      "money-supply"
    ],
    "relatedIds": [
      "inflation",
      "money-supply"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "https://www.econlib.org/library/NPDBooks/Cantillon/cntNT.html?chapter_num=25",
      "PlanB eco201 — Austrian School of Economics Fundamentals",
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Les canaux de création monétaire et l’effet Cantillon — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "8409a3e16d8c3fec436addeed2b6bde65fefb34f8fe49af2c5a2165d02ed8ed1",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-cantillon-effect.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-coin-clipping",
    "conceptId": "secondary-economics-coin-clipping",
    "title": "Le rognage historique des pièces",
    "keywords": [
      "Le rognage historique des pièces",
      "Coin Clipping",
      "Le rognage historique des pièces — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics coin clipping"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe rognage de pièces consiste à retirer une partie du métal précieux tout en tentant de conserver la valeur faciale de la pièce.\n\nExplication\n- C’est une forme historique de dévaluation et fraude monétaire.\n- Il montre la différence entre valeur faciale et contenu réel.\n- Les autorités comme les particuliers peuvent être incités à altérer la monnaie.\n- Bitcoin rend la supply vérifiable par règles de consensus plutôt que par poids physique.\n\nLimites et confusions\nLe rognage physique, la modification officielle du contenu métallique et une baisse du taux de change sont des mécanismes différents ; leur comparaison ne doit pas les confondre.",
    "parentIds": [
      "commodity-money",
      "bitcoin-finite-supply"
    ],
    "relatedIds": [
      "commodity-money",
      "bitcoin-finite-supply"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Le rognage historique des pièces — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "6b6fd4ca23f3b932be5da3917c5808c442a4ada5f41eb82abf466a2cdd5629a1",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-coin-clipping.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-credit-expansion",
    "conceptId": "secondary-economics-credit-expansion",
    "title": "L’expansion du crédit et ses interprétations",
    "keywords": [
      "L’expansion du crédit et ses interprétations",
      "Credit Expansion",
      "L’expansion du crédit et ses interprétations — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics credit expansion"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’expansion du crédit désigne l’augmentation des prêts. Quand une banque accorde un crédit, elle crée généralement un dépôt, sous contraintes de capital, de liquidité et de demande. L’analyse autrichienne distingue cette création de crédit d’un financement par épargne préalable et y voit une source possible de cycles.\n\nExplication\n- Selon la théorie autrichienne des cycles, le crédit financé par l’épargne coordonne mieux investissement et consommation future.\n- Dans cette analyse, une expansion du crédit déconnectée de l’épargne peut fausser les signaux de taux, favoriser des surinvestissements et conduire à leur correction.\n- Ce modèle n’établit pas que toute expansion du crédit provoque une bulle ni qu’il explique seul chaque crise.\n\nLimites et confusions\nLa création de dépôts par le crédit est un mécanisme bancaire ; l’explication des crises par la théorie autrichienne doit rester explicitement attribuée.",
    "parentIds": [
      "fractional-reserve-banking",
      "money-supply"
    ],
    "relatedIds": [
      "fractional-reserve-banking",
      "money-supply"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy",
      "PlanB eco201 — Austrian School of Economics Fundamentals",
      "PlanB eco203 — Bastiat Economic Thought"
    ],
    "questions": [
      "L’expansion du crédit et ses interprétations — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "fa78140877a011b2c4261b082e2112b2277101e1fc7a69d5cfcb3b57a90fb0ec",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-credit-expansion.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-currency-crisis",
    "conceptId": "secondary-economics-currency-crisis",
    "title": "Les crises monétaires et leurs différences",
    "keywords": [
      "Les crises monétaires et leurs différences",
      "Currency Crisis",
      "Les crises monétaires et leurs différences — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics currency crisis"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne crise monétaire survient lorsqu’une monnaie subit une perte rapide de confiance, de valeur externe ou de pouvoir d’achat. Elle peut aller de la dévaluation forte à l’hyperinflation et à la substitution monétaire.\n\nExplication\n- Elle peut résulter de déficits, dette, émission, crise politique ou choc externe.\n- Les acteurs cherchent à se réfugier dans devises, biens réels ou actifs plus fiables.\n- La confiance peut se rompre plus vite qu’elle ne se reconstruit.\n- Bitcoin est parfois utilisé ou imaginé comme sortie partielle dans ces contextes.\n\nLimites et confusions\nUne crise de change n’est pas nécessairement une hyperinflation. Bitcoin et les stablecoins introduisent d’autres risques ; aucune protection de pouvoir d’achat n’est garantie.",
    "parentIds": [
      "hyperinflation",
      "bitcoin-vs-stablecoins"
    ],
    "relatedIds": [
      "hyperinflation",
      "bitcoin-vs-stablecoins"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco204 — Hyperinflation Case Studies",
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Les crises monétaires et leurs différences — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "8cd4230df78e9b3543e5152dfecc5f2dce7a21981d638c8ba4a130c73b81c242",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-currency-crisis.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-debt-money-theory",
    "conceptId": "secondary-economics-debt-money-theory",
    "title": "La théorie de la monnaie-dette",
    "keywords": [
      "La théorie de la monnaie-dette",
      "Debt Money Theory",
      "La théorie de la monnaie-dette — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics debt money theory"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa théorie de la monnaie-dette soutient que la monnaie émerge de relations de dette, crédit et obligations sociales quantifiées plutôt que du troc direct.\n\nExplication\n- Elle est associée à Alfred Mitchell-Innes et David Graeber.\n- Elle éclaire les tablettes mésopotamiennes, les dettes sociales et les unités de compte administratives.\n- Sa version forte assimile toute monnaie à une dette ou créance sur la société, thèse contestée par l’exemple de la monnaie-marchandise.\n\nLimites et confusions\nCette théorie constitue une lecture des origines et de la nature de la monnaie. Elle ne démontre pas que chaque forme monétaire actuelle est une dette envers un émetteur.",
    "parentIds": [
      "money-functions",
      "commodity-money"
    ],
    "relatedIds": [
      "money-functions",
      "commodity-money"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "La théorie de la monnaie-dette — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "c86e802ae1cd2ab8114782b6f342b83bf78eb193423448d591331c92d5694fd3",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-debt-money-theory.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-denationalization-of-money",
    "conceptId": "secondary-economics-denationalization-of-money",
    "title": "La concurrence monétaire proposée par Hayek",
    "keywords": [
      "La concurrence monétaire proposée par Hayek",
      "Denationalization of Money",
      "La concurrence monétaire proposée par Hayek — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics denationalization of money"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nHayek propose la concurrence entre monnaies privées pour soumettre leurs émetteurs au choix des utilisateurs. Cette proposition est souvent rapprochée de Bitcoin, dont l’émission obéit toutefois à des règles de protocole.\n\nExplication\n- Les défenseurs de cette concurrence attendent une discipline des émetteurs.\n- Cette attente repose sur des hypothèses de choix, de concurrence et de confiance.\n- Bitcoin n’a pas d’émetteur capable de piloter seul son offre comme une banque privée.\n\nLimites et confusions\nIl s’agit d’une proposition théorique de Hayek. Ses effets attendus ne sont pas des résultats garantis ; Bitcoin diffère de monnaies privées gérées par des émetteurs concurrents.",
    "parentIds": [
      "fiat-money",
      "bitcoin-monetary-policy"
    ],
    "relatedIds": [
      "fiat-money",
      "bitcoin-monetary-policy"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB phi101 — A Philosophical History of Freedom"
    ],
    "questions": [
      "La concurrence monétaire proposée par Hayek — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "47ef4673827adb73d65041c420c92418193ad40aa8f2911bf4469ea7ee2c2164",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-denationalization-of-money.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-dollarization",
    "conceptId": "secondary-economics-dollarization",
    "title": "La dollarisation officielle ou spontanée",
    "keywords": [
      "La dollarisation officielle ou spontanée",
      "Dollarization",
      "La dollarisation officielle ou spontanée — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics dollarization"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa dollarisation est l’usage du dollar américain, officiellement ou informellement, à la place ou à côté d’une monnaie locale affaiblie. Elle apparaît souvent après inflation élevée, crise de confiance ou hyperinflation.\n\nExplication\n- Elle peut stabiliser les prix en important une monnaie plus crédible.\n- Elle réduit la souveraineté monétaire de l’État local.\n- Elle peut être officielle ou spontanée par les acteurs privés.\n- Bitcoin peut être comparé à une forme alternative de substitution monétaire volontaire.\n\nLimites et confusions\nLa stabilité par rapport au dollar ne garantit pas un pouvoir d’achat constant. Les stablecoins ajoutent des risques d’émetteur, de réserve, de réseau et de conversion.",
    "parentIds": [
      "hyperinflation",
      "bitcoin-vs-stablecoins"
    ],
    "relatedIds": [
      "hyperinflation",
      "bitcoin-vs-stablecoins"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco204 — Hyperinflation Case Studies",
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "La dollarisation officielle ou spontanée — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "b3694d98528da54db6e35306ab5c8ddb2c35a4692126dcea1704e8b328e4cbb6",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-dollarization.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-emergence-of-money",
    "conceptId": "secondary-economics-emergence-of-money",
    "title": "L’émergence monétaire dans l’analyse autrichienne",
    "keywords": [
      "L’émergence monétaire dans l’analyse autrichienne",
      "Emergence of Money",
      "L’émergence monétaire dans l’analyse autrichienne — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics emergence of money"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nDans la perspective autrichienne, la monnaie émerge spontanément du marché comme bien le plus échangeable, afin de résoudre les limites du troc et la double coïncidence des besoins.\n\nExplication\n- La monnaie n’a pas besoin d’être inventée par l’État pour émerger.\n- Les acteurs convergent vers les biens les plus vendables et acceptés.\n- L’imitation et les effets de réseau renforcent l’adoption monétaire.\n- Bitcoin peut être analysé comme une tentative d’émergence monétaire numérique.\n\nLimites et confusions\nLa perspective autrichienne exposée ici est une théorie de l’émergence monétaire ; elle ne remplace pas l’étude historique des dettes, des institutions et des usages.",
    "parentIds": [
      "money-functions",
      "network-effects-in-money"
    ],
    "relatedIds": [
      "money-functions",
      "network-effects-in-money"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco201 — Austrian School of Economics Fundamentals",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "L’émergence monétaire dans l’analyse autrichienne — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "fb8eb286838e756935a4a06030b3daa7f1a8160c9a07e58dd9fe792061ba0a39",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-emergence-of-money.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-free-banking",
    "conceptId": "secondary-economics-free-banking",
    "title": "Le modèle de banque libre",
    "keywords": [
      "Le modèle de banque libre",
      "Free Banking",
      "Le modèle de banque libre — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics free banking"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe free banking désigne un système où des banques concurrentes émettent des moyens de paiement sous des règles communes, sans monopole d’émission d’une banque centrale. Ses défenseurs attendent une discipline exercée par les clients et les autres banques.\n\nExplication\n- La possibilité de conversion et la confiance envers l’émetteur jouent un rôle central.\n- Les modèles de free banking et leurs expériences historiques ne sont pas tous identiques.\n- La concurrence entre banques et les règles d’émission de Bitcoin sont des mécanismes distincts.\n\nLimites et confusions\nLes bénéfices de la concurrence sont une thèse défendue par ce courant. Ils ne constituent pas une garantie contre les paniques, les fraudes ou les défauts de liquidité.",
    "parentIds": [
      "central-banking",
      "fractional-reserve-banking"
    ],
    "relatedIds": [
      "central-banking",
      "fractional-reserve-banking"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB phi203 — Freedom as a Social Project"
    ],
    "questions": [
      "Le modèle de banque libre — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "7aba8a1366d4370638b0225c59865ac1d40b201589f9b06b8e09f8c3bb45aa83",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-free-banking.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-gold-backed-paper-currency",
    "conceptId": "secondary-economics-gold-backed-paper-currency",
    "title": "Les créances convertibles en métal",
    "keywords": [
      "Les créances convertibles en métal",
      "Gold-Backed Paper Currency",
      "Les créances convertibles en métal — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics gold backed paper currency"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn billet ou certificat convertible en métal permet de transférer une créance plutôt que de transporter l’or ou l’argent. Son détenteur dépend alors de la capacité du dépositaire à honorer la conversion.\n\nExplication\n- La portabilité s’améliore mais un intermédiaire conserve le métal.\n- Il faut distinguer couverture intégrale et émission supérieure aux réserves.\n- Une restriction ou suspension de la conversion change la nature de la promesse.\n\nLimites et confusions\nUne promesse de conversion dépend du contrat et des réserves de l’émetteur. Ne pas généraliser ce mécanisme à l’origine de toutes les monnaies papier.",
    "parentIds": [
      "gold-standard",
      "counterparty-risk"
    ],
    "relatedIds": [
      "gold-standard",
      "counterparty-risk"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Les créances convertibles en métal — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "7e0bc2cd7c19a37b4ef752e9712e924494b7e89dc02dcd555eeaf7859fcb3038",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-gold-backed-paper-currency.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-gresham-law",
    "conceptId": "secondary-economics-gresham-law",
    "title": "La loi de Gresham et ses conditions",
    "keywords": [
      "La loi de Gresham et ses conditions",
      "Gresham Law",
      "La loi de Gresham et ses conditions — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics gresham law"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa loi de Gresham résume le phénomène selon lequel, sous cours légal à taux imposé, la mauvaise monnaie chasse la bonne de la circulation.\n\nExplication\n- Les utilisateurs dépensent la monnaie dégradée et gardent la monnaie de meilleure qualité.\n- Le phénomène apparaît dans les réformes romaines, les monnaies dévaluées et les systèmes bimétalliques mal fixés.\n- Il suppose généralement un rapport légal ou officiel qui empêche les prix relatifs de s’ajuster librement.\n\nLimites et confusions\nLa formule suppose des conditions telles qu’une parité imposée entre monnaies. Elle ne signifie pas que la monnaie jugée moins bonne l’emporte dans toute concurrence libre.",
    "parentIds": [
      "commodity-money",
      "fiat-money"
    ],
    "relatedIds": [
      "commodity-money",
      "fiat-money"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "La loi de Gresham et ses conditions — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "4880ea2bf96f356e9ebf1b735012181ec4bf747a8108548ee6c281df9fd3bc1e",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-gresham-law.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-hayek-knowledge-problem",
    "conceptId": "secondary-economics-hayek-knowledge-problem",
    "title": "L’information dispersée dans l’analyse de Hayek",
    "keywords": [
      "L’information dispersée dans l’analyse de Hayek",
      "Hayek Knowledge Problem",
      "L’information dispersée dans l’analyse de Hayek — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics hayek knowledge problem"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nHayek souligne que l’information économique est dispersée entre de nombreux acteurs. Dans son analyse, les prix transmettent une partie de cette information sans qu’un acteur central connaisse chaque besoin et chaque ressource.\n\nExplication\n- Des connaissances locales changent avec les circonstances.\n- Un prix peut signaler une rareté ou une variation de demande.\n- Les limites de coordination centrale constituent ici une thèse économique attribuée.\n\nLimites et confusions\nCette explication est l’argument de Hayek sur l’information dispersée. Elle ne démontre pas que tout prix est exact ou que toute intervention publique échoue.",
    "parentIds": [
      "price-discovery"
    ],
    "relatedIds": [
      "price-discovery"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco203 — Bastiat Economic Thought"
    ],
    "questions": [
      "L’information dispersée dans l’analyse de Hayek — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "fcb1310fe9f5cdc3aadab189830de0eba8fc605e74c57a9a8dbfcbd3df2dea39",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-hayek-knowledge-problem.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-interest-rates",
    "conceptId": "secondary-economics-interest-rates",
    "title": "Les taux d’intérêt et leurs interprétations",
    "keywords": [
      "Les taux d’intérêt et leurs interprétations",
      "Interest Rates",
      "Les taux d’intérêt et leurs interprétations — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics interest rates"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn taux d’intérêt exprime le coût d’un crédit ou la rémunération convenue d’un prêt sur une durée. Il dépend notamment du risque, des anticipations d’inflation, des conditions de marché et des politiques monétaires.\n\nExplication\n- Un même chiffre ne signifie pas la même chose selon la durée et les conditions du contrat.\n- L’analyse autrichienne étudie comment les taux coordonnent épargne et investissement.\n- Ses critiques des taux artificiellement bas sont une interprétation des cycles, pas une preuve que toute baisse provoque une crise.\n\nLimites et confusions\nDistinguer taux nominal et taux réel, risque de crédit et durée. L’interprétation des taux comme coordination de l’épargne relève notamment de l’analyse autrichienne.",
    "parentIds": [
      "central-banking",
      "money-supply"
    ],
    "relatedIds": [
      "central-banking",
      "money-supply"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco201 — Austrian School of Economics Fundamentals",
      "PlanB eco203 — Bastiat Economic Thought"
    ],
    "questions": [
      "Les taux d’intérêt et leurs interprétations — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "070991ae6da69db7489bc4f3588c70e39a47ddd0f553b5bfbe5d8060743cb142",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-interest-rates.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-layered-money",
    "conceptId": "secondary-economics-layered-money",
    "title": "Les couches de créances monétaires",
    "keywords": [
      "Les couches de créances monétaires",
      "Layered Money",
      "Les couches de créances monétaires — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics layered money"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa monnaie en couches décrit un système où une couche de base — or, réserves ou monnaie banque centrale — soutient des couches supérieures de billets, dépôts et créances.\n\nExplication\n- Dans certains systèmes historiques de convertibilité, des créances monétaires pouvaient s’appuyer sur d’autres créances, elles-mêmes convertibles en métal.\n- Chaque couche ajoute utilité et liquidité mais aussi risque de contrepartie.\n- Le fiat moderne conserve des couches, mais sans ancre métallique finale.\n\nLimites et confusions\nLes couches monétaires fondées sur des créances ne sont pas identiques aux protocoles de paiement Bitcoin. Chaque couche doit être examinée selon ses mécanismes de règlement et de garde.",
    "parentIds": [
      "bitcoin-layered-architecture",
      "counterparty-risk"
    ],
    "relatedIds": [
      "bitcoin-layered-architecture",
      "counterparty-risk"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Les couches de créances monétaires — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "d241a667b46299fb6b1fe3daae5560963e9310dbad8a6a795861b077ef39c711",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-layered-money.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-lender-of-last-resort",
    "conceptId": "secondary-economics-lender-of-last-resort",
    "title": "Le prêteur en dernier ressort",
    "keywords": [
      "Le prêteur en dernier ressort",
      "Lender of Last Resort",
      "Le prêteur en dernier ressort — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics lender of last resort"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe prêteur en dernier ressort est l’institution, généralement la banque centrale, qui fournit de la liquidité aux banques ou marchés en crise afin d’éviter un effondrement systémique. Ce rôle réduit certains paniques mais peut créer aléa moral.\n\nExplication\n- Il répond à l’instabilité des banques à réserves fractionnaires.\n- Il peut empêcher des cascades de faillites.\n- Il encourage parfois une prise de risque si les acteurs anticipent le sauvetage.\n- Le genesis block de Bitcoin fait écho au contexte des bailouts bancaires.\n\nLimites et confusions\nUn apport de liquidité et une recapitalisation sont différents. L’existence d’un prêteur en dernier ressort ne garantit pas le sauvetage de toute banque ou de tout créancier.",
    "parentIds": [
      "central-banking",
      "counterparty-risk"
    ],
    "relatedIds": [
      "central-banking",
      "counterparty-risk"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco201 — Austrian School of Economics Fundamentals",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Le prêteur en dernier ressort — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "5fa8a0d677aa553a32f23702caf3505f9d41a574273c3f34b3171fa04a3621ea",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-lender-of-last-resort.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-marginal-utility",
    "conceptId": "secondary-economics-marginal-utility",
    "title": "L’utilité d’une unité supplémentaire",
    "keywords": [
      "L’utilité d’une unité supplémentaire",
      "Marginal Utility",
      "L’utilité d’une unité supplémentaire — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics marginal utility"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’utilité marginale désigne la valeur attribuée à une unité supplémentaire d’un bien selon les préférences et circonstances de l’acteur. Elle explique la formation de la demande et la révolution marginaliste de la théorie de la valeur.\n\nExplication\n- La valeur d’une unité dépend de son usage marginal, pas d’une valeur totale abstraite.\n- Elle résout plusieurs paradoxes classiques de la valeur.\n- Elle soutient la théorie subjective de la valeur.\n- Elle aide à analyser la demande monétaire et la prime monétaire de Bitcoin.\n\nLimites et confusions\nL’utilité dépend de l’acteur et du contexte ; cette notion ne fournit pas une formule permettant de déduire le prix futur de Bitcoin.",
    "parentIds": [
      "price-discovery",
      "store-of-value"
    ],
    "relatedIds": [
      "price-discovery",
      "store-of-value"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco205 — The Austrian school of economics"
    ],
    "questions": [
      "L’utilité d’une unité supplémentaire — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "a83a82df0d6eeff89cc2b032602ab5525371764d30adc7f64f0d7320e9881d08",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-marginal-utility.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-mises-regression-theorem",
    "conceptId": "secondary-economics-mises-regression-theorem",
    "title": "Le théorème de régression de Mises",
    "keywords": [
      "Le théorème de régression de Mises",
      "Mises Regression Theorem",
      "Le théorème de régression de Mises — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics mises regression theorem"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe théorème de régression de Mises explique que la demande monétaire actuelle d’un bien s’enracine dans une valeur d’échange antérieure, remontant jusqu’à une valeur non monétaire initiale. Il sert à expliquer l’origine de la valeur de la monnaie.\n\nExplication\n- La monnaie ne surgit pas arbitrairement sans historique de valeur selon Mises.\n- Le débat autour de Bitcoin porte sur la nature de sa valeur initiale : collection, curiosité, coût de production, réseau ou utilité censurable-resistant.\n- Le théorème est souvent discuté dans les analyses autrichiennes de Bitcoin.\n- Il ne suffit pas à lui seul à trancher toute la théorie de la monétisation de Bitcoin.\n\nLimites et confusions\nPrésenter ce raisonnement comme une théorie de Mises et son application à Bitcoin comme un débat ; ni une preuve de prix ni une condition technique du protocole.",
    "parentIds": [
      "money-functions",
      "price-discovery"
    ],
    "relatedIds": [
      "money-functions",
      "price-discovery"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco205 — The Austrian school of economics",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Le théorème de régression de Mises — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "6a0bb7591108e3d4f0fb240477f4c5c38d56a59f2f5c90e413599d518686cd42",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-mises-regression-theorem.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-monetary-debasement",
    "conceptId": "secondary-economics-monetary-debasement",
    "title": "L’altération du contenu métallique de la monnaie",
    "keywords": [
      "L’altération du contenu métallique de la monnaie",
      "Monetary Debasement",
      "L’altération du contenu métallique de la monnaie — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics monetary debasement"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa dégradation monétaire consiste à réduire la quantité ou qualité de métal précieux d’une monnaie tout en maintenant sa valeur nominale.\n\nExplication\n- Elle crée un écart entre valeur légale et valeur réelle.\n- Elle déclenche souvent thésaurisation des bonnes pièces et circulation des mauvaises.\n- Elle peut mener à hausse des prix, perte de confiance et désorganisation du calcul économique.\n\nLimites et confusions\nL’altération du contenu métallique n’est pas synonyme d’une dévaluation de change ou d’une hausse automatique et proportionnelle des prix.",
    "parentIds": [
      "commodity-money",
      "inflation"
    ],
    "relatedIds": [
      "commodity-money",
      "inflation"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "L’altération du contenu métallique de la monnaie — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "6c05aad1c550f5aec25dbab1aee84c0cdd54201982a4929c994ab947da8b3d45",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-monetary-debasement.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-monetary-premium",
    "conceptId": "secondary-economics-monetary-premium",
    "title": "La notion de prime monétaire",
    "keywords": [
      "La notion de prime monétaire",
      "Monetary Premium",
      "La notion de prime monétaire — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics monetary premium"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa prime monétaire désigne, dans certaines analyses, la valeur attribuée à un actif pour ses usages de monnaie ou de réserve plutôt que pour ses usages non monétaires.\n\nExplication\n- Une demande de réserve peut s’ajouter à une demande industrielle ou de consommation.\n- La distinction aide à comparer des usages d’un actif, sans mesurer directement leur valeur séparée.\n- Les interprétations de cette prime dépendent du cadre économique retenu.\n\nLimites et confusions\nLa prime monétaire est une grille d’analyse difficile à isoler empiriquement. Elle ne donne pas à elle seule une valorisation chiffrée de Bitcoin ou de l’or.",
    "parentIds": [
      "commodity-money",
      "store-of-value"
    ],
    "relatedIds": [
      "commodity-money",
      "store-of-value"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "La notion de prime monétaire — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "3aebfb9a2da29a07ab3bd1b67a298dd27d6ba2a4391d5415333812a5f88e767f",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-monetary-premium.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-moral-hazard",
    "conceptId": "secondary-economics-moral-hazard",
    "title": "L’aléa moral et les garanties",
    "keywords": [
      "L’aléa moral et les garanties",
      "Moral Hazard",
      "L’aléa moral et les garanties — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics moral hazard"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’aléa moral apparaît lorsqu’un acteur prend davantage de risques parce qu’il ne supporte pas entièrement les conséquences négatives de ses choix. Les garanties, bailouts et prêteurs en dernier ressort peuvent l’amplifier.\n\nExplication\n- Sauver systématiquement certains acteurs modifie leurs incitations.\n- Les banques peuvent prendre plus de risque si elles anticipent un soutien public.\n- L’aléa moral socialise les pertes tout en privatisant parfois les gains.\n- Bitcoin est souvent présenté comme une réaction à ce régime de sauvetage.\n\nLimites et confusions\nUne garantie peut modifier les incitations sans entraîner automatiquement un comportement imprudent. L’effet dépend des règles, du contrôle et des pertes qui restent à la charge de l’acteur.",
    "parentIds": [
      "counterparty-risk",
      "central-banking"
    ],
    "relatedIds": [
      "counterparty-risk",
      "central-banking"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco201 — Austrian School of Economics Fundamentals",
      "PlanB eco203 — Bastiat Economic Thought",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "L’aléa moral et les garanties — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "a62fea47d5df0aa3a0ff6ae3a9ce20b5f3c7b50b856671f1824ff965f2f63e5b",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-moral-hazard.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-nixon-shock",
    "conceptId": "secondary-economics-nixon-shock",
    "title": "La suspension de convertibilité du dollar en 1971",
    "keywords": [
      "La suspension de convertibilité du dollar en 1971",
      "Nixon Shock",
      "La suspension de convertibilité du dollar en 1971 — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics nixon shock"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe Nixon Shock désigne la suspension en 1971 de la convertibilité du dollar en or, mettant fin à l’ancrage de Bretton Woods et accélérant l’ère fiat moderne.\n\nExplication\n- Les dollars n’étaient plus échangeables contre or par les pays.\n- L’événement a supprimé une contrainte importante sur l’expansion monétaire américaine.\n- Il marque une rupture majeure dans l’histoire monétaire du XXe siècle.\n- Il nourrit les analyses Bitcoin sur monnaie non manipulable et offre limitée.\n\nLimites et confusions\nLa suspension de 1971 concerne la convertibilité officielle internationale du dollar en or. La transformation du système monétaire s’étend au-delà de cette seule décision.",
    "parentIds": [
      "gold-standard",
      "fiat-money"
    ],
    "relatedIds": [
      "gold-standard",
      "fiat-money"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "La suspension de convertibilité du dollar en 1971 — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "acde52326cf4d0fd7c9a5086113eaadde4dd3a480a692a2d3dc7c1f86bf89e77",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-nixon-shock.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-opportunity-cost",
    "conceptId": "secondary-economics-opportunity-cost",
    "title": "Le coût d’opportunité",
    "keywords": [
      "Le coût d’opportunité",
      "Opportunity Cost",
      "Le coût d’opportunité — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics opportunity cost"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe coût d’opportunité est la valeur de la meilleure alternative abandonnée lorsqu’un choix est fait. Il rappelle que toute décision économique implique renoncement, même sans dépense monétaire visible.\n\nExplication\n- Le coût pertinent dépend des alternatives subjectivement disponibles.\n- Il s’applique à consommation, investissement, production et allocation du temps.\n- Il est essentiel pour comprendre arbitrages de capital et choix d’investissement.\n- Dans Bitcoin, il apparaît dans conservation, dépense, mining, sécurité et allocation de portefeuille.\n\nLimites et confusions\nL’alternative pertinente doit être réellement disponible. Pour le minage, une énergie momentanément excédentaire et une énergie utilisable ailleurs n’ont pas le même coût d’opportunité.",
    "parentIds": [
      "mining-profitability",
      "bitcoin-energy-debate"
    ],
    "relatedIds": [
      "mining-profitability",
      "bitcoin-energy-debate"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco205 — The Austrian school of economics",
      "PlanB eco203 — Bastiat Economic Thought"
    ],
    "questions": [
      "Le coût d’opportunité — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "91c53ee015cc88b6754854583f5907ead79230ae09574c4628127af31da01b8e",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-opportunity-cost.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-proof-of-stake",
    "conceptId": "secondary-economics-proof-of-stake",
    "title": "Comparer preuve d’enjeu et preuve de travail",
    "keywords": [
      "Comparer preuve d’enjeu et preuve de travail",
      "Proof of Stake",
      "Comparer preuve d’enjeu et preuve de travail — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics proof of stake"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa preuve d’enjeu regroupe des protocoles où la participation à la production ou à la validation des blocs dépend notamment d’un actif immobilisé. Bitcoin utilise la preuve de travail, dont les ressources et les hypothèses de sécurité diffèrent.\n\nExplication\n- L’actif immobilisé joue un rôle dans la sélection ou le poids des participants.\n- Certains systèmes prévoient des pénalités pour des comportements définis par leurs règles.\n- La comparaison avec la preuve de travail porte sur les coûts, les incitations et les conditions de consensus.\n\nLimites et confusions\nLes mécanismes, pénalités et garanties varient selon le protocole. Comparer un système précis plutôt qu’attribuer une sécurité identique à toutes les formes de preuve d’enjeu.",
    "parentIds": [
      "proof-of-work",
      "bitcoin-vs-crypto"
    ],
    "relatedIds": [
      "proof-of-work",
      "bitcoin-vs-crypto"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his203 — Bitcoin’s Pioneering Era"
    ],
    "questions": [
      "Comparer preuve d’enjeu et preuve de travail — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "b1b3560243abcb68af1fa887f1a3f5efb18a8c1fea010a42fb24f99e0f69fe05",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-proof-of-stake.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-quantitative-easing",
    "conceptId": "secondary-economics-quantitative-easing",
    "title": "Les achats d’actifs des banques centrales",
    "keywords": [
      "Les achats d’actifs des banques centrales",
      "Quantitative Easing",
      "Les achats d’actifs des banques centrales — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics quantitative easing"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe quantitative easing (QE) est une politique par laquelle une banque centrale achète massivement des actifs financiers afin d’injecter de la liquidité, réduire certains taux et soutenir l’économie ou les marchés.\n\nExplication\n- Le QE augmente le bilan de la banque centrale.\n- Il peut soutenir prix d’actifs et conditions financières.\n- Ses effets distributifs et incitations sont controversés.\n- Il nourrit les critiques sur inflation monétaire, Cantillon effects et dépendance des marchés.\n\nLimites et confusions\nUne augmentation des réserves bancaires ne se traduit pas mécaniquement par une hausse égale du crédit ou des prix à la consommation. Les effets dépendent du contexte.",
    "parentIds": [
      "central-banking",
      "money-supply"
    ],
    "relatedIds": [
      "central-banking",
      "money-supply"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco205 — The Austrian school of economics",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Les achats d’actifs des banques centrales — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "6372e5da5fba3705daea5cf1532b90b8ef3142156b23c386cbead0c3620955d2",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-quantitative-easing.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-redenomination",
    "conceptId": "secondary-economics-redenomination",
    "title": "Changer l’échelle d’une unité monétaire",
    "keywords": [
      "Changer l’échelle d’une unité monétaire",
      "Redenomination",
      "Changer l’échelle d’une unité monétaire — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics redenomination"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa redénomination consiste à remplacer une monnaie par une nouvelle unité en supprimant des zéros ou en changeant l’échelle nominale. Elle peut simplifier les prix mais ne résout pas les causes monétaires si la politique reste inchangée.\n\nExplication\n- Elle intervient souvent après forte inflation.\n- Elle améliore lisibilité comptable mais pas forcément pouvoir d’achat.\n- Sans discipline monétaire, les zéros peuvent revenir.\n- Les cas latino-américains illustrent répétition et limites de cette stratégie.\n\nLimites et confusions\nChanger l’échelle des prix et des soldes n’augmente pas en soi leur pouvoir d’achat réel. Une redénomination et une stabilisation économique sont 2 opérations différentes.",
    "parentIds": [
      "hyperinflation",
      "unit-of-account"
    ],
    "relatedIds": [
      "hyperinflation",
      "unit-of-account"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco204 — Hyperinflation Case Studies"
    ],
    "questions": [
      "Changer l’échelle d’une unité monétaire — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "ce438ff0ac46f17b8ac6eb7d026eb12f1173f8f7eacc2f51e690eab56ed21fa7",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-redenomination.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-sound-money",
    "conceptId": "secondary-economics-sound-money",
    "title": "Ce que signifie monnaie saine",
    "keywords": [
      "Ce que signifie monnaie saine",
      "Sound Money",
      "Ce que signifie monnaie saine — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics sound money"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa sound money désigne une monnaie difficile à dévaluer, fiable dans le temps et capable de préserver le calcul économique et l’épargne.\n\nExplication\n- Historiquement, elle est associée aux pièces de poids et pureté fiables, puis à l’or.\n- Elle s’oppose aux monnaies rognées, dégradées ou surémises.\n- Dans le discours Bitcoin, elle désigne une monnaie rare, vérifiable et résistante à la manipulation.\n\nLimites et confusions\n« Monnaie saine » est un concept normatif dont les critères doivent être explicités. Une offre difficile à augmenter ne garantit pas un cours stable ni un pouvoir d’achat constant.",
    "parentIds": [
      "bitcoin-monetary-policy",
      "store-of-value"
    ],
    "relatedIds": [
      "bitcoin-monetary-policy",
      "store-of-value"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Ce que signifie monnaie saine — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "7a38235abcd1bd5d48a1915156d9e02da5b7f0666354d790eb385e3665cd2b27",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-sound-money.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-stock-to-flow-ratio",
    "conceptId": "secondary-economics-stock-to-flow-ratio",
    "title": "Le ratio stock-flux et ses limites",
    "keywords": [
      "Le ratio stock-flux et ses limites",
      "Stock-to-Flow Ratio",
      "Le ratio stock-flux et ses limites — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics stock to flow ratio"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe ratio stock-to-flow compare le stock existant d’un bien à sa production annuelle, et mesure la difficulté de diluer l’offre existante.\n\nExplication\n- L’or conserve un ratio élevé parce qu’il est accumulé et peu consommé.\n- Des métaux plus rares en production annuelle peuvent être moins monétaires si leur stock est faible ou consommé rapidement.\n- Le ratio aide à comprendre rareté monétaire, réserve de valeur et compétition entre biens monétaires.\n\nLimites et confusions\nCe rapport entre stock et flux ne tient pas compte de toute la demande et ne constitue pas une loi de formation des prix. Il ne permet pas de garantir un prix futur de Bitcoin.",
    "parentIds": [
      "bitcoin-finite-supply",
      "bitcoin-halving"
    ],
    "relatedIds": [
      "bitcoin-finite-supply",
      "bitcoin-halving"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Le ratio stock-flux et ses limites — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "b8ff985244ae7905e210c76a4e979393d80c3113f528fe555256ac34ca8afa75",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-stock-to-flow-ratio.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-subjective-theory-of-value",
    "conceptId": "secondary-economics-subjective-theory-of-value",
    "title": "La théorie subjective de la valeur",
    "keywords": [
      "La théorie subjective de la valeur",
      "Subjective Theory of Value",
      "La théorie subjective de la valeur — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics subjective theory of value"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa théorie subjective de la valeur affirme que la valeur économique ne vient pas objectivement du travail ou des coûts, mais des préférences et jugements des individus. Les prix émergent des échanges entre acteurs qui valorisent différemment les biens.\n\nExplication\n- La valeur est ordinale et contextuelle, pas mesurable comme une grandeur physique.\n- L’échange volontaire est possible parce que chaque partie valorise différemment ce qu’elle donne et reçoit.\n- La révolution marginaliste remplace les théories objectives de la valeur.\n- Cette approche aide à comprendre la monétisation progressive de Bitcoin.\n\nLimites et confusions\nIl s’agit d’un cadre théorique sur la valeur. Il n’établit ni une valeur minimale ni un rendement pour Bitcoin ; la demande peut changer.",
    "parentIds": [
      "price-discovery",
      "store-of-value"
    ],
    "relatedIds": [
      "price-discovery",
      "store-of-value"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco201 — Austrian School of Economics Fundamentals"
    ],
    "questions": [
      "La théorie subjective de la valeur — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "ade47c87b6aae891b8bee47b47b85f1dcbaff100dfd29d45d13b16bec2b0432d",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-subjective-theory-of-value.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-economics-time-preference",
    "conceptId": "secondary-economics-time-preference",
    "title": "La préférence entre présent et futur",
    "keywords": [
      "La préférence entre présent et futur",
      "Time Preference",
      "La préférence entre présent et futur — quel mécanisme et quelles limites ?",
      "economics",
      "secondary economics time preference"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa préférence temporelle mesure la préférence pour une satisfaction présente plutôt que future. Dans l’économie autrichienne, elle fonde le taux d’intérêt originaire et influence épargne, investissement, capital et horizon de décision.\n\nExplication\n- Une préférence temporelle plus basse favorise épargne et investissements longs.\n- Une préférence temporelle plus haute favorise consommation immédiate.\n- Les taux d’intérêt coordonnent décisions entre présent et futur.\n- Une monnaie dure est souvent associée à une baisse de préférence temporelle dans les récits bitcoiners.\n\nLimites et confusions\nLa préférence temporelle ne résume pas toutes les contraintes d’épargne. Associer Bitcoin à une baisse de cette préférence est une interprétation, pas un effet automatique démontré.",
    "parentIds": [
      "store-of-value",
      "money-functions"
    ],
    "relatedIds": [
      "store-of-value",
      "money-functions"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco201 — Austrian School of Economics Fundamentals"
    ],
    "questions": [
      "La préférence entre présent et futur — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "826309e49fc4b70fcf9fc0dbcdb1e8bdb73d4504406ed9bbac34fa86b588acd4",
    "sourcePath": "data/alice-corpus/examples/secondary-economics-time-preference.fr.md",
    "theme": "economics"
  },
  {
    "id": "curated-secondary-governance-chain-split-risk",
    "conceptId": "secondary-governance-chain-split-risk",
    "title": "Le risque de divergence entre chaînes",
    "keywords": [
      "Le risque de divergence entre chaînes",
      "Chain Split Risk",
      "Que se passe-t-il lorsque des nœuds appliquent des règles incompatibles ?",
      "governance",
      "secondary governance chain split risk"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe risque de chain split apparaît lorsque des nœuds ou mineurs appliquent des règles incompatibles et prolongent des branches différentes de la blockchain.\n\nExplication\n- Un split peut être causé par un bug, un upgrade mal coordonné ou un désaccord social.\n- Les utilisateurs, exchanges et wallets peuvent voir des confirmations trompeuses pendant l’incident.\n- La gravité dépend du hashrate, de l’économie et de la durée de divergence.\n- Préserver l’harmonie du consensus est une priorité des upgrades Bitcoin.\n\nLimites et confusions\nUne divergence temporaire n’implique pas nécessairement la création durable de 2 actifs.",
    "parentIds": [
      "hard-fork",
      "bitcoin-consensus"
    ],
    "relatedIds": [
      "hard-fork",
      "bitcoin-consensus"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Que se passe-t-il lorsque des nœuds appliquent des règles incompatibles ?"
    ],
    "status": "reviewed",
    "sourceHash": "4c6ff56f3f8bfdf5d7dce7874f1ef5800cd2873d0f230a0ae71de908ea9fd6ad",
    "sourcePath": "data/alice-corpus/examples/secondary-governance-chain-split-risk.fr.md",
    "theme": "governance"
  },
  {
    "id": "curated-secondary-governance-taproot-activation",
    "conceptId": "secondary-governance-taproot-activation",
    "title": "L’activation de Taproot en 2021",
    "keywords": [
      "L’activation de Taproot en 2021",
      "Taproot Activation",
      "Comment Taproot a-t-il été activé ?",
      "governance",
      "secondary governance taproot activation"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’activation de Taproot a utilisé Speedy Trial, un mécanisme court de signalement minier destiné à réussir rapidement ou fournir des données pour une tentative suivante.\n\nExplication\n- Les règles Taproot étaient techniquement prêtes avant que le mécanisme d’activation soit tranché.\n- Le débat a opposé forced activation et approche “try and fail if needed”.\n- Speedy Trial a émergé comme compromis acceptable.\n- Taproot a été activé au bloc 709632 en novembre 2021.\n\nLimites et confusions\nCe mécanisme historique n’est pas une règle d’activation obligatoire pour toutes les évolutions futures.",
    "parentIds": [
      "taproot",
      "soft-fork"
    ],
    "relatedIds": [
      "taproot",
      "soft-fork"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Comment Taproot a-t-il été activé ?"
    ],
    "status": "reviewed",
    "sourceHash": "51aa6f03f9bd183e9d70003fc924608d4fcdefa23080f0da41827cd8f8811c0d",
    "sourcePath": "data/alice-corpus/examples/secondary-governance-taproot-activation.fr.md",
    "theme": "governance"
  },
  {
    "id": "curated-secondary-history-bip50-chain-split",
    "conceptId": "secondary-history-bip50-chain-split",
    "title": "La scission accidentelle de mars 2013",
    "keywords": [
      "La scission accidentelle de mars 2013",
      "BIP50 Chain Split",
      "Pourquoi des nœuds Bitcoin ont-ils divergé en mars 2013 ?",
      "history",
      "secondary history bip50 chain split"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBIP50 documente le split de mars 2013 entre Bitcoin 0.7 et 0.8, causé par une limite implicite de verrous Berkeley DB devenue règle de consensus accidentelle.\n\nExplication\n- Un bloc contenant beaucoup d’inputs a été accepté par 0.8 et rejeté par certains nœuds pré-0.8.\n- Des pools importants ont downgradé pour ramener le hashrate sur la branche compatible 0.7.\n- La résolution a combiné action minière rapide et patchs temporaires.\n- L’incident montre qu’une contrainte d’implémentation peut devenir règle de consensus involontaire.\n\nLimites et confusions\nL’incident historique ne permet pas de déduire qu’une coordination similaire serait simple ou garantie aujourd’hui.",
    "parentIds": [
      "bitcoin-consensus",
      "bitcoin-governance"
    ],
    "relatedIds": [
      "bitcoin-consensus",
      "bitcoin-governance"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy"
    ],
    "questions": [
      "Pourquoi des nœuds Bitcoin ont-ils divergé en mars 2013 ?"
    ],
    "status": "reviewed",
    "sourceHash": "6bf10d743c42215d3277abd147f024e95f082ee2028f7b812d860160e3bbc512",
    "sourcePath": "data/alice-corpus/examples/secondary-history-bip50-chain-split.fr.md",
    "theme": "history"
  },
  {
    "id": "curated-secondary-history-bitcoin-faucet",
    "conceptId": "secondary-history-bitcoin-faucet",
    "title": "Le faucet historique de Gavin Andresen",
    "keywords": [
      "Le faucet historique de Gavin Andresen",
      "Bitcoin Faucet",
      "Pourquoi distribuait-on gratuitement des bitcoins aux débuts du réseau ?",
      "history",
      "secondary history bitcoin faucet"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe Bitcoin Faucet de Gavin Andresen distribuait gratuitement des bitcoins pour encourager l’expérimentation et attirer de nouveaux utilisateurs. À l’époque, les BTC avaient une valeur faible et l’objectif principal était le bootstrapping du réseau.\n\nExplication\n- Le faucet rend Bitcoin testable sans mining ni achat.\n- Il aide à élargir la communauté des premiers utilisateurs.\n- Il illustre un temps où distribuer plusieurs BTC gratuitement était rationnel pour l’adoption.\n- Il devient rétrospectivement un symbole de l’évolution de la valeur du bitcoin.\n\nLimites et confusions\nLe faucet historique distribuait de vrais BTC ; les sats de test du playground sont d’une autre nature.",
    "parentIds": [
      "bitcoin-pizza-day",
      "alice-practice-faucet"
    ],
    "relatedIds": [
      "bitcoin-pizza-day",
      "alice-practice-faucet"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his201 — The History of Bitcoin's Creation"
    ],
    "questions": [
      "Pourquoi distribuait-on gratuitement des bitcoins aux débuts du réseau ?"
    ],
    "status": "reviewed",
    "sourceHash": "758915668443c469d4de20438f87d7ad699dfe877c053d892c2358cc5868dfbf",
    "sourcePath": "data/alice-corpus/examples/secondary-history-bitcoin-faucet.fr.md",
    "theme": "history"
  },
  {
    "id": "curated-secondary-history-first-bitcoin-transaction",
    "conceptId": "secondary-history-first-bitcoin-transaction",
    "title": "Le premier transfert connu entre utilisateurs",
    "keywords": [
      "Le premier transfert connu entre utilisateurs",
      "First Bitcoin Transaction",
      "À qui Satoshi a-t-il envoyé les premiers bitcoins connus ?",
      "history",
      "secondary history first bitcoin transaction"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa première transaction Bitcoin connue entre 2 personnes a lieu le 12 janvier 2009, lorsque Satoshi Nakamoto envoie 10 BTC à Hal Finney. Elle marque le passage de Bitcoin d’un logiciel lancé à un réseau utilisé.\n\nExplication\n- Hal Finney est le premier destinataire connu d’une transaction Bitcoin.\n- La transaction teste concrètement l’envoi pair-à-pair décrit par le whitepaper.\n- Elle relie Satoshi et Finney dans les premiers jours du réseau.\n- Elle est devenue un repère historique majeur.\n\nLimites et confusions\nIl s’agit du premier transfert connu entre personnes, distinct de la première transaction coinbase.",
    "parentIds": [
      "bitcoin-genesis-block",
      "bitcoin-pizza-day"
    ],
    "relatedIds": [
      "bitcoin-genesis-block",
      "bitcoin-pizza-day"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB his201 — The History of Bitcoin's Creation"
    ],
    "questions": [
      "À qui Satoshi a-t-il envoyé les premiers bitcoins connus ?"
    ],
    "status": "reviewed",
    "sourceHash": "57224b6b6fd3cbfa4af6ed8df97687478850e62536381a04626f68dc342a3a5e",
    "sourcePath": "data/alice-corpus/examples/secondary-history-first-bitcoin-transaction.fr.md",
    "theme": "history"
  },
  {
    "id": "curated-secondary-lightning-blinded-paths",
    "conceptId": "secondary-lightning-blinded-paths",
    "title": "Les chemins aveuglés sur Lightning",
    "keywords": [
      "Les chemins aveuglés sur Lightning",
      "Blinded Paths",
      "Comment masquer le chemin vers le destinataire d’un paiement Lightning ?",
      "lightning",
      "secondary lightning blinded paths"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes blinded paths masquent une partie du chemin vers le destinataire afin d’améliorer la confidentialité du receveur sur Lightning.\n\nExplication\n- L’expéditeur ne connaît pas nécessairement le nœud final exact.\n- Chaque intermédiaire garde une vue limitée du routage.\n- Ils sont utiles pour BOLT12 et paiements plus privés.\n- Ils traitent surtout la privacy du destinataire.\n\nLimites et confusions\nMasquer un chemin ne supprime pas tous les indices temporels, de montant ou de réseau.",
    "parentIds": [
      "bolt12-offers",
      "lightning-privacy-tradeoff"
    ],
    "relatedIds": [
      "bolt12-offers",
      "lightning-privacy-tradeoff"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro101 — Bitcoin Development Fundamentals"
    ],
    "questions": [
      "Comment masquer le chemin vers le destinataire d’un paiement Lightning ?"
    ],
    "status": "reviewed",
    "sourceHash": "4551a069ea1a9f113493ed0981ad06a6ad2edd6ffd216840fa1b732801b7c180",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-blinded-paths.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-bolts",
    "conceptId": "secondary-lightning-bolts",
    "title": "Les spécifications BOLT de Lightning",
    "keywords": [
      "Les spécifications BOLT de Lightning",
      "BOLTs",
      "Les spécifications BOLT de Lightning — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning bolts"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes BOLTs sont les spécifications techniques qui définissent le comportement interopérable des implémentations Lightning.\n\nExplication\n- BOLT signifie Basis of Lightning Technology.\n- Ils décrivent messages, canaux, onion routing, invoices et règles de protocole.\n- L’interopérabilité Lightning dépend du respect de ces spécifications.\n- Les BOLTs permettent à LND, Core Lightning et Eclair de parler ensemble.\n\nLimites et confusions\nUne spécification peut prévoir des fonctions optionnelles ou évoluer avant leur prise en charge par tous les logiciels. Publication d’un texte et déploiement généralisé sont distincts.",
    "parentIds": [
      "lightning-network",
      "bitcoin-improvement-proposal"
    ],
    "relatedIds": [
      "lightning-network",
      "bitcoin-improvement-proposal"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB lnp202 — Set up Your First Lightning Node"
    ],
    "questions": [
      "Les spécifications BOLT de Lightning — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "c2ae802112739c05b14320927558bdb9e5cebf3cae287126e4f3111eba287e98",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-bolts.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-commitment-transaction",
    "conceptId": "secondary-lightning-commitment-transaction",
    "title": "Les transactions d’engagement Lightning",
    "keywords": [
      "Les transactions d’engagement Lightning",
      "Commitment Transaction",
      "Les transactions d’engagement Lightning — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning commitment transaction"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nDans les canaux Lightning à révocation, une transaction d’engagement représente un état qui peut être publié sur Bitcoin pour fermer le canal. Les mises à jour remplacent les engagements utilisables et rendent les états précédents pénalisables.\n\nExplication\n- Chaque participant dispose d’une transaction d’engagement correspondant à sa perspective.\n- Les engagements restent normalement hors chaîne tant que le canal fonctionne.\n- Une fermeture forcée publie un engagement sur Bitcoin.\n- Les secrets de révocation et conditions temporelles permettent de réagir à la publication d’un état révoqué.\n\nLimites et confusions\nUn état ancien peut être publié à cause d’une restauration incorrecte, sans intention de fraude. La réaction dépend du type de canal et de la capacité à agir dans le délai prévu.",
    "parentIds": [
      "lightning-channel",
      "lightning-force-close"
    ],
    "relatedIds": [
      "lightning-channel",
      "lightning-force-close"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB lnp201 — Lightning Network Theory"
    ],
    "questions": [
      "Les transactions d’engagement Lightning — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "8562386ee1d009d3e072186f60ec80f54ba416122c1cd40e524e3e55f379663b",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-commitment-transaction.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-just-in-time-lightning-channel",
    "conceptId": "secondary-lightning-just-in-time-lightning-channel",
    "title": "Les canaux ouverts à la demande",
    "keywords": [
      "Les canaux ouverts à la demande",
      "Just-in-Time Lightning Channel",
      "Les canaux ouverts à la demande — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning just in time lightning channel"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn service Lightning peut proposer un canal ouvert au moment où un paiement doit être reçu et où la capacité de réception manque. Cette approche just-in-time déplace une partie de la gestion de liquidité vers le service.\n\nExplication\n- L’ouverture répond à un besoin de réception concret.\n- Le service peut automatiser des opérations que l’utilisateur aurait autrement préparées.\n- Les conditions de frais, de confirmation et de disponibilité doivent être précisées par l’implémentation.\n\nLimites et confusions\nL’ouverture implique des frais et des conditions propres au service. L’acceptation avant confirmation ajoute des hypothèses distinctes ; l’utilisateur doit toujours comprendre le modèle de garde.",
    "parentIds": [
      "lightning-service-provider",
      "inbound-liquidity"
    ],
    "relatedIds": [
      "lightning-service-provider",
      "inbound-liquidity"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB dev303 — Learning Rust with Bitcoin"
    ],
    "questions": [
      "Les canaux ouverts à la demande — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "ef77cfb54435d256e82be477abb7c8681c2e7e4bae846192a8ec4d9fe8066daf",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-just-in-time-lightning-channel.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-lightning-gossip-protocol",
    "conceptId": "secondary-lightning-lightning-gossip-protocol",
    "title": "La diffusion du graphe public Lightning",
    "keywords": [
      "La diffusion du graphe public Lightning",
      "Lightning Gossip Protocol",
      "La diffusion du graphe public Lightning — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning lightning gossip protocol"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe gossip protocol Lightning diffuse les informations publiques sur les nœuds et canaux afin de construire une carte du réseau.\n\nExplication\n- Il permet aux nœuds de découvrir des routes de paiement.\n- Il ne révèle pas tous les canaux privés ou soldes exacts.\n- Il publie notamment existence de canaux et certaines politiques de routage.\n- La carte réseau sert au pathfinding mais reste imparfaite.\n\nLimites et confusions\nLa carte publique ne donne pas les soldes exacts ni la disponibilité garantie de chaque chemin. Un canal non annoncé peut aussi laisser des indices à certains participants.",
    "parentIds": [
      "lightning-routing",
      "lightning-privacy-tradeoff"
    ],
    "relatedIds": [
      "lightning-routing",
      "lightning-privacy-tradeoff"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB lnp202 — Set up Your First Lightning Node"
    ],
    "questions": [
      "La diffusion du graphe public Lightning — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "86b804a892d9871731808d3e447ac9205b4e814bdf1f169b67d7bf6fce637b92",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-lightning-gossip-protocol.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-lightning-node-implementation",
    "conceptId": "secondary-lightning-lightning-node-implementation",
    "title": "Les implémentations de Lightning",
    "keywords": [
      "Les implémentations de Lightning",
      "Lightning Node Implementation",
      "Les implémentations de Lightning — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning lightning node implementation"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne implémentation Lightning est un logiciel qui applique les spécifications du protocole Lightning.\n\nExplication\n- Les principales implémentations incluent LND, Core Lightning et Eclair.\n- Elles sont interopérables car elles suivent les BOLTs.\n- Elles diffèrent par langage, architecture, tooling et public cible.\n- Le choix d’implémentation influence backups, API, outils et expérience opérateur.\n\nLimites et confusions\nLes fonctions facultatives, versions et procédures de sauvegarde diffèrent. Le respect d’un socle de spécifications ne rend pas tous les logiciels interchangeables.",
    "parentIds": [
      "lightning-network",
      "lightning-node-backup"
    ],
    "relatedIds": [
      "lightning-network",
      "lightning-node-backup"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB lnp202 — Set up Your First Lightning Node"
    ],
    "questions": [
      "Les implémentations de Lightning — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "aa5cfd647f1d168fba0830d4e1cd6d4bbbd97def845914cef2a1e102110384dc",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-lightning-node-implementation.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-lightning-node-recovery-tradeoff",
    "conceptId": "secondary-lightning-lightning-node-recovery-tradeoff",
    "title": "Les dépendances de récupération d’un nœud Lightning",
    "keywords": [
      "Les dépendances de récupération d’un nœud Lightning",
      "Lightning Node Recovery Tradeoff",
      "Les dépendances de récupération d’un nœud Lightning — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning lightning node recovery tradeoff"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe trade-off de récupération d’un nœud Lightning mesure la difficulté de récupérer ses fonds et états de canaux si l’infrastructure ou le wallet disparaît.\n\nExplication\n- Garder les clés ne suffit pas toujours si l’état de canal est complexe.\n- Un modèle cloud simplifie le quotidien mais peut compliquer la sortie autonome.\n- Les providers doivent prévoir migration, backup et procédures de recovery.\n- Les utilisateurs non techniques peuvent être dépendants de l’écosystème wallet.\n\nLimites et confusions\nLa récupération dépend des données conservées, des pairs disponibles et du logiciel. Détenir une phrase de récupération ne garantit pas la reconstitution de tous les états de canaux.",
    "parentIds": [
      "lightning-node-backup",
      "lightning-service-provider"
    ],
    "relatedIds": [
      "lightning-node-backup",
      "lightning-service-provider"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB dev303 — Learning Rust with Bitcoin"
    ],
    "questions": [
      "Les dépendances de récupération d’un nœud Lightning — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "f4a6e44ce71882328fbc3538a54247e8487f86a9a46bc9e70bed099cc494ef82",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-lightning-node-recovery-tradeoff.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-lightning-private-channel",
    "conceptId": "secondary-lightning-lightning-private-channel",
    "title": "Les canaux Lightning non annoncés",
    "keywords": [
      "Les canaux Lightning non annoncés",
      "Lightning Private Channel",
      "Les canaux Lightning non annoncés — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning lightning private channel"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn canal Lightning non annoncé n’est pas diffusé comme canal public dans le graphe de routage. Cela réduit certaines informations publiées, sans garantir que le canal reste secret.\n\nExplication\n- Le canal peut être utilisé pour envoyer ou recevoir selon les informations de routage disponibles.\n- Des indications de route peuvent aider un payeur à atteindre le destinataire.\n- L’absence d’annonce publique ne constitue pas une garantie d’anonymat.\n\nLimites et confusions\nNon annoncé ne signifie pas invisible ni connu seulement des 2 pairs. Des indices de route, les paiements et l’analyse de chaîne peuvent révéler son existence.",
    "parentIds": [
      "lightning-channel",
      "lightning-privacy-tradeoff"
    ],
    "relatedIds": [
      "lightning-channel",
      "lightning-privacy-tradeoff"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB lnp404 — Navigating Your Node with Terminal"
    ],
    "questions": [
      "Les canaux Lightning non annoncés — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "40cbec265d9280bde014bcf506f0cc86b8e99e446edbaba844fe73120da154d9",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-lightning-private-channel.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-lightning-public-channel",
    "conceptId": "secondary-lightning-lightning-public-channel",
    "title": "Les canaux Lightning annoncés",
    "keywords": [
      "Les canaux Lightning annoncés",
      "Lightning Public Channel",
      "Les canaux Lightning annoncés — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning lightning public channel"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn canal Lightning public est annoncé au network graph, permettant à des tiers de router des paiements via ce canal.\n\nExplication\n- Il peut générer des frais de routage.\n- Il expose plus d’information topologique qu’un canal privé.\n- Il exige uptime, liquidité et fee policy compétitive.\n- Il est adapté aux routing nodes.\n\nLimites et confusions\nUne annonce publique ne garantit ni du trafic ni des revenus. Le paiement peut échouer malgré la présence du canal dans le graphe.",
    "parentIds": [
      "lightning-channel",
      "lightning-routing"
    ],
    "relatedIds": [
      "lightning-channel",
      "lightning-routing"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB lnp404 — Navigating Your Node with Terminal"
    ],
    "questions": [
      "Les canaux Lightning annoncés — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "4ace34fb2f7763a627ef4b9f09c2588171abd39e0860b33340553c434691147e",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-lightning-public-channel.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-lightning-remote-wallet-connection",
    "conceptId": "secondary-lightning-lightning-remote-wallet-connection",
    "title": "Relier une application à un nœud distant",
    "keywords": [
      "Relier une application à un nœud distant",
      "Lightning Remote Wallet Connection",
      "Relier une application à un nœud distant — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning lightning remote wallet connection"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne connexion remote wallet permet d’utiliser une application mobile tout en s’appuyant sur son propre nœud Lightning distant.\n\nExplication\n- L’objectif est d’avoir une UX mobile sans abandonner le contrôle du nœud.\n- Les modes courants incluent Tor, VPN/Tailscale ou Nostr Wallet Connect.\n- Chaque méthode a un modèle de sécurité et de fiabilité différent.\n- Les secrets d’accès doivent être limités et protégés.\n\nLimites et confusions\nL’application distante agit selon les droits accordés par le nœud ou le service. La méthode de connexion ne prouve pas à elle seule l’autogarde des fonds.",
    "parentIds": [
      "lightning-node-online-status",
      "threat-model"
    ],
    "relatedIds": [
      "lightning-node-online-status",
      "threat-model"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB lnp202 — Set up Your First Lightning Node"
    ],
    "questions": [
      "Relier une application à un nœud distant — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "3c6081bf43d87bc6b967aa5bdfa1d57f1b4d6e89eaa1eb38daaed97ad590936a",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-lightning-remote-wallet-connection.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-lnd-aezeed",
    "conceptId": "secondary-lightning-lnd-aezeed",
    "title": "Le format de récupération aezeed de LND",
    "keywords": [
      "Le format de récupération aezeed de LND",
      "LND aezeed",
      "Le format de récupération aezeed de LND — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning lnd aezeed"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\naezeed est le format de seed spécifique à LND utilisé pour dériver le wallet on-chain associé au nœud Lightning.\n\nExplication\n- Il ressemble à une phrase de 24 mots mais n’est pas une seed BIP39 classique.\n- Il permet de retrouver les fonds revenus on-chain après fermeture de canaux.\n- Il ne suffit pas à restaurer l’état dynamique des canaux Lightning.\n- Il doit être sauvegardé avec le même sérieux qu’une seed de wallet.\n\nLimites et confusions\nCette fiche concerne LND. La phrase aezeed n’est pas interchangeable avec BIP39 et ne constitue pas, seule, une sauvegarde de l’état de tous les canaux.",
    "parentIds": [
      "lightning-node-backup",
      "wallet-recovery-phrase"
    ],
    "relatedIds": [
      "lightning-node-backup",
      "wallet-recovery-phrase"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB lnp202 — Set up Your First Lightning Node"
    ],
    "questions": [
      "Le format de récupération aezeed de LND — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "6a64856535618efeb9bb5571065a83bff4215780f5e7784c6f0cb09fde482348",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-lnd-aezeed.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-macaroon",
    "conceptId": "secondary-lightning-macaroon",
    "title": "Les jetons d’accès macaroon de LND",
    "keywords": [
      "Les jetons d’accès macaroon de LND",
      "Macaroon",
      "Les jetons d’accès macaroon de LND — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning macaroon"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nDans LND, un macaroon est un jeton qui autorise certaines opérations sur le nœud. Une application qui le possède peut exercer les droits qui lui sont accordés.\n\nExplication\n- Les droits doivent correspondre aux seules opérations nécessaires.\n- Un jeton d’administration donne des pouvoirs beaucoup plus larges qu’un accès en lecture.\n- Les budgets ou autres restrictions doivent être vérifiés dans le mécanisme utilisé, sans être supposés universels.\n- Le jeton doit être transmis et conservé comme un secret d’accès.\n\nLimites et confusions\nUn macaroon n’est pas une phrase de récupération. Certains droits permettent toutefois de déclencher des paiements ; il faut protéger le jeton et limiter ses permissions.",
    "parentIds": [
      "threat-model",
      "lightning-node-online-status"
    ],
    "relatedIds": [
      "threat-model",
      "lightning-node-online-status"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB lnp202 — Set up Your First Lightning Node"
    ],
    "questions": [
      "Les jetons d’accès macaroon de LND — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "30840737b2480b61f9feb551c06b5573518b22b9a12e23614a7a813c2f1e0b7f",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-macaroon.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-nostr-wallet-connect",
    "conceptId": "secondary-lightning-nostr-wallet-connect",
    "title": "Les connexions Nostr Wallet Connect",
    "keywords": [
      "Les connexions Nostr Wallet Connect",
      "Nostr Wallet Connect",
      "Les connexions Nostr Wallet Connect — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning nostr wallet connect"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nNostr Wallet Connect permet à une application d’envoyer des demandes chiffrées à un portefeuille via des relais Nostr. Le portefeuille exécute les opérations autorisées et renvoie ses réponses.\n\nExplication\n- Les messages sont chiffrés entre les parties ; ce ne sont pas les relais eux-mêmes qui constituent une garantie de garde.\n- L’URI de connexion comporte un secret d’accès à protéger.\n- Le protocole évite d’exposer directement une API de nœud à chaque application.\n- La connexion ne remplace ni les sauvegardes ni l’examen des droits accordés.\n\nLimites et confusions\nNWC peut connecter un service custodial ou un nœud personnel. Les permissions et limites effectives dépendent du wallet ; les relais peuvent observer des métadonnées.",
    "parentIds": [
      "lightning-network",
      "custodial-lightning-wallet"
    ],
    "relatedIds": [
      "lightning-network",
      "custodial-lightning-wallet"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "https://github.com/nostr-protocol/nips/blob/master/47.md",
      "PlanB lnp202 — Set up Your First Lightning Node"
    ],
    "questions": [
      "Les connexions Nostr Wallet Connect — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "fe75d082b2b45d2631e91d3546bb462b26de4e5c544a8b28e1baec7906dae5b2",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-nostr-wallet-connect.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-onion-routing",
    "conceptId": "secondary-lightning-onion-routing",
    "title": "Le routage en oignon de Lightning",
    "keywords": [
      "Le routage en oignon de Lightning",
      "Onion Routing",
      "Le routage en oignon de Lightning — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning onion routing"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’onion routing de Lightning permet de transmettre un paiement par plusieurs nœuds intermédiaires sans que chacun connaisse l’ensemble du chemin. Chaque nœud ne voit que le saut précédent, le saut suivant et les instructions qui lui sont destinées.\n\nExplication\n- Le routage en oignon protège partiellement la confidentialité du chemin.\n- Il ne rend pas Lightning parfaitement anonyme.\n- Les nœuds intermédiaires connaissent les montants/frais utiles à leur saut.\n- La confidentialité dépend aussi de la topologie, de la liquidité, des probes et du comportement des endpoints.\n\nLimites et confusions\nLa visibilité réduite de chaque relais n’empêche pas les inférences par montants, temps, topologie ou collusion. Les extrémités connaissent des informations différentes des relais.",
    "parentIds": [
      "lightning-routing",
      "lightning-privacy-tradeoff"
    ],
    "relatedIds": [
      "lightning-routing",
      "lightning-privacy-tradeoff"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB lnp201 — Lightning Network Theory"
    ],
    "questions": [
      "Le routage en oignon de Lightning — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "9e86d842bf0a9c52e18091ea5f3bb41e1b46ede53dbdc64e38743dcd6a453c57",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-onion-routing.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-revocation-key",
    "conceptId": "secondary-lightning-revocation-key",
    "title": "Réagir à un état de canal révoqué",
    "keywords": [
      "Réagir à un état de canal révoqué",
      "Revocation Key",
      "Réagir à un état de canal révoqué — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning revocation key"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa revocation key est un mécanisme qui permet de punir la publication d’un ancien état de canal Lightning. Lorsqu’un nouvel état est accepté, l’ancien est révoqué en révélant des données permettant à l’autre partie de récupérer les fonds si cet ancien état est publié.\n\nExplication\n- Elle résout le problème du partenaire qui essaierait de publier un état plus favorable mais obsolète.\n- Elle fonctionne avec des timelocks qui laissent le temps de réagir.\n- Elle impose aux utilisateurs ou à leurs services de surveiller la chaîne.\n- Elle justifie l’existence des watchtowers dans certains modèles.\n\nLimites et confusions\nLa possibilité de pénaliser un état révoqué dépend de la détection et de la confirmation de la réponse dans les délais. Elle n’élimine pas les contraintes de surveillance et de frais.",
    "parentIds": [
      "lightning-channel",
      "watchtower"
    ],
    "relatedIds": [
      "lightning-channel",
      "watchtower"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB lnp201 — Lightning Network Theory"
    ],
    "questions": [
      "Réagir à un état de canal révoqué — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "d59f428c3235706f30c366220fed0bf65e4a56762f7412a4ab47d087638438c8",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-revocation-key.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-static-channel-backup",
    "conceptId": "secondary-lightning-static-channel-backup",
    "title": "La sauvegarde statique des canaux LND",
    "keywords": [
      "La sauvegarde statique des canaux LND",
      "Static Channel Backup",
      "La sauvegarde statique des canaux LND — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning static channel backup"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn Static Channel Backup de LND conserve des informations permettant de retrouver les pairs et de demander une fermeture de canaux après perte des données locales. Il sert à récupérer les fonds sur Bitcoin, pas à reprendre le nœud à l’identique.\n\nExplication\n- Il ne contient pas l’état dynamique complet des canaux.\n- La récupération utilise les informations de sauvegarde et les clés appropriées.\n- Les pairs sont sollicités pour publier leur transaction de fermeture.\n- La sauvegarde doit refléter les changements de canaux selon la procédure de LND.\n\nLimites et confusions\nCette procédure concerne LND et dépend de la coopération/disponibilité des pairs. Elle ne restaure pas les canaux ouverts à leur dernier état et ne remplace pas les clés nécessaires.",
    "parentIds": [
      "lightning-node-backup",
      "channel-closure"
    ],
    "relatedIds": [
      "lightning-node-backup",
      "channel-closure"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB lnp202 — Set up Your First Lightning Node"
    ],
    "questions": [
      "La sauvegarde statique des canaux LND — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "a4eb8cc2e37eb81c75df69364a36b08ec28969555c6b03927782c1e737abd047",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-static-channel-backup.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-lightning-submarine-swap",
    "conceptId": "secondary-lightning-submarine-swap",
    "title": "Passer entre Bitcoin et Lightning par un swap",
    "keywords": [
      "Passer entre Bitcoin et Lightning par un swap",
      "Submarine Swap",
      "Passer entre Bitcoin et Lightning par un swap — quel mécanisme et quelles limites ?",
      "lightning",
      "secondary lightning submarine swap"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn submarine swap échange de la liquidité entre Lightning et on-chain Bitcoin, permettant de passer d’une couche à l’autre sans exposer l’utilisateur à toute la complexité.\n\nExplication\n- Il peut permettre de payer on-chain avec des fonds Lightning ou inversement.\n- Les SDK peuvent l’intégrer pour présenter une balance unifiée.\n- Les swaps ajoutent des frais, délais et hypothèses de service.\n- Ils améliorent l’interopérabilité entre L1 et Lightning.\n\nLimites et confusions\nUn swap n’est pas une modification de capacité de canal par splicing. Les frais, délais, liquidités disponibles et conditions de remboursement dépendent du protocole et du service.",
    "parentIds": [
      "atomic-swap",
      "lightning-liquidity"
    ],
    "relatedIds": [
      "atomic-swap",
      "lightning-liquidity"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB dev303 — Learning Rust with Bitcoin"
    ],
    "questions": [
      "Passer entre Bitcoin et Lightning par un swap — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "7ccfa85bb574094f974998645731e38b38223d935f3af2d641b37e372eb3108e",
    "sourcePath": "data/alice-corpus/examples/secondary-lightning-submarine-swap.fr.md",
    "theme": "lightning"
  },
  {
    "id": "curated-secondary-nodes-bitcoin-indexer",
    "conceptId": "secondary-nodes-bitcoin-indexer",
    "title": "Les indexeurs Bitcoin",
    "keywords": [
      "Les indexeurs Bitcoin",
      "Bitcoin Indexer",
      "Pourquoi certains portefeuilles ont-ils besoin d’un indexeur en plus du nœud ?",
      "nodes",
      "secondary nodes bitcoin indexer"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn indexer Bitcoin construit des index supplémentaires pour retrouver rapidement les transactions, adresses ou scripts pertinents pour un wallet ou une application. Bitcoin Core ne fournit pas par défaut tous les index pratiques pour un wallet externe.\n\nExplication\n- Un indexer facilite la consultation d’historique par adresse ou script.\n- Electrs est une solution populaire pour servir des wallets compatibles Electrum.\n- Ajouter un indexer augmente stockage, CPU et surface opérationnelle.\n- L’indexer peut améliorer l’indépendance si le wallet l’utilise localement.\n\nLimites et confusions\nLes index et ressources nécessaires varient selon les requêtes ; tous les portefeuilles n’en ont pas besoin.",
    "parentIds": [
      "wallet-node-connection",
      "bitcoin-core"
    ],
    "relatedIds": [
      "wallet-node-connection",
      "bitcoin-core"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc202 — Setting up your first Bitcoin node"
    ],
    "questions": [
      "Pourquoi certains portefeuilles ont-ils besoin d’un indexeur en plus du nœud ?"
    ],
    "status": "reviewed",
    "sourceHash": "bb5a8f13eb364837292d45f84f62cfda12aed3ad41f04f63a4428c5e5247ff0c",
    "sourcePath": "data/alice-corpus/examples/secondary-nodes-bitcoin-indexer.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-secondary-nodes-node-in-a-box",
    "conceptId": "secondary-nodes-node-in-a-box",
    "title": "Les solutions de nœud prêtes à installer",
    "keywords": [
      "Les solutions de nœud prêtes à installer",
      "Node-in-a-box",
      "Que simplifient les distributions comme Umbrel ou RaspiBlitz ?",
      "nodes",
      "secondary nodes node in a box"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn node-in-a-box est une distribution ou solution matérielle qui simplifie l’installation et l’administration d’un nœud Bitcoin et d’applications associées. Umbrel, Start9, RaspiBlitz, MyNode ou RoninDojo illustrent cette famille.\n\nExplication\n- Ces solutions abaissent la barrière technique pour faire tourner un nœud.\n- Elles ajoutent souvent une interface graphique et un app store.\n- Elles introduisent aussi des dépendances à leur distribution, leur sécurité et leurs mises à jour.\n- Elles sont utiles pour apprendre, mais ne remplacent pas la compréhension des bases.\n\nLimites et confusions\nLa simplicité d’installation ne supprime pas maintenance, sauvegarde et dépendances de distribution.",
    "parentIds": [
      "bitcoin-node",
      "bitcoin-core"
    ],
    "relatedIds": [
      "bitcoin-node",
      "bitcoin-core"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc202 — Setting up your first Bitcoin node"
    ],
    "questions": [
      "Que simplifient les distributions comme Umbrel ou RaspiBlitz ?"
    ],
    "status": "reviewed",
    "sourceHash": "bd4a640adccc86d9311e12ff53c5d5eb607289ecaf8f7c16956c087456248004",
    "sourcePath": "data/alice-corpus/examples/secondary-nodes-node-in-a-box.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-secondary-opsec-bitcoin-discretion",
    "conceptId": "secondary-opsec-bitcoin-discretion",
    "title": "La discrétion sur ses bitcoins",
    "keywords": [
      "La discrétion sur ses bitcoins",
      "Bitcoin Discretion",
      "Pourquoi éviter de publier ses avoirs et ses habitudes de conservation ?",
      "opsec",
      "secondary opsec bitcoin discretion"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa discrétion Bitcoin consiste à limiter ce que l’on révèle publiquement sur ses avoirs, wallets, habitudes, adresses, lieux de stockage et pratiques de sécurité. Elle protège à la fois privacy numérique et sécurité physique.\n\nExplication\n- Parler publiquement de montants détenus augmente le risque social et physique.\n- Les photos, conférences, réseaux sociaux et discussions informelles peuvent créer des signaux exploitables.\n- La discrétion n’empêche pas l’éducation : elle sépare pédagogie et exposition personnelle.\n- Elle complète KYC minimization, OPSEC et sécurité physique.\n\nLimites et confusions\nLa discrétion diminue certaines expositions sans éliminer les risques physiques ni les traces déjà publiques.",
    "parentIds": [
      "physical-security-for-bitcoiners",
      "non-blockchain-privacy-leaks"
    ],
    "relatedIds": [
      "physical-security-for-bitcoiners",
      "non-blockchain-privacy-leaks"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins"
    ],
    "questions": [
      "Pourquoi éviter de publier ses avoirs et ses habitudes de conservation ?"
    ],
    "status": "reviewed",
    "sourceHash": "420993d0b92d91903e093f9e65c4a4ea8d7261beb07c24fd04bd0614f80a5219",
    "sourcePath": "data/alice-corpus/examples/secondary-opsec-bitcoin-discretion.fr.md",
    "theme": "opsec"
  },
  {
    "id": "curated-secondary-opsec-data-breach-monitoring",
    "conceptId": "secondary-opsec-data-breach-monitoring",
    "title": "Réagir aux alertes de fuite de données",
    "keywords": [
      "Réagir aux alertes de fuite de données",
      "Data Breach Monitoring",
      "Que faire lorsqu’un compte ou un identifiant apparaît dans une fuite ?",
      "opsec",
      "secondary opsec data breach monitoring"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa surveillance des fuites de données consiste à vérifier si un email ou identifiant apparaît dans des bases compromises, puis à prioriser la rotation des mots de passe et l’activation de protections supplémentaires.\n\nExplication\n- Un email présent dans une fuite augmente le risque de phishing personnalisé.\n- Les mots de passe réutilisés transforment une fuite mineure en compromission en chaîne.\n- Les alertes de fuite doivent déclencher changement de mot de passe et revue des sessions actives.\n- La surveillance ne remplace pas la prévention : mots de passe uniques et 2FA restent essentiels.\n\nLimites et confusions\nL’absence d’alerte ne démontre pas l’absence de fuite ; ne jamais soumettre de seed ou clé privée à un service de recherche.",
    "parentIds": [
      "kyc-data-leakage",
      "password-manager"
    ],
    "relatedIds": [
      "kyc-data-leakage",
      "password-manager"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Que faire lorsqu’un compte ou un identifiant apparaît dans une fuite ?"
    ],
    "status": "reviewed",
    "sourceHash": "083cb1d16d3df0a0963e594670236640245ac50469bfb7e52d3f0fc35e6e7ce8",
    "sourcePath": "data/alice-corpus/examples/secondary-opsec-data-breach-monitoring.fr.md",
    "theme": "opsec"
  },
  {
    "id": "curated-secondary-opsec-digital-hygiene",
    "conceptId": "secondary-opsec-digital-hygiene",
    "title": "Les habitudes de sécurité numérique",
    "keywords": [
      "Les habitudes de sécurité numérique",
      "Digital Hygiene",
      "Quelles habitudes protègent mes comptes et mes appareils au quotidien ?",
      "opsec",
      "secondary opsec digital hygiene"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’hygiène numérique est l’ensemble des habitudes simples et répétables qui réduisent l’exposition aux attaques courantes : mots de passe uniques, 2FA, mises à jour, sauvegardes, prudence avec les liens et séparation des usages.\n\nExplication\n- Chercher une sécurité parfaite est irréaliste ; l’objectif est de réduire les risques les plus probables.\n- Les progrès doivent être graduels : email sûr, password manager, 2FA, sauvegardes, navigateur et réseau.\n- Les outils ne remplacent pas les comportements : vérifier URL, expéditeur, origine des logiciels et demandes inhabituelles.\n- Pour un bitcoiner, cette base protège aussi les comptes d’exchange, les accès cloud, les contenus publics et les procédures de récupération.\n\nLimites et confusions\nUne routine réduit les risques fréquents sans garantir qu’un appareil soit sain.",
    "parentIds": [
      "threat-model",
      "software-updates"
    ],
    "relatedIds": [
      "threat-model",
      "software-updates"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Quelles habitudes protègent mes comptes et mes appareils au quotidien ?"
    ],
    "status": "reviewed",
    "sourceHash": "6ab13665ba30194e3e41e3106c177bc31b2b240c4cb9f04c07546cc9b3c8a3a1",
    "sourcePath": "data/alice-corpus/examples/secondary-opsec-digital-hygiene.fr.md",
    "theme": "opsec"
  },
  {
    "id": "curated-secondary-politics-bitcoin-self-custody-under-censorship",
    "conceptId": "secondary-politics-bitcoin-self-custody-under-censorship",
    "title": "Garder ses clés dans un contexte de censure",
    "keywords": [
      "Garder ses clés dans un contexte de censure",
      "Bitcoin Self-Custody Under Censorship",
      "La garde personnelle suffit-elle si Internet ou les plateformes sont bloqués ?",
      "politics",
      "secondary politics bitcoin self custody under censorship"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa self-custody Bitcoin sous censure désigne la capacité à contrôler ses clés lorsque plateformes, banques, Internet ou États deviennent hostiles ou indisponibles.\n\nExplication\n- Les exchanges centralisés peuvent être bloqués, censurés ou devenir inaccessibles.\n- La self-custody protège contre certains risques de plateforme mais pas contre les coupures Internet ou les attaques physiques.\n- Le sujet relie géopolitique, opsec, privacy et résilience financière.\n\nLimites et confusions\nLa garde personnelle ne garantit pas une connexion au réseau ni la sécurité physique du détenteur.",
    "parentIds": [
      "self-custody",
      "financial-censorship"
    ],
    "relatedIds": [
      "self-custody",
      "financial-censorship"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "Article ou ressource du vault — Les Iraniens retirent leurs Bitcoins des exchanges face à la censure d'Internet et les bombardements",
      "Article ou ressource du vault — Reprenez le contrôle de votre vie numérique grâce à un cloud personnel souverain - Notre avis sur Umbrel Home",
      "Article ou ressource du vault — The Bitcoin Revolution in Iran"
    ],
    "questions": [
      "La garde personnelle suffit-elle si Internet ou les plateformes sont bloqués ?"
    ],
    "status": "reviewed",
    "sourceHash": "f40c511280a5e8f5b3806c79dfb2ba21e5ab872cd6f6ed4eb485dce4a9fcc70a",
    "sourcePath": "data/alice-corpus/examples/secondary-politics-bitcoin-self-custody-under-censorship.fr.md",
    "theme": "politics"
  },
  {
    "id": "curated-secondary-privacy-backup-3-2-1-method",
    "conceptId": "secondary-privacy-backup-3-2-1-method",
    "title": "La méthode de sauvegarde 3-2-1",
    "keywords": [
      "La méthode de sauvegarde 3-2-1",
      "Backup 3-2-1 Method",
      "Comment adapter la règle 3-2-1 aux données et aux secrets Bitcoin ?",
      "privacy",
      "secondary privacy backup 3 2 1 method"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa méthode 3-2-1 propose plusieurs copies sur des supports différents dont une hors site pour limiter les pertes corrélées.\n\nExplication\n- Des copies sur le même site restent exposées à un sinistre commun ; la diversification réduit ce risque corrélé.\n- La restauration doit être testée et les copies contenant des secrets protégées contre l’accès non autorisé.\n\nLimites et confusions\nPour des clés Bitcoin, multiplier les copies augmente aussi l'exposition ; adapter le modèle et ne pas envoyer une seed en clair dans le cloud.",
    "parentIds": [
      "secure-backups",
      "wallet-backup"
    ],
    "relatedIds": [
      "secure-backups",
      "wallet-backup"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Comment adapter la règle 3-2-1 aux données et aux secrets Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "0b057d517c65fd4f9106a9c3455a3189c855597daf510c50531425ed548a7377",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-backup-3-2-1-method.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-bip47-reusable-payment-codes",
    "conceptId": "secondary-privacy-bip47-reusable-payment-codes",
    "title": "Les codes de paiement réutilisables BIP47",
    "keywords": [
      "Les codes de paiement réutilisables BIP47",
      "BIP47 Reusable Payment Codes",
      "Comment recevoir plusieurs paiements sans réutiliser une adresse ?",
      "privacy",
      "secondary privacy bip47 reusable payment codes"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nBIP47 définit des codes de paiement réutilisables permettant de dériver des adresses de paiement distinctes entre participants compatibles.\n\nExplication\n- BIP47 cherche à résoudre le problème pratique de la réception récurrente sans address reuse.\n- Le destinataire publie un payment code, pas une adresse unique à réutiliser.\n- La notification transaction introduit un coût et une empreinte on-chain.\n- PayNym est l’un des usages connus de ce modèle.\n\nLimites et confusions\nLes notifications et usages peuvent laisser des traces ; ne pas confondre code réutilisable et adresse Bitcoin réutilisée.",
    "parentIds": [
      "address-reuse",
      "silent-payments"
    ],
    "relatedIds": [
      "address-reuse",
      "silent-payments"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc204 — Privacy on Bitcoin"
    ],
    "questions": [
      "Comment recevoir plusieurs paiements sans réutiliser une adresse ?"
    ],
    "status": "reviewed",
    "sourceHash": "eb56c0a3a5a99be151c236f95fffc5a3195ea3a032e04cb734e852a61144d616",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-bip47-reusable-payment-codes.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-browser-compartmentalization",
    "conceptId": "secondary-privacy-browser-compartmentalization",
    "title": "Séparer ses usages dans le navigateur",
    "keywords": [
      "Séparer ses usages dans le navigateur",
      "Browser Compartmentalization",
      "Que protège réellement la séparation des profils de navigateur ?",
      "privacy",
      "secondary privacy browser compartmentalization"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nSéparer les usages dans des profils ou environnements différents peut réduire les mélanges de sessions, les erreurs de compte et certains suivis.\n\nExplication\n- Des profils distincts séparent notamment les cookies et sessions ; d’autres mécanismes n’isolent qu’une partie de ces données.\n- Une séparation compréhensible et maintenable vaut mieux qu’un dispositif complexe que l’on finit par contourner.\n\nLimites et confusions\nUn profil de navigateur n'isole pas totalement de l'ordinateur compromis ni de toutes les corrélations réseau ; les conteneurs n'isolent pas forcément les extensions.",
    "parentIds": [
      "non-blockchain-privacy-leaks",
      "threat-model"
    ],
    "relatedIds": [
      "non-blockchain-privacy-leaks",
      "threat-model"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu202 — Improve Your Personal Digital Security"
    ],
    "questions": [
      "Que protège réellement la séparation des profils de navigateur ?"
    ],
    "status": "reviewed",
    "sourceHash": "0c9b3731e96fc2c9f05f357898e959a5cc3f1004a2b62a3cfb01e55dcf4e7923",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-browser-compartmentalization.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-browser-extensions-risk",
    "conceptId": "secondary-privacy-browser-extensions-risk",
    "title": "Les risques des extensions de navigateur",
    "keywords": [
      "Les risques des extensions de navigateur",
      "Browser Extensions Risk",
      "Quelles données une extension peut-elle exposer ?",
      "privacy",
      "secondary privacy browser extensions risk"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes extensions peuvent accéder aux pages et données selon leurs permissions ; une extension compromise peut donc exposer des comptes ou paiements.\n\nExplication\n- Les permissions peuvent permettre la lecture ou la modification de certaines pages, voire l’accès à des données sensibles.\n- Une extension utile reste une dépendance logicielle à réévaluer après une mise à jour, un changement de propriétaire ou un comportement inhabituel.\n\nLimites et confusions\nLimiter les extensions et leurs droits ; ne pas en déduire que tout gestionnaire de mots de passe ou remplissage automatique est à éviter.",
    "parentIds": [
      "malware",
      "phishing-and-social-engineering"
    ],
    "relatedIds": [
      "malware",
      "phishing-and-social-engineering"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu202 — Improve Your Personal Digital Security"
    ],
    "questions": [
      "Quelles données une extension peut-elle exposer ?"
    ],
    "status": "reviewed",
    "sourceHash": "0dca5493f6d58f7fb995023fdd53cd8c0dcd3b3a0badd9861ff87e14f1d2677e",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-browser-extensions-risk.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-digital-inheritance",
    "conceptId": "secondary-privacy-digital-inheritance",
    "title": "Préparer la transmission de ses comptes numériques",
    "keywords": [
      "Préparer la transmission de ses comptes numériques",
      "Digital Inheritance",
      "Comment préparer l’accès des proches sans exposer ses secrets à l’avance ?",
      "privacy",
      "secondary privacy digital inheritance"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne procédure d'héritage numérique permet aux proches autorisés de comprendre quels comptes et données existent et comment entreprendre leur récupération.\n\nExplication\n- Le password manager peut centraliser l’inventaire des comptes.\n- Une procédure papier ou notariale peut indiquer comment accéder sans publier les secrets.\n- Distinguer accès aux données, comptes financiers, Bitcoin et comptes publics.\n- Tester la compréhension de la procédure par une personne de confiance.\n\nLimites et confusions\nPrévoir l'accès ne donne pas automatiquement le droit juridique d'utiliser tous les comptes et ne doit pas exposer les secrets prématurément.",
    "parentIds": [
      "bitcoin-inheritance-plan",
      "password-manager"
    ],
    "relatedIds": [
      "bitcoin-inheritance-plan",
      "password-manager"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Comment préparer l’accès des proches sans exposer ses secrets à l’avance ?"
    ],
    "status": "reviewed",
    "sourceHash": "f91f56a46301aa82524b40040bfc7c83d510d76ca0ff9c80ca2b3e87cb38286f",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-digital-inheritance.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-file-encryption",
    "conceptId": "secondary-privacy-file-encryption",
    "title": "Chiffrer des fichiers sensibles",
    "keywords": [
      "Chiffrer des fichiers sensibles",
      "File Encryption",
      "Chiffrer des fichiers sensibles — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy file encryption"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe chiffrement de fichiers protège sélectivement certains documents ou dossiers sensibles, indépendamment du chiffrement complet du disque. Il est utile pour partager, archiver ou stocker des données à risque.\n\nExplication\n- Il complète le chiffrement complet du disque.\n- Il est adapté aux archives, documents d’identité, backups cloud et fichiers transmis.\n- La sécurité dépend de la phrase secrète et de l’outil choisi.\n- Il faut éviter de laisser traîner des copies temporaires non chiffrées.\n\nLimites et confusions\nUn fichier chiffré peut laisser des copies en clair dans les fichiers temporaires ou les sauvegardes. Le chiffrement ne remplace pas une sauvegarde récupérable.",
    "parentIds": [
      "encryption",
      "secure-backups"
    ],
    "relatedIds": [
      "encryption",
      "secure-backups"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu202 — Improve Your Personal Digital Security",
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Chiffrer des fichiers sensibles — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "33f28dd230b3c1d8fa60ecdeeec18788267d864b6ef68292011f955962134026",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-file-encryption.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-full-disk-encryption",
    "conceptId": "secondary-privacy-full-disk-encryption",
    "title": "Ce que protège le chiffrement du disque",
    "keywords": [
      "Ce que protège le chiffrement du disque",
      "Full Disk Encryption",
      "Ce que protège le chiffrement du disque — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy full disk encryption"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe chiffrement complet du disque protège les données au repos si un ordinateur, téléphone ou disque externe est perdu ou volé. Il exige un mot de passe fort et une bonne gestion de la récupération.\n\nExplication\n- Il protège surtout contre l’accès physique lorsque le volume chiffré est fermé et que ses clés ne sont pas accessibles.\n- Il ne protège pas contre un malware actif pendant que la machine est déverrouillée.\n- Les disques externes et sauvegardes doivent aussi être chiffrés si sensibles.\n- La perte de la phrase/mot de passe de récupération peut rendre les données irrécupérables.\n\nLimites et confusions\nCette protection concerne surtout un volume fermé, typiquement lorsque l’appareil est éteint. Le simple verrouillage de l’écran n’offre pas nécessairement la même protection. Une session ouverte ou un logiciel malveillant autorisé à lire les données change le modèle de menace.",
    "parentIds": [
      "encryption",
      "physical-security-for-bitcoiners"
    ],
    "relatedIds": [
      "encryption",
      "physical-security-for-bitcoiners"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu202 — Improve Your Personal Digital Security",
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Ce que protège le chiffrement du disque — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "b14ec0da9a9289ce0108b60c430850ecaf04a3ed42c7036582883c2b8c56eb95",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-full-disk-encryption.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-https-verification",
    "conceptId": "secondary-privacy-https-verification",
    "title": "HTTPS et vérification du domaine",
    "keywords": [
      "HTTPS et vérification du domaine",
      "HTTPS Verification",
      "HTTPS et vérification du domaine — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy https verification"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa vérification HTTPS consiste à contrôler le protocole, le domaine exact, le cadenas/certificat et l’orthographe de l’URL avant d’entrer des données sensibles.\n\nExplication\n- HTTPS chiffre le transport mais ne prouve pas à lui seul que le site est légitime.\n- Les attaques utilisent souvent des domaines proches, caractères trompeurs ou extensions inhabituelles.\n- Le certificat doit correspondre au domaine attendu.\n- Pour les comptes critiques, ne pas suivre les liens email ; saisir ou bookmarker l’URL.\n\nLimites et confusions\nUn certificat valide peut appartenir à un site frauduleux. Vérifier le domaine attendu reste nécessaire ; l’icône affichée dépend du navigateur.",
    "parentIds": [
      "phishing-and-social-engineering"
    ],
    "relatedIds": [
      "phishing-and-social-engineering"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "HTTPS et vérification du domaine — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "69403a9d6f4f12d2cfdb974d14b34413f5acfce9d4e368cd431a2709d2ebd40d",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-https-verification.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-incident-response-after-infection",
    "conceptId": "secondary-privacy-incident-response-after-infection",
    "title": "Réagir à un appareil potentiellement compromis",
    "keywords": [
      "Réagir à un appareil potentiellement compromis",
      "Incident Response After Infection",
      "Réagir à un appareil potentiellement compromis — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy incident response after infection"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne infection suspectée impose de limiter la propagation et de ne plus saisir de secrets sur l’appareil. Les changements de mots de passe et la récupération doivent se faire depuis un environnement de confiance.\n\nExplication\n- Isoler l’appareil suspect du réseau limite certains échanges malveillants.\n- Révoquer les sessions et accès compromis depuis un autre appareil fiable.\n- Une réinstallation ou une restauration saine peut être nécessaire ; un antivirus ne garantit pas l’absence de compromission.\n- Distinguer la récupération d’un compte et celle d’un portefeuille dont les clés ont pu être copiées.\n\nLimites et confusions\nUn scan sans alerte ne prouve pas que l’appareil est sain. Une clé ou une phrase déjà divulguée reste compromise après nettoyage de l’ordinateur.",
    "parentIds": [
      "malware",
      "wallet-backup"
    ],
    "relatedIds": [
      "malware",
      "wallet-backup"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Réagir à un appareil potentiellement compromis — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "8b85e6723096ac3aafa6ee712f4617e979235a82fe2349e764e41dba4da5fd96",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-incident-response-after-infection.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-kyc-bitcoin-acquisition",
    "conceptId": "secondary-privacy-kyc-bitcoin-acquisition",
    "title": "Les traces laissées par un achat avec identification",
    "keywords": [
      "Les traces laissées par un achat avec identification",
      "KYC Bitcoin Acquisition",
      "Les traces laissées par un achat avec identification — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy kyc bitcoin acquisition"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’acquisition KYC de bitcoin passe par un service qui vérifie l’identité de l’utilisateur. Elle simplifie souvent l’achat fiat, mais crée un lien durable entre identité, historique d’achat et potentielle détention.\n\nExplication\n- Le KYC peut faciliter conformité, virements bancaires et volumes plus élevés.\n- Il crée des données sensibles exposées aux fuites, réquisitions ou usages commerciaux.\n- Retirer vers self-custody ne supprime pas l’historique KYC.\n- Séparer les UTXO KYC/non-KYC demande labels et coin control.\n\nLimites et confusions\nRetirer ses fonds ne supprime pas l’historique conservé par le service. Un achat sans collecte d’identité ne garantit pas non plus l’anonymat.",
    "parentIds": [
      "kyc-data-leakage",
      "utxo-labeling"
    ],
    "relatedIds": [
      "kyc-data-leakage",
      "utxo-labeling"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins",
      "PlanB min304 — Heat your home while mining bitcoins"
    ],
    "questions": [
      "Les traces laissées par un achat avec identification — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "16ca97ea33c6f7ecd12345250612ad620dfdb618c1dc3b3c0bfaa85258fd381d",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-kyc-bitcoin-acquisition.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-metadata-hygiene",
    "conceptId": "secondary-privacy-metadata-hygiene",
    "title": "Les métadonnées cachées dans les fichiers",
    "keywords": [
      "Les métadonnées cachées dans les fichiers",
      "Metadata Hygiene",
      "Quelles informations une photo ou un document peut-il révéler ?",
      "privacy",
      "secondary privacy metadata hygiene"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’hygiène des métadonnées consiste à identifier et supprimer les informations cachées dans fichiers, photos, documents ou communications : localisation, appareil, auteur, dates, logiciels et historique d’édition.\n\nExplication\n- Les photos peuvent contenir GPS, modèle d’appareil et timestamps.\n- Les documents peuvent révéler auteur, organisation, chemins locaux ou historique.\n- Nettoyer les métadonnées est important avant publication ou partage sensible.\n- La suppression doit être vérifiée, pas supposée.\n\nLimites et confusions\nEffacer les métadonnées ne supprime pas les indices visibles dans le contenu ni les copies déjà diffusées.",
    "parentIds": [
      "non-blockchain-privacy-leaks",
      "physical-security-for-bitcoiners"
    ],
    "relatedIds": [
      "non-blockchain-privacy-leaks",
      "physical-security-for-bitcoiners"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu202 — Improve Your Personal Digital Security"
    ],
    "questions": [
      "Quelles informations une photo ou un document peut-il révéler ?"
    ],
    "status": "reviewed",
    "sourceHash": "95c126b17e6d8ccc22e4630e266bfc426c8720a181f2af99d54bfcf356f5803b",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-metadata-hygiene.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-package-manager-security",
    "conceptId": "secondary-privacy-package-manager-security",
    "title": "La confiance dans les dépôts de logiciels",
    "keywords": [
      "La confiance dans les dépôts de logiciels",
      "Package Manager Security",
      "La confiance dans les dépôts de logiciels — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy package manager security"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa sécurité des gestionnaires de paquets concerne la manière dont un système installe et met à jour les logiciels depuis des dépôts, signatures et canaux de distribution. Elle influence l’intégrité de tout l’environnement.\n\nExplication\n- APT, Flatpak, Snap ou autres modèles ont des compromis différents.\n- Les dépôts officiels réduisent le risque de télécharger un faux logiciel.\n- Ajouter des dépôts tiers augmente la surface de confiance.\n- Les signatures et mises à jour automatiques jouent un rôle central.\n\nLimites et confusions\nUn dépôt réputé ou une signature réduit certains risques sans garantir la sûreté du code. Ajouter une source de paquets étend les acteurs auxquels on fait confiance.",
    "parentIds": [
      "software-download-hygiene",
      "software-updates"
    ],
    "relatedIds": [
      "software-download-hygiene",
      "software-updates"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu202 — Improve Your Personal Digital Security",
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "La confiance dans les dépôts de logiciels — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "66df40adda51dae7e9e94eb035bb747ef7660d701a117ea626cbbf4424d9560c",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-package-manager-security.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-passkeys",
    "conceptId": "secondary-privacy-passkeys",
    "title": "Les passkeys et leur récupération",
    "keywords": [
      "Les passkeys et leur récupération",
      "Passkeys",
      "Les passkeys et leur récupération — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy passkeys"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes passkeys remplacent le mot de passe par une paire de clés cryptographiques, souvent déverrouillée localement par biométrie ou PIN. Le service ne reçoit pas le secret privé.\n\nExplication\n- Réduisent phishing et réutilisation de mots de passe.\n- Dépendent de la disponibilité du fournisseur, de l’écosystème et de la récupération des appareils.\n- Peuvent être plus simples pour le grand public mais demandent une stratégie de backup.\n- S’inscrivent dans une tendance post-password.\n\nLimites et confusions\nLa récupération et la synchronisation dépendent du dispositif et du fournisseur. Une passkey d’authentification ne remplace pas une clé privée Bitcoin.",
    "parentIds": [
      "two-factor-authentication"
    ],
    "relatedIds": [
      "two-factor-authentication"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Les passkeys et leur récupération — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "57e42b1f22cd02f9b115348e2240cc50aa0240fd6691009cb031008a9de8e0b1",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-passkeys.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-principle-of-least-privilege",
    "conceptId": "secondary-privacy-principle-of-least-privilege",
    "title": "Limiter les droits des applications",
    "keywords": [
      "Limiter les droits des applications",
      "Principle of Least Privilege",
      "Limiter les droits des applications — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy principle of least privilege"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe principe du moindre privilège consiste à donner à chaque utilisateur, application ou service uniquement les permissions nécessaires à sa tâche. Il limite les dégâts lorsqu’un compte, logiciel ou processus est compromis.\n\nExplication\n- Éviter l’usage quotidien d’un compte administrateur réduit les risques.\n- Séparer les sessions ou profils limite la propagation d’un incident.\n- Les permissions applicatives doivent être revues régulièrement.\n- Le principe s’applique aux OS, smartphones, navigateurs, serveurs et réseaux.\n\nLimites et confusions\nLimiter les permissions réduit l’impact possible d’une compromission ; cela ne rend pas un logiciel hostile inoffensif ni une session administrateur impossible à attaquer.",
    "parentIds": [
      "threat-model",
      "malware"
    ],
    "relatedIds": [
      "threat-model",
      "malware"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu202 — Improve Your Personal Digital Security",
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Limiter les droits des applications — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "199013a83d4baa0d04795a2ff42992c7577b484faae4e747d65368ca302b693a",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-principle-of-least-privilege.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-private-browsing-mode",
    "conceptId": "secondary-privacy-private-browsing-mode",
    "title": "Les limites de la navigation privée",
    "keywords": [
      "Les limites de la navigation privée",
      "Private Browsing Mode",
      "Les limites de la navigation privée — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy private browsing mode"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe mode privé limite principalement les traces locales d’une session : historique, cookies persistants et formulaires. Il ne rend pas anonyme auprès du FAI, du site visité ou d’un réseau d’entreprise.\n\nExplication\n- Utile pour sessions temporaires, recherches ponctuelles ou éviter certains cookies persistants.\n- Ne masque pas l’adresse IP ni l’activité réseau.\n- Ne protège pas contre malware, phishing ou faux sites.\n- Doit être expliqué comme un outil de réduction de traces locales, pas comme Tor.\n\nLimites et confusions\nLe mode privé ne masque pas l’adresse IP. Les fichiers téléchargés et les traces conservées par les services ou le réseau ne disparaissent pas avec la fermeture de la fenêtre.",
    "parentIds": [
      "non-blockchain-privacy-leaks",
      "tor-browser"
    ],
    "relatedIds": [
      "non-blockchain-privacy-leaks",
      "tor-browser"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Les limites de la navigation privée — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "a589516cb54a9a0008435b09f25b9c5066ff333dbbff57c82ff2e5f7d9d52257",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-private-browsing-mode.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-public-wi-fi-risk",
    "conceptId": "secondary-privacy-public-wi-fi-risk",
    "title": "Les risques d’un réseau Wi-Fi non fiable",
    "keywords": [
      "Les risques d’un réseau Wi-Fi non fiable",
      "Public Wi-Fi Risk",
      "Les risques d’un réseau Wi-Fi non fiable — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy public wi fi risk"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nSur un réseau Wi-Fi non fiable, les faux points d’accès, portails captifs et services locaux exposés ajoutent des risques. Le risque dépend aussi du chiffrement des connexions et de la sécurité de l’appareil.\n\nExplication\n- Contrôler le domaine et utiliser une connexion HTTPS valide.\n- Éviter les installations de logiciels ou de certificats demandées par un portail douteux.\n- Désactiver le partage local inutile et les connexions automatiques non souhaitées.\n- Un VPN déplace une partie de la confiance vers son fournisseur ; il ne protège pas de toutes les attaques.\n\nLimites et confusions\nUn réseau mobile n’est pas une garantie de sécurité. HTTPS protège le transport vers le bon domaine, mais pas contre un site frauduleux ou un appareil compromis.",
    "parentIds": [
      "threat-model",
      "non-blockchain-privacy-leaks"
    ],
    "relatedIds": [
      "threat-model",
      "non-blockchain-privacy-leaks"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Les risques d’un réseau Wi-Fi non fiable — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "45d7de758de7c933c4f7202d6dd62e3ff210c787ba67c3cc7876816f08961464",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-public-wi-fi-risk.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-ransomware",
    "conceptId": "secondary-privacy-ransomware",
    "title": "Rançongiciels et limites des sauvegardes",
    "keywords": [
      "Rançongiciels et limites des sauvegardes",
      "Ransomware",
      "Rançongiciels et limites des sauvegardes — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy ransomware"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn rançongiciel bloque ou chiffre des données pour exiger une rançon. Une attaque peut aussi copier les données et menacer de les publier.\n\nExplication\n- Des sauvegardes séparées et testées limitent les pertes liées au chiffrement.\n- La synchronisation cloud peut répliquer des suppressions ou fichiers chiffrés.\n- Les mises à jour et la limitation des droits réduisent certains risques.\n- La restauration doit partir d’un environnement sain.\n\nLimites et confusions\nUne sauvegarde aide à restaurer les données, mais n’annule pas leur exfiltration ni une menace de divulgation. Payer ne garantit pas la récupération.",
    "parentIds": [
      "malware",
      "secure-backups"
    ],
    "relatedIds": [
      "malware",
      "secure-backups"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Rançongiciels et limites des sauvegardes — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "7f85744c5bb2318907cb8b48b94cbd9ed2d38f636f22e7427a1891a01b847ed0",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-ransomware.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-secure-email-account",
    "conceptId": "secondary-privacy-secure-email-account",
    "title": "Le rôle de l’email dans la récupération des comptes",
    "keywords": [
      "Le rôle de l’email dans la récupération des comptes",
      "Secure Email Account",
      "Le rôle de l’email dans la récupération des comptes — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy secure email account"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’adresse email sert souvent à récupérer d’autres comptes. Sa compromission peut donc donner accès à plusieurs services, même si leurs mots de passe sont différents.\n\nExplication\n- Employer un mot de passe unique et protéger les moyens de récupération.\n- Activer un facteur supplémentaire compatible avec le service.\n- Réexaminer les sessions ouvertes et les accès autorisés.\n- Distinguer les codes TOTP des clés de sécurité résistantes au phishing.\n\nLimites et confusions\nTOTP reste sensible au phishing en temps réel. Un moyen de récupération faible peut contourner une authentification forte.",
    "parentIds": [
      "two-factor-authentication",
      "phishing-and-social-engineering"
    ],
    "relatedIds": [
      "two-factor-authentication",
      "phishing-and-social-engineering"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Le rôle de l’email dans la récupération des comptes — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "cc10e20a4b1e69273ad2ffff4c4606700d85f91af9f45c7ffdc54b688c7f1a74",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-secure-email-account.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-single-sign-on-risk",
    "conceptId": "secondary-privacy-single-sign-on-risk",
    "title": "La dépendance à une connexion centralisée",
    "keywords": [
      "La dépendance à une connexion centralisée",
      "Single Sign-On Risk",
      "La dépendance à une connexion centralisée — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy single sign on risk"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe Single Sign-On simplifie l’accès via un fournisseur central, mais crée un point de dépendance et de censure : si le compte central tombe, de nombreux services deviennent vulnérables ou inaccessibles.\n\nExplication\n- Réduit le nombre de mots de passe mais concentre le risque.\n- La disponibilité et la politique du fournisseur deviennent critiques.\n- Pour services sensibles, évaluer comptes séparés, passkeys ou clés matérielles.\n- Éviter de lier toute son identité numérique à un seul acteur.\n\nLimites et confusions\nLa concentration des accès doit être comparée aux avantages possibles d’une authentification centralisée bien protégée. Des comptes séparés mal sécurisés ne sont pas automatiquement plus sûrs.",
    "parentIds": [
      "threat-model",
      "two-factor-authentication"
    ],
    "relatedIds": [
      "threat-model",
      "two-factor-authentication"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "La dépendance à une connexion centralisée — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "9d7dbdb5a2cdce20afd42a264b8885a65301989a560e8fefe95d401fd5ca11fd",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-single-sign-on-risk.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-strong-password",
    "conceptId": "secondary-privacy-strong-password",
    "title": "Robustesse et unicité des mots de passe",
    "keywords": [
      "Robustesse et unicité des mots de passe",
      "Strong Password",
      "Robustesse et unicité des mots de passe — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy strong password"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn mot de passe fort est long, unique, aléatoire et indépendant des informations personnelles. La longueur seule ne suffit pas si le schéma est prévisible.\n\nExplication\n- Utiliser un générateur de password manager pour les comptes ordinaires.\n- Éviter dates, noms, mots du dictionnaire et variations prévisibles.\n- Tenir compte des limites absurdes de certains sites sans réutiliser de schéma.\n- Le mot de passe maître demande une attention particulière et peut être une passphrase robuste.\n\nLimites et confusions\nUne phrase longue mais prévisible reste vulnérable. La robustesse du secret ne protège pas contre sa saisie sur un faux site ou sa capture par un logiciel malveillant.",
    "parentIds": [
      "password-manager"
    ],
    "relatedIds": [
      "password-manager"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Robustesse et unicité des mots de passe — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "7366d65ff79c395b3435a6be1923a07a7d5612b4af9f0189f5c4007e5438a3d6",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-strong-password.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-totp",
    "conceptId": "secondary-privacy-totp",
    "title": "Les codes d’authentification TOTP",
    "keywords": [
      "Les codes d’authentification TOTP",
      "TOTP",
      "Les codes d’authentification TOTP — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy totp"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nTOTP génère un code temporaire à partir d’un secret partagé et de l’heure. Le service calcule les codes attendus pour vérifier celui que présente l’utilisateur.\n\nExplication\n- Le code est généré localement, sans livraison par SMS.\n- La protection du secret TOTP et des moyens de récupération reste essentielle.\n- Un appareil d’authentification séparé peut limiter certaines expositions.\n- TOTP ne bénéficie pas de la liaison au site qu’offrent les authentifications FIDO correctement utilisées.\n\nLimites et confusions\nLe code TOTP peut être relayé par un site de phishing en temps réel. Sa sauvegarde doit être protégée ; une copie du secret permet de générer les mêmes codes.",
    "parentIds": [
      "two-factor-authentication"
    ],
    "relatedIds": [
      "two-factor-authentication"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Les codes d’authentification TOTP — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "9b2fa2cb39e7d5c5db687cb1538376cf360f60d602b61bf6685a2c9d90222ee4",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-totp.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-transaction-heuristics",
    "conceptId": "secondary-privacy-transaction-heuristics",
    "title": "Les indices utilisés par l’analyse de chaîne",
    "keywords": [
      "Les indices utilisés par l’analyse de chaîne",
      "Transaction Heuristics",
      "Une analyse de transaction prouve-t-elle qui possède les fonds ?",
      "privacy",
      "secondary privacy transaction heuristics"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes heuristiques de transaction sont des règles d’inférence utilisées pour interpréter une transaction Bitcoin : identifier le paiement, la monnaie rendue, les inputs liés, le type de wallet ou un comportement spécifique. Elles ne prouvent pas une identité, mais orientent l’analyse.\n\nExplication\n- Les heuristiques internes examinent montants, outputs, scripts, ordre, similarités et formes de transaction.\n- Les heuristiques externes exploitent données KYC, horaires, adresses réutilisées, informations publiques ou fuites.\n- Une heuristique peut être trompée par des transactions collaboratives ou des wallets qui évitent les patterns standards.\n- Plusieurs heuristiques combinées peuvent fortement réduire l’incertitude.\n\nLimites et confusions\nUne corrélation ou estimation d’appartenance n’est pas une preuve suffisante d’identité.",
    "parentIds": [
      "bitcoin-chain-analysis",
      "common-input-ownership-heuristic"
    ],
    "relatedIds": [
      "bitcoin-chain-analysis",
      "common-input-ownership-heuristic"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB btc204 — Privacy on Bitcoin"
    ],
    "questions": [
      "Une analyse de transaction prouve-t-elle qui possède les fonds ?"
    ],
    "status": "reviewed",
    "sourceHash": "53f7ac502e0d3eb6c38a86939940f7f33e4bceaf2609b7eea9137d7822a5bc02",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-transaction-heuristics.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-privacy-vpn",
    "conceptId": "secondary-privacy-vpn",
    "title": "Ce que protège un VPN",
    "keywords": [
      "Ce que protège un VPN",
      "VPN",
      "Ce que protège un VPN — quel mécanisme et quelles limites ?",
      "privacy",
      "secondary privacy vpn"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn VPN chiffre le trafic entre l’appareil et un fournisseur VPN, masquant certaines informations au réseau local ou au FAI mais déplaçant une partie de la confiance vers le fournisseur VPN.\n\nExplication\n- Un VPN ne rend pas anonyme par magie.\n- Il peut protéger sur réseaux Wi-Fi non fiables ou contourner certaines restrictions.\n- Le fournisseur VPN peut devenir un point d’observation central.\n- Pour Bitcoin, il doit être pensé avec Tor, nœud personnel et modèle de menace.\n\nLimites et confusions\nLe VPN protège le trajet jusqu’au fournisseur et déplace une partie de la confiance. Il ne supprime pas les liens créés par les comptes, les transactions ou un appareil compromis.",
    "parentIds": [
      "bitcoin-p2p-privacy",
      "tor-browser"
    ],
    "relatedIds": [
      "bitcoin-p2p-privacy",
      "tor-browser"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB scu202 — Improve Your Personal Digital Security",
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Ce que protège un VPN — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "9a48fce271811d7b0cf576b497353df2bfaf2d58264c2949f0ab5b7756dd13d7",
    "sourcePath": "data/alice-corpus/examples/secondary-privacy-vpn.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-secondary-stablecoins-algorithmic-stablecoin",
    "conceptId": "secondary-stablecoins-algorithmic-stablecoin",
    "title": "Les stablecoins algorithmiques",
    "keywords": [
      "Les stablecoins algorithmiques",
      "Algorithmic Stablecoin",
      "Les stablecoins algorithmiques — quel mécanisme et quelles limites ?",
      "stablecoins",
      "secondary stablecoins algorithmic stablecoin"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn stablecoin dit algorithmique vise une parité à l’aide de règles d’émission, de destruction ou d’incitations de marché plutôt que d’une simple réserve intégrale dans la devise visée.\n\nExplication\n- La parité dépend notamment de la liquidité et de la confiance dans le mécanisme.\n- Une baisse de confiance peut provoquer des réactions en chaîne et une perte de parité.\n- Il faut examiner le collatéral réel et les possibilités de sortie, pas seulement l’étiquette algorithmique.\n\nLimites et confusions\nLes mécanismes diffèrent entre modèles purement algorithmiques, crypto-collatéralisés et hybrides. Une règle d’émission ne garantit pas la valeur sur le marché.",
    "parentIds": [
      "bitcoin-vs-stablecoins",
      "stablecoin-reserve-risk"
    ],
    "relatedIds": [
      "bitcoin-vs-stablecoins",
      "stablecoin-reserve-risk"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Les stablecoins algorithmiques — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "24650bbb1a8161ddf54c03c3805a038fb2b4b61d1c020aeafe89c0e2dbc02984",
    "sourcePath": "data/alice-corpus/examples/secondary-stablecoins-algorithmic-stablecoin.fr.md",
    "theme": "stablecoins"
  },
  {
    "id": "curated-secondary-stablecoins-commodity-backed-stablecoin",
    "conceptId": "secondary-stablecoins-commodity-backed-stablecoin",
    "title": "Les jetons adossés à une marchandise",
    "keywords": [
      "Les jetons adossés à une marchandise",
      "Commodity-Backed Stablecoin",
      "Les jetons adossés à une marchandise — quel mécanisme et quelles limites ?",
      "stablecoins",
      "secondary stablecoins commodity backed stablecoin"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn stablecoin commodity-backed est adossé à une marchandise comme l’or, le pétrole ou un actif physique tokenisé.\n\nExplication\n- Il rend l’exposition à un actif physique plus portable et divisible.\n- Il dépend d’un dépositaire et de procédures de rédemption.\n- La liquidité du token peut différer de celle du sous-jacent.\n- XAUt illustre l’exposition or tokenisée.\n\nLimites et confusions\nUn jeton indexé sur l’or peut varier fortement en dollars. Il faut distinguer exposition au prix, droit de propriété et possibilité contractuelle de livraison ou de remboursement.",
    "parentIds": [
      "bitcoin-vs-stablecoins",
      "counterparty-risk"
    ],
    "relatedIds": [
      "bitcoin-vs-stablecoins",
      "counterparty-risk"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Les jetons adossés à une marchandise — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "b896765c968f25bc35d3cb2cf528b0c375689203a47a592ce910a30fd718cf52",
    "sourcePath": "data/alice-corpus/examples/secondary-stablecoins-commodity-backed-stablecoin.fr.md",
    "theme": "stablecoins"
  },
  {
    "id": "curated-secondary-stablecoins-criteres-de-risque-stablecoin",
    "conceptId": "secondary-stablecoins-criteres-de-risque-stablecoin",
    "title": "Lire les risques et les preuves d’un stablecoin",
    "keywords": [
      "Lire les risques et les preuves d’un stablecoin",
      "Critères de risque stablecoin",
      "Lire les risques et les preuves d’un stablecoin — quel mécanisme et quelles limites ?",
      "stablecoins",
      "secondary stablecoins criteres de risque stablecoin"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes critères de risque stablecoin permettent d'évaluer un stablecoin au-delà de son rendement ou de sa popularité : maintien du peg, qualité des réserves, transparence, audits, liquidité, mécanismes de rédemption, intégrations, cadre juridique et risque de censure. Les critères varient selon qu'il s'agit d'un stablecoin fiat-backed, crypto-collatéralisé ou algorithmique.\n\nExplication\n- Pour un fiat-backed, regarder réserves, liquidité, ségrégation des comptes, audits et capacité de rédemption.\n- Pour un crypto-backed, regarder surcollatéralisation, liquidations, oracle risk, gouvernance et profondeur de marché.\n- La centralisation peut améliorer la lisibilité réglementaire mais augmente le risque de gel ou de censure.\n- Un stablecoin doit être évalué selon l'usage : trading, DeFi, trésorerie, paiements, arbitrage ou exposition dollar.\n\nLimites et confusions\nUne attestation à une date donnée, un rapport de réserves et un audit complet n’ont pas le même périmètre. Aucun critère isolé ne garantit la parité ou l’accès au remboursement.",
    "parentIds": [
      "stablecoin-reserve-risk",
      "bitcoin-vs-stablecoins"
    ],
    "relatedIds": [
      "stablecoin-reserve-risk",
      "bitcoin-vs-stablecoins"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Lire les risques et les preuves d’un stablecoin — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "ccedcb4f3834a94cea532a51980fe9e33a29f175cf4944fbb2f136c53292c7d9",
    "sourcePath": "data/alice-corpus/examples/secondary-stablecoins-criteres-de-risque-stablecoin.fr.md",
    "theme": "stablecoins"
  },
  {
    "id": "curated-secondary-stablecoins-stablecoin-centralization-risk",
    "conceptId": "secondary-stablecoins-stablecoin-centralization-risk",
    "title": "Le pouvoir de l’émetteur d’un stablecoin",
    "keywords": [
      "Le pouvoir de l’émetteur d’un stablecoin",
      "Stablecoin Centralization Risk",
      "Le pouvoir de l’émetteur d’un stablecoin — quel mécanisme et quelles limites ?",
      "stablecoins",
      "secondary stablecoins stablecoin centralization risk"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe risque de centralisation stablecoin vient de l’émetteur, des réserves bancaires, des smart contracts, des blacklist functions, des exchanges et du cadre juridique.\n\nExplication\n- Un stablecoin centralisé peut être gelé ou censuré.\n- L’utilisateur dépend de l’émetteur pour rédemption et maintien du peg.\n- La conformité peut entrer en tension avec la résistance à la censure.\n- Ce risque est la principale différence avec Bitcoin.\n\nLimites et confusions\nLes pouvoirs de gel et conditions de remboursement varient selon le jeton et sa gouvernance. Le maintien de la parité n’efface pas le risque de censure.",
    "parentIds": [
      "financial-censorship",
      "stablecoin-reserve-risk"
    ],
    "relatedIds": [
      "financial-censorship",
      "stablecoin-reserve-risk"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Le pouvoir de l’émetteur d’un stablecoin — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "709f9acb5940d6b080af7daa9ab119f739b8818b09b4b0580b321655771a03d9",
    "sourcePath": "data/alice-corpus/examples/secondary-stablecoins-stablecoin-centralization-risk.fr.md",
    "theme": "stablecoins"
  },
  {
    "id": "curated-secondary-stablecoins-stablecoin-peg",
    "conceptId": "secondary-stablecoins-stablecoin-peg",
    "title": "La parité visée par un stablecoin",
    "keywords": [
      "La parité visée par un stablecoin",
      "Stablecoin Peg",
      "La parité visée par un stablecoin — quel mécanisme et quelles limites ?",
      "stablecoins",
      "secondary stablecoins stablecoin peg"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe peg d’un stablecoin est l’ancrage recherché à un actif de référence, par exemple 1 USD. Il dépend de la rédemption, des réserves, de l’arbitrage et de la confiance.\n\nExplication\n- Un peg peut casser temporairement ou durablement.\n- La profondeur de marché et la capacité de rédemption soutiennent le peg.\n- Le type de collatéral détermine la nature du risque.\n- Un peg stable en temps normal ne prouve pas la résilience en crise.\n\nLimites et confusions\nUn prix proche de la parité à un instant donné ne prouve ni la qualité des réserves ni la possibilité pour chaque détenteur de se faire rembourser directement.",
    "parentIds": [
      "bitcoin-vs-stablecoins",
      "stablecoin-reserve-risk"
    ],
    "relatedIds": [
      "bitcoin-vs-stablecoins",
      "stablecoin-reserve-risk"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "La parité visée par un stablecoin — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "e4e16a1145c991179a1cc61c70f1868396c5caf2ae2259a216081099caad49cf",
    "sourcePath": "data/alice-corpus/examples/secondary-stablecoins-stablecoin-peg.fr.md",
    "theme": "stablecoins"
  },
  {
    "id": "curated-secondary-stablecoins-stablecoin-use-cases",
    "conceptId": "secondary-stablecoins-stablecoin-use-cases",
    "title": "Les usages possibles des stablecoins",
    "keywords": [
      "Les usages possibles des stablecoins",
      "Stablecoin Use Cases",
      "Les usages possibles des stablecoins — quel mécanisme et quelles limites ?",
      "stablecoins",
      "secondary stablecoins stablecoin use cases"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes stablecoins peuvent servir à transférer une valeur exprimée dans une devise, à recevoir des paiements ou à conserver temporairement une unité de compte. Ils conservent les risques liés à leur émetteur ou à leur mécanisme de garantie.\n\nExplication\n- Un transfert international reste tributaire de l’accès aux points d’entrée et de sortie.\n- Une unité dollar numérique peut faciliter certains paiements sans supprimer le risque de change face aux dépenses locales.\n- Les paiements et la trésorerie sont des usages possibles, pas des recommandations de placement.\n\nLimites et confusions\nLes usages possibles ne prouvent pas une adoption mesurée ni une protection garantie. Coûts, accès à la conversion, droit applicable et risque de gel dépendent du contexte.",
    "parentIds": [
      "bitcoin-vs-stablecoins",
      "financial-inclusion"
    ],
    "relatedIds": [
      "bitcoin-vs-stablecoins",
      "financial-inclusion"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Les usages possibles des stablecoins — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "6913a65a4b906e62e5038643a13f41fbc417afa29da692623c0e6d4c263547e5",
    "sourcePath": "data/alice-corpus/examples/secondary-stablecoins-stablecoin-use-cases.fr.md",
    "theme": "stablecoins"
  },
  {
    "id": "curated-secondary-stablecoins-usdc-depeg-2023",
    "conceptId": "secondary-stablecoins-usdc-depeg-2023",
    "title": "L’épisode de perte de parité d’USDC en 2023",
    "keywords": [
      "L’épisode de perte de parité d’USDC en 2023",
      "USDC Depeg 2023",
      "L’épisode de perte de parité d’USDC en 2023 — quel mécanisme et quelles limites ?",
      "stablecoins",
      "secondary stablecoins usdc depeg 2023"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nEn mars 2023, USDC a temporairement perdu son peg après révélation d’une exposition de réserves à Silicon Valley Bank, avant de revenir vers 1 dollar après intervention publique.\n\nExplication\n- Montre qu’un stablecoin fiat-backed dépend aussi du système bancaire traditionnel.\n- Le marché price rapidement le risque de réserves.\n- L’intervention FDIC/Fed a limité la perte dans ce cas.\n- Un stablecoin réputé peut tout de même subir une crise de confiance.\n\nLimites et confusions\nIl s’agit d’un épisode historique de mars 2023, pas d’une description des réserves actuelles. Le retour à la parité dans ce cas ne garantit pas le résultat d’une future crise.",
    "parentIds": [
      "stablecoin-reserve-risk",
      "counterparty-risk"
    ],
    "relatedIds": [
      "stablecoin-reserve-risk",
      "counterparty-risk"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "L’épisode de perte de parité d’USDC en 2023 — quel mécanisme et quelles limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "c30609ee2fa0dac257bd2616483cc1168dcd5d33eda5328f01c1e911280d159b",
    "sourcePath": "data/alice-corpus/examples/secondary-stablecoins-usdc-depeg-2023.fr.md",
    "theme": "stablecoins"
  },
  {
    "id": "curated-secondary-tx-model-transaction-malleability",
    "conceptId": "secondary-tx-model-transaction-malleability",
    "title": "La malléabilité des transactions",
    "keywords": [
      "La malléabilité des transactions",
      "Transaction Malleability",
      "L’identifiant d’une transaction peut-il changer sans changer son paiement ?",
      "tx-model",
      "secondary tx model transaction malleability"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa malléabilité de transaction est la possibilité de modifier une transaction sans changer son effet économique mais en changeant son identifiant.\n\nExplication\n- Avec ECDSA legacy, certaines variantes de signature pouvaient rester valides.\n- Changer le txid casse les protocoles qui référencent des transactions non confirmées.\n- Les règles low-S et SegWit réduisent ou éliminent ces vecteurs majeurs.\n- La correction a ouvert la voie à Lightning.\n\nLimites et confusions\nLes garanties dépendent du format de transaction et des entrées ; ne pas promettre suppression de toute malléabilité.",
    "parentIds": [
      "segwit-address",
      "lightning-network"
    ],
    "relatedIds": [
      "segwit-address",
      "lightning-network"
    ],
    "reviewMethod": "semantic_light",
    "sources": [
      "PlanB pro202 — Programming Bitcoin"
    ],
    "questions": [
      "L’identifiant d’une transaction peut-il changer sans changer son paiement ?"
    ],
    "status": "reviewed",
    "sourceHash": "cbadb26095fa3b9aeec829460ea582d52e845472aaec1d4601911d73e83dff63",
    "sourcePath": "data/alice-corpus/examples/secondary-tx-model-transaction-malleability.fr.md",
    "theme": "tx-model"
  },
  {
    "id": "curated-secure-backups",
    "conceptId": "secure-backups",
    "title": "Les risques qui menacent une sauvegarde",
    "keywords": [
      "Les risques qui menacent une sauvegarde",
      "Secure Backups",
      "Comment penser perte, vol et destruction d’une sauvegarde ?",
      "security",
      "secure backups"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne sauvegarde utile doit résister à la perte de l’original tout en restant récupérable par les bonnes personnes. Pour Bitcoin, elle doit aussi éviter d’exposer les secrets qui autorisent une dépense.\n\nExplication\nLa synchronisation propage les changements ; elle peut aussi propager une suppression ou une erreur. Un historique sur le même disque ne protège pas de la perte de ce disque. Une copie indépendante et une restauration vérifiée répondent à des besoins différents.\n\nLe contenu à protéger dépend du portefeuille. Il peut inclure des mots, une passphrase, des descripteurs et une procédure de récupération. Séparer les copies peut limiter un sinistre commun, mais multiplier les secrets accessibles crée aussi des points d’exposition.\n\nLimites et confusions\nUne règle générale de sauvegarde informatique ne s’applique pas mécaniquement aux clés Bitcoin. Le chiffrement ajoute son propre secret à préserver. Une empreinte correcte ne prouve pas qu’une restauration complète est possible. La meilleure organisation est celle dont les risques de perte, de vol et d’incompréhension ont été explicitement envisagés.",
    "parentIds": [],
    "relatedIds": [
      "wallet-backup",
      "wallet-backup-test",
      "bitcoin-inheritance-plan",
      "secondary-privacy-backup-3-2-1-method",
      "secondary-privacy-file-encryption",
      "secondary-privacy-ransomware"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB scu202 et scu101, sécurité numérique et sauvegardes"
    ],
    "questions": [
      "Comment penser perte, vol et destruction d’une sauvegarde ?"
    ],
    "status": "reviewed",
    "sourceHash": "073b433c2649f8e4fd509b72dad0d44fac379c67e7aa7a909263b5996bb26f6d",
    "sourcePath": "data/alice-corpus/examples/secure-backups.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-segwit-address",
    "conceptId": "segwit-address",
    "title": "Les adresses bc1q",
    "keywords": [
      "Les adresses bc1q",
      "SegWit Address",
      "Qu’est-ce qu’une adresse SegWit ?",
      "transactions",
      "segwit address"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nSur le réseau principal, les adresses qui commencent par bc1q correspondent à SegWit version 0 et utilisent l’encodage Bech32. Elles se distinguent notamment des adresses Taproot qui commencent par bc1p.\n\nExplication\nSegWit sépare certaines données de signature et modifie leur contribution au poids de la transaction. Certaines dépenses deviennent ainsi plus économes en espace et en frais à taux égal. Le format Bech32 fournit aussi une détection d’erreurs de saisie.\n\nIl faut distinguer le format de réception et le portefeuille qui le gère. Restaurer les bonnes clés avec un mauvais type d’adresse ou un mauvais chemin de dérivation peut empêcher un logiciel de retrouver les fonds attendus.\n\nLimites et confusions\nLe préfixe dépend du réseau ; bc concerne le réseau principal. Une adresse bc1q ne garantit ni anonymat ni frais toujours minimaux. Le contrôle d’erreur ne permet pas de corriger au hasard une adresse destinée à un paiement.",
    "parentIds": [],
    "relatedIds": [
      "legacy-address",
      "taproot",
      "bitcoin-address-scripts",
      "secondary-tx-model-transaction-malleability"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture",
      "PlanB Extraction — 2026-05-24 — Glossary"
    ],
    "questions": [
      "Qu’est-ce qu’une adresse SegWit ?"
    ],
    "status": "reviewed",
    "sourceHash": "cb93ecf1dd2a9be049565ae85be97f93c7409f19fb617e68952f6d2b126877da",
    "sourcePath": "data/alice-corpus/examples/segwit-address.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-self-custody",
    "conceptId": "self-custody",
    "title": "La garde personnelle des clés",
    "keywords": [
      "La garde personnelle des clés",
      "Self-Custody",
      "Que signifie détenir soi-même ses bitcoins ?",
      "wallets",
      "self custody"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa garde personnelle consiste à contrôler les moyens nécessaires pour dépenser ses bitcoins sans l’autorisation d’un dépositaire. Elle donne de l’autonomie et transfère la responsabilité de la sauvegarde et de la récupération.\n\nExplication\nDans une configuration simple, le détenteur contrôle les clés de signature. Dans une configuration plus élaborée, plusieurs clés ou conditions peuvent être nécessaires. La question utile est de savoir qui peut autoriser, empêcher ou récupérer la dépense.\n\nLa conservation d’une sauvegarde, sa compatibilité avec le portefeuille et sa disponibilité future comptent autant que le fonctionnement quotidien de l’application. La transmission à des proches est aussi un problème distinct de la protection contre le vol.\n\nLimites et confusions\nPosséder ses clés ne signifie pas vérifier la chaîne soi-même ni éliminer les risques de matériel ou de logiciel. Une configuration plus complexe peut diminuer la sécurité si elle devient incompréhensible. Les services non custodial peuvent également introduire des dépendances selon leur protocole. Il faut examiner les conditions réelles de sortie et de récupération.",
    "parentIds": [],
    "relatedIds": [
      "wallet-backup",
      "wallet-backup-test",
      "bitcoin-inheritance-plan",
      "fedimint-custody-and-privacy",
      "secondary-bitcoin-casascius-physical-bitcoins",
      "secondary-politics-bitcoin-self-custody-under-censorship",
      "spark-trust-and-exits"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc202 — Setting up your first Bitcoin node",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Que signifie détenir soi-même ses bitcoins ?"
    ],
    "status": "reviewed",
    "sourceHash": "aeb13a7fb01403954dd2236acdfedc877ad04087ef60f9a72fc2356cf3ebcdfd",
    "sourcePath": "data/alice-corpus/examples/self-custody.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-sidechains",
    "conceptId": "sidechains",
    "title": "Les chaînes latérales",
    "keywords": [
      "Les chaînes latérales",
      "Sidechains",
      "Qu’est-ce qu’une sidechain ?",
      "Ark et autres couches",
      "sidechains"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne sidechain est une chaîne distincte reliée à Bitcoin par un mécanisme d’ancrage ou de conversion. Elle possède ses propres règles et ne conserve pas automatiquement toutes les garanties de Bitcoin.\n\nExplication\nPour un actif adossé au BTC, un mécanisme de peg organise généralement le verrouillage de bitcoins et la représentation de leur quantité sur la chaîne séparée. Le trajet inverse doit permettre la restitution selon les conditions du système. La sécurité dépend donc à la fois de la sidechain et de ce passage.\n\nUne fédération peut participer à la production des blocs ou au contrôle des fonds. D’autres architectures proposent des mécanismes différents. Les fonctions ajoutées, comme des actifs ou certaines formes de confidentialité, doivent être évaluées avec ces hypothèses supplémentaires.\n\nLimites et confusions\nUn objectif d’adossement 1:1 ne garantit ni un cours égal en permanence ni un retrait immédiat. Il faut examiner les réserves, les acteurs autorisés et les possibilités d’interruption. Tous les actifs émis sur une sidechain ne sont pas adossés au bitcoin.\n\nL’existence d’une proposition technique ou d’un BIP ne démontre pas son adoption par le réseau. Une sidechain, un canal Lightning et un service custodial ne doivent pas être présentés comme équivalents.",
    "parentIds": [],
    "relatedIds": [
      "liquid-network",
      "bitcoin-layered-architecture",
      "secondary-bitcoin-merged-mining"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://docs.liquid.net/docs/technical-overview"
    ],
    "questions": [
      "Qu’est-ce qu’une sidechain ?"
    ],
    "status": "reviewed",
    "sourceHash": "a011d2083684cb4d78c9c4328395f4d12fb8b878867b6ca96beaddc4090c0d51",
    "sourcePath": "data/alice-corpus/examples/sidechains.fr.md",
    "theme": "Ark et autres couches"
  },
  {
    "id": "curated-silent-payments",
    "conceptId": "silent-payments",
    "title": "Comprendre les Silent Payments",
    "keywords": [
      "Comprendre les Silent Payments",
      "Silent Payments",
      "À quoi sert une adresse de paiement silencieux ?",
      "privacy",
      "silent payments"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes Silent Payments permettent de publier une instruction de réception réutilisable tout en obtenant des sorties on-chain différentes selon les paiements. Le mécanisme réduit le lien visible avec une adresse de réception statique.\n\nExplication\nLe payeur utilise des informations du destinataire et des données liées aux entrées pour construire la destination du paiement. Le destinataire doit ensuite détecter ses sorties en examinant les données nécessaires de la chaîne. Le protocole distingue notamment les besoins de scan et de dépense.\n\nCette organisation peut être utile pour une réception publique répétée. Elle n’exige pas une transaction de notification dédiée et utilise des sorties Taproot. Elle ajoute cependant du travail de détection et des contraintes de logiciel.\n\nLimites et confusions\nLe statut de la spécification BIP352 ne prouve pas que chaque portefeuille sait envoyer, recevoir et restaurer ces paiements. Ces fonctions doivent être vérifiées séparément. Les montants restent publics et d’autres liens peuvent exister. Les limites des transactions collaboratives et les détails de scan relèvent d’un approfondissement adapté au logiciel.",
    "parentIds": [],
    "relatedIds": [
      "address-reuse",
      "taproot",
      "bitcoin-pseudonymity",
      "secondary-privacy-bip47-reusable-payment-codes"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki"
    ],
    "questions": [
      "À quoi sert une adresse de paiement silencieux ?"
    ],
    "status": "reviewed",
    "sourceHash": "23b49e531cb144faf0837669200f6e9fb258376778bf2cc222096a7077fb25d5",
    "sourcePath": "data/alice-corpus/examples/silent-payments.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-sim-swap",
    "conceptId": "sim-swap",
    "title": "Le détournement de carte SIM",
    "keywords": [
      "Le détournement de carte SIM",
      "SIM Swap",
      "Pourquoi les codes par SMS ont-ils des limites ?",
      "security",
      "sim swap"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe SIM swap détourne un numéro de téléphone vers une carte ou un accès contrôlé par l’attaquant. Celui-ci peut alors recevoir des SMS et des appels destinés à la victime.\n\nExplication\nUn service qui utilise le SMS pour se connecter ou récupérer un compte dépend ainsi de la maîtrise du numéro. Le détournement peut permettre à l’attaquant de franchir cette étape, même sans posséder le téléphone habituel.\n\nIl faut donc distinguer possession du numéro, possession de l’appareil et identité réelle. Les codes d’une application locale ou certaines clés d’authentification réduisent la dépendance au circuit téléphonique, sous réserve de la configuration du compte et de sa récupération.\n\nLimites et confusions\nChanger le facteur habituel ne suffit pas si le SMS reste une voie de secours permettant de reprendre le compte. Une perte de réseau n’est pas, à elle seule, une preuve de SIM swap. Cette attaque ne donne pas automatiquement accès à une phrase Bitcoin conservée séparément, mais peut compromettre des services et informations utilisés autour du portefeuille.",
    "parentIds": [],
    "relatedIds": [
      "two-factor-authentication",
      "exchange-custody-risk",
      "threat-model"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Pourquoi les codes par SMS ont-ils des limites ?"
    ],
    "status": "reviewed",
    "sourceHash": "969c184cf8acf9a1d3d07a6b27b25b95d4c651130509a9bc0d709d3b39ef1c3c",
    "sourcePath": "data/alice-corpus/examples/sim-swap.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-soft-fork",
    "conceptId": "soft-fork",
    "title": "Les soft forks",
    "keywords": [
      "Les soft forks",
      "Soft Fork",
      "Qu’est-ce qu’un soft fork ?",
      "Histoire et évolution du protocole",
      "soft fork"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn soft fork resserre les règles de validité. Les blocs conformes aux nouvelles restrictions restent acceptables selon les anciennes règles, mais les anciens nœuds ne vérifient pas eux-mêmes ces restrictions supplémentaires.\n\nExplication\nOn peut le comprendre comme une réduction de l’ensemble des blocs autorisés. Un nœud mis à jour peut rejeter un bloc qu’un ancien nœud jugerait encore valide. C’est la raison pour laquelle la compatibilité doit être décrite par le comportement des nœuds, plutôt que par une promesse vague de mise à jour sans risque.\n\nL’activation demande une coordination et un mécanisme définis. Certains dispositifs utilisent un signalement des mineurs, mais ce signalement ne met pas automatiquement tous les utilisateurs à jour et ne constitue pas l’unique voie possible.\n\nLimites et confusions\nLa compatibilité n’empêche pas toute scission si les restrictions ne sont pas appliquées de manière cohérente. Un ancien nœud peut suivre des blocs sans vérifier toutes les nouvelles conditions.\n\nUne proposition de soft fork n’est pas une activation. Il faut distinguer le texte, le code qui implémente la règle, les paramètres de déploiement et ce qui est effectivement appliqué sur le réseau. Le terme ne garantit pas non plus qu’une modification soit souhaitable.",
    "parentIds": [],
    "relatedIds": [
      "hard-fork",
      "bitcoin-improvement-proposal",
      "secondary-bitcoin-bitcoin-covenants",
      "secondary-governance-taproot-activation"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://developer.bitcoin.org/devguide/block_chain.html#consensus-rule-changes",
      "https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0008.mediawiki"
    ],
    "questions": [
      "Qu’est-ce qu’un soft fork ?"
    ],
    "status": "reviewed",
    "sourceHash": "1bde008429d349746463c8eaf0e966fc396cb9e2fb7f50111d36d1573f62ff10",
    "sourcePath": "data/alice-corpus/examples/soft-fork.fr.md",
    "theme": "Histoire et évolution du protocole"
  },
  {
    "id": "curated-software-download-hygiene",
    "conceptId": "software-download-hygiene",
    "title": "Télécharger le bon logiciel",
    "keywords": [
      "Télécharger le bon logiciel",
      "Software Download Hygiene",
      "Comment éviter une fausse application ?",
      "security",
      "software download hygiene"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’hygiène de téléchargement vise à obtenir le véritable logiciel depuis une origine identifiée. Un faux portefeuille peut voler des secrets ou présenter une destination différente de celle attendue.\n\nExplication\nLe domaine du projet, son canal de distribution et l’identité de l’éditeur doivent être vérifiés. Un résultat sponsorisé, un miroir générique ou un lien reçu par message ne prouve pas l’origine officielle. Les versions piratées ajoutent un risque de modification et de maintenance absente.\n\nPour les outils sensibles, le projet peut publier des empreintes ou des signatures. Ces éléments permettent des vérifications complémentaires, à condition de connaître la bonne référence et la clé de signature attendue.\n\nLimites et confusions\nUn magasin d’applications n’exclut pas toute imitation. Open source signifie que du code est accessible, pas que chaque fichier téléchargé correspond nécessairement à ce code ni qu’il est exempt de faille. Une adresse HTTPS protège la connexion au site visité ; elle ne certifie pas que ce site appartient au projet recherché.",
    "parentIds": [],
    "relatedIds": [
      "software-integrity-verification",
      "phishing-and-social-engineering",
      "software-updates",
      "secondary-privacy-package-manager-security"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Comment éviter une fausse application ?"
    ],
    "status": "reviewed",
    "sourceHash": "d7cc2b0773af2c45fb037bbdde98d207badb4bd7acbf42e90489ceed4f8a3075",
    "sourcePath": "data/alice-corpus/examples/software-download-hygiene.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-software-integrity-verification",
    "conceptId": "software-integrity-verification",
    "title": "Vérifier un téléchargement",
    "keywords": [
      "Vérifier un téléchargement",
      "Software Integrity Verification",
      "PGP Signature Verification",
      "À quoi servent une empreinte et une signature de logiciel ?",
      "security",
      "software integrity verification"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne empreinte aide à vérifier qu’un fichier correspond à une référence. Une signature aide à vérifier qu’une clé donnée a signé ce fichier ou son empreinte. Ce sont des contrôles différents.\n\nExplication\nSi le fichier est modifié, son empreinte doit changer. Mais un attaquant qui remplace à la fois le fichier et l’empreinte sur une fausse page peut rendre cette comparaison trompeuse. La référence doit donc provenir d’une origine fiable.\n\nUne signature ajoute un lien cryptographique avec une clé. Il faut encore établir que cette clé appartient bien à l’éditeur attendu. Vérifier seulement qu’une signature quelconque est correcte ne résout pas ce problème d’identité.\n\nLimites et confusions\nUn fichier authentique peut contenir des défauts. La vérification d’origine ne constitue pas un audit du programme et ne garantit pas que le système qui l’exécute est sain. Les procédures exactes varient selon le projet et la plateforme. Cette fiche explique leur utilité ; elle ne fournit pas de commande universelle applicable à tous les téléchargements.",
    "parentIds": [],
    "relatedIds": [
      "software-download-hygiene",
      "bitcoin-core",
      "malware",
      "secondary-bitcoin-kerckhoffs-principle",
      "secondary-bitcoin-message-integrity",
      "secondary-bitcoin-open-source-security-review"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB scu202 — Improve Your Personal Digital Security",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "À quoi servent une empreinte et une signature de logiciel ?"
    ],
    "status": "reviewed",
    "sourceHash": "d6e07cf8a8ad87edd63dc0bcc7e03f7eee850688317032144d74392fcb6dcf12",
    "sourcePath": "data/alice-corpus/examples/software-integrity-verification.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-software-updates",
    "conceptId": "software-updates",
    "title": "Comprendre les mises à jour",
    "keywords": [
      "Comprendre les mises à jour",
      "Software Updates",
      "Pourquoi mettre à jour ses logiciels ?",
      "security",
      "software updates"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes mises à jour peuvent corriger des failles, des erreurs et des problèmes de compatibilité. Laisser indéfiniment un logiciel exposé avec des vulnérabilités connues augmente les risques.\n\nExplication\nLa maintenance concerne le système, le navigateur, les applications, les extensions et parfois le logiciel interne des appareils. Une mise à jour doit provenir d’un canal authentique ; une fenêtre ou un message alarmant n’en est pas une preuve.\n\nPour un portefeuille, les informations de sauvegarde et de récupération doivent rester connues avant une opération de maintenance. Lire les changements utiles permet de comprendre s’ils touchent la compatibilité ou le format des données.\n\nLimites et confusions\nUne nouvelle version n’est pas infaillible et tous les changements n’ont pas la même urgence. La bonne approche dépend du contexte du logiciel, de ses correctifs et des indications vérifiées du projet. Les mises à jour de Bitcoin Core ne signifient pas automatiquement que les règles monétaires changent ni que tous les utilisateurs sont forcés de les adopter.",
    "parentIds": [],
    "relatedIds": [
      "software-download-hygiene",
      "software-integrity-verification",
      "wallet-backup",
      "secondary-opsec-digital-hygiene",
      "secondary-privacy-package-manager-security"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB scu202 — Improve Your Personal Digital Security",
      "PlanB Extraction — 2026-05-23 — scu101"
    ],
    "questions": [
      "Pourquoi mettre à jour ses logiciels ?"
    ],
    "status": "reviewed",
    "sourceHash": "14438b618b44f8893c373c65bbf76c9296c51ca61a47bf9ac2f20c87f4de5498",
    "sourcePath": "data/alice-corpus/examples/software-updates.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-solo-bitcoin-mining",
    "conceptId": "solo-bitcoin-mining",
    "title": "Le minage en solo",
    "keywords": [
      "Le minage en solo",
      "Solo Bitcoin Mining",
      "Que signifie miner seul ?",
      "Minage et énergie",
      "solo bitcoin mining"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nEn minage solo, le mineur qui trouve le bloc reçoit son revenu au lieu de le partager avec les participants d’un pool classique. Pour une petite machine, les gains sont très rares et irréguliers.\n\nExplication\nLa probabilité de trouver un bloc dépend de la part du hashrate détenue. Avec une part fictive et constante de 0,0001 %, la probabilité de trouver le prochain bloc est d’environ 1 sur 1 000 000. Une longue période sans succès n’oblige pas le prochain essai à réussir.\n\nUn service de solo mining peut fournir l’infrastructure technique et prendre des frais, tout en laissant le revenu du bloc au seul mineur gagnant. « Solo » décrit alors la répartition du revenu ; cela ne signifie pas forcément que chaque composant est auto-hébergé.\n\nLimites et confusions\nÀ puissance identique et hors frais, le solo augmente surtout la variance des revenus par rapport à leur mutualisation. Un succès exceptionnel ne décrit pas une rentabilité typique.\n\nParticiper par intérêt technique, pour apprendre ou pour disperser le matériel est un objectif différent de rechercher un revenu régulier. Le coût électrique et le matériel restent à payer même si aucun bloc n’est trouvé.",
    "parentIds": [],
    "relatedIds": [
      "mining-pool",
      "mining-profitability",
      "secondary-bitcoin-bitaxe",
      "secondary-bitcoin-home-bitcoin-mining",
      "secondary-bitcoin-mining-variance"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://developer.bitcoin.org/devguide/mining.html"
    ],
    "questions": [
      "Que signifie miner seul ?"
    ],
    "status": "reviewed",
    "sourceHash": "e67dcccf669d54838557b0455bb5ac8097ee7272e1d75996e9678f13fd94a843",
    "sourcePath": "data/alice-corpus/examples/solo-bitcoin-mining.fr.md",
    "theme": "Minage et énergie"
  },
  {
    "id": "curated-spark-trust-and-exits",
    "conceptId": "spark-trust-and-exits",
    "title": "Spark, opérateurs et sorties vers Bitcoin",
    "keywords": [
      "Spark, opérateurs et sorties vers Bitcoin",
      "Spark",
      "statechains",
      "Spark operators",
      "Que détient-on lorsqu’on utilise Spark ?",
      "À quoi servent les opérateurs et peut-on sortir sans eux ?",
      "Pourquoi avoir une clé ne suffit-il pas à décrire toutes les garanties ?",
      "bitcoin-layers",
      "custody",
      "spark trust and exits"
    ],
    "level": "beginner",
    "tier": "secondary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nSpark organise des transferts hors chaîne de droits sur des fonds liés à Bitcoin, avec une clé utilisateur et la participation d’opérateurs. Il simplifie certains paiements, mais ses garanties dépendent aussi du protocole de transfert et des données nécessaires à la sortie.\n\nExplication\nLe modèle s’appuie sur des structures de transactions et des mises à jour de clés entre propriétaires successifs. L’utilisateur ne publie pas chaque transfert sur Bitcoin. Les opérateurs participent aux signatures et au changement d’état.\n\nLa documentation décrit une hypothèse d’honnêteté au moment du transfert, liée à l’effacement d’anciens secrets par au moins 1 opérateur, ou le seuil exigé par la configuration. La détention d’une clé utilisateur ne supprime pas cette hypothèse.\n\nUne sortie coopérative utilise la participation de l’opérateur. Une sortie unilatérale utilise des transactions pré-signées, des confirmations et des délais. Elle demande les bonnes données et entraîne des frais Bitcoin. L’existence d’un chemin de sortie ne démontre pas que chaque wallet le rend aussi simple à utiliser.\n\nLimites et confusions\nL’article de Marius sur Offchain Media fournit le contexte et une lecture critique. Les mécanismes sont recoupés avec la documentation du projet, consultée le 2026-10-11. Il ne s’agit pas d’un audit indépendant ni d’un essai de récupération.\n\nUn paiement Spark, une facture Lightning payée depuis un service compatible et une transaction Bitcoin sont des opérations différentes. Aucun wallet particulier n’est recommandé ; son support et ses procédures doivent être vérifiés séparément.",
    "parentIds": [
      "bitcoin-layered-architecture",
      "self-custody"
    ],
    "relatedIds": [
      "ark-implementations-bark-arkade",
      "fedimint-custody-and-privacy",
      "alice-explorer"
    ],
    "reviewMethod": "targeted_source_review_and_corrections",
    "sources": [
      "https://offchain.media/article/what-is-spark-bitcoin/",
      "https://docs.spark.money/learn/trust-model",
      "https://docs.spark.money/learn/withdrawals",
      "https://docs.spark.money/learn/core-concepts"
    ],
    "questions": [
      "Que détient-on lorsqu’on utilise Spark ?",
      "À quoi servent les opérateurs et peut-on sortir sans eux ?",
      "Pourquoi avoir une clé ne suffit-il pas à décrire toutes les garanties ?"
    ],
    "status": "reviewed",
    "sourceHash": "e8906be39bbb7d1c92e7b28895ddcee10545d03c51cc9a74758ed31dc21364c5",
    "sourcePath": "data/alice-corpus/examples/spark-trust-and-exits.fr.md",
    "theme": "bitcoin-layers"
  },
  {
    "id": "curated-spv-node",
    "conceptId": "spv-node",
    "title": "La vérification légère",
    "keywords": [
      "La vérification légère",
      "SPV Node",
      "Que vérifie un client léger ?",
      "nodes",
      "spv node"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn client SPV effectue une vérification légère à partir des en-têtes de blocs et de preuves d’inclusion. Il ne vérifie pas toutes les transactions et toutes les règles comme un nœud complet.\n\nExplication\nLe client peut contrôler le travail représenté par les en-têtes et une preuve reliant une transaction à un bloc. Il compare les chaînes qu’il connaît selon leur travail cumulé. Cela réduit les ressources nécessaires par rapport au traitement de tous les blocs.\n\nLa preuve montre une inclusion dans le bloc concerné. Elle ne démontre pas à elle seule que chaque dépense et chaque règle monétaire de tout cet historique ont été vérifiées par le client.\n\nLimites et confusions\nLa vue du client dépend des pairs ou serveurs auxquels il accède. Il faut distinguer moins de données téléchargées et mêmes garanties de validation. Les effets de confidentialité dépendent aussi de la manière dont les transactions sont demandées. Un nœud élagué n’est pas un client SPV ; il peut conserver moins d’historique tout en effectuant la validation complète.",
    "parentIds": [],
    "relatedIds": [
      "full-node",
      "pruned-node",
      "wallet-node-connection",
      "secondary-bitcoin-compact-block-filters",
      "secondary-bitcoin-merkle-proof"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://bitcoin.org/bitcoin.pdf",
      "https://developer.bitcoin.org/devguide/operating_modes.html"
    ],
    "questions": [
      "Que vérifie un client léger ?"
    ],
    "status": "reviewed",
    "sourceHash": "c4e07bea0ec363d1b3b4d5ceae2dc86f09bf46dc7a77f769ddbd23c2ac102483",
    "sourcePath": "data/alice-corpus/examples/spv-node.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-stablecoin-reserve-risk",
    "conceptId": "stablecoin-reserve-risk",
    "title": "Les réserves des stablecoins",
    "keywords": [
      "Les réserves des stablecoins",
      "Stablecoin Reserve Risk",
      "Fiat-Backed Stablecoin",
      "Quelles promesses soutiennent un stablecoin adossé à des réserves ?",
      "Usages et comparaisons",
      "stablecoin reserve risk"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nPour un stablecoin adossé à des réserves, la question centrale est de savoir quels actifs existent, où ils sont conservés et dans quelles conditions ils peuvent financer les demandes de conversion.\n\nExplication\nLa qualité et la liquidité des réserves comptent autant que leur valeur affichée. Du cash, des dépôts bancaires, des titres ou des prêts ne sont pas mobilisables de la même manière. Les banques et dépositaires ajoutent aussi des dépendances.\n\nIl faut examiner la séparation des actifs, les engagements de l’émetteur et les droits des détenteurs. Qui peut demander une conversion directe ? Sous quelles conditions et avec quels délais ? Un détenteur peut parfois dépendre surtout du marché secondaire plutôt que d’un accès direct au remboursement.\n\nLimites et confusions\nUne attestation ponctuelle ne couvre pas nécessairement le même périmètre qu’un audit complet. La date, les méthodes et les engagements inclus doivent être explicités. Une déclaration de réserves ne garantit pas leur disponibilité immédiate dans toute crise.\n\nCette grille ne donne pas le bilan actuel d’un émetteur particulier. Pour une comparaison concrète, consulter ses documents les plus récents et distinguer ses déclarations d’une vérification indépendante. Le cours proche de la cible ne prouve pas à lui seul la solidité de l’adossement.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-vs-stablecoins",
      "counterparty-risk",
      "secondary-stablecoins-algorithmic-stablecoin",
      "secondary-stablecoins-criteres-de-risque-stablecoin",
      "secondary-stablecoins-stablecoin-centralization-risk",
      "secondary-stablecoins-stablecoin-peg",
      "secondary-stablecoins-usdc-depeg-2023"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin"
    ],
    "questions": [
      "Quelles promesses soutiennent un stablecoin adossé à des réserves ?"
    ],
    "status": "reviewed",
    "sourceHash": "fba695840f31a458a622415cd90a1e9138c8ccd40affc5aac7e4df7ba75cd29b",
    "sourcePath": "data/alice-corpus/examples/stablecoin-reserve-risk.fr.md",
    "theme": "Usages et comparaisons"
  },
  {
    "id": "curated-store-of-value",
    "conceptId": "store-of-value",
    "title": "La réserve de valeur",
    "keywords": [
      "La réserve de valeur",
      "Store of Value",
      "Que signifie conserver du pouvoir d’achat ?",
      "Monnaie et économie",
      "store of value"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne réserve de valeur permet de reporter du pouvoir d’achat dans le temps. Sa qualité dépend de la durée considérée, de la demande, de la liquidité et des risques de conservation.\n\nExplication\nConserver une quantité d’unités ne garantit pas de pouvoir acheter la même chose plus tard. L’inflation peut réduire le pouvoir d’achat d’une monnaie ; une variation du prix peut modifier celui d’un actif. Les coûts de stockage ou de garde peuvent aussi compter.\n\nLes partisans de Bitcoin mettent en avant son émission limitée et sa vérifiabilité. Ces propriétés sont distinctes de l’évolution de son cours. Elles peuvent nourrir une thèse monétaire sans prouver que chaque détenteur préservera son pouvoir d’achat sur toute période.\n\nLimites et confusions\nUne offre rare n’impose pas un prix. La demande peut changer, et une forte volatilité peut rendre les besoins de court terme difficiles à financer. Un horizon long ne garantit pas la récupération après une baisse.\n\nUn stablecoin peut chercher à maintenir sa valeur dans une monnaie de référence tout en héritant de son inflation et du risque de l’émetteur. Alice doit expliquer ces dimensions sans en déduire une recommandation personnelle de placement.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-volatility",
      "money-functions",
      "secondary-economics-marginal-utility",
      "secondary-economics-monetary-premium",
      "secondary-economics-sound-money",
      "secondary-economics-subjective-theory-of-value",
      "secondary-economics-time-preference"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Que signifie conserver du pouvoir d’achat ?"
    ],
    "status": "reviewed",
    "sourceHash": "93d674eb1424031dd4ccdf00300de143afa3fc4660c501b7e961ae17d7d877a2",
    "sourcePath": "data/alice-corpus/examples/store-of-value.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-taproot",
    "conceptId": "taproot",
    "title": "Les adresses bc1p et Taproot",
    "keywords": [
      "Les adresses bc1p et Taproot",
      "Taproot",
      "Quelle différence entre bc1q et bc1p ?",
      "transactions",
      "taproot"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nTaproot est une évolution des conditions de dépense de Bitcoin. Sur le réseau principal, ses adresses utilisent Bech32m et commencent par bc1p.\n\nExplication\nTaproot combine les signatures Schnorr et une organisation des conditions de dépense qui peut éviter de révéler toutes les possibilités prévues. Certaines constructions complexes peuvent ainsi apparaître comme une dépense simple lorsque les participants utilisent le chemin adapté.\n\nPour le débutant, le point important est la compatibilité du portefeuille avec le type d’adresse. Taproot ne remplace pas le contrôle du destinataire ni la sauvegarde des clés. Il s’agit d’une manière de verrouiller et de dépenser des sorties, pas d’un réseau Bitcoin séparé.\n\nLimites et confusions\nLes avantages de confidentialité et de coût dépendent de la construction utilisée. Une adresse bc1p n’est pas anonyme et ne cache pas les montants on-chain. Taproot correspond à SegWit version 1 ; bc1q désigne la version 0. Les mécanismes de scripts et d’agrégation demandent un approfondissement plutôt qu’une promesse générale de transactions invisibles.",
    "parentIds": [],
    "relatedIds": [
      "legacy-address",
      "bitcoin-address-scripts",
      "multisig",
      "secondary-addresses-mast",
      "secondary-bitcoin-ecdsa-signature",
      "secondary-bitcoin-musig",
      "secondary-bitcoin-schnorr-signature",
      "secondary-governance-taproot-activation"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Quelle différence entre bc1q et bc1p ?"
    ],
    "status": "reviewed",
    "sourceHash": "ab0a2ab4ca88db7c271e17845ad9561391804c9b46f8cdb1e97fe5e88a848ef3",
    "sourcePath": "data/alice-corpus/examples/taproot.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-threat-model",
    "conceptId": "threat-model",
    "title": "Adapter la protection aux risques",
    "keywords": [
      "Adapter la protection aux risques",
      "Threat Model",
      "Comment choisir des protections proportionnées ?",
      "security",
      "threat model"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn modèle de menace précise ce que l’on protège, contre qui, avec quelles hypothèses. Il remplace la question trop vague « est-ce sécurisé ? » par des scénarios concrets.\n\nExplication\nUne personne peut vouloir éviter la perte d’un appareil, le vol de secrets par un logiciel, la faillite d’un dépositaire ou l’impossibilité de transmettre ses fonds. Ces scénarios ne se traitent pas tous avec le même outil.\n\nIl faut identifier ce que l’adversaire peut lire, modifier ou contrôler, puis vérifier quelle protection agit réellement sur cette capacité. Une sauvegarde protège contre certaines pertes ; l’isolation des clés limite certaines attaques informatiques ; un nœud permet de vérifier des règles.\n\nLimites et confusions\nUne mesure qui améliore un aspect peut compliquer un autre. Davantage de secrets peut réduire une dépendance tout en augmentant le risque de mauvaise récupération. Les promesses doivent préciser leur périmètre, notamment pour le chiffrement local et les appareils déverrouillés. Le modèle reste à revoir lorsque les usages, les outils ou les personnes concernées changent.",
    "parentIds": [],
    "relatedIds": [
      "wallet-backup",
      "hardware-wallet",
      "physical-security-for-bitcoiners",
      "secondary-bitcoin-attack-surface",
      "secondary-bitcoin-defense-in-depth",
      "secondary-lightning-lightning-remote-wallet-connection",
      "secondary-lightning-macaroon",
      "secondary-opsec-digital-hygiene",
      "secondary-privacy-browser-compartmentalization",
      "secondary-privacy-principle-of-least-privilege",
      "secondary-privacy-public-wi-fi-risk",
      "secondary-privacy-single-sign-on-risk"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB cyp302 — Modern Cryptography Fundamentals"
    ],
    "questions": [
      "Comment choisir des protections proportionnées ?"
    ],
    "status": "reviewed",
    "sourceHash": "b719551f425b021bc848400f7c2d47ddd0e7296164b434ceeef60812ad8e9455",
    "sourcePath": "data/alice-corpus/examples/threat-model.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-timelock",
    "conceptId": "timelock",
    "title": "Les conditions temporelles",
    "keywords": [
      "Les conditions temporelles",
      "Timelock",
      "Peut-on empêcher une dépense avant une certaine date ?",
      "transactions",
      "timelock"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn timelock empêche une transaction ou une dépense d’être acceptée avant une condition temporelle donnée. Il peut être lié à une hauteur de bloc ou à une mesure du temps définie par le protocole.\n\nExplication\nUne condition absolue vise un seuil déterminé. Une condition relative impose un délai par rapport à un événement antérieur, selon le mécanisme employé. Ces possibilités servent notamment aux canaux et à des scénarios de récupération prévus à l’avance.\n\nLe portefeuille et la transaction doivent respecter les paramètres correspondants. Tant que les conditions requises ne sont pas réunies, posséder une clé peut ne pas suffire à autoriser immédiatement la dépense.\n\nLimites et confusions\nUn timelock ne déclenche pas automatiquement un paiement à une heure civile exacte. Atteindre le seuil rend une dépense possible selon les autres conditions ; il faut encore construire, diffuser et confirmer une transaction. Les délais de blocs restent variables. Il faut distinguer une primitive générale de Bitcoin des règles particulières d’un protocole comme Lightning ou Ark.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-transaction-input",
      "lightning-network",
      "bitcoin-address-scripts"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB pro202 — Programming Bitcoin"
    ],
    "questions": [
      "Peut-on empêcher une dépense avant une certaine date ?"
    ],
    "status": "reviewed",
    "sourceHash": "c437c5c6789256fa522895b01078788fd02dcff0a32695a1ef88e8c45bee8d0c",
    "sourcePath": "data/alice-corpus/examples/timelock.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-tor-browser",
    "conceptId": "tor-browser",
    "title": "Le rôle et les limites de Tor",
    "keywords": [
      "Le rôle et les limites de Tor",
      "Tor Browser",
      "Que peut protéger Tor dans mes usages Bitcoin ?",
      "privacy",
      "tor browser"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nTor Browser fait passer la navigation par le réseau Tor afin de masquer l’adresse IP d’origine à certains observateurs et de limiter certaines formes de suivi. Il ne rend pas automatiquement toute activité Bitcoin anonyme.\n\nExplication\nLe navigateur agit sur les communications qu’il prend en charge. Un portefeuille ou un nœud séparé ne passe pas nécessairement par Tor parce que le navigateur est ouvert. Leur connexion doit être évaluée selon leur propre configuration.\n\nLe réseau peut réduire le lien direct entre un utilisateur et le site consulté. Cela peut être utile pour consulter des informations sans révéler immédiatement son adresse IP au service. Les comportements et les comptes utilisés restent toutefois des sources d’identification.\n\nLimites et confusions\nSe connecter à un compte nominatif révèle toujours cette identité au service. Tor ne rend pas un faux site légitime, ne répare pas un appareil infecté et ne cache pas les données publiques de la blockchain. Les performances et limites opérationnelles varient. Il faut distinguer la protection réseau de la confidentialité des transactions et des informations volontairement fournies.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-p2p-privacy",
      "phishing-and-social-engineering",
      "threat-model",
      "secondary-privacy-private-browsing-mode",
      "secondary-privacy-vpn"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB scu101 — Update Your Online Security"
    ],
    "questions": [
      "Que peut protéger Tor dans mes usages Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "056f49e4d42ec0577ec89b29d276d77adb227bbbf6333a61e8ecf7975b8f8720",
    "sourcePath": "data/alice-corpus/examples/tor-browser.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-transaction-batching",
    "conceptId": "transaction-batching",
    "title": "Regrouper plusieurs paiements",
    "keywords": [
      "Regrouper plusieurs paiements",
      "Transaction Batching",
      "Pourquoi envoyer à plusieurs personnes dans 1 transaction ?",
      "transactions",
      "transaction batching"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLe batching regroupe plusieurs paiements dans une même transaction. Il permet de partager certaines données communes et de réduire l’espace et les frais par paiement.\n\nExplication\nUne transaction peut créer plusieurs sorties pour différents destinataires. Une entreprise qui effectue de nombreux règlements peut ainsi préparer un lot plutôt qu’une transaction indépendante pour chaque bénéficiaire. Les destinataires obtiennent des sorties distinctes dans une même transaction.\n\nLe gain dépend de la structure des entrées et des sorties ainsi que du taux de frais. Il ne supprime pas la concurrence pour l’espace des blocs ; il utilise cet espace plus efficacement. Tous les paiements du lot partagent son inclusion dans un bloc.\n\nLimites et confusions\nRegrouper peut révéler que plusieurs destinataires ont été payés ensemble. Cela ne prouve pas qu’ils appartiennent à la même personne. Le batching diffère d’une consolidation, qui réunit des fonds du payeur, et d’une transaction collaborative comme CoinJoin. Les économies potentielles ne doivent pas faire oublier le contrôle individuel des montants et des destinations.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-transaction-output",
      "transaction-fees",
      "consolidation-transaction"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc303 — Bitcoin Development Philosophy",
      "PlanB Extraction — 2026-05-23 — lnp404"
    ],
    "questions": [
      "Pourquoi envoyer à plusieurs personnes dans 1 transaction ?"
    ],
    "status": "reviewed",
    "sourceHash": "426f3527d1eadd11a64fb4bee59cb464f18adaf7ee15c94691d8f5658e733cce",
    "sourcePath": "data/alice-corpus/examples/transaction-batching.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-transaction-fees",
    "conceptId": "transaction-fees",
    "title": "Les frais de transaction",
    "keywords": [
      "Les frais de transaction",
      "Transaction Fees",
      "À quoi servent les frais Bitcoin ?",
      "transactions",
      "transaction fees"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLes frais rémunèrent le mineur qui inclut la transaction dans un bloc. Leur montant est la différence entre la valeur totale des entrées et celle des sorties.\n\nExplication\nLe portefeuille propose généralement un taux en sats par octet virtuel, ou sat/vB. Le coût total dépend de ce taux et de la taille virtuelle de la transaction. Exemple fictif, une transaction de 200 vB à 5 sat/vB paie 1 000 sats.\n\nLa demande pour l’espace limité des blocs influence les taux permettant une confirmation rapide. Une transaction avec de nombreuses entrées peut coûter davantage qu’un paiement de valeur supérieure mais plus simple. Les mineurs arbitrent aussi entre transactions dépendantes les unes des autres.\n\nLimites et confusions\nUn taux estimé ne garantit pas une heure de confirmation. Frais totaux et taux de frais sont 2 indicateurs différents. Les frais de retrait facturés par une plateforme ne correspondent pas nécessairement aux frais qu’elle verse au mineur. Aucun pourcentage fixe du montant envoyé ne définit les frais Bitcoin.",
    "parentIds": [],
    "relatedIds": [
      "block-weight",
      "bitcoin-mempool",
      "replace-by-fee"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB min101 — Introduction to Bitcoin mining",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "À quoi servent les frais Bitcoin ?"
    ],
    "status": "reviewed",
    "sourceHash": "8d8a3024cfdd9f6a61fddd5931e1700b6aa89e77df5cb8fd095fccb06ddf354a",
    "sourcePath": "data/alice-corpus/examples/transaction-fees.fr.md",
    "theme": "transactions"
  },
  {
    "id": "curated-two-factor-authentication",
    "conceptId": "two-factor-authentication",
    "title": "La double authentification",
    "keywords": [
      "La double authentification",
      "Two-Factor Authentication",
      "Que protège le second facteur d’un compte ?",
      "security",
      "two factor authentication"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa double authentification demande une preuve supplémentaire au-delà du mot de passe. Elle protège l’accès à un compte ; elle ne modifie pas les conditions de dépense des bitcoins du protocole.\n\nExplication\nLes formes courantes comprennent les codes d’application, les SMS et les clés matérielles d’authentification. Leurs résistances diffèrent, notamment face au vol d’un numéro et aux faux sites. Les moyens de secours méritent aussi une protection, car ils peuvent permettre de contourner le facteur habituel.\n\nIl faut examiner le parcours de récupération du compte autant que la connexion quotidienne. Un email vulnérable ou un numéro détourné peut rester un point faible selon le service.\n\nLimites et confusions\nUne phrase de récupération Bitcoin divulguée ne devient pas protégée par la double authentification du compte associé. Une clé matérielle d’authentification et un hardware wallet de signature n’ont pas nécessairement la même fonction. Les codes temporaires peuvent être demandés par un faux support ; leur caractère temporaire ne rend pas leur transmission sûre.",
    "parentIds": [],
    "relatedIds": [
      "sim-swap",
      "password-manager",
      "phishing-and-social-engineering",
      "secondary-bitcoin-btcpay-security",
      "secondary-bitcoin-lnurl-auth",
      "secondary-privacy-passkeys",
      "secondary-privacy-secure-email-account",
      "secondary-privacy-single-sign-on-risk",
      "secondary-privacy-totp"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB scu202 — Improve Your Personal Digital Security",
      "PlanB Extraction — 2026-05-23 — scu101"
    ],
    "questions": [
      "Que protège le second facteur d’un compte ?"
    ],
    "status": "reviewed",
    "sourceHash": "2dc24fed4e3b8e01281eb84b7c1ce6c960d8decc1c1962ab2a2c8236dcf86f43",
    "sourcePath": "data/alice-corpus/examples/two-factor-authentication.fr.md",
    "theme": "security"
  },
  {
    "id": "curated-unit-of-account",
    "conceptId": "unit-of-account",
    "title": "L’unité de compte",
    "keywords": [
      "L’unité de compte",
      "Unit of Account",
      "Pourquoi afficher les prix dans une unité commune ?",
      "Monnaie et économie",
      "unit of account"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’unité de compte est la mesure dans laquelle on exprime les prix, les dettes et les comptes. Elle peut être différente de l’actif utilisé pour payer.\n\nExplication\nUn marchand peut afficher 1 prix en euros, calculer son équivalent en sats au moment de la vente, puis recevoir du bitcoin. Dans cet exemple, l’euro reste l’unité de compte et Bitcoin sert au règlement. À l’inverse, fixer un prix directement en sats signifie utiliser le satoshi comme mesure du prix.\n\nUne unité commune facilite les comparaisons entre biens et les calculs comptables. Son adoption dépend des habitudes, des contrats et de l’environnement économique. La possibilité d’émettre un paiement dans une monnaie ne suffit pas à généraliser les prix dans cette monnaie.\n\nLimites et confusions\nLa volatilité du taux de conversion peut compliquer l’affichage ou la conservation d’un prix. Il faut préciser le moment du calcul et la durée de validité d’une demande de paiement.\n\nLe fait que beaucoup de prix soient exprimés dans une autre unité ne résume pas toutes les fonctions monétaires de Bitcoin. Les usages comme moyen d’échange ou réserve de valeur doivent être examinés séparément, sans supposer une trajectoire future automatique.",
    "parentIds": [],
    "relatedIds": [
      "money-functions",
      "bitcoin-payments-for-merchants",
      "secondary-economics-redenomination"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB eco104 — Introduction to Bitcoin & Stablecoin",
      "PlanB his205 — History of Coinage"
    ],
    "questions": [
      "Pourquoi afficher les prix dans une unité commune ?"
    ],
    "status": "reviewed",
    "sourceHash": "ad4dfe8b4cb28a54ab67e4434e0276232fe74770201216b02df68a1781786904",
    "sourcePath": "data/alice-corpus/examples/unit-of-account.fr.md",
    "theme": "Monnaie et économie"
  },
  {
    "id": "curated-utxo-labeling",
    "conceptId": "utxo-labeling",
    "title": "Étiqueter ses UTXO",
    "keywords": [
      "Étiqueter ses UTXO",
      "UTXO Labeling",
      "Pourquoi noter l’origine de ses fonds ?",
      "privacy",
      "utxo labeling"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nÉtiqueter ses UTXO consiste à noter leur origine et leur contexte dans le portefeuille. Cela aide à comprendre quels fonds seront associés lors d’une dépense.\n\nExplication\nUn libellé peut distinguer une réception professionnelle, un remboursement, un don ou de la monnaie rendue. Ces informations ne sont pas toujours déductibles de la transaction publique. Elles rendent le coin control plus compréhensible et peuvent faciliter le suivi de fonds d’origines différentes.\n\nLes étiquettes relèvent des données du portefeuille. Elles peuvent nécessiter une sauvegarde distincte des mots de récupération, qui reconstruisent les clés mais pas nécessairement toutes les annotations.\n\nLimites et confusions\nLes labels peuvent être très sensibles. Leur divulgation peut relier explicitement des identités à des transactions et révéler plus que l’historique public seul. Une bonne étiquette ne rend pas un UTXO techniquement différent et n’efface aucune trace passée. Il faut aussi vérifier comment le logiciel stocke, synchronise ou exporte ces informations.",
    "parentIds": [],
    "relatedIds": [
      "coin-control",
      "wallet-backup",
      "non-blockchain-privacy-leaks",
      "secondary-privacy-kyc-bitcoin-acquisition"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc204 — Privacy on Bitcoin",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Pourquoi noter l’origine de ses fonds ?"
    ],
    "status": "reviewed",
    "sourceHash": "a60426b691c04ae49b9f9e10af14e94ce265439218b2a2bfce1a0a3ac13bc4b7",
    "sourcePath": "data/alice-corpus/examples/utxo-labeling.fr.md",
    "theme": "privacy"
  },
  {
    "id": "curated-utxo-set",
    "conceptId": "utxo-set",
    "title": "L’état des sorties non dépensées",
    "keywords": [
      "L’état des sorties non dépensées",
      "UTXO Set",
      "Quelles informations permettent de vérifier une nouvelle dépense ?",
      "nodes",
      "utxo set"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nL’ensemble des UTXO regroupe les sorties encore non dépensées suivies par le nœud. Il lui permet de vérifier qu’une nouvelle transaction utilise des fonds disponibles et respecte leurs conditions.\n\nExplication\nÀ chaque bloc, certaines sorties sont consommées et d’autres sont créées. Le nœud met à jour cet état en fonction des transactions acceptées. Ce registre de disponibilité n’est pas identique à l’archive complète des anciens blocs.\n\nCette séparation explique qu’un nœud élagué puisse vérifier de nouvelles dépenses après avoir supprimé des données historiques. Elle explique aussi pourquoi la taille de l’état et la rapidité de ses accès influencent les ressources nécessaires.\n\nLimites et confusions\nL’UTXO set ne contient pas simplement une liste de comptes ou de propriétaires. Les conditions de dépense comptent, et certaines sorties apparemment disponibles peuvent être impossibles à utiliser en pratique. Une sortie conservée durablement impose un coût de suivi distinct de celui d’une donnée historique élaguable. Les jugements sur les usages de cet espace doivent être séparés de cette description technique.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-utxo",
      "pruned-node",
      "initial-block-download"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc202 — Setting up your first Bitcoin node",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "Quelles informations permettent de vérifier une nouvelle dépense ?"
    ],
    "status": "reviewed",
    "sourceHash": "08e039301accf33c196530cfe2ef7c99d3b078e234a96b163fc7b1f35c1b0f5c",
    "sourcePath": "data/alice-corpus/examples/utxo-set.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-wallet-backup",
    "conceptId": "wallet-backup",
    "title": "Préparer une sauvegarde",
    "keywords": [
      "Préparer une sauvegarde",
      "Wallet Backup",
      "Que faut-il conserver pour restaurer un portefeuille ?",
      "wallets",
      "wallet backup"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne sauvegarde doit préserver les secrets et les informations nécessaires pour retrouver les fonds et signer une dépense. Son contenu dépend de l’architecture du portefeuille.\n\nExplication\nPour un portefeuille BIP39, les mots et l’éventuelle passphrase doivent être exacts. Les chemins de dérivation, les types de scripts ou un descripteur peuvent préciser comment retrouver les adresses. En multisig, le seuil et les informations des cosignataires doivent également rester disponibles.\n\nLes métadonnées, telles que les étiquettes de fonds, peuvent mériter une sauvegarde séparée. Les protocoles complémentaires ont parfois des exigences supplémentaires ; une sauvegarde Bitcoin de base ne doit pas être supposée suffisante pour tout outil Lightning ou Liquid.\n\nLimites et confusions\nUne sauvegarde publique en lecture seule peut montrer les fonds sans permettre de signer. La récupération complète doit donc inclure l’accès aux secrets nécessaires. Préserver 1 fichier ne démontre pas qu’il est exploitable ni qu’il contient toutes les informations attendues. Les instructions doivent correspondre au logiciel réellement utilisé et rester compréhensibles après sa perte.",
    "parentIds": [],
    "relatedIds": [
      "wallet-backup-test",
      "descriptor-wallet",
      "secure-backups",
      "secondary-bitcoin-bitcoin-inheritance-support-protocol",
      "secondary-bitcoin-paper-wallet",
      "secondary-privacy-backup-3-2-1-method",
      "secondary-privacy-incident-response-after-infection"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki",
      "https://github.com/bitcoin/bitcoin/blob/v31.1/doc/descriptors.md"
    ],
    "questions": [
      "Que faut-il conserver pour restaurer un portefeuille ?"
    ],
    "status": "reviewed",
    "sourceHash": "0f7f9e216df53a3168fd979dc67599b8349a596d8de55ab59ac855754ec75a1a",
    "sourcePath": "data/alice-corpus/examples/wallet-backup.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-wallet-backup-test",
    "conceptId": "wallet-backup-test",
    "title": "Vérifier sa sauvegarde",
    "keywords": [
      "Vérifier sa sauvegarde",
      "Wallet Backup Test",
      "Comment savoir si ma sauvegarde est exploitable ?",
      "wallets",
      "wallet backup test"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn test de sauvegarde vérifie qu’une récupération fonctionne réellement. Retrouver les bonnes adresses est utile, mais un test complet doit aussi démontrer l’accès aux clés nécessaires pour signer.\n\nExplication\nUn portefeuille en lecture seule peut afficher le solde et l’historique sans détenir aucun secret de dépense. Il valide donc une partie de la restauration, pas sa totalité. Dans une configuration multisig, il faut également retrouver les conditions et les informations de coordination.\n\nLe test doit être adapté au matériel et au logiciel, dans un environnement sûr. Sa documentation décrit ce qui a été vérifié, sans copier les mots ou les secrets dans un rapport. Une procédure écrite et une procédure effectivement vérifiée sont 2 états différents.\n\nLimites et confusions\nVérifier une sauvegarde ne justifie pas d’exposer une phrase sur un site ou un ordinateur inconnu. Une signature de test ne prouve pas toutes les conditions d’un scénario complexe. Les essais doivent éviter de mettre en jeu des fonds importants. La fiche explique l’objectif de vérification, sans imposer une manipulation universelle à tous les portefeuilles.",
    "parentIds": [],
    "relatedIds": [
      "watch-only-wallet",
      "wallet-backup",
      "multisig"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki"
    ],
    "questions": [
      "Comment savoir si ma sauvegarde est exploitable ?"
    ],
    "status": "reviewed",
    "sourceHash": "b43c92e774671303a4b470188c40cb240c529908b2ea16a6da43eae6bd3b2257",
    "sourcePath": "data/alice-corpus/examples/wallet-backup-test.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-wallet-node-connection",
    "conceptId": "wallet-node-connection",
    "title": "Relier un portefeuille à son nœud",
    "keywords": [
      "Relier un portefeuille à son nœud",
      "Wallet Node Connection",
      "Que change l’utilisation de son propre nœud ?",
      "nodes",
      "wallet node connection"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nRelier un portefeuille à son propre nœud permet d’utiliser ses données vérifiées et de réduire la dépendance à un serveur public. Cela peut améliorer la confidentialité des recherches d’adresses et de transactions.\n\nExplication\nLe portefeuille a besoin de connaître ses fonds, l’historique et l’état de confirmation. S’il adresse toutes ses requêtes à un service tiers, celui-ci peut apprendre quelles informations l’intéressent. Utiliser une infrastructure personnelle réduit certaines de ces fuites.\n\nLa connexion peut demander un service d’indexation ou une interface spécifique selon le portefeuille. Le fait d’exécuter Bitcoin Core sur une machine ne garantit pas que toutes les applications de la personne l’utilisent automatiquement.\n\nLimites et confusions\nLa configuration doit éviter d’exposer inutilement une interface d’administration sur le réseau. Un serveur personnel n’efface pas les traces publiques ni celles déjà communiquées à d’autres services. Il ne détient pas forcément les clés du portefeuille. Les bénéfices de vérification, de confidentialité et de signature doivent donc être examinés séparément.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-wallet",
      "full-node",
      "bitcoin-p2p-privacy",
      "secondary-bitcoin-compact-block-filters",
      "secondary-nodes-bitcoin-indexer"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc202 — Setting up your first Bitcoin node"
    ],
    "questions": [
      "Que change l’utilisation de son propre nœud ?"
    ],
    "status": "reviewed",
    "sourceHash": "2be15fdfbe25991c1330d7f30e9b110ba1136770635647402c080c220b78e117",
    "sourcePath": "data/alice-corpus/examples/wallet-node-connection.fr.md",
    "theme": "nodes"
  },
  {
    "id": "curated-wallet-recovery-phrase",
    "conceptId": "wallet-recovery-phrase",
    "title": "La phrase de récupération",
    "keywords": [
      "La phrase de récupération",
      "Wallet Recovery Phrase",
      "À quoi servent les mots de sauvegarde ?",
      "wallets",
      "wallet recovery phrase"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nLa phrase de récupération est une suite de mots utilisée par de nombreux portefeuilles pour reconstruire leurs clés. Elle doit être traitée comme un secret permettant potentiellement de dépenser les fonds.\n\nExplication\nLe portefeuille transforme cette information en données de départ pour retrouver les clés et les adresses. Cela permet une récupération après la perte ou la panne d’un appareil, sous réserve de compatibilité et des paramètres utilisés.\n\nUne photo, une copie dans un cloud ou une saisie sur un faux site peut exposer ce secret. La protection doit aussi couvrir les accidents matériels, la perte et l’accès futur des personnes autorisées. Une sauvegarde doit rester utilisable, pas seulement cachée.\n\nLimites et confusions\nTous les portefeuilles n’utilisent pas le même format. Une passphrase éventuelle, les chemins de dérivation et les informations d’une configuration multisig peuvent aussi être nécessaires. Une phrase ne restaure pas forcément toutes les métadonnées ou tous les états d’un protocole complémentaire. Aucun support n’a besoin de la recevoir pour expliquer un problème.",
    "parentIds": [],
    "relatedIds": [
      "bitcoin-seed",
      "bip39-passphrase",
      "wallet-backup",
      "secondary-lightning-lnd-aezeed"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB btc102 — Getting your first bitcoins",
      "PlanB Extraction — 2026-05-23"
    ],
    "questions": [
      "À quoi servent les mots de sauvegarde ?"
    ],
    "status": "reviewed",
    "sourceHash": "af6ff807cf84defb2a1038587383a86d9e85159a750815b17c915ed8a9280ffa",
    "sourcePath": "data/alice-corpus/examples/wallet-recovery-phrase.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-watch-only-wallet",
    "conceptId": "watch-only-wallet",
    "title": "Observer sans pouvoir dépenser",
    "keywords": [
      "Observer sans pouvoir dépenser",
      "Watch-Only Wallet",
      "Peut-on suivre un portefeuille sans ses clés privées ?",
      "wallets",
      "watch only wallet"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUn portefeuille en lecture seule suit des adresses, des transactions et un solde sans posséder les clés privées nécessaires à la dépense. Il sépare l’observation de la signature.\n\nExplication\nIl peut utiliser une clé publique étendue ou des descripteurs pour retrouver les sorties concernées. Cela permet de consulter les fonds sur un appareil connecté alors que les secrets restent ailleurs. Selon le logiciel, il peut aussi préparer des transactions à faire signer par un autre outil.\n\nCette séparation aide à organiser une conservation hors ligne, mais impose de savoir où se trouvent les moyens réels d’autorisation. Voir ses bitcoins ne signifie pas détenir les secrets qui permettent de les récupérer.\n\nLimites et confusions\nLecture seule n’est pas synonyme de données sans sensibilité. Les informations utilisées peuvent révéler beaucoup d’adresses et d’historique. Un écran de solde peut aussi être trompé si ses sources sont malveillantes. Un test de restauration limité à cet écran ne valide donc ni la capacité de signature ni nécessairement la vérification indépendante de la chaîne.",
    "parentIds": [],
    "relatedIds": [
      "extended-public-key",
      "wallet-backup-test",
      "wallet-node-connection",
      "secondary-bitcoin-non-hardened-derivation"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB cyp201 — Bitcoin Wallet Architecture"
    ],
    "questions": [
      "Peut-on suivre un portefeuille sans ses clés privées ?"
    ],
    "status": "reviewed",
    "sourceHash": "7ceb399399868b3c9bfd58406edd3f6d3116b4e49cf8e8cae7aa1d3a6a65f084",
    "sourcePath": "data/alice-corpus/examples/watch-only-wallet.fr.md",
    "theme": "wallets"
  },
  {
    "id": "curated-watchtower",
    "conceptId": "watchtower",
    "title": "Le rôle d’une watchtower",
    "keywords": [
      "Le rôle d’une watchtower",
      "Watchtower",
      "À quoi sert une watchtower ?",
      "Lightning",
      "watchtower"
    ],
    "level": "beginner",
    "tier": "primary",
    "locale": "fr",
    "sourceLocale": "fr",
    "translationStatus": "source",
    "content": "Réponse courte\nUne watchtower surveille la chaîne pour détecter certaines publications frauduleuses d’anciens états de canaux Lightning et réagir dans le délai prévu. Elle complète la surveillance du nœud de l’utilisateur.\n\nExplication\nDans le modèle de canaux à pénalité, publier un état révoqué peut favoriser indûment un participant. La partie lésée dispose d’une fenêtre pour réagir. Une watchtower reçoit les informations nécessaires au mécanisme prévu par le logiciel et peut intervenir quand l’utilisateur ne suit pas lui-même la chaîne.\n\nElle peut être auto-hébergée ou fournie par un tiers. Sa disponibilité, sa compatibilité et la manière dont elle reçoit les mises à jour comptent. Utiliser le service demande une configuration adaptée, pas seulement connaître son adresse.\n\nLimites et confusions\nUne watchtower n’est pas une assurance générale contre toutes les pertes Lightning. Elle ne résout pas le manque de liquidité, un wallet compromis ou l’absence de sauvegarde. Elle ne rend pas non plus un nœud hors ligne capable de router normalement.\n\nLe service doit effectivement recevoir les informations pertinentes et pouvoir agir à temps. Les garanties et les métadonnées exposées dépendent de l’implémentation. Il faut éviter de promettre une protection absolue sur le seul nom « watchtower ».",
    "parentIds": [],
    "relatedIds": [
      "lightning-force-close",
      "lightning-node-backup",
      "secondary-lightning-revocation-key"
    ],
    "reviewMethod": "adapted_from_corrected_sources",
    "sources": [
      "PlanB lnp201 — Lightning Network Theory"
    ],
    "questions": [
      "À quoi sert une watchtower ?"
    ],
    "status": "reviewed",
    "sourceHash": "ee385d17657d352928193315b5508bbef0d1eafd2ae0b20950197454bbc87200",
    "sourcePath": "data/alice-corpus/examples/watchtower.fr.md",
    "theme": "Lightning"
  }
];
