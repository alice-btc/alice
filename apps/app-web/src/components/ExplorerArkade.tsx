'use client';

// The Arkade-specific pieces of the Explorer. Arkade settles on Bitcoin
// mainnet, so the network reuses the whole Bitcoin explorer (ribbon, block,
// transaction and address views on the operator's Esplora mirror); what is
// Arkade's own is rendered by the sections here: the live feed of commitment
// transactions, the operator's parameters, the overlay a commitment
// transaction gets, and the address view. The copy uses Arkade's own words
// (docs.arkadeos.com): operator, commitment transaction, batch, VTXO tree,
// Ark transaction, preconfirmed, settled, unilateral exit. "Settlement" in
// identifiers is Alice's older name for a commitment transaction.
// the VTXO view an ark1… address opens. Everything comes from the public,
// CORS-open ASP gateway, straight from the browser.

import { useEffect, useRef, useState } from 'react';
import {
  ArkadeError, formatArkadeExitDelay, getArkadeAddressVtxos, getArkadeInfo, subscribeSettlements,
  type ArkadeAddressInfo, type ArkadeCommitment, type ArkadeInfo, type ArkadeVirtualTx, type ArkadeVtxo,
} from '@/lib/explorer/arkade';
import { HISTORY_PAGE, noteSeenSettlement, settlementRegistry, type KnownSettlement } from '@/lib/explorer/arkade-onchain';
import type { SettlementSync } from '@/lib/explorer/use-settlement-sync';
import { buildArkadeBalanceSeries, buildArkadeTxHistory, virtualTxOutspends, virtualTxToNormalized } from '@/lib/explorer/arkade-insights';
import { averageUtxoAge } from '@/lib/explorer/address-insights';
import { readExpiry, type ArkadeExpiry } from '@/lib/explorer/arkade-expiry';
import { arkadeAddressContext } from '@/lib/explorer/layer-context';
import type { PrivacySignal } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import { getNetwork } from '@/lib/explorer/networks';
import { formatDateTime } from '@/lib/explorer/blocks';
import { Amount } from '@/components/AmountDisplay';
import { Analyzing, Badge, EmptyState, ExplorerCopy, FieldLabel, Metric, SectionPanel, Skeleton, SkeletonLines } from '@/components/ExplorerUI';
import { ExplorerTxGraph } from '@/components/ExplorerTxGraph';
import { ExplorerBalanceChart } from '@/components/ExplorerBalanceChart';
import { ExplorerUtxoBubbles } from '@/components/ExplorerUtxoBubbles';
import { formatLocale, type Translator, useT } from '@/i18n';

// How many settlements the overview lists at first: the registry's identified
// history, newest first, extended in real time by the ASP stream; a SHOW MORE
// button pages further into what has been identified.
const FEED_INITIAL = 5;
const FEED_STEP = 10;

/** The Arkade accent, shared by every settlement highlight in the explorer. */
export const ARKADE_ACCENT = getNetwork('arkade').color;
/** A lightened accent for SMALL TEXT on dark backgrounds, where the deep
 *  violet itself would be illegible. Fills keep the accent, text gets this. */
export const ARKADE_ACCENT_SOFT = '#9b86ff';

function agoLabel(ms: number, t: Translator): string {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 5) return t('explorerArk.ago.now');
  if (s < 60) return t('explorerArk.ago.seconds', { count: s });
  if (s < 3600) return t('explorerArk.ago.minutes', { count: Math.floor(s / 60) });
  return t('explorerArk.ago.hours', { count: Math.floor(s / 3600) });
}

function shortHex(s: string, head = 10, tail = 8): string {
  return s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;
}
function fmtDuration(sec: number, t: Translator): string {
  if (!sec) return '-';
  if (sec < 60) return t('explorerArk.duration.seconds', { count: sec });
  if (sec < 3600) return t('explorerArk.duration.minutes', { count: Math.round(sec / 60) });
  return t('explorerArk.duration.hours', { count: Math.round(sec / 3600) });
}
function fmtTime(sec?: number): string {
  if (!sec) return '-';
  return new Date(sec * 1000).toISOString().replace('T', ' ').slice(0, 19);
}
/** " · expires <date>" or " · expires at block 950,000"; an explicit unknown when absent. */
function expiryNote(e: ArkadeExpiry, t: Translator): string {
  const r = readExpiry(e);
  if (r.kind === 'date') return ` · ${t('explorerArk.vtxo.expires', { time: fmtTime(r.sec) })}`;
  if (r.kind === 'block') return ` · ${t('explorerArk.vtxo.expiresBlock', { height: r.height.toLocaleString(formatLocale()) })}`;
  return ` · ${t('explorerArk.expiry.unknown')}`;
}

