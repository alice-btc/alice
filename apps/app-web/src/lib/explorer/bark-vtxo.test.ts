import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BarkError, txidFromRawTx } from './bark.ts';
import { arkoorHops, arkoorSpends, decodeBarkVtxo, exitPathAmounts, isUserPolicy, parseVtxoInput, vtxoIdBytes, vtxoOrigin } from './bark-vtxo.ts';

const bytes = (s: string) => Uint8Array.from(s.match(/../g)!.map(h => parseInt(h, 16)));

// Bark's own deterministic test vectors (lib/src/test_util/vectors.rs): a
// board, a coin from a round, and payments made from each outside a round.
const ANCHOR_TX = [
  '02000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0000000000015a2800',
  '0000000000225120652675904a84ea02e24b57b3d547203d2ce71526113d35bf4d02e0b4efbe9a2d00000000',
].join('');
const ROUND_TX = [
  '02000000010000000000000000000000000000000000000000000000000000000000000000ffffffff000000000001c8af00',
  '0000000000225120649657f65947abfd83ff629ad8a851c795f419ed4d52a2748d3f868cc3e6c94d00000000',
].join('');
const BOARD_VTXO = [
  '02001027000000000000928a01000365a81233741893bbe2461b8d479dadc5880594fe6f7479180d5843820af72b62e00751',
  '11d0df3738fe77c8f05b0f71292ae6ae5eddf911f8d2bb4dbde598fcbe768f00000000010102030a752219f1b94bbdf8994a',
  '0a980cdda08c2ad094cb29dd834878db6dee1612ee0365a81233741893bbe2461b8d479dadc5880594fe6f7479180d584382',
  '0af72b629c9c63d9c0f739011368e00c2441d85816c01d637da8d57ac343c95982dd3604d8bf847bcf8a2aac44483d7ea01e',
  'c9a99f7720d0694cb3cdd3cbcca97504adaf01004a0100000000000000030a752219f1b94bbdf8994a0a980cdda08c2ad094',
  'cb29dd834878db6dee1612ee24e9a421d9018690eea79b11e4e4fe59d36aa8f46d110017e09abe350b5e315600000000',
].join('');
const ROUND_VTXO = [
  '02001027000000000000928a01000365a81233741893bbe2461b8d479dadc5880594fe6f7479180d5843820af72b62e007a3',
  'c23c49874159964c52b95021596d5a22e8f8b6bc7c16aa8303c24498d3d5ab00000000030108039e8a040d9c1fba5a7b0db8',
  '485d8f167f8d2590afd8595f9eb9ba7a769347ba2602bd0ad185b18089d37d20dd784b99003914faadcc59f37bbf3273a3b5',
  'cd22ed5002568a3a6d25000fc942f0443dc76be4ef688e8c8dc055591de1f2cc1c847b1ed3036e64c16a01e3d18908a15b55',
  '251a5db74ff2c1142c02abd048222893b2a18a16024ac23c8d3f6e0b1116e34f68ee7c9e4c19eba30213e8fae0925d70faf8',
  'd1ecc403932b1b0224e375471c938ea84bd17df7d8295941b2db68a6623610dd959b2eb303d215f5e88aefa7a2a979477187',
  '8f3d6caf20e884c1e0ce923cfa9dea261bb4e2024482039ebf3624525061f88aa01d4a02b3f2224eee8b4060ae0cbf036b24',
  '2743d13a61cc94c4a737f700c843da24f6e95b0689a387f076b54d8fff18078b0eec37a28d5efe0488764c4b85747b848d48',
  '187b0feba2ddcdc7a9dacef85ed759c404038813000000000000225120e323389c08597944bd4c2c2131a241d80a56764e1a',
  '5fd51395d8b28d6267004c8813000000000000225120fecd587f595903827cbad9d38ec88e40a9d06b89af7c9cabd764e028',
  '9688742e8813000000000000225120b875e2b865bea2e27e39dfcc1d69198c573e42aa7d6fe0a622175ddde47e5df5000000',
  '00000000000105036e64c16a01e3d18908a15b55251a5db74ff2c1142c02abd048222893b2a18a16024ac23c8d3f6e0b1116',
  'e34f68ee7c9e4c19eba30213e8fae0925d70faf8d1ecc403932b1b0224e375471c938ea84bd17df7d8295941b2db68a66236',
  '10dd959b2eb303d215f5e88aefa7a2a9794771878f3d6caf20e884c1e0ce923cfa9dea261bb4e2024482039ebf3624525061',
  'f88aa01d4a02b3f2224eee8b4060ae0cbf036b242743134f6656d5dc5ad1024faf5332e72192690bf8d42f81666b48b5f027',
  '2c071d52f112ee3138bc0f9141dbdcad8b6b1769aefcfa9e99f2c9df7176b95f0a69064f0400102700000000000022512061',
  '7db669165ad608065aef170b369f4fc39c6fa2ba28f72adaaa377a1e00691f8813000000000000225120dd10678e59d9cdc6',
  '3a2d1a1e664365a4122afcf389b1e17f135a14f55a5ad7238813000000000000225120d6c57ae96f2ff2c86d396dc8e7332b',
  '2db6ee506197e418dc766f2fcd346703600000000000000000040374a3ec37cc4ccd29717388e6dc24f2aa366632f1a36a49',
  'e73cd7671b23179298045d1595725c9560b4021bc0ad4cf7f828d5ba3fd700a87b9b6f7adf9993b1a5e820e4979b37c40acc',
  '35fd56119caacbb3342b68e993b128a49004c8e985227500c05bc2f82c8c64e470cd4d87aca42989b46879ca32320cd035db',
  '124bb78c4e7401000000000000000000000374a3ec37cc4ccd29717388e6dc24f2aa366632f1a36a49e73cd7671b23179298',
  'd9027feee32a8849ef313c2a35da6b386e73ea673950eb4dd81c06dbdc0c048900000000',
].join('');
const ARKOOR_VTXO = [
  '02001027000000000000928a01000365a81233741893bbe2461b8d479dadc5880594fe6f7479180d5843820af72b62e007a3',
  'c23c49874159964c52b95021596d5a22e8f8b6bc7c16aa8303c24498d3d5ab00000000050108039e8a040d9c1fba5a7b0db8',
  '485d8f167f8d2590afd8595f9eb9ba7a769347ba2602bd0ad185b18089d37d20dd784b99003914faadcc59f37bbf3273a3b5',
  'cd22ed5002568a3a6d25000fc942f0443dc76be4ef688e8c8dc055591de1f2cc1c847b1ed3036e64c16a01e3d18908a15b55',
  '251a5db74ff2c1142c02abd048222893b2a18a16024ac23c8d3f6e0b1116e34f68ee7c9e4c19eba30213e8fae0925d70faf8',
  'd1ecc403932b1b0224e375471c938ea84bd17df7d8295941b2db68a6623610dd959b2eb303d215f5e88aefa7a2a979477187',
  '8f3d6caf20e884c1e0ce923cfa9dea261bb4e2024482039ebf3624525061f88aa01d4a02b3f2224eee8b4060ae0cbf036b24',
  '2743d13a61cc94c4a737f700c843da24f6e95b0689a387f076b54d8fff18078b0eec37a28d5efe0488764c4b85747b848d48',
  '187b0feba2ddcdc7a9dacef85ed759c404038813000000000000225120e323389c08597944bd4c2c2131a241d80a56764e1a',
  '5fd51395d8b28d6267004c8813000000000000225120fecd587f595903827cbad9d38ec88e40a9d06b89af7c9cabd764e028',
  '9688742e8813000000000000225120b875e2b865bea2e27e39dfcc1d69198c573e42aa7d6fe0a622175ddde47e5df5000000',
  '00000000000105036e64c16a01e3d18908a15b55251a5db74ff2c1142c02abd048222893b2a18a16024ac23c8d3f6e0b1116',
  'e34f68ee7c9e4c19eba30213e8fae0925d70faf8d1ecc403932b1b0224e375471c938ea84bd17df7d8295941b2db68a66236',
  '10dd959b2eb303d215f5e88aefa7a2a9794771878f3d6caf20e884c1e0ce923cfa9dea261bb4e2024482039ebf3624525061',
  'f88aa01d4a02b3f2224eee8b4060ae0cbf036b242743134f6656d5dc5ad1024faf5332e72192690bf8d42f81666b48b5f027',
  '2c071d52f112ee3138bc0f9141dbdcad8b6b1769aefcfa9e99f2c9df7176b95f0a69064f040110270000000000002251200a',
  'abaa2768f0d46559b0f333c3c5eb5cfc716c4e59be2b2fe0dd7da39fd962c58813000000000000225120dd10678e59d9cdc6',
  '3a2d1a1e664365a4122afcf389b1e17f135a14f55a5ad7238813000000000000225120d6c57ae96f2ff2c86d396dc8e7332b',
  '2db6ee506197e418dc766f2fcd346703600000000000000000040256fda20ffb102f6cf8590d27433ce036d29927fb35324d',
  '15d9915df888f16ecd4c914f0963cab2864f2a80de95858931eee91da3044b04fcf467bfcd6a10c7a905b28e81a7b69f3372',
  '524b53541973b4a816b16e630557b25948d92613e747370061050792ef121826fda248a789c8ba75b955844c65acd2c63619',
  '50bdd31dae7d0100000000000000000002010256fda20ffb102f6cf8590d27433ce036d29927fb35324d15d9915df888f16e',
  'cd6c5ec61ad7b9178cab72d50dc83bf535c28b85ca49ae7f29eda904052ca6503b065c3fe2d66213a87cca99519b7da9b7e0',
  '53f8d02c59f98da659e0caa1d08e734394eb9e29eaf88e7a38a491bfddc5826550d7893bf7c42b1d9ef5b6534bdf07010000',
  '0000000000000002010256fda20ffb102f6cf8590d27433ce036d29927fb35324d15d9915df888f16ecd565b73d5325e6894',
  '9a264159ea1da8a7d8ba8788f3f63a202d5f3047d2fe9428a4f01237907648d202ca7daa904ed7ef45d1a4d84b924293e7fd',
  'a8d1c48d4fee63e6f52bc529156e7eb714e9f9c749810b938c3b6f57eed4f99f95daf6090358010000000000000000000002',
  'ed1334f116cea9128e1f59f1d5a431cb4f338f0998e2b32f654c310bf7831f9767754b5920d282ad276e8c80e1088f092386',
  '98bb674906fe47a0bfe2e985591200000000',
].join('');
const HTLC_SEND_VTXO = [
  '02002823000000000000928a01000365a81233741893bbe2461b8d479dadc5880594fe6f7479180d5843820af72b62e00751',
  '11d0df3738fe77c8f05b0f71292ae6ae5eddf911f8d2bb4dbde598fcbe768f00000000030102030a752219f1b94bbdf8994a',
  '0a980cdda08c2ad094cb29dd834878db6dee1612ee0365a81233741893bbe2461b8d479dadc5880594fe6f7479180d584382',
  '0af72b6237525e6fea11cfc48d52909f04ec37e8752b5b528ccaa80c9b7b14289f0a2123ca725ebb71ac758ad9c6eda0ecce',
  '11548285ccc84afdd6331898b8f9bfa360ed01004a010000000000000201030a752219f1b94bbdf8994a0a980cdda08c2ad0',
  '94cb29dd834878db6dee1612ee78b9640f859155786c4923b1d634d20b02663f1c4d061c4411f15e386951a63fe29df4655b',
  '7822d159e871ff069140533aa74e35135f724574c9c8c1b88e0ed2a15daf850f181fb3447138bce2916c3e97bad525e327a4',
  '280e8413ad0711d5ee0200e803000000000000225120652675904a84ea02e24b57b3d547203d2ce71526113d35bf4d02e0b4',
  'efbe9a2d00000000000000000201030a752219f1b94bbdf8994a0a980cdda08c2ad094cb29dd834878db6dee1612eea77a82',
  '8ce5ccaca57a4b78f16499219334c6ee95c9b990ee15918aeb915930057321879a9c3b37eaa37a6d0bcdf0f55f0f4a00fdef',
  'ff114c53ec0d83ddc10b2017d4f23a895980ca9357a39e7940d035ebfd63ef49beecc5adefc34bf0093eb201000000000000',
  '0000000903eb4570ae385202d4a48f06bdb14126910b90c07f8e42d7dc5e28a860c085e73712358912c950a9a7d04bb9011e',
  'e9f6a16b6127a5aab7415803d48c0225f620f5aa860100d39f44ab09271d4014ecc4715c2620a7c9f2cc8244f4015335e86a',
  '1488659cc700000000',
].join('');
const BOARD_VTXO_V1 = [
  '01001027000000000000928a01000365a81233741893bbe2461b8d479dadc5880594fe6f7479180d5843820af72b62e007ed',
  '4d23932a2625a78fe5c75bded751da3a99e23a297a527c01bd7bc8372128f200000000010102030a752219f1b94bbdf8994a',
  '0a980cdda08c2ad094cb29dd834878db6dee1612ee0365a81233741893bbe2461b8d479dadc5880594fe6f7479180d584382',
  '0af72b62655d61f465693e1fbf39814e9cb1d57d5eabc49548ed042626cc39c4d5fe5c1836c8c2fb634bceab363212ed4c6a',
  '8e78c9ff33884587830ffa2a1cbd84c95e77010000030a752219f1b94bbdf8994a0a980cdda08c2ad094cb29dd834878db6d',
  'ee1612ee4c99b744ad009b7070f330794bf003fa8e5cd46ea1a6eb854aaf469385e3080000000000',
].join('');

