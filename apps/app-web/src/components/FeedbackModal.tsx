'use client';

import { SvgIcon } from '@/components/SvgIcon';
import { CLOSE_ICON, COPY_ICON, CHECK_ICON, MAIL_ICON, EXTERNAL_ICON, ATTACHMENT_ICON, DELETE_ICON } from '@/lib/atelier-icons';
import { finePointer } from '@/lib/pointer';

import { type DragEvent, useEffect, useRef, useState } from 'react';
import {
  type AIPreset,
  CLOUD_MODELS,
  getModelName,
  getActiveCloudModelId,
  getActiveModelId,
  getCustomServer,
  getPreset,
  tauriShell,
  useChat,
} from '@alice-wallet/alice-ai';
import { openExternalUrl } from '@/lib/open-external';
import { buildFeedbackIssueUrl, getReportPageLabel } from '@/lib/feedback-context';
import appWebPackage from '../../package.json';
import appDesktopPackage from '../../../app-desktop/package.json';
import { useT, type MessageKey } from '@/i18n';

const APP_LABELS = { desktop: 'Desktop', android: 'Android', ios: 'iOS', web: 'Web' } as const;

const FEEDBACK_EMAIL = 'support@alicebtc.com';

type Category = 'bug' | 'alice-response' | 'knowledge';

// `label` names the category in the report itself, which the team reads in
// English whatever the interface language; the screen shows `labelKey`.
const CATEGORIES: { id: Category; label: string; labelKey: MessageKey; placeholderKey: MessageKey }[] = [
  { id: 'bug', label: 'Bug report', labelKey: 'feedback.category.bug', placeholderKey: 'feedback.category.bug.placeholder' },
  { id: 'alice-response', label: 'Bad Alice response', labelKey: 'feedback.category.response', placeholderKey: 'feedback.category.response.placeholder' },
  { id: 'knowledge', label: 'Knowledge suggestion', labelKey: 'feedback.category.knowledge', placeholderKey: 'feedback.category.knowledge.placeholder' },
];

const BACKEND_LABELS = {
  local: 'Local',
  cloud: 'Private Cloud',
  custom: 'Custom AI',
} as const;

const REASONING_LABELS: Record<AIPreset, string> = {
  fast: 'Short',
  balanced: 'Normal',
  deep: 'Detailed',
};

// What the report is allowed to know about the AI setup. Deliberately only
// settings: no message content, no custom server URL, no API key. A bad answer
// is described by the reporter in their own words, not harvested from the chat.
type AIReportContext = {
  model: string;
  preset: AIPreset;
};

