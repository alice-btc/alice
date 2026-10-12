// The exit path of an Arkade VTXO, from the operator's indexer.
//
// Unlike Bark, Arkade publishes it: the chain of a VTXO (the transactions
// from the commitment transaction down to the coin, each typed: tree,
// checkpoint, Ark transaction) comes from one indexer call, and each
// off-chain transaction's outputs from another, so the branch and the other
// outputs at every step can be drawn like a Bark coin's genesis.
//
// Arkade's words: commitment transaction (on-chain, the anchor), batch output
// (the root of a VTXO tree), tree transaction, leaf, checkpoint transaction
// and Ark transaction (off-chain, preconfirmed by the operator).

import { ArkadeError, getArkadeVirtualTx, type ArkadeVirtualTx } from './arkade.ts';

export type ArkadeChainTxType = 'commitment' | 'tree' | 'checkpoint' | 'ark' | 'unknown';

/** One transaction of a VTXO's chain, as the indexer lists them: the coin's
 *  own transaction first, the commitment transaction last. */
export type ArkadeChainTx = {
  txid: string;
  type: ArkadeChainTxType;
  /** Unix seconds, when the indexer gives it. */
  expiresAt?: number;
  /** The transactions this one spends (its parents). */
  spends: string[];
};

const CHAIN_TYPES: Record<string, ArkadeChainTxType> = {
  INDEXER_CHAINED_TX_TYPE_COMMITMENT: 'commitment',
  INDEXER_CHAINED_TX_TYPE_TREE: 'tree',
  INDEXER_CHAINED_TX_TYPE_CHECKPOINT: 'checkpoint',
  INDEXER_CHAINED_TX_TYPE_ARK: 'ark',
};

function num(v: unknown): number {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : 0;
}

/** Read the indexer's chain reply (GET /v1/indexer/vtxo/{txid}/{vout}/chain). */
export function parseArkadeChain(j: unknown): ArkadeChainTx[] {
  const raw = (j as { chain?: unknown })?.chain;
  if (!Array.isArray(raw)) throw new ArkadeError('The operator answered without a chain.');
  return raw.map(e => {
    const r = (e ?? {}) as Record<string, unknown>;
    const expires = num(r.expiresAt);
    return {
      txid: String(r.txid ?? ''),
      type: CHAIN_TYPES[String(r.type)] ?? 'unknown',
      expiresAt: expires > 0 ? expires : undefined,
      spends: Array.isArray(r.spends) ? r.spends.map(String) : [],
    };
  }).filter(e => /^[0-9a-f]{64}$/i.test(e.txid));
}

/** The chain of a VTXO, coin first, commitment last. */
export async function getArkadeVtxoChain(base: string, txid: string, vout: number, opts: { signal?: AbortSignal } = {}): Promise<ArkadeChainTx[]> {
  const res = await fetch(`${base.replace(/\/+$/, '')}/v1/indexer/vtxo/${encodeURIComponent(txid)}/${vout}/chain`, {
    headers: { accept: 'application/json' },
    signal: opts.signal,
  });
  if (res.status === 404) throw new ArkadeError('The operator does not know this VTXO.');
  if (!res.ok) throw new ArkadeError(`The operator answered ${res.status}.`);
  const j = await res.json();
  if ((j as { code?: unknown })?.code === 5) throw new ArkadeError('The operator does not know this VTXO.');
  return parseArkadeChain(j);
}

export type ArkadeExitOutput = { amountSats: number; ours: boolean };

/** One off-chain transaction of the exit path, anchor side first. */
export type ArkadeExitStep = {
  txid: string;
  type: Exclude<ArkadeChainTxType, 'commitment'>;
  outputs: ArkadeExitOutput[];
  ourIndex: number;
  /** The branch's amount after this transaction. */
  branchSats: number;
  expiresAt?: number;
};

export type ArkadeExitPath = {
  commitmentTxid: string;
  /** The batch output the tree hangs from. */
  batchVout: number;
  anchorSats: number;
  steps: ArkadeExitStep[];
};

