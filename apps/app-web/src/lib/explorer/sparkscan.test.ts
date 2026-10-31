import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { getSparkscanLatest, getSparkscanTx, normalizeSparkscanLive, normalizeSparkscanTx, sparkscanBudget, sparkscanKind, sparkscanKindLabel, SparkscanError } from './sparkscan.ts';

const SSP_LEGACY = 'sp1pgssy03nu2fqxfhkf633qkx5gam5gtvh6l2uhl84fccxp0qkjhjjv8ynqvad9t';
const SSP_PK = '023e33e2920326f64ea31058d44777442d97d7d5cbfcf54e3060bc1695e5261c93';

describe('sparkscanKind', () => {
  it('groups Sparkscan type names', () => {
    assert.equal(sparkscanKind('spark_transfer'), 'transfer');
    assert.equal(sparkscanKind('spark_to_spark'), 'transfer');
    assert.equal(sparkscanKind('lightning_payment'), 'lightning');
    assert.equal(sparkscanKind('lightning_to_spark'), 'lightning');
    assert.equal(sparkscanKind('token_transfer'), 'token');
    assert.equal(sparkscanKind('token_multi_transfer'), 'token');
    assert.equal(sparkscanKind('token_burn'), 'token');
    assert.equal(sparkscanKind('bitcoin_deposit'), 'deposit');
    assert.equal(sparkscanKind('cooperative_exit'), 'exit');
    assert.equal(sparkscanKind('bitcoin_withdrawal'), 'exit');
    assert.equal(sparkscanKind('something_new'), 'other');
    assert.equal(sparkscanKindLabel('token'), 'Token');
  });
});

describe('normalizeSparkscanTx (REST)', () => {
  it('reads a Spark transfer with both parties', () => {
    const tx = normalizeSparkscanTx({
      id: '01a1259e-4ea0-720a-9e1d-456db56839d2', type: 'spark_transfer', status: 'confirmed', amountSats: 15484,
      from: { type: 'spark', identifier: 'spark1pgss8awwxk3flsh95sd0uasdd3c5urmkmlqj6q84cq0w7nvvrclt8l9t2g404q', pubkey: '03f5ce35a29fc2e5a41afe760d6c714e0f76dfc12d00f5c01eef4d8c1e3eb3fcab' },
      to: { type: 'spark', identifier: 'spark1pgssxate4m5p3y0u8g5vhea38et9qvw5vfytgg8m88wtxzze3arjk3gn2sgflz', pubkey: '037579aee81891fc3a28cbe7b13e565031d46248b420fb39dcb308598f472b4513' },
      valueUsd: 12.8, createdAt: '2026-10-10T11:41:34.867Z', txid: null,
    })!;
    assert.equal(tx.kind, 'transfer');
    assert.equal(tx.amountSats, 15484);
    assert.equal(tx.from?.kind, 'spark');
    assert.equal(tx.from?.address, 'spark1pgss8awwxk3flsh95sd0uasdd3c5urmkmlqj6q84cq0w7nvvrclt8l9t2g404q');
    assert.equal(tx.to?.pubkey, '037579aee81891fc3a28cbe7b13e565031d46248b420fb39dcb308598f472b4513');
    assert.equal(tx.createdAt, 1791632494);
    assert.equal(tx.bitcoinTxid, null);
  });

  it('reads a Lightning payment and keeps its network as a label', () => {
    const tx = normalizeSparkscanTx({ id: 'x', type: 'lightning_payment', status: 'confirmed', amountSats: '30186', from: { type: 'lightning', identifier: 'Lightning Network' }, to: { type: 'spark', identifier: 'spark1pgss92a5tfszrn5qkej882ccceh6flx6255vn7gr4rjl5c254cm27trppq99dq' } })!;
    assert.equal(tx.kind, 'lightning');
    assert.equal(tx.amountSats, 30186);
    assert.deepEqual(tx.from, { kind: 'lightning', address: null, pubkey: null, label: 'Lightning Network' });
    assert.equal(tx.to?.kind, 'spark');
  });

  it('keeps a token line as a token, without an amount, with its wallets', () => {
    const a = 'spark1pgssyexnjx7jaqm8nxy0e7ft7cf56pjpyjun0ut7zmzfq758wht9zkwj6shndk';
    const b = 'spark1pgssy5946pywj5xzqakcsm88hz5u7c0jdcum2ka47vhyu5ephaxtx6n2mzf7dw';
    const tx = normalizeSparkscanTx({
      id: 'cda4', type: 'token_multi_transfer', status: 'confirmed', tokenAmount: '148004201', tokenMetadata: { name: 'Bitcoin USD', ticker: 'USDB' }, from: null, to: null,
      multiIoDetails: { inputs: [{ address: a, amount: '148004201' }], outputs: [{ address: b, amount: '5773' }, { address: a, amount: '147998428' }, { address: a, amount: '1' }] },
    })!;
    assert.equal(tx.kind, 'token');
    assert.equal(tx.amountSats, null);
    assert.equal(tx.from, null);
    assert.deepEqual(tx.multi?.inputs.map(p => p.address), [a]);
    assert.deepEqual(tx.multi?.outputs.map(p => p.address), [b, a]);
    assert.equal(normalizeSparkscanTx({ id: 'x', type: 'token_transfer', status: 'confirmed' })?.multi, undefined);
  });

  it('reads an address history row: the counterparty takes the side the direction says', () => {
    const incoming = normalizeSparkscanTx({ id: 'a', type: 'spark_transfer', direction: 'incoming', amountSats: 10871, status: 'confirmed', counterparty: { type: 'spark', identifier: 'spark1pgssxdf4cmg687rdfs57gh9qw8j5t4ryq022n3peg6kfry0q0fzhxc85qakyr9' } })!;
    assert.equal(incoming.from?.kind, 'spark');
    assert.equal(incoming.to, null);
    const outgoing = normalizeSparkscanTx({ id: 'b', type: 'spark_transfer', direction: 'outgoing', amountSats: 5, status: 'confirmed', counterparty: { type: 'spark', identifier: 'spark1pgssxdf4cmg687rdfs57gh9qw8j5t4ryq022n3peg6kfry0q0fzhxc85qakyr9' } })!;
    assert.equal(outgoing.from, null);
    assert.equal(outgoing.to?.kind, 'spark');
    const many = normalizeSparkscanTx({ id: 'c', type: 'token_multi_transfer', direction: 'transfer', status: 'confirmed', counterparty: { type: 'spark', identifier: 'Multiple Parties' } })!;
    assert.deepEqual(many.to, { kind: 'other', address: null, pubkey: null, label: 'Multiple Parties' });
  });

  it('ignores what is not a transaction', () => {
    assert.equal(normalizeSparkscanTx(null), null);
    assert.equal(normalizeSparkscanTx({ message: 'Not Found' }), null);
  });
});

