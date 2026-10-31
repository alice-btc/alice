'use client';

// The /playground page: a Padawan-style practice environment on Mutinynet,
// styled after the mobile wallet's home (big pixel balance with the wallet's ₿
// glyph, corner-bracket buttons, inline history) plus a settings view holding
// the unit switcher, coin control, the address book and wallet deletion.
// Real Bitcoin mechanics, valueless coins, Alice teaching at every step.
// Keys live in localStorage under alice.test-wallet.* (the pre-rename prefix,
// kept so existing practice wallets survive) and never touch the
// real wallet or the AI modules; the "Ask Alice" buttons only prefill the
// chat with a plain-text question. Faucet claims go through Alice's relay,
// which fixes the amount to 1,000 sats and rate limits per IP and per day.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { PRACTICE_LESSONS, type PracticeLesson } from '@alice-wallet/alice-content';
import { useChat } from '@alice-wallet/alice-ai';
import { useT, type MessageKey, type Translator } from '@/i18n';
import {
  PRACTICE_DUST_SATS,
  PRACTICE_FAUCET_URL,
  PRACTICE_WORDLIST,
  maxPracticeSendable,
  type PracticeTxPlan,
} from '@alice-wallet/practice-wallet';
import { formatWalletAmount, type BalanceFormat } from '@alice-wallet/alice-ui/balance-format';
import { CORNER_SVG } from '@alice-wallet/alice-ui/components/corner-svg';
import { BITCOIN_ICON_SVG } from '@alice-wallet/alice-ui/components/bitcoin-icon-svg';
import { NUT_ICON, BACK_ICON, NEXT_ICON, REFRESH_ICON, QR_ICON, UP_ICON, RECEIVE_ICON, COPY_ICON, CHECK_ICON, KEY_ICON, DELETE_ICON, WALLET_ICON } from '@/lib/atelier-icons';
import { WorkspaceHeaderActions } from '@/components/WorkspaceShell';
import { setAskHandoff, usePhoneLayout } from '@/lib/explorer/ask-handoff';
import { EmptyState, FieldLabel } from '@/components/ExplorerUI';
import { PlaygroundIntroModal, wasPlaygroundIntroDismissed } from '@/components/PlaygroundIntroModal';
import { AskAliceDock } from '@/components/AskAliceDock';
import { AskAliceFab } from '@/components/AskAliceFab';
import { ExplorerQrScanner } from '@/components/ExplorerQrScanner';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { SvgIcon } from '@/components/SvgIcon';
import { ExplorerBalanceChart } from '@/components/ExplorerBalanceChart';
import { setAmountFormat, useAmountState, type AmountState } from '@/components/AmountDisplay';
import type { BalancePoint } from '@/lib/explorer/balance-history';
import { openPlaygroundTxInExplorer } from '@/lib/playground-explorer';
import { ASK_WIDTH_DEFAULT, clampAskWidth, loadAskWidth, saveAskWidth } from '@/lib/ask-width';
import { consumePendingPlaygroundView } from '@/lib/playground-open';
import {
  buildPlaygroundFullContext,
  buildPlaygroundSignals,
  playgroundModelPageName,
  playgroundPageName,
} from '@/lib/playground-signals';
import {
  broadcastPlaygroundSend,
  claimPlaygroundFaucet,
  createPlaygroundIfNeeded,
  deletePlayground,
  formatTestSats,
  getPlaygroundMnemonicWords,
  hasClaimedPlaygroundFaucet,
  hasPlayground,
  isPlaygroundBackedUp,
  markPlaygroundBackedUp,
  loadPlaygroundSnapshot,
  planPlaygroundSend,
  readCachedPlaygroundSnapshot,
  playgroundFeeRate,
  rotatePlaygroundReceiveAddress,
  signPlaygroundSend,
  playgroundPaymentUri,
  truncateMiddle,
  type PlaygroundSignedSend,
  type PlaygroundSnapshot,
} from '@/lib/playground';
import { openExternalUrl } from '@/lib/open-external';

const BADGE_BG = 'var(--alice-danger)';
const BADGE_TEXT = 'var(--alice-on-danger)';

// The mobile wallet's own settings cog, same asset as the app's other icons.

// The wallet's pixel-art ₿, painted with the surrounding colour and scaled to
// the surrounding font, exactly like the mobile balance and the Explorer.
const BITCOIN_GLYPH_HTML = BITCOIN_ICON_SVG
  .replaceAll('{{COLOR}}', 'currentColor')
  .replace('<svg ', '<svg style="height:1.05em;width:auto;display:block" ');

// Sats have no market value here, so fiat is not an option: the shared unit
// preference is coerced to the ₿ symbol whenever it says USD.
const TEST_UNITS: BalanceFormat[] = ['symbol', 'sats', 'btc'];

function coerceTestUnit(s: AmountState): AmountState {
  return s.format === 'usd' ? { ...s, format: 'symbol' } : s;
}

function cycleTestUnit(current: AmountState): void {
  const format = coerceTestUnit(current).format;
  const index = TEST_UNITS.indexOf(format);
  setAmountFormat(TEST_UNITS[(index + 1) % TEST_UNITS.length]);
}

function BitcoinGlyph() {
  return (
    <span
      aria-hidden
      style={{ display: 'inline-flex', alignItems: 'center', marginRight: '0.3em' }}
      dangerouslySetInnerHTML={{ __html: BITCOIN_GLYPH_HTML }}
    />
  );
}

/** An amount in the selected unit, with the real pixel ₿ glyph. */
function TestAmount({
  sats,
  state,
  signed = false,
  fontSize,
  color,
}: {
  sats: number;
  state: AmountState;
  signed?: boolean;
  fontSize: number;
  color: string;
}) {
  const s = coerceTestUnit(state);
  const body = formatWalletAmount(Math.abs(sats), s.format, s.price);
  return (
    <span className="font-pixel" style={{ display: 'inline-flex', alignItems: 'center', fontSize, color }}>
      {signed && (sats < 0 ? '-' : '+')}
      {s.format === 'symbol' && <BitcoinGlyph />}
      {body}
    </span>
  );
}

// The settings nut and the page title. On a phone the shell's header already
// says Playground, so the nut moves up there, at the right of that title, and
// the page's own title row goes; the sub views keep Back and their title.
function PlaygroundHeading({ exists, inSubView, title, onToggle }: {
  exists: boolean;
  inSubView: boolean;
  title: string;
  onToggle: () => void;
}) {
  const phone = usePhoneLayout();
  const t = useT();
  const button = exists && (
    <button
      onClick={onToggle}
      aria-label={inSubView ? t('common.back') : t('playground.settingsButton')}
      className="alice-control alice-control--tool"
    >
      {inSubView
        ? <SvgIcon svg={BACK_ICON} size={16} />
        : <SvgIcon svg={NUT_ICON} size={20} />}
    </button>
  );
  if (phone && !inSubView) return <WorkspaceHeaderActions>{button}</WorkspaceHeaderActions>;
  return (
    <div className="flex items-center gap-3">
      {button}
      <h1 className="font-pixel tracking-widest" style={{ fontSize: 16, color: 'var(--alice-text)', lineHeight: 1.7 }}>
        {title}
      </h1>
    </div>
  );
}

function MutinynetBadge() {
  const t = useT();
  return (
    <span
      className="font-numbers inline-flex items-center px-2 py-1"
      style={{ fontSize: 12, color: 'var(--alice-muted)' }}
    >
      {t('playground.badge')}
    </span>
  );
}

/** Training card on the shared Atelier surface. */
function PixelCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderTop: '1px solid var(--alice-border)',
        backgroundColor: 'transparent',
      }}
    >
      {children}
    </div>
  );
}

/** Web replica of the mobile wallet's corner-bracket action button. */
function CornerButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  // The source SVG carries an intrinsic 1000px size; pin it to the corner box.
  const corner = useMemo(
    () => CORNER_SVG
      .replaceAll('{{COLOR}}', 'currentColor')
      .replace('width="1000"', 'width="20" style="display:block"')
      .replace('height="1000"', 'height="20"'),
    [],
  );
  const cornerStyle = (rotate: number, pos: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    width: 20,
    height: 20,
    transform: `rotate(${rotate}deg)`,
    ...pos,
  });
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="alice-control playground-corner relative"
      style={{ width: 140, height: 70, color: 'var(--alice-primary)' }}
    >
      <span aria-hidden style={cornerStyle(90, { top: 0, left: 0 })} dangerouslySetInnerHTML={{ __html: corner }} />
      <span aria-hidden style={cornerStyle(180, { top: 0, right: 0 })} dangerouslySetInnerHTML={{ __html: corner }} />
      <span aria-hidden style={cornerStyle(0, { bottom: 0, left: 0 })} dangerouslySetInnerHTML={{ __html: corner }} />
      <span aria-hidden style={cornerStyle(270, { bottom: 0, right: 0 })} dangerouslySetInnerHTML={{ __html: corner }} />
      <span className="font-pixel tracking-widest" style={{ fontSize: 11 }}>{label}</span>
    </button>
  );
}

