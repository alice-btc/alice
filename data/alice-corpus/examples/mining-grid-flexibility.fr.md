---
type: "project_note"
id: "mining-grid-flexibility"
title: "Comment les mineurs peuvent aider à équilibrer un réseau électrique"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["mining", "energy"]
aliases: []
parent_ids: ["bitcoin-energy-debate", "bitcoin-mining"]
related_ids: ["mining-curtailed-energy", "mining-renewable-projects"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://www.ercot.com/news/release/2022-12-06-ercot-creates-voluntary", "https://www.ercot.com/files/docs/2023/03/27/December-2022-Cold-Weather-Operations-Public-Report.pdf", "https://www.ercot.com/services/programs/load", "https://www.ercot.com/files/docs/2024/11/01/MORA_January2025.pdf", "https://www.iea.org/reports/electricity-2026/flexibility", "https://pmc.ncbi.nlm.nih.gov/articles/PMC13634397/", "https://medium.com/@AlexStach/bitcoin-une-solution-contre-intuitive-au-changement-climatique-668364b0c205"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Comment les mineurs peuvent aider à équilibrer un réseau électrique

## Questions couvertes

- Comment arrêter des mineurs peut-il aider le réseau ?
- Qu’a-t-on réellement observé au Texas ?
- Une mine est-elle une réserve d’électricité ?

## Réponse courte

Une mine pilotable peut réduire rapidement sa consommation quand l’électricité manque ou devient chère. Cette baisse de demande laisse de la puissance disponible pour d’autres usages. Pour le gestionnaire du réseau, sa valeur dépend de la réponse réellement fournie, des engagements du mineur et des contraintes locales.

## Explication

Le réseau doit équilibrer production et consommation. Une ferme de minage peut interrompre une partie de ses machines et renoncer temporairement à des recettes. Elle n’a pas nécessairement les mêmes contraintes de continuité qu’un hôpital ou qu’un procédé industriel qui perdrait sa production en s’arrêtant. C’est cette possibilité de modulation, soulignée par Alexandre Stachtchenko, qui permet de fournir un service énergétique.

Plusieurs mécanismes coexistent. Le mineur peut s’arrêter volontairement parce que le prix de l’électricité dépasse ses recettes attendues. Il peut aussi répondre à une demande de l’opérateur, ou participer à un service rémunéré après qualification. ERCOT distingue notamment les réponses aux prix, les services d’urgence et les services auxiliaires. Ces engagements n’ont ni les mêmes obligations ni les mêmes modalités de rémunération.

Un résultat observé illustre cette flexibilité. Pendant la tempête hivernale de décembre 2022, ERCOT rapporte que les grandes charges flexibles enregistrées ont réduit leur consommation de 1 530 à 130 MW au pic de demande, soit 91,5 %. Ce groupe comprend des installations de minage Bitcoin et d’autres centres de données. Le chiffre ne doit donc pas être attribué intégralement à Bitcoin. Le programme annoncé par ERCOT le 6 décembre 2022 était volontaire ; il ne décrit pas à lui seul les règles de tous les contrats actuels.

Une mine qui consommait 10 MW et descend à 1 MW réduit la demande de 9 MW. Elle n’injecte pas 9 MW supplémentaires dans le réseau. Pour savoir si sa présence améliore le système sur l’année, il faut aussi examiner les périodes où elle fonctionne, son raccordement et les capacités de production qu’elle sollicite.

## Limites et confusions

La capacité technique à s’arrêter ne prouve pas que le mineur s’arrêtera au bon moment. Une prévision ERCOT pour janvier 2025 modélisait les coupures selon le prix du courant et les revenus du minage, avec une consommation résiduelle pour les auxiliaires. Il s’agit d’une hypothèse économique de planification, pas d’une garantie physique universelle.

Pour évaluer un service réel, on recherche une charge de référence, des mesures horodatées, une commande ou un signal de prix, une durée d’effacement et les conditions de reprise. La baisse doit se produire au bon endroit ; arrêter une mine derrière une autre contrainte du réseau peut rendre un service différent.

L’IEA décrit aussi la contribution des batteries, des autres charges flexibles et des réseaux. Le minage peut compléter ces ressources. Sa participation ne démontre pas automatiquement une baisse de la facture des habitants ou des émissions ; ces résultats demandent une comparaison avec le système sans cette mine.

Une étude économétrique de Gill, Stinner et Tyrell publiée en septembre 2026 sur le Texas entre 2021 et 2024 trouve un effet sur les prix de gros nocturnes locaux et ne constate pas la même flexibilité sur les cycles ordinaires que lors des pénuries extrêmes. Ce résultat local ne mesure pas directement la facture des ménages et ne contredit pas l’effacement observé pendant la tempête de 2022. Il invite à vérifier le comportement habituel, en plus des jours de crise.

## Approfondissements

- [[mining-curtailed-energy.fr|Quand le minage valorise une énergie sans débouché]].
- [[mining-renewable-projects.fr|Comment le minage peut soutenir un projet renouvelable]].
- [[bitcoin-energy-debate.fr|Bitcoin et énergie — comprendre les coûts et les usages utiles]].

## Références

- [ERCOT, programme volontaire de décembre 2022](https://www.ercot.com/news/release/2022-12-06-ercot-creates-voluntary).
- [ERCOT, rapport sur la tempête de décembre 2022, p. 24 imprimée](https://www.ercot.com/files/docs/2023/03/27/December-2022-Cold-Weather-Operations-Public-Report.pdf).
- [ERCOT, catégories de réponse de la demande](https://www.ercot.com/services/programs/load).
- [ERCOT, hypothèses de charge pour janvier 2025](https://www.ercot.com/files/docs/2024/11/01/MORA_January2025.pdf).
- [Gill, Stinner et Tyrell, iScience, 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC13634397/), étude locale des prix de gros.
- [IEA, flexibilité, Electricity 2026](https://www.iea.org/reports/electricity-2026/flexibility).
- [Alexandre Stachtchenko, argumentaire de 2023](https://medium.com/@AlexStach/bitcoin-une-solution-contre-intuitive-au-changement-climatique-668364b0c205).
