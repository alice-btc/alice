---
type: "project_note"
id: "fedimint-custody-and-privacy"
title: "Fedimint, garde fédérée et confidentialité"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin-layers", "custody", "privacy"]
aliases: ["Fedimint", "gardiens", "ecash fédéré"]
parent_ids: ["cashu-et-confiance-dans-le-mint", "bitcoin-layered-architecture", "self-custody"]
related_ids: ["spark-trust-and-exits", "ark-implementations-bark-arkade"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://offchain.media/article/what-ecash-david-chaums-confidential-transaction-protocol-bitcoin/", "https://fedimint.org/docs/TradeOffs/Trust-Trade-Offs/", "https://fedimint.org/guardians/intro", "https://fedimint.org/users/intro"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Fedimint, garde fédérée et confidentialité

## Questions couvertes

- Qui garde les bitcoins dans Fedimint ?
- Que protègent les signatures aveugles ?
- Une fédération remplace-t-elle la garde personnelle des clés ?

## Réponse courte

Fedimint organise une garde collective des BTC par des gardiens. L’utilisateur détient des unités d’e-cash échangeables auprès de la fédération. La confidentialité des transferts peut être améliorée tout en conservant une dépendance envers ces gardiens.

## Explication

Les gardiens détiennent les clés permettant de gérer la réserve de bitcoins selon le seuil configuré. L’utilisateur reçoit des unités numériques dont la validation repose sur des signatures aveugles. Ce mécanisme limite le lien que la fédération peut établir entre leur émission et leur utilisation.

L’utilisateur n’a pas, avec ces unités seules, les clés qui lui permettraient de dépenser directement une part de la réserve Bitcoin. La fédération doit fonctionner et honorer les conversions. Une collusion suffisante, une indisponibilité ou une émission non couverte peuvent compromettre les fonds.

Le modèle repose donc sur des garanties cryptographiques et sur une confiance explicite envers une communauté de gardiens. La réputation peut inciter à bien agir ; elle ne garantit pas l’absence de collusion.

## Limites et confusions

Confidentialité des unités, métadonnées réseau et données observées par les passerelles Lightning sont des sujets distincts. La signature aveugle ne rend pas toute l’activité invisible.

Transmettre une unité hors ligne ne prouve pas à lui seul qu’elle n’a pas déjà été dépensée. Ne pas promettre une validation complète hors ligne pour toute application Fedimint.

La synthèse d’Offchain Media est recoupée avec les documents Fedimint consultés le 2026-10-11. Aucun audit de réserve, de fédération ou de wallet précis n’a été réalisé.

## Approfondissements

- [[spark-trust-and-exits.fr|Spark, opérateurs et sorties vers Bitcoin]] pour comparer la garde fédérée avec un modèle à clé utilisateur et opérateurs.
- [[ark-implementations-bark-arkade.fr|Ark, Bark et Arkade, comprendre les différences]] pour examiner les conditions de sortie des VTXO.

## Références

- [Marius, Offchain Media, e-cash, Cashu et Fedimint, 8 mai 2026](https://offchain.media/article/what-ecash-david-chaums-confidential-transaction-protocol-bitcoin/).
- [Fedimint, confidentialité et confiance](https://fedimint.org/docs/TradeOffs/Trust-Trade-Offs/).
- [Fedimint, rôle des gardiens](https://fedimint.org/guardians/intro).
- [Fedimint, présentation aux utilisateurs](https://fedimint.org/users/intro).
