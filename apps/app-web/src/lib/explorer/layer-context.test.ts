import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  arkadeAddressContext, arkadeVtxoContext, barkAddressContext, barkVtxoContext,
  sparkAddressContext, sparkLeafContext, sparkscanTxContext, sparkTransferContext, LAYER_CONTEXT_MAX_ROWS,
} from './layer-context.ts';
import { toAbstractSignal } from './audit-core.ts';
import { findRawIdentifiersInText } from './route.ts';
import { sparkAddressOf, type SparkLeaf, type SparkTransfer } from './spark.ts';
import type { SparkExitPath } from './spark-exit.ts';
import type { SparkscanTx } from './sparkscan.ts';
import type { ArkadeAddressInfo, ArkadeInfo, ArkadeVtxo } from './arkade.ts';
import type { ArkadeExitPath } from './arkade-exit.ts';
import type { BarkAddress } from './bark.ts';
import type { BarkVtxo } from './bark-vtxo.ts';

const NOW = 1_760_000_000;
const ME = '03f5ce35a29fc2e5a41afe760d6c714e0f76dfc12d00f5c01eef4d8c1e3eb3fcab';
const OTHER = '037579aee81891fc3a28cbe7b13e565031d46248b420fb39dcb308598f472b4513';
const MY_ADDRESS = sparkAddressOf(ME)!;
const OTHER_ADDRESS = sparkAddressOf(OTHER)!;
const LEAF_ID = '01a117a8-cb94-7a3e-9c1d-0123456789ab';
const TRANSFER_ID = '019a2b3c-4d5e-7f60-8a9b-fedcba987654';
const TREE_ID = '0199ffff-0000-7000-8000-000000000001';
const hex = (c: string) => c.repeat(64);

const leaf = (id: string, valueSats: number, over: Partial<SparkLeaf> = {}): SparkLeaf => ({
  id, treeId: TREE_ID, parentId: null, valueSats, vout: 0, status: 'available', ownerPubkey: ME, createdAt: NOW - 86_400 * 3,
  nodeTx: new Uint8Array(), refundTx: new Uint8Array(), directTx: new Uint8Array(), directRefundTx: new Uint8Array(), ...over,
});
const transfer = (over: Partial<SparkTransfer> = {}): SparkTransfer => ({
  id: TRANSFER_ID, senderPubkey: OTHER, receiverPubkey: ME, status: 'completed', type: 'transfer', totalSats: 1024,
  createdAt: NOW - 3600, leaves: [leaf(LEAF_ID, 1024)], ...over,
});

/** The projection must carry no identifier: not an id, not an address, not a key. */
function assertClean(json: string, ...raw: string[]) {
  for (const r of raw) assert.ok(!json.includes(r), `projection leaks ${r.slice(0, 12)}…`);
}

