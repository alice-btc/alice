import type { SupportedLanguage } from './language-policy.ts';
const fold = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[*_$]/g,'');
const n = String.raw`\d+(?:[ \u00a0\u202f]\d{3})*`;
const val = (text: string) => Number(text.replace(/[ \u00a0\u202f]/g,''));
const sat = String.raw`(?<![\d.,+\-])(${n})\s*sat(?:oshi)?s?\b`;
// Generated English prose commonly groups thousands and spells out satoshis.
// This normalization applies to answers only, not the stricter question parser.
const foldAnswer = (text: string) => fold(text).replace(/(?<![\d.,])\d{1,3}(?:,\d{3})+(?![\d.,])/g, value => value.replace(/,/g, ''));
type Example = { inputs: number[]; total: number; payment: number; fee: number; change: number };

/** Explicit educational inputs/payment/fee in whole sats, from the current
 * user turn only. Ambiguous roles, units and insufficient funds yield nothing. */
export function utxoExample(question: string): Example | null {
  const q=fold(question);
  if(q.length>1000 || !/\b(?:ficti\w*|hypothetical|made.up|example|exemple|imagine)\b/.test(q)
    || /\b(?:coinbase|lightning|ark|btc|translate|tradu\w*|python|javascript|balance|solde)\b/.test(q)
    || /[-+]\s*\d|\d[.,]\d|\d[eE][+-]?\d/.test(q)
    // "3 inputs of 400 sats each" states a count, which this parser would
    // read as one input of 400 sats.
    || /\b(?:each|apiece|chacune?|par (?:entree|sortie)|per (?:input|output))\b|\d\s*[x×]\s*\d/.test(q)) return null;
  // Remove amounts explicitly assigned to payment/fees before reading a list
  // of inputs: a comma may introduce a recipient amount, not another input.
  let inputText=q;
  const extract=(patterns: string[]) => [...new Set(patterns.flatMap(pattern=>[...q.matchAll(new RegExp(pattern,'g'))].map(m=>{
    inputText=inputText.slice(0,m.index)+' '.repeat(m[0].length)+inputText.slice(m.index!+m[0].length);
    return val(m[1]);
  })))];
  const payments=extract([
    String.raw`\b(?:recipient\s+(?:gets|receives)|destinataire\s+(?:recoit|recevra)|pay|payer|payment(?:\s+is)?|paiement)\s*(?:of|de|:|=)?\s*${sat}`,
    String.raw`${sat}\s*(?:for|to|pour|au)\s*(?:the |le )?(?:recipient|destinataire)\b`,
  ]);
  const fees=extract([String.raw`\b(?:fee|fees|frais)\s*(?:is|are|est|sont|vaut|valent|de|of|:|=)?\s*${sat}`,String.raw`${sat}\s*(?:in|de|of)?\s*(?:fees|frais)\b`]);
  const inputPattern = new RegExp(String.raw`\b(?:inputs?|entrees?|(?:old|previous) outputs?|anciennes? sorties?|(?:spend(?:s|ing)?|depens(?:e|er|ons))\s+(?:(?:together|ensemble)\s+)?(?:(?:the|les|ces|two|three|deux|trois|\d+)\s+)?(?:outputs?|sorties))\s*(?:is|are|of|de|:|=)?\s*(${n}(?:\s*sats?\b)?(?:\s*(?:,|and|et|\+)\s*${n}(?:\s*sats?\b)?)*)\s*sats?\b`,'g');
  const sections=[...inputText.matchAll(inputPattern)];
  if(sections.length!==1) return null;
  const inputs=[...sections[0][1].matchAll(new RegExp(n,'g'))].map(m=>val(m[0]));
  if(inputs.length<1 || inputs.length>8 || payments.length!==1 || fees.length!==1) return null;
  if([...inputs,...payments,...fees].some(v=>!Number.isSafeInteger(v)||v<0||v>2_100_000_000_000_000)) return null;
  const total=inputs.reduce((a,b)=>a+b,0),payment=payments[0],fee=fees[0],change=total-payment-fee;
  if(!Number.isSafeInteger(total)||total>2_100_000_000_000_000||change<0) return null;
  return {inputs,total,payment,fee,change};
}
/** Carry only an immediately preceding explicit user example and an explicit
 * same-inputs/same-payment fee replacement. Never infer numbers from replies. */
