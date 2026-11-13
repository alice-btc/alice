'use client';

import { useState } from 'react';
import { useAccount } from '@alice-wallet/alice-ai';
import { useT } from '@/i18n';
import { accountErrorText } from '@/lib/account-errors';
import { SectionLabel, SectionHint, sectionStyle } from './ui';
import { PREVIEW_ACCOUNT_NAME } from './billing-preview';

export function AccountManagement({ preview = false }: { preview?: boolean }) {
  const t = useT();
  const account = useAccount();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signedIn = preview || (account.status === 'signed_in' && Boolean(account.account?.username));
  const run = async (action: () => Promise<void>) => {
    if (preview || busy) return;
    setBusy(true);
    setError(null);
    try { await action(); setConfirmDelete(false); }
    catch (cause) { setError(accountErrorText(cause, t('settings.account.actionFailed'), t.locale)); }
    finally { setBusy(false); }
  };
  return (
    <section style={sectionStyle}>
      <SectionLabel>{t('settings.account.aliceAccount')}</SectionLabel>
      <p className="font-numbers mt-3 break-all" style={{ fontSize: 16 }}>
        {preview ? PREVIEW_ACCOUNT_NAME : account.account?.username ?? account.account?.display_name ?? (account.status === 'signed_in' ? t('settings.account.signedIn') : t('settings.account.notSignedIn'))}
      </p>
      {account.account?.email_masked && !preview && <SectionHint>{account.account.email_masked}</SectionHint>}
      {signedIn ? <>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="alice-control alice-control--quiet font-numbers" disabled={busy || preview} onClick={() => account.requestSignIn('change-username')}>{t('account.changeUsername')}</button>
          <button type="button" className="alice-control alice-control--quiet font-numbers" disabled={busy || preview} onClick={() => void run(account.logout)}>{t('account.signOut')}</button>
          <button type="button" className="alice-control alice-control--danger font-numbers" disabled={busy || preview} onClick={() => setConfirmDelete(true)}>{t('account.delete.button')}</button>
        </div>
        {confirmDelete && <div className="mt-4" role="group" aria-label={t('account.delete.button')}>
          <p className="font-numbers">{t('account.delete.confirm')}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="alice-control alice-control--quiet font-numbers" disabled={busy} onClick={() => setConfirmDelete(false)}>{t('account.cancelCaps')}</button>
            <button type="button" className="alice-control alice-control--danger font-numbers" disabled={busy} onClick={() => void run(account.deleteAccount)}>{t('account.delete.confirmButton')}</button>
          </div>
        </div>}
      </> : <button type="button" className="alice-control alice-control--primary font-numbers" disabled={account.status === 'loading'} onClick={() => account.requestSignIn()}>{t('settings.account.access')}</button>}
      {error && <p role="alert" className="font-numbers mt-3" style={{ color: 'var(--alice-danger)' }}>{error}</p>}
    </section>
  );
}
