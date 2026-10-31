'use client';

import { SvgIcon } from '@/components/SvgIcon';
import { BACK_ICON } from '@/lib/atelier-icons';
import { useT, type MessageKey } from '@/i18n';

// The privacy notice in the app language. The page around it stays a server
// component for its metadata, which the static export writes in English.

const sectionStyle: React.CSSProperties = {
  borderTop: '1px solid var(--alice-border)',
  paddingTop: 24,
  marginTop: 32,
};

const headingStyle: React.CSSProperties = { fontSize: 10, lineHeight: '20px' };
const bodyStyle: React.CSSProperties = { fontSize: 17, lineHeight: '26px' };
const listStyle: React.CSSProperties = { paddingLeft: 22, fontSize: 17, lineHeight: '26px' };

const DATA_ITEMS: MessageKey[] = [
  'privacy.data.email',
  'privacy.data.lookup',
  'privacy.data.encryptedEmail',
  'privacy.data.mail',
  'privacy.data.password',
  'privacy.data.installation',
  'privacy.data.ip',
  'privacy.data.ledger',
  'privacy.data.userId',
];

const RETENTION_ITEMS: MessageKey[] = [
  'privacy.retention.loginCodes',
  'privacy.retention.verifyCodes',
  'privacy.retention.buckets',
  'privacy.retention.sessions',
  'privacy.retention.quota',
  'privacy.retention.email',
  'privacy.retention.installation',
];

export function PrivacyNotice() {
  const t = useT();
  const section = (title: MessageKey, paragraphs: MessageKey[]) => (
    <section style={sectionStyle}>
      <h2 className="font-pixel" style={headingStyle}>{t(title)}</h2>
      {paragraphs.map(key => <p key={key} style={bodyStyle}>{t(key)}</p>)}
    </section>
  );
  const list = (title: MessageKey, items: MessageKey[]) => (
    <section style={sectionStyle}>
      <h2 className="font-pixel" style={headingStyle}>{t(title)}</h2>
      <ul style={listStyle}>{items.map(key => <li key={key}>{t(key)}</li>)}</ul>
    </section>
  );

  return (
    <main
      className="font-numbers"
      style={{
        width: 'min(100% - 32px, 760px)',
        margin: '0 auto',
        padding: '48px 0 72px',
        color: 'var(--alice-text)',
      }}
    >
      <a
        href="/"
        className="alice-control alice-control--quiet"
        style={{ textDecoration: 'none' }}
      >
        <SvgIcon svg={BACK_ICON} size={20} /> {t('privacy.back')}
      </a>

      <h1
        className="font-pixel"
        style={{
          margin: '40px 0 16px',
          color: 'var(--alice-primary)',
          fontSize: 18,
          lineHeight: '30px',
          letterSpacing: 0,
        }}
      >
        {t('privacy.title')}
      </h1>
      <p style={{ color: 'var(--alice-muted)', fontSize: 16, lineHeight: '24px' }}>
        {t('privacy.updated')}
      </p>

      {list('privacy.data.title', DATA_ITEMS)}
      {section('privacy.outside.title', ['privacy.outside.plaintext', 'privacy.outside.cloud'])}
      {section('privacy.storage.title', ['privacy.storage.encrypted', 'privacy.storage.limits', 'privacy.storage.outside'])}
      {section('privacy.external.title', ['privacy.external.explorer', 'privacy.external.usage', 'privacy.external.downloads', 'privacy.external.price'])}
      {list('privacy.retention.title', RETENTION_ITEMS)}
      {section('privacy.processors.title', ['privacy.processors.cloudflare', 'privacy.processors.resend', 'privacy.processors.venice', 'privacy.processors.quota'])}

      <section style={sectionStyle}>
        <h2 className="font-pixel" style={headingStyle}>{t('privacy.control.title')}</h2>
        <p style={bodyStyle}>{t('privacy.control.deletion')}</p>
        <p style={bodyStyle}>
          {t('privacy.control.contact')}{' '}
          <a href="mailto:contact@alicebtc.com" style={{ color: 'var(--alice-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            contact@alicebtc.com
          </a>.
        </p>
      </section>
    </main>
  );
}
