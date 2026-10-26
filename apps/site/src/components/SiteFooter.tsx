import { APP_URL, CONTACT_EMAIL, NAV_LINKS, NOSTR_URL, REPORT_URL, X_URL } from '@/lib/site';
import { AliceMark, GitHubGlyph, MailIcon, NostrGlyph, XGlyph } from '@/components/icons';
import { externalLinkProps } from '@/lib/links';

// X is known by its mark alone, so it shows no text and is named for
// screen readers instead.
const CONTACT_LINKS = [
  { href: `mailto:${CONTACT_EMAIL}`, icon: <MailIcon size={16} />, text: CONTACT_EMAIL },
  { href: X_URL, icon: <XGlyph size={16} />, label: 'Alice on X' },
  { href: NOSTR_URL, icon: <NostrGlyph size={16} />, text: 'Nostr' },
  { href: REPORT_URL, icon: <GitHubGlyph size={16} />, text: 'Report an issue' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--alice-border)] px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <AliceMark size={20} />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[var(--alice-muted)] hover:text-[var(--alice-primary)]"
            >
              {link.label}
            </a>
          ))}
          <a href="/privacy/" className="text-[var(--alice-muted)] hover:text-[var(--alice-primary)]">
            Privacy
          </a>
          <a href="/memory/" className="text-[var(--alice-muted)] hover:text-[var(--alice-primary)]">
            Memory
          </a>
          <a href="/credits/" className="text-[var(--alice-muted)] hover:text-[var(--alice-primary)]">
            Credits
          </a>
          <a href={APP_URL} {...externalLinkProps(APP_URL)} className="text-[var(--alice-muted)] hover:text-[var(--alice-primary)]">
            Open web app
          </a>
        </nav>
      </div>
      <nav
        aria-label="Contact"
        className="mx-auto mt-6 flex max-w-6xl flex-col gap-3 text-sm sm:flex-row sm:items-center sm:gap-6"
      >
        {/* leading-none keeps the pixel font's tall line box from lifting
            the label above the links. */}
        <span className="font-pixel text-[12px] uppercase leading-none tracking-widest text-[var(--alice-muted)]">
          Contact
        </span>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {CONTACT_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              {...externalLinkProps(link.href)}
              aria-label={link.label}
              className="inline-flex items-center gap-2 text-[var(--alice-muted)] hover:text-[var(--alice-primary)]"
            >
              {link.icon}
              {link.text}
            </a>
          ))}
        </div>
      </nav>
      <div className="mx-auto mt-6 flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--alice-muted)]">
          Alice is educational software, not financial advice. Bitcoin involves risk;
          you are responsible for your own keys and funds.
        </p>
        <p className="shrink-0 font-pixel text-[12px] uppercase tracking-widest text-[var(--alice-muted)]">
          No tracking · No cookies
        </p>
      </div>
    </footer>
  );
}
