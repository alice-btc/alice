'use client';

import { useEffect, useState } from 'react';
import type { BalanceFormat } from '@alice-wallet/alice-ui/balance-format';
import {
  currentAppVersion,
  getAppLanguage,
  getResponseLanguagePreference,
  setResponseLanguagePreference,
  SUPPORTED_LANGUAGES,
  type ResponseLanguagePreference,
  type SupportedLanguage,
  useChat,
} from '@alice-wallet/alice-ai';
import { openWhatsNew } from '@/lib/update-notices';
import { followAppLanguage } from '@/lib/learn/language';
import { useLocale, useT, type MessageKey } from '@/i18n';
import { BitcoinGlyph, setAmountFormat, useAmountState } from '@/components/AmountDisplay';
import { ChoiceButton, SectionHint, SectionLabel, sectionStyle } from './ui';

// The same unit preference as the wallet's balance (alice_balance_format):
// changing it here changes every amount in Explorer and the wallet alike.
// The symbol is the wallet's glyph: the interface fonts have no U+20BF.
const UNIT_OPTIONS: { value: BalanceFormat; label: React.ReactNode }[] = [
  { value: 'symbol', label: <><span className="sr-only">₿</span><BitcoinGlyph spaced={false} /></> },
  { value: 'sats', label: 'sats' },
  { value: 'btc', label: 'BTC' },
  { value: 'usd', label: '$' },
];

const APP_LANGUAGE_OPTIONS: [SupportedLanguage, string][] = SUPPORTED_LANGUAGES.map(
  language => [language.code, language.nativeName.toUpperCase()],
);

// Labels as keys, except the languages, which keep their own names.
const RESPONSE_LANGUAGE_OPTIONS: [ResponseLanguagePreference, { key: MessageKey } | { name: string }][] = [
  ['app', { key: 'settings.general.responseSameAsApp' }],
  ['auto', { key: 'settings.general.responseAuto' }],
  ...APP_LANGUAGE_OPTIONS.map(([value, name]): [ResponseLanguagePreference, { name: string }] => [value, { name }]),
];

export function GeneralTab() {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const chat = useChat();
  const amount = useAmountState();
  const [appLanguage, setAppLanguageState] = useState<SupportedLanguage | null>(null);
  const [responseLanguage, setResponseLanguageState] = useState<ResponseLanguagePreference>('app');

  useEffect(() => {
    getAppLanguage()
      .then(setAppLanguageState)
      .catch(() => { /* keep nothing selected */ });
    getResponseLanguagePreference()
      .then(setResponseLanguageState)
      .catch(() => { /* keep the default */ });
  }, []);

  // A change made elsewhere shows here too.
  useEffect(() => { setAppLanguageState(current => current === null ? current : locale); }, [locale]);

  return (
    <>
      <div style={sectionStyle}>
        <SectionLabel>{t('settings.general.language')}</SectionLabel>
        <SectionHint>{t('settings.general.languageHint')}</SectionHint>
        <div className="flex gap-2 flex-wrap" role="group" aria-label={t('settings.general.languageAria')}>
          {APP_LANGUAGE_OPTIONS.map(([value, label]) => (
            <ChoiceButton
              key={value}
              active={appLanguage === value}
              label={label}
              onClick={async () => {
                setAppLanguageState(value);
                // The provider re-renders the whole interface in it.
                await setLocale(value);
                followAppLanguage(value);
              }}
            />
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <SectionLabel>{t('settings.general.responseLanguage')}</SectionLabel>
        <SectionHint>{t('settings.general.responseLanguageHint')}</SectionHint>
        <div className="flex gap-2 flex-wrap" role="group" aria-label={t('settings.general.responseLanguageAria')}>
          {RESPONSE_LANGUAGE_OPTIONS.map(([value, label]) => (
            <ChoiceButton
              key={value}
              active={responseLanguage === value}
              label={'key' in label ? t(label.key) : label.name}
              onClick={async () => {
                setResponseLanguageState(value);
                await setResponseLanguagePreference(value);
                chat.clearMessages();
              }}
            />
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <SectionLabel>{t('settings.general.balanceUnit')}</SectionLabel>
        <SectionHint>{t('settings.general.balanceUnitHint')}</SectionHint>
        <div className="flex gap-2">
          {UNIT_OPTIONS.map((opt) => (
            <ChoiceButton
              key={opt.value}
              active={amount.format === opt.value}
              label={opt.label}
              pixel={false}
              onClick={() => setAmountFormat(opt.value)}
            />
          ))}
        </div>
      </div>
      <div style={sectionStyle}>
        <SectionLabel>{t('settings.general.about')}</SectionLabel>
        <SectionHint>{t('settings.general.version', { version: currentAppVersion() ?? t('settings.general.versionUnknown') })}</SectionHint>
        <button type="button" onClick={openWhatsNew} className="alice-control alice-control--quiet">{t('settings.general.whatsNew')}</button>
      </div>
    </>
  );
}