/** The vout of `parentTxid` that `tx` spends, or -1. */
function spentVout(tx: ArkadeVirtualTx, parentTxid: string): number {
  const inp = tx.inputs.find(i => i.txid === parentTxid);
  return inp ? inp.vout : -1;
}

/**
 * Build the exit path from the chain and the off-chain transactions it names
 * (fetched separately so this stays pure). The coin's own output index is
 * given; every other step's is the output its child spends.
 */
export function buildArkadeExitPath(
  chain: ArkadeChainTx[],
  txs: ReadonlyMap<string, ArkadeVirtualTx>,
  coin: { txid: string; vout: number },
): ArkadeExitPath {
  const commitment = chain.find(c => c.type === 'commitment');
  if (!commitment) throw new ArkadeError('This VTXO’s chain names no commitment transaction.');
  // Anchor first, the coin's transaction last, the commitment left out.
  const ordered = [...chain].reverse().filter(c => c.type !== 'commitment');
  if (ordered.length === 0) throw new ArkadeError('This VTXO’s chain holds no off-chain transaction.');
  const steps: ArkadeExitStep[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const c = ordered[i];
    const tx = txs.get(c.txid);
    if (!tx) throw new ArkadeError(`The operator did not serve transaction ${c.txid.slice(0, 12)}…`);
    const outs = tx.outputs.filter(o => !o.isAnchor);
    const next = i + 1 < ordered.length ? txs.get(ordered[i + 1].txid) : undefined;
    const ourVout = next ? spentVout(next, c.txid) : coin.vout;
    const ourIndex = outs.findIndex(o => o.index === ourVout);
    if (ourIndex < 0) throw new ArkadeError(`Transaction ${c.txid.slice(0, 12)}… has no output leading to this coin.`);
    steps.push({
      txid: c.txid,
      type: c.type === 'tree' || c.type === 'checkpoint' ? c.type : 'ark',
      outputs: outs.map((o, k) => ({ amountSats: o.amountSats, ours: k === ourIndex })),
      ourIndex,
      branchSats: outs[ourIndex].amountSats,
      expiresAt: c.expiresAt,
    });
  }
  const root = txs.get(ordered[0].txid)!;
  const rootInput = root.inputs.find(i => i.txid === commitment.txid);
  const anchorSats = rootInput?.amountSats ?? root.outputs.filter(o => !o.isAnchor).reduce((t, o) => t + o.amountSats, 0);
  return { commitmentTxid: commitment.txid, batchVout: rootInput?.vout ?? 0, anchorSats, steps };
}

/** Fetch everything and build the path: the chain, then each off-chain
 *  transaction it names. */
export async function loadArkadeExitPath(base: string, txid: string, vout: number, opts: { signal?: AbortSignal } = {}): Promise<ArkadeExitPath> {
  const chain = await getArkadeVtxoChain(base, txid, vout, opts);
  const txs = new Map<string, ArkadeVirtualTx>();
  await Promise.all(chain.filter(c => c.type !== 'commitment').map(async c => {
    const tx = await getArkadeVirtualTx(base, c.txid, opts);
    if (tx) txs.set(c.txid, tx);
  }));
  return buildArkadeExitPath(chain, txs, { txid, vout });
}

/** A spend of the coin out of the batch: a checkpoint transaction followed
 *  by the Ark transaction spending it count as one. */
export type ArkadeSpend = { from: number; to: number; whole: boolean };

export function arkadeSpends(path: ArkadeExitPath): ArkadeSpend[] {
  const spends: ArkadeSpend[] = [];
  const s = path.steps;
  for (let i = 0; i < s.length; i++) {
    if (s[i].type === 'tree') continue;
    const next = s[i + 1];
    const paired = s[i].type === 'checkpoint' && next !== undefined && next.type === 'ark';
    const to = paired ? i + 1 : i;
    spends.push({ from: i, to, whole: s[to].outputs.length === 1 });
    i = to;
  }
  return spends;
}