interface FeedbackModalProps {
  onClose: () => void;
}

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const t = useT();
  const { backendType, backendStatus } = useChat();
  const screenshotInput = useRef<HTMLInputElement>(null);
  const [aiContext, setAiContext] = useState<AIReportContext | null>(null);
  const [category, setCategory] = useState<Category>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);
  // GitHub issues are public: the warning comes when that choice is made.
  const [githubConfirm, setGithubConfirm] = useState(false);
  const githubButton = useRef<HTMLButtonElement>(null);

  const active = CATEGORIES.find(c => c.id === category)!;
  const summary = title.trim() || active.label;
  const trimmedDescription = description.trim();

  useEffect(() => {
    return () => {
      if (screenshotPreview) {
        URL.revokeObjectURL(screenshotPreview);
      }
    };
  }, [screenshotPreview]);

  useEffect(() => {
    let cancelled = false;
    // Custom reads the cloud preset key, same as ai-backend-custom does, so the
    // report shows the preset that actually applied rather than a guess.
    const presetKey = backendType === 'local' ? 'local' : 'cloud';
    (async () => {
      const [preset, model] = await Promise.all([
        getPreset(presetKey),
        (async () => {
          if (backendType === 'cloud') {
            const id = await getActiveCloudModelId();
            return CLOUD_MODELS.find(m => m.id === id)?.name ?? 'Private Cloud';
          }
          if (backendType === 'custom') {
            const server = await getCustomServer();
            return server?.model || 'Unknown';
          }
          const id = await getActiveModelId();
          return getModelName(id);
        })(),
      ]);
      if (!cancelled) setAiContext({ preset, model });
    })().catch(() => {});
    return () => { cancelled = true; };
  }, [backendType]);

  const buildReportBody = () => {
    const lines = [
      `Category: ${active.label}`,
      `Summary: ${summary}`,
      '',
      'Description:',
      trimmedDescription,
      '',
      'Context:',
      `- App: ${APP_LABELS[tauriShell() ?? 'web']} v${tauriShell() ? appDesktopPackage.version : appWebPackage.version}`,
      `- AI mode: ${BACKEND_LABELS[backendType]}`,
      // Private Cloud has a single model of the same name, so a Model line there
      // would just repeat the mode. Only say it when it adds something.
      aiContext && aiContext.model !== BACKEND_LABELS[backendType] ? `- Model: ${aiContext.model}` : '',
      `- Reasoning: ${aiContext ? REASONING_LABELS[aiContext.preset] : 'Unknown'}`,
      `- Backend status: ${backendStatus.state}`,
      `- Page: ${typeof window !== 'undefined' ? getReportPageLabel(window.location.href) : 'Unknown'}`,
      `- User agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}`,
      `- Screenshot selected: ${screenshot ? screenshot.name : 'No'}`,
      '',
      screenshot ? 'If relevant, attach the selected screenshot manually when sending this report.' : '',
      screenshot ? '' : '',
      'Safety reminder:',
      'Do not include seed phrases, private keys, or sensitive screenshots.',
    ].filter(Boolean);
    return lines.join('\n');
  };

  const copyText = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const handleCopy = async () => {
    await copyText(buildReportBody());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleEmail = async () => {
    const subject = encodeURIComponent(`[Alice beta report] ${summary}`);
    const body = encodeURIComponent(buildReportBody());
    await openExternalUrl(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`);
  };

  const handleScreenshotChange = (file: File | null) => {
    if (file && !file.type.startsWith('image/')) {
      return;
    }

    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
    }

    setScreenshot(file);
    setScreenshotPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    handleScreenshotChange(event.dataTransfer.files?.[0] ?? null);
  };

  const handleSubmit = async () => {
    await openExternalUrl(buildFeedbackIssueUrl({ title: summary, body: buildReportBody(), category }));
    onClose();
  };

  const closeGithubConfirm = () => {
    setGithubConfirm(false);
    githubButton.current?.focus();
  };

  return (
    // Above the phone drawer (z-50) it may be opened from.
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50 }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 560,
          maxHeight: 'min(92vh, 760px)',
          overflowY: 'auto',
          padding: 18,
          backgroundColor: 'var(--alice-bg)',
          border: '1px solid var(--alice-border)',
          borderRadius: 'var(--alice-radius-field)',
          color: 'var(--alice-text)',
        }}
      >
        <h3
          id="feedback-title"
          className="font-pixel tracking-widest m-0"
          style={{ fontSize: 12, color: 'var(--alice-primary-dark)' }}
        >
          {t('feedback.title')}
        </h3>
        <p
          className="font-numbers m-0 mt-2"
          style={{ fontSize: 15, lineHeight: '19px', color: 'var(--alice-muted)' }}
        >
          {t('feedback.intro')}
        </p>
        <p
          className="font-numbers m-0 mt-2"
          style={{ fontSize: 14, lineHeight: '17px', color: 'var(--alice-primary-dark)' }}
        >
          {t('feedback.safety')}
        </p>

        <div role="group" aria-label={t('feedback.categoryGroup')} className="flex flex-wrap gap-1.5 mt-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className="alice-control alice-control--choice flex-1"
              style={{ lineHeight: '20px', padding: '8px 6px' }}
            >
              {t(c.labelKey)}
            </button>
          ))}
        </div>

        <label className="alice-field-label mt-4" htmlFor="feedback-summary">{t('feedback.summary')}</label>
        <input
          id="feedback-summary"
          // Focus only where a keyboard is physical: on a touch screen the
          // on-screen keyboard would cover the form before it has been read.
          autoFocus={finePointer()}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('feedback.summaryPlaceholder')}
          maxLength={120}
          className="alice-field w-full"
          style={{
            minHeight: 40,
            fontSize: 15,
            padding: '0 10px',
            color: 'var(--alice-text)',
            backgroundColor: 'transparent',
            border: '1px solid var(--alice-border)',
            borderRadius: 'var(--alice-radius-field)',
          }}
        />

        <label className="alice-field-label mt-3" htmlFor="feedback-description">{t('feedback.description')} <span style={{ color: 'var(--alice-muted)' }}>{t('feedback.required')}</span></label>
        <textarea
          id="feedback-description"
          required
          aria-describedby="feedback-send-help"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t(active.placeholderKey)}
          rows={4}
          className="alice-field w-full resize-y"
          style={{
            fontSize: 15,
            lineHeight: '19px',
            padding: '8px 10px',
            color: 'var(--alice-text)',
            backgroundColor: 'transparent',
            border: '1px solid var(--alice-border)',
            borderRadius: 'var(--alice-radius-field)',
          }}
        />

        <div
          className="mt-3"
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDrop={handleDrop}
          style={{
            padding: 10,
            backgroundColor: 'transparent',
            border: `1px dashed ${dragActive ? 'var(--alice-primary)' : 'var(--alice-border)'}`,
            borderRadius: 'var(--alice-radius-field)',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className="font-numbers m-0"
                style={{ fontSize: 14, lineHeight: '17px', color: 'var(--alice-text)' }}
              >
                {t('feedback.screenshot.title')}
              </p>
              <p
                className="font-numbers m-0 mt-1"
                style={{ fontSize: 13, lineHeight: '15px', color: 'var(--alice-muted)' }}
              >
                {t('feedback.screenshot.hint')}
              </p>
            </div>
            <button type="button" className="alice-control alice-control--quiet" onClick={() => screenshotInput.current?.click()}>
              <SvgIcon svg={ATTACHMENT_ICON} size={20} /> {t('feedback.screenshot.choose')}
            </button>
            <input ref={screenshotInput} type="file" accept="image/*" className="hidden" aria-label={t('feedback.screenshot.chooseLabel')} onChange={(event) => handleScreenshotChange(event.target.files?.[0] ?? null)} />
          </div>

          {screenshotPreview && (
            <div className="mt-3">
              <img
                src={screenshotPreview}
                alt={t('feedback.screenshot.previewAlt')}
                style={{
                  width: '100%',
                  maxHeight: 180,
                  objectFit: 'contain',
                  border: '1px solid var(--alice-border)',
                  borderRadius: 'var(--alice-radius-field)',
                  backgroundColor: 'var(--alice-bg)',
                }}
              />
              <div className="flex items-center justify-between gap-2 mt-2">
                <p
                  className="font-numbers m-0"
                  style={{ fontSize: 13, lineHeight: '15px', color: 'var(--alice-muted)', overflowWrap: 'anywhere' }}
                >
                  {screenshot?.name}
                </p>
                <button
                  type="button"
                  onClick={() => handleScreenshotChange(null)}
                  className="alice-control alice-control--quiet"
                  style={{ padding: '7px 8px' }}
                >
                  <SvgIcon svg={DELETE_ICON} size={16} /> {t('feedback.screenshot.remove')}
                </button>
              </div>
            </div>
          )}
        </div>

        <p id="feedback-send-help" className="font-numbers mt-3" style={{ fontSize: 13, color: 'var(--alice-muted)' }}>{t('feedback.sendHelp')}</p>
        <div className="grid gap-2 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <button
            onClick={onClose}
            className="alice-control alice-control--quiet flex-1"
            style={{ padding: '10px 12px' }}
          >
            <SvgIcon svg={CLOSE_ICON} size={16} /> {t('common.cancel')}
          </button>
          <button
            onClick={() => void handleCopy()}
            disabled={!trimmedDescription}
            className="alice-control alice-control--quiet flex-1 disabled:cursor-not-allowed"
            style={{ padding: '10px 12px' }}
          >
            <SvgIcon svg={copied ? CHECK_ICON : COPY_ICON} size={16} /> <span aria-live="polite">{copied ? t('common.copied') : t('feedback.copy')}</span>
          </button>
          <button
            onClick={() => void handleEmail()}
            disabled={!trimmedDescription}
            className="alice-control alice-control--quiet flex-1 disabled:cursor-not-allowed"
            style={{ padding: '10px 12px' }}
          >
            <SvgIcon svg={MAIL_ICON} size={20} /> {t('feedback.email')}
          </button>
          <button
            ref={githubButton}
            onClick={() => setGithubConfirm(true)}
            disabled={!trimmedDescription}
            aria-describedby="feedback-send-help"
            className="alice-control alice-control--primary flex-1 disabled:cursor-not-allowed"
            style={{ padding: '10px 12px' }}
          >
            <SvgIcon svg={EXTERNAL_ICON} size={16} /> {t('feedback.github')}
          </button>
        </div>
      </div>

      {githubConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 60 }}
          onClick={(event) => { event.stopPropagation(); closeGithubConfirm(); }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="feedback-github-title"
            aria-describedby="feedback-github-text"
            onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); closeGithubConfirm(); } }}
            onClick={(event) => event.stopPropagation()}
            className="flex flex-col gap-3"
            style={{
              width: '100%',
              maxWidth: 440,
              padding: 18,
              backgroundColor: 'var(--alice-bg)',
              border: '1px solid var(--alice-border)',
              borderRadius: 'var(--alice-radius-field)',
              color: 'var(--alice-text)',
            }}
          >
            <h4 id="feedback-github-title" className="font-pixel tracking-widest m-0" style={{ fontSize: 12, color: 'var(--alice-primary-dark)' }}>
              {t('feedback.github.publicTitle')}
            </h4>
            <p id="feedback-github-text" className="font-numbers m-0" style={{ fontSize: 15, lineHeight: '21px', color: 'var(--alice-text)' }}>
              {t('feedback.github.publicText')}
            </p>
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              <button
                autoFocus
                onClick={() => void handleSubmit()}
                className="alice-control alice-control--primary"
                style={{ padding: '10px 12px' }}
              >
                <SvgIcon svg={EXTERNAL_ICON} size={16} /> {t('feedback.github')}
              </button>
              <button
                onClick={() => { setGithubConfirm(false); void handleEmail(); }}
                className="alice-control alice-control--quiet"
                style={{ padding: '10px 12px' }}
              >
                <SvgIcon svg={MAIL_ICON} size={20} /> {t('feedback.github.emailInstead')}
              </button>
              <button
                onClick={closeGithubConfirm}
                className="alice-control alice-control--quiet"
                style={{ padding: '10px 12px' }}
              >
                <SvgIcon svg={CLOSE_ICON} size={16} /> {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
