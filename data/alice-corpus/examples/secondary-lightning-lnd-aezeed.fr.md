---
type: "project_note"
id: "secondary-lightning-lnd-aezeed"
title: "Le format de récupération aezeed de LND"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["LND aezeed"]
parent_ids: ["lightning-node-backup", "wallet-recovery-phrase"]
related_ids: ["lightning-node-backup", "wallet-recovery-phrase"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Le format de récupération aezeed de LND

## Questions couvertes

- Le format de récupération aezeed de LND — quel mécanisme et quelles limites ?

## Réponse courte

aezeed est le format de seed spécifique à LND utilisé pour dériver le wallet on-chain associé au nœud Lightning.

## Explication

- Il ressemble à une phrase de 24 mots mais n’est pas une seed BIP39 classique.
- Il permet de retrouver les fonds revenus on-chain après fermeture de canaux.
- Il ne suffit pas à restaurer l’état dynamique des canaux Lightning.
- Il doit être sauvegardé avec le même sérieux qu’une seed de wallet.

## Limites et confusions

Cette fiche concerne LND. La phrase aezeed n’est pas interchangeable avec BIP39 et ne constitue pas, seule, une sauvegarde de l’état de tous les canaux.

## Approfondissements

- [[lightning-node-backup.fr|Les sauvegardes Lightning]] pour replacer ce mécanisme dans son contexte.
- [[wallet-recovery-phrase.fr|La phrase de récupération]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB lnp202 — Set up Your First Lightning Node
