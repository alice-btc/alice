'use client';

// The leaf tab of the Spark network: a coin by its id, with its state from
// the operators and its exit tree drawn by the funnel (ExitFunnel) from the
// nodes the operators serve: the on-chain deposit at the top, the splits
// down to the leaf, then the refund transaction paying the owner. The legend
// under the tree details each transaction, in Spark's words, with the
// relative timelock it waits.

import { useEffect, useRef, useState } from 'react';
import {
  formatSparkBlocks, getSparkLeafChain, sparkAddressOf, sparkLeafStatusLabel, SparkError, type SparkLeaf,
} from '@/lib/explorer/spark';
import { buildSparkExitPath, type SparkExitPath, type SparkExitStep } from '@/lib/explorer/spark-exit';
import { noteSparkDeposit } from '@/lib/explorer/spark-onchain';
import { sparkLeafContext } from '@/lib/explorer/layer-context';
import type { PrivacySignal } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import type { ChainDataProvider } from '@/lib/explorer/provider';
import { formatDateTime } from '@/lib/explorer/blocks';
import { Amount } from '@/components/AmountDisplay';
import { ExplorerCopy, FieldLabel, Metric, SectionTitle, Skeleton, SkeletonLines } from '@/components/ExplorerUI';
import { SPARK_ACCENT, SparkAddressLink, SparkBadge } from '@/components/ExplorerSpark';
import { ExitFunnel, type FunnelModel, type FunnelStep } from '@/components/ExitFunnel';
import { formatLocale, type MessageKey, type Translator, useT } from '@/i18n';

const KIND_LABEL: Record<SparkExitStep['kind'], MessageKey> = {
  root: 'explorerSpark.leafTab.kind.root',
  split: 'explorerSpark.leafTab.kind.split',
  node: 'explorerSpark.leafTab.kind.node',
  leaf: 'explorerSpark.leafTab.kind.leaf',
};

function shortHex(s: string, head = 10, tail = 8): string {
  return s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;
}

/** The funnel model of a Spark leaf, in Spark's words. The refund
 *  transaction is the last row: the exit to the owner. */
export function sparkFunnelModel(path: SparkExitPath, onOpenDeposit: () => void, t: Translator): FunnelModel {
  const rows: FunnelStep[] = path.steps.map((s, i) => ({
    from: i,
    to: i,
    label: t(KIND_LABEL[s.kind]),
    kind: 'tree',
    outputs: s.outputs,
    branchSats: s.branchSats,
  }));
  rows.push({
    from: path.steps.length,
    to: path.steps.length,
    label: t('explorerSpark.leafTab.kind.refund'),
    kind: 'tree',
    outputs: [{ amountSats: path.refund.amountSats, ours: true }],
    branchSats: path.refund.amountSats,
  });
  return {
    accent: SPARK_ACCENT,
    // Dark ink on Spark's yellow.
    onAccent: '#1a1300',
    anchor: {
      amountSats: path.anchorSats,
      title: t('explorerSpark.leafTab.funnel.anchor'),
      detail: t('explorerSpark.leafTab.funnel.anchorDetail', { vout: path.depositVout, amount: path.anchorSats.toLocaleString(formatLocale()) }),
      id: `${shortHex(path.depositTxid, 8, 6)}:${path.depositVout}`,
      onOpen: onOpenDeposit,
    },
    steps: rows,
    zone: { title: '', caption: '' },
    foldLabel: () => '',
    coin: { amountSats: path.refund.amountSats, caption: t('explorerSpark.leafTab.funnel.coin') },
    wait: t('explorerSpark.leafTab.funnel.wait', { blocks: formatSparkBlocks(path.totalWaitBlocks, t.locale) }),
  };
}

function stepTitle(s: SparkExitStep, t: Translator): string {
  if (s.kind === 'root') return t('explorerSpark.leafTab.step.root');
  if (s.kind === 'leaf') return t('explorerSpark.leafTab.step.leaf');
  if (s.kind === 'node') return t('explorerSpark.leafTab.step.node');
  return t('explorerSpark.leafTab.step.split');
}

function stepDetail(s: SparkExitStep, t: Translator): string {
  const parts: string[] = [shortHex(s.txid, 10, 6)];
  if (s.kind === 'root') parts.push(t('explorerSpark.leafTab.detail.root'));
  if (s.kind === 'node') parts.push(t('explorerSpark.leafTab.detail.node'));
  parts.push(s.timelockBlocks === null || s.timelockBlocks === 0 ? t('explorerSpark.leafTab.detail.noTimelock') : t('explorerSpark.leafTab.detail.waits', { blocks: s.timelockBlocks.toLocaleString(formatLocale()) }));
  const others = s.outputs.filter(o => !o.ours);
  if (others.length) {
    const total = others.reduce((sum, o) => sum + o.amountSats, 0);
    parts.push(t.plural('explorerSpark.leafTab.detail.others', others.length, { sats: total.toLocaleString(formatLocale()) }));
  }
  parts.push(t('explorerSpark.leafTab.detail.notBroadcast', { status: sparkLeafStatusLabel(s.status, t.locale).toLowerCase() }));
  return parts.join(' · ');
}

