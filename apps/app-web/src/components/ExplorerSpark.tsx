'use client';

// The Spark-specific pieces of the Explorer. Spark settles on Bitcoin mainnet,
// so the network reuses the whole Bitcoin explorer for its deposits and exits;
// what is Spark's own is rendered here: the live feed of the network (from
// Sparkscan), the operators' parameters, the address view (read from the
// operators, laid out like the on-chain and Arkade address views: metrics,
// balance timeline, coins as bubbles, lists) and the overlay a deposit gets
// on its Bitcoin transaction. The copy uses Spark's own words
// (docs.spark.money): operator, leaf, tree, transfer, deposit, cooperative
// and unilateral exit, timelock, Spark Service Provider (SSP). Tokens are
// tokens, unnamed.

import { useEffect, useRef, useState } from 'react';
import {
  decodeSparkAddress, formatSparkBlocks, getSparkBalance, getSparkLeaves, getSparkTransfers, isSparkSsp, mergeSparkTransfers,
  parseRawTx, sequenceBlocks, sparkAddressOf, sparkLeafStatusLabel, sparkStatusLabel, sparkTransferLabel, SparkError,
  SPARK_OPERATORS, SPARK_SSP_PUBKEY, SPARK_TIMELOCK, type SparkBalance, type SparkLeaf, type SparkTransfer, type SparkTransferCursor,
} from '@/lib/explorer/spark';
import { buildSparkBalanceSeries, sparkTransferDelta } from '@/lib/explorer/spark-insights';
import { sparkAddressContext } from '@/lib/explorer/layer-context';
import type { PrivacySignal } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import { getSparkscanAddressTxs, getSparkscanLatest, sparkscanKindLabel, subscribeSparkscan, SparkscanError, type SparkscanTx } from '@/lib/explorer/sparkscan';
import { noteSparkscanOnchain, type SparkOnchainKind, type SparkOnchainTx } from '@/lib/explorer/spark-onchain';
import { averageUtxoAge } from '@/lib/explorer/address-insights';
import { getNetwork } from '@/lib/explorer/networks';
import { formatDateTime } from '@/lib/explorer/blocks';
import { Amount } from '@/components/AmountDisplay';
import { Analyzing, EmptyState, ExplorerCopy, FieldLabel, Metric, SectionPanel, Skeleton, SkeletonLines } from '@/components/ExplorerUI';
import { ExplorerBalanceChart } from '@/components/ExplorerBalanceChart';
import { ExplorerUtxoBubbles } from '@/components/ExplorerUtxoBubbles';

const FEED_INITIAL = 5;
const FEED_STEP = 10;
const FEED_MAX = 120;
const LIST_INITIAL = 5;
const LIST_PAGE = 10;
const TRANSFERS_PAGE = 20;
// Enough leaves for the bubbles to mean something on a busy wallet; the
// list under them pages further on demand.
const LEAVES_PAGE = 60;

/** The Spark accent (its yellow), shared by every Spark mark in the explorer. */
export const SPARK_ACCENT = getNetwork('spark').color;
/** The ink on the accent: dark, since the yellow is light in both themes. */
export const SPARK_INK = '#1a1300';

/** The Spark marker, identical wherever Spark is pointed at: dark text on
 *  the yellow fill, readable in both themes. */
