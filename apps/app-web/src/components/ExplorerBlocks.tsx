'use client';

import { SvgIcon } from '@/components/SvgIcon';
import { SWAP_ICON, BACK_ICON, RECEIVE_ICON } from '@/lib/atelier-icons';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ChainDataProvider } from '@/lib/explorer/provider';
import type { NormalizedBlock, ProjectedBlock, RibbonFocus } from '@/lib/explorer/types';
import { feeColor, formatBlockAgeOrDate, formatDateTime, formatFeeRange } from '@/lib/explorer/blocks';

const POLL_MS = 20_000;
const BLOCK_W = 122;

function ConfirmedBlock({ block, now, focused, marked, markColor, markSubject, onClick }: {
  block: NormalizedBlock;
  now: number;
  focused: boolean;
  /** True when this block carries a highlighted transaction (an Arkade
   *  settlement, a Bark round): its border takes the highlight colour. */
  marked?: boolean;
  markColor?: string;
  /** What the mark means, for the hover text ("an Arkade settlement"). */
  markSubject?: string;
  onClick: () => void;
}) {
  const color = feeColor(block.medianFee);
  const range = formatFeeRange(block.feeRange);
  // The focused block (the one the open transaction or block tab is about) is
  // inverted: the accent as its background, the page background as its ink,
  // so it stands out along the row at a glance.
  const ink = focused ? 'var(--alice-bg)' : undefined;
  return (
    <button
      type="button"
      onClick={onClick}
      data-block-height={block.height}
      className="shrink-0 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        width: BLOCK_W,
        padding: '8px 10px',
        border: `1px solid ${marked && markColor ? markColor : focused ? 'var(--alice-primary)' : 'var(--alice-border)'}`,
        borderTop: `3px solid ${marked && markColor ? markColor : color}`,
        borderRadius: 3,
        backgroundColor: focused ? 'var(--alice-primary)' : 'var(--alice-bg-soft)',
      }}
      title={`Block ${block.height} - ${block.poolName ?? 'unknown pool'} - ${formatDateTime(block.timestamp)}${marked ? ` - contains ${markSubject ?? 'a marked transaction'}` : ''}`}
    >
      <div className="font-pixel" style={{ fontSize: 10, color: ink ?? 'var(--alice-text)' }}>
        {block.height.toLocaleString('en-US')}
      </div>
      <div className="font-numbers" style={{ fontSize: 12, color: ink ?? color, marginTop: 3 }}>
        {block.medianFee !== undefined ? `~${Math.round(block.medianFee)} sat/vB` : 'n/a'}
      </div>
      {range && <div className="font-numbers" style={{ fontSize: 10, color: ink ?? 'var(--alice-muted)' }}>{range}</div>}
      <div className="font-numbers" style={{ fontSize: 10, color: ink ?? 'var(--alice-muted)', marginTop: 3 }}>
        {block.txCount.toLocaleString('en-US')} tx
      </div>
      {/* Fresh blocks read as an age; a week or older, the numeric date says
          more than a big "ago" count. Hover for the exact moment. */}
      <div className="font-numbers" style={{ fontSize: 10, color: ink ?? 'var(--alice-muted)', opacity: ink ? 0.85 : 0.7 }}>
        {formatBlockAgeOrDate(block.timestamp, now)}
      </div>
    </button>
  );
}

function PendingBlock({ block, index, focused }: { block: ProjectedBlock; index: number; focused: boolean }) {
  const color = feeColor(block.medianFee);
  const range = formatFeeRange(block.feeRange);
  const eta = index === 0 ? 'NEXT BLOCK' : `IN ~${(index + 1) * 10} MIN`;
  // Inverted when focused, like a confirmed block.
  const ink = focused ? 'var(--alice-bg)' : undefined;
  return (
    <div
      className="shrink-0"
      data-pending-index={index}
      style={{
        width: BLOCK_W,
        padding: '8px 10px',
        border: `1px dashed ${focused ? 'var(--alice-primary)' : 'var(--alice-border)'}`,
        borderTop: `3px solid ${color}`,
        borderRadius: 3,
        backgroundColor: focused ? 'var(--alice-primary)' : undefined,
      }}
      title={focused ? 'This transaction is expected in this projected block' : 'Projected block, still in the mempool'}
    >
      <div className="font-pixel" style={{ fontSize: 10, color: ink ?? 'var(--alice-muted)' }}>{eta}</div>
      <div className="font-numbers" style={{ fontSize: 12, color: ink ?? color, marginTop: 3 }}>~{Math.round(block.medianFee)} sat/vB</div>
      {range && <div className="font-numbers" style={{ fontSize: 10, color: ink ?? 'var(--alice-muted)' }}>{range}</div>}
      <div className="font-numbers" style={{ fontSize: 10, color: ink ?? 'var(--alice-muted)', marginTop: 3 }}>
        {block.txCount.toLocaleString('en-US')} tx
      </div>
    </div>
  );
}

