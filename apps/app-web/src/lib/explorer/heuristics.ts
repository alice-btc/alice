// Transaction privacy heuristics: what a chain analyst can infer from a single
// transaction, run defensively so the user sees their own leaks.
//
// Ported from am-i-exposed (https://github.com/Copexit/am-i-exposed),
// src/lib/analysis/heuristics/ (change-detection, change-detection-signals,
// round-amount, bip69), (c) 2026 Copexit, MIT licensed. Adapted to Explorer's
// NormalizedTransaction and PrivacySignal model; their 0-100 scoring is dropped
// on purpose (the contract forbids a single score presented as scientific).

import type { PrivacySignal, RuleId, SignalConfidence, SignalSeverity } from './signals.ts';
import type { NormalizedInput, NormalizedOutput, NormalizedTransaction } from './types.ts';
import { transactionEntropy } from './boltzmann.ts';
import { t, tn } from '../../i18n/translate.ts';

const SATS_PER_BTC = 100_000_000;
const ROUND_BTC_SATS = new Set(
  [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10].map(b => b * SATS_PER_BTC),
);
const ROUND_SAT_MULTIPLES = [10_000, 100_000, 1_000_000, 10_000_000];

/** A payment amount rarely round: a round output is almost certainly the payment. */
export function isRoundAmount(sats: number): boolean {
  if (ROUND_BTC_SATS.has(sats)) return true;
  return ROUND_SAT_MULTIPLES.some(m => sats >= m && sats % m === 0);
}

/** Outputs that pay an address (drop OP_RETURN and value-less carriers). */
function spendable(outputs: readonly NormalizedOutput[]): NormalizedOutput[] {
  return outputs.filter(o => o.address && o.valueSats > 0 && o.scriptType !== 'op_return');
}

function sig(
  ruleId: RuleId,
  address: string,
  severity: SignalSeverity,
  confidence: SignalConfidence,
  title: string,
  detail: string,
  evidence: Record<string, string | number | boolean>,
): PrivacySignal {
  return { id: `${ruleId}:${address}`, ruleId, severity, confidence, title, detail, subjects: [address], evidence };
}

/**
 * CHANGE_DETECTION. Identify the change output, which reveals the payment amount
 * and recipient. Deterministic when an output returns to an input address; else a
 * weighted vote over sub-heuristics (address-type match, round amount, value
 * disparity, unnecessary input) on the common two-output case.
 */
