'use client';

// The VTXO tab of the Arkade network: a coin by its "txid:vout", with its
// state from the operator's indexer and its exit tree drawn by the funnel
// (ExitFunnel) from the chain the indexer publishes: the commitment
// transaction, the batch's tree transactions down to the leaf, then the
// checkpoint and Ark transactions of each spend made since. The legend list
// under the tree details each transaction, in Arkade's words.

import { useEffect, useRef, useState } from 'react';
import { ArkadeError, arkadeAddressOf, arkadeStateOf, formatArkadeExitDelay, getArkadeInfo, getArkadeVtxo, type ArkadeInfo, type ArkadeVtxo } from '@/lib/explorer/arkade';
import { arkadeSpends, loadArkadeExitPath, type ArkadeExitPath, type ArkadeExitStep } from '@/lib/explorer/arkade-exit';
import { pickExpiry, readExpiry } from '@/lib/explorer/arkade-expiry';
import { noteSeenSettlement } from '@/lib/explorer/arkade-onchain';
import { arkadeVtxoContext } from '@/lib/explorer/layer-context';
import type { PrivacySignal } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import { formatDateTime } from '@/lib/explorer/blocks';
import { Amount } from '@/components/AmountDisplay';
import { ExplorerCopy, FieldLabel, Metric, SectionTitle, Skeleton, SkeletonLines } from '@/components/ExplorerUI';
import { ARKADE_ACCENT, SettlementBadge } from '@/components/ExplorerArkade';
import { ExitFunnel, type FunnelModel, type FunnelStep } from '@/components/ExitFunnel';
import { formatLocale, type Translator, useT } from '@/i18n';

function shortHex(s: string, head = 10, tail = 8): string {
  return s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;
}

function stateLabel(v: ArkadeVtxo, t: Translator): string {
  const s = arkadeStateOf(v);
  return s === 'spent' ? t('explorerArk.coin.state.spent')
    : s === 'swept' ? t('explorerArk.coin.state.swept')
      : s === 'preconfirmed' ? t('explorerArk.coin.state.preconfirmed') : t('explorerArk.coin.state.settled');
}

/** The funnel model of an Arkade coin, in Arkade's words. */
export function arkadeFunnelModel(path: ArkadeExitPath, coinSats: number, exitDelay: number | null, onOpenTx: (txid: string) => void, t: Translator): FunnelModel {
  const spends = arkadeSpends(path);
  const lastTree = path.steps.map(s => s.type).lastIndexOf('tree');
  const rows: FunnelStep[] = [];
  for (let i = 0; i < path.steps.length; i++) {
    const s = path.steps[i];
    const spend = spends.find(x => x.from === i);
    if (spend) {
      // The Ark transaction carries the outputs; a checkpoint before it only
      // passes the coin to it.
      const carrier = path.steps[spend.to];
      rows.push({ from: spend.from, to: spend.to, label: t('explorerArk.coin.funnel.arkTx'), kind: 'spend', outputs: carrier.outputs, branchSats: carrier.branchSats });
      i = spend.to;
      continue;
    }
    rows.push({ from: i, to: i, label: i === lastTree ? t('explorerArk.coin.funnel.leaf') : t('explorerArk.coin.funnel.split'), kind: 'tree', outputs: s.outputs, branchSats: s.branchSats });
  }
  return {
    accent: ARKADE_ACCENT,
    onAccent: '#ffffff',
    anchor: {
      amountSats: path.anchorSats,
      title: t('explorerArk.coin.funnel.anchor'),
      detail: t('explorerArk.coin.funnel.anchorDetail', { vout: path.batchVout, amount: path.anchorSats.toLocaleString(formatLocale()) }),
      id: `${shortHex(path.commitmentTxid, 8, 6)}:${path.batchVout}`,
      onOpen: () => { noteSeenSettlement(path.commitmentTxid); onOpenTx(path.commitmentTxid); },
    },
    steps: rows,
    zone: { title: t('explorerArk.coin.funnel.zoneTitle'), caption: t('explorerArk.coin.funnel.zoneCaption') },
    foldLabel: (spends, txs) => t('explorerArk.coin.funnel.fold', { spends, txs }),
    coin: { amountSats: coinSats, caption: t('explorerArk.coin.funnel.coin') },
    wait: exitDelay !== null ? t('explorerArk.coin.funnel.wait', { delay: formatArkadeExitDelay(exitDelay, t.locale) }) : t('explorerArk.coin.funnel.waitUnknown'),
  };
}

