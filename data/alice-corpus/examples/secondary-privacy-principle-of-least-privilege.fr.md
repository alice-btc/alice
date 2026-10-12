---
type: "project_note"
id: "secondary-privacy-principle-of-least-privilege"
title: "Limiter les droits des applications"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Principle of Least Privilege"]
parent_ids: ["threat-model", "malware"]
related_ids: ["threat-model", "malware"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB scu202 — Improve Your Personal Digital Security", "PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Limiter les droits des applications

## Questions couvertes

- Limiter les droits des applications — quel mécanisme et quelles limites ?

## Réponse courte

Le principe du moindre privilège consiste à donner à chaque utilisateur, application ou service uniquement les permissions nécessaires à sa tâche. Il limite les dégâts lorsqu’un compte, logiciel ou processus est compromis.

## Explication

- Éviter l’usage quotidien d’un compte administrateur réduit les risques.
- Séparer les sessions ou profils limite la propagation d’un incident.
- Les permissions applicatives doivent être revues régulièrement.
- Le principe s’applique aux OS, smartphones, navigateurs, serveurs et réseaux.

## Limites et confusions

Limiter les permissions réduit l’impact possible d’une compromission ; cela ne rend pas un logiciel hostile inoffensif ni une session administrateur impossible à attaquer.

## Approfondissements

- [[threat-model.fr|Adapter la protection aux risques]] pour replacer ce mécanisme dans son contexte.
- [[malware.fr|Les logiciels malveillants]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB scu202 — Improve Your Personal Digital Security
- PlanB scu101 — Update Your Online Security
