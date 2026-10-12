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
function fmtDuration(sec: number): string {
  if (!sec) return '-';
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}m`;
  return `${Math.round(sec / 3600)}h`;
}
/** Blocks as days when they divide evenly (144 a day), raw blocks otherwise. */
function days(blocks: number): string {
  if (blocks % BLOCKS_PER_DAY !== 0) return `${blocks.toLocaleString('en-US')} blocks`;
  const d = blocks / BLOCKS_PER_DAY;
  return `${d} day${d === 1 ? '' : 's'}`;
}
function blocksAndDays(blocks: number): string {
  if (!blocks) return '-';
  return `${blocks.toLocaleString('en-US')} blocks (~${Math.max(1, Math.round(blocks / BLOCKS_PER_DAY))} d)`;
}
function pct(ppm: number): string {
  return `${(ppm / 10_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
}

/** The round marker: the accent filled, the page background as text, so it
 *  inverts with the theme (white on black, black on white). */
export function BarkRoundBadge({ children = 'BARK ROUND' }: { children?: React.ReactNode }) {
  return (
    <span
      className="font-pixel tracking-widest inline-flex items-center shrink-0"
      style={{
        fontSize: 10, lineHeight: 1, padding: '3px 6px', borderRadius: 3,
        border: `1px solid ${BARK_ACCENT}`, color: 'var(--alice-bg)',
        backgroundColor: BARK_ACCENT, whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{children}</span>;
}

/* --------------------------------- rounds --------------------------------- */

function lastEventLine(e: BarkRoundEvent | null): string | null {
  if (!e) return null;
  switch (e.kind) {
    case 'attempt':
    case 'proposal':
      return e.attemptSeq > 0 ? `Round in progress (attempt ${e.attemptSeq + 1}).` : 'Round in progress.';
    case 'finished':
      return 'Last round completed, its round transaction broadcast on Bitcoin.';
    case 'failed':
      return 'Last round closed without a round transaction.';
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
            if (e.kind === 'finished' || e.kind === 'failed') setNextToken(t => t + 1);
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
      .then(t => setNextAt(t > 0 ? t : null))
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
    const id = setTimeout(() => setNextToken(t => t + 1), wait);
    return () => clearTimeout(id);
  }, [nextAt]);

  const status = lastEventLine(last);
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
        <Label>ROUNDS</Label>
        <span className="flex items-center gap-1.5">
          {sync && !catchingUp && sync.tipHeight !== null && (
            <span title="The walk of the server's wallet has reached the live tip: the newest round shown is the newest there is.">
              <Label>UP TO DATE · BLOCK {sync.tipHeight.toLocaleString('en-US')} ·</Label>
            </span>
          )}
          <span style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: live ? 'var(--alice-success)' : 'var(--alice-muted)' }} />
          <Label>{live ? 'LIVE' : 'CONNECTING'}</Label>
        </span>
      </div>
      <div className="flex flex-col gap-1 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)' }}>
        {nextAt !== null && minutesLeft !== null && (
          <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-text)' }}>
            {minutesLeft === 0 ? 'Next round starting now' : `Next round in ${minutesLeft} min`}
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
              Downloading the latest rounds from the Bitcoin chain. The newest shown may not be the newest yet.
            </span>
          </div>
        )}
        {shown.length === 0 ? (
          !catchingUp && (
            <p className="font-numbers m-0 px-3 py-3" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
              Looking for the latest round. A Bark server keeps no public round history: Alice asks it for its
              last round, follows the server&rsquo;s wallet on Bitcoin from there, and listens to the live feed.
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
              title={i === 0 ? 'The latest round found: opens its transaction and the block confirming it' : undefined}
            >
              <div className="flex flex-col min-w-0">
                <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-primary)' }} title={r.txid}>{shortHex(r.txid, 12, 8)}</span>
                <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
                  {r.height !== undefined
                    ? `block ${r.height.toLocaleString('en-US')}${r.timestamp ? ` · ${formatDateTime(r.timestamp)}` : ''}`
                    : 'round transaction broadcast, awaiting confirmation'}
                </span>
              </div>
              <span className="flex items-center gap-2 shrink-0">
                {i === 0 && <Label>LATEST</Label>}
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
          SHOW {Math.min(FEED_STEP, sorted.length - shown.length)} MORE
        </button>
      ) : sync && sorted.length > 0 && !catchingUp && sync.exhausted === null ? (
        <button
          type="button"
          onClick={loadOlder}
          disabled={sync.loadingOlder}
          className="alice-control alice-control--quiet font-numbers self-center cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
          style={{ fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)' }}
          title="Walk the server's wallet further back on Bitcoin, one page of rounds at a time"
        >
          {sync.loadingOlder && <span className="rh-spinner" aria-hidden="true" />}
          {sync.loadingOlder ? 'LOADING OLDER…' : `LOAD ${HISTORY_PAGE} OLDER`}
        </button>
      ) : sync?.exhausted ? (
        <span className="font-numbers self-center text-center" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
          {sync.exhausted === 'origin'
            ? 'Back to the first transaction of the server’s wallet: nothing older.'
            : 'Nothing older found: the server funded this round from transactions the walk cannot cross, or no longer recognises (a round’s tree expires after about four weeks).'}
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
  const blocksLeft = tip !== null ? root.expiryHeight - tip : null;
  const server = arkIdFor(root.serverPubkey) === SECOND_ARK_ID ? 'Second' : 'Another server';
  const expires = blocksLeft === null
    ? `block ${root.expiryHeight.toLocaleString('en-US')}`
    : blocksLeft <= 0
      ? `block ${root.expiryHeight.toLocaleString('en-US')}, expired`
      : `block ${root.expiryHeight.toLocaleString('en-US')}, in ${blocksAndDays(blocksLeft)}`;
  return (
    <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: `3px solid ${BARK_ACCENT}`, borderRadius: 3 }}>
      <div className="flex items-center gap-2 flex-wrap">
        <BarkRoundBadge />
        <span className="font-numbers" style={{ fontSize: 12.5, color: 'var(--alice-text)' }}>
          A round of {server}&rsquo;s Bark server: this is its round transaction.
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
        <Metric label="ROUND TREE" value={<Amount sats={root.amountSats} />} title="The sum of every coin the round created" />
        <Metric label="TREE EXPIRES" value={expires} />
        <Metric label="EXIT DELAY" value={blocksAndDays(root.exitDeltaBlocks)} />
        <Metric label="OUTPUTS" value={`${tx.outputs.length}, the tree root ${root.anchor.vout === 0 ? 'first' : `at #${root.anchor.vout}`}`} />
      </div>
      <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
        Output #{root.anchor.vout} is the root of the round&rsquo;s VTXO tree, the sum of every coin the round
        created. The server keeps the root until the tree expires; until then, each holder can take
        their coin on-chain from it without the server.
      </p>
      {onOpenVtxo && (
        <button
          type="button"
          onClick={() => onOpenVtxo(`${tx.txid}:${root.anchor.vout}`)}
          className="alice-control alice-control--quiet font-numbers self-start cursor-pointer"
          style={{ fontSize: 12.5, padding: '6px 10px', borderRadius: 3, color: 'var(--alice-primary)' }}
        >
          Open the tree root as a VTXO
        </button>
      )}
    </div>
  );
}

/* ------------------------------- server info ------------------------------ */

/** "0% with under 2 days left · 0.2% from 2 days · …" for a tiered fee. */
function tierLine(tiers: FeeTier[]): string {
  return tiers.map((t, i) => {
    const next = tiers[i + 1];
    if (t.fromBlocksLeft === 0 && next) return `${pct(t.ppm)} with under ${days(next.fromBlocksLeft)} left`;
    return `${pct(t.ppm)} from ${days(t.fromBlocksLeft)} left`;
  }).join(' · ');
}

function tierRange(tiers: FeeTier[]): string {
  if (tiers.length === 0) return 'no fee';
  const ppms = tiers.map(t => t.ppm);
  const lo = Math.min(...ppms);
  const hi = Math.max(...ppms);
  return lo === hi ? pct(lo) : `${pct(lo)} to ${pct(hi)}`;
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

function extras(baseSats: number, minSats = 0): string {
  const parts: string[] = [];
  if (baseSats) parts.push(`plus ${baseSats.toLocaleString('en-US')} sats`);
  if (minSats) parts.push(`minimum ${minSats.toLocaleString('en-US')} sats`);
  return parts.join(', ');
}

function FeeSchedule({ info }: { info: BarkInfo }) {
  const f = info.fees;
  const boardFree = !f.board.ppm && !f.board.baseSats && !f.board.minSats;
  const recvFree = !f.lightningReceive.ppm && !f.lightningReceive.baseSats;
  const join = (...xs: string[]) => xs.filter(Boolean).join(' · ');
  return (
    <div className="flex flex-col">
      <Label>FEES</Label>
      <p className="font-numbers m-0 pt-1 pb-2" style={{ fontSize: 11.5, lineHeight: '16px', color: 'var(--alice-muted)' }}>
        Percentages of the amount, set by how long the coin spent still has to live. A coin refreshed close to its expiry costs least.
      </p>
      <FeeRow
        label="BOARD"
        value={boardFree ? 'no server fee' : join(f.board.ppm ? pct(f.board.ppm) : '', extras(f.board.baseSats, f.board.minSats))}
        detail="Moving on-chain bitcoin into Ark. The on-chain mining fee still applies."
      />
      <FeeRow label="REFRESH" value={tierRange(f.refresh.tiers)} detail={join(tierLine(f.refresh.tiers), extras(f.refresh.baseSats))} />
      <FeeRow label="OFFBOARD" value={tierRange(f.offboard.tiers)} detail={join(tierLine(f.offboard.tiers), extras(f.offboard.baseSats), 'plus the on-chain fee')} />
      <FeeRow
        label="LIGHTNING SEND"
        value={tierRange(f.lightningSend.tiers)}
        detail={join(tierLine(f.lightningSend.tiers), extras(f.lightningSend.baseSats, f.lightningSend.minSats))}
      />
      <FeeRow
        label="LIGHTNING RECEIVE"
        value={recvFree ? 'no server fee' : join(f.lightningReceive.ppm ? pct(f.lightningReceive.ppm) : '', extras(f.lightningReceive.baseSats))}
      />
    </div>
  );
}

/** The server's advertised parameters and fees, as a section of the Bark overview. */
export function BarkServerInfo({ serverUrl }: { serverUrl: string }) {
  const [info, setInfo] = useState<BarkInfo | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setInfo(null); setErr('');
    getBarkInfo(serverUrl, { signal: controller.signal })
      .then(setInfo)
      .catch(e => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setErr(e instanceof BarkError ? e.message : 'Could not reach the Bark server.');
      });
    return () => controller.abort();
  }, [serverUrl]);

  const host = serverUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return (
    <div className="flex flex-col gap-2">
      <Label>ARK SERVER</Label>
      {err ? (
        <div className="flex flex-col gap-1 px-4 py-3" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>SERVER UNREACHABLE</span>
          <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{err}</p>
        </div>
      ) : info ? (
        <div className="flex flex-col gap-4 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${BARK_ACCENT}`, borderRadius: 3 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
            <Metric label="ROUND EVERY" value={fmtDuration(info.roundIntervalSec)} />
            <Metric label="VTXO LIFETIME" value={blocksAndDays(info.vtxoLifetimeBlocks)} title="How long a coin lives before it must be refreshed. Past it, the server can sweep it." />
            <Metric label="EXIT DELAY" value={blocksAndDays(info.exitDeltaBlocks)} title="The wait on each step of a unilateral exit, the way out without the server." />
            <Metric label="VTXO MAX" value={info.maxVtxoSats !== undefined ? <Amount sats={info.maxVtxoSats} style={{ fontSize: 13, color: 'var(--alice-text)' }} /> : 'no limit'} />
            <Metric label="MIN BOARD" value={<Amount sats={info.minBoardSats} style={{ fontSize: 13, color: 'var(--alice-text)' }} />} />
            <Metric label="BOARD CONFS" value={info.boardConfirmations.toLocaleString('en-US')} title="Confirmations an on-chain deposit needs before it becomes a VTXO." />
            <Metric label="MAX EXIT DEPTH" value={info.maxExitDepth ? `${info.maxExitDepth} txs` : '-'} title="The most transactions a coin's exit path may take." />
            <Metric label="SETTLES ON" value={info.network || '-'} />
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel>SERVER PUBKEY</FieldLabel>
            <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{info.serverPubkey || '-'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>Operated by Second · {host}</span>
            {info.tosLink && /^https:\/\//.test(info.tosLink) && (
              <a
                href={info.tosLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => { e.preventDefault(); void openExternalUrl(info.tosLink!); }}
                className="alice-control alice-control--quiet inline-flex font-numbers"
                style={{ fontSize: 11, color: 'var(--alice-primary)' }}
              >
                Terms of service <SvgIcon svg={EXTERNAL_ICON} size={16} />
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
  const mailbox = a.delivery.find(d => d.kind === 'mailbox');
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${BARK_ACCENT}`, borderRadius: 3 }}>
        <div className="flex items-center gap-2"><BarkRoundBadge>BARK ADDRESS</BarkRoundBadge></div>
        <div className="flex items-start gap-2">
          <p className="font-numbers m-0 break-all min-w-0 flex-1" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{a.address}</p>
          <ExplorerCopy value={a.address} label="address" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label="NETWORK" value={a.testnet ? 'Test network' : 'Bitcoin'} />
          <Metric
            label="ARK SERVER"
            value={serverLabel}
            title={`Server id ${a.arkId}: the first 4 bytes of the hash of the server's public key.`}
          />
          <Metric label="SPENDING" value={a.policy.kind === 'pubkey' ? 'One key' : `Policy type ${a.policy.typeByte}`} />
          <Metric label="DELIVERY" value={mailbox ? 'Server mailbox' : a.delivery.length ? 'Other' : 'None given'} />
        </div>
        {a.policy.kind === 'pubkey' && (
          <div className="flex flex-col gap-1">
            <FieldLabel>RECEIVER PUBLIC KEY</FieldLabel>
            <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{a.policy.userPubkey}</span>
          </div>
        )}
        {mailbox && mailbox.kind === 'mailbox' && (
          <div className="flex flex-col gap-1">
            <FieldLabel>MAILBOX REFERENCE, BLINDED</FieldLabel>
            <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{mailbox.blindedId}</span>
          </div>
        )}
      </div>

      <div
        className="flex flex-col gap-2 px-4 py-3"
        style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${BARK_ACCENT}`, borderRadius: 3 }}
      >
        <Label>WHY NO BALANCE OR HISTORY</Label>
        <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-text)' }}>
          A Bark address is not an account on a public ledger. A payment to it reaches the receiver&rsquo;s wallet through
          the server&rsquo;s mailbox, and the mailbox reference above is blinded, so the address does not reveal which
          mailbox it is. Reading that mailbox takes a signature from the wallet&rsquo;s own key.
        </p>
        <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
          Bark servers publish no index of addresses or coins, by design: each holder keeps the data of their own coins
          and decides who sees it. This address was decoded on your device and sent to no server.
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
  const decoded = useMemo<{ a: BarkAddress } | { error: string }>(() => {
    try {
      return { a: decodeBarkAddress(address) };
    } catch (e) {
      return { error: e instanceof BarkError ? e.message : 'Could not decode this Bark address.' };
    }
  }, [address]);
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
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>NOT A VALID BARK ADDRESS</span>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{decoded.error}</p>
      </div>
    );
  }
  // A test-network address can never belong to the mainnet server.
  const serverLabel = decoded.a.testnet ? 'A test server'
    : serverId !== null ? (serverId === decoded.a.arkId ? 'Second' : 'Another server')
      : serverCheckFailed ? 'Could not check' : 'checking…';
  return <div className="rh-fade-in"><AddressDetails a={decoded.a} serverLabel={serverLabel} /></div>;
}
