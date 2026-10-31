import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { arkadeAddressOf, arkadeStateOf, looksLikeArkadeAddress, looksLikeTxid, normalizeVtxo } from './arkade.ts';

describe('normalizeVtxo', () => {
  it('reads the SDK VirtualCoin shape (flat outpoint, value, virtualStatus)', () => {
    const v = normalizeVtxo({
      txid: 'a'.repeat(64),
      vout: 1,
      value: 15046,
      status: { confirmed: false },
      createdAt: new Date(1_786_771_107_000),
      virtualStatus: {
        state: 'preconfirmed',
        commitmentTxIds: ['c'.repeat(64)],
        batchExpiry: 1_789_269_053_000,
      },
    });
    assert.equal(v.txid, 'a'.repeat(64));
    assert.equal(v.vout, 1);
    assert.equal(v.amountSats, 15046);
    assert.equal(v.isPreconfirmed, true);
    assert.equal(v.isSpent, false);
    assert.equal(v.createdAt, 1_786_771_107);
    assert.equal(v.expiresAt, 1_789_269_053);
    assert.deepEqual(v.commitmentTxids, ['c'.repeat(64)]);
  });

  it('reads the raw gateway shape (nested outpoint, string amounts)', () => {
    const v = normalizeVtxo({
      outpoint: { txid: 'b'.repeat(64), vout: 0 },
      amount: '38000',
      isPreconfirmed: false,
      isSpent: true,
      createdAt: '1786765019',
      expiresAt: '1789357275',
      commitmentTxids: ['d'.repeat(64)],
    });
    assert.equal(v.txid, 'b'.repeat(64));
    assert.equal(v.amountSats, 38000);
    assert.equal(v.isSpent, true);
    assert.equal(v.isPreconfirmed, false);
    assert.equal(v.createdAt, 1_786_765_019);
    assert.equal(v.expiresAt, 1_789_357_275);
    assert.deepEqual(v.commitmentTxids, ['d'.repeat(64)]);
  });

  it('keeps the script the gateway serves, for the address', () => {
    const v = normalizeVtxo({ outpoint: { txid: 'b'.repeat(64), vout: 0 }, amount: '1', script: '5120' + 'AB'.repeat(32) });
    assert.equal(v.scriptHex, '5120' + 'ab'.repeat(32));
    assert.equal(normalizeVtxo({ outpoint: { txid: 'b'.repeat(64), vout: 0 }, amount: '1' }).scriptHex, undefined);
  });

  it('maps the swept and spent virtualStatus states', () => {
    assert.equal(normalizeVtxo({ txid: 'a'.repeat(64), vout: 0, value: 1, virtualStatus: { state: 'swept' } }).isSwept, true);
    assert.equal(normalizeVtxo({ txid: 'a'.repeat(64), vout: 0, value: 1, virtualStatus: { state: 'spent' } }).isSpent, true);
    const settled = normalizeVtxo({ txid: 'a'.repeat(64), vout: 0, value: 1, virtualStatus: { state: 'settled' } });
    assert.equal(settled.isSpent || settled.isSwept || settled.isPreconfirmed, false);
  });
});

// The live indexer serves coins spent, swept and preconfirmed all at once (on
// the test address read on 2026-10-29, every coin was spent and many were also
// swept or preconfirmed). One state is named, in the SDK's order: spent, then
// swept, then preconfirmed.
describe('arkadeStateOf', () => {
  it('names spent before swept and preconfirmed, whatever else is true', () => {
    const of = (isSpent: boolean, isSwept: boolean, isPreconfirmed: boolean) => arkadeStateOf({ isSpent, isSwept, isPreconfirmed });
    assert.equal(of(true, true, true), 'spent');
    assert.equal(of(true, true, false), 'spent');
    assert.equal(of(true, false, true), 'spent');
    assert.equal(of(true, false, false), 'spent');
    assert.equal(of(false, true, true), 'swept');
    assert.equal(of(false, true, false), 'swept');
    assert.equal(of(false, false, true), 'preconfirmed');
    assert.equal(of(false, false, false), 'settled');
  });
});

