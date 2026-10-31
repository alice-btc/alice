'use client';

// The "Ask Alice" dock: the wallet chat docked beside the Explorer, with the
// Ask-Alice composer under it. The composer, and every guarantee on what
// reaches the model, lives in AskAliceComposer; this file only lays the dock
// out: a header with new conversation and close, the conversation, the
// composer. On a phone the Explorer does not open this dock: it hands the
// page over to the main chat instead (see lib/explorer/ask-handoff.ts).

import { useChat } from '@alice-wallet/alice-ai';
import { AskAliceComposer, type AskAliceComposerProps } from '@/components/AskAliceComposer';
import { SideChatConversation } from '@/components/SideChatConversation';
import { SvgIcon } from '@/components/SvgIcon';
import { PLUS_ICON, CLOSE_ICON } from '@/lib/atelier-icons';
import { useT } from '@/i18n';

type DockProps = Omit<AskAliceComposerProps, 'variant' | 'onEscape' | 'onRemoveAttachment' | 'renderConversation'> & {
  onClose: () => void;
};

export function AskAliceDock({ onClose, ...composer }: DockProps) {
  const { clearMessages } = useChat();
  const t = useT();

  return (
    <div
      className="alice-ask-panel relative flex flex-col h-full w-full min-h-0"
      aria-label={t('ask.label')}
      style={{ backgroundColor: 'var(--alice-bg-soft)' }}
    >
      {/* Conversation actions stay at the top; model choices live by the input. */}
      <div className="flex items-center justify-end px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => clearMessages()}
            className="alice-control alice-control--tool"
            aria-label={t('ask.newConversation')}
            title={t('ask.newConversation')}
          >
            <SvgIcon svg={PLUS_ICON} size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="alice-control alice-control--tool"
            aria-label={t('common.close')}
          >
            <SvgIcon svg={CLOSE_ICON} size={16} />
          </button>
        </div>
      </div>

      <AskAliceComposer
        {...composer}
        variant="panel"
        onEscape={onClose}
        renderConversation={({ input, questions, onQuestion, disabled }) => (
          <SideChatConversation input={input} questions={questions} onQuestion={onQuestion} disabled={disabled} />
        )}
      />
    </div>
  );
}
