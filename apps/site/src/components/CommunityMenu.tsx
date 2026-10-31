'use client';

import { PlatformSelector, type PlatformGroup } from '@/components/AppCtas';
import { CommunityIcon, GitHubGlyph, MailIcon, NostrGlyph, XGlyph } from '@/components/icons';
import { CONTACT_EMAIL, NOSTR_URL, REPORT_URL, X_URL } from '@/lib/site';
import type { CommonCopy } from '@/i18n/dictionaries/common';

function contactGroups(copy: CommonCopy['community']): PlatformGroup[] {
  return [
    {
      label: copy.contactGroup,
      items: [
        { icon: <MailIcon size={18} />, label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
        { icon: <XGlyph size={18} />, label: copy.xLabel, href: X_URL },
        { icon: <NostrGlyph size={18} />, label: copy.nostrLabel, href: NOSTR_URL },
      ],
    },
    {
      // Same destination and warning as the app's Report form.
      label: copy.reportGroup,
      note: copy.reportNote,
      items: [{ icon: <GitHubGlyph size={18} />, label: copy.reportLabel, href: REPORT_URL }],
    },
  ];
}

// Top-bar icon for reaching Alice: hovering it opens the list on a computer,
// a tap opens it on a phone, the same selector as the Download menu.
export function CommunityMenu({ copy }: { copy: CommonCopy }) {
  return (
    <PlatformSelector
      className="cta px-2.5 py-[7px] text-sm"
      trigger={<CommunityIcon size={18} />}
      ariaLabel={copy.community.aria}
      menuLabel={copy.community.menuLabel}
      chevron={false}
      menuWidth={260}
      groups={contactGroups(copy.community)}
      copy={copy.ctas}
      noticeCopy={copy.downloadNotice}
    />
  );
}