export function detectChangeDetection(tx: NormalizedTransaction): PrivacySignal[] {
  if (tx.isCoinbase) return [];
  const outs = spendable(tx.outputs);
  const inAddrs = new Set(tx.inputs.map(i => i.address).filter((a): a is string => !!a));
  const subject = tx.txid;

  // Deterministic: an output returns to an address that was also an input.
  if (inAddrs.size > 0 && outs.length > 0) {
    const matching = outs.filter(o => inAddrs.has(o.address!));
    if (matching.length > 0) {
      const allMatch = matching.length === outs.length;
      const consolidation = allMatch && outs.length === 1;
      return [sig(
        'CHANGE_DETECTION', subject,
        consolidation ? 'medium' : 'high', 'certain',
        consolidation ? t('explorer.heuristics.selfTransfer.title') : t('explorer.heuristics.changeReused.title'),
        consolidation
          ? t('explorer.heuristics.selfTransfer.detail')
          : t('explorer.heuristics.changeReused.detail', { matching: matching.length, outputs: outs.length }),
        { deterministic: true, selfSend: true, matchCount: matching.length, outputCount: outs.length, inputCount: tx.inputs.length },
      )];
    }
  }

  // The weighted vote only applies to the classic two-output payment.
  if (outs.length !== 2) return [];
  const [a, b] = outs;
  const votes = [0, 0];
  const reasons: string[] = [];
  let hasRound = false;
  const vote = (idx: number, weight: number, why: string) => { votes[idx] += weight; reasons.push(why); };

  // Address-type match: change usually keeps the input script type.
  const inTypes = new Set(tx.inputs.map(i => i.scriptType).filter(Boolean));
  if (inTypes.size === 1) {
    const inType = [...inTypes][0];
    if (a.scriptType === inType && b.scriptType !== inType) vote(0, 2, t('explorer.heuristics.reason.typeMatch'));
    else if (b.scriptType === inType && a.scriptType !== inType) vote(1, 2, t('explorer.heuristics.reason.typeMatch'));
  }
  // Round amount: the non-round output is likely change.
  const ra = isRoundAmount(a.valueSats), rb = isRoundAmount(b.valueSats);
  if (ra !== rb) { hasRound = true; vote(ra ? 1 : 0, 1, t('explorer.heuristics.reason.nonRound')); }
  // Value disparity: a 100x-larger output is likely the sender's remaining funds.
  const ratio = Math.max(a.valueSats, b.valueSats) / Math.max(1, Math.min(a.valueSats, b.valueSats));
  if (ratio >= 100) vote(a.valueSats > b.valueSats ? 0 : 1, 1, t('explorer.heuristics.reason.disparity'));
  // Unnecessary input: if one input alone could fund an output (plus fee), the
  // extra inputs reveal the other as change.
  if (tx.inputs.length >= 2 && tx.feeSats != null) {
    const largest = Math.max(0, ...tx.inputs.map(i => i.valueSats ?? 0));
    const aFund = a.valueSats + tx.feeSats <= largest;
    const bFund = b.valueSats + tx.feeSats <= largest;
    if (aFund && !bFund) vote(1, 1, t('explorer.heuristics.reason.unnecessary'));
    else if (bFund && !aFund) vote(0, 1, t('explorer.heuristics.reason.unnecessary'));
  }

  const max = Math.max(votes[0], votes[1]);
  if (max === 0) return [];
  const total = votes[0] + votes[1];
  const majority = total > 0 ? max / total : 1;
  const dissent = votes[0] > 0 && votes[1] > 0;
  const confidence: SignalConfidence = max >= 3 && majority >= 3 / 4 ? 'strong' : max >= 2 && majority >= 2 / 3 ? 'strong' : 'possible';
  const severity: SignalSeverity = confidence === 'strong' ? (hasRound ? 'high' : 'medium') : 'low';

  return [sig(
    'CHANGE_DETECTION', subject, severity, confidence,
    t('explorer.heuristics.change.title'),
    tn('explorer.heuristics.change.signals', reasons.length, { reasons: reasons.join('; ') }) +
    (dissent ? t('explorer.heuristics.change.dissent') : '') +
    t('explorer.heuristics.change.consequence'),
    { deterministic: false, selfSend: false, roundAmount: hasRound, dissent, signalCount: reasons.length, inputCount: tx.inputs.length, outputCount: outs.length },
  )];
}

/** BIP69: inputs sorted by (txid, vout), outputs by (value, then a tiebreak). */
function isBip69Ordered(inputs: readonly NormalizedInput[], outputs: readonly NormalizedOutput[]): boolean {
  for (let i = 1; i < inputs.length; i++) {
    const p = inputs[i - 1], c = inputs[i];
    if (p.prevTxid > c.prevTxid) return false;
    if (p.prevTxid === c.prevTxid && p.prevVout > c.prevVout) return false;
  }
  for (let i = 1; i < outputs.length; i++) {
    if (outputs[i - 1].valueSats > outputs[i].valueSats) return false;
  }
  return true;
}

/**
 * WALLET_FINGERPRINT. BIP69 lexicographic ordering was meant to reduce
 * fingerprinting but instead identifies specific software (Electrum, older
 * Samourai/Ashigaru); most wallets order randomly.
 */
