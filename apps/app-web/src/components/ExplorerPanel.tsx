'use client';

import { SvgIcon } from '@/components/SvgIcon';
import { BACK_ICON, CLOSE_ICON } from '@/lib/atelier-icons';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerPack, useChat } from '@alice-wallet/alice-ai';
import { buildExplorerKnowledgePack } from '@/lib/explorer/fiche-corpus';
import { WorkspaceHeaderActions, WorkspaceShell } from '@/components/WorkspaceShell';
import { ExplorerTabBar, NetworkButton } from '@/components/ExplorerTabBar';
import { ExplorerOverviewTab } from '@/components/ExplorerOverviewTab';
import { ExplorerTxTab } from '@/components/ExplorerTxTab';
import { ExplorerBlockTab } from '@/components/ExplorerBlockTab';
import { ExplorerAddressTab } from '@/components/ExplorerAddressTab';
import { ExplorerXpubTab } from '@/components/ExplorerXpubTab';
import { ARKADE_ACCENT, ARKADE_ACCENT_SOFT, ExplorerArkadeAddressTab, SettlementBadge } from '@/components/ExplorerArkade';
import { BARK_ACCENT, BarkRoundBadge, ExplorerBarkAddressTab } from '@/components/ExplorerBark';
import { ExplorerBarkVtxoTab } from '@/components/ExplorerBarkVtxo';
import { ExplorerArkadeVtxoTab } from '@/components/ExplorerArkadeVtxo';
import { ExplorerSparkAddressTab, SPARK_ACCENT, SparkTxBadge } from '@/components/ExplorerSpark';
import { ExplorerSparkTxTab } from '@/components/ExplorerSparkTx';
import { ExplorerSparkLeafTab } from '@/components/ExplorerSparkLeaf';
import type { BlockMark } from '@/components/ExplorerBlockTab';
import { ExplorerBlocks } from '@/components/ExplorerBlocks';
import { ExplorerIntroModal, wasIntroDismissed } from '@/components/ExplorerIntroModal';
import { AskAliceDock } from '@/components/AskAliceDock';
import { AskAliceFab } from '@/components/AskAliceFab';
import { MempoolProvider } from '@/lib/explorer/mempool';
import { useT } from '@/i18n';
import { CachingProvider } from '@/lib/explorer/caching-provider';
import { FailoverProvider } from '@/lib/explorer/failover-provider';
import { createIdbCache } from '@/lib/explorer/idb-cache';
import type { ChainDataProvider } from '@/lib/explorer/provider';
import { effectiveBaseUrl, isUsingCustomNode } from '@/lib/explorer/node-config';
import type { PrivacySignal } from '@/lib/explorer/signals';
import type { FullContext } from '@/lib/explorer/ask-alice';
import { addTab, closeTab, makeTab, overviewTab, type Tab } from '@/lib/explorer/tabs';
import { consumePendingOpen, loadTabs, pendingOpenFromUrl, saveTabs, searchWithoutOpenRequest } from '@/lib/explorer/tab-storage';
import { getSessionTabs, saveSessionTabs } from '@/lib/explorer/session-links';
import { DEFAULT_NETWORK_ID, getNetwork } from '@/lib/explorer/networks';
import { getDefaultNetworkId } from '@/lib/explorer/prefs';
import { ASK_WIDTH_DEFAULT, clampAskWidth, loadAskWidth, saveAskWidth } from '@/lib/ask-width';
import { askContextLabel, explorerPageNote } from '@/lib/explorer/ask-context';
import { setAskHandoff, usePhoneLayout } from '@/lib/explorer/ask-handoff';
import { looksLikeArkadeAddress } from '@/lib/explorer/arkade';
import { looksLikeSparkAddress } from '@/lib/explorer/spark';
import { arkAddressFlavor } from '@/lib/explorer/bark';
import { settlementRegistry } from '@/lib/explorer/arkade-onchain';
import { useArkadeSettlements } from '@/lib/explorer/use-arkade-settlements';
import { useBarkRounds } from '@/lib/explorer/use-bark-rounds';
import { useSparkOnchain } from '@/lib/explorer/use-spark-onchain';
import { sparkOnchainRegistry } from '@/lib/explorer/spark-onchain';
import type { RibbonFocus } from '@/lib/explorer/types';
import { localVault } from '@/lib/local-vault';

const ASK_OPEN_KEY = 'alice.explorer.ask-open';

// Register the Explorer fiche corpus into Alice's RAG once, so any Ask-Alice
// turn can retrieve and cite it. Idempotent across remounts.
let fichePackRegistered = false;
function ensureFichePack() {
  if (fichePackRegistered) return;
  fichePackRegistered = true;
  registerPack(buildExplorerKnowledgePack());
}

