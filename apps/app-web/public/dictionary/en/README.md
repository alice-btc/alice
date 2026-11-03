# Bitcoin Dictionary, Learn pack in English

This folder holds an unofficial English translation of the 1408
definitions of the *Dictionnaire de Bitcoin* by Loïc Pandul, as static
JSON for the Learn section of Alice App. The original is in French.
Copyright (c) 2024 Loïc Morel (Pandul), the notice the work is supplied with.

- Original: *Dictionnaire de Bitcoin*, https://github.com/LoicPandul/Dictionnaire-de-Bitcoin, commit
  `bab568e32351cc9f1240f49f5feedc242123d101`, the text of the French pack in ../fr/.
- Licence: CC BY-NC-SA 4.0, https://creativecommons.org/licenses/by-nc-sa/4.0/. This translation is an
  adaptation of the work and is shared under the same licence, with the
  author's attribution.
- Permission: on 17 October 2026 Loïc Pandul agreed to the dictionary being
  shipped in Alice and quoted in its replies, which settles the NonCommercial
  clause for this use, and on 2 November 2026 to this English translation,
  made for Alice. The exchanges are kept by Marius Farashi, outside this
  repository.
- Status: unofficial. The author has not reviewed this translation. It stands
  in until the author's own English translation is published, which will
  replace it.
- Modifications, so that the licence's notice is kept:
  - as in the French pack, the YAML metadata and Markdown bodies were parsed
    into JSON; relative image paths were replaced by absolute URLs to the
    same images at the source commit; LaTeX blocks and inline formulas were
    turned into code blocks and inline code; the cross-references given as
    UUIDs were resolved to the terms they name;
  - the definitions were translated from French into English, paragraph by
    paragraph, without adding, summarising or correcting anything, but for
    two slips: in sigops-signature-operations, `OP_CHECKMULTISIG` is
    preceded by `OP_n`, as the original's next paragraph says, and in
    bitcoin-unlimited Roger Ver is named "with" the big blockers where the
    original reads "avant"; Gregory Maxwell's words, which the original
    quotes in French in coinjoin and chaumian-coinjoin, are given as he
    wrote them in English; code
    blocks, inline code, link destinations and image URLs are those of the
    French text, except French words set as inline code in bit and xor
    (`vrai`, `faux`, `oui`, `non`), translated; image descriptions and
    visible link text are translated;
  - a title is the English equivalent the dictionary gives, when it gives
    one, and otherwise a translation of the French title; every term keeps
    its French title in the `french` field and any additional French
    equivalent in `frenchAliases`;
  - the categories follow one fixed table:
    ATTAQUE → ATTACK
    BIP → BIP
    COMMUNAUTÉ → COMMUNITY
    CONFIDENTIALITÉ → PRIVACY
    COUCHE SUPÉRIEURE → UPPER LAYER
    CRYPTOGRAPHIE → CRYPTOGRAPHY
    HISTOIRE → HISTORY
    INFORMATIQUE → COMPUTING
    LIGHTNING NETWORK → LIGHTNING NETWORK
    MINAGE → MINING
    ORGANISATION → ORGANIZATION
    OUTIL → TOOL
    PORTEFEUILLE → WALLET
    PROTOCOLE → PROTOCOL
    RGB → RGB
    RÉSEAU → NETWORK
    SCRIPT → SCRIPT
    SIDECHAIN → SIDECHAIN
    ÉCONOMIE ET RÉGULATION → ECONOMICS AND REGULATION
  - terms are listed from A to Z by the first letter of their English title,
    A for a title starting with a digit; the files in `letters/` keep the
    letter of the slug, as in the French pack.

The translations are kept in `data/dictionary-en/translations.json`, each
with the SHA-256 of the French body it was made from. Rebuild with
`node scripts/build-dictionary-pack-en.mjs` and check with
`node scripts/validate-dictionary-pack-en.mjs`. Do not edit these files by
hand.