export function detectWalletFingerprint(tx: NormalizedTransaction): PrivacySignal[] {
  if (tx.isCoinbase) return [];
  if (tx.inputs.length < 2 || spendable(tx.outputs).length < 2) return [];
  if (!isBip69Ordered(tx.inputs, tx.outputs)) return [];
  return [sig(
    'WALLET_FINGERPRINT', tx.txid, 'low', 'possible',
    t('explorer.heuristics.bip69.title'),
    t('explorer.heuristics.bip69.detail'),
    { bip69: true, inputCount: tx.inputs.length, outputCount: tx.outputs.length },
  )];
}

/** Script types (as strings) present on the inputs and on the spendable outputs. */
function scriptTypeStr(v: NormalizedInput | NormalizedOutput): string | undefined {
  return v.scriptType ? String(v.scriptType) : undefined;
}

/**
 * SCRIPT_TYPE_MIX. Bare multisig outputs publish every key; mixing script types
 * makes change detection easier and fingerprints the wallet; a single uniform
 * type is the good case.
 */
export function detectScriptTypeMix(tx: NormalizedTransaction): PrivacySignal[] {
  if (tx.isCoinbase) return [];
  const outs = spendable(tx.outputs);
  const signals: PrivacySignal[] = [];

  const multisig = tx.outputs.filter(o => scriptTypeStr(o) === 'multisig' || scriptTypeStr(o) === 'p2ms');
  if (multisig.length > 0) {
    signals.push(sig(
      'SCRIPT_TYPE_MIX', tx.txid, 'high', 'certain',
      t('explorer.heuristics.bareMultisig.title'),
      t('explorer.heuristics.bareMultisig.detail'),
      { multisig: true, outputCount: outs.length, inputCount: tx.inputs.length },
    ));
  }
  if (outs.length < 2) return signals;

  const types = new Set<string>();
  for (const i of tx.inputs) { const t = scriptTypeStr(i); if (t) types.add(t); }
  for (const o of outs) { const t = scriptTypeStr(o); if (t) types.add(t); }

  if (types.size === 1) {
    signals.push(sig(
      'SCRIPT_TYPE_MIX', tx.txid, 'info', 'certain',
      t('explorer.heuristics.uniform.title'),
      t('explorer.heuristics.uniform.detail'),
      { uniform: true, outputCount: outs.length, inputCount: tx.inputs.length },
    ));
  } else if (types.size >= 2) {
    signals.push(sig(
      'SCRIPT_TYPE_MIX', tx.txid, types.size >= 3 ? 'medium' : 'low', 'certain',
      t('explorer.heuristics.mixed.title'),
      t('explorer.heuristics.mixed.detail', { count: types.size }),
      { mixed: true, typeCount: types.size, outputCount: outs.length, inputCount: tx.inputs.length },
    ));
  }
  return signals;
}

/**
 * ROUND_AMOUNT. Change is rarely a round number, so a round output stands out as
 * the payment, revealing the amount.
 */
export function detectRoundAmount(tx: NormalizedTransaction): PrivacySignal[] {
  if (tx.isCoinbase) return [];
  const outs = spendable(tx.outputs);
  if (outs.length < 2) return [];
  const round = outs.filter(o => isRoundAmount(o.valueSats)).length;
  if (round === 0) return [];
  const allRound = round === outs.length;
  return [sig(
    'ROUND_AMOUNT', tx.txid, allRound ? 'low' : round >= 1 ? 'medium' : 'low', allRound ? 'possible' : 'strong',
    allRound ? t('explorer.heuristics.allRound.title') : t('explorer.heuristics.round.title'),
    allRound
      ? t('explorer.heuristics.allRound.detail')
      : t('explorer.heuristics.round.detail', { round, outputs: outs.length }),
    { someRound: !allRound, allRound, roundCount: round, outputCount: outs.length },
  )];
}

/**
 * CONSOLIDATION. Many inputs into one output links the whole UTXO set to one
 * owner (the strongest ownership pattern); mixing script types while doing it
 * adds a clustering signal; one input into many outputs is a batch pattern.
 */