export function SparkBadge({ children = 'SPARK' }: { children?: React.ReactNode }) {
  return (
    <span
      className="font-pixel tracking-widest inline-flex items-center shrink-0"
      style={{
        fontSize: 10, lineHeight: 1, padding: '3px 6px', borderRadius: 3,
        border: `1px solid ${SPARK_ACCENT}`, color: SPARK_INK,
        backgroundColor: SPARK_ACCENT, whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function agoLabel(sec: number): string {
  const s = Math.floor(Date.now() / 1000 - sec);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86_400)}d ago`;
}

function shortAddress(a: string): string {
  return a.length > 24 ? `${a.slice(0, 12)}…${a.slice(-6)}` : a;
}

function shortId(id: string): string {
  return id.length > 20 ? `${id.slice(0, 13)}…${id.slice(-6)}` : id;
}

function shortDate(sec?: number | null): string {
  return sec ? new Date(sec * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
}

function formatAge(days: number): string {
  return days < 1 ? `${Math.round(days * 24)}h` : `${days.toFixed(1)}d`;
}

/** A Spark address, shortened, opening its view when the caller can. */
export function SparkAddressLink({ address, label, onOpenAddress }: { address: string; label?: string; onOpenAddress?: (address: string) => void }) {
  const text = label ?? shortAddress(address);
  return onOpenAddress ? (
    <button
      type="button"
      onClick={() => onOpenAddress(address)}
      className="alice-control alice-control--quiet font-numbers truncate text-left cursor-pointer bg-transparent p-0"
      style={{ fontSize: 11, color: 'var(--alice-primary)' }}
      title={`Open ${address}`}
    >
      {text}
    </button>
  ) : (
    <span className="font-numbers truncate" style={{ fontSize: 11, color: 'var(--alice-muted)' }} title={address}>{text}</span>
  );
}

/** A party of a Sparkscan line, as text: a Spark address (the SSP named),
 *  the Lightning network, or whatever Sparkscan wrote. */
function partyText(party: SparkscanTx['from']): string {
  if (!party) return 'unknown';
  if (party.kind === 'spark' && party.address) return party.pubkey && isSparkSsp(party.pubkey) ? 'the SSP' : shortAddress(party.address);
  return party.label;
}

function mergeFeed(newer: SparkscanTx[], prev: SparkscanTx[]): SparkscanTx[] {
  const seen = new Set<string>();
  const out: SparkscanTx[] = [];
  for (const t of [...newer, ...prev]) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    out.push(t);
  }
  out.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return out.slice(0, FEED_MAX);
}

/** The network's newest transactions, from Sparkscan: a first page, then the
 *  live channel. Each row opens its transfer, like the Arkade feed's rows
 *  open their commitment transaction. */
export function SparkLiveFeed({ onOpenTx }: { onOpenTx: (id: string) => void }) {
  const [items, setItems] = useState<SparkscanTx[]>([]);
  const [live, setLive] = useState(false);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(FEED_INITIAL);

  useEffect(() => {
    const controller = new AbortController();
    let stopped = false;
    setError('');
    getSparkscanLatest(30, { signal: controller.signal })
      .then(list => { if (!stopped) { noteSparkscanOnchain(list); setItems(prev => mergeFeed(list, prev)); } })
      .catch(e => {
        if (stopped || (e instanceof DOMException && e.name === 'AbortError')) return;
        setError(e instanceof SparkscanError ? e.message : 'Could not reach Sparkscan.');
      });
    (async () => {
      while (!stopped) {
        try {
          await subscribeSparkscan(tx => { noteSparkscanOnchain([tx]); setItems(prev => mergeFeed([tx], prev)); }, { signal: controller.signal, onOpen: () => setLive(true) });
        } catch {
          /* dropped or unreachable: fall through to backoff and retry */
        }
        setLive(false);
        if (stopped) break;
        await new Promise(r => setTimeout(r, 3000));
      }
    })();
    return () => { stopped = true; controller.abort(); };
  }, []);

  const shown = items.slice(0, limit);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>LATEST TRANSACTIONS</span>
        <span className="flex items-center gap-1.5">
          <span style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: live ? 'var(--alice-success)' : 'var(--alice-muted)' }} />
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{live ? 'LIVE' : 'CONNECTING'}</span>
        </span>
      </div>
      <div className="flex flex-col" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
        {shown.length === 0 ? (
          error ? (
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>FEED UNAVAILABLE</span>
              <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{error}</p>
            </div>
          ) : (
            <Analyzing label="reading the latest transactions from Sparkscan…" />
          )
        ) : (
          shown.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onOpenTx(t.id)}
              className="alice-control alice-control--quiet flex items-center justify-between gap-3 w-full text-left cursor-pointer bg-transparent px-3 py-2"
              style={{ borderTop: i > 0 ? '1px solid var(--alice-border)' : undefined, justifyContent: 'space-between' }}
              title={`Open ${t.id}`}
            >
              <div className="flex flex-col min-w-0">
                <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-primary)' }}>
                  {t.kind === 'token' && !t.from && !t.to ? 'several parties' : `${partyText(t.from)} → ${partyText(t.to)}`}
                </span>
                <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
                  {t.createdAt !== null ? `${agoLabel(t.createdAt)} · ${formatDateTime(t.createdAt)}` : 'time unknown'}
                  {t.status !== 'confirmed' && t.status !== 'completed' ? ` · ${t.status}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SparkBadge>{sparkscanKindLabel(t.kind).toUpperCase()}</SparkBadge>
                {t.kind !== 'token' && t.amountSats !== null && (
                  <Amount sats={t.amountSats} style={{ fontSize: 12, color: 'var(--alice-text)', flexShrink: 0 }} />
                )}
              </div>
            </button>
          ))
        )}
      </div>
      {items.length > shown.length && (
        <button
          type="button"
          onClick={() => setLimit(l => l + FEED_STEP)}
          className="alice-control alice-control--quiet font-numbers self-center cursor-pointer"
          style={{ fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)' }}
        >
          SHOW {Math.min(FEED_STEP, items.length - shown.length)} MORE
        </button>
      )}
    </div>
  );
}

