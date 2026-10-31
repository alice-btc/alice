'use client';

// The Bark-specific pieces of the Explorer. Bark settles on Bitcoin mainnet,
// so the network reuses the whole Bitcoin explorer for blocks, transactions
// and on-chain addresses. What is Bark's own is rendered here: the live rounds
// feed, the server's parameters and fees, and the view a Bark address opens.
// A Bark server keeps no public index, by design, so there is no address
// lookup to show: a Bark address is decoded on the device instead, and the
// rounds come from the live feed plus the on-chain walk (bark-onchain).

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarkError, arkIdFor, decodeBarkAddress, getBarkInfo, getBarkNextRoundTime,
  subscribeBarkRounds, type BarkAddress, type BarkInfo, type BarkRoundEvent, type FeeTier,
} from '@/lib/explorer/bark';
import { HISTORY_PAGE, noteSeenBarkRound } from '@/lib/explorer/bark-onchain';
import type { SettlementSync } from '@/lib/explorer/use-settlement-sync';
import { barkAddressContext } from '@/lib/explorer/layer-context';
import type { PrivacySignal } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import type { KnownSettlement } from '@/lib/explorer/arkade-onchain';
import type { BarkVtxo } from '@/lib/explorer/bark-vtxo';
import type { NormalizedTransaction } from '@/lib/explorer/types';
import { formatDateTime } from '@/lib/explorer/blocks';
import { getNetwork } from '@/lib/explorer/networks';
import { openExternalUrl } from '@/lib/open-external';
import { EXTERNAL_ICON } from '@/lib/atelier-icons';
import { Amount } from '@/components/AmountDisplay';
import { SvgIcon } from '@/components/SvgIcon';
import { ExplorerCopy, FieldLabel, Metric, SkeletonLines } from '@/components/ExplorerUI';
import { formatLocale, type Translator, useT } from '@/i18n';

/** The Bark accent, for its round markers: the theme's text colour, so white
 *  on a dark theme and black on a light one (see networks.ts). */
export const BARK_ACCENT = getNetwork('bark').color;
/** The Bark id of Second's mainnet server, to name it on a round or a coin. */
const SECOND_ARK_ID = 'e6af17ba';

const BLOCKS_PER_DAY = 144;
const FEED_INITIAL = 5;
const FEED_STEP = 10;