export function detectConsolidation(tx: NormalizedTransaction): PrivacySignal[] {
  if (tx.isCoinbase) return [];
  const outs = spendable(tx.outputs);
  const inN = tx.inputs.length;
  const signals: PrivacySignal[] = [];

  if (inN >= 3 && outs.length === 1) {
    signals.push(sig(
      'CONSOLIDATION', tx.txid, inN >= 6 ? 'high' : 'medium', 'strong',
      t('explorer.heuristics.consolidation.title'),
      t('explorer.heuristics.consolidation.detail', { count: inN }),
      { fanIn: true, inputCount: inN, outputCount: 1 },
    ));
    const inTypes = new Set(tx.inputs.map(scriptTypeStr).filter(Boolean));
    if (inTypes.size >= 2) {
      signals.push(sig(
        'CONSOLIDATION', tx.txid, 'high', 'strong',
        t('explorer.heuristics.crossType.title'),
        t('explorer.heuristics.crossType.detail', { count: inTypes.size }),
        { crossType: true, typeCount: inTypes.size, inputCount: inN, outputCount: 1 },
      ));
    }
  }

  if (inN === 1 && outs.length >= 5) {
    signals.push(sig(
      'CONSOLIDATION', tx.txid, 'low', 'possible',
      t('explorer.heuristics.batch.title'),
      t('explorer.heuristics.batch.detail', { count: outs.length }),
      { fanOut: true, inputCount: 1, outputCount: outs.length },
    ));
  }
  return signals;
}

/**
 * COINJOIN. The one positive signal: many equal-value outputs mean a
 * collaborative transaction that breaks the input-output link. Whirlpool uses
 * exactly five equal outputs; other coordinators use three or more.
 */
export function detectCoinjoin(tx: NormalizedTransaction): PrivacySignal[] {
  if (tx.inputs.length < 2) return [];
  const outs = spendable(tx.outputs);
  if (outs.length < 2) return [];
  const counts = new Map<number, number>();
  for (const o of outs) counts.set(o.valueSats, (counts.get(o.valueSats) ?? 0) + 1);
  let bestValue = 0, bestCount = 0;
  for (const [v, c] of counts) if (c > bestCount) { bestCount = c; bestValue = v; }
  if (bestCount < 3) return [];
  const whirlpool = bestCount === 5;
  return [sig(
    'COINJOIN', tx.txid, 'info', bestCount >= 5 ? 'strong' : 'possible',
    whirlpool ? t('explorer.heuristics.coinjoin.titleWhirlpool') : t('explorer.heuristics.coinjoin.title'),
    t('explorer.heuristics.coinjoin.detail', { count: bestCount }),
    { coinjoin: true, whirlpool, equalOutputs: bestCount, inputCount: tx.inputs.length, outputCount: outs.length },
  )];
}

// The most common output value and how many outputs share it (the equal-output
// peak that both CoinJoin and anonymity-set analysis turn on).
function equalOutputPeak(outs: readonly NormalizedOutput[]): { value: number; count: number } {
  const counts = new Map<number, number>();
  for (const o of outs) counts.set(o.valueSats, (counts.get(o.valueSats) ?? 0) + 1);
  let value = 0, count = 0;
  for (const [v, c] of counts) if (c > count) { count = c; value = v; }
  return { value, count };
}

const DUST_GENERAL = 1000;
function dustThreshold(scriptType: string | undefined): number {
  switch (String(scriptType)) {
    case 'p2wpkh': return 294;
    case 'p2wsh': case 'p2tr': return 330;
    default: return 546; // p2pkh, p2sh, unknown: conservative
  }
}

/**
 * CIOH. Multiple distinct input addresses are assumed to share one owner, the
 * foundational clustering technique. Suppressed on a likely CoinJoin, which
 * intentionally breaks the assumption. A single input is the good case.
 */
