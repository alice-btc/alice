'use client';

import { useEffect, useState } from 'react';
import { PALETTES, ALL_PALETTE_IDS } from '@alice-wallet/alice-content';
import { SvgIcon } from '@/components/SvgIcon';
import { CHECK_ICON } from '@/lib/atelier-icons';
import { applyWebTheme, readAppearance } from '@/lib/theme-init';
import { useT } from '@/i18n';

export function AppearanceTab() {
  const t = useT();
  const [appearance, setAppearance] = useState(readAppearance);
  useEffect(() => {
    applyWebTheme(appearance.mode, appearance.palette);
  }, [appearance]);
  return (
    <div className="flex flex-col gap-7 font-numbers">
      <fieldset className="border-0 border-b m-0 p-0 pb-6" style={{ borderBottom: '1px solid var(--alice-border)' }}>
        <legend className="font-pixel text-[10px] mb-4">{t('settings.appearance.theme')}</legend>
        <div className="flex flex-wrap gap-2">
          {(['light', 'dark'] as const).map(mode => (
            <button className="alice-control alice-control--choice font-numbers" key={mode} aria-pressed={appearance.mode === mode} onClick={() => setAppearance(a => ({ ...a, mode }))}>
              {mode === 'light' ? t('settings.appearance.light') : t('settings.appearance.dark')}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="border-0 border-b m-0 p-0 pb-6" style={{ borderBottom: '1px solid var(--alice-border)' }}>
        <legend className="font-pixel text-[10px] mb-4">{t('settings.appearance.palette')}</legend>
        <div className="grid grid-cols-2 gap-2">
          {ALL_PALETTE_IDS.map(palette => (
            <button className="alice-control alice-control--choice font-numbers" key={palette} aria-pressed={appearance.palette === palette} onClick={() => setAppearance(a => ({ ...a, palette }))}>
              <span aria-hidden="true" style={{ width: 12, height: 12, flexShrink: 0, background: PALETTES[palette][appearance.mode].primary }} />
              {PALETTES[palette].label}
              {appearance.palette === palette && <SvgIcon svg={CHECK_ICON} size={16} color="currentColor" />}
            </button>
          ))}
        </div>
        <p className="text-sm mt-3" style={{ color: 'var(--alice-muted)' }}>{t('settings.appearance.paletteHint')}</p>
      </fieldset>
    </div>
  );
}
