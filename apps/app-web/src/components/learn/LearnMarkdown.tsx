'use client';

import { SvgIcon } from '@/components/SvgIcon';
import { CLOSE_ICON, NEXT_ICON, EXTERNAL_ICON, MINUS_ICON, PLUS_ICON } from '@/lib/atelier-icons';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT, type Translator } from '@/i18n';
import { useLearnT } from './learn-locale';
import type { LearnBlock, LearnInline } from '@/lib/learn/markdown';
import { attachPunctuation, leadingClosingMarks, normalizeLinkHref, parseMarkdown, resolveAssetUrl, youTubeWatchUrl } from '@/lib/learn/markdown';
import { clampView, fitView, fittedSize, MAX_ZOOM, MIN_ZOOM, panBy, zoomAt, ZOOM_STEP, type Point, type Size, type ZoomView } from '@/lib/learn/image-zoom';
import { openExternalUrl } from '@/lib/open-external';

type AnchorClick = (anchorId: string) => void;

// The chrome inside a course body (placeholders, titles) speaks the reading
// language like the rest of Learn; the blocks get it from here.
const MarkdownT = createContext<Translator | null>(null);
function useMarkdownT(): Translator {
  const app = useT();
  return useContext(MarkdownT) ?? app;
}

// Renderer for PlanB course markdown. Media is online-only by decision: the
// 14 GB of images/videos never ship with the app, so offline readers get an
// explicit placeholder instead of a broken image (never a silent failure).

export function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}

function InlineNodes({ nodes, assetBase, onAnchorClick }: { nodes: LearnInline[]; assetBase: string; onAnchorClick?: AnchorClick }) {
  const t = useMarkdownT();
  // A link and an anchor end on an icon, a box the browser may break after:
  // the "." that follows would start the next line alone. The marks that
  // follow are taken from the next text and kept on the line of the icon.
  const closing = nodes.map((node, i) => {
    const next = nodes[i + 1];
    return (node.kind === 'link' || node.kind === 'anchor') && next?.kind === 'text' ? leadingClosingMarks(next.text) : '';
  });
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.kind) {
          case 'anchor':
            return (
              <span key={i} style={{ whiteSpace: 'nowrap' }}>
                <button
                  onClick={() => onAnchorClick?.(node.anchorId)}
                  className="alice-control alice-control--link"
                  title={t('learn.markdown.seeInExplorer')}
                  style={{
                    background: 'none',
                    display: 'inline',
                    minHeight: 0,
                    border: 0,
                    padding: 0,
                    font: 'inherit',
                    color: 'var(--alice-primary)',
                    borderBottom: '2px dotted var(--alice-primary)',
                  }}
                >
                  {node.text}
                  <span aria-hidden="true" style={{ display: 'inline-flex', marginLeft: 3, verticalAlign: 'middle' }}><SvgIcon svg={NEXT_ICON} size={16} /></span>
                </button>
                {closing[i]}
              </span>
            );
          case 'bold':
            return <strong key={i}>{attachPunctuation(node.text)}</strong>;
          case 'italic':
            return <em key={i}>{attachPunctuation(node.text)}</em>;
          case 'code':
            return (
              <code
                key={i}
                style={{
                  background: 'var(--alice-bg-soft)',
                  border: '1px solid var(--alice-border)',
                  borderRadius: 'var(--alice-radius-control)',
                  padding: '1px 4px',
                  fontSize: '0.9em',
                }}
              >
                {node.text}
              </code>
            );
          case 'link': {
            // Always leaves the app in a NEW context: system browser on
            // desktop (Tauri shell), new tab on the web. The href is
            // normalized first (the corpus has protocol-less domains that
            // would otherwise navigate the app itself).
            const href = normalizeLinkHref(node.href, assetBase);
            // The last word, the icon and the closing marks stay together;
            // the rest of a long link still wraps.
            const lastWord = node.text.lastIndexOf(' ') + 1;
            return (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  void openExternalUrl(href);
                }}
                style={{ color: 'var(--alice-primary)', textDecoration: 'underline' }}
              >
                {node.text.slice(0, lastWord)}
                <span style={{ whiteSpace: 'nowrap' }}>
                  {node.text.slice(lastWord)} <span aria-hidden="true" style={{ display: 'inline-flex', verticalAlign: 'middle' }}><SvgIcon svg={EXTERNAL_ICON} size={16} /></span>
                  {closing[i] && <span style={{ display: 'inline-block', color: 'var(--alice-text)' }}>{closing[i]}</span>}
                </span>
              </a>
            );
          }
          default:
            return <span key={i}>{attachPunctuation(node.text.slice(i > 0 ? closing[i - 1].length : 0))}</span>;
        }
      })}
    </>
  );
}

function CourseImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const t = useMarkdownT();
  if (failed) return <OfflineMediaCard title={t('learn.markdown.imageUnavailable')} label={alt || t('learn.markdown.imageFailed')} />;
  return (
    <>
      <button
        type="button"
        onClick={() => setZoomed(true)}
        aria-label={t('learn.markdown.imageZoom')}
        title={t('learn.markdown.imageZoom')}
        style={{ display: 'block', maxWidth: '100%', margin: '16px auto', padding: 0, border: 0, background: 'none', cursor: 'zoom-in' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} style={{
          maxWidth: '100%', display: 'block',
          border: '1px solid var(--alice-border)', borderRadius: 'var(--alice-radius-control)',
          background: 'var(--alice-illustration-bg)',
        }} />
      </button>
      {zoomed && <ImageZoom src={src} alt={alt} onClose={() => setZoomed(false)} />}
    </>
  );
}

// A course diagram read closely: the image over the page, whole at first,
// then enlarged as far as the reader wants. A pinch (touch screen or trackpad),
// the + and - buttons or a click zoom; a drag or a two-finger scroll moves the
// enlarged image. Escape, the close button or a click beside the image leaves.
function ImageZoom({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const t = useMarkdownT();
  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [stage, setStage] = useState<Size>({ width: 0, height: 0 });
  const [natural, setNatural] = useState<Size>({ width: 0, height: 0 });
  const [view, setView] = useState<ZoomView>({ scale: MIN_ZOOM, x: 0, y: 0 });
  const fitted = fittedSize(natural, stage);
  // Gestures read the latest geometry without re-binding their listeners.
  const geometry = useRef({ fitted, stage });
  geometry.current = { fitted, stage };
  const change = useCallback((next: (view: ZoomView, fitted: Size, stage: Size) => ZoomView) => {
    setView(current => next(current, geometry.current.fitted, geometry.current.stage));
  }, []);
  const centre = (): Point => ({ x: geometry.current.stage.width / 2, y: geometry.current.stage.height / 2 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStage({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  // A new stage or a freshly loaded image: the view is brought back inside.
  useEffect(() => { change(clampView); }, [change, fitted.width, fitted.height, stage.width, stage.height]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === '+' || event.key === '=') change((v, f, s) => zoomAt(v, ZOOM_STEP, centre(), f, s));
      else if (event.key === '-') change((v, f, s) => zoomAt(v, 1 / ZOOM_STEP, centre(), f, s));
      else if (event.key === '0') change((_, f, s) => fitView(f, s));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, change]);

  // Wheel and trackpad. A pinch reaches the page as a wheel event with the
  // Control key (Chromium, Firefox) or as a gesture event (WebKit, so the
  // desktop app); a two-finger scroll moves the enlarged image. Bound by hand:
  // React's wheel listener is passive and could not stop the page zooming.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const at = (event: { clientX: number; clientY: number }): Point => {
      const box = el.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) change((v, f, s) => zoomAt(v, Math.exp(-event.deltaY * 0.012), at(event), f, s));
      else change((v, f, s) => panBy(v, -event.deltaX, -event.deltaY, f, s));
    };
    let pinchFrom = 1;
    type Gesture = Event & { scale: number; clientX: number; clientY: number };
    const onGestureStart = (event: Event) => { event.preventDefault(); pinchFrom = 1; };
    const onGestureChange = (event: Event) => {
      event.preventDefault();
      const gesture = event as Gesture;
      const factor = gesture.scale / pinchFrom;
      pinchFrom = gesture.scale;
      if (Number.isFinite(factor) && factor > 0) change((v, f, s) => zoomAt(v, factor, at(gesture), f, s));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('gesturestart', onGestureStart);
    el.addEventListener('gesturechange', onGestureChange);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('gesturestart', onGestureStart);
      el.removeEventListener('gesturechange', onGestureChange);
    };
  }, [change]);

  // Mouse and fingers: one pointer drags, two pinch around their middle. A
  // press released where it started is a click: on the image it enlarges or
  // comes back to the whole image, beside it it closes.
  const pointers = useRef(new Map<number, Point>());
  const press = useRef<{ at: Point; moved: boolean; onImage: boolean } | null>(null);
  const local = (event: React.PointerEvent): Point => {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = local(event);
    pointers.current.set(event.pointerId, point);
    press.current = pointers.current.size === 1
      ? { at: point, moved: false, onImage: (event.target as HTMLElement).tagName === 'IMG' }
      : null;
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const before = pointers.current.get(event.pointerId);
    if (!before) return;
    const point = local(event);
    const others = [...pointers.current.entries()].filter(([id]) => id !== event.pointerId).map(([, p]) => p);
    pointers.current.set(event.pointerId, point);
    if (others.length === 0) {
      if (press.current && Math.hypot(point.x - press.current.at.x, point.y - press.current.at.y) > 4) press.current.moved = true;
      if (press.current?.moved) change((v, f, s) => panBy(v, point.x - before.x, point.y - before.y, f, s));
      return;
    }
    const other = others[0];
    const was = Math.hypot(before.x - other.x, before.y - other.y);
    const now = Math.hypot(point.x - other.x, point.y - other.y);
    const middle = { x: (point.x + other.x) / 2, y: (point.y + other.y) / 2 };
    change((v, f, s) => {
      const moved = panBy(v, (point.x - before.x) / 2, (point.y - before.y) / 2, f, s);
      return was > 0 && now > 0 ? zoomAt(moved, now / was, middle, f, s) : moved;
    });
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(event.pointerId)) return;
    const pressed = press.current;
    press.current = null;
    if (!pressed || pressed.moved || event.type === 'pointercancel') return;
    if (!pressed.onImage) { onClose(); return; }
    change((v, f, s) => (v.scale > MIN_ZOOM ? fitView(f, s) : zoomAt(v, ZOOM_STEP, pressed.at, f, s)));
  };

  const enlarged = view.scale > MIN_ZOOM;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={alt || t('learn.markdown.imageZoom')} className="alice-image-zoom">
      <div
        ref={stageRef}
        className="alice-image-zoom-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          onLoad={(event) => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
          style={{
            left: view.x, top: view.y,
            width: fitted.width * view.scale, height: fitted.height * view.scale,
            visibility: fitted.width > 0 ? 'visible' : 'hidden',
            cursor: enlarged ? 'grab' : 'zoom-in',
          }}
        />
      </div>
      <div className="alice-image-zoom-tools">
        <button type="button" onClick={() => change((v, f, s) => zoomAt(v, 1 / ZOOM_STEP, centre(), f, s))} disabled={!enlarged} aria-label={t('learn.markdown.zoomOut')} title={t('learn.markdown.zoomOut')} className="alice-control alice-control--tool">
          <SvgIcon svg={MINUS_ICON} size={16} />
        </button>
        <button type="button" onClick={() => change((v, f, s) => zoomAt(v, ZOOM_STEP, centre(), f, s))} disabled={view.scale >= MAX_ZOOM} aria-label={t('learn.markdown.zoomIn')} title={t('learn.markdown.zoomIn')} className="alice-control alice-control--tool">
          <SvgIcon svg={PLUS_ICON} size={16} />
        </button>
        <button ref={closeRef} type="button" onClick={onClose} aria-label={t('common.close')} title={t('common.close')} className="alice-control alice-control--tool">
          <SvgIcon svg={CLOSE_ICON} size={16} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

