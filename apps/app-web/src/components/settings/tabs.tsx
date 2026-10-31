'use client';

import type { MessageKey } from '@/i18n';
import { SETTINGS_ICON, PALETTE_ICON, MODEL_ICON, ACCOUNT_ICON, EXPLORE_ICON, DATA_ICON } from '@/lib/atelier-icons';
import { GeneralTab } from './GeneralTab';
import { AppearanceTab } from './AppearanceTab';
import { AiTab } from './AiTab';
import { AccountTab } from './AccountTab';
import { ExplorerTab } from './ExplorerTab';
import { DataTab } from './DataTab';

export interface SettingsTab {
  id: string;
  /** Rail label, a dictionary key. Kept to one word so the rail stays narrow. */
  labelKey: MessageKey;
  /** SVG source with a {{COLOR}} placeholder, as SvgIcon expects. */
  icon: string;
  /** Rail grouping. 'alice' is how Alice behaves and looks, 'data' is what
   *  lives on this device. The rail draws a rule between the two. */
  group: 'alice' | 'data';
  Component: () => React.ReactNode;
}

/**
 * The whole settings surface, in order. A new feature adds one entry here and
 * ships its own tab component; nothing else needs to change, and both the
 * dialog and the /settings route pick it up.
 */
export const SETTINGS_TABS: SettingsTab[] = [
  { id: 'general', labelKey: 'settings.tabs.general', icon: SETTINGS_ICON, group: 'alice', Component: GeneralTab },
  { id: 'appearance', labelKey: 'settings.tabs.appearance', icon: PALETTE_ICON, group: 'alice', Component: AppearanceTab },
  { id: 'ai', labelKey: 'settings.tabs.ai', icon: MODEL_ICON, group: 'alice', Component: AiTab },
  { id: 'account', labelKey: 'settings.tabs.account', icon: ACCOUNT_ICON, group: 'alice', Component: AccountTab },
  { id: 'explorer', labelKey: 'settings.tabs.explorer', icon: EXPLORE_ICON, group: 'data', Component: ExplorerTab },
  { id: 'data', labelKey: 'settings.tabs.data', icon: DATA_ICON, group: 'data', Component: DataTab },
];

export const DEFAULT_SETTINGS_TAB = SETTINGS_TABS[0].id;

export function resolveSettingsTab(id: string | null | undefined): string {
  return SETTINGS_TABS.some(tab => tab.id === id) ? (id as string) : DEFAULT_SETTINGS_TAB;
}
