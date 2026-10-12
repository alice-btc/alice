'use client';

import { useEffect, useRef, useState } from 'react';
import { ExplorerTransaction } from '@/components/ExplorerTransaction';
import { ExplorerSignals } from '@/components/ExplorerSignals';
import { ArkadeVirtualTxCard, CommitmentCard } from '@/components/ExplorerArkade';
import { BarkRoundCard } from '@/components/ExplorerBark';
import { SparkOnchainCard } from '@/components/ExplorerSpark';
import { sparkOnchainRegistry } from '@/lib/explorer/spark-onchain';
import type { ChainDataProvider } from '@/lib/explorer/provider';
import { ChainDataError } from '@/lib/explorer/provider';
import { analyzeTransaction } from '@/lib/explorer/analyze';
import { getArkadeCommitmentIfAny, getArkadeVirtualTx, type ArkadeCommitment, type ArkadeVirtualTx } from '@/lib/explorer/arkade';
import { settlementRegistry } from '@/lib/explorer/arkade-onchain';
import { barkRoundRegistry, getBarkRoundRoot } from '@/lib/explorer/bark-onchain';
import type { BarkVtxo } from '@/lib/explorer/bark-vtxo';
import type { NormalizedOutspend, NormalizedTransaction, RibbonFocus } from '@/lib/explorer/types';
import { buildFullTxDescription, buildTxContext, renderSignalsIdentified, type PrivacySignal } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import { SectionPanel, Skeleton, SkeletonLines } from '@/components/ExplorerUI';

type FetchState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; tx: NormalizedTransaction }
  // An Arkade virtual transaction: off-chain, known to the ASP's indexer only.
  | { kind: 'virtual'; vtx: ArkadeVirtualTx };

type AnalysisState =
  | { kind: 'idle' }
  | { kind: 'analyzing' }
  | { kind: 'done'; signals: PrivacySignal[]; degraded: boolean };