function OfflineMediaCard({ label, title }: { label: string; title?: string }) {
  const t = useMarkdownT();
  return (
    <div
      style={{
        border: '1px dashed var(--alice-border)',
        borderRadius: 'var(--alice-radius-control)',
        padding: 16,
        margin: '16px 0',
        color: 'var(--alice-muted)',
        textAlign: 'center',
      }}
    >
      <div className="font-pixel" style={{ fontSize: 10 }}>{title ?? t('learn.markdown.offline')}</div>
      <p style={{ margin: '8px 0 0', fontSize: 14 }}>{label}</p>
    </div>
  );
}

function VideoBlock({
  videoId,
  videos,
  lang,
  online,
}: {
  videoId: string;
  videos: Record<string, Record<string, string>>;
  lang: string;
  online: boolean;
}) {
  // Many courses only carry the fr YouTube id; fall back to whatever exists
  // rather than dropping the video.
  const byLang = videos[videoId] ?? {};
  const youtubeId = byLang[lang] ?? byLang.en ?? byLang.fr ?? Object.values(byLang)[0];
  if (!youtubeId) return null;
  return <YouTubeEmbed youtubeId={youtubeId} startSeconds={0} title="" online={online} />;
}

// An alt of a single word ("video", "lecture", "bitfinex") is a label, not a
// title a screen reader should announce; the generic one says more.
const isVideoTitle = (alt: string) => /\s/.test(alt.trim());

