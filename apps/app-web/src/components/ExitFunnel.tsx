'use client';

// The exit path of an off-chain coin, drawn as a funnel: the on-chain anchor
// at the top, then one row per presigned transaction showing only its
// outputs, the coin's branch filled in the network's accent and carrying
// its amount at that point, the other outputs (other people's coins)
// outlined with theirs, down to the coin. The step's name sits in the left
// margin. Two zones: the tree built by the server's round or batch (boxes,
// solid links, the leaf optionally marked with a key) and, under a divider,
// the spends made since outside any round (pills, dashed links). A spend may
// span two transactions (a checkpoint and the transaction spending it),
// drawn as one row; a run of spends moving the coin whole folds into one
// row, unfolded on a click and folded back from the small pill in the
// margin under it, clear of the link running down the middle.
// Hovering a row reports the first step it covers, so a legend list can
// highlight the same step.
//
// The model is the network's business: Bark and Arkade each build one from
// their own data (ExplorerBarkExitTree, ExplorerArkadeVtxo).

import { useState } from 'react';
import { formatLocale, useT } from '@/i18n';

export type FunnelOutput = { amountSats: number; ours: boolean };

export type FunnelStep = {
  /** The legend steps this row covers (a checkpoint and its spend: two). */
  from: number;
  to: number;
  /** The margin label, without the step numbers ("split", "leaf", "arkoor"). */
  label: string;
  /** The tree built by the server (boxes) or a spend made since (pills). */
  kind: 'tree' | 'spend';
  /** A leaf released by a secret: marked with a key. */
  key?: boolean;
  outputs: FunnelOutput[];
  /** The branch's amount after this row, shown in the filled box. */
  branchSats: number;
  unsigned?: boolean;
};

export type FunnelModel = {
  accent: string;
  /** The ink on the accent fill: white on Arkade's violet, the page
   *  background on Bark's text-coloured fill. */
  onAccent: string;
  /** The on-chain output everything hangs from: its transaction's name, the
   *  output's description with its amount, and the short id to open it. */
  anchor: { amountSats: number; title: string; detail: string; id: string; onOpen?: () => void };
  steps: FunnelStep[];
  /** The divider before the first spend: its margin title and its caption. */
  zone: { title: string; caption: string };
  /** The folded row's wording for a run of spends moving the coin whole. */
  foldLabel: (spends: number, txs: number) => string;
  coin: { amountSats: number; caption: string };
  /** The line under the coin ("then 144 blocks before spending"). */
  wait: string;
};

const GUTTER = 118;
const BOX_W = 62;
const BOX_H = 26;
const GAP = 6;
const ROW = 50;
// The anchor: its title sits above the box, like the coin's caption under
// its box, so the pixel font never has to fit inside a frame.
const ANCHOR_TITLE_H = 16;
const ANCHOR_BOX_H = 38;
const ANCHOR_H = ANCHOR_TITLE_H + ANCHOR_BOX_H;
const FOLD_H = 24;
const FOLD_W = 280;
const REFOLD_H = 18;
const REFOLD_W = 72;
const ZONE_H = 34;
// Wide enough for the fold pill and the anchor's title in the pixel font
// ("COMMITMENT TRANSACTION · ON-CHAIN", about 10 units a character).
const MIN_ROW_W = 340;
const COIN_W = 116;
const COIN_H = 30;
const PAD_RIGHT = 10;

/** Sats in a box: "4.32M", "160k", "6,765". */
export function compactSats(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString(formatLocale(), { maximumFractionDigits: 2 })}M`;
  if (n >= 10_000) return `${Math.round(n / 1_000).toLocaleString(formatLocale())}k`;
  return n.toLocaleString(formatLocale());
}

/** A curve from one point down to another, bending at mid-height. */
function link(x1: number, y1: number, x2: number, y2: number): string {
  const ym = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${ym}, ${x2} ${ym}, ${x2} ${y2}`;
}

type Row =
  | { kind: 'step'; step: FunnelStep }
  | { kind: 'fold'; from: number; to: number; spends: number }
  /** The pill in the margin under an unfolded run, folding it back. */
  | { kind: 'refold'; from: number; to: number }
  | { kind: 'zone' };