// Captured from Second's mainnet server on 2026-10-08.
const ROUND_ROOT_FROM_SERVER = '0200c90200000000000096de0e000375b2e4f6abe5b00736359de211c35d9e72b615e5fd424d8ad1e68a8b300b97b590009ffbf6f76e4d705cd9da3bdc71edfaebc6803caef37f548106764a790f4111b10000000000044f0a1ff2952aaf07f599d234374167a33d1e3202471ae8275dff24442287fab29ffbf6f76e4d705cd9da3bdc71edfaebc6803caef37f548106764a790f4111b100000000';

describe('decodeBarkVtxo', () => {
  it('reads a board: one transaction signed by the user and the server', () => {
    const v = decodeBarkVtxo(bytes(BOARD_VTXO));
    assert.equal(v.encodingVersion, 2);
    assert.equal(v.amountSats, 10_000);
    assert.equal(v.expiryHeight, 101_010);
    assert.equal(v.exitDeltaBlocks, 2016);
    // The anchor is the real board transaction's output.
    assert.deepEqual(v.anchor, { txid: txidFromRawTx(bytes(ANCHOR_TX)), vout: 0 });
    assert.equal(v.genesis.length, 1);
    assert.deepEqual(
      { kind: v.genesis[0].kind, signers: v.genesis[0].signers, outputs: v.genesis[0].outputs, fee: v.genesis[0].feeSats, signed: v.genesis[0].signed },
      { kind: 'cosigned', signers: 2, outputs: 1, fee: 330, signed: true },
    );
    assert.equal(v.policy.kind, 'pubkey');
    assert.equal(vtxoOrigin(v), 'board');
    assert.match(v.id, /^[0-9a-f]{64}:\d+$/);
  });

  it('reads a round coin: its branch of the tree, then its leaf', () => {
    const v = decodeBarkVtxo(bytes(ROUND_VTXO));
    assert.deepEqual(v.anchor, { txid: txidFromRawTx(bytes(ROUND_TX)), vout: 0 });
    assert.deepEqual(v.genesis.map(s => [s.kind, s.signers, s.outputs, s.outputIndex]), [
      ['cosigned', 8, 4, 3],
      ['cosigned', 5, 4, 0],
      ['hash-locked', 1, 1, 0],
    ]);
    // Each tree node lists the sibling branches: 3 of them at each level.
    assert.equal(v.genesis[0].siblings.length, 3);
    assert.ok(v.genesis[0].siblings.every(s => s.amountSats > 0 && s.scriptHex.startsWith('5120')));
    assert.equal(v.genesis[2].preimageRevealed, true);
    assert.equal(vtxoOrigin(v), 'round');
    assert.equal(arkoorHops(v), 0);
  });

  it('reads payments made outside a round on top of a round coin', () => {
    const v = decodeBarkVtxo(bytes(ARKOOR_VTXO));
    assert.equal(v.genesis.length, 5);
    assert.equal(arkoorHops(v), 2);
    assert.equal(vtxoOrigin(v), 'round');
  });

  it('reads what the server returns for a round root: a server-side output', () => {
    // Second's mainnet server, GetVtxo for b111410f…f6fb9f:0 (round 50366666,
    // completed 2026-10-08): the root of that round's tree.
    const v = decodeBarkVtxo(bytes(ROUND_ROOT_FROM_SERVER));
    assert.equal(v.id, 'b111410f794a760681547ff3ae3c80c6ebfaed71dc3bdad95c704d6ef7f6fb9f:0');
    assert.deepEqual(v.anchor, v.point);
    assert.equal(v.genesis.length, 0);
    assert.equal(v.amountSats, 713);
    assert.equal(v.policy.kind, 'expiry');
    assert.equal(isUserPolicy(v.policy), false);
    assert.equal(v.serverPubkey, '0375b2e4f6abe5b00736359de211c35d9e72b615e5fd424d8ad1e68a8b300b97b5');
    assert.equal(vtxoOrigin(v), 'onchain');
  });

  it('reads a Lightning send in flight', () => {
    const v = decodeBarkVtxo(bytes(HTLC_SEND_VTXO));
    assert.equal(v.policy.kind, 'htlc-send');
    assert.equal(v.amountSats, 9000);
  });

  it('reads the older encoding, without fee amounts', () => {
    const v = decodeBarkVtxo(bytes(BOARD_VTXO_V1));
    assert.equal(v.encodingVersion, 1);
    assert.equal(v.genesis[0].feeSats, 0);
    assert.equal(vtxoOrigin(v), 'board');
  });

  it('rejects truncated data, trailing bytes and unknown versions', () => {
    const full = bytes(BOARD_VTXO);
    assert.throws(() => decodeBarkVtxo(full.subarray(0, full.length - 1)), BarkError);
    assert.throws(() => decodeBarkVtxo(new Uint8Array([...full, 0])), BarkError);
    assert.throws(() => decodeBarkVtxo(new Uint8Array([9, 0, ...full.subarray(2)])), BarkError);
  });
});

