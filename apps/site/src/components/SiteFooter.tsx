import { APP_URL, CONTACT_EMAIL, NAV_LINKS, NOSTR_URL, REPORT_URL, X_URL } from '@/lib/site';
import { AliceMark, GitHubGlyph, MailIcon, NostrGlyph, XGlyph } from '@/components/icons';
import { externalLinkProps } from '@/lib/links';
import { LanguageLinks, otherLocales } from '@/components/LanguageSwitch';
import type { Locale } from '@/i18n/config';
import { localizeHref, type SitePath } from '@/i18n/paths';
import { commonCopy } from '@/i18n/dictionaries/common';

const linkClass = 'text-[var(--alice-muted)] hover:text-[var(--alice-primary)]';

export function SiteFooter({ locale, path }: { locale: Locale; path: SitePath }) {
  const t = commonCopy[locale];
  // X is known by its mark alone, so it shows no text and is named for
  // screen readers instead.
  const contactLinks = [
    { href: `mailto:${CONTACT_EMAIL}`, icon: <MailIcon size={16} />, text: CONTACT_EMAIL },
    { href: X_URL, icon: <XGlyph size={16} />, label: t.footer.xAria },
    { href: NOSTR_URL, icon: <NostrGlyph size={16} />, text: t.footer.nostr },
    { href: REPORT_URL, icon: <GitHubGlyph size={16} />, text: t.footer.report },
  ];
  return (
    <footer className="border-t border-[var(--alice-border)] px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <AliceMark size={20} />
        <nav aria-label={t.footer.aria} className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={localizeHref(locale, link.href)} className={linkClass}>
              {t.nav.labels[link.id]}
            </a>
          ))}
          <a href={localizeHref(locale, '/privacy/')} className={linkClass}>
            {t.footer.privacy}
          </a>
          <a href={localizeHref(locale, '/memory/')} className={linkClass}>
            {t.footer.memory}
          </a>
          <a href={localizeHref(locale, '/credits/')} className={linkClass}>
            {t.footer.credits}
          </a>
          <a href={APP_URL} {...externalLinkProps(APP_URL)} className={linkClass}>
            {t.ctas.openWebApp}
          </a>
        </nav>
      </div>
      <nav
        aria-label={t.footer.contact}
        className="mx-auto mt-6 flex max-w-6xl flex-col gap-3 text-sm sm:flex-row sm:items-center sm:gap-6"
      >
        {/* leading-none keeps the pixel font's tall line box from lifting
            the label above the links. */}
        <span className="font-pixel text-[12px] uppercase leading-none tracking-widest text-[var(--alice-muted)]">
          {t.footer.contact}
        </span>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {contactLinks.map((link) => (
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
        <p className="text-xs text-[var(--alice-muted)]">{t.footer.disclaimer}</p>
        <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2">
          {otherLocales(locale).length > 0 && (
            <nav aria-label={t.language.switchAria} className="text-sm">
              <LanguageLinks locale={locale} path={path} className={linkClass} />
            </nav>
          )}
          <p className="shrink-0 font-pixel text-[12px] uppercase tracking-widest text-[var(--alice-muted)]">
            {t.footer.badge}
          </p>
        </div>
      </div>
    </footer>
  );
}
