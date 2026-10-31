'use client';

import { useAccount } from '@alice-wallet/alice-ai';
import { useT } from '@/i18n';
import { SectionHint, SectionLabel, sectionStyle } from './ui';

/**
 * What Alice sends, and where.
 *
 * There is no address field here on purpose. The account carries one already,
 * the one it signs in with, proved by a code and kept encrypted. Asking a
 * second time for the same thing was friction that bought nothing, and two
 * addresses that can drift apart is worse than one that cannot.
 *
 * There is no switch either, and that is a decision rather than an oversight.
 * It offered a choice between a handful of messages a year and none, which
 * almost nobody moves either way: the control's real function was to look
 * considerate while making sure the mail reached no one. Saying plainly what
 * gets sent is worth more than a toggle nobody touches. The preference still
 * exists server-side, because the day product mail goes out it has to carry a
 * way to stop it, and that link needs somewhere to write the refusal.
 */
export function RenewalReminders() {
  const t = useT();
  const account = useAccount();

  const reachable = account.account?.email_reachable ?? false;
  const masked = account.account?.email_masked ?? null;

  return (
    <section style={sectionStyle}>
      <SectionLabel>{t('settings.reminders.mail')}</SectionLabel>

      {reachable ? (
        <>
          <p className="font-numbers m-0 mt-1" style={{ fontSize: 15 }}>
            {masked}
          </p>
          <SectionHint>{t('settings.reminders.renewal')}</SectionHint>
          <SectionHint>{t('settings.reminders.product')}</SectionHint>
          <SectionHint>{t('settings.reminders.encrypted')}</SectionHint>
        </>
      ) : (
        <SectionHint>{t('settings.reminders.noAddress')}</SectionHint>
      )}
    </section>
  );
}
