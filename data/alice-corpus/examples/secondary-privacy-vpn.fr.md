---
type: "project_note"
id: "secondary-privacy-vpn"
title: "Ce que protège un VPN"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["VPN"]
parent_ids: ["bitcoin-p2p-privacy", "tor-browser"]
related_ids: ["bitcoin-p2p-privacy", "tor-browser"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB scu202 — Improve Your Personal Digital Security", "PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Ce que protège un VPN

## Questions couvertes

- Ce que protège un VPN — quel mécanisme et quelles limites ?

## Réponse courte

Un VPN chiffre le trafic entre l’appareil et un fournisseur VPN, masquant certaines informations au réseau local ou au FAI mais déplaçant une partie de la confiance vers le fournisseur VPN.

## Explication

- Un VPN ne rend pas anonyme par magie.
- Il peut protéger sur réseaux Wi-Fi non fiables ou contourner certaines restrictions.
- Le fournisseur VPN peut devenir un point d’observation central.
- Pour Bitcoin, il doit être pensé avec Tor, nœud personnel et modèle de menace.

## Limites et confusions

Le VPN protège le trajet jusqu’au fournisseur et déplace une partie de la confiance. Il ne supprime pas les liens créés par les comptes, les transactions ou un appareil compromis.

## Approfondissements

- [[bitcoin-p2p-privacy.fr|La confidentialité sur le réseau]] pour replacer ce mécanisme dans son contexte.
- [[tor-browser.fr|Le rôle et les limites de Tor]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB scu202 — Improve Your Personal Digital Security
- PlanB scu101 — Update Your Online Security