describe('sparkAddressContext', () => {
  it('describes the wallet with its address, leaves and transfers, every identifier declared', () => {
    const ctx = sparkAddressContext({
      address: MY_ADDRESS, pubkey: ME, balance: { sats: 3072, leaves: 2 }, leaves: [leaf(LEAF_ID, 1024), leaf('01a117a8-0000-7000-8000-000000000002', 2048)],
      transfers: [transfer(), transfer({ id: '019a2b3c-0000-7000-8000-000000000003', senderPubkey: ME, receiverPubkey: OTHER, totalSats: 512, status: 'sender-key-tweaked' })],
      transfersMore: true, transfersError: null, scan: { total: 9, tokens: [] },
    }, NOW);
    assert.match(ctx.full.description, /^Spark address spark1/);
    assert.match(ctx.full.description, /Balance: 3,072 sats across 2 leaves/);
    assert.match(ctx.full.description, /received 1,024 sats from spark1/);
    assert.match(ctx.full.description, /sent 512 sats to spark1/);
    assert.match(ctx.full.description, /Pending/);
    assert.match(ctx.full.description, /more exist/);
    assert.ok(!ctx.full.description.includes(ME) && !ctx.full.description.includes(OTHER), 'no bare public key');
    const kinds = new Map(ctx.full.subjects.map(s => [s.value, s.kind]));
    assert.equal(kinds.get(MY_ADDRESS), 'address');
    assert.equal(kinds.get(OTHER_ADDRESS), 'address');
    assert.equal(kinds.get(LEAF_ID), 'spark-id');
    assert.equal(kinds.get(TRANSFER_ID), 'spark-id');
    // Every identifier the text scan would find is declared, so route() never
    // depends on the scan for this description.
    for (const found of findRawIdentifiersInText(ctx.full.description)) {
      assert.ok(kinds.has(found.value), `${found.kind} ${found.value} is declared`);
    }
  });

  it('projects to the page shape only: layer, page, counts, a magnitude, an age', () => {
    const ctx = sparkAddressContext({
      address: MY_ADDRESS, pubkey: ME, balance: { sats: 3072, leaves: 2 }, leaves: [leaf(LEAF_ID, 1024), leaf('01a117a8-0000-7000-8000-000000000002', 2048)],
      transfers: [transfer()], transfersMore: false, transfersError: null, scan: { total: 3, tokens: [{ id: hex('f'), kind: 'token', rawType: 'TOKEN_TRANSFER', status: 'ok', amountSats: null, from: null, to: null, createdAt: null, bitcoinTxid: null }] },
    }, NOW);
    assert.equal(ctx.signal.ruleId, 'LAYER_CONTEXT');
    assert.equal(ctx.signal.severity, 'info');
    const a = toAbstractSignal(ctx.signal);
    assert.ok(a);
    assert.deepEqual(a.shape, { addresses: 1, txs: 1, utxos: 2, inputCount: undefined, outputCount: undefined });
    assert.deepEqual(a.flags, { spark: true, address: true, tokens: true });
    assert.deepEqual(a.magnitudes, ['e3']);
    assert.deepEqual(a.ages, ['1-7d']);
    assertClean(JSON.stringify(a), MY_ADDRESS, ME, LEAF_ID, TRANSFER_ID, '3072');
  });

  it('says empty-or-private when the operators served nothing, and that the transfers are still loading', () => {
    const ctx = sparkAddressContext({ address: MY_ADDRESS, pubkey: ME, balance: { sats: 0, leaves: 0 }, leaves: [], transfers: null, transfersMore: false, transfersError: null, scan: null }, NOW);
    assert.match(ctx.full.description, /empty, or its wallet turned on privacy mode/);
    assert.match(ctx.full.description, /still being read/);
    const a = toAbstractSignal(ctx.signal)!;
    assert.deepEqual(a.flags, { spark: true, address: true, private: true, partial: true });
    assert.equal(a.ages, undefined);
  });

  it('caps the lists and counts the rest', () => {
    const leaves = Array.from({ length: LAYER_CONTEXT_MAX_ROWS + 5 }, (_, i) => leaf(`01a117a8-0000-7000-8000-${String(i).padStart(12, '0')}`, 64));
    const ctx = sparkAddressContext({ address: MY_ADDRESS, pubkey: ME, balance: { sats: 64 * leaves.length, leaves: leaves.length }, leaves, transfers: [], transfersMore: false, transfersError: null, scan: null }, NOW);
    assert.match(ctx.full.description, /… and 5 more leaves/);
    assert.equal(ctx.full.subjects.filter(s => s.kind === 'spark-id').length, LAYER_CONTEXT_MAX_ROWS);
  });
});

describe('sparkTransferContext', () => {
  it('names the transfer, both parties by address, and the leaves moved', () => {
    const ctx = sparkTransferContext(transfer(), NOW);
    assert.match(ctx.full.description, /^Spark transfer 019a2b3c/);
    assert.match(ctx.full.description, /Spark transfer, Completed, 1,024 sats/);
    assert.match(ctx.full.description, new RegExp(`From ${OTHER_ADDRESS} to ${MY_ADDRESS}`));
    assert.match(ctx.full.description, /Leaves moved, whole \(1\)/);
    assert.deepEqual(ctx.full.subjects.map(s => s.kind), ['spark-id', 'address', 'address', 'spark-id']);
    const a = toAbstractSignal(ctx.signal)!;
    assert.deepEqual(a.shape, { addresses: 2, txs: 1, utxos: 1, inputCount: 1, outputCount: 1 });
    assert.deepEqual(a.flags, { spark: true, transfer: true, completed: true });
    assert.deepEqual(a.ages, ['<1d']);
    assertClean(JSON.stringify(a), TRANSFER_ID, LEAF_ID, MY_ADDRESS, OTHER_ADDRESS);
  });

  it('flags a Lightning swap with the SSP and a pending state', () => {
    const SSP = '023e33e2920326f64ea31058d44777442d97d7d5cbfcf54e3060bc1695e5261c93';
    const ctx = sparkTransferContext(transfer({ type: 'preimage-swap', senderPubkey: SSP, status: 'sender-key-tweaked', leaves: [] }), NOW);
    assert.match(ctx.full.description, /Lightning payment received, Pending/);
    assert.match(ctx.full.description, /the SSP, Lightspark/);
    assert.match(ctx.full.description, /without its leaves/);
    const a = toAbstractSignal(ctx.signal)!;
    assert.deepEqual(a.flags, { spark: true, transfer: true, pending: true, lightning: true });
  });
});

