---
type: "project_note"
id: "bitcoin-private-key"
title: "La clé privée"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Bitcoin Private Key"]
parent_ids: []
related_ids: ["bitcoin-public-key", "wallet-recovery-phrase", "wallet-backup", "secondary-bitcoin-casascius-physical-bitcoins", "secondary-bitcoin-extended-private-key", "secondary-bitcoin-pseudorandom-number-generator"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki", "https://developer.bitcoin.org/devguide/transactions.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La clé privée

## Questions couvertes

- À quoi sert une clé privée ?

## Réponse courte

Une clé privée est un secret numérique permettant de produire des signatures. Ces signatures servent à satisfaire les conditions de dépense des sorties associées.

## Explication

Le réseau vérifie une signature à l’aide d’informations publiques, sans avoir besoin de connaître le secret. Beaucoup de portefeuilles dérivent plusieurs clés depuis une seed plutôt que de demander à l’utilisateur de conserver chaque clé séparément.

La protection vise à empêcher un tiers de signer à la place du détenteur, tout en conservant une possibilité de récupération. La phrase de récupération peut donc être aussi sensible que les clés qu’elle permet de reconstruire.

## Limites et confusions

Perdre 1 copie ou 1 appareil ne rend pas les fonds définitivement inaccessibles si une sauvegarde permet de récupérer les moyens nécessaires. En multisig, la possibilité de dépenser dépend du seuil et des conditions prévues. Une adresse ou une clé publique seule ne remplace pas une clé privée. Aucun support légitime n’a besoin de la phrase secrète pour simplement examiner un problème de réception.

## Approfondissements

- [[bitcoin-public-key.fr|La clé publique]].
- [[wallet-recovery-phrase.fr|La phrase de récupération]].
- [[wallet-backup.fr|Préparer une sauvegarde]].

- [[secondary-bitcoin-casascius-physical-bitcoins.fr|Les pièces physiques Casascius]].
- [[secondary-bitcoin-extended-private-key.fr|Les clés privées étendues]].
- [[secondary-bitcoin-pseudorandom-number-generator.fr|Les générateurs pseudo-aléatoires cryptographiques]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).
- [Référence publique conservée de la note source](https://developer.bitcoin.org/devguide/transactions.html).