/** The commitment-transaction marker, identical wherever one is pointed at.
 *  White text always: the fill is the deep Arkade violet in both themes, and
 *  any theme token here could land dark-on-dark. */
export function SettlementBadge({ children }: { children?: React.ReactNode }) {
  const t = useT();
  return (
    <span
      className="font-pixel tracking-widest inline-flex items-center shrink-0"
      style={{
        fontSize: 10, lineHeight: 1, padding: '3px 6px', borderRadius: 3,
        border: `1px solid ${ARKADE_ACCENT}`, color: '#ffffff',
        backgroundColor: ARKADE_ACCENT, whiteSpace: 'nowrap',
      }}
    >
      {children ?? t('explorerArk.badge.commitment')}
    </span>
  );
}

function VtxoRow({ v, onOpenTx, onOpenVtxo }: { v: ArkadeVtxo; onOpenTx?: (txid: string) => void; onOpenVtxo?: (id: string) => void }) {
  const t = useT();
  const spent = v.isSpent || v.isSwept;
  const anchor = v.commitmentTxids[0];
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)' }}>
      <div className="flex flex-col min-w-0">
        <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-text)' }} title={`${v.txid}:${v.vout}`}>{shortHex(v.txid, 12, 6)}:{v.vout}</span>
        <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
          {v.isPreconfirmed ? t('explorerArk.vtxo.preconfirmed') : t('explorerArk.vtxo.confirmed')}
          {expiryNote(v, t)}
        </span>
        {anchor && (
          onOpenTx ? (
            <button
              type="button"
              // Register the anchor as a settlement first, so the tab opens
              // as a Bitcoin (on-chain) tab, not an Arkade one.
              onClick={() => { noteSeenSettlement(anchor); onOpenTx(anchor); }}
              className="alice-control alice-control--quiet font-numbers text-left cursor-pointer bg-transparent p-0"
              style={{ fontSize: 13, color: 'var(--alice-primary)' }}
              title={t('explorerArk.vtxo.openCommitmentTitle')}
            >
              {t('explorerArk.vtxo.anchoredIn', { txid: shortHex(anchor, 8, 6) })}
            </button>
          ) : (
            <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{t('explorerArk.vtxo.anchoredIn', { txid: shortHex(anchor, 8, 6) })}</span>
          )
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onOpenVtxo && (
          <button
            type="button"
            onClick={() => onOpenVtxo(`${v.txid}:${v.vout}`)}
            className="alice-control alice-control--quiet font-numbers cursor-pointer bg-transparent"
            style={{ fontSize: 11, padding: '3px 8px', borderRadius: 3, color: 'var(--alice-primary)' }}
            title={t('explorerArk.vtxo.openExitTitle')}
          >
            {t('explorerArk.vtxo.exitTree')}
          </button>
        )}
        {v.isSpent ? <Badge tone="neutral">{t('explorerArk.vtxo.spent')}</Badge> : v.isSwept ? <Badge tone="neutral">{t('explorerArk.vtxo.swept')}</Badge> : null}
        <Amount sats={v.amountSats} style={{ fontSize: 12, color: spent ? 'var(--alice-muted)' : 'var(--alice-text)' }} />
      </div>
    </div>
  );
}

