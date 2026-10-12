// The Ask Alice context of the off-chain pages (Spark, Arkade, Bark). Each
// builder returns the two things a page hands the dock: a LAYER_CONTEXT
// PrivacySignal, whose projection (audit-core) carries only the page's shape
// in the default de-identified mode, and the FullContext description for the
// explicit identified mode, with every raw identifier it contains declared as
// a subject so route() classifies the message by construction.
//
// Pure: the builders read what the tabs already fetched, nothing more. The
// descriptions use the Explorer's own words (leaf, transfer, VTXO, commitment,
// round) and never print a bare public key: a Spark owner is named by its
// address, an Ark owner by its address when the page knows it.

import type { PrivacySignal } from './signals.ts';
import type { FullContext } from './ask-alice.ts';
import type { RawSubjectKind } from './route.ts';
import {
  formatSparkBlocks, isSparkSsp, sparkAddressOf, sparkLeafStatusLabel, sparkStatusLabel, sparkTransferLabel,
  type SparkBalance, type SparkLeaf, type SparkTransfer,
} from './spark.ts';
import type { SparkExitPath } from './spark-exit.ts';
import type { SparkscanParty, SparkscanTx } from './sparkscan.ts';
import { formatArkadeExitDelay, type ArkadeAddressInfo, type ArkadeInfo, type ArkadeVtxo } from './arkade.ts';
import type { ArkadeExitPath } from './arkade-exit.ts';
import type { BarkAddress, BarkInfo } from './bark.ts';
import { arkoorHops, vtxoOrigin, type BarkVtxo } from './bark-vtxo.ts';
import type { TxStatus } from './types.ts';

export type LayerContext = { signal: PrivacySignal; full: FullContext };

/** How many list rows a description carries per section; the rest is counted. */
export const LAYER_CONTEXT_MAX_ROWS = 12;

const OPERATORS = 'the Spark operators (Lightspark, Breez, Flashnet)';

function sats(n: number): string {
  return `${n.toLocaleString('en-US')} sats`;
}

function when(sec?: number | null): string {
  return sec ? new Date(sec * 1000).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : 'undated';
}

function more(total: number, shown: number, noun: string): string[] {
  return total > shown ? [`… and ${total - shown} more ${noun}`] : [];
}

function elapsed(nowSec: number, since?: number): number | undefined {
  return since ? Math.max(0, nowSec - since) : undefined;
}

function contextSignal(o: {
  key: string;
  title: string;
  detail: string;
  subjects: string[];
  evidence: PrivacySignal['evidence'];
}): PrivacySignal {
  return {
    id: `LAYER_CONTEXT:${o.key}`,
    ruleId: 'LAYER_CONTEXT',
    severity: 'info',
    confidence: 'certain',
    title: o.title,
    detail: o.detail,
    subjects: o.subjects,
    evidence: o.evidence,
  };
}

/** The declared subjects of a description, each identifier once. */
class Subjects {
  private readonly seen = new Set<string>();
  readonly list: FullContext['subjects'] = [];
  add(kind: RawSubjectKind, value: string | null | undefined): void {
    if (!value) return;
    const key = `${kind}:${value.toLowerCase()}`;
    if (this.seen.has(key)) return;
    this.seen.add(key);
    this.list.push({ kind, value });
  }
}

/* ---------------------------------- Spark --------------------------------- */

/** What the Spark address tab holds once loaded (its own AddressData shape). */
export type SparkAddressView = {
  address: string;
  pubkey: string;
  balance: SparkBalance;
  leaves: SparkLeaf[];
  /** Null while the operators are still answering the transfers query. */
  transfers: SparkTransfer[] | null;
  /** More transfers exist than were read. */
  transfersMore: boolean;
  transfersError: string | null;
  /** Sparkscan's count of the history and its token lines; null when unasked. */
  scan: { total: number; tokens: SparkscanTx[] } | null;
};

