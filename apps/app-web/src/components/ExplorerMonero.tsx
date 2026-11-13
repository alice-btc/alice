'use client';

import { useT } from '@/i18n';

// The Monero network's pages, apart from the transaction (ExplorerMoneroTx):
// the home sections (the network's state, who mined the latest blocks), the
// block tab and the address tab. The blocks and the mempool live in the
// ribbon at the top, as on every network. Everything is read through
// lib/explorer/monero.ts (xmrchain.net, or the user's node when one is set);
// an address is decoded on the device and never sent.

import { useEffect, useRef, useState } from 'react';
import { getNetwork } from '@/lib/explorer/networks';
import {
  formatHashrate, formatXmr, getMoneroBlock, getMoneroBlocksPage, getMoneroEmission, getMoneroNetworkInfo,
  getMoneroTx, moneroRctLabel, MoneroError, MONERO_BLOCK_SECONDS,
  type MoneroBlock, type MoneroEmission, type MoneroNetworkInfo, type MoneroTxSummary,
} from '@/lib/explorer/monero';
import {
  getMoneroPoolBlocks, getMoneroPoolLists, poolListFailureLabel, summarizeMoneroMiners, type MoneroMinerShare,
  type MoneroPoolListStatus,
} from '@/lib/explorer/monero-pools';
import {
  formatPicoRate, MONERO_FULL_BLOCK_BYTES, MONERO_SCALE, moneroEstimateChecks, moneroEstimateFor, normalizeMoneroBlock,
  type MoneroEstimateCheck, type MoneroRibbonSource,
} from '@/lib/explorer/monero-ribbon';
import { decodeMoneroAddress, moneroAddressKindLabel } from '@/lib/explorer/monero-address';
import { moneroAddressContext, moneroBlockContext } from '@/lib/explorer/layer-context';
import type { PrivacySignal } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import type { NormalizedBlock, RibbonFocus } from '@/lib/explorer/types';
import { formatBlockAge, formatBytes, formatDateTime } from '@/lib/explorer/blocks';
import { Analyzing, Badge, ExplorerCopy, FieldLabel, Metric, SectionPanel, Skeleton, SkeletonLines } from '@/components/ExplorerUI';
import { ExplorerBlockTreemap } from '@/components/ExplorerBlockTreemap';

import { moneroErrorText } from '@/lib/explorer/monero-text';

export const MONERO_ACCENT = getNetwork('monero').color;
/** The ink on the accent: white reads on Monero's orange in both themes. */
export const MONERO_INK = '#ffffff';

