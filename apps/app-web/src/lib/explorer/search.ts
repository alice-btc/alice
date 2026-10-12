// Universal search classification: decide, from a pasted string alone, whether
// it is a transaction id, a block (height or hash), an address, or an xpub.
// Pure and format-only; whether the thing exists is answered by the provider.

export type SearchKind = 'tx' | 'block' | 'address' | 'xpub' | 'vtxo' | 'unknown';
export type SearchResult = { kind: SearchKind; value: string };

const HEX64 = /^[0-9a-fA-F]{64}$/;
// An outpoint, "txid:vout". A Bark wallet names each coin (VTXO) this way; on
// any other network it is a pointer into a transaction, opened as that
// transaction.
const OUTPOINT = /^([0-9a-fA-F]{64}):(\d{1,10})$/;
// A VTXO export: the hex a Bark wallet gives for one coin. The smallest real
// one is about 120 bytes; a txid or a block hash is 32.
const VTXO_EXPORT = /^(?:0x)?(?:[0-9a-fA-F]{2}){100,}$/;
const HEIGHT = /^\d{1,8}$/; // block heights are well under 100,000,000
const BASE58_ADDR = /^[13][a-km-zA-HJ-NP-Z1-9]{24,33}$/; // P2PKH / P2SH
const BECH32_ADDR = /^(bc1|tb1|bcrt1)[0-9ac-hj-np-z]{6,87}$/i; // segwit / taproot
const XPUB_PREFIX = /^(xpub|ypub|zpub|tpub|upub|vpub)/i;
// An Ark (off-chain VTXO) address, Arkade's or Bark's; recognised only when
// the caller opts in, so pasting one on a plain Bitcoin network stays a format
// error. Bark addresses carry a policy and a mailbox, about 130 characters.
const ARK_ADDR = /^(ark|tark)1[0-9ac-hj-np-z]{6,200}$/i;
// Liquid addresses, opt-in the same way: bech32/blech32 (ex1 unconfidential,
// lq1 confidential) and the base58 prefixes (Q/G/H unconfidential, V
// confidential legacy).
const LIQUID_BECH32 = /^(ex1|lq1)[0-9ac-hj-np-z]{6,120}$/i;
const LIQUID_BASE58 = /^[GHQV][a-km-zA-HJ-NP-Z1-9]{25,110}$/;
// A Spark address, either spelling (spark1… today, sp1… at first), opt-in on
// the Spark network only: "sp1…" is also how silent-payment addresses start.
const SPARK_ADDR = /^(spark|sparkt|sparkrt|sparks|sparkl|sp|spt|sprt|sps|spl)1[0-9ac-hj-np-z]{20,}$/i;
// A Spark id: transfers and leaves are named by UUIDs. Opened as a
// transaction on the Spark network, whose view tells the two apart.
const SPARK_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// An output descriptor: a script function wrapping a ranged key path. Routed to
// the same wallet view as an extended key.
const DESCRIPTOR = /^(sh|wsh|pk|pkh|wpkh|tr|combo|addr|raw|multi|sortedmulti)\(.*\*.*\)/;

export function classifySearch(
  raw: string,
  opts: { arkAddresses?: boolean; liquidAddresses?: boolean; vtxoIds?: boolean; sparkAddresses?: boolean; sparkIds?: boolean } = {},
): SearchResult {
  const s = raw.trim();
  if (!s) return { kind: 'unknown', value: s };

  // "txid:vout": a VTXO id where the caller looks coins up (Bark), otherwise
  // the transaction it points into.
  const outpoint = OUTPOINT.exec(s);
  if (outpoint) {
    const txid = outpoint[1].toLowerCase();
    return opts.vtxoIds ? { kind: 'vtxo', value: `${txid}:${Number(outpoint[2])}` } : { kind: 'tx', value: txid };
  }
  // A coin's export, pasted whole (line breaks included): decoded on the
  // device by the VTXO view.
  if (opts.vtxoIds) {
    const hex = s.replace(/\s+/g, '');
    if (VTXO_EXPORT.test(hex)) return { kind: 'vtxo', value: hex.replace(/^0x/i, '').toLowerCase() };
  }

  // On an Ark network, an ark1… address routes to its off-chain address view.
  if (opts.arkAddresses && ARK_ADDR.test(s)) return { kind: 'address', value: s.toLowerCase() };

  // On Spark, its addresses and its UUID-named transfers and leaves.
  if (opts.sparkAddresses && SPARK_ADDR.test(s)) return { kind: 'address', value: s.toLowerCase() };
  if (opts.sparkIds && SPARK_ID.test(s)) return { kind: 'tx', value: s.toLowerCase() };

  // On Liquid, its own address formats are addresses too.
  if (opts.liquidAddresses) {
    if (LIQUID_BECH32.test(s)) return { kind: 'address', value: s.toLowerCase() };
    if (LIQUID_BASE58.test(s)) return { kind: 'address', value: s };
  }

  // An output descriptor, before the single-token checks below.
  if (DESCRIPTOR.test(s.replace(/\s+/g, ''))) return { kind: 'xpub', value: s };

  // Pure digits: a block height.
  if (HEIGHT.test(s)) return { kind: 'block', value: s };

  // 64 hex: a txid or a block hash. A block hash carries a long run of leading
  // zeros (the proof of work); a txid effectively never does. Eight zeros is a
  // safe cut, far beyond what any real txid shows.
  if (HEX64.test(s)) {
    const leadingZeros = s.match(/^0+/)?.[0].length ?? 0;
    return { kind: leadingZeros >= 8 ? 'block' : 'tx', value: s.toLowerCase() };
  }

  // Extended public keys, checked before addresses (different first letters).
  if (XPUB_PREFIX.test(s)) return { kind: 'xpub', value: s };

  if (BECH32_ADDR.test(s)) return { kind: 'address', value: s.toLowerCase() };
  if (BASE58_ADDR.test(s)) return { kind: 'address', value: s };

  return { kind: 'unknown', value: s };
}
