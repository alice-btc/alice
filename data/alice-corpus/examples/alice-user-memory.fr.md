---
type: "project_note"
id: "alice-user-memory"
title: "La mémoire personnelle d’Alice"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Alice App et apprentissage"]
aliases: ["docs/ALICE_USER_MEMORY.md"]
parent_ids: []
related_ids: ["alice-local-encryption", "alice-private-cloud"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:46e2e9da:docs/ALICE_USER_MEMORY.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La mémoire personnelle d’Alice

## Questions couvertes

- Que signifie la mémoire d’Alice et comment la distinguer du corpus Bitcoin ?

## Réponse courte

La mémoire personnelle d’Alice sert à adapter ses explications à des préférences ou à des éléments déclarés par l’utilisateur. Elle est distincte du corpus de connaissances Bitcoin et de l’historique des conversations.

## Explication

La documentation relue distingue une mémoire de petits faits personnels et un profil d’apprentissage par concept. Ces informations ajustent le vocabulaire, les prérequis et la profondeur de réponse ; elles ne constituent pas des preuves sur Bitcoin et ne doivent pas remplacer la demande actuelle.

L’écran « What Alice remembers » permet de voir, modifier ou supprimer des éléments. Désactiver la mémoire personnelle n’équivaut pas à supprimer les conversations ni à désactiver toutes les traces d’apprentissage. Les commandes de suppression ont des périmètres différents.

## Limites et confusions

Les filtres cherchent à exclure les secrets, les montants et les identifiants, mais peuvent se tromper. Ne pas transmettre à Alice de phrase de récupération ou de clé privée en comptant sur ce filtre.

Le stockage local ne signifie pas que le contexte reste toujours sur l’appareil. Les éléments sélectionnés peuvent accompagner la requête vers le moteur choisi ; en Private Cloud, ils voyagent dans le corps chiffré. En mode local, l’inférence est locale. Cette fiche décrit la documentation au commit 46e2e9da, sans nouvel essai fonctionnel.

## Approfondissements

- [[alice-local-encryption.fr|Les données locales d’Alice App]] — comprendre le stockage local et ses limites
- [[alice-private-cloud.fr|Comprendre le mode Private Cloud]] — comprendre le trajet du contexte envoyé

## Références

- [Mémoire utilisateur, documentation au commit 46e2e9da](alice-repo:46e2e9da:docs/ALICE_USER_MEMORY.md).
