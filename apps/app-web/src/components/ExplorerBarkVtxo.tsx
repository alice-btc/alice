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
import { formatLocale, type MessageKey, type Translator, useT } from '@/i18n';

const BLOCKS_PER_DAY = 144;

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{children}</span>;
}

function aboutDays(blocks: number, t: Translator): string {
  const d = Math.round(blocks / BLOCKS_PER_DAY);
  return d < 1 ? t('explorerBark.vtxo.underADay') : t.plural('explorerBark.vtxo.aboutDays', d);
}

const POLICY_LABEL: Record<BarkVtxoPolicy['kind'], MessageKey> = {
  'pubkey': 'explorerBark.vtxo.policy.pubkey',
  'htlc-send': 'explorerBark.vtxo.policy.htlcSend',
  'htlc-receive': 'explorerBark.vtxo.policy.htlcReceive',
  'checkpoint': 'explorerBark.vtxo.policy.checkpoint',
  'expiry': 'explorerBark.vtxo.policy.expiry',
  'hark-leaf': 'explorerBark.vtxo.policy.harkLeaf',
  'hark-forfeit': 'explorerBark.vtxo.policy.harkForfeit',
  'server-owned': 'explorerBark.vtxo.policy.serverOwned',
};

/** What a server-side output is, for the ones that are not a user's coin. */
const SERVER_SIDE: Partial<Record<BarkVtxoPolicy['kind'], MessageKey>> = {
  'expiry': 'explorerBark.vtxo.serverSide.expiry',
  'checkpoint': 'explorerBark.vtxo.serverSide.checkpoint',
  'hark-leaf': 'explorerBark.vtxo.serverSide.harkLeaf',
  'hark-forfeit': 'explorerBark.vtxo.serverSide.harkForfeit',
  'server-owned': 'explorerBark.vtxo.serverSide.serverOwned',
};

