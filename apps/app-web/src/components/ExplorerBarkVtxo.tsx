'use client';

// The VTXO tab: the one way into a Bark coin, since Bark servers publish no
// index. The search hands over either the coin's id, which Second's server
// answers without authentication, or the coin's export, decoded on the
// device. The view shows where the coin comes from, when it expires, what
// refreshing it costs now, and its exit path: the tree drawn, with the step
// list as its legend. Like any tab, it lives on this device only.

import { useEffect, useRef, useState } from 'react';
import { BarkError, fetchBarkVtxo, getBarkInfo, type BarkInfo } from '@/lib/explorer/bark';
import {
  arkoorSpends, decodeBarkVtxo, isUserPolicy, parseVtxoInput, vtxoIdBytes, vtxoOrigin,
  type BarkGenesisStep, type BarkSpend, type BarkVtxo, type BarkVtxoPolicy,
} from '@/lib/explorer/bark-vtxo';
import type { ChainDataProvider } from '@/lib/explorer/provider';
import { barkVtxoContext } from '@/lib/explorer/layer-context';
import type { PrivacySignal } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import type { TxStatus } from '@/lib/explorer/types';
import { formatDateTime } from '@/lib/explorer/blocks';
import { Amount } from '@/components/AmountDisplay';
import { ExplorerCopy, FieldLabel, Metric, Skeleton, SkeletonLines } from '@/components/ExplorerUI';
import { BARK_ACCENT, BarkRoundBadge } from '@/components/ExplorerBark';
import { noteSeenBarkRound } from '@/lib/explorer/bark-onchain';
import { BarkExitTree } from '@/components/ExplorerBarkExitTree';

const BLOCKS_PER_DAY = 144;

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{children}</span>;
}

function aboutDays(blocks: number): string {
  const d = Math.round(blocks / BLOCKS_PER_DAY);
  return d < 1 ? 'under a day' : `~${d} day${d === 1 ? '' : 's'}`;
}

const POLICY_LABEL: Record<BarkVtxoPolicy['kind'], string> = {
  'pubkey': 'One key',
  'htlc-send': 'Lightning send in flight',
  'htlc-receive': 'Lightning receive in flight',
  'checkpoint': 'Checkpoint',
  'expiry': 'Server sweep at expiry',
  'hark-leaf': 'Round leaf',
  'hark-forfeit': 'Round forfeit',
  'server-owned': 'Server owned',
};

/** What a server-side output is, for the ones that are not a user's coin. */
const SERVER_SIDE: Partial<Record<BarkVtxoPolicy['kind'], string>> = {
  'expiry': 'a node of a round\u2019s tree, which the server sweeps once it expires',
  'checkpoint': 'a checkpoint between payments made outside a round',
  'hark-leaf': 'a round leaf not yet claimed by its owner',
  'hark-forfeit': 'a round leaf handed back to the server',
  'server-owned': 'an output the server owns',
};

const ORIGIN_LABEL: Record<ReturnType<typeof vtxoOrigin>, string> = {
  round: 'A round',
  board: 'A board',
  onchain: 'On-chain',
  unknown: 'Unknown',
};

function shortKey(k: string): string {
  return `${k.slice(0, 8)}…${k.slice(-6)}`;
}

/** Which part of an arkoor spend a step is: with a checkpoint, the first
 *  transaction (the checkpoint) carries the outputs and the second spends
 *  the holder's checkpoint output on; without one, the single transaction. */
function spendRole(i: number, spends: BarkSpend[]): 'checkpoint' | 'exit' | 'single' | null {
  const sp = spends.find(x => i >= x.from && i <= x.to);
  if (!sp) return null;
  if (sp.from === sp.to) return 'single';
  return i === sp.from ? 'checkpoint' : 'exit';
}

/** In Bark's own words: the inspector at labs.second.tech names the same
 *  steps Cosigned, Hash-locked cosigned and Arkoor (off-chain). */
function stepTitle(s: BarkGenesisStep, i: number, origin: ReturnType<typeof vtxoOrigin>, spends: BarkSpend[]): string {
  if (s.kind === 'hash-locked') return 'Round leaf (hash-locked cosigned), released by the round’s secret';
  if (s.kind === 'arkoor') {
    const role = spendRole(i, spends);
    if (role === 'checkpoint') return 'Arkoor spend, the checkpoint transaction';
    if (role === 'exit') return 'Arkoor spend, the transaction spending the checkpoint';
    return 'Arkoor spend (off-chain), cosigned with the server';
  }
  if (origin === 'board' && i === 0) return 'Board (cosigned), signed by the owner and the server';
  return i === 0 ? 'Round tree, first split (cosigned)' : 'Round tree, next split (cosigned)';
}