function AddressCard({ info, onOpenTx, onOpenVtxo }: { info: ArkadeAddressInfo; onOpenTx?: (txid: string) => void; onOpenVtxo?: (id: string) => void }) {
  const t = useT();
  // The lists open short and page out on demand, like the on-chain view.
  const [txLimit, setTxLimit] = useState(FEED_INITIAL);
  const [vtxoLimit, setVtxoLimit] = useState(FEED_INITIAL);
  const nowSec = Math.floor(Date.now() / 1000);
  const spendable = info.vtxos.filter(v => !v.isSpent && !v.isSwept);
  // The same insights the on-chain address view computes: the balance over
  // time (from the VTXOs' lifecycles) and the age of the coins held.
  const history = buildArkadeBalanceSeries(info.vtxos, info.spendableSats);
  const txHistory = buildArkadeTxHistory(info.vtxos);
  const age = averageUtxoAge(spendable.map(v => ({ valueSats: v.amountSats, blockTime: v.createdAt })), nowSec);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${ARKADE_ACCENT}`, borderRadius: 3, backgroundColor: 'transparent' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <SettlementBadge>{t('explorerArk.address.badge')}</SettlementBadge>
          <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{t('explorerArk.address.source')}</span>
        </div>
        <div className="flex items-start gap-2">
          <p className="font-numbers m-0 break-all min-w-0 flex-1" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{info.address}</p>
          <ExplorerCopy value={info.address} label={t('explorerArk.address.copy')} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label={t('explorerArk.address.spendable')} value={<Amount sats={info.spendableSats} style={{ fontSize: 14, color: 'var(--alice-text)' }} />} />
          <Metric label={t('explorerArk.address.spendableVtxos')} value={info.spendableCount.toLocaleString(formatLocale())} />
          <Metric label={t('explorerArk.address.totalVtxos')} value={info.totalCount.toLocaleString(formatLocale())} />
          {age && <Metric label={t('explorerArk.address.avgAge')} value={age.days < 1 ? t('explorerArk.address.ageHours', { count: Math.round(age.days * 24) }) : t('explorerArk.address.ageDays', { count: age.days.toFixed(1) })} />}
        </div>
      </div>

      {/* Balance over time, like the on-chain address view. Off-chain spends
          carry no timestamp of their own, so an undatable spend just shortens
          the left edge (the series stays exact at today's edge). */}
      {history.points.length >= 2 && (
        <ExplorerBalanceChart points={history.points} partial={history.partial} />
      )}

      {/* The spendable VTXOs as packed circles, the off-chain twin of the
          unspent-outputs view. */}
      {spendable.length > 0 && (
        <ExplorerUtxoBubbles
          utxos={spendable.map(v => ({ valueSats: v.amountSats, blockTime: v.createdAt }))}
          title={t('explorerArk.address.spendableVtxos')}
        />
      )}

      {/* The transaction history, reconstructed from the VTXOs' lifecycles:
          one row per Arkade transaction that touched the address, newest
          first, with its net effect. */}
      {txHistory.length > 0 && (
        <div className="flex flex-col" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
          <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: 'transparent' }}>
            <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{t('explorerArk.address.transactions')}</span>
            <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
              {t('explorerArk.address.shownOf', { shown: Math.min(txLimit, txHistory.length).toLocaleString(formatLocale()), total: txHistory.length.toLocaleString(formatLocale()) })}
            </span>
          </div>
          {txHistory.slice(0, txLimit).map(e => (
            <button
              key={e.txid}
              type="button"
              onClick={() => onOpenTx?.(e.txid)}
              className="alice-control alice-control--quiet flex items-center justify-between gap-3 w-full text-left cursor-pointer bg-transparent px-3 py-2"

              style={{ justifyContent: 'space-between' }}
              disabled={!onOpenTx}
            >
              <div className="flex flex-col min-w-0">
                <span className="font-numbers truncate" style={{ fontSize: 12, color: onOpenTx ? 'var(--alice-primary)' : 'var(--alice-text)' }} title={e.txid}>
                  {shortHex(e.txid, 12, 6)}
                </span>
                <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
                  {e.time !== undefined ? fmtTime(e.time) : t('explorerArk.address.timeUnknown')}
                </span>
              </div>
              <span className="font-numbers shrink-0 flex items-center gap-1" style={{ fontSize: 12, color: e.deltaSats >= 0 ? 'var(--alice-success)' : 'var(--alice-text)' }}>
                {e.deltaSats >= 0 ? '+' : '−'}
                <Amount sats={Math.abs(e.deltaSats)} style={{ fontSize: 12, color: 'inherit' }} />
              </span>
            </button>
          ))}
          {txLimit < txHistory.length && (
            <button
              type="button"
              onClick={() => setTxLimit(l => l + FEED_STEP)}
              className="alice-control alice-control--quiet font-numbers cursor-pointer"
              style={{
                fontSize: 13, padding: '8px 16px', color: 'var(--alice-primary)',
              }}
            >
              {t('explorerArk.address.showMore')}
            </button>
          )}
        </div>
      )}

      {info.vtxos.length > 0 ? (
        <div className="flex flex-col" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
          <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: 'transparent' }}>
            <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{t('explorerArk.address.vtxos')}</span>
            <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
              {t('explorerArk.address.shownOf', { shown: Math.min(vtxoLimit, info.vtxos.length).toLocaleString(formatLocale()), total: info.vtxos.length.toLocaleString(formatLocale()) })}
            </span>
          </div>
          {info.vtxos.slice(0, vtxoLimit).map(v => <VtxoRow key={`${v.txid}:${v.vout}`} v={v} onOpenTx={onOpenTx} onOpenVtxo={onOpenVtxo} />)}
          {vtxoLimit < info.vtxos.length && (
            <button
              type="button"
              onClick={() => setVtxoLimit(l => l + FEED_STEP)}
              className="alice-control alice-control--quiet font-numbers cursor-pointer"
              style={{
                fontSize: 13, padding: '8px 16px', color: 'var(--alice-primary)',
              }}
            >
              {t('explorerArk.address.showMore')}
            </button>
          )}
        </div>
      ) : (
        <EmptyState title={t('explorerArk.address.emptyTitle')} hint={t('explorerArk.address.emptyHint')} />
      )}
    </div>
  );
}

/** The commitment-transaction card, shown as the overlay of that transaction
 *  and anywhere a commitment is inspected. `onOpenTx` renders the txid as a link; omit it on the
 *  transaction's own page. */
export function CommitmentCard({ c, onOpenTx }: { c: ArkadeCommitment; onOpenTx?: (txid: string) => void }) {
  const t = useT();
  const window = c.startedAt && c.endedAt ? c.endedAt - c.startedAt : undefined;
  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-col gap-3 px-4 py-3"
        style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${ARKADE_ACCENT}`, borderRadius: 3, backgroundColor: 'transparent' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <SettlementBadge>{t('explorerArk.commitment.badge')}</SettlementBadge>
          {onOpenTx ? (
            <button
              type="button"
              onClick={() => { noteSeenSettlement(c.txid); onOpenTx(c.txid); }}
              className="alice-control alice-control--quiet font-numbers break-all text-left cursor-pointer bg-transparent"
              style={{ fontSize: 11, color: 'var(--alice-primary)' }}
              title={t('explorerArk.commitment.openOnchain')}
            >
              {c.txid}
            </button>
          ) : (
            <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{c.txid}</span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label={t('explorerArk.commitment.input')} value={<Amount sats={c.totalInputAmountSats} style={{ fontSize: 13, color: 'var(--alice-text)' }} />} />
          <Metric label={t('explorerArk.commitment.inputVtxos')} value={c.totalInputVtxos.toLocaleString(formatLocale())} />
          <Metric label={t('explorerArk.commitment.output')} value={<Amount sats={c.totalOutputAmountSats} style={{ fontSize: 13, color: 'var(--alice-text)' }} />} />
          <Metric label={t('explorerArk.commitment.outputVtxos')} value={c.totalOutputVtxos.toLocaleString(formatLocale())} />
          <Metric label={t('explorerArk.commitment.started')} value={fmtTime(c.startedAt)} />
          <Metric label={t('explorerArk.commitment.ended')} value={fmtTime(c.endedAt)} />
          {window !== undefined && <Metric label={t('explorerArk.commitment.duration')} value={fmtDuration(window, t)} />}
          <Metric label={t('explorerArk.commitment.batches')} value={c.batches.length.toLocaleString(formatLocale())} />
        </div>
      </div>

      {c.batches.length > 0 && (
        <div className="flex flex-col" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
          <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: 'transparent' }}>
            <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{t('explorerArk.commitment.batches')}</span>
            <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>{c.batches.length}</span>
          </div>
          {c.batches.map(b => (
            <div key={b.key} className="flex items-center justify-between gap-3 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)' }}>
              <div className="flex flex-col min-w-0">
                <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-text)' }} title={b.key}>{shortHex(b.key, 14, 8)}</span>
                <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
                  {t.plural('explorerArk.commitment.vtxoCount', b.totalOutputVtxos, { count: b.totalOutputVtxos.toLocaleString(formatLocale()) })}
                  {expiryNote(b, t)}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {b.swept && <Badge tone="neutral">{t('explorerArk.vtxo.swept')}</Badge>}
                <Amount sats={b.totalOutputAmountSats} style={{ fontSize: 12, color: 'var(--alice-text)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Newest first: an entry without a height (just announced, unconfirmed) sorts
// above everything already mined.
function byNewest(a: KnownSettlement, b: KnownSettlement): number {
  return (b.height ?? Number.MAX_SAFE_INTEGER) - (a.height ?? Number.MAX_SAFE_INTEGER);
}

/**
 * The settlements panel of the Arkade overview: the on-chain settlement
 * history this browser has identified (the chain walker fills it), extended in
 * real time by the ASP stream. Each row opens the settlement's on-chain
 * transaction tab, where the round's detail overlays the raw view. `sync`
 * says whether the walk has reached the tip (a ring heads the list until it
 * has) and serves the older pages on request.
 */
export function ArkadeLiveSettlements({ apiBaseUrl, sync, onOpenTx }: { apiBaseUrl: string; sync?: SettlementSync; onOpenTx: (txid: string) => void }) {
  const t = useT();
  const [known, setKnown] = useState<KnownSettlement[]>(() => [...settlementRegistry.all()].sort(byNewest));
  const [live, setLive] = useState(false);
  const [limit, setLimit] = useState(FEED_INITIAL);

  // Mirror the registry: the walker and the live stream both land there.
  useEffect(() => settlementRegistry.subscribe(() => {
    setKnown([...settlementRegistry.all()].sort(byNewest));
  }), []);

  // The live stream has no history of its own; it feeds the registry, which
  // notifies the mirror above. Reconnects with a short backoff when dropped.
  useEffect(() => {
    const controller = new AbortController();
    let stopped = false;
    setLive(false);
    (async () => {
      while (!stopped) {
        try {
          setLive(true);
          await subscribeSettlements(apiBaseUrl, s => noteSeenSettlement(s.txid), { signal: controller.signal });
        } catch {
          /* dropped or unreachable: fall through to backoff and retry */
        }
        setLive(false);
        if (stopped) break;
        await new Promise(r => setTimeout(r, 3000));
      }
    })();
    return () => { stopped = true; controller.abort(); };
  }, [apiBaseUrl]);

  const shown = known.slice(0, limit);
  const catchingUp = sync?.catchingUp ?? false;
  // Fetch a page of older settlements and widen the window so they show.
  function loadOlder() {
    if (!sync) return;
    setLimit(l => Math.max(l, known.length) + HISTORY_PAGE);
    void sync.loadOlder();
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{t('explorerArk.settlements.title')}</span>
        <span className="flex items-center gap-1.5">
          {sync && !catchingUp && sync.tipHeight !== null && (
            <span
              className="font-pixel tracking-widest"
              style={{ fontSize: 10, color: 'var(--alice-muted)' }}
              title={t('explorerArk.settlements.upToDateTitle')}
            >
              {t('explorerArk.settlements.upToDate', { height: sync.tipHeight.toLocaleString(formatLocale()) })}
            </span>
          )}
          <span style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: live ? 'var(--alice-success)' : 'var(--alice-muted)' }} />
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{live ? t('explorerArk.settlements.live') : t('explorerArk.settlements.connecting')}</span>
        </span>
      </div>
      <div className="flex flex-col" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
        {catchingUp && (
          <div className="flex items-center gap-2 px-3 py-2" style={{ color: 'var(--alice-muted)' }} role="status">
            <span className="rh-spinner shrink-0" aria-hidden="true" />
            <span className="font-numbers" style={{ fontSize: 12, lineHeight: '16px' }}>
              {t('explorerArk.settlements.catchingUp')}
            </span>
          </div>
        )}
        {shown.length === 0 ? (
          !catchingUp && <Analyzing label={t('explorerArk.settlements.identifying')} />
        ) : (
          shown.map((s, i) => (
            <button
              key={s.txid}
              type="button"
              onClick={() => onOpenTx(s.txid)}
              className="alice-control alice-control--quiet flex items-center justify-between gap-3 w-full text-left cursor-pointer bg-transparent px-3 py-2"
              style={{ borderTop: i > 0 || catchingUp ? '1px solid var(--alice-border)' : undefined, justifyContent: 'space-between' }}
            >
              <div className="flex flex-col min-w-0">
                <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-primary)' }} title={s.txid}>{shortHex(s.txid, 12, 8)}</span>
                <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
                  {s.height !== undefined ? t('explorerArk.settlements.block', { height: s.height.toLocaleString(formatLocale()) }) : t('explorerArk.settlements.mempool')}
                  {s.timestamp !== undefined ? ` · ${agoLabel(s.timestamp * 1000, t)} · ${formatDateTime(s.timestamp)}` : ''}
                </span>
              </div>
              <SettlementBadge />
            </button>
          ))
        )}
      </div>
      {known.length > shown.length ? (
        <button
          type="button"
          onClick={() => setLimit(l => l + FEED_STEP)}
          className="alice-control alice-control--quiet font-numbers self-center cursor-pointer"
          style={{
            fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)',
          }}
        >
          {t('explorerArk.settlements.showMore', { count: Math.min(FEED_STEP, known.length - shown.length) })}
        </button>
      ) : sync && known.length > 0 && !catchingUp && sync.exhausted === null ? (
        <button
          type="button"
          onClick={loadOlder}
          disabled={sync.loadingOlder}
          className="alice-control alice-control--quiet font-numbers self-center cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
          style={{ fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)' }}
          title={t('explorerArk.settlements.olderTitle')}
        >
          {sync.loadingOlder && <span className="rh-spinner" aria-hidden="true" />}
          {sync.loadingOlder ? t('explorerArk.settlements.loadingOlder') : t('explorerArk.settlements.loadOlder', { count: HISTORY_PAGE })}
        </button>
      ) : sync?.exhausted ? (
        <span className="font-numbers self-center text-center" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
          {sync.exhausted === 'origin'
            ? t('explorerArk.settlements.origin')
            : t('explorerArk.settlements.stuck')}
        </span>
      ) : null}
    </div>
  );
}

/** The ASP's advertised parameters, as a section of the Arkade overview. */
export function ArkadeAspInfo({ apiBaseUrl }: { apiBaseUrl: string }) {
  const t = useT();
  const [info, setInfo] = useState<ArkadeInfo | null>(null);
  const [infoErr, setInfoErr] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setInfo(null); setInfoErr('');
    getArkadeInfo(apiBaseUrl, { signal: controller.signal })
      .then(i => setInfo(i))
      .catch(e => {
        // A cancelled fetch (re-render/unmount) is not an error to show.
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setInfoErr(e instanceof ArkadeError ? e.message : t('explorerArk.asp.unreachableError'));
      });
    return () => controller.abort();
  }, [apiBaseUrl]);

  return (
    <div className="flex flex-col gap-2">
      <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{t('explorerArk.asp.title')}</span>
      {infoErr ? (
        <div className="flex flex-col gap-1 px-4 py-3" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{t('explorerArk.asp.unreachable')}</span>
          <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{infoErr}</p>
        </div>
      ) : info ? (
        <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${ARKADE_ACCENT}`, borderRadius: 3, backgroundColor: 'transparent' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
            <Metric label={t('explorerArk.asp.batchEvery')} value={fmtDuration(info.sessionDurationSec, t)} title={t('explorerArk.asp.batchEveryTitle')} />
            <Metric label={t('explorerArk.asp.dust')} value={<Amount sats={info.dustSats} style={{ fontSize: 13, color: 'var(--alice-text)' }} />} />
            <Metric label={t('explorerArk.asp.vtxoMin')} value={<Amount sats={info.vtxoMinSats} style={{ fontSize: 13, color: 'var(--alice-text)' }} />} />
            <Metric label={t('explorerArk.asp.vtxoMax')} value={<Amount sats={info.vtxoMaxSats} style={{ fontSize: 13, color: 'var(--alice-text)' }} />} />
            <Metric label={t('explorerArk.asp.exitDelay')} value={formatArkadeExitDelay(info.unilateralExitDelay, t.locale)} title={t('explorerArk.asp.exitDelayTitle')} />
            <Metric label={t('explorerArk.asp.maxTxWeight')} value={info.maxTxWeight.toLocaleString(formatLocale())} />
            <Metric label={t('explorerArk.asp.version')} value={info.version || '-'} />
            <Metric label={t('explorerArk.asp.settlesOn')} value={info.network || '-'} />
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel>{t('explorerArk.asp.signerPubkey')}</FieldLabel>
            <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{info.signerPubkey || '-'}</span>
          </div>
          {info.forfeitAddress && (
            <div className="flex flex-col gap-1">
              <FieldLabel>{t('explorerArk.asp.forfeitAddress')}</FieldLabel>
              <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{info.forfeitAddress}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3, backgroundColor: 'transparent' }}>
          <SkeletonLines lines={3} />
        </div>
      )}
    </div>
  );
}

/** The Arkade address an input spends from or an output pays, shortened,
 *  opening the address view when the card can. */
function ArkadeAddressLine({ address, onOpenAddress }: { address?: string; onOpenAddress?: (address: string) => void }) {
  const t = useT();
  if (!address) return null;
  const short = `${address.slice(0, 14)}…${address.slice(-8)}`;
  return onOpenAddress ? (
    <button
      type="button"
      onClick={() => onOpenAddress(address)}
      className="alice-control alice-control--quiet font-numbers truncate text-left cursor-pointer bg-transparent p-0 self-start"
      style={{ fontSize: 11, color: 'var(--alice-primary)' }}
      title={t('explorerArk.virtual.open', { address })}
    >
      {short}
    </button>
  ) : (
    <span className="font-numbers truncate" style={{ fontSize: 11, color: 'var(--alice-muted)' }} title={address}>{short}</span>
  );
}

/**
 * The view a VIRTUAL (off-chain) Arkade transaction gets: the txid exists in
 * the ASP's indexer but not on Bitcoin, so instead of Esplora's "not found"
 * the tab shows the decoded transaction, what it spent, what it created, and
 * where each output stands (preconfirmed, settled, spent, its expiry).
 */
export function ArkadeVirtualTxCard({ vtx, onOpenTx, onOpenAddress }: {
  vtx: ArkadeVirtualTx;
  onOpenTx?: (txid: string) => void;
  onOpenAddress?: (address: string) => void;
}) {
  // The commitment transactions anchoring this transaction's outputs on
  // Bitcoin, as the indexer reports them per VTXO (one batch, usually).
  const t = useT();
  const commitments = [...new Set(vtx.outputs.flatMap(o => o.vtxo?.commitmentTxids ?? []))];
  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-col gap-3 px-4 py-3"
        style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${ARKADE_ACCENT}`, borderRadius: 3, backgroundColor: 'transparent' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <SettlementBadge>{t('explorerArk.virtual.badge')}</SettlementBadge>
          <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{vtx.txid}</span>
        </div>
        {onOpenTx && commitments.length > 0 && (
          // The way back to the chain, on its own line under the id so it
          // sits at the same place on every width; sized like the badge, under
          // the 40px floor the controls get elsewhere.
          <div className="flex">
            <button
              type="button"
              onClick={() => { noteSeenSettlement(commitments[0]); onOpenTx(commitments[0]); }}
              className="alice-control alice-control--quiet font-pixel tracking-widest cursor-pointer"
              style={{ fontSize: 10, lineHeight: 1, minHeight: 0, padding: '5px 8px', borderRadius: 3, color: 'var(--alice-primary)' }}
              title={commitments.length === 1
                ? t('explorerArk.virtual.openCommitmentOne', { txid: commitments[0] })
                : t('explorerArk.virtual.openCommitmentMany', { count: commitments.length })}
            >
              {t('explorerArk.virtual.openCommitment')}
            </button>
          </div>
        )}
        <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
          {t('explorerArk.virtual.explain')}
        </p>
      </div>

      {/* The same flow graph an on-chain transaction gets, drawn from the
          decoded PSBT; spent outputs point at their checkpoint spender. */}
      <ExplorerTxGraph
        tx={virtualTxToNormalized(vtx, 'arkade')}
        outspends={virtualTxOutspends(vtx)}
        onOpenTx={onOpenTx}
        onOpenAddress={onOpenAddress}
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
          <div className="px-3 py-2" style={{ backgroundColor: 'transparent' }}>
            <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{t('explorerArk.virtual.inputs', { count: vtx.inputs.length })}</span>
          </div>
          {vtx.inputs.map((inp, i) => (
            <div key={`${inp.txid}:${inp.vout}:${i}`} className="flex items-center justify-between gap-3 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)' }}>
              <div className="flex flex-col min-w-0">
                {onOpenTx && inp.txid ? (
                  <button
                    type="button"
                    onClick={() => onOpenTx(inp.txid)}
                    className="alice-control alice-control--quiet font-numbers truncate text-left cursor-pointer bg-transparent p-0"
                    style={{ fontSize: 12, color: 'var(--alice-primary)' }}
                    title={`${inp.txid}:${inp.vout}`}
                  >
                    {shortHex(inp.txid, 12, 6)}:{inp.vout}
                  </button>
                ) : (
                  <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-text)' }} title={`${inp.txid}:${inp.vout}`}>{shortHex(inp.txid, 12, 6)}:{inp.vout}</span>
                )}
                <ArkadeAddressLine address={inp.address} onOpenAddress={onOpenAddress} />
                {inp.viaCheckpoint && (
                  <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }} title={t('explorerArk.virtual.checkpointTitle')}>
                    {t('explorerArk.virtual.throughCheckpoint')}
                  </span>
                )}
              </div>
              {inp.amountSats !== undefined && <Amount sats={inp.amountSats} style={{ fontSize: 12, color: 'var(--alice-text)' }} />}
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
          <div className="px-3 py-2" style={{ backgroundColor: 'transparent' }}>
            <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{t('explorerArk.virtual.outputs', { count: vtx.outputs.length })}</span>
          </div>
          {vtx.outputs.map(o => (
            <div key={o.index} className="flex items-center justify-between gap-3 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)' }}>
              <div className="flex flex-col min-w-0">
                <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-text)' }} title={o.scriptHex}>
                  #{o.index}{o.isAnchor ? ` · ${t('explorerArk.virtual.anchor')}` : ''}
                </span>
                <ArkadeAddressLine address={o.address} onOpenAddress={onOpenAddress} />
                {o.vtxo && (
                  <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
                    {o.vtxo.isSpent ? t('explorerArk.virtual.spent') : o.vtxo.isSwept ? t('explorerArk.virtual.swept') : o.vtxo.isPreconfirmed ? t('explorerArk.vtxo.preconfirmed') : t('explorerArk.virtual.settled')}
                    {expiryNote(o.vtxo, t)}
                  </span>
                )}
                {o.vtxo?.commitmentTxids[0] && (
                  onOpenTx ? (
                    <button
                      type="button"
                      onClick={() => { noteSeenSettlement(o.vtxo!.commitmentTxids[0]); onOpenTx(o.vtxo!.commitmentTxids[0]); }}
                      className="alice-control alice-control--quiet font-numbers text-left cursor-pointer bg-transparent p-0"
                      style={{ fontSize: 13, color: 'var(--alice-primary)' }}
                      title={t('explorerArk.vtxo.openCommitmentTitle')}
                    >
                      {t('explorerArk.vtxo.anchoredIn', { txid: shortHex(o.vtxo.commitmentTxids[0], 8, 6) })}
                    </button>
                  ) : (
                    <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{t('explorerArk.vtxo.anchoredIn', { txid: shortHex(o.vtxo.commitmentTxids[0], 8, 6) })}</span>
                  )
                )}
              </div>
              <Amount sats={o.amountSats} style={{ fontSize: 12, color: 'var(--alice-text)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type AddressTabState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; info: ArkadeAddressInfo };

/**
 * The tab an ark1… address opens: the address's VTXOs and balance from the ASP
 * indexer, in the place an on-chain address tab would occupy. Off-chain coins,
 * not on-chain outputs; each VTXO links to the settlement anchoring it.
 */
export function ExplorerArkadeAddressTab({ apiBaseUrl, address, onOpenTx, onOpenVtxo, onSignals }: {
  apiBaseUrl: string;
  address: string;
  onOpenTx?: (txid: string) => void;
  /** Opens a VTXO's own tab (its exit tree), by "txid:vout". */
  onOpenVtxo?: (id: string) => void;
  /** Hands the page's context to the Ask Alice dock: a LAYER_CONTEXT signal
      (shape only, de-identified) and the full description for identified mode. */
  onSignals?: (signals: PrivacySignal[], full?: FullContext) => void;
}) {
  const t = useT();
  const [state, setState] = useState<AddressTabState>({ kind: 'loading' });
  const [retryToken, setRetryToken] = useState(0);
  // The page's context for Ask Alice, once the address is on screen.
  const onSignalsRef = useRef(onSignals);
  onSignalsRef.current = onSignals;
  const loadedInfo = state.kind === 'loaded' ? state.info : null;
  useEffect(() => {
    if (!loadedInfo) return;
    const ctx = arkadeAddressContext(loadedInfo);
    onSignalsRef.current?.([ctx.signal], ctx.full);
  }, [loadedInfo]);

  useEffect(() => {
    const controller = new AbortController();
    setState({ kind: 'loading' });
    getArkadeAddressVtxos(apiBaseUrl, address, { signal: controller.signal })
      .then(info => {
        // A slow answer for address A must not replace the page of address B.
        if (controller.signal.aborted) return;
        setState({ kind: 'loaded', info });
      })
      .catch(e => {
        if (controller.signal.aborted) return;
        if (e instanceof DOMException && e.name === 'AbortError') return;
        // The Arkade tools load on demand: when that load itself fails (the
        // page's server was down or restarting), say so rather than blaming
        // the address.
        const chunkFailed = e instanceof Error && !(e instanceof ArkadeError)
          && /chunk|dynamically imported module|import\(/i.test(`${e.name} ${e.message}`);
        setState({
          kind: 'error',
          message: e instanceof ArkadeError ? e.message
            : chunkFailed ? t('explorerArk.tab.chunkFailed')
              : t('explorerArk.tab.loadFailed'),
        });
      });
    return () => controller.abort();
  }, [apiBaseUrl, address, retryToken]);

  if (state.kind === 'loading') {
    // The page structure is laid out from the first paint (metrics, balance,
    // VTXO bubbles, lists) and the data swaps in place, like the on-chain tab.
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3, backgroundColor: 'transparent' }}>
          <Skeleton width="60%" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
            {[t('explorerArk.address.spendable'), t('explorerArk.address.spendableVtxos'), t('explorerArk.address.totalVtxos'), t('explorerArk.address.avgAge')].map(l => (
              <div key={l} className="flex flex-col gap-1">
                <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{l}</span>
                <Skeleton width="60%" />
              </div>
            ))}
          </div>
        </div>
        <SectionPanel title={t('explorerArk.tab.balance')}><div className="px-3 py-3"><Skeleton height={110} /></div></SectionPanel>
        <SectionPanel title={t('explorerArk.address.spendableVtxos')}>
          <div className="flex items-center justify-center gap-3 px-3 py-4">
            <Skeleton width={64} height={64} style={{ borderRadius: '50%' }} />
            <Skeleton width={40} height={40} style={{ borderRadius: '50%' }} />
            <Skeleton width={26} height={26} style={{ borderRadius: '50%' }} />
          </div>
        </SectionPanel>
        <SectionPanel title={t('explorerArk.address.transactions')}><Analyzing label={t('explorerArk.tab.reading')} /></SectionPanel>
        <SectionPanel title={t('explorerArk.address.vtxos')}><div className="px-3 py-3"><SkeletonLines lines={5} /></div></SectionPanel>
      </div>
    );
  }
  if (state.kind === 'error') {
    return (
      <div className="flex flex-col gap-2 px-4 py-3" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{t('explorerArk.tab.couldNotLoad')}</span>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{state.message}</p>
        <button
          type="button"
          onClick={() => setRetryToken(n => n + 1)}
          className="alice-control alice-control--quiet font-numbers self-start cursor-pointer"
          style={{
            fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)',
          }}
        >
          {t('explorerArk.tab.retry')}
        </button>
      </div>
    );
  }
  return <div className="rh-fade-in"><AddressCard info={state.info} onOpenTx={onOpenTx} onOpenVtxo={onOpenVtxo} /></div>;
}
