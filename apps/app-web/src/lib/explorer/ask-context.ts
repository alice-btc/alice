// What the Explorer tells the Ask Alice dock about the page itself, apart
// from the page's data: an identity-free sentence naming the surface (the
// pageNote composeAskAlice sends in the de-identified block) and the short
// label of the attachment chip (shown locally, never sent). Fixed text per
// surface, never built from user data: a network label is the selector's,
// a chip label keeps at most the last five characters of a subject, enough
// for a human to recognise it.

import type { TabKind } from './tabs.ts';
import type { NetworkKind } from './networks.ts';

const WHERE = "Alice's Explorer";

const SPARK_NOTES: Partial<Record<TabKind, string>> = {
  overview: `The user is on the Spark home page of ${WHERE}: the live feed of Spark transfers (read from Sparkscan) and the Spark operators' parameters.`,
  address: `The user is on a Spark address page of ${WHERE}: a wallet read from the Spark operators, with its balance, its leaves (its coins, as bubbles and as a list), its transfers sent and received, and its token lines (tokens are shown unnamed).`,
  tx: `The user is on a Spark transfer page of ${WHERE}: a transfer of whole leaves between two Spark addresses, read from the operators and drawn as a flow, or a token transaction read from Sparkscan (shown unnamed).`,
  vtxo: `The user is on a Spark leaf page of ${WHERE}: a coin read from the operators, with its exit tree drawn as a funnel (the deposit on Bitcoin, the splits, the leaf, the refund transaction) and the relative timelocks to wait for a unilateral exit.`,
};

const ARKADE_NOTES: Partial<Record<TabKind, string>> = {
  overview: `The user is on the Arkade home page of ${WHERE}: the live feed of commitment transactions and the operator's parameters.`,
  address: `The user is on an Arkade address page of ${WHERE}: its VTXOs (off-chain coins), spendable balance and virtual transactions, read from the operator's indexer.`,
  vtxo: `The user is on an Arkade VTXO page of ${WHERE}: an off-chain coin with its state, its expiry and its exit tree drawn as a funnel (the commitment transaction, the batch tree, the checkpoints and Ark transactions since).`,
  tx: `The user is on a Bitcoin transaction page of ${WHERE}, opened from the Arkade network; it may be a commitment transaction anchoring a batch of VTXOs, which the page would mark as such.`,
};

const BARK_NOTES: Partial<Record<TabKind, string>> = {
  overview: `The user is on the Bark home page of ${WHERE}: Second's server parameters and its live rounds.`,
  address: `The user is on a Bark address page of ${WHERE}: what the address says about itself (server, policy, mailbox); its coins cannot be listed from outside.`,
  vtxo: `The user is on a Bark VTXO page of ${WHERE}: an off-chain coin with its origin (a round, a board or arkoor payments), its expiry and its exit path drawn as a tree.`,
  tx: `The user is on a Bitcoin transaction page of ${WHERE}, opened from the Bark network; it may be a Bark round anchoring a batch of VTXOs, which the page would mark as such.`,
};

const ONCHAIN_NOUN: Record<TabKind, string> = {
  overview: 'home',
  tx: 'transaction',
  address: 'address',
  block: 'block',
  xpub: 'extended public key (a whole wallet)',
  vtxo: 'VTXO',
};

/**
 * One identity-free sentence naming the page the user is on. The off-chain
 * networks get a sentence per page kind that says what the page reads and
 * draws; a Bitcoin-like network names itself by the selector's label.
 */
export function explorerPageNote(kind: TabKind, network: { kind: NetworkKind; label: string }): string {
  const layered = network.kind === 'spark' ? SPARK_NOTES : network.kind === 'arkade' ? ARKADE_NOTES : network.kind === 'bark' ? BARK_NOTES : undefined;
  const note = layered?.[kind];
  if (note) return note;
  if (kind === 'overview') return `The user is on the ${network.label} home page of ${WHERE}: the latest blocks and the search box.`;
  return `The user is on a ${network.label} ${ONCHAIN_NOUN[kind]} page of ${WHERE}.`;
}

/**
 * The attachment chip's label: displayed locally only, never part of what
 * is sent. A txid, a transfer id or an address keeps its last five
 * characters; a block height is harmless in full (thousands of transactions
 * share it); an off-chain coin is named by its network.
 */
export function askContextLabel(kind: TabKind, query: string | undefined, networkKind: NetworkKind): string {
  if (kind === 'tx' && query) return networkKind === 'spark' && !/^[0-9a-f]{64}$/i.test(query) ? `Spark transfer ...${query.slice(-5)}` : `Transaction ...${query.slice(-5)}`;
  if (kind === 'address' && query) return `Address ...${query.slice(-5)}`;
  if (kind === 'block' && query) return `Block ${query}`;
  if (kind === 'vtxo') return networkKind === 'arkade' ? 'An Arkade VTXO' : networkKind === 'spark' ? 'A Spark leaf' : 'A Bark VTXO';
  return 'This page';
}
