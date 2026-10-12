---
type: "project_note"
id: "ark-implementations-bark-arkade"
title: "Ark, Bark et Arkade, comprendre les différences"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin-layers", "ark", "custody"]
aliases: ["Bark", "Second", "Arkade", "implémentations Ark"]
parent_ids: ["ark-vtxos", "ark-payments", "ark-security-model", "bitcoin-layered-architecture"]
related_ids: ["spark-trust-and-exits", "fedimint-custody-and-privacy", "alice-explorer"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://offchain.media/article/what-is-ark-bitcoin", "https://second.tech/docs", "https://second.tech/docs/learn/lifetime", "https://docs.arkadeos.com/", "https://docs.arkadeos.com/learn/core-concepts/security-and-trust-model", "https://docs.arkadeos.com/learn/core-concepts/vtxo-lifecycle-and-liveness"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Ark, Bark et Arkade, comprendre les différences

## Questions couvertes

- Ark, Bark et Arkade désignent-ils le même logiciel ?
- Quels usages et quelles conditions de sortie faut-il comparer ?

## Réponse courte

Ark désigne une famille de protocoles utilisant des sorties virtuelles, ou VTXO. Bark est l’implémentation développée par Second pour les paiements. Arkade développe aussi des outils de paiement, de contrats et d’actifs autour des VTXO. Leurs fonctionnalités et garanties doivent être étudiées séparément.

## Explication

Bark propose des outils pour envoyer et recevoir via Ark, Lightning et Bitcoin, avec un serveur qui coordonne les opérations. Son utilisateur n’a pas à administrer ses propres canaux Lightning pour utiliser les fonctions proposées par le service.

Arkade expose des transactions virtuelles, un règlement par lots et des conditions de dépense programmables. La documentation distingue l’exécution rapide hors chaîne de son ancrage dans Bitcoin. Les garanties d’un actif émis ajoutent notamment les conditions de son émetteur.

Dans les 2 cas, il faut examiner l’état du VTXO, les transactions nécessaires à sa sortie, les frais et l’expiration. Une sortie d’urgence doit pouvoir aboutir à temps, avec les données nécessaires. Après expiration, une récupération peut dépendre de la coopération de l’opérateur ; le renouvellement automatique dépend du fonctionnement réel du wallet ou du délégué.

## Limites et confusions

Les noms ne sont pas interchangeables. Les exigences d’une implémentation ne doivent pas devenir une règle universelle d’Ark.

La présentation d’Offchain Media est un point d’entrée pédagogique. Les documentations Second et Arkade ont été consultées le 2026-10-11 ; leurs annonces de sécurité décrivent leur modèle et ne constituent pas un audit indépendant des déploiements. Aucun test de sortie ni vérification de l’attestation matérielle d’un opérateur n’est revendiqué ici.

## Approfondissements

- [[spark-trust-and-exits.fr|Spark, opérateurs et sorties vers Bitcoin]] pour comparer les dépendances envers les opérateurs.
- [[fedimint-custody-and-privacy.fr|Fedimint, garde fédérée et confidentialité]] pour distinguer ces sorties de la garde fédérée.
- [[alice-explorer.fr|Comprendre Explorer]] pour situer les informations visibles dans Alice App.

## Références

- [Marius, Offchain Media, Ark, Bark et Arkade, 31 mai 2026](https://offchain.media/article/what-is-ark-bitcoin).
- [Second, documentation Bark](https://second.tech/docs).
- [Second, durée de vie des VTXO](https://second.tech/docs/learn/lifetime).
- [Arkade, fonctions et architecture](https://docs.arkadeos.com/).
- [Arkade, sécurité et sorties](https://docs.arkadeos.com/learn/core-concepts/security-and-trust-model).
- [Arkade, expiration et disponibilité](https://docs.arkadeos.com/learn/core-concepts/vtxo-lifecycle-and-liveness).
