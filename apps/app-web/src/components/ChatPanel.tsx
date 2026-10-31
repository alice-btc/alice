'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useChat,
  getCustomServer,
  hasLocalEngine,
  isTauriDesktop,
  flushProductEvents,
  trackProductEvent,
} from '@alice-wallet/alice-ai';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { useQuestionParam } from '@/hooks/use-question-param';
import { ChatMessage } from '@/components/ChatMessage';
import { ExpiryBanner } from '@/components/ExpiryBanner';
import { LearnChatResources } from '@/components/learn/LearnChatResources';
import { defaultLearnLanguage, loadLearnLanguage } from '@/lib/learn/language';
import { useT, type MessageKey } from '@/i18n';
import { loadChatResources, takeChatResources, type LearnChatResources as ChatResources } from '@/lib/learn/suggest-catalog';
import { ChatInput } from '@/components/ChatInput';
import { AskAliceComposer } from '@/components/AskAliceComposer';
import { LocalModelNudge, localModelInstalled, recordCloudSend } from '@/components/LocalModelNudge';
import { ModelSelector } from '@/components/ModelSelector';
import { Sidebar, SIDEBAR_ICON_SVG } from '@/components/Sidebar';
import { SvgIcon } from '@/components/SvgIcon';
import { PLUS_ICON, SETTINGS_ICON } from '@/lib/atelier-icons';
import { AliceRabbit } from '@/components/AliceRabbit';
import { useChatRabbit } from '@/hooks/use-chat-rabbit';
import { useOpenSettings } from '@/lib/settings-url';
import { setAskHandoff, useAskHandoff, usePhoneLayout } from '@/lib/explorer/ask-handoff';
import { saveSessionTabs } from '@/lib/explorer/session-links';

const SUGGESTIONS: MessageKey[] = [
  'chat.suggestions.bitcoin',
  'chat.suggestions.secureWallet',
  'chat.suggestions.lightning',
  'chat.suggestions.selfCustody',
];

function LocalNotice() {
  const openSettings = useOpenSettings();
  const t = useT();
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8">
      <p
        className="font-numbers text-center max-w-md m-0"
        style={{ fontSize: 20, lineHeight: '26px', color: 'var(--alice-text)' }}
      >
        {t('chat.localNotice.body')}
      </p>
      <button
        onClick={() => openSettings('ai')}
        className="alice-control alice-control--primary"
      >
        <SvgIcon svg={SETTINGS_ICON} size={20} /> {t('chat.localNotice.openSettings')}
      </button>
    </div>
  );
}