describe('VTXO input', () => {
  it('recognises an id and an export', () => {
    const id = parseVtxoInput(`  ${'a'.repeat(64)}:3 `);
    assert.deepEqual(id, { kind: 'id', point: { txid: 'a'.repeat(64), vout: 3 } });
    const exp = parseVtxoInput(BOARD_VTXO.replace(/(.{64})/g, '$1\n'));
    assert.equal(exp?.kind, 'export');
    assert.equal(parseVtxoInput('hello'), null);
    assert.equal(parseVtxoInput('a'.repeat(64)), null);
  });

  it('encodes an id the way the server expects it', () => {
    const b = vtxoIdBytes({ txid: `${'ab'.repeat(31)}cd`, vout: 3 });
    assert.equal(b.length, 36);
    assert.equal(b[0], 0xcd);
    assert.deepEqual([...b.subarray(32)], [3, 0, 0, 0]);
  });

  it('round-trips a decoded coin id into the server id bytes', () => {
    const v = decodeBarkVtxo(bytes(BOARD_VTXO));
    const b = vtxoIdBytes(v.point);
    // The last 36 bytes of an encoded VTXO are its point, as the id.
    const full = bytes(BOARD_VTXO);
    assert.deepEqual([...b], [...full.subarray(full.length - 36)]);
  });
});

