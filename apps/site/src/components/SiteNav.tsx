import { NAV_LINKS } from '@/lib/site';
import { DownloadButton, OpenAliceButton } from '@/components/AppCtas';
import { MobileNavMenu } from '@/components/MobileNavMenu';
import { CommunityMenu } from '@/components/CommunityMenu';
import { AliceMark } from '@/components/icons';
import { LanguageLinks, otherLocales } from '@/components/LanguageSwitch';
import { LOCALE_NAMES, type Locale } from '@/i18n/config';
import { localePath, localizeHref, type SitePath } from '@/i18n/paths';
import { commonCopy } from '@/i18n/dictionaries/common';

// Sitewide top navigation. Keeps the primary CTA (open the app) always reachable.
export function SiteNav({ locale, path }: { locale: Locale; path: SitePath }) {
  const t = commonCopy[locale];
  const links = NAV_LINKS.map((link) => ({ label: t.nav.labels[link.id], href: localizeHref(locale, link.href) }));
  const languages = otherLocales(locale).map((other) => ({
    locale: other,
    label: LOCALE_NAMES[other],
    href: localePath(other, path),
  }));
  return (
    <header className="nav-seam sticky top-0 z-50 bg-[var(--alice-bg)]">
      <nav
        aria-label={t.nav.primaryAria}
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5"
      >
        {/* Relative, not the hardcoded production domain, so this is always
            correct: the preview's own home today, alicebtc.com once launched. */}
        <a href={localePath(locale, '/')} aria-label={t.nav.homeAria}>
          <AliceMark size={22} />
        </a>

        <div className="hidden items-center gap-7 text-sm md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[var(--alice-muted)] transition-colors hover:text-[var(--alice-primary)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {/* The same page in the other language, as a short code beside the
              CTAs; on phones it sits in the menu panel instead. */}
          <span className="hidden md:block">
            <LanguageLinks
              locale={locale}
              path={path}
              short
              className="px-1.5 font-pixel text-[11px] uppercase tracking-widest text-[var(--alice-muted)] transition-colors hover:text-[var(--alice-primary)]"
            />
          </span>
          {/* Desktop: open the companion, or reach every install. Phone:
              everything folds into the single Menu button, except the
              contact icon, which stays on every screen. */}
          <CommunityMenu copy={t} />
          <span className="hidden md:block">
            <DownloadButton size="sm" copy={t.ctas} noticeCopy={t.downloadNotice} />
          </span>
          <span className="hidden md:block">
            <OpenAliceButton size="sm" copy={t.ctas} />
          </span>
          <MobileNavMenu
            links={links}
            languages={languages}
            menuLabel={t.nav.menu}
            pagesAria={t.nav.pagesAria}
            ctas={t.ctas}
            noticeCopy={t.downloadNotice}
          />
        </div>
      </nav>
    </header>
  );
}
