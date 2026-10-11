---
type: "project_note"
id: "secondary-privacy-private-browsing-mode"
title: "Les limites de la navigation privée"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Private Browsing Mode"]
parent_ids: ["non-blockchain-privacy-leaks", "tor-browser"]
related_ids: ["non-blockchain-privacy-leaks", "tor-browser"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les limites de la navigation privée

## Questions couvertes

- Les limites de la navigation privée — quel mécanisme et quelles limites ?

## Réponse courte

Le mode privé limite principalement les traces locales d’une session : historique, cookies persistants et formulaires. Il ne rend pas anonyme auprès du FAI, du site visité ou d’un réseau d’entreprise.

## Explication

- Utile pour sessions temporaires, recherches ponctuelles ou éviter certains cookies persistants.
- Ne masque pas l’adresse IP ni l’activité réseau.
- Ne protège pas contre malware, phishing ou faux sites.
- Doit être expliqué comme un outil de réduction de traces locales, pas comme Tor.

## Limites et confusions

Le mode privé ne masque pas l’adresse IP. Les fichiers téléchargés et les traces conservées par les services ou le réseau ne disparaissent pas avec la fermeture de la fenêtre.

## Approfondissements

- [[non-blockchain-privacy-leaks.fr|Les fuites hors de la blockchain]] pour replacer ce mécanisme dans son contexte.
- [[tor-browser.fr|Le rôle et les limites de Tor]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB scu101 — Update Your Online Security