export function ChatPanel() {
  const chat = useChat();
  const t = useT();
  const { messages, input, setInput, send, busy, clearMessages, showGreeting, backendType, backendStatus, setBackendType, setAiEnabled, aiEnabled, lastRequestFailed, activeSessionId } = chat;
  const scrollRef = useAutoScroll([messages, busy]);

  useQuestionParam({
    send,
    setInput,
    backendStatus,
    busy,
    chatReady: messages.length > 0,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  useEffect(() => {
    const desktop = matchMedia('(min-width: 768px)');
    const closeDrawer = () => { if (desktop.matches) setSidebarMobileOpen(false); };
    desktop.addEventListener('change', closeDrawer);
    return () => desktop.removeEventListener('change', closeDrawer);
  }, []);
  const [hasCustomServer, setHasCustomServer] = useState(false);
  // "Pour aller plus loin" resources for the message being sent, computed in
  // the send handler itself: deterministic, immune to effect re-runs and
  // restored history. Re-adopted from the session store on mount, so an
  // Explorer round-trip does not lose the block.
  const [chatResources, setChatResources] = useState<ChatResources | null>(
    () => loadChatResources()?.resources ?? null,
  );
  const [resourcesQuestion, setResourcesQuestion] = useState<string>(
    () => loadChatResources()?.question ?? '',
  );
  const sendWithSuggestion = (text?: string) => {
    const q = (text ?? input).trim();
    if (q) {
      const learnLang = loadLearnLanguage() ?? defaultLearnLanguage(navigator.language);
      setResourcesQuestion(q);
      setChatResources(takeChatResources(q, q, learnLang));
    }
    void send(text);
    if (backendType === 'cloud' && recordCloudSend()) nudgeDue.current = true;
  };

  // The invitation to a local model waits for the reply to finish, then
  // checks no model is already installed (see LocalModelNudge).
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const nudgeDue = useRef(false);
  useEffect(() => {
    if (busy || !nudgeDue.current) return;
    nudgeDue.current = false;
    void localModelInstalled().then(installed => { if (!installed) setNudgeOpen(true); });
  }, [busy]);

  const showLocalNotice = backendType === 'local' && !hasCustomServer && !hasLocalEngine();

  useEffect(() => {
    if (messages.length === 0) showGreeting();
    getCustomServer().then((cs) => setHasCustomServer(!!cs?.url)).catch(() => {});
    trackProductEvent('app_opened');
    trackProductEvent('chat_opened');
    // Send whatever is still queued before the tab goes away, rather than
    // losing it. visibilitychange is the reliable signal here; unload is not.
    const flushOnHide = () => {
      if (document.visibilityState === 'hidden') void flushProductEvents();
    };
    document.addEventListener('visibilitychange', flushOnHide);
    return () => document.removeEventListener('visibilitychange', flushOnHide);
  }, []);

  const hasUserMessages = messages.some((m) => m.role === 'user');
  const latestUserIndex = messages.reduce((latest, message, index) => (
    message.role === 'user' ? index : latest
  ), -1);
  const assistantReplyStarted = latestUserIndex >= 0 && messages
    .slice(latestUserIndex + 1)
    .some((message) => message.role === 'assistant' && message.content.trim().length > 0);
  const showTypingIndicator = busy && !assistantReplyStarted;

  const available = aiEnabled && backendStatus.state === 'ready' && !showLocalNotice && !lastRequestFailed;
  const rabbitState = useChatRabbit({ input, busy, available, replyStarted: assistantReplyStarted });
  const visible = messages.filter(msg => !(busy && msg.role === 'assistant' && !msg.content));
  const streamingId = busy && assistantReplyStarted
    ? [...visible].reverse().find(m => m.role === 'assistant')?.id : undefined;

  // A page handed over by the Explorer on a phone: the composer becomes the
  // Ask-Alice composer, with the page's attachment, until the chip is removed
  // or a new conversation starts. The conversation is linked to the tabs open
  // at hand-over on its first send, as the dock does; the session id may
  // only appear after that send, so the link waits for it.
  const handoff = useAskHandoff();
  const pendingLinkRef = useRef(false);
  const linkHandoffTabs = () => {
    if (!handoff?.tabs?.length || !handoff.activeTabId) return;
    if (activeSessionId) saveSessionTabs(activeSessionId, handoff.tabs, handoff.activeTabId);
    else pendingLinkRef.current = true;
  };
  useEffect(() => {
    if (!pendingLinkRef.current || !activeSessionId || !handoff?.tabs?.length || !handoff.activeTabId) return;
    pendingLinkRef.current = false;
    saveSessionTabs(activeSessionId, handoff.tabs, handoff.activeTabId);
  }, [activeSessionId, handoff]);

  // On a phone, once the conversation has started, the rabbit leaves its
  // column so the text takes the whole width: it sits on the action row of
  // Alice's last reply, as if it had just spoken, or by the waiting line
  // while the reply is pending. The greeting alone keeps the column.
  const phone = usePhoneLayout();
  const inlineRabbit = phone && hasUserMessages && !showLocalNotice;
  const lastVisible = visible[visible.length - 1];
  const rabbitMessageId = inlineRabbit && !showTypingIndicator && lastVisible?.role === 'assistant' && lastVisible.id !== 'greeting'
    ? lastVisible.id : undefined;
  const rabbitAlone = inlineRabbit && !showTypingIndicator && !rabbitMessageId;
  const rabbit = <span className="atelier-inline-rabbit"><AliceRabbit state={rabbitState} connected={available} size={32} /></span>;

  return (
    <div className="atelier-shell flex h-full overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
        mobileOpen={sidebarMobileOpen}
        onMobileClose={() => setSidebarMobileOpen(false)}
      />
      <main className="atelier-main flex flex-col flex-1 min-w-0 min-h-0" inert={sidebarMobileOpen}>
        {isTauriDesktop() && <div data-tauri-drag-region className="shrink-0" style={{ height: 28 }} />}
        <ExpiryBanner />
        <button onClick={() => setSidebarMobileOpen(true)} className="alice-control alice-control--tool atelier-mobile-menu md:hidden" aria-label={t('chat.panel.openMenu')} aria-expanded={sidebarMobileOpen}>
          <SvgIcon svg={SIDEBAR_ICON_SVG} size={20} color="var(--alice-muted)" />
        </button>
        <button onClick={() => { clearMessages(); setAskHandoff(null); }} className="alice-control alice-control--tool atelier-mobile-new md:hidden" aria-label={t('sidebar.newChatLabel')} disabled={busy || !hasUserMessages}>
          <SvgIcon svg={PLUS_ICON} size={20} color="var(--alice-muted)" />
        </button>
        <div className="atelier-conversation">
          <div className={inlineRabbit ? 'atelier-stage atelier-stage--inline' : 'atelier-stage'}>
            {!inlineRabbit && <div className="atelier-perch"><AliceRabbit state={rabbitState} connected={available} /></div>}
            <div ref={scrollRef} className="atelier-history" role="region" aria-label={t('chat.panel.conversation')} tabIndex={0}>
              <div className="atelier-messages">
                {showLocalNotice ? <LocalNotice /> : visible.map(msg => (
                  <ChatMessage key={msg.id} message={msg} streaming={msg.id === streamingId} showAvatar={false} leading={msg.id === rabbitMessageId ? rabbit : undefined} />
                ))}
                {!showLocalNotice && showTypingIndicator && (
                  <div className="atelier-waiting-row">
                    {inlineRabbit && rabbit}
                    <p className="atelier-waiting" role="status">{t('chat.panel.preparing')}</p>
                  </div>
                )}
                {!showLocalNotice && rabbitAlone && <div className="atelier-waiting-row">{rabbit}</div>}
                {!showLocalNotice && <LearnChatResources resources={chatResources} question={resourcesQuestion} messages={messages} busy={busy} lang={t.locale} />}
              </div>
            </div>
          </div>
          {!showLocalNotice && !handoff && !hasUserMessages && messages.length <= 1 && (
            <div className="atelier-suggestions">
              {SUGGESTIONS.map(key => t(key)).map(text => <button type="button" key={text} onClick={() => sendWithSuggestion(text)} disabled={busy || !aiEnabled} title={t('chat.suggestions.sendTitle', { text })}>{text}</button>)}
            </div>
          )}
          {!showLocalNotice && (handoff ? (
            <AskAliceComposer
              variant="chat"
              signals={handoff.signals}
              fullContext={handoff.fullContext}
              contextId={handoff.contextId}
              contextLabel={handoff.contextLabel}
              pageNote={handoff.pageNote}
              textAttachment={handoff.text}
              defaultQuestions={handoff.defaultQuestions}
              onActivity={linkHandoffTabs}
              onRemoveAttachment={() => setAskHandoff(null)}
              renderConversation={({ questions, onQuestion, disabled }) => !hasUserMessages && messages.length <= 1 && (
                <div className="atelier-suggestions">
                  {questions.map(text => <button type="button" key={text} onClick={() => onQuestion(text)} disabled={busy || !aiEnabled || disabled} title={t('chat.suggestions.sendTitle', { text })}>{text}</button>)}
                </div>
              )}
            />
          ) : (
            <ChatInput input={input} setInput={setInput} onSend={() => sendWithSuggestion()} disabled={busy || !aiEnabled}
              modelSelector={<ModelSelector backendType={backendType} setBackendType={setBackendType} setAiEnabled={setAiEnabled} placement="composer" />} />
          ))}
          {showLocalNotice && <div className="chat-composer-shell"><ModelSelector backendType={backendType} setBackendType={setBackendType} setAiEnabled={setAiEnabled} placement="composer" /></div>}
          {(!aiEnabled || lastRequestFailed || backendStatus.state !== 'ready') && <div className="atelier-model-status" role="status">
            {t(!aiEnabled ? 'chat.status.aiDisabled' : lastRequestFailed ? 'chat.status.lastFailed' : backendStatus.state === 'loading' ? 'chat.status.loadingModel' : 'chat.status.modelUnavailable')}
          </div>}
        </div>
      </main>
      {nudgeOpen && <LocalModelNudge onClose={() => setNudgeOpen(false)} />}
    </div>
  );
}
