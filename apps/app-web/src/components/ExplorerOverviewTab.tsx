'use client';

import { SvgIcon } from '@/components/SvgIcon';
import { SEARCH_ICON } from '@/lib/atelier-icons';
import { finePointer } from '@/lib/pointer';

import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n';
import type { MessageKey } from '@/i18n';
import type { ReactNode } from 'react';
import { classifySearch } from '@/lib/explorer/search';
import { getNetwork } from '@/lib/explorer/networks';
import { remoteEntitiesConfigured } from '@/lib/explorer/entity-remote';
import { anchorsConfigured } from '@/lib/explorer/anchors';
import type { ChainDataProvider } from '@/lib/explorer/provider';
import { ExplorerWalletCards } from '@/components/ExplorerWalletCards';
import { ArkadeAspInfo, ArkadeLiveSettlements } from '@/components/ExplorerArkade';
import { BarkLiveRounds, BarkServerInfo } from '@/components/ExplorerBark';
import { SparkLiveFeed, SparkOperatorsInfo } from '@/components/ExplorerSpark';
import type { KnownSettlement } from '@/lib/explorer/arkade-onchain';
import type { SettlementSync } from '@/lib/explorer/use-settlement-sync';
import { EXPLORE_ADDRESSES, EXPLORE_BLOCKS, EXPLORE_TXS, type ExploreExample } from '@/lib/explorer/explore-examples';

// Overview / home tab: the universal search (transaction, address, block or
// xpub) with clickable examples, a preview of what the explorer can show, and
// the data-source notice. The section intro lives in ExplorerIntroModal; the
// live block ribbon lives above, in the workspace, on every page.

// Miniature previews of the explorer views, in the visual language of the real
// components (bowtie flow, block treemap, UTXO bubbles, signal rows).
function FlowGlyph() {
  return (
    <svg width={48} height={32} viewBox="0 0 48 32" aria-hidden="true">
      <path d="M11 8 L21 14 M11 24 L21 18" stroke="var(--alice-border)" strokeWidth={1.5} />
      <path d="M27 14 L37 8 M27 18 L37 24" stroke="var(--alice-border)" strokeWidth={1.5} />
      <circle cx={8} cy={8} r={4} fill="var(--alice-muted)" />
      <circle cx={8.5} cy={24} r={2.5} fill="var(--alice-muted)" />
      <rect x={21} y={12} width={6} height={8} fill="var(--alice-primary)" />
      <circle cx={40} cy={8} r={3} fill="var(--alice-primary-dark)" />
      <circle cx={40} cy={24} r={4} fill="var(--alice-primary)" />
    </svg>
  );
}

function BlockMapGlyph() {
  return (
    <svg width={48} height={32} viewBox="0 0 48 32" aria-hidden="true">
      <rect x={4} y={4} width={17} height={24} fill="var(--alice-primary)" opacity={0.9} />
      <rect x={23} y={4} width={12} height={13} fill="var(--alice-muted)" />
      <rect x={37} y={4} width={7} height={13} fill="var(--alice-muted)" opacity={0.55} />
      <rect x={23} y={19} width={9} height={9} fill="var(--alice-primary-dark)" opacity={0.85} />
      <rect x={34} y={19} width={10} height={5} fill="var(--alice-muted)" opacity={0.4} />
      <rect x={34} y={26} width={6} height={2} fill="var(--alice-muted)" opacity={0.3} />
    </svg>
  );
}

function BubblesGlyph() {
  return (
    <svg width={48} height={32} viewBox="0 0 48 32" aria-hidden="true">
      <circle cx={14} cy={17} r={10} fill="var(--alice-primary)" opacity={0.9} />
      <circle cx={30} cy={11} r={6} fill="var(--alice-primary-dark)" opacity={0.8} />
      <circle cx={40} cy={22} r={4.5} fill="var(--alice-muted)" />
      <circle cx={31} cy={25} r={2.5} fill="var(--alice-muted)" opacity={0.6} />
    </svg>
  );
}

function SignalsGlyph() {
  return (
    <svg width={48} height={32} viewBox="0 0 48 32" aria-hidden="true">
      <rect x={5} y={4} width={5} height={5} fill="var(--alice-primary)" />
      <rect x={14} y={6} width={26} height={1.5} fill="var(--alice-border)" />
      <rect x={5} y={13} width={5} height={5} fill="var(--alice-primary-dark)" />
      <rect x={14} y={15} width={19} height={1.5} fill="var(--alice-border)" />
      <rect x={5} y={22} width={5} height={5} fill="var(--alice-muted)" />
      <rect x={14} y={24} width={23} height={1.5} fill="var(--alice-border)" />
    </svg>
  );
}