/** A party of a transfer, by its address; the SSP named as such. */
function party(pubkey: string): string {
  const address = sparkAddressOf(pubkey) ?? 'an unknown wallet';
  return isSparkSsp(pubkey) ? `${address} (the SSP, Lightspark)` : address;
}

function transferRow(t: SparkTransfer, pubkey: string): string {
  const direction = t.senderPubkey === pubkey && t.receiverPubkey === pubkey ? 'to itself'
    : t.senderPubkey === pubkey ? `sent ${sats(t.totalSats)} to ${party(t.receiverPubkey)}`
      : `received ${sats(t.totalSats)} from ${party(t.senderPubkey)}`;
  return `- ${t.id}: ${sparkTransferLabel(t)}, ${direction}, ${sparkStatusLabel(t.status)}, ${when(t.createdAt)}`;
}

function leafRow(l: SparkLeaf): string {
  return `- ${l.id}: ${sats(l.valueSats)}, ${sparkLeafStatusLabel(l.status)}, created ${when(l.createdAt)}`;
}

export function sparkAddressContext(v: SparkAddressView, nowSec = Math.floor(Date.now() / 1000)): LayerContext {
  const transfers = v.transfers ?? [];
  const tokens = v.scan?.tokens.length ?? 0;
  const empty = v.balance.sats === 0 && v.leaves.length === 0 && transfers.length === 0;
  const firstSeen = [...transfers, ...v.leaves].map(x => x.createdAt).filter((t): t is number => typeof t === 'number').sort((a, b) => a - b)[0];

  const subjects = new Subjects();
  subjects.add('address', v.address);
  const lines: string[] = [`Spark address ${v.address}`];
  if (empty) {
    lines.push(`${OPERATORS} served nothing for this address: it is empty, or its wallet turned on privacy mode (a private wallet reads exactly like an empty one).`);
  } else {
    lines.push(`Balance: ${sats(v.balance.sats)} across ${v.balance.leaves} ${v.balance.leaves === 1 ? 'leaf' : 'leaves'}, as served by ${OPERATORS}.`);
  }
  if (v.scan) lines.push(`Sparkscan knows ${v.scan.total} transaction${v.scan.total === 1 ? '' : 's'} on this address, ${tokens} of them token line${tokens === 1 ? '' : 's'} (tokens are shown unnamed, without ticker or amount).`);
  if (v.leaves.length) {
    lines.push(`Leaves (${v.leaves.length} read):`);
    for (const l of v.leaves.slice(0, LAYER_CONTEXT_MAX_ROWS)) { lines.push(leafRow(l)); subjects.add('spark-id', l.id); }
    lines.push(...more(v.leaves.length, LAYER_CONTEXT_MAX_ROWS, 'leaves'));
  }
  if (v.transfers === null) {
    lines.push(v.transfersError ? `Transfers: the operators did not answer (${v.transfersError}).` : 'Transfers: still being read from the operators.');
  } else if (transfers.length) {
    lines.push(`Transfers (${transfers.length} read${v.transfersMore ? ', more exist' : ''}, newest first):`);
    for (const t of transfers.slice(0, LAYER_CONTEXT_MAX_ROWS)) {
      lines.push(transferRow(t, v.pubkey));
      subjects.add('spark-id', t.id);
      subjects.add('address', sparkAddressOf(t.senderPubkey));
      subjects.add('address', sparkAddressOf(t.receiverPubkey));
    }
    lines.push(...more(transfers.length, LAYER_CONTEXT_MAX_ROWS, 'transfers'));
  }

  const signal = contextSignal({
    key: v.address,
    title: 'Spark address page',
    detail: `${v.leaves.length} ${v.leaves.length === 1 ? 'leaf' : 'leaves'}, ${transfers.length} transfer(s) read.`,
    subjects: [v.address],
    evidence: {
      layer: 'spark',
      page: 'address',
      addressCount: 1,
      coinCount: v.leaves.length,
      txCount: transfers.length,
      amountSats: v.balance.sats,
      private: empty,
      tokens: tokens > 0,
      partial: v.transfers === null || v.transfersMore,
      ...(elapsed(nowSec, firstSeen) !== undefined ? { elapsedSeconds: elapsed(nowSec, firstSeen)! } : {}),
    },
  });
  return { signal, full: { description: lines.join('\n'), subjects: subjects.list } };
}

