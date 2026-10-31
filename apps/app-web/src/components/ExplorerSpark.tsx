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
import { formatLocale, t as tNow, type Translator, useT } from '@/i18n';

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

function agoLabel(sec: number, tr: Translator): string {
  const s = Math.floor(Date.now() / 1000 - sec);
  if (s < 5) return tr('explorerSpark.ago.now');
  if (s < 60) return tr('explorerSpark.ago.seconds', { count: s });
  if (s < 3600) return tr('explorerSpark.ago.minutes', { count: Math.floor(s / 60) });
  if (s < 86_400) return tr('explorerSpark.ago.hours', { count: Math.floor(s / 3600) });
  return tr('explorerSpark.ago.days', { count: Math.floor(s / 86_400) });
}

function shortAddress(a: string): string {
  return a.length > 24 ? `${a.slice(0, 12)}…${a.slice(-6)}` : a;
}

function shortId(id: string): string {
  return id.length > 20 ? `${id.slice(0, 13)}…${id.slice(-6)}` : id;
}

function shortDate(sec?: number | null): string {
  return sec ? new Date(sec * 1000).toLocaleDateString(formatLocale(), { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
}

function formatAge(days: number, tr: Translator): string {
  return days < 1 ? tr('explorerArk.address.ageHours', { count: Math.round(days * 24) }) : tr('explorerArk.address.ageDays', { count: days.toFixed(1) });
}

/** A Spark address, shortened, opening its view when the caller can. */
export function SparkAddressLink({ address, label, onOpenAddress }: { address: string; label?: string; onOpenAddress?: (address: string) => void }) {
  const tr = useT();
  const text = label ?? shortAddress(address);
  return onOpenAddress ? (
    <button
      type="button"
      onClick={() => onOpenAddress(address)}
      className="alice-control alice-control--quiet font-numbers truncate text-left cursor-pointer bg-transparent p-0"
      style={{ fontSize: 11, color: 'var(--alice-primary)' }}
      title={tr('explorerSpark.open', { id: address })}
    >
      {text}
    </button>
  ) : (
    <span className="font-numbers truncate" style={{ fontSize: 11, color: 'var(--alice-muted)' }} title={address}>{text}</span>
  );
}

/** A party of a Sparkscan line, as text: a Spark address (the SSP named),
 *  the Lightning network, or whatever Sparkscan wrote. */
function partyText(party: SparkscanTx['from'], tr: Translator): string {
  if (!party) return tr('explorerSpark.party.unknown');
  if (party.kind === 'spark' && party.address) return party.pubkey && isSparkSsp(party.pubkey) ? tr('explorerSpark.party.ssp') : shortAddress(party.address);
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
  const tr = useT();
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
        setError(e instanceof SparkscanError ? e.message : tr('explorerSpark.sparkscan.unreachable'));
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
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{tr('explorerSpark.feed.title')}</span>
        <span className="flex items-center gap-1.5">
          <span style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: live ? 'var(--alice-success)' : 'var(--alice-muted)' }} />
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{live ? tr('explorerSpark.feed.live') : tr('explorerSpark.feed.connecting')}</span>
        </span>
      </div>
      <div className="flex flex-col" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
        {shown.length === 0 ? (
          error ? (
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{tr('explorerSpark.feed.unavailable')}</span>
              <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{error}</p>
            </div>
          ) : (
            <Analyzing label={tr('explorerSpark.feed.reading')} />
          )
        ) : (
          shown.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onOpenTx(t.id)}
              className="alice-control alice-control--quiet flex items-center justify-between gap-3 w-full text-left cursor-pointer bg-transparent px-3 py-2"
              style={{ borderTop: i > 0 ? '1px solid var(--alice-border)' : undefined, justifyContent: 'space-between' }}
              title={tr('explorerSpark.open', { id: t.id })}
            >
              <div className="flex flex-col min-w-0">
                <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-primary)' }}>
                  {t.kind === 'token' && !t.from && !t.to ? tr('explorerSpark.feed.severalParties') : `${partyText(t.from, tr)} → ${partyText(t.to, tr)}`}
                </span>
                <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
                  {t.createdAt !== null ? `${agoLabel(t.createdAt, tr)} · ${formatDateTime(t.createdAt)}` : tr('explorerSpark.timeUnknown')}
                  {t.status !== 'confirmed' && t.status !== 'completed' ? ` · ${t.status}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SparkBadge>{sparkscanKindLabel(t.kind, tr.locale).toUpperCase()}</SparkBadge>
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
          {tr('explorerSpark.feed.showMore', { count: Math.min(FEED_STEP, items.length - shown.length) })}
        </button>
      )}
    </div>
  );
}

/** The operators and the protocol's parameters, as a section of the Spark
 *  overview. Static: the SDK ships them, and the operators publish no
 *  parameter endpoint of their own. */
export function SparkOperatorsInfo() {
  const tr = useT();
  return (
    <div className="flex flex-col gap-2">
      <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{tr('explorerSpark.ops.title')}</span>
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${SPARK_ACCENT}`, borderRadius: 3, backgroundColor: 'transparent' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label={tr('explorerSpark.ops.title')} value={SPARK_OPERATORS.map(o => o.name).join(', ')} title={tr('explorerSpark.ops.operatorsTitle')} />
          <Metric label={tr('explorerSpark.ops.exitTimelock')} value={formatSparkBlocks(SPARK_TIMELOCK.initialBlocks, tr.locale)} title={tr('explorerSpark.ops.exitTimelockTitle')} />
          <Metric label={tr('explorerSpark.ops.perTransfer')} value={tr('explorerSpark.ops.blocksFewer', { count: SPARK_TIMELOCK.stepBlocks })} title={tr('explorerSpark.ops.perTransferTitle')} />
          <Metric label={tr('explorerSpark.ops.renewedUnder')} value={tr('explorerSpark.ops.blocks', { count: SPARK_TIMELOCK.renewBelowBlocks })} title={tr('explorerSpark.ops.renewedUnderTitle')} />
          <Metric label={tr('explorerSpark.ops.settlesOn')} value="Bitcoin mainnet" />
          <Metric label="SSP" value="Lightspark" title={tr('explorerSpark.ops.sspTitle')} />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>{tr('explorerSpark.ops.keys')}</FieldLabel>
          {SPARK_OPERATORS.map(o => (
            <span key={o.pubkey} className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{o.name} · {o.url.replace(/^https:\/\//, '')} · {o.pubkey}</span>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>{tr('explorerSpark.ops.sspKey')}</FieldLabel>
          <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{SPARK_SSP_PUBKEY}</span>
        </div>
      </div>
    </div>
  );
}

/** The row badge of a known Spark transaction, wherever a list shows it. */
export function SparkTxBadge({ kind }: { kind: SparkOnchainKind }) {
  const tr = useT();
  return <SparkBadge>{kind === 'exit' ? tr('explorerSpark.badge.exit') : tr('explorerSpark.badge.deposit')}</SparkBadge>;
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
  const tr = useT();
  const exit = d.kind === 'exit';
  const fromLeaf = d.source === 'leaf' && d.leafId !== undefined;
  const text = exit
    ? tr('explorerSpark.onchain.exit')
    : fromLeaf
      ? tr('explorerSpark.onchain.leafDeposit', { vout: d.vout ?? '' })
      : tr('explorerSpark.onchain.deposit');
  return (
    <div
      className="flex flex-col gap-3 px-4 py-3"
      style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${SPARK_ACCENT}`, borderRadius: 3, backgroundColor: 'transparent' }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <SparkBadge>{exit ? tr('explorerSpark.onchain.knownExit') : tr('explorerSpark.onchain.knownDeposit')}</SparkBadge>
        <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>
          {d.treeId ? tr('explorerSpark.onchain.tree', { id: d.treeId }) : tr('explorerSpark.onchain.reported')}
        </span>
      </div>
      <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>{text}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
        {d.vout !== undefined && <Metric label={tr('explorerSpark.onchain.depositOutput')} value={`#${d.vout}`} />}
        {d.amountSats !== undefined && (
          <Metric label={fromLeaf ? tr('explorerSpark.onchain.treeStarted') : tr('explorerSpark.onchain.amount')} value={<Amount sats={d.amountSats} style={{ fontSize: 13, color: 'var(--alice-text)' }} />} />
        )}
        {d.sparkAddress && (
          <div className="flex flex-col gap-0.5 min-w-0">
            <FieldLabel>{tr('explorerSpark.onchain.wallet')}</FieldLabel>
            <SparkAddressLink address={d.sparkAddress} onOpenAddress={onOpenAddress} />
          </div>
        )}
        <Metric label={tr('explorerSpark.ops.title')} value="Lightspark, Breez, Flashnet" />
        {fromLeaf && onOpenLeaf && (
          <div className="flex flex-col gap-0.5">
            <FieldLabel>{tr('explorerSpark.onchain.leaf')}</FieldLabel>
            <button
              type="button"
              onClick={() => onOpenLeaf(d.leafId!)}
              className="alice-control alice-control--quiet font-numbers text-left cursor-pointer bg-transparent p-0 self-start"
              style={{ fontSize: 13, color: 'var(--alice-primary)' }}
              title={tr('explorerSpark.onchain.openLeafTitle')}
            >
              {tr('explorerSpark.onchain.openLeaf')}
            </button>
          </div>
        )}
        {d.sparkTxId && onOpenSparkTx && (
          <div className="flex flex-col gap-0.5">
            <FieldLabel>{tr('explorerSpark.onchain.onSpark')}</FieldLabel>
            <button
              type="button"
              onClick={() => onOpenSparkTx(d.sparkTxId!)}
              className="alice-control alice-control--quiet font-numbers text-left cursor-pointer bg-transparent p-0 self-start"
              style={{ fontSize: 13, color: 'var(--alice-primary)' }}
              title={tr('explorerSpark.onchain.openSparkTxTitle')}
            >
              {tr('explorerSpark.onchain.openSparkTx')}
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
  const tr = useT();
  const wait = leafExitWait(leaf);
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)' }}>
      <div className="flex flex-col min-w-0">
        <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-text)' }} title={leaf.id}>{shortId(leaf.id)}</span>
        <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
          {sparkLeafStatusLabel(leaf.status, tr.locale)}
          {wait !== null ? ` - ${tr('explorerSpark.leaf.exitWaits', { blocks: wait.toLocaleString(formatLocale()) })}` : ''}
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
            title={tr('explorerSpark.leaf.openTitle')}
          >
            {tr('explorerSpark.leaf.exitTree')}
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
  const tr = useT();
  const delta = sparkTransferDelta(t, pubkey);
  const sent = delta < 0;
  const otherKey = sent ? t.receiverPubkey : t.senderPubkey;
  const other = isSparkSsp(otherKey) ? tr('explorerSpark.transfer.ssp') : shortAddress(sparkAddressOf(otherKey) ?? tr('explorerSpark.party.unknown'));
  const label = t.type === 'transfer' ? (delta === 0 ? tr('explorerSpark.transfer.self') : sent ? tr('explorerSpark.transfer.sentTo', { other }) : tr('explorerSpark.transfer.receivedFrom', { other })) : sparkTransferLabel(t, tr.locale);
  const pending = t.status !== 'completed';
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!onOpen}
      className="alice-control alice-control--quiet flex items-center justify-between gap-3 w-full text-left cursor-pointer bg-transparent px-3 py-2"
      style={{ borderTop: '1px solid var(--alice-border)', justifyContent: 'space-between' }}
      title={tr('explorerSpark.transfer.open', { id: t.id })}
    >
      <div className="flex flex-col min-w-0">
        <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-text)' }}>{label}</span>
        <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
          {t.createdAt ? formatDateTime(t.createdAt) : tr('explorerSpark.timeUnknown')}
          {pending ? ` - ${sparkStatusLabel(t.status, tr.locale).toLowerCase()}` : ''}
          {t.leaves.length ? ` - ${tr.plural('explorerSpark.transfer.leaves', t.leaves.length)}` : ''}
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
  if (!decoded) throw new SparkError(tNow('explorerSpark.error.notAddress'));
  if (decoded.network !== 'mainnet') throw new SparkError(tNow('explorerSpark.error.network', { network: decoded.network }));
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
  const tr = useT();
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
          <SparkBadge>{tr('explorerSpark.address.badge')}</SparkBadge>
          {ssp && <SparkBadge>SPARK SERVICE PROVIDER</SparkBadge>}
          <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{tr('explorerSpark.address.source')}</span>
        </div>
        <div className="flex items-start gap-2">
          <p className="font-numbers m-0 break-all min-w-0 flex-1" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{data.address}</p>
          <ExplorerCopy value={data.address} label={tr('explorerSpark.address.copy')} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label={tr('explorerSpark.address.balance')} value={<Amount sats={data.balance.sats} style={{ fontSize: 14, color: 'var(--alice-text)' }} />} title={tr('explorerSpark.address.balanceTitle')} />
          <Metric label={tr('explorerSpark.address.leaves')} value={data.balance.leaves.toLocaleString(formatLocale())} title={tr('explorerSpark.address.leavesTitle')} />
          <Metric label={tr('explorerSpark.address.transfers')} value={data.scan ? data.scan.total.toLocaleString(formatLocale()) : transfers === null ? '…' : data.transfersCursor === null ? transfers.length.toLocaleString(formatLocale()) : `${transfers.length.toLocaleString(formatLocale())}+`} title={tr('explorerSpark.address.transfersTitle')} />
          <Metric label={tr('explorerSpark.address.firstSeen')} value={transfers === null ? '…' : data.transfersCursor !== null ? tr('explorerSpark.address.earlier') : shortDate(firstSeen)} title={tr('explorerSpark.address.firstSeenTitle')} />
          <Metric label={tr('explorerSpark.address.avgAge')} value={coinAge ? formatAge(coinAge.days, tr) : (data.balance.sats > 0 ? '-' : tr('explorerSpark.address.noCoins'))} title={tr('explorerSpark.address.avgAgeTitle')} />
          <Metric label={tr('explorerSpark.address.operators')} value={SPARK_OPERATORS.map(o => o.name).join(', ')} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-numbers" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--alice-muted)' }}>{tr('explorerSpark.address.identityKey')}</span>
          <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{data.pubkey}</span>
        </div>
      </div>

      {/* Balance over time, like the on-chain address view: from the
          transfers read so far, anchored at the balance the operators
          report. A busy wallet's older history is left out (partial). */}
      {transfers === null ? (
        <SectionPanel title={tr('explorerSpark.address.balance')}><div className="px-3 py-3"><Skeleton height={110} /></div></SectionPanel>
      ) : history && history.points.length >= 2 ? (
        <div className="rh-fade-in"><ExplorerBalanceChart points={history.points} partial={history.partial} /></div>
      ) : (
        <SectionPanel title={tr('explorerSpark.address.balance')}>
          <p className="font-numbers m-0 px-3 py-3" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
            {empty ? tr('explorerSpark.address.nothingToChart') : tr('explorerSpark.address.noDatedTransfer')}
          </p>
        </SectionPanel>
      )}

      {/* The leaves as packed circles, the off-chain twin of the
          unspent-outputs view. */}
      {data.leaves.length > 0 ? (
        <ExplorerUtxoBubbles
          utxos={data.leaves.map(l => ({ valueSats: l.valueSats, blockTime: l.createdAt }))}
          title={tr('explorerSpark.address.leaves')}
        />
      ) : (
        <SectionPanel title={tr('explorerSpark.address.leaves')}>
          <p className="font-numbers m-0 px-3 py-3" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
            {empty ? tr('explorerSpark.address.noLeavesEmpty') : tr('explorerSpark.address.noLeaf')}
          </p>
        </SectionPanel>
      )}

      {empty && (
        <EmptyState
          title={tr('explorerSpark.address.emptyTitle')}
          hint={tr('explorerSpark.address.emptyHint')}
        />
      )}

      {data.leaves.length > 0 && (
        <SectionPanel
          title={tr('explorerSpark.address.leaves')}
          right={
            <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
              {tr('explorerSpark.address.shownOf', { shown: Math.min(leafLimit, data.leaves.length).toLocaleString(formatLocale()), total: data.balance.leaves.toLocaleString(formatLocale()) })}
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
              {loadingMore ? tr('explorerSpark.address.loading') : tr('explorerSpark.address.showMore')}
            </button>
          )}
        </SectionPanel>
      )}

      <SectionPanel
        title={tr('explorerSpark.address.transfers')}
        right={
          <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
            {transfers === null ? tr('explorerSpark.address.reading') : tr('explorerSpark.address.shownOf', { shown: Math.min(transferLimit, transfers.length).toLocaleString(formatLocale()), total: data.transfersCursor === null ? transfers.length.toLocaleString(formatLocale()) : `${transfers.length.toLocaleString(formatLocale())}+` })}
          </span>
        }
      >
        {transfers === null ? (
          data.transfersError ? (
            <p className="font-numbers m-0 px-3 py-3" style={{ fontSize: 12, color: 'var(--alice-danger)' }}>{data.transfersError}</p>
          ) : (
            <Analyzing label={tr('explorerSpark.address.readingTransfers')} />
          )
        ) : transfers.length === 0 ? (
          <p className="font-numbers m-0 px-3 py-3" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>{tr('explorerSpark.address.noTransfers')}</p>
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
                {loadingMore ? tr('explorerSpark.address.loading') : tr('explorerSpark.address.showMore')}
              </button>
            )}
          </div>
        )}
      </SectionPanel>

      {tokens.length > 0 && (
        <SectionPanel
          title={tr('explorerSpark.address.tokenActivity')}
          right={<span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>{tr('explorerSpark.address.fromSparkscan')}</span>}
        >
          {tokens.slice(0, tokenLimit).map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => onOpenTx?.(t.id)}
              disabled={!onOpenTx}
              className="alice-control alice-control--quiet flex items-center justify-between gap-3 w-full text-left cursor-pointer bg-transparent px-3 py-2"
              style={{ borderTop: '1px solid var(--alice-border)', justifyContent: 'space-between' }}
              title={tr('explorerSpark.open', { id: t.id })}
            >
              <div className="flex flex-col min-w-0">
                <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-text)' }}>
                  {tr('explorerSpark.address.tokenLine', { type: t.rawType.replace(/^token_?/, '').replace(/_/g, ' ') || tr('explorerSpark.address.tokenTransfer') })}
                </span>
                <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
                  {t.createdAt !== null ? formatDateTime(t.createdAt) : tr('explorerSpark.timeUnknown')}
                </span>
              </div>
              <SparkBadge>{tr('explorerSpark.address.tokenBadge')}</SparkBadge>
            </button>
          ))}
          {tokens.length > tokenLimit && (
            <button
              type="button"
              onClick={() => setTokenLimit(l => l + LIST_PAGE)}
              className="alice-control alice-control--quiet font-numbers cursor-pointer"
              style={{ fontSize: 13, padding: '8px 16px', color: 'var(--alice-primary)' }}
            >
              {tr('explorerSpark.address.showMore')}
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
  const tr = useT();
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
        setState({ kind: 'error', message: e instanceof SparkError ? e.message : tr('explorerSpark.tab.loadFailed') });
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
        const message = e instanceof SparkError ? e.message : tr('explorerSpark.tab.transfersFailed');
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
            {[tr('explorerSpark.address.balance'), tr('explorerSpark.address.leaves'), tr('explorerSpark.address.transfers'), tr('explorerSpark.address.firstSeen')].map(l => (
              <div key={l} className="flex flex-col gap-1">
                <span className="font-numbers" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--alice-muted)' }}>{l}</span>
                <Skeleton width="60%" />
              </div>
            ))}
          </div>
        </div>
        <SectionPanel title={tr('explorerSpark.address.balance')}><div className="px-3 py-3"><Skeleton height={110} /></div></SectionPanel>
        <SectionPanel title={tr('explorerSpark.address.leaves')}>
          <div className="flex items-center justify-center gap-3 px-3 py-4">
            <Skeleton width={64} height={64} style={{ borderRadius: '50%' }} />
            <Skeleton width={40} height={40} style={{ borderRadius: '50%' }} />
            <Skeleton width={26} height={26} style={{ borderRadius: '50%' }} />
          </div>
        </SectionPanel>
        <SectionPanel title={tr('explorerSpark.address.transfers')}><Analyzing label={tr('explorerSpark.tab.readingWallet')} /></SectionPanel>
      </div>
    );
  }
  if (state.kind === 'error') {
    return (
      <div className="flex flex-col gap-2 px-4 py-3" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{tr('explorerSpark.tab.couldNotLoad')}</span>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{state.message}</p>
        <button
          type="button"
          onClick={() => setRetryToken(n => n + 1)}
          className="alice-control alice-control--quiet font-numbers self-start cursor-pointer"
          style={{ fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)' }}
        >
          {tr('explorerSpark.tab.retry')}
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
