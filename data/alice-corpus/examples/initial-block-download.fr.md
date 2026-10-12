---
type: "project_note"
id: "initial-block-download"
title: "La synchronisation initiale"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Initial Block Download"]
parent_ids: []
related_ids: ["node-initial-sync", "pruned-node", "utxo-set"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc202 — Setting up your first Bitcoin node"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La synchronisation initiale

## Questions couvertes

- Pourquoi un nouveau nœud doit-il se synchroniser ?

## Réponse courte

La synchronisation initiale permet à un nouveau nœud d’atteindre un état cohérent de la chaîne. Il obtient les données nécessaires et effectue les traitements de validation prévus par sa configuration.

## Explication

Le temps dépend du réseau, du stockage, du processeur, de la mémoire disponible et des réglages. Le nœud doit reconstruire et maintenir les sorties encore dépensables, pas seulement recopier une liste de blocs. Après cette phase, suivre les nouveaux blocs demande généralement moins de travail que traiter tout l’historique.

Les mécanismes AssumeValid et AssumeUTXO répondent à des étapes différentes de ce démarrage. Leur rôle et leurs hypothèses sont expliqués en secondaire, plutôt que regroupés sous une promesse vague de téléchargement accéléré.

## Limites et confusions

Réduire l’espace conservé par élagage ne supprime pas toutes les étapes de synchronisation. Une indication « prêt » ou un pourcentage doit être interprété selon ce qui reste à vérifier. Augmenter la mémoire allouée n’aide que dans les limites de l’appareil et des autres besoins ; aucun délai universel ne peut être annoncé pour tous les nœuds.

## Approfondissements

- [[node-initial-sync.fr|Comprendre la première synchronisation]].
- [[pruned-node.fr|Le nœud élagué]].
- [[utxo-set.fr|L’état des sorties non dépensées]].

## Références

- PlanB btc202 — Setting up your first Bitcoin node.
