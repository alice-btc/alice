import { foldTopic, isImplicitCpfpQuestion, isMonetaryIssuanceQuestion, isLightningPrivacyQuestion, isInputOutputAllocationQuestion, isUnconfirmedReceiptReplacementQuestion } from './retrieval-topic-cues.ts';
import { coinbaseArithmeticAntecedent, resolveCoinbaseExample } from './coinbase-arithmetic.ts';
import { isComparisonRagQuery, isLightningPaymentWalkthrough, isLightningRoutingStateQuestion } from './rag-query-policy.ts';
import type { Message } from './llm.ts';
import { isExplicitContinuationRequest, planAliceTurn, type AliceTurnPlan } from './turn-planner.ts';

/**
 * Deterministic retrieval-query rewriting for multi-turn follow-ups.
 *
 * "Pourquoi ?", "Développe", "Tell me more" carry no retrievable subject:
 * searching the knowledge base with them returns noise, and the answer drifts
 * away from the topic the user is still asking about. The rewrite is local,
 * pure and bounded. It reuses the question clause of a recent user turn taken
 * from the in-memory history: no stored state, no extra model or network call,
 * never an assistant answer, never a personal declaration, never a memory
 * question, and never a previously rewritten query. The user message itself
 * stays raw in the outbound history; only the retrieval query is rewritten.
 */

/**
 * Continuity is short-lived: never walk back further than the last six
 * exchanges, whatever the conversation length.
 */
const MAX_SCANNED_MESSAGES = 12;
/** Hard caps, so a rewritten query cannot grow with the conversation. */
const MAX_ANCHOR_CHARS = 160;
const MAX_FOLLOW_UP_TOPIC_WORDS = 6;
const MAX_FOLLOW_UP_TOPIC_CHARS = 60;
const FOLLOW_UP_TOPIC_LABEL = 'Follow-up topic: ';

/** Upper bound of a rewritten query; autonomous queries pass through unchanged. */
export const MAX_REWRITTEN_QUERY_CHARS =
  MAX_ANCHOR_CHARS + 1 + FOLLOW_UP_TOPIC_LABEL.length + MAX_FOLLOW_UP_TOPIC_CHARS;

// Generic follow-up vocabulary: pronouns, auxiliaries, determiners and the few
// continuation verbs that carry no retrieval signal on their own. This is
// deliberately a stopword list, not a topic dictionary: whatever survives it is
// treated as a named subject, so the module needs no inventory of Bitcoin
// topics to recognize one.
const FOLLOW_UP_NOISE = new RegExp(
  String.raw`\b(?:${[
    // Hyphenated and multi-word openers come first: a global replace scans left
    // to right and would otherwise consume only the first word of these.
    "qu'en est[- ]il", 'est[- ]ce que', 'est[- ]il', 'peux[- ]tu', 'pourrais[- ]tu',
    'tell me', 'dis[- ]moi', "dis[- ]m'en", "donne[- ]m'en", 'what about', 'how about',
    'can', 'could', 'would', 'will', 'do', 'does', 'did', 'is', 'are', 'you', 'please',
    'explain', 'expand', 'elaborate', 'tell', 'say', 'give', 'me', 'us', 'more', 'further',
    'deeper', 'go', 'dig', 'example', 'show', 'detail', 'details', 'that', 'this', 'it', 'its', 'them', 'those', 'these', 'they',
    'and', 'but', 'what', 'about', 'why', 'how', 'so', 'then', 'again', 'also', 'too', 'bit',
    'the', 'a', 'an', 'of', 'for', 'with', 'on',
    'peux', 'pourrais', 'pourriez', 'tu', 'vous', 'expliquer', 'explique', 'expliques',
    'approfondir', 'approfondis', 'developpe', 'developper', 'detaille', 'detailler',
    'precise', 'continue', 'continuer', 'dis', "m'en", 'plus', 'davantage',
    'montre', 'moi', 'donne', 'exemple', 'ca', 'cela', 'ceci', 'et', 'mais', 'quoi', 'pourquoi', 'comment', 'alors', 'donc',
    'aussi', 'encore', 'concretement', 'pratique', 'precisement', 'exactement', 'vraiment', 'justement',
    'simplement', 'reellement', 'concretely', 'practically', 'precisely', 'exactly', 'really', 'simply',
    'basically', 'specifically', 'practice', 'in', 'le', 'la', 'les', 'un', 'une', 'du', 'de', 'des', 'en', 'y',
    'est', 'sont', 'il', 'elle', 'ils', 'elles', 'avec', 'pour', 'sur',
    'moi', 'toi', 'peu', 'merci', 'svp', 'stp', 'ok', 'thanks',
  ].join('|')})\b`,
  'gi',
);

