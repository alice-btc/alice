'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChainDataProvider } from '@/lib/explorer/provider';
import type { BlockAudit, BlockTxSummary } from '@/lib/explorer/types';
import { packBlockGrid } from '@/lib/explorer/treemap';
import { feeColorHex, formatFixed } from '@/lib/explorer/blocks';
import { useT } from '@/i18n';
import { formatAmount, useAmountState, WithBitcoinGlyph } from '@/components/AmountDisplay';
import { Skeleton } from '@/components/ExplorerUI';

const MAX_PX = 440; // the map never grows past this, so it stays compact
const RESOLUTION = 80;
// The block's capacity in vbytes (~4M weight units / 4), so squares are sized
// against how full the block is, not just against each other. Every network the
// Explorer shows (Bitcoin and Elements/Liquid) uses the same ~4M-weight limit,
// so a lightly-used block reads as mostly empty.
const BLOCK_CAPACITY_VSIZE = 1_000_000;

type Placed = { px: number; py: number; pside: number; tx: BlockTxSummary };
type View = 'actual' | 'expected';

// The block treemap, mempool style: each transaction a grid-aligned square,
// area from vsize, colour from fee rate, packed densely with no gaps. Capped in
// size. A toggle switches between the mined block and the block the mempool
// expected, when the audit is available.
/** A canvas needs a real colour: a theme token (`var(--x)`) is read off the
 *  document, since fillStyle cannot resolve it. */
function resolveCssColor(color: string): string {
  const token = /^var\((--[\w-]+)\)$/.exec(color.trim());
  if (!token || typeof window === 'undefined') return color;
  return getComputedStyle(document.documentElement).getPropertyValue(token[1]).trim() || color;
}

