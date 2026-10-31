// Types for the Learn dictionary: the "Dictionnaire de Bitcoin" by Loïc Morel
// (Pandul), CC BY-NC-SA 4.0, reshaped by scripts/build-dictionary-pack.mjs
// into static JSON under apps/app-web/public/dictionary/<lang>/. The index is
// small and loaded once (titles, letters, categories); each letter's bodies
// are fetched on demand, like a course pack.

export interface DictionarySource {
  /** Human title of the work, "Dictionnaire de Bitcoin". */
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
}

export interface DictionaryIndexEntry {
  /** Folder slug, unique, ASCII: "utxo", "reutilisation-d-adresse-ext". */
  slug: string;
  /** The term as the dictionary titles it, uppercase: "RACINE DE MERKLE". */
  title: string;
  /** The letter folder the term sits in, a–z (accents folded: ÉTIQUETAGE → e). */
  letter: string;
  category: string;
  /** English equivalent of a French title, when the dictionary gives one. */
  english?: string;
  /** French equivalent of an English title, when the dictionary gives one. */
  french?: string;
}

export interface DictionaryIndex {
  lang: string;
  source: DictionarySource;
  count: number;
  letters: string[];
  entries: DictionaryIndexEntry[];
}

export interface DictionaryDefinition extends DictionaryIndexEntry {
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