function stepTitle(s: ArkadeExitStep, i: number, path: ArkadeExitPath, t: Translator): string {
  if (s.type === 'tree') {
    const lastTree = path.steps.map(x => x.type).lastIndexOf('tree');
    return i === lastTree ? t('explorerArk.coin.step.leaf') : i === 0 ? t('explorerArk.coin.step.firstSplit') : t('explorerArk.coin.step.nextSplit');
  }
  if (s.type === 'checkpoint') return t('explorerArk.coin.step.checkpoint');
  return t('explorerArk.coin.step.ark');
}

function stepDetail(s: ArkadeExitStep, i: number, path: ArkadeExitPath, t: Translator): string {
  const parts: string[] = [shortHex(s.txid, 10, 6)];
  if (s.type === 'checkpoint') parts.push(t('explorerArk.coin.detail.checkpoint'));
  if (s.type === 'ark') {
    parts.push(t('explorerArk.coin.detail.ark'));
    const first = path.steps.findIndex(x => x.type !== 'tree');
    if (i === first || (i === first + 1 && path.steps[first].type === 'checkpoint')) parts.push(t('explorerArk.coin.detail.preconfirmed'));
  }
  const others = s.outputs.filter(o => !o.ours);
  if (others.length) {
    const total = others.reduce((sum, o) => sum + o.amountSats, 0);
    parts.push(t.plural('explorerArk.coin.detail.others', others.length, { sats: total.toLocaleString(formatLocale()) }));
  }
  const exp = readExpiry(s);
  if (exp.kind === 'date') parts.push(t('explorerArk.coin.detail.expires', { date: formatDateTime(exp.sec) }));
  else if (exp.kind === 'block') parts.push(t('explorerArk.coin.detail.expiresBlock', { height: exp.height.toLocaleString(formatLocale()) }));
  return parts.join(' · ');
}

type TabState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; vtxo: ArkadeVtxo | null; path: ArkadeExitPath };

