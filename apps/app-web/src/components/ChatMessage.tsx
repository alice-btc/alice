'use client';

import { useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import { COPY_ICON, CHECK_ICON, EDIT_ICON, DELETE_ICON, CHEVRON_LEFT_ICON, CHEVRON_RIGHT_ICON, MORE_ICON } from '@/lib/atelier-icons';
import { AliceIcon } from '@/components/AliceIcon';
import { splitAskAliceMessage, type MessageAttachment } from '@/lib/explorer/ask-alice';
import { useOpenSettings } from '@/lib/settings-url';
import { useRouter } from 'next/navigation';
import { detectTextLanguage, useChat } from '@alice-wallet/alice-ai';
import { relativeTime, type RelativeTimeLang } from '@/lib/relative-time';
import type { TokenUsage, MessageVariant, LearnSource, SendError } from '@alice-wallet/alice-ai';
import { useT, type Translator } from '@/i18n';
import { sellsPlans } from '@/lib/store-rules';
import { DefinitionPeek } from '@/components/learn/DefinitionPeek';
import { RecommendationsMenu, uniqueRecommendations, type Recommendation } from '@/components/learn/RecommendationsMenu';
import { dictionaryLanguage } from '@/lib/learn/dictionary-packs';
import { chooseLinkedTerms, linkTerms, type TermMatcher } from '@/lib/learn/term-links';
import { useTermMatcher } from '@/lib/learn/use-term-links';
import { useDismiss } from '@/lib/use-dismiss';

interface ChatMessageProps {
  /** Panel mode (the Explorer sidebar): no left avatar (narrow column), a
      small Alice mark sits next to the timestamp instead. */
  compact?: boolean;
  /** The main chat has a single fixed mascot outside its message history. */
  showAvatar?: boolean;
  /** Shown at the start of the action row, before the time: on a phone the
      main chat puts its mascot there, on Alice's last reply. */
  leading?: ReactNode;
  /** True while this assistant reply is still being written: shows the
      blinking terminal cursor at the end of the streamed text. */
  streaming?: boolean;
  /** Language of the surface the chat sits in (Learn's course language);
      the app language otherwise. */
  lang?: RelativeTimeLang;
  /** Resources suggested after the reply, offered with the courses it drew
      on behind the reply's "recommended" button: the main chat passes them
      for its last reply. */
  recommended?: Recommendation[];
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    time: Date;
    usage?: TokenUsage;
    durationMs?: number;
    truncated?: boolean;
    variants?: MessageVariant[];
    activeVariant?: number;
    quotaBlocked?: 'free' | 'plan';
    sources?: LearnSource[];
    cloudRetry?: boolean;
    sendError?: SendError;
  };
}

// A course or tutorial the reply drew on, offered as a recommendation.
// A dictionary definition is not: its term is a link inside the reply.
function sourceRecommendation(source: LearnSource, t: Translator, open: (path: string) => void): Recommendation {
  if (source.kind === 'tutorial') {
    return { key: source.path, kind: 'tutorial', title: source.label, detail: t('chat.recommended.tutorial'), open: () => open(source.path) };
  }
  // A course source is labelled "BTC102 · Chapter title".
  const [code, ...rest] = source.label.split(' · ');
  const chapter = source.path.includes('chapter=');
  return {
    key: source.path,
    kind: chapter ? 'chapter' : 'course',
    title: rest.join(' · ') || source.label,
    detail: t(chapter ? 'chat.recommended.chapter' : 'chat.recommended.course', { code }),
    open: () => open(source.path),
  };
}

