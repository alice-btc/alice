---
type: "project_note"
id: "bitcoin-halving"
title: "Le halving"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Halving"]
parent_ids: []
related_ids: ["bitcoin-monetary-policy", "bitcoin-finite-supply", "bitcoin-mining", "secondary-bitcoin-fee-only-security-model", "secondary-economics-stock-to-flow-ratio"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp", "https://developer.bitcoin.org/devguide/block_chain.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le halving

## Questions couvertes

- Que change un halving ?

## Réponse courte

Le halving divise par 2 la subvention de bloc tous les 210 000 blocs sur le réseau principal, soit environ tous les 4 ans. Il réduit la création de nouveaux bitcoins.

## Explication

La rémunération d’un mineur comporte 2 éléments distincts. La subvention crée de nouveaux bitcoins ; les frais proviennent des transactions incluses dans le bloc. Le halving concerne seulement la subvention. Il ne divise ni les frais de transaction ni le solde des détenteurs.

Le seuil est une hauteur de bloc. Sa date civile dépend donc du rythme réel de production des blocs et n’est connue à l’avance que par estimation. Les halvings successifs font décroître l’émission vers son plafond.

## Limites et confusions

Un halving ne promet aucune hausse du cours. Ses effets de marché dépendent notamment de la demande, des anticipations et des conditions économiques. La rentabilité des mineurs dépend aussi du prix, des frais, du coût d’exploitation et de la concurrence. Dire « récompense divisée par 2 » est imprécis si cette récompense inclut les frais.

## Approfondissements

- [[bitcoin-monetary-policy.fr|L’émission monétaire de Bitcoin]].
- [[bitcoin-finite-supply.fr|La limite de l’offre de bitcoins]].
- [[bitcoin-mining.fr|Comprendre le minage]].

- [[secondary-bitcoin-fee-only-security-model.fr|La rémunération minière fondée sur les frais]].
- [[secondary-economics-stock-to-flow-ratio.fr|Le ratio stock-flux et ses limites]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp).
- [Référence publique conservée de la note source](https://developer.bitcoin.org/devguide/block_chain.html).
