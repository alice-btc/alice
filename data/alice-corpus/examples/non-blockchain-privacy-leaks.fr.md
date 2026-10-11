---
type: "project_note"
id: "non-blockchain-privacy-leaks"
title: "Les fuites hors de la blockchain"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Non-Blockchain Privacy Leaks"]
parent_ids: []
related_ids: ["bitcoin-p2p-privacy", "kyc-data-leakage", "utxo-labeling", "secondary-bitcoin-privacy-by-omission", "secondary-opsec-bitcoin-discretion", "secondary-privacy-browser-compartmentalization", "secondary-privacy-metadata-hygiene", "secondary-privacy-private-browsing-mode", "secondary-privacy-public-wi-fi-risk"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les fuites hors de la blockchain

## Questions couvertes

- Quelles habitudes peuvent révéler mes usages Bitcoin ?

## Réponse courte

La confidentialité peut être compromise sans analyser directement la blockchain. Les comptes, les appareils, les achats et les échanges humains donnent souvent le contexte qui relie une transaction à une personne.

## Explication

Un serveur de portefeuille peut observer les adresses consultées. Un marchand connaît une livraison. Un support peut recevoir une capture d’écran révélant un solde ou un historique. Une publication publique peut faire connaître des habitudes et des avoirs supposés.

Ces éléments peuvent être combinés avec le registre public. Une bonne pratique on-chain ne suffit donc pas si les mêmes informations sont ensuite publiées ou transmises sans nécessité à un tiers.

## Limites et confusions

Un outil de confidentialité protège un périmètre précis. Tor agit sur une partie du réseau ; le coin control agit sur la sélection des fonds ; aucun ne retire une identité déjà communiquée dans une conversation ou une base client. Les mesures utiles dépendent des informations sensibles et des acteurs capables de les rapprocher.

## Approfondissements

- [[bitcoin-p2p-privacy.fr|La confidentialité sur le réseau]].
- [[kyc-data-leakage.fr|Les données d’identification exposées]].
- [[utxo-labeling.fr|Étiqueter ses UTXO]].

- [[secondary-bitcoin-privacy-by-omission.fr|La confidentialité par réduction des données publiées]].
- [[secondary-opsec-bitcoin-discretion.fr|La discrétion sur ses bitcoins]].
- [[secondary-privacy-browser-compartmentalization.fr|Séparer ses usages dans le navigateur]].
- [[secondary-privacy-metadata-hygiene.fr|Les métadonnées cachées dans les fichiers]].
- [[secondary-privacy-private-browsing-mode.fr|Les limites de la navigation privée]].
- [[secondary-privacy-public-wi-fi-risk.fr|Les risques d’un réseau Wi-Fi non fiable]].

## Références

- PlanB btc303 — Bitcoin Development Philosophy.