// A break between two non-contiguous stretches of chain (the live tip and an
// old block's neighbourhood), so the gap reads as "blocks not shown" rather than
// a wrong, jumped sequence.
function GapChip({ delta }: { delta: number }) {
  const label = delta > 999 ? `${Math.round(delta / 1000)}K` : String(delta);
  return (
    <div
      className="shrink-0 flex flex-col items-center justify-center px-1"
      style={{ minWidth: 34 }}
      title={`${delta.toLocaleString('en-US')} block${delta > 1 ? 's' : ''} not shown`}
    >
      <span className="font-numbers" style={{ fontSize: 16, lineHeight: '16px', color: 'var(--alice-muted)' }}>⋯</span>
      <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)', opacity: 0.7, marginTop: 2 }}>{label}</span>
    </div>
  );
}

// Merge a fresh batch into the existing list by height, newest first, so polling
// adds new blocks at the head without wiping older blocks the user paged in.
function mergeBlocks(existing: NormalizedBlock[], incoming: NormalizedBlock[]): NormalizedBlock[] {
  const byHeight = new Map<number, NormalizedBlock>();
  for (const b of existing) byHeight.set(b.height, b);
  for (const b of incoming) byHeight.set(b.height, b);
  return [...byHeight.values()].sort((a, b) => b.height - a.height);
}

type Orientation = 'confirmed-right' | 'confirmed-left';