// The expiry of a VTXO is a date (unix seconds) or a block height, never both,
// and unknown is not 0. SDK 0.4.79 carries it as canonical `expiresAt` (Date) /
// `expiresAtHeight` (number) next to the legacy virtualStatus.batchExpiry, which
// multiplies a height by 1000 as well; the raw gateway sends one string scalar.
// That scalar follows the SDK's own cut-off (vtxo.ts EXPIRY_MIN_PLAUSIBLE_MS,
// 1 January 2025 = 1,735,689,600 s): from it on unix seconds, below a block
// height. It is not the BIP65 locktime threshold (500,000,000), which the SDK
// does not use; taking another one here would make this view and the SDK read
// the same coin differently (e.g. 600,000,000 is a date for BIP65, a height for
// the SDK).
describe('normalizeVtxo expiry', () => {
  const A = 'a'.repeat(64);
  type Expiry = { expiresAt?: number; expiresAtHeight?: number };
  const sdk = (over: Record<string, unknown>): Expiry => normalizeVtxo({ txid: A, vout: 0, value: 1, ...over }) as unknown as Expiry;
  const gateway = (expiresAt: unknown): Expiry => normalizeVtxo({ outpoint: { txid: A, vout: 0 }, amount: '1', expiresAt }) as unknown as Expiry;
  const unknownExpiry = (e: Expiry, label: string) => {
    assert.equal(e.expiresAt, undefined, `${label}: no date`);
    assert.equal(e.expiresAtHeight, undefined, `${label}: no height`);
  };

  it('prefers the canonical date over a contradicting legacy batchExpiry', () => {
    const e = sdk({ expiresAt: new Date(1_790_000_000_000), virtualStatus: { state: 'settled', batchExpiry: 1_700_000_000_000 } });
    assert.equal(e.expiresAt, 1_790_000_000);
    assert.equal(e.expiresAtHeight, undefined);
    assert.equal(sdk({ expiresAt: new Date(1_790_000_000_000) }).expiresAt, 1_790_000_000, 'without any virtualStatus');
  });

  it('prefers the canonical height over the legacy batchExpiry, and never turns it into a date', () => {
    // batchExpiry is the height times 1000: read as milliseconds it is a day in January 1970.
    const e = sdk({ expiresAtHeight: 912_345, virtualStatus: { state: 'settled', batchExpiry: 912_345_000 } });
    assert.equal(e.expiresAtHeight, 912_345);
    assert.equal(e.expiresAt, undefined);
    // A canonical height also wins over a legacy date: the two facts are exclusive.
    const f = sdk({ expiresAtHeight: 912_345, virtualStatus: { state: 'settled', batchExpiry: 1_789_269_053_000 } });
    assert.equal(f.expiresAtHeight, 912_345);
    assert.equal(f.expiresAt, undefined);
  });

  it('reads a legacy-only batchExpiry: milliseconds for a date, height times 1000 for a height, 0 as unknown', () => {
    const date = sdk({ virtualStatus: { state: 'settled', batchExpiry: 1_789_269_053_000 } });
    assert.equal(date.expiresAt, 1_789_269_053);
    assert.equal(date.expiresAtHeight, undefined);

    const height = sdk({ virtualStatus: { state: 'settled', batchExpiry: 850_000_000 } });
    assert.equal(height.expiresAtHeight, 850_000);
    assert.equal(height.expiresAt, undefined);

    unknownExpiry(sdk({ virtualStatus: { state: 'settled', batchExpiry: 0 } }), 'batchExpiry 0');
    unknownExpiry(sdk({ virtualStatus: { state: 'settled', batchExpiry: -1000 } }), 'negative batchExpiry');
    unknownExpiry(sdk({ virtualStatus: { state: 'settled' } }), 'no batchExpiry');
  });

  it('tells a raw gateway scalar apart at the SDK cut-off (1 January 2025): below is a height, from it on a date in seconds', () => {
    const date = gateway('1789357275');
    assert.equal(date.expiresAt, 1_789_357_275);
    assert.equal(date.expiresAtHeight, undefined);
    assert.equal(gateway(1_789_357_275).expiresAt, 1_789_357_275, 'a number reads like its string');

    const height = gateway('850123');
    assert.equal(height.expiresAtHeight, 850_123);
    assert.equal(height.expiresAt, undefined, 'a height is not a date in January 1970');

    const justBelow = gateway('1735689599');
    assert.equal(justBelow.expiresAtHeight, 1_735_689_599);
    assert.equal(justBelow.expiresAt, undefined);

    const atCutoff = gateway('1735689600');
    assert.equal(atCutoff.expiresAt, 1_735_689_600);
    assert.equal(atCutoff.expiresAtHeight, undefined);

    // Above BIP65's 500,000,000 yet below the SDK's cut-off: the SDK says height.
    const bip65Gap = gateway('600000000');
    assert.equal(bip65Gap.expiresAtHeight, 600_000_000);
    assert.equal(bip65Gap.expiresAt, undefined);
  });

  it('reads a legacy batchExpiry and a gateway scalar of the same coin alike, at the same cut-off', () => {
    assert.deepEqual(sdk({ virtualStatus: { state: 'settled', batchExpiry: 1_735_689_600_000 } }).expiresAt, gateway('1735689600').expiresAt);
    const legacyBelow = sdk({ virtualStatus: { state: 'settled', batchExpiry: 1_735_689_599_000 } });
    assert.equal(legacyBelow.expiresAtHeight, 1_735_689_599);
    assert.equal(legacyBelow.expiresAt, undefined);
  });

  it('never infers a unit from a canonical field: a Date is a date, a small height stays a height', () => {
    // 5 s after the epoch as a Date is a date (the SDK says so), however implausible.
    assert.equal(sdk({ expiresAt: new Date(5_000) }).expiresAt, 5);
    assert.equal(sdk({ expiresAtHeight: 1_800_000_000 }).expiresAtHeight, 1_800_000_000);
    assert.equal(sdk({ expiresAtHeight: 1_800_000_000 }).expiresAt, undefined);
  });

  it('reads a missing, zero, negative or invalid expiry as unknown, not as epoch 0 or block 0', () => {
    for (const raw of [undefined, null, '', '0', 0, '-12', -12, 'soon', 'NaN', NaN, Infinity, '1e999']) {
      unknownExpiry(gateway(raw), `gateway ${String(raw)}`);
    }
    unknownExpiry(sdk({ expiresAt: new Date(Number.NaN) }), 'invalid canonical Date');
    unknownExpiry(sdk({ expiresAtHeight: 0 }), 'canonical height 0');
    unknownExpiry(sdk({ expiresAtHeight: Number.NaN }), 'canonical height NaN');
  });
});

