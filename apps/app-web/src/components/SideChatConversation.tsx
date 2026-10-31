'use client';

import { greetingFor, useChat } from '@alice-wallet/alice-ai';
import { useT, type Locale } from '@/i18n';
import { AliceRabbit } from '@/components/AliceRabbit';
import { ChatMessage } from '@/components/ChatMessage';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { useChatRabbit } from '@/hooks/use-chat-rabbit';

/** The main chat's single, fixed mascot and bottom-aligned history in a dock. */
export function SideChatConversation({ input, questions, onQuestion, disabled = false, lang }: {
  input: string;
  questions: readonly string[];
  onQuestion: (question: string) => void;
  disabled?: boolean;
  /** The surface's own language (Learn's course language); the app language otherwise. */
  lang?: Locale;
}) {
  const t = useT(lang);
  const { messages, busy, aiEnabled, backendStatus, lastRequestFailed } = useChat();
  const scrollRef = useAutoScroll([messages, busy]);
  const latestUserIndex = messages.reduce((latest, message, index) => message.role === 'user' ? index : latest, -1);
  const replyStarted = latestUserIndex >= 0 && messages.slice(latestUserIndex + 1)
    .some(message => message.role === 'assistant' && message.content.trim().length > 0);
  const available = aiEnabled && backendStatus.state === 'ready' && !lastRequestFailed;
  const rabbitState = useChatRabbit({ input, busy, available, replyStarted });
  const visible = messages.filter(message => !(busy && message.role === 'assistant' && !message.content));
  const streamingId = busy && replyStarted
    ? [...visible].reverse().find(message => message.role === 'assistant')?.id : undefined;

  return <>
    <div className="atelier-stage alice-side-stage">
      <div className="atelier-perch"><AliceRabbit state={rabbitState} connected={available} size={32} /></div>
      <div ref={scrollRef} className="atelier-history" role="region" aria-label={t('chat.side.conversation')} tabIndex={0}>
        <div className="atelier-messages">
          {visible.map(message => <ChatMessage key={message.id} message={message} compact showAvatar={false} streaming={message.id === streamingId} lang={t.locale} />)}
          {messages.length === 0 && <p className="font-numbers m-0" style={{ color: 'var(--alice-text)' }}>
            {greetingFor(t.locale)}
          </p>}
          {busy && !replyStarted && <p className="atelier-waiting" role="status">{t('chat.panel.preparing')}</p>}
        </div>
      </div>
    </div>
    {messages.length === 0 && <div className="alice-side-suggestions">
      {questions.map(question => <button key={question} type="button" onClick={() => onQuestion(question)} disabled={busy || !aiEnabled || disabled} className="alice-control alice-panel-suggestion" title={t('chat.suggestions.sendTitle', { text: question })}>
        <span>{question}</span>
      </button>)}
    </div>}
    {aiEnabled && (lastRequestFailed || backendStatus.state !== 'ready') && <p className="alice-side-model-status" role="status">
      {t(lastRequestFailed ? 'chat.status.lastFailed' : backendStatus.state === 'loading' ? 'chat.status.loadingModel' : 'chat.status.modelUnavailable')}
    </p>}
  </>;
}
