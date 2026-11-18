'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChainDataProvider } from '@/lib/explorer/provider';
import type { BlockTxSummary, ProjectedBlock } from '@/lib/explorer/types';
import type { PrivacySignal } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import { BITCOIN_SCALE, formatCount, formatFeeRate } from '@/lib/explorer/blocks';
import { projectedBlockDescription, summarizeProjectedBlock, watchMempoolQueue, watchProjectedBlock, type ProjectedBlockStatus } from '@/lib/explorer/mempool-live';
import { useLiveRefresh } from '@/lib/explorer/use-live-refresh';
import { useT } from '@/i18n';
import { ExplorerBlockTreemap } from '@/components/ExplorerBlockTreemap';
import { Skeleton, SkeletonLines } from '@/components/ExplorerUI';
import { formatAmount, useAmountState, WithBitcoinGlyph } from '@/components/AmountDisplay';

const REFRESH_MS = 15_000;
const PAGE = 25;
// The map is fed by this page: it has nothing to fetch.
const NO_FETCH = {};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{label}</span>
      <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{value}</span>
    </div>
  );
}

// The page of a projected block, opened from the ribbon like a mined one: its
// transactions, which a mempool instance sends over its live feed and keeps
// up to date, and its totals, counted from them. The ribbon reads the same
// feed, so a card and its page show the same block.
export function ExplorerPendingBlockTab({
  index,
  provider,
  onOpenTx,
  onSignals,
}: {
  /** Place in the queue: 0 is the next block. */
  index: number;
  provider: ChainDataProvider;
  onOpenTx: (txid: string) => void;
  onSignals?: (signals: PrivacySignal[], full?: FullContext) => void;
}) {
  const t = useT();
  const unit = useAmountState();
  const scale = BITCOIN_SCALE;
  const [state, setState] = useState<{ kind: 'loading' } | { kind: 'error' } | { kind: 'loaded'; block: ProjectedBlock | null }>({ kind: 'loading' });
  const [transactions, setTransactions] = useState<BlockTxSummary[] | null>(null);
  const [feed, setFeed] = useState<ProjectedBlockStatus>('connecting');
  const [queued, setQueued] = useState<ProjectedBlock | null>(null);
  const [selectedTxid, setSelectedTxid] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [retryToken, setRetryToken] = useState(0);

  const onSignalsRef = useRef(onSignals);
  onSignalsRef.current = onSignals;

  const load = useCallback(async (signal: AbortSignal) => {
    if (typeof provider.getMempoolBlocks !== 'function') throw new Error('unsupported');
    const blocks = await provider.getMempoolBlocks({ signal });
    if (!signal.aborted) setState({ kind: 'loaded', block: blocks[index] ?? null });
  }, [provider, index]);

  useEffect(() => {
    const controller = new AbortController();
    setState({ kind: 'loading' });
    load(controller.signal).catch(() => { if (!controller.signal.aborted) setState({ kind: 'error' }); });
    return () => controller.abort();
  }, [load, retryToken]);
  // The live feed carries the block's figures with its list: the poll only
  // stands in while the feed is down.
  useLiveRefresh(load, REFRESH_MS, state.kind === 'loaded' && feed !== 'live');

  const baseUrl = provider.source.baseUrl;
  useEffect(() => {
    setTransactions(null);
    setShown(PAGE);
    setSelectedTxid(null);
    setQueued(null);
    const stopBlock = watchProjectedBlock(baseUrl, index, { onTransactions: setTransactions, onStatus: setFeed });
    const stopQueue = watchMempoolQueue(baseUrl, { onBlocks: queue => setQueued(queue[index] ?? null) });
    return () => { stopBlock(); stopQueue(); };
  }, [baseUrl, index]);

  // The figures beside the map are the block's own, as the feed gives them in
  // the message that carries its list: the very ones on the ribbon's card.
  // Counted from the list when the feed sends a list without them.
  const listed = useMemo(() => (transactions ? queued ?? summarizeProjectedBlock(transactions) : null), [transactions, queued]);
  const block = listed ?? (state.kind === 'loaded' ? state.block : null);
  // The totals move a little on every poll; Alice's context follows them
  // without republishing on each render.
  const description = block ? projectedBlockDescription(block, index) : null;
  useEffect(() => {
    if (description) onSignalsRef.current?.([], { description, subjects: [] });
  }, [description]);

  if (!listed && state.kind === 'loading') {
    return (
      <div className="flex flex-col md:flex-row gap-4 md:items-start" aria-label={t('explorerPending.reading', { source: provider.source.name })}>
        <div className="rh-skeleton alice-block-map-loading" aria-hidden />
        <div className="flex-1 flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
          <Skeleton width="40%" height={18} />
          <SkeletonLines lines={4} />
        </div>
      </div>
    );
  }
  if (!listed && state.kind === 'error') {
    return (
      <div className="flex flex-col gap-2 px-4 py-3" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{t('explorerBlocks.tab.couldNotLoad')}</span>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{t('explorerPending.loadFailed')}</p>
        <button
          type="button"
          onClick={() => setRetryToken(n => n + 1)}
          className="alice-control alice-control--quiet font-numbers self-start cursor-pointer"
          style={{ fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)' }}
        >
          {t('explorerBlocks.tab.retry')}
        </button>
      </div>
    );
  }
  if (!block) {
    return <p className="font-numbers m-0 px-4 py-3" style={{ fontSize: 14, color: 'var(--alice-muted)' }}>{t('explorerPending.gone')}</p>;
  }

  const color = scale.color(block.medianFee);
  const range = scale.range(block.feeRange);
  const rate = (value: number) => formatFeeRate(value, t.locale);
  let host = provider.source.name;
  try { host = new URL(baseUrl).host; } catch { /* the name stands in */ }
  const title = index === 0 ? t('explorerPending.titleNext') : t('explorerPending.title', { position: index + 1 });
  const eta = index === 0 ? null : t('explorerPending.eta', { minutes: (index + 1) * scale.blockMinutes });
  const rows = transactions?.slice(0, shown) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-start">
        <div className="md:flex-none flex flex-col gap-2">
          {feed === 'unavailable' && !transactions ? (
            <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-muted)', maxWidth: 300 }}>
              {t('explorerPending.listUnavailable', { source: host })}
            </p>
          ) : (
            <>
              <ExplorerBlockTreemap
                hash={`projected-${index}`}
                provider={NO_FETCH}
                transactions={transactions}
                selectedTxid={selectedTxid}
                onSelectTx={setSelectedTxid}
                onOpenTx={onOpenTx}
              />
              <span className="alice-block-map-caption font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>
                {feed === 'live'
                  ? t('explorerPending.live', { source: host })
                  : feed === 'unavailable' ? t('explorerPending.stale') : t('explorerBlocks.ribbon.reconnecting')}
              </span>
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-3 px-4 py-3" style={{ borderTop: `3px solid ${color}`, borderRadius: 3 }}>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-pixel" style={{ fontSize: 16, color: 'var(--alice-text)' }}>{title}</span>
            {eta && <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>{eta}</span>}
          </div>
          <p className="font-numbers m-0" style={{ fontSize: 13, lineHeight: '19px', color: 'var(--alice-muted)' }}>{t('explorerPending.note')}</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-1">
            <Metric label={t('explorerBlocks.tab.transactions')} value={formatCount(block.txCount, t.locale)} />
            <Metric label={t('explorerPending.virtualSize')} value={`${formatCount(Math.round(block.blockVSize), t.locale)} ${scale.sizeUnit}`} />
            <Metric label={t('explorerBlocks.tab.medianFee')} value={rate(block.medianFee)} />
            {range && <Metric label={t('explorerBlocks.tab.feeRange')} value={range} />}
            {/* Fees stay in sats whatever the display unit. */}
            <Metric label={t('explorerBlocks.tab.totalFees')} value={`${formatCount(block.totalFees, t.locale)} sats`} />
          </div>
        </div>
      </div>

      {transactions && transactions.length > 0 && (
        <div className="flex flex-col" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{t('explorerPending.byFeeRate')}</span>
            <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
              {t('explorerBlocks.tab.shown', { shown: formatCount(rows.length, t.locale), total: formatCount(transactions.length, t.locale) })}
            </span>
          </div>
          {rows.map(tx => (
            <button
              key={tx.txid}
              type="button"
              onClick={() => onOpenTx(tx.txid)}
              onMouseEnter={() => setSelectedTxid(tx.txid)}
              onFocus={() => setSelectedTxid(tx.txid)}
              className="alice-control alice-control--quiet font-numbers w-full text-left cursor-pointer"
              style={{
                display: 'flex', alignItems: 'baseline', gap: 12, padding: '8px 12px', borderRadius: 0, fontSize: 13,
                borderTop: '1px solid var(--alice-border)',
                backgroundColor: selectedTxid === tx.txid ? 'var(--alice-hover)' : undefined,
              }}
            >
              <span style={{ color: 'var(--alice-primary)', minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tx.txid.slice(0, 10)}...{tx.txid.slice(-6)}
              </span>
              <span style={{ color: scale.color(tx.rate) }}>{rate(tx.rate)}</span>
              <span className="hidden md:inline" style={{ color: 'var(--alice-muted)' }}>{formatCount(Math.round(tx.vsize), t.locale)} {scale.sizeUnit}</span>
              <span style={{ color: 'var(--alice-text)' }}><WithBitcoinGlyph text={formatAmount(tx.valueSats, unit)} /></span>
            </button>
          ))}
        </div>
      )}

      {transactions && shown < transactions.length && (
        <button
          type="button"
          onClick={() => setShown(n => n + PAGE)}
          className="alice-control alice-control--quiet font-numbers self-center cursor-pointer"
          style={{ fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)' }}
        >
          {t('explorerBlocks.tab.loadMore', { count: Math.min(PAGE, transactions.length - shown) })}
        </button>
      )}
    </div>
  );
}
