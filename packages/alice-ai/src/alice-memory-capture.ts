import { aliceMemoryRefusalReason, foldForMatching, type AliceMemoryCandidate, type AliceMemoryCategory } from './alice-memory-core.ts';

// Model output proposes a summary; only a current first-person declaration
// supplies evidence. A question's requested teaching style is not a lasting
// preference, and neither an assistant reply nor saved context is evidence.
const DECLARATIONS: [AliceMemoryCategory, RegExp][] = [
  ['preference', /^(?:i prefer|i like|je prefere|j'aime)\s+(.+)$/],
  ['setup', /^(?:i use|i have|i run|j'utilise|je possede|j'ai)\s+(.+)$/],
  ['experience', /^(?:i have used|i've used|i usually|i have previously|j'ai utilise|j'utilise habituellement|je fais habituellement)\s+(.+)$/],
  ['goal', /^(?:my goal is|my objective is|mon objectif est)\s+(.+)$/],
  ['project', /^(?:i am building|i'm building|i am working on|i'm working on|je construis|je travaille sur)\s+(.+)$/],
  ['interest', /^(?:i am interested in|i'm interested in|je m'interesse a)\s+(.+)$/],
  ['background', /^(?:i work with|i am familiar with|i'm familiar with|i am|i'm|je travaille avec|je connais|je suis)\s+(.+)$/],
  ['constraint', /^(?:i cannot|i can't|i have no|i am limited to|i'm limited to|je ne peux pas|je n'ai pas de|je suis limite a)\s+(.+)$/],
];

// Ignore grammatical summary wrappers, not factual qualifiers. Any extra
// expertise, device, habit or topic word still needs evidence in the clause.
const WRAPPERS = new Set('a an the to of with for and in on at as my i am is are it this that use uses used using have has prefer prefers like likes familiar work works working building interested interest goal objective background setup preference experience constraint answers answer explanations explanation responses response des les le la un une de du a au aux avec pour et en mon ma mes je suis utilise utilisees utilisee prefere reponses reponse explications explication'.split(' '));
const SAME_MEANING: Record<string, string> = {
  examples: 'example', exemples: 'example', exemple: 'example',
  analogies: 'analogy', analogie: 'analogy',
  concise: 'brief', short: 'brief', concis: 'brief', courtes: 'brief', courts: 'brief', courte: 'brief', court: 'brief',
  detailed: 'detailed', detaille: 'detailed', detaillees: 'detailed', detaillee: 'detailed', detailles: 'detailed',
  databases: 'database', donnees: 'database', bases: 'database', relational: 'relational', relationnelles: 'relational',
  wallets: 'wallet', portefeuille: 'wallet', portefeuilles: 'wallet', materiel: 'hardware',
  btc: 'bitcoin', debutant: 'beginner', debutante: 'beginner',
};

function evidenceTerms(value: string): string[] {
  return foldForMatching(value).replace(/[^a-z0-9]+/g, ' ').split(/\s+/)
    .filter(term => term && !WRAPPERS.has(term)).map(term => SAME_MEANING[term] ?? term);
}

export function currentMemorySourceClauses(userMessage: string): string[] {
  const unquoted = userMessage.replace(/"[^"\n]*"|«[^»\n]*»|“[^”\n]*”/g, ' ')
    .replace(/(^|\s)['‘][^'’\n]*['’](?=\s|[.!?;,]|$)/g, '$1 ');
  return unquoted.split(/(?<=[.!?;])\s+|,?\s+(?:but|mais)\s+|,?\s+(?:and|et)\s+(?=(?:i|je)\b|j')/i)
    .filter(raw => !raw.includes('?') && aliceMemoryRefusalReason(raw) === null)
    .map(raw => raw.replace(/[.!;]+$/, '').trim());
}

function currentDeclarationClauses(userMessage: string): string[] {
  return currentMemorySourceClauses(userMessage).map(foldForMatching);
}

/** Bounded explicit paraphrases, independent of whether a model is called. */
export function additionalExplicitMemoryCandidates(userMessage: string): AliceMemoryCandidate[] {
  const facts: AliceMemoryCandidate[] = [];
  for (const clause of currentDeclarationClauses(userMessage)) {
    if (/^(?:i (?:usually|generally|typically|normally) prefer (?:brief|short|concise) answers|les reponses (?:breves|courtes|concises) me conviennent (?:mieux|bien))$/.test(clause)) {
      facts.push({ category: 'preference', text: 'Prefers concise answers' });
    } else if (/^(?:i (?:don't|do not) like (?:long|lengthy) answers|je n'aime pas les reponses longues)$/.test(clause)) {
      facts.push({ category: 'preference', text: 'Dislikes long answers' });
    } else if (/^(?:(?:i've|i have) been working with sql databases(?: for (?:years|a long time))?|i work with sql databases|je travaille avec (?:des |les )?bases de donnees sql(?: depuis (?:des annees|longtemps))?)$/.test(clause)) {
      facts.push({ category: 'background', text: 'Works with SQL databases' });
    } else if (/^(?:(?:i've|i have) been working with relational databases(?: for (?:years|a long time))?)$/.test(clause)) {
      facts.push({ category: 'background', text: 'Familiar with relational databases' });
    } else if (/^(?:(?:a|my) hardware wallet is what i use(?: (?:every day|regularly))?|c'est un portefeuille materiel que j'utilise(?: (?:chaque jour|regulierement))?)$/.test(clause)) {
      facts.push({ category: 'setup', text: 'Uses a hardware wallet' });
    } else if (/^je debute dans bitcoin$/.test(clause)) {
      facts.push({ category: 'background', text: 'Beginner with Bitcoin' });
    } else if (/^je m'interesse a (?:la )?confidentialite (?:de |sur )?bitcoin$/.test(clause)) {
      facts.push({ category: 'interest', text: 'Interested in Bitcoin privacy' });
    }
  }
  return facts;
}

/** A fact inside a mixed sentence must not hide that sentence's question. */
export function isAdditionalExplicitMemoryDeclaration(message: string): boolean {
  const whole = foldForMatching(message).replace(/[.!;]+$/, '').trim();
  return currentDeclarationClauses(message).includes(whole)
    && additionalExplicitMemoryCandidates(message).length > 0;
}

/** Conservative provenance check, not semantic inference or an extra model. */
export function groundedModelMemoryCandidates(candidates: AliceMemoryCandidate[], userMessage: string): AliceMemoryCandidate[] {
  const declarations: { category: AliceMemoryCategory; evidence: Set<string> }[] = [];
  for (const clause of currentDeclarationClauses(userMessage)) {
    for (const [category, pattern] of DECLARATIONS) {
      const match = pattern.exec(clause);
      if (!match) continue;
      // Do not reinterpret denial, speculation or a requested explanation
      // inside a declarative-looking opening as a new personal fact.
      if (/\b(?:not|no|never|without|if|would|might|could|pas|jamais|sans|aucun\w*|si|peut etre)\b/.test(match[1])) continue;
      declarations.push({ category, evidence: new Set(evidenceTerms(clause)) });
    }
  }
  const explicit = additionalExplicitMemoryCandidates(userMessage);
  return candidates.filter(candidate => {
    const terms = evidenceTerms(candidate.text);
    return terms.length > 0 && (declarations.some(source => source.category === candidate.category
      && terms.every(term => source.evidence.has(term)))
      || explicit.some(source => source.category === candidate.category
        // Removing a negative predicate would reverse the user's preference.
        && (source.text.startsWith('Dislikes ')
          ? foldForMatching(candidate.text) === foldForMatching(source.text)
          : terms.every(term => evidenceTerms(source.text).includes(term)))));
  });
}