export function sparkTransferContext(t: SparkTransfer, nowSec = Math.floor(Date.now() / 1000)): LayerContext {
  const subjects = new Subjects();
  subjects.add('spark-id', t.id);
  subjects.add('address', sparkAddressOf(t.senderPubkey));
  subjects.add('address', sparkAddressOf(t.receiverPubkey));
  const lines = [
    `Spark transfer ${t.id}`,
    `${sparkTransferLabel(t)}, ${sparkStatusLabel(t.status)}, ${sats(t.totalSats)}, ${when(t.createdAt)}.`,
    `From ${party(t.senderPubkey)} to ${party(t.receiverPubkey)}.`,
  ];
  if (t.leaves.length) {
    lines.push(`Leaves moved, whole (${t.leaves.length}):`);
    for (const l of t.leaves.slice(0, LAYER_CONTEXT_MAX_ROWS)) { lines.push(leafRow(l)); subjects.add('spark-id', l.id); }
    lines.push(...more(t.leaves.length, LAYER_CONTEXT_MAX_ROWS, 'leaves'));
  } else {
    lines.push('The operators served the transfer without its leaves.');
  }
  lines.push('Off-chain: no Bitcoin transaction, no fee, no confirmation; the leaves were re-signed with the operators.');

  const signal = contextSignal({
    key: t.id,
    title: 'Spark transfer page',
    detail: `${t.leaves.length} ${t.leaves.length === 1 ? 'leaf' : 'leaves'} moved.`,
    subjects: [t.id],
    evidence: {
      layer: 'spark',
      page: 'transfer',
      addressCount: t.senderPubkey === t.receiverPubkey ? 1 : 2,
      txCount: 1,
      coinCount: t.leaves.length,
      inputCount: Math.max(1, t.leaves.length),
      outputCount: Math.max(1, t.leaves.length),
      amountSats: t.totalSats,
      completed: t.status === 'completed',
      pending: !['completed', 'expired', 'returned'].includes(t.status),
      expired: t.status === 'expired' || t.status === 'returned',
      lightning: t.type === 'preimage-swap',
      exit: t.type === 'cooperative-exit',
      ...(elapsed(nowSec, t.createdAt) !== undefined ? { elapsedSeconds: elapsed(nowSec, t.createdAt)! } : {}),
    },
  });
  return { signal, full: { description: lines.join('\n'), subjects: subjects.list } };
}

export type SparkLeafAnchor = { confirmed: boolean; blockHeight?: number; blockTime?: number } | null;

