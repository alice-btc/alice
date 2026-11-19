import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { LearnChapter, LearnCoursePack } from '@alice-wallet/alice-content/src/learn-types';
import { excerptOf, leadingNotice, pickChapter, scoreChapter, queryTokens, relevantExcerpt, toolTutorialExcerpt } from './turn-context-score.ts';

const chapter = (title: string, markdown: string): LearnChapter => ({
  chapterId: null,
  title,
  videoIds: [],
  markdown,
});

const pack = (chapters: LearnChapter[]): LearnCoursePack => ({
  code: 'btc101',
  lang: 'en',
  commit: 'deadbeef',
  name: 'The Bitcoin Journey',
  goal: '',
  objectives: [],
  assetBase: '',
  videos: {},
  intro: '',
  parts: [{ partId: null, title: 'Part', chapters }],
});

describe('pickChapter', () => {
  it('finds the chapter the question speaks to, title weighing double', () => {
    const found = pickChapter(
      'how do I back up my recovery phrase?',
      pack([
        chapter('Mining and difficulty', 'Miners order transactions into blocks.'),
        chapter('Backing up your recovery phrase', 'Write the recovery phrase down, keep it offline.'),
      ]),
    );
    assert.equal(found?.title, 'Backing up your recovery phrase');
  });

  it('returns nothing under the minimum score, instead of a random chapter', () => {
    const found = pickChapter(
      'what is the weather like today?',
      pack([chapter('Mining and difficulty', 'Miners order transactions into blocks.')]),
    );
    assert.equal(found, null);
  });

  it('matches accented French against unaccented question tokens', () => {
    const score = scoreChapter(
      ['securite'],
      chapter('La sécurité de votre portefeuille', 'La sécurité commence par la sauvegarde.'),
    );
    assert.ok(score >= 2);
  });
});

describe('excerptOf', () => {
  it('keeps short chapters whole', () => {
    assert.equal(excerptOf('Short text.', 100), 'Short text.');
  });

  it('cuts at a paragraph boundary, never mid-sentence', () => {
    const text = `${'a'.repeat(80)}\n\n${'b'.repeat(80)}\n\n${'c'.repeat(80)}`;
    const cut = excerptOf(text, 200);
    assert.ok(cut.endsWith('b'.repeat(80)));
  });
});


it('omits a single oversized paragraph rather than clipping its ending', () => {
  assert.equal(excerptOf('Claim '.repeat(50) + 'This is not guaranteed.', 100), '');
  assert.equal(excerptOf('Short opening.\n\n' + 'Claim '.repeat(50), 100), 'Short opening.');
  assert.equal(excerptOf('Text.', NaN), '');
});


it('rejects generic domain overlap and title-only claims without body evidence', () => {
  assert.equal(relevantExcerpt('Why is my Bitcoin transaction pending?', 'Bitcoin', 'An introduction to Bitcoin philosophy.'), null);
  assert.equal(relevantExcerpt('How do I back up my recovery phrase?', 'Backing up your recovery phrase', 'Welcome to this course.'), null);
  assert.equal(relevantExcerpt('Quelle différence entre un nœud complet et un nœud léger ?', 'Introduction du cours', 'Les autres choses sont moins différentes dans ce cours sur Bitcoin.'), null);
});

it('scores only the emitted prefix and ignores URL-only topic matches', () => {
  const markdown = 'A short unrelated opening.\n\n' + 'Introduction '.repeat(180) + '\n\nRecovery phrase wallet backup guidance.';
  assert.equal(relevantExcerpt('recovery phrase wallet backup', 'Recovery phrase wallet backup', markdown), null);
  assert.equal(relevantExcerpt('recovery phrase', 'Recovery phrase', '[Read here](https://example.test/recovery/phrase)\n\n![recovery phrase](asset.webp)'), null);
});