function renderInlineMarkdown(text: string, link?: (plain: string) => ReactNode): React.ReactNode[] {
  return text.split(/(\*\*.+?\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{link ? link(part.slice(2, -2)) : part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={index}
          style={{
            fontFamily: 'monospace',
            fontSize: '0.9em',
            padding: '1px 4px',
            borderRadius: 3,
            backgroundColor: 'var(--alice-card-bg)',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={index}>{link ? link(part) : part}</span>;
  });
}

/** "chemin-de-derivation" from "/learn/?definition=chemin-de-derivation". */
function definitionSlug(path: string): string | null {
  return new URLSearchParams(path.split('?')[1] ?? '').get('definition');
}

interface TermLinks {
  matcher: TermMatcher;
  /** The definitions this reply links to (chooseLinkedTerms). */
  chosen: Set<string>;
  onOpen: (slug: string) => void;
}

function ChatMarkdownText({ content, streaming = false, terms }: { content: string; streaming?: boolean; terms?: TermLinks }) {
  const lines = (content || (streaming ? '' : '...')).split('\n');
  // The text's own language on its element, whenever it is clear: a screen
  // reader then pronounces an English reply in the French app as English.
  const lang = useMemo(() => detectTextLanguage(content)?.language, [content]);
  // Lines render in order, so the set marks each term linked at its first appearance.
  const linked = new Set<string>();
  const link = terms ? (plain: string): ReactNode => {
    const segments = linkTerms(plain, terms.matcher, terms.chosen, linked);
    if (!segments.some(segment => segment.slug)) return plain;
    return segments.map((segment, index) => {
      const slug = segment.slug;
      if (!slug) return <span key={index}>{segment.text}</span>;
      return (
        <a
          key={index}
          href={`/learn/?definition=${slug}`}
          className="alice-term-link"
          onClick={event => {
            if (event.metaKey || event.ctrlKey || event.shiftKey) return;
            event.preventDefault();
            terms.onOpen(slug);
          }}
        >
          {segment.text}
        </a>
      );
    });
  } : undefined;
  const inline = (text: string) => renderInlineMarkdown(text, link);
  // Markdown separators and trailing blank lines have no visible text to follow.
  const lastTextLine = lines.findLastIndex(line => line.trim() && !/^\s*\|[\s:|-]+\|\s*$/.test(line));
  const cursor = streaming ? <span className="stream-cursor" aria-hidden="true" /> : null;

  return (
    <div className="flex flex-col gap-1" lang={lang}>
      {lines.map((line, index) => {
        const lineCursor = index === lastTextLine ? cursor : null;
        // Headings: models reach for them even when asked not to, so render
        // them rather than leaking "###" into the bubble.
        const heading = line.match(/^\s*(#{1,6})\s+(.+?)\s*#*$/);
        if (heading) {
          return (
            <p
              key={index}
              className="m-0 mt-2 first:mt-0"
              style={{ fontWeight: 700, fontSize: heading[1].length <= 2 ? '1.15em' : '1.05em' }}
            >
              {inline(heading[2])}{lineCursor}
            </p>
          );
        }

        // Table rows. The |---|---| separator carries no content: drop it.
        if (/^\s*\|[\s:|-]+\|\s*$/.test(line)) return null;
        const tableRow = line.match(/^\s*\|(.+)\|\s*$/);
        if (tableRow) {
          const cells = tableRow[1].split('|').map(c => c.trim());
          return (
            <div key={index} className="flex flex-col gap-0.5 my-1">
              {cells.map((cell, cellIndex) => (
                <div key={cellIndex} className={cellIndex === 0 ? '' : 'pl-3'} style={{ opacity: cellIndex === 0 ? 1 : 0.85 }}>
                  {cellIndex === 0 ? <strong>{inline(cell)}</strong> : inline(cell)}
                  {cellIndex === cells.length - 1 && lineCursor}
                </div>
              ))}
            </div>
          );
        }

        const numbered = line.match(/^\s*(\d+)[.)]\s+(.+)$/);
        if (numbered) {
          return (
            <div key={index} className="flex items-start gap-1.5">
              <span className="shrink-0" style={{ minWidth: '1.25em' }}>{numbered[1]}.</span>
              <span className="flex-1">{inline(numbered[2])}{lineCursor}</span>
            </div>
          );
        }

        const bullet = line.match(/^\s*[-*•]\s+(.+)$/);
        if (bullet) {
          return (
            <div key={index} className="flex items-start gap-1.5">
              <span className="w-3 text-center shrink-0">&bull;</span>
              <span className="flex-1">{inline(bullet[1])}{lineCursor}</span>
            </div>
          );
        }
        if (!line.trim()) return <div key={index} className="h-1.5" />;
        return <p key={index} className="m-0">{inline(line)}{lineCursor}</p>;
      })}
      {lastTextLine === -1 && cursor && <p className="m-0">{cursor}</p>}
    </div>
  );
}

// Shown when the provider stopped on max_tokens: the answer ends mid-thought,
// so say so rather than letting it look like Alice finished.
function TruncatedNotice({ t }: { t: Translator }) {
  return (
    <div
      className="font-numbers mt-2"
      style={{
        fontSize: 14,
        lineHeight: '20px',
        opacity: 1,
        paddingTop: 8,
        borderTop: '1px solid var(--alice-border)',
      }}
    >
      {t('chat.message.truncated')}
    </div>
  );
}

/**
 * What to offer when an allowance runs out.
 *
 * Running out of a free trial and running out of a month you paid for are not
 * the same event, and they do not deserve the same answer. The free case ends
 * unless the user buys something; the paid one repairs itself at the next
 * reset, so the offer is optional and says so. Selling harder to someone who
 * has already paid would be the fastest way to make a paying user feel farmed.
 */
/**
 * What to say when an allowance stops a message.
 *
 * Four situations, and flattening them would send people the wrong way. Two
 * are about capacity: the free allowance ends unless you buy, a paid month
 * repairs itself. Two are about Deep Research: one plan does not include it,
 * the other does and has spent this month's runs. Only the first of each pair
 * is an occasion to sell anything.
 */
// Alice Local could not hold the answer language twice in a row; Private
// Cloud can, so the same question is offered there, on the user's click.
function CloudRetryNotice({ messageId, t }: { messageId: string; t: Translator }) {
  const { retryWithPrivateCloud, busy } = useChat();
  return (
    <div className="mt-2" style={{ paddingTop: 8, borderTop: '1px solid var(--alice-border)' }}>
      <button
        type="button"
        onClick={() => retryWithPrivateCloud(messageId)}
        disabled={busy}
        className="alice-control alice-control--primary"
      >
        {t('chat.message.cloudRetry')}
      </button>
    </div>
  );
}

function QuotaNotice({ kind, t }: { kind: 'free' | 'plan'; t: Translator }) {
  const openSettings = useOpenSettings();
  const copy: Record<typeof kind, { body: string; action: string | null }> = {
    free: sellsPlans()
      ? { body: t('chat.quota.free.body'), action: t('chat.quota.free.action') }
      : { body: t('chat.quota.free.bodyPhone'), action: null },
    plan: sellsPlans()
      ? { body: t('chat.quota.plan.body'), action: t('chat.quota.plan.action') }
      : { body: t('chat.quota.plan.bodyPhone'), action: null },
  };
  const { body, action } = copy[kind];
  return (
    <div
      className="font-numbers mt-2"
      style={{
        fontSize: 14,
        lineHeight: '20px',
        paddingTop: 8,
        borderTop: '1px solid var(--alice-border)',
      }}
    >
      <p className="m-0" style={{ opacity: 1 }}>{body}</p>
      {action && (
        <button
          type="button"
          onClick={() => openSettings('account')}
          className="alice-control alice-control--primary mt-3"
        >
          {action}
        </button>
      )}
    </div>
  );
}

// --- Icon components (inline SVG, no dependencies) ---

function CopyIcon() {
  return <SvgIcon svg={COPY_ICON} size={16} />;
}

function CheckIcon() {
  return <SvgIcon svg={CHECK_ICON} size={16} />;
}

function MoreIcon() {
  return <SvgIcon svg={MORE_ICON} size={16} />;
}

function EditIcon() {
  return <SvgIcon svg={EDIT_ICON} size={16} />;
}

function BoltIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="M6 11l6-6l6 6" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M18 13l-6 6l-6-6" />
    </svg>
  );
}

function SigmaIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6H6l7 6l-7 6h12" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return <SvgIcon svg={CHEVRON_LEFT_ICON} size={16} />;
}

function ChevronRightIcon() {
  return <SvgIcon svg={CHEVRON_RIGHT_ICON} size={16} />;
}

function VariantNav({ messageId, variants, activeVariant, t }: { messageId: string; variants: MessageVariant[]; activeVariant: number; t: Translator }) {
  const { setMessageVariant } = useChat();
  if (variants.length < 2) return null;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginLeft: 4 }}>
      <button
        onClick={() => setMessageVariant(messageId, activeVariant - 1)}
        disabled={activeVariant === 0}
        type="button"
        aria-label={t('chat.variant.previous')}
        title={t('chat.variant.previous')}
        className="alice-control alice-control--tool"
      >
        <ChevronLeftIcon />
      </button>
      <span style={{ fontSize: 10, color: 'var(--alice-muted)', opacity: 1, fontFamily: 'var(--font-numbers, monospace)', minWidth: 20, textAlign: 'center' }}>
        {activeVariant + 1}/{variants.length}
      </span>
      <button
        onClick={() => setMessageVariant(messageId, activeVariant + 1)}
        disabled={activeVariant === variants.length - 1}
        type="button"
        aria-label={t('chat.variant.next')}
        title={t('chat.variant.next')}
        className="alice-control alice-control--tool"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}

