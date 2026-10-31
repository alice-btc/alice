import type { Locale } from '@/i18n/config';
import { OG_ALT, SITE_TAGLINE } from '@/lib/site';

// Words shared by every page: the document shell, the navigation, the
// footer, the download menu and its warnings, the docked "ask" bar, and the
// language switch.

export type NavId = 'how' | 'trust' | 'pricing' | 'vs';

export type DownloadNoticeCopy = {
  title: string;
  /** Verbatim, so the visitor recognises the screen when it appears. */
  screen: string;
  why: string;
  steps: string[];
};

export type CommonCopy = {
  meta: {
    defaultTitle: string;
    tagline: string;
    keywords: string[];
    /** Describes app/opengraph-image.png, whose slogan is in English. */
    ogAlt: string;
  };
  skipLink: string;
  nav: {
    labels: Record<NavId, string>;
    primaryAria: string;
    homeAria: string;
    menu: string;
    pagesAria: string;
  };
  footer: {
    aria: string;
    privacy: string;
    memory: string;
    credits: string;
    disclaimer: string;
    badge: string;
    contact: string;
    /** X is known by its mark alone: the link shows no text and is named for screen readers. */
    xAria: string;
    nostr: string;
    report: string;
  };
  /** The contact icon in the top bar and its menu. */
  community: {
    aria: string;
    menuLabel: string;
    contactGroup: string;
    xLabel: string;
    nostrLabel: string;
    reportGroup: string;
    reportNote: string;
    reportLabel: string;
  };
  ctas: {
    openWebApp: string;
    download: string;
    releaseLinks: string;
    downloadsAria: string;
    comingSoon: string;
    appGroup: string;
    webApp: string;
    mac: string;
    windows: string;
    linuxAppImage: string;
    linuxDebian: string;
    ios: string;
    android: string;
    release: string;
  };
  downloadNotice: {
    eyebrowBefore: string;
    eyebrowWhile: string;
    started: string;
    verifyBefore: string;
    verifyLink: string;
    verifyAfter: string;
    cancel: string;
    downloadAnyway: string;
    downloadAgain: string;
    close: string;
    closeAria: string;
    android: DownloadNoticeCopy;
    windows: DownloadNoticeCopy;
  };
  ask: {
    label: string;
    examples: string[];
    inputAria: string;
    submitAria: string;
    opening: string;
    submit: string;
  };
  language: {
    /** Accessible name of the footer's language list. */
    switchAria: string;
    /**
     * One line offered on the English home to a browser set to this
     * language, linking to this language's home. Never shown for English.
     */
    notice: string;
    noticeClose: string;
  };
};