it('keeps short technical names and normalized French subjects', () => {
  assert.ok(relevantExcerpt('SPV', 'SPV verification', 'An SPV client checks block headers.'));
  assert.ok(relevantExcerpt('Les nœuds complets', 'Nœuds complets', 'Les noeuds complets vérifient les règles.'));
  assert.deepEqual(queryTokens('address reuse'), ['addres', 'reuse']);
  assert.ok(relevantExcerpt('address reuse', 'Address reuse', 'Address reuse links payments.'));
});

it('rejects adjacent topics that match only incidental terms', () => {
  assert.equal(relevantExcerpt('What changed in Taproot transactions?', 'Running a Taproot Assets Price Oracle', 'Taproot Assets price transactions and oracle setup.'), null);
  assert.equal(relevantExcerpt('recovery phrase wallet restoration', 'Mnemonic phrase dice roll', 'A recovery phrase can be generated for a wallet by rolling dice.'), null);
});


it('does not present one side as evidence for a two-subject comparison', () => {
  assert.equal(relevantExcerpt('Difference between a full node and a pruned node?', 'Installing a full node', 'The full node validates the blockchain.'), null);
  assert.ok(relevantExcerpt('Difference between a full node and a pruned node?', 'Full and pruned nodes', 'A pruned node validates the same rules as a full archival node but discards old blocks.'));
});

