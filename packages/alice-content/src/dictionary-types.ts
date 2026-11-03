// Types for the Learn dictionary: the "Dictionnaire de Bitcoin" by Loïc Morel
// (Pandul), CC BY-NC-SA 4.0, reshaped by scripts/build-dictionary-pack.mjs
// into static JSON under apps/app-web/public/dictionary/fr/, and translated
// into English by scripts/build-dictionary-pack-en.mjs under .../en/. The
// index is small and loaded once (titles, letters, categories); each letter's
// bodies are fetched on demand, like a course pack.

/** A pack that is a translation of the dictionary, not the author's text. */
export interface DictionaryTranslation {
  /** Title of the translated work, "Dictionnaire de Bitcoin". */
  originalTitle: string;
  /** Language of the original, "fr". */
  originalLanguage: string;
  /** Language of the pack, "en". */
  language: string;
  /** Not the author's own translation. */
  status: 'unofficial';
  /** ISO date of the author's agreement to this translation. */
  permissionDate: string;
  reviewedByAuthor: boolean;
  /** What will take its place: the author's own translation. */
  replacement: string;
}

export interface DictionarySource {
  /** Human title of the pack, "Dictionnaire de Bitcoin", or "Bitcoin Dictionary" for the translation. */
  title: string;
  author: string;
  /** SPDX-like short name, "CC BY-NC-SA 4.0". */
  license: string;
  licenseUrl: string;
  /** The repository the pack was built from, and the exact commit. */
  repository: string;
  commit: string;
  /** Where to read the original definition: `${definitionsBase}/<letter>/<slug>/definition.md`. */
  definitionsBase: string;
  /** ISO date of the build. */
  builtAt: string;
  /** Present when the pack is a translation of the original. */
  translation?: DictionaryTranslation;
}

export interface DictionaryIndexEntry {
  /** Folder slug, unique, ASCII: "utxo", "reutilisation-d-adresse-ext". */
  slug: string;
  /** The term as the dictionary titles it, uppercase: "RACINE DE MERKLE". */
  title: string;
  /**
   * The letter the term is listed under from A to Z, from its title, a–z
   * (accents folded: ÉTIQUETAGE → e). In the French pack it is also the letter
   * file; in the English pack the letter file stays the slug's (letterOfSlug).
   */
  letter: string;
  category: string;
  /** English equivalent of a French title, when the dictionary gives one. */
  english?: string;
  /**
   * French pack: French equivalent of an English title, when the dictionary
   * gives one. English pack: the French title of the term, always.
   */
  french?: string;
  /** Additional French equivalents supplied by the original dictionary. */
  frenchAliases?: string[];
}

export interface DictionaryIndex {
  lang: string;
  source: DictionarySource;
  count: number;
  letters: string[];
  entries: DictionaryIndexEntry[];
}

export interface DictionaryDefinition extends DictionaryIndexEntry {
  /** The letter file the definition sits in, the slug's letter, in every pack. */
  letter: string;
  uuid: string;
  /** Definition body, Markdown, with the technical rewrites the pack README lists. */
  body: string;
  /** Cross-references the dictionary draws, resolved to slugs that exist. */
  seeAlso: { slug: string; title: string }[];
}

export interface DictionaryLetterPack {
  lang: string;
  letter: string;
  entries: DictionaryDefinition[];
}
