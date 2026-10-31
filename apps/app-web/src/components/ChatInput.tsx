'use client';

import { SendMessageButton } from '@/components/SendMessageButton';
import { useRef, type ReactNode } from 'react';
import { enterSends, useComposerFit } from '@/lib/composer-field';
import { useT } from '@/i18n';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  modelSelector?: ReactNode;
  // Panel mode (the Explorer sidebar): the shell drops its max-width and
  // padding so the composer fills its container edge to edge.
  panel?: boolean;
}

export function ChatInput({
  input,
  setInput,
  onSend,
  disabled,
  modelSelector,
  panel = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useT();

  useComposerFit(textareaRef, input);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (enterSends(e)) {
      e.preventDefault();
      if (input.trim() && !disabled) onSend();
    }
  };

  return (
    <div className={panel ? 'chat-composer-shell chat-composer-shell--panel' : 'chat-composer-shell'}>
      <div className="chat-composer">
        <textarea
          aria-label={t('chat.composer.label')}
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.composer.placeholder')}
          maxLength={500}
          rows={1}
          className="chat-composer-input w-full min-w-0 resize-none bg-transparent border-none outline-none font-numbers text-lg py-0 placeholder:opacity-100"
          style={{
            color: 'var(--alice-text)',
            height: '26px',
            minHeight: 26,
            lineHeight: '26px',
          }}
        />
        <div className="chat-composer-controls flex min-w-0 items-center justify-end gap-1.5">
          {modelSelector && (
            <div className="flex min-w-0 flex-1 items-center justify-start">
              {modelSelector}
            </div>
          )}
          <SendMessageButton onClick={onSend} disabled={!input.trim() || disabled} />
        </div>
      </div>
    </div>
  );
}
