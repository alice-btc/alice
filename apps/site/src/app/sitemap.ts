import type { MetadataRoute } from 'next';
import { SITE_ROUTES, SITE_URL } from '@/lib/site';
import { LOCALES } from '@/i18n/config';
import { localePath, pageAlternates } from '@/i18n/paths';

// Required for `output: export`, emit a static sitemap.xml at build time.
export const dynamic = 'force-static';

// Emitted as a static sitemap.xml at build time (output: 'export'). Every
// route once per language, each entry naming its translations, so search
// engines pair /pricing/ with /fr/pricing/.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return LOCALES.flatMap((locale) =>
    SITE_ROUTES.map((route) => {
      const { languages } = pageAlternates(locale, route);
      return {
        url: `${SITE_URL}${localePath(locale, route)}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: route === '/' ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            Object.entries(languages).map(([lang, path]) => [lang, `${SITE_URL}${path}`]),
          ),
        },
      };
    }),
  );
}