describe('sparkLeafContext', () => {
  const path: SparkExitPath = {
    leafId: LEAF_ID, treeId: TREE_ID, depositTxid: hex('a'), depositVout: 0, anchorSats: 2048,
    steps: [
      { nodeId: 'n1', txid: hex('b'), kind: 'root', outputs: [{ amountSats: 2048, ours: true }], ourIndex: 0, branchSats: 2048, timelockBlocks: null, status: 'split' },
      { nodeId: LEAF_ID, txid: hex('c'), kind: 'leaf', outputs: [{ amountSats: 1024, ours: true }, { amountSats: 1024, ours: false }], ourIndex: 0, branchSats: 1024, timelockBlocks: 1800, status: 'available' },
    ],
    refund: { txid: hex('d'), amountSats: 1024, timelockBlocks: 1000, toScriptHex: '51' },
    directTimelockBlocks: 1850,
    totalWaitBlocks: 2800,
  };

  it('tells the coin, its deposit on Bitcoin and the exit path with its timelocks', () => {
    const ctx = sparkLeafContext(leaf(LEAF_ID, 1024), path, { confirmed: true, blockHeight: 970_378, blockTime: NOW - 86_400 * 10 }, NOW);
    assert.match(ctx.full.description, /^Spark leaf 01a117a8/);
    assert.match(ctx.full.description, /1,024 sats, Available, owned by spark1/);
    assert.match(ctx.full.description, /Deposit on Bitcoin: transaction a{64}, output 0 \(2,048 sats\), confirmed in block 970,378/);
    assert.match(ctx.full.description, /2 pre-signed node transactions/);
    assert.match(ctx.full.description, /add up to 2,800 blocks/);
    assert.match(ctx.full.description, /- leaf c{64}: 2 outputs, branch 1,024 sats, waits 1,800 blocks/);
    assert.match(ctx.full.description, /- refund d{64}: 1,024 sats to the owner, waits 1,000 blocks/);
    assert.match(ctx.full.description, /direct \(watchtower\) path/);
    const kinds = ctx.full.subjects.map(s => `${s.kind}:${s.value.slice(0, 4)}`);
    assert.deepEqual(kinds, ['spark-id:01a1', 'spark-id:0199', 'address:spar', 'txid:aaaa', 'txid:bbbb', 'txid:cccc', 'txid:dddd']);
    const a = toAbstractSignal(ctx.signal)!;
    assert.deepEqual(a.shape, { addresses: 1, txs: 3, utxos: 1, inputCount: undefined, outputCount: undefined });
    assert.deepEqual(a.flags, { spark: true, leaf: true });
    assert.deepEqual(a.magnitudes, ['e3']);
    assertClean(JSON.stringify(a), LEAF_ID, TREE_ID, hex('a'), '970378', '970,378');
  });

  it('says when the confirmation was not checked and flags an exited coin', () => {
    const ctx = sparkLeafContext(leaf(LEAF_ID, 1024, { status: 'exited', createdAt: undefined }), path, null, NOW);
    assert.match(ctx.full.description, /confirmation not checked/);
    const a = toAbstractSignal(ctx.signal)!;
    assert.deepEqual(a.flags, { spark: true, leaf: true, exited: true });
    assert.equal(a.ages, undefined);
  });
});

