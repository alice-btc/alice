import type { SupportedLanguage } from './language-policy.ts';

const fold = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[*_$]/g, '');
const foldAnswer = (text: string) => fold(text).replace(/(?<![\d.,])\d{1,3}(?:,\d{3})+(?![\d.,])/g, n => n.replace(/,/g, ''));
const amount = String.raw`(?<![\d.,+\-])(\d+(?:[ \u00a0\u202f]\d{3})*)\s*sats?\b`;
const value = (text: string) => Number(text.replace(/[ \u00a0\u202f]/g, ''));
type Example = { subsidy: number; fees: number; ceiling: number; comparisons: number[] };

/** Deliberately narrow: an explicit hypothetical coinbase example, whole sats,
 * one unambiguous subsidy and fee total, all in this user turn. No wallet data,
 * previous assistant assertion, current network estimate or implicit units. */
export function coinbaseExample(question: string): Example | null {
  const q = fold(question);
  if (q.length > 1000 || !/\bcoinbase\b/.test(q)
    || !/\b(?:hypothetical|ficti\w*|made.up|example|exemple|exercise|exercice)\b/.test(q)
    || /\b(?:translate|tradu\w*|quote|quotation|python|javascript|btc|bitcoin\s+cash|wallet|balance|solde)\b/.test(q)
    || /[-+]\s*\d|\d[.,]\d|\d[eE][+-]?\d/.test(q)) return null;
  const extract = (label: string) => {
    const before = new RegExp(String.raw`\b(?:${label})(?:\s+(?:autorisee?|permitted|inclus(?:es)?|included|at (?:this|that|the) (?:block )?height|a (?:cette|la) hauteur|(?:des?|de la) transactions?)){0,3}\s*(?:is|are|est|sont|vaut|valent|de|of|:|=)?\s*${amount}`, 'g');
    const after = new RegExp(String.raw`${amount}\s*(?:in|de|of)?\s*(?:transaction\s+)?(?:${label})\b`, 'g');
    return [...new Set([...q.matchAll(before), ...q.matchAll(after)].map(m => value(m[1])))];
  };
  const subsidies = extract('subsidy|subvention');
  const fees = extract('fees|frais');
  if (subsidies.length !== 1 || fees.length !== 1) return null;
  const [subsidy] = subsidies; const [fee] = fees;
  const all = [...q.matchAll(new RegExp(amount, 'g'))].map(m => value(m[1]));
  if (all.length > 8 || all.some(n => !Number.isSafeInteger(n) || n < 0 || n > 2_100_000_000_000_000)
    || subsidy + fee > 2_100_000_000_000_000) return null;
  const comparisons = [...new Set(all.filter(n => n !== subsidy && n !== fee))];
  return comparisons.length <= 4 ? { subsidy, fees: fee, ceiling: subsidy + fee, comparisons } : null;
}

