'use client';

// One invitation to more privacy, shown once. After the 2nd message answered
// by Private Cloud with no local model installed, the chat offers the next
// step: download a local model (the desktop, Android and iOS apps), or get
// the app that can run one (the web). The counter and the "shown" mark live
// in localStorage; nothing leaves the device, and the dialog never comes back
// once answered.

import { useEffect, useRef } from 'react';
import { getDesktopModelStatus, hasLocalEngine, listKnownLocalModels, tauriShell } from '@alice-wallet/alice-ai';
import { useDialogFocus } from '@/components/settings/ui';
import { useOpenSettings } from '@/lib/settings-url';

const SHOWN_KEY = 'alice.local-model-nudge.shown';
const CLOUD_SENDS_KEY = 'alice.local-model-nudge.cloud-sends';
const CLOUD_SENDS_BEFORE_NUDGE = 2;
const APP_URL = 'https://alicebtc.com/';

function alreadyShown(): boolean {
  try { return window.localStorage.getItem(SHOWN_KEY) === 'true'; } catch { return false; }
}

function markShown(): void {
  try { window.localStorage.setItem(SHOWN_KEY, 'true'); } catch { /* best effort */ }
}

/** Counts a message sent to Private Cloud; true when the invitation is due. */
export function recordCloudSend(): boolean {
  if (alreadyShown()) return false;
  try {
    const sends = Number(window.localStorage.getItem(CLOUD_SENDS_KEY) ?? '0') + 1;
    window.localStorage.setItem(CLOUD_SENDS_KEY, String(sends));
    return sends >= CLOUD_SENDS_BEFORE_NUDGE;
  } catch {
    return false;
  }
}

/** In the apps, a model already installed makes the invitation moot. */
export async function localModelInstalled(): Promise<boolean> {
  if (!hasLocalEngine()) return false;
  try {
    const models = await listKnownLocalModels();
    const statuses = await Promise.all(models.map(model => getDesktopModelStatus(model.id)));
    return statuses.some(status => status === 'installed');
  } catch {
    return false;
  }
}

export function LocalModelNudge({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useDialogFocus(true, ref);
  const openSettings = useOpenSettings();
  useEffect(() => { markShown(); }, []);
  const app = hasLocalEngine();
  const shell = tauriShell();
  const here = shell === 'desktop' ? 'computer' : shell ? 'phone' : 'device';

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alice-nudge-title"
        aria-describedby="alice-nudge-text"
        onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onClose(); } }}
        className="font-numbers w-full flex flex-col gap-4"
        style={{ maxWidth: 480, padding: 24, background: 'var(--alice-bg)', color: 'var(--alice-text)', border: '1px solid var(--alice-border)', borderRadius: 'var(--alice-radius-field)' }}
      >
        <h2 id="alice-nudge-title" className="font-pixel m-0" style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--alice-heading)' }}>
          MORE PRIVACY
        </h2>
        {/* Wording rule (docs/security/private-cloud-e2ee.md): end-to-end
            encrypted, with the limit that the enclave's software is not yet
            verified. */}
        <p id="alice-nudge-text" className="m-0" style={{ fontSize: 15, lineHeight: 1.6 }}>
          Alice has been answering through Private Cloud: end-to-end encrypted
          to an enclave whose hardware Alice verifies before each message,
          though not yet its software. A model running on this
          {` ${here}`} is more private still: your messages
          never leave it.
          {app ? ' Download one in Settings; it takes a few minutes.' : ' Local models run in the Alice app.'}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="alice-control alice-control--quiet">
            NOT NOW
          </button>
          {app ? (
            <button type="button" onClick={() => { onClose(); openSettings('ai'); }} className="alice-control alice-control--primary">
              DOWNLOAD A LOCAL MODEL
            </button>
          ) : (
            <a href={APP_URL} target="_blank" rel="noreferrer" onClick={onClose} className="alice-control alice-control--primary">
              GET THE APP
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