describe('normalizeVtxo canonical facts', () => {
  const A = 'a'.repeat(64);
  const sdk = (over: Record<string, unknown>) => normalizeVtxo({ txid: A, vout: 0, value: 1, ...over });

  it('lets a canonical false win over a contradicting virtualStatus.state', () => {
    const spent = sdk({ isSpent: false, virtualStatus: { state: 'spent' } });
    assert.equal(spent.isSpent, false);
    const swept = sdk({ isSwept: false, virtualStatus: { state: 'swept' } });
    assert.equal(swept.isSwept, false);
    const preconfirmed = sdk({ isPreconfirmed: false, virtualStatus: { state: 'preconfirmed' } });
    assert.equal(preconfirmed.isPreconfirmed, false);
    const all = sdk({ isSpent: false, isSwept: false, isPreconfirmed: false, virtualStatus: { state: 'spent' } });
    assert.equal(all.isSpent || all.isSwept || all.isPreconfirmed, false);
  });

  it('keeps a canonical true whatever the legacy state says, and derives only the facts left unsaid', () => {
    assert.equal(sdk({ isSpent: true, virtualStatus: { state: 'settled' } }).isSpent, true);
    assert.equal(sdk({ isSwept: true, virtualStatus: { state: 'settled' } }).isSwept, true);
    assert.equal(sdk({ isPreconfirmed: true, virtualStatus: { state: 'settled' } }).isPreconfirmed, true);
    // isSpent is said (false); isSwept is not, so it still comes from the state.
    const mixed = sdk({ isSpent: false, virtualStatus: { state: 'swept' } });
    assert.equal(mixed.isSpent, false);
    assert.equal(mixed.isSwept, true);
  });

  it('reads the raw gateway booleans as they are, with no virtualStatus to contradict them', () => {
    const v = normalizeVtxo({ outpoint: { txid: A, vout: 0 }, amount: '1', isSpent: false, isSwept: false, isPreconfirmed: false });
    assert.equal(v.isSpent || v.isSwept || v.isPreconfirmed, false);
  });

  it('prefers the canonical commitmentTxIds over the legacy virtualStatus ones', () => {
    const canonical = ['1'.repeat(64)];
    const legacy = ['2'.repeat(64)];
    assert.deepEqual(sdk({ commitmentTxIds: canonical, virtualStatus: { state: 'settled', commitmentTxIds: legacy } }).commitmentTxids, canonical);
    assert.deepEqual(sdk({ commitmentTxIds: canonical }).commitmentTxids, canonical, 'without any virtualStatus');
  });

  it('reads the commitments under each key spelling: commitmentTxIds (SDK), virtualStatus.commitmentTxIds (legacy SDK), commitmentTxids (gateway)', () => {
    const ids = ['3'.repeat(64), '4'.repeat(64)];
    assert.deepEqual(sdk({ commitmentTxIds: ids }).commitmentTxids, ids);
    assert.deepEqual(sdk({ virtualStatus: { state: 'settled', commitmentTxIds: ids } }).commitmentTxids, ids);
    assert.deepEqual(normalizeVtxo({ outpoint: { txid: A, vout: 0 }, amount: '1', commitmentTxids: ids }).commitmentTxids, ids);
  });
});