function YouTubeEmbed({
  youtubeId,
  startSeconds,
  title,
  online,
}: {
  youtubeId: string;
  startSeconds: number;
  title: string;
  online: boolean;
}) {
  const t = useMarkdownT();
  const url = youTubeWatchUrl(youtubeId, startSeconds);
  if (!online) {
    return (
      <div
        style={{
          border: '1px dashed var(--alice-border)',
          borderRadius: 'var(--alice-radius-control)',
          padding: 16,
          margin: '16px 0',
          color: 'var(--alice-muted)',
        }}
      >
        <div className="font-pixel" style={{ fontSize: 8 }}>{t('learn.markdown.videoOffline')}</div>
        <p style={{ margin: '8px 0 0', fontSize: 14, wordBreak: 'break-all' }}>
          {t('learn.markdown.videoOpenElsewhere')}{' '}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.preventDefault(); void openExternalUrl(url); }}
            style={{ color: 'var(--alice-primary)', textDecoration: 'underline' }}
          >
            {url}
          </a>
        </p>
      </div>
    );
  }
  return (
    <div style={{ margin: '16px 0', border: '1px solid var(--alice-border)', borderRadius: 'var(--alice-radius-control)' }}>
      {/* The site sends no referrer (Referrer-Policy: no-referrer), and the
          YouTube player refuses to start without one (error 153). This frame
          alone sends Alice's origin, never the page path or its query. */}
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}${startSeconds > 0 ? `?start=${startSeconds}` : ''}`}
        title={isVideoTitle(title) ? title.trim() : t('learn.markdown.videoTitle')}
        allow="encrypted-media; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin"
        style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', border: 0 }}
      />
    </div>
  );
}

export function LearnMarkdown({
  markdown,
  assetBase,
  videos,
  lang,
  blocks: preparsed,
  onAnchorClick,
}: {
  markdown: string;
  assetBase: string;
  videos: Record<string, Record<string, string>>;
  lang: string;
  /** Caller-prepared blocks (e.g. anchor-annotated); parses `markdown` if absent. */
  blocks?: LearnBlock[];
  onAnchorClick?: AnchorClick;
}) {
  const online = useOnline();
  const blocks = preparsed ?? parseMarkdown(markdown);
  const t = useLearnT(lang);

  return (
    // The page is declared in the app language; a course in another language
    // says so here, which is what a screen reader needs to pronounce it.
    <MarkdownT.Provider value={t}>
    <div lang={lang} className="font-numbers" style={{ fontSize: 16, lineHeight: '26px', color: 'var(--alice-text)' }}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} assetBase={assetBase} videos={videos} lang={lang} online={online} onAnchorClick={onAnchorClick} />
      ))}
    </div>
    </MarkdownT.Provider>
  );
}

function Block({
  block,
  assetBase,
  videos,
  lang,
  online,
  onAnchorClick,
}: {
  block: LearnBlock;
  assetBase: string;
  videos: Record<string, Record<string, string>>;
  lang: string;
  online: boolean;
  onAnchorClick?: AnchorClick;
}) {
  const t = useMarkdownT();
  switch (block.kind) {
    case 'heading': {
      const size = block.level <= 3 ? 12 : 10;
      const Heading = `h${Math.max(2, Math.min(6, block.level))}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return (
        <Heading className="font-pixel" style={{ fontSize: size, margin: '28px 0 12px', lineHeight: 1.6 }}>
          <InlineNodes nodes={block.inline} assetBase={assetBase} onAnchorClick={onAnchorClick} />
        </Heading>
      );
    }
    case 'paragraph':
      return (
        <p style={{ margin: '12px 0' }}>
          <InlineNodes nodes={block.inline} assetBase={assetBase} onAnchorClick={onAnchorClick} />
        </p>
      );
    case 'code':
      return (
        <pre
          style={{
            background: 'var(--alice-bg-soft)',
            border: '1px solid var(--alice-border)',
            borderRadius: 'var(--alice-radius-control)',
            padding: 12,
            margin: '16px 0',
            overflowX: 'auto',
            fontSize: 13,
            lineHeight: '20px',
          }}
        >
          <code>{block.text}</code>
        </pre>
      );
    case 'quote':
      return (
        <blockquote
          style={{
            borderLeft: '4px solid var(--alice-primary)',
            margin: '16px 0',
            padding: '4px 0 4px 14px',
            color: 'var(--alice-muted)',
          }}
        >
          <InlineNodes nodes={block.inline} assetBase={assetBase} onAnchorClick={onAnchorClick} />
        </blockquote>
      );
    case 'list':
      return block.ordered ? (
        <ol style={{ margin: '12px 0', paddingLeft: 24 }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ margin: '6px 0' }}>
              <InlineNodes nodes={item} assetBase={assetBase} onAnchorClick={onAnchorClick} />
            </li>
          ))}
        </ol>
      ) : (
        <ul style={{ margin: '12px 0', paddingLeft: 24, listStyleType: 'square' }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ margin: '6px 0' }}>
              <InlineNodes nodes={item} assetBase={assetBase} onAnchorClick={onAnchorClick} />
            </li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <div style={{ overflowX: 'auto', margin: '16px 0' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
            <thead>
              <tr>
                {block.header.map((cell, i) => (
                  <th
                    key={i}
                    className="font-numbers"
                    style={{ border: '1px solid var(--alice-border)', padding: '8px 10px', fontSize: 14, textAlign: 'left' }}
                  >
                    <InlineNodes nodes={cell} assetBase={assetBase} onAnchorClick={onAnchorClick} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} style={{ border: '1px solid var(--alice-border)', padding: '8px 10px' }}>
                      <InlineNodes nodes={cell} assetBase={assetBase} onAnchorClick={onAnchorClick} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'image':
      if (!online) return <OfflineMediaCard label={t('learn.markdown.imageOffline')} />;
      return <CourseImage key={resolveAssetUrl(block.src, assetBase)} src={resolveAssetUrl(block.src, assetBase)} alt={block.alt} />;
    case 'video':
      return <VideoBlock videoId={block.videoId} videos={videos} lang={lang} online={online} />;
    case 'youtube':
      return <YouTubeEmbed youtubeId={block.youtubeId} startSeconds={block.startSeconds} title={block.alt} online={online} />;
    case 'hr':
      return <hr style={{ border: 0, borderTop: '1px solid var(--alice-border)', margin: '24px 0' }} />;
    default:
      return null;
  }
}
