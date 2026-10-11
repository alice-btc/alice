import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  decodeBalanceResponse, decodeNodesResponse, decodeSparkAddress, decodeTransfersResponse, decodeUtxosResponse,
  encodeBalanceRequest, encodeQueryNodesRequest, encodeTransferFilter, encodeTransfersByIdRequest, encodeUtxosRequest,
  formatSparkBlocks, isAnchorOutput, looksLikeSparkAddress, looksLikeSparkId, mergeSparkTransfers, parseRawTx, sequenceBlocks,
  sparkAddressOf, sparkTransferLabel, takeFrames, SPARK_SSP_PUBKEY, type SparkTransfer,
} from './spark.ts';
import { BALANCE_HEX, CHAIN_NODES, NODE_SINGLE_HEX, TRANSFER_MIN_HEX, TRANSFER_SWAP_HEX, UTXOS_HEX } from './spark.fixtures.ts';

const PK = '03f5ce35a29fc2e5a41afe760d6c714e0f76dfc12d00f5c01eef4d8c1e3eb3fcab';
const ADDR = 'spark1pgss8awwxk3flsh95sd0uasdd3c5urmkmlqj6q84cq0w7nvvrclt8l9t2g404q';
const BIG_PK = '037579aee81891fc3a28cbe7b13e565031d46248b420fb39dcb308598f472b4513';
const BIG_ADDR = 'spark1pgssxate4m5p3y0u8g5vhea38et9qvw5vfytgg8m88wtxzze3arjk3gn2sgflz';
const BIG_LEGACY = 'sp1pgssxate4m5p3y0u8g5vhea38et9qvw5vfytgg8m88wtxzze3arjk3gnx42kxc';

const hex = (b: Uint8Array) => Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
const bytes = (h: string) => Uint8Array.from(h.match(/../g)!.map(x => parseInt(x, 16)));

