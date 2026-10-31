import type { Metadata } from 'next';
import { SOURCE_URL } from '@/lib/site';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { externalLinkProps } from '@/lib/links';
import type { Locale } from '@/i18n/config';
import { pageMetadata } from '@/i18n/metadata';
import { creditsCopy } from '@/i18n/dictionaries/credits';

export function creditsMetadata(locale: Locale): Metadata {
  return pageMetadata(locale, '/credits/', creditsCopy[locale].meta);
}

// The SIL Open Font License asks that the copyright notice and the license
// travel with the font wherever it is redistributed. This site serves the
// font files themselves, so the notice belongs here, next to them, not only
// in the source repository.
const FONTS = [
  {
    name: 'Terminal Grotesque',
    home: 'https://velvetyne.fr/fonts/terminal-grotesque/',
    homeLabel: 'velvetyne.fr',
    license: '/licenses/OFL-TerminalGrotesque.txt',
  },
  {
    name: 'Press Start 2P',
    home: 'https://fonts.google.com/specimen/Press+Start+2P',
    homeLabel: 'fonts.google.com',
    license: '/licenses/OFL-PressStart2P.txt',
  },
] as const;

export function CreditsView({ locale }: { locale: Locale }) {
  const t = creditsCopy[locale];
  return (
    <>
      <SiteNav locale={locale} path="/credits/" />
      <main id="main" className="mx-auto max-w-3xl px-5 py-16">
        <p className="font-pixel text-[12px] uppercase tracking-widest text-[var(--alice-primary)]">
          {t.eyebrow}
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.12] sm:text-5xl">
          {t.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--alice-text)]">
          {t.intro}
        </p>

        <h2 className="mt-12 text-2xl font-semibold sm:text-3xl">{t.typefacesTitle}</h2>
        <dl className="mt-6 divide-y divide-[var(--alice-border)]">
          {FONTS.map((font) => (
            <div key={font.name} className="py-5">
              <dt className="text-lg font-semibold text-[var(--alice-heading)]">{font.name}</dt>
              <dd className="mt-2 leading-relaxed text-[var(--alice-text)]">
                {t.fonts[font.name].role} {t.designedBy} {t.fonts[font.name].designer}{t.releasedUnder}{' '}
                <a
                  href={font.license}
                  {...externalLinkProps(font.license)}
                  className="text-[var(--alice-primary)] hover:underline"
                >
                  SIL Open Font License 1.1
                </a>
                .{' '}
                <a
                  href={font.home}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--alice-primary)] hover:underline"
                >
                  {font.homeLabel} →
                </a>
              </dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-12 text-2xl font-semibold sm:text-3xl">{t.selfTitle}</h2>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">
          {t.selfBody}{' '}
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--alice-primary)] hover:underline"
          >
            {t.readCode}
          </a>
        </p>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">
          {t.trademark}
        </p>
      </main>
      <SiteFooter locale={locale} path="/credits/" />
    </>
  );
}