/** The operators and the protocol's parameters, as a section of the Spark
 *  overview. Static: the SDK ships them, and the operators publish no
 *  parameter endpoint of their own. */
export function SparkOperatorsInfo() {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>OPERATORS</span>
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${SPARK_ACCENT}`, borderRadius: 3, backgroundColor: 'transparent' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label="OPERATORS" value={SPARK_OPERATORS.map(o => o.name).join(', ')} title="The Spark operators co-sign every leaf with its owner (FROST threshold signing) and forget the previous owner's share on each transfer." />
          <Metric label="EXIT TIMELOCK" value={formatSparkBlocks(SPARK_TIMELOCK.initialBlocks)} title="A fresh leaf's exit transaction waits this long after its parent confirms; each transfer takes 100 blocks off, so the newest owner exits first." />
          <Metric label="PER TRANSFER" value={`${SPARK_TIMELOCK.stepBlocks} blocks fewer`} title="Each transfer signs a new exit with a shorter timelock than the previous owner's." />
          <Metric label="RENEWED UNDER" value={`${SPARK_TIMELOCK.renewBelowBlocks} blocks`} title="A wallet renews a leaf whose timelock fell this low, so it never reaches zero." />
          <Metric label="SETTLES ON" value="Bitcoin mainnet" />
          <Metric label="SSP" value="Lightspark" title="The Spark Service Provider: the counterparty of Lightning payments and cooperative exits." />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>OPERATOR KEYS</FieldLabel>
          {SPARK_OPERATORS.map(o => (
            <span key={o.pubkey} className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{o.name} · {o.url.replace(/^https:\/\//, '')} · {o.pubkey}</span>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>SSP KEY</FieldLabel>
          <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{SPARK_SSP_PUBKEY}</span>
        </div>
      </div>
    </div>
  );
}

/** The row badge of a known Spark transaction, wherever a list shows it. */
export function SparkTxBadge({ kind }: { kind: SparkOnchainKind }) {
  return <SparkBadge>{kind === 'exit' ? 'SPARK EXIT' : 'SPARK DEPOSIT'}</SparkBadge>;
}

/** The Spark overlay of a Bitcoin transaction this browser knows: a deposit
 *  a leaf walked down to (its output, its tree, the way back to the leaf), or
 *  a deposit or an exit Sparkscan reported (the wallet on the Spark side).
 *  The wording says "known": nothing on the chain tells, and no list of
 *  Spark deposits or exits is complete. */
export function SparkOnchainCard({ d, onOpenLeaf, onOpenAddress, onOpenSparkTx }: {
  d: SparkOnchainTx;
  onOpenLeaf?: (leafId: string) => void;
  onOpenAddress?: (address: string) => void;
  /** Opens the Spark-side transaction Sparkscan reported, on the Spark network. */
  onOpenSparkTx?: (id: string) => void;
}) {
  const exit = d.kind === 'exit';
  const fromLeaf = d.source === 'leaf' && d.leafId !== undefined;
  const text = exit
    ? 'Sparkscan reported this transaction as a cooperative exit from Spark: the operators and the Spark Service Provider paid it on behalf of a Spark wallet whose leaves left the network. Nothing on the chain says so, and only the exits this browser has seen are marked.'
    : fromLeaf
      ? `Output ${d.vout} is a Spark deposit: the root of a tree of pre-signed transactions that the operators split into leaves, each held by a Spark user. Nothing on the chain says so. The output stays unspent as long as the tree lives; it is spent by a cooperative exit, or by someone\u2019s unilateral exit broadcasting the tree.`
      : 'Sparkscan reported this transaction as a deposit into Spark: its output became the root of a tree of pre-signed transactions that the operators split into leaves. Nothing on the chain says so, and only the deposits this browser has seen are marked.';
  return (
    <div
      className="flex flex-col gap-3 px-4 py-3"
      style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${SPARK_ACCENT}`, borderRadius: 3, backgroundColor: 'transparent' }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <SparkBadge>{exit ? 'KNOWN SPARK EXIT' : 'KNOWN SPARK DEPOSIT'}</SparkBadge>
        <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>
          {d.treeId ? `tree ${d.treeId}` : 'reported by Sparkscan'}
        </span>
      </div>
      <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>{text}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
        {d.vout !== undefined && <Metric label="DEPOSIT OUTPUT" value={`#${d.vout}`} />}
        {d.amountSats !== undefined && (
          <Metric label={fromLeaf ? 'TREE STARTED WITH' : 'AMOUNT'} value={<Amount sats={d.amountSats} style={{ fontSize: 13, color: 'var(--alice-text)' }} />} />
        )}
        {d.sparkAddress && (
          <div className="flex flex-col gap-0.5 min-w-0">
            <FieldLabel>SPARK WALLET</FieldLabel>
            <SparkAddressLink address={d.sparkAddress} onOpenAddress={onOpenAddress} />
          </div>
        )}
        <Metric label="OPERATORS" value="Lightspark, Breez, Flashnet" />
        {fromLeaf && onOpenLeaf && (
          <div className="flex flex-col gap-0.5">
            <FieldLabel>LEAF</FieldLabel>
            <button
              type="button"
              onClick={() => onOpenLeaf(d.leafId!)}
              className="alice-control alice-control--quiet font-numbers text-left cursor-pointer bg-transparent p-0 self-start"
              style={{ fontSize: 13, color: 'var(--alice-primary)' }}
              title="Open the Spark leaf whose exit tree led here"
            >
              open the leaf you came from
            </button>
          </div>
        )}
        {d.sparkTxId && onOpenSparkTx && (
          <div className="flex flex-col gap-0.5">
            <FieldLabel>ON SPARK</FieldLabel>
            <button
              type="button"
              onClick={() => onOpenSparkTx(d.sparkTxId!)}
              className="alice-control alice-control--quiet font-numbers text-left cursor-pointer bg-transparent p-0 self-start"
              style={{ fontSize: 13, color: 'var(--alice-primary)' }}
              title="Open the Spark-side transaction Sparkscan reported"
            >
              open the Spark transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ address view ------------------------------ */

type AddressData = {
  pubkey: string;
  address: string;
  balance: SparkBalance;
  leaves: SparkLeaf[];
  leavesNext: number | null;
  /** Null while the operators are still answering (their slow query). */
  transfers: SparkTransfer[] | null;
  transfersCursor: SparkTransferCursor | null;
  transfersError: string | null;
  /** Sparkscan's count and its token lines; null when it could not be asked. */
  scan: { total: number; tokens: SparkscanTx[] } | null;
};

type AddressTabState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; data: AddressData };

/** The relative timelock a leaf's exit (refund) transaction waits, in blocks. */
function leafExitWait(leaf: SparkLeaf): number | null {
  try {
    if (leaf.refundTx.length === 0) return null;
    return sequenceBlocks(parseRawTx(leaf.refundTx).inputs[0]?.sequence ?? 0xffffffff);
  } catch {
    return null;
  }
}

/** A leaf row, laid out like the Arkade VTXO rows: the id, its state and
 *  exit wait, the way to its exit tree, its amount. */
function LeafRow({ leaf, onOpenLeaf }: { leaf: SparkLeaf; onOpenLeaf?: (id: string) => void }) {
  const wait = leafExitWait(leaf);
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)' }}>
      <div className="flex flex-col min-w-0">
        <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-text)' }} title={leaf.id}>{shortId(leaf.id)}</span>
        <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
          {sparkLeafStatusLabel(leaf.status)}
          {wait !== null ? ` - exit waits ${wait.toLocaleString('en-US')} blocks` : ''}
          {leaf.createdAt ? ` - ${formatDateTime(leaf.createdAt)}` : ''}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onOpenLeaf && (
          <button
            type="button"
            onClick={() => onOpenLeaf(leaf.id)}
            className="alice-control alice-control--quiet font-numbers cursor-pointer bg-transparent"
            style={{ fontSize: 11, padding: '3px 8px', borderRadius: 3, color: 'var(--alice-primary)' }}
            title="Open this leaf: its exit tree, from the on-chain deposit down to the coin"
          >
            exit tree
          </button>
        )}
        <Amount sats={leaf.valueSats} style={{ fontSize: 12, color: 'var(--alice-text)' }} />
      </div>
    </div>
  );
}