describe('Spark addresses', () => {
  it('encodes an identity key the way Sparkscan prints it', () => {
    assert.equal(sparkAddressOf(PK), ADDR);
    assert.equal(sparkAddressOf(PK.toUpperCase()), ADDR);
    assert.equal(sparkAddressOf('deadbeef'), null);
    assert.equal(sparkAddressOf('04' + PK.slice(2)), null);
  });

  it('decodes both spellings to the same key and names the current one', () => {
    const current = decodeSparkAddress(BIG_ADDR);
    assert.deepEqual(current, { pubkey: BIG_PK, network: 'mainnet', legacy: false, canonical: BIG_ADDR });
    const legacy = decodeSparkAddress(BIG_LEGACY);
    assert.deepEqual(legacy, { pubkey: BIG_PK, network: 'mainnet', legacy: true, canonical: BIG_ADDR });
    assert.equal(decodeSparkAddress(BIG_ADDR.toUpperCase())?.pubkey, BIG_PK);
  });

  it('round-trips the other networks', () => {
    const rt = sparkAddressOf(PK, 'regtest')!;
    assert.ok(rt.startsWith('sparkrt1'));
    assert.equal(decodeSparkAddress(rt)?.network, 'regtest');
    assert.equal(decodeSparkAddress(rt)?.pubkey, PK);
  });

  it('rejects what is not a Spark address', () => {
    assert.equal(decodeSparkAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'), null);
    assert.equal(decodeSparkAddress('spark1garbage'), null);
    assert.equal(decodeSparkAddress(''), null);
    // A valid bech32m string under the right prefix whose payload is not a key.
    assert.equal(decodeSparkAddress('spark1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9hlqse'), null);
  });

  it('recognises the shapes it routes', () => {
    assert.ok(looksLikeSparkAddress(ADDR));
    assert.ok(looksLikeSparkAddress(BIG_LEGACY));
    assert.ok(looksLikeSparkAddress(` ${ADDR.toUpperCase()} `));
    assert.ok(!looksLikeSparkAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'));
    assert.ok(!looksLikeSparkAddress('ark1qzpq904'));
    assert.ok(looksLikeSparkId('01a1259e-4ea0-720a-9e1d-456db56839d2'));
    assert.ok(looksLikeSparkId('01A1259E-4EA0-720A-9E1D-456DB56839D2'));
    assert.ok(!looksLikeSparkId('01a1259e4ea0720a9e1d456db56839d2'));
    assert.ok(!looksLikeSparkId('a'.repeat(64)));
  });
});

describe('Spark request encoding (byte for byte like the SDK)', () => {
  it('TransferFilter: either side, or one side (the operators answer those in a second)', () => {
    assert.equal(hex(encodeTransferFilter({ pubkey: PK, limit: 3 })), `2001c00203e20321${PK}`);
    assert.equal(hex(encodeTransferFilter({ pubkey: PK, limit: 20, offset: 40 })), `2001c00214900328e20321${PK}`);
    assert.equal(hex(encodeTransferFilter({ pubkey: PK, limit: 20, side: 'receiver' })), `0a21${PK}2001c00214`);
    assert.equal(hex(encodeTransferFilter({ pubkey: PK, limit: 20, side: 'sender' })), `1221${PK}2001c00214`);
  });

  it('merges the two sides newest first, without duplicates', () => {
    const t = (id: string, createdAt?: number): SparkTransfer => ({ id, senderPubkey: PK, receiverPubkey: BIG_PK, status: 'completed', type: 'transfer', totalSats: 1, leaves: [], ...(createdAt !== undefined ? { createdAt } : {}) });
    const merged = mergeSparkTransfers([t('01a1-b', 20), t('01a1-a', 10)], [t('01a1-c', 30), t('01a1-b', 20), t('01a1-d')]);
    assert.deepEqual(merged.map(x => x.id), ['01a1-c', '01a1-b', '01a1-a', '01a1-d']);
    // Same second: the time-ordered id decides.
    assert.deepEqual(mergeSparkTransfers([t('01a2-x', 5)], [t('01a3-y', 5)]).map(x => x.id), ['01a3-y', '01a2-x']);
  });
  it('QueryTransfersByIdRequest', () => {
    assert.equal(hex(encodeTransfersByIdRequest(['01a1259e-4ea0-720a-9e1d-456db56839d2'])), '0a2430316131323539652d346561302d373230612d396531642d3435366462353638333964321001');
  });
  it('QueryNodesRequest by owner and by ids', () => {
    assert.equal(hex(encodeQueryNodesRequest({ owner: PK, limit: 50, statuses: [1] })), `0a21${PK}203230013a0101`);
    assert.equal(hex(encodeQueryNodesRequest({ nodeIds: ['01a117a8-cb94-78cb-b740-28d01aeab9b9'], includeParents: true })), '12260a2430316131313761382d636239342d373863622d623734302d3238643031616561623962391801');
  });
  it('QueryBalanceRequest and GetUtxosForAddressRequest', () => {
    assert.equal(hex(encodeBalanceRequest(PK)), `0a21${PK}1001`);
    assert.equal(hex(encodeUtxosRequest('bc1p6q7nl3ag0f3azhjhm0pearf7q2chta9xr2hj09rk96atvkc9mansyv6lde', 5)), '0a3e626331703671376e6c336167306633617a686a686d3070656172663771326368746139787232686a3039726b39366174766b63396d616e737976366c646518052001');
  });
});

describe('Spark response decoding', () => {
  it('reads a leaf as the operator serves it', () => {
    const page = decodeNodesResponse(bytes(NODE_SINGLE_HEX));
    assert.equal(page.items.length, 1);
    const leaf = page.items[0];
    assert.equal(leaf.id, '01a117a8-cb94-78cb-b740-28d01aeab9b9');
    assert.equal(leaf.treeId, '01a117a8-945b-71ff-9a32-4fa1becf34dc');
    assert.equal(leaf.parentId, '01a117a8-cb7b-79ac-ae7b-b2953700599f');
    assert.equal(leaf.valueSats, 1024);
    assert.equal(leaf.vout, 0);
    assert.equal(leaf.status, 'available');
    assert.equal(leaf.ownerPubkey, BIG_PK);
    assert.equal(leaf.nodeTx.length, 107);
    assert.equal(leaf.refundTx.length, 107);
    assert.equal(leaf.createdAt, 1791398300);
  });

  it('reads a transfer with its leaf and the page offset', () => {
    const page = decodeTransfersResponse(bytes(TRANSFER_MIN_HEX));
    assert.equal(page.nextOffset, 1);
    assert.equal(page.items.length, 1);
    const t = page.items[0];
    assert.equal(t.id, '01a1259e-4ea0-720a-9e1d-456db56839d2');
    assert.equal(t.senderPubkey, PK);
    assert.equal(t.receiverPubkey, BIG_PK);
    assert.equal(t.status, 'completed');
    assert.equal(t.type, 'transfer');
    assert.equal(t.totalSats, 1024);
    assert.equal(t.createdAt, 1791632494);
    assert.equal(t.leaves.length, 1);
    assert.equal(t.leaves[0].id, '01a117a8-cb94-78cb-b740-28d01aeab9b9');
  });

  it('reads a Lightning swap (type 0, absent on the wire) and the end marker', () => {
    const page = decodeTransfersResponse(bytes(TRANSFER_SWAP_HEX));
    assert.equal(page.nextOffset, null);
    const t = page.items[0];
    assert.equal(t.type, 'preimage-swap');
    assert.equal(t.senderPubkey, SPARK_SSP_PUBKEY);
    assert.deepEqual(t.leaves, []);
    assert.equal(sparkTransferLabel(t), 'Lightning payment received');
  });

  it('reads a balance and the deposit outpoints', () => {
    assert.deepEqual(decodeBalanceResponse(bytes(BALANCE_HEX)), { sats: 1536, leaves: 2 });
    assert.deepEqual(decodeUtxosResponse(bytes(UTXOS_HEX)), [{ txid: '52fec99293e50c9401d4085046fe9a12b770224cdfb193dc802ba7fe21bc4019', vout: 0 }]);
    assert.deepEqual(decodeBalanceResponse(new Uint8Array()), { sats: 0, leaves: 0 });
  });

  it('splits gRPC-web frames and reads the trailer block', () => {
    const msg = bytes(BALANCE_HEX);
    const trailer = new TextEncoder().encode('grpc-status: 0\r\n');
    const body = new Uint8Array(5 + msg.length + 5 + trailer.length);
    new DataView(body.buffer).setUint32(1, msg.length);
    body.set(msg, 5);
    body[5 + msg.length] = 0x80;
    new DataView(body.buffer).setUint32(5 + msg.length + 1, trailer.length);
    body.set(trailer, 5 + msg.length + 5);
    const frames = takeFrames(body);
    assert.equal(frames.messages.length, 1);
    assert.equal(hex(frames.messages[0]), BALANCE_HEX);
    assert.deepEqual(frames.trailers, { 'grpc-status': '0' });
  });
});

describe('pre-signed transactions', () => {
  const byId = new Map(CHAIN_NODES.map(n => [n.id, n]));
  const leaf = byId.get('01a117a8-cb94-78cb-b740-28d01aeab9b9')!;

  it('parses a leaf transaction: version 3, its timelock, the coin and the anchor', () => {
    const tx = parseRawTx(bytes(leaf.nodeTx));
    assert.equal(tx.version, 3);
    assert.equal(tx.inputs.length, 1);
    assert.equal(tx.inputs[0].txid, '59e466cfdae67c0b9b0fbb04206c89348d2220fef15e9dbd267bc0fc5c6f750a');
    assert.equal(tx.inputs[0].vout, 0);
    assert.equal(sequenceBlocks(tx.inputs[0].sequence), 1800);
    assert.equal(tx.outputs.length, 2);
    assert.equal(tx.outputs[0].valueSats, 1024);
    assert.ok(tx.outputs[0].scriptHex.startsWith('5120'));
    assert.ok(isAnchorOutput(tx.outputs[1]));
    assert.equal(tx.outputs[1].valueSats, 0);
    assert.equal(tx.locktime, 0);
  });

  it('computes txids: the refund spends the leaf transaction, each child its parent', () => {
    const leafTx = parseRawTx(bytes(leaf.nodeTx));
    const refund = parseRawTx(bytes(leaf.refundTx));
    assert.equal(refund.inputs[0].txid, leafTx.txid);
    assert.equal(sequenceBlocks(refund.inputs[0].sequence), 1000);
    let links = 0;
    for (const n of CHAIN_NODES) {
      if (!n.parent) continue;
      const parent = byId.get(n.parent)!;
      // Parents carry a witness (signed); the txid must skip it.
      assert.equal(parseRawTx(bytes(n.nodeTx)).inputs[0].txid, parseRawTx(bytes(parent.nodeTx)).txid);
      links++;
    }
    assert.equal(links, 12);
  });

  it('reads BIP 68 sequences', () => {
    assert.equal(sequenceBlocks(0xffffffff), null);
    assert.equal(sequenceBlocks(0xfffffffe), null);
    assert.equal(sequenceBlocks(0x00400010), null);
    assert.equal(sequenceBlocks(1000), 1000);
    assert.equal(sequenceBlocks(0), 0);
  });

  it('words a wait in blocks', () => {
    assert.equal(formatSparkBlocks(1000), '1,000 blocks (about 7 days)');
    assert.equal(formatSparkBlocks(150), '150 blocks (about a day)');
    assert.equal(formatSparkBlocks(12), '12 blocks (about 2 hours)');
    assert.equal(formatSparkBlocks(1), '1 block (about 1 hour)');
  });
});
