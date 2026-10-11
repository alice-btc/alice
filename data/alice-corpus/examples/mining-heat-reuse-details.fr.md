---
type: "project_note"
id: "mining-heat-reuse-details"
title: "Réutiliser la chaleur du minage pour chauffer"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["mining", "energy"]
aliases: []
parent_ids: ["bitcoin-energy-debate", "asic-heat-reuse", "bitcoin-mining"]
related_ids: ["mining-curtailed-energy", "mining-methane-mitigation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://www.mara.com/posts/recycling-heat-from-data-centers-to-warm-a-community-in-finland", "https://www.energy.gov/energysaver/heat-pump-systems", "https://www.energy.gov.au/households/heating-and-cooling", "https://betterbuildingssolutioncenter.energy.gov/sites/default/files/attachments/87812.pdf", "https://offchain.media/article/orange-is-the-new-green/"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Réutiliser la chaleur du minage pour chauffer

## Questions couvertes

- Un ASIC peut-il remplacer un radiateur ?
- Est-ce du chauffage gratuit ou plus efficace ?
- Comment calculer l’énergie et les émissions réellement économisées ?

## Réponse courte

La quasi-totalité de l’électricité consommée par un ASIC finit en chaleur. Si cette chaleur est récupérée au bon endroit et au bon moment, elle peut remplacer une partie d’un chauffage existant, pendant que l’appareil participe au minage. L’intérêt dépend du chauffage remplacé, de la chaleur utile et des coûts complets de l’installation.

## Explication

Un appareil consommant 1 kW pendant 1 heure utilise 1 kWh d’électricité. À l’échelle du local et hors pertes vers l’extérieur, cela donne approximativement 1 kWh de chaleur. Le calcul n’absorbe pas une fraction d’énergie qui disparaîtrait ensuite ; le traitement informatique et la dissipation thermique font partie du même fonctionnement.

La chaleur peut être récupérée par l’air ou par un circuit liquide avec échangeur. Pour chauffer un bâtiment ou de l’eau, il faut une température compatible, des conduites, une régulation et parfois un équipement complémentaire. Toute la chaleur dissipée par les machines n’arrive donc pas nécessairement jusqu’à l’usage recherché.

Un exemple annoncé par MARA en juin 2024 est un pilote de 2 MW en Finlande raccordé à un réseau de chaleur desservant environ 11 000 habitants. Cela ne signifie pas que ces seuls mineurs couvrent tous leurs besoins de chauffage. L’annonce de l’exploitant montre une intégration concrète ; la production thermique livrée et le combustible évité s’évaluent avec les données d’exploitation.

L’argument de *Orange is the New Green* prend ici une forme pratique. Au lieu d’évacuer toute la chaleur d’un calculateur, on l’utilise pour un besoin existant. Face à un radiateur électrique résistif, le revenu minier peut réduire le coût net du chauffage, sans augmenter automatiquement son rendement thermique.

## Limites et confusions

La comparaison change face à une pompe à chaleur. Celle-ci déplace de la chaleur et peut fournir plusieurs kWh de chaleur avec 1 kWh électrique, selon les conditions. Un ASIC seul dissipe l’électricité qu’il consomme. Le DOE décrit cet avantage des pompes à chaleur ; il faut donc comparer le même service rendu, pas seulement 2 factures électriques.

Exemple fictif, sans prévision de rentabilité. Un ASIC consomme 3 kWh et fournit 2,4 kWh de chaleur utile après les pertes du système. Un radiateur résistif aurait besoin d’environ 2,4 kWh pour ce service ; une pompe à chaleur ayant un coefficient de performance de 3 aurait besoin d’environ 0,8 kWh. Le revenu du minage peut modifier le coût financier, mais ne supprime pas cette différence de consommation.

Le bilan économique annuel compte l’électricité, les machines, l’échangeur, les auxiliaires et la maintenance, puis retranche le chauffage effectivement évité et le revenu du minage. Ce dernier varie ; bruit, disponibilité et besoin de chaleur déterminent aussi si le système convient au lieu.

En été, produire une chaleur sans débouché ne donne aucune économie de chauffage. Si une climatisation doit ensuite l’évacuer, elle ajoute une consommation. Une réutilisation saisonnière peut rester utile, à condition de mesurer cette saisonnalité.

L’empreinte carbone n’est donc ni automatiquement divisée par 2 parce que l’appareil rend 2 services, ni automatiquement nulle. Le gain dépend des équipements et combustibles réellement remplacés, de l’électricité supplémentaire et du cycle de vie des installations. La répartition comptable des émissions entre minage et chauffage est une convention à expliciter.

## Approfondissements

- [[bitcoin-energy-debate.fr|Bitcoin et énergie — comprendre les coûts et les usages utiles]].
- [[mining-curtailed-energy.fr|Quand le minage valorise une énergie sans débouché]].
- [[mining-methane-mitigation.fr|Quand le minage peut financer une réduction des émissions de méthane]].

## Références

- [MARA, pilote finlandais annoncé le 20 juin 2024](https://www.mara.com/posts/recycling-heat-from-data-centers-to-warm-a-community-in-finland), déclaration d’exploitant.
- [Gouvernement australien, chauffage résistif](https://www.energy.gov.au/households/heating-and-cooling).
- [DOE, fonctionnement des pompes à chaleur](https://www.energy.gov/energysaver/heat-pump-systems).
- [DOE, décarbonation des systèmes thermiques](https://betterbuildingssolutioncenter.energy.gov/sites/default/files/attachments/87812.pdf).
- [Orange is the New Green, chaleur du minage](https://offchain.media/article/orange-is-the-new-green/), point de départ éditorial.
