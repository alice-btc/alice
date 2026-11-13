'use client';

// A bitcoin amount that renders in the user's preferred unit and cycles it on
// click, exactly like the main wallet's balance: ₿ (sats with the symbol) →
// sats → BTC → fiat. The preference is the SAME stored one the wallet uses
// (alice_balance_format via alice-ui), so both surfaces always agree, and the
// fiat leg uses the wallet's currency preference and the price from the same
// mempool server the Explorer reads (see priceUrl).
//
// One module-level store keeps every Amount on the page in step: clicking any
// of them switches all of them (and persists the choice).

import { useEffect, useSyncExternalStore } from 'react';
// Deep imports on purpose: the alice-ui barrel exports React Native components
// the web type-check chokes on; these two modules are pure TypeScript.
import {
  getBalanceFormat, setBalanceFormat, nextFormat, formatWalletAmount,
  type BalanceFormat,
} from '@alice-wallet/alice-ui/balance-format';
import {
  getFiatCurrency, CURRENCY_SYMBOL, type FiatCurrency,
} from '@alice-wallet/alice-ui/fiat-currency';
import { BITCOIN_ICON_SVG } from '@alice-wallet/alice-ui/components/bitcoin-icon-svg';
import { formatLocale, useT } from '@/i18n';
import { effectiveBaseUrl } from '@/lib/explorer/node-config';
import { DEFAULT_NETWORK_ID } from '@/lib/explorer/networks';
import { localVault } from '@/lib/local-vault';

export type AmountState = {
  format: BalanceFormat;
  currency: FiatCurrency;
  price: number | null;
};

let state: AmountState = { format: 'symbol', currency: 'USD', price: null };
const listeners = new Set<() => void>();
function emit() { for (const l of listeners) l(); }
function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

const PRICE_TTL_MS = 2 * 60 * 1000;
let priceFetchedAt = 0;
let initStarted = false;

// The price is asked for only while amounts show in fiat: in ₿, sats or BTC
// it is never used, and every request tells the price source this device's IP.
function refreshPrice(): void {
  if (state.format !== 'usd') return;
  if (Date.now() - priceFetchedAt < PRICE_TTL_MS) return;
  priceFetchedAt = Date.now();
  const currency = state.currency;
  void priceUrl()
    .then(url => (url ? fetch(url) : Promise.reject(new Error('no price source'))))
    .then(r => r.json())
    .then((d: Record<string, unknown>) => {
      const p = d[currency];
      if (typeof p === 'number' && Number.isFinite(p) && p > 0 && currency === state.currency) {
        state = { ...state, price: p }; emit();
      }
    })
    .catch(() => { /* fiat shows "..." until a fetch lands */ });
}

/** The price endpoint: `/v1/prices` of the mempool server the Explorer uses for
 *  Bitcoin, the person's own node when they set one, mempool.space otherwise.
 *  No extra party learns this device's IP: it is a server the Explorer already
 *  talks to. A bare Esplora node has no prices, and fiat then stays "...":
 *  a chosen node is never bypassed for a third party. */
async function priceUrl(): Promise<string | null> {
  await localVault.ready();
  const base = effectiveBaseUrl(DEFAULT_NETWORK_ID);
  return base ? `${base.replace(/\/$/, '')}/v1/prices` : null;
}

function ensureInit(): void {
  if (initStarted) return;
  initStarted = true;
  void getBalanceFormat().then(f => { state = { ...state, format: f }; emit(); refreshPrice(); });
  void getFiatCurrency().then(c => {
    if (c !== state.currency) { state = { ...state, currency: c }; priceFetchedAt = 0; emit(); }
    refreshPrice();
  });
}

/** Advance to the next unit and persist it, wallet-style. */
export function cycleAmountFormat(): void {
  const next = nextFormat(state.format);
  state = { ...state, format: next };
  emit();
  void setBalanceFormat(next);
  refreshPrice();
}

/** Set an explicit unit (the Settings picker) and persist it. */
export function setAmountFormat(format: BalanceFormat): void {
  state = { ...state, format };
  emit();
  void setBalanceFormat(format);
  refreshPrice();
}

export function useAmountState(): AmountState {
  const snap = useSyncExternalStore(subscribe, () => state, () => state);
  useEffect(() => { ensureInit(); refreshPrice(); }, []);
  return snap;
}

/** Pure text for an amount in the current unit; '₿ ' prefixes the symbol mode. */
export function formatAmount(sats: number, s: AmountState, signed = false): string {
  const abs = Math.abs(sats);
  const body = formatWalletAmount(abs, s.format, s.price, CURRENCY_SYMBOL[s.currency]);
  const withUnit = s.format === 'symbol' ? `₿ ${body}` : body;
  if (!signed) return withUnit;
  return `${sats < 0 ? '-' : '+'}${withUnit}`;
}

