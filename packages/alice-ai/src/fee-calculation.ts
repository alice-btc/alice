import type { SupportedLanguage } from './language-policy.ts';

type Turn = { role: string; content: string };
type Parameters = { size: number; rate: number };
const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const number = String.raw`\d+(?:[ \u00a0\u202f]\d{3})*(?:[.,]\d+)?`;
const values = (q: string, unit: string) => [...q.matchAll(new RegExp(String.raw`(?<![\d.,+\-])(${number})\s*${unit}`, 'g'))]
  .map(match => Number(match[1].replace(/[ \u00a0\u202f]/g, '').replace(',', '.')));
const blocked = (q: string) => q.length > 700 || /\b(?:translate|tradu\w*|code|python|javascript|lightning|ethereum|solana|ark|coinjoin|current|today|now|actuel\w*|aujourd|maintenant|broadcast|send|envoie|signer|tax\w*|impot\w*|rbf|cpfp|confirm\w*|mempool)\b/.test(q)
  || /\d,\d{3}\b|[-+]\s*\d|\d[eE][+-]?\d|\b(?:infinity|nan)\b/.test(q);

function parameters(question: string, previous?: Parameters): Parameters | null {
  const q = normalize(question);
  if (blocked(q)) return null;
  const sizes = values(q, String.raw`v(?:b|bytes?)\b`);
  const rates = values(q, String.raw`(?:sats?|satoshis?)\s*\/\s*v(?:b|bytes?)\b`);
  if (sizes.length > 1 || rates.length > 1) return null;
  const sameSize = /\b(?:same (?:virtual )?size|meme taille)\b/.test(q);
  const sameRate = /\b(?:same (?:fee )?rate|meme taux)\b/.test(q);
  const halfRate = /\b(?:half (?:that|the|this) (?:fee )?rate|moitie (?:de ce|du|de son) taux)\b/.test(q);
  if ((rates.length && (sameRate || halfRate)) || (sameRate && halfRate)) return null;
  const size = sizes[0] ?? (sameSize ? previous?.size : undefined);
  const rate = rates[0] ?? ((sameRate || halfRate) ? previous?.rate : undefined);
  if (size === undefined || rate === undefined) return null;
  const adjustedRate = halfRate ? rate / 2 : rate;
  if (!Number.isSafeInteger(size) || size <= 0 || size > 1_000_000 || !Number.isFinite(adjustedRate) || adjustedRate <= 0 || adjustedRate > 1_000_000) return null;
  if (!Number.isSafeInteger(Math.round(adjustedRate * 10000)) || Math.abs(adjustedRate * 10000 - Math.round(adjustedRate * 10000)) > 1e-6) return null;
  return { size, rate: adjustedRate };
}

/** A generic explanation must not swallow an unsupported numeric calculation. */
export function hasFeeCalculationParameters(question: string): boolean {
  return /\d[\s\S]*\b(?:vb|vbytes?|sats?\s*\/\s*vb)\b/i.test(question);
}

/** Educational arithmetic only: values come from user turns, never model replies. */
export function feeCalculation(question: string, language: SupportedLanguage, history: readonly Turn[] = []): string | null {
  const q = normalize(question);
  if (blocked(q)) return null;
  const users = history.filter(turn => turn.role === 'user').map(turn => turn.content);
  if (users.at(-1) === question) users.pop();
  // A non-calculation turn resets the chain, including an explicit topic switch.
  let prior: Parameters | undefined;
  for (const text of users.slice(-4)) prior = parameters(text, prior) ?? undefined;
  const p = parameters(question, prior);
  if (!p) return null;
  const marginal = /\b(?:marginal|entree|input)\b/.test(q);
  const dust = /\bdust\b/.test(q);
  const amountQuestion = /\b(?:larger amount|montant|amount|plus de bitcoins)\b/.test(q);
  if (dust && !marginal) return null;
  if ((q.match(/\?/g)?.length ?? 0) > 1 && !dust && !amountQuestion) return null;
  if (/\b(?:why|pourquoi|how|comment|who|qui)\b/.test(q) && !/\b(?:calcul\w*|multiply|multipli\w*)\b/.test(q)) return null;
  const amountValues = marginal ? values(q, String.raw`(?:sats?|satoshis?)\b(?!\s*\/)`) : [];
  if (marginal && (amountValues.length !== 1 || !Number.isSafeInteger(amountValues[0]) || amountValues[0] <= 0)) return null;
  const fee = Number((p.size * p.rate).toFixed(4));
  const format = (value: number) => new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 4 }).format(value);
  const math = `${format(p.size)} vB × ${format(p.rate)} sat/vB = ${format(fee)} sats`;
  const concise = /\b(?:juste|just|only|one sentence|une phrase)\b/.test(q);
  if (marginal) {
    const value = amountValues[0];
    const relation = fee > value ? (language === 'fr' ? 'dépasse' : 'exceeds') : fee === value ? (language === 'fr' ? 'égale' : 'equals') : (language === 'fr' ? 'reste inférieur à' : 'is below');
    return language === 'fr'
      ? `${math} de coût marginal pour cette entrée, ce qui ${relation} sa valeur de ${format(value)} sats. Ce n’est pas le coût total de la transaction. La rentabilité à ce taux hypothétique est distincte de la politique de relais dust appliquée lors de la création des sorties.`
      : `${math} of marginal cost for this input, which ${relation} its value of ${format(value)} sats. This is not the total transaction fee. Economics at this hypothetical rate are distinct from dust relay policy applied when outputs are created.`;
  }
  let answer = `${math}.`;
  if (!Number.isInteger(fee)) answer += language === 'fr'
    ? ` Pour atteindre au moins ce taux avec des frais entiers, il faut ${format(Math.ceil(fee))} sats.`
    : ` Reaching at least this rate with whole-satoshi fees requires ${format(Math.ceil(fee))} sats.`;
  if (amountQuestion) answer += language === 'fr' ? ' À taille et taux identiques, envoyer un montant plus grand ne change pas ces frais.' : ' Sending a larger amount does not change this fee if virtual size and fee rate stay the same.';
  else if (!concise) answer += language === 'fr' ? ' On multiplie la taille virtuelle par le taux fourni dans cet exemple ; ce taux n’est pas une estimation actuelle du réseau.' : ' Multiply virtual size by the rate supplied in this example; this is not a current network fee estimate.';
  return answer;
}