// The Playground → Learn bridge, symmetric to the chapters' "try it" button:
// a lesson card can carry a discreet link to the course that explains the
// concept in depth. Course-level for now, chapter-level once the mapping in
// learn/playground-suggest grows per-chapter targets.
function Lesson({ lesson, learnCourse }: { lesson: PracticeLesson; learnCourse?: string }) {
  const router = useRouter();
  const t = useT();
  return (
    <div className="px-3 py-3" style={{ borderLeft: '2px solid var(--alice-border)' }}>
      <div className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-primary-dark)' }}>
        {lesson.title}
      </div>
      <p className="font-numbers mt-2" style={{ fontSize: 14, lineHeight: '20px', color: 'var(--alice-muted)' }}>
        {lesson.body}
      </p>
      {learnCourse && (
        <button
          type="button"
          className="alice-control alice-control--link mt-2"

          onClick={() => router.push(`/learn/?course=${learnCourse}`)}
        >
          {t('playground.lesson.learnWhy')} <SvgIcon svg={NEXT_ICON} size={16} />
        </button>
      )}
    </div>
  );
}


function PrimaryButton({
  label,
  onClick,
  disabled,
  danger,
  icon = NEXT_ICON,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  icon?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`alice-control w-full ${danger ? 'alice-control--danger-solid' : 'alice-control--primary'}`}
    >
      <SvgIcon svg={danger ? DELETE_ICON : icon} size={20} />
      {label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between py-2"
      style={{ borderBottom: '1px dotted var(--alice-border)' }}
    >
      <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>{label}</span>
      <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-text)' }}>{value}</span>
    </div>
  );
}

/**
 * Settings list row, mobile settings style. A div rather than a button so a
 * row can carry interactive content (the unit switcher) without nesting
 * buttons, which is invalid HTML and breaks hydration.
 */
