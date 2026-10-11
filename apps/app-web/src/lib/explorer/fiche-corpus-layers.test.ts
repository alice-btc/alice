import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { LAYER_FICHES } from './fiche-corpus-layers.ts';
import { LAYER_FICHE_FR } from './fiche-corpus-layers.fr.ts';
import { EXPLORER_FICHES, buildExplorerKnowledgePack, getFiche } from './fiche-corpus.ts';
import { isRecommendable } from './fiche.ts';

describe('Off-chain layer fiches', () => {
  it('cover Spark and Ark, as concepts explained on request, filed under layers', () => {
    assert.ok(LAYER_FICHES.length >= 15);
    assert.ok(LAYER_FICHES.some(f => f.id.startsWith('FICHE_SPARK_')) && LAYER_FICHES.some(f => f.id.startsWith('FICHE_ARK_')));
    for (const f of LAYER_FICHES) {
      assert.equal(f.kind, 'concept', f.id);
      assert.equal(f.legalPosture, 'educational_only', f.id);
      assert.equal(isRecommendable(f), false, `${f.id} never enters an action list`);
      assert.ok(f.disclaimer && f.disclaimer.length > 0, `${f.id} carries the educational disclaimer`);
      assert.equal(f.theme, 'layers', f.id);
      assert.deepEqual(f.appliesTo, ['LAYER_CONTEXT'], f.id);
      assert.ok(f.sources.length > 0 && f.sources.every(s => s.url.startsWith('https://')), `${f.id} is sourced`);
      assert.ok(f.retrievalHints.length >= 5, `${f.id} has retrieval hints`);
      assert.ok(f.body.length > 400, `${f.id} explains, not just names`);
    }
  });

  it('each has a reviewed French translation of its own words', () => {
    for (const f of LAYER_FICHES) {
      const fr = LAYER_FICHE_FR[f.id];
      assert.ok(fr, `${f.id} is translated`);
      assert.ok(fr.title.length > 0 && fr.summary.length > 0 && fr.body.length > 400, `${f.id} FR text is complete`);
      assert.notEqual(fr.body, f.body, `${f.id} FR body is a translation`);
      assert.ok(fr.retrievalHints.length >= 3, `${f.id} has French retrieval terms`);
    }
    assert.deepEqual(Object.keys(LAYER_FICHE_FR).sort(), LAYER_FICHES.map(f => f.id).sort(), 'no orphan translation');
  });

  it('carry no em-dash in either language', () => {
    for (const f of LAYER_FICHES) {
      const fr = LAYER_FICHE_FR[f.id];
      for (const text of [f.title, f.summary, f.body, fr.title, fr.summary, fr.body]) assert.ok(!text.includes('—'), `${f.id} has an em-dash`);
    }
  });

  it('keep the dated facts verbatim across languages', () => {
    const exit = getFiche('FICHE_SPARK_EXIT_TIMELOCKS')!;
    assert.match(exit.body, /2,000 blocks/);
    assert.match(exit.body, /100 blocks/);
    assert.match(exit.body, /below 200 blocks/);
    const fr = LAYER_FICHE_FR.FICHE_SPARK_EXIT_TIMELOCKS.body;
    assert.match(fr, /2 000 blocs/);
    assert.match(fr, /100 blocs/);
    assert.match(fr, /sous 200 blocs/);
    for (const id of ['FICHE_SPARK_OVERVIEW', 'FICHE_SPARK_OPERATORS_SSP']) {
      for (const text of [getFiche(id)!.body, LAYER_FICHE_FR[id].body]) assert.match(text, /Lightspark, Breez (and|et) Flashnet/);
    }
    assert.match(getFiche('FICHE_SPARK_TOKENS')!.body, /does not name the token, show its ticker or its amount/);
  });

  it('join the Explorer corpus and its pack, source and French variant alike', () => {
    for (const f of LAYER_FICHES) assert.equal(getFiche(f.id), f);
    assert.equal(new Set(EXPLORER_FICHES.map(f => f.id)).size, EXPLORER_FICHES.length);
    const pack = buildExplorerKnowledgePack();
    assert.equal(pack.version, '3');
    for (const f of LAYER_FICHES) {
      const en = pack.chunks.find(c => c.id === f.id);
      const fr = pack.chunks.find(c => c.id === `${f.id}:fr`);
      assert.ok(en && fr, `${f.id} has both chunks`);
      assert.equal(en.theme, 'layers');
      assert.equal(fr.theme, 'layers');
      assert.ok(en.keywords.includes('spark') || en.keywords.includes('ark') || en.keywords.includes('vtxo') || en.keywords.some(k => k.includes('spark') || k.includes('ark')), `${f.id} keywords name the layer`);
    }
    // The privacy corpus is untouched by the addition.
    assert.equal(pack.chunks.find(c => c.id === 'FICHE_ADDRESS_REUSE')?.theme, 'privacy');
  });
});

