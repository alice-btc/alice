// The on-chain side of Spark, as this browser has seen it: the Bitcoin
// transactions it knows to be Spark deposits (the output a tree roots on) or
// Spark exits (a cooperative exit paying a wallet's leaves out to Bitcoin). A
// deposit is an ordinary taproot output and an exit an ordinary payment:
// nothing on the chain says they belong to Spark, and no indexer lists them
// all. The knowledge comes from three sources, each partial by nature:
//  - a leaf view walked down its tree to the deposit (the richest record: the
//    output, the tree, the leaf, the amount the tree started with);
//  - Sparkscan's live feed, while the Spark home page is open, names the
//    Bitcoin txid of every deposit and exit it reports;
//  - Sparkscan's history of a Spark address, when that address is opened.
// What is known is remembered here, across sessions, like the Arkade and Bark
// registries (in the local vault, encrypted at rest), so the Bitcoin view of
// such a transaction can say what it is and the lists can badge its row. The absence of a record proves nothing:
// the wording on screen says "known", never "the only ones".
//
// Nothing is looked up for this; the registry is only ever fed by what the
// user's own pages already read.

import type { SparkscanTx } from './sparkscan.ts';
import { vaultStorage } from '../local-vault.ts';

const STORAGE_KEY = 'alice_spark_onchain_v2';
/** The previous shape: leaf-sourced deposits only, read once and migrated. */
const LEGACY_STORAGE_KEY = 'alice_spark_deposits_v1';
const MAX_ENTRIES = 400;
const TXID = /^[0-9a-f]{64}$/;

export type SparkOnchainKind = 'deposit' | 'exit';

/** A Bitcoin transaction known to belong to Spark. */
export type SparkOnchainTx = {
  txid: string;
  kind: SparkOnchainKind;
  /** How it was learned. A leaf's walk is authoritative about the deposit's
   *  output and tree; Sparkscan names the Spark wallet and its own id. */
  source: 'leaf' | 'sparkscan';
  /** The deposit output and the tree rooted on it, when a leaf led here. */
  vout?: number;
  treeId?: string;
  leafId?: string;
  /** The amount in sats: what the tree started with (leaf), or what Sparkscan reported. */
  amountSats?: number;
  /** The Spark wallet on the Spark side: the depositor, or the wallet that exited. */
  sparkAddress?: string;
  /** Sparkscan's id of the Spark-side transaction, to open it on Spark. */
  sparkTxId?: string;
};

/** What a leaf view learns about its tree's deposit. */
export type SparkDeposit = {
  txid: string;
  vout: number;
  /** The tree rooted on it and the leaf the user came from. */
  treeId: string;
  leafId: string;
  /** The amount the tree started with, sats. */
  amountSats: number;
};

type Listener = () => void;