/** A transfer row, laid out like the on-chain transaction rows: the whole
 *  row opens the transfer; its net effect on the wallet sits at the right. */
function TransferRow({ t, pubkey, onOpen }: { t: SparkTransfer; pubkey: string; onOpen?: () => void }) {
  const delta = sparkTransferDelta(t, pubkey);
  const sent = delta < 0;
  const otherKey = sent ? t.receiverPubkey : t.senderPubkey;
  const other = isSparkSsp(otherKey) ? 'the SSP (Lightspark)' : shortAddress(sparkAddressOf(otherKey) ?? 'unknown');
  const label = t.type === 'transfer' ? (delta === 0 ? 'Self-transfer' : sent ? `Sent to ${other}` : `Received from ${other}`) : sparkTransferLabel(t);
  const pending = t.status !== 'completed';
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!onOpen}
      className="alice-control alice-control--quiet flex items-center justify-between gap-3 w-full text-left cursor-pointer bg-transparent px-3 py-2"
      style={{ borderTop: '1px solid var(--alice-border)', justifyContent: 'space-between' }}
      title={`Open transfer ${t.id}`}
    >
      <div className="flex flex-col min-w-0">
        <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-text)' }}>{label}</span>
        <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
          {t.createdAt ? formatDateTime(t.createdAt) : 'time unknown'}
          {pending ? ` - ${sparkStatusLabel(t.status).toLowerCase()}` : ''}
          {t.leaves.length ? ` - ${t.leaves.length} ${t.leaves.length === 1 ? 'leaf' : 'leaves'}` : ''}
        </span>
      </div>
      <span className="font-numbers shrink-0 flex items-center gap-1" style={{ fontSize: 12, color: delta > 0 ? 'var(--alice-success)' : 'var(--alice-text)' }}>
        {delta > 0 ? '+' : delta < 0 ? '−' : ''}
        <Amount sats={Math.abs(delta) || t.totalSats} style={{ fontSize: 12, color: 'inherit' }} />
      </span>
    </button>
  );
}

