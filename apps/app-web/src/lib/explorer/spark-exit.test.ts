import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildSparkExitPath } from './spark-exit.ts';
import { parseRawTx, SparkError, type SparkLeaf, type SparkLeafStatus } from './spark.ts';
import { CHAIN_NODES } from './spark.fixtures.ts';

const bytes = (h: string) => Uint8Array.from((h.match(/../g) ?? []).map(x => parseInt(x, 16)));

function leafOf(n: typeof CHAIN_NODES[number]): SparkLeaf {
  return {
    id: n.id,
    treeId: n.treeId,
    parentId: n.parent,
    valueSats: Number(n.value),
    vout: n.vout,
    // The operator's TreeNodeStatus enum: 1 available, 5 split.
    status: ({ 1: 'available', 5: 'split' } as Record<number, SparkLeafStatus>)[n.status] ?? 'unknown',
    ownerPubkey: n.owner,
    nodeTx: bytes(n.nodeTx),
    refundTx: bytes(n.refundTx),
    directTx: bytes(n.directTx),
    directRefundTx: new Uint8Array(),
  };
}

const NODES = CHAIN_NODES.map(leafOf);
const LEAF = '01a117a8-cb94-78cb-b740-28d01aeab9b9';

describe('buildSparkExitPath', () => {
  it('walks a real tree from the deposit down to the leaf', () => {
    const path = buildSparkExitPath(NODES, LEAF);
    assert.equal(path.leafId, LEAF);
    assert.equal(path.treeId, '01a117a8-945b-71ff-9a32-4fa1becf34dc');
    assert.equal(path.depositTxid, '52fec99293e50c9401d4085046fe9a12b770224cdfb193dc802ba7fe21bc4019');
    assert.equal(path.depositVout, 0);
    assert.equal(path.anchorSats, 2_097_152);
    assert.equal(path.steps.length, 13);
    assert.equal(path.steps[0].kind, 'root');
    assert.equal(path.steps[0].nodeId, '01a117a8-945b-7bd3-b7ce-4578f0769329');
    assert.deepEqual(path.steps[0].outputs, [{ amountSats: 1_048_576, ours: true }, { amountSats: 1_048_576, ours: false }]);
    assert.equal(path.steps[0].timelockBlocks, null);
    assert.equal(path.steps[0].status, 'split');
    for (let i = 1; i < 11; i++) assert.equal(path.steps[i].kind, 'split');
    // The 1,024-sat node above the leaf has a single output: the coin passed on whole.
    assert.equal(path.steps[11].kind, 'node');
    assert.deepEqual(path.steps[11].outputs, [{ amountSats: 1024, ours: true }]);
    // The branch halves at every split, down to the 1,024-sat leaf.
    assert.deepEqual(path.steps.map(s => s.branchSats), [1048576, 524288, 262144, 131072, 65536, 32768, 16384, 8192, 4096, 2048, 1024, 1024, 1024]);
    const leaf = path.steps[12];
    assert.equal(leaf.kind, 'leaf');
    assert.deepEqual(leaf.outputs, [{ amountSats: 1024, ours: true }]);
    assert.equal(leaf.timelockBlocks, 1800);
    assert.equal(leaf.status, 'available');
    assert.equal(path.refund.timelockBlocks, 1000);
    assert.equal(path.refund.amountSats, 1024);
    assert.ok(path.refund.toScriptHex.startsWith('5120'));
    assert.equal(path.directTimelockBlocks, 1850);
    assert.equal(path.totalWaitBlocks, 2800);
  });

  it('chains the transactions: each step spends the one above, the refund the leaf', () => {
    const path = buildSparkExitPath(NODES, LEAF);
    const byId = new Map(NODES.map(n => [n.id, n]));
    for (let i = 1; i < path.steps.length; i++) {
      const tx = parseRawTx(byId.get(path.steps[i].nodeId)!.nodeTx);
      assert.equal(tx.inputs[0].txid, path.steps[i - 1].txid);
      // The spent output is the one marked ours in the step above.
      assert.equal(tx.inputs[0].vout, path.steps[i - 1].ourIndex);
    }
    const refund = parseRawTx(byId.get(LEAF)!.refundTx);
    assert.equal(refund.txid, path.refund.txid);
    assert.equal(refund.inputs[0].txid, path.steps[12].txid);
  });

  it('does not care about the order the nodes came in', () => {
    const shuffled = [...NODES].reverse();
    assert.deepEqual(buildSparkExitPath(shuffled, LEAF).steps.map(s => s.nodeId), buildSparkExitPath(NODES, LEAF).steps.map(s => s.nodeId));
  });

  it('handles a leaf that is its own root', () => {
    const only: SparkLeaf = { ...NODES.find(n => n.id === LEAF)!, parentId: null };
    const path = buildSparkExitPath([only], LEAF);
    assert.equal(path.steps.length, 1);
    assert.equal(path.steps[0].kind, 'leaf');
    assert.equal(path.depositTxid, '59e466cfdae67c0b9b0fbb04206c89348d2220fef15e9dbd267bc0fc5c6f750a');
    assert.equal(path.anchorSats, 1024);
    assert.equal(path.totalWaitBlocks, 2800);
  });

  it('refuses an unknown leaf and a tree with a missing parent', () => {
    assert.throws(() => buildSparkExitPath(NODES, '01a117a8-0000-0000-0000-000000000000'), SparkError);
    const holed = NODES.filter(n => n.id !== '01a117a8-cb53-73b7-98da-d5e39df8000a');
    assert.throws(() => buildSparkExitPath(holed, LEAF), (e: unknown) => e instanceof SparkError && /did not serve the whole tree/.test(e.message));
  });
});