const ORIGIN_LABEL: Record<ReturnType<typeof vtxoOrigin>, MessageKey> = {
  round: 'explorerBark.vtxo.origin.round',
  board: 'explorerBark.vtxo.origin.board',
  onchain: 'explorerBark.vtxo.origin.onchain',
  unknown: 'explorerBark.vtxo.origin.unknown',
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
function stepTitle(s: BarkGenesisStep, i: number, origin: ReturnType<typeof vtxoOrigin>, spends: BarkSpend[], t: Translator): string {
  if (s.kind === 'hash-locked') return t('explorerBark.vtxo.step.leaf');
  if (s.kind === 'arkoor') {
    const role = spendRole(i, spends);
    if (role === 'checkpoint') return t('explorerBark.vtxo.step.checkpoint');
    if (role === 'exit') return t('explorerBark.vtxo.step.exit');
    return t('explorerBark.vtxo.step.arkoor');
  }
  if (origin === 'board' && i === 0) return t('explorerBark.vtxo.step.board');
  return i === 0 ? t('explorerBark.vtxo.step.firstSplit') : t('explorerBark.vtxo.step.nextSplit');
}

function stepDetail(s: BarkGenesisStep, i: number, steps: BarkGenesisStep[], t: Translator): string {
  const parts: string[] = [];
  if (s.kind === 'cosigned') parts.push(t('explorerBark.vtxo.detail.signers', { count: s.signers }));
  if (s.kind === 'arkoor') {
    parts.push(t('explorerBark.vtxo.detail.cosigner', { keys: s.cosigners.map(shortKey).join(', ') }));
    // The first spend leaves the round's tree: what an arkoor is, and from
    // here only that holder and the server vouch for the coin.
    if (i === 0 || steps[i - 1].kind !== 'arkoor') {
      parts.push(t('explorerBark.vtxo.detail.arkoorWhat'));
      parts.push(t('explorerBark.vtxo.detail.arkoorTrust'));
    }
  }
  if (s.kind === 'hash-locked') parts.push(s.preimageRevealed ? t('explorerBark.vtxo.detail.secretRevealed') : t('explorerBark.vtxo.detail.secretHidden'));
  if (s.siblings.length) {
    const other = s.siblings.reduce((t, o) => t + o.amountSats, 0);
    parts.push(t.plural('explorerBark.vtxo.detail.siblings', s.siblings.length, { sats: other.toLocaleString(formatLocale()) }));
  }
  if (s.feeSats) parts.push(t('explorerBark.vtxo.detail.fee', { sats: s.feeSats.toLocaleString(formatLocale()) }));
  if (!s.signed) parts.push(t('explorerBark.vtxo.detail.unsigned'));
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
  const t = useT();
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
  const server = info ? (info.serverPubkey === v.serverPubkey ? 'Second' : t('explorerBark.vtxo.server.other')) : t('explorerBark.vtxo.server.checking');

  return (
    <div className="flex flex-col gap-4 rh-fade-in">
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${BARK_ACCENT}`, borderRadius: 3 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <BarkRoundBadge>BARK VTXO</BarkRoundBadge>
          <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>
            {source === 'export' ? t('explorerBark.vtxo.source.export') : t('explorerBark.vtxo.source.id')}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <p className="font-numbers m-0 break-all min-w-0 flex-1" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{v.id}</p>
          <ExplorerCopy value={v.id} label={t('explorerBark.vtxo.copyId')} />
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
            title={t('explorerBark.vtxo.openAnchorTitle', { txid: v.anchor.txid })}
          >
            {origin === 'round' ? t('explorerBark.vtxo.openRound') : origin === 'board' ? t('explorerBark.vtxo.openBoard') : t('explorerBark.vtxo.openAnchor')}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label={t('explorerBark.vtxo.metric.amount')} value={<Amount sats={v.amountSats} style={{ fontSize: 15, color: 'var(--alice-text)' }} />} />
          <Metric label={t('explorerBark.vtxo.metric.from')} value={hops ? t.plural('explorerBark.vtxo.fromHops', hops, { origin: t(ORIGIN_LABEL[origin]) }) : t(ORIGIN_LABEL[origin])} title={t('explorerBark.vtxo.fromTitle')} />
          <Metric
            label={t('explorerBark.vtxo.metric.expires')}
            value={blocksLeft === null ? t('explorerBark.vtxo.expiresBlock', { height: v.expiryHeight.toLocaleString(formatLocale()) })
              : blocksLeft > 0 ? t('explorerBark.vtxo.expiresIn', { blocks: blocksLeft.toLocaleString(formatLocale()), about: aboutDays(blocksLeft, t) })
                : t('explorerBark.vtxo.expired')}
            title={t('explorerBark.vtxo.expiresTitle', { height: v.expiryHeight.toLocaleString(formatLocale()) })}
          />
          <Metric label={t('explorerBark.vtxo.metric.spending')} value={t(POLICY_LABEL[v.policy.kind])} />
          <Metric label={t('explorerBark.vtxo.metric.exitPath')} value={t.plural('explorerBark.vtxo.exitTxs', v.genesis.length)} title={t('explorerBark.vtxo.exitPathTitle')} />
          <Metric label={t('explorerBark.vtxo.metric.thenWait')} value={t('explorerBark.vtxo.blocksAbout', { blocks: v.exitDeltaBlocks.toLocaleString(formatLocale()), about: aboutDays(v.exitDeltaBlocks, t) })} />
          <Metric label={t('explorerBark.vtxo.metric.server')} value={server} />
          <Metric
            label={t('explorerBark.vtxo.metric.refresh')}
            value={fee ? t('explorerBark.vtxo.refreshFee', { percent: (fee.ppm / 10_000).toLocaleString(formatLocale(), { maximumFractionDigits: 2 }), sats: fee.sats.toLocaleString(formatLocale()) }) : '-'}
            title={t('explorerBark.vtxo.refreshTitle')}
          />
        </div>
        {!userCoin && (
          <p className="font-numbers m-0 px-3 py-2" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-text)', borderLeft: `3px solid ${BARK_ACCENT}` }}>
            {t('explorerBark.vtxo.notUserCoin', {
              what: v.policy.kind === 'expiry' && v.genesis.length === 0
                ? t('explorerBark.vtxo.serverSide.root')
                : t(SERVER_SIDE[v.policy.kind] ?? 'explorerBark.vtxo.serverSide.other'),
            })}
          </p>
        )}
        <div className="flex flex-col gap-1">
          <FieldLabel>{t('explorerBark.vtxo.anchorLabel')}</FieldLabel>
          <button
            type="button"
            onClick={openAnchor}
            className="alice-control alice-control--quiet font-numbers text-left break-all cursor-pointer bg-transparent self-start"
            style={{ fontSize: 12, color: 'var(--alice-primary)', padding: '2px 0' }}
            title={t('explorerBark.vtxo.openAnchorPlain')}
          >
            {v.anchor.txid}:{v.anchor.vout}
          </button>
          <span
            className="font-numbers"
            style={{ fontSize: 12, color: 'var(--alice-muted)' }}
            title={t('explorerBark.vtxo.anchorDatedTitle')}
          >
            {anchor === null
              ? t('explorerBark.vtxo.checkingConfirmation')
              : anchor.confirmed && anchor.blockHeight !== undefined
                ? `${t('explorerBark.vtxo.confirmedIn', { height: anchor.blockHeight.toLocaleString(formatLocale()) })}${anchor.blockTime ? ` · ${formatDateTime(anchor.blockTime)}` : ''}`
                : t('explorerBark.vtxo.notConfirmed')}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t('explorerBark.vtxo.metric.exitPath')}</Label>
        <p className="font-numbers m-0" style={{ fontSize: 12, lineHeight: '17px', color: 'var(--alice-muted)' }}>
          {t('explorerBark.vtxo.exitPathIntro', { height: v.expiryHeight.toLocaleString(formatLocale()) })}
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
                <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{stepTitle(s, i, origin, spends, t)}</span>
                <span className="font-numbers" style={{ fontSize: 11.5, color: 'var(--alice-muted)' }}>{stepDetail(s, i, v.genesis, t)}</span>
              </div>
            </li>
          ))}
          {v.genesis.length === 0 && (
            <li className="px-3 py-2 font-numbers" style={{ fontSize: 12.5, color: 'var(--alice-muted)' }}>
              {t('explorerBark.vtxo.noExitTx')}
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
  const t = useT();
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
      setState({ kind: 'error', message: t('explorerBark.vtxo.error.notInput') });
      return;
    }
    if (input.kind === 'export') {
      try {
        setState({ kind: 'loaded', vtxo: decodeBarkVtxo(input.data), source: 'export' });
      } catch (e) {
        setState({ kind: 'error', message: e instanceof BarkError ? e.message : t('explorerBark.vtxo.error.decode') });
      }
      return;
    }
    fetchBarkVtxo(serverUrl, vtxoIdBytes(input.point), { signal: controller.signal })
      .then(data => setState({ kind: 'loaded', vtxo: decodeBarkVtxo(data), source: 'id' }))
      .catch(e => {
        if (controller.signal.aborted) return;
        const message = e instanceof BarkError && e.status === 5
          ? t('explorerBark.vtxo.error.unknown')
          : e instanceof BarkError ? e.message : t('explorerBark.vtxo.error.lookup');
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
        <div className="flex flex-col gap-3 px-4 py-3" aria-label={t('explorerBark.vtxo.reading')} style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
          <Skeleton width="60%" />
          <SkeletonLines lines={3} />
        </div>
      )}
      {state.kind === 'error' && (
        <div className="flex flex-col gap-1 px-4 py-3" role="alert" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{t('explorerBark.vtxo.couldNotLoad')}</span>
          <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{state.message}</p>
        </div>
      )}
      {state.kind === 'loaded' && <VtxoCard v={state.vtxo} source={state.source} info={info} tip={tip} anchor={anchor} onOpenTx={onOpenTx} />}
    </div>
  );
}
