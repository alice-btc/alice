'use client';

import { t as tr, useT } from '@/i18n';

// The transaction tab of the Monero network. The public side, read from the
// Monero source (xmrchain.net or the user's node): the transaction's shape, its fee, its inputs (each a ring of
// possible spends, drawn by age, and a key image) and its outputs (one-time
// keys, amounts encrypted), with the fingerprints it shows.
//
// The private side, on the device: someone holding the recipient's view key
// or the sender's transaction key can check what this transaction paid to an
// address. The check runs on the data already loaded (lib/explorer/
// monero-crypto.ts). The key is held in this component's state only, never
// stored, never put in a URL, never sent; the result is never handed to Ask
// Alice. A 64-hex id that is a block opens the block view in place.

import { moneroErrorText } from '@/lib/explorer/monero-text';
import { useEffect, useRef, useState } from 'react';
import {
  formatBlockAge, formatXmr, getMoneroTx, moneroRctLabel, MoneroError, resolveMoneroHash, toScanTx,
  type MoneroInput, type MoneroTx,
} from '@/lib/explorer/monero';
import { checkMoneroTx, type MoneroCheckResult, type MoneroKeyKind } from '@/lib/explorer/monero-crypto';
import { decodeMoneroAddress } from '@/lib/explorer/monero-address';
import { moneroSignals, sharedRingSources, type MoneroSignal } from '@/lib/explorer/monero-signals';
import { moneroTxContext } from '@/lib/explorer/layer-context';
import type { PrivacySignal, SignalSeverity } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import type { RibbonFocus } from '@/lib/explorer/types';
import type { MoneroRibbonSource } from '@/lib/explorer/monero-ribbon';
import { formatDateTime } from '@/lib/explorer/blocks';
import { Badge, ExplorerCopy, FieldLabel, Metric, SectionPanel, Skeleton, SkeletonLines } from '@/components/ExplorerUI';
import { ExplorerMoneroBlockTab, MONERO_ACCENT, MoneroBadge, MoneroLink, MoneroLoadError, shortHash } from '@/components/ExplorerMonero';

/* --------------------------------- Signals -------------------------------- */

const SEVERITY_COLOR: Record<SignalSeverity, string> = {
  info: 'var(--alice-muted)',
  low: 'var(--alice-primary)',
  medium: 'var(--alice-warning)',
  high: 'var(--alice-danger)',
};

function MoneroSignalCard({ s }: { s: MoneroSignal }) {
  const tr = useT();
  const color = SEVERITY_COLOR[s.severity];
  return (
    <div className="flex flex-col gap-2 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3, borderLeft: `3px solid ${color}` }}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-numbers" style={{ fontSize: 14, color: 'var(--alice-text)' }}>{s.title}</span>
        <span className="font-numbers" style={{ fontSize: 10, padding: '3px 6px', border: `1px solid ${color}`, borderRadius: 3, color }}>{tr(`explorerMonero.severity.${s.severity}`)}</span>
        <span
          className="font-numbers"
          style={{ fontSize: 10, padding: '3px 6px', border: '1px solid var(--alice-muted)', borderRadius: 3, color: 'var(--alice-muted)' }}
          title={tr('explorerMonero.confidenceHint')}
        >
          {tr(`explorerMonero.confidence.${s.confidence}`)}
        </span>
      </div>
      <p className="font-numbers m-0" style={{ fontSize: 13, lineHeight: '19px', color: 'var(--alice-muted)' }}>{s.detail}</p>
    </div>
  );
}

/* ---------------------------------- Rings --------------------------------- */

// Age ticks for the ring strip, in blocks (2 minutes each).
function ageTicks(): { blocks: number; label: string }[] { return [
  { blocks: 30, label: '1 h' },
  { blocks: 720, label: tr('explorerMonero.ageDay') },
  { blocks: 21_900, label: tr('explorerMonero.ageMonth') },
  { blocks: 262_800, label: tr('explorerMonero.ageYear') },
]; }