/** True for the symbol mode, the one whose unit is the ₿ glyph. */
function isSymbolFormat(format: BalanceFormat): boolean {
  return format !== 'sats' && format !== 'btc' && format !== 'usd';
}

/** Compact text for tight spots (bubble labels, chart axes): the same unit,
 *  abbreviated numbers (12.3k sats, 0.25 BTC, $1.2k, ₿ 45k). */
export function formatAmountShort(sats: number, s: AmountState): string {
  const body = formatAmountShortBody(sats, s);
  return isSymbolFormat(s.format) ? `₿ ${body}` : body;
}

/** formatAmountShort without the '₿ ' of the symbol mode, for the labels
 *  that draw the glyph instead (see AmountShort). */
export function formatAmountShortBody(sats: number, s: AmountState): string {
  const compact = (n: number): string => {
    if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;
    if (n >= 1e4) return `${(n / 1e3).toFixed(0)}k`;
    return n.toLocaleString(formatLocale());
  };
  const abs = Math.abs(sats);
  switch (s.format) {
    case 'sats': return `${compact(abs)} sats`;
    case 'btc': {
      const b = abs / 1e8;
      return `${b >= 0.1 ? b.toFixed(2) : b.toFixed(4)} BTC`;
    }
    case 'usd': {
      if (!s.price) return '...';
      const v = (abs / 1e8) * s.price;
      return `${CURRENCY_SYMBOL[s.currency]}${v >= 10_000 ? compact(Math.round(v)) : v.toLocaleString(formatLocale(), { maximumFractionDigits: v >= 100 ? 0 : 2 })}`;
    }
    case 'symbol':
    default:
      return compact(abs);
  }
}

// The wallet's pixel-art ₿, scaled to the surrounding font and painted with
// the surrounding colour. The interface fonts have no U+20BF, so text that
// shows the sign draws this glyph instead; only plain strings that cannot
// hold markup (native tooltips, aria labels) keep the '₿' character.
// 1.1em mirrors the wallet's own ratio (a 56px icon against a 48px balance):
// the symbol deliberately stands slightly taller than the digits.
const GLYPH_HTML = BITCOIN_ICON_SVG
  .replaceAll('{{COLOR}}', 'currentColor')
  .replace('<svg ', '<svg style="height:1.1em;width:auto;display:block" ');

/** The ₿ glyph, inline with the text around it. `spaced` keeps the gap the
 *  amounts put between the sign and the number. */
export function BitcoinGlyph({ spaced = true }: { spaced?: boolean } = {}) {
  return (
    <span
      aria-hidden
      style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: '-0.15em', marginRight: spaced ? '0.3em' : undefined }}
      dangerouslySetInnerHTML={{ __html: GLYPH_HTML }}
    />
  );
}

/** `text` with each '₿' drawn as the glyph, for a sentence such as
 *  "Plan ₿ Academy". The character stays for screen readers. */
export function WithBitcoinGlyph({ text }: { text: string }) {
  const parts = text.split('₿');
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {index > 0 && (
            <>
              <span className="sr-only">₿</span>
              <BitcoinGlyph spaced={false} />
            </>
          )}
          {part}
        </span>
      ))}
    </>
  );
}

/** formatAmountShort as markup: the glyph, then the compact number. */
export function AmountShort({ sats, unit }: { sats: number; unit: AmountState }) {
  return (
    <>
      {isSymbolFormat(unit.format) && <BitcoinGlyph />}
      <span>{formatAmountShortBody(sats, unit)}</span>
    </>
  );
}

/**
 * The clickable amount. A <span role="button"> rather than a <button>, so it
 * can live inside clickable cards without nesting buttons; the click cycles
 * the unit everywhere and never triggers the surrounding card.
 */
export function Amount({
  sats, signed = false, style,
}: {
  sats: number;
  /** Show a +/- prefix (a flow rather than a balance). */
  signed?: boolean;
  style?: React.CSSProperties;
}) {
  const t = useT();
  const s = useAmountState();
  return (
    <span
      role="button"
      tabIndex={0}
      title={t('amount.cycle')}
      className="alice-amount font-numbers cursor-pointer"
      style={{ display: 'inline-flex', alignItems: 'center', ...style }}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); cycleAmountFormat(); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); cycleAmountFormat(); } }}
    >
      {s.format === 'symbol' ? (
        <>
          {signed && <span>{sats < 0 ? '-' : '+'}</span>}
          <BitcoinGlyph />
          <span>{formatWalletAmount(Math.abs(sats), s.format, s.price, CURRENCY_SYMBOL[s.currency])}</span>
        </>
      ) : (
        formatAmount(sats, s, signed)
      )}
    </span>
  );
}