async function loadAddress(address: string, signal: AbortSignal): Promise<AddressData> {
  const decoded = decodeSparkAddress(address);
  if (!decoded) throw new SparkError('Not a Spark address.');
  if (decoded.network !== 'mainnet') throw new SparkError(`A Spark ${decoded.network} address; the Explorer reads Spark on Bitcoin mainnet.`);
  const { pubkey } = decoded;
  // The transfers come separately (see the tab): the operators answer that
  // query in seconds or in tens of seconds, and the rest is quick.
  const [balance, leaves, scan] = await Promise.all([
    getSparkBalance(pubkey, { signal }),
    getSparkLeaves(pubkey, { limit: LEAVES_PAGE, signal }),
    // Sparkscan is the only source of the token lines and of the history's
    // size; when it is down the operators' side still shows.
    getSparkscanAddressTxs(decoded.canonical, { limit: 50, signal })
      .then(r => {
        // Its deposits and exits name their Bitcoin side: remembered, so the
        // Bitcoin views can say what those transactions are.
        noteSparkscanOnchain(r.txs);
        return { total: r.total, tokens: r.txs.filter(t => t.kind === 'token') };
      })
      .catch(() => null),
  ]);
  return {
    pubkey,
    address: decoded.canonical,
    balance,
    leaves: leaves.items,
    leavesNext: leaves.items.length >= LEAVES_PAGE ? leaves.nextOffset : null,
    transfers: null,
    transfersCursor: null,
    transfersError: null,
    scan,
  };
}