export function detectCioh(tx: NormalizedTransaction): PrivacySignal[] {
  const spent = tx.inputs.filter(i => !i.isCoinbase);
  if (spent.length === 0) return [];
  const addrs = new Set(spent.map(i => i.address).filter((a): a is string => !!a));
  if (addrs.size === 0) return []; // no prevout addresses to judge
  if (equalOutputPeak(spendable(tx.outputs)).count >= 3 && tx.inputs.length >= 2) return []; // coinjoin, CIOH defeated
  if (addrs.size <= 1) {
    return [sig('CIOH', tx.txid, 'info', 'certain', t('explorer.heuristics.singleInput.title'),
      t('explorer.heuristics.singleInput.detail'),
      { singleInput: true, inputCount: tx.inputs.length })];
  }
  const count = addrs.size;
  const severity: SignalSeverity = count >= 10 ? 'high' : count >= 3 ? 'medium' : 'low';
  return [sig('CIOH', tx.txid, severity, 'strong', t('explorer.heuristics.cioh.title', { count }),
    t('explorer.heuristics.cioh.detail', { count }),
    { clustered: true, heavyCluster: count >= 5, inputAddressCount: count, inputCount: tx.inputs.length })];
}

// Whirlpool/Ashigaru pool denominations, in sats, for premix (TX0) detection.
const WHIRLPOOL_DENOMS = [100_000, 1_000_000, 5_000_000, 50_000_000];

/**
 * PREMIX (TX0). A Whirlpool preparatory transaction that splits a coin into
 * equal pool-denomination outputs ready for mixing, plus a coordinator fee and,
 * often, toxic change that must never be spent with the mixed coins. Structural,
 * from the tx alone.
 */
export function detectPremix(tx: NormalizedTransaction): PrivacySignal[] {
  if (tx.isCoinbase || tx.inputs.length < 1 || tx.inputs.length > 3) return [];
  const outs = spendable(tx.outputs);
  if (outs.length < 3) return [];
  for (const denom of WHIRLPOOL_DENOMS) {
    const denomOuts = outs.filter(o => o.valueSats === denom);
    if (denomOuts.length < 2) continue;
    const nonDenom = outs.filter(o => o.valueSats !== denom);
    if (nonDenom.length < 1 || nonDenom.length > 2) continue;
    const fee = nonDenom.reduce((s, o) => (o.valueSats < s.valueSats ? o : s), nonDenom[0]);
    if (!(fee.valueSats > 0 && fee.valueSats < denom * 0.5)) continue;
    const toxicChange = nonDenom.length === 2;
    return [sig('PREMIX', tx.txid, toxicChange ? 'low' : 'info', 'strong',
      t('explorer.heuristics.premix.title', { count: denomOuts.length }),
      t('explorer.heuristics.premix.detail', { count: denomOuts.length }) +
      (toxicChange ? t('explorer.heuristics.premix.toxic') : '.'),
      { premix: true, toxicChange, denomCount: denomOuts.length, inputCount: tx.inputs.length, outputCount: outs.length })];
  }
  return [];
}

/** The classic peel shape: one non-coinbase input and exactly two spendable outputs. */
export function isPeelShape(tx: NormalizedTransaction): boolean {
  if (tx.isCoinbase) return false;
  return tx.inputs.filter(i => !i.isCoinbase).length === 1 && spendable(tx.outputs).length === 2;
}

/**
 * PEEL_CHAIN. A run of peel-shaped transactions, each feeding one output into the
 * next as its sole input, so every payment along the chain is trivially traced.
 * Needs the parent and child context, supplied by the analysis layer.
 */