/** One ring drawn on a log scale of age: each member's age when the
 *  transaction spent it, newest on the left. The decoys are picked to look
 *  like real spends (most real spends are recent), so no position gives the
 *  real one away. */
function RingStrip({ input, spentAt, maxAge }: { input: MoneroInput; spentAt: number; maxAge: number }) {
  const tr = useT();
  const W = 600;
  const scale = (age: number) => 8 + (Math.log10(Math.max(age, 1) + 1) / Math.log10(maxAge + 2)) * (W - 16);
  const ticks = ageTicks().filter(t => t.blocks < maxAge);
  return (
    <svg viewBox={`0 0 ${W} 34`} width="100%" height={34} role="img" aria-label={tr('explorerMonero.ringAria', { count: input.ring.length })} style={{ display: 'block' }}>
      <line x1={8} y1={14} x2={W - 8} y2={14} stroke="var(--alice-border)" strokeWidth={1} />
      {ticks.map(t => (
        <g key={t.label}>
          <line x1={scale(t.blocks)} y1={9} x2={scale(t.blocks)} y2={19} stroke="var(--alice-border)" strokeWidth={1} />
          <text x={scale(t.blocks)} y={31} textAnchor="middle" fontSize={10} fill="var(--alice-muted)" className="font-numbers">{t.label}</text>
        </g>
      ))}
      {input.ring.map((m, i) => (
        <circle key={`${m.key}-${i}`} cx={scale(spentAt - m.height)} cy={14} r={4.5} fill={MONERO_ACCENT} fillOpacity={0.75} stroke="var(--alice-bg)" strokeWidth={1}>
          <title>{tr('explorerMonero.ringAgeHint', { age: formatBlockAge(spentAt - m.height), height: m.height.toLocaleString(tr.locale) })}</title>
        </circle>
      ))}
    </svg>
  );
}