describe('toolTutorialExcerpt', () => {
  const sparrow = [
    '![cover](assets/cover.webp)',
    'Sparrow Wallet est un logiciel de gestion de portefeuille.',
    '## Installer Sparrow Wallet',
    'Téléchargez le logiciel depuis le site officiel.',
    '## Se connecter au réseau Bitcoin',
    'Ouvrez les réglages du serveur.',
    '### Se connecter à un nœud public',
    'Cliquez sur l\'onglet "Public Server".',
    '![Image](assets/fr/12.webp)',
    '### Se connecter à un Bitcoin Core',
    'Rendez-vous dans l\'onglet "Bitcoin Core".',
    '## Recevoir des bitcoins',
    'Accédez au menu "Receive".',
  ].join('\n\n');

  it('gives the section the question is about, with the ones that follow under the same heading', () => {
    const excerpt = toolTutorialExcerpt('Comment relier Sparrow à mon nœud ?', 'Sparrow Wallet', sparrow);
    assert.equal(excerpt, [
      '## Se connecter au réseau Bitcoin',
      '### Se connecter à un nœud public',
      'Cliquez sur l\'onglet "Public Server".',
      '### Se connecter à un Bitcoin Core',
      'Rendez-vous dans l\'onglet "Bitcoin Core".',
    ].join('\n\n'));
  });

  it('matches a verb in the question to the noun of a heading', () => {
    const excerpt = toolTutorialExcerpt('Comment faire la réception de bitcoins avec Sparrow ?', 'Sparrow Wallet', sparrow.replace('## Recevoir des bitcoins', '## Réceptionner des bitcoins'));
    assert.ok(excerpt?.startsWith('## Réceptionner des bitcoins'));
  });

  it('gives the opening and the list of sections to a question about the tool itself', () => {
    assert.equal(toolTutorialExcerpt('Sparrow', 'Sparrow Wallet', sparrow), [
      'Sparrow Wallet est un logiciel de gestion de portefeuille.',
      'Tutorial sections: Installer Sparrow Wallet ; Se connecter au réseau Bitcoin ; Recevoir des bitcoins',
    ].join('\n\n'));
  });

  it('gives the start of the walkthrough to a question about setting the tool up', () => {
    assert.equal(toolTutorialExcerpt('Comment installer et utiliser Sparrow ?', 'Sparrow Wallet', sparrow), [
      'Tutorial sections: Installer Sparrow Wallet ; Se connecter au réseau Bitcoin ; Recevoir des bitcoins',
      'The walkthrough is quoted below in full.',
      '## Installer Sparrow Wallet',
      'Téléchargez le logiciel depuis le site officiel.',
      '## Se connecter au réseau Bitcoin',
      'Ouvrez les réglages du serveur.',
      '### Se connecter à un nœud public',
      'Cliquez sur l\'onglet "Public Server".',
      '### Se connecter à un Bitcoin Core',
      'Rendez-vous dans l\'onglet "Bitcoin Core".',
      '## Recevoir des bitcoins',
      'Accédez au menu "Receive".',
    ].join('\n\n'));
  });

  it('skips the presentation and says which sections of a long walkthrough are quoted', () => {
    const long = [
      '## Présentation de la COLDCARD',
      'Un hardware wallet isole les clés.',
      '## Choix du code PIN',
      'Saisissez un préfixe puis un suffixe.',
      '## Création du portefeuille',
      'Étape. '.repeat(700),
      '## Envoyer des bitcoins',
      'Signez la transaction.',
    ].join('\n\n');
    const excerpt = toolTutorialExcerpt('Comment configurer mon Coldcard ?', 'COLDCARD', long)!;
    assert.match(excerpt, /^Tutorial sections: Présentation de la COLDCARD ; Choix du code PIN ; Création du portefeuille ; Envoyer des bitcoins\n\nQuoted below, from the start of the walkthrough: Choix du code PIN\. The other sections are not quoted here\.\n\n## Choix du code PIN\n\nSaisissez un préfixe puis un suffixe\.$/);
    assert.doesNotMatch(excerpt, /Un hardware wallet isole/);
  });

  it('opens on the first section when the tutorial starts with a heading', () => {
    const umbrel = '## Introduction\n\nUmbrel est un système pour héberger son nœud.\n\n## Installation\n\nFlashez la carte.';
    assert.equal(toolTutorialExcerpt('Umbrel', 'Umbrel', umbrel), 'Umbrel est un système pour héberger son nœud.\n\nTutorial sections: Introduction ; Installation');
  });

  it('puts an opening warning first, whatever the section', () => {
    const warned = `> **⚠️ AVIS DE SÉCURITÉ** Ne générez pas de seed sur cet appareil.\n> Déplacez vos fonds.\n\n${sparrow}`;
    const excerpt = toolTutorialExcerpt('Comment recevoir des bitcoins sur Sparrow ?', 'Sparrow Wallet', warned);
    assert.equal(excerpt, [
      '**⚠️ AVIS DE SÉCURITÉ** Ne générez pas de seed sur cet appareil. Déplacez vos fonds.',
      '## Recevoir des bitcoins',
      'Accédez au menu "Receive".',
    ].join('\n\n'));
    // The chat turn frames the warning so the app can show it itself, and a
    // sentence left hanging on an unquoted link is dropped.
    const hanging = `> **⚠️ AVIS** Déplacez vos fonds. Consultez notre tutoriel dédié :\n\nhttps://example.org\n\n${sparrow}`;
    assert.match(toolTutorialExcerpt('Comment recevoir des bitcoins sur Sparrow ?', 'Sparrow Wallet', hanging, text => `[notice]\n${text}\n[end]`)!, /^\[notice\]\n\*\*⚠️ AVIS\*\* Déplacez vos fonds\.\n\[end\]\n\n## Recevoir des bitcoins/);
    assert.deepEqual(leadingNotice('> Une citation en exergue.\n\nTexte.'), { notice: '', rest: '> Une citation en exergue.\n\nTexte.' });
  });

  it('gives nothing when the tutorial never mentions the subject, or for a comparison', () => {
    assert.equal(toolTutorialExcerpt('Comment utiliser le signal de réutilisation d\'adresse ?', 'Signal', '## Installer Signal\n\nTéléchargez la messagerie.'), null);
    assert.equal(toolTutorialExcerpt('Quelle différence entre Sparrow et Electrum pour se connecter ?', 'Sparrow Wallet', sparrow), null);
  });
});
