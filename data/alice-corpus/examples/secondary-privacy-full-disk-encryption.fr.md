---
type: "project_note"
id: "secondary-privacy-full-disk-encryption"
title: "Ce que protège le chiffrement du disque"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Full Disk Encryption"]
parent_ids: ["encryption", "physical-security-for-bitcoiners"]
related_ids: ["encryption", "physical-security-for-bitcoiners"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB scu202 — Improve Your Personal Digital Security", "PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Ce que protège le chiffrement du disque

## Questions couvertes

- Ce que protège le chiffrement du disque — quel mécanisme et quelles limites ?

## Réponse courte

Le chiffrement complet du disque protège les données au repos si un ordinateur, téléphone ou disque externe est perdu ou volé. Il exige un mot de passe fort et une bonne gestion de la récupération.

## Explication

- Il protège surtout contre l’accès physique lorsque le volume chiffré est fermé et que ses clés ne sont pas accessibles.
- Il ne protège pas contre un malware actif pendant que la machine est déverrouillée.
- Les disques externes et sauvegardes doivent aussi être chiffrés si sensibles.
- La perte de la phrase/mot de passe de récupération peut rendre les données irrécupérables.

## Limites et confusions

Cette protection concerne surtout un volume fermé, typiquement lorsque l’appareil est éteint. Le simple verrouillage de l’écran n’offre pas nécessairement la même protection. Une session ouverte ou un logiciel malveillant autorisé à lire les données change le modèle de menace.

## Approfondissements

- [[encryption.fr|Chiffrement et signature]] pour replacer ce mécanisme dans son contexte.
- [[physical-security-for-bitcoiners.fr|La sécurité physique]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB scu202 — Improve Your Personal Digital Security
- PlanB scu101 — Update Your Online Security