// An explicit reference back to what Alice just said. It is what separates
// "Et ça marche avec Ark ?" (still the previous subject, seen through Ark) from
// "Et les CoinJoin alors ?" (a new named subject of its own).
const PREVIOUS_ANSWER_REFERENCE = new RegExp(
  String.raw`\b(?:${[
    'that', 'this', 'it', 'its', 'they', 'them', 'those', 'these',
    'the previous (?:answer|point|one)', 'your answer',
    '(?:first|second|third|other) (?:case|one|point)',
    '(?:premier|second|deuxieme|troisieme|autre) (?:cas|point)',
    'par rapport', 'quelle difference avec',
    'ca', 'cela', 'ceci', 'celui', 'celle', 'ceux', 'celles',
    'ce point', 'cette reponse', 'la reponse precedente', 'le precedent', 'ton explication',
  ].join('|')})\b`,
  'i',
);

const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

/** Lowercase and drop diacritics so the rules above stay ASCII and readable. */
function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * What a follow-up adds to the subject it refers to, if anything: the words
 * left once the generic follow-up vocabulary is removed.
 */
function followUpTopic(message: string): string {
  return fold(message)
    .replace(FOLLOW_UP_NOISE, ' ')
    .replace(/[^\p{L}\p{N}-]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .map(word => word.replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .slice(0, MAX_FOLLOW_UP_TOPIC_WORDS)
    .join(' ')
    .slice(0, MAX_FOLLOW_UP_TOPIC_CHARS)
    .trim();
}

/**
 * A follow-up that names a subject of its own without pointing back at the
 * previous answer is a topic change: it must be retrieved on its own terms,
 * or the autonomous topic it names gets contaminated by the former one.
 */
function isTopicChange(message: string): boolean {
  const folded = fold(message);
  // A named subject before a comma owns a subsequent pronoun. In contrast,
  // "Et ça marche avec Ark ?" points to the previous subject before naming Ark.
  const prefix = folded.split(',')[0];
  if (folded.includes(',') && !PREVIOUS_ANSWER_REFERENCE.test(prefix) && followUpTopic(prefix)) return true;
  // An autonomous question naming its subject before a later pronoun is
  // complete without history ("How does RBF work when it ...?").
  const reference = PREVIOUS_ANSWER_REFERENCE.exec(folded);
  if (reference && /^(?:what|how|why|comment|pourquoi|qu['’]est)/.test(folded)) {
    const beforeReference = folded.slice(0, reference.index);
    if (/^(?:what is|what does|how does|how do|why does|why is|comment fonctionne|pourquoi)\s+\S/.test(beforeReference)
      && followUpTopic(beforeReference).split(' ').filter(Boolean).length >= 2) return true;
  }
  if (reference) return false;
  return followUpTopic(message).length > 0;
}

function topicChangeQuery(message: string): string {
  const topic = followUpTopic(message);
  // Keep compact topic-only switches stable, but retain question syntax for
  // substantive questions so the downstream intent classifiers can read it.
  return boundedAnchor(topic.split(' ').length <= 2 ? topic : message);
}

function boundedAnchor(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, MAX_ANCHOR_CHARS).trim();
}

/**
 * The most recent user turn that can legitimately be searched again.
 *
 * Assistant text is never a retrieval source. Personal declarations and
 * questions about user memory end the knowledge context. Greetings and
 * acknowledgements with no query are skipped. A mixed turn contributes
 * only its question clause, never the personal sentence next to it. A turn that
 * was itself a bare follow-up is skipped too, so repeated follow-ups keep
 * reaching the subject instead of quoting each other; a turn that changed the
 * topic stops the walk, since it is the subject now under discussion.
 */
function anchorSubject(history: Message[], userMessage: string): string | null {
  const current = fold(userMessage);
  let start = history.length - 1;
  const latest = history[start];
  // The caller appends the current message to the history it passes in.
  if (latest?.role === 'user' && fold(latest.content) === current) start -= 1;

  for (let index = start; index >= 0 && start - index < MAX_SCANNED_MESSAGES; index--) {
    const message = history[index];
    if (message?.role !== 'user' || !message.content.trim()) continue;

    const candidate = planAliceTurn(message.content);
    if (candidate.kind === 'personal-statement' || candidate.asksAboutUserMemory || candidate.walletStateReason || candidate.walletActionReason) return null;
    if (!candidate.retrievalQuery) continue;
    if (candidate.needsConversationContext) {
      if (!isTopicChange(candidate.retrievalQuery)) continue;
      return topicChangeQuery(candidate.retrievalQuery);
    }
    return boundedAnchor(candidate.retrievalQuery);
  }
  return null;
}

/** A short loss conclusion after an economic-output question still concerns
 * spending cost. Never reinterpret missing keys or a new recovery problem. */
function economicLossFollowUp(history: Message[], message: string): string | null {
  const q = fold(message);
  if (q.length > 180 || !/^(?:donc|alors|so|then)\b/.test(q)
    || !/\b(?:ces|cette|ce|these|those|this|that)\b/.test(q)
    || !/\b(?:perdu\w*|lost|gone)\b/.test(q)
    || /\b(?:cle\w*|key\w*|seed|phrase|backup|sauvegarde|recover\w*|recuper\w*|vol\w*|stolen|hack\w*)\b/.test(q)) return null;
  const users = history.filter(turn => turn.role === 'user');
  if (users.length && fold(users.at(-1)!.content) === q) users.pop();
  const prior = fold(users.at(-1)?.content ?? '');
  if (!/\b(?:dust|uneconomic|non rentable)\b/.test(prior)
    || !/\b(?:cost|cout|fee\w*|frais|spend\w*|depenser|marginal|rentable)\b/.test(prior)) return null;
  return 'dust uneconomic outputs spending cost fee rate';
}

/** Resolve a specific channel/invoice reference only from the immediately
 * preceding user turn. The raw follow-up may carry context that question-clause
 * extraction drops (e.g. French “n’importe quel autre nœud”). */
function lightningPaymentFollowUp(history: Message[], message: string): string | null {
  const q = fold(message);
  if (q.length > 450 || /\b(?:bolt[ -]?12|ark|coinjoin|ethereum|solana|monero|bitcoin on chain|on chain|rbf|bank|banque|bancair\w*|paypal|youtube|television|tv|autre sujet|another topic)\b/.test(q)) return null;
  const users = history.filter(turn => turn.role === 'user');
  if (users.length && fold(users.at(-1)!.content) === q) users.pop();
  const priorMessage = users.at(-1)?.content ?? '';
  const prior = fold(priorMessage);
  const priorPlan = planAliceTurn(priorMessage);
  if (priorPlan.kind === 'personal-statement' || priorPlan.asksAboutUserMemory || priorPlan.walletStateReason || priorPlan.walletActionReason) return null;
  if (!/\b(?:lightning|bolt11)\b/.test(prior)) return null;
  if (/\b(?:ce canal|ce meme canal|cet autre canal|this channel|that channel|the same channel)\b/.test(q)
    && /\b(?:recev\w*|receiv\w*|paie\w*|pay\w*|envoy\w*|send\w*|liquidit\w*|capacity|capacite)\b/.test(q)) {
    return 'Lightning channel liquidity receiving sending route capacity';
  }
  if (/\b(?:facture|invoice)\b/.test(prior) && /\b(?:facture|invoice)\b/.test(q)
    && (/\b(?:en cours|pending|in flight|expir\w*)\b/.test(q)
      || /\b(?:nouvelle|new)\b/.test(q) && /\b(?:retry\w*|reess\w*|pay\w*|paie\w*|cancel\w*|annul\w*|refund\w*|rembours\w*|transfer\w*)\b/.test(q))) {
    return 'Lightning BOLT11 invoice expiry pending payment status retry';
  }
  return null;
}

/** A short follow-up to a received unconfirmed payment ("when can I deliver?",
 * "can I prevent it?") keeps that payment as its subject. Only the preceding
 * user turn is read, never the model's answer. */
function unconfirmedReceiptFollowUp(history: Message[], message: string): string | null {
  const q = fold(message);
  if (q.length > 300 || /\b(?:lightning|ark|coinjoin|ethereum|solana|autre sujet|another topic|different topic)\b/.test(q)) return null;
  if (!/\b(?:deliver\w*|hand (?:over|it)|ship\w*|goods|livr\w*|marchandises?|when|quand|a partir de|at what point|safe|sure?|attend\w*|wait\w*|empech\w*|prevent\w*|stop\w*|block\w*|bloqu\w*|faire quelque chose|do anything|confirm\w*)\b/.test(q)) return null;
  const users = history.filter(turn => turn.role === 'user');
  if (users.length && fold(users.at(-1)!.content) === q) users.pop();
  const previous = users.at(-1)?.content ?? '';
  if (!isUnconfirmedReceiptReplacementQuestion(previous)) return null;
  return `${previous}\n${FOLLOW_UP_TOPIC_LABEL}waiting for confirmations before treating the payment as received`;
}

/** Keep an explicitly introduced protocol ahead of generic words such as
 * "history", "recover" or "outputs" that otherwise select unrelated notes.
 * Only the search string is condensed; the generation history remains raw. */
const ARK_COST = /\b(?:fees?|frais|costs?|cout\w*|charg\w*|factur\w*|tarif\w*|price\w*|pricing|prix)\b/;
// The origin of the protocol, not the history of someone's coins.
const COINJOIN_ORIGIN = /\b(?:(?:history|histoire|historique|origin\w*) (?:of|du|de|de la|des) coinjoins?|coinjoin(?:'s)? (?:history|origin)|invent\w*|qui a (?:eu|propose|cree|invente)|who (?:came up|invented|proposed|created)|logiciels?|software|implementations?)\b/;

function explicitProtocolQuery(message: string, query: string): string | null {
  const text = fold(message);
  const planned = fold(query);
  if (/\b(?:versus|compare\w*|compar\w*|difference|instead|plutot|not about|pas de|pas sur|ne parle pas)\b/.test(text)) return null;
  const names = [...new Set((text.match(/\b(?:ark|arkoor|coinjoin|lightning|ethereum|solana)\b/g) ?? []).map(name => name === 'arkoor' ? 'ark' : name))];
  if (names.length !== 1) return null;
  const name = names[0];
  if (!['ark', 'coinjoin'].includes(name)) return null;
  // Recover a subject lost by question-clause extraction only when explicitly
  // introduced as the subject, not merely named in a personal declaration.
  const subjectPattern = name === 'ark' ? '(?:ark|arkoor)' : name;
  if (!new RegExp(`\\b${subjectPattern}\\b`).test(planned)
    && !new RegExp(`(?:comprendre|understand|explain|expliquer|about|concernant)\\s+${name}\\b`).test(text)) return null;
  // Origin questions ask for the dedicated history note; "transaction history"
  // stays a privacy question.
  if (name === 'coinjoin' && COINJOIN_ORIGIN.test(text)) {
    return 'CoinJoin history origin Gregory Maxwell 2013 proposal JoinMarket Wasabi Whirlpool software';
  }
  if (name === 'coinjoin' && /\b(?:histor\w*|history|privacy|confidential\w*|blockchain|anonym\w*|ownership|identity|identite|merg\w*|fusion\w*)\b/.test(text)) {
    return 'CoinJoin privacy confidentiality transaction graph ownership links merging outputs';
  }
  // "Fees"/"frais" already reach the fee note lexically; other cost words do not.
  if (name === 'ark' && ARK_COST.test(text) && !/\b(?:fees?|frais)\b/.test(text)) {
    return 'Ark fees liquidity operator cost renewal refresh exit';
  }
  if (name === 'ark' && !ARK_COST.test(text) && /\b(?:expir\w*|deadline|signature|collusion|trust|confiance|operat\w*|unilateral\w*)\b/.test(text)) {
    return 'Ark operator security expiry signature unilateral exit collusion';
  }
  return null;
}

/** A BOLT11 invoice introduced before the question is still its subject when
 * that question explicitly asks about invoice disclosure. Keep unrelated
 * personal statements and other payment systems out of the query. */
function explicitInvoiceDisclosure(message: string, query: string): string | null {
  const text = fold(message);
  const question = fold(query);
  if (!/\bbolt[ -]?11\b/.test(text)
    || /\b(?:bolt12|ethereum|solana|bank|banque|bancair\w*|paypal|rbf)\b/.test(text)
    || !/\b(?:invoice|facture)\b/.test(question)
    || !/\b(?:reveal\w*|disclos\w*|decod\w*|encod\w*|encrypt\w*|random|information|privacy|confidential\w*|identit\w*|recipient|destinataire|montant|amount|publi\w*)\b/.test(question)) return null;
  return 'Lightning BOLT11 invoice decoding privacy amount payee public key payment hash';
}

/** The operator's security powers belong to the immediately preceding Ark
 * question only. Do not derive this subject from a model answer or an older
 * conversation topic after a user switch. */
function arkSecurityFollowUp(history: Message[], message: string): string | null {
  const q = fold(message);
  if (!/^(?:and|so|then|et|donc|alors)\b/.test(q) || q.length > 450
    || !/\b(?:operator|operateur|server|serveur|asp)\b/.test(q)
    || !/\b(?:collud\w*|collusion|conspir\w*|s.alli\w*|s.entend\w*)\b/.test(q)
    || /\b(?:lightning|coinjoin|ethereum|solana|bank|banque|bancair\w*|autre sujet|another topic|different topic)\b/.test(q)) return null;
  const users = history.filter(turn => turn.role === 'user');
  if (users.length && fold(users.at(-1)!.content) === q) users.pop();
  const previous = users.at(-1)?.content ?? '';
  const prior = fold(previous);
  const plan = planAliceTurn(previous);
  if (!/\b(?:ark|arkoor|vtxos?)\b/.test(prior) || /\b(?:lightning|coinjoin|ethereum|solana)\b/.test(prior)
    || plan.kind === 'personal-statement' || plan.asksAboutUserMemory || plan.walletStateReason || plan.walletActionReason) return null;
  return 'Ark arkoor operator security collusion previous sender double spend';
}

/**
 * The query to search the knowledge base with for the current turn, or null
 * when this turn must not search at all.
 */

/** Keep explicit topical evidence that question-clause extraction can discard.
 * Follow-ups use only the immediately preceding user turn, never assistant text. */
/** Retain a named payment setup only when the extracted question still asks
 * for that payment's walkthrough. Never copy the setup or personal data into
 * the retrieval query, and do not inherit it across an explicit topic switch. */
function lightningWalkthroughTopic(message: string, question: string): string | null {
  if (!isLightningPaymentWalkthrough(message)
    || !isLightningPaymentWalkthrough(`Lightning ${question}`)
    || /\b(?:ethereum|solana|monero|ark|spark|liquid|cashu|fedimint|bank|banque|bancaire|paypal|on.chain|bitcoin|keysend|bolt12|sql|school|ecole|autre sujet|another topic|different topic)\b/.test(foldTopic(question))) return null;
  return 'Explain the normal flow of a Lightning invoice payment.';
}

function evidenceTopicQuery(history: Message[], message: string, question: string): string | null {
  const q = foldTopic(question);
  if (isComparisonRagQuery(question)) return null;
  const usersForArithmetic = history.filter(turn => turn.role === 'user');
  if (usersForArithmetic.length && foldTopic(usersForArithmetic.at(-1)!.content) === foldTopic(message)) usersForArithmetic.pop();
  const monetaryExample = resolveCoinbaseExample(message, coinbaseArithmeticAntecedent(usersForArithmetic.map(turn => turn.content)));
  if (monetaryExample) return 'Bitcoin coinbase monetary issuance subsidy transaction fees excess reward consensus';
  const walkthrough = lightningWalkthroughTopic(message, question);
  if (walkthrough) return walkthrough;
  // Only CPFP needs the dropped spending clause. Its planned question must
  // itself still describe a pending Bitcoin transaction, never a new subject.
  const cpfpContext = (raw: string, planned: string) => isImplicitCpfpQuestion(planned)
    || isImplicitCpfpQuestion(raw)
      && raw.split(/[.!?]/).some(clause => {
        const words = foldTopic(clause).trim();
        return /^(?:en quoi|comment|how|can|could|would|est ce que|puis je)\b/.test(words)
          && /\b(?:spend\w*|depens\w*)\b/.test(words)
          && /\b(?:receiv\w*|received|recu\w*)\b/.test(words);
      })
      && /\b(?:unconfirmed|pending|stuck|non confirmee?|en attente|bloquee?)\b/.test(foldTopic(planned))
      && /\b(?:bitcoin|btc|transactions?|outputs?|sorties?|utxos?)\b/.test(foldTopic(planned));
  if (cpfpContext(message, question)) return 'Bitcoin CPFP child transaction spends received unconfirmed parent output package fees';
  if (isMonetaryIssuanceQuestion(question)) return 'Bitcoin coinbase monetary issuance subsidy transaction fees excess reward consensus';
  if (isLightningPrivacyQuestion(question) && !/\b(?:invoices?|factures?|bolt11)\b/.test(q)) return 'Lightning payment channel privacy identity visibility correlation';
  if (isInputOutputAllocationQuestion(question)) return 'Bitcoin transaction inputs outputs change signatures fees';
  if (/\b(?:ethereum|solana|monero|paypal|bank|banque|bancaire|ark|spark|liquid|cashu|fedimint|bolt12|school|ecole|scolaire|autre sujet|another topic|different topic)\b/.test(q)) return null;
  const users = history.filter(turn => turn.role === 'user');
  if (users.length && foldTopic(users.at(-1)!.content) === foldTopic(message)) users.pop();
  const previous = users.at(-1)?.content ?? '';
  const priorPlan = planAliceTurn(previous);
  if (priorPlan.kind === 'personal-statement' || priorPlan.asksAboutUserMemory || priorPlan.walletStateReason || priorPlan.walletActionReason) return null;
  // Prior declarations cannot establish the topic of a follow-up either.
  const priorQuestion = priorPlan.retrievalQuery ?? '';
  const prior = foldTopic(lightningWalkthroughTopic(previous, priorQuestion) ?? priorQuestion);
  if (/\b(?:lightning|bolt11)\b/.test(prior)
    && (/[?]/.test(priorQuestion) || /^(?:please )?(?:walk|talk|guide|explain|describe|explique|decris|comment|pourquoi)\b/i.test(priorQuestion))
    && isLightningRoutingStateQuestion(`Lightning ${message}`)) {
    return 'Lightning route failure before sending HTLC pending channel balance';
  }
  if (/\b(?:lightning|bolt11)\b/.test(prior) && /\b(?:invoices?|factures?)\b/.test(prior)
    && /\b(?:this|that|the|cette|la) (?:invoice|facture)\b/.test(q)
    && /\b(?:blank|redact\w*|mask\w*|masqu\w*|retouch\w*|modif\w*|edit\w*|alter\w*|hide|hiding|cach\w*)\b/.test(q)) {
    return 'Lightning BOLT11 invoice editing disclosure checksum signature route hints';
  }
  if ((cpfpContext(previous, priorQuestion) || /\bcpfp\b/.test(prior))
    && /\b(?:parent|child|enfant)\b/.test(q)
    && /\b(?:received|recu\w*|unconfirmed|outputs?|sorties?|utxos?)\b/.test(q)
    && /\b(?:value|valeur|amount|montant|small|petit|fees?|frais|sats?|output|sortie)\b/.test(q)) {
    return 'Bitcoin CPFP child transaction received output value parent package fee limits wallet support';
  }
  return null;
}


export function rewriteRetrievalQuery(input: {
  history: Message[];
  userMessage: string;
  plan: AliceTurnPlan;
}): string | null {
  const { history, userMessage, plan } = input;

  // Safety and personal-memory boundaries remain prior to any retrieval rewrite.
  // Explicit protocol subjects can also focus an autonomous question whose
  // generic wording would otherwise select a different concept.
  if (plan.walletStateReason || plan.walletActionReason) return null;
  if (plan.asksAboutUserMemory || plan.kind === 'personal-statement') return plan.retrievalQuery;
  const evidenceQuery = plan.retrievalQuery ? evidenceTopicQuery(history, userMessage, plan.retrievalQuery) : null;
  if (evidenceQuery) return evidenceQuery;
  const arkFollowUp = plan.retrievalQuery ? arkSecurityFollowUp(history, userMessage) : null;
  if (arkFollowUp) return arkFollowUp;
  const invoiceDisclosure = plan.retrievalQuery ? explicitInvoiceDisclosure(userMessage, plan.retrievalQuery) : null;
  if (invoiceDisclosure) return invoiceDisclosure;
  const receiptFollowUp = plan.retrievalQuery ? unconfirmedReceiptFollowUp(history, userMessage) : null;
  if (receiptFollowUp) return receiptFollowUp;
  const lightningFollowUp = plan.retrievalQuery ? lightningPaymentFollowUp(history, userMessage) : null;
  if (lightningFollowUp) return lightningFollowUp;
  const economicFollowUp = plan.retrievalQuery ? economicLossFollowUp(history, userMessage) : null;
  if (economicFollowUp) return economicFollowUp;
  const explicitQuery = plan.retrievalQuery ? explicitProtocolQuery(userMessage, plan.retrievalQuery) : null;
  if (explicitQuery) return explicitQuery;
  if (!plan.needsConversationContext) return plan.retrievalQuery;

  // A turn with no question shape of its own is promoted to retrieval only when
  // it explicitly asks for more ("Développe", "Tell me more"). An
  // acknowledgement such as "That makes sense." also refers to the previous
  // answer, and must stay a conversation turn without retrieval.
  if (!plan.retrievalQuery && !isExplicitContinuationRequest(userMessage)) return null;

  // Read the question clause when the turn has one, never the raw sentence next
  // to it: a mixed turn such as "I'm new to this. What about Lightning?" must
  // not feed its personal declaration back into the search.
  const followUpSource = plan.retrievalQuery ?? userMessage;
  // Only a question-shaped turn can change the topic. "Développe un peu" names
  // nothing retrievable, so an imperative always keeps the inherited subject
  // rather than searching for whatever word happens to follow the verb.
  if (plan.retrievalQuery && isTopicChange(followUpSource)) return topicChangeQuery(followUpSource);

  const anchor = anchorSubject(history, userMessage);
  if (!anchor) return plan.retrievalQuery;

  // A follow-up that asks about the cost or the origin of the protocol named in
  // the anchored question gets the same focused query as a direct question.
  const focused = explicitProtocolFocus(anchor, userMessage);
  if (focused) return focused;
  const topic = followUpTopic(followUpSource);
  return topic ? `${anchor}\n${FOLLOW_UP_TOPIC_LABEL}${topic}` : anchor;
}

function explicitProtocolFocus(anchor: string, message: string): string | null {
  // The cost or origin words must come from the follow-up itself, not from the
  // anchored question, so "And what about expiry?" keeps its own subject.
  const text = fold(message);
  const asksCost = ARK_COST.test(text);
  const asksOrigin = COINJOIN_ORIGIN.test(`${text} coinjoin`) || /\b(?:history|histoire|origin\w*)\b/.test(text);
  if (!asksCost && !asksOrigin) return null;
  const focus = explicitProtocolQuery(`${anchor}\n${message}`, anchor);
  if (asksCost && focus?.startsWith('Ark fees')) return focus;
  if (asksOrigin && focus?.startsWith('CoinJoin history')) return focus;
  return null;
}