function shortHex(s: string, head = 10, tail = 8): string {
  return s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;
}
function agoLabel(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86_400)}d ago`;
}
function fmtDuration(sec: number, t: Translator): string {
  if (!sec) return '-';
  if (sec < 60) return t('explorerBark.duration.seconds', { count: sec });
  if (sec < 3600) return t('explorerBark.duration.minutes', { count: Math.round(sec / 60) });
  return t('explorerBark.duration.hours', { count: Math.round(sec / 3600) });
}
/** Blocks as days when they divide evenly (144 a day), raw blocks otherwise. */
function days(blocks: number, t: Translator): string {
  if (blocks % BLOCKS_PER_DAY !== 0) return t('explorerBark.blocks', { blocks: blocks.toLocaleString(formatLocale()) });
  const d = blocks / BLOCKS_PER_DAY;
  return t.plural('explorerBark.days', d);
}
function blocksAndDays(blocks: number, t: Translator): string {
  if (!blocks) return '-';
  return t('explorerBark.blocksAndDays', { blocks: blocks.toLocaleString(formatLocale()), days: Math.max(1, Math.round(blocks / BLOCKS_PER_DAY)) });
}
function pct(ppm: number, t: Translator): string {
  return t('explorerBark.percent', { value: (ppm / 10_000).toLocaleString(formatLocale(), { maximumFractionDigits: 2 }) });
}

/** The round marker: the accent filled, the page background as text, so it
 *  inverts with the theme (white on black, black on white). */
export function BarkRoundBadge({ children }: { children?: React.ReactNode }) {
  const t = useT();
  return (
    <span
      className="font-pixel tracking-widest inline-flex items-center shrink-0"
      style={{
        fontSize: 10, lineHeight: 1, padding: '3px 6px', borderRadius: 3,
        border: `1px solid ${BARK_ACCENT}`, color: 'var(--alice-bg)',
        backgroundColor: BARK_ACCENT, whiteSpace: 'nowrap',
      }}
    >
      {children ?? t('explorerBark.badge.round')}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{children}</span>;
}

/* --------------------------------- rounds --------------------------------- */

function lastEventLine(e: BarkRoundEvent | null, t: Translator): string | null {
  if (!e) return null;
  switch (e.kind) {
    case 'attempt':
    case 'proposal':
      return e.attemptSeq > 0 ? t('explorerBark.event.attempt', { attempt: e.attemptSeq + 1 }) : t('explorerBark.event.progress');
    case 'finished':
      return t('explorerBark.event.finished');
    case 'failed':
      return t('explorerBark.event.failed');
    default:
      return null;
  }
}

/**
 * The rounds panel of the Bark overview. The server publishes no history,
 * only its latest round event and the next ones as they happen, so the list
 * is what this browser has identified: the rounds seen on the live feed and
 * the ones the on-chain walk found from the last round it knew. Newest first,
 * each opening its on-chain transaction on the Bitcoin network.
 */
export function BarkLiveRounds({ serverUrl, rounds, sync, onOpenTx }: {
  serverUrl: string;
  rounds: ReadonlyMap<string, KnownSettlement>;
  /** Whether the walk has reached the tip (a ring heads the list until it
   *  has), and the older pages on request. */
  sync?: SettlementSync;
  onOpenTx: (txid: string, networkId?: string) => void;
}) {
  const t = useT();
  const [last, setLast] = useState<BarkRoundEvent | null>(null);
  const [live, setLive] = useState(false);
  const [nextAt, setNextAt] = useState<number | null>(null);
  const [nextToken, setNextToken] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [limit, setLimit] = useState(FEED_INITIAL);

  // The round stream: the latest event first, then each new one. Reconnects
  // with a short backoff when dropped, like the Arkade settlements stream.
  useEffect(() => {
    const controller = new AbortController();
    let stopped = false;
    (async () => {
      while (!stopped) {
        try {
          setLive(true);
          await subscribeBarkRounds(serverUrl, e => {
            setLast(e);
            // A completed round lands in the shared registry; its height is
            // resolved by the next walk pass once the transaction confirms.
            if (e.kind === 'finished' && e.txid) noteSeenBarkRound(e.txid);
            // A round just ended: the server has scheduled the next one.
            if (e.kind === 'finished' || e.kind === 'failed') setNextToken(n => n + 1);
          }, { signal: controller.signal });
        } catch {
          /* dropped or unreachable: fall through to backoff and retry */
        }
        // A cancelled loop must not touch the indicator: the effect that
        // replaced it has already turned it on.
        if (stopped) break;
        setLive(false);
        await new Promise(r => setTimeout(r, 3000));
      }
    })();
    return () => { stopped = true; controller.abort(); };
  }, [serverUrl]);

  useEffect(() => {
    const controller = new AbortController();
    getBarkNextRoundTime(serverUrl, { signal: controller.signal })
      .then(at => setNextAt(at > 0 ? at : null))
      .catch(() => { /* the countdown is a nicety; the feed works without it */ });
    return () => controller.abort();
  }, [serverUrl, nextToken]);

  // A coarse clock for the countdown, and a re-read once the announced time
  // has passed (a round that finds nothing to settle may not emit an event).
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (nextAt === null) return;
    const wait = Math.max(nextAt * 1000 - Date.now() + 60_000, 60_000);
    const id = setTimeout(() => setNextToken(n => n + 1), wait);
    return () => clearTimeout(id);
  }, [nextAt]);

  const status = lastEventLine(last, t);
  const minutesLeft = nextAt !== null ? Math.max(0, Math.round((nextAt * 1000 - now) / 60_000)) : null;
  // Newest first; a round just seen on the feed, not yet confirmed, comes
  // before every confirmed one.
  const sorted = useMemo(
    () => [...rounds.values()].sort((a, b) => (b.height ?? Infinity) - (a.height ?? Infinity)),
    [rounds],
  );
  const shown = sorted.slice(0, limit);
  const catchingUp = sync?.catchingUp ?? false;
  // Fetch a page of older rounds and widen the window so they show.
  function loadOlder() {
    if (!sync) return;
    setLimit(l => Math.max(l, sorted.length) + HISTORY_PAGE);
    void sync.loadOlder();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{t('explorerBark.rounds.title')}</Label>
        <span className="flex items-center gap-1.5">
          {sync && !catchingUp && sync.tipHeight !== null && (
            <span title={t('explorerBark.rounds.upToDateTitle')}>
              <Label>{t('explorerBark.rounds.upToDate', { height: sync.tipHeight.toLocaleString(formatLocale()) })}</Label>
            </span>
          )}
          <span style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: live ? 'var(--alice-success)' : 'var(--alice-muted)' }} />
          <Label>{live ? t('explorerBark.rounds.live') : t('explorerBark.rounds.connecting')}</Label>
        </span>
      </div>
      <div className="flex flex-col gap-1 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)' }}>
        {nextAt !== null && minutesLeft !== null && (
          <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-text)' }}>
            {minutesLeft === 0 ? t('explorerBark.rounds.nextNow') : t('explorerBark.rounds.nextIn', { minutes: minutesLeft })}
            {' · '}
            {new Date(nextAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        {status && <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>{status}</span>}
      </div>
      <div className="flex flex-col" style={{ borderTop: '1px solid var(--alice-border)' }}>
        {catchingUp && (
          <div className="flex items-center gap-2 px-3 py-2" style={{ color: 'var(--alice-muted)' }} role="status">
            <span className="rh-spinner shrink-0" aria-hidden="true" />
            <span className="font-numbers" style={{ fontSize: 12, lineHeight: '16px' }}>
              {t('explorerBark.rounds.catchingUp')}
            </span>
          </div>
        )}
        {shown.length === 0 ? (
          !catchingUp && (
            <p className="font-numbers m-0 px-3 py-3" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
              {t('explorerBark.rounds.empty')}
            </p>
          )
        ) : (
          shown.map((r, i) => (
            <button
              key={r.txid}
              type="button"
              onClick={() => onOpenTx(r.txid, 'mainnet')}
              className="alice-control alice-control--quiet flex items-center justify-between gap-3 w-full text-left cursor-pointer bg-transparent px-3 py-2"
              style={{ borderTop: i > 0 || catchingUp ? '1px solid var(--alice-border)' : undefined, justifyContent: 'space-between' }}
              title={i === 0 ? t('explorerBark.rounds.latestTitle') : undefined}
            >
              <div className="flex flex-col min-w-0">
                <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-primary)' }} title={r.txid}>{shortHex(r.txid, 12, 8)}</span>
                <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
                  {r.height !== undefined
                    ? `${t('explorerBark.rounds.block', { height: r.height.toLocaleString(formatLocale()) })}${r.timestamp ? ` · ${formatDateTime(r.timestamp)}` : ''}`
                    : t('explorerBark.rounds.unconfirmed')}
                </span>
              </div>
              <span className="flex items-center gap-2 shrink-0">
                {i === 0 && <Label>{t('explorerBark.rounds.latest')}</Label>}
                <BarkRoundBadge />
              </span>
            </button>
          ))
        )}
      </div>
      {sorted.length > shown.length ? (
        <button
          type="button"
          onClick={() => setLimit(l => l + FEED_STEP)}
          className="alice-control alice-control--quiet font-numbers self-center cursor-pointer"
          style={{ fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)' }}
        >
          {t('explorerBark.rounds.showMore', { count: Math.min(FEED_STEP, sorted.length - shown.length) })}
        </button>
      ) : sync && sorted.length > 0 && !catchingUp && sync.exhausted === null ? (
        <button
          type="button"
          onClick={loadOlder}
          disabled={sync.loadingOlder}
          className="alice-control alice-control--quiet font-numbers self-center cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
          style={{ fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)' }}
          title={t('explorerBark.rounds.olderTitle')}
        >
          {sync.loadingOlder && <span className="rh-spinner" aria-hidden="true" />}
          {sync.loadingOlder ? t('explorerBark.rounds.loadingOlder') : t('explorerBark.rounds.loadOlder', { count: HISTORY_PAGE })}
        </button>
      ) : sync?.exhausted ? (
        <span className="font-numbers self-center text-center" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
          {sync.exhausted === 'origin'
            ? t('explorerBark.rounds.origin')
            : t('explorerBark.rounds.stuck')}
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------- round card ------------------------------- */

/**
 * The round card, shown above a round transaction's on-chain view: what the
 * server committed into Bitcoin, read from the tree root it still serves
 * (the output `root.anchor.vout` of this transaction). The on-chain outputs
 * sit below in the regular view.
 */
export function BarkRoundCard({ root, tx, tip, onOpenVtxo }: {
  root: BarkVtxo;
  tx: NormalizedTransaction;
  /** The chain height, for the time left before the tree expires. */
  tip: number | null;
  onOpenVtxo?: (id: string) => void;
}) {
  const t = useT();
  const blocksLeft = tip !== null ? root.expiryHeight - tip : null;
  const server = arkIdFor(root.serverPubkey) === SECOND_ARK_ID ? 'Second' : t('explorerBark.server.other');
  const height = root.expiryHeight.toLocaleString(formatLocale());
  const expires = blocksLeft === null
    ? t('explorerBark.round.expiresBlock', { height })
    : blocksLeft <= 0
      ? t('explorerBark.round.expiredBlock', { height })
      : t('explorerBark.round.expiresIn', { height, left: blocksAndDays(blocksLeft, t) });
  return (
    <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: `3px solid ${BARK_ACCENT}`, borderRadius: 3 }}>
      <div className="flex items-center gap-2 flex-wrap">
        <BarkRoundBadge />
        <span className="font-numbers" style={{ fontSize: 12.5, color: 'var(--alice-text)' }}>
          {t('explorerBark.round.intro', { server })}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
        <Metric label={t('explorerBark.round.tree')} value={<Amount sats={root.amountSats} />} title={t('explorerBark.round.treeTitle')} />
        <Metric label={t('explorerBark.round.treeExpires')} value={expires} />
        <Metric label={t('explorerBark.metric.exitDelay')} value={blocksAndDays(root.exitDeltaBlocks, t)} />
        <Metric label={t('explorerBark.round.outputs')} value={root.anchor.vout === 0 ? t('explorerBark.round.outputsFirst', { count: tx.outputs.length }) : t('explorerBark.round.outputsAt', { count: tx.outputs.length, vout: root.anchor.vout })} />
      </div>
      <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
        {t('explorerBark.round.explain', { vout: root.anchor.vout })}
      </p>
      {onOpenVtxo && (
        <button
          type="button"
          onClick={() => onOpenVtxo(`${tx.txid}:${root.anchor.vout}`)}
          className="alice-control alice-control--quiet font-numbers self-start cursor-pointer"
          style={{ fontSize: 12.5, padding: '6px 10px', borderRadius: 3, color: 'var(--alice-primary)' }}
        >
          {t('explorerBark.round.openRoot')}
        </button>
      )}
    </div>
  );
}

/* ------------------------------- server info ------------------------------ */

/** "0% with under 2 days left · 0.2% from 2 days · …" for a tiered fee. */
function tierLine(tiers: FeeTier[], t: Translator): string {
  return tiers.map((tier, i) => {
    const next = tiers[i + 1];
    if (tier.fromBlocksLeft === 0 && next) return t('explorerBark.fees.under', { pct: pct(tier.ppm, t), days: days(next.fromBlocksLeft, t) });
    return t('explorerBark.fees.from', { pct: pct(tier.ppm, t), days: days(tier.fromBlocksLeft, t) });
  }).join(' · ');
}

function tierRange(tiers: FeeTier[], t: Translator): string {
  if (tiers.length === 0) return t('explorerBark.fees.none');
  const ppms = tiers.map(tier => tier.ppm);
  const lo = Math.min(...ppms);
  const hi = Math.max(...ppms);
  return lo === hi ? pct(lo, t) : t('explorerBark.fees.range', { low: pct(lo, t), high: pct(hi, t) });
}

function FeeRow({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2" style={{ borderTop: '1px solid var(--alice-border)' }}>
      <div className="flex items-baseline justify-between gap-3">
        <Label>{label}</Label>
        <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{value}</span>
      </div>
      {detail && <span className="font-numbers" style={{ fontSize: 11.5, lineHeight: '16px', color: 'var(--alice-muted)' }}>{detail}</span>}
    </div>
  );
}

function extras(t: Translator, baseSats: number, minSats = 0): string {
  const parts: string[] = [];
  if (baseSats) parts.push(t('explorerBark.fees.plus', { sats: baseSats.toLocaleString(formatLocale()) }));
  if (minSats) parts.push(t('explorerBark.fees.minimum', { sats: minSats.toLocaleString(formatLocale()) }));
  return parts.join(', ');
}

function FeeSchedule({ info }: { info: BarkInfo }) {
  const t = useT();
  const f = info.fees;
  const boardFree = !f.board.ppm && !f.board.baseSats && !f.board.minSats;
  const recvFree = !f.lightningReceive.ppm && !f.lightningReceive.baseSats;
  const join = (...xs: string[]) => xs.filter(Boolean).join(' · ');
  return (
    <div className="flex flex-col">
      <Label>{t('explorerBark.fees.title')}</Label>
      <p className="font-numbers m-0 pt-1 pb-2" style={{ fontSize: 11.5, lineHeight: '16px', color: 'var(--alice-muted)' }}>
        {t('explorerBark.fees.intro')}
      </p>
      <FeeRow
        label={t('explorerBark.fees.board')}
        value={boardFree ? t('explorerBark.fees.noServerFee') : join(f.board.ppm ? pct(f.board.ppm, t) : '', extras(t, f.board.baseSats, f.board.minSats))}
        detail={t('explorerBark.fees.boardDetail')}
      />
      <FeeRow label={t('explorerBark.fees.refresh')} value={tierRange(f.refresh.tiers, t)} detail={join(tierLine(f.refresh.tiers, t), extras(t, f.refresh.baseSats))} />
      <FeeRow label={t('explorerBark.fees.offboard')} value={tierRange(f.offboard.tiers, t)} detail={join(tierLine(f.offboard.tiers, t), extras(t, f.offboard.baseSats), t('explorerBark.fees.onchainFee'))} />
      <FeeRow
        label={t('explorerBark.fees.lightningSend')}
        value={tierRange(f.lightningSend.tiers, t)}
        detail={join(tierLine(f.lightningSend.tiers, t), extras(t, f.lightningSend.baseSats, f.lightningSend.minSats))}
      />
      <FeeRow
        label={t('explorerBark.fees.lightningReceive')}
        value={recvFree ? t('explorerBark.fees.noServerFee') : join(f.lightningReceive.ppm ? pct(f.lightningReceive.ppm, t) : '', extras(t, f.lightningReceive.baseSats))}
      />
    </div>
  );
}

/** The server's advertised parameters and fees, as a section of the Bark overview. */
export function BarkServerInfo({ serverUrl }: { serverUrl: string }) {
  const t = useT();
  const [info, setInfo] = useState<BarkInfo | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setInfo(null); setErr('');
    getBarkInfo(serverUrl, { signal: controller.signal })
      .then(setInfo)
      .catch(e => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setErr(e instanceof BarkError ? e.message : t('explorerBark.error.unreachable'));
      });
    return () => controller.abort();
  }, [serverUrl]);

  const host = serverUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return (
    <div className="flex flex-col gap-2">
      <Label>{t('explorerBark.info.server')}</Label>
      {err ? (
        <div className="flex flex-col gap-1 px-4 py-3" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{t('explorerBark.info.unreachable')}</span>
          <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{err}</p>
        </div>
      ) : info ? (
        <div className="flex flex-col gap-4 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${BARK_ACCENT}`, borderRadius: 3 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
            <Metric label={t('explorerBark.info.roundEvery')} value={fmtDuration(info.roundIntervalSec, t)} />
            <Metric label={t('explorerBark.info.lifetime')} value={blocksAndDays(info.vtxoLifetimeBlocks, t)} title={t('explorerBark.info.lifetimeTitle')} />
            <Metric label={t('explorerBark.metric.exitDelay')} value={blocksAndDays(info.exitDeltaBlocks, t)} title={t('explorerBark.info.exitDelayTitle')} />
            <Metric label={t('explorerBark.info.vtxoMax')} value={info.maxVtxoSats !== undefined ? <Amount sats={info.maxVtxoSats} style={{ fontSize: 13, color: 'var(--alice-text)' }} /> : t('explorerBark.info.noLimit')} />
            <Metric label={t('explorerBark.info.minBoard')} value={<Amount sats={info.minBoardSats} style={{ fontSize: 13, color: 'var(--alice-text)' }} />} />
            <Metric label={t('explorerBark.info.boardConfs')} value={info.boardConfirmations.toLocaleString(formatLocale())} title={t('explorerBark.info.boardConfsTitle')} />
            <Metric label={t('explorerBark.info.maxExitDepth')} value={info.maxExitDepth ? t('explorerBark.info.txs', { count: info.maxExitDepth }) : '-'} title={t('explorerBark.info.maxExitDepthTitle')} />
            <Metric label={t('explorerBark.info.settlesOn')} value={info.network || '-'} />
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel>{t('explorerBark.info.pubkey')}</FieldLabel>
            <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{info.serverPubkey || '-'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{t('explorerBark.info.operatedBy', { host })}</span>
            {info.tosLink && /^https:\/\//.test(info.tosLink) && (
              <a
                href={info.tosLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => { e.preventDefault(); void openExternalUrl(info.tosLink!); }}
                className="alice-control alice-control--quiet inline-flex font-numbers"
                style={{ fontSize: 11, color: 'var(--alice-primary)' }}
              >
                {t('explorerBark.info.terms')} <SvgIcon svg={EXTERNAL_ICON} size={16} />
              </a>
            )}
          </div>
          <FeeSchedule info={info} />
        </div>
      ) : (
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
          <SkeletonLines lines={3} />
        </div>
      )}
    </div>
  );
}

