'use client';

// The VTXO tab of the Arkade network: a coin by its "txid:vout", with its
// state from the operator's indexer and its exit tree drawn by the funnel
// (ExitFunnel) from the chain the indexer publishes: the commitment
// transaction, the batch's tree transactions down to the leaf, then the
// checkpoint and Ark transactions of each spend made since. The legend list
// under the tree details each transaction, in Arkade's words.

import { useEffect, useRef, useState } from 'react';
import { ArkadeError, arkadeAddressOf, formatArkadeExitDelay, getArkadeInfo, getArkadeVtxo, type ArkadeInfo, type ArkadeVtxo } from '@/lib/explorer/arkade';
import { arkadeSpends, loadArkadeExitPath, type ArkadeExitPath, type ArkadeExitStep } from '@/lib/explorer/arkade-exit';
import { noteSeenSettlement } from '@/lib/explorer/arkade-onchain';
import { arkadeVtxoContext } from '@/lib/explorer/layer-context';
import type { PrivacySignal } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import { formatDateTime } from '@/lib/explorer/blocks';
import { Amount } from '@/components/AmountDisplay';
import { ExplorerCopy, FieldLabel, Metric, SectionTitle, Skeleton, SkeletonLines } from '@/components/ExplorerUI';
import { ARKADE_ACCENT, SettlementBadge } from '@/components/ExplorerArkade';
import { ExitFunnel, type FunnelModel, type FunnelStep } from '@/components/ExitFunnel';

function shortHex(s: string, head = 10, tail = 8): string {
  return s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;
}

function stateLabel(v: ArkadeVtxo): string {
  if (v.isSwept) return 'Swept by the operator';
  if (v.isSpent) return 'Spent';
  return v.isPreconfirmed ? 'Preconfirmed' : 'Settled';
}

/** The funnel model of an Arkade coin, in Arkade's words. */
export function arkadeFunnelModel(path: ArkadeExitPath, coinSats: number, exitDelay: number | null, onOpenTx: (txid: string) => void): FunnelModel {
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
      rows.push({ from: spend.from, to: spend.to, label: 'ark tx', kind: 'spend', outputs: carrier.outputs, branchSats: carrier.branchSats });
      i = spend.to;
      continue;
    }
    rows.push({ from: i, to: i, label: i === lastTree ? 'leaf' : 'split', kind: 'tree', outputs: s.outputs, branchSats: s.branchSats });
  }
  return {
    accent: ARKADE_ACCENT,
    onAccent: '#ffffff',
    anchor: {
      amountSats: path.anchorSats,
      title: 'COMMITMENT TRANSACTION · ON-CHAIN',
      detail: `batch output ${path.batchVout} · ${path.anchorSats.toLocaleString('en-US')} sats`,
      id: `${shortHex(path.commitmentTxid, 8, 6)}:${path.batchVout}`,
      onOpen: () => { noteSeenSettlement(path.commitmentTxid); onOpenTx(path.commitmentTxid); },
    },
    steps: rows,
    zone: { title: 'OUT OF THE BATCH', caption: 'Ark transactions since, preconfirmed by the operator' },
    foldLabel: (spends, txs) => `${spends} Ark transactions, moved whole · ${txs} txs`,
    coin: { amountSats: coinSats, caption: 'YOUR VTXO' },
    wait: exitDelay !== null ? `then ${formatArkadeExitDelay(exitDelay)} before spending` : 'then the unilateral exit delay before spending',
  };
}

function stepTitle(s: ArkadeExitStep, i: number, path: ArkadeExitPath): string {
  if (s.type === 'tree') {
    const lastTree = path.steps.map(x => x.type).lastIndexOf('tree');
    return i === lastTree ? 'Batch tree, leaf (tree transaction)' : i === 0 ? 'Batch tree, first split (tree transaction)' : 'Batch tree, next split (tree transaction)';
  }
  if (s.type === 'checkpoint') return 'Checkpoint transaction';
  return 'Ark transaction (off-chain, preconfirmed)';
}

