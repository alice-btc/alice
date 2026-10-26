'use client';

import { PlatformSelector, type PlatformGroup } from '@/components/AppCtas';
import { CommunityIcon, GitHubGlyph, MailIcon, NostrGlyph, XGlyph } from '@/components/icons';
import { CONTACT_EMAIL, NOSTR_URL, REPORT_URL, X_URL } from '@/lib/site';

const CONTACT_GROUPS: PlatformGroup[] = [
  {
    label: 'Contact',
    items: [
      { icon: <MailIcon size={18} />, label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
      { icon: <XGlyph size={18} />, label: '@askAliceBTC on X', href: X_URL },
      { icon: <NostrGlyph size={18} />, label: 'Alice on Nostr', href: NOSTR_URL },
    ],
  },
  {
    // Same destination and warning as the app's Report form.
    label: 'Report',
    note: 'GitHub issues are public. For anything private, use the email above.',
    items: [{ icon: <GitHubGlyph size={18} />, label: 'Report an issue on GitHub', href: REPORT_URL }],
  },
];

// Top-bar icon for reaching Alice: hovering it opens the list on a computer,
// a tap opens it on a phone, the same selector as the Download menu.
export function CommunityMenu() {
  return (
    <PlatformSelector
      className="cta px-2.5 py-[7px] text-sm"
      trigger={<CommunityIcon size={18} />}
      ariaLabel="Contact and social links"
      menuLabel="Contact"
      chevron={false}
      menuWidth={260}
      groups={CONTACT_GROUPS}
    />
  );
}