// A self-contained transaction tab: given a txid, it fetches, renders, and then
// analyses. Each tab owns its own fetch so several can live side by side.
export function ExplorerTxTab({
  txid,
  provider,
  onOpenTx,
  onOpenAddress,
  onFocus,
  onSignals,
  arkadeApiUrl,
  arkadeProbeKnownOnly,
  bark,
  onOpenVtxo,
}: {
  txid: string;
  provider: ChainDataProvider;
  onOpenTx?: (txid: string, networkId?: string) => void;
  onOpenAddress?: (address: string) => void;
  /** Report which block the ribbon should spotlight for this transaction. */
  onFocus?: (focus: RibbonFocus | null) => void;
  /** Report the privacy signals once analysed, plus the identified-mode full
      description, for the Ask-Alice sidebar. */
  onSignals?: (signals: PrivacySignal[], full?: FullContext) => void;
  /** Set when this tab's chain carries Arkade settlements: the ASP is asked
   *  whether this transaction is a commitment (settlement), and the round's
   *  detail overlays the on-chain view when it is. */
  arkadeApiUrl?: string;
  /** True on the plain Bitcoin view: only txids the registry already knows are
   *  probed (no ASP request per opened transaction), and unknown txids are
   *  never resolved as virtual Arkade transactions. */
  arkadeProbeKnownOnly?: boolean;
  /** Set when this tab's chain carries Bark rounds: Second's server is asked
   *  whether this transaction is a round (its first output being a tree root
   *  the server serves), and the round's detail overlays the on-chain view.
   *  `probeKnownOnly`, on the plain Bitcoin view: only txids the round
   *  registry already knows are asked about. */
  bark?: { serverUrl: string; probeKnownOnly: boolean };
  /** Opens a Bark VTXO tab (a round's tree root). */
  onOpenVtxo?: (id: string, networkId?: string) => void;
}) {
  const [state, setState] = useState<FetchState>({ kind: 'loading' });
  const [analysis, setAnalysis] = useState<AnalysisState>({ kind: 'idle' });
  const [outspends, setOutspends] = useState<NormalizedOutspend[] | undefined>(undefined);
  const [commitment, setCommitment] = useState<ArkadeCommitment | null>(null);
  const [barkRoot, setBarkRoot] = useState<BarkVtxo | null>(null);
  // A Spark deposit or exit this browser knows (a leaf walked down to it, or
  // Sparkscan reported it): no lookup, just what the Spark pages have seen.
  const [sparkVersion, setSparkVersion] = useState(0);
  useEffect(() => sparkOnchainRegistry.subscribe(() => setSparkVersion(v => v + 1)), []);
  void sparkVersion;
  const sparkKnown = sparkOnchainRegistry.get(txid);
  const [tip, setTip] = useState<number | null>(null);
  const barkServerUrl = bark?.serverUrl;
  const barkKnownOnly = bark?.probeKnownOnly ?? true;

  // Kept in refs so reporting focus/signals never forces the fetch effect to re-run.
  const onFocusRef = useRef(onFocus);
  onFocusRef.current = onFocus;
  const onSignalsRef = useRef(onSignals);
  onSignalsRef.current = onSignals;

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setState({ kind: 'loading' });
    setAnalysis({ kind: 'idle' });
    setOutspends(undefined);
    setCommitment(null);
    setBarkRoot(null);

    // Ask the ASP (in parallel with the on-chain fetch) whether this txid is a
    // settlement; the overlay is decorative, so failure just leaves the plain
    // on-chain view. On the Bitcoin view only already-identified settlements
    // are probed, so ordinary transactions cost no extra request.
    if (arkadeApiUrl && (!arkadeProbeKnownOnly || settlementRegistry.has(txid))) {
      getArkadeCommitmentIfAny(arkadeApiUrl, txid, { signal: controller.signal })
        .then(c => { if (!cancelled && c) setCommitment(c); })
        .catch(() => {});
    }
    // Same for a Bark round: the server is asked for the tree root at txid:0.
    if (barkServerUrl && (!barkKnownOnly || barkRoundRegistry.has(txid))) {
      getBarkRoundRoot(barkServerUrl, txid, { signal: controller.signal })
        .then(root => { if (!cancelled && root) setBarkRoot(root); })
        .catch(() => {});
    }

    (async () => {
      let tx: NormalizedTransaction;
      try {
        tx = await provider.getTransaction(txid, { signal: controller.signal });
      } catch (err) {
        if (cancelled || (err instanceof ChainDataError && err.code === 'aborted')) return;
        // On Arkade, a txid Esplora does not know may be a VIRTUAL (off-chain)
        // transaction: ask the ASP's indexer before declaring it not found.
        if (arkadeApiUrl && !arkadeProbeKnownOnly && err instanceof ChainDataError && err.code === 'not-found') {
          try {
            const vtx = await getArkadeVirtualTx(arkadeApiUrl, txid, { signal: controller.signal });
            if (cancelled) return;
            if (vtx) {
              setState({ kind: 'virtual', vtx });
              onFocusRef.current?.(null);
              return;
            }
          } catch { /* fall through to the on-chain error */ }
        }
        if (cancelled) return;
        const message = err instanceof ChainDataError
          ? err.message
          : 'Something went wrong reading this transaction.';
        setState({ kind: 'error', message });
        onFocusRef.current?.(null);
        return;
      }
      if (cancelled) return;
      setState({ kind: 'loaded', tx });

      // Tell the ribbon which block to spotlight: the confirming block, or, while
      // unconfirmed, the projected mempool block for this fee rate.
      onFocusRef.current?.(
        tx.status.confirmed && tx.status.blockHeight != null
          ? { kind: 'height', height: tx.status.blockHeight }
          : { kind: 'pending', feeRate: tx.feeRateSatVb },
      );

      // Spend status is decorative: fetched in parallel, failure just leaves
      // the graph without spent indicators.
      provider.getOutspends?.(txid, { signal: controller.signal })
        .then(o => { if (!cancelled) setOutspends(o); })
        .catch(() => {});

      setAnalysis({ kind: 'analyzing' });
      try {
        const result = await analyzeTransaction(tx, provider, { signal: controller.signal });
        if (cancelled) return;
        setAnalysis({ kind: 'done', signals: result.signals, degraded: result.degraded });
        const findings = renderSignalsIdentified(result.signals);
        onSignalsRef.current?.([buildTxContext(tx), ...result.signals], {
          description: findings ? `${buildFullTxDescription(tx)}\n\n${findings}` : buildFullTxDescription(tx),
          subjects: [{ kind: 'txid', value: tx.txid }],
        });
      } catch {
        if (cancelled) return;
        setAnalysis({ kind: 'done', signals: [], degraded: true });
        onSignalsRef.current?.([buildTxContext(tx)], { description: buildFullTxDescription(tx), subjects: [{ kind: 'txid', value: tx.txid }] });
      }
    })();

    return () => { cancelled = true; controller.abort(); };
  }, [txid, provider, arkadeApiUrl, arkadeProbeKnownOnly, barkServerUrl, barkKnownOnly]);

  // A confirmed settlement feeds the registry, so the ribbon and the block
  // view highlight it from now on.
  useEffect(() => {
    if (commitment && state.kind === 'loaded' && state.tx.status.confirmed) {
      settlementRegistry.add({
        txid: state.tx.txid,
        height: state.tx.status.blockHeight,
        timestamp: state.tx.status.blockTime,
      });
    }
  }, [commitment, state]);

  // A confirmed Bark round feeds its registry the same way; the chain tip is
  // read for the time left before the round's tree expires.
  useEffect(() => {
    if (!barkRoot || state.kind !== 'loaded') return;
    if (state.tx.status.confirmed) {
      barkRoundRegistry.add({ txid: state.tx.txid, height: state.tx.status.blockHeight, timestamp: state.tx.status.blockTime });
    }
    const controller = new AbortController();
    provider.getRecentBlocks?.(undefined, { signal: controller.signal })
      .then(blocks => { if (blocks.length) setTip(Math.max(...blocks.map(b => b.height))); })
      .catch(() => {});
    return () => controller.abort();
  }, [barkRoot, state, provider]);

  // A settled round is not a payment between two people: said among the
  // signals, before the heuristics that assume one.
  const roundSignals: PrivacySignal[] = [];
  if (commitment) {
    roundSignals.push({
      id: `ARK_SETTLEMENT:${txid}`, ruleId: 'ARK_SETTLEMENT', severity: 'info', confidence: 'certain',
      title: 'Arkade commitment transaction',
      detail: 'Not a payment between two people. This is a commitment transaction of the Arkade operator: its outputs are batch outputs, each the root of a VTXO tree holding the coins of every user settled in that batch, plus the operator\u2019s own change and connectors. The payment heuristics below (change detection, common ownership, amounts) do not apply to it: what is inside belongs to many people, hidden behind one output.',
      subjects: [], evidence: { txid, kind: 'arkade-commitment' },
    });
  }
  if (barkRoot) {
    roundSignals.push({
      id: `ARK_SETTLEMENT:${txid}`, ruleId: 'ARK_SETTLEMENT', severity: 'info', confidence: 'certain',
      title: 'Bark round transaction',
      detail: `Not a payment between two people. This transaction closed a round of Second\u2019s Bark server: its output #${barkRoot.anchor.vout} is the root of the round\u2019s VTXO tree, which holds the coins of every participant, and the rest is the server\u2019s own change. The payment heuristics below (change detection, common ownership, amounts) do not apply to it: what is inside belongs to many people, hidden behind one output.`,
      subjects: [], evidence: { txid, kind: 'bark-round', treeSats: barkRoot.amountSats, expiryHeight: barkRoot.expiryHeight },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {state.kind === 'loading' && (
        // The transaction page's structure from the first paint: the flow
        // graph area, the details card and the in/out columns as skeletons.
        <div className="flex flex-col gap-4" aria-label={`Reading transaction from ${provider.source.name}`}>
          <Skeleton height={150} />
          <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3, backgroundColor: 'transparent' }}>
            <Skeleton width="70%" />
            <SkeletonLines lines={2} />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1"><SectionPanel title="INPUTS"><div className="px-3 py-3"><SkeletonLines lines={3} /></div></SectionPanel></div>
            <div className="flex-1"><SectionPanel title="OUTPUTS"><div className="px-3 py-3"><SkeletonLines lines={3} /></div></SectionPanel></div>
          </div>
        </div>
      )}

      {state.kind === 'error' && (
        <div className="flex flex-col gap-1 px-4 py-3" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>
            COULD NOT LOAD
          </span>
          <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>
            {state.message}
          </p>
        </div>
      )}

      {state.kind === 'virtual' && (
        <div className="rh-fade-in"><ArkadeVirtualTxCard vtx={state.vtx} onOpenTx={onOpenTx} onOpenAddress={onOpenAddress} /></div>
      )}

      {state.kind === 'loaded' && (
        <>
          {/* The Arkade settlement overlay: what this on-chain transaction
              settled (the round, its VTXOs and batches), above the raw view.
              It can land after the on-chain view, so it fades in. */}
          {commitment && <div className="rh-fade-in"><CommitmentCard c={commitment} /></div>}
          {barkRoot && <div className="rh-fade-in"><BarkRoundCard root={barkRoot} tx={state.tx} tip={tip} onOpenVtxo={onOpenVtxo} /></div>}
          {sparkKnown && (
            <div className="rh-fade-in">
              <SparkOnchainCard
                d={sparkKnown}
                onOpenLeaf={onOpenVtxo ? id => onOpenVtxo(id, 'spark') : undefined}
                onOpenAddress={onOpenAddress}
                onOpenSparkTx={onOpenTx ? id => onOpenTx(id, 'spark') : undefined}
              />
            </div>
          )}
          <ExplorerTransaction
            tx={state.tx}
            outspends={outspends}
            onOpenTx={onOpenTx}
            onOpenAddress={onOpenAddress}
            flaggedAddresses={
              analysis.kind === 'done'
                ? new Set(analysis.signals.flatMap(s => s.subjects))
                : undefined
            }
          />
          {analysis.kind !== 'idle' && (
            <ExplorerSignals
              signals={[...roundSignals, ...(analysis.kind === 'done' ? analysis.signals : [])]}
              analyzing={analysis.kind === 'analyzing'}
              degraded={analysis.kind === 'done' ? analysis.degraded : false}
            />
          )}

        </>
      )}
    </div>
  );
}