describe('sparkscanTxContext', () => {
  it('describes a token transaction unnamed, with its parties', () => {
    const t: SparkscanTx = {
      id: hex('e'), kind: 'token', rawType: 'TOKEN_MULTI_TRANSFER', status: 'confirmed', amountSats: null, from: null, to: null, createdAt: NOW - 100, bitcoinTxid: null,
      multi: { inputs: [{ kind: 'spark', address: MY_ADDRESS, pubkey: ME, label: '' }], outputs: [{ kind: 'spark', address: OTHER_ADDRESS, pubkey: OTHER, label: '' }, { kind: 'other', address: null, pubkey: null, label: 'Burn' }] },
    };
    const ctx = sparkscanTxContext(t, NOW);
    assert.match(ctx.full.description, /^Spark token transaction e{64}/);
    assert.match(ctx.full.description, /unnamed: no name, ticker or amount/);
    assert.match(ctx.full.description, /Inputs \(1\): spark1/);
    assert.match(ctx.full.description, /Outputs \(2\): spark1\S+, Burn\./);
    assert.ok(!ctx.full.description.includes(ME));
    const a = toAbstractSignal(ctx.signal)!;
    assert.deepEqual(a.shape, { addresses: 2, txs: 1, utxos: 0, inputCount: 1, outputCount: 2 });
    assert.deepEqual(a.flags, { spark: true, token: true, tokens: true, multi: true });
    assert.equal(a.magnitudes, undefined);
  });

  it('describes a deposit seen by Sparkscan with its Bitcoin transaction', () => {
    const t: SparkscanTx = { id: hex('1'), kind: 'deposit', rawType: 'BITCOIN_DEPOSIT', status: 'confirmed', amountSats: 50_000, from: { kind: 'bitcoin', address: null, pubkey: null, label: 'Bitcoin' }, to: { kind: 'spark', address: MY_ADDRESS, pubkey: ME, label: '' }, createdAt: null, bitcoinTxid: hex('2') };
    const ctx = sparkscanTxContext(t, NOW);
    assert.match(ctx.full.description, /^Spark transfer 1{64}/);
    assert.match(ctx.full.description, /Amount: 50,000 sats/);
    assert.match(ctx.full.description, /From Bitcoin to spark1/);
    assert.match(ctx.full.description, /Bitcoin transaction: 2{64}/);
    assert.deepEqual(ctx.full.subjects.map(s => s.kind), ['txid', 'address', 'txid']);
    assert.deepEqual(toAbstractSignal(ctx.signal)!.magnitudes, ['e4']);
  });
});