describe('retrieval over the real RAG', () => {
  it('uses the selected layer corpus without reviving the Explorer pack in RAG', async () => {
    const bundled = await build({
      stdin: {
        contents: `
          export { registerPack } from './packages/alice-ai/src/knowledge-packs.ts';
          export { retrieveContextHybridWithDiagnostics } from './packages/alice-ai/src/rag.ts';
          export { buildExplorerKnowledgePack } from './apps/app-web/src/lib/explorer/fiche-corpus.ts';
        `,
        resolveDir: process.cwd(), loader: 'ts',
      },
      bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent',
      alias: { '@alice-wallet/alice-ai': resolve('packages/alice-ai/src/knowledge-packs.ts') },
      // The semantic index's native runtime is never touched by the lexical
      // path exercised here; stub it so the bundle stays importable.
      plugins: [{
        name: 'stub-native',
        setup(b) {
          b.onResolve({ filter: /^(onnxruntime-node|sharp)$/ }, args => ({ path: args.path, namespace: 'stub' }));
          b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default {};', loader: 'js' }));
        },
      }],
    });
    const rt = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].contents).toString('base64')}`);
    rt.registerPack(rt.buildExplorerKnowledgePack());
    const cases: [string, 'en' | 'fr', string[]][] = [
      ['What is a Spark leaf?', 'en', ['curated-spark-trust-and-exits']],
      ["C'est quoi une feuille Spark ?", 'fr', ['curated-spark-trust-and-exits']],
      ['How does a unilateral exit from Spark work, and what are the timelocks?', 'en', ['curated-spark-trust-and-exits']],
      ['Who are the Spark operators and what is the SSP?', 'en', ['curated-spark-trust-and-exits']],
      ["Qu'est-ce qu'un VTXO ?", 'fr', ['curated-ark-vtxos']],
      ['What is an Arkade commitment transaction?', 'en', ['curated-ark-implementations-bark-arkade']],
      ['Comment fonctionne la sortie unilatérale sur Ark ?', 'fr', ['curated-ark-boarding-offboarding-and-exits']],
      ['What does the Explorer show about tokens on Spark?', 'en', ['curated-alice-explorer']],
    ];
    for (const [question, targetLanguage, expected] of cases) {
      const { diagnostics } = await rt.retrieveContextHybridWithDiagnostics(question, { targetLanguage, maxChunks: 4 });
      const ids: string[] = diagnostics.map((d: { id: string }) => d.id);
      assert.ok(expected.some(id => ids.includes(id)), `${question} -> ${ids.join(', ')}`);
      assert.ok(ids.every(id => id.startsWith('curated-')), 'registering the Explorer UI pack must not revive legacy RAG prose');
      assert.ok(diagnostics.every((d: { locale?: string; translationStatus?: string }) => d.locale === 'fr' && d.translationStatus === 'source'), 'selected source fiches remain French for either response language');
    }
  });
});