// --- Action button ---

function ActionButton({ onClick, title, children, expanded }: { onClick: () => void; title: string; children: React.ReactNode; expanded?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title}
      aria-haspopup={expanded === undefined ? undefined : 'menu'} aria-expanded={expanded}
      className="alice-control alice-control--tool">
      {children}
    </button>
  );
}

// --- Token metrics tooltip ---

function MetricRow({ icon, label, value, unit, primary }: { icon: React.ReactNode; label: string; value: string; unit: string; primary?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--alice-muted)', opacity: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 12, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 1 }}>
          {icon}
        </span>
        {label}
      </span>
      <span style={{
        fontSize: 12,
        fontFamily: 'monospace',
        color: 'var(--alice-muted)',
        opacity: 1,
      }}>
        {value} <span style={{ opacity: 1 }}>{unit}</span>
      </span>
    </div>
  );
}

// The technical line of a failed send (class, code, HTTP status, original
// message), for a bug report; the bubble shows the case in the app language.
function SendErrorDetail({ detail, t }: { detail: string; t: Translator }) {
  return (
    <div className="alice-menu-metrics">
      <span style={{ fontSize: 12, color: 'var(--alice-muted)' }}>{t('chat.sendError.detail')}</span>
      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--alice-muted)', overflowWrap: 'anywhere' }}>{detail}</span>
    </div>
  );
}

