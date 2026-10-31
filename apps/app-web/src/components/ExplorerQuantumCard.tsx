'use client';

// Quantum key-exposure card: whether this address's public key is already on
// chain. Shown only when the address holds funds (otherwise nothing is at risk).
// A hidden key is reassuring; an exposed key is a low-severity, forward-looking
// finding, never alarmist.

import type { QuantumExposure } from '@/lib/explorer/quantum';
import { useT, type MessageKey } from '@/i18n';

const WARN = 'var(--alice-warning)';

const TYPE_LABEL: Record<QuantumExposure['addressType'], MessageKey> = {
  p2pkh: 'explorer.quantum.type.p2pkh',
  p2sh: 'explorer.quantum.type.p2sh',
  p2wpkh: 'explorer.quantum.type.p2wpkh',
  p2tr: 'explorer.quantum.type.p2tr',
  unknown: 'explorer.quantum.type.unknown',
};

export function ExplorerQuantumCard({ exposure }: { exposure: QuantumExposure }) {
  const t = useT();
  if (exposure.balanceSats <= 0) return null;
  const accent = exposure.exposed ? WARN : 'var(--alice-primary)';
  const why = exposure.exposedBySpend
    ? t('explorer.quantum.why.spent')
    : exposure.taproot
      ? t('explorer.quantum.why.taproot')
      : t('explorer.quantum.why.hidden');
  return (
    <div
      className="flex flex-col gap-2 px-4 py-3"
      style={{ borderTop: '1px solid var(--alice-border)', borderLeft: `3px solid ${accent}`, borderRadius: 3, backgroundColor: 'transparent' }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{t('explorer.quantum.title')}</span>
        <span className="font-numbers" style={{ fontSize: 10, padding: '3px 6px', border: `1px solid ${accent}`, borderRadius: 3, color: accent }}>
          {exposure.exposed ? t('explorer.quantum.exposed') : t('explorer.quantum.hidden')}
        </span>
        <span className="font-numbers" style={{ fontSize: 10, padding: '3px 6px', border: '1px solid var(--alice-muted)', borderRadius: 3, color: 'var(--alice-muted)' }}>
          {t(TYPE_LABEL[exposure.addressType])}
        </span>
      </div>
      <p className="font-numbers m-0" style={{ fontSize: 13, lineHeight: '19px', color: 'var(--alice-muted)' }}>
        {t('explorer.quantum.lead', { why })}{' '}
        {exposure.exposed
          ? t('explorer.quantum.exposedBody')
          : t('explorer.quantum.hiddenBody')}
      </p>
    </div>
  );
}