describe('arkadeAddressContext and arkadeVtxoContext', () => {
  const ARK = 'ark1qexampleaddressexampleaddressexampleaddressexampleaddressexampleaddr';
  const vtxo: ArkadeVtxo = { txid: hex('3'), vout: 1, amountSats: 21_000, isSpent: false, isSwept: false, isPreconfirmed: true, createdAt: NOW - 86_400 * 40, expiresAt: NOW + 86_400 * 20, commitmentTxids: [hex('4')] };
  const info: ArkadeAddressInfo = { address: ARK, scriptHex: '5120' + hex('5'), spendableSats: 21_000, spendableCount: 1, totalCount: 2, vtxos: [vtxo, { ...vtxo, vout: 2, isSpent: true, isPreconfirmed: false, spentBy: hex('6') }] };

  it('describes an Arkade address with its VTXOs declared', () => {
    const ctx = arkadeAddressContext(info, NOW);
    assert.match(ctx.full.description, /^Arkade address ark1q/);
    assert.match(ctx.full.description, /Spendable: 21,000 sats in 1 spendable VTXO, 2 VTXOs in all/);
    assert.match(ctx.full.description, /- 3{64}:1: 21,000 sats, preconfirmed/);
    assert.match(ctx.full.description, /- 3{64}:2: 21,000 sats, spent/);
    assert.ok(!ctx.full.description.includes(hex('5')), 'the script is not printed');
    const kinds = ctx.full.subjects.map(s => s.kind);
    assert.deepEqual(kinds, ['address', 'vtxo', 'txid', 'vtxo']);
    const a = toAbstractSignal(ctx.signal)!;
    assert.deepEqual(a.shape, { addresses: 1, txs: 2, utxos: 1, inputCount: undefined, outputCount: undefined });
    assert.deepEqual(a.flags, { arkade: true, address: true, preconfirmed: true });
    assert.deepEqual(a.magnitudes, ['e4']);
    assert.deepEqual(a.ages, ['1-6m']);
    assertClean(JSON.stringify(a), ARK, hex('3'), hex('4'));
  });

  it('describes an Arkade VTXO with its commitment, exit path and wait', () => {
    const path: ArkadeExitPath = { commitmentTxid: hex('4'), batchVout: 0, anchorSats: 100_000, steps: [
      { txid: hex('7'), type: 'tree', outputs: [{ amountSats: 50_000, ours: true }, { amountSats: 50_000, ours: false }], ourIndex: 0, branchSats: 50_000, expiresAt: NOW + 86_400 * 20 },
      { txid: hex('8'), type: 'ark', outputs: [{ amountSats: 21_000, ours: true }, { amountSats: 29_000, ours: false }], ourIndex: 0, branchSats: 21_000 },
    ] };
    const arkInfo: ArkadeInfo = { version: '1', network: 'bitcoin', signerPubkey: OTHER, forfeitAddress: 'bc1qforfeit', sessionDurationSec: 60, dustSats: 330, vtxoMinSats: 1000, vtxoMaxSats: 0, unilateralExitDelay: 614_400, maxTxWeight: 0 };
    const ctx = arkadeVtxoContext({ id: `${hex('3')}:1`, vtxo, path, info: arkInfo, address: ARK }, NOW);
    assert.match(ctx.full.description, /^Arkade VTXO 3{64}:1/);
    assert.match(ctx.full.description, /21,000 sats, preconfirmed, expires/);
    assert.match(ctx.full.description, /held by ark1q/);
    assert.match(ctx.full.description, /commitment transaction 4{64}, batch output 0 \(100,000 sats\)/);
    assert.match(ctx.full.description, /2 pre-signed transactions to broadcast, then wait 7\.1 days/);
    assert.match(ctx.full.description, /- ark 8{64}: 2 outputs, branch 21,000 sats/);
    assert.ok(!ctx.full.description.includes(OTHER), 'the operator key is not printed');
    assert.deepEqual(ctx.full.subjects.map(s => s.kind), ['vtxo', 'address', 'txid', 'txid', 'txid']);
    const a = toAbstractSignal(ctx.signal)!;
    assert.deepEqual(a.flags, { arkade: true, vtxo: true, preconfirmed: true, served: true });
    assert.deepEqual(a.shape, { addresses: 1, txs: 2, utxos: 1, inputCount: undefined, outputCount: undefined });
  });

  it('calls a coin spent then swept "spent", never "swept by the operator"', () => {
    const both: ArkadeVtxo = { ...vtxo, isSpent: true, isSwept: true, isPreconfirmed: true, spentBy: hex('6') };
    const addr = arkadeAddressContext({ ...info, spendableSats: 0, spendableCount: 0, totalCount: 1, vtxos: [both] }, NOW);
    assert.match(addr.full.description, /- 3{64}:1: 21,000 sats, spent,/);
    assert.ok(!addr.full.description.includes('swept by the operator'));
    const sweptOnly = arkadeAddressContext({ ...info, vtxos: [{ ...vtxo, isSwept: true }] }, NOW);
    assert.match(sweptOnly.full.description, /- 3{64}:1: 21,000 sats, swept by the operator,/);
    const path: ArkadeExitPath = { commitmentTxid: hex('4'), batchVout: 0, anchorSats: 100_000, steps: [{ txid: hex('7'), type: 'tree', outputs: [{ amountSats: 21_000, ours: true }], ourIndex: 0, branchSats: 21_000 }] };
    const coin = arkadeVtxoContext({ id: `${hex('3')}:1`, vtxo: both, path, info: null, address: ARK }, NOW);
    assert.match(coin.full.description, /21,000 sats, spent, expires/);
  });

  it('says when the indexer did not serve the coin itself', () => {
    const path: ArkadeExitPath = { commitmentTxid: hex('4'), batchVout: 0, anchorSats: 100_000, steps: [{ txid: hex('7'), type: 'tree', outputs: [{ amountSats: 50_000, ours: true }], ourIndex: 0, branchSats: 50_000, expiresAt: NOW - 10 }] };
    const ctx = arkadeVtxoContext({ id: `${hex('3')}:1`, vtxo: null, path, info: null, address: null }, NOW);
    assert.match(ctx.full.description, /50,000 sats, state not served by the indexer/);
    assert.ok(!ctx.full.description.includes('then wait'));
    const a = toAbstractSignal(ctx.signal)!;
    assert.deepEqual(a.flags, { arkade: true, vtxo: true, expired: true });
  });
});