export function sparkLeafContext(leaf: SparkLeaf, path: SparkExitPath, anchor: SparkLeafAnchor, nowSec = Math.floor(Date.now() / 1000)): LayerContext {
  const owner = sparkAddressOf(leaf.ownerPubkey);
  const subjects = new Subjects();
  subjects.add('spark-id', leaf.id);
  subjects.add('spark-id', path.treeId);
  subjects.add('address', owner);
  subjects.add('txid', path.depositTxid);
  const lines = [
    `Spark leaf ${leaf.id}`,
    `${sats(leaf.valueSats)}, ${sparkLeafStatusLabel(leaf.status)}, owned by ${owner ?? 'an unknown wallet'}, created ${when(leaf.createdAt)}. Tree ${path.treeId}.`,
    `Deposit on Bitcoin: transaction ${path.depositTxid}, output ${path.depositVout} (${sats(path.anchorSats)}), ${
      anchor === null ? 'confirmation not checked'
        : anchor.confirmed ? `confirmed${anchor.blockHeight !== undefined ? ` in block ${anchor.blockHeight.toLocaleString('en-US')}` : ''}${anchor.blockTime ? ` on ${when(anchor.blockTime)}` : ''}`
          : 'not confirmed'}.`,
    `Unilateral exit path: ${path.steps.length} pre-signed node transaction${path.steps.length === 1 ? '' : 's'} from the root down to the leaf, then the refund transaction paying the owner; the relative timelocks on the way add up to ${formatSparkBlocks(path.totalWaitBlocks)}.`,
  ];
  for (const s of path.steps.slice(0, LAYER_CONTEXT_MAX_ROWS)) {
    subjects.add('txid', s.txid);
    const wait = s.timelockBlocks === null ? 'no timelock' : `waits ${s.timelockBlocks.toLocaleString('en-US')} blocks`;
    lines.push(`- ${s.kind} ${s.txid}: ${s.outputs.length} output${s.outputs.length === 1 ? '' : 's'}, branch ${sats(s.branchSats)}, ${wait}`);
  }
  lines.push(...more(path.steps.length, LAYER_CONTEXT_MAX_ROWS, 'node transactions'));
  subjects.add('txid', path.refund.txid);
  lines.push(`- refund ${path.refund.txid}: ${sats(path.refund.amountSats)} to the owner, ${path.refund.timelockBlocks === null ? 'no timelock' : `waits ${path.refund.timelockBlocks.toLocaleString('en-US')} blocks`}`);
  if (path.directTimelockBlocks !== null) lines.push(`A direct (watchtower) path also exists, waiting ${path.directTimelockBlocks.toLocaleString('en-US')} blocks.`);

  const exited = sparkLeafStatusLabel(leaf.status) === 'Exited';
  const since = leaf.createdAt ?? anchor?.blockTime;
  const signal = contextSignal({
    key: leaf.id,
    title: 'Spark leaf page',
    detail: `${path.steps.length + 1} transaction(s) on the exit path.`,
    subjects: [leaf.id],
    evidence: {
      layer: 'spark',
      page: 'leaf',
      addressCount: owner ? 1 : 0,
      coinCount: 1,
      txCount: path.steps.length + 1,
      amountSats: leaf.valueSats,
      exited,
      pending: sparkLeafStatusLabel(leaf.status) === 'Locked',
      ...(elapsed(nowSec, since) !== undefined ? { elapsedSeconds: elapsed(nowSec, since)! } : {}),
    },
  });
  return { signal, full: { description: lines.join('\n'), subjects: subjects.list } };
}

function scanParty(p: SparkscanParty | null): string {
  if (!p) return 'an unknown party';
  return p.address ?? p.label;
}

/** A transaction as Sparkscan serves it: a token transaction (shown unnamed)
 *  or another kind the operators do not serve by id. */
