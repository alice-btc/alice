---
type: "project_note"
id: "alice-learn"
title: "Apprendre avec Learn"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["alice-app", "learning"]
aliases: ["cours dans Alice", "bibliothèque Learn"]
parent_ids: []
related_ids: ["alice-app-overview", "alice-explorer", "alice-playground", "alice-offline-limits"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:apps/app-web/src/components/LearnPanel.tsx", "alice-repo:apps/app-web/src/components/learn/LearnIntroModal.tsx", "alice-repo:apps/app-web/src/lib/learn/packs.ts", "alice-repo:apps/app-web/src/lib/learn/packs-base.ts", "alice-repo:apps/app-web/src/lib/learn/language-downloads.ts", "alice-repo:apps/app-web/src/lib/learn/progress.ts", "alice-repo:apps/app-web/src/lib/learn/language.ts"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Apprendre avec Learn

## Questions couvertes

- À quoi sert l’espace Learn ?
- Quelle différence entre lire un cours et demander une réponse à Alice ?

## Réponse courte

Learn est une bibliothèque de cours et tutoriels sur Bitcoin. On peut lire les chapitres, suivre sa progression et faire les quiz disponibles. Alice peut expliquer un passage à la demande.

## Explication

Les contenus proviennent de Plan ₿ Academy, sous licence CC BY-SA 4.0. La lecture du cours et l’explication générée par l’assistant sont 2 contenus distincts.

Le parcours permet de commencer un cours, ouvrir ses chapitres et reprendre une lecture. La progression est enregistrée localement lorsque le stockage de l’application est disponible. Certains contenus proposent des liens vers Explorer pour observer des exemples.

Le français et l’anglais sont prévus dans les contenus embarqués de l’application. Les autres langues peuvent nécessiter un téléchargement depuis une source distante. La langue de lecture se choisit indépendamment de celle de la conversation.

## Limites et confusions

Tous les cours ne disposent pas d’un quiz. Un chapitre marqué comme lu ne certifie pas sa maîtrise. Télécharger une langue ne garantit pas que chaque contenu restera accessible hors ligne ; la disponibilité dépend des fichiers effectivement présents et conservés. Les explications d’Alice peuvent comporter des erreurs.

## Approfondissements

- [[alice-app-overview.fr|Se repérer dans Alice App]].
- [[alice-explorer.fr|Comprendre Explorer]].
- [[alice-playground.fr|Le wallet playground d’Alice App]].
- [[alice-offline-limits.fr|Les limites du mode hors ligne]].

## Références

- Parcours `alice-repo:apps/app-web/src/components/LearnPanel.tsx` et `alice-repo:apps/app-web/src/components/learn/LearnIntroModal.tsx`.
- Contenus `alice-repo:apps/app-web/src/lib/learn/packs.ts`, `alice-repo:apps/app-web/src/lib/learn/packs-base.ts` et `alice-repo:apps/app-web/src/lib/learn/language-downloads.ts`.
- Progression et langues `alice-repo:apps/app-web/src/lib/learn/progress.ts` et `alice-repo:apps/app-web/src/lib/learn/language.ts`.
- Références produit privées, version suivie dans le registre de provenance.
