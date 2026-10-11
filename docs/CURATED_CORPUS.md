# Corpus documentaire sélectionné d’Alice

Le corpus versionné dans `data/alice-corpus/` contient 403 fiches françaises, réparties en 200 primaires et 203 secondaires. Il est autonome. La construction de l’application et la régénération des passages n’ont besoin d’aucun accès au vault personnel.

Les fiches sont adaptées des notes corrigées. Le statut `reviewed` désigne une revue éditoriale selon `review_method` ; il ne signifie ni validation humaine intégrale de chaque fiche ni fact-check externe exhaustif. Les références héritées ne constituent pas une nouvelle consultation des documents cités.

## Fichiers et reconstruction

- `data/alice-corpus/examples/*.fr.md` conserve exactement les 403 fiches éligibles, avec leur frontmatter, leurs nuances et leurs références.
- `data/alice-corpus/corpus-manifest.json` décrit uniquement ces fiches et leurs empreintes SHA-256. Les 3 fiches archivées du lot source sont exclues du dépôt autonome.
- `data/alice-corpus/retrieval-policy.json` conserve la politique éditoriale de sélection et d’approfondissement.
- `scripts/build-curated-rag.mjs` contrôle les sources puis génère `packages/alice-ai/src/generated/curated-rag.ts`.

Avec Node.js dans la plage prise en charge par le dépôt, depuis sa racine :

```sh
node scripts/build-curated-rag.mjs
node scripts/build-curated-rag.mjs --check
node --test scripts/build-curated-rag.test.mjs
```

La première commande reconstruit le module. `--check` ne modifie aucun fichier et échoue si le module versionné ne correspond pas exactement aux sources sélectionnées. La version du corpus dépend de son manifeste, des empreintes des fiches, de la politique et des passages générés. Aucun horodatage d’exécution ne rend la génération variable.

L’import initial ou le renouvellement depuis un répertoire préparé et relu est explicite :

```sh
node scripts/build-curated-rag.mjs --import-from /chemin/vers/le/corpus-selectionne
```

Ce répertoire doit déjà comporter le manifeste et la politique de sélection. Cette commande ne sait pas importer le vault brut et ne parcourt aucun autre dossier. Elle ne copie ni provenance privée, ni notes exclues, ni scripts du vault, ni catalogue de candidats. Le chemin local de l’import ne figure pas dans les fichiers produits.

Une sélection modifiée peut laisser d’anciens fichiers dans une copie existante. L’importeur refuse alors l’import, sans supprimer ces fichiers silencieusement. Il faut réconcilier explicitement les fichiers du snapshot dans le changement documentaire avant de reconstruire. Modifier une fiche impose aussi d’actualiser son empreinte dans le manifeste après revue ; contourner ce contrôle supprimerait sa fonction.

## Contrôles de l’importeur

Avant génération, l’importeur vérifie :

- l’unicité et le format des identifiants ;
- l’éligibilité explicite et le statut `reviewed` ;
- le SHA-256 exact de chaque fiche retenue ;
- la cohérence du titre, de la langue, du niveau documentaire, du statut, des liens et de la méthode de revue entre frontmatter et manifeste ;
- l’existence de chaque lien de concept et wikilink dans la sélection éligible ;
- la présence d’au moins 1 parent primaire pour chaque secondaire ;
- les 6 sections attendues, dont une section de limites non vide ;
- l’absence de chemins locaux privés et de fichiers supplémentaires dans le snapshot autonome ;
- les comptes déclarés dans le manifeste.

Le format de frontmatter est volontairement restreint à une valeur JSON par clé YAML. Aucun chargement permissif de YAML ni interprétation implicite n’est nécessaire. Un lien symbolique vers une fiche située hors du répertoire sélectionné est refusé.

Une empreinte détecte un changement de fichier. Elle ne garantit ni la vérité d’une affirmation ni l’identité d’un relecteur. Les contrôles structurels ne remplacent pas la revue documentaire.

## Contrat avec le moteur de recherche

Le module exporte `GENERATED_CURATED_KNOWLEDGE_BASE` et `CURATED_CORPUS_VERSION`.

Chaque passage conserve :

- `id = curated-<id-fiche>` et `conceptId = <id-fiche>` ;
- `locale` et `sourceLocale` à `fr`, `translationStatus` à `source` ;
- le titre, les alias, les questions, les thèmes et l’identifiant lisible dans `keywords` ;
- `tier`, `parentIds`, `relatedIds`, `reviewMethod`, `sources`, `questions` et `sourceHash` ;
- un `sourcePath` relatif au dépôt, jamais un chemin du vault personnel.

