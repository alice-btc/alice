---
type: "project_note"
id: "mining-curtailed-energy"
title: "Quand le minage valorise une énergie sans débouché"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["mining", "energy"]
aliases: []
parent_ids: ["bitcoin-energy-debate", "bitcoin-mining"]
related_ids: ["mining-grid-flexibility", "mining-renewable-projects"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://www.nlr.gov/news/detail/program/2022/reframing-curtailment", "https://www.iea.org/reports/integrating-solar-and-wind/executive-summary", "https://gridlesscompute.com/", "https://pubs.acs.org/doi/10.1021/acssuschemeng.2c06077", "https://offchain.media/article/orange-is-the-new-green/"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Quand le minage valorise une énergie sans débouché

## Questions couvertes

- Que signifie miner avec un surplus ou une énergie échouée ?
- Les mineurs consomment-ils une énergie qui aurait été gaspillée ?
- Pourquoi ne pas envoyer cette électricité aux particuliers ?

## Réponse courte

Le minage peut acheter une production électrique qui ne trouve pas de consommateur au même endroit et au même moment. Cela donne une recette au producteur et peut réduire l’écrêtement. Il faut identifier ce surplus sur le site concerné ; le faible prix du courant ne suffit pas à le prouver.

## Explication

L’écrêtement consiste à réduire volontairement la production disponible. Une éolienne peut être bridée parce que la ligne électrique est saturée ou que la demande est faible. Dans ce cas, l’électricité correspondante n’est souvent pas produite, plutôt que produite puis jetée. Le NREL expliquait en 2022 que conserver une capacité de production supérieure à la demande de certaines heures peut aussi être un choix rationnel pour la fiabilité du système.

L’énergie échouée désigne ici une ressource difficile à valoriser à cause de l’isolement, d’un raccordement absent ou d’une demande insuffisante. Le minage peut déplacer ses équipements près de la ressource, utiliser une connexion Internet et vendre sa production numérique sans transporter l’électricité jusqu’à un autre pays. Il reste soumis aux routes, aux équipements électriques, au refroidissement et à la maintenance.

Prenons un exemple fictif. Une petite centrale peut fournir 1 MW pendant certaines heures, mais les clients raccordés n’en demandent que 600 kW. Une mine pourrait acheter une partie des 400 kW disponibles. Quand la demande locale augmente, ce surplus diminue. Un pilotage et un contrat donnant priorité aux autres clients permettent alors de réduire le minage. Les 400 kW ne constituent pas une disponibilité annuelle garantie.

Gridless décrit un modèle de ce type sur des sites hydroélectriques africains. L’exploitant présente le minage comme un acheteur flexible de l’électricité inutilisée, avec priorité aux besoins locaux. Cela documente un modèle opérationnel déclaré ; les quantités évitées, les tarifs et le respect de cette priorité se contrôlent pour chaque site. La synthèse de Velický publiée par ACS en 2023 examine également l’intérêt de la mobilité et de la flexibilité du minage pour les producteurs.

## Limites et confusions

Acheter de l’électricité à bas prix peut aussi signifier profiter d’un tarif subventionné, d’un contrat favorable ou d’une production fossile bon marché. Sur un réseau partagé, cette nouvelle demande peut modifier la production, les prix et les besoins de raccordement. Il n’existe donc pas de règle générale selon laquelle les mineurs ne concurrencent jamais les particuliers.

Le bon comparatif inclut les solutions accessibles sur place. Une ligne, une batterie, du pompage, une consommation industrielle ou de nouveaux clients peuvent mieux valoriser la ressource. L’IEA traite ces solutions comme complémentaires. Miner transforme l’électricité en calcul et en chaleur ; cela ne permet pas de la récupérer électriquement le soir comme avec une batterie.

Un projet convaincant précise les heures de surplus, le compteur utilisé, le fonctionnement sans mine et les règles de réduction de charge. Il montre aussi que le revenu espéré couvre les équipements même avec une utilisation intermittente.

## Approfondissements

- [[mining-grid-flexibility.fr|Comment les mineurs peuvent aider à équilibrer un réseau électrique]].
- [[mining-renewable-projects.fr|Comment le minage peut soutenir un projet renouvelable]].
- [[bitcoin-energy-debate.fr|Bitcoin et énergie — comprendre les coûts et les usages utiles]].

## Références

- [NREL, explication de l’écrêtement, 2022](https://www.nlr.gov/news/detail/program/2022/reframing-curtailment).
- [IEA, intégration du solaire et de l’éolien, 2024](https://www.iea.org/reports/integrating-solar-and-wind/executive-summary).
- [Gridless, modèle d’exploitation](https://gridlesscompute.com/), déclaration de l’entreprise.
- [Velický, ACS, 2023](https://pubs.acs.org/doi/10.1021/acssuschemeng.2c06077), synthèse scientifique.
- [Orange is the New Green](https://offchain.media/article/orange-is-the-new-green/), point de départ éditorial.
