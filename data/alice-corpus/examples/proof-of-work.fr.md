---
type: "project_note"
id: "proof-of-work"
title: "La preuve de travail"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["mining"]
aliases: ["Proof of Work"]
parent_ids: []
related_ids: ["bitcoin-mining", "hashrate", "mining-difficulty", "secondary-bitcoin-merged-mining", "secondary-bitcoin-rpow", "secondary-bitcoin-sha-256", "secondary-economics-proof-of-stake"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp", "https://bitcoin.org/bitcoin.pdf"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La preuve de travail

## Questions couvertes

- Pourquoi produire une preuve de travail ?

## Réponse courte

La preuve de travail permet aux mineurs de proposer des blocs en fournissant un résultat coûteux à produire et facile à vérifier. Les nœuds retiennent la chaîne valide qui représente le plus de travail accumulé.

## Explication

Les mineurs essaient des variantes d’en-tête de bloc jusqu’à obtenir un hash inférieur ou égal à la cible. Ils ne disposent pas d’un raccourci leur garantissant la prochaine réussite. Les nœuds peuvent ensuite contrôler le résultat et la validité du bloc avec bien moins de calcul.

Refaire un historique demande de produire du travail concurrent. La difficulté règle la fréquence attendue des réussites en fonction des conditions de production observées.

## Limites et confusions

Les mineurs proposent les blocs, mais ne peuvent pas imposer aux nœuds un bloc contraire à leurs règles. Détenir des BTC ne donne pas directement un vote dans ce mécanisme. Le capital peut cependant financer matériel et énergie ; la preuve de travail ne supprime pas le pouvoir économique. Production des blocs et vérification par les nœuds ont des coûts distincts.

## Approfondissements

- [[bitcoin-mining.fr|Comprendre le minage]].
- [[hashrate.fr|La puissance de calcul]].
- [[mining-difficulty.fr|La difficulté de minage]].

- [[secondary-bitcoin-merged-mining.fr|Le minage fusionné]].
- [[secondary-bitcoin-rpow.fr|Les preuves de travail réutilisables de Hal Finney]].
- [[secondary-bitcoin-sha-256.fr|SHA-256 et la preuve de travail]].
- [[secondary-economics-proof-of-stake.fr|Comparer preuve d’enjeu et preuve de travail]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp).
- [Référence publique conservée de la note source](https://bitcoin.org/bitcoin.pdf).
