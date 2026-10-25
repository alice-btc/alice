// What each release wants the user to actually try, said inside the app the
// first time the new version opens. Feature highlights only: bug fixes and
// the full detail live in the release notes, one link away. Add an entry per
// release, newest first, the release checklist in BUILDING.md points here.

export type WhatsNewEntry = {
  version: string;
  highlights: string[];
};

export const RELEASE_NOTES_URL = 'https://github.com/alice-btc/alice/releases';

export const WHATS_NEW: WhatsNewEntry[] = [
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
