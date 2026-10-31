// The exit path of a Spark leaf, from the operators' tree.
//
// Spark publishes it: one query_nodes call with include_parents returns the
// leaf and every node above it, each carrying its pre-signed transaction, up
// to the root that spends the on-chain deposit. A unilateral exit broadcasts
// those transactions in order (each with a fee-bumping child on its anchor
// output), waits out the relative timelocks they carry, then broadcasts the
// leaf's refund transaction, which pays the owner.
//
// Spark's words: deposit (the on-chain root), tree, node, leaf, refund
// transaction (the exit to the owner), timelock.

import { isAnchorOutput, parseRawTx, sequenceBlocks, SparkError, type SparkLeaf, type SparkLeafStatus } from './spark.ts';
import { t as tr } from '../../i18n/translate.ts';

export type SparkExitOutput = { amountSats: number; ours: boolean };

/** One pre-signed node transaction of the path, root first. */
export type SparkExitStep = {
  nodeId: string;
  txid: string;
  /** The root spends the deposit; a split has several outputs; a node passes
   *  the coin on whole (a leaf renewed or extended); the leaf is the coin. */
  kind: 'root' | 'split' | 'node' | 'leaf';
  /** The outputs, the anchor left out. */
  outputs: SparkExitOutput[];
  ourIndex: number;
  /** The branch's amount after this transaction. */
  branchSats: number;
  /** The relative timelock this transaction waits after its parent confirms. */
  timelockBlocks: number | null;
  status: SparkLeafStatus;
};

export type SparkExitPath = {
  leafId: string;
  treeId: string;
  /** The on-chain output the tree hangs from. */
  depositTxid: string;
  depositVout: number;
  anchorSats: number;
  steps: SparkExitStep[];
  /** The exit transaction to the owner, spending the leaf's node transaction. */
  refund: { txid: string; amountSats: number; timelockBlocks: number | null; toScriptHex: string };
  /** The watchtower's direct path from the parent, when the leaf carries one. */
  directTimelockBlocks: number | null;
  /** Every timelock on the path, added up. */
  totalWaitBlocks: number;
};

/**
 * Build the path from the nodes an operator served (the leaf and its
 * parents, any order). Pure: the fetching lives in spark.ts.
 */
export function buildSparkExitPath(nodes: readonly SparkLeaf[], leafId: string): SparkExitPath {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const leaf = byId.get(leafId);
  if (!leaf) throw new SparkError(tr('explorerSpark.error.unknownLeaf'));
  // Leaf up to the root, then reversed.
  const chain: SparkLeaf[] = [];
  const seen = new Set<string>();
  for (let cur: SparkLeaf | undefined = leaf; cur; cur = cur.parentId ? byId.get(cur.parentId) : undefined) {
    if (seen.has(cur.id)) throw new SparkError(tr('explorerSpark.error.loop'));
    seen.add(cur.id);
    chain.push(cur);
    if (cur.parentId && !byId.has(cur.parentId)) throw new SparkError(tr('explorerSpark.error.partialTree', { node: cur.parentId.slice(0, 8) }));
  }
  chain.reverse();
  const steps: SparkExitStep[] = [];
  for (let i = 0; i < chain.length; i++) {
    const node = chain[i];
    if (node.nodeTx.length === 0) throw new SparkError(tr('explorerSpark.error.noNodeTx', { node: node.id.slice(0, 8) }));
    const tx = parseRawTx(node.nodeTx);
    const outs = tx.outputs.map((o, index) => ({ ...o, index })).filter(o => !isAnchorOutput(o));
    // The child's `vout` names the output it spends; the leaf's own transaction
    // has one real output, the coin.
    const ourVout = i + 1 < chain.length ? chain[i + 1].vout : 0;
    const ourIndex = outs.findIndex(o => o.index === ourVout);
    if (ourIndex < 0) throw new SparkError(tr('explorerSpark.error.noNodeOutput', { node: node.id.slice(0, 8) }));
    steps.push({
      nodeId: node.id,
      txid: tx.txid,
      kind: i === chain.length - 1 ? 'leaf' : i === 0 ? 'root' : outs.length > 1 ? 'split' : 'node',
      outputs: outs.map((o, k) => ({ amountSats: o.valueSats, ours: k === ourIndex })),
      ourIndex,
      branchSats: outs[ourIndex].valueSats,
      timelockBlocks: sequenceBlocks(tx.inputs[0]?.sequence ?? 0xffffffff),
      status: node.status,
    });
  }
  const rootTx = parseRawTx(chain[0].nodeTx);
  const deposit = rootTx.inputs[0];
  if (!deposit) throw new SparkError(tr('explorerSpark.error.rootSpendsNothing'));
  if (leaf.refundTx.length === 0) throw new SparkError(tr('explorerSpark.error.noRefund'));
  const refundTx = parseRawTx(leaf.refundTx);
  const refundOut = refundTx.outputs.find(o => !isAnchorOutput(o)) ?? refundTx.outputs[0];
  const refund = {
    txid: refundTx.txid,
    amountSats: refundOut?.valueSats ?? leaf.valueSats,
    timelockBlocks: sequenceBlocks(refundTx.inputs[0]?.sequence ?? 0xffffffff),
    toScriptHex: refundOut?.scriptHex ?? '',
  };
  const directTimelockBlocks = leaf.directTx.length ? sequenceBlocks(parseRawTx(leaf.directTx).inputs[0]?.sequence ?? 0xffffffff) : null;
  const totalWaitBlocks = steps.reduce((t, s) => t + (s.timelockBlocks ?? 0), 0) + (refund.timelockBlocks ?? 0);
  return {
    leafId,
    treeId: leaf.treeId,
    depositTxid: deposit.txid,
    depositVout: deposit.vout,
    anchorSats: chain[0].valueSats,
    steps,
    refund,
    directTimelockBlocks,
    totalWaitBlocks,
  };
}
