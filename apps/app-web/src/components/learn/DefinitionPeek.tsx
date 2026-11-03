'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import type { DictionaryDefinition, DictionarySource } from '@alice-wallet/alice-content/src/dictionary-types';
import { SvgIcon } from '@/components/SvgIcon';
import { CLOSE_ICON, NEXT_ICON } from '@/lib/atelier-icons';
import { dictionaryAttribution, fetchDefinition, fetchDictionaryIndex, type DictionaryLang } from '@/lib/learn/dictionary-packs';
import { definitionExcerpt } from '@/lib/learn/dictionary';
import type { Translator } from '@/i18n';

// A dictionary definition opened from a word of Alice's reply, over the
// conversation, in the reply's language: the start of the text, its author,
// licence and translation, and the way to the full page in Learn. A sheet
// from the bottom on a phone, a card on wider screens (globals.css,
// .alice-definition-peek).
export function DefinitionPeek({ slug, lang, onClose, t }: { slug: string; lang: DictionaryLang; onClose: () => void; t: Translator }) {
  const router = useRouter();
  const [definition, setDefinition] = useState<DictionaryDefinition | null>(null);
  const [source, setSource] = useState<DictionarySource | null>(null);
  const [failed, setFailed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchDefinition(slug, lang), fetchDictionaryIndex(lang)])
      .then(([loaded, index]) => {
        if (cancelled) return;
        setDefinition(loaded);
        setSource(index.source);
        setFailed(!loaded);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [slug, lang]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const openFull = () => {
    onClose();
    router.push(`/learn/?definition=${slug}`);
  };
  const excerpt = definition ? definitionExcerpt(definition.body, 420) : '';

  return createPortal(
    <div className="alice-definition-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={definition?.title ?? t('chat.definition.label')}
        className="alice-definition-peek font-numbers"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="m-0" style={{ fontSize: 18, lineHeight: '24px', fontWeight: 700 }}>{definition?.title ?? '…'}</p>
            {source && (
              <p className="m-0" style={{ fontSize: 13, lineHeight: '18px', color: 'var(--alice-muted)' }}>
                {source.title} · {dictionaryAttribution(source)}
              </p>
            )}
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={t('common.close')} title={t('common.close')} className="alice-control alice-control--tool">
            <SvgIcon svg={CLOSE_ICON} size={16} />
          </button>
        </div>
        {failed
          ? <p style={{ fontSize: 16, lineHeight: '24px', margin: '12px 0 4px', color: 'var(--alice-muted)' }}>{t('chat.definition.unavailable')}</p>
          : excerpt && <p style={{ fontSize: 16, lineHeight: '24px', margin: '12px 0 4px' }}>{excerpt}</p>}
        <button
          type="button"
          onClick={openFull}
          className="alice-control alice-control--quiet"
          style={{ gap: 8, padding: '8px 0', color: 'var(--alice-primary)' }}
        >
          {t('chat.definition.readFull')}
          <SvgIcon svg={NEXT_ICON} size={16} />
        </button>
      </div>
    </div>,
    document.body,
  );
}
