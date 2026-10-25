'use client';

import { useState } from 'react';
import { ANDROID_APK_URL, ANDROID_RELEASE_URL, ANDROID_VERSION, WALLET_MUTINYNET_URL, WALLET_SOURCE_URL, WALLET_URL } from '@/lib/site';
import { externalLinkProps } from '@/lib/links';
import { DownloadNotice } from '@/components/DownloadNotice';

const inlineLinkClass = 'underline decoration-[var(--alice-border)] underline-offset-4 hover:text-[var(--alice-primary)]';

export function ExperimentalWallet() {
  const [showDownloadNotice, setShowDownloadNotice] = useState(false);
  return (
    <section id="experimental-wallet" aria-labelledby="experimental-wallet-title" className="wallet-experiment mx-auto max-w-6xl px-5 pb-20 pt-8">
      <div className="border-t border-dashed border-[var(--alice-border)] pt-10 sm:pt-14">
        <div className="grid items-center gap-10 sm:grid-cols-[1fr_180px] sm:gap-16">
          <div className="max-w-2xl">
            <p className="experimental-label">EXPERIMENTAL · ALICE WALLET</p>
            <h2 id="experimental-wallet-title" className="mt-5 text-4xl leading-tight sm:text-5xl">A wallet, still taking shape.</h2>
            <p className="mt-5 text-base leading-relaxed text-[var(--alice-muted)]">
              Alongside the companion, we’re exploring a self-custodial Bitcoin wallet with Alice to explain each step. This is a separate, experimental project for people who want to test early software and follow its development.
            </p>
            <p className="mt-5 border-l-2 border-[#d7bd8a] pl-4 text-sm leading-relaxed text-[var(--alice-text)]">
              Beta, not audited. The wallet can hold real bitcoin on mainnet. Use small amounts only and keep your recovery words backed up. To try it without risking anything, start on Mutinynet, a test network with free coins.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a className="wallet-link" href={WALLET_MUTINYNET_URL} {...externalLinkProps(WALLET_MUTINYNET_URL)}>Try it on Mutinynet · test coins</a>
              <a className="wallet-link" href={WALLET_URL} {...externalLinkProps(WALLET_URL)}>Web wallet · mainnet</a>
              <button type="button" className="wallet-link" onClick={() => setShowDownloadNotice(true)}>Android APK · August 2026 build</button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--alice-muted)]">
              The web versions run the current code. The Android APK is the last build, Alice {ANDROID_VERSION}, released before the wallet moved to its own repository, so it lacks the changes made since; its checksum is on <a className={inlineLinkClass} href={ANDROID_RELEASE_URL} {...externalLinkProps(ANDROID_RELEASE_URL)}>its release page</a>.
            </p>
            <a className={`mt-3 inline-block text-sm text-[var(--alice-muted)] ${inlineLinkClass}`} href={WALLET_SOURCE_URL} {...externalLinkProps(WALLET_SOURCE_URL)}>Source code &amp; changelog on GitHub</a>
          </div>
          <figure className="mx-auto w-[150px] sm:w-[180px]">
            {/* Existing mobile interface, intentionally unchanged. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/screens/mobile/wallet.webp" alt="Alice Wallet’s existing mobile interface with options to create or import a wallet" width={390} height={844} loading="lazy" className="block h-auto w-full rounded-[4px] border border-[var(--alice-border)]" />
            <figcaption className="mt-3 text-center text-xs text-[var(--alice-muted)]">Mobile prototype</figcaption>
          </figure>
        </div>
      </div>
      {showDownloadNotice && <DownloadNotice platform="android" href={ANDROID_APK_URL} verifyHref={ANDROID_RELEASE_URL} onCancel={() => setShowDownloadNotice(false)} />}
    </section>
  );
}