function TokenMetrics({ usage, durationMs, t }: { usage?: TokenUsage; durationMs?: number; t: Translator }) {
  if (!usage && !durationMs) return null;

  const speed = usage?.completionTokens && durationMs
    ? (usage.completionTokens / (durationMs / 1000)).toFixed(1)
    : null;
  const duration = durationMs ? (durationMs / 1000).toFixed(1) : null;

  return (
    <div className="alice-menu-metrics">
      {speed && <MetricRow icon={<BoltIcon />} label={t('chat.metrics.speed')} value={speed} unit="tokens/s" primary />}
      {duration && <MetricRow icon={<ClockIcon />} label={t('chat.metrics.duration')} value={duration} unit="s" primary />}
      {usage?.promptTokens != null && <MetricRow icon={<ArrowUpIcon />} label={t('chat.metrics.prompt')} value={String(usage.promptTokens)} unit="tokens" />}
      {usage?.completionTokens != null && <MetricRow icon={<ArrowDownIcon />} label={t('chat.metrics.completion')} value={String(usage.completionTokens)} unit="tokens" />}
      {usage?.totalTokens != null && <MetricRow icon={<SigmaIcon />} label={t('chat.metrics.total')} value={String(usage.totalTokens)} unit="tokens" primary />}
    </div>
  );
}

const MENU_WIDTH = 200;

// The less used actions of a message behind "…": its figures (speed,
// tokens) and Delete, so a stray tap on a phone does not remove a message.
function MoreMenu({ message, t }: { message: ChatMessageProps['message']; t: Translator }) {
  const { deleteMessage } = useChat();
  const [open, setOpen] = useState(false);
  // The menu opens rightwards from the button, leftwards when the screen
  // has no room for it on that side (the button near a phone's right edge).
  const [leftwards, setLeftwards] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const toggle = () => {
    const box = ref.current?.getBoundingClientRect();
    setLeftwards(box ? box.left + MENU_WIDTH + 8 > window.innerWidth : false);
    setOpen(value => !value);
  };

  useDismiss(open, ref, setOpen);

  return (
    <div ref={ref} className="relative" style={{ display: 'inline-flex' }}>
      <ActionButton onClick={toggle} title={t('chat.actions.more')} expanded={open}>
        <MoreIcon />
      </ActionButton>
      {open && (
        <div role="menu" aria-label={t('chat.actions.more')} className={`alice-menu${leftwards ? ' alice-menu--leftwards' : ''}`}>
          {message.role === 'assistant' && <TokenMetrics usage={message.usage} durationMs={message.durationMs} t={t} />}
          {message.sendError && <SendErrorDetail detail={message.sendError.detail} t={t} />}
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); deleteMessage(message.id); }}
            className="alice-menu-item alice-menu-item--danger font-numbers"
          >
            <SvgIcon svg={DELETE_ICON} size={14} />
            {t('common.delete')}
          </button>
        </div>
      )}
    </div>
  );
}

