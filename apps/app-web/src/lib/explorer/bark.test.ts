import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  arkAddressFlavor, arkIdFor, decodeArkInfo, decodeBarkAddress, decodeRoundEvent, readMessage,
  takeFrames, txidFromRawTx, BarkError,
} from './bark.ts';

const hex = (s: string) => Uint8Array.from(s.match(/../g)!.map(h => parseInt(h, 16)));

// Replies captured from Second's mainnet server (ark.second.tech) on 2026-10-08.
const ARK_INFO_REPLY = '00000000ed0a07626974636f696e12210375b2e4f6abe5b00736359de211c35d9e72b615e5fd424d8ad1e68a8b300b97b518901c200a28900130c01f38f007400c4880ade204500258fa0168e8fe0270ac09820121037bb26bfe7a819c2285f4cfdba63e1d806cb37d04915f17447c76140c34cf73a99201530a0012181085031a0310d00f1a0608f00710a01f1a0608e00f1088271a1a1200120608a00210d00f120608f00710a01f120608e00f10882722002a1708141a0310d00f1a0608f00710a01f1a0608e00f108827980164a00164a801c01fb2011968747470733a2f2f7365636f6e642e746563682f7465726d73800000000f677270632d7374617475733a300d0a';
const LAST_ROUND_REPLY = '00000000072a0508c0918218800000000f677270632d7374617475733a300d0a';

// A real segwit mainnet transaction and its txid, for the round-tx hashing.
const SEGWIT_TX = '02000000000101e02ebf153dc8a90942fa8f0f704b3d21b6bdc2ed87e4d200fb36b3c957f4fac90200000000ffffffff027094000000000000225120b2bca35193576f415a74a208767475784d18ccb2218746addbdddd93240a01394d6da90000000000225120f52688909bf76e9861cdeb996e83e6eb390e19e9f54b0be042395bfa93bdf40e01407349ba75d57c528718c24816b675936d6c2847b0999e44447d8a70c0f94270f747e63d2a0b5549984c6524477ca762d0ff3f3e35cdcfdfb36c92f82ea5d8948600000000';
const SEGWIT_TXID = '086f74e380432214902bc8d7e24d3eb57ba97b9b36811cec10ee44e3c7bcf12b';

// Bark's own address test vector (lib/src/address.rs, address_roundtrip).
const BARK_ADDRESS = 'ark1pwh9vsmezqqpharv69q4z8m6x364d5m5prnmcalcalq9pdmzw0y7mpveck4pcfhezqypczkrrj3lkx5ue4qrf4jc7ztpt9htdttmh2judhqnu7aue8p0y9mqkr4cf5';
const BARK_TEST_ADDRESS = 'tark1pwh9vsmezqqpharv69q4z8m6x364d5m5prnmcalcalq9pdmzw0y7mpveck4pcfhezqypczkrrj3lkx5ue4qrf4jc7ztpt9htdttmh2judhqnu7aue8p0y9mq47jn9z';
const ARKADE_ADDRESS = 'ark1qzpq904am6clw3pgqwyh4p02708fy4xs0hcpwt7rwfdttuxsjameezgu4rz4mh977mt5zc2gquwfdy94npcvgfg865k8dt077z5a70aykxu669';

describe('gRPC-web frames', () => {
  it('splits a unary reply into its message and trailers', () => {
    const { messages, trailers, rest } = takeFrames(hex(ARK_INFO_REPLY));
    assert.equal(messages.length, 1);
    assert.equal(messages[0].length, 0xed);
    assert.deepEqual(trailers, { 'grpc-status': '0' });
    assert.equal(rest.length, 0);
  });

  it('keeps an incomplete frame for the next chunk of a stream', () => {
    const full = hex(LAST_ROUND_REPLY);
    const first = takeFrames(full.subarray(0, 9));
    assert.equal(first.messages.length, 0);
    assert.equal(first.trailers, null);
    assert.equal(first.rest.length, 9);
    const joined = new Uint8Array([...first.rest, ...full.subarray(9)]);
    const second = takeFrames(joined);
    assert.equal(second.messages.length, 1);
    assert.deepEqual(second.trailers, { 'grpc-status': '0' });
  });
});