/* --------------------------------- address -------------------------------- */

function AddressDetails({ a, serverLabel }: { a: BarkAddress; serverLabel: string }) {
  const t = useT();
  const mailbox = a.delivery.find(d => d.kind === 'mailbox');
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${BARK_ACCENT}`, borderRadius: 3 }}>
        <div className="flex items-center gap-2"><BarkRoundBadge>{t('explorerBark.address.badge')}</BarkRoundBadge></div>
        <div className="flex items-start gap-2">
          <p className="font-numbers m-0 break-all min-w-0 flex-1" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{a.address}</p>
          <ExplorerCopy value={a.address} label={t('explorerBark.address.copy')} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label={t('explorerBark.address.network')} value={a.testnet ? t('explorerBark.address.testNetwork') : 'Bitcoin'} />
          <Metric
            label={t('explorerBark.info.server')}
            value={serverLabel}
            title={t('explorerBark.address.serverTitle', { id: a.arkId })}
          />
          <Metric label={t('explorerBark.address.spending')} value={a.policy.kind === 'pubkey' ? t('explorerBark.vtxo.policy.pubkey') : t('explorerBark.address.policyType', { type: a.policy.typeByte })} />
          <Metric label={t('explorerBark.address.delivery')} value={mailbox ? t('explorerBark.address.mailbox') : a.delivery.length ? t('explorerBark.address.otherDelivery') : t('explorerBark.address.noDelivery')} />
        </div>
        {a.policy.kind === 'pubkey' && (
          <div className="flex flex-col gap-1">
            <FieldLabel>{t('explorerBark.address.receiverKey')}</FieldLabel>
            <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{a.policy.userPubkey}</span>
          </div>
        )}
        {mailbox && mailbox.kind === 'mailbox' && (
          <div className="flex flex-col gap-1">
            <FieldLabel>{t('explorerBark.address.mailboxRef')}</FieldLabel>
            <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{mailbox.blindedId}</span>
          </div>
        )}
      </div>

      <div
        className="flex flex-col gap-2 px-4 py-3"
        style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${BARK_ACCENT}`, borderRadius: 3 }}
      >
        <Label>{t('explorerBark.address.whyTitle')}</Label>
        <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-text)' }}>
          {t('explorerBark.address.whyLedger')}
        </p>
        <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
          {t('explorerBark.address.whyIndex')}
        </p>
      </div>
    </div>
  );
}

