'use client';

import { useEffect, useState } from 'react';
import {
  SEMANTIC_MODEL_DOWNLOAD_BYTES,
  SEMANTIC_SEARCH_STATE_EVENT,
  type SemanticSearchState,
  disableSemanticSearch,
  downloadSemanticSearchNow,
  formatSize,
  getSemanticSearchState,
} from '@alice-wallet/alice-ai';
import { useT, type MessageKey } from '@/i18n';
import { SectionHint, SectionLabel, sectionStyle } from './ui';

const SIZE_LABEL = formatSize(SEMANTIC_MODEL_DOWNLOAD_BYTES);

// Inside an installed desktop build the model ships in the app bundle: no
// download happens, so no download may be promised. Same detection as the
// runtime (semantic-runtime.ts).
const isEmbeddedDesktopBuild = () =>
  typeof window !== 'undefined' && window.location.protocol.startsWith('tauri');

// The status line says what is true right now; the hint above it says what the
// feature is. Every state keeps the same honest frame: without the model Alice
// still answers, searching her knowledge by keywords instead of by meaning.
const STATUS_COPY: Record<SemanticSearchState['status'], MessageKey | null> = {
  unsupported: null,
  off: 'settings.semantic.off',
  // "Loads", not "downloads": the model may already sit in the browser cache
  // from an earlier session, and this line must be true either way.
  idle: 'settings.semantic.idle',
  'blocked-metered': 'settings.semantic.blockedMetered',
  loading: 'settings.semantic.loading',
  ready: 'settings.semantic.ready',
  failed: 'settings.semantic.failed',
};

/**
 * State and control for the semantic search model: the one download the app
 * used to start silently. The user sees whether it happened, can start it
 * now, and can remove it (which also stops it from coming back on its own).
 */
export function SemanticSearchSection() {
  const t = useT();
  const [state, setState] = useState<SemanticSearchState>({ status: 'idle', progress: null });

  useEffect(() => {
    const sync = () => setState(getSemanticSearchState());
    sync();
    window.addEventListener(SEMANTIC_SEARCH_STATE_EVENT, sync);
    return () => window.removeEventListener(SEMANTIC_SEARCH_STATE_EVENT, sync);
  }, []);

  // `unsupported` only comes from semantic-runtime.web.ts, which this Next
  // build does not resolve. Kept as a guard: a section made only of dead
  // buttons would be noise.
  if (state.status === 'unsupported') return null;

  const embedded = isEmbeddedDesktopBuild();
  const progress = state.progress === null ? null : Math.round(state.progress * 100);
  const statusKey = STATUS_COPY[state.status];
  const statusLine = embedded && state.status === 'idle'
    ? t('settings.semantic.embedded')
    : statusKey ? t(statusKey, { size: SIZE_LABEL }) : '';

  return (
    <div style={sectionStyle}>
      <SectionLabel>{t('settings.semantic.title')}</SectionLabel>
      <SectionHint>{t('settings.semantic.hint', { size: SIZE_LABEL })}</SectionHint>
      <p className="font-numbers m-0" style={{ fontSize: 14, opacity: 1, lineHeight: '18px' }}>
        {statusLine}
      </p>
      {state.status === 'loading' && progress !== null && (
        <div className="flex items-center gap-2 mt-2">
          <div role="progressbar" aria-label={t('settings.semantic.progressAria')} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} style={{ height: 6, flex: 1, border: '1px solid var(--alice-border)' }}>
            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--alice-primary)' }} />
          </div>
          <span className="font-numbers" style={{ fontSize: 13, opacity: 1 }}>{progress}%</span>
        </div>
      )}
      <div className="flex gap-2 mt-3 flex-wrap">
        {(state.status === 'idle' || state.status === 'blocked-metered' || state.status === 'off' || state.status === 'failed') && (
          <button
            onClick={() => downloadSemanticSearchNow()}
            className="alice-control alice-control--primary font-numbers"
          >
            {state.status === 'failed'
              ? embedded ? t('settings.semantic.retry') : t('settings.semantic.retryDownload')
              : embedded ? t('settings.semantic.loadNow') : t('settings.semantic.download', { size: SIZE_LABEL })}
          </button>
        )}
        {(state.status === 'ready' || state.status === 'loading') && (
          <button
            onClick={() => void disableSemanticSearch()}
            className="alice-control alice-control--danger font-numbers"
          >
            {state.status === 'loading'
              ? t('settings.semantic.cancelAndTurnOff')
              : embedded ? t('settings.semantic.turnOff') : t('settings.semantic.remove', { size: SIZE_LABEL })}
          </button>
        )}
      </div>
    </div>
  );
}