export function resolveCoinbaseExample(question: string, previousUserQuestion = ''): Example | null {
  let e = coinbaseExample(question);
  if (!e && previousUserQuestion) {
    // Only the immediately preceding USER example may supply omitted values.
    // A topic switch, new parameter or real-world request resets this chain.
    const q = fold(question);
    const prior = coinbaseExample(previousUserQuestion);
    // One explicitly replaced fee total, while subsidy and claimed outputs
    // are explicitly kept. Additional numbers or unsupported units reset it.
    const keepsPair = /\bsubsidy and (?:claimed )?coinbase amount (?:the )?same\b/.test(q)
      || /\bsame subsidy and (?:the )?same (?:claimed )?coinbase amount\b/.test(q)
      || /\bmeme subvention et (?:le )?meme montant (?:reclame )?(?:dans la )?coinbase\b/.test(q)
      || /\b(?:je conserve|je garde|nous conservons|nous gardons) la subvention et le montant reclame dans la coinbase\b/.test(q);
    const newFees = [...q.matchAll(new RegExp(String.raw`\b(?:fees|frais)\s*(?:(?:inclus(?:es)?|included)\s+)?(?:(?:passent|passe)\s+)?(?:to|a|are|sont|de|of|:|=)?\s*${amount}`, 'g'))];
    const allAmounts = [...q.matchAll(new RegExp(amount, 'g'))];
    if (prior && keepsPair && q.length <= 1000 && newFees.length === 1 && allAmounts.length === 1
      && !/\b(?:wallet|balance|solde|btc|real|reel\w*|current|today|actuel\w*|translate|tradu\w*)\b|[-+]\s*\d|\d[.,]\d|\d[eE][+-]?\d/.test(q)
      && !/\d/.test(q.replace(new RegExp(amount, 'g'), ''))) {
      const fees = value(newFees[0][1]);
      if (Number.isSafeInteger(fees) && fees >= 0 && prior.subsidy + fees <= 2_100_000_000_000_000)
        return {...prior, fees, ceiling: prior.subsidy + fees};
    }
    // A conceptual question about fees becoming new coins supplies no new
    // numeric fee parameter. Remove only these bounded, number-free phrases
    // from the reset check; any other mention of fees still resets it.
    const resetText = q
      .replace(/\bwith (?:those|the) updated fees\b|\bavec (?:ces|les) frais (?:actualises|mis a jour)\b|\bavec (?:ces|les) nouveaux frais\b/g, '')
      .replace(/\b(?:les )?frais (?:sont|deviennent)(?: (?:alors|de|des))* (?:nouveaux bitcoins|nouveaux satoshis|monnaie nouvelle)\b/g, '')
      .replace(/\b(?:are (?:the )?(?:transaction )?fees|(?:the )?(?:transaction )?fees (?:are|become))(?: then)? (?:new (?:coins|bitcoins|money))\b/g, '');
    if (prior && q.length <= 1000 && /\b(?:coinbase|claim|reclam(?:ation|er|e|ait))\b/.test(q)
      && /\b(?:issued|emis\w*|new|nouveaux|proof of work|preuve de travail|acceptable|plafond|ceiling)\b/.test(q)
      && !/\b(?:subsidy|subvention|fees|frais|lightning|ark|btc|wallet|balance|solde|current|today|actuel\w*|maintenant|compte|account|translate|tradu\w*)\b/.test(resetText)
      && !/[-+]\s*\d|\d[.,]\d|\d[eE][+-]?\d/.test(q)) {
      const values = [...q.matchAll(new RegExp(amount, 'g'))].map(m => value(m[1]));
      const comparisons = [...new Set([...prior.comparisons, ...values])];
      if (comparisons.length <= 4 && values.every(n => Number.isSafeInteger(n) && n >= 0 && n <= 2_100_000_000_000_000)) e = {...prior, comparisons};
    }
  }
  return e;
}

/** Build a bounded arithmetic antecedent from USER turns only. Unknown or
 * ambiguous turns reset the chain. The serialized form is consumed only by
 * calculators; original chat messages and source retrieval remain unchanged. */
export function coinbaseArithmeticAntecedent(userQuestions: readonly string[]): string {
  let antecedent = '';
  for (const question of userQuestions.slice(-3)) {
    const example = resolveCoinbaseExample(question, antecedent);
    antecedent = example
      ? `Hypothetical coinbase example: subsidy is ${example.subsidy} sat; fees are ${example.fees} sat; ${example.comparisons.map(c => `coinbase claim ${c} sat`).join('; ')}.`
      : '';
  }
  return antecedent || userQuestions.at(-1) || '';
}

/** Fixed labels + checked integers only; no user prose or instruction enters
 * this context. It supplements generation, never supplies a direct response. */
export function coinbaseArithmeticEvidence(question: string, language: SupportedLanguage, noteIds: readonly string[], previousUserQuestion = ''): string {
  if (!noteIds.includes('bitcoin-issuance-validation')) return '';
  const e = resolveCoinbaseExample(question, previousUserQuestion);
  if (!e) return '';
  const lines = language === 'fr'
    ? ['[Calculated educational example]', 'Calcul vérifié sur les valeurs fictives fournies, pas sur un bloc réel. S = subvention autorisée ; F = frais existants ; C = somme des sorties coinbase.', `S = ${e.subsidy} sat ; F = ${e.fees} sat ; plafond S + F = ${e.ceiling} sat.`]
    : ['[Calculated educational example]', 'Checked arithmetic on the supplied hypothetical values, not a real block. S = allowed subsidy; F = existing fees; C = sum of coinbase outputs.', `S = ${e.subsidy} sat; F = ${e.fees} sat; ceiling S + F = ${e.ceiling} sat.`];
  for (const c of e.comparisons) {
    const valid = c <= e.ceiling;
    lines.push(language === 'fr'
      ? `Si C = ${c} sat : ${c} ${valid ? '<=' : '>'} ${e.ceiling}, donc ${valid ? 'autorisé par ce contrôle monétaire' : 'rejeté par ce contrôle monétaire'}.${valid ? ` Variation nette C - F = ${c - e.fees} sat.` : ` Dépassement du plafond C - (S + F) = ${c - e.ceiling} sat.`}`
      : `If C = ${c} sat: ${c} ${valid ? '<=' : '>'} ${e.ceiling}, so ${valid ? 'allowed by this monetary check' : 'rejected by this monetary check'}.${valid ? ` Net change C - F = ${c - e.fees} sat.` : ` Excess above ceiling C - (S + F) = ${c - e.ceiling} sat.`}`);
  }
  return lines.join('\n');
}