// The live "blockchain": full width, mempool blocks and confirmed blocks meeting
// at a central divider, scrollable, with a button to flip which side is which.
// Polls every 20s. Renders nothing when the provider has no blocks endpoint.
export function ExplorerBlocks({
  provider,
  onOpenBlock,
  focus,
  highlight,
}: {
  provider: ChainDataProvider;
  onOpenBlock: (height: string) => void;
  /** What to spotlight: a confirmed block by height, or the projected block an
   *  unconfirmed transaction is expected in. Absent means centre on the divider. */
  focus?: RibbonFocus;
  /** Blocks to mark permanently (on Arkade: the ones carrying a settlement;
   *  on Bark: a round), with the accent colour they get. Independent of the
   *  focus spotlight. The ribbon never pages towards them on its own: the
   *  jump button opens the latest one's page, which loads its neighbourhood.
   *  `onColor` is the ink legible on the accent (the jump button's arrow);
   *  `name` is the network's, `subject` what a mark means, for hover text.
   *  `busy` is set while the newest mark may not be the newest there is (the
   *  walk is still catching up): the arrow gives way to a ring until then. */
  highlight?: { heights: ReadonlySet<number>; color: string; onColor: string; name: string; subject: string; busy?: boolean };
}) {
  const [blocks, setBlocks] = useState<NormalizedBlock[]>([]);
  const [pending, setPending] = useState<ProjectedBlock[]>([]);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [errored, setErrored] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>('confirmed-right');
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [ready, setReady] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  // Focus heights we have already fetched a neighbourhood for, so an old block
  // is loaded once and never re-requested on every poll.
  const neighbourhoodTried = useRef<Set<number>>(new Set());

  // The newest marked block, and whether it is in the loaded window. The jump
  // opens its page; while its neighbourhood loads, the button shows a wait.
  const latestMarked = highlight && highlight.heights.size > 0 ? Math.max(...highlight.heights) : undefined;
  const latestMarkedLoaded = latestMarked !== undefined && blocks.some(b => b.height === latestMarked);
  const [jumping, setJumping] = useState(false);
  useEffect(() => {
    if (!jumping) return;
    if (latestMarkedLoaded) { setJumping(false); return; }
    const id = setTimeout(() => setJumping(false), 20_000);
    return () => clearTimeout(id);
  }, [jumping, latestMarkedLoaded]);

  // The block a tab points at while its neighbours load (see below).
  const [loadingAround, setLoadingAround] = useState<number | null>(null);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  // The pointer under the row: a small triangle at the focused block (or the
  // projected block an unconfirmed transaction is expected in), kept in place
  // as the row scrolls; hidden when nothing is focused or it is off-screen.
  const [pointerX, setPointerX] = useState<number | null>(null);

  const supported = typeof provider.getRecentBlocks === 'function';

  // Which projected block an unconfirmed tx lands in: the first whose fee floor
  // its fee rate clears (mempool orders projected blocks highest-fee first), or
  // the last one if its fee is below them all.
  const pendingFocusIndex = (() => {
    if (focus?.kind !== 'pending' || pending.length === 0) return -1;
    const f = focus.feeRate;
    if (f == null) return 0;
    const i = pending.findIndex(p => p.feeRange.length > 0 && f >= p.feeRange[0]);
    return i === -1 ? pending.length - 1 : i;
  })();

  const updatePointer = useCallback(() => {
    const sc = scrollRef.current;
    if (!sc || !focus) { setPointerX(null); return; }
    const target = focus.kind === 'height'
      ? sc.querySelector<HTMLElement>(`[data-block-height="${focus.height}"]`)
      : pendingFocusIndex >= 0 ? sc.querySelector<HTMLElement>(`[data-pending-index="${pendingFocusIndex}"]`) : null;
    if (!target) { setPointerX(null); return; }
    const x = target.getBoundingClientRect().left - sc.getBoundingClientRect().left + target.offsetWidth / 2;
    setPointerX(x >= 0 && x <= sc.clientWidth ? x : null);
  }, [focus, pendingFocusIndex]);
  useEffect(() => {
    updatePointer();
    const sc = scrollRef.current;
    if (!sc) return;
    sc.addEventListener('scroll', updatePointer, { passive: true });
    window.addEventListener('resize', updatePointer);
    return () => { sc.removeEventListener('scroll', updatePointer); window.removeEventListener('resize', updatePointer); };
  }, [updatePointer, blocks, pending, orientation, ready]);

  // Whether the spotlight target is currently on screen. Used to re-centre only
  // when it first appears (e.g. an old block's neighbourhood finishes loading),
  // never on every block list change, so paging older keeps the scroll put.
  const focusPresent = focus?.kind === 'height'
    ? blocks.some(b => b.height === focus.height)
    : focus?.kind === 'pending'
      ? pendingFocusIndex >= 0
      : true;

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    const controller = new AbortController();
    // One poll at a time: when the endpoint stalls past the interval, ticks
    // must not pile a second (and third...) poll on top of the stuck one.
    let inFlight = false;
    async function poll() {
      if (inFlight) return;
      inFlight = true;
      try {
        const [b, p] = await Promise.all([
          provider.getRecentBlocks!(undefined, { signal: controller.signal }),
          provider.getMempoolBlocks
            ? provider.getMempoolBlocks({ signal: controller.signal })
            : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setBlocks(prev => mergeBlocks(prev, b));
        setPending(p);
        setNow(Math.floor(Date.now() / 1000));
        setErrored(false);
        setReady(true);
      } catch {
        if (!cancelled) setErrored(true);
      } finally {
        inFlight = false;
      }
    }
    void poll();
    const id = setInterval(poll, POLL_MS);
    return () => { cancelled = true; controller.abort(); clearInterval(id); };
  }, [provider, supported]);

  // Centre the viewport on first data and when the sides flip: on a block page,
  // on the focused block; otherwise on the pending/confirmed divider. Not on
  // polls, so the view never jumps under the user.
  useLayoutEffect(() => {
    if (!ready) return;
    const centre = () => {
      const sc = scrollRef.current;
      if (!sc) return;
      let target: HTMLElement | null;
      if (focus?.kind === 'height') {
        target = sc.querySelector<HTMLElement>(`[data-block-height="${focus.height}"]`);
      } else if (focus?.kind === 'pending' && pendingFocusIndex >= 0) {
        target = sc.querySelector<HTMLElement>(`[data-pending-index="${pendingFocusIndex}"]`);
      } else {
        target = dividerRef.current;
      }
      if (target) sc.scrollLeft = target.offsetLeft - sc.clientWidth / 2 + target.offsetWidth / 2;
    };
    // Right away, since the layout is done by now, and once more on the next
    // frame for anything the first paint settles (fonts, scrollbars). A frame
    // never comes while the page is hidden, so the first call is what keeps a
    // background tab centred.
    centre();
    const raf = requestAnimationFrame(centre);
    return () => cancelAnimationFrame(raf);
  // Deliberately not on `blocks`: re-centre only when the target appears, so
  // loading older blocks or a new tip never yanks the view back to the start.
  // `loadingAround` is the one exception: the neighbours landing beside a
  // lone block push it along the row, so it is centred again when they do.
  }, [ready, orientation, focus, pendingFocusIndex, focusPresent, loadingAround]);

  // When the spotlighted confirmed block is older than the loaded window, show
  // it first: its own header is one small request, the same one the open
  // block tab makes, so it comes from the shared cache. Then a neighbourhood
  // around it (fifteen blocks each side, both requests in flight at once),
  // with placeholders shimmering on both sides of it until they land. The
  // block list is read through a ref so an intermediate merge never cancels
  // the requests still in flight.
  const focusHeight = focus?.kind === 'height' ? focus.height : undefined;
  useEffect(() => {
    if (focusHeight === undefined || !ready) return;
    const h = focusHeight;
    if (blocksRef.current.some(b => b.height === h)) return;
    if (neighbourhoodTried.current.has(h)) return;
    if (typeof provider.getRecentBlocks !== 'function') return;
    neighbourhoodTried.current.add(h);
    let cancelled = false;
    const controller = new AbortController();
    setLoadingAround(h);
    (async () => {
      try {
        if (typeof provider.getBlock === 'function') {
          try {
            const own = await provider.getBlock(String(h), { signal: controller.signal });
            if (!cancelled) setBlocks(prev => mergeBlocks(prev, [own]));
          } catch { /* the batches below carry it too */ }
        }
        const [after, before] = await Promise.all([
          provider.getRecentBlocks!(h + 10, { signal: controller.signal }),
          provider.getRecentBlocks!(h - 5, { signal: controller.signal }),
        ]);
        if (!cancelled) setBlocks(prev => mergeBlocks(prev, [...after, ...before]));
      } catch { /* leave the ribbon as it is */ } finally {
        if (!cancelled) setLoadingAround(null);
      }
    })();
    return () => { cancelled = true; controller.abort(); };
  }, [focusHeight, ready, provider]);

  const loadOlder = useCallback(async () => {
    if (!provider.getRecentBlocks || loadingOlder || blocks.length === 0) return;
    setLoadingOlder(true);
    try {
      const oldest = blocks[blocks.length - 1].height;
      const older = await provider.getRecentBlocks(oldest - 1);
      setBlocks(prev => mergeBlocks(prev, older));
    } catch { /* keep what is shown */ } finally {
      setLoadingOlder(false);
    }
  }, [provider, blocks, loadingOlder]);

  if (!supported) return null;

  // The jump opens the latest marked block's page; its tab spotlights the
  // block here too, loading its neighbourhood when it is not in the window
  // yet. When it already is, the row also scrolls to it right away.
  function jumpToLatestMarked() {
    if (latestMarked === undefined) return;
    onOpenBlock(String(latestMarked));
    if (!latestMarkedLoaded) { setJumping(true); return; }
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-block-height="${latestMarked}"]`);
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }

  // The divider column must never outgrow the block cards, or every card in
  // the row stretches with it: with the settlement-jump button present, both
  // buttons shrink so the stacked pair stays within a card's height.
  const dividerBtn = latestMarked !== undefined ? 24 : 30;
  const Divider = (
    <div ref={dividerRef} className="shrink-0 flex flex-col items-center justify-center px-2" style={{ minWidth: 44 }}>
      <div style={{ width: 2, flex: 1, minHeight: 16, backgroundColor: 'var(--alice-border)' }} />
      <button
        type="button"
        onClick={() => setOrientation(o => (o === 'confirmed-right' ? 'confirmed-left' : 'confirmed-right'))}
        className="alice-control alice-control--quiet cursor-pointer my-1"
        style={{
          width: dividerBtn, height: dividerBtn, minHeight: dividerBtn, padding: 2, borderRadius: 3,
          color: 'var(--alice-primary)', fontSize: 12, lineHeight: '12px',
        }}
        aria-label="Swap confirmed and pending sides"
        title="Swap sides"
      >
        <SvgIcon svg={SWAP_ICON} size={20} />
      </button>
      {latestMarked !== undefined && (
        <button
          type="button"
          onClick={jumpToLatestMarked}
          className="cursor-pointer mb-1 flex items-center justify-center"
          style={{
            width: dividerBtn, height: dividerBtn, minHeight: dividerBtn, padding: 2, borderRadius: 3, border: 0,
            backgroundColor: highlight!.color, color: highlight!.onColor,
          }}
          aria-label={`Open the latest ${highlight!.name} block`}
          title={highlight!.busy
            ? `Downloading the latest ${highlight!.subject}s from the Bitcoin chain. Block ${latestMarked.toLocaleString('en-US')} is the latest found so far.`
            : `Open block ${latestMarked.toLocaleString('en-US')}, the latest with ${highlight!.subject}`}
        >
          {/* An arrow sinking halfway into a square: the commitment landing
              inside a Bitcoin block. A ring while that block loads, and
              while the walk still catches up with the chain. */}
          {jumping || highlight!.busy ? <span className="rh-spinner" aria-hidden="true" /> : <SvgIcon svg={RECEIVE_ICON} size={20} />}
        </button>
      )}
      <div style={{ width: 2, flex: 1, minHeight: 16, backgroundColor: 'var(--alice-border)' }} />
    </div>
  );

  const LoadOlder = blocks.length > 0 ? (
    <button
      type="button"
      onClick={() => void loadOlder()}
      disabled={loadingOlder}
      className="alice-control alice-control--quiet shrink-0 font-numbers cursor-pointer disabled:cursor-not-allowed"
      style={{
        width: 96, borderRadius: 3, color: 'var(--alice-muted)', fontSize: 13,
        opacity: loadingOlder ? 0.5 : 1,
      }}
      aria-label="Load older blocks"
    >
      <SvgIcon svg={BACK_ICON} size={16} />
      {loadingOlder ? 'Loading…' : 'Older'}
    </button>
  ) : null;

  const pendingCards = pending.map((p, i) => (
    <PendingBlock key={`p${p.medianFee}-${i}`} block={p} index={i} focused={i === pendingFocusIndex} />
  ));

  // Placeholder cards beside a block whose neighbours are still loading.
  const shimmer = (key: string) => Array.from({ length: 3 }, (_, i) => (
    <div key={`${key}-${i}`} className="rh-skeleton shrink-0" style={{ width: BLOCK_W, minHeight: 74, borderRadius: 3, opacity: 0.8 - i * 0.2 }} aria-hidden="true" />
  ));

  // Confirmed cards, newest first, with a break inserted wherever two adjacent
  // cards are not consecutive heights (the live tip and an old neighbourhood).
  const confirmedCards: React.ReactNode[] = [];
  blocks.forEach((b, i) => {
    const alone = loadingAround === b.height;
    if (alone) confirmedCards.push(...shimmer(`before-${b.height}`).reverse());
    confirmedCards.push(
      <ConfirmedBlock
        key={b.id}
        block={b}
        now={now}
        focused={focus?.kind === 'height' && b.height === focus.height}
        marked={highlight?.heights.has(b.height)}
        markColor={highlight?.color}
        markSubject={highlight?.subject}
        onClick={() => onOpenBlock(String(b.height))}
      />,
    );
    if (alone) confirmedCards.push(...shimmer(`after-${b.height}`));
    const next = blocks[i + 1];
    if (next) {
      const gap = b.height - next.height - 1;
      if (gap > 0) confirmedCards.push(<GapChip key={`gap-${b.height}`} delta={gap} />);
    }
  });

  // Reading order left -> right, with the divider between the two groups.
  const items = orientation === 'confirmed-right'
    ? [...[...pendingCards].reverse(), Divider, ...confirmedCards, LoadOlder]
    : [LoadOlder, ...[...confirmedCards].reverse(), Divider, ...pendingCards];

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between px-5">
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>LIVE BLOCKS</span>
        {errored && (
          <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)', opacity: 0.7 }}>reconnecting...</span>
        )}
      </div>

      {blocks.length === 0 && !errored ? (
        // Item 9: skeleton block cards instead of a bare "Loading..." string.
        <div className="flex items-stretch gap-2 overflow-hidden px-5 pb-2" aria-label="Loading recent blocks">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="rh-skeleton shrink-0" style={{ width: 92, height: 74, opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      ) : (
        <div className="relative">
          <div ref={scrollRef} className="flex items-stretch gap-2 overflow-x-auto px-5 pb-3">
            {items.map((node, i) => <div key={i} className="flex shrink-0">{node}</div>)}
          </div>
          {pointerX !== null && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', left: pointerX, bottom: 0, transform: 'translateX(-50%)',
                width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
                borderBottom: '7px solid var(--alice-primary)',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