export function sparkscanTxContext(t: SparkscanTx, nowSec = Math.floor(Date.now() / 1000)): LayerContext {
  const token = t.kind === 'token';
  const subjects = new Subjects();
  subjects.add('txid', t.id);
  const parties = t.multi ? [...t.multi.inputs, ...t.multi.outputs] : [t.from, t.to].filter((p): p is SparkscanParty => p !== null);
  for (const p of parties) subjects.add('address', p.address);
  if (t.bitcoinTxid) subjects.add('txid', t.bitcoinTxid);
  const lines = [
    `Spark ${token ? 'token transaction' : 'transfer'} ${t.id}`,
    `${token ? 'Token transaction' : t.rawType}, status ${t.status}, ${when(t.createdAt)}, as read from Sparkscan.${token ? ' The token is shown unnamed: no name, ticker or amount, by design.' : t.amountSats !== null ? ` Amount: ${sats(t.amountSats)}.` : ''}`,
  ];
  if (t.multi) {
    lines.push(`Inputs (${t.multi.inputs.length}): ${t.multi.inputs.map(scanParty).join(', ') || 'none'}.`);
    lines.push(`Outputs (${t.multi.outputs.length}): ${t.multi.outputs.map(scanParty).join(', ') || 'none'}.`);
  } else {
    lines.push(`From ${scanParty(t.from)} to ${scanParty(t.to)}.`);
  }
  if (t.bitcoinTxid) lines.push(`Bitcoin transaction: ${t.bitcoinTxid}.`);

  const signal = contextSignal({
    key: t.id,
    title: token ? 'Spark token page' : 'Spark transaction page',
    detail: `${parties.length} part${parties.length === 1 ? 'y' : 'ies'}.`,
    subjects: [t.id],
    evidence: {
      layer: 'spark',
      page: token ? 'token' : 'transfer',
      addressCount: new Set(parties.map(p => p.address).filter(Boolean)).size,
      txCount: 1,
      coinCount: 0,
      inputCount: t.multi ? t.multi.inputs.length : 1,
      outputCount: t.multi ? t.multi.outputs.length : 1,
      ...(t.amountSats !== null && !token ? { amountSats: t.amountSats } : {}),
      tokens: token,
      multi: t.multi !== undefined,
      lightning: t.kind === 'lightning',
      exit: t.kind === 'exit',
      ...(elapsed(nowSec, t.createdAt ?? undefined) !== undefined ? { elapsedSeconds: elapsed(nowSec, t.createdAt ?? undefined)! } : {}),
    },
  });
  return { signal, full: { description: lines.join('\n'), subjects: subjects.list } };
}

/* --------------------------------- Arkade --------------------------------- */

function arkadeState(v: ArkadeVtxo): string {
  if (v.isSwept) return 'swept by the operator';
  if (v.isSpent) return 'spent';
  return v.isPreconfirmed ? 'preconfirmed' : 'settled';
}

export function arkadeAddressContext(info: ArkadeAddressInfo, nowSec = Math.floor(Date.now() / 1000)): LayerContext {
  const subjects = new Subjects();
  subjects.add('address', info.address);
  const lines = [
    `Arkade address ${info.address}`,
    `Spendable: ${sats(info.spendableSats)} in ${info.spendableCount} spendable VTXO${info.spendableCount === 1 ? '' : 's'}, ${info.totalCount} VTXO${info.totalCount === 1 ? '' : 's'} in all, as served by the Arkade operator's indexer.`,
  ];
  if (info.vtxos.length) {
    lines.push(`VTXOs (${info.vtxos.length} read):`);
    for (const v of info.vtxos.slice(0, LAYER_CONTEXT_MAX_ROWS)) {
      const id = `${v.txid}:${v.vout}`;
      subjects.add('vtxo', id);
      for (const c of v.commitmentTxids) subjects.add('txid', c);
      const anchor = v.commitmentTxids.length ? `, commitment ${v.commitmentTxids.join(', ')}` : '';
      lines.push(`- ${id}: ${sats(v.amountSats)}, ${arkadeState(v)}, created ${when(v.createdAt)}, expires ${when(v.expiresAt)}${anchor}`);
    }
    lines.push(...more(info.vtxos.length, LAYER_CONTEXT_MAX_ROWS, 'VTXOs'));
  } else {
    lines.push('The indexer lists no VTXO for this address.');
  }
  const oldest = info.vtxos.map(v => v.createdAt).filter((t): t is number => typeof t === 'number').sort((a, b) => a - b)[0];
  const signal = contextSignal({
    key: info.address,
    title: 'Arkade address page',
    detail: `${info.spendableCount} spendable VTXO(s) of ${info.totalCount}.`,
    subjects: [info.address],
    evidence: {
      layer: 'arkade',
      page: 'address',
      addressCount: 1,
      coinCount: info.spendableCount,
      txCount: info.totalCount,
      amountSats: info.spendableSats,
      preconfirmed: info.vtxos.some(v => v.isPreconfirmed && !v.isSpent && !v.isSwept),
      private: info.totalCount === 0,
      ...(elapsed(nowSec, oldest) !== undefined ? { elapsedSeconds: elapsed(nowSec, oldest)! } : {}),
    },
  });
  return { signal, full: { description: lines.join('\n'), subjects: subjects.list } };
}