describe('input prefilters', () => {
  it('recognises Arkade addresses and txids', () => {
    assert.equal(looksLikeArkadeAddress('ark1qzpq904am6clw3pgqwyh4p02708fy4xs0hcpwt7rwfdttuxsjameezgu4rz4mh977mt5zc2gquwfdy94npcvgfg865k8dt077z5a70aykxu669'), true);
    assert.equal(looksLikeArkadeAddress('bc1qzzdzp5c443vsetzatf2ra6hku322y7e5aq50rs'), false);
    // A Bark address shares the prefix but not the version.
    assert.equal(looksLikeArkadeAddress('ark1pwh9vsmezqqpharv69q4z8m6x364d5m5prnmcalcalq9pdmzw0y7mpveck4pcfhezqypczkrrj3lkx5ue4qrf4jc7ztpt9htdttmh2judhqnu7aue8p0y9mqkr4cf5'), false);
    assert.equal(looksLikeTxid('f'.repeat(64)), true);
    assert.equal(looksLikeTxid('f'.repeat(63)), false);
  });
});

describe('arkadeAddressOf', () => {
  // A real mainnet address, its taproot script and the operator's signer key
  // (compressed, as /v1/info serves it).
  const script = '512095c884f5dec9aeb12508423834f8eea17e2037032d8b98f64b60a74125ec303e';
  const signer = '038202bebddeb1f7442803897a85eaf3ce9254d07df0172fc3725ab5f0d097779c';
  const address = 'ark1qzpq904am6clw3pgqwyh4p02708fy4xs0hcpwt7rwfdttuxsjamee9wgsn6aajdwkyjsss3cxnuwagt7yqmsxtvtnrmykc98gyj7cvp7wwwlq3';

  it('rebuilds the address from a VTXO script and the operator key', () => {
    assert.equal(arkadeAddressOf(script, signer), address);
    // The x-only key works too, and so does upper-case hex.
    assert.equal(arkadeAddressOf(script.toUpperCase(), signer.slice(2)), address);
  });

  it('uses the tark prefix off mainnet', () => {
    assert.match(arkadeAddressOf(script, signer, 'signet') ?? '', /^tark1q/);
  });

  it('answers null for anything but a P2TR script or a malformed key', () => {
    assert.equal(arkadeAddressOf('51024e73', signer), null);
    assert.equal(arkadeAddressOf('0014' + 'ab'.repeat(20), signer), null);
    assert.equal(arkadeAddressOf(script, '04' + 'ab'.repeat(32)), null);
    assert.equal(arkadeAddressOf('', signer), null);
  });
});