describe('normalizeSparkscanLive (websocket)', () => {
  it('reads a publication, re-encoding the first address format', () => {
    const tx = normalizeSparkscanLive({
      id: '01a125bf-365d-7222-9aa8-b8683e8132ee', network: 'MAINNET', type: 'lightning_to_spark', status: 'sent', amount_sats: '12064', token_amount: null, token_address: null,
      from_identifier: SSP_LEGACY, from_pubkey: SSP_PK,
      to_identifier: 'sp1pgssyrtwkqw2y23je0aya8qxer4mqgkqmh7cxtz2w68dl2pvsjxa3yallszes5', to_pubkey: '020d6eb01ca22a32cbfa4e9c06c8ebb022c0ddfd832c4a768edfa82c848dd893bf',
      bitcoin_txid: null, is_private: false, updated_at: '2026-10-10T12:17:31.181776Z', expired_time: null, processed_at: '2026-10-10T12:17:22.988000Z',
    })!;
    assert.equal(tx.kind, 'lightning');
    assert.equal(tx.amountSats, 12064);
    assert.equal(tx.from?.pubkey, SSP_PK);
    assert.ok(tx.from?.address?.startsWith('spark1pgss'));
    assert.equal(tx.to?.pubkey, '020d6eb01ca22a32cbfa4e9c06c8ebb022c0ddfd832c4a768edfa82c848dd893bf');
    assert.equal(tx.createdAt, Math.floor(Date.parse('2026-10-10T12:17:22.988Z') / 1000));
  });

  it('reads a token publication as a token line', () => {
    const tx = normalizeSparkscanLive({ id: '32c4', type: 'token_transfer', status: 'confirmed', amount_sats: null, token_amount: '3000000', from_identifier: 'sp1pgssymxgksq8d93zcvnrq8crxf7s5gel744586lpq4w94vv0csvmw0fsc0mjl8', to_identifier: 'sp1pgssysfh6ws2vlfxy49qepexp2qwn635xz296ny4yrfl2j0sryt3y548ejk0yq', processed_at: '2026-10-10T12:17:22.988000' })!;
    assert.equal(tx.kind, 'token');
    assert.equal(tx.amountSats, null);
    assert.equal(tx.createdAt, Math.floor(Date.parse('2026-10-10T12:17:22.988Z') / 1000));
  });
});