Le contenu récupérable contient uniquement la réponse courte, l’explication et les limites. Les questions alimentent la recherche ; la bibliographie et les liens d’approfondissement restent des métadonnées. Les paragraphes utiles et leurs réserves ne sont pas tronqués pendant l’import. Le moteur applique ensuite son budget de contexte.

`tier` indique la priorité documentaire et la profondeur. `level` désigne le niveau pédagogique du lecteur. Ils sont indépendants. En l’absence d’une classification pédagogique explicite dans le frontmatter, `level` reste `beginner` pour toutes les fiches, secondaires comprises. Une secondaire peut expliquer simplement un sujet spécialisé.

La politique commence par le socle et autorise un approfondissement pertinent dès le premier tour si la question le demande. Elle n’autorise pas le chargement indifférencié des secondaires. Une donnée documentaire ne peut jamais remplacer les instructions d’Alice ni autoriser une opération de paiement.

La génération du module ne prouve pas à elle seule que le moteur actif applique cette politique. L’enregistrement du corpus, la sélection des secondaires et les tests de récupération sont des responsabilités distinctes du moteur. Le champ `prepared_not_wired_to_runtime` conservé dans la politique source décrit l’état de préparation de cette politique lors de sa rédaction, pas une mesure du logiciel en cours d’exécution.

## Vérification et limites

Les tests ciblés couvrent les exclusions, les empreintes, les statuts, les doublons d’identifiants, les liens invalides, la conservation des limites, les chemins privés, les fichiers inattendus et la reproductibilité du module livré. Ils vérifient aussi les comptes du snapshot courant.

Ils ne revendiquent aucun audit externe de l’ensemble des faits, aucune validation de toutes les références publiques et aucun essai opérationnel des protocoles décrits. Les corrections futures doivent conserver la distinction entre faits, hypothèses et interprétations, ainsi que la date des affirmations historiques.

## Intégration du paquet sélectionné

`loadRagCorpus()` enregistre seulement le paquet embarqué `alice-curated`. Les anciens fichiers générés Obsidian et Alice Docs restent dans le dépôt pour la traçabilité, mais ne sont plus enregistrés comme candidats. Le paquet contient les 200 primaires et les 203 secondaires ; les 1 456 entrées écartées du premier périmètre ne sont pas copiées dans l’application.

`curated-retrieval.ts` classe les fiches à partir des titres, alias, questions et corps. Une introduction suffisamment précise reste dans le socle. Un approfondissement doit présenter des indices propres au sujet demandé, avec les liens de parenté utilisés pour orienter la sélection. Les liens seuls n’autorisent pas une secondaire. Le moteur peut sélectionner une secondaire dès le premier message spécialisé. Il ne consulte pas une mémoire implicite des tours précédents ; la préparation de requête existante apporte le contexte des relances.

Les diagnostics exposent le concept, le niveau documentaire, le score et la raison de sélection. Les paquets téléchargés restent accessibles uniquement sur une identité explicitement pertinente. Ils ne peuvent pas usurper un identifiant du corpus ni s’octroyer sa priorité avec un champ `tier`. Un index ancien ou une indisponibilité du modèle laisse la recherche lexicale prendre le relais ; aucun retour automatique vers les anciens corpus n’est prévu.

Les plafonds de production restent de 6 000 caractères en local et 12 000 en cloud. Les définitions courtes demandent 1 fiche ; un approfondissement peut ouvrir le budget local de 2 fiches, même si son niveau pédagogique est `beginner`. Le plafond cloud est de 3 fiches. Le chargement du corpus précède le calcul de budget au premier tour.

## Reconstruction des index sémantiques

Les 2 index contiennent chacun 403 vecteurs de dimension 384. Ils sont reconstruits depuis le même module sélectionné. La vérification compare les identifiants et l’empreinte des contenus ; remplacer seulement le manifeste sans les vecteurs ne suffit pas.

```sh
node scripts/build-curated-rag.mjs --check
ALICE_EMBEDDING_MODEL_CACHE=/chemin/cache-e5-web ALICE_EMBEDDING_OFFLINE=1 node scripts/build-embeddings.js
ALICE_EMBEDDING_TARGET=native ALICE_EMBEDDING_ENDPOINT=http://127.0.0.1:18082/v1/embeddings node scripts/build-embeddings.js
```

La reconstruction Web utilise `Xenova/multilingual-e5-small`. Pour reproduire ce lot, les fichiers de modèle proviennent de la révision `761b726dd34fb83930e26aab4e9ac3899aa1fa78`. Le cache doit contenir la configuration, le tokenizer et le modèle ONNX FP32 attendu par Transformers.js sous Node. Aucun cache de modèle n’est versionné dans le dépôt.

