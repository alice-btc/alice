'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { recordCourseCompletionSignal, recordCourseStudySignal, useChat } from '@alice-wallet/alice-ai';
import { AskAliceFab } from '@/components/AskAliceFab';
import { WorkspaceHeaderActions, WorkspaceShell } from '@/components/WorkspaceShell';
import { setAskHandoff, usePhoneLayout } from '@/lib/explorer/ask-handoff';
import { SvgIcon } from '@/components/SvgIcon';
import { BACK_ICON, LEARN_ICON } from '@/lib/atelier-icons';
import { LearnAskAlice, useLearnContext } from '@/components/learn/LearnAskAlice';
import { LearnChapter } from '@/components/learn/LearnChapter';
import { LearnCourse } from '@/components/learn/LearnCourse';
import { LearnDefinition } from '@/components/learn/LearnDefinition';
import { LearnDictionary } from '@/components/learn/LearnDictionary';
import { LearnHome } from '@/components/learn/LearnHome';
import { LearnIntroModal, wasLearnIntroDismissed } from '@/components/learn/LearnIntroModal';
import { LearnLanguageModal } from '@/components/learn/LearnLanguageModal';
import { LearnQuiz } from '@/components/learn/LearnQuiz';
import { LearnTutorial } from '@/components/learn/LearnTutorial';
import { useLearnT } from '@/components/learn/learn-locale';
import { ASK_WIDTH_DEFAULT, clampAskWidth, loadAskWidth, saveAskWidth } from '@/lib/ask-width';
import {
  defaultLearnLanguage,
  installedLanguages,
  loadLearnLanguage,
  saveLearnLanguage,
  subscribeLearnLanguage,
  type LearnLang,
} from '@/lib/learn/language';
import { loadLangMeta, type LearnLangMeta } from '@/lib/learn/lang-meta';
import {
  loadProgress,
  markChapterRead,
  readCount,
  saveProgress,
  type LearnProgress,
} from '@/lib/learn/progress';
import { conceptsForCourse } from '@/lib/learn/course-concepts';
import { courseChapterCount } from '@/lib/learn/catalog';
import { LEARN_COURSES } from '@alice-wallet/alice-content/src/generated/planb-learn-catalog';
import { LEARN_ASK_EVENT, consumeLearnAsk, type LearnAskRequest } from '@/lib/learn/ask';
import { letterOfSlug } from '@/lib/learn/dictionary';
import { LEARN_RESET_EVENT, learnViewToSearch, parseLearnView, type LearnView } from '@/lib/learn/route';

const ASK_OPEN_KEY = 'alice.learn.ask-open';

