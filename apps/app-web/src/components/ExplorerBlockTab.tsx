'use client';

import { ExplorerCopy } from '@/components/ExplorerUI';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { ChainDataProvider } from '@/lib/explorer/provider';
import { ChainDataError } from '@/lib/explorer/provider';
import type { NormalizedBlock, NormalizedTransaction } from '@/lib/explorer/types';
import { buildBlockContext, buildFullBlockDescription, type PrivacySignal } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import { feeColor, formatBlockAge, formatBytes, formatDateTime, formatFeeRange } from '@/lib/explorer/blocks';
import { ExplorerBlockTreemap } from '@/components/ExplorerBlockTreemap';
import { SectionPanel, Skeleton, SkeletonLines } from '@/components/ExplorerUI';
import { Amount } from '@/components/AmountDisplay';

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; block: NormalizedBlock };

const PAGE = 25;

/** One kind of transaction to mark in a block (Arkade settlements, Bark
 *  rounds): which txids, which block carries which, and how to show it. */
export type BlockMark = {
  txids: ReadonlySet<string>;
  /** Block height -> marked txid, for the header badge and the pinned row. */
  byHeight: ReadonlyMap<number, string>;
  color: string;
  /** Legible on the hover card, where the fill colour could vanish. */
  textColor: string;
  /** The hover label in the block map. */
  label: string;
  /** The row badge (one for all, or one per transaction), and the header
   *  badge of a block carrying one; a mark with no heights has no header. */
  badge: ReactNode | ((txid: string) => ReactNode);
  headerBadge: ReactNode;
};

function rowBadge(mark: BlockMark | undefined, txid: string): ReactNode {
  if (!mark) return undefined;
  return typeof mark.badge === 'function' ? mark.badge(txid) : mark.badge;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{label}</span>
      <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{value}</span>
    </div>
  );
}

function shortTxid(txid: string): string {
  return `${txid.slice(0, 10)}...${txid.slice(-8)}`;
}

function outputTotal(tx: NormalizedTransaction): number {
  return tx.outputs.reduce((s, o) => s + o.valueSats, 0);
}

// A Liquid tx has confidential (blinded) output amounts: their sum is not a
// real total, so the row shows "unknown" instead of a misleading number.
function hasConfidentialOutputs(tx: NormalizedTransaction): boolean {
  return tx.outputs.some(o => o.amountKnown === false);
}

function TxRow({ tx, badge, onOpen, selected, onSelect }: { tx: NormalizedTransaction; badge?: ReactNode; onOpen: () => void; selected?: boolean; onSelect?: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      onFocus={onSelect}
      onPointerEnter={onSelect}
      aria-current={selected ? 'true' : undefined}
      className="alice-control alice-control--quiet flex items-center justify-between gap-3 w-full text-left cursor-pointer bg-transparent px-3 py-2"
      style={{ justifyContent: 'space-between', borderLeft: `2px solid ${selected ? 'var(--alice-selected)' : 'transparent'}`, backgroundColor: selected ? 'var(--alice-hover)' : undefined }}
    >
      <div className="flex flex-col min-w-0">
        <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-text)' }} title={tx.txid}>
          {tx.isCoinbase ? 'Coinbase' : shortTxid(tx.txid)}
        </span>
        <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
          {tx.inputs.length} in / {tx.outputs.length} out
          {tx.feeRateSatVb !== null ? ` - ${tx.feeRateSatVb} sat/vB` : ''}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge}
        {hasConfidentialOutputs(tx) ? (
          <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>unknown</span>
        ) : (
          <Amount sats={outputTotal(tx)} style={{ fontSize: 12, color: 'var(--alice-text)' }} />
        )}
      </div>
    </button>
  );
}