function FeatureCard({ glyph, title, text }: { glyph: ReactNode; title: string; text: string }) {
  return (
    <div
      className="flex flex-col gap-2 px-4 py-4"
      style={{ borderTop: '1px solid var(--alice-border)', borderRadius: 'var(--alice-radius-control)', backgroundColor: 'transparent' }}
    >
      <div style={{ height: 32 }}>{glyph}</div>
      <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-text)', marginTop: 4 }}>
        {title}
      </span>
      <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
        {text}
      </p>
    </div>
  );
}

const KIND_LABEL: Record<'tx' | 'block' | 'address' | 'xpub' | 'vtxo', MessageKey> = {
  tx: 'explorer.search.kind.tx',
  block: 'explorer.search.kind.block',
  address: 'explorer.search.kind.address',
  xpub: 'explorer.search.kind.xpub',
  vtxo: 'explorer.search.kind.vtxo',
};

// One clickable chip per curated chain item (see explore-examples.ts).
function ExampleChip({ example, onOpen }: { example: ExploreExample; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="alice-control"
      style={{
        padding: '10px 14px',
        minHeight: 44,
        borderColor: 'var(--alice-control-border)',
        borderRadius: 'var(--alice-radius-control)',
      }}
      title={example.note}
    >
      <span className="font-numbers" style={{ fontSize: 14, color: 'var(--alice-text)' }}>
        {example.label}
      </span>
    </button>
  );
}

