/** Historical evaluation labels mapped to the same information in the curated corpus.
 * The frozen questions and required information-need groups stay unchanged.
 * Unknown labels are still rejected against the active corpus by the evaluator.
 */
export const CURATED_CONCEPT_MIGRATION = Object.freeze({
  'bitcoin-basics': 'bitcoin-network-vs-asset',
  'utxo-introduction': 'bitcoin-utxo',
  'utxo-model': 'bitcoin-utxo',
  'obsidian-tx-model__utxo': 'bitcoin-utxo',
  'obsidian-tx-model__utxo-model': 'bitcoin-utxo',
  'coinjoin-introduction': 'coinjoin',
  'payjoin-introduction': 'payjoin',
  'proof-of-work-introduction': 'proof-of-work',
  'lightning-introduction': 'lightning-network',
  'multisig-introduction': 'multisig',
  'ark-introduction': 'ark-payments',
  'ark-protocol': 'ark-vtxos',
  'ark-tradeoffs': 'ark-security-model',
  'arkade-how-it-works': 'ark-implementations-bark-arkade',
  'recovery-phrase': 'wallet-recovery-phrase',
  'obsidian-self-custody__wallet-recovery-phrase': 'wallet-recovery-phrase',
  'bitcoin-privacy': 'bitcoin-pseudonymity',
  'obsidian-privacy__bitcoin-privacy': 'bitcoin-pseudonymity',
  'obsidian-privacy__address-reuse': 'address-reuse',
});
export const curatedConcept = id => CURATED_CONCEPT_MIGRATION[id] ?? id;