// A VTXO's expiry can be a block height with no date at all. The context then
// says the block, as the Bark one does, and never a date in January 1970 (a
// height read as unix seconds), nor an "expired" flag judged against the clock.
describe('Arkade context when the expiry is a block height', () => {
  const ARK = 'ark1qexampleaddressexampleaddressexampleaddressexampleaddressexampleaddr';
  const HEIGHT = 850_123;
  const blockOf = /expires[^\n,]*\b(?:block|height)\b[^\n,]*850,?123/i;
  const base: ArkadeVtxo = { txid: hex('3'), vout: 1, amountSats: 21_000, isSpent: false, isSwept: false, isPreconfirmed: false, createdAt: NOW - 86_400 * 40, commitmentTxids: [hex('4')] };
  // Fields the production types gain with the fix; set through a cast so this file reads the same before it.
  const withHeight = { ...base, expiresAtHeight: HEIGHT } as ArkadeVtxo;
  const exitPath = (stepExpiry: Record<string, number>): ArkadeExitPath => ({
    commitmentTxid: hex('4'), batchVout: 0, anchorSats: 100_000,
    steps: [{ txid: hex('7'), type: 'tree', outputs: [{ amountSats: 50_000, ours: true }], ourIndex: 0, branchSats: 50_000, ...stepExpiry }] as ArkadeExitPath['steps'],
  });

  it('writes the block in the address page row, not a date', () => {
    const info: ArkadeAddressInfo = { address: ARK, scriptHex: '5120' + hex('5'), spendableSats: 21_000, spendableCount: 1, totalCount: 1, vtxos: [withHeight] };
    const text = arkadeAddressContext(info, NOW).full.description;
    assert.match(text, blockOf);
    assert.ok(!/1970/.test(text), 'no date in 1970');
    assert.ok(!/expires undated/.test(text), 'the expiry is known');
  });

  it('still writes a date for a date expiry', () => {
    const dated: ArkadeVtxo = { ...base, expiresAt: NOW + 86_400 * 20 };
    const info: ArkadeAddressInfo = { address: ARK, scriptHex: '5120' + hex('5'), spendableSats: 21_000, spendableCount: 1, totalCount: 1, vtxos: [dated] };
    assert.match(arkadeAddressContext(info, NOW).full.description, /expires \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC/);
  });

  it('writes the block for a coin page, and does not judge a height against the clock', () => {
    const ctx = arkadeVtxoContext({ id: `${hex('3')}:1`, vtxo: withHeight, path: exitPath({}), info: null, address: null }, NOW);
    assert.match(ctx.full.description, blockOf);
    assert.ok(!/1970/.test(ctx.full.description), 'no date in 1970');
    // 850,123 is below the clock's seconds, yet no tip is known: not expired.
    assert.equal(toAbstractSignal(ctx.signal)!.flags!.expired, undefined);
  });

  it('writes the block of the exit path steps too', () => {
    const ctx = arkadeVtxoContext({ id: `${hex('3')}:1`, vtxo: withHeight, path: exitPath({ expiresAtHeight: HEIGHT }), info: null, address: null }, NOW);
    const stepLine = ctx.full.description.split('\n').find(l => l.startsWith(`- tree ${hex('7')}`))!;
    assert.match(stepLine, /expires[^\n,]*\b(?:block|height)\b[^\n,]*850,?123/i);
    assert.ok(!/1970/.test(ctx.full.description));
  });

  it('takes the height from the last step when the indexer does not serve the coin', () => {
    const ctx = arkadeVtxoContext({ id: `${hex('3')}:1`, vtxo: null, path: exitPath({ expiresAtHeight: HEIGHT }), info: null, address: null }, NOW);
    assert.match(ctx.full.description, blockOf);
    assert.ok(!/1970/.test(ctx.full.description));
    assert.equal(toAbstractSignal(ctx.signal)!.flags!.expired, undefined);
  });

  it('still flags a date expiry in the past as expired', () => {
    const ctx = arkadeVtxoContext({ id: `${hex('3')}:1`, vtxo: { ...base, expiresAt: NOW - 10 }, path: exitPath({}), info: null, address: null }, NOW);
    assert.equal(toAbstractSignal(ctx.signal)!.flags!.expired, true);
  });
});