export function resolveUtxoExample(question: string, previousUserQuestion = ''): Example | null {
  const explicit = utxoExample(question);
  if (explicit) return explicit;
  const prior = utxoExample(previousUserQuestion), q = fold(question);
  if (!prior || q.length > 1000
    || !/\b(?:same inputs|memes entrees)\b/.test(q)
    || !/\b(?:same payment|meme paiement)\b/.test(q)
    || /\b(?:coinbase|lightning|ark|btc|translate|tradu\w*|wallet|balance|solde|real|reel\w*|today|actuel\w*)\b/.test(q)
    || /[-+]\s*\d|\d[.,]\d|\d[eE][+-]?\d/.test(q)) return null;
  const feeMatches = [
    ...q.matchAll(new RegExp(String.raw`\b(?:fee|fees|frais)\s*(?:(?:is|are|est|sont|de|of|to|a|:|=)\s*)?${sat}`, 'g')),
    ...q.matchAll(new RegExp(String.raw`${sat}\s*(?:in|de|of)?\s*(?:fees|frais)\b`, 'g')),
  ];
  const fees = [...new Set(feeMatches.map(m => val(m[1])))];
  const amounts = [...q.matchAll(new RegExp(sat, 'g'))];
  // Reject any additional amount, including an unlabelled number or unit.
  const withoutAmounts = q.replace(new RegExp(sat, 'g'), '');
  if (fees.length !== 1 || amounts.length !== 1 || /\d/.test(withoutAmounts)) return null;
  const fee = fees[0], change = prior.total - prior.payment - fee;
  if (!Number.isSafeInteger(fee) || fee < 0 || change < 0) return null;
  return { ...prior, fee, change };
}