/** The Monero marker, identical wherever Monero is pointed at. */
export function MoneroBadge({ children = 'MONERO' }: { children?: React.ReactNode }) {
  return (
    <span
      className="font-pixel tracking-widest inline-flex items-center shrink-0"
      style={{
        fontSize: 10, lineHeight: 1, padding: '3px 6px', borderRadius: 3,
        border: `1px solid ${MONERO_ACCENT}`, color: MONERO_INK,
        backgroundColor: MONERO_ACCENT, whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

export function shortHash(h: string): string {
  return h.length > 20 ? `${h.slice(0, 10)}…${h.slice(-6)}` : h;
}



/** A failure, in the Explorer's one shape for it. */
export function MoneroLoadError({ message }: { message: string }) {
  const tr = useT();
  return (
    <div className="flex flex-col gap-1 px-4 py-3" role="alert" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
      <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{tr('explorerMonero.loadError')}</span>
      <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{message}</p>
    </div>
  );
}

/** A link-styled button to another Monero subject. */
export function MoneroLink({ label, title, onClick }: { label: string; title?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="alice-control alice-control--quiet font-numbers text-left break-all cursor-pointer bg-transparent self-start p-0"
      style={{ fontSize: 13, color: 'var(--alice-primary)', border: 0, padding: 0, minHeight: 0 }}
      title={title}
    >
      {label}
    </button>
  );
}

/* ---------------------------------- Home ---------------------------------- */

const HOME_REFRESH_MS = 60_000;
/** How many recent blocks the pool share is counted on. */
const POOL_WINDOW = 100;

type Miners = { share: MoneroMinerShare; lists: MoneroPoolListStatus[]; source: 'worker' | 'direct' };

/** The network's state and who mined the latest blocks, refreshed every
 *  minute while the home is open (a block comes every 2 minutes). The blocks
 *  and the mempool themselves are in the ribbon above, as on every network. */
export function MoneroHome() {
  const [info, setInfo] = useState<MoneroNetworkInfo | null>(null);
  const [emission, setEmission] = useState<MoneroEmission | null>(null);
  const [miners, setMiners] = useState<Miners | null>(null);
  const [checks, setChecks] = useState<MoneroEstimateCheck[]>([]);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function load() {
      // The ribbon scores its estimates as blocks land; the home shows them.
      setChecks(moneroEstimateChecks());
      const settled = await Promise.allSettled([
        getMoneroNetworkInfo({ signal }).then(setInfo),
        getMoneroEmission({ signal }).then(setEmission),
        (async () => {
          const [a, b, lists] = await Promise.all([
            getMoneroBlocksPage(0, POOL_WINDOW / 2, { signal }),
            getMoneroBlocksPage(1, POOL_WINDOW / 2, { signal }),
            getMoneroPoolLists(),
          ]);
          const blocks = [...a.blocks, ...b.blocks].map(blk => ({
            hash: blk.hash,
            poolName: blk.poolName,
            coinbaseExtra: blk.txs.find(t => t.coinbase)?.extra,
          }));
          setMiners({ share: summarizeMoneroMiners(blocks, lists.byHash), lists: lists.lists, source: lists.source });
        })(),
      ]);
      if (signal.aborted) return;
      // The emission monitor is optional on the explorer's side: its absence
      // only hides the supply. The network state failing is worth saying.
      const failed = settled[0].status === 'rejected' ? settled[0] : null;
      setError(failed ? failed.reason : null);
      timer = setTimeout(load, HOME_REFRESH_MS);
    }
    void load();
    return () => { controller.abort(); if (timer) clearTimeout(timer); };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {error != null && <MoneroLoadError message={moneroErrorText(error, 'explorerMonero.networkLoadError')} />}
      <MoneroNetworkPanel info={info} emission={emission} checks={checks} />
      <MoneroPoolsPanel miners={miners} />
    </div>
  );
}

function MoneroNetworkPanel({ info, emission, checks }: {
  info: MoneroNetworkInfo | null;
  emission: MoneroEmission | null;
  checks: MoneroEstimateCheck[];
}) {
  const tr = useT();
  // An empty block is the miner's choice, not a miss of the estimate: it is
  // listed, not averaged.
  const recent = checks.slice(0, 10);
  const scored = recent.filter(c => !c.empty);
  const average = scored.length ? Math.round(scored.reduce((s, c) => s + c.rate, 0) / scored.length) : null;
  return (
    <div className="flex flex-col gap-2">
      <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{tr('explorerMonero.network')}</span>
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${MONERO_ACCENT}`, borderRadius: 3, backgroundColor: 'transparent' }}>
        {!info ? <SkeletonLines lines={3} /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
            <Metric label={tr('explorerMonero.height')} value={info.height.toLocaleString(tr.locale)} title={tr('explorerMonero.heightHint')} />
            <Metric label={tr('explorerMonero.hashrate')} value={formatHashrate(info.hashrate)} title={tr('explorerMonero.hashrateHint')} />
            <Metric label={tr('explorerMonero.minFee')} value={formatPicoRate(info.feePerByte)} title={tr('explorerMonero.minFeeHint')} />
            <Metric label={tr('explorerMonero.mempool')} value={`${info.mempoolCount.toLocaleString(tr.locale)} tx${info.mempoolBytes !== undefined ? ` · ${tr('explorerMonero.kiloBytes', { count: Math.round(info.mempoolBytes / 1000).toLocaleString(tr.locale) })}` : ''}`} title={tr('explorerMonero.mempoolHint')} />
            <Metric label={tr('explorerMonero.medianBlock')} value={tr('explorerMonero.kiloBytes', { count: Math.round(info.blockSizeMedian / 1000).toLocaleString(tr.locale) })} title={tr('explorerMonero.medianBlockHint')} />
            <Metric label={tr('explorerMonero.hardFork')} value={`v${info.hardForkVersion}`} title={tr('explorerMonero.hardForkHint')} />
            {emission && <Metric label={tr('explorerMonero.supply')} value={formatXmr(emission.supply, 0)} title={tr('explorerMonero.supplyHint', { height: emission.height.toLocaleString(tr.locale) })} />}
            <Metric label={tr('explorerMonero.altBlocks')} value={info.altBlocks.toLocaleString(tr.locale)} title={tr('explorerMonero.altBlocksHint')} />
            <Metric
              label={tr('explorerMonero.estimateMatch')}
              value={average === null
                ? (recent.length ? tr('explorerMonero.emptyBlocks', { count: recent.length }) : tr('explorerMonero.nextBlock'))
                : tr('explorerMonero.scoredBlocks', { rate: average, count: scored.length })}
              title={recent.length === 0
                ? tr('explorerMonero.estimateWaiting')
                : tr('explorerMonero.estimateHistory', { blocks: recent.map(c => `${c.height.toLocaleString(tr.locale)} ${c.empty ? tr('explorerMonero.emptyBlock') : `${c.rate}%`}`).join(', ') })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Who mined the latest blocks, as far as anyone can tell: the pools that
 *  publish their blocks, P2Pool by its coinbase, then the unnamed blocks
 *  grouped by the layout of their coinbase, and which pool lists answered. */
function MoneroPoolsPanel({ miners }: { miners: Miners | null }) {
  const tr = useT();
  const row = (key: string, name: string, blocks: number, total: number, opts: { muted?: boolean; title?: string } = {}) => (
    <div key={key} className="flex items-center gap-3 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)' }} title={opts.title}>
      <span className="font-numbers shrink-0" style={{ fontSize: 13, width: 120, color: opts.muted ? 'var(--alice-muted)' : 'var(--alice-text)' }}>{name}</span>
      <span aria-hidden className="flex-1" style={{ height: 6, borderRadius: 3, backgroundColor: 'var(--alice-border)', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', inset: 0, width: `${(blocks / total) * 100}%`, backgroundColor: opts.muted ? 'var(--alice-muted)' : MONERO_ACCENT }} />
      </span>
      <span className="font-numbers shrink-0" style={{ fontSize: 12, width: 92, textAlign: 'right', color: 'var(--alice-muted)' }}>
        {blocks} · {Math.round((blocks / total) * 100)}%
      </span>
    </div>
  );
  const failed = miners?.lists.filter(l => !l.ok) ?? [];
  const share = miners?.share;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
          {tr('explorerMonero.poolsTitle', { count: share?.total ?? POOL_WINDOW })}
        </span>
        {miners && (
          <span
            className="font-numbers"
            style={{ fontSize: 11, color: failed.length ? 'var(--alice-warning)' : 'var(--alice-muted)' }}
            title={miners.lists.map(l => `${l.name}: ${poolListFailureLabel(l)}`).join('\n')}
          >
            {tr('explorerMonero.poolListsRead', { read: miners.lists.length - failed.length, total: miners.lists.length })}
            {failed.length ? tr('explorerMonero.poolsMissing', { names: failed.map(l => l.name).join(', ') }) : ''}
            {miners.source === 'worker' ? tr('explorerMonero.viaServer') : ''}
          </span>
        )}
      </div>
      <div className="flex flex-col" style={{ borderRadius: 3 }}>
        {!share ? <Analyzing label={tr('explorerMonero.poolReading')} /> : (
          <>
            {share.named.map(p => row(p.name, p.name, p.blocks, share.total))}
            {share.unidentified.map((u, i) => row(u.template, tr('explorerMonero.unidentified', { letter: String.fromCharCode(65 + i) }), u.blocks, share.total, {
              muted: true,
              title: tr('explorerMonero.unidentifiedHint', { layout: u.template, similar: u.sameLayoutAs.length ? tr('explorerMonero.similarLayout', { names: u.sameLayoutAs.join(', ') }) : '' }),
            }))}
            {share.other > 0 && row('other', tr('explorerMonero.other'), share.other, share.total, {
              muted: true,
              title: tr('explorerMonero.otherHint'),
            })}
          </>
        )}
      </div>
      {failed.length > 0 && (
        <div className="flex flex-col gap-1 px-3 py-2" role="status" style={{ border: '1px solid var(--alice-warning)', borderRadius: 3 }}>
          {failed.map(l => (
            <span key={l.name} className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-text)' }}>
              {l.name}: {poolListFailureLabel(l)}.
            </span>
          ))}
          <span className="font-numbers" style={{ fontSize: 12, lineHeight: '18px', color: 'var(--alice-muted)' }}>
            {failed.some(l => l.failure === 'blocked') && miners?.source === 'direct'
              ? tr('explorerMonero.poolBlocked')
              : tr('explorerMonero.poolUnavailable')}
          </span>
        </div>
      )}
      <p className="font-numbers m-0" style={{ fontSize: 12, lineHeight: '18px', color: 'var(--alice-muted)' }}>
        {tr('explorerMonero.poolAttribution')}
      </p>
    </div>
  );
}

/** A transaction in a list: its id, its shape, its fee. */
function MoneroTxRow({ t, first, onOpenTx }: { t: MoneroTxSummary; first: boolean; onOpenTx: (txid: string) => void }) {
  const tr = useT();
  return (
    <button
      type="button"
      onClick={() => onOpenTx(t.txid)}
      className="alice-control alice-control--quiet flex items-center justify-between gap-3 w-full text-left cursor-pointer bg-transparent px-3 py-2"
      style={{ borderTop: first ? undefined : '1px solid var(--alice-border)', justifyContent: 'space-between' }}
      title={tr('explorerMonero.openTx', { id: t.txid })}
    >
      <div className="flex flex-col min-w-0">
        <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-primary)' }}>{shortHash(t.txid)}</span>
        <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
          {t.coinbase ? tr('explorerMonero.coinbaseClear') : tr('explorerMonero.ringFormat', { size: t.ringSize, format: moneroRctLabel(t.rctType) })} · {tr('explorerMonero.bytes', { count: t.size.toLocaleString(tr.locale) })}
          {!t.coinbase && t.size > 0 ? ` · ${formatPicoRate(Number(t.fee) / t.size)}` : ''}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {t.coinbase && <MoneroBadge>{tr('explorerMonero.coinbase')}</MoneroBadge>}
        <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-text)' }}>
          {t.coinbase ? formatXmr(t.clearOutputs, 4) : tr('explorerMonero.feeAmount', { amount: formatXmr(t.fee, 6) })}
        </span>
      </div>
    </button>
  );
}

/* ---------------------------------- Block --------------------------------- */

type BlockState =
  | { kind: 'loading' }
  | { kind: 'ready'; block: MoneroBlock; normalized: NormalizedBlock; coinbaseOutputs: number | null }
  | { kind: 'error'; error: unknown };

/** A Monero block, laid out like a Bitcoin one: the block map on the left
 *  (every transaction sized by its bytes, coloured by its fee per byte), the
 *  details on the right, the transactions below. */
export function ExplorerMoneroBlockTab({ heightOrHash, source, onOpenTx, onFocus, onSignals }: {
  heightOrHash: string;
  /** The ribbon's source, shared so the block map reuses what it read. */
  source: MoneroRibbonSource;
  onOpenTx: (txid: string) => void;
  /** Tells the ribbon which block to spotlight, once its height is known. */
  onFocus?: (focus: RibbonFocus | null) => void;
  onSignals?: (signals: PrivacySignal[], full?: FullContext) => void;
}) {
  const tr = useT();
  const [state, setState] = useState<BlockState>({ kind: 'loading' });
  const [selectedTxid, setSelectedTxid] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const onSignalsRef = useRef(onSignals);
  onSignalsRef.current = onSignals;
  const onFocusRef = useRef(onFocus);
  onFocusRef.current = onFocus;

  useEffect(() => {
    const controller = new AbortController();
    setState({ kind: 'loading' });
    (async () => {
      try {
        const [block, pools] = await Promise.all([
          getMoneroBlock(heightOrHash, { signal: controller.signal }),
          getMoneroPoolBlocks(),
        ]);
        source.prime(block);
        const normalized = normalizeMoneroBlock(block, pools);
        if (controller.signal.aborted) return;
        setState({ kind: 'ready', block, normalized, coinbaseOutputs: null });
        onFocusRef.current?.({ kind: 'height', height: block.height });
        const ctx = moneroBlockContext(block);
        onSignalsRef.current?.([ctx.signal], ctx.full);
        // How many outputs the coinbase pays: one for a solo miner or a
        // classic pool, dozens for P2Pool. A bonus: a failure leaves it out.
        if (block.coinbaseTxid) {
          const coinbase = await getMoneroTx(block.coinbaseTxid, { signal: controller.signal }).catch(() => null);
          if (coinbase && !controller.signal.aborted) {
            setState(s => (s.kind === 'ready' ? { ...s, coinbaseOutputs: coinbase.outputs.length } : s));
          }
        }
      } catch (e) {
        if (controller.signal.aborted) return;
        setState({ kind: 'error', error: e });
      }
    })();
    return () => controller.abort();
  }, [heightOrHash, source, retry]);

  if (state.kind === 'loading') {
    return (
      <div className="flex flex-col gap-4" aria-label={tr('explorerMonero.blockReading')}>
        <div className="flex flex-col md:flex-row gap-4 md:items-start">
          <Skeleton width={300} height={300} style={{ maxWidth: '100%' }} />
          <div className="flex-1 flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
            <Skeleton width="40%" height={18} />
            <SkeletonLines lines={4} />
          </div>
        </div>
        <SectionPanel title={tr('explorerMonero.transactions')}><div className="px-3 py-3"><SkeletonLines lines={5} /></div></SectionPanel>
      </div>
    );
  }
  if (state.kind === 'error') {
    return (
      <div className="flex flex-col gap-2 px-4 py-3" role="alert" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{tr('explorerMonero.loadError')}</span>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{state.error instanceof MoneroError && state.error.code === 'not-found' ? tr('explorerMonero.blockNotFound') : moneroErrorText(state.error, 'explorerMonero.blockLoadError')}</p>
        <button
          type="button"
          onClick={() => setRetry(r => r + 1)}
          className="alice-control alice-control--quiet font-numbers self-start cursor-pointer"
          style={{ fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)' }}
        >
          {tr('explorerMonero.retry')}
        </button>
      </div>
    );
  }

  const b = state.block;
  const n = state.normalized;
  const color = MONERO_SCALE.color(n.medianFee);
  const range = MONERO_SCALE.range(n.feeRange);
  const now = Math.floor(Date.now() / 1000);
  const txs = [...b.txs].sort((x, y) => Number(y.coinbase) - Number(x.coinbase));
  const estimate = moneroEstimateFor(b.height);
  return (
    <div className="flex flex-col gap-4 rh-fade-in">
      <div className="flex flex-col md:flex-row gap-4 md:items-start">
        <div className="md:flex-none">
          <ExplorerBlockTreemap
            hash={b.hash}
            provider={source}
            scale={MONERO_SCALE}
            onOpenTx={onOpenTx}
            selectedTxid={selectedTxid}
            onSelectTx={setSelectedTxid}
          />
        </div>

        <div className="flex-1 flex flex-col gap-3 px-4 py-3" style={{ borderTop: `3px solid ${color}`, borderRadius: 3 }}>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-pixel" style={{ fontSize: 16, color: 'var(--alice-text)' }}>{tr('explorerMonero.blockNumber', { height: b.height.toLocaleString(tr.locale) })}</span>
            <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
              {b.timestamp ? `${formatBlockAge(b.timestamp, now)} · ${formatDateTime(b.timestamp)}` : tr('explorerMonero.genesisUndated')}
            </span>
          </div>
          <span
            className="font-numbers"
            style={{ fontSize: 13, color: 'var(--alice-muted)' }}
            title={tr('explorerMonero.minerHint')}
          >
            {n.poolName ? tr('explorerMonero.minedBy', { name: n.poolName }) : tr('explorerMonero.minerUnknown')}
          </span>
          <div className="flex items-start gap-2">
            <p className="font-numbers m-0 break-all min-w-0 flex-1" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{b.hash}</p>
            <ExplorerCopy value={b.hash} label={tr('explorerMonero.blockHash')} />
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-1">
            <Metric label={tr('explorerMonero.transactions')} value={b.txCount.toLocaleString(tr.locale)} title={tr('explorerMonero.includesCoinbase')} />
            <Metric label={tr('explorerMonero.size')} value={formatBytes(b.size)} title={tr('explorerMonero.blockSizeHint', { percent: Math.round((b.size / MONERO_FULL_BLOCK_BYTES) * 100) })} />
            {n.medianFee !== undefined && <Metric label={tr('explorerMonero.medianFee')} value={MONERO_SCALE.rate(n.medianFee)} title={tr('explorerMonero.picoHint')} />}
            {range && <Metric label={tr('explorerMonero.feeRange')} value={range} />}
            <Metric label={tr('explorerMonero.reward')} value={formatXmr(b.reward, 6)} title={tr('explorerMonero.rewardHint')} />
            <Metric label={tr('explorerMonero.totalFees')} value={formatXmr(b.fees, 6)} />
            {estimate && (
              <Metric
                label={tr('explorerMonero.estimateMatch')}
                value={estimate.empty ? tr('explorerMonero.emptyBlock') : tr('explorerMonero.estimateScore', { rate: estimate.rate, matched: estimate.matched, total: Math.max(estimate.expected, estimate.mined) })}
                title={estimate.empty
                  ? tr('explorerMonero.emptyEstimateHint', { expected: estimate.expected })
                  : tr('explorerMonero.estimateHint', { expected: estimate.expected, mined: estimate.mined, matched: estimate.matched })}
              />
            )}
            {state.coinbaseOutputs !== null && (
              <Metric
                label={tr('explorerMonero.coinbaseOutputs')}
                value={state.coinbaseOutputs.toLocaleString(tr.locale)}
                title={tr('explorerMonero.coinbaseOutputsHint')}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{tr('explorerMonero.transactions')}</span>
          <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>{b.txCount.toLocaleString(tr.locale)}</span>
        </div>
        {txs.map((t, i) => <MoneroTxRow key={t.txid} t={t} first={i === 0} onOpenTx={onOpenTx} />)}
      </div>
      <p className="font-numbers m-0" style={{ fontSize: 12, lineHeight: '18px', color: 'var(--alice-muted)' }}>
        {tr('explorerMonero.blockPrivacy', { minutes: MONERO_BLOCK_SECONDS / 60 })}
      </p>
    </div>
  );
}

/* --------------------------------- Address -------------------------------- */

export function ExplorerMoneroAddressTab({ address, onSignals }: {
  address: string;
  onSignals?: (signals: PrivacySignal[], full?: FullContext) => void;
}) {
  const tr = useT();
  const decoded = decodeMoneroAddress(address);
  const onSignalsRef = useRef(onSignals);
  onSignalsRef.current = onSignals;
  useEffect(() => {
    if (!decoded) return;
    const ctx = moneroAddressContext(decoded);
    onSignalsRef.current?.([ctx.signal], ctx.full);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the address string is the identity
  }, [address]);

  if (!decoded) {
    return (
      <div className="flex flex-col gap-2 px-4 py-3" role="alert" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{tr('explorerMonero.invalidAddress')}</span>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>
          {tr('explorerMonero.invalidAddressHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rh-fade-in">
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${MONERO_ACCENT}`, borderRadius: 3 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <MoneroBadge>{tr('explorerMonero.addressBadge')}</MoneroBadge>
          <Badge tone="neutral">{moneroAddressKindLabel(decoded.kind).toUpperCase()}</Badge>
          {decoded.network !== 'mainnet' && <Badge tone="medium">{decoded.network.toUpperCase()}</Badge>}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-numbers break-all" style={{ fontSize: 12, color: 'var(--alice-text)' }}>{decoded.address}</span>
          <ExplorerCopy value={decoded.address} label={tr('explorerMonero.address')} />
        </div>
        <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
          {tr('explorerMonero.addressPrivacy')}
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <FieldLabel>{tr('explorerMonero.publicSpendKey')}</FieldLabel>
            <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{decoded.spendPublicKey}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <FieldLabel>{tr('explorerMonero.publicViewKey')}</FieldLabel>
            <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{decoded.viewPublicKey}</span>
          </div>
          {decoded.paymentId && (
            <div className="flex flex-col gap-0.5">
              <FieldLabel>{tr('explorerMonero.paymentId')}</FieldLabel>
              <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{decoded.paymentId}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{tr('explorerMonero.addressKind')}</span>
        <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
          {decoded.kind === 'standard'
            ? tr('explorerMonero.standardAddressHint')
            : decoded.kind === 'subaddress'
              ? tr('explorerMonero.subaddressHint')
              : tr('explorerMonero.integratedAddressHint')}
        </p>
        <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
          {tr('explorerMonero.addressCheckHint')}
        </p>
      </div>
    </div>
  );
}
