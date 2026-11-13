---
type: "project_note"
id: "replace-by-fee"
title: "Augmenter les frais avec RBF"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Replace-By-Fee"]
parent_ids: []
related_ids: ["transaction-fees", "bitcoin-mempool-policy", "bitcoin-transaction-confirmation"]
reviewed_at: "2026-11-06"
review_due: null
sources: ["https://raw.githubusercontent.com/bitcoin/bitcoin/v28.0/doc/release-notes.md", "https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Augmenter les frais avec RBF

## Questions couvertes

- Peut-on accélérer une transaction en attente ?

## Réponse courte

RBF permet de proposer le remplacement d’une transaction non confirmée par une autre qui paie davantage de frais. Cela peut améliorer ses chances d’être incluse prochainement.

## Explication

Le portefeuille prépare et signe une transaction concurrente utilisant des fonds déjà engagés dans la précédente. Les nœuds décident de l’accepter selon leur politique de remplacement et ses conditions. Le remplacement relève ainsi de la gestion des transactions en attente.

Une politique full-RBF peut accepter ce remplacement même si la transaction d’origine ne l’avait pas signalé. La possibilité concrète dépend aussi du logiciel du portefeuille et des moyens de signature disponibles.

## Limites et confusions

La politique RBF ne garantit pas la conservation des destinataires ni des montants des sorties. Le signataire peut les modifier dans le remplacement. Le destinataire doit vérifier la transaction de remplacement réelle et son état de confirmation ; son affichage dans un portefeuille ne garantit pas le règlement.

Augmenter les frais ne garantit pas une inclusion immédiate. RBF ne permet pas de modifier librement une transaction déjà confirmée dans la chaîne. L’absence de signalement RBF n’est pas une garantie de sécurité pour un paiement sans confirmation. Cette explication ne constitue pas une instruction pour remplacer un paiement réel ; il faut vérifier les montants, la destination et le coût proposés par le portefeuille.

## Approfondissements

- [[transaction-fees.fr|Les frais de transaction]].
- [[bitcoin-mempool-policy.fr|Règles locales et consensus]].
- [[bitcoin-transaction-confirmation.fr|Les confirmations]].

## Références

- [Référence publique conservée de la note source](https://raw.githubusercontent.com/bitcoin/bitcoin/v28.0/doc/release-notes.md).

- [BIP125](https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki).