export function ExplorerBlockTreemap({
  hash,
  provider,
  onOpenTx,
  selectedTxid,
  onSelectTx,
  highlights,
}: {
  hash: string;
  provider: ChainDataProvider;
  onOpenTx: (txid: string) => void;
  selectedTxid: string | null;
  onSelectTx: (txid: string) => void;
  /** Transactions to spotlight in the map (an Arkade settlement, a Bark
   *  round), one set per kind: their square is filled with `color` instead of
   *  the fee colour, and the hover card names them with `label` (in
   *  `textColor`, legible on the tooltip). Memoised by the caller. */
  highlights?: ReadonlyArray<{ txids: ReadonlySet<string>; color: string; label?: string; textColor?: string }>;
}) {
  const [actual, setActual] = useState<BlockTxSummary[] | null>(null);
  const [audit, setAudit] = useState<BlockAudit | null>(null);
  const t = useT();
  const [view, setView] = useState<View>('actual');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'unsupported'>('loading');
  const [boxSize, setBoxSize] = useState(0);
  const [hover, setHover] = useState<{ x: number; y: number; tx: BlockTxSummary } | null>(null);

  const unit = useAmountState();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const placedRef = useRef<Placed[]>([]);
  const baseRef = useRef<ImageData | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    if (typeof provider.getBlockSummary !== 'function') { setStatus('unsupported'); return; }
    setStatus('loading');
    setActual(null); setAudit(null); setView('actual');
    provider.getBlockSummary(hash, { signal: controller.signal })
      .then(txs => { if (!cancelled) { setActual(txs); setStatus('ready'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    // The audit is best-effort: absence just disables the toggle.
    if (typeof provider.getBlockAudit === 'function') {
      provider.getBlockAudit(hash, { signal: controller.signal }).then(a => { if (!cancelled) setAudit(a); }).catch(() => {});
    }
    return () => { cancelled = true; controller.abort(); };
  }, [hash, provider]);

  // Available width, capped, so the map is compact and square-ish.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setBoxSize(Math.min(MAX_PX, el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [status]);

  const txs = view === 'expected' && audit ? audit.template : actual;

  const grid = useMemo(() => (txs ? packBlockGrid(txs.map(t => t.vsize), RESOLUTION, BLOCK_CAPACITY_VSIZE) : null), [txs]);

  useEffect(() => {
    if (!txs || !grid || boxSize === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cell = boxSize / grid.gridWidth;
    const pxW = boxSize;
    // Keep the map SQUARE (R x R): the transactions settle at the bottom and the
    // unused capacity shows as empty space above. Only a block that somehow
    // overflows the grid grows taller than the square.
    const pxH = Math.max(boxSize, grid.rows * cell);
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.round(pxW * dpr);
    canvas.height = Math.round(pxH * dpr);
    canvas.style.width = `${pxW}px`;
    canvas.style.height = `${pxH}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, pxW, pxH);

    const placed: Placed[] = [];
    for (const sq of grid.squares) {
      const tx = txs[sq.index];
      const px = sq.x * cell;
      // Flip Y so the first-placed (largest) squares settle at the bottom.
      const py = pxH - (sq.y + sq.s) * cell;
      const side = Math.max(1, sq.s * cell - 1);
      // A highlighted transaction (a settlement, a round) keeps its exact
      // square, just filled with the accent instead of the fee colour.
      const mark = highlights?.find(h => h.txids.has(tx.txid));
      ctx.fillStyle = mark ? resolveCssColor(mark.color) : feeColorHex(tx.rate);
      ctx.fillRect(px, py, side, side);
      placed.push({ px, py, pside: side, tx });
    }
    placedRef.current = placed;
    baseRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHover(null);
  }, [txs, grid, boxSize, highlights]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !baseRef.current) return;
    ctx.putImageData(baseRef.current, 0, 0);
    const selected = placedRef.current.find(square => square.tx.txid === selectedTxid);
    if (!selected) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(selected.px, selected.py, selected.pside, selected.pside);
  }, [selectedTxid, txs, grid, boxSize, highlights, hover]);

  function squareAt(clientX: number, clientY: number): Placed | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left, y = clientY - rect.top;
    const list = placedRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      if (x >= p.px && x <= p.px + p.pside && y >= p.py && y <= p.py + p.pside) return p;
    }
    return null;
  }

  function onMove(e: React.MouseEvent) {
    const p = squareAt(e.clientX, e.clientY);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && baseRef.current) {
      ctx.putImageData(baseRef.current, 0, 0);
      if (p) {
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.px + 0.5, p.py + 0.5, p.pside - 1, p.pside - 1);
      }
    }
    const wrap = wrapRef.current;
    if (p && wrap) {
      const wr = wrap.getBoundingClientRect();
      setHover({ x: e.clientX - wr.left, y: e.clientY - wr.top, tx: p.tx });
      onSelectTx?.(p.tx.txid);
    } else setHover(null);
  }

  function onLeave() {
    // The selection effect restores the base image and selected outline.
    setHover(null);
  }

  if (status === 'unsupported') return null;

  const canToggle = audit !== null;

  return (
    <div className="flex flex-col gap-2">
      {status === 'loading' && (
        // The map's square holds its place while the summary loads, with the
        // label below where it will stay, so nothing shifts when it lands.
        <>
          <Skeleton width={300} height={300} style={{ maxWidth: '100%' }} />
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{t('explorerBlocks.map.title')}</span>
        </>
      )}
      {status === 'error' && (
        <p className="font-numbers m-0" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>{t('explorerBlocks.map.error')}</p>
      )}

      {status === 'ready' && (
        <>
        <div ref={wrapRef} className="relative w-full rh-fade-in">
          <canvas
            ref={canvasRef}
            tabIndex={0}
            role="group"
            aria-label={t('explorerBlocks.map.aria')}
            onFocus={() => {
              const first = placedRef.current.find(p => p.tx.txid === selectedTxid) ?? placedRef.current[0];
              if (first) { onSelectTx?.(first.tx.txid); setHover({ x: first.px, y: first.py, tx: first.tx }); }
            }}
            onKeyDown={event => {
              const entries = placedRef.current;
              if (!entries.length) return;
              if (event.key === 'Enter' && selectedTxid) { event.preventDefault(); onOpenTx(selectedTxid); return; }
              if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
              event.preventDefault();
              const index = entries.findIndex(p => p.tx.txid === selectedTxid);
              const step = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
              const next = entries[(index + step + entries.length) % entries.length];
              onSelectTx?.(next.tx.txid); setHover({ x: next.px, y: next.py, tx: next.tx });
            }}
            style={{ display: 'block', border: '1px solid var(--alice-border)', borderRadius: 3, cursor: hover ? 'pointer' : 'default' }}
            className="focus-visible:outline-2 focus-visible:outline-offset-2"
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            onClick={() => { if (hover) onOpenTx(hover.tx.txid); }}
          />
          {hover && (
            <div
              className="pointer-events-none absolute"
              style={{
                left: Math.min(hover.x + 12, (wrapRef.current?.clientWidth ?? 0) - 170),
                top: hover.y + 12,
                padding: '6px 8px', border: '1px solid var(--alice-border)', borderRadius: 3,
                backgroundColor: 'var(--alice-bg)', zIndex: 10, maxWidth: 200,
              }}
            >
              <div className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-text)' }}>
                {hover.tx.txid.slice(0, 10)}...{hover.tx.txid.slice(-6)}
              </div>
              {(() => {
                const mark = highlights?.find(h => h.txids.has(hover.tx.txid));
                return mark?.label ? (
                  <div className="font-numbers" style={{ fontSize: 11, color: mark.textColor ?? mark.color }}>
                    {mark.label}
                  </div>
                ) : null;
              })()}
              <div className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>
                {Math.round(hover.tx.rate)} sat/vB - {Math.round(hover.tx.vsize)} vB
              </div>
              <div className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>
                <WithBitcoinGlyph text={formatAmount(hover.tx.valueSats, unit)} />
              </div>
            </div>
          )}
        </div>

        {/* Label and the actual/expected toggle sit BELOW the map, so the map's
            top edge lines up with the block details panel beside it. */}
        <div className="flex items-center justify-between">
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
            {view === 'expected' ? t('explorerBlocks.map.expectedTitle') : t('explorerBlocks.map.title')}
          </span>
          {canToggle && (
            <div className="flex items-center gap-2">
              {view === 'expected' && (
                <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>
                  {t('explorerBlocks.map.match', { rate: formatFixed(audit!.matchRate, 1, t.locale) })}
                </span>
              )}
              <button
                type="button"
                onClick={() => setView(v => (v === 'actual' ? 'expected' : 'actual'))}
                className="alice-control alice-control--quiet font-numbers cursor-pointer"
                style={{
                  fontSize: 13, padding: '6px 12px', borderRadius: 3,
                  color: 'var(--alice-primary)',
                }}
              >
                {view === 'actual' ? t('explorerBlocks.map.showExpected') : t('explorerBlocks.map.showActual')}
              </button>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}