/** Checks only explicit permission/denial to claim a stated amount under this
 * monetary ceiling. It does not infer whole-block validity or parse an arbitrary
 * mathematical proof. Refutations and conditional non-monetary invalidity are
 * outside the check, not silently converted into positive claims. */
export function coinbaseNumericContradiction(answer: string, question: string, previousUserQuestion = ''): boolean {
  const e = resolveCoinbaseExample(question, previousUserQuestion); if (!e) return false;
  for (const sentence of foldAnswer(answer).split(/(?<=[.!?])\s+|\n+/)) {
    // A conditional restatement of the exact supplied S/F/C example is
    // checkable; a genuinely different hypothetical remains outside scope.
    const claim = sentence.match(new RegExp(String.raw`^\s*(?:si le mineur reclame|if the miner claims)\s+${amount}`));
    const fee = sentence.match(new RegExp(String.raw`\b(?:fees|frais)\s+(?:(?:are|is|sont|de|of)\s+){0,2}${amount}`));
    const subsidy = sentence.match(new RegExp(String.raw`\b(?:subsidy|subvention)\s+(?:(?:is|est|de|of)\s+){0,2}${amount}`));
    const exceeds = sentence.match(new RegExp(String.raw`\b(?:which exceeds|ce qui depasse)\s+(?:the |le )?(?:permitted |allowed )?(?:ceiling|plafond)(?: autorise)?\s+(?:of |de )?${amount}`));
    if (claim && fee && subsidy && exceeds && /\b(?:plus (?:the |les )?(?:fees|frais))\b/.test(sentence)
      && e.comparisons.includes(value(claim[1])) && value(fee[1]) === e.fees
      && value(subsidy[1]) === e.subsidy && value(exceeds[1]) === e.ceiling
      && value(claim[1]) <= e.ceiling) return true;
    if (!sentence.trim() || /\b(?:if|unless|si|sauf)\b/.test(sentence)) continue;
    const ceilingPattern = new RegExp(String.raw`\b(?:ceiling|plafond)(?: (?:permis|autorise))?\s*(?:is|est|de|of|:|=)?\s*${amount}`, 'g');
    if (!sentence.endsWith('?') && !/^\s*["“«]/.test(sentence)) for (const m of sentence.matchAll(ceilingPattern)) {
      if (/\b(?:not|pas|false|faux|incorrect|errone)\b/.test(m[0])
        || /\b(?:not|pas)\s*$/.test(sentence.slice(0, m.index))) continue;
      const before = sentence.slice(0, m.index), after = sentence.slice(m.index! + m[0].length);
      if (/\b(?:false that|wrong to say|faux de dire|faux que)\b/.test(before)
        || /\b(?:is false|is wrong|est faux)\b/.test(after)
        || /^\s*[+\-−]\s*\d/.test(after)) continue;
      const previous = /\b(?:previous|old)(?: allowed)?\s*$/.test(before);
      const expected = previous ? coinbaseExample(previousUserQuestion)?.ceiling : e.ceiling;
      if (expected !== undefined && value(m[1]) !== expected) return true;
    }
    const pattern = new RegExp(String.raw`\b(?:coinbase|miner|mineur)\s+(cannot|can't|may not|must not|can|may|ne peut pas|ne doit pas|peut)\s+(?:claim|reclamer|se verser)\s+${amount}`, 'g');
    for (const m of sentence.matchAll(pattern)) {
      const prefix = sentence.slice(0, m.index);
      if (/\b(?:twice|each|per output|deux fois|chaque|par sortie)\b/.test(sentence.slice(m.index! + m[0].length))) continue;
      if (/\b(?:myth|misconception|false that|not true that|wrong to say|faux de dire|faux que|a tort|erreur de dire)\b/.test(prefix)
        || /^\s*["“«]/.test(sentence)
        || /\b(?:is false|is wrong|est faux|est fausse)\b/.test(sentence.slice(m.index! + m[0].length))) continue;
      const denied = /cannot|can't|not|pas/.test(m[1]);
      const allowed = value(m[2]) <= e.ceiling;
      if (denied === allowed) return true;
    }
  }
  return false;
}

/** Only checks a single unambiguous accepted underclaim from explicit user
 * numbers. A subsidy ceiling, hypothetical alternative or negation is not an
 * assertion of actual net issuance. No amounts are read from assistant history. */
export function coinbaseIssuanceContradiction(answer: string, question: string, previousUserQuestion = ''): boolean {
  const e=resolveCoinbaseExample(question,previousUserQuestion); if(!e)return false;
  const accepted=e.comparisons.filter(c=>c<e.ceiling);
  if(accepted.length!==1)return false;
  const expected=accepted[0]-e.fees;
  const patterns=[
    new RegExp(String.raw`${amount}[^\d.!?;]{0,60}\b(?:represente(?:nt)? (?:de |des )?nouveaux bitcoins emis|represents? newly issued bitcoins)\b`,'g'),
    new RegExp(String.raw`${amount}\s*(?:de monnaie (?:nouvelle|nouvellement (?:emise|creee))|of new (?:money|coins))\b`,'g'),
    new RegExp(String.raw`${amount}[^\d.!?;]{0,45}\b(?:correspond(?:ent)? a une emission nouvelle|represents? new issuance)\b`,'g'),
    new RegExp(String.raw`\b(?:quantite de monnaie nouvellement emise par ce bloc|augmentation nette|variation nette|net (?:supply )?(?:increase|change|issuance)|new (?:coins|money) (?:issued|created) by this block)[^\d.!?;]{0,45}${amount}`,'g'),
  ];
  for(const clause of foldAnswer(answer).split(/(?<=[.!?])\s+|\n+|;|\b(?:but|mais|however|pourtant)\b/)) {
    const fullClaimCondition = /\b(?:if|when|si|quand|lorsque)\b[^.!?;]{0,50}\b(?:claims? (?:the )?(?:full|maximum)|reclame (?:le plafond|la totalite|la recompense maximale))\b/.test(clause);
    const alwaysFullSubsidy = /\b(?:augmentation (?:reelle|nette)|variation nette|net (?:increase|issuance)|emission)\b[^.!?;]{0,150}\b(?:toujours egale|reste identique|always equals?|always equal|remains equal)\b[^.!?;]{0,35}\b(?:subvention|subsidy)\b/;
    if (!fullClaimCondition && alwaysFullSubsidy.test(clause) && !/\b(?:pas|jamais|not|never|false|faux)\b/.test(clause)) return true;

    // C - F depends on the actual claim C. A correct number for one C must
    // not be generalized to every claim, even if the sentence also mentions
    // the permitted ceiling. A fixed ceiling is a different, valid assertion.
    const constantNet = /\b(?:augmentation nette|variation nette|net (?:supply )?(?:increase|change|issuance))\b[^.!?;]{0,65}\b(?:reste|demeure|remains?|stays?|is always|est toujours)\b[^.!?;]{0,180}\b(?:quelle que soit|quel que soit|regardless of|irrespective of)\b[^.!?;]{0,65}\b(?:coinbase|reclame\w*|claim(?:ed)?)\b/;
    const constantClaim = clause.match(constantNet);
    if (constantClaim && !clause.endsWith('?')
      && !/\b(?:pas|jamais|not|never|false|faux)\b/.test(constantClaim[0])
      && !/\b(?:false|faux)\b/.test(clause.slice(0, constantClaim.index))
      && !/\b(?:if|si)\b[^.!?;]{0,35}\b(?:fees|frais)\b/.test(clause)) return true;

    if(/\b(?:au plus|au maximum|at most|maximum|ceiling|plafond|permitted|allowed|autorise\w*|if|unless|si|sauf|faux|false|incorrect|errone)\b/.test(clause)||clause.endsWith('?'))continue;
    for(const pattern of patterns) for(const m of clause.matchAll(pattern)) {
      const prefix=clause.slice(0,m.index);
      if(/\b(?:pas|not|never|jamais)\b/.test(m[0])||/\b(?:not|pas)\s*$/.test(prefix))continue;
      if(value(m[1])!==expected)return true;
    }
  }
  return false;
}

/** Check an explicitly stated excess for one supplied overclaim. It is C-S-F,
 * not C-S. A different conditional subsidy/fee example is not inferred. */
export function coinbaseExcessContradiction(answer: string, question: string, previousUserQuestion = ''): boolean {
  const e = resolveCoinbaseExample(question, previousUserQuestion);
  if (!e) return false;
  const claims = e.comparisons.filter(c => c > e.ceiling);
  if (claims.length !== 1) return false;
  const expected = claims[0] - e.ceiling;
  const patterns = [
    new RegExp(String.raw`${amount}[^\d.!?;]{0,50}\b(?:excess|excessive|unauthori[sz]ed|illegal|illegaux|illegale?s?|excedentaires?)\b`, 'g'),
    new RegExp(String.raw`\b(?:excess|excedent|depassement)(?: (?:above|du|de|the|le|plafond|ceiling))*\s*(?:is|est|de|of|:|=)?\s*${amount}`, 'g'),
  ];
  for (const clause of foldAnswer(answer).split(/(?<=[.!?])\s+|\n+|;|\b(?:but|mais|however)\b/)) {
    if (/\b(?:false|faux|incorrect|errone)\b/.test(clause) || clause.endsWith('?')) continue;
    if (/\b(?:if|si|unless|sauf)\b/.test(clause)) {
      // The condition must be the supplied overclaim, not a changed parameter.
      const conditional = clause.match(new RegExp(String.raw`^\s*(?:si le mineur reclame|if the miner claims)\s+${amount}`));
      if (!conditional || value(conditional[1]) !== claims[0] || /\b(?:subsidy|subvention|fees|frais)\b/.test(clause)) continue;
    }
    for (const pattern of patterns) for (const m of clause.matchAll(pattern)) {
      if (/\b(?:not|never|pas|jamais)\b/.test(m[0]) || /\b(?:not|pas)\s*$/.test(clause.slice(0,m.index))) continue;
      if (value(m[1]) !== expected) return true;
    }
  }
  return false;
}


/** A stated S+F ceiling with positive fees cannot be the maximum NEW supply.
 * Resolve "this ceiling" only against the immediately preceding, explicit
 * checked amount. Do not infer a referent for a generic supply-cap discussion. */
export function coinbaseCeilingIssuanceContradiction(answer: string, question: string, previousUserQuestion = ''): boolean {
  const e = resolveCoinbaseExample(question, previousUserQuestion);
  if (!e || e.fees <= 0) return false;
  const sentences = foldAnswer(answer).split(/(?<=[.!?])\s+|\n+/).map(s => s.trim());
  const reference = new RegExp(String.raw`\b(?:ceiling|plafond)\s*(?:of|de|is|est|:|=)?\s*${e.ceiling}\s*sats?\b`);
  for (let index = 1; index < sentences.length; index++) {
    const prior = sentences[index-1], claim = sentences[index];
    if (!reference.test(prior) || !/\b(?:subsidy|subvention)\b/.test(prior) || !/\b(?:fees|frais)\b/.test(prior)) continue;
    if (claim.endsWith('?') || /\b(?:new (?:bitcoins?|coins) (?:and|plus) existing|nouveaux bitcoins (?:et|plus) (?:des )?bitcoins existants)\b/.test(claim)) continue;
    if (/^(?:this|that) ceiling (?:represents?|is) (?:the )?maximum (?:value |amount )?(?:of )?new (?:bitcoins?|coins|money)\b/.test(claim)
      || /^ce plafond (?:represente|est) (?:le )?(?:maximum|montant maximal)(?: de)? (?:nouveaux bitcoins|monnaie nouvelle)\b/.test(claim)) return true;
  }
  return false;
}