function stepDetail(s: BarkGenesisStep, i: number, steps: BarkGenesisStep[], spends: BarkSpend[]): string {
  const parts: string[] = [];
  if (s.kind === 'cosigned') parts.push(`signed together by ${s.signers} keys`);
  if (s.kind === 'arkoor') {
    parts.push(`client cosigner ${s.cosigners.map(shortKey).join(', ')}, plus the server`);
    // The first spend leaves the round's tree: what an arkoor is, and from
    // here only that holder and the server vouch for the coin.
    if (i === 0 || steps[i - 1].kind !== 'arkoor') {
      parts.push('the coin cosigned with the server into a new one: a payment to someone, or a Lightning step (a coin locked by an HTLC swapped for one locked by a key, or the reverse)');
      parts.push('from here, only that holder and the server vouch for the coin; a refresh (a round) brings it back to a leaf');
    }
  }
  if (s.kind === 'hash-locked') parts.push(s.preimageRevealed ? 'secret revealed, the coin as the round created it' : 'secret not yet revealed');
  if (s.siblings.length) {
    const other = s.siblings.reduce((t, o) => t + o.amountSats, 0);
    parts.push(`${s.siblings.length} other branch${s.siblings.length === 1 ? '' : 'es'}, ${other.toLocaleString('en-US')} sats`);
  }
  if (s.feeSats) parts.push(`fee ${s.feeSats.toLocaleString('en-US')} sats`);
  if (!s.signed) parts.push('signature missing');
  return parts.join(' · ');
}

/** The refresh fee that applies with this many blocks left, from the server's tiers. */
function refreshFeeNow(info: BarkInfo, amountSats: number, blocksLeft: number): { ppm: number; sats: number } | null {
  const tiers = info.fees.refresh.tiers;
  if (!tiers.length) return null;
  const tier = [...tiers].reverse().find(t => blocksLeft >= t.fromBlocksLeft) ?? tiers[0];
  return { ppm: tier.ppm, sats: Math.ceil((amountSats * tier.ppm) / 1_000_000) + info.fees.refresh.baseSats };
}