const en: CommonCopy = {
  meta: {
    defaultTitle: 'Alice: a private AI companion for Bitcoin',
    tagline: SITE_TAGLINE,
    keywords: [
      'private AI',
      'Bitcoin companion',
      'self-custody',
      'privacy',
      'Arkade',
      'end-to-end encrypted AI',
    ],
    ogAlt: OG_ALT,
  },
  skipLink: 'Skip to content',
  nav: {
    labels: {
      how: 'How it works',
      trust: 'Trust',
      pricing: 'Pricing',
      vs: 'vs ChatGPT',
    },
    primaryAria: 'Primary',
    homeAria: 'Alice home',
    menu: 'Menu',
    pagesAria: 'Pages',
  },
  footer: {
    aria: 'Footer',
    privacy: 'Privacy',
    memory: 'Memory',
    credits: 'Credits',
    disclaimer:
      'Alice is educational software, not financial advice. Bitcoin involves risk; you are responsible for your own keys and funds.',
    badge: 'No tracking · No cookies',
    contact: 'Contact',
    xAria: 'Alice on X',
    nostr: 'Nostr',
    report: 'Report an issue',
  },
  community: {
    aria: 'Contact and social links',
    menuLabel: 'Contact',
    contactGroup: 'Contact',
    xLabel: '@askAliceBTC on X',
    nostrLabel: 'Alice on Nostr',
    reportGroup: 'Report',
    reportNote: 'GitHub issues are public. For anything private, use the email above.',
    reportLabel: 'Report an issue on GitHub',
  },
  ctas: {
    openWebApp: 'Open web app',
    download: 'Download',
    releaseLinks: 'Release notes & checksum →',
    downloadsAria: 'Downloads',
    comingSoon: 'Coming soon',
    appGroup: 'Alice App',
    webApp: 'Web app',
    mac: 'Mac',
    windows: 'Windows',
    linuxAppImage: 'Linux AppImage',
    linuxDebian: 'Linux Debian',
    ios: 'iOS',
    android: 'Android',
    release: 'Release & checksum',
  },
  downloadNotice: {
    eyebrowBefore: 'Before you download',
    eyebrowWhile: 'While it downloads',
    started:
      'Your download has started. These steps stay on screen until you close them, because you will need them when the warning appears.',
    verifyBefore:
      'Alice is open source, and every release publishes the checksum of each file. You can verify that what you downloaded is exactly what we published: ',
    verifyLink: 'release notes and checksums',
    verifyAfter: '.',
    cancel: 'Cancel',
    downloadAnyway: 'Download anyway',
    downloadAgain: 'Download again',
    close: 'Close',
    closeAria: 'Close',
    android: {
      title: 'Android will warn you before installing',
      screen: '“For your security, your phone is not allowed to install unknown apps from this source.”',
      why: 'Alice is not on the Play Store yet, so you are installing the file directly. Android asks for permission the first time any app does that.',
      steps: [
        'Open the downloaded file.',
        'When Android asks, allow installs from your browser or file manager.',
        'Come back to the file and install.',
      ],
    },
    windows: {
      title: 'Windows will show a blue warning',
      screen: '“Windows protected your PC”, with only a “Don’t run” button in sight.',
      why: 'The installer is not signed with a paid certificate. That certificate proves who published the file, and nothing about what the file does, so its absence is not a verdict on Alice. We have not bought one yet.',
      steps: ['Click “More info”, the small grey link.', 'Then click “Run anyway”.'],
    },
  },
  ask: {
    label: 'Ask Alice',
    examples: [
      'What is self-custody?',
      'Is my AI chat private?',
      'How do I secure my Bitcoin?',
      'What is the Ark protocol?',
    ],
    inputAria: 'Ask Alice a question',
    submitAria: 'Ask Alice',
    opening: 'Opening Alice',
    submit: 'Ask',
  },
  language: {
    switchAria: 'Language',
    notice: 'This site is available in English',
    noticeClose: 'Close',
  },
};