export function detectPeelChain(
  tx: NormalizedTransaction,
  ctx: { parentPeelLinked: boolean; childPeelLinked: boolean },
): PrivacySignal[] {
  if (!isPeelShape(tx)) return [];
  const depth = 1 + (ctx.parentPeelLinked ? 1 : 0) + (ctx.childPeelLinked ? 1 : 0);
  if (depth < 2) return [];
  return [sig('PEEL_CHAIN', tx.txid, depth >= 3 ? 'high' : 'medium', depth >= 3 ? 'strong' : 'possible',
    t('explorer.heuristics.peel.title', { depth }),
    t('explorer.heuristics.peel.detail', { depth }),
    { peelChain: true, chainDepth: depth, inputCount: tx.inputs.length, outputCount: 2 })];
}

/**
 * DUST_OUTPUT. A tiny output sent in a dusting pattern: attackers seed dust to
 * watch when it is spent and cluster the recipient's addresses.
 */
export function detectDustOutput(tx: NormalizedTransaction): PrivacySignal[] {
  if (tx.isCoinbase) return [];
  const dust = tx.outputs.filter(o => o.valueSats > 0 && o.valueSats < DUST_GENERAL && String(o.scriptType) !== 'op_return');
  if (dust.length === 0) return [];
  const attack = (dust.length === 1 && spendable(tx.outputs).length <= 2 && tx.inputs.length === 1)
    || (dust.length >= 5 && dust.length > tx.outputs.length * 0.5);
  if (!attack) return [];
  return [sig('DUST_OUTPUT', tx.txid, 'medium', 'possible', t('explorer.heuristics.dust.title'),
    t('explorer.heuristics.dust.detail'),
    { dustAttack: true, dustCount: dust.length, outputCount: tx.outputs.length, inputCount: tx.inputs.length })];
}

/**
 * DUST_SPENDING. The damaging counterpart: co-spending a dust input with real
 * inputs lets common-input ownership link the dust probe to the whole UTXO set.
 */
export function detectDustSpending(tx: NormalizedTransaction): PrivacySignal[] {
  if (tx.isCoinbase || tx.inputs.length < 2) return [];
  let hasDust = false, hasReal = false, dustCount = 0;
  for (const i of tx.inputs) {
    if (i.valueSats == null) continue;
    const th = dustThreshold(i.scriptType ? String(i.scriptType) : undefined);
    if (i.valueSats > 0 && i.valueSats <= th) { hasDust = true; dustCount++; }
    else if (i.valueSats > th) hasReal = true;
  }
  if (!(hasDust && hasReal)) return [];
  return [sig('DUST_SPENDING', tx.txid, 'high', 'certain', t('explorer.heuristics.dustSpent.title'),
    t('explorer.heuristics.dustSpent.detail', { count: tx.inputs.length - dustCount }),
    { dustSpending: true, dustCount, inputCount: tx.inputs.length })];
}

/**
 * ANONYMITY_SET. Outputs sharing a value are indistinguishable; the size of the
 * largest such group is the anonymity set. Large sets (CoinJoin) are the good
 * case, granular where CoinJoin detection is binary.
 */
export function detectAnonymitySet(tx: NormalizedTransaction): PrivacySignal[] {
  if (tx.isCoinbase) return [];
  const outs = spendable(tx.outputs).filter(o => o.valueSats >= DUST_GENERAL);
  if (outs.length < 2) return [];
  const peak = equalOutputPeak(outs);
  if (peak.count >= 5) {
    return [sig('ANONYMITY_SET', tx.txid, 'info', 'certain', t('explorer.heuristics.anonset.title', { count: peak.count }),
      t('explorer.heuristics.anonset.strong', { count: peak.count }),
      { strongAnonset: true, anonsetSize: peak.count, outputCount: outs.length })];
  }
  if (peak.count >= 2) {
    return [sig('ANONYMITY_SET', tx.txid, 'low', 'strong', t('explorer.heuristics.anonset.title', { count: peak.count }),
      t('explorer.heuristics.anonset.limited', { count: peak.count }),
      { someAnonset: true, anonsetSize: peak.count, outputCount: outs.length })];
  }
  return [];
}