function readStorage(key: string): unknown {
  try {
    const raw = vaultStorage()?.getItem(key) ?? null;
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function num(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}
function text(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

class SparkOnchainRegistry {
  private readonly byTxid = new Map<string, SparkOnchainTx>();
  private readonly listeners = new Set<Listener>();
  private loaded = false;
  private waiting = false;

  private load() {
    if (this.loaded) return;
    const vault = vaultStorage();
    if (vault && !vault.isReady) {
      // The vault is still decrypting: read it once it is, and tell the views.
      if (!this.waiting) {
        this.waiting = true;
        vault.whenReady(() => {
          this.waiting = false;
          this.load();
          for (const l of this.listeners) l();
        });
      }
      return;
    }
    this.loaded = true;
    const list = readStorage(STORAGE_KEY);
    if (Array.isArray(list)) {
      for (const e of list) {
        const d = e as Partial<SparkOnchainTx>;
        if (typeof d.txid !== 'string' || !TXID.test(d.txid)) continue;
        if (d.kind !== 'deposit' && d.kind !== 'exit') continue;
        this.byTxid.set(d.txid, {
          txid: d.txid,
          kind: d.kind,
          source: d.source === 'sparkscan' ? 'sparkscan' : 'leaf',
          vout: num(d.vout), treeId: text(d.treeId), leafId: text(d.leafId), amountSats: num(d.amountSats),
          sparkAddress: text(d.sparkAddress), sparkTxId: text(d.sparkTxId),
        });
      }
      return;
    }
    // First run on this shape: the leaf-sourced deposits of the old one.
    const legacy = readStorage(LEGACY_STORAGE_KEY);
    if (Array.isArray(legacy)) {
      for (const e of legacy) {
        const d = e as Partial<SparkDeposit>;
        if (typeof d.txid === 'string' && TXID.test(d.txid) && typeof d.leafId === 'string') {
          this.byTxid.set(d.txid, { txid: d.txid, kind: 'deposit', source: 'leaf', vout: Number(d.vout) || 0, treeId: String(d.treeId ?? ''), leafId: d.leafId, amountSats: Number(d.amountSats) || 0 });
        }
      }
    }
  }

  private save() {
    try {
      const list = [...this.byTxid.values()].slice(-MAX_ENTRIES);
      vaultStorage()?.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch { /* storage full or denied: the session still has it */ }
  }

  private put(next: SparkOnchainTx) {
    // Re-insert so the newest sits last (the save keeps the tail).
    this.byTxid.delete(next.txid);
    this.byTxid.set(next.txid, next);
    this.save();
    for (const l of this.listeners) l();
  }

  get(txid: string): SparkOnchainTx | undefined {
    this.load();
    return this.byTxid.get(txid.toLowerCase());
  }

  has(txid: string): boolean {
    return this.get(txid) !== undefined;
  }

  /** Every known txid, oldest first. */
  txids(): string[] {
    this.load();
    return [...this.byTxid.keys()];
  }

  /** A deposit a leaf view walked down to: the authoritative record of the
   *  output and the tree. Keeps what Sparkscan may already have said about
   *  the wallet. */
  noteDeposit(d: SparkDeposit) {
    this.load();
    const txid = d.txid.toLowerCase();
    const prev = this.byTxid.get(txid);
    if (prev && prev.source === 'leaf' && prev.leafId === d.leafId && prev.vout === d.vout) return;
    this.put({
      txid, kind: 'deposit', source: 'leaf',
      vout: d.vout, treeId: d.treeId, leafId: d.leafId, amountSats: d.amountSats,
      sparkAddress: prev?.sparkAddress, sparkTxId: prev?.sparkTxId,
    });
  }

  /** What Sparkscan reported: a deposit or an exit with its Bitcoin txid.
   *  Any other kind, or a line without a Bitcoin txid, is ignored. A record a
   *  leaf established keeps its source; Sparkscan only adds the wallet and
   *  its own id to it. */
  noteSparkscan(t: SparkscanTx): boolean {
    if (t.kind !== 'deposit' && t.kind !== 'exit') return false;
    const txid = t.bitcoinTxid?.toLowerCase();
    if (!txid || !TXID.test(txid)) return false;
    this.load();
    const wallet = t.kind === 'deposit' ? t.to : t.from;
    const sparkAddress = wallet?.kind === 'spark' ? wallet.address ?? undefined : undefined;
    const prev = this.byTxid.get(txid);
    if (prev) {
      const next: SparkOnchainTx = {
        ...prev,
        kind: prev.source === 'leaf' ? prev.kind : t.kind,
        sparkAddress: prev.sparkAddress ?? sparkAddress,
        sparkTxId: prev.sparkTxId ?? t.id,
      };
      if (next.kind === prev.kind && next.sparkAddress === prev.sparkAddress && next.sparkTxId === prev.sparkTxId) return false;
      this.put(next);
      return true;
    }
    this.put({
      txid, kind: t.kind, source: 'sparkscan',
      amountSats: t.amountSats ?? undefined,
      sparkAddress, sparkTxId: t.id,
    });
    return true;
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => { this.listeners.delete(l); };
  }
}

export const sparkOnchainRegistry = new SparkOnchainRegistry();

/** Remember a deposit the leaf view walked down from. */
export function noteSparkDeposit(d: SparkDeposit) {
  sparkOnchainRegistry.noteDeposit(d);
}

/** Remember the Bitcoin side of what Sparkscan reported (a deposit, an exit);
 *  anything else passes through untouched. */
export function noteSparkscanOnchain(txs: Iterable<SparkscanTx>) {
  for (const t of txs) sparkOnchainRegistry.noteSparkscan(t);
}
