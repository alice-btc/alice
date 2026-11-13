---
type: "project_note"
id: "coinjoin-history"
title: "L'histoire de CoinJoin"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Histoire de CoinJoin", "CoinJoin history", "Origine de CoinJoin", "Gregory Maxwell CoinJoin"]
parent_ids: []
related_ids: ["coinjoin", "secondary-bitcoin-joinmarket", "payjoin"]
reviewed_at: "2026-11-13"
review_due: null
sources: ["https://bitcointalk.org/index.php?topic=279249.0", "https://github.com/JoinMarket-Org/joinmarket-clientserver", "https://wasabiwallet.io/"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# L'histoire de CoinJoin

## Questions couvertes

- Qui a inventé CoinJoin, et quand ?
- Quelle est l'histoire de CoinJoin ?
- Quels logiciels ont proposé des CoinJoin ?
- D'où vient le nom CoinJoin ?

## Réponse courte

CoinJoin a été proposé par le développeur Gregory Maxwell le 22 août 2013, dans un message du forum Bitcointalk intitulé « CoinJoin: Bitcoin privacy for the real world ». L'idée n'exige aucune modification du protocole.

## Explication

Le principe est de réunir dans une seule transaction des entrées appartenant à plusieurs personnes, chacune signant seulement ses propres entrées. Un observateur ne peut alors plus supposer que toutes les entrées ont le même propriétaire. Maxwell indiquait que ce type de transaction était déjà possible avec les règles existantes de Bitcoin.

Des logiciels ont ensuite rendu la coordination accessible : JoinMarket, où des participants rémunèrent d'autres utilisateurs pour se joindre à leur transaction, puis des portefeuilles avec coordinateur, comme Wasabi Wallet et son protocole WabiSabi, ou Samourai Wallet avec Whirlpool. Les modes de coordination, les frais et les garanties diffèrent selon l'implémentation.

## Limites et confusions

La disponibilité de ces services a changé au fil du temps, et certains coordinateurs ont cessé leur activité ; l'état actuel d'un logiciel précis doit être vérifié au moment de l'utiliser. Cette fiche ne recommande aucun service. Alice App ne propose pas de CoinJoin.

## Approfondissements

- [[coinjoin.fr|Comprendre CoinJoin]].
- [[secondary-bitcoin-joinmarket.fr|Le fonctionnement de JoinMarket]].
- [[payjoin.fr|Comprendre PayJoin]].

## Références

- https://bitcointalk.org/index.php?topic=279249.0.
- https://github.com/JoinMarket-Org/joinmarket-clientserver.
- https://wasabiwallet.io/.
