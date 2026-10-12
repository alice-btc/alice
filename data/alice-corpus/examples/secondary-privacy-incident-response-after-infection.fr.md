---
type: "project_note"
id: "secondary-privacy-incident-response-after-infection"
title: "Réagir à un appareil potentiellement compromis"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Incident Response After Infection"]
parent_ids: ["malware", "wallet-backup"]
related_ids: ["malware", "wallet-backup"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Réagir à un appareil potentiellement compromis

## Questions couvertes

- Réagir à un appareil potentiellement compromis — quel mécanisme et quelles limites ?

## Réponse courte

Une infection suspectée impose de limiter la propagation et de ne plus saisir de secrets sur l’appareil. Les changements de mots de passe et la récupération doivent se faire depuis un environnement de confiance.

## Explication

- Isoler l’appareil suspect du réseau limite certains échanges malveillants.
- Révoquer les sessions et accès compromis depuis un autre appareil fiable.
- Une réinstallation ou une restauration saine peut être nécessaire ; un antivirus ne garantit pas l’absence de compromission.
- Distinguer la récupération d’un compte et celle d’un portefeuille dont les clés ont pu être copiées.

## Limites et confusions

Un scan sans alerte ne prouve pas que l’appareil est sain. Une clé ou une phrase déjà divulguée reste compromise après nettoyage de l’ordinateur.

## Approfondissements

- [[malware.fr|Les logiciels malveillants]] pour replacer ce mécanisme dans son contexte.
- [[wallet-backup.fr|Préparer une sauvegarde]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB scu101 — Update Your Online Security
