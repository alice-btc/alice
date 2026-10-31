# Dictionnaire de Bitcoin, Learn pack

This folder holds the 1408 definitions of the *Dictionnaire de Bitcoin* by
Loïc Pandul, as static JSON for the Learn section of Alice App.
Copyright (c) 2024 Loïc Morel (Pandul), the notice the work is supplied with.

- Source: https://github.com/LoicPandul/Dictionnaire-de-Bitcoin, commit `bab568e32351cc9f1240f49f5feedc242123d101`, built 2026-10-11.
- Licence: CC BY-NC-SA 4.0, https://creativecommons.org/licenses/by-nc-sa/4.0/. The text is the author's;
  Alice reproduces it with attribution and does not rewrite it.
- Permission: on 17 October 2026 Loïc Pandul gave his agreement for the
  dictionary to be shipped in Alice and quoted in its replies, which settles
  the NonCommercial clause for this use (Alice is open source and sells a
  Private Cloud plan). The exchange is kept by Marius Farashi, outside this
  repository.
- Modifications, so that the licence's notice is kept: the YAML metadata and
  Markdown bodies were parsed into JSON; relative image paths were replaced by
  absolute URLs to the same images at the source commit; LaTeX blocks and
  inline formulas were turned into code blocks and inline code; the
  cross-references given as UUIDs were resolved to the terms they name.
  Nothing else in the definitions was changed.

Rebuild with `node scripts/build-dictionary-pack.mjs` (see that script for
the pinned commit). Do not edit these files by hand.
