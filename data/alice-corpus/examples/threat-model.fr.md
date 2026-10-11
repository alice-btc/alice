---
type: "project_note"
id: "threat-model"
title: "Adapter la protection aux risques"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Threat Model"]
parent_ids: []
related_ids: ["wallet-backup", "hardware-wallet", "physical-security-for-bitcoiners", "secondary-bitcoin-attack-surface", "secondary-bitcoin-defense-in-depth", "secondary-lightning-lightning-remote-wallet-connection", "secondary-lightning-macaroon", "secondary-opsec-digital-hygiene", "secondary-privacy-browser-compartmentalization", "secondary-privacy-principle-of-least-privilege", "secondary-privacy-public-wi-fi-risk", "secondary-privacy-single-sign-on-risk"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Adapter la protection aux risques

## Questions couvertes

- Comment choisir des protections proportionnées ?

## Réponse courte

Un modèle de menace précise ce que l’on protège, contre qui, avec quelles hypothèses. Il remplace la question trop vague « est-ce sécurisé ? » par des scénarios concrets.

## Explication

Une personne peut vouloir éviter la perte d’un appareil, le vol de secrets par un logiciel, la faillite d’un dépositaire ou l’impossibilité de transmettre ses fonds. Ces scénarios ne se traitent pas tous avec le même outil.

Il faut identifier ce que l’adversaire peut lire, modifier ou contrôler, puis vérifier quelle protection agit réellement sur cette capacité. Une sauvegarde protège contre certaines pertes ; l’isolation des clés limite certaines attaques informatiques ; un nœud permet de vérifier des règles.

## Limites et confusions

Une mesure qui améliore un aspect peut compliquer un autre. Davantage de secrets peut réduire une dépendance tout en augmentant le risque de mauvaise récupération. Les promesses doivent préciser leur périmètre, notamment pour le chiffrement local et les appareils déverrouillés. Le modèle reste à revoir lorsque les usages, les outils ou les personnes concernées changent.

## Approfondissements

- [[wallet-backup.fr|Préparer une sauvegarde]].
- [[hardware-wallet.fr|Le rôle d’un appareil de signature]].
- [[physical-security-for-bitcoiners.fr|La sécurité physique]].

- [[secondary-bitcoin-attack-surface.fr|La surface d’attaque]].
- [[secondary-bitcoin-defense-in-depth.fr|Combiner plusieurs protections]].
- [[secondary-lightning-lightning-remote-wallet-connection.fr|Relier une application à un nœud distant]].
- [[secondary-lightning-macaroon.fr|Les jetons d’accès macaroon de LND]].
- [[secondary-opsec-digital-hygiene.fr|Les habitudes de sécurité numérique]].
- [[secondary-privacy-browser-compartmentalization.fr|Séparer ses usages dans le navigateur]].
- [[secondary-privacy-principle-of-least-privilege.fr|Limiter les droits des applications]].
- [[secondary-privacy-public-wi-fi-risk.fr|Les risques d’un réseau Wi-Fi non fiable]].
- [[secondary-privacy-single-sign-on-risk.fr|La dépendance à une connexion centralisée]].

## Références

- PlanB cyp302 — Modern Cryptography Fundamentals.
