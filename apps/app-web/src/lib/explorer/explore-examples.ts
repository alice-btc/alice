// Curated, well-known mainnet items for the Home page's explore section, so a
// first dive needs zero knowledge and always lands somewhere with a story.
// Every identifier here was checked against a live Esplora endpoint before
// shipping; labels stick to widely documented facts (heights, protocol events,
// public seizures), not speculation.

import { t, type MessageKey } from '../../i18n/translate.ts';

export type ExploreKind = 'tx' | 'block' | 'address';

export type ExploreExample = {
  kind: ExploreKind;
  /** Short chip label. */
  label: string;
  /** One-line story, shown as the tooltip. */
  note: string;
  /** What gets opened: txid, height, or address. */
  value: string;
};

// Label and story are read when shown, in the interface language.
function example(kind: ExploreKind, key: string, value: string): ExploreExample {
  return {
    kind,
    value,
    get label() { return t(`explorer.examples.${key}.label` as MessageKey); },
    get note() { return t(`explorer.examples.${key}.note` as MessageKey); },
  };
}

export const EXPLORE_TXS: ExploreExample[] = [
  example('tx', 'firstPayment', 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16'),
  example('tx', 'genesisCoinbase', '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b'),
  example('tx', 'pizza', 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d'),
  example('tx', 'whitepaper', '54e48e5f5c656b26c3bca14a8c95aa583d07ebe84dde3b7dd4a78f4e4186e713'),
  example('tx', 'duplicatedCoinbase', 'd5d27987d2a3dfc724e359870c6644b40e497bdc0589a033220fe15429d88599'),
];

export const EXPLORE_BLOCKS: ExploreExample[] = [
  example('block', 'genesisBlock', '0'),
  example('block', 'firstPaymentBlock', '170'),
  example('block', 'pizzaBlock', '57043'),
  example('block', 'overflow', '74638'),
  example('block', 'halving1', '210000'),
  example('block', 'halving2', '420000'),
  example('block', 'segwit', '481824'),
  example('block', 'halving3', '630000'),
  example('block', 'taproot', '709632'),
  example('block', 'halving4', '840000'),
];

export const EXPLORE_ADDRESSES: ExploreExample[] = [
  example('address', 'genesisAddress', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'),
  example('address', 'silkRoad', '1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX'),
  example('address', 'exchangeCold', '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo'),
  example('address', 'dormant', '1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF'),
  example('address', 'proofOfBurn', '1CounterpartyXXXXXXXXXXXXXXXUWLpVr'),
  example('address', 'eater', '1BitcoinEaterAddressDontSendf59kuE'),
];
