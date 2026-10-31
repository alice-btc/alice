'use client';

import { useState } from 'react';
import { ANDROID_APK_URL, ANDROID_RELEASE_URL, ANDROID_VERSION, WALLET_MUTINYNET_URL, WALLET_SOURCE_URL, WALLET_URL } from '@/lib/site';
import { externalLinkProps } from '@/lib/links';
import { DownloadNotice } from '@/components/DownloadNotice';
import type { HomeCopy } from '@/i18n/dictionaries/home';
import type { CommonCopy } from '@/i18n/dictionaries/common';

const inlineLinkClass = 'underline decoration-[var(--alice-border)] underline-offset-4 hover:text-[var(--alice-primary)]';

export function ExperimentalWallet({
  copy,
  noticeCopy,
}: {
  copy: HomeCopy['wallet'];
  noticeCopy: CommonCopy['downloadNotice'];
}) {
  const [showDownloadNotice, setShowDownloadNotice] = useState(false);
  return (
    <section id="experimental-wallet" aria-labelledby="experimental-wallet-title" className="wallet-experiment mx-auto max-w-6xl px-5 pb-20 pt-8">
      <div className="border-t border-dashed border-[var(--alice-border)] pt-10 sm:pt-14">
        <div className="grid items-center gap-10 sm:grid-cols-[1fr_180px] sm:gap-16">
          <div className="max-w-2xl">
            <p className="experimental-label">{copy.label}</p>
            <h2 id="experimental-wallet-title" className="mt-5 text-4xl leading-tight sm:text-5xl">{copy.title}</h2>
            <p className="mt-5 text-base leading-relaxed text-[var(--alice-muted)]">
              {copy.intro}
            </p>
            <p className="mt-5 border-l-2 border-[#d7bd8a] pl-4 text-sm leading-relaxed text-[var(--alice-text)]">
              {copy.warning}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a className="wallet-link" href={WALLET_MUTINYNET_URL} {...externalLinkProps(WALLET_MUTINYNET_URL)}>{copy.mutinynet}</a>
              <a className="wallet-link" href={WALLET_URL} {...externalLinkProps(WALLET_URL)}>{copy.mainnet}</a>
              <button type="button" className="wallet-link" onClick={() => setShowDownloadNotice(true)}>{copy.apk}</button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--alice-muted)]">
              {copy.apkNoteBefore.replace('{version}', ANDROID_VERSION)}<a className={inlineLinkClass} href={ANDROID_RELEASE_URL} {...externalLinkProps(ANDROID_RELEASE_URL)}>{copy.apkNoteLink}</a>{copy.apkNoteAfter}
            </p>
            <a className={`mt-3 inline-block text-sm text-[var(--alice-muted)] ${inlineLinkClass}`} href={WALLET_SOURCE_URL} {...externalLinkProps(WALLET_SOURCE_URL)}>{copy.source}</a>
          </div>
          <figure className="mx-auto w-[150px] sm:w-[180px]">
            {/* Existing mobile interface, intentionally unchanged. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/screens/mobile/wallet.webp" alt={copy.imageAlt} width={390} height={844} loading="lazy" className="block h-auto w-full rounded-[4px] border border-[var(--alice-border)]" />
            <figcaption className="mt-3 text-center text-xs text-[var(--alice-muted)]">{copy.caption}</figcaption>
          </figure>
        </div>
      </div>
      {showDownloadNotice && <DownloadNotice platform="android" copy={noticeCopy} href={ANDROID_APK_URL} verifyHref={ANDROID_RELEASE_URL} onCancel={() => setShowDownloadNotice(false)} />}
    </section>
  );
}