const fr: CommonCopy = {
  meta: {
    defaultTitle: 'Alice : un compagnon IA privé pour Bitcoin',
    tagline: 'Un compagnon IA privé qui vous aide à comprendre, détenir et utiliser Bitcoin.',
    keywords: [
      'IA privée',
      'compagnon Bitcoin',
      'auto-conservation',
      'confidentialité',
      'Arkade',
      'IA chiffrée de bout en bout',
    ],
    ogAlt: 'Carte de présentation d’Alice, avec son slogan en anglais : « Your Bitcoin questions are nobody’s business. »',
  },
  skipLink: 'Aller au contenu',
  nav: {
    labels: {
      how: 'Fonctionnement',
      trust: 'Confiance',
      pricing: 'Tarifs',
      vs: 'Face à ChatGPT',
    },
    primaryAria: 'Navigation principale',
    homeAria: 'Accueil d’Alice',
    menu: 'Menu',
    pagesAria: 'Pages',
  },
  footer: {
    aria: 'Pied de page',
    privacy: 'Confidentialité',
    memory: 'Mémoire',
    credits: 'Crédits',
    disclaimer:
      'Alice est un logiciel éducatif, pas un conseil financier. Bitcoin comporte des risques ; vous êtes responsable de vos propres clés et de vos fonds.',
    badge: 'Ni pistage, ni cookie',
    contact: 'Contact',
    xAria: 'Alice sur X',
    nostr: 'Nostr',
    report: 'Signaler un problème',
  },
  community: {
    aria: 'Contact et réseaux',
    menuLabel: 'Contact',
    contactGroup: 'Contact',
    xLabel: '@askAliceBTC sur X',
    nostrLabel: 'Alice sur Nostr',
    reportGroup: 'Signaler',
    reportNote: 'Les tickets GitHub sont publics. Pour tout ce qui est privé, utilisez l’e-mail ci-dessus.',
    reportLabel: 'Signaler un problème sur GitHub',
  },
  ctas: {
    openWebApp: 'Ouvrir l’app web',
    download: 'Télécharger',
    releaseLinks: 'Notes de version et somme de contrôle →',
    downloadsAria: 'Téléchargements',
    comingSoon: 'Bientôt',
    appGroup: 'Alice App',
    webApp: 'App web',
    mac: 'Mac',
    windows: 'Windows',
    linuxAppImage: 'Linux AppImage',
    linuxDebian: 'Linux Debian',
    ios: 'iOS',
    android: 'Android',
    release: 'Version et somme de contrôle',
  },
  downloadNotice: {
    eyebrowBefore: 'Avant de télécharger',
    eyebrowWhile: 'Pendant le téléchargement',
    started:
      'Le téléchargement a commencé. Ces étapes restent à l’écran jusqu’à ce que vous les fermiez, car vous en aurez besoin quand l’avertissement apparaîtra.',
    verifyBefore:
      'Alice est open source, et chaque version publie la somme de contrôle de chaque fichier. Vous pouvez vérifier que ce que vous avez téléchargé est exactement ce que nous avons publié : ',
    verifyLink: 'notes de version et sommes de contrôle',
    verifyAfter: '.',
    cancel: 'Annuler',
    downloadAnyway: 'Télécharger quand même',
    downloadAgain: 'Télécharger à nouveau',
    close: 'Fermer',
    closeAria: 'Fermer',
    android: {
      title: 'Android vous avertira avant l’installation',
      screen: '« Pour votre sécurité, votre téléphone n’est pas autorisé à installer des applications inconnues provenant de cette source. »',
      why: 'Alice n’est pas encore sur le Play Store : vous installez donc le fichier directement. Android demande une autorisation la première fois qu’une application le fait.',
      steps: [
        'Ouvrez le fichier téléchargé.',
        'Quand Android le demande, autorisez les installations depuis votre navigateur ou votre gestionnaire de fichiers.',
        'Revenez au fichier et lancez l’installation.',
      ],
    },
    windows: {
      title: 'Windows affichera un avertissement bleu',
      screen: '« Windows a protégé votre ordinateur », avec un seul bouton en vue, « Ne pas exécuter ».',
      why: 'Le programme d’installation n’est pas signé avec un certificat payant. Ce certificat prouve qui a publié le fichier, et rien de ce que fait le fichier : son absence n’est donc pas un verdict sur Alice. Nous n’en avons pas encore acheté.',
      steps: [
        'Cliquez sur « Informations complémentaires », le petit lien gris.',
        'Puis cliquez sur « Exécuter quand même ».',
      ],
    },
  },
  ask: {
    label: 'Demander à Alice',
    examples: [
      'Qu’est-ce que l’auto-conservation ?',
      'Mes conversations avec l’IA sont-elles privées ?',
      'Comment sécuriser mes bitcoins ?',
      'Qu’est-ce que le protocole Ark ?',
    ],
    inputAria: 'Poser une question à Alice',
    submitAria: 'Demander à Alice',
    opening: 'Ouverture d’Alice',
    submit: 'Demander',
  },
  language: {
    switchAria: 'Langue',
    notice: 'Ce site existe en français',
    noticeClose: 'Fermer',
  },
};

export const commonCopy: Record<Locale, CommonCopy> = { en, fr };