describe('barkAddressContext and barkVtxoContext', () => {
  const BARK = 'ark1pexampleaddressexampleaddressexampleaddressexampleaddressexampleaddr';

  it('describes a Bark address from what it says about itself, and nothing readable beyond', () => {
    const a: BarkAddress = { address: BARK, testnet: false, arkId: 'e6af17ba', policy: { kind: 'pubkey', userPubkey: ME }, delivery: [{ kind: 'mailbox', blindedId: 'ab'.repeat(16) }] };
    const ctx = barkAddressContext(a, 'Second');
    assert.match(ctx.full.description, /^Bark address ark1p/);
    assert.match(ctx.full.description, /Issued for server e6af17ba \(Second\)\. Policy: a single owner key\. Delivery: a mailbox on the server\./);
    assert.match(ctx.full.description, /only to their owner/);
    assert.ok(!ctx.full.description.includes(ME) && !ctx.full.description.includes('ab'.repeat(16)));
    assert.deepEqual(ctx.full.subjects, [{ kind: 'address', value: BARK }]);
    const abs = toAbstractSignal(ctx.signal)!;
    assert.deepEqual(abs.flags, { bark: true, address: true, private: true });
    assert.deepEqual(abs.shape, { addresses: 1, txs: 0, utxos: 0, inputCount: undefined, outputCount: undefined });
  });

  it('describes a Bark VTXO with its origin, expiry against the tip, anchor and exit path', () => {
    const v: BarkVtxo = {
      encodingVersion: 1, id: `${hex('9')}:0`, point: { txid: hex('9'), vout: 0 }, amountSats: 10_000, expiryHeight: 920_000, serverPubkey: OTHER, exitDeltaBlocks: 12,
      anchor: { txid: hex('a'), vout: 1 },
      genesis: [
        { kind: 'cosigned', signers: 3, cosigners: [], signed: true, outputs: 2, outputIndex: 0, siblings: [], feeSats: 0 },
        { kind: 'arkoor', signers: 1, cosigners: [], signed: true, outputs: 2, outputIndex: 1, siblings: [], feeSats: 0 },
      ],
      policy: { kind: 'pubkey', userPubkey: ME },
    };
    const ctx = barkVtxoContext({ vtxo: v, info: null, tip: 919_000, anchor: { confirmed: true, blockHeight: 915_000, blockTime: NOW - 86_400 * 30 } }, NOW);
    assert.match(ctx.full.description, /^Bark VTXO 9{64}:0/);
    assert.match(ctx.full.description, /10,000 sats, from a round, then 1 arkoor payment outside a round\. Expires at block 920,000, 1,000 blocks away \(about 7 days\)/);
    assert.match(ctx.full.description, /Anchored on Bitcoin by a{64}:1, confirmed in block 915,000/);
    assert.match(ctx.full.description, /2 pre-signed transactions, each waiting 12 blocks/);
    assert.ok(!ctx.full.description.includes(ME) && !ctx.full.description.includes(OTHER));
    assert.deepEqual(ctx.full.subjects, [{ kind: 'vtxo', value: `${hex('9')}:0` }, { kind: 'outpoint', value: `${hex('a')}:1` }]);
    const abs = toAbstractSignal(ctx.signal)!;
    assert.deepEqual(abs.flags, { bark: true, vtxo: true, settled: true });
    assert.deepEqual(abs.magnitudes, ['e4']);
    assert.deepEqual(abs.ages, ['1-6m']);
    assertClean(JSON.stringify(abs), hex('9'), hex('a'), '920000', '915000');
  });

  it('flags an expired Bark coin', () => {
    const v: BarkVtxo = {
      encodingVersion: 1, id: `${hex('9')}:0`, point: { txid: hex('9'), vout: 0 }, amountSats: 10_000, expiryHeight: 900_000, serverPubkey: OTHER, exitDeltaBlocks: 12,
      anchor: { txid: hex('a'), vout: 1 }, genesis: [], policy: { kind: 'server-owned' },
    };
    const ctx = barkVtxoContext({ vtxo: v, info: null, tip: 919_000, anchor: null }, NOW);
    assert.match(ctx.full.description, /Expires expired \(block 900,000 is past\)/);
    assert.match(ctx.full.description, /Policy: server-owned/);
    assert.equal(toAbstractSignal(ctx.signal)!.flags!.expired, true);
  });
});
