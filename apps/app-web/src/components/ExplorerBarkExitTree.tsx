'use client';

// The exit tree of a Bark coin: the funnel (ExitFunnel) fed from the coin's
// genesis, in Bark's own words. Two zones: the round's tree (splits, then
// the leaf released by the round's secret, marked with a key) and, under the
// divider, the arkoor spends made since. With checkpoints, bark's default,
// one spend is two steps (the checkpoint transaction, then the transaction
// spending it), paired by arkoorSpends and drawn as one row.

import type { BarkVtxo } from '@/lib/explorer/bark-vtxo';
import { arkoorSpends, exitPathAmounts, vtxoOrigin } from '@/lib/explorer/bark-vtxo';
import { BARK_ACCENT } from '@/components/ExplorerBark';
import { ExitFunnel, type FunnelModel, type FunnelStep } from '@/components/ExitFunnel';
import { formatLocale, type Translator, useT } from '@/i18n';

function shortId(txid: string, vout: number): string {
  return `${txid.slice(0, 8)}…${txid.slice(-6)}:${vout}`;
}

/** The funnel model of a Bark coin. */
export function barkFunnelModel(v: BarkVtxo, onOpenTx: (txid: string, networkId?: string) => void, t: Translator): FunnelModel {
  const steps = v.genesis;
  const origin = vtxoOrigin(v);
  const { anchorSats, branchSats } = exitPathAmounts(v);
  const spends = arkoorSpends(v);
  const outputsOf = (i: number) => {
    const s = steps[i];
    return Array.from({ length: s.outputs }, (_, k) => ({
      ours: k === s.outputIndex,
      amountSats: k === s.outputIndex ? branchSats[i] : s.siblings[k < s.outputIndex ? k : k - 1]?.amountSats ?? 0,
    }));
  };
  const rows: FunnelStep[] = [];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const spend = spends.find(x => x.from === i);
    if (spend) {
      // The checkpoint carries the outputs; the second step passes ours on.
      rows.push({ from: spend.from, to: spend.to, label: t('explorerBark.funnel.arkoor'), kind: 'spend', outputs: outputsOf(spend.from), branchSats: branchSats[spend.to], unsigned: !steps[spend.from].signed || !steps[spend.to].signed });
      i = spend.to;
      continue;
    }
    const label = s.kind === 'hash-locked' ? t('explorerBark.funnel.leaf') : origin === 'board' && i === 0 ? t('explorerBark.funnel.board') : t('explorerBark.funnel.split');
    rows.push({ from: i, to: i, label, kind: 'tree', key: s.kind === 'hash-locked', outputs: outputsOf(i), branchSats: branchSats[i], unsigned: !s.signed });
  }
  return {
    accent: BARK_ACCENT,
    onAccent: 'var(--alice-bg)',
    anchor: {
      amountSats: anchorSats,
      title: origin === 'board' ? t('explorerBark.funnel.anchorBoard') : t('explorerBark.funnel.anchorRound'),
      detail: t('explorerBark.funnel.anchorDetail', { vout: v.anchor.vout, amount: anchorSats.toLocaleString(formatLocale()) }),
      id: shortId(v.anchor.txid, v.anchor.vout),
      onOpen: () => onOpenTx(v.anchor.txid, 'mainnet'),
    },
    steps: rows,
    zone: { title: t('explorerBark.funnel.zoneTitle'), caption: t('explorerBark.funnel.zoneCaption') },
    foldLabel: (spends, txs) => t('explorerBark.funnel.fold', { spends, txs }),
    coin: { amountSats: v.amountSats, caption: t('explorerBark.funnel.coin') },
    wait: t('explorerBark.funnel.wait', { blocks: v.exitDeltaBlocks.toLocaleString(formatLocale()) }),
  };
}

export function BarkExitTree({ v, activeStep, onActiveStep, onOpenTx }: {
  v: BarkVtxo;
  /** The step highlighted, shared with the legend list. */
  activeStep: number | null;
  onActiveStep: (step: number | null) => void;
  onOpenTx: (txid: string, networkId?: string) => void;
}) {
  const t = useT();
  if (v.genesis.length === 0) return null;
  return <ExitFunnel model={barkFunnelModel(v, onOpenTx, t)} activeStep={activeStep} onActiveStep={onActiveStep} />;
}
