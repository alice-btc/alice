'use client';

// The transaction tab of the Spark network. A Spark id (a UUID) names a
// transfer or a leaf: the operators are asked for the transfer first, then
// for the leaf, whose tab is drawn in place. A 64-hex id is a token
// transaction (asked of Sparkscan, shown as a token, unnamed) or a Bitcoin
// transaction, which the tab offers to open on the Bitcoin network.
//
// A transfer is laid out like an Arkade virtual transaction: the card with
// its accent, the same flow graph (every leaf moved, from the sender's
// address to the receiver's), then the leaves in two columns.

import { useEffect, useRef, useState } from 'react';
import {
  getSparkLeafChain, getSparkTransfer, isSparkSsp, looksLikeSparkId, sparkAddressOf, sparkLeafStatusLabel, sparkStatusLabel,
  sparkTransferLabel, SparkError, type SparkTransfer,
} from '@/lib/explorer/spark';
import { transferToNormalized } from '@/lib/explorer/spark-insights';
import { noteSparkscanOnchain } from '@/lib/explorer/spark-onchain';
import { sparkscanTxContext, sparkTransferContext } from '@/lib/explorer/layer-context';
import type { PrivacySignal } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import { getSparkscanTx, sparkscanKindLabel, SparkscanError, type SparkscanParty, type SparkscanTx } from '@/lib/explorer/sparkscan';
import type { ChainDataProvider } from '@/lib/explorer/provider';
import { formatDateTime } from '@/lib/explorer/blocks';
import { Amount } from '@/components/AmountDisplay';
import { Badge, Metric, SectionPanel, Skeleton, SkeletonLines } from '@/components/ExplorerUI';
import { ExplorerTxGraph } from '@/components/ExplorerTxGraph';
import { SPARK_ACCENT, SparkAddressLink, SparkBadge } from '@/components/ExplorerSpark';
import { ExplorerSparkLeafTab } from '@/components/ExplorerSparkLeaf';
import { formatLocale, useT } from '@/i18n';

function shortId(id: string): string {
  return id.length > 20 ? `${id.slice(0, 13)}…${id.slice(-6)}` : id;
}

/** A party's address line under a row: the SSP named as such. */
function PartyLine({ pubkey, onOpenAddress }: { pubkey: string; onOpenAddress?: (address: string) => void }) {
  const tr = useT();
  const address = sparkAddressOf(pubkey);
  if (!address) return <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{tr('explorerSpark.party.unknown')}</span>;
  return <SparkAddressLink address={address} label={isSparkSsp(pubkey) ? tr('explorerSpark.transfer.ssp') : undefined} onOpenAddress={onOpenAddress} />;
}

