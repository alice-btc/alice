'use client';

// The address's unspent outputs as packed circles, echoing mempool.space's
// "Unspent Outputs" view but in the Alice palette: one circle per UTXO, area is
// value, the biggest coins carry a label. It answers "how is this balance split
// up, and how chunky is each piece?" at a glance.

import { useMemo, useState } from 'react';
import { formatLocale, useT } from '@/i18n';
import { packUtxos, type PackInput } from '@/lib/explorer/utxo-pack';
import { AmountShort, formatAmount, useAmountState, WithBitcoinGlyph } from '@/components/AmountDisplay';

// All circles use the theme's accent colour; size still reads value, and the
// chunkier coins carry a touch more opacity so they stand out a little.
function fillOpacity(ratio: number): number {
  return 0.5 + ratio * 0.45;
}


export function ExplorerUtxoBubbles({ utxos, confidential = false, title }: {
  utxos: PackInput[];
  confidential?: boolean;
  /** Panel heading; Arkade shows the same view for its spendable VTXOs. */
  title?: string;
}) {
  const t = useT();
  const unit = useAmountState();
  // On Liquid the amounts are blinded: pack every coin at an equal nominal size
  // so the graph still shows how many outputs there are (and that there is only
  // one, when there is), without pretending to know their values.
  const packInput = useMemo(
    () => (confidential ? utxos.map(u => ({ ...u, valueSats: 1 })) : utxos),
    [utxos, confidential],
  );
  const layout = useMemo(() => packUtxos(packInput), [packInput]);
  const [hover, setHover] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  if (layout.circles.length === 0) return null;

  const held = utxos.reduce((s, u) => s + u.valueSats, 0);
  const capped = utxos.length > layout.shown;

  return (
    <div
      className="flex flex-col gap-2 px-4 py-3"
      style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 3, backgroundColor: 'transparent' }}
    >
      <div className="flex items-center justify-between">
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
          {title ?? t('explorer.address.unspent')}
        </span>
        <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
          {t.plural('explorer.utxos.coins', utxos.length, { n: utxos.length.toLocaleString(formatLocale()) })} - {confidential ? t('explorer.utxos.amountHidden') : <WithBitcoinGlyph text={formatAmount(held, unit)} />}
        </span>
      </div>

      {/* Rendered at its natural pixel size (capped to the panel width), so the
          biggest coin is a fixed size on every address rather than stretching to
          fill the row. */}
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width={layout.width}
        height={layout.height}
        style={{ display: 'block', maxWidth: '100%', height: 'auto', maxHeight: 340, margin: '4px auto' }}
        role="group"
        aria-label={t('explorer.utxos.graphLabel', { count: utxos.length })}
      >
        {layout.circles.map((c, i) => {
          const ratio = c.r / layout.maxR;
          const labelled = !confidential && c.r >= layout.maxR * 0.5;
          const isHover = hover === i || selected === i;
          return (
            <g
              key={i}
              role="button"
              tabIndex={0}
              aria-label={t('explorer.utxos.outputLabel', { n: i + 1, amount: confidential ? t('explorer.utxos.amountHidden') : formatAmount(c.valueSats, unit) })}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              onFocus={() => setSelected(i)}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(i); } }}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(h => (h === i ? null : h))}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <circle
                cx={c.x}
                cy={c.y}
                r={c.r}
                fill="var(--alice-primary)"
                opacity={isHover ? 1 : fillOpacity(ratio)}
                stroke={isHover ? 'var(--alice-text)' : 'none'}
                strokeWidth={isHover ? 1.2 : 0}
              >
                <title>{confidential ? t('explorer.utxos.amountHiddenConfidential') : formatAmount(c.valueSats, unit)}</title>
              </circle>
              {labelled && (
                // HTML rather than <text>, so the ₿ can be the glyph: the
                // interface fonts have no U+20BF.
                <foreignObject x={c.x - c.r} y={c.y - c.r} width={c.r * 2} height={c.r * 2} style={{ pointerEvents: 'none' }}>
                  <div
                    aria-hidden
                    style={{
                      width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--alice-bg)', fontSize: Math.max(8, c.r * 0.34), fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap',
                    }}
                  >
                    <AmountShort sats={c.valueSats} unit={unit} />
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>

      <details className="font-numbers text-sm">
        <summary className="alice-control alice-control--quiet cursor-pointer">{t('explorer.utxos.inspectList')}</summary>
        <div className="flex flex-col max-h-64 overflow-auto">
          {layout.circles.map((coin, i) => (
            <button key={i} type="button" className="alice-control alice-control--option w-full"
              aria-pressed={selected === i}
              onFocus={() => setSelected(i)} onClick={() => setSelected(i)}>
              <span>{selected === i ? t('explorer.utxos.selected') : ''}{t('explorer.utxos.output', { n: i + 1 })}</span>
              <span>{confidential ? t('explorer.utxos.amountHiddenCap') : <WithBitcoinGlyph text={formatAmount(coin.valueSats, unit)} />}</span>
            </button>
          ))}
        </div>
      </details>
      <p className="font-numbers m-0" style={{ fontSize: 11, color: 'var(--alice-muted)', opacity: 0.7 }}>
        {confidential
          ? t('explorer.utxos.legendConfidential')
          : t('explorer.utxos.legend')}
        {capped && t('explorer.utxos.capped', { shown: layout.shown, total: utxos.length.toLocaleString(formatLocale()) })}
      </p>
    </div>
  );
}
