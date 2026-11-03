import type { Locale } from '@/i18n/config';

export type AboutCopy = {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  intro: string;
  whoTitle: string;
  who: string;
  whoLinks: { offchain: string; x: string };
  whyTitle: string;
  why: string[];
  contactTitle: string;
  contactLead: string;
  contactLinks: { x: string; nostr: string; source: string };
};

const en: AboutCopy = {
  meta: {
    title: 'About Alice',
    description: 'Who builds Alice, the private AI companion for Bitcoin, why it exists, and how to reach the project for partnerships or press.',
  },
  eyebrow: 'About',
  title: 'Who is behind Alice',
  intro: 'Alice is a private AI companion for Bitcoin, paid for by its plans, not by your data.',
  whoTitle: 'Who builds it',
  who: 'Alice is built by Marius Farashi, an independent Bitcoin journalist and the founder of Offchain Media. He covers Bitcoin, the Lightning Network, privacy and digital sovereignty, and organises Bitcoin meetups.',
  whoLinks: { offchain: 'Offchain Media', x: 'Marius on X' },
  whyTitle: 'Why Alice exists',
  why: [
    'Your questions about Bitcoin say a lot about you: what you hold, where you keep it, what worries you. Many AI assistants keep those questions.',
    'Alice answers on your device, or in Private Cloud, where everything is end-to-end encrypted to confidential hardware. It is open source and has no tracking. It is not a wallet with a chatbot bolted on.',
  ],
  contactTitle: 'Contact',
  contactLead: 'Partnerships, press and questions go to the address below. Bugs and suggestions go to the public repository.',
  contactLinks: { x: 'Alice on X', nostr: 'Alice on Nostr', source: 'Source code and issues' },
};

const fr: AboutCopy = {
  meta: {
    title: 'À propos d’Alice',
    description: 'Qui développe Alice, le compagnon IA privé pour Bitcoin, pourquoi le projet existe, et comment le contacter pour un partenariat ou la presse.',
  },
  // Pixel-font labels carry no accents: the face has no accented capitals.
  eyebrow: 'A propos',
  title: 'Qui porte Alice',
  intro: 'Alice est un compagnon IA privé pour Bitcoin, financé par ses forfaits, pas par vos données.',
  whoTitle: 'Qui la développe',
  who: 'Alice est portée par Marius Farashi, journaliste Bitcoin indépendant et fondateur d’Offchain Media. Il couvre Bitcoin, le Lightning Network, la vie privée et la souveraineté numérique, et organise des meetups Bitcoin.',
  whoLinks: { offchain: 'Offchain Media', x: 'Marius sur X' },
  whyTitle: 'Pourquoi Alice existe',
  why: [
    'Vos questions sur Bitcoin en disent beaucoup sur vous : ce que vous détenez, où vous le gardez, ce qui vous inquiète. Beaucoup d’assistants IA conservent ces questions.',
    'Alice répond sur votre appareil, ou dans Private Cloud, où tout est chiffré de bout en bout jusqu’à un matériel confidentiel. Elle est open source et sans pistage. Ce n’est pas un portefeuille avec un chatbot greffé dessus.',
  ],
  contactTitle: 'Contact',
  contactLead: 'Partenariats, presse et questions : écrivez à l’adresse ci-dessous. Les bugs et les suggestions vont sur le dépôt public.',
  contactLinks: { x: 'Alice sur X', nostr: 'Alice sur Nostr', source: 'Code source et signalements' },
};

export const aboutCopy: Record<Locale, AboutCopy> = { en, fr };
