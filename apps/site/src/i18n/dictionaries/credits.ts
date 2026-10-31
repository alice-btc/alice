import type { Locale } from '@/i18n/config';

// The credits page. Font names, designers and the license title stay as
// published; only the sentences around them are translated.

export type CreditsCopy = {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  intro: string;
  typefacesTitle: string;
  /** Keyed by font name, see FONTS in the credits view. */
  fonts: Record<'Terminal Grotesque' | 'Press Start 2P', { role: string; designer: string }>;
  designedBy: string;
  releasedUnder: string;
  selfTitle: string;
  selfBody: string;
  readCode: string;
  trademark: string;
};

const en: CreditsCopy = {
  meta: {
    title: 'Credits and licenses',
    description:
      'The typefaces Alice uses, who made them, and under which license. Alice itself is AGPL-3.0-or-later.',
  },
  eyebrow: 'Credits',
  title: 'Built on other people’s work.',
  intro:
    'Alice’s look comes from two libre typefaces, released by their designers under a license that lets anyone use them. Naming them is the least we can do, and the license asks for it. Reading text and forms use your device’s system font, which is not redistributed by this site.',
  typefacesTitle: 'Typefaces',
  fonts: {
    'Terminal Grotesque': {
      role: 'Display headings on this website.',
      designer: 'Raphaël Bastide, with the contribution of Jérémy Landes',
    },
    'Press Start 2P': { role: 'Wordmark and short pixel labels.', designer: 'CodeMan38' },
  },
  designedBy: 'Designed by',
  releasedUnder: ', and released under the',
  selfTitle: 'Alice itself',
  selfBody:
    'Alice’s own source is released under the GNU Affero General Public License, version 3 or later. You can read all of it, run it, change it and share it.',
  readCode: 'Read the code →',
  trademark:
    'The Alice name, logo and visual identity are not covered by that license. A fork is free to exist, it simply needs its own name.',
};

const fr: CreditsCopy = {
  meta: {
    title: 'Crédits et licences',
    description:
      'Les polices de caractères qu’utilise Alice, qui les a créées, et sous quelle licence. Alice elle-même est sous licence AGPL-3.0-or-later.',
  },
  eyebrow: 'Crédits',
  title: 'Construit sur le travail des autres.',
  intro:
    'L’allure d’Alice vient de 2 polices libres, publiées par leurs créateurs sous une licence qui permet à chacun de les utiliser. Les nommer est la moindre des choses, et la licence le demande. Les textes de lecture et les formulaires utilisent la police système de votre appareil, que ce site ne redistribue pas.',
  typefacesTitle: 'Polices de caractères',
  fonts: {
    'Terminal Grotesque': {
      role: 'Les titres de ce site.',
      designer: 'Raphaël Bastide, avec la contribution de Jérémy Landes',
    },
    'Press Start 2P': { role: 'Le logotype et les courts libellés en pixels.', designer: 'CodeMan38' },
  },
  designedBy: 'Dessinée par',
  releasedUnder: ' et publiée sous la',
  selfTitle: 'Alice elle-même',
  selfBody:
    'Le code source d’Alice est publié sous la GNU Affero General Public License, version 3 ou ultérieure. Vous pouvez tout lire, l’exécuter, le modifier et le partager.',
  readCode: 'Lire le code →',
  trademark:
    'Le nom, le logo et l’identité visuelle d’Alice ne sont pas couverts par cette licence. Un fork est libre d’exister : il lui faut simplement son propre nom.',
};

export const creditsCopy: Record<Locale, CreditsCopy> = { en, fr };