/** A transfer as the operators serve it. */
export function SparkTransferCard({ t, onOpenAddress, onOpenLeaf }: {
  t: SparkTransfer;
  onOpenAddress?: (address: string) => void;
  onOpenLeaf?: (id: string) => void;
}) {
  const tr = useT();
  const lightning = t.type === 'preimage-swap';
  const leaves = t.leaves;
  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-col gap-3 px-4 py-3"
        style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${SPARK_ACCENT}`, borderRadius: 3, backgroundColor: 'transparent' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <SparkBadge>{tr('explorerSpark.tx.badge')}</SparkBadge>
          <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{t.id}</span>
        </div>
        <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
          {lightning
            ? tr('explorerSpark.tx.lightning')
            : tr('explorerSpark.tx.transfer')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label={tr('explorerSpark.tx.amount')} value={<Amount sats={t.totalSats} style={{ fontSize: 13, color: 'var(--alice-text)' }} />} />
          <Metric label={tr('explorerSpark.tx.type')} value={sparkTransferLabel(t, tr.locale)} />
          <Metric label={tr('explorerSpark.tx.status')} value={sparkStatusLabel(t.status, tr.locale)} title={tr('explorerSpark.tx.statusTitle', { status: t.status })} />
          <Metric label={tr('explorerSpark.tx.leaves')} value={leaves.length.toLocaleString(formatLocale())} title={tr('explorerSpark.tx.leavesTitle')} />
          {t.createdAt && <Metric label={tr('explorerSpark.tx.created')} value={formatDateTime(t.createdAt)} />}
          {t.updatedAt && t.updatedAt !== t.createdAt && <Metric label={tr('explorerSpark.tx.updated')} value={formatDateTime(t.updatedAt)} />}
          {t.expiresAt && <Metric label={tr('explorerSpark.tx.expires')} value={formatDateTime(t.expiresAt)} title={tr('explorerSpark.tx.expiresTitle')} />}
        </div>
        {t.invoice && (
          <div className="flex flex-col gap-0.5">
            <span className="font-numbers" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--alice-muted)' }}>{tr('explorerSpark.tx.invoice')}</span>
            <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{t.invoice}</span>
          </div>
        )}
      </div>

      {/* The same flow graph an on-chain transaction gets: every leaf moved,
          from the sender's address to the receiver's. An input connector
          opens the leaf. */}
      <ExplorerTxGraph
        tx={transferToNormalized(t)}
        outspends={leaves.map(() => ({ spent: false }))}
        onOpenTx={onOpenLeaf}
        onOpenAddress={onOpenAddress}
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SectionPanel title={tr('explorerSpark.tx.from', { count: leaves.length || 1 })}>
            {(leaves.length ? leaves : [null]).map((l, i) => (
              <div key={l?.id ?? i} className="flex items-center justify-between gap-3 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)' }}>
                <div className="flex flex-col min-w-0">
                  <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-text)' }} title={l?.id}>{l ? shortId(l.id) : tr('explorerSpark.tx.leavesNotServed')}</span>
                  <PartyLine pubkey={t.senderPubkey} onOpenAddress={onOpenAddress} />
                </div>
                <Amount sats={l?.valueSats ?? t.totalSats} style={{ fontSize: 12, color: 'var(--alice-text)' }} />
              </div>
            ))}
          </SectionPanel>
        </div>
        <div className="flex-1">
          <SectionPanel title={tr('explorerSpark.tx.to', { count: leaves.length || 1 })}>
            {(leaves.length ? leaves : [null]).map((l, i) => (
              <div key={l?.id ?? i} className="flex items-center justify-between gap-3 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)' }}>
                <div className="flex flex-col min-w-0">
                  <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-text)' }} title={l?.id}>{l ? shortId(l.id) : tr('explorerSpark.tx.leavesNotServed')}</span>
                  <PartyLine pubkey={t.receiverPubkey} onOpenAddress={onOpenAddress} />
                  {l && <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{tr('explorerSpark.tx.statusNow', { status: sparkLeafStatusLabel(l.status, tr.locale).toLowerCase() })}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {l && onOpenLeaf && (
                    <button
                      type="button"
                      onClick={() => onOpenLeaf(l.id)}
                      className="alice-control alice-control--quiet font-numbers cursor-pointer bg-transparent"
                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 3, color: 'var(--alice-primary)' }}
                      title={tr('explorerSpark.leaf.openTitle')}
                    >
                      {tr('explorerSpark.leaf.exitTree')}
                    </button>
                  )}
                  <Amount sats={l?.valueSats ?? t.totalSats} style={{ fontSize: 12, color: 'var(--alice-text)' }} />
                </div>
              </div>
            ))}
          </SectionPanel>
        </div>
      </div>
    </div>
  );
}

function SparkscanPartyRow({ p, onOpenAddress }: { p: SparkscanParty | null; onOpenAddress?: (address: string) => void }) {
  const tr = useT();
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)' }}>
      <div className="flex flex-col min-w-0">
        {p?.kind === 'spark' && p.address ? (
          <SparkAddressLink address={p.address} label={p.pubkey && isSparkSsp(p.pubkey) ? tr('explorerSpark.transfer.ssp') : undefined} onOpenAddress={onOpenAddress} />
        ) : (
          <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>{p?.label ?? tr('explorerSpark.party.unknown')}</span>
        )}
      </div>
    </div>
  );
}

/** A token transaction as Sparkscan lists it: a token, unnamed, between
 *  wallets; laid out like a transfer, without amounts. */
function SparkscanTxCard({ t, onOpenAddress, onOpenTx }: { t: SparkscanTx; onOpenAddress?: (address: string) => void; onOpenTx: (txid: string, networkId?: string) => void }) {
  const tr = useT();
  const inputs = t.multi?.inputs.length ? t.multi.inputs : [t.from];
  const outputs = t.multi?.outputs.length ? t.multi.outputs : [t.to];
  const token = t.kind === 'token';
  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-col gap-3 px-4 py-3"
        style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${SPARK_ACCENT}`, borderRadius: 3, backgroundColor: 'transparent' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <SparkBadge>{token ? tr('explorerSpark.address.tokenBadge') : sparkscanKindLabel(t.kind, tr.locale).toUpperCase()}</SparkBadge>
          <span className="font-numbers break-all" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>{t.id}</span>
        </div>
        <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
          {token
            ? tr('explorerSpark.tx.scanToken')
            : tr('explorerSpark.tx.scanOther')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <Metric label={tr('explorerSpark.tx.type')} value={token ? tr('explorerSpark.address.tokenLine', { type: t.rawType.replace(/^token_?/, '').replace(/_/g, ' ') || tr('explorerSpark.address.tokenTransfer') }) : sparkscanKindLabel(t.kind, tr.locale)} />
          <Metric label={tr('explorerSpark.tx.status')} value={t.status} />
          {t.amountSats !== null && <Metric label={tr('explorerSpark.tx.amount')} value={<Amount sats={t.amountSats} style={{ fontSize: 13, color: 'var(--alice-text)' }} />} />}
          {t.createdAt !== null && <Metric label={tr('explorerSpark.tx.time')} value={formatDateTime(t.createdAt)} />}
        </div>
        {t.bitcoinTxid && (
          <div className="flex flex-col gap-0.5">
            <span className="font-numbers" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--alice-muted)' }}>{tr('explorerSpark.tx.bitcoinTx')}</span>
            <button
              type="button"
              onClick={() => onOpenTx(t.bitcoinTxid!, 'mainnet')}
              className="alice-control alice-control--quiet font-numbers text-left break-all cursor-pointer bg-transparent self-start p-0"
              style={{ fontSize: 13, color: 'var(--alice-primary)' }}
              title={tr('explorerSpark.tx.openBitcoinTitle')}
            >
              {t.bitcoinTxid}
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SectionPanel title={tr('explorerSpark.tx.from', { count: inputs.length })}>
            {inputs.map((p, i) => <SparkscanPartyRow key={p?.address ?? p?.label ?? i} p={p} onOpenAddress={onOpenAddress} />)}
          </SectionPanel>
        </div>
        <div className="flex-1">
          <SectionPanel title={tr('explorerSpark.tx.to', { count: outputs.length })}>
            {outputs.map((p, i) => <SparkscanPartyRow key={p?.address ?? p?.label ?? i} p={p} onOpenAddress={onOpenAddress} />)}
          </SectionPanel>
        </div>
      </div>
    </div>
  );
}

type TxState =
  | { kind: 'loading' }
  | { kind: 'transfer'; t: SparkTransfer }
  | { kind: 'leaf' }
  | { kind: 'scan'; t: SparkscanTx }
  | { kind: 'not-found'; txid: string | null }
  | { kind: 'error'; message: string };

/** The Spark network's transaction tab: `id` is a transfer or leaf UUID, or
 *  a 64-hex transaction id. */
export function ExplorerSparkTxTab({ id, provider, onOpenTx, onOpenAddress, onOpenLeaf, onSignals }: {
  id: string;
  /** The Bitcoin mainnet provider, for a leaf's deposit. */
  provider: ChainDataProvider;
  onOpenTx: (txid: string, networkId?: string) => void;
  onOpenAddress?: (address: string) => void;
  onOpenLeaf?: (id: string) => void;
  /** Hands the page's context to the Ask Alice dock: a LAYER_CONTEXT signal
      (shape only, de-identified) and the full description for identified mode. */
  onSignals?: (signals: PrivacySignal[], full?: FullContext) => void;
}) {
  const tr = useT();
  const [state, setState] = useState<TxState>({ kind: 'loading' });
  // The page's context for Ask Alice, once the transfer or the token
  // transaction is on screen; a leaf's tab publishes its own.
  const onSignalsRef = useRef(onSignals);
  onSignalsRef.current = onSignals;
  useEffect(() => {
    const ctx = state.kind === 'transfer' ? sparkTransferContext(state.t) : state.kind === 'scan' ? sparkscanTxContext(state.t) : null;
    if (ctx) onSignalsRef.current?.([ctx.signal], ctx.full);
  }, [state]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    setState({ kind: 'loading' });
    (async () => {
      try {
        const q = id.trim().toLowerCase();
        if (looksLikeSparkId(q)) {
          const t = await getSparkTransfer(q, { signal });
          if (t) { setState({ kind: 'transfer', t }); return; }
          const nodes = await getSparkLeafChain(q, { signal });
          if (nodes.some(n => n.id === q)) { setState({ kind: 'leaf' }); return; }
          setState({ kind: 'not-found', txid: null });
          return;
        }
        if (/^[0-9a-f]{64}$/.test(q)) {
          const t = await getSparkscanTx(q, { signal });
          if (t) { noteSparkscanOnchain([t]); setState({ kind: 'scan', t }); return; }
          setState({ kind: 'not-found', txid: q });
          return;
        }
        setState({ kind: 'error', message: tr('explorerSpark.tx.error.notId') });
      } catch (e) {
        if (signal.aborted) return;
        setState({ kind: 'error', message: e instanceof SparkError || e instanceof SparkscanError ? e.message : tr('explorerSpark.tx.error.load') });
      }
    })();
    return () => controller.abort();
  }, [id]);

  if (state.kind === 'loading') {
    // The transfer page's structure from the first paint: the card, the
    // flow graph area and the two columns as skeletons.
    return (
      <div className="flex flex-col gap-4" aria-label={tr('explorerSpark.tx.reading')}>
        <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3, backgroundColor: 'transparent' }}>
          <Skeleton width="70%" />
          <SkeletonLines lines={2} />
        </div>
        <Skeleton height={150} />
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1"><SectionPanel title={tr('explorerSpark.tx.fromPlain')}><div className="px-3 py-3"><SkeletonLines lines={3} /></div></SectionPanel></div>
          <div className="flex-1"><SectionPanel title={tr('explorerSpark.tx.toPlain')}><div className="px-3 py-3"><SkeletonLines lines={3} /></div></SectionPanel></div>
        </div>
      </div>
    );
  }
  if (state.kind === 'leaf') {
    return <ExplorerSparkLeafTab leafId={id.trim().toLowerCase()} provider={provider} onOpenTx={onOpenTx} onOpenAddress={onOpenAddress} onSignals={onSignals} />;
  }
  if (state.kind === 'transfer') {
    return <div className="rh-fade-in"><SparkTransferCard t={state.t} onOpenAddress={onOpenAddress} onOpenLeaf={onOpenLeaf} /></div>;
  }
  if (state.kind === 'scan') {
    return <div className="rh-fade-in"><SparkscanTxCard t={state.t} onOpenAddress={onOpenAddress} onOpenTx={onOpenTx} /></div>;
  }
  if (state.kind === 'not-found') {
    return (
      <div className="flex flex-col gap-2 px-4 py-3" role="status" style={{ border: '1px solid var(--alice-border)', borderRadius: 3 }}>
        <div className="flex items-center gap-2"><Badge tone="neutral">{tr('explorerSpark.tx.notOnSpark')}</Badge></div>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>
          {state.txid
            ? tr('explorerSpark.tx.notFoundTxid')
            : tr('explorerSpark.tx.notFoundId')}
        </p>
        {state.txid && (
          <button
            type="button"
            onClick={() => onOpenTx(state.txid!, 'mainnet')}
            className="alice-control alice-control--quiet font-numbers self-start cursor-pointer"
            style={{ fontSize: 13, padding: '8px 16px', borderRadius: 3, color: 'var(--alice-primary)' }}
          >
            {tr('explorerSpark.tx.openOnBitcoin')}
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1 px-4 py-3" role="alert" style={{ border: '1px solid var(--alice-danger)', borderRadius: 3 }}>
      <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-danger)' }}>{tr('explorerSpark.tx.couldNotLoad')}</span>
      <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{state.message}</p>
    </div>
  );
}