type Anchor = { confirmed: boolean; blockHeight?: number; blockTime?: number };

type TabState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; leaf: SparkLeaf; path: SparkExitPath };

/** A Spark leaf tab: `leafId` is the leaf's UUID. */
export function ExplorerSparkLeafTab({ leafId, provider, onOpenTx, onOpenAddress, onSignals }: {
  leafId: string;
  /** The Bitcoin mainnet provider, asked when the deposit confirmed. */
  provider: ChainDataProvider;
  onOpenTx: (txid: string, networkId?: string) => void;
  onOpenAddress?: (address: string) => void;
  /** Hands the page's context to the Ask Alice dock: a LAYER_CONTEXT signal
      (shape only, de-identified) and the full description for identified mode. */
  onSignals?: (signals: PrivacySignal[], full?: FullContext) => void;
}) {
  const t = useT();
  const [state, setState] = useState<TabState>({ kind: 'loading' });
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  // The page's context for Ask Alice: the leaf and its exit path once read,
  // again when the deposit's confirmation comes in.
  const onSignalsRef = useRef(onSignals);
  onSignalsRef.current = onSignals;
  useEffect(() => {
    if (state.kind !== 'loaded') return;
    const ctx = sparkLeafContext(state.leaf, state.path, anchor);
    onSignalsRef.current?.([ctx.signal], ctx.full);
  }, [state, anchor]);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState({ kind: 'loading' });
    setAnchor(null);
    (async () => {
      try {
        const id = leafId.trim().toLowerCase();
        const nodes = await getSparkLeafChain(id, { signal: controller.signal });
        const leaf = nodes.find(n => n.id === id);
        if (!leaf) throw new SparkError(t('explorerSpark.leafTab.error.unknownLeaf'));
        const path = buildSparkExitPath(nodes, id);
        if (controller.signal.aborted) return;
        setState({ kind: 'loaded', leaf, path });
        // The Bitcoin view of the deposit can now say what its output is.
        noteSparkDeposit({ txid: path.depositTxid, vout: path.depositVout, treeId: path.treeId, leafId: id, amountSats: path.anchorSats });
        // The deposit's confirmation: the one dated, on-chain moment of the tree.
        provider.getTransaction(path.depositTxid, { signal: controller.signal })
          .then(tx => { if (!controller.signal.aborted) setAnchor({ confirmed: tx.status.confirmed, blockHeight: tx.status.blockHeight, blockTime: tx.status.blockTime }); })
          .catch(() => {});
      } catch (e) {
        if (controller.signal.aborted) return;
        setState({ kind: 'error', message: e instanceof SparkError ? e.message : t('explorerSpark.leafTab.error.load') });
      }
    })();
    return () => controller.abort();
  }, [leafId, provider]);

  if (state.kind === 'loading') {
    return (
      <div className="flex flex-col gap-3 px-4 py-3" aria-label={t('explorerSpark.leafTab.reading')} style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
        <Skeleton width="60%" />
        <SkeletonLines lines={3} />
      </div>
    );
  }
  if (state.kind === 'error') {
    return (
      <div className="flex flex-col gap-1 px-4 py-3" role="alert" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{t('explorerSpark.leafTab.couldNotLoad')}</span>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{state.message}</p>
      </div>
    );
  }

  const { leaf, path } = state;
  const openDeposit = () => onOpenTx(path.depositTxid, 'mainnet');
  const model = sparkFunnelModel(path, openDeposit, t);
  const owner = sparkAddressOf(leaf.ownerPubkey);
  const txCount = path.steps.length + 1;

  return (
    <div className="flex flex-col gap-4 rh-fade-in">
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${SPARK_ACCENT}`, borderRadius: 3 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <SparkBadge>{t('explorerSpark.leafTab.badge')}</SparkBadge>
          <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{t('explorerSpark.leafTab.source')}</span>
        </div>
        <div className="flex items-start gap-2">
          <p className="font-numbers m-0 break-all min-w-0 flex-1" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{leaf.id}</p>
          <ExplorerCopy value={leaf.id} label={t('explorerSpark.leafTab.copyId')} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label={t('explorerSpark.leafTab.metric.amount')} value={<Amount sats={leaf.valueSats} style={{ fontSize: 15, color: 'var(--alice-text)' }} />} />
          <Metric label={t('explorerSpark.leafTab.metric.state')} value={sparkLeafStatusLabel(leaf.status, t.locale)} title={t('explorerSpark.leafTab.stateTitle')} />
          <Metric label={t('explorerSpark.leafTab.metric.exitPath')} value={t.plural('explorerSpark.leafTab.exitTxs', txCount)} title={t('explorerSpark.leafTab.exitPathTitle')} />
          <Metric label={t('explorerSpark.leafTab.metric.thenWait')} value={formatSparkBlocks(path.totalWaitBlocks, t.locale)} title={t('explorerSpark.leafTab.thenWaitTitle')} />
          <Metric label={t('explorerSpark.leafTab.metric.deposited')} value={anchor === null ? t('explorerSpark.leafTab.checking') : anchor.confirmed && anchor.blockHeight !== undefined ? t('explorerSpark.leafTab.depositedBlock', { height: anchor.blockHeight.toLocaleString(formatLocale()) }) : t('explorerSpark.leafTab.notConfirmed')} title={t('explorerSpark.leafTab.depositedTitle')} />
          {anchor?.blockTime !== undefined && <Metric label={t('explorerSpark.leafTab.metric.on')} value={formatDateTime(anchor.blockTime)} />}
          {leaf.createdAt && <Metric label={t('explorerSpark.leafTab.metric.leafCreated')} value={formatDateTime(leaf.createdAt)} />}
          <Metric label={t('explorerSpark.leafTab.metric.operators')} value="Lightspark, Breez, Flashnet" />
        </div>
        {owner && (
          <div className="flex flex-col gap-0.5">
            <FieldLabel>{t('explorerSpark.leafTab.owner')}</FieldLabel>
            <SparkAddressLink address={owner} label={owner} onOpenAddress={onOpenAddress} />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <FieldLabel>{t('explorerSpark.leafTab.depositTx')}</FieldLabel>
          <button
            type="button"
            onClick={openDeposit}
            className="alice-control alice-control--quiet font-numbers text-left break-all cursor-pointer bg-transparent self-start"
            style={{ fontSize: 12, color: 'var(--alice-primary)', padding: '2px 0' }}
            title={t('explorerSpark.leafTab.openDepositTitle')}
          >
            {path.depositTxid}:{path.depositVout}
          </button>
        </div>
        <div className="flex flex-col gap-0.5">
          <FieldLabel>{t('explorerSpark.leafTab.tree')}</FieldLabel>
          <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{path.treeId}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionTitle>{t('explorerSpark.leafTab.exitTree')}</SectionTitle>
        <p className="font-numbers m-0" style={{ fontSize: 12, lineHeight: '17px', color: 'var(--alice-muted)' }}>
          {t('explorerSpark.leafTab.exitTreeIntro')}
        </p>
        <div className="px-2 py-3" style={{ borderTop: '1px solid var(--alice-border)' }}>
          <ExitFunnel model={model} activeStep={activeStep} onActiveStep={setActiveStep} />
        </div>
        <ol className="m-0 p-0 flex flex-col" style={{ listStyle: 'none', borderTop: '1px solid var(--alice-border)' }}>
          {path.steps.map((s, i) => (
            <li
              key={s.nodeId}
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
                <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{stepTitle(s, t)}</span>
                <span className="font-numbers" style={{ fontSize: 11.5, color: 'var(--alice-muted)' }}>{stepDetail(s, t)}</span>
              </div>
            </li>
          ))}
          <li
            className="flex items-start gap-3 px-3 py-2"
            onMouseEnter={() => setActiveStep(path.steps.length)}
            onMouseLeave={() => setActiveStep(null)}
            style={{
              borderTop: '1px solid var(--alice-border)',
              borderLeft: `3px solid ${activeStep === path.steps.length ? 'var(--alice-primary)' : 'transparent'}`,
              backgroundColor: activeStep === path.steps.length ? 'var(--alice-hover)' : undefined,
            }}
          >
            <span className="font-numbers shrink-0" style={{ fontSize: 12, color: 'var(--alice-muted)', width: 18, textAlign: 'right' }}>{path.steps.length + 1}</span>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{t('explorerSpark.leafTab.refund.title')}</span>
              <span className="font-numbers" style={{ fontSize: 11.5, color: 'var(--alice-muted)' }}>
                {[
                  shortHex(path.refund.txid, 10, 6),
                  path.refund.timelockBlocks === null ? t('explorerSpark.leafTab.detail.noTimelock') : t('explorerSpark.leafTab.refund.waits', { blocks: path.refund.timelockBlocks.toLocaleString(formatLocale()) }),
                  t('explorerSpark.leafTab.refund.pays', { sats: path.refund.amountSats.toLocaleString(formatLocale()) }),
                  t('explorerSpark.leafTab.refund.renewed'),
                  path.directTimelockBlocks !== null ? t('explorerSpark.leafTab.refund.direct', { blocks: path.directTimelockBlocks.toLocaleString(formatLocale()) }) : '',
                ].filter(Boolean).join(' · ')}
              </span>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
