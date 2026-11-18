'use client';

// The "Ask Alice" opener: a speech bubble fixed to the bottom-right of the
// viewport (it never scrolls with the page), clear of the home indicator.
// It only opens the persistent Ask-Alice sidebar owned by the workspace (or,
// on a phone, hands the page over to the main chat); it renders nothing else
// and disappears while the sidebar is open. Its shape follows the platform
// (see .alice-ask-fab): a framed control on the web and the desktop, a round
// one in the Android app, the same in glass in the iOS app.

import { SvgIcon } from '@/components/SvgIcon';
import { CHAT_ICON } from '@/lib/atelier-icons';
import { useT } from '@/i18n';

export function AskAliceFab({ onOpen }: { onOpen: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t('ask.label')}
      title={t('ask.label')}
      className="alice-control alice-ask-fab"
    >
      <SvgIcon svg={CHAT_ICON} size={20} />
    </button>
  );
}