function ExplorerWorkspace() {
  const t = useT();
  // Start from the default so the server and the first client render match; the
  // saved tabs are pulled in on mount, after hydration.
  const [tabs, setTabs] = useState<Tab[]>(() => [overviewTab(DEFAULT_NETWORK_ID)]);
  const [activeId, setActiveId] = useState<string>('');
  const hydrated = useRef(false);
  // The ribbon focus a transaction tab resolves once loaded (its block, or the
  // projected block while unconfirmed), kept per tab so switching tabs restores
  // the right spotlight without a refetch.
  const [focusByTab, setFocusByTab] = useState<Record<string, RibbonFocus | null>>({});
  // Arrival note from a Learn anchor: a dismissible strip naming what the
  // visitor is looking at and where they come from, with a way back.
  const [arrival, setArrival] = useState<{ label: string; origin: string } | null>(null);
  // The vault's readiness, for the effects that read a store at mount.
  const [vaultReady, setVaultReady] = useState(() => localVault.isReady);
  useEffect(() => { localVault.whenReady(() => setVaultReady(true)); }, []);
  // The welcome dialog shows on every mount of the section until the user asks
  // not to see it again; decided after hydration since it reads localStorage.
  const [showIntro, setShowIntro] = useState(false);
  // The Ask-Alice sidebar is persistent: docked on the right, it survives tab
  // and page changes; whether it is open survives leaving the section too.
  const [askOpen, setAskOpen] = useState(false);
  const [askWidth, setAskWidth] = useState(ASK_WIDTH_DEFAULT);
  // Privacy signals published by each tab once analysed, so the sidebar always
  // proposes the ACTIVE page's de-identified context as attachments.
  const [signalsByTab, setSignalsByTab] = useState<Record<string, PrivacySignal[]>>({});
  // The identified-mode full description each tab publishes alongside them.
  const [fullByTab, setFullByTab] = useState<Record<string, FullContext | null>>({});
  // On a phone the dock has no room beside the page: the Ask-Alice bubble
  // hands the active page over to the main chat instead, as a new
  // conversation carrying the same attachment (see ask-handoff.ts).
  const phone = usePhoneLayout();
  const router = useRouter();

  // Session-to-tabs linkage. A conversation touched from the Ask-Alice sidebar
  // records the tabs open alongside it; opening such a session from history
  // restores them. recording: the active session belongs to this exploration,
  // keep its snapshot fresh. pendingRecord: a message went out before the
  // provider created the session; adopt the id as soon as it appears.
  const { activeSessionId, messages: chatMessages, clearMessages } = useChat();
  const recordingRef = useRef(false);
  const pendingRecordRef = useRef(false);
  const lastSessionRef = useRef<string | null>(null);

  useEffect(() => {
    // StrictMode mounts twice in dev: without this guard the second pass would
    // consume the one-shot deep-link key again and overwrite the tab it just
    // opened.
    if (hydrated.current) return;
    ensureFichePack();
    // The tabs rest encrypted: the vault decrypts them first.
    let cancelled = false;
    void localVault.ready().then(() => {
    if (cancelled || hydrated.current) return;
    const stored = loadTabs();
    // A deep link from another surface (a Learn anchor, a Playground
    // transaction) opens its subject on top of whatever was restored.
    // A subject in the URL (a link from another app) wins over a stored
    // request, and is taken out of the address bar once read so a reload
    // does not open it a second time.
    const fromUrl = pendingOpenFromUrl(window.location.search);
    if (fromUrl) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${searchWithoutOpenRequest(window.location.search)}${window.location.hash}`,
      );
    }
    const pending = fromUrl ?? consumePendingOpen();
    if (pending) {
      const base = stored ? stored.tabs : [overviewTab(getDefaultNetworkId())];
      const tab = makeTab(pending.kind, pending.query, pending.networkId ?? getDefaultNetworkId());
      setTabs([...base, tab]);
      setActiveId(tab.id);
      // A note means the link came with words for a human: the arrival banner
      // names the subject and where the visitor came from.
      if (pending.note) setArrival(pending.note);
    } else if (stored) {
      setTabs(stored.tabs);
      setActiveId(stored.activeId);
    } else {
      // No session to restore, so honour the preferred starting network. Applied
      // here rather than in useState: the first client render has to match the
      // server's, which knows nothing of localStorage.
      const preferred = getDefaultNetworkId();
      if (preferred !== DEFAULT_NETWORK_ID) setTabs([overviewTab(preferred)]);
    }
    hydrated.current = true;
    setShowIntro(!wasIntroDismissed());
    try { setAskOpen(window.localStorage.getItem(ASK_OPEN_KEY) === 'true'); } catch { /* default closed */ }
    setAskWidth(loadAskWidth());
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try { window.localStorage.setItem(ASK_OPEN_KEY, String(askOpen)); } catch { /* best effort */ }
  }, [askOpen]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveAskWidth(askWidth);
  }, [askWidth]);

  // Drag the sidebar's left edge to resize it (desktop only).
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

  const active = tabs.find(t => t.id === activeId) ?? tabs[0];
  const activeNetworkId = active.networkId;

  // Persist open tabs (and which is active) once hydrated, so leaving and coming
  // back keeps every exploration in place.
  useEffect(() => {
    if (hydrated.current) saveTabs(tabs, active.id);
  }, [tabs, active.id]);

  // React to the active session changing (a send created one, or the user
  // opened one from history). A session linked to tabs restores them and opens
  // the sidebar; an unlinked one just loads in the chat and stops recording.
  useEffect(() => {
    if (activeSessionId === lastSessionRef.current) return;
    const prev = lastSessionRef.current;
    lastSessionRef.current = activeSessionId;
    if (!activeSessionId) { recordingRef.current = false; return; }
    if (pendingRecordRef.current && prev === null) {
      // First save of a conversation started in the sidebar: adopt it.
      pendingRecordRef.current = false;
      recordingRef.current = true;
      saveSessionTabs(activeSessionId, tabs, active.id);
      return;
    }
    pendingRecordRef.current = false;
    if (!vaultReady) return;
    const snap = getSessionTabs(activeSessionId);
    if (snap) {
      recordingRef.current = true;
      setTabs(snap.tabs);
      setActiveId(snap.activeId);
      setAskOpen(true);
    } else {
      recordingRef.current = false;
    }
  }, [activeSessionId, tabs, active.id, vaultReady]);

  // While a linked session is active, keep its snapshot in step with the tabs.
  useEffect(() => {
    if (recordingRef.current && activeSessionId) saveSessionTabs(activeSessionId, tabs, active.id);
  }, [activeSessionId, tabs, active.id]);

  // Called by the sidebar on every send: from now on this exploration's tabs
  // belong to the active conversation.
  function recordConversationActivity() {
    if (activeSessionId) {
      recordingRef.current = true;
      saveSessionTabs(activeSessionId, tabs, active.id);
    } else {
      pendingRecordRef.current = true;
    }
  }

  // Arkade IS Bitcoin mainnet plus an off-chain overlay: its on-chain data
  // (ribbon, blocks, transactions, addresses) comes from the very same
  // provider and caches as the Bitcoin network, so the two views can never
  // drift apart; switching networks only adds or removes the Arkade layer.
  // Bark and Spark settle on Bitcoin mainnet the same way.
  function dataNetworkId(id: string): string {
    const kind = getNetwork(id).kind;
    return kind === 'arkade' || kind === 'bark' || kind === 'spark' ? DEFAULT_NETWORK_ID : id;
  }

  // One provider per data network, cached, so switching back and forth is free.
  // Every tab talks to the ChainDataProvider interface, never to a URL. The
  // Mempool provider is wrapped in a CachingProvider that de-duplicates and
  // rate-limits the request burst a single analysis produces. The endpoint
  // comes from the node config, so a user-set node override is honoured.
  const providers = useRef(new Map<string, ChainDataProvider>());
  function providerFor(rawId: string): ChainDataProvider {
    const id = dataNetworkId(rawId);
    let p = providers.current.get(id);
    if (!p) {
      const net = getNetwork(id);
      const primary = new MempoolProvider(effectiveBaseUrl(id), net.label);
      // On the default public endpoint, rate-limiting fails over to public
      // stand-ins (and only then: the happy path never spreads queries). A
      // user-configured node is authoritative: no silent fallback to a third
      // party they did not choose.
      const base = !isUsingCustomNode(id) && net.fallbacks?.length
        ? new FailoverProvider([
            { provider: primary },
            ...net.fallbacks.map(f => ({
              provider: new MempoolProvider(f.baseUrl, f.name),
              esploraOnly: f.esploraOnly,
            })),
          ])
        : primary;
      // Immutable chain data (blocks, confirmed txs) persists across sessions,
      // namespaced by network so chains never mix.
      p = new CachingProvider(base, { persistent: createIdbCache(id) });
      providers.current.set(id, p);
    }
    return p;
  }
  const provider = providerFor(activeNetworkId);

  // A new tab inherits the active tab's network, so exploring from a mainnet tab
  // opens mainnet tabs, and from a testnet tab opens testnet tabs. One nuance:
  // a known settlement opened from the Arkade view is an ON-CHAIN transaction,
  // so it opens as a Bitcoin tab; violet stays for the off-chain subjects.
  // Opening a subject swaps the Ask-Alice attachment, and a new attachment
  // starts a new discussion (the previous one is archived in history). Only
  // for user-opened subjects: session restores and tab switches keep their
  // thread, and re-opening the subject already on screen changes nothing.
  function freshAskConversation(kind: Tab['kind'], query: string) {
    if (!askOpen) return;
    if (active.kind === kind && active.query === query) return;
    if (chatMessages.some(m => m.role === 'user')) clearMessages();
  }

  // The phone's version of opening the dock: a new conversation in the main
  // chat, with the active page attached exactly as the dock would attach it
  // (the previous conversation stays in history). The tabs open now ride
  // along so the conversation can be linked to this exploration.
  function handOffToChat() {
    if (chatMessages.some(m => m.role === 'user')) clearMessages();
    setAskHandoff({
      contextId: active.id,
      contextLabel: askContextLabel(active.kind, active.query, activeNetwork.kind),
      pageNote: explorerPageNote(active.kind, activeNetwork),
      signals: signalsByTab[active.id] ?? [],
      fullContext: fullByTab[active.id] ?? null,
      tabs,
      activeTabId: active.id,
    });
    router.push('/');
  }

  // The optional network pins a subject to the chain it belongs to. The
  // curated Home examples are all mainnet objects: opened on whatever chain
  // the selector happened to show, they answered "transaction not found" on
  // Mutinynet, and the same wrong answer on every other test network. A
  // subject that knows its chain names it; everything else keeps following
  // the selector.
  // Bark has no off-chain transaction to look up, so every transaction and
  // block opened from its view is a Bitcoin one, and opens as such.
  function openTx(txid: string, onNetworkId?: string) {
    const activeKind = getNetwork(activeNetworkId).kind;
    const networkId = onNetworkId
      ?? ((activeKind === 'arkade' && settlementRegistry.has(txid)) || activeKind === 'bark'
        ? DEFAULT_NETWORK_ID
        : activeNetworkId);
    freshAskConversation('tx', txid);
    const tab = makeTab('tx', txid, networkId);
    setTabs(prev => addTab(prev, tab, activeId));
    setActiveId(tab.id);
  }

  function openBlock(heightOrHash: string, onNetworkId?: string) {
    freshAskConversation('block', heightOrHash);
    const tab = makeTab('block', heightOrHash, onNetworkId
      ?? (getNetwork(activeNetworkId).kind === 'bark' ? DEFAULT_NETWORK_ID : activeNetworkId));
    setTabs(prev => addTab(prev, tab, activeId));
    setActiveId(tab.id);
  }

  // An ark1… address belongs to the implementation its version names, whatever
  // Ark network it was searched from; a spark1… address to Spark; an on-chain
  // address searched from Bark is a Bitcoin subject.
  function openAddress(address: string, onNetworkId?: string) {
    freshAskConversation('address', address);
    const flavor = arkAddressFlavor(address) ?? (looksLikeSparkAddress(address) ? 'spark' : null);
    const networkId = onNetworkId
      ?? (flavor ?? (getNetwork(activeNetworkId).kind === 'bark' ? DEFAULT_NETWORK_ID : activeNetworkId));
    const tab = makeTab('address', address, networkId);
    setTabs(prev => addTab(prev, tab, activeId));
    setActiveId(tab.id);
  }

  // A VTXO tab belongs to the network it was opened from (Bark by id or
  // export, Arkade by id, Spark by leaf id); its label is derived in makeTab.
  function openVtxo(query: string, onNetworkId?: string) {
    freshAskConversation('vtxo', query);
    const offChain = onNetworkId ? getNetwork(onNetworkId).kind : undefined;
    const networkId = onNetworkId && (offChain === 'arkade' || offChain === 'spark') ? onNetworkId : 'bark';
    const tab = makeTab('vtxo', query, networkId);
    setTabs(prev => addTab(prev, tab, activeId));
    setActiveId(tab.id);
  }

  function openXpub(input: string, label?: string, onNetworkId?: string) {
    freshAskConversation('xpub', input);
    // A saved wallet is bound to the chain it was saved on. Opened on the
    // selector's chain instead, a Mutinynet wallet viewed from Bitcoin would
    // scan the wrong network and read as emptied.
    const tab = makeTab('xpub', input, onNetworkId ?? activeNetworkId);
    if (label) tab.label = label;
    setTabs(prev => addTab(prev, tab, activeId));
    setActiveId(tab.id);
  }

  // A subject tab (a block, transaction, address or wallet) is bound to the
  // network it was opened on, exactly like a block or a transaction: its data is
  // meaningless on another chain, and re-scanning a Bitcoin wallet on Liquid
  // would make it look emptied. So only the Home tab's network is switchable in
  // place; picking a network from a subject tab focuses Home on that network
  // instead, leaving the subject tab untouched on its own chain.
  function selectNetwork(id: string) {
    const activeTab = tabs.find(t => t.id === activeId);
    if (activeTab?.kind === 'overview') {
      setTabs(prev => prev.map(t => t.id === activeId ? { ...t, networkId: id } : t));
      return;
    }
    const home = tabs.find(t => t.kind === 'overview');
    if (home) {
      setTabs(prev => prev.map(t => t.id === home.id ? { ...t, networkId: id } : t));
      setActiveId(home.id);
    }
  }

  function handleClose(id: string) {
    // The Home tab is permanent; ignore any attempt to close it.
    if (tabs.find(t => t.id === id)?.kind === 'overview') return;
    setTabs(prev => {
      const { tabs: next, fallbackId } = closeTab(prev, id, DEFAULT_NETWORK_ID);
      if (id === activeId) setActiveId(fallbackId);
      return next;
    });
    setFocusByTab(m => { const n = { ...m }; delete n[id]; return n; });
    setSignalsByTab(m => { const n = { ...m }; delete n[id]; return n; });
    setFullByTab(m => { const n = { ...m }; delete n[id]; return n; });
  }

  // One publisher for every tab kind: signals feed the de-identified
  // attachments, the full description feeds the explicit identified mode.
  function publishTabContext(s: PrivacySignal[], full?: FullContext) {
    setSignalsByTab(m => ({ ...m, [active.id]: s }));
    setFullByTab(m => ({ ...m, [active.id]: full ?? null }));
  }

  // Reorder by drag and drop: the moved tab lands before the drop target, or
  // just after Home when dropped on it. Home itself never moves from the head.
  function reorderTabs(fromId: string, toId: string) {
    setTabs(prev => {
      const from = prev.find(t => t.id === fromId);
      if (!from || from.kind === 'overview' || fromId === toId) return prev;
      const rest = prev.filter(t => t.id !== fromId);
      const idx = rest.findIndex(t => t.id === toId);
      if (idx < 0) return prev;
      const insertAt = rest[idx].kind === 'overview' ? idx + 1 : idx;
      return [...rest.slice(0, insertAt), from, ...rest.slice(insertAt)];
    });
  }

  // A block tab spotlights its own block; a transaction tab spotlights whatever
  // it resolved; addresses and Home spotlight nothing (centre on the divider).
  const focus = useMemo<RibbonFocus | undefined>(() => {
    if (active.kind === 'block' && active.query) return { kind: 'height', height: Number(active.query) };
    if (active.kind === 'tx') return focusByTab[active.id] ?? undefined;
    return undefined;
  }, [active.kind, active.query, active.id, focusByTab]);

  // Arkade settles on Bitcoin mainnet, read through the ASP's Esplora mirror:
  // it reuses the whole Bitcoin explorer, with the blocks and transactions
  // carrying a settlement highlighted in the network's accent.
  const activeNetwork = getNetwork(activeNetworkId);
  const isArkade = activeNetwork.kind === 'arkade';
  const isBark = activeNetwork.kind === 'bark';
  const isSpark = activeNetwork.kind === 'spark';
  const barkServerUrl = getNetwork('bark').barkServerUrl;

  // Arkade settles on Bitcoin mainnet, so its settlements are mainnet facts:
  // the Bitcoin view marks them too (block header, pinned row, block map).
  // Only the ribbon highlight and the ark1/virtual searches stay Arkade-only.
  const arkApiUrl = getNetwork('arkade').arkApiUrl;
  function onArkChain(id: string): boolean {
    return getNetwork(id).kind === 'arkade' || id === DEFAULT_NETWORK_ID;
  }

  // The settlements identified on-chain (walked from a known commitment along
  // the ASP's funding chain, and fed by the live stream). The walk runs while
  // the active network sees that chain; the registry persists across sessions.
  const arkSettlements = useArkadeSettlements(onArkChain(activeNetworkId) ? provider : null, arkApiUrl);

  // Bark rounds settle on mainnet the same way. The on-chain walk runs while
  // the Bark network is explored; the Bitcoin view marks what the registry
  // already knows, without a request per transaction.
  const barkRounds = useBarkRounds(isBark ? provider : null, barkServerUrl);
  function onBarkChain(id: string): boolean {
    return getNetwork(id).kind === 'bark' || id === DEFAULT_NETWORK_ID;
  }
  const barkRoundsByHeight = useMemo(() => {
    const m = new Map<number, string>();
    for (const s of barkRounds.byTxid.values()) {
      if (s.height !== undefined) m.set(s.height, s.txid);
    }
    return m;
  }, [barkRounds.byTxid]);

  // A transaction tab living on the Arkade network whose txid turns out to be
  // an on-chain settlement is re-homed to the Bitcoin network: the subject IS
  // an on-chain transaction, and the tab colour should say so. This also
  // migrates tabs persisted before the settlement was identified.
  useEffect(() => {
    setTabs(prev => {
      let changed = false;
      const next = prev.map(t => {
        if (t.kind === 'tx' && t.query && getNetwork(t.networkId).kind === 'arkade' && settlementRegistry.has(t.query)) {
          changed = true;
          return { ...t, networkId: DEFAULT_NETWORK_ID };
        }
        return t;
      });
      return changed ? next : prev;
    });
  }, [arkSettlements.byTxid]);

  // Block height -> settlement txid, for the block view's header badge and
  // its pinned commitment row.
  const arkSettlementsByHeight = useMemo(() => {
    const m = new Map<number, string>();
    for (const s of arkSettlements.byTxid.values()) {
      if (s.height !== undefined) m.set(s.height, s.txid);
    }
    return m;
  }, [arkSettlements.byTxid]);

  // The Spark deposits and exits this browser knows: a badge on their rows,
  // in a block's list and an address's history, and nothing on the block or
  // the ribbon. Deposits can sit in any block, so a block mark would say
  // nothing; and no list of them is complete, so the badge reads "known".
  const sparkOnchain = useSparkOnchain();
  const sparkTxBadge = useCallback((txid: string) => {
    const known = sparkOnchainRegistry.get(txid);
    return known ? <SparkTxBadge kind={known.kind} /> : undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the version is the registry's change counter
  }, [sparkOnchain.version]);

  // What the block view marks on the active tab's chain. Arkade settlements
  // and Bark rounds both land on mainnet, so the Bitcoin view carries both;
  // each Ark network carries its own.
  const blockMarks = useMemo<BlockMark[]>(() => {
    const kind = getNetwork(active.networkId).kind;
    const onMainnet = active.networkId === DEFAULT_NETWORK_ID;
    const marks: BlockMark[] = [];
    if (kind === 'arkade' || onMainnet) {
      marks.push({
        txids: new Set(arkSettlements.byTxid.keys()), byHeight: arkSettlementsByHeight,
        color: ARKADE_ACCENT, textColor: ARKADE_ACCENT_SOFT, label: t('explorer.marks.arkade'),
        badge: <SettlementBadge />, headerBadge: <SettlementBadge>{t('explorer.marks.arkadeHeader')}</SettlementBadge>,
      });
    }
    if (kind === 'bark' || onMainnet) {
      marks.push({
        txids: new Set(barkRounds.byTxid.keys()), byHeight: barkRoundsByHeight,
        color: BARK_ACCENT, textColor: BARK_ACCENT, label: t('explorer.marks.bark'),
        badge: <BarkRoundBadge />, headerBadge: <BarkRoundBadge>{t('explorer.marks.barkHeader')}</BarkRoundBadge>,
      });
    }
    if (kind === 'spark' || onMainnet) {
      marks.push({
        txids: sparkOnchain.txids, byHeight: new Map(),
        color: SPARK_ACCENT, textColor: SPARK_ACCENT, label: t('explorer.marks.spark'),
        badge: sparkTxBadge, headerBadge: null,
      });
    }
    return marks;
  }, [active.networkId, arkSettlements.byTxid, arkSettlementsByHeight, barkRounds.byTxid, barkRoundsByHeight, sparkOnchain.txids, sparkTxBadge, t]);

  // Every tab kind renders inside one shared scroll container, so a freshly
  // opened (or switched-to) tab must start at the top, not wherever the
  // previous tab left the scroll.
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollAreaRef.current?.scrollTo({ top: 0 });
  }, [active.id]);

  return (
    <div className="flex flex-row flex-1 min-w-0 min-h-0">
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
      {showIntro && <ExplorerIntroModal onClose={() => setShowIntro(false)} />}

      {/* The live blockchain ribbon sits at the very top, persistent across
          every view; on a block page it centres on the current block. On Arkade
          it is the SAME Bitcoin mainnet ribbon (same provider, same data,
          keyed by data network so switching does not even remount it) with the
          settlement blocks marked on top. */}
      {/* On a phone the network button sits in the shell's header, at the
          right of the "Explorer" title: the tab bar keeps Home pinned at the
          left instead (see ExplorerTabBar). */}
      <WorkspaceHeaderActions>
        <NetworkButton activeNetworkId={activeNetworkId} onSelectNetwork={selectNetwork} align="right" />
      </WorkspaceHeaderActions>
      <div className="shrink-0 pt-3">
        <ExplorerBlocks
          key={dataNetworkId(activeNetworkId)}
          provider={provider}
          onOpenBlock={openBlock}
          focus={focus}
          highlight={isArkade ? {
            heights: arkSettlements.heights,
            color: activeNetwork.color,
            onColor: '#ffffff',
            name: 'Arkade',
            subject: t('explorer.highlight.arkadeSubject'),
            busy: arkSettlements.sync.catchingUp,
          } : isBark ? {
            heights: barkRounds.heights,
            color: activeNetwork.color,
            onColor: 'var(--alice-bg)',
            name: 'Bark',
            subject: t('explorer.highlight.barkSubject'),
            busy: barkRounds.sync.catchingUp,
          } : undefined}
        />
      </div>

      {/* The tabs sit just below the ribbon. A standalone network button on the
          left switches explorer; the tabs, colour-coded by network, follow. */}
      <ExplorerTabBar
        tabs={tabs}
        activeId={active.id}
        onSelect={setActiveId}
        onClose={handleClose}
        onReorder={reorderTabs}
        activeNetworkId={activeNetworkId}
        onSelectNetwork={selectNetwork}
      />

      {arrival && (
        <div
          className="flex items-center shrink-0"
          style={{
            gap: 14,
            margin: '10px 12px 0',
            padding: '10px 14px',
            minHeight: 44,
            border: '1px solid var(--alice-primary)',
            borderRadius: 3,
            background: 'var(--alice-bg-soft)',
          }}
        >
          <span className="font-numbers shrink-0" style={{ fontSize: 12, color: 'var(--alice-primary)' }}>
            {arrival.origin.toUpperCase()}
          </span>
          <span className="font-numbers min-w-0 truncate" style={{ fontSize: 13, color: 'var(--alice-text)' }}>
            {arrival.label}
          </span>
          {/* A visitor sent by another app arrived by URL: this tab has no
              page to go back to, so the only sensible action is to dismiss. */}
          {!arrival.origin.toLowerCase().includes('wallet') && (
            <button
              type="button"
              onClick={() => { setArrival(null); window.history.back(); }}
              className="alice-control alice-control--quiet font-numbers cursor-pointer shrink-0 ml-auto"
              style={{ fontSize: 13, padding: '6px 10px', borderRadius: 3, color: 'var(--alice-primary)' }}
            >
              <SvgIcon svg={BACK_ICON} size={16} />
              {arrival.origin.toLowerCase().includes('chat') ? t('explorer.arrival.backToChat') : t('explorer.arrival.backToCourse')}
            </button>
          )}
          <button
            type="button"
            onClick={() => setArrival(null)}
            aria-label={t('explorer.arrival.dismiss')}
            className="alice-control alice-control--quiet cursor-pointer shrink-0 bg-transparent border-none ml-auto"
            style={{ color: 'var(--alice-muted)', fontSize: 14, lineHeight: '14px' }}
          >
            <SvgIcon svg={CLOSE_ICON} size={16} />
          </button>
        </div>
      )}

      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
        {active.kind === 'overview' && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6 px-5 pt-6 pb-8">
            <ExplorerOverviewTab
              key={active.id}
              activeNetworkId={activeNetworkId}
              getProvider={providerFor}
              onOpenTx={openTx}
              onOpenBlock={openBlock}
              onOpenAddress={openAddress}
              onOpenXpub={openXpub}
              onOpenVtxo={query => openVtxo(query, activeNetworkId)}
              arkade={isArkade && activeNetwork.arkApiUrl ? { apiBaseUrl: activeNetwork.arkApiUrl, sync: arkSettlements.sync } : undefined}
              bark={isBark && barkServerUrl ? { serverUrl: barkServerUrl, rounds: barkRounds.byTxid, sync: barkRounds.sync } : undefined}
              spark={isSpark}
            />
          </div>
        )}
        {active.kind === 'tx' && active.query && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6 px-5 pt-6 pb-8">
            {/* On Spark, a transaction id is a transfer or a leaf (a UUID) read
                from the operators, or a token transaction read from Sparkscan;
                a Bitcoin txid is offered to the Bitcoin network. */}
            {getNetwork(active.networkId).kind === 'spark' ? (
              <ExplorerSparkTxTab
                id={active.query}
                provider={provider}
                onOpenTx={openTx}
                onOpenAddress={openAddress}
                onOpenLeaf={id => openVtxo(id, active.networkId)}
                onSignals={publishTabContext}
              />
            ) : (
              <ExplorerTxTab
                txid={active.query}
                provider={provider}
                onOpenTx={openTx}
                onOpenAddress={openAddress}
                onFocus={(f) => setFocusByTab(m => ({ ...m, [active.id]: f }))}
                onSignals={publishTabContext}
                arkadeApiUrl={onArkChain(active.networkId) ? arkApiUrl : undefined}
                arkadeProbeKnownOnly={getNetwork(active.networkId).kind !== 'arkade'}
                bark={onBarkChain(active.networkId) && barkServerUrl
                  ? { serverUrl: barkServerUrl, probeKnownOnly: getNetwork(active.networkId).kind !== 'bark' }
                  : undefined}
                onOpenVtxo={openVtxo}
              />
            )}
          </div>
        )}
        {active.kind === 'block' && active.query && (
          <div className="max-w-5xl mx-auto flex flex-col gap-6 px-5 pt-6 pb-8">
            <ExplorerBlockTab
              height={active.query}
              provider={provider}
              onOpenTx={openTx}
              onSignals={publishTabContext}
              marks={blockMarks}
            />
          </div>
        )}
        {active.kind === 'address' && active.query && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6 px-5 pt-6 pb-8">
            {/* An ark1… address is an off-chain (VTXO) subject: a Bark one opens
                the Bark address view, an Arkade one the Arkade view; a spark1…
                address the Spark view; any on-chain address gets the regular
                tab. */}
            {looksLikeSparkAddress(active.query) ? (
              <ExplorerSparkAddressTab
                address={active.query}
                onOpenTx={id => openTx(id, 'spark')}
                onOpenLeaf={id => openVtxo(id, 'spark')}
                onSignals={publishTabContext}
              />
            ) : arkAddressFlavor(active.query) === 'bark' && getNetwork('bark').barkServerUrl ? (
              <ExplorerBarkAddressTab
                serverUrl={getNetwork('bark').barkServerUrl!}
                address={active.query}
                onSignals={publishTabContext}
              />
            ) : looksLikeArkadeAddress(active.query) && getNetwork(active.networkId).arkApiUrl ? (
              <ExplorerArkadeAddressTab
                apiBaseUrl={getNetwork(active.networkId).arkApiUrl!}
                address={active.query}
                onOpenTx={openTx}
                onOpenVtxo={id => openVtxo(id, active.networkId)}
                onSignals={publishTabContext}
              />
            ) : (
              <ExplorerAddressTab
                address={active.query}
                provider={provider}
                onOpenTx={openTx}
                onOpenAddress={openAddress}
                onSignals={publishTabContext}
                confidentialAmounts={getNetwork(active.networkId).kind === 'liquid'}
                remoteEntities={active.networkId === 'mainnet'}
                txBadge={active.networkId === DEFAULT_NETWORK_ID ? sparkTxBadge : undefined}
              />
            )}
          </div>
        )}
        {active.kind === 'vtxo' && active.query && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6 px-5 pt-6 pb-8">
            {getNetwork(active.networkId).kind === 'arkade' && getNetwork(active.networkId).arkApiUrl ? (
              <ExplorerArkadeVtxoTab
                apiBaseUrl={getNetwork(active.networkId).arkApiUrl!}
                query={active.query}
                onOpenTx={openTx}
                onOpenAddress={openAddress}
                onSignals={publishTabContext}
              />
            ) : getNetwork(active.networkId).kind === 'spark' ? (
              <ExplorerSparkLeafTab
                leafId={active.query}
                provider={providerFor(DEFAULT_NETWORK_ID)}
                onOpenTx={openTx}
                onOpenAddress={openAddress}
                onSignals={publishTabContext}
              />
            ) : barkServerUrl ? (
              <ExplorerBarkVtxoTab
                serverUrl={barkServerUrl}
                provider={providerFor(DEFAULT_NETWORK_ID)}
                query={active.query}
                onOpenTx={openTx}
                onSignals={publishTabContext}
              />
            ) : null}
          </div>
        )}
        {active.kind === 'xpub' && active.query && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6 px-5 pt-6 pb-8">
            <ExplorerXpubTab
              key={active.id}
              input={active.query}
              networkId={active.networkId}
              provider={provider}
              onOpenAddress={openAddress}
              onOpenTx={openTx}
              onSignals={publishTabContext}
            />
          </div>
        )}
      </div>
      </div>

      {/* Optional Alice companion, docked on the right like the left sidebar
          and persistent across tabs and pages. The bubble reopens it when
          closed; on a phone the bubble hands the page over to the main chat
          instead, and the dock never shows. */}
      {askOpen && !phone ? (
        <>
          <div
            className="relative flex shrink-0 w-[var(--ask-w,420px)]"
            style={{ ['--ask-w' as string]: `${askWidth}px`, borderLeft: '1px solid var(--alice-border)' } as React.CSSProperties}
          >
            <div
              onPointerDown={startAskResize}
              className="hidden md:block absolute left-0 inset-y-0 z-10"
              style={{ width: 5, cursor: 'col-resize' }}
              aria-hidden="true"
            />
            <AskAliceDock
              signals={signalsByTab[active.id] ?? []}
              fullContext={fullByTab[active.id] ?? null}
              contextId={active.id}
              // The chip's short name (shown locally, never sent) and the
              // identity-free sentence naming the page (sent in the
              // de-identified block): see ask-context.ts.
              contextLabel={askContextLabel(active.kind, active.query, activeNetwork.kind)}
              pageNote={explorerPageNote(active.kind, activeNetwork)}
              onActivity={recordConversationActivity}
              onClose={() => setAskOpen(false)}
            />
          </div>
        </>
      ) : (
        <AskAliceFab onOpen={() => (phone ? handOffToChat() : setAskOpen(true))} />
      )}
    </div>
  );
}

export function ExplorerPanel() {
  return <WorkspaceShell title="Explorer"><ExplorerWorkspace /></WorkspaceShell>;
}