export function utxoArithmeticEvidence(question: string, language: SupportedLanguage, noteIds: readonly string[], previousUserQuestion = ''): string {
  if(!noteIds.includes('transaction-inputs-outputs'))return '';
  const e=resolveUtxoExample(question, previousUserQuestion);if(!e)return '';
  const prior = utxoExample(previousUserQuestion);
  const delta = prior ? e.change - prior.change : 0;
  const update = prior && !utxoExample(question)
    ? language === 'fr'
      ? ` Les frais passent de ${prior.fee} à ${e.fee} sat. La monnaie passe de ${prior.change} à ${e.change} sat : elle ${delta > 0 ? 'augmente' : delta < 0 ? 'diminue' : 'ne change pas'}${delta ? ` de ${Math.abs(delta)} sat` : ''}.`
      : ` Fees change from ${prior.fee} to ${e.fee} sat. Change moves from ${prior.change} to ${e.change} sat: it ${delta > 0 ? 'increases' : delta < 0 ? 'decreases' : 'does not change'}${delta ? ` by ${Math.abs(delta)} sat` : ''}.` : '';
  return (language==='fr'
    ? `[Calculated educational example]\nCalcul sur les seules valeurs fictives fournies. Entrées : ${e.inputs.join(' + ')} = ${e.total} sat, consommées entièrement. Paiement = ${e.payment} sat ; frais = ${e.fee} sat. Monnaie = ${e.total} - ${e.payment} - ${e.fee} = ${e.change} sat. Contrôle : ${e.payment} + ${e.change} + ${e.fee} = ${e.total} sat. Total des sorties = ${e.payment} + ${e.change} = ${e.total-e.fee} sat, soit entrées moins frais. Les sorties sont le paiement et la monnaie ; les frais ne sont pas une sortie. Ce calcul ne prouve pas l’identité d’un propriétaire.`
    : `[Calculated educational example]\nArithmetic on the supplied hypothetical values only. Inputs: ${e.inputs.join(' + ')} = ${e.total} sat, consumed in full. Payment = ${e.payment} sat; fee = ${e.fee} sat. Change = ${e.total} - ${e.payment} - ${e.fee} = ${e.change} sat. Check: ${e.payment} + ${e.change} + ${e.fee} = ${e.total} sat. Total outputs = ${e.payment} + ${e.change} = ${e.total-e.fee} sat, inputs minus fee. Outputs are payment and change; the fee is not an output. This arithmetic does not prove an owner’s identity.`) + update;
}
export function utxoNumericContradiction(answer: string, question: string, previousUserQuestion = ''): boolean {
  const e=resolveUtxoExample(question, previousUserQuestion);if(!e)return false;
  const prior = utxoExample(previousUserQuestion);
  if (prior && !utxoExample(question)) {
    const delta = e.change - prior.change;
    const directions = [
      new RegExp(String.raw`\b(?:change(?: output)?|monnaie(?: rendue)?)\s+(increases?|decreases?|augmente|diminue)\s+(?:by|de)\s*${sat}`, 'g'),
      new RegExp(String.raw`\b(increases?|decreases?|reduces?|augmente|diminue|reduit)\s+(?:the |la )?(?:change(?: output)?|monnaie(?: rendue)?)\s+(?:by|de)\s*${sat}`, 'g'),
    ];
    for (const sentence of foldAnswer(answer).split(/(?<=[.!?])\s+|\n+|;/)) {
      if (sentence.endsWith('?') || /^\s*["“«]/.test(sentence)) continue;
      if (/\b(?:if|si|unless|sauf)\b/.test(sentence)) {
        const fees = [...sentence.matchAll(new RegExp(String.raw`\b(?:fees?|frais)\s*(?:to|a|is|are|de|of|:|=)?\s*${sat}`, 'g'))];
        if (!/\b(?:same inputs|memes entrees)\b/.test(sentence)
          || !/\b(?:same payment|meme paiement)\b/.test(sentence)
          || fees.length !== 1 || val(fees[0][1]) !== e.fee) continue;
      }
      for (const direction of directions) for (const match of sentence.matchAll(direction)) {
        const prefix = sentence.slice(Math.max(0, match.index! - 35), match.index);
        if (/\b(?:not|pas|never|jamais)\s*$/.test(prefix)) continue;
        const claimed = val(match[2]) * (/^(?:decreas|reduc|diminue|reduit)/.test(match[1]) ? -1 : 1);
        if (claimed !== delta) return true;
      }
    }
  }
  const patterns=[
    new RegExp(String.raw`\b(?:change(?: output)?|monnaie(?: rendue)?)\s*(?:(?:is|est|vaut|equals|:|=)\s*)?(?:of|de)?\s*${sat}`,'g'),
    new RegExp(String.raw`${sat}\s*(?:\([^)]{0,100}\)\s*)?(?:of change|de monnaie|(?:which|qui)\s+(?:is|constitue|constitutes)\s+(?:the |la )?(?:change|monnaie))\b`,'g'),
  ];
  for(const sentence of foldAnswer(answer).split(/(?<=[.!?])\s+|\n+|;|\b(?:but|however|mais|pourtant)\b/)) {
    if(/\b(?:if|unless|si|sauf|false|faux|myth|mythe|incorrect|errone)\b/.test(sentence)||sentence.endsWith('?')||/^\s*["“«]/.test(sentence))continue;
    const transitionSpans: [number, number][] = [];
    if (prior && !utxoExample(question)) {
      const transition = new RegExp(String.raw`\b(?:monnaie(?: rendue)?\s+(?:passe|change)\s+de|change(?: output)?\s+(?:goes|moves|changes)\s+from)\s*${sat}\s+(?:a|to)\s*${sat}`, 'g');
      for (const match of sentence.matchAll(transition)) {
        if (val(match[1]) !== prior.change || val(match[2]) !== e.change) return true;
        transitionSpans.push([match.index!, match.index! + match[0].length]);
      }
    }
    for(const pattern of patterns) for(const match of sentence.matchAll(pattern)) {
      // French "la monnaie change de A à B" uses change as a verb. Both
      // amounts were checked above; A must not be re-read as current change.
      if (transitionSpans.some(([start, end]) => match.index! >= start && match.index! + match[0].length <= end)) continue;
      const prefix=sentence.slice(Math.max(0,match.index!-30),match.index);
      if(/\b(?:not|never|pas|jamais)\s+(?:(?:the|a|le|la|une?)\s+)?$/.test(prefix))continue;
      // In "increases the change by700" the amount is a delta, not the new
      // change output. Its direction was checked above when a prior exists.
      if (/\b(?:increases?|decreases?|reduces?|augmente|diminue|reduit)\s+(?:the |la )?$/.test(prefix)) continue;
      const before = sentence.slice(0, match.index);
      // A parenthetical old amount belongs to the explicitly named prior-fee
      // scenario, not to the current result after the closing parenthesis.
      // A generic "compared with the previous transaction" is insufficient.
      const opening = before.lastIndexOf('(');
      const oldFee = opening > before.lastIndexOf(')')
        ? before.slice(Math.max(0, opening - 180), opening).match(new RegExp(String.raw`\b(?:premier resultat|first result|previous result)\b[^.!?()]{0,70}\b(?:frais etaient(?: de)?|fees were)\s*${sat}\s*$`))
        : null;
      const isPrevious = /\b(?:previous|old|ancienne|precedente)\s*$/.test(before)
        || /^\s*(?:previously|before|auparavant|avant)\s*,?\s*(?:the|la)?\s*$/.test(before)
        || Boolean(prior && oldFee && val(oldFee[1]) === prior.fee);
      const expected = isPrevious ? prior?.change : e.change;
      if(expected !== undefined && val(match[1])!==expected)return true;
    }
  }
  return false;
}

/** A checked example can also contradict itself while giving correct change:
 * all the input value is said to reach outputs, silently dropping the fee. */
export function utxoOutputTotalContradiction(answer: string, question: string, previousUserQuestion = ''): boolean {
  const e = resolveUtxoExample(question, previousUserQuestion);
  if (!e) return false;
  const patterns = [
    new RegExp(String.raw`\b(?:sum of (?:the )?(?:new )?outputs|total (?:new )?outputs|total des (?:nouvelles )?sorties)\s*(?:is|equals|est|vaut|=|:)?\s*${sat}`, 'g'),
    new RegExp(String.raw`\b(?:entire|full|all|totalite des)\s+${sat}[^.!?;]{0,60}\b(?:transferred|sent|allocated|assigned|transferee?s?|envoyee?s?|attribuee?s?)\s+(?:to|into|aux|vers)\s+(?:the |les )?(?:new outputs|nouvelles sorties)\b`, 'g'),
  ];
  for (const sentence of foldAnswer(answer).split(/(?<=[.!?])\s+|\n+|;|\b(?:but|however|mais|pourtant)\b/)) {
    if (/\b(?:if|unless|si|sauf|false|faux|incorrect|errone)\b/.test(sentence) || sentence.endsWith('?')) continue;
    for (const pattern of patterns) for (const match of sentence.matchAll(pattern)) {
      const prefix = sentence.slice(0, match.index);
      const suffix = sentence.slice(match.index! + match[0].length);
      if (/\b(?:not|never|pas|jamais)\b/.test(match[0]) || /\b(?:not|pas)\s*$/.test(prefix)) continue;
      // The complete allocation outputs PLUS fees is legitimate.
      if (/^\s*(?:and|plus|et|\+)\s+(?:the |les )?(?:fees?|frais)\b/.test(suffix)) continue;
      if (/^\s*[+\-−]\s*\d/.test(suffix)) continue; // First operand of an expression is not its total.
      if (val(match[1]) !== e.total - e.fee) return true;
    }
  }
  return false;
}
