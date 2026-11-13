'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/i18n';
import { openExternalUrl } from '@/lib/open-external';
import { accountWebUrl, accountPurchasePresentation } from '@/lib/account-purchase';
import type { PurchasePresentation } from '@/lib/purchase-policy';
import { SectionLabel, SectionHint, sectionStyle } from './ui';
import { PlanCheckout } from './PlanCheckout';

export function AccountPurchase() {
  const t = useT();
  const [presentation, setPresentation] = useState<PurchasePresentation>('hidden');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let generation = 0;
    const refresh = () => {
      if (document.visibilityState === 'hidden') return;
      const currentGeneration = ++generation;
      // Recheck on foreground without replacing a button under the pointer.
      // The click handler also checks the current storefront before opening.
      void accountPurchasePresentation().then(value => { if (!cancelled && currentGeneration === generation) setPresentation(value); });
    };
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  if (presentation === 'hidden') return null;
  if (presentation === 'checkout') return <PlanCheckout />;
  const open = async () => {
    setBusy(true);
    setError(false);
    try {
      // Recheck StoreKit at the tap, not just when the page was opened.
      const current = await accountPurchasePresentation();
      setPresentation(current);
      if (current === 'link') await openExternalUrl(accountWebUrl());
    } catch { setError(true); }
    finally { setBusy(false); }
  };
  return <section style={sectionStyle}>
    <SectionLabel>Private Cloud</SectionLabel>
    {/* Without a link, the text names neither a purchase path nor a payment method. */}
    <SectionHint>{t(presentation === 'link' ? 'settings.account.webPlans' : 'settings.account.accountCredits')}</SectionHint>
    {presentation === 'link' && <>
      <SectionHint>{t('settings.account.sameAccount')}</SectionHint>
      <button type="button" className="alice-control alice-control--primary font-numbers mt-4" disabled={busy} onClick={() => void open()}>{t('settings.account.openWeb')}</button>
    </>}
    {error && <p role="alert" className="font-numbers mt-3" style={{ color: 'var(--alice-danger)' }}>{t('settings.account.openWebFailed')}</p>}
  </section>;
}