function AddressCard({ data, onOpenTx, onOpenLeaf, onMoreTransfers, onMoreLeaves, loadingMore }: {
  data: AddressData;
  onOpenTx?: (id: string) => void;
  onOpenLeaf?: (id: string) => void;
  onMoreTransfers: () => void;
  onMoreLeaves: () => void;
  loadingMore: boolean;
}) {
  // The lists open short and page out on demand, like the on-chain view.
  const [leafLimit, setLeafLimit] = useState(LIST_INITIAL);
  const [transferLimit, setTransferLimit] = useState(LIST_INITIAL);
  const [tokenLimit, setTokenLimit] = useState(LIST_INITIAL);
  const nowSec = Math.floor(Date.now() / 1000);
  const ssp = isSparkSsp(data.pubkey);
  const tokens = data.scan?.tokens ?? [];
  const transfers = data.transfers;
  const empty = data.balance.sats === 0 && data.leaves.length === 0 && transfers !== null && transfers.length === 0;
  // The same insights the on-chain address view computes: the balance over
  // time (from the transfers read so far) and the age of the coins held.
  const history = transfers ? buildSparkBalanceSeries(transfers, data.pubkey, data.balance.sats, data.transfersCursor !== null) : null;
  const coinAge = averageUtxoAge(data.leaves.map(l => ({ valueSats: l.valueSats, blockTime: l.createdAt })), nowSec);
  const firstSeen = transfers?.reduce<number | null>((m, t) => (t.createdAt && (m === null || t.createdAt < m) ? t.createdAt : m), null) ?? null;
  const shownLeaves = data.leaves.slice(0, leafLimit);
  const shownTransfers = (transfers ?? []).slice(0, transferLimit);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${SPARK_ACCENT}`, borderRadius: 3, backgroundColor: 'transparent' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <SparkBadge>SPARK ADDRESS</SparkBadge>
          {ssp && <SparkBadge>SPARK SERVICE PROVIDER</SparkBadge>}
          <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>off-chain, read from the Spark operators</span>
        </div>
        <div className="flex items-start gap-2">
          <p className="font-numbers m-0 break-all min-w-0 flex-1" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{data.address}</p>
          <ExplorerCopy value={data.address} label="address" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label="BALANCE" value={<Amount sats={data.balance.sats} style={{ fontSize: 14, color: 'var(--alice-text)' }} />} title="The spendable balance the operators report. Zero for an empty wallet and for a private one alike." />
          <Metric label="LEAVES" value={data.balance.leaves.toLocaleString('en-US')} title="The coins carrying the balance, each with its own pre-signed exit." />
          <Metric label="TRANSFERS" value={data.scan ? data.scan.total.toLocaleString('en-US') : transfers === null ? '…' : data.transfersCursor === null ? transfers.length.toLocaleString('en-US') : `${transfers.length.toLocaleString('en-US')}+`} title="Bitcoin and token lines, as Sparkscan counts them." />
          <Metric label="FIRST SEEN" value={transfers === null ? '…' : data.transfersCursor !== null ? 'earlier' : shortDate(firstSeen)} title="The oldest transfer read; a busy wallet's history reaches further back than the pages read." />
          <Metric label="AVG COIN AGE" value={coinAge ? formatAge(coinAge.days) : (data.balance.sats > 0 ? '-' : 'no coins held')} title="Weighted by amount, from each leaf's creation." />
          <Metric label="OPERATORS" value={SPARK_OPERATORS.map(o => o.name).join(', ')} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-numbers" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--alice-muted)' }}>IDENTITY KEY</span>
          <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{data.pubkey}</span>
        </div>
      </div>

      {/* Balance over time, like the on-chain address view: from the
          transfers read so far, anchored at the balance the operators
          report. A busy wallet's older history is left out (partial). */}
      {transfers === null ? (
        <SectionPanel title="BALANCE"><div className="px-3 py-3"><Skeleton height={110} /></div></SectionPanel>
      ) : history && history.points.length >= 2 ? (
        <div className="rh-fade-in"><ExplorerBalanceChart points={history.points} partial={history.partial} /></div>
      ) : (
        <SectionPanel title="BALANCE">
          <p className="font-numbers m-0 px-3 py-3" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
            {empty ? 'Nothing to chart: no balance and no transfer the operators would show.' : 'No dated transfer to chart yet.'}
          </p>
        </SectionPanel>
      )}

      {/* The leaves as packed circles, the off-chain twin of the
          unspent-outputs view. */}
      {data.leaves.length > 0 ? (
        <ExplorerUtxoBubbles
          utxos={data.leaves.map(l => ({ valueSats: l.valueSats, blockTime: l.createdAt }))}
          title="LEAVES"
        />
      ) : (
        <SectionPanel title="LEAVES">
          <p className="font-numbers m-0 px-3 py-3" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
            {empty ? 'No leaves: the wallet holds nothing, or its owner turned privacy on, which the operators answer the same way.' : 'No available leaf.'}
          </p>
        </SectionPanel>
      )}

      {empty && (
        <EmptyState
          title="Empty, or private"
          hint="The operators answer the same way for a wallet that holds nothing and for one whose owner turned privacy on: a zero balance and no transfers. Token activity, when there is any, stays public and is listed below."
        />
      )}

      {data.leaves.length > 0 && (
        <SectionPanel
          title="LEAVES"
          right={
            <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
              {Math.min(leafLimit, data.leaves.length).toLocaleString('en-US')} of {data.balance.leaves.toLocaleString('en-US')}
            </span>
          }
        >
          {shownLeaves.map(l => <LeafRow key={l.id} leaf={l} onOpenLeaf={onOpenLeaf} />)}
          {(leafLimit < data.leaves.length || data.leavesNext !== null) && (
            <button
              type="button"
              onClick={() => { if (leafLimit < data.leaves.length) setLeafLimit(l => l + LIST_PAGE); else onMoreLeaves(); }}
              disabled={loadingMore}
              className="alice-control alice-control--quiet font-numbers cursor-pointer"
              style={{ fontSize: 13, padding: '8px 16px', color: 'var(--alice-primary)' }}
            >
              {loadingMore ? 'LOADING…' : 'SHOW MORE'}
            </button>
          )}
        </SectionPanel>
      )}

      <SectionPanel
        title="TRANSFERS"
        right={
          <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
            {transfers === null ? 'reading…' : `${Math.min(transferLimit, transfers.length).toLocaleString('en-US')} of ${data.transfersCursor === null ? transfers.length.toLocaleString('en-US') : `${transfers.length.toLocaleString('en-US')}+`}`}
          </span>
        }
      >
        {transfers === null ? (
          data.transfersError ? (
            <p className="font-numbers m-0 px-3 py-3" style={{ fontSize: 12, color: 'var(--alice-danger)' }}>{data.transfersError}</p>
          ) : (
            <Analyzing label="reading the transfers from the Spark operators…" />
          )
        ) : transfers.length === 0 ? (
          <p className="font-numbers m-0 px-3 py-3" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>No transfers to list.</p>
        ) : (
          <div className="rh-fade-in">
            {shownTransfers.map(t => <TransferRow key={t.id} t={t} pubkey={data.pubkey} onOpen={onOpenTx ? () => onOpenTx(t.id) : undefined} />)}
            {(transferLimit < transfers.length || data.transfersCursor !== null) && (
              <button
                type="button"
                onClick={() => { if (transferLimit < transfers.length) setTransferLimit(l => l + LIST_PAGE); else onMoreTransfers(); }}
                disabled={loadingMore}
                className="alice-control alice-control--quiet font-numbers cursor-pointer"
                style={{ fontSize: 13, padding: '8px 16px', color: 'var(--alice-primary)' }}
              >
                {loadingMore ? 'LOADING…' : 'SHOW MORE'}
              </button>
            )}
          </div>
        )}
      </SectionPanel>

      {tokens.length > 0 && (
        <SectionPanel
          title="TOKEN ACTIVITY"
          right={<span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>from Sparkscan</span>}
        >
          {tokens.slice(0, tokenLimit).map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => onOpenTx?.(t.id)}
              disabled={!onOpenTx}
              className="alice-control alice-control--quiet flex items-center justify-between gap-3 w-full text-left cursor-pointer bg-transparent px-3 py-2"
              style={{ borderTop: '1px solid var(--alice-border)', justifyContent: 'space-between' }}
              title={`Open ${t.id}`}
            >
              <div className="flex flex-col min-w-0">
                <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-text)' }}>
                  Token {t.rawType.replace(/^token_?/, '').replace(/_/g, ' ') || 'transfer'}
                </span>
                <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
                  {t.createdAt !== null ? formatDateTime(t.createdAt) : 'time unknown'}
                </span>
              </div>
              <SparkBadge>TOKEN</SparkBadge>
            </button>
          ))}
          {tokens.length > tokenLimit && (
            <button
              type="button"
              onClick={() => setTokenLimit(l => l + LIST_PAGE)}
              className="alice-control alice-control--quiet font-numbers cursor-pointer"
              style={{ fontSize: 13, padding: '8px 16px', color: 'var(--alice-primary)' }}
            >
              SHOW MORE
            </button>
          )}
        </SectionPanel>
      )}
    </div>
  );
}

/** The address tab of the Spark network: a wallet by its spark1… address,
 *  read from the operators (balance, leaves, transfers) and, for the token
 *  lines, from Sparkscan. */
export function ExplorerSparkAddressTab({ address, onOpenTx, onOpenLeaf, onSignals }: {
  address: string;
  /** Opens a transfer (or a token transaction) on the Spark network. */
  onOpenTx?: (id: string) => void;
  /** Opens a leaf's own tab (its exit tree). */
  onOpenLeaf?: (id: string) => void;
  /** Hands the page's context to the Ask Alice dock: a LAYER_CONTEXT signal
      (shape only, de-identified) and the full description for identified mode. */
  onSignals?: (signals: PrivacySignal[], full?: FullContext) => void;
}) {
  const [state, setState] = useState<AddressTabState>({ kind: 'loading' });
  // The page's context for Ask Alice: published once the address is on
  // screen, again when the transfers arrive or more leaves are read.
  const onSignalsRef = useRef(onSignals);
  onSignalsRef.current = onSignals;
  const loadedData = state.kind === 'loaded' ? state.data : null;
  useEffect(() => {
    if (!loadedData) return;
    const ctx = sparkAddressContext({ ...loadedData, transfersMore: loadedData.transfersCursor !== null });
    onSignalsRef.current?.([ctx.signal], ctx.full);
  }, [loadedData]);
  const [retryToken, setRetryToken] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setState({ kind: 'loading' });
    loadAddress(address, controller.signal)
      .then(data => setState({ kind: 'loaded', data }))
      .catch(e => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setState({ kind: 'error', message: e instanceof SparkError ? e.message : 'Could not load this Spark address. Retry, or reload the page if it keeps failing.' });
      });
    return () => controller.abort();
  }, [address, retryToken]);

  // The transfers, once the rest is on screen: the operators' slow query.
  const loadedKey = state.kind === 'loaded' && state.data.transfers === null && !state.data.transfersError ? state.data.pubkey : null;
  useEffect(() => {
    if (!loadedKey) return;
    const controller = new AbortController();
    getSparkTransfers(loadedKey, { limit: TRANSFERS_PAGE, signal: controller.signal })
      .then(page => setState(prev => prev.kind === 'loaded' && prev.data.pubkey === loadedKey
        ? { kind: 'loaded', data: { ...prev.data, transfers: page.items, transfersCursor: page.cursor } }
        : prev))
      .catch(e => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        const message = e instanceof SparkError ? e.message : 'The operators did not answer the transfers query.';
        setState(prev => prev.kind === 'loaded' && prev.data.pubkey === loadedKey ? { kind: 'loaded', data: { ...prev.data, transfersError: message } } : prev);
      });
    return () => controller.abort();
  }, [loadedKey]);

  async function more(what: 'transfers' | 'leaves') {
    if (state.kind !== 'loaded' || loadingMore) return;
    const { data } = state;
    setLoadingMore(true);
    try {
      if (what === 'transfers' && data.transfersCursor !== null) {
        const page = await getSparkTransfers(data.pubkey, { limit: TRANSFERS_PAGE, cursor: data.transfersCursor });
        setState({ kind: 'loaded', data: { ...data, transfers: mergeSparkTransfers(data.transfers ?? [], page.items), transfersCursor: page.cursor } });
      } else if (what === 'leaves' && data.leavesNext !== null) {
        const page = await getSparkLeaves(data.pubkey, { limit: LEAVES_PAGE, offset: data.leavesNext });
        setState({ kind: 'loaded', data: { ...data, leaves: [...data.leaves, ...page.items], leavesNext: page.items.length >= LEAVES_PAGE ? page.nextOffset : null } });
      }
    } catch {
      /* the page stays as it is; the button can be tried again */
    } finally {
      setLoadingMore(false);
    }
  }

  if (state.kind === 'loading') {
    // The page structure is laid out from the first paint (metrics, balance,
    // leaf bubbles, lists) and the data swaps in place, like the on-chain tab.
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3, backgroundColor: 'transparent' }}>
          <Skeleton width="60%" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
            {['BALANCE', 'LEAVES', 'TRANSFERS', 'FIRST SEEN'].map(l => (
              <div key={l} className="flex flex-col gap-1">
                <span className="font-numbers" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--alice-muted)' }}>{l}</span>
                <Skeleton width="60%" />
              </div>
            ))}
          </div>
        </div>
        <SectionPanel title="BALANCE"><div className="px-3 py-3"><Skeleton height={110} /></div></SectionPanel>
        <SectionPanel title="LEAVES">
          <div className="flex items-center justify-center gap-3 px-3 py-4">
            <Skeleton width={64} height={64} style={{ borderRadius: '50%' }} />
            <Skeleton width={40} height={40} style={{ borderRadius: '50%' }} />
            <Skeleton width={26} height={26} style={{ borderRadius: '50%' }} />
          </div>
        </SectionPanel>
        <SectionPanel title="TRANSFERS"><Analyzing label="reading the wallet from the Spark operators…" /></SectionPanel>
      </div>
    );
  }
  if (state.kind === 'error') {
    return (
      <div className="flex flex-col gap-2 px-4 py-3" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>COULD NOT LOAD</span>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{state.message}</p>
        <button
          type="button"
          onClick={() => setRetryToken(t => t + 1)}
          className="alice-control alice-control--quiet font-numbers self-start cursor-pointer"
          style={{ fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)' }}
        >
          RETRY
        </button>
      </div>
    );
  }
  return (
    <div className="rh-fade-in">
      <AddressCard
        data={state.data}
        onOpenTx={onOpenTx}
        onOpenLeaf={onOpenLeaf}
        onMoreTransfers={() => void more('transfers')}
        onMoreLeaves={() => void more('leaves')}
        loadingMore={loadingMore}
      />
    </div>
  );
}