export function ExplorerBlockTab({
  height,
  provider,
  onOpenTx,
  onSignals,
  marks,
}: {
  height: string;
  provider: ChainDataProvider;
  onOpenTx: (txid: string) => void;
  /** Report the block-context signal once loaded, plus its full description,
      for the Ask-Alice sidebar. */
  onSignals?: (signals: PrivacySignal[], full?: FullContext) => void;
  /** The transactions to mark on this chain (Arkade settlements, Bark
   *  rounds): their rows are badged, a block carrying one says so in its
   *  header and pins that transaction on top. Memoised by the caller. */
  marks?: ReadonlyArray<BlockMark>;
}) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [selectedTxid, setSelectedTxid] = useState<string | null>(null);
  const [txs, setTxs] = useState<NormalizedTransaction[]>([]);
  // The block's marked transactions (a settlement, a round), fetched on their
  // own so they show pinned even when deep in the (paginated) list.
  const [pinned, setPinned] = useState<Array<{ tx: NormalizedTransaction; mark: BlockMark }>>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  // Bumped by the RETRY button: re-runs the fetch effect after a failure
  // (typically the public endpoint rate-limiting), without a full reload.
  const [retryToken, setRetryToken] = useState(0);
  const now = Math.floor(Date.now() / 1000);
  const highlights = useMemo(
    () => marks?.filter(m => m.txids.size > 0).map(m => ({ txids: m.txids, color: m.color, label: m.label, textColor: m.textColor })),
    [marks],
  );

  // Kept in a ref so reporting signals never forces the fetch effect to re-run.
  const onSignalsRef = useRef(onSignals);
  onSignalsRef.current = onSignals;

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setState({ kind: 'loading' });
    setTxs([]);
    setPinned([]);
    if (typeof provider.getBlock !== 'function') {
      setState({ kind: 'error', message: 'This data source cannot load a block.' });
      return;
    }
    provider.getBlock(height, { signal: controller.signal })
      .then(async block => {
        if (cancelled) return;
        setState({ kind: 'loaded', block });
        // A block is public aggregate data: its full description carries no raw
        // personal identifier, so no raw subject is declared for it.
        onSignalsRef.current?.(
          [buildBlockContext(block, Math.floor(Date.now() / 1000))],
          { description: buildFullBlockDescription(block), subjects: [] },
        );
        // First page of transactions, keyed off the resolved block hash.
        if (typeof provider.getBlockTxs === 'function') {
          try {
            const first = await provider.getBlockTxs(block.id, 0, { signal: controller.signal });
            if (!cancelled) setTxs(first);
          } catch { /* the summary still stands without the tx list */ }
        }
      })
      .catch((err) => {
        if (cancelled || (err instanceof ChainDataError && err.code === 'aborted')) return;
        setState({ kind: 'error', message: err instanceof ChainDataError ? err.message : 'Could not load this block.' });
      });
    return () => { cancelled = true; controller.abort(); };
  }, [height, provider, retryToken]);

  // A block carrying a marked transaction pins it at the top of its list. Its
  // own effect, because the marks fill in as the background chain walks
  // progress, possibly after the block loaded.
  useEffect(() => {
    if (state.kind !== 'loaded' || !marks) return;
    const height = state.block.height;
    const wanted = marks
      .flatMap(mark => { const txid = mark.byHeight.get(height); return txid ? [{ txid, mark }] : []; })
      .filter(w => !pinned.some(p => p.tx.txid === w.txid));
    if (wanted.length === 0) return;
    let cancelled = false;
    for (const { txid, mark } of wanted) {
      provider.getTransaction(txid)
        .then(tx => { if (!cancelled) setPinned(prev => prev.some(p => p.tx.txid === tx.txid) ? prev : [...prev, { tx, mark }]); })
        .catch(() => { /* the list still stands without the pin */ });
    }
    return () => { cancelled = true; };
  }, [state, marks, provider, pinned]);

  const loadMore = useCallback(async () => {
    if (state.kind !== 'loaded' || typeof provider.getBlockTxs !== 'function' || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await provider.getBlockTxs(state.block.id, txs.length);
      setTxs(prev => [...prev, ...next]);
    } catch { /* leave what is already shown */ } finally {
      setLoadingMore(false);
    }
  }, [state, provider, txs.length, loadingMore]);

  if (state.kind === 'loading') {
    // The block page's structure from the first paint: map area, details card
    // and transaction list as skeletons, swapped in place once loaded.
    return (
      <div className="flex flex-col gap-4" aria-label={`Reading block from ${provider.source.name}`}>
        <div className="flex flex-col md:flex-row gap-4 md:items-start">
          <Skeleton width={300} height={300} style={{ maxWidth: '100%' }} />
          <div className="flex-1 flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3, backgroundColor: 'transparent' }}>
            <Skeleton width="40%" height={18} />
            <SkeletonLines lines={4} />
          </div>
        </div>
        <SectionPanel title="TRANSACTIONS"><div className="px-3 py-3"><SkeletonLines lines={5} /></div></SectionPanel>
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
          style={{
            fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)',
          }}
        >
          RETRY
        </button>
      </div>
    );
  }

  const b = state.block;
  const color = feeColor(b.medianFee);
  const range = formatFeeRange(b.feeRange);

  return (
    <div className="flex flex-col gap-4">
      {/* Two columns: the block map on the left, the block details on the right.
          Stacks on narrow screens. */}
      <div className="flex flex-col md:flex-row gap-4 md:items-start">
        <div className="md:flex-none">
          <ExplorerBlockTreemap
            hash={b.id}
            selectedTxid={selectedTxid}
            onSelectTx={setSelectedTxid}
            provider={provider}
            onOpenTx={onOpenTx}
            highlights={highlights}
          />
        </div>

        <div
          className="flex-1 flex flex-col gap-3 px-4 py-3"
          style={{ borderTop: `3px solid ${color}`, borderRadius: 3, backgroundColor: 'transparent' }}
        >
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-pixel" style={{ fontSize: 16, color: 'var(--alice-text)' }}>Block {b.height.toLocaleString('en-US')}</span>
            <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
              {formatBlockAge(b.timestamp, now)} · {formatDateTime(b.timestamp)}
            </span>
            {marks?.filter(m => m.byHeight.has(b.height)).map((m, i) => (
              <span key={i} className="rh-fade-in">{m.headerBadge}</span>
            ))}
          </div>
          {b.poolName && (
            <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-muted)' }}>Mined by {b.poolName}</span>
          )}
          <div className="flex items-start gap-2"><p className="font-numbers m-0 break-all min-w-0 flex-1" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{b.id}</p><ExplorerCopy value={b.id} label="block hash" /></div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-1">
            <Metric label="TRANSACTIONS" value={b.txCount.toLocaleString('en-US')} />
            <Metric label="SIZE" value={formatBytes(b.size)} />
            <Metric label="WEIGHT" value={`${(b.weight / 1000).toFixed(0)} KWU`} />
            {b.medianFee !== undefined && <Metric label="MEDIAN FEE" value={`${Math.round(b.medianFee)} sat/vB`} />}
            {range && <Metric label="FEE RANGE" value={range} />}
            {/* Fees stay in sats whatever the display unit. */}
            {b.totalFees !== undefined && <Metric label="TOTAL FEES" value={`${b.totalFees.toLocaleString('en-US')} sats`} />}
          </div>
        </div>
      </div>

      {/* Transaction list, paginated 25 at a time. */}
      <div className="flex flex-col" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
        <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: 'transparent' }}>
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>TRANSACTIONS</span>
          <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
            {txs.length.toLocaleString('en-US')} of {b.txCount.toLocaleString('en-US')}
          </span>
        </div>
        {txs.length === 0 ? (
          <div className="px-3 py-3"><SkeletonLines lines={5} /></div>
        ) : (
          // A marked transaction (a settlement, a round) is pinned right below
          // the coinbase, framed in its accent, and removed from its natural
          // spot in the paged list so it never shows twice.
          (() => {
            const pinnedIds = new Set(pinned.map(p => p.tx.txid));
            const rows = pinned.length > 0 ? txs.filter(tx => !pinnedIds.has(tx.txid)) : txs;
            const pinAt = pinned.length > 0 ? (rows[0]?.isCoinbase ? 1 : 0) : -1;
            const nodes: React.ReactNode[] = rows.map(tx => (
              <TxRow key={tx.txid} tx={tx} selected={selectedTxid === tx.txid} onSelect={() => setSelectedTxid(tx.txid)} badge={rowBadge(marks?.find(m => m.txids.has(tx.txid)), tx.txid)} onOpen={() => onOpenTx(tx.txid)} />
            ));
            if (pinAt >= 0) {
              nodes.splice(pinAt, 0, ...pinned.map(p => (
                <div key={p.tx.txid} className="rh-fade-in" style={{ border: `1px solid ${p.mark.color}`, borderLeft: `3px solid ${p.mark.color}`, borderRadius: 3, margin: 4 }}>
                  <TxRow tx={p.tx} selected={selectedTxid === p.tx.txid} onSelect={() => setSelectedTxid(p.tx.txid)} badge={rowBadge(p.mark, p.tx.txid)} onOpen={() => onOpenTx(p.tx.txid)} />
                </div>
              )));
            }
            return nodes;
          })()
        )}
      </div>

      {txs.length > 0 && txs.length < b.txCount && (
        <button
          type="button"
          onClick={() => void loadMore()}
          disabled={loadingMore}
          className="alice-control alice-control--quiet font-numbers self-center cursor-pointer disabled:cursor-not-allowed"
          style={{
            fontSize: 13,
            padding: '8px 16px',
            borderRadius: 3,
            color: 'var(--alice-primary)',
            opacity: loadingMore ? 0.5 : 1,
          }}
        >
          {loadingMore ? 'LOADING' : `LOAD ${Math.min(PAGE, b.txCount - txs.length)} MORE`}
        </button>
      )}
    </div>
  );
}
