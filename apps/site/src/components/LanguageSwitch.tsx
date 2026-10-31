import { LOCALES, LOCALE_NAMES, type Locale } from '@/i18n/config';
import { localePath, type SitePath } from '@/i18n/paths';

// Links to the same page in every other language. Each link is marked with
// the language it leads to (hreflang) and the language its own name is
// written in (lang), so a screen reader says "Français" in French.

export function otherLocales(locale: Locale): Locale[] {
  return LOCALES.filter((each) => each !== locale);
}

export function LanguageLinks({
  locale,
  path,
  className,
  short = false,
}: {
  locale: Locale;
  path: SitePath;
  className: string;
  /** Show the code (FR) instead of the name; the name stays the accessible label. */
  short?: boolean;
}) {
  return (
    <>
      {otherLocales(locale).map((other) => (
        <a
          key={other}
          href={localePath(other, path)}
          hrefLang={other}
          lang={other}
          aria-label={short ? LOCALE_NAMES[other] : undefined}
          className={className}
        >
          {short ? other.toUpperCase() : LOCALE_NAMES[other]}
        </a>
      ))}
    </>
  );
}