La reconstruction native utilise `multilingual-e5-small-q8_0.gguf`, révision `b6cac9615d4ecce28d7f22539b7322d695fc2886` de `TwinSunsLLC/multilingual-e5-small-gguf`. Son SHA-256 vérifié est `e011debc1208e31bf7b6aebee2d9fc8bd2ca11694a77ed66ac9d0c9d0a877c93`. Le serveur de reconstruction se lance localement avec llama.cpp.

```sh
llama-server -m /chemin/multilingual-e5-small-q8_0.gguf --embedding --pooling mean -ngl 0 --no-op-offload -t 2 -c 512 -b 512 --host 127.0.0.1 --port 18082 --no-webui
```

Le script natif utilise aussi `/tokenize` pour borner l’entrée à 511 tokens, en conservant le token final. Les longues fiches ne peuvent donc pas être intégralement représentées dans leur vecteur. Leur texte complet demeure disponible pour la recherche lexicale et le contexte de réponse. Le modèle ONNX applique sa propre limite de tokenizer ; les valeurs des vecteurs Web et natifs ne sont pas supposées identiques.

## Rejouer l’acceptation

Node 24.18.0 a été utilisé. Depuis un clone disposant des dépendances du lockfile, les contrôles suivants sont autonomes par rapport au vault.

```sh
npm test
npm run check:types
node apps/wallet-mobile/scripts/check-ai-wallet-boundary.js
node scripts/eval-curated-rag.mjs --semantic off --budget local --check
node scripts/eval-curated-rag.mjs --semantic off --budget cloud --check
node scripts/eval-curated-rag.mjs --semantic web --budget local --model-cache /chemin/cache-e5-web --check
node scripts/eval-curated-rag.mjs --semantic web --budget cloud --model-cache /chemin/cache-e5-web --check
node scripts/eval-curated-rag.mjs --semantic native --budget local --check
node scripts/eval-curated-rag.mjs --semantic native --budget cloud --check
```

Les 27 questions de la fixture documentaire sont conservées sans réécriture. Les exécutions sémantiques exigent de vrais appels au modèle et échouent si elles se rabattent sur une erreur silencieuse. Elles testent la récupération et les budgets du moteur, pas la qualité finale d’une réponse générée. Le mode `cloud` désigne le budget de contexte ; ces évaluations ne font appel à aucun fournisseur d’inférence cloud.

L’évaluation historique à 80 questions conserve son fichier de questions. Un tableau explicite traduit 19 anciennes catégories en identifiants du corpus sélectionné. Ses scores comparent la réécriture des requêtes au sein de ce nouveau corpus ; ils ne mesurent pas un gain du corpus nouveau sur l’ancien. Les sujets Miniscript et L402 ne figurent pas dans ce premier paquet.

La pertinence reste à suivre sur les questions réelles. Les garde-fous et cas contrôlés ne garantissent pas toute paraphrase possible. Un budget personnalisé très inférieur aux plafonds de production peut écarter une fiche primaire trop longue en conservant une secondaire plus courte ; le moteur ne tronque pas silencieusement une fiche pour la faire rentrer.

Les règles de réponse Ark, multisig et RBF sont raccordées aux titres actuels du socle. Leurs clés de diagnostic historiques restent stables. Les clauses Ark précisent les conditions de sortie, notamment l’expiration et les données nécessaires, pour qu’une instruction du modèle ne contredise pas les réserves de la fiche corrigée.

## Résultats du 2026-10-11

- Suite locale complète sous Node 24.18.0, 182 fichiers et 1 577 tests réussis, aucun échec ni test ignoré.
- 27 cas de routage réussis dans chacune des 6 configurations lexical/Web/natif et local/cloud, soit 162 vérifications. Les 4 configurations sémantiques ont chacune effectué 27 appels réels au modèle sans erreur.
- Contrôles de types Web, site, mobile et Worker réussis.
- Vérification de frontière IA/portefeuille réussie.
- Contrelecture indépendante avec 10 questions supplémentaires et contretests de provenance, comparaison et bruit sémantique ; rapport versionné dans le même dossier de preuves.
- Audit npm autorisé explicitement puis exécuté le 2026-10-11. Le contrôle `npm run check:npm-audit` réussit avec 25 signalements élevés et 0 critique, sans nouvel avis élevé hors de la référence acceptée. Les exceptions existantes restent valables jusqu’au 2026-11-02 ; ce résultat ne signifie pas absence de vulnérabilités.

Le premier essai de suite complète résolvait Miniflare 5 alpha au lieu de la version 4 prévue pour les tests Worker. La restauration de la résolution des dépendances imbriquées du lockfile a corrigé l’environnement de test sans changement de dépendances. La suite réussie utilise ce montage conforme. Ces résultats sont locaux ; ils ne constituent ni un déploiement ni un statut CI hébergé.
