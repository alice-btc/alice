'use client';

import { SvgIcon } from '@/components/SvgIcon';
import { EXTERNAL_ICON } from '@/lib/atelier-icons';

import { useEffect, useState } from 'react';
import type { LearnTutorialPack } from '@alice-wallet/alice-content/src/learn-types';
import { TUTORIAL_CATEGORY_LABEL_KEYS, catalogLabel } from '@/lib/learn/catalog';
import type { LearnLang } from '@/lib/learn/language';
import { openExternalUrl } from '@/lib/open-external';
import { fetchTutorialPack } from '@/lib/learn/packs';
import { LearnMarkdown } from './LearnMarkdown';
import { useLearnT } from './learn-locale';
import { WithBitcoinGlyph } from '@/components/AmountDisplay';

export function LearnTutorial({
  category,
  slug,
  lang,
}: {
  category: string;
  slug: string;
  lang: LearnLang;
}) {
  const [pack, setPack] = useState<LearnTutorialPack | null>(null);
  const [error, setError] = useState(false);
  const t = useLearnT(lang);

  useEffect(() => {
    let cancelled = false;
    setPack(null);
    setError(false);
    fetchTutorialPack(lang, category, slug)
      .then((p) => { if (!cancelled) setPack(p); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [lang, category, slug]);

  if (error) {
    return (
      <div style={{ width: 'min(100% - 32px, 760px)', margin: '0 auto', padding: '48px 0' }}>
        <p className="font-numbers" style={{ color: 'var(--alice-muted)' }}>
          {t('learn.tutorial.unavailable')}
        </p>
      </div>
    );
  }
  if (!pack) {
    return (
      <div style={{ width: 'min(100% - 32px, 760px)', margin: '0 auto', padding: '48px 0' }}>
        <p className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }} role="status">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div style={{ width: 'min(100% - 32px, 760px)', margin: '0 auto', padding: '24px 0 72px', color: 'var(--alice-text)' }}>
      <div className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
        {catalogLabel(t, TUTORIAL_CATEGORY_LABEL_KEYS, category).toUpperCase()}
      </div>
      <h1 className="font-pixel" style={{ fontSize: 14, lineHeight: '24px', margin: '12px 0 4px' }}>{pack.name}</h1>
      {pack.description && (
        <p className="font-numbers" style={{ margin: '10px 0 0', fontSize: 15, color: 'var(--alice-muted)' }}>{pack.description}</p>
      )}

      <LearnMarkdown markdown={pack.markdown} assetBase={pack.assetBase} videos={{}} lang={lang} />

      <p className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)', marginTop: 32 }}>
        {t('learn.contentBy')}
        <a href="https://planb.network" target="_blank" rel="noopener noreferrer" onClick={(e) => { e.preventDefault(); void openExternalUrl('https://planb.network'); }} style={{ color: 'var(--alice-muted)', textDecoration: 'underline' }}>
          <WithBitcoinGlyph text="Plan ₿ Network" /> <span style={{ display: 'inline-flex', verticalAlign: 'middle' }}><SvgIcon svg={EXTERNAL_ICON} size={16} /></span>
        </a>
        {' · CC BY-SA 4.0'}
      </p>
    </div>
  );
}