function SettingsRow({
  label,
  right,
  onClick,
  danger,
  last,
}: {
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className="playground-settings-row flex w-full items-center justify-between px-4 py-4 text-left"
      style={{
        borderBottom: last ? 'none' : '1px dotted var(--alice-border)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span
        className="font-numbers"
        style={{ fontSize: 14, color: danger ? BADGE_BG : 'var(--alice-text)' }}
      >
        {label}
      </span>
      <span className="font-numbers flex items-center gap-2" style={{ fontSize: 13, color: 'var(--alice-muted)' }}>
        {right}
      </span>
    </div>
  );
}

/** The mobile settings unit switcher: ₿ | sats | BTC. */
function UnitSwitcher({ state }: { state: AmountState }) {
  const active = coerceTestUnit(state).format;
  const t = useT();
  return (
    <span className="inline-flex flex-wrap" role="group" aria-label={t('playground.unit.label')}>
      {TEST_UNITS.map((unit) => {
        const isActive = unit === active;
        return (
          <button
            key={unit}
            onClick={() => setAmountFormat(unit)}
            className="alice-control alice-control--choice"

           aria-pressed={isActive}>
            {unit === 'symbol' ? <BitcoinGlyph /> : unit === 'sats' ? 'sats' : 'BTC'}
          </button>
        );
      })}
    </span>
  );
}

/** Confirmed history as a cumulative balance series, oldest first. */
function buildBalancePoints(snapshot: PlaygroundSnapshot): BalancePoint[] {
  const confirmed = snapshot.history
    .filter((entry) => entry.confirmed && entry.blockTime)
    .sort((a, b) => (a.blockTime ?? 0) - (b.blockTime ?? 0));
  let balance = 0;
  const points: BalancePoint[] = confirmed.map((entry) => {
    balance += entry.direction === 'incoming' ? entry.amountSats : -entry.amountSats;
    return { t: entry.blockTime ?? 0, balanceSats: balance };
  });
  if (points.length > 0) {
    points.push({ t: Math.floor(Date.now() / 1000), balanceSats: snapshot.balanceSats });
  }
  return points;
}

// Sparrow-style: one screen, the whole transaction laid bare and colour
// coded, updating as the amount is typed. No wizard, no repetition: the
// anatomy IS the lesson, and the two buttons underneath lead to the course
// and to Alice for anything the labels do not answer.
type SendPhase = 'building' | 'signed' | 'sent';

/** One colour per part of a transaction, reused by the legend and the rows. */
const TX_COLORS = {
  input: 'var(--alice-primary)',
  recipient: 'var(--alice-success)',
  change: 'var(--alice-warning)',
  fee: 'var(--alice-danger)',
} as const;

/**
 * The question the send screen hands to Alice, written from what is actually
 * on screen. Deliberately not a link to a course: an answer costs one
 * keystroke, a course costs an evening, and Alice can recommend the lesson
 * herself once she knows what the person is stuck on.
 */
function draftQuestion(t: Translator, plan: PracticeTxPlan | null): string {
  if (!plan) return t('playground.ask.draftNone');
  const change = plan.changeSats > 0
    ? t('playground.ask.draftChange', { sats: plan.changeSats })
    : t('playground.ask.draftNoChange');
  return t('playground.ask.draft', {
    inputs: plan.inputs.length,
    total: plan.totalInputSats,
    amount: plan.amountSats,
    change,
    fee: plan.feeSats,
  });
}

function TxPartRow({
  color,
  label,
  detail,
  value,
  strong,
}: {
  color: string;
  label: string;
  detail?: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px dotted var(--alice-border)' }}>
      <span aria-hidden style={{ width: 4, alignSelf: 'stretch', backgroundColor: color, borderRadius: 1 }} />
      <span className="flex flex-col flex-1 min-w-0">
        <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-primary-dark)' }}>{label}</span>
        {detail && (
          <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>{detail}</span>
        )}
      </span>
      <span
        className="font-pixel shrink-0"
        style={{ fontSize: strong ? 11 : 9, color: strong ? 'var(--alice-primary-dark)' : 'var(--alice-text)' }}
      >
        {value}
      </span>
    </div>
  );
}

function SendFlow({
  snapshot,
  onDone,
  onExit,
  onPlanChange,
  onAskAlice,
}: {
  snapshot: PlaygroundSnapshot;
  onDone: () => void;
  onExit: () => void;
  onPlanChange: (plan: PracticeTxPlan | null) => void;
  onAskAlice: (question: string) => void;
}) {
  const router = useRouter();
  const t = useT();
  const [phase, setPhase] = useState<SendPhase>('building');
  const [address, setAddress] = useState('');
  const [amountText, setAmountText] = useState('');
  const [feeRate, setFeeRate] = useState<number | null>(null);
  const [signed, setSigned] = useState<PlaygroundSignedSend | null>(null);
  const [txid, setTxid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [receiptCopied, setReceiptCopied] = useState(false);

  // The network's own fee rate, fetched once: the breakdown is only honest if
  // it prices the transaction the way the network will.
  useEffect(() => {
    let cancelled = false;
    void playgroundFeeRate()
      .then((rate) => { if (!cancelled) setFeeRate(rate); })
      .catch(() => { if (!cancelled) setFeeRate(1); });
    return () => { cancelled = true; };
  }, []);

  // Accepts a bare address or a bip21 URI (bitcoin:tb1...?amount=0.0001).
  // Memoized on purpose: the scanner keys its camera effect on this callback,
  // so a fresh identity each render would reopen the camera each render.
  const applyScannedPayment = useCallback((text: string) => {
    let value = text.trim();
    if (/^bitcoin:/i.test(value)) {
      const [addr, query] = value.slice('bitcoin:'.length).split('?');
      value = addr;
      const amountBtc = Number(new URLSearchParams(query ?? '').get('amount'));
      if (Number.isFinite(amountBtc) && amountBtc > 0) {
        setAmountText(String(Math.round(amountBtc * 1e8)));
      }
    }
    setAddress(value);
    setScanOpen(false);
  }, []);

  // Emptying the wallet. The fee has to come out of the same coins, so the
  // most that can be sent is the balance minus the fee for spending every
  // coin into a single output. Offering the balance itself, as this screen
  // used to, asks for an amount the wallet can never afford: the wallet
  // answered "insufficient funds" about its own balance.
  const sweep = useMemo(() => {
    if (feeRate === null) return null;
    const spendable = snapshot.utxos.filter((coin) => coin.confirmed);
    if (spendable.length === 0) return null;
    // The recipient's address decides the size of the only output, so MAX is
    // exact once one is typed and priced as our own until then.
    return maxPracticeSendable({
      utxos: spendable,
      feeRateSatVb: feeRate,
      recipientAddress: address.trim() || undefined,
    });
  }, [address, feeRate, snapshot.utxos]);

  // The plan is derived, not stored: every keystroke re-plans, so what the
  // screen shows is always what would actually be signed.
  const { plan, planError } = useMemo(() => {
    const amountSats = Number(amountText);
    if (!address.trim() || !amountText || !Number.isFinite(amountSats) || feeRate === null) {
      return { plan: null, planError: null };
    }
    try {
      return {
        plan: planPlaygroundSend({
          utxos: snapshot.utxos,
          recipientAddress: address.trim(),
          amountSats,
          feeRateSatVb: feeRate,
          changeAddress: snapshot.changeAddress,
        }),
        planError: null,
      };
    } catch (cause) {
      return { plan: null, planError: cause instanceof Error ? cause.message : String(cause) };
    }
  }, [address, amountText, feeRate, snapshot.utxos, snapshot.changeAddress]);

  // Publish the draft upward so Alice's attachment describes what is on screen.
  useEffect(() => { onPlanChange(plan); }, [plan, onPlanChange]);
  useEffect(() => () => onPlanChange(null), [onPlanChange]);

  // Editing after signing invalidates the signature: drop it rather than let
  // the screen show bytes that no longer match the plan.
  useEffect(() => {
    setSigned(null);
    setPhase((current) => (current === 'signed' ? 'building' : current));
  }, [address, amountText]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    fontSize: 14,
    color: 'var(--alice-text)',
    backgroundColor: 'transparent',
    border: '1px solid var(--alice-control-border)',
    borderRadius: 'var(--alice-radius-control)',
  };

  if (phase === 'sent' && txid && plan) {
    return (
      <PixelCard>
        <div
          className="flex flex-col items-center gap-3 p-6"
          style={{ backgroundColor: 'transparent', borderRadius: 'var(--alice-radius-control)' }}
        >
          <span className="font-pixel tracking-widest pt-2" style={{ fontSize: 12, color: 'var(--alice-text)' }}>
            {t('playground.send.submitted')}
          </span>
          <span className="font-numbers" style={{ fontSize: 48, lineHeight: '54px', color: 'var(--alice-text)' }}>
            -{formatTestSats(plan.amountSats)}
          </span>
          <span aria-hidden className="my-4" style={{ width: 44, height: 3, backgroundColor: 'var(--alice-border)' }} />
          <span className="font-pixel tracking-widest" style={{ fontSize: 11, color: 'var(--alice-text)' }}>{t('playground.send.to')}</span>
          <button
            className="alice-control alice-control--quiet flex-col"
            onClick={() => {
              void navigator.clipboard.writeText(plan.recipientAddress).then(() => {
                setReceiptCopied(true);
                setTimeout(() => setReceiptCopied(false), 1800);
              });
            }}
          >
            <span className="font-numbers break-all text-center" style={{ fontSize: 14, lineHeight: '19px', color: 'var(--alice-text)', maxWidth: 460 }}>
              {plan.recipientAddress}
            </span>
            <span className="font-numbers tracking-wider" style={{ fontSize: 12, color: 'var(--alice-text)' }}>
              {receiptCopied ? t('playground.copied') : t('playground.send.tapToCopy')}
            </span>
          </button>
          <span className="font-pixel tracking-widest mt-4" style={{ fontSize: 11, color: 'var(--alice-text)' }}>
            {t('playground.tx.title')}
          </span>
          <button
            onClick={() => openPlaygroundTxInExplorer(txid, (path) => router.push(path), t('playground.explorerLabel.sent'))}
            className="alice-control alice-control--link flex-col"
          >
            <span className="font-numbers break-all text-center" style={{ fontSize: 13, lineHeight: '18px', color: 'var(--alice-text)', maxWidth: 460 }}>
              {txid}
            </span>
            <span className="font-numbers tracking-wider" style={{ fontSize: 12, color: 'var(--alice-text)' }}>
              {t('playground.openInExplorer')}
            </span>
          </button>
          <button
            onClick={onDone}
            className="alice-control alice-control--primary w-full mt-4"

          >
            {t('playground.backToWallet')}
          </button>
        </div>
      </PixelCard>
    );
  }

  return (
    <PixelCard>
      <div className="flex flex-col gap-4 p-3">
        {error && <ErrorCard message={error} />}

        {/* What to send, and to whom. */}
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="playground-recipient" className="alice-field-label">{t('playground.send.recipient')}</label>
            <input
              id="playground-recipient" className="alice-field w-full mt-1"
              style={{ ...inputStyle, height: 54 }}
              value={address}
              onChange={(e) => { setAddress(e.target.value); setError(null); }}
              placeholder={t('playground.send.recipientPlaceholder')}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              className="alice-control alice-control--link mt-2"

              onClick={() => setScanOpen(true)}
            >
              <SvgIcon svg={QR_ICON} size={20} /> {t('playground.send.scan')}
            </button>
          </div>
          {scanOpen && (
            <ExplorerQrScanner onResult={applyScannedPayment} onClose={() => setScanOpen(false)} />
          )}
          <div>
            <label htmlFor="playground-send-amount" className="alice-field-label">{t('playground.send.amount')}</label>
            {/* The amount field is the one row with three rigid parts. Without
                min-w-0 the input refuses to shrink below the width of what is
                typed in it, so on a narrow screen it pushes SATS and MAX past
                the border instead of giving up space. */}
            <div
              className="flex items-stretch mt-1 overflow-hidden"
              style={{ minHeight: 62, border: '1px solid var(--alice-border)', borderRadius: 'var(--alice-radius-control)', backgroundColor: 'transparent' }}
            >
              <input
                id="playground-send-amount" className="font-numbers flex-1 min-w-0 bg-transparent px-3 outline-none"
                style={{ fontSize: 26, color: 'var(--alice-primary-dark)' }}
                value={amountText}
                onChange={(e) => { setAmountText(e.target.value.replace(/\D/g, '')); setError(null); }}
                placeholder="0"
                inputMode="numeric"
              />
              <span
                className="font-pixel flex shrink-0 items-center justify-center"
                style={{ minWidth: 48, fontSize: 10, color: 'var(--alice-muted)', letterSpacing: 2 }}
              >
                SATS
              </span>
              <button
                className="alice-control alice-control--quiet shrink-0"
                style={{ minWidth: 64 }}
                onClick={() => {
                  if (!sweep || sweep.amountSats < PRACTICE_DUST_SATS) {
                    setError(
                      snapshot.balanceSats === 0 && snapshot.pendingSats > 0
                        ? t('playground.send.notConfirmed')
                        : t('playground.send.notEnough'),
                    );
                    return;
                  }
                  setAmountText(String(sweep.amountSats));
                  setError(null);
                }}
              >
                MAX
              </button>
            </div>
            <div className="font-numbers text-right mt-1" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
              {sweep && amountText === String(sweep.amountSats) ? (
                // The lesson MAX teaches: a wallet is emptied by the coins it
                // holds minus what the miners take, never by its balance.
                <>{t('playground.send.sweep', { fee: formatTestSats(sweep.feeSats) })}</>
              ) : (
                <>
                  {t('playground.send.available', { amount: formatTestSats(snapshot.balanceSats) })}
                  {snapshot.pendingSats > 0 && (
                    <>{t('playground.send.totalWallet', { amount: formatTestSats(snapshot.balanceSats + snapshot.pendingSats) })}</>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* The transaction, laid bare. */}
        <div style={{ borderTop: '1px solid var(--alice-border)', paddingTop: 12 }}>
          <div className="flex items-center justify-between">
            <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
              {t('playground.send.transaction')}
            </span>
            {plan && (
              <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
                {plan.estimatedVbytes} vbytes · {plan.feeRateSatVb} sat/vB
              </span>
            )}
          </div>

          {!plan && (
            <p className="font-numbers mt-3" style={{ fontSize: 14, lineHeight: '20px', color: planError ? 'var(--alice-danger)' : 'var(--alice-muted)' }}>
              {planError
                ?? t('playground.send.empty')}
            </p>
          )}

          {plan && (
            <div className="flex flex-col mt-2">
              <span className="font-numbers mt-2 mb-1" style={{ fontSize: 12, color: TX_COLORS.input }}>
                {t.plural('playground.send.coinsSpent', plan.inputs.length)}
              </span>
              {plan.inputs.map((input) => (
                <TxPartRow
                  key={`${input.txid}:${input.vout}`}
                  color={TX_COLORS.input}
                  label={truncateMiddle(`${input.txid}:${input.vout}`, 8, 6, 20)}
                  detail={input.confirmed ? t('playground.send.confirmedCoin') : t('playground.send.unconfirmedCoin')}
                  value={formatTestSats(input.valueSats)}
                />
              ))}
              <TxPartRow
                color={TX_COLORS.input}
                label={t('playground.send.totalSpent')}
                value={formatTestSats(plan.totalInputSats)}
                strong
              />

              <span className="font-numbers mt-4 mb-1" style={{ fontSize: 12, color: TX_COLORS.recipient }}>
                {t('playground.send.whereItGoes')}
              </span>
              <TxPartRow
                color={TX_COLORS.recipient}
                label={t('playground.send.toRecipient')}
                detail={truncateMiddle(plan.recipientAddress, 14, 10, 28)}
                value={formatTestSats(plan.amountSats)}
              />
              {plan.changeSats > 0 ? (
                <TxPartRow
                  color={TX_COLORS.change}
                  label={t('playground.send.change')}
                  detail={t('playground.send.changeDetail')}
                  value={formatTestSats(plan.changeSats)}
                />
              ) : (
                <TxPartRow
                  color={TX_COLORS.change}
                  label={t('playground.send.noChange')}
                  detail={
                    // Two different lessons wear the same empty change row: a
                    // sweep leaves nothing over by construction, while a
                    // near-exact payment has a leftover so small that paying
                    // it to the miners costs less than spending it later.
                    plan.feeDonationSats > 0
                      ? t('playground.send.noChangeDust')
                      : t('playground.send.noChangeSweep')
                  }
                  value="0 SATS"
                />
              )}
              <TxPartRow
                color={TX_COLORS.fee}
                label={t('playground.send.miningFee')}
                detail={`${plan.estimatedVbytes} vbytes × ${plan.feeRateSatVb} sat/vB`}
                value={formatTestSats(plan.feeSats)}
              />
            </div>
          )}

          {/* The legend is the lesson: one line per colour. */}
          <div className="flex flex-col gap-1 mt-3">
            {[
              [TX_COLORS.input, t('playground.send.legendInput')],
              [TX_COLORS.recipient, t('playground.send.legendRecipient')],
              [TX_COLORS.change, t('playground.send.legendChange')],
              [TX_COLORS.fee, t('playground.send.legendFee')],
            ].map(([color, text]) => (
              <span key={text} className="flex items-start gap-2">
                <span aria-hidden style={{ width: 8, height: 8, marginTop: 4, backgroundColor: color, borderRadius: 1, flexShrink: 0 }} />
                <span className="font-numbers" style={{ fontSize: 12, lineHeight: '17px', color: 'var(--alice-muted)' }}>{text}</span>
              </span>
            ))}
          </div>

          <button
            className="alice-control alice-control--link mt-3 text-left"

            onClick={() => onAskAlice(draftQuestion(t, plan))}
          >
            {t('playground.send.askAlice')} <SvgIcon svg={NEXT_ICON} size={16} />
          </button>
        </div>

        {/* Signing, then broadcasting: two deliberate acts, not five screens. */}
        {signed && (
          <div className="flex flex-col gap-1" style={{ borderTop: '1px solid var(--alice-border)', paddingTop: 12 }}>
            <FieldLabel>{t('playground.send.reread')}</FieldLabel>
            {[
              t('playground.send.rereadCoins'),
              t('playground.send.rereadAmount'),
              t('playground.send.rereadFee', { fee: formatTestSats(signed.review.feeSats) }),
            ].map((line) => (
              <span key={line} className="font-numbers" style={{ fontSize: 13, lineHeight: '19px', color: 'var(--alice-text)' }}>
                {signed.review.matchesPlan ? '✓' : '✗'} {line}
              </span>
            ))}
            {!signed.review.matchesPlan && (
              <p className="font-numbers" style={{ fontSize: 12, color: BADGE_BG }}>{signed.review.issues.join(' ')}</p>
            )}
            <span className="font-numbers break-all mt-1" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
              txid {signed.txid}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {!signed ? (
            <PrimaryButton
              label={busy ? t('playground.send.signing') : t('playground.send.sign')}
              disabled={busy || !plan}
              onClick={() => void run(async () => {
                if (!plan) return;
                setSigned(await signPlaygroundSend(plan));
                setPhase('signed');
              })}
            />
          ) : (
            <PrimaryButton
              danger
              label={busy ? t('playground.send.broadcasting') : t('playground.send.broadcast')}
              disabled={busy || !signed.review.matchesPlan}
              onClick={() => void run(async () => {
                if (!plan || !signed) return;
                setTxid(await broadcastPlaygroundSend(signed, plan));
                setPhase('sent');
              })}
            />
          )}
          <button
            className="alice-control alice-control--quiet"

            onClick={onExit}
          >
            {t('playground.send.back')}
          </button>
        </div>
      </div>
    </PixelCard>
  );
}

function BackupFlow({
  backedUp,
  onBackedUp,
  onExit,
}: {
  backedUp: boolean;
  onBackedUp: () => void;
  onExit: () => void;
}) {
  const t = useT();
  type BackupStep = 'intro' | 'seed' | 'verify' | 'complete';
  const [step, setStep] = useState<BackupStep>('intro');
  const [words, setWords] = useState<string[]>([]);
  const [visibleWordIndex, setVisibleWordIndex] = useState<number | null>(null);
  const [verifyIndices, setVerifyIndices] = useState<number[]>([]);
  const [verifyAnswers, setVerifyAnswers] = useState<(string | null)[]>([null, null, null]);
  const [verifyError, setVerifyError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reveal() {
    setError(null);
    try {
      setVisibleWordIndex(null);
      setWords(await getPlaygroundMnemonicWords());
      setStep('seed');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  function toggleWord(index: number) {
    // Keep the phrase glance-resistant: revealing one word masks every other.
    setVisibleWordIndex((current) => (current === index ? null : index));
  }

  function startVerification() {
    const indices: number[] = [];
    while (indices.length < 3) {
      const index = Math.floor(Math.random() * words.length);
      if (!indices.includes(index)) indices.push(index);
    }
    indices.sort((a, b) => a - b);
    setVerifyIndices(indices);
    setVerifyAnswers([null, null, null]);
    setVerifyError(false);
    setStep('verify');
  }

  const choicesPerQuestion = useMemo(
    () =>
      verifyIndices.map((correctIndex) => {
        const correct = words[correctIndex];
        const alternatives: string[] = [];
        while (alternatives.length < 3) {
          const candidate = PRACTICE_WORDLIST[Math.floor(Math.random() * PRACTICE_WORDLIST.length)];
          if (candidate !== correct && !alternatives.includes(candidate)) alternatives.push(candidate);
        }
        const choices = [correct, ...alternatives];
        for (let index = choices.length - 1; index > 0; index--) {
          const swapIndex = Math.floor(Math.random() * (index + 1));
          [choices[index], choices[swapIndex]] = [choices[swapIndex], choices[index]];
        }
        return choices;
      }),
    [verifyIndices, words],
  );

  function selectWord(questionIndex: number, word: string) {
    const answers = [...verifyAnswers];
    answers[questionIndex] = word;
    setVerifyAnswers(answers);
    setVerifyError(false);
  }

  async function confirmVerification() {
    const correct = verifyIndices.every(
      (wordIndex, questionIndex) => verifyAnswers[questionIndex] === words[wordIndex],
    );
    if (!correct) {
      setVerifyError(true);
      return;
    }
    try {
      await markPlaygroundBackedUp();
      onBackedUp();
      setWords([]);
      setStep('complete');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  const title =
    step === 'intro' ? (backedUp ? t('playground.backup.titlePhrase') : t('playground.backup.titleIntro'))
    : step === 'seed' ? t('playground.backup.titleSeed')
    : step === 'verify' ? t('playground.backup.titleVerify')
    : t('playground.backup.titleComplete');

  return (
    <PixelCard>
      <div className="flex flex-col items-center gap-4 p-4 text-center">
        <div className="font-pixel tracking-widest" style={{ fontSize: 12, lineHeight: '20px', color: 'var(--alice-primary-dark)' }}>
          {title}
        </div>

        {error && <p className="font-numbers" style={{ fontSize: 12, color: BADGE_BG }}>{error}</p>}

        {step === 'intro' && (
          <>
            <p className="font-numbers" style={{ fontSize: 15, lineHeight: '22px', color: 'var(--alice-muted)', maxWidth: 520 }}>
              {backedUp
                ? t('playground.backup.revealPrivately')
                : t('playground.backup.notBackedUp')}
              {' '}{t('playground.backup.scope')}
            </p>
            <p className="font-pixel tracking-wider" style={{ fontSize: 11, color: BADGE_BG }}>
              {t('playground.backup.neverShare')}
            </p>
            <div className="w-full max-w-xs">
              <PrimaryButton label={backedUp ? t('playground.backup.reveal') : t('playground.backup.start')} icon={KEY_ICON} onClick={() => void reveal()} />
            </div>
          </>
        )}

        {step === 'seed' && (
          <>
            <p className="font-numbers" style={{ fontSize: 15, lineHeight: '22px', color: 'var(--alice-muted)', maxWidth: 520 }}>
              {t('playground.backup.keepOffline')}
            </p>
            <div className="grid grid-cols-2 gap-2 w-full" style={{ maxWidth: 520 }}>
              {words.map((word, index) => {
                const revealed = visibleWordIndex === index;
                return (
                  <button
                    key={`${index}-${word}`}
                    onClick={() => toggleWord(index)}
                    aria-label={t(revealed ? 'playground.backup.wordHide' : 'playground.backup.wordReveal', { number: index + 1 })}
                    className="alice-control alice-control--row"
                    style={{ minHeight: 48, borderBottom: '1px solid var(--alice-border)' }}
                   aria-pressed={revealed}>
                    <span className="font-numbers" style={{ width: 24, fontSize: 13, color: 'var(--alice-muted)' }}>
                      {index + 1}
                    </span>
                    {revealed ? (
                      <span className="font-numbers" style={{ fontSize: 16, color: 'var(--alice-primary-dark)' }}>{word}</span>
                    ) : (
                      <span
                        aria-hidden
                        className="relative overflow-hidden"
                        style={{ width: 92, height: 16, borderRadius: 3, backgroundColor: 'var(--alice-border)', opacity: 0.75 }}
                      >
                        <span className="absolute" style={{ top: 0, bottom: 0, left: 5, right: 5, backgroundColor: 'var(--alice-muted)', opacity: 0.32 }} />
                        <span className="absolute" style={{ top: 4, bottom: 4, left: 0, right: 0, backgroundColor: 'transparent', opacity: 0.38 }} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="font-pixel tracking-wider" style={{ fontSize: 11, color: BADGE_BG }}>
              {t('playground.backup.neverAsk')}
            </p>
            <div className="w-full max-w-xs">
              {backedUp ? (
                <PrimaryButton label={t('playground.done')} icon={CHECK_ICON} onClick={onExit} />
              ) : (
                <PrimaryButton label={t('playground.backup.wroteThem')} onClick={startVerification} />
              )}
            </div>
          </>
        )}

        {step === 'verify' && (
          <>
            <p className="font-numbers" style={{ fontSize: 15, lineHeight: '22px', color: 'var(--alice-muted)' }}>
              {t('playground.backup.selectWords')}
            </p>
            {verifyIndices.map((wordIndex, questionIndex) => (
              <div key={wordIndex} className="w-full text-left" style={{ maxWidth: 440 }}>
                <div className="font-pixel mb-2" style={{ fontSize: 11, color: 'var(--alice-primary-dark)' }}>
                  {t('playground.backup.wordNumber', { number: wordIndex + 1 })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {choicesPerQuestion[questionIndex].map((word) => {
                    const selected = verifyAnswers[questionIndex] === word;
                    const wrong = verifyError && selected && word !== words[wordIndex];
                    return (
                      <button
                        key={word}
                        onClick={() => selectWord(questionIndex, word)}
                        className="alice-control alice-control--choice"
                        style={{ color: wrong ? 'var(--alice-danger)' : selected ? 'var(--alice-selected)' : 'var(--alice-text)' }}
                       aria-pressed={selected} aria-invalid={wrong || undefined}>
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {verifyError && (
              <p className="font-numbers" style={{ fontSize: 14, color: 'var(--alice-danger)' }}>
                {t('playground.backup.wrong')}
              </p>
            )}
            <div className="w-full max-w-xs">
              <PrimaryButton
                label={t('playground.backup.confirm')} icon={KEY_ICON}
                disabled={verifyAnswers.includes(null)}
                onClick={() => void confirmVerification()}
              />
            </div>
          </>
        )}

        {step === 'complete' && (
          <>
            <p className="font-numbers" style={{ fontSize: 15, lineHeight: '22px', color: 'var(--alice-muted)' }}>
              {t('playground.backup.complete')}
            </p>
            <div className="w-full max-w-xs">
              <PrimaryButton label={t('playground.backToWallet')} onClick={onExit} />
            </div>
          </>
        )}
      </div>
    </PixelCard>
  );
}

/** Mobile wallet's error card: PAYMENT ERROR title on a danger-tinted box. */
function ErrorCard({ message }: { message: string }) {
  const t = useT();
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 p-3"
      style={{ border: '2px solid var(--alice-danger)', borderRadius: 'var(--alice-radius-control)', backgroundColor: 'var(--alice-danger-soft)' }}
    >
      <span className="font-pixel tracking-wider" style={{ fontSize: 11, color: 'var(--alice-danger)' }}>
        {t('playground.error.title')}
      </span>
      <span className="font-numbers" style={{ fontSize: 12, lineHeight: '13px', color: 'var(--alice-danger)' }}>
        {message.toLocaleUpperCase(t.locale)}
      </span>
    </div>
  );
}

type ReceivedPayment = {
  amountSats: number;
  txid: string | null;
  confirmed: boolean;
};

/**
 * Receive, mirroring the mobile screen: optional amount folded into a BIP21
 * QR, tap-the-QR-to-copy with the "Tap QR to copy" hint, a WAITING FOR
 * PAYMENT row, the payment-method row with its COPY flash, and the full-bleed
 * PAYMENT RECEIVED receipt once the payment lands (polled every 5 seconds).
 */
function ReceiveView({
  snapshot,
  amountState,
  onRotate,
  onExit,
  onError,
}: {
  snapshot: PlaygroundSnapshot;
  amountState: AmountState;
  onRotate: () => void;
  onExit: () => void;
  onError: (message: string) => void;
}) {
  const router = useRouter();
  const t = useT();
  const [amountText, setAmountText] = useState('');
  const [copied, setCopied] = useState<'qr' | 'row' | null>(null);
  const [received, setReceived] = useState<ReceivedPayment | null>(null);

  const amountSats = amountText ? Number(amountText) : null;
  const payload = playgroundPaymentUri(snapshot.receiveAddress, amountSats);

  // Payment detection, mobile-style: poll while the screen is open, fire once
  // on a balance rise or a new incoming transaction, then keep polling for
  // the confirmation.
  const baseline = useMemo(
    () => ({
      total: snapshot.balanceSats + snapshot.pendingSats,
      txids: new Set(snapshot.history.map((entry) => entry.txid)),
    }),
    // The baseline is captured when the screen opens, on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => {
    let inFlight = false;
    const timer = setInterval(() => {
      if (inFlight) return;
      inFlight = true;
      loadPlaygroundSnapshot()
        .then((fresh) => {
          const incoming = fresh.history.find(
            (entry) => entry.direction === 'incoming' && !baseline.txids.has(entry.txid),
          );
          setReceived((current) => {
            if (current) {
              const entry = fresh.history.find((e) => e.txid === current.txid);
              return entry ? { ...current, confirmed: entry.confirmed } : current;
            }
            const total = fresh.balanceSats + fresh.pendingSats;
            if (incoming) {
              return { amountSats: incoming.amountSats, txid: incoming.txid, confirmed: incoming.confirmed };
            }
            if (total > baseline.total) {
              return { amountSats: total - baseline.total, txid: null, confirmed: false };
            }
            return null;
          });
        })
        .catch(() => { /* next tick retries */ })
        .finally(() => { inFlight = false; });
    }, 5000);
    return () => clearInterval(timer);
  }, [baseline]);

  function copy(target: 'qr' | 'row', value: string) {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(target);
      setTimeout(() => setCopied((current) => (current === target ? null : current)), 2000);
    }).catch(() => onError(t('playground.error.copy')));
  }

  if (received) {
    return (
      <div
        className="flex flex-col items-center justify-between gap-4 p-6"
        style={{ backgroundColor: 'transparent', borderRadius: 'var(--alice-radius-control)', minHeight: 480 }}
      >
        <div className="flex flex-col items-center gap-2 pt-6">
          <span className="font-pixel tracking-widest" style={{ fontSize: 12, color: 'var(--alice-text)' }}>
            {t('playground.receive.received')}
          </span>
          <span className="font-numbers mt-4" style={{ fontSize: 48, lineHeight: '54px', color: 'var(--alice-text)' }}>
            +{formatWalletAmount(received.amountSats, coerceTestUnit(amountState).format, amountState.price)}
          </span>
          <span aria-hidden className="my-6" style={{ width: 44, height: 3, backgroundColor: 'var(--alice-border)' }} />
          <span className="font-pixel tracking-widest" style={{ fontSize: 11, color: 'var(--alice-text)' }}>
            {t('playground.receive.confirmations')}
          </span>
          <span
            className="font-numbers mt-1"
            style={{ fontSize: 18, color: received.confirmed ? 'var(--alice-success)' : 'var(--alice-warning)' }}
          >
            {received.confirmed ? t('playground.receive.confirmed') : t('playground.receive.unconfirmed')}
          </span>
          {received.txid && (
            <>
              <span className="font-pixel tracking-widest mt-6" style={{ fontSize: 11, color: 'var(--alice-text)' }}>
                {t('playground.tx.title')}
              </span>
              <button
                onClick={() => openPlaygroundTxInExplorer(received.txid!, (path) => router.push(path), t('playground.explorerLabel.received'))}
                className="alice-control alice-control--link flex-col"
              >
                <span className="font-numbers break-all text-center" style={{ fontSize: 13, lineHeight: '18px', color: 'var(--alice-text)', maxWidth: 460 }}>
                  {received.txid}
                </span>
                <span className="font-numbers tracking-wider" style={{ fontSize: 12, color: 'var(--alice-text)' }}>
                  {t('playground.openInExplorer')}
                </span>
              </button>
            </>
          )}
        </div>
        <button
          onClick={onExit}
          className="alice-control alice-control--primary w-full"

        >
          {t('playground.backToWallet')}
        </button>
      </div>
    );
  }

  return (
    <PixelCard>
      <div className="flex flex-col items-center gap-4 p-4">
        <Lesson lesson={PRACTICE_LESSONS.receive} learnCourse="btc101" />

        {/* Amount request, optional: folds into the BIP21 URI. */}
        <div className="w-full" style={{ maxWidth: 320 }}>
          <label htmlFor="playground-receive-amount" className="alice-field-label">{t('playground.receive.amount')}</label>
          <div
            className="flex items-center mt-1 px-3"
            style={{ minHeight: 56, border: '1px solid var(--alice-border)', borderRadius: 'var(--alice-radius-control)', backgroundColor: 'transparent' }}
          >
            <input
              id="playground-receive-amount" className="font-numbers flex-1 min-w-0 bg-transparent outline-none"
              style={{ fontSize: 26, color: 'var(--alice-primary-dark)' }}
              value={amountText}
              onChange={(e) => setAmountText(e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="0"
              inputMode="numeric"
            />
            <span className="font-pixel" style={{ fontSize: 10, color: 'var(--alice-muted)', letterSpacing: 2 }}>SATS</span>
          </div>
        </div>

        {/* Waiting row, mobile-style. */}
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block animate-spin"
            style={{ width: 10, height: 10, border: '2px solid var(--alice-primary)', borderTopColor: 'transparent', borderRadius: '50%' }}
          />
          <span className="font-pixel tracking-wider" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
            {t('playground.receive.waiting')}
          </span>
        </div>

        {/* The QR: tap to copy the payload. */}
        <button
          onClick={() => copy('qr', payload)}
          className="cursor-pointer"
          style={{ border: '1px solid var(--alice-border)', borderRadius: 'var(--alice-radius-control)', backgroundColor: '#ffffff', padding: 8 }}
          aria-label={t('playground.receive.copyRequest')}
        >
          <QRCode value={payload} size={220} bgColor="#ffffff" fgColor="#1c2533" />
        </button>
        <span className="font-pixel tracking-wider" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
          {copied === 'qr' ? t('playground.receive.copiedQr') : t('playground.receive.tapQr')}
        </span>

        {/* Payment method row, mobile anatomy. */}
        <button
          onClick={() => copy('row', snapshot.receiveAddress)}
          className="alice-control alice-control--row"
          style={{ maxWidth: 420, minHeight: 54 }}
        >
          <span className="flex flex-col flex-1 min-w-0 gap-1">
            <span className="font-pixel tracking-wider" style={{ fontSize: 10, color: 'var(--alice-primary-dark)' }}>
              BITCOIN MUTINYNET
            </span>
            <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-muted)' }}>
              {truncateMiddle(snapshot.receiveAddress, 14, 10, 24)}
            </span>
          </span>
          <span className="font-pixel tracking-wider" style={{ fontSize: 10, color: 'var(--alice-primary)' }}>
            {copied === 'row' ? t('playground.copied') : t('playground.receive.copy')}
          </span>
        </button>

        <div className="w-full" style={{ maxWidth: 420 }}>
          <PrimaryButton label={t('playground.receive.newAddress')} onClick={onRotate} />
        </div>
      </div>
    </PixelCard>
  );
}

type FaucetState =
  | { stage: 'confirm' }
  | { stage: 'busy' }
  | { stage: 'sent'; txid: string; sats: number }
  | { stage: 'fallback'; message: string | null; address: string; faucetUrl: string };

type View = 'home' | 'send' | 'receive' | 'settings' | 'coins' | 'addresses' | 'backup' | 'faucet';

const VIEW_TITLES: Record<View, MessageKey> = {
  home: 'playground.view.home',
  send: 'playground.view.home',
  receive: 'playground.view.receive',
  settings: 'playground.view.settings',
  coins: 'playground.view.coins',
  addresses: 'playground.view.addresses',
  backup: 'playground.view.backup',
  faucet: 'playground.view.faucet',
};

function PlaygroundWorkspace({
  onStateChange,
  onAskAlice,
}: {
  onStateChange?: (state: {
    view: View;
    snapshot: PlaygroundSnapshot | null;
    exists: boolean;
    draft: PracticeTxPlan | null;
  }) => void;
  onAskAlice?: (question: string) => void;
}) {
  const router = useRouter();
  const t = useT();
  const amountState = useAmountState();
  const [exists, setExists] = useState<boolean | null>(null);
  const [snapshot, setSnapshot] = useState<PlaygroundSnapshot | null>(null);
  const [view, setView] = useState<View>('home');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faucet, setFaucet] = useState<FaucetState | null>(null);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [backedUp, setBackedUp] = useState(true);
  const [faucetClaimed, setFaucetClaimed] = useState(true);
  // The transaction currently being composed on the send screen, published so
  // Alice's attachment describes exactly what the user is looking at.
  const [draft, setDraft] = useState<PracticeTxPlan | null>(null);

  // Show the last known wallet at once, then reconcile with the network. A
  // wallet that takes seconds to appear reads as broken, and every number here
  // is refreshed a moment later anyway.
  useEffect(() => {
    const cached = readCachedPlaygroundSnapshot();
    if (cached) {
      setSnapshot(cached);
      setExists(true);
    }
    // A Learn chapter (or a chat suggestion) may have asked for a specific
    // view; land there directly instead of on home.
    const pending = consumePendingPlaygroundView();
    if (pending) setView(pending);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const present = await hasPlayground();
      setExists(present);
      setBackedUp(await isPlaygroundBackedUp());
      setFaucetClaimed(await hasClaimedPlaygroundFaucet());
      if (present) setSnapshot(await loadPlaygroundSnapshot());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // First-open welcome, shown until dismissed for good (same mechanics as the
  // Explorer's). Deferred to an effect so the server render stays stable.
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    setShowIntro(!wasPlaygroundIntroDismissed());
  }, []);

  // One create path for the intro modal's CTA and the create card's button.
  const startCreate = useCallback(() => {
    setCreating(true);
    setError(null);
    void createPlaygroundIfNeeded()
      .then(() => refresh())
      .catch((cause) => setError(cause instanceof Error ? cause.message : String(cause)))
      .finally(() => setCreating(false));
  }, [refresh]);

  // Auto-refresh while the wallet is on screen. Mutinynet mines every 30
  // seconds, so a payment or a confirmation lands on its own without the user
  // hunting for a refresh button. Paused during the guided send and whenever
  // the tab is hidden, so a background tab never polls the explorer.
  useEffect(() => {
    if (!exists || view === 'send') return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, 20_000);
    return () => clearInterval(timer);
  }, [exists, view, refresh]);

  const balancePoints = useMemo(
    () => (snapshot ? buildBalancePoints(snapshot) : []),
    [snapshot],
  );

  // The shell owns the docked Ask-Alice panel; it follows this state.
  useEffect(() => {
    onStateChange?.({ view, snapshot, exists: exists === true, draft });
  }, [view, snapshot, exists, draft, onStateChange]);

  async function confirmFaucetClaim() {
    setFaucet({ stage: 'busy' });
    setError(null);
    try {
      const claim = await claimPlaygroundFaucet();
      if (claim.kind === 'sent') {
        setFaucet({ stage: 'sent', txid: claim.txid, sats: claim.sats });
        setFaucetClaimed(true);
        void refresh();
      } else {
        setFaucet({
          stage: 'fallback',
          message: claim.kind === 'error' ? claim.message : null,
          address: claim.address,
          faucetUrl: claim.faucetUrl,
        });
      }
    } catch (cause) {
      setFaucet(null);
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  async function openFaucetManually(address: string, faucetUrl: string) {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      // Copy is best-effort; the page still opens.
    }
    void openExternalUrl(faucetUrl);
  }

  // Settings children go back to settings; receive and settings go home.
  const inSubView = view !== 'home' && view !== 'send';
  const backTarget: View = view === 'coins' || view === 'addresses' || view === 'backup' || view === 'faucet'
    ? 'settings'
    : 'home';

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-5 px-5 py-8">
      {showIntro && (
        <PlaygroundIntroModal
          hasWallet={exists === true}
          onClose={() => setShowIntro(false)}
          onCreate={() => {
            setShowIntro(false);
            startCreate();
          }}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PlaygroundHeading
          exists={exists === true}
          inSubView={inSubView}
          title={t(VIEW_TITLES[view])}
          onToggle={() => {
            setDeleteArmed(false);
            setView(inSubView ? backTarget : 'settings');
          }}
        />
        <MutinynetBadge />
      </div>
      <p
        className="font-numbers"
        style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--alice-muted)' }}
      >
        {t('playground.tagline')}
      </p>

      {error && <p className="font-numbers" style={{ fontSize: 12, lineHeight: '14px', color: BADGE_BG }}>{error}</p>}

      {exists === false && (
        <PixelCard>
          <div className="flex flex-col gap-3 p-3">
            <Lesson lesson={PRACTICE_LESSONS.intro} />
            <PrimaryButton
              label={creating ? t('playground.creating') : t('playground.create')}
              icon={WALLET_ICON}
              disabled={creating}
              onClick={startCreate}
            />
          </div>
        </PixelCard>
      )}

      {exists && view === 'settings' && (
        <PixelCard>
          <SettingsRow label={t('playground.settings.balance')} right={<UnitSwitcher state={amountState} />} />
          <SettingsRow
            label={t('playground.view.coins')}
            right={<>{snapshot ? String(snapshot.utxos.length) : '…'} <SvgIcon svg={NEXT_ICON} size={16} /></>}
            onClick={() => setView('coins')}
          />
          <SettingsRow
            label={t('playground.view.addresses')}
            right={<>{snapshot ? String(snapshot.addresses.length) : '…'} <SvgIcon svg={NEXT_ICON} size={16} /></>}
            onClick={() => setView('addresses')}
          />
          <SettingsRow
            label={t('playground.view.faucet')}
            right={<>{faucetClaimed ? t('playground.settings.claimed') : t('playground.settings.available')} <SvgIcon svg={NEXT_ICON} size={16} /></>}
            onClick={() => setView('faucet')}
          />
          <SettingsRow
            label={t('playground.view.backup')}
            right={<SvgIcon svg={KEY_ICON} size={20} />}
            onClick={() => setView('backup')}
          />
          <SettingsRow
            label={deleteArmed ? t('playground.settings.deleteArmed') : t('playground.settings.delete')}
            danger
            last
            onClick={() => {
              if (!deleteArmed) {
                setDeleteArmed(true);
                return;
              }
              void deletePlayground()
                .then(() => {
                  setSnapshot(null);
                  setExists(false);
                  setDeleteArmed(false);
                  setFaucet(null);
                    setView('home');
                })
                .catch((cause) => setError(cause instanceof Error ? cause.message : String(cause)));
            }}
          />
        </PixelCard>
      )}

      {exists && view === 'faucet' && (
        <PixelCard>
          <div className="flex flex-col gap-3 p-3">
            <p className="font-numbers" style={{ fontSize: 14, lineHeight: '20px', color: 'var(--alice-muted)' }}>
              {faucetClaimed
                ? t('playground.faucet.claimedText')
                : t('playground.faucet.offerText')}
            </p>
            {faucetClaimed ? (
              <PrimaryButton
                label={t('playground.faucet.openMutinynet')}
                onClick={() => {
                  void navigator.clipboard.writeText(snapshot?.receiveAddress ?? '').catch(() => {});
                  void openExternalUrl(PRACTICE_FAUCET_URL);
                }}
              />
            ) : (
              <PrimaryButton
                label={t('playground.faucet.claim')}
                onClick={() => {
                  setView('home');
                  setFaucet({ stage: 'confirm' });
                }}
              />
            )}
          </div>
        </PixelCard>
      )}

      {exists && view === 'backup' && (
        <>
          <Lesson lesson={PRACTICE_LESSONS.backup} learnCourse="btc101" />
          <BackupFlow
            backedUp={backedUp}
            onBackedUp={() => setBackedUp(true)}
            onExit={() => setView('home')}
          />
        </>
      )}

      {exists && view === 'receive' && snapshot && (
        <ReceiveView
          snapshot={snapshot}
          amountState={amountState}
          onRotate={() =>
            void rotatePlaygroundReceiveAddress()
              .then((address) => setSnapshot((prev) => (prev ? { ...prev, receiveAddress: address } : prev)))
              .catch((cause) => setError(cause instanceof Error ? cause.message : String(cause)))
          }
          onExit={() => {
            setView('home');
            void refresh();
          }}
          onError={setError}
        />
      )}

      {exists && view === 'coins' && (
        <PixelCard>
          <div className="flex flex-col gap-3 p-3">
            <Lesson lesson={PRACTICE_LESSONS.coins} learnCourse="btc101" />
            {snapshot !== null && (
              <div className="flex flex-col items-center gap-1 py-2 text-center">
                <span className="font-pixel tracking-wider" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
                  {t('playground.coins.total')}
                </span>
                <span className="font-numbers" style={{ fontSize: 24, color: 'var(--alice-primary-dark)' }}>
                  {formatTestSats(snapshot.balanceSats + snapshot.pendingSats)}
                </span>
                <span className="font-numbers tracking-wider" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
                  {t.plural('playground.coins.count', snapshot.utxos.length)}
                  {' · '}
                  {t('playground.coins.pendingCount', { count: snapshot.utxos.filter((u) => !u.confirmed).length })}
                </span>
              </div>
            )}
            {snapshot === null || snapshot.utxos.length === 0 ? (
              <EmptyState title={t('playground.coins.emptyTitle')} hint={t('playground.coins.emptyHint')} />
            ) : (
              snapshot.utxos.map((utxo) => (
                <div
                  key={`${utxo.txid}:${utxo.vout}`}
                  className="flex items-center justify-between gap-3 py-3 px-3"
                  style={{ border: '1px solid var(--alice-border)', borderRadius: 'var(--alice-radius-control)', backgroundColor: 'transparent' }}
                >
                  <span className="flex flex-col min-w-0 gap-1">
                    <span className="font-numbers" style={{ fontSize: 16, color: 'var(--alice-primary-dark)' }}>
                      {formatTestSats(utxo.valueSats)}
                    </span>
                    <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-muted)' }}>
                      {truncateMiddle(`${utxo.txid}:${utxo.vout}`, 8, 6, 20)}
                      {utxo.change ? ` · ${t('playground.coins.change')}` : ''}
                    </span>
                  </span>
                  <span
                    className="font-pixel text-right"
                    style={{ fontSize: 10, color: utxo.confirmed ? 'var(--alice-success)' : 'var(--alice-warning)' }}
                  >
                    {utxo.confirmed ? t('playground.status.confirmed') : t('playground.status.pending')}
                  </span>
                </div>
              ))
            )}
          </div>
        </PixelCard>
      )}

      {exists && view === 'addresses' && (
        <PixelCard>
          <div className="flex flex-col gap-3 p-3">
            <Lesson lesson={PRACTICE_LESSONS.receive} learnCourse="btc101" />
            <p className="font-numbers" style={{ fontSize: 12, lineHeight: '17px', color: 'var(--alice-muted)' }}>
              {t('playground.addresses.explainer')}
            </p>
            {snapshot === null ? (
              <EmptyState title={t('playground.addresses.empty')} />
            ) : (
              <>
                {/* Current-address card, mobile anatomy. */}
                <div
                  className="flex flex-col gap-2 p-3"
                  style={{ border: '1px solid var(--alice-border)', borderRadius: 'var(--alice-radius-control)', backgroundColor: 'transparent' }}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-pixel tracking-wider" style={{ fontSize: 11, color: 'var(--alice-primary-dark)' }}>BITCOIN</span>
                    <span className="font-pixel tracking-wider" style={{ fontSize: 11, color: 'var(--alice-success)' }}>{t('playground.addresses.current')}</span>
                  </span>
                  <span className="font-numbers select-all" style={{ fontSize: 14, color: 'var(--alice-primary-dark)' }}>
                    {truncateMiddle(snapshot.receiveAddress, 18, 12, 34)}
                  </span>
                  <PrimaryButton
                    label={t('playground.addresses.generate')}
                    onClick={() =>
                      void rotatePlaygroundReceiveAddress()
                        .then(() => refresh())
                        .catch((cause) => setError(cause instanceof Error ? cause.message : String(cause)))
                    }
                  />
                </div>

                {/* Previous addresses, dotted-ruled rows. */}
                {snapshot.addresses.filter((info) => info.address !== snapshot.receiveAddress).map((info) => (
                  <div
                    key={info.address}
                    className="flex flex-col gap-1 py-3"
                    style={{ borderBottom: '1px dotted var(--alice-border)' }}
                  >
                    <span className="flex items-center justify-between">
                      <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-primary-dark)' }}>
                        {t(info.change ? 'playground.addresses.changeIndex' : 'playground.addresses.receiveIndex', { index: info.index })}
                        {info.used ? '' : ` · ${t('playground.addresses.fresh')}`}
                      </span>
                      {info.balanceSats > 0 && (
                        <TestAmount sats={info.balanceSats} state={amountState} fontSize={9} color="var(--alice-text)" />
                      )}
                    </span>
                    <span className="font-numbers select-all" style={{ fontSize: 14, color: 'var(--alice-muted)' }}>
                      {truncateMiddle(info.address, 18, 12, 34)}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </PixelCard>
      )}

      {exists && view === 'send' && snapshot && (
        <SendFlow
          snapshot={snapshot}
          onDone={() => {
            setView('home');
            void refresh();
          }}
          onExit={() => setView('home')}
          onPlanChange={setDraft}
          onAskAlice={(question) => onAskAlice?.(question)}
        />
      )}

      {exists && view === 'home' && (
        <>
          {/* Balance, mobile-wallet style: big pixel amount, click to change unit. */}
          <div className="flex flex-col items-center gap-1 py-2">
            <button
              className="alice-control alice-control--quiet"
              title={t('playground.home.changeUnit')}
              onClick={() => cycleTestUnit(amountState)}
            >
              <TestAmount
                sats={snapshot?.balanceSats ?? 0}
                state={amountState}
                fontSize={30}
                color="var(--alice-primary-dark)"
              />
            </button>
            {snapshot !== null && snapshot.pendingSats > 0 && (
              <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
                {t('playground.home.incoming', { amount: formatTestSats(snapshot.pendingSats) })}
              </span>
            )}
            <button
              className="alice-control alice-control--quiet mt-1"

              onClick={() => void refresh()}
              disabled={loading}
            >
              <SvgIcon svg={REFRESH_ICON} size={20} /> {loading ? t('playground.home.checking') : t('playground.home.refresh')}
            </button>
          </div>

          {/* The three actions, corner-bracket style like the mobile wallet. */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <CornerButton
              label={t('playground.home.send')}
              disabled={!snapshot || snapshot.utxos.length === 0}
              onClick={() => setView('send')}
            />
            <CornerButton
              label={t('playground.home.receive')}
              onClick={() => setView('receive')}
            />
            {!faucetClaimed && (
              <CornerButton label={t('playground.home.freeSats')} onClick={() => setFaucet({ stage: 'confirm' })} />
            )}
          </div>

          {/* The mobile wallet's backup banner, verbatim: red, insistent,
              gone once the ritual is done. */}
          {!backedUp && (
            <button
              onClick={() => setView('backup')}
              className="alice-control alice-control--row alice-control--danger"
              style={{ borderLeft: '2px solid var(--alice-danger)' }}
            >
              <span className="font-numbers" style={{ fontSize: 13, lineHeight: '17px', color: 'var(--alice-danger)' }}>
                {t('playground.home.backupBanner')}
              </span>
              <span className="font-numbers shrink-0 inline-flex items-center gap-2" style={{ fontSize: 12, color: 'var(--alice-danger)' }}>
                {t('playground.home.backUp')} <SvgIcon svg={KEY_ICON} size={20} />
              </span>
            </button>
          )}

          {faucet && (
            /* The mobile wallet's confirm modal: centred card over a
               translucent navy backdrop, dismissed by the backdrop or CANCEL. */
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.48)' }}
              onClick={() => { if (faucet.stage !== 'busy') setFaucet(null); }}
              role="dialog"
              aria-modal="true"
              aria-label={t('playground.home.faucetDialog')}
            >
              <div
                className="flex flex-col gap-4 w-full p-5"
                style={{
                  maxWidth: 420,
                  border: '1px solid var(--alice-border)',
                  borderRadius: 'var(--alice-radius-control)',
                  backgroundColor: 'var(--alice-bg)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {faucet.stage === 'confirm' && (
                  <>
                    <div
                      className="font-pixel tracking-widest text-center"
                      style={{ fontSize: 12, color: 'var(--alice-primary-dark)' }}
                    >
                      {t('playground.home.faucetTitle')}
                    </div>
                    <div className="flex items-center justify-center">
                      <TestAmount
                        sats={2100}
                        state={amountState}
                        fontSize={30}
                        color="var(--alice-primary-dark)"
                      />
                    </div>
                    <p
                      className="font-numbers text-center"
                      style={{ fontSize: 15, lineHeight: '22px', color: 'var(--alice-muted)' }}
                    >
                      {t('playground.faucet.confirmText')}
                    </p>
                    <div className="flex gap-3">
                      <PrimaryButton label={t('playground.cancel')} onClick={() => setFaucet(null)} />
                      <PrimaryButton label={t('playground.faucet.receive')} onClick={() => void confirmFaucetClaim()} />
                    </div>
                  </>
                )}

                {faucet.stage === 'busy' && (
                  <p
                    className="font-pixel tracking-widest text-center py-6"
                    style={{ fontSize: 10, color: 'var(--alice-muted)' }}
                  >
                    {t('playground.faucet.asking')}
                  </p>
                )}

                {faucet.stage === 'sent' && (
                  <>
                    <div
                      className="font-pixel tracking-widest text-center"
                      style={{ fontSize: 12, color: 'var(--alice-primary-dark)' }}
                    >
                      {t('playground.faucet.onTheWay')}
                    </div>
                    <div className="flex items-center justify-center">
                      <TestAmount
                        sats={faucet.sats}
                        state={amountState}
                        signed
                        fontSize={30}
                        color="var(--alice-primary-dark)"
                      />
                    </div>
                    <p
                      className="font-numbers text-center"
                      style={{ fontSize: 15, lineHeight: '22px', color: 'var(--alice-muted)' }}
                    >
                      {t('playground.faucet.nextBlock')}
                    </p>
                    <button
                      className="alice-control alice-control--link"

                      onClick={() => openPlaygroundTxInExplorer(faucet.txid, (path) => router.push(path), t('playground.explorerLabel.faucet'))}
                    >
                      {t('playground.openInExplorerLink')} <SvgIcon svg={NEXT_ICON} size={16} />
                    </button>
                    <PrimaryButton label={t('playground.done')} icon={CHECK_ICON} onClick={() => { setFaucet(null); void refresh(); }} />
                  </>
                )}

                {faucet.stage === 'fallback' && (
                  <>
                    <div
                      className="font-pixel tracking-widest text-center"
                      style={{ fontSize: 12, color: 'var(--alice-primary-dark)' }}
                    >
                      {t('playground.home.faucetTitle')}
                    </div>
                    <p
                      className="font-numbers text-center"
                      style={{ fontSize: 15, lineHeight: '22px', color: 'var(--alice-muted)' }}
                    >
                      {faucet.message ?? t('playground.faucet.unavailable')}{' '}{t('playground.faucet.manual')}
                    </p>
                    <div className="flex gap-3">
                      <PrimaryButton label={t('playground.close')} onClick={() => setFaucet(null)} />
                      <PrimaryButton
                        label={t('playground.faucet.open')}
                        onClick={() => void openFaucetManually(faucet.address, faucet.faucetUrl)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Balance over time, in the selected unit. */}
          {balancePoints.length >= 2 && (
            <PixelCard>
              <div className="p-3">
                <ExplorerBalanceChart points={balancePoints} partial={false} noFiat />
              </div>
            </PixelCard>
          )}

          {/* Full history, inline on the same page. */}
          <div className="flex flex-col">
            {snapshot === null || snapshot.history.length === 0 ? (
              <EmptyState
                title={t('playground.history.emptyTitle')}
                hint={t('playground.history.emptyHint')}
              />
            ) : (
              snapshot.history.map((entry) => (
                <button
                  key={entry.txid}
                  onClick={() => openPlaygroundTxInExplorer(
                    entry.txid,
                    (path) => router.push(path),
                    entry.direction === 'incoming' ? t('playground.explorerLabel.received') : t('playground.explorerLabel.sent'),
                  )}
                  className="alice-control alice-control--row"
                  style={{ borderTop: '1px solid var(--alice-border)', padding: '12px 8px' }}
                >
                  <span
                    className="font-pixel"
                    style={{ width: 20, fontSize: 12, textAlign: 'center', color: 'var(--alice-primary)' }}
                  >
                    <SvgIcon svg={entry.direction === 'incoming' ? RECEIVE_ICON : UP_ICON} size={20} />
                  </span>
                  <span className="flex flex-col flex-1 min-w-0">
                    <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-primary-dark)' }}>
                      {entry.direction === 'incoming' ? t('playground.history.received') : t('playground.history.sent')}
                      {entry.confirmed ? '' : ` · ${t('playground.status.pending')}`}
                    </span>
                    <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
                      {entry.blockTime
                        ? new Date(entry.blockTime * 1000).toLocaleString()
                        : t('playground.history.waiting')}
                    </span>
                  </span>
                  <TestAmount
                    sats={entry.direction === 'incoming' ? entry.amountSats : -entry.amountSats}
                    state={amountState}
                    signed
                    fontSize={9}
                    color={entry.direction === 'incoming' ? 'var(--alice-primary-dark)' : 'var(--alice-muted)'}
                  />
                </button>
              ))
            )}
          </div>
        </>
      )}

    </div>
  );
}

type PlaygroundAskState = {
  view: View;
  snapshot: PlaygroundSnapshot | null;
  exists: boolean;
  draft: PracticeTxPlan | null;
};

// Open/closed is a per-section choice; the WIDTH is Alice's place and is
// shared with Explorer and Learn through lib/ask-width.
const ASK_OPEN_KEY = 'alice.playground.ask-open';
const LEGACY_ASK_OPEN_KEY = 'alice.test-wallet.ask-open';

export function PlaygroundPanel() {
  const [askOpen, setAskOpen] = useState(false);
  const [askWidth, setAskWidth] = useState(ASK_WIDTH_DEFAULT);
  const [walletState, setWalletState] = useState<PlaygroundAskState>({
    view: 'home',
    snapshot: null,
    exists: false,
    draft: null,
  });
  const onStateChange = useCallback((state: PlaygroundAskState) => setWalletState(state), []);
  const { setInput, messages: chatMessages, clearMessages } = useChat();
  // On a phone the dock has no room beside the page: the bubble hands the
  // page over to the main chat, with the same attachment (see
  // lib/explorer/ask-handoff.ts). A ref, so callbacks made earlier see the
  // current page.
  const phone = usePhoneLayout();
  const router = useRouter();
  const handOffRef = useRef<() => void>(() => {});
  const t = useT();
  // Opening Alice from the send screen arrives with the question already
  // written: the point is an answer about THIS transaction, one keystroke
  // away, not an empty composer the user has to fill in themselves.
  const askAliceWith = useCallback((question: string) => {
    setInput(question);
    if (phone) handOffRef.current();
    else setAskOpen(true);
  }, [setInput, phone]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ASK_OPEN_KEY)
        ?? window.localStorage.getItem(LEGACY_ASK_OPEN_KEY);
      setAskOpen(stored === 'true');
    } catch { /* defaults */ }
    setAskWidth(loadAskWidth());
  }, []);
  useEffect(() => {
    try { window.localStorage.setItem(ASK_OPEN_KEY, String(askOpen)); } catch { /* best effort */ }
  }, [askOpen]);
  useEffect(() => {
    saveAskWidth(askWidth);
  }, [askWidth]);

  // Drag the panel's left edge to resize it (desktop only).
  function startAskResize(e: React.PointerEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = askWidth;
    const move = (ev: PointerEvent) => {
      setAskWidth(clampAskWidth(startW - (ev.clientX - startX)));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  // Ask-Alice context, following the Explorer contract: de-identified counts
  // by default, the full page (addresses, coins, transactions) only in the
  // explicit identified mode. The recovery phrase never rides along.
  const askSignals = useMemo(
    () => buildPlaygroundSignals(walletState.snapshot, walletState.draft),
    [walletState.snapshot, walletState.draft],
  );
  const askFullContext = useMemo(
    () => buildPlaygroundFullContext(walletState.view, walletState.snapshot, walletState.draft),
    [walletState.view, walletState.snapshot, walletState.draft],
  );

  const askPageNote = `The user is on ${playgroundModelPageName(walletState.view)} of the Playground, Alice's Mutinynet practice environment whose coins have no real value.`;
  const askQuestions = walletState.draft
    ? [
      t('playground.ask.draftQuestion1'),
      t('playground.ask.draftQuestion2'),
      t('playground.ask.draftQuestion3'),
    ]
    : [
      t('playground.ask.question1'),
      t('playground.ask.question2'),
      t('playground.ask.question3'),
    ];
  handOffRef.current = () => {
    if (chatMessages.some(m => m.role === 'user')) clearMessages();
    setAskHandoff({
      contextId: `test-wallet:${walletState.view}`,
      contextLabel: playgroundPageName(walletState.view),
      pageNote: askPageNote,
      signals: askSignals,
      fullContext: askFullContext,
      defaultQuestions: askQuestions,
    });
    router.push('/');
  };

  return (
    <WorkspaceShell title="Playground" aside={
      walletState.exists && (askOpen && !phone ? (
        <>
          <div
            className="relative flex shrink-0 w-[var(--ask-w,420px)]"
            style={{
              ['--ask-w' as string]: `${askWidth}px`,
              borderLeft: '1px solid var(--alice-border)',
              backgroundColor: 'var(--alice-bg)',
            } as React.CSSProperties}
          >
            <div
              onPointerDown={startAskResize}
              className="hidden md:block absolute left-0 inset-y-0 z-10"
              style={{ width: 5, cursor: 'col-resize' }}
              aria-hidden="true"
            />
            <AskAliceDock
              signals={askSignals}
              fullContext={askFullContext}
              contextId={`test-wallet:${walletState.view}`}
              contextLabel={playgroundPageName(walletState.view)}
              pageNote={askPageNote}
              defaultQuestions={askQuestions}
              onClose={() => setAskOpen(false)}
            />
          </div>
        </>
      ) : (
        <AskAliceFab onOpen={() => (phone ? handOffRef.current() : setAskOpen(true))} />
      ))
    }>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <PlaygroundWorkspace onStateChange={onStateChange} onAskAlice={askAliceWith} />
      </div>
    </WorkspaceShell>
  );
}
