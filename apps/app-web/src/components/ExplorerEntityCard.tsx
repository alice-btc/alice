'use client';

import { SvgIcon } from '@/components/SvgIcon';
import { EXTERNAL_ICON } from '@/lib/atelier-icons';

// The entity card: "probably belongs to X". Shown when the address matches a
// sourced attribution. It never asserts certainty on its own: the wording, the
// confidence pill, the source link and the date are always present, so the user
// sees where the claim comes from and can judge it. This is privacy-audit
// context, not an accusation.

import type { EntityCategory, EntityConfidence, EntityLabel } from '@/lib/explorer/entities';
import { useT, type MessageKey } from '@/i18n';

const CONFIDENCE_LEAD: Record<EntityConfidence, MessageKey> = {
  certain: 'explorer.entity.lead.certain',
  strong: 'explorer.entity.lead.strong',
  possible: 'explorer.entity.lead.possible',
};

const CONFIDENCE_PILL: Record<EntityConfidence, MessageKey> = {
  certain: 'explorer.entity.confidence.certain',
  strong: 'explorer.entity.confidence.strong',
  possible: 'explorer.entity.confidence.possible',
};

const CATEGORY_LABEL: Record<EntityCategory, MessageKey> = {
  exchange: 'explorer.entity.category.exchange',
  payment: 'explorer.entity.category.payment',
  gambling: 'explorer.entity.category.gambling',
  scam: 'explorer.entity.category.scam',
  darknet: 'explorer.entity.category.darknet',
  mining: 'explorer.entity.category.mining',
  mixer: 'explorer.entity.category.mixer',
  p2p: 'explorer.entity.category.p2p',
  asp: 'explorer.entity.category.asp',
  sanctioned: 'explorer.entity.category.sanctioned',
  unknown: 'explorer.entity.category.unknown',
};

function Row({ label }: { label: EntityLabel }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-numbers" style={{ fontSize: 14, color: 'var(--alice-text)' }}>
          {t(CONFIDENCE_LEAD[label.confidence], { name: label.name })}
        </span>
        <span className="font-numbers" style={{ fontSize: 10, padding: '3px 6px', border: '1px solid var(--alice-muted)', borderRadius: 3, color: 'var(--alice-muted)' }}>
          {t(CATEGORY_LABEL[label.category])}
        </span>
        <span className="font-numbers" style={{ fontSize: 10, padding: '3px 6px', border: '1px solid var(--alice-muted)', borderRadius: 3, color: 'var(--alice-muted)' }}>
          {t(CONFIDENCE_PILL[label.confidence])}
        </span>
      </div>
      <span className="font-numbers" style={{ fontSize: 11, color: 'var(--alice-muted)' }}>
        {t('explorer.entity.source')}{' '}
        <a href={label.source} target="_blank" rel="noreferrer noopener" className="alice-control alice-control--quiet inline-flex" style={{ color: 'var(--alice-primary)' }}>
          {label.sourceLabel} <SvgIcon svg={EXTERNAL_ICON} size={16} />
        </a>
        {t('explorer.entity.verified', { date: label.date })}
      </span>
    </div>
  );
}

export function ExplorerEntityCard({ labels }: { labels: EntityLabel[] }) {
  const t = useT();
  if (labels.length === 0) return null;
  return (
    // Remote (Worker) labels can land after the page painted: fade in.
    <div
      className="flex flex-col gap-3 px-4 py-3 rh-fade-in"
      style={{ borderTop: '1px solid var(--alice-border)', borderLeft: '3px solid var(--alice-primary)', borderRadius: 3, backgroundColor: 'transparent' }}
    >
      <span className="font-pixel tracking-widest" style={{ fontSize: 10, color: 'var(--alice-muted)' }}>{t('explorer.entity.title')}</span>
      {labels.map((l, i) => <Row key={`${l.name}-${l.source}-${i}`} label={l} />)}
      <p className="font-numbers m-0" style={{ fontSize: 11, color: 'var(--alice-muted)', opacity: 0.7 }}>
        {t('explorer.entity.disclaimer')}
      </p>
    </div>
  );
}