function RingPanel({ tx, onOpenTx, onOpenBlock }: {
  tx: MoneroTx;
  onOpenTx: (txid: string) => void;
  onOpenBlock: (heightOrHash: string) => void;
}) {
  const tr = useT();
  const [open, setOpen] = useState<number | null>(null);
  const spentAt = tx.blockHeight ?? tx.currentHeight;
  const maxAge = Math.max(1, ...tx.inputs.flatMap(i => i.ring.map(m => spentAt - m.height)));
  const shared = new Set(sharedRingSources(tx).map(s => s.txid));
  return (
    <SectionPanel title={tr('explorerMonero.inputCount', { count: tx.inputs.length })}>
      <p className="font-numbers m-0 px-3 pb-2" style={{ fontSize: 12, lineHeight: '18px', color: 'var(--alice-muted)' }}>
        {tr('explorerMonero.ringIntro', { count: tx.inputs[0]?.ring.length ?? 0 })}
      </p>
      {tx.inputs.map((input, idx) => (
        <div key={input.keyImage || idx} className="flex flex-col gap-1 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)' }}>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-text)' }}>
              {tr('explorerMonero.inputImage', { index: idx + 1 })}{' '}<span title={input.keyImage} style={{ color: 'var(--alice-muted)' }}>{shortHash(input.keyImage)}
            </span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(o => (o === idx ? null : idx))}
              className="alice-control alice-control--quiet font-numbers cursor-pointer bg-transparent"
              style={{ fontSize: 11, padding: '3px 8px', borderRadius: 3, color: 'var(--alice-primary)' }}
              aria-expanded={open === idx}
            >
              {open === idx ? tr('explorerMonero.hideRing') : tr('explorerMonero.showMembers', { count: input.ring.length })}
            </button>
          </div>
          <RingStrip input={input} spentAt={spentAt} maxAge={maxAge} />
          {open === idx && (
            <div className="flex flex-col">
              {input.ring.map((m, i) => (
                <div key={`${m.key}-${i}`} className="flex items-center justify-between gap-3 py-1" style={{ borderTop: i ? '1px dashed var(--alice-border)' : undefined }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <MoneroLink label={shortHash(m.txid)} title={tr('explorerMonero.openOutputTx')} onClick={() => onOpenTx(m.txid)} />
                    {shared.has(m.txid) && <Badge tone="medium">{tr('explorerMonero.severalRings')}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <MoneroLink label={tr('explorerMonero.blockNumber', { height: m.height.toLocaleString(tr.locale) })} onClick={() => onOpenBlock(String(m.height))} />
                    <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)', minWidth: 64, textAlign: 'right' }}>{formatBlockAge(spentAt - m.height)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </SectionPanel>
  );
}

/* --------------------------------- Outputs -------------------------------- */

function OutputPanel({ tx, check }: { tx: MoneroTx; check: MoneroCheckResult | null }) {
  const tr = useT();
  const owned = new Map(check?.ok ? check.owned.map(o => [o.index, o]) : []);
  return (
    <SectionPanel title={tr('explorerMonero.outputCount', { count: tx.outputs.length })}>
      <p className="font-numbers m-0 px-3 pb-2" style={{ fontSize: 12, lineHeight: '18px', color: 'var(--alice-muted)' }}>
        {tx.coinbase || tx.rctType === 0
          ? tr('explorerMonero.outputsClear')
          : tr('explorerMonero.outputsEncrypted')}
      </p>
      {tx.outputs.map(o => {
        const mine = owned.get(o.index);
        return (
          <div key={o.index} className="flex items-center justify-between gap-3 px-3 py-2" style={{ borderTop: '1px solid var(--alice-border)', backgroundColor: mine ? 'var(--alice-bg-soft)' : undefined }}>
            <div className="flex flex-col min-w-0">
              <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-text)' }}>
                #{o.index} <span title={o.key} style={{ color: 'var(--alice-muted)' }}>{shortHash(o.key)}</span>
              </span>
              {o.viewTag && <span className="font-numbers" style={{ fontSize: 10, color: 'var(--alice-muted)' }} title={tr('explorerMonero.viewTagHint')}>{tr('explorerMonero.viewTag', { tag: o.viewTag })}</span>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {mine && <MoneroBadge>{tr('explorerMonero.paysAddress')}</MoneroBadge>}
              <span className="font-numbers" style={{ fontSize: 12, color: mine ? 'var(--alice-text)' : 'var(--alice-muted)' }}>
                {mine
                  ? mine.amount !== null ? `${formatXmr(mine.amount)}${mine.amountConfirmed ? '' : tr('explorerMonero.unverifiedAmount')}` : tr('explorerMonero.unreadableAmount')
                  : tx.coinbase || tx.rctType === 0 ? formatXmr(o.clearAmount) : tr('explorerMonero.encrypted')}
              </span>
            </div>
          </div>
        );
      })}
    </SectionPanel>
  );
}

/* ---------------------------------- Check --------------------------------- */

function checkErrors(): Record<Exclude<MoneroCheckResult, { ok: true }>['reason'], string> { return {
  'bad-key': tr('explorerMonero.checkBadKey'),
  'key-mismatch': tr('explorerMonero.checkMismatch'),
  'spend-key': tr('explorerMonero.checkSpendKey'),
  'no-tx-key': tr('explorerMonero.checkNoTxKey'),
}; }

/** The on-device check: an address and a key, a result about this
 *  transaction only. */
function CheckPanel({ tx, onResult }: { tx: MoneroTx; onResult: (r: MoneroCheckResult | null) => void }) {
  const tr = useT();
  const [address, setAddress] = useState('');
  const [kind, setKind] = useState<MoneroKeyKind>('view-key');
  const [key, setKey] = useState('');
  const [result, setResult] = useState<MoneroCheckResult | null>(null);
  const [addressError, setAddressError] = useState(false);

  function run() {
    const decoded = decodeMoneroAddress(address);
    if (!decoded) { setAddressError(true); return; }
    setAddressError(false);
    const r = checkMoneroTx(toScanTx(tx), decoded, kind, key);
    setResult(r);
    onResult(r);
    // The key has done its job: it does not stay on screen or in memory.
    setKey('');
  }

  function reset() {
    setResult(null);
    setKey('');
    onResult(null);
  }

  const ready = address.trim().length > 0 && key.trim().length > 0;
  return (
    <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${MONERO_ACCENT}`, borderRadius: 3 }}>
      <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{tr('explorerMonero.checkTitle')}</span>
      <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
        {tr('explorerMonero.checkIntro')}
      </p>
      <div role="radiogroup" aria-label={tr('explorerMonero.whichKey')} className="flex flex-wrap gap-2">
        {([
          ['view-key', tr('explorerMonero.receivedKey')],
          ['tx-key', tr('explorerMonero.sentKey')],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={kind === value}
            onClick={() => { setKind(value); setResult(null); onResult(null); }}
            className={`alice-control font-numbers cursor-pointer${kind === value ? ' alice-control--primary' : ''}`}
            style={{ fontSize: 12.5, padding: '8px 12px', borderRadius: 3 }}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="font-numbers m-0" style={{ fontSize: 12, lineHeight: '17px', color: 'var(--alice-muted)' }}>
        {kind === 'view-key'
          ? tr('explorerMonero.viewKeyHint')
          : tr('explorerMonero.txKeyHint')}
      </p>
      <label className="flex flex-col gap-1">
        <FieldLabel>{kind === 'view-key' ? tr('explorerMonero.yourAddress') : tr('explorerMonero.recipientAddress')}</FieldLabel>
        <input
          type="text"
          value={address}
          onChange={e => { setAddress(e.target.value); setAddressError(false); }}
          spellCheck={false}
          autoComplete="off"
          placeholder={tr('explorerMonero.addressPlaceholder')}
          className="alice-field w-full font-numbers"
          style={{ height: 40, fontSize: 13, padding: '0 10px', color: 'var(--alice-text)', backgroundColor: 'var(--alice-bg)', border: `1px solid ${addressError ? 'var(--alice-danger)' : 'var(--alice-control-border)'}`, borderRadius: 3 }}
        />
        {addressError && <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-danger)' }}>{tr('explorerMonero.checkInvalidAddress')}</span>}
      </label>
      <label className="flex flex-col gap-1">
        <FieldLabel>{kind === 'view-key' ? tr('explorerMonero.privateViewKey') : tr('explorerMonero.txKey')}</FieldLabel>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && ready) run(); }}
          spellCheck={false}
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          placeholder={tr('explorerMonero.keyPlaceholder')}
          className="alice-field w-full font-numbers"
          style={{ height: 40, fontSize: 13, padding: '0 10px', color: 'var(--alice-text)', backgroundColor: 'var(--alice-bg)', border: '1px solid var(--alice-control-border)', borderRadius: 3 }}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!ready}
          onClick={run}
          className="alice-control alice-control--primary font-numbers cursor-pointer disabled:cursor-not-allowed"
          style={{ fontSize: 13, padding: '9px 16px', borderRadius: 3, opacity: ready ? 1 : 0.5 }}
        >
          {tr('explorerMonero.checkButton')}
        </button>
        {result && (
          <button type="button" onClick={reset} className="alice-control alice-control--quiet font-numbers cursor-pointer" style={{ fontSize: 13, padding: '9px 12px', borderRadius: 3 }}>
            {tr('explorerMonero.clearResult')}
          </button>
        )}
      </div>
      {result && <CheckResult result={result} kind={kind} clearAmounts={tx.coinbase || tx.rctType === 0} />}
    </div>
  );
}

function CheckResult({ result, kind, clearAmounts }: { result: MoneroCheckResult; kind: MoneroKeyKind; clearAmounts: boolean }) {
  const tr = useT();
  if (!result.ok) {
    return (
      <div className="flex flex-col gap-1 px-3 py-2" role="alert" style={{ border: `1px solid ${result.reason === 'spend-key' ? 'var(--alice-danger)' : 'var(--alice-warning)'}`, borderRadius: 3 }}>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>{checkErrors()[result.reason]}</p>
      </div>
    );
  }
  if (result.owned.length === 0) {
    return (
      <div className="flex flex-col gap-1 px-3 py-2" role="status" style={{ border: '1px solid var(--alice-border)', borderRadius: 3 }}>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>
          {kind === 'view-key'
            ? tr('explorerMonero.noOutputView')
            : tr('explorerMonero.noOutputTx')}
        </p>
      </div>
    );
  }
  const unconfirmed = result.owned.some(o => !o.amountConfirmed);
  return (
    <div className="flex flex-col gap-2 px-3 py-2" role="status" style={{ border: `1px solid ${MONERO_ACCENT}`, borderRadius: 3 }}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
        <Metric label={kind === 'view-key' ? tr('explorerMonero.received') : tr('explorerMonero.paidToAddress')} value={formatXmr(result.total)} />
        <Metric label={tr('explorerMonero.outputs')} value={result.owned.map(o => `#${o.index}`).join(', ')} />
        {result.paymentId && <Metric label={tr('explorerMonero.paymentId')} value={result.paymentId} title={tr('explorerMonero.paymentIdHint')} />}
      </div>
      <p className="font-numbers m-0" style={{ fontSize: 12, lineHeight: '17px', color: 'var(--alice-muted)' }}>
        {unconfirmed
          ? tr('explorerMonero.amountNotVerified')
          : clearAmounts
            ? tr('explorerMonero.clearProof')
            : tr('explorerMonero.encryptedProof')}
      </p>
    </div>
  );
}

/* ----------------------------------- Tab ---------------------------------- */

type TxState =
  | { kind: 'loading' }
  | { kind: 'ready'; tx: MoneroTx }
  | { kind: 'block' }
  | { kind: 'not-found' }
  | { kind: 'error'; error: unknown };

export function ExplorerMoneroTxTab({ txid, source, onOpenTx, onOpenBlock, onFocus, onSignals }: {
  txid: string;
  /** The ribbon's source, for a block hash opened as a transaction. */
  source: MoneroRibbonSource;
  onOpenTx: (txid: string) => void;
  onOpenBlock: (heightOrHash: string) => void;
  /** Tells the ribbon where this transaction sits: its block, or the
   *  projected block its fee per byte would put it in. */
  onFocus?: (focus: RibbonFocus | null) => void;
  onSignals?: (signals: PrivacySignal[], full?: FullContext) => void;
}) {
  const tr = useT();
  const [state, setState] = useState<TxState>({ kind: 'loading' });
  const [check, setCheck] = useState<MoneroCheckResult | null>(null);
  const onSignalsRef = useRef(onSignals);
  onSignalsRef.current = onSignals;
  const onFocusRef = useRef(onFocus);
  onFocusRef.current = onFocus;

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    setState({ kind: 'loading' });
    setCheck(null);
    (async () => {
      try {
        const tx = await getMoneroTx(txid, { signal });
        setState({ kind: 'ready', tx });
        onFocusRef.current?.(tx.blockHeight !== null
          ? { kind: 'height', height: tx.blockHeight }
          : { kind: 'pending', feeRate: tx.size > 0 ? Number(tx.fee) / tx.size : null });
        const ctx = moneroTxContext(tx, moneroSignals(tx));
        onSignalsRef.current?.([ctx.signal], ctx.full);
      } catch (e) {
        if (signal.aborted) return;
        if (e instanceof MoneroError && e.code === 'not-found') {
          // Monero block hashes look like transaction ids: ask which it is.
          const what = await resolveMoneroHash(txid, { signal }).catch(() => null);
          if (signal.aborted) return;
          setState({ kind: what === 'block' ? 'block' : 'not-found' });
          return;
        }
        setState({ kind: 'error', error: e });
      }
    })();
    return () => controller.abort();
  }, [txid]);

  if (state.kind === 'loading') {
    return (
      <div className="flex flex-col gap-4" aria-label={tr('explorerMonero.txReading')}>
        <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3 }}>
          <Skeleton width="70%" />
          <SkeletonLines lines={3} />
        </div>
        <SectionPanel title={tr('explorerMonero.inputs')}><div className="px-3 py-3"><SkeletonLines lines={3} /></div></SectionPanel>
      </div>
    );
  }
  if (state.kind === 'block') return <ExplorerMoneroBlockTab heightOrHash={txid} source={source} onOpenTx={onOpenTx} onFocus={onFocus} onSignals={onSignals} />;
  if (state.kind === 'not-found') {
    return (
      <div className="flex flex-col gap-2 px-4 py-3" role="status" style={{ border: '1px solid var(--alice-border)', borderRadius: 3 }}>
        <div className="flex items-center gap-2"><Badge tone="neutral">{tr('explorerMonero.notOnMonero')}</Badge></div>
        <p className="font-numbers m-0" style={{ fontSize: 13, color: 'var(--alice-text)' }}>
          {tr('explorerMonero.notOnMoneroHint')}
        </p>
      </div>
    );
  }
  if (state.kind === 'error') return <MoneroLoadError message={moneroErrorText(state.error, 'explorerMonero.txLoadError')} />;

  const tx = state.tx;
  const signals = moneroSignals(tx);
  const ringSize = tx.inputs[0]?.ring.length ?? 0;
  return (
    <div className="flex flex-col gap-4 rh-fade-in">
      <div className="flex flex-col gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${MONERO_ACCENT}`, borderRadius: 3 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <MoneroBadge>{tx.coinbase ? tr('explorerMonero.coinbaseBadge') : tr('explorerMonero.txBadge')}</MoneroBadge>
          {tx.blockHeight === null && <Badge tone="medium">{tr('explorerMonero.inMempool')}</Badge>}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-numbers break-all" style={{ fontSize: 12, color: 'var(--alice-text)' }}>{tx.txid}</span>
          <ExplorerCopy value={tx.txid} label={tr('explorerMonero.txId')} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          {tx.blockHeight !== null ? (
            <Metric label={tr('explorerMonero.block')} value={<MoneroLink label={tx.blockHeight.toLocaleString(tr.locale)} onClick={() => onOpenBlock(String(tx.blockHeight))} />} />
          ) : (
            <Metric label={tr('explorerMonero.status')} value={tr('explorerMonero.unconfirmed')} />
          )}
          <Metric label={tr('explorerMonero.confirmations')} value={tx.confirmations.toLocaleString(tr.locale)} title={tr('explorerMonero.confirmationsHint')} />
          <Metric label={tx.blockHeight !== null ? tr('explorerMonero.time') : tr('explorerMonero.firstSeen')} value={tx.timestamp ? formatDateTime(tx.timestamp) : '-'} />
          {!tx.coinbase && <Metric label={tr('explorerMonero.fee')} value={formatXmr(tx.fee, 8)} title={tx.size ? tr('explorerMonero.feeHint', { rate: Math.round(Number(tx.fee) / tx.size).toLocaleString(tr.locale) }) : undefined} />}
          <Metric label={tr('explorerMonero.size')} value={tr('explorerMonero.bytes', { count: tx.size.toLocaleString(tr.locale) })} />
          {!tx.coinbase && <Metric label={tr('explorerMonero.inputs')} value={tr('explorerMonero.inputRings', { count: tx.inputs.length, size: ringSize })} />}
          <Metric label={tr('explorerMonero.outputs')} value={tx.outputs.length.toLocaleString(tr.locale)} />
          <Metric label={tr('explorerMonero.format')} value={moneroRctLabel(tx.rctType, tx.coinbase)} title={tr('explorerMonero.formatHint')} />
        </div>
        <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
          {tx.coinbase
            ? tr('explorerMonero.coinbaseIntro')
            : tr('explorerMonero.txIntro')}
        </p>
      </div>

      <CheckPanel tx={tx} onResult={setCheck} />

      {signals.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{tr('explorerMonero.whatItShows')}</span>
          {signals.map(s => <MoneroSignalCard key={s.id} s={s} />)}
        </div>
      )}

      {tx.inputs.length > 0 && <RingPanel tx={tx} onOpenTx={onOpenTx} onOpenBlock={onOpenBlock} />}
      <OutputPanel tx={tx} check={check} />
    </div>
  );
}
