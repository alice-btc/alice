---
type: "project_note"
id: "bitcoin-quantum-threat"
title: "Comprendre le risque quantique"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["bitcoin", "security"]
aliases: ["risque quantique Bitcoin", "ordinateur quantique"]
parent_ids: []
related_ids: ["bitcoin-quantum-threat-details"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://arxiv.org/abs/2603.28846v2", "https://github.com/bitcoin/bips/blob/master/bip-0360.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0361.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Comprendre le risque quantique

## Questions couvertes

- Que pourrait changer un ordinateur quantique pour Bitcoin ?
- Quel lien existe entre ordinateur quantique, clé publique et signature ?
- Une étude annonce-t-elle que Bitcoin a déjà été cassé ?
- Bitcoin dispose-t-il déjà d’une protection complète contre ce risque ?

## Réponse courte

Un ordinateur quantique suffisamment puissant pourrait retrouver certaines clés privées à partir de clés publiques et permettre des dépenses non autorisées. C’est un risque cryptographique étudié, pas la démonstration d’une attaque déjà réalisée contre Bitcoin. Les estimations de ressources et les propositions de protection ne permettent pas de fixer une date certaine.

## Explication

Une signature permet à un nœud de vérifier qu’une dépense a été autorisée avec les clés nécessaires. La sécurité des signatures utilisées par Bitcoin repose notamment sur un problème mathématique difficile à résoudre avec les ordinateurs classiques. Un ordinateur quantique adapté pourrait changer cette difficulté.

L’exposition de la clé publique compte. Une clé déjà visible donne plus de temps à un attaquant ; une clé révélée pendant une dépense crée une fenêtre plus courte. Les différents types de sorties et les pratiques d’utilisation ne présentent donc pas tous la même exposition.

Des chercheurs évaluent les ressources nécessaires à une attaque, tandis que des développeurs discutent d’évolutions possibles de Bitcoin. Une migration demanderait des décisions de protocole, une adoption par les participants et des adaptations des portefeuilles. Une proposition publiée ne signifie pas que ces étapes sont accomplies.

## Limites et confusions

- Une estimation sous hypothèses ne décrit pas une machine déjà construite.
- Le nombre de qubits annoncé ne suffit pas à comparer des machines. Leur qualité, la correction des erreurs et la vitesse des opérations comptent.
- Le risque sur les signatures ne doit pas être confondu avec une disparition automatique de toutes les protections de Bitcoin.
- Aucun calendrier certain d’attaque ni protection complète déjà acquise n’est présenté ici.

## Approfondissements

- [[bitcoin-quantum-threat-details.fr|Estimations et propositions face au risque quantique]] (bitcoin-quantum-threat-details) pour les chiffres datés, les hypothèses et les limites des BIP 360 et 361.

## Références

- [Étude arXiv 2603.28846, version 2 du 15 avril 2026](https://arxiv.org/abs/2603.28846v2).
- [BIP 360, proposition P2MR](https://github.com/bitcoin/bips/blob/master/bip-0360.mediawiki).
- [BIP 361, proposition de migration](https://github.com/bitcoin/bips/blob/master/bip-0361.mediawiki).
