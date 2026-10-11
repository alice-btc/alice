---
type: "project_note"
id: "tor-browser"
title: "Le rôle et les limites de Tor"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Tor Browser"]
parent_ids: []
related_ids: ["bitcoin-p2p-privacy", "phishing-and-social-engineering", "threat-model", "secondary-privacy-private-browsing-mode", "secondary-privacy-vpn"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le rôle et les limites de Tor

## Questions couvertes

- Que peut protéger Tor dans mes usages Bitcoin ?

## Réponse courte

Tor Browser fait passer la navigation par le réseau Tor afin de masquer l’adresse IP d’origine à certains observateurs et de limiter certaines formes de suivi. Il ne rend pas automatiquement toute activité Bitcoin anonyme.

## Explication

Le navigateur agit sur les communications qu’il prend en charge. Un portefeuille ou un nœud séparé ne passe pas nécessairement par Tor parce que le navigateur est ouvert. Leur connexion doit être évaluée selon leur propre configuration.

Le réseau peut réduire le lien direct entre un utilisateur et le site consulté. Cela peut être utile pour consulter des informations sans révéler immédiatement son adresse IP au service. Les comportements et les comptes utilisés restent toutefois des sources d’identification.

## Limites et confusions

Se connecter à un compte nominatif révèle toujours cette identité au service. Tor ne rend pas un faux site légitime, ne répare pas un appareil infecté et ne cache pas les données publiques de la blockchain. Les performances et limites opérationnelles varient. Il faut distinguer la protection réseau de la confidentialité des transactions et des informations volontairement fournies.

## Approfondissements

- [[bitcoin-p2p-privacy.fr|La confidentialité sur le réseau]].
- [[phishing-and-social-engineering.fr|Les faux supports et le phishing]].
- [[threat-model.fr|Adapter la protection aux risques]].

- [[secondary-privacy-private-browsing-mode.fr|Les limites de la navigation privée]].
- [[secondary-privacy-vpn.fr|Ce que protège un VPN]].

## Références

- PlanB scu101 — Update Your Online Security.