/**
 * ENTROPY (Boltzmann). The quantitative version of ambiguity: how many valid
 * ways an observer could read who paid whom. Only reported when meaningful (3+
 * bits), where it complements the coinjoin/anonymity-set signals with a number.
 */
export function detectEntropy(tx: NormalizedTransaction): PrivacySignal[] {
  const inputs = tx.inputs.filter(i => !i.isCoinbase).map(i => i.valueSats).filter((v): v is number => v != null);
  if (inputs.length === 0) return [];
  const outputs = spendable(tx.outputs).map(o => o.valueSats);
  if (outputs.length === 0) return [];
  const { bits, method } = transactionEntropy(inputs, outputs);
  if (bits < 3) return [];
  const rounded = Math.round(bits * 10) / 10;
  return [sig('ENTROPY', tx.txid, 'info', method.startsWith('Boltzmann') ? 'strong' : 'possible',
    t('explorer.heuristics.entropy.title', { bits: rounded }),
    t('explorer.heuristics.entropy.detail', { bits: rounded, method: entropyMethodLabel(method) }),
    { highEntropy: true, entropyBits: rounded, inputCount: tx.inputs.length, outputCount: outputs.length })];
}

/** The entropy method's name in the interface language (the value stays the code's). */
function entropyMethodLabel(method: string): string {
  switch (method) {
    case 'Boltzmann partition': return t('explorer.heuristics.entropy.method.partition');
    case 'assignment enumeration': return t('explorer.heuristics.entropy.method.enumeration');
    case 'multi-tier estimate': return t('explorer.heuristics.entropy.method.estimate');
    default: return method;
  }
}

/** Does this transaction look like a CoinJoin (3+ equal outputs, 2+ inputs)? */
export function isCoinjoinLike(tx: NormalizedTransaction): boolean {
  return tx.inputs.length >= 2 && equalOutputPeak(spendable(tx.outputs)).count >= 3;
}

/**
 * POSTMIX. Spending coins that came out of a CoinJoin. Co-spending them with
 * unmixed coins re-links everything through common-input ownership; consolidating
 * several mixed coins merges their separate anonymity sets. `postmixInputs` is
 * supplied by the caller, which fetched the parent transactions.
 */
export function detectPostmix(tx: NormalizedTransaction, postmixInputs: number): PrivacySignal[] {
  if (tx.isCoinbase || postmixInputs <= 0) return [];
  const total = tx.inputs.length;
  if (postmixInputs < total) {
    return [sig('POSTMIX', tx.txid, 'high', 'strong', t('explorer.heuristics.postmixMixed.title'),
      t('explorer.heuristics.postmixMixed.detail', { postmix: postmixInputs, total }),
      { postmixMixed: true, postmixInputs, inputCount: total })];
  }
  if (total >= 2) {
    return [sig('POSTMIX', tx.txid, 'medium', 'strong', t('explorer.heuristics.postmixConsolidation.title'),
      t('explorer.heuristics.postmixConsolidation.detail', { total }),
      { postmixConsolidation: true, postmixInputs, inputCount: total })];
  }
  return [];
}

/** Run every PURE transaction heuristic. POSTMIX needs parent context and is run
 *  separately by the analysis layer, which can fetch the parent transactions. */
export function detectTransactionHeuristics(tx: NormalizedTransaction): PrivacySignal[] {
  return [
    ...detectChangeDetection(tx),
    ...detectWalletFingerprint(tx),
    ...detectScriptTypeMix(tx),
    ...detectRoundAmount(tx),
    ...detectConsolidation(tx),
    ...detectCoinjoin(tx),
    ...detectCioh(tx),
    ...detectDustOutput(tx),
    ...detectDustSpending(tx),
    ...detectAnonymitySet(tx),
    ...detectEntropy(tx),
    ...detectPremix(tx),
  ];
}
