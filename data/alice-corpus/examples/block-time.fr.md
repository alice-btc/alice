---
type: "project_note"
id: "block-time"
title: "Le temps entre les blocs"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Minage et énergie"]
aliases: ["Block Time"]
parent_ids: []
related_ids: ["mining-difficulty-details", "bitcoin-utxo"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://bitcoin.org/bitcoin.pdf", "https://developer.bitcoin.org/devguide/block_chain.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le temps entre les blocs

## Questions couvertes

- Pourquoi un bloc peut-il prendre plus de 10 minutes ?

## Réponse courte

Bitcoin vise 1 bloc toutes les 10 minutes en moyenne. Le prochain bloc peut arriver beaucoup plus vite ou beaucoup plus tard ; ce délai n’est pas un rendez-vous garanti.

## Explication

Les mineurs effectuent un grand nombre de tentatives indépendantes. Trouver un résultat conforme à la difficulté reste probabiliste. Attendre déjà 10 minutes ne signifie donc pas que le bloc doit tomber immédiatement.

L’ajustement de difficulté réagit aux variations de puissance de calcul pour rapprocher la cadence moyenne de sa cible. Une baisse soudaine du hashrate peut ralentir les blocs avant cet ajustement. Cette cadence influence l’attente des confirmations et le rythme d’émission des nouveaux bitcoins.

## Limites et confusions

Le délai du prochain bloc ne donne pas à lui seul le délai de confirmation de votre paiement. La transaction doit aussi être connue des mineurs et retenue dans un bloc, ce qui dépend notamment de ses frais.

Attendre davantage de confirmations réduit le risque de réorganisation dans le modèle de sécurité habituel ; cela ne fournit pas une irréversibilité mathématique. La cible de 10 minutes décrit le protocole sans prouver toutes les intentions historiques de son créateur.

## Approfondissements

- [[mining-difficulty-details.fr|L’ajustement de difficulté en détail]] — Ajustement de difficulté — comprendre la correction de cadence
- [[bitcoin-utxo.fr|Comprendre les UTXO]] — suivre les sorties d’une transaction confirmée

## Références

- [Livre blanc Bitcoin, sections 7 et 11](https://bitcoin.org/bitcoin.pdf).
- [Guide développeur, chaîne](https://developer.bitcoin.org/devguide/block_chain.html).