export function arkadeVtxoContext(o: {
  id: string;
  vtxo: ArkadeVtxo | null;
  path: ArkadeExitPath;
  info: ArkadeInfo | null;
  /** The address holding the coin, when the page could derive it. */
  address: string | null;
}, nowSec = Math.floor(Date.now() / 1000)): LayerContext {
  const { vtxo, path } = o;
  const last = path.steps[path.steps.length - 1];
  const coinSats = vtxo?.amountSats ?? last?.branchSats ?? 0;
  const expiresAt = vtxo?.expiresAt ?? last?.expiresAt;
  const subjects = new Subjects();
  subjects.add('vtxo', o.id);
  subjects.add('address', o.address);
  subjects.add('txid', path.commitmentTxid);
  const lines = [
    `Arkade VTXO ${o.id}`,
    `${sats(coinSats)}, ${vtxo ? arkadeState(vtxo) : 'state not served by the indexer'}, expires ${when(expiresAt)}${o.address ? `, held by ${o.address}` : ''}.`,
    `Anchored by commitment transaction ${path.commitmentTxid}, batch output ${path.batchVout} (${sats(path.anchorSats)}).`,
    `Unilateral exit path: ${path.steps.length} pre-signed transaction${path.steps.length === 1 ? '' : 's'} to broadcast${o.info ? `, then wait ${formatArkadeExitDelay(o.info.unilateralExitDelay)}` : ''}.`,
  ];
  for (const s of path.steps.slice(0, LAYER_CONTEXT_MAX_ROWS)) {
    subjects.add('txid', s.txid);
    lines.push(`- ${s.type} ${s.txid}: ${s.outputs.length} output${s.outputs.length === 1 ? '' : 's'}, branch ${sats(s.branchSats)}${s.expiresAt ? `, expires ${when(s.expiresAt)}` : ''}`);
  }
  lines.push(...more(path.steps.length, LAYER_CONTEXT_MAX_ROWS, 'transactions'));
  if (vtxo?.spentBy) { subjects.add('txid', vtxo.spentBy); lines.push(`Spent by checkpoint ${vtxo.spentBy}${vtxo.arkTxid ? ` (Ark transaction ${vtxo.arkTxid})` : ''}.`); subjects.add('txid', vtxo.arkTxid); }

  const signal = contextSignal({
    key: o.id,
    title: 'Arkade VTXO page',
    detail: `${path.steps.length} transaction(s) on the exit path.`,
    subjects: [o.id],
    evidence: {
      layer: 'arkade',
      page: 'vtxo',
      addressCount: o.address ? 1 : 0,
      coinCount: 1,
      txCount: path.steps.length,
      amountSats: coinSats,
      served: vtxo !== null,
      settled: vtxo ? !vtxo.isPreconfirmed && !vtxo.isSpent && !vtxo.isSwept : false,
      preconfirmed: vtxo?.isPreconfirmed === true && !vtxo.isSpent && !vtxo.isSwept,
      spent: vtxo?.isSpent === true,
      swept: vtxo?.isSwept === true,
      expired: typeof expiresAt === 'number' && expiresAt <= nowSec,
      ...(elapsed(nowSec, vtxo?.createdAt) !== undefined ? { elapsedSeconds: elapsed(nowSec, vtxo?.createdAt)! } : {}),
    },
  });
  return { signal, full: { description: lines.join('\n'), subjects: subjects.list } };
}

/* ---------------------------------- Bark ---------------------------------- */