function VtxoCard({ v, source, info, tip, anchor, onOpenTx }: {
  v: BarkVtxo;
  source: 'id' | 'export';
  info: BarkInfo | null;
  tip: number | null;
  /** The anchor transaction's confirmation, the one dated moment of the coin. */
  anchor: TxStatus | null;
  onOpenTx: (txid: string, networkId?: string) => void;
}) {
  const origin = vtxoOrigin(v);
  // The anchor of a round coin, or of a tree root, is the round itself: note
  // it as one, so the transaction view asks the server and shows the round
  // card even on a browser whose walk has not reached it.
  function openAnchor() {
    if (origin === 'round' || (origin === 'onchain' && v.policy.kind === 'expiry')) noteSeenBarkRound(v.anchor.txid);
    onOpenTx(v.anchor.txid, 'mainnet');
  }
  const spends = arkoorSpends(v);
  const hops = spends.length;
  // The step under the pointer, in the tree or in the list: both highlight it.
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const blocksLeft = tip !== null ? v.expiryHeight - tip : null;
  const userCoin = isUserPolicy(v.policy);
  const fee = userCoin && info && blocksLeft !== null && blocksLeft > 0 ? refreshFeeNow(info, v.amountSats, blocksLeft) : null;
  const server = info ? (info.serverPubkey === v.serverPubkey ? 'Second' : 'Another server') : 'checking…';

  return (
    <div className="flex flex-col gap-4 rh-fade-in">
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${BARK_ACCENT}`, borderRadius: 3 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <BarkRoundBadge>BARK VTXO</BarkRoundBadge>
          <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>
            {source === 'export' ? 'decoded on this device' : 'returned by the server for this id'}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <p className="font-numbers m-0 break-all min-w-0 flex-1" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{v.id}</p>
          <ExplorerCopy value={v.id} label="VTXO id" />
        </div>
        {/* The way back to the chain, on its own line under the id so it sits
            at the same place on every width; sized like the badge, under the
            40px floor the controls get elsewhere. */}
        <div className="flex">
          <button
            type="button"
            onClick={openAnchor}
            className="alice-control alice-control--quiet font-pixel tracking-widest cursor-pointer"
            style={{ fontSize: 10, lineHeight: 1, minHeight: 0, padding: '5px 8px', borderRadius: 3, color: 'var(--alice-primary)' }}
            title={`Open the Bitcoin transaction this coin hangs from: ${v.anchor.txid}`}
          >
            {origin === 'round' ? 'OPEN ROUND TX' : origin === 'board' ? 'OPEN BOARD TX' : 'OPEN ANCHOR TX'}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label="AMOUNT" value={<Amount sats={v.amountSats} style={{ fontSize: 15, color: 'var(--alice-text)' }} />} />
          <Metric label="FROM" value={hops ? `${ORIGIN_LABEL[origin]}, then ${hops} arkoor spend${hops === 1 ? '' : 's'}` : ORIGIN_LABEL[origin]} title="Arkoor: an off-chain spend cosigned with the server (a payment, or a Lightning step). With checkpoints, one spend is two transactions." />
          <Metric
            label="EXPIRES"
            value={blocksLeft === null ? `block ${v.expiryHeight.toLocaleString('en-US')}`
              : blocksLeft > 0 ? `in ${blocksLeft.toLocaleString('en-US')} blocks (${aboutDays(blocksLeft)})`
                : 'expired'}
            title={`Block ${v.expiryHeight.toLocaleString('en-US')}. Past it, the server can sweep the coin: refresh it before.`}
          />
          <Metric label="SPENDING" value={POLICY_LABEL[v.policy.kind]} />
          <Metric label="EXIT PATH" value={`${v.genesis.length} tx${v.genesis.length === 1 ? '' : 's'}`} title="Presigned transactions to broadcast to leave without the server." />
          <Metric label="THEN WAIT" value={`${v.exitDeltaBlocks.toLocaleString('en-US')} blocks (${aboutDays(v.exitDeltaBlocks)})`} />
          <Metric label="ARK SERVER" value={server} />
          <Metric
            label="REFRESH NOW"
            value={fee ? `${(fee.ppm / 10_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}%, ~${fee.sats.toLocaleString('en-US')} sats` : '-'}
            title="Per Second's fee schedule: the closer to expiry, the cheaper. Free with under 2 days left."
          />
        </div>
        {!userCoin && (
          <p className="font-numbers m-0 px-3 py-2" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-text)', borderLeft: `3px solid ${BARK_ACCENT}` }}>
            Not a user&rsquo;s coin: an output the server keeps track of,{' '}
            {v.policy.kind === 'expiry' && v.genesis.length === 0
              ? 'the root of a round\u2019s tree, which the server sweeps once it expires'
              : SERVER_SIDE[v.policy.kind] ?? 'with a server-side policy'}.
            It has no refresh or exit of its own.
          </p>
        )}
        <div className="flex flex-col gap-1">
          <FieldLabel>ON-CHAIN ANCHOR</FieldLabel>
          <button
            type="button"
            onClick={openAnchor}
            className="alice-control alice-control--quiet font-numbers text-left break-all cursor-pointer bg-transparent self-start"
            style={{ fontSize: 12, color: 'var(--alice-primary)', padding: '2px 0' }}
            title="Open the Bitcoin transaction this coin hangs from"
          >
            {v.anchor.txid}:{v.anchor.vout}
          </button>
          <span
            className="font-numbers"
            style={{ fontSize: 12, color: 'var(--alice-muted)' }}
            title="The only dated moment of this coin: the presigned steps below never reached the chain and carry no date."
          >
            {anchor === null
              ? 'checking its confirmation…'
              : anchor.confirmed && anchor.blockHeight !== undefined
                ? `Confirmed in block ${anchor.blockHeight.toLocaleString('en-US')}${anchor.blockTime ? ` · ${formatDateTime(anchor.blockTime)}` : ''}`
                : 'Not confirmed yet'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>EXIT PATH</Label>
        <p className="font-numbers m-0" style={{ fontSize: 12, lineHeight: '17px', color: 'var(--alice-muted)' }}>
          The presigned transactions between the anchor and this coin. Broadcast in order, then followed by the wait above,
          they take the coin on-chain without the server. No step carries a date of its own: never broadcast, their
          nLockTime is 0, and all share the coin&rsquo;s expiry height, block {v.expiryHeight.toLocaleString('en-US')}, the same
          from the anchor to this coin; only the anchor has a block date. In the tree, your branch is filled; the other
          outputs lead to other people&rsquo;s coins. The list below details each step.
        </p>
        {v.genesis.length > 0 && (
          <div className="px-2 py-3" style={{ borderTop: '1px solid var(--alice-border)' }}>
            <BarkExitTree v={v} activeStep={activeStep} onActiveStep={setActiveStep} onOpenTx={onOpenTx} />
          </div>
        )}
        <ol className="m-0 p-0 flex flex-col" style={{ listStyle: 'none', borderTop: '1px solid var(--alice-border)' }}>
          {v.genesis.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-3 px-3 py-2"
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
              style={{
                borderTop: i > 0 ? '1px solid var(--alice-border)' : undefined,
                borderLeft: `3px solid ${activeStep === i ? 'var(--alice-primary)' : 'transparent'}`,
                backgroundColor: activeStep === i ? 'var(--alice-hover)' : undefined,
              }}
            >
              <span className="font-numbers shrink-0" style={{ fontSize: 12, color: 'var(--alice-muted)', width: 18, textAlign: 'right' }}>{i + 1}</span>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{stepTitle(s, i, origin, spends)}</span>
                <span className="font-numbers" style={{ fontSize: 11.5, color: 'var(--alice-muted)' }}>{stepDetail(s, i, v.genesis, spends)}</span>
              </div>
            </li>
          ))}
          {v.genesis.length === 0 && (
            <li className="px-3 py-2 font-numbers" style={{ fontSize: 12.5, color: 'var(--alice-muted)' }}>
              No transaction to broadcast: this coin is the on-chain output itself.
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}

type LookupState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; vtxo: BarkVtxo; source: 'id' | 'export' };

/** A VTXO tab: `query` is the coin's id ("txid:vout") or its hex export. */
export function ExplorerBarkVtxoTab({ serverUrl, provider, query, onOpenTx, onSignals }: {
  serverUrl: string;
  /** Bitcoin mainnet, for the current height the expiry is measured against. */
  provider: ChainDataProvider;
  query: string;
  onOpenTx: (txid: string, networkId?: string) => void;
  /** Hands the page's context to the Ask Alice dock: a LAYER_CONTEXT signal
      (shape only, de-identified) and the full description for identified mode. */
  onSignals?: (signals: PrivacySignal[], full?: FullContext) => void;
}) {
  const [state, setState] = useState<LookupState>({ kind: 'loading' });
  const [info, setInfo] = useState<BarkInfo | null>(null);
  const [tip, setTip] = useState<number | null>(null);
  const [anchor, setAnchor] = useState<TxStatus | null>(null);
  // The page's context for Ask Alice: the coin once decoded, again as the
  // server's parameters, the chain tip and the anchor's confirmation come in.
  const onSignalsRef = useRef(onSignals);
  onSignalsRef.current = onSignals;
  useEffect(() => {
    if (state.kind !== 'loaded') return;
    const ctx = barkVtxoContext({ vtxo: state.vtxo, info, tip, anchor });
    onSignalsRef.current?.([ctx.signal], ctx.full);
  }, [state, info, tip, anchor]);

  useEffect(() => {
    const controller = new AbortController();
    const input = parseVtxoInput(query);
    setState({ kind: 'loading' });
    if (!input) {
      setState({ kind: 'error', message: 'Not a VTXO id (txid:vout) nor a VTXO export (hex).' });
      return;
    }
    if (input.kind === 'export') {
      try {
        setState({ kind: 'loaded', vtxo: decodeBarkVtxo(input.data), source: 'export' });
      } catch (e) {
        setState({ kind: 'error', message: e instanceof BarkError ? e.message : 'Could not decode this VTXO.' });
      }
      return;
    }
    fetchBarkVtxo(serverUrl, vtxoIdBytes(input.point), { signal: controller.signal })
      .then(data => setState({ kind: 'loaded', vtxo: decodeBarkVtxo(data), source: 'id' }))
      .catch(e => {
        if (controller.signal.aborted) return;
        const message = e instanceof BarkError && e.status === 5
          ? 'Second\u2019s server does not know this VTXO. Check the id, or search the coin\u2019s export instead.'
          : e instanceof BarkError ? e.message : 'Could not look up this VTXO.';
        setState({ kind: 'error', message });
      });
    return () => controller.abort();
  }, [serverUrl, query]);

  // Only once a coin is on screen: the server's fees and the chain height.
  const loaded = state.kind === 'loaded';
  useEffect(() => {
    if (!loaded) return;
    const controller = new AbortController();
    getBarkInfo(serverUrl, { signal: controller.signal }).then(setInfo).catch(() => {});
    provider.getRecentBlocks?.(undefined, { signal: controller.signal })
      .then(blocks => { if (blocks.length) setTip(Math.max(...blocks.map(b => b.height))); })
      .catch(() => {});
    // The anchor's confirmation: when the round (or board) landed on-chain.
    if (state.kind === 'loaded') {
      provider.getTransaction(state.vtxo.anchor.txid, { signal: controller.signal })
        .then(tx => setAnchor(tx.status))
        .catch(() => {});
    }
    return () => controller.abort();
  }, [loaded, serverUrl, provider, state]);

  return (
    <div className="flex flex-col gap-4">
      {state.kind === 'loading' && (
        <div className="flex flex-col gap-3 px-4 py-3" aria-label="Reading the VTXO" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
          <Skeleton width="60%" />
          <SkeletonLines lines={3} />
        </div>
      )}
      {state.kind === 'error' && (
        <div className="flex flex-col gap-1 px-4 py-3" role="alert" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>COULD NOT LOAD</span>
          <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{state.message}</p>
        </div>
      )}
      {state.kind === 'loaded' && <VtxoCard v={state.vtxo} source={state.source} info={info} tip={tip} anchor={anchor} onOpenTx={onOpenTx} />}
    </div>
  );
}
