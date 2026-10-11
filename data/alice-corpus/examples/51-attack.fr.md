---
type: "project_note"
id: "51-attack"
title: "L’attaque majoritaire"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Minage et énergie"]
aliases: ["51% Attack"]
parent_ids: []
related_ids: ["mining-centralization", "bitcoin-consensus"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://econinfosec.org/archive/weis2013/papers/KrollDaveyFeltenWEIS2013.pdf", "https://bitcoin.org/bitcoin.pdf"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# L’attaque majoritaire

## Questions couvertes

- Que permet et que ne permet pas une attaque à 51 % ?

## Réponse courte

Une attaque majoritaire utilise une majorité malveillante de la puissance de calcul pour concurrencer la chaîne suivie par le réseau. Elle peut viser des doubles dépenses ou la censure de transactions.

## Explication

L’attaquant cherche à produire une chaîne valide avec davantage de travail accumulé. Une réorganisation peut alors retirer des confirmations à des transactions et permettre de remplacer ses propres paiements. Plus la réorganisation remonte loin, plus il faut refaire de travail ; aucune règle générale ne la limite aux seuls derniers blocs.

La puissance de calcul ne donne pas les clés privées des autres utilisateurs. Elle ne permet pas non plus d’imposer une subvention interdite aux nœuds qui appliquent leurs règles. Le coût pratique dépend du matériel, de l’énergie, de la durée et de la profondeur de l’attaque.

## Limites et confusions

Le terme « Goldfinger » désigne, dans les travaux de Kroll, Davey et Felten, une motivation de sabotage visant un avantage extérieur au système. Une attaque majoritaire peut servir cette motivation, mais les expressions ne sont pas synonymes.

Cette description ne chiffre pas le risque actuel ni ne garantit une détection préalable. Une chaîne concurrente peut être préparée sans être immédiatement publiée.

## Approfondissements

- [[mining-centralization.fr|La concentration du minage]] — examiner les concentrations de pouvoir
- [[bitcoin-consensus.fr|Le consensus]] — comprendre les règles de validité

## Références

- [Kroll, Davey et Felten, The Economics of Bitcoin Mining (2013)](https://econinfosec.org/archive/weis2013/papers/KrollDaveyFeltenWEIS2013.pdf).
- [Livre blanc Bitcoin](https://bitcoin.org/bitcoin.pdf).