function LearnWorkspace() {
  // Start on home so server and first client render agree; the deep-linked
  // view and stored preferences come in after hydration, the repo's idiom for
  // static export (no useSearchParams, no Suspense).
  const [view, setView] = useState<LearnView>({ kind: 'home' });
  const [lang, setLang] = useState<LearnLang>('en');
  const [progress, setProgress] = useState<LearnProgress>({});
  // The Ask-Alice sidebar, Explorer-style. Never opens on its own: the user
  // asks for it (bubble, quiz debrief, selection rescue), and entering Learn
  // always starts with the reading full-width.
  const [askOpen, setAskOpen] = useState(false);
  const [askWidth, setAskWidth] = useState(ASK_WIDTH_DEFAULT);
  // On a phone the language controls sit in the shell's header, on the row
  // of the "Learn" title it already shows; the home page's own title would
  // only repeat it, so there it goes too (LearnHome).
  const phone = usePhoneLayout();
  // On a phone the Ask-Alice sheet has no room: the bubble, a quiz debrief
  // or a selection rescue hand the page (or the request) over to the main
  // chat as a new conversation, with the same attachment the sheet would
  // show (see lib/explorer/ask-handoff.ts). Refs, so the mount-time
  // listener below sees fresh values.
  const { messages: chatMessages, clearMessages, setInput } = useChat();
  const router = useRouter();
  const pageContext = useLearnContext(view, lang);
  const phoneRef = useRef(false);
  phoneRef.current = phone;
  const handOffRef = useRef<(request?: LearnAskRequest) => void>(() => {});
  handOffRef.current = (request) => {
    const context = request ?? pageContext;
    if (chatMessages.some(m => m.role === 'user')) clearMessages();
    setAskHandoff({
      contextId: `learn:${context?.label ?? 'home'}`,
      contextLabel: context?.label ?? '',
      text: context?.text,
      signals: [],
      fullContext: null,
      defaultQuestions: [t('learn.ask.chip.differently'), t('learn.ask.chip.example'), t('learn.ask.chip.why')],
    });
    if (request) setInput(request.draft);
    router.push('/');
  };
  // Reported by the chapter reader so the sticky header can show where the
  // reader is (formation, chapter, progress) while the text scrolls.
  const [chapterMeta, setChapterMeta] = useState<{
    courseName: string;
    chapterTitle: string;
    index: number;
    total: number;
  } | null>(null);
  // Downloadable-language support: the quick toggle lists installed languages,
  // and non-embedded languages need their translated metadata overlay.
  const [installed, setInstalled] = useState<LearnLang[]>(['fr', 'en']);
  const [langModalOpen, setLangModalOpen] = useState(false);
  // Welcome dialog, Explorer-style: shown on every mount of the section until
  // the reader ticks "don't show this again". Decided after hydration since it
  // reads localStorage.
  const [showIntro, setShowIntro] = useState(false);
  const [langMeta, setLangMeta] = useState<LearnLangMeta | null>(null);
  const hydrated = useRef(false);
  const t = useLearnT(lang);

  useEffect(() => {
    setView(parseLearnView(window.location.search));
    setLang(loadLearnLanguage() ?? defaultLearnLanguage(navigator.language));
    setInstalled(installedLanguages());
    setProgress(loadProgress());
    setAskWidth(loadAskWidth());
    // Same memory as Explorer and the Playground: reopening Learn with the
    // dock open is a per-section choice, only the width is shared.
    try { setAskOpen(window.localStorage.getItem(ASK_OPEN_KEY) === 'true'); } catch { /* default closed */ }
    setShowIntro(!wasLearnIntroDismissed());
    hydrated.current = true;
    const onPop = () => setView(parseLearnView(window.location.search));
    // The sidebar's Learn entry always lands on the dashboard, even when the
    // panel is already mounted on a course or chapter.
    const onReset = () => {
      setView({ kind: 'home' });
      document.getElementById('learn-scroll')?.scrollTo(0, 0);
    };
    // Quiz debriefs and selection rescues open the Ask-Alice sidebar in
    // place (the course stays in view); the request itself is consumed by
    // the panel component.
    const onAsk = () => {
      if (!phoneRef.current) { setAskOpen(true); return; }
      const request = consumeLearnAsk();
      if (request) handOffRef.current(request);
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener(LEARN_RESET_EVENT, onReset);
    window.addEventListener(LEARN_ASK_EVENT, onAsk);
    // The app language changed in Settings while Learn is open, and Learn
    // follows it (no reading language picked yet).
    const unsubscribeLang = subscribeLearnLanguage(() => {
      const saved = loadLearnLanguage();
      if (saved) setLang(saved);
    });
    return () => {
      unsubscribeLang();
      window.removeEventListener('popstate', onPop);
      window.removeEventListener(LEARN_RESET_EVENT, onReset);
      window.removeEventListener(LEARN_ASK_EVENT, onAsk);
    };
  }, []);

  const navigate = useCallback((next: LearnView) => {
    setView(next);
    window.history.pushState(null, '', `/learn/${learnViewToSearch(next)}`);
    document.getElementById('learn-scroll')?.scrollTo(0, 0);
  }, []);

  const changeLang = useCallback((next: LearnLang) => {
    setLang(next);
    saveLearnLanguage(next);
    setInstalled(installedLanguages());
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadLangMeta(lang)
      .then((meta) => { if (!cancelled) setLangMeta(meta); })
      .catch(() => { if (!cancelled) setLangMeta(null); });
    return () => { cancelled = true; };
  }, [lang]);

  const toggleAsk = useCallback((open: boolean) => {
    setAskOpen(open);
  }, []);

  useEffect(() => {
    if (hydrated.current) saveAskWidth(askWidth);
  }, [askWidth]);

  useEffect(() => {
    if (!hydrated.current) return;
    try { window.localStorage.setItem(ASK_OPEN_KEY, String(askOpen)); } catch { /* best effort */ }
  }, [askOpen]);

  // Drag the sidebar's left edge to resize it (desktop only), Explorer-style.
  function startAskResize(e: React.PointerEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = askWidth;
    const move = (ev: PointerEvent) => {
      setAskWidth(clampAskWidth(startW + (startX - ev.clientX)));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  const onChapterRead = useCallback((courseCode: string, chapterId: string) => {
    setProgress((current) => {
      const next = markChapterRead(current, courseCode, chapterId, Date.now());
      saveProgress(next);

      // The bridge from Learn to the pedagogical profile. A read chapter is a
      // study signal for the course's concepts; the chapter that completes
      // the course sets their familiarity outright, because working through
      // a whole course says more about someone than any question they typed.
      // Fired only on the transition into 'finished' so revisiting a chapter
      // never re-triggers it, and fire-and-forget: a profile write must never
      // be able to break reading.
      const concepts = conceptsForCourse(courseCode);
      if (concepts.length > 0) {
        const wasRead = Boolean(current[courseCode]?.readChapters?.[chapterId]);
        if (!wasRead) {
          const course = LEARN_COURSES.find(c => c.code === courseCode);
          const total = course ? courseChapterCount(course, lang, langMeta) : 0;
          const read = readCount(next, courseCode);
          if (course && total > 0 && read >= total && readCount(current, courseCode) < total) {
            void recordCourseCompletionSignal(concepts, String(course.level ?? '')).catch(() => {});
          } else {
            void recordCourseStudySignal(concepts).catch(() => {});
          }
        }
      }
      return next;
    });
  }, [lang, langMeta]);

  const langControls = (
    <div className="flex items-center gap-2 shrink-0" style={{ marginLeft: 'auto' }}>
      <div
        role="group"
        aria-label={t('learn.panel.readingLanguage.aria')}
        className="flex"
        style={{ gap: 4 }}
      >
        {installed.map((code) => (
          <button
            key={code}
            aria-pressed={lang === code}
            onClick={() => changeLang(code)}
            className="alice-control alice-control--choice"
            style={{ padding: '8px 12px' }}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
      <button
        onClick={() => setLangModalOpen(true)}
        aria-label={t('learn.panel.allLanguages.aria')}
        title={t('learn.panel.languages')}
        className="alice-control alice-control--quiet flex items-center justify-center"
        style={{ minHeight: 40 }}
      >
        <SvgIcon svg={LEARN_ICON} size={20} /> {!phone && <span>{t('learn.panel.languages')}</span>}
      </button>
    </div>
  );

  return (
    <div className="flex flex-1 min-h-0 min-w-0">
    <div id="learn-scroll" className="flex-1 min-h-0 overflow-y-auto">
      {phone && <WorkspaceHeaderActions>{langControls}</WorkspaceHeaderActions>}
      {/* On a phone the home page needs no row of its own: its controls are
          in the shell's header. The other pages keep the row for Back. */}
      {!(phone && view.kind === 'home') && <header
        className="flex items-center flex-wrap"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 15,
          background: 'var(--alice-bg)',
          width: '100%',
          margin: 0,
          columnGap: 18,
          rowGap: 10,
          padding: '12px max(16px, calc((100% - 1100px) / 2)) 12px',
          borderBottom: '1px solid var(--alice-border)',
        }}
      >
        {view.kind !== 'home' && (
          <button
            onClick={() => {
              if (view.kind === 'chapter' || view.kind === 'quiz') navigate({ kind: 'course', code: view.code });
              else if (view.kind === 'definition') navigate({ kind: 'dictionary', letter: letterOfSlug(view.slug) });
              else navigate({ kind: 'home' });
            }}
            className="alice-control alice-control--quiet"
            style={{ padding: 0 }}
          >
            <SvgIcon svg={BACK_ICON} size={16} /> {view.kind === 'chapter' || view.kind === 'quiz'
              ? t('learn.panel.back.course')
              : view.kind === 'definition'
                ? t('learn.panel.back.dictionary')
                : t('common.back')}
          </button>
        )}
        {view.kind === 'chapter' && chapterMeta && (
          <div className="flex items-center gap-4 min-w-0 flex-1" style={{ minWidth: 220 }}>
            <div className="min-w-0">
              <div className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
                {chapterMeta.courseName.toUpperCase()}
              </div>
              <div className="font-numbers truncate" style={{ fontSize: 13, color: 'var(--alice-text)' }}>
                {chapterMeta.chapterTitle}
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 shrink-0" aria-label={t('learn.panel.progress.aria')}>
              <div style={{ display: 'flex', gap: 2, width: 90 }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      flex: 1,
                      height: 5,
                      background:
                        i < Math.round((chapterMeta.index / Math.max(chapterMeta.total, 1)) * 12)
                          ? 'var(--alice-primary)'
                          : 'var(--alice-border)',
                    }}
                  />
                ))}
              </div>
              <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
                {chapterMeta.index}/{chapterMeta.total}
              </span>
            </div>
          </div>
        )}
        {!phone && langControls}
      </header>}

      {showIntro && (
        <LearnIntroModal
          lang={lang}
          onClose={() => setShowIntro(false)}
          onPickLanguage={() => setLangModalOpen(true)}
        />
      )}

      {langModalOpen && (
        <LearnLanguageModal
          currentLang={lang}
          onSelect={changeLang}
          onClose={() => setLangModalOpen(false)}
        />
      )}

      {view.kind === 'home' && <LearnHome lang={lang} meta={langMeta} progress={progress} onNavigate={navigate} />}
      {view.kind === 'course' && (
        <LearnCourse code={view.code} lang={lang} progress={progress} onNavigate={navigate} />
      )}
      {view.kind === 'chapter' && (
        <LearnChapter
          code={view.code}
          chapterId={view.chapterId}
          lang={lang}
          onNavigate={navigate}
          onChapterRead={onChapterRead}
          onMeta={setChapterMeta}
        />
      )}
      {view.kind === 'quiz' && (
        <LearnQuiz code={view.code} partId={view.partId} lang={lang} onNavigate={navigate} />
      )}
      {view.kind === 'tutorial' && (
        <LearnTutorial category={view.category} slug={view.slug} lang={lang} />
      )}
      {view.kind === 'dictionary' && (
        <LearnDictionary letter={view.letter} lang={lang} onNavigate={navigate} />
      )}
      {view.kind === 'definition' && (
        <LearnDefinition slug={view.slug} lang={lang} onNavigate={navigate} />
      )}
    </div>

    {askOpen && !phone ? (
      <aside
        className="relative shrink-0 min-h-0 w-[var(--ask-w,420px)]"
        style={{ ['--ask-w' as string]: `${askWidth}px`, backgroundColor: 'var(--alice-bg-soft)' } as React.CSSProperties}
      >
        <div
          onPointerDown={startAskResize}
          className="hidden md:block absolute left-0 inset-y-0 z-10"
          style={{ width: 5, cursor: 'col-resize' }}
          aria-hidden="true"
        />
        <LearnAskAlice view={view} lang={lang} onClose={() => toggleAsk(false)} />
      </aside>
    ) : (
      <AskAliceFab onOpen={() => (phone ? handOffRef.current() : toggleAsk(true))} />
    )}
    </div>
  );
}

export function LearnPanel() {
  return <WorkspaceShell title="Learn"><LearnWorkspace /></WorkspaceShell>;
}