/** An Arkade VTXO tab: `query` is the coin's "txid:vout". */
export function ExplorerArkadeVtxoTab({ apiBaseUrl, query, onOpenTx, onOpenAddress, onSignals }: {
  apiBaseUrl: string;
  query: string;
  onOpenTx: (txid: string, networkId?: string) => void;
  /** Opens the Arkade address holding the coin. */
  onOpenAddress?: (address: string) => void;
  /** Hands the page's context to the Ask Alice dock: a LAYER_CONTEXT signal
      (shape only, de-identified) and the full description for identified mode. */
  onSignals?: (signals: PrivacySignal[], full?: FullContext) => void;
}) {
  const t = useT();
  const [state, setState] = useState<TabState>({ kind: 'loading' });
  const [info, setInfo] = useState<ArkadeInfo | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  // The page's context for Ask Alice: the coin and its exit path once read,
  // again when the operator's parameters (the exit delay) come in.
  const onSignalsRef = useRef(onSignals);
  onSignalsRef.current = onSignals;
  useEffect(() => {
    if (state.kind !== 'loaded') return;
    const held = state.vtxo?.scriptHex && info ? arkadeAddressOf(state.vtxo.scriptHex, info.signerPubkey, info.network) : null;
    const ctx = arkadeVtxoContext({ id: query.trim().toLowerCase(), vtxo: state.vtxo, path: state.path, info, address: held });
    onSignalsRef.current?.([ctx.signal], ctx.full);
  }, [state, info, query]);

  useEffect(() => {
    const controller = new AbortController();
    const m = /^([0-9a-f]{64}):(\d{1,10})$/i.exec(query.trim());
    setState({ kind: 'loading' });
    if (!m) { setState({ kind: 'error', message: t('explorerArk.coin.error.notId') }); return; }
    const txid = m[1].toLowerCase();
    const vout = Number(m[2]);
    (async () => {
      try {
        const [vtxo, path] = await Promise.all([
          getArkadeVtxo(apiBaseUrl, txid, vout, { signal: controller.signal }).catch(() => null),
          loadArkadeExitPath(apiBaseUrl, txid, vout, { signal: controller.signal }),
        ]);
        if (!controller.signal.aborted) setState({ kind: 'loaded', vtxo, path });
      } catch (e) {
        if (controller.signal.aborted) return;
        setState({ kind: 'error', message: e instanceof ArkadeError ? e.message : t('explorerArk.coin.error.load') });
      }
    })();
    getArkadeInfo(apiBaseUrl, { signal: controller.signal }).then(setInfo).catch(() => {});
    return () => controller.abort();
  }, [apiBaseUrl, query]);

  if (state.kind === 'loading') {
    return (
      <div className="flex flex-col gap-3 px-4 py-3" aria-label={t('explorerArk.coin.reading')} style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
        <Skeleton width="60%" />
        <SkeletonLines lines={3} />
      </div>
    );
  }
  if (state.kind === 'error') {
    return (
      <div className="flex flex-col gap-1 px-4 py-3" role="alert" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{t('explorerArk.coin.couldNotLoad')}</span>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{state.message}</p>
      </div>
    );
  }

  const { vtxo, path } = state;
  const coinSats = vtxo?.amountSats ?? path.steps[path.steps.length - 1].branchSats;
  const exitDelay = info ? info.unilateralExitDelay : null;
  // The coin's expiry, or else the last step's, taken whole (no date of one
  // source with the height of the other); unknown is labelled explicitly.
  const expiry = readExpiry(pickExpiry(vtxo, path.steps[path.steps.length - 1]));
  const expiryValue = expiry.kind === 'date' ? formatDateTime(expiry.sec)
    : expiry.kind === 'block' ? t('explorerArk.expiry.block', { height: expiry.height.toLocaleString(formatLocale()) })
      : t('explorerArk.expiry.unknown');
  const spends = arkadeSpends(path).length;
  const model = arkadeFunnelModel(path, coinSats, exitDelay, onOpenTx, t);
  // The address holding the coin: its script with the operator's key.
  const address = vtxo?.scriptHex && info ? arkadeAddressOf(vtxo.scriptHex, info.signerPubkey, info.network) : null;

  return (
    <div className="flex flex-col gap-4 rh-fade-in">
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${ARKADE_ACCENT}`, borderRadius: 3 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <SettlementBadge>{t('explorerArk.coin.badge')}</SettlementBadge>
          <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>
            {vtxo ? t('explorerArk.coin.source.indexer') : t('explorerArk.coin.source.chainOnly')}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <p className="font-numbers m-0 break-all min-w-0 flex-1" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{query}</p>
          <ExplorerCopy value={query} label={t('explorerArk.coin.copyId')} />
        </div>
        {/* The way back to the chain, on its own line under the id so it sits
            at the same place on every width; sized like the badge, under the
            40px floor the controls get elsewhere. */}
        <div className="flex">
          <button
            type="button"
            onClick={() => { noteSeenSettlement(path.commitmentTxid); onOpenTx(path.commitmentTxid); }}
            className="alice-control alice-control--quiet font-pixel tracking-widest cursor-pointer"
            style={{ fontSize: 10, lineHeight: 1, minHeight: 0, padding: '5px 8px', borderRadius: 3, color: 'var(--alice-primary)' }}
            title={t('explorerArk.coin.openCommitmentTitle', { txid: path.commitmentTxid })}
          >
            {t('explorerArk.coin.openCommitment')}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label={t('explorerArk.coin.metric.amount')} value={<Amount sats={coinSats} style={{ fontSize: 15, color: 'var(--alice-text)' }} />} />
          <Metric label={t('explorerArk.coin.metric.state')} value={vtxo ? stateLabel(vtxo, t) : '-'} title={t('explorerArk.coin.stateTitle')} />
          <Metric
            label={t('explorerArk.coin.metric.expires')}
            value={expiryValue}
            title={t('explorerArk.coin.expiresTitle')}
          />
          <Metric label={t('explorerArk.coin.metric.from')} value={spends ? t.plural('explorerArk.coin.from.spends', spends) : t('explorerArk.coin.from.batch')} title={t('explorerArk.coin.fromTitle')} />
          <Metric label={t('explorerArk.coin.metric.exitPath')} value={t.plural('explorerArk.coin.exitTxs', path.steps.length)} title={t('explorerArk.coin.exitPathTitle')} />
          <Metric label={t('explorerArk.coin.metric.thenWait')} value={exitDelay !== null ? formatArkadeExitDelay(exitDelay, t.locale) : '-'} title={t('explorerArk.coin.thenWaitTitle')} />
          <Metric label={t('explorerArk.coin.metric.operator')} value="Arkade" />
          {vtxo?.createdAt && <Metric label={t('explorerArk.coin.metric.created')} value={formatDateTime(vtxo.createdAt)} />}
        </div>
        {address && (
          <div className="flex flex-col gap-1">
            <FieldLabel>{t('explorerArk.coin.address')}</FieldLabel>
            {onOpenAddress ? (
              <button
                type="button"
                onClick={() => onOpenAddress(address)}
                className="alice-control alice-control--quiet font-numbers text-left break-all cursor-pointer bg-transparent self-start"
                style={{ fontSize: 12, color: 'var(--alice-primary)', padding: '2px 0' }}
                title={t('explorerArk.coin.openAddressTitle')}
              >
                {address}
              </button>
            ) : (
              <span className="font-numbers break-all" style={{ fontSize: 12, color: 'var(--alice-text)' }}>{address}</span>
            )}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <FieldLabel>{t('explorerArk.coin.commitmentLabel')}</FieldLabel>
          <button
            type="button"
            onClick={() => { noteSeenSettlement(path.commitmentTxid); onOpenTx(path.commitmentTxid); }}
            className="alice-control alice-control--quiet font-numbers text-left break-all cursor-pointer bg-transparent self-start"
            style={{ fontSize: 12, color: 'var(--alice-primary)', padding: '2px 0' }}
            title={t('explorerArk.coin.openAnchorTitle')}
          >
            {path.commitmentTxid}:{path.batchVout}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionTitle>{t('explorerArk.coin.exitTree')}</SectionTitle>
        <p className="font-numbers m-0" style={{ fontSize: 12, lineHeight: '17px', color: 'var(--alice-muted)' }}>
          {t('explorerArk.coin.exitTreeIntro')}
        </p>
        <div className="px-2 py-3" style={{ borderTop: '1px solid var(--alice-border)' }}>
          <ExitFunnel model={model} activeStep={activeStep} onActiveStep={setActiveStep} />
        </div>
        <ol className="m-0 p-0 flex flex-col" style={{ listStyle: 'none', borderTop: '1px solid var(--alice-border)' }}>
          {path.steps.map((s, i) => (
            <li
              key={s.txid}
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
                <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{stepTitle(s, i, path, t)}</span>
                <span className="font-numbers" style={{ fontSize: 11.5, color: 'var(--alice-muted)' }}>{stepDetail(s, i, path, t)}</span>
              </div>
              <button
                type="button"
                onClick={() => onOpenTx(s.txid)}
                className="alice-control alice-control--quiet font-numbers cursor-pointer bg-transparent shrink-0"
                style={{ fontSize: 11, padding: '3px 8px', borderRadius: 3, color: 'var(--alice-primary)' }}
                title={t('explorerArk.coin.openTxTitle')}
              >
                {t('explorerArk.coin.open')}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