/** A small chevron, pointing down (unfold) or up (fold back). */
function chevron(x: number, y: number, up: boolean, color: string) {
  const d = up ? `M ${x - 3} ${y + 1.5} l 3 -3 l 3 3` : `M ${x - 3} ${y - 1.5} l 3 3 l 3 -3`;
  return <path d={d} fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" />;
}

export function ExitFunnel({ model, activeStep, onActiveStep }: {
  model: FunnelModel;
  /** The legend step highlighted; a row is active when it covers it. */
  activeStep: number | null;
  onActiveStep: (step: number | null) => void;
}) {
  const t = useT();
  const [unfolded, setUnfolded] = useState(false);
  const { accent, onAccent, steps } = model;
  if (steps.length === 0) return null;

  const rows: Row[] = [];
  let zoned = false;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (s.kind === 'spend' && !zoned) { zoned = true; if (i > 0) rows.push({ kind: 'zone' }); }
    // A run of two or more spends moving the coin whole folds into one row;
    // unfolded, its rows are followed by the pill that folds them back.
    if (s.kind === 'spend' && s.outputs.length === 1) {
      let last = i;
      while (last + 1 < steps.length && steps[last + 1].kind === 'spend' && steps[last + 1].outputs.length === 1) last++;
      if (last > i) {
        if (unfolded) {
          for (let k = i; k <= last; k++) rows.push({ kind: 'step', step: steps[k] });
          rows.push({ kind: 'refold', from: s.from, to: steps[last].to });
        } else {
          rows.push({ kind: 'fold', from: s.from, to: steps[last].to, spends: last - i + 1 });
        }
        i = last;
        continue;
      }
    }
    rows.push({ kind: 'step', step: s });
  }

  const maxOuts = Math.max(1, ...steps.map(s => s.outputs.length));
  const rowW = Math.max(maxOuts * BOX_W + (maxOuts - 1) * GAP, MIN_ROW_W);
  const W = GUTTER + rowW + PAD_RIGHT;
  const cx = GUTTER + rowW / 2;
  const rowY: number[] = [];
  let y = ANCHOR_H + 14;
  for (const r of rows) {
    rowY.push(y);
    y += r.kind === 'fold' ? FOLD_H + 20 : r.kind === 'refold' ? REFOLD_H + 10 : r.kind === 'zone' ? ZONE_H : ROW;
  }
  const coinY = y;
  const H = coinY + COIN_H + 44;
  const total = steps.length > 0 ? steps[steps.length - 1].to + 1 : 0;
  const hasSpend = steps.some(s => s.kind === 'spend');

  let prev = { x: cx, y: ANCHOR_H };
  const drawn = rows.map((r, k) => {
    const y0 = rowY[k];
    if (r.kind === 'zone') {
      const from = prev;
      prev = { x: cx, y: y0 + ZONE_H - 6 };
      return (
        <g key="zone">
          <path d={link(from.x, from.y, cx, y0 + 6)} fill="none" stroke={accent} strokeWidth={2} strokeDasharray="4 3" />
          <line x1={GUTTER} y1={y0 + 11} x2={GUTTER + rowW} y2={y0 + 11} stroke="var(--alice-border)" strokeDasharray="3 3" />
          <text x={GUTTER - 10} y={y0 + 12} textAnchor="end" dominantBaseline="middle" fontSize={9} className="font-pixel" fill="var(--alice-muted)" letterSpacing={1}>
            {model.zone.title}
          </text>
          <text x={cx} y={y0 + 22} textAnchor="middle" dominantBaseline="middle" fontSize={9} className="font-numbers" fill="var(--alice-muted)">
            {model.zone.caption}
          </text>
        </g>
      );
    }
    if (r.kind === 'fold') {
      const txs = r.to - r.from + 1;
      const active = activeStep !== null && activeStep >= r.from && activeStep <= r.to;
      const from = prev;
      prev = { x: cx, y: y0 + FOLD_H };
      const toggle = () => setUnfolded(true);
      return (
        <g
          key={`fold-${r.from}`}
          onMouseEnter={() => onActiveStep(r.from)}
          onMouseLeave={() => onActiveStep(null)}
          onClick={toggle}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
          role="button"
          tabIndex={0}
          aria-label={t('explorerExit.funnel.foldAria', { from: r.from + 1, to: r.to + 1, label: model.foldLabel(r.spends, txs) })}
          style={{ cursor: 'pointer' }}
        >
          <path d={link(from.x, from.y, cx, y0)} fill="none" stroke={accent} strokeWidth={2} strokeDasharray="4 3" />
          <rect
            x={cx - FOLD_W / 2} y={y0} width={FOLD_W} height={FOLD_H} rx={FOLD_H / 2}
            fill={active ? 'var(--alice-hover)' : 'transparent'}
            stroke={active ? 'var(--alice-primary)' : accent} strokeDasharray="3 3"
          />
          <text x={cx - 6} y={y0 + FOLD_H / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={10} className="font-numbers" fill="var(--alice-text)">
            {t('explorerExit.funnel.foldRow', { from: r.from + 1, to: r.to + 1, label: model.foldLabel(r.spends, txs) })}
          </text>
          {chevron(cx + FOLD_W / 2 - 12, y0 + FOLD_H / 2, false, 'var(--alice-muted)')}
        </g>
      );
    }
    if (r.kind === 'refold') {
      // In the margin, where the step labels sit, so the link running down
      // the middle to the coin never crosses it.
      const toggle = () => setUnfolded(false);
      const px = GUTTER - 10 - REFOLD_W;
      return (
        <g
          key={`refold-${r.from}`}
          onClick={toggle}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
          role="button"
          tabIndex={0}
          aria-label={t('explorerExit.funnel.refoldAria', { from: r.from + 1, to: r.to + 1 })}
          style={{ cursor: 'pointer' }}
        >
          <rect x={px} y={y0} width={REFOLD_W} height={REFOLD_H} rx={REFOLD_H / 2} fill="var(--alice-bg)" stroke="var(--alice-muted)" />
          <text x={px + REFOLD_W / 2 - 5} y={y0 + REFOLD_H / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={9.5} className="font-numbers" fill="var(--alice-muted)">
            {t('explorerExit.funnel.refold')}
          </text>
          {chevron(px + REFOLD_W / 2 + 14, y0 + REFOLD_H / 2, true, 'var(--alice-muted)')}
        </g>
      );
    }

    const s = r.step;
    const active = activeStep !== null && activeStep >= s.from && activeStep <= s.to;
    const spend = s.kind === 'spend';
    const rx = spend ? BOX_H / 2 : 3;
    const dash = spend ? '4 3' : undefined;
    const n = s.outputs.length;
    const ourIndex = Math.max(0, s.outputs.findIndex(o => o.ours));
    const outsW = n * BOX_W + (n - 1) * GAP;
    const x0 = cx - outsW / 2;
    const from = prev;
    const ourX = x0 + ourIndex * (BOX_W + GAP) + BOX_W / 2;
    prev = { x: ourX, y: y0 + BOX_H };
    const range = s.to > s.from ? `${s.from + 1}-${s.to + 1}` : `${s.from + 1}`;
    return (
      <g key={s.from} onMouseEnter={() => onActiveStep(s.from)} onMouseLeave={() => onActiveStep(null)}>
        {/* The hover zone of the whole row, margin included. */}
        <rect x={0} y={y0 - 12} width={W} height={ROW} fill="transparent" />
        <text x={GUTTER - 10} y={y0 + BOX_H / 2 + 1} textAnchor="end" dominantBaseline="middle" fontSize={10} className="font-numbers" fill={active ? 'var(--alice-text)' : 'var(--alice-muted)'}>
          {range} · {s.label}{s.unsigned ? ` · ${t('explorerExit.funnel.unsigned')}` : ''}
        </text>
        {s.outputs.map((o, k2) => {
          const bx = x0 + k2 * (BOX_W + GAP);
          const mid = bx + BOX_W / 2;
          return (
            <g key={k2}>
              <path d={link(from.x, from.y, mid, y0)} fill="none" stroke={o.ours ? accent : 'var(--alice-muted)'} strokeWidth={o.ours ? 2 : 1} opacity={o.ours ? 1 : 0.55} strokeDasharray={dash} />
              <rect
                x={bx} y={y0} width={BOX_W} height={BOX_H} rx={rx}
                fill={o.ours ? accent : active ? 'var(--alice-hover)' : 'transparent'}
                stroke={o.ours ? accent : active ? 'var(--alice-primary)' : 'var(--alice-muted)'}
                strokeWidth={active && !o.ours ? 1.5 : 1}
              />
              {o.ours && s.key && (
                // The key: a secret releases this leaf to its owner.
                <g stroke={onAccent} strokeWidth={1.5} fill="none" aria-hidden="true">
                  <circle cx={bx + 10} cy={y0 + BOX_H / 2} r={3} />
                  <path d={`M ${bx + 13} ${y0 + BOX_H / 2} h 7 m -2 0 v 3 m -3 -3 v 2`} />
                </g>
              )}
              <text x={mid + (o.ours && s.key ? 7 : 0)} y={y0 + BOX_H / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={10.5} className="font-numbers" fill={o.ours ? onAccent : 'var(--alice-muted)'}>
                {compactSats(o.ours ? s.branchSats : o.amountSats)}
              </text>
            </g>
          );
        })}
      </g>
    );
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto', overflow: 'visible' }}
      role="img"
      aria-label={t.plural('explorerExit.funnel.aria', total)}
    >
      <title>{t('explorerExit.funnel.title', { count: total })}</title>

      {/* The anchor: the Bitcoin output everything below hangs from. */}
      <g onClick={model.anchor.onOpen} style={{ cursor: model.anchor.onOpen ? 'pointer' : undefined }} role={model.anchor.onOpen ? 'link' : undefined} aria-label={model.anchor.onOpen ? t('explorerExit.funnel.openAnchor') : undefined}>
        <text x={cx} y={7} textAnchor="middle" dominantBaseline="middle" fontSize={9} className="font-pixel" fill="var(--alice-muted)" letterSpacing={1}>
          {model.anchor.title}
        </text>
        <rect x={GUTTER} y={ANCHOR_TITLE_H} width={rowW} height={ANCHOR_BOX_H} rx={3} fill="var(--alice-bg-soft)" stroke="var(--alice-border)" />
        <text x={cx} y={ANCHOR_TITLE_H + 13} textAnchor="middle" dominantBaseline="middle" fontSize={10.5} className="font-numbers" fill="var(--alice-text)">
          {model.anchor.detail}
        </text>
        <text x={cx} y={ANCHOR_TITLE_H + 27} textAnchor="middle" dominantBaseline="middle" fontSize={10} className="font-numbers" fill="var(--alice-primary)">
          {model.anchor.id}
        </text>
      </g>

      {drawn}

      {/* The coin. */}
      <path d={link(prev.x, prev.y, cx, coinY)} fill="none" stroke={accent} strokeWidth={2} strokeDasharray={hasSpend ? '4 3' : undefined} />
      <rect x={cx - COIN_W / 2} y={coinY} width={COIN_W} height={COIN_H} rx={3} fill={accent} />
      <text x={cx} y={coinY + COIN_H / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={12} className="font-numbers" fill={onAccent}>
        {model.coin.amountSats.toLocaleString(formatLocale())} sats
      </text>
      <text x={cx} y={coinY + COIN_H + 14} textAnchor="middle" dominantBaseline="middle" fontSize={9} className="font-pixel" fill="var(--alice-muted)" letterSpacing={1}>
        {model.coin.caption}
      </text>
      <text x={cx} y={coinY + COIN_H + 29} textAnchor="middle" dominantBaseline="middle" fontSize={10} className="font-numbers" fill="var(--alice-muted)">
        {model.wait}
      </text>
    </svg>
  );
}