/** The view a Bark address opens: what the address itself says, decoded locally. */
export function ExplorerBarkAddressTab({ serverUrl, address, onSignals }: {
  serverUrl: string;
  address: string;
  /** Hands the page's context to the Ask Alice dock: a LAYER_CONTEXT signal
      (shape only, de-identified) and the full description for identified mode. */
  onSignals?: (signals: PrivacySignal[], full?: FullContext) => void;
}) {
  const t = useT();
  const decoded = useMemo<{ a: BarkAddress } | { error: string }>(() => {
    try {
      return { a: decodeBarkAddress(address) };
    } catch (e) {
      return { error: e instanceof BarkError ? e.message : t('explorerBark.address.decodeError') };
    }
  }, [address, t]);
  const [serverId, setServerId] = useState<string | null>(null);
  const [serverCheckFailed, setServerCheckFailed] = useState(false);

  // Only the server's public parameters are fetched, to tell whether the
  // address was issued for it; the address never leaves the device.
  useEffect(() => {
    const controller = new AbortController();
    setServerId(null); setServerCheckFailed(false);
    getBarkInfo(serverUrl, { signal: controller.signal })
      .then(info => setServerId(arkIdFor(info.serverPubkey)))
      .catch(e => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setServerCheckFailed(true);
      });
    return () => controller.abort();
  }, [serverUrl]);

  // The page's context for Ask Alice: what the address says about itself,
  // again once the server check has named the server.
  const onSignalsRef = useRef(onSignals);
  onSignalsRef.current = onSignals;
  useEffect(() => {
    if ('error' in decoded) return;
    const label = decoded.a.testnet ? 'A test server'
      : serverId !== null ? (serverId === decoded.a.arkId ? 'Second' : 'Another server')
        : serverCheckFailed ? 'Could not check' : 'not checked yet';
    const ctx = barkAddressContext(decoded.a, label);
    onSignalsRef.current?.([ctx.signal], ctx.full);
  }, [decoded, serverId, serverCheckFailed]);

  if ('error' in decoded) {
    return (
      <div className="flex flex-col gap-1 px-4 py-3" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{t('explorerBark.address.invalid')}</span>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{decoded.error}</p>
      </div>
    );
  }
  // A test-network address can never belong to the mainnet server.
  const serverLabel = decoded.a.testnet ? t('explorerBark.server.test')
    : serverId !== null ? (serverId === decoded.a.arkId ? 'Second' : t('explorerBark.server.other'))
      : serverCheckFailed ? t('explorerBark.server.checkFailed') : t('explorerBark.server.checking');
  return <div className="rh-fade-in"><AddressDetails a={decoded.a} serverLabel={serverLabel} /></div>;
}
