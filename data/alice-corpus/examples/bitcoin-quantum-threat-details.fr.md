---
type: "project_note"
id: "bitcoin-quantum-threat-details"
title: "Estimations et propositions face au risque quantique"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin", "security"]
aliases: ["BIP 360", "BIP 361", "P2MR", "signatures post-quantiques"]
parent_ids: ["bitcoin-quantum-threat"]
related_ids: []
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://arxiv.org/abs/2603.28846v2", "https://github.com/bitcoin/bips/blob/master/bip-0360.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0361.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Estimations et propositions face au risque quantique

## Questions couvertes

- Que signifie l’estimation de moins de 500 000 qubits physiques ?
- Quelle différence entre qubits physiques et logiques ?
- Comment distinguer exposition longue et exposition courte d’une clé publique ?
- Que proposent les BIP 360 et 361, et que ne garantissent-ils pas ?
- Peut-on annoncer une date de migration ou de première attaque ?

## Réponse courte

Les estimations dépendent d’hypothèses matérielles et algorithmiques. Elles ne prouvent pas qu’une machine capable d’attaquer Bitcoin a été construite. Les BIP 360 et 361 sont des propositions au statut `Draft` dans les textes consultés le 2026-10-11 ; ils ne constituent ni une protection complète activée ni un calendrier adopté.

## Explication

### Une estimation datée, pas une machine construite

L’étude de Ryan Babbush et ses coauteurs, **arXiv 2603.28846v2, révisée le 15 avril 2026**, estime qu’une attaque sur le problème du logarithme discret elliptique de 256 bits pourrait utiliser **moins de 500 000 qubits physiques** avec une architecture supraconductrice, une connectivité planaire et un taux d’erreur physique de **10⁻³**. Ce résultat modélise des ressources sous hypothèses ; il ne rapporte pas la construction de cette machine ni une attaque réalisée. [Résumé et version originale](https://arxiv.org/abs/2603.28846v2).

Un qubit physique est un composant matériel. Un qubit logique est une unité rendue plus fiable par la correction des erreurs. Le rapport entre les 2 dépend de l’architecture et des erreurs. Un décompte de qubits isolé ne suffit donc pas à comparer des machines ou à prédire une échéance.

### Des propositions dont la portée diffère

| Texte consulté le 2026-10-11 | Portée proposée | Limite à conserver |
|---|---|---|
| BIP 360, `Draft`, P2MR | Propose une sortie engagée sur un arbre de scripts, sans chemin de dépense par clé comme celui de Taproot. Vise l’exposition longue des clés publiques. | N’introduit pas à lui seul des signatures post-quantiques complètes. Une clé révélée pendant une transaction en attente peut rester une cible ; une protection contre ces attaques courtes demande davantage. [Texte original](https://github.com/bitcoin/bips/blob/master/bip-0360.mediawiki). |
| BIP 361, `Draft`, type `Informational` | Propose une migration puis des restrictions sur l’usage des anciennes signatures. | Dépend d’un futur BIP de signatures post-quantiques encore indiqué comme non défini. Son calendrier est une proposition relative à une éventuelle activation, pas une échéance adoptée par Bitcoin. [Texte original](https://github.com/bitcoin/bips/blob/master/bip-0361.mediawiki). |

L’exposition longue donne à l’attaquant le temps d’exploiter une clé publique déjà connue. L’exposition courte concerne notamment sa révélation pendant l’attente d’une confirmation. Cacher une clé jusqu’à la dépense ne résout pas à lui seul le scénario d’une attaque assez rapide pendant cette attente.

Une migration pose aussi des questions d’accès aux fonds et de traitement des sorties qui ne migreraient pas. Les restrictions proposées demandent un examen de leurs conséquences ; leur intention protectrice ne vaut pas adoption ni garantie de résultat.

## Limites et confusions

- Aucun classement des machines les plus avancées sur un simple nombre de qubits n’est déduit ici.
- Les dates d’une étude, d’une révision et d’un BIP sont des dates de publication, pas des dates prédites d’attaque.
- Un BIP numéroté ou au statut `Draft` ne prouve pas son activation dans Bitcoin.
- Les hypothèses matérielles, les estimations et les textes de migration doivent être revérifiés avant une mise à jour. Cette fiche rapporte leur état documentaire, sans validation expérimentale indépendante.

## Approfondissements

- [[bitcoin-quantum-threat.fr|Comprendre le risque quantique]] (bitcoin-quantum-threat) pour revenir à l’introduction.

## Références

- [Babbush et coauteurs, arXiv 2603.28846v2](https://arxiv.org/abs/2603.28846v2), version révisée le 15 avril 2026, pour l’estimation et ses hypothèses.
- [BIP 360, Pay-to-Merkle-Root](https://github.com/bitcoin/bips/blob/master/bip-0360.mediawiki), pour sa portée sur l’exposition longue et les limites sur l’exposition courte.
- [BIP 361, Post Quantum Migration and Legacy Signature Sunset](https://github.com/bitcoin/bips/blob/master/bip-0361.mediawiki), pour la migration proposée, son statut et sa dépendance à une proposition de signatures à définir.