describe('exitPathAmounts', () => {
  it('adds the other branches and fees back up to the anchor', () => {
    const step = (siblings: number[], feeSats = 0, kind: 'cosigned' | 'arkoor' | 'hash-locked' = 'cosigned') => ({
      kind, signers: 2, signed: true, outputs: siblings.length + 1, outputIndex: 0,
      siblings: siblings.map(amountSats => ({ amountSats, scriptHex: '51' })), feeSats,
    });
    const v = {
      amountSats: 6_765,
      genesis: [step([4_320_000]), step([160_000, 800_000, 1_250_000]), step([], 0, 'hash-locked'), step([3_235], 0, 'arkoor'), step([], 0, 'arkoor')],
    } as unknown as Parameters<typeof exitPathAmounts>[0];
    const { anchorSats, branchSats } = exitPathAmounts(v);
    assert.deepEqual(branchSats, [2_220_000, 10_000, 10_000, 6_765, 6_765]);
    assert.equal(anchorSats, 6_540_000);
  });

  it('is the coin itself for an on-chain coin', () => {
    const v = { amountSats: 500, genesis: [] } as unknown as Parameters<typeof exitPathAmounts>[0];
    assert.deepEqual(exitPathAmounts(v), { anchorSats: 500, branchSats: [] });
  });
});