export function barkAddressContext(a: BarkAddress, serverLabel: string): LayerContext {
  const subjects = new Subjects();
  subjects.add('address', a.address);
  const delivery = a.delivery.map(d => (d.kind === 'mailbox' ? 'a mailbox on the server' : `an unknown delivery type (${d.typeByte})`)).join(', ') || 'none';
  const lines = [
    `Bark address ${a.address}`,
    `Issued for server ${a.arkId} (${serverLabel})${a.testnet ? ', on a test network' : ''}. Policy: ${a.policy.kind === 'pubkey' ? 'a single owner key' : `type ${a.policy.typeByte}`}. Delivery: ${delivery}.`,
    "A Bark server lists an address's coins only to their owner, so no balance or coin list can be read here: the page decodes what the address itself says, nothing more.",
  ];
  const signal = contextSignal({
    key: a.address,
    title: 'Bark address page',
    detail: 'Decoded on the device; no coin list is readable.',
    subjects: [a.address],
    evidence: { layer: 'bark', page: 'address', addressCount: 1, coinCount: 0, txCount: 0, private: true },
  });
  return { signal, full: { description: lines.join('\n'), subjects: subjects.list } };
}

export function barkVtxoContext(o: {
  vtxo: BarkVtxo;
  info: BarkInfo | null;
  /** The chain tip, to tell how far the expiry is. */
  tip: number | null;
  anchor: TxStatus | null;
}, nowSec = Math.floor(Date.now() / 1000)): LayerContext {
  const { vtxo: v, tip, anchor } = o;
  const origin = vtxoOrigin(v);
  const hops = arkoorHops(v);
  const anchorId = `${v.anchor.txid}:${v.anchor.vout}`;
  const left = tip !== null ? v.expiryHeight - tip : null;
  const expiry = left === null ? `at block ${v.expiryHeight.toLocaleString('en-US')}`
    : left <= 0 ? `expired (block ${v.expiryHeight.toLocaleString('en-US')} is past)`
      : `at block ${v.expiryHeight.toLocaleString('en-US')}, ${left.toLocaleString('en-US')} blocks away (about ${Math.max(1, Math.round(left / 144))} day${Math.round(left / 144) <= 1 ? '' : 's'})`;
  const subjects = new Subjects();
  subjects.add('vtxo', v.id);
  subjects.add('outpoint', anchorId);
  const lines = [
    `Bark VTXO ${v.id}`,
    `${sats(v.amountSats)}, from ${origin === 'round' ? 'a round' : origin === 'board' ? 'a board (an on-chain output turned into a coin)' : origin === 'onchain' ? 'an on-chain output' : 'an unknown origin'}${hops ? `, then ${hops} arkoor payment${hops === 1 ? '' : 's'} outside a round` : ''}. Expires ${expiry}.`,
    `Anchored on Bitcoin by ${anchorId}${anchor ? (anchor.confirmed ? `, confirmed${anchor.blockHeight !== undefined ? ` in block ${anchor.blockHeight.toLocaleString('en-US')}` : ''}` : ', not confirmed') : ''}.`,
    `Unilateral exit path: ${v.genesis.length} pre-signed transaction${v.genesis.length === 1 ? '' : 's'}, each waiting ${v.exitDeltaBlocks.toLocaleString('en-US')} blocks after the previous confirms${o.info ? `; the server sweeps a coin ${o.info.vtxoLifetimeBlocks.toLocaleString('en-US')} blocks after its round` : ''}.`,
    `Policy: ${v.policy.kind === 'pubkey' ? 'a single owner key' : v.policy.kind}.`,
  ];
  const signal = contextSignal({
    key: v.id,
    title: 'Bark VTXO page',
    detail: `${v.genesis.length} transaction(s) on the exit path.`,
    subjects: [v.id],
    evidence: {
      layer: 'bark',
      page: 'vtxo',
      addressCount: 0,
      coinCount: 1,
      txCount: v.genesis.length,
      amountSats: v.amountSats,
      expired: left !== null && left <= 0,
      settled: origin === 'round' || origin === 'board',
      ...(elapsed(nowSec, anchor?.blockTime) !== undefined ? { elapsedSeconds: elapsed(nowSec, anchor?.blockTime)! } : {}),
    },
  });
  return { signal, full: { description: lines.join('\n'), subjects: subjects.list } };
}