function stepDetail(s: ArkadeExitStep, i: number, path: ArkadeExitPath): string {
  const parts: string[] = [shortHex(s.txid, 10, 6)];
  if (s.type === 'checkpoint') parts.push('a self-send that hands the operator the exit branch, so one user’s exit cannot force the operator to publish the whole chain');
  if (s.type === 'ark') {
    parts.push('the coin spent into new VTXOs, cosigned by the owner and the operator');
    const first = path.steps.findIndex(x => x.type !== 'tree');
    if (i === first || (i === first + 1 && path.steps[first].type === 'checkpoint')) parts.push('from here, preconfirmed: the operator vouches not to cosign a conflicting spend; settling in a batch removes that trust');
  }
  const others = s.outputs.filter(o => !o.ours);
  if (others.length) {
    const total = others.reduce((t, o) => t + o.amountSats, 0);
    parts.push(`${others.length} other output${others.length === 1 ? '' : 's'}, ${total.toLocaleString('en-US')} sats`);
  }
  if (s.expiresAt) parts.push(`expires ${formatDateTime(s.expiresAt)}`);
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
    if (!m) { setState({ kind: 'error', message: 'Not a VTXO id (txid:vout).' }); return; }
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
        setState({ kind: 'error', message: e instanceof ArkadeError ? e.message : 'Could not load this VTXO.' });
      }
    })();
    getArkadeInfo(apiBaseUrl, { signal: controller.signal }).then(setInfo).catch(() => {});
    return () => controller.abort();
  }, [apiBaseUrl, query]);

  if (state.kind === 'loading') {
    return (
      <div className="flex flex-col gap-3 px-4 py-3" aria-label="Reading the VTXO from the Arkade operator" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
        <Skeleton width="60%" />
        <SkeletonLines lines={3} />
      </div>
    );
  }
  if (state.kind === 'error') {
    return (
      <div className="flex flex-col gap-1 px-4 py-3" role="alert" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>COULD NOT LOAD</span>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{state.message}</p>
      </div>
    );
  }

  const { vtxo, path } = state;
  const coinSats = vtxo?.amountSats ?? path.steps[path.steps.length - 1].branchSats;
  const exitDelay = info ? info.unilateralExitDelay : null;
  const spends = arkadeSpends(path).length;
  const model = arkadeFunnelModel(path, coinSats, exitDelay, onOpenTx);
  // The address holding the coin: its script with the operator's key.
  const address = vtxo?.scriptHex && info ? arkadeAddressOf(vtxo.scriptHex, info.signerPubkey, info.network) : null;

  return (
    <div className="flex flex-col gap-4 rh-fade-in">
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${ARKADE_ACCENT}`, borderRadius: 3 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <SettlementBadge>ARKADE VTXO</SettlementBadge>
          <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>
            {vtxo ? 'from the operator’s indexer' : 'chain from the operator’s indexer; the coin itself was not served'}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <p className="font-numbers m-0 break-all min-w-0 flex-1" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{query}</p>
          <ExplorerCopy value={query} label="VTXO id" />
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
            title={`Open the commitment transaction anchoring this coin on Bitcoin: ${path.commitmentTxid}`}
          >
            OPEN COMMITMENT TX
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label="AMOUNT" value={<Amount sats={coinSats} style={{ fontSize: 15, color: 'var(--alice-text)' }} />} />
          <Metric label="STATE" value={vtxo ? stateLabel(vtxo) : '-'} title="Preconfirmed: cosigned by the operator, not yet in a batch. Settled: in a batch, anchored by a commitment transaction." />
          <Metric
            label="EXPIRES"
            value={vtxo?.expiresAt ? formatDateTime(vtxo.expiresAt) : path.steps[path.steps.length - 1].expiresAt ? formatDateTime(path.steps[path.steps.length - 1].expiresAt!) : '-'}
            title="Past it, the operator can sweep the batch: settle the coin again before."
          />
          <Metric label="FROM" value={spends ? `A batch, then ${spends} Ark transaction${spends === 1 ? '' : 's'}` : 'A batch'} title="Ark transaction: an off-chain spend cosigned by the owner and the operator. With a checkpoint, one spend is two transactions." />
          <Metric label="EXIT PATH" value={`${path.steps.length} tx${path.steps.length === 1 ? '' : 's'}`} title="Presigned transactions to broadcast to leave without the operator (unilateral exit)." />
          <Metric label="THEN WAIT" value={exitDelay !== null ? formatArkadeExitDelay(exitDelay) : '-'} title="The unilateral exit delay: the wait after broadcasting the path before the coin can be spent." />
          <Metric label="OPERATOR" value="Arkade" />
          {vtxo?.createdAt && <Metric label="CREATED" value={formatDateTime(vtxo.createdAt)} />}
        </div>
        {address && (
          <div className="flex flex-col gap-1">
            <FieldLabel>ADDRESS</FieldLabel>
            {onOpenAddress ? (
              <button
                type="button"
                onClick={() => onOpenAddress(address)}
                className="alice-control alice-control--quiet font-numbers text-left break-all cursor-pointer bg-transparent self-start"
                style={{ fontSize: 12, color: 'var(--alice-primary)', padding: '2px 0' }}
                title="Open the Arkade address holding this coin: its balance and its other VTXOs"
              >
                {address}
              </button>
            ) : (
              <span className="font-numbers break-all" style={{ fontSize: 12, color: 'var(--alice-text)' }}>{address}</span>
            )}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <FieldLabel>COMMITMENT TRANSACTION</FieldLabel>
          <button
            type="button"
            onClick={() => { noteSeenSettlement(path.commitmentTxid); onOpenTx(path.commitmentTxid); }}
            className="alice-control alice-control--quiet font-numbers text-left break-all cursor-pointer bg-transparent self-start"
            style={{ fontSize: 12, color: 'var(--alice-primary)', padding: '2px 0' }}
            title="Open the Bitcoin transaction this coin hangs from"
          >
            {path.commitmentTxid}:{path.batchVout}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionTitle>EXIT TREE</SectionTitle>
        <p className="font-numbers m-0" style={{ fontSize: 12, lineHeight: '17px', color: 'var(--alice-muted)' }}>
          The transactions between the commitment transaction and this coin, as the operator publishes them: the
          batch&rsquo;s tree down to your leaf, then each Ark transaction made since. Broadcast in order, then followed by
          the wait above, they take the coin on-chain without the operator (a unilateral exit). Your branch is filled;
          the other outputs lead to other people&rsquo;s coins.
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
                <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{stepTitle(s, i, path)}</span>
                <span className="font-numbers" style={{ fontSize: 11.5, color: 'var(--alice-muted)' }}>{stepDetail(s, i, path)}</span>
              </div>
              <button
                type="button"
                onClick={() => onOpenTx(s.txid)}
                className="alice-control alice-control--quiet font-numbers cursor-pointer bg-transparent shrink-0"
                style={{ fontSize: 11, padding: '3px 8px', borderRadius: 3, color: 'var(--alice-primary)' }}
                title="Open this off-chain transaction"
              >
                open
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