describe('arkoorSpends', () => {
  const arkoor = (key: string, outputs: number, feeSats = 0) => ({
    kind: 'arkoor' as const, signers: 1, cosigners: [key], signed: true, outputs, outputIndex: 0,
    siblings: Array.from({ length: outputs - 1 }, () => ({ amountSats: 10, scriptHex: '51' })), feeSats,
  });
  const leaf = { kind: 'hash-locked' as const, signers: 1, cosigners: ['02aa'], signed: true, outputs: 1, outputIndex: 0, siblings: [], feeSats: 0 };

  it('pairs a checkpoint with the transaction spending it, by the same key', () => {
    // The real shape of a coin paid once with change, then moved whole twice.
    const v = { genesis: [leaf, arkoor('02aa', 2), arkoor('02aa', 1), arkoor('03bb', 1), arkoor('03bb', 1), arkoor('03bb', 1), arkoor('03bb', 1)] } as unknown as Parameters<typeof arkoorSpends>[0];
    assert.deepEqual(arkoorSpends(v), [
      { from: 1, to: 2, whole: false },
      { from: 3, to: 4, whole: true },
      { from: 5, to: 6, whole: true },
    ]);
  });

  it('keeps a lone step, a fee-paying step or a key change as a spend of its own', () => {
    const v = { genesis: [arkoor('02aa', 2), arkoor('03bb', 1), arkoor('03bb', 1, 5)] } as unknown as Parameters<typeof arkoorSpends>[0];
    assert.deepEqual(arkoorSpends(v), [
      { from: 0, to: 0, whole: false },
      { from: 1, to: 1, whole: true },
      { from: 2, to: 2, whole: true },
    ]);
  });
});