// A curated group of examples: transactions, blocks, or addresses.
function ExploreGroup({ title, items, onOpen }: {
  title: string;
  items: ExploreExample[];
  onOpen: (kind: 'tx' | 'block' | 'address', value: string, networkId?: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{title}</span>
      <div className="flex flex-wrap gap-2">
        {items.map((ex) => (
          // Every curated example is a mainnet object: the pizza, the genesis
          // coinbase, the seizures all live on one chain and no other. Pinning
          // it here is what lets someone browse Mutinynet and still tap
          // "First BTC payment" without being told it does not exist.
          <ExampleChip key={ex.value} example={ex} onOpen={() => onOpen(ex.kind, ex.value, 'mainnet')} />
        ))}
      </div>
    </div>
  );
}

export function ExplorerOverviewTab({
  activeNetworkId,
  getProvider,
  onOpenTx,
  onOpenBlock,
  onOpenAddress,
  onOpenXpub,
  onOpenVtxo,
  arkade,
  bark,
  spark,
}: {
  activeNetworkId: string;
  getProvider: (networkId: string) => ChainDataProvider;
  onOpenTx: (txid: string, networkId?: string) => void;
  onOpenBlock: (heightOrHash: string, networkId?: string) => void;
  onOpenAddress: (address: string, networkId?: string) => void;
  onOpenXpub: (input: string, label?: string, networkId?: string) => void;
  /** Opens a Bark coin: its id ("txid:vout") or its hex export. */
  onOpenVtxo: (query: string) => void;
  /** Set on the Arkade network: the search also recognises ark1… addresses,
   *  and the curated Bitcoin history gives way to the live settlements feed
   *  and the ASP's parameters. */
  arkade?: { apiBaseUrl: string; sync: SettlementSync };
  /** Set on the Bark network: ark1… addresses and VTXOs are recognised too,
   *  and the server's rounds (the ones identified so far) and parameters
   *  replace the curated history. */
  bark?: { serverUrl: string; rounds: ReadonlyMap<string, KnownSettlement>; sync: SettlementSync };
  /** Set on the Spark network: spark1… addresses and Spark ids (transfers,
   *  leaves) are recognised, and the network's live feed and the operators'
   *  parameters replace the curated history. */
  spark?: boolean;
}) {
  const t = useT();
  const [raw, setRaw] = useState('');
  // Mirrors exactly what triggers the remote entity lookup (see ExplorerPanel's
  // remoteEntities prop), so the disclosure below never claims a request the
  // build does not actually make.
  const showsRemoteEntities = activeNetworkId === 'mainnet' && remoteEntitiesConfigured();
  // The settlement anchor is one more request, to Alice's own server, made
  // only on these two networks and only with a proxy configured; the
  // disclosure names it exactly when the build makes it.
  const anchorsNote = (arkade || bark) && anchorsConfigured()
    ? t('explorer.overview.anchorsNote')
    : '';
  const inputRef = useRef<HTMLInputElement>(null);
  // Focus without scrolling, so the hero above the field stays in view on
  // load; only with a physical keyboard, so a phone does not open its
  // on-screen one over the page.
  useEffect(() => { if (finePointer()) inputRef.current?.focus({ preventScroll: true }); }, []);
  const trimmed = raw.trim();
  const result = classifySearch(trimmed, {
    arkAddresses: !!arkade || !!bark,
    liquidAddresses: getNetwork(activeNetworkId).kind === 'liquid',
    vtxoIds: !!bark || !!arkade,
    sparkAddresses: !!spark,
    sparkIds: !!spark,
  });
  // A pasted xpub now opens the wallet view; unknown is a plain format error.
  const routable = result.kind !== 'unknown';
  const showError = trimmed.length > 0 && !routable;

  function errorMessage(): string {
    if (spark) return t('explorer.search.error.spark');
    return bark
      ? t('explorer.search.error.bark')
      : arkade
        ? t('explorer.search.error.arkade')
        : t('explorer.search.error.bitcoin');
  }

  function open(
    kind: 'tx' | 'block' | 'address' | 'xpub',
    value: string,
    networkId?: string,
  ) {
    if (kind === 'tx') onOpenTx(value, networkId);
    else if (kind === 'block') onOpenBlock(value, networkId);
    else if (kind === 'xpub') onOpenXpub(value);
    else onOpenAddress(value, networkId);
  }

  function submit() {
    if (result.kind === 'unknown') return;
    if (result.kind === 'vtxo') onOpenVtxo(result.value);
    else open(result.kind, result.value);
    setRaw('');
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="workspace-heading">
        <h1 className="font-pixel">Explorer</h1>
        <p>{t('explorer.overview.lead')}</p>
      </header>
      {/* The universal search, centrepiece of the page. */}
      <div className="flex flex-col gap-2">
        <label htmlFor="explorer-search" className="font-numbers text-sm">{t('explorer.search.label')}</label>
        <div className="relative">
          <input
            id="explorer-search"
            aria-describedby="explorer-search-hint"
            aria-invalid={showError}
            ref={inputRef}
            type="text"
            value={raw}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => setRaw(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            placeholder={spark
              ? t('explorer.search.placeholder.spark')
              : bark
                ? t('explorer.search.placeholder.ark')
                : arkade ? t('explorer.search.placeholder.ark') : t('explorer.search.placeholder.bitcoin')}
            className="alice-field w-full font-numbers "
            style={{
              height: 46,
              fontSize: 14.5,
              padding: '0 12px',
              paddingRight: routable ? 96 : 12,
              color: 'var(--alice-text)',
              backgroundColor: 'var(--alice-bg)',
              border: `1px solid ${showError ? 'var(--alice-danger)' : routable ? 'var(--alice-primary)' : 'var(--alice-control-border)'}`,
              borderRadius: 'var(--alice-radius-control)',
            }}
          />
          {/* Live badge: what the pasted string was recognised as. */}
          {result.kind !== 'unknown' && (
            <span
              className="font-pixel tracking-widest absolute"
              style={{
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 10,
                padding: '4px 6px',
                color: 'var(--alice-primary)',
                border: '1px solid var(--alice-primary)',
                borderRadius: 'var(--alice-radius-control)',
              }}
            >
              {t(KIND_LABEL[result.kind])}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3" style={{ minHeight: 20 }}>
          <span
            id="explorer-search-hint"
            className="font-numbers"
            style={{ fontSize: 12, color: showError ? 'var(--alice-danger)' : 'var(--alice-muted)', opacity: 1 }}
          >
            {showError
              ? errorMessage()
              : routable
                ? t('explorer.search.hint.enter')
                : t('explorer.search.hint.paste')}
          </span>
          <button
            type="button"
            disabled={!routable}
            onClick={submit}
            className="alice-control alice-control--primary font-numbers cursor-pointer disabled:cursor-not-allowed"
            style={{
              fontSize: 14,
              padding: '10px 18px',
              borderRadius: 'var(--alice-radius-control)',
              opacity: routable ? 1 : 0.5,
            }}
          >
            <SvgIcon svg={SEARCH_ICON} size={16} /> {t('explorer.search.submit')}
          </button>
        </div>

      </div>

      {/* Saved wallets first, right under the search: balance, trend and last
          movement per saved xpub / descriptor / address. */}
      <ExplorerWalletCards
        activeNetworkId={activeNetworkId}
        getProvider={getProvider}
        onOpenXpub={onOpenXpub}
        onOpenAddress={onOpenAddress}
      />

      {spark ? (
        // Spark's own live layer: the network's newest transactions (from
        // Sparkscan) and the operators' parameters. A wallet, a transfer or
        // a leaf is reached through the search above.
        <>
          <SparkLiveFeed onOpenTx={id => onOpenTx(id, activeNetworkId)} />
          <SparkOperatorsInfo />
        </>
      ) : arkade ? (
        // Arkade's own live layer: the settlements feed (each round opening its
        // on-chain transaction) and the service provider's parameters.
        <>
          <ArkadeLiveSettlements apiBaseUrl={arkade.apiBaseUrl} sync={arkade.sync} onOpenTx={onOpenTx} />
          <ArkadeAspInfo apiBaseUrl={arkade.apiBaseUrl} />
        </>
      ) : bark ? (
        // Bark's own live layer: the rounds identified so far and as they
        // happen (each opening its on-chain transaction), and the server's
        // parameters. A coin is reached through the search above.
        <>
          <BarkLiveRounds serverUrl={bark.serverUrl} rounds={bark.rounds} sync={bark.sync} onOpenTx={onOpenTx} />
          <BarkServerInfo serverUrl={bark.serverUrl} />
        </>
      ) : (
        // Curated history: famous transactions, milestone blocks and notorious
        // addresses, so the first dive needs zero knowledge. Hover for the story.
        <div className="flex flex-col gap-4">
          <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
            {t('explorer.overview.history')}
          </span>
          <ExploreGroup title={t('explorer.overview.famousTxs')} items={EXPLORE_TXS} onOpen={open} />
          <ExploreGroup title={t('explorer.overview.milestoneBlocks')} items={EXPLORE_BLOCKS} onOpen={open} />
          <ExploreGroup title={t('explorer.overview.notoriousAddresses')} items={EXPLORE_ADDRESSES} onOpen={open} />
        </div>
      )}

      {/* What is down the hole: one card per explorer view. */}
      <div className="flex flex-col gap-3">
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
          {t('explorer.overview.features')}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FeatureCard
            glyph={<FlowGlyph />}
            title={t('explorer.overview.feature.flow.title')}
            text={t('explorer.overview.feature.flow.text')}
          />
          <FeatureCard
            glyph={<BlockMapGlyph />}
            title={t('explorer.overview.feature.map.title')}
            text={t('explorer.overview.feature.map.text')}
          />
          <FeatureCard
            glyph={<BubblesGlyph />}
            title={t('explorer.overview.feature.insights.title')}
            text={t('explorer.overview.feature.insights.text')}
          />
          <FeatureCard
            glyph={<SignalsGlyph />}
            title={t('explorer.overview.feature.signals.title')}
            text={t('explorer.overview.feature.signals.text')}
          />
        </div>
      </div>

      {/* Where the data comes from, and what that means for privacy. */}
      <div
        className="flex flex-col gap-1 px-4 py-3"
        style={{
          borderTop: '1px solid var(--alice-border)',
          borderLeft: '3px solid var(--alice-primary)',
          borderRadius: 'var(--alice-radius-control)',
          backgroundColor: 'transparent',
        }}
      >
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>
          {t('explorer.overview.dataSource')}
        </span>
        <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
          {spark
            ? t('explorer.overview.source.spark')
            : arkade
            ? t('explorer.overview.source.arkade', { anchors: anchorsNote })
            : bark
              ? t('explorer.overview.source.bark', { anchors: anchorsNote })
              : t('explorer.overview.source.bitcoin')}
        </p>
        {/* The entity lookup is a second server, so it gets its own sentence: the
            bundled dataset alone never leaves the device, but the giant packs are
            queried on demand and that request carries the address being viewed. */}
        {showsRemoteEntities ? (
          <p className="font-numbers m-0" style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--alice-muted)' }}>
            {t('explorer.overview.entitiesNote')}
          </p>
        ) : null}
      </div>
    </div>
  );
}