describe('decodeArkInfo', () => {
  it('reads the parameters of Second\'s mainnet server', () => {
    const info = decodeArkInfo(readMessage(takeFrames(hex(ARK_INFO_REPLY)).messages[0]));
    assert.equal(info.network, 'bitcoin');
    assert.equal(info.serverPubkey, '0375b2e4f6abe5b00736359de211c35d9e72b615e5fd424d8ad1e68a8b300b97b5');
    assert.equal(info.roundIntervalSec, 3600);
    assert.equal(info.vtxoLifetimeBlocks, 4032);
    assert.equal(info.exitDeltaBlocks, 144);
    assert.equal(info.maxVtxoSats, 10_000_000);
    assert.equal(info.minBoardSats, 49_000);
    assert.equal(info.boardConfirmations, 2);
    assert.equal(info.maxExitDepth, 100);
    assert.equal(info.tosLink, 'https://second.tech/terms');
  });

  it('reads the fee schedule as published on second.tech/pricing', () => {
    const { fees } = decodeArkInfo(readMessage(takeFrames(hex(ARK_INFO_REPLY)).messages[0]));
    assert.deepEqual(fees.board, { minSats: 0, baseSats: 0, ppm: 0 });
    // Refresh: free under 2 days left, then 0.2%, 0.4%, 0.5%.
    assert.deepEqual(fees.refresh.tiers, [
      { fromBlocksLeft: 0, ppm: 0 },
      { fromBlocksLeft: 288, ppm: 2000 },
      { fromBlocksLeft: 1008, ppm: 4000 },
      { fromBlocksLeft: 2016, ppm: 5000 },
    ]);
    assert.equal(fees.lightningSend.minSats, 20);
    assert.deepEqual(fees.lightningSend.tiers.map(t => t.ppm), [2000, 4000, 5000]);
    assert.deepEqual(fees.lightningReceive, { baseSats: 0, ppm: 0 });
  });
});

describe('round events', () => {
  it('reads a failed round', () => {
    const e = decodeRoundEvent(readMessage(takeFrames(hex(LAST_ROUND_REPLY)).messages[0]));
    assert.deepEqual(e, { kind: 'failed', roundSeq: 50_366_656 });
  });

  it('reads a finished round and hashes its transaction', () => {
    // RoundEvent { finished (4): RoundFinished { round_seq 7, attempt_seq 1, signed_round_tx } }
    const tx = hex(SEGWIT_TX);
    const inner = new Uint8Array([0x08, 7, 0x10, 1, 0x1a, ...varint(tx.length), ...tx]);
    const msg = new Uint8Array([0x22, ...varint(inner.length), ...inner]);
    assert.deepEqual(decodeRoundEvent(readMessage(msg)), {
      kind: 'finished', roundSeq: 7, attemptSeq: 1, txid: SEGWIT_TXID,
    });
  });

  it('computes a segwit txid without the witness data', () => {
    assert.equal(txidFromRawTx(hex(SEGWIT_TX)), SEGWIT_TXID);
  });
});

describe('Bark addresses', () => {
  it('tells Bark and Arkade addresses apart by their version', () => {
    assert.equal(arkAddressFlavor(BARK_ADDRESS), 'bark');
    assert.equal(arkAddressFlavor(BARK_TEST_ADDRESS), 'bark');
    assert.equal(arkAddressFlavor(ARKADE_ADDRESS), 'arkade');
    assert.equal(arkAddressFlavor('bc1qzzdzp5c443vsetzatf2ra6hku322y7e5aq50rs'), null);
  });

  it('decodes the server id, the policy and the delivery', () => {
    const a = decodeBarkAddress(BARK_ADDRESS);
    assert.equal(a.testnet, false);
    // The vector's server key 02037188…; the user key is the public key of
    // the vector's secret 6b0f02…, both from Bark's test.
    assert.equal(a.arkId, arkIdFor('02037188bdd7579a0cd0b22a51110986df1ea08e30192658fe0e219590e4a723d3'));
    assert.deepEqual(a.policy, { kind: 'pubkey', userPubkey: '037e8d9a282a23ef468eaada6e811cf78eff1df80a16ec4e793db0b338b54384df' });
    assert.equal(a.delivery.length, 1);
    assert.equal(a.delivery[0].kind, 'mailbox');
    assert.equal(decodeBarkAddress(BARK_TEST_ADDRESS).testnet, true);
  });

  it('rejects a corrupted checksum and an Arkade address', () => {
    assert.throws(() => decodeBarkAddress(`${BARK_ADDRESS.slice(0, -1)}q`), BarkError);
    assert.throws(() => decodeBarkAddress(ARKADE_ADDRESS), BarkError);
  });

  it('derives Second\'s mainnet server id', () => {
    assert.equal(arkIdFor('0375b2e4f6abe5b00736359de211c35d9e72b615e5fd424d8ad1e68a8b300b97b5'), 'e6af17ba');
    assert.equal(arkIdFor('not a key'), '');
  });
});

function varint(n: number): number[] {
  const out: number[] = [];
  while (n >= 0x80) { out.push((n & 0x7f) | 0x80); n = Math.floor(n / 128); }
  out.push(n);
  return out;
}
