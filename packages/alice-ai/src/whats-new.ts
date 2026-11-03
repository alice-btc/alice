// What each release wants the user to actually try, said inside the app the
// first time the new version opens. Feature highlights only: bug fixes and
// the full detail live in the release notes, one link away. Add an entry per
// release, newest first, with its highlights in English and the same lines
// in every other app language; the release checklist in BUILDING.md points
// here. A language without its lines reads the English ones.

import type { SupportedLanguage } from './languages';

export type WhatsNewEntry = {
  version: string;
  highlights: string[];
  /** The same highlights in another app language, line for line. */
  translations?: Partial<Record<SupportedLanguage, string[]>>;
};

export const RELEASE_NOTES_URL = 'https://github.com/alice-btc/alice/releases';

export const WHATS_NEW: WhatsNewEntry[] = [
  {
    version: '0.2.8',
    highlights: [
      'Alice answers in the language you write in: the response language is now Auto by default, and Settings › General still offers a fixed language if you prefer one.',
      'Dictionary terms in a reply are links: open one to read its definition without leaving the conversation, in French or in English.',
      'The Dictionnaire de Bitcoin reads in English too, in an unofficial translation made with its author’s agreement.',
      'The courses Alice recommends wait behind one button next to her, under her reply.',
      'The Playground is drawn like the rest of Alice: a balance card, three actions, the history as a list, and amounts in sats.',
      'When a message cannot be sent, the chat says why in your language and what to do; a Private Cloud answer cut short says so, and the free plan has twice the room to answer.',
    ],
    translations: {
      fr: [
        'Alice répond dans la langue où vous écrivez : la langue des réponses est désormais sur Auto par défaut, et Paramètres › Général propose toujours une langue fixe si vous en préférez une.',
        'Les termes du dictionnaire sont des liens dans les réponses : ouvrez-en un pour lire sa définition sans quitter la conversation, en français comme en anglais.',
        'Le Dictionnaire de Bitcoin se lit aussi en anglais, dans une traduction non officielle faite avec l’accord de son auteur.',
        'Les cours conseillés par Alice vous attendent derrière un seul bouton, à côté d’elle, sous sa réponse.',
        'Le Playground est dessiné comme le reste d’Alice : une carte de solde, 3 actions, l’historique en liste et des montants en sats.',
        'Quand un message ne part pas, le chat dit pourquoi dans votre langue et quoi faire ; une réponse de Private Cloud coupée le signale, et le forfait gratuit a 2 fois plus de place pour répondre.',
      ],
    },
  },
  {
    version: '0.2.7',
    highlights: [
      'Private Cloud keeps the thread: every turn of the conversation reaches the enclave encrypted, so Alice reads your question against what was said before.',
      'Alice speaks French: choose the app language in Settings › General, and ask for a language in a message to hold it for that conversation.',
      'Learn has the Dictionnaire de Bitcoin, 1408 definitions, and Alice names her source when she leans on a course or a definition.',
      'A custom AI server or Explorer node can be on another machine, an Umbrel or a VPS, and Settings says connected only once the server answered.',
      'Explorer keeps up with Arkade: the newest commitment is found even when the operator funds it from new coins.',
    ],
    translations: {
      fr: [
        'Private Cloud garde le fil : chaque tour de la conversation arrive chiffré dans l’enclave, et Alice lit votre question à la lumière de ce qui a été dit avant.',
        'Alice parle français : choisissez la langue de l’app dans Paramètres › Général, et demandez une langue dans un message pour la garder pendant toute la conversation.',
        'Learn propose le Dictionnaire de Bitcoin, 1 408 définitions, et Alice cite sa source quand elle s’appuie sur un cours ou une définition.',
        'Un serveur d’IA personnalisé ou un nœud pour l’Explorer peut se trouver sur une autre machine, un Umbrel ou un VPS, et les Paramètres n’indiquent « connecté » qu’une fois que le serveur a répondu.',
        'L’Explorer suit Arkade : la transaction d’engagement la plus récente est trouvée même quand l’opérateur la finance avec de nouvelles pièces.',
      ],
    },
  },
  {
    version: '0.2.6',
    highlights: [
      'Downloading a local model works again on desktop: the bar no longer stops at a few percent, and the window stays usable while it runs.',
      'Once the file is on disk, Alice says it is verifying it, then the chat uses the new model right away, no restart needed.',
    ],
  },
  {
    version: '0.2.5',
    highlights: [
      'Your conversations, memory and settings stay as they were after the update, and a record the app cannot read is kept instead of being overwritten.',
      'What Alice remembers no longer misses accented or plural forms of the subjects it must never keep.',
      'Report an issue now opens a prefilled issue on the public alice repository; copy and email still work.',
      'Ask Alice in Explorer: long transaction ids wrap and large details scroll, with Close always in reach.',
      'Learn in French: titles, times and buttons fit the French interface on a phone.',
    ],
  },
  {
    version: '0.2.4',
    highlights: [
      'Keyboard and screen reader: every control has a name, fields keep their focus ring, and payment status changes are announced.',
      'Animations follow your system\'s reduce-motion setting.',
      'A Learn course now tells your screen reader which language it is in.',
      'The web wallet asks for a PIN before it opens: it is what encrypts your recovery phrase in this browser.',
      'The light theme of the wallet reads at full contrast.',
    ],
  },
  {
    version: '0.2.3',
    highlights: [
      'Explorer: Bark, Arkade and Spark join Bitcoin and Liquid, read from their operators, with each coin\'s way back to the chain.',
      'Ask Alice about any off-chain page: she knows the layers and sees what the page shows, without your identifiers unless you choose.',
      'Everything Alice keeps on this device now rests encrypted: conversations, memory, saved wallets, tabs and the Playground.',
      'The desktop app reaches the Bark, Spark and Sparkscan servers the Explorer needs.',
      'Alice now answers from a reviewed corpus of 403 fiches, each with its limits stated, instead of imported notes.',
      'The Arkade and Bark feeds start from the present, say when they are up to date, and load older history on request.',
    ],
  },
  {
    version: '0.2.2',
    highlights: [
      'A refreshed interface with a pixel rabbit, calmer controls and colors that follow your theme.',
      'Cleaner navigation across Chat, Explorer, Learn and settings.',
      'The model name and reasoning level are easier to tell apart.',
      'Update details are now available from Settings → General, and appear after an upgrade.',
    ],
  },
  {
    version: '0.2.1',
    highlights: [
      'The Explorer works in the installed desktop app: it could not reach the chain at all before.',
      'Learn cover art loads in the desktop app.',
      'Private Cloud now says which of three things went wrong instead of always asking you to wait.',
      'macOS: the install steps match what macOS actually shows you.',
    ],
  },
  {
    version: '0.2.0',
    highlights: [
      'Explorer: blocks, transactions and addresses, explained by Alice.',
      'Learn: the Plan B Academy courses, with quizzes, in 29 languages.',
      'Playground: a practice wallet on a test network, learn to send and receive without risking anything.',
      'Alice now searches her knowledge by meaning, not just keywords.',
      'Accounts, plans, and a smoother chat throughout.',
    ],
  },
];

export function whatsNewFor(version: string): WhatsNewEntry | null {
  return WHATS_NEW.find(entry => entry.version === version) ?? null;
}

/** An entry's highlights in `language`, the English ones when it has none. */
export function whatsNewHighlights(entry: WhatsNewEntry, language: SupportedLanguage): string[] {
  return entry.translations?.[language] ?? entry.highlights;
}