// --- Edit mode inline ---

function EditableContent({ content, onSave, onCancel, t }: { content: string; onSave: (text: string) => void; onCancel: () => void; t: Translator }) {
  const [text, setText] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.focus();
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave(text);
    }
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      <textarea
        aria-label={t('chat.edit.label')}
        ref={textareaRef}
        value={text}
        onChange={e => {
          setText(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        onKeyDown={handleKeyDown}
        className="font-numbers text-lg leading-[26px]"
        style={{
          width: '100%',
          background: 'transparent',
          border: '1px solid var(--alice-border)',
          borderRadius: 4,
          padding: '6px 8px',
          color: 'var(--alice-text)',
          resize: 'none',
          outline: 'none',
          minHeight: 36,
        }}
      />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          className="alice-control alice-control--quiet"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={() => onSave(text)}
          className="alice-control alice-control--primary"
        >
          {t('common.save')}
        </button>
      </div>
    </div>
  );
}

// --- Action bar ---

function MessageActions({
  message,
  onEdit,
  compact = false,
  t,
  leading,
  recommendations = [],
}: {
  message: ChatMessageProps['message'];
  onEdit: () => void;
  compact?: boolean;
  t: Translator;
  /** The main chat has a single fixed mascot outside its message history. */
  showAvatar?: boolean;
  leading?: ReactNode;
  recommendations?: Recommendation[];
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }, [message.content]);

  const isUser = message.role === 'user';
  const time = message.time instanceof Date ? message.time : new Date(message.time);

  return (
    <div
      className={`alice-message-actions${recommendations.length > 0 ? ' alice-message-actions--reco' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        paddingLeft: isUser || compact ? 0 : 42,
        paddingTop: 4,
        flexWrap: 'wrap',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      {leading}
      {recommendations.length > 0 && <RecommendationsMenu items={recommendations} t={t} />}
      <span className="alice-message-time" style={{ fontSize: 10, color: 'var(--alice-muted)', marginRight: 4, fontFamily: 'var(--font-numbers, monospace)' }}>
        {relativeTime(time, t.locale)}
      </span>

      {message.variants && message.variants.length > 1 && (
        <VariantNav
          messageId={message.id}
          variants={message.variants}
          activeVariant={message.activeVariant ?? 0}
          t={t}
        />
      )}

      <ActionButton onClick={handleCopy} title={copied ? t('common.copied') : t('common.copy')}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </ActionButton>

      <ActionButton onClick={onEdit} title={t('chat.actions.edit')}>
        <EditIcon />
      </ActionButton>

      <MoreMenu message={message} t={t} />
    </div>
  );
}

// --- Main component ---

// Chain-link glyph for sent attachments (same mark as the composer's chip).
function MiniLinkIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7" />
    </svg>
  );
}

// One attachment block of a SENT message: the same compact chip as in the
// composer, expandable to the exact text that crossed to the model. The
// stored message keeps the full text; only the presentation folds it.
function SentAttachment({ att }: { att: MessageAttachment }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        title={t('chat.attachment.showExact')}
        className="alice-control alice-control--quiet flex items-center gap-1.5"
        style={{ padding: '4px 8px' }}
      >
        <span className="shrink-0 flex items-center" style={{ color: 'var(--alice-muted)' }}>
          <MiniLinkIcon />
        </span>
        <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-text)' }}>{att.label}</span>
        {att.kind === 'identified' && (
          <span className="font-pixel tracking-widest shrink-0" style={{ fontSize: 10, padding: '2px 4px', border: '1px solid var(--alice-primary)', borderRadius: 2, color: 'var(--alice-primary)' }}>
            {t('chat.attachment.full')}
          </span>
        )}
      </button>
      {open && (
        <p
          className="font-numbers m-0 whitespace-pre-wrap text-left w-full"
          style={{ fontSize: 11, lineHeight: '16px', color: 'var(--alice-muted)', border: '1px solid var(--alice-border)', borderRadius: 2, padding: '8px 10px', overflowWrap: 'anywhere' }}
        >
          {att.text}
        </p>
      )}
    </div>
  );
}

// A sent user message: the typed question as the bubble text, the attachment
// blocks folded into chips below it.
function UserMessageBody({ content }: { content: string }) {
  const { question, attachments } = splitAskAliceMessage(content);
  // Same rule as the reply: the question's language, not the attachment's.
  const lang = useMemo(() => detectTextLanguage(question)?.language, [question]);
  return (
    <div className="flex flex-col gap-2">
      <p className="font-numbers text-lg leading-[26px] m-0" style={{ color: 'var(--alice-text)' }} lang={lang}>
        {question || content || '...'}
      </p>
      {attachments.map(att => <SentAttachment key={att.kind} att={att} />)}
    </div>
  );
}

export function ChatMessage({ message, compact = false, streaming = false, showAvatar = true, lang, leading, recommended }: ChatMessageProps) {
  const { editMessage } = useChat();
  const router = useRouter();
  const t = useT(lang);
  const [editing, setEditing] = useState(false);
  const [peek, setPeek] = useState<string | null>(null);
  const closePeek = useCallback(() => setPeek(null), []);

  // Dictionary terms become links once the reply is complete, in the pack of
  // the language the reply is written in; a reply whose language is unclear
  // gets none.
  const termLanguage = useMemo(() => {
    if (message.role !== 'assistant' || message.id === 'greeting') return null;
    const detected = detectTextLanguage(message.content)?.language;
    return detected === 'fr' || detected === 'en' ? dictionaryLanguage(detected) : null;
  }, [message.role, message.id, message.content]);
  const matcher = useTermMatcher(streaming ? null : termLanguage);
  const quoted = useMemo(() => new Set(
    (message.sources ?? [])
      .filter(source => source.kind === 'definition')
      .map(source => definitionSlug(source.path))
      .filter((slug): slug is string => Boolean(slug)),
  ), [message.sources]);
  const chosen = useMemo(() => (matcher ? chooseLinkedTerms(message.content, matcher, quoted) : null), [matcher, message.content, quoted]);
  const recommendations = uniqueRecommendations([
    ...(message.sources ?? []).filter(source => source.kind !== 'definition').map(source => sourceRecommendation(source, t, path => router.push(path))),
    ...(recommended ?? []),
  ]);
  const terms = matcher && chosen && chosen.size > 0 ? { matcher, chosen, onOpen: setPeek } : undefined;

  if (message.role === 'system') {
    return (
      <div className="flex justify-center py-1">
        <p
          className="font-pixel text-[10px] tracking-widest opacity-100 text-center"
          style={{ color: 'var(--alice-text)' }}
        >
          {message.content}
        </p>
      </div>
    );
  }

  const isUser = message.role === 'user';

  // Panel mode has its own typing indicator: an assistant bubble with nothing
  // in it yet would only add a stray "..." placeholder above it.
  if (compact && !isUser && !message.content) return null;

  const handleSave = (newContent: string) => {
    setEditing(false);
    if (newContent.trim() && newContent.trim() !== message.content) {
      editMessage(message.id, newContent);
    }
  };

  return (
    <div className="alice-chat-message">
      <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && !compact && showAvatar && (
          <div className="w-[30px] h-[30px] shrink-0 flex items-end">
            <AliceIcon size={30} color="var(--alice-primary)" />
          </div>
        )}
        <div
          className={`${isUser ? 'max-w-[75%] rounded-sm px-3.5 py-2.5' : 'flex-1 min-w-0'}`}
          style={isUser ? { backgroundColor: 'var(--alice-card-bg)' } : undefined}
        >
          {editing ? (
            <EditableContent
              content={message.content}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
              t={t}
            />
          ) : isUser ? (
            <UserMessageBody content={message.content} />
          ) : (
            <div
              className="font-numbers text-lg leading-[26px]"
              style={{ color: 'var(--alice-text)' }}
            >
              {message.sendError
                ? <p className="m-0" title={message.sendError.detail}>{t(`chat.sendError.${message.sendError.kind}`)}</p>
                : <ChatMarkdownText content={message.content} streaming={streaming} terms={streaming ? undefined : terms} />}
              {message.truncated && <TruncatedNotice t={t} />}
              {message.quotaBlocked && <QuotaNotice kind={message.quotaBlocked} t={t} />}
              {message.cloudRetry && <CloudRetryNotice messageId={message.id} t={t} />}
            </div>
          )}
        </div>
      </div>
      {!editing && message.content && message.id !== 'greeting' && (
        <MessageActions message={message} onEdit={() => setEditing(true)} compact={compact || !showAvatar} t={t} leading={leading} recommendations={streaming ? [] : recommendations} />
      )}
      {peek && termLanguage && <DefinitionPeek slug={peek} lang={termLanguage} onClose={closePeek} t={t} />}
    </div>
  );
}
