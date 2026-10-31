'use client';

// The "Ask Alice" opener: an Alice bubble fixed to the bottom-right of the
// viewport (it never scrolls with the page), clear of the home indicator.
// It only opens the persistent Ask-Alice sidebar owned by the Explorer
// workspace (or, on a phone, hands the page over to the main chat); it
// renders nothing else and disappears while the sidebar is open.

import { AskAliceIcon } from '@/components/AskAliceIcon';
import { useT } from '@/i18n';

export function AskAliceFab({ onOpen }: { onOpen: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t('ask.label')}
      className="alice-control alice-control--tool fixed z-40 flex items-center justify-center cursor-pointer"
      style={{
        right: 16,
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        width: 48,
        height: 48,
        border: 'none',
        padding: 0,
        backgroundColor: 'transparent',
      }}
    >
      <AskAliceIcon size={48} />
    </button>
  );
}
