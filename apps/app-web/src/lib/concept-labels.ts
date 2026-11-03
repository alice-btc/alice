// The concepts of Alice's learning profile, named in the interface language.
// The profile itself (packages/alice-ai) stores only the ids.

import type { KnowledgeConcept } from '@alice-wallet/alice-ai/pedagogical-profile-core';
import type { MessageKey } from '../i18n/translate.ts';

export const CONCEPT_LABEL_KEYS: Record<KnowledgeConcept, MessageKey> = {
  'bitcoin-basics': 'memory.concept.bitcoinBasics',
  'bitcoin-cryptography': 'memory.concept.bitcoinCryptography',
  'transactions-utxo': 'memory.concept.transactionsUtxo',
  'keys-self-custody': 'memory.concept.keysSelfCustody',
  'mining-proof-of-work': 'memory.concept.miningProofOfWork',
  'bitcoin-economics': 'memory.concept.bitcoinEconomics',
  'bitcoin-game-theory': 'memory.concept.bitcoinGameTheory',
  'lightning-basics': 'memory.concept.lightningBasics',
  'lightning-routing': 'memory.concept.lightningRouting',
  privacy: 'memory.concept.privacy',
  'scaling-ark': 'memory.concept.scalingArk',
  'scaling-covenants': 'memory.concept.scalingCovenants',
  sidechains: 'memory.concept.sidechains',
  'history-philosophy': 'memory.concept.historyPhilosophy',
};