describe('normalizeSparkscanTx, the Bitcoin side of a deposit', () => {
  const REVERSED = '4a24224493f0c407ade152ba64128afb57245044882af1cdecd64af095f1e9c4';
  const TXID = 'c4e9f195f04ad6eccdf12a8844502457fb8a1264ba52e1ad07c4f0934422244a';
  const base = {
    id: '01a126c3-4eaf-7308-8354-0bc1a3d5b3fe', type: 'bitcoin_deposit', status: 'confirmed', createdAt: '2026-10-10T17:01:36.612Z',
    from: { type: 'bitcoin', identifier: 'bc1pdwu79dady576y3fupmm82m3g7p2p9f6hgyeqy0tdg7ztxg7xrayqlkl8j9' },
    to: { type: 'spark', identifier: 'spark1pgssxyahahn0gyeds9r9v6sctqh4yanvtfnhzukgxq533nxrhfly90d3c7wp0w' },
    amountSats: 90_238_024,
  };

  it('takes the txid as Bitcoin writes it from the detail, not the reversed top-level one', () => {
    const t = normalizeSparkscanTx({ ...base, txid: REVERSED, bitcoinTxData: { txid: TXID, status: { confirmed: true, block_height: 970_796 } } });
    assert.equal(t?.kind, 'deposit');
    assert.equal(t?.bitcoinTxid, TXID);
    assert.equal(t?.to?.address, base.to.identifier);
  });

  it('takes a history row\'s txid as is, and names the queried address as the missing side', () => {
    const self = { kind: 'spark' as const, address: base.to.identifier, pubkey: null, label: base.to.identifier };
    const t = normalizeSparkscanTx({ ...base, from: undefined, to: undefined, direction: 'incoming', counterparty: base.from, txid: TXID }, self);
    assert.equal(t?.bitcoinTxid, TXID);
    assert.equal(t?.from?.kind, 'bitcoin');
    assert.equal(t?.to?.address, base.to.identifier);
    const out = normalizeSparkscanTx({ ...base, type: 'cooperative_exit', from: undefined, to: undefined, direction: 'outgoing', counterparty: base.from, txid: TXID }, self);
    assert.equal(out?.from?.address, base.to.identifier);
    assert.equal(out?.to?.kind, 'bitcoin');
    // Without a caller-named side, the row keeps that side unknown.
    assert.equal(normalizeSparkscanTx({ ...base, from: undefined, to: undefined, direction: 'incoming', counterparty: base.from, txid: TXID })?.to, null);
  });
});

describe('Sparkscan REST calls and the request limit', () => {
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
    sparkscanBudget.note(200, { get: () => null }, Math.floor(Date.now() / 1000));
  });
  const answer = (status: number, body: unknown, headers: Record<string, string> = {}) => new Response(body === null ? null : JSON.stringify(body), { status, headers });

  it('asks for JSON without a key and keeps going while requests are left', async () => {
    const urls: string[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      urls.push(String(input));
      assert.equal((init?.headers as Record<string, string>).accept, 'application/json');
      assert.equal((init?.headers as Record<string, string>).authorization, undefined);
      return answer(200, [], { 'x-ratelimit-remaining': '7' });
    }) as typeof fetch;
    assert.deepEqual(await getSparkscanLatest(5), []);
    assert.deepEqual(await getSparkscanLatest(5), []);
    assert.equal(urls.length, 2);
    assert.equal(urls[0], 'https://api.sparkscan.io/v1/tx/latest?network=MAINNET&limit=5');
  });

  it('after a refusal, holds the next call back for what Retry-After says, without sending it', async () => {
    let sent = 0;
    globalThis.fetch = (async () => { sent++; return answer(429, { message: 'Too many requests' }, { 'retry-after': '45' }); }) as typeof fetch;
    await assert.rejects(getSparkscanTx('01a1259e-4ea0-720a-9e1d-456db56839d2'), (e: unknown) => e instanceof SparkscanError && e.status === 429 && /45 seconds/.test(e.message));
    await assert.rejects(getSparkscanTx('01a1259e-4ea0-720a-9e1d-456db56839d2'), (e: unknown) => e instanceof SparkscanError && e.status === 429 && /Try again in/.test(e.message));
    assert.equal(sent, 1);
  });

  it('stops asking once no requests are left, until the window resets', async () => {
    let sent = 0;
    const reset = Math.floor(Date.now() / 1000) + 200;
    globalThis.fetch = (async () => { sent++; return answer(404, null, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(reset) }); }) as typeof fetch;
    assert.equal(await getSparkscanTx('x'), null);
    await assert.rejects(getSparkscanTx('y'), (e: unknown) => e instanceof SparkscanError && e.status === 429 && /about 3 minutes/.test(e.message));
    assert.equal(sent, 1);
  });
});
