import { isImplicitCpfpQuestion, isMonetaryIssuanceQuestion, isLightningPrivacyQuestion, isInputOutputAllocationQuestion, isRevokedLightningStateQuestion, isUnconfirmedReceiptReplacementQuestion } from './retrieval-topic-cues.ts';
import { isMajorityHashpowerQuestion } from './majority-hashpower.ts';
import { preferKnowledgeLocale, type KnowledgeChunk, type KnowledgeLocale } from './knowledge-packs';
import { isGeneralLightningPaymentExplanation, isLightningPaymentWalkthrough, isLightningRoutingStateQuestion } from './rag-query-policy';
import { isBroadBitcoinDefinition, isGeneralBitcoinFeeQuestion, isExplicitRbfQuestion, isSmallOutputSpendingQuestion, isMultisigRecoveryQuestion, isUtxoValidationQuestion, isComparisonRagQuery } from './rag-query-policy';

export type CuratedMatch = KnowledgeChunk & {
  retrievalReason: 'primary-topic' | 'secondary-explicit-topic' | 'secondary-parent-detail' | 'downloaded-explicit-topic';
  retrievalScore: number;
};

type Document = {
  chunk: KnowledgeChunk;
  fields: Map<string, number>[];
  identity: Set<string>;
  aliases: string[][];
  questions: string[][];
};
type Index = { docs: Document[]; df: Map<string, number>; average: number[] };

const STOP = new Set(`a au aux avec ce ces cet cette comme comment dans de des du elle elles en est et eux il ils je la le les leur lui ma mais me mes mon ne nos notre nous on ou par pas ai t l d c j s pour pourquoi que quel quelle quelles quels qui quoi sa sans se ses si son sont sur ta te tes toi ton tu un une vos votre vous y est etre fait faire peut peuvent plus moins meme tres tout tous toutes cela ca sert servir explique expliquer comprendre davantage detail details what why how which when who happens happen is are the a an of to for and or with without my your its it they their this that these those can could would should explain does do about tell me please aussi also deja already bitcoin btc simple simply simplement beginner debutant debutants entre difference differences versus comparison comparaison between work works fonctionnement`.split(/\s+/));
const FAMILIES: Record<string, string> = {
  block: 'bloc', blocks: 'bloc', time: 'temps', times: 'temps',
  light: 'leger', legere: 'leger', full: 'complet', verify: 'verifier', verification: 'verifier',
  words: 'mot', word: 'mot', restore: 'recuperer', recover: 'recuperer', funds: 'fonds',
  receive: 'recevoir', sent: 'envoye', send: 'envoyer', cancel: 'annuler', mistake: 'erreur',
  withdraw: 'retirer', own: 'propre', coins: 'bitcoin', coin: 'bitcoin',
  price: 'prix', cheaper: 'frais', pricier: 'frais', slower: 'lent', faster: 'rapide',
  node: 'noeud', nodes: 'noeud', mining: 'minage', miner: 'mineur', miners: 'mineur',
  channel: 'canal', channels: 'canal', canaux: 'canal', liquidity: 'liquidite',
  wallet: 'portefeuille', wallets: 'portefeuille', fees: 'frais', fee: 'frais',
  payment: 'paiement', payments: 'paiement', privacy: 'confidentialite',
  fail: 'echec', failed: 'echec', failure: 'echec', despite: 'malgre',
  money: 'monnaie', first: 'premier', recipients: 'receveur', benefits: 'avantage',
  newly: 'nouvelle', created: 'creation', newlycreated: 'creation',
  address: 'adresse', addresses: 'adresse', output: 'sortie', outputs: 'sortie',
  input: 'entree', inputs: 'entree', backup: 'sauvegarde', recovery: 'recuperation',
  residents: 'habitant', particuliers: 'habitant', particulier: 'habitant', habitants: 'habitant',
  chute: 'baisse', chuter: 'baisse', echoue: 'echec', echouer: 'echec', echecs: 'echec',
  recu: 'recevoir', reception: 'recevoir', augmente: 'augmentation',
  efficacement: 'efficace', chauffage: 'chaleur', chauffe: 'chaleur', chauffer: 'chaleur',
  avantages: 'avantage', avantager: 'avantage',
  difficulty: 'difficulte', pruned: 'elague', pruning: 'elagage', blockchain: 'chaine',
  electricity: 'electricite', energy: 'energie', heat: 'chaleur',
  balance: 'solde', capacity: 'capacite', fermeture: 'fermer', fermeturee: 'fermer',
  augmenter: 'augmentation', ajoute: 'ajout', ajouter: 'ajout', ajoutant: 'ajout',
  attend: 'attente', attends: 'attente', attendre: 'attente', wait: 'attente', waits: 'attente', waiting: 'attente', queue: 'attente',
};
export function normalizeCuratedText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/[^a-z0-9]+/g, ' ').trim();
}
function terms(text: string): string[] {
  return normalizeCuratedText(text).split(/\s+/).filter(t => t.length > 1 && !STOP.has(t)).map(t => {
    if (FAMILIES[t]) return FAMILIES[t];
    const singular = t.length > 4 ? t.replace(/s$/, '') : t;
    return FAMILIES[singular] ?? singular;
  });
}
function frequencies(tokens: string[]): Map<string, number> {
  const result = new Map<string, number>();
  for (const t of tokens) result.set(t, (result.get(t) ?? 0) + 1);
  return result;
}
const indexes = new WeakMap<KnowledgeChunk[], Index>();
function getIndex(chunks: KnowledgeChunk[]): Index {
  const cached = indexes.get(chunks);
  if (cached) return cached;
  const df = new Map<string, number>();
  const docs = chunks.map(chunk => {
    const questionSet = new Set(chunk.questions ?? []);
    // Named technical acronyms present in reviewed prose remain searchable
    // when the editorial title uses everyday language (e.g. ETF exposure).
    const acronyms = chunk.tier ? [...new Set(chunk.content.match(/\b[A-Z][A-Z0-9]{1,7}\b/g) ?? [])] : [];
    const aliases = [chunk.title, ...chunk.keywords.filter(k => !questionSet.has(k)), ...acronyms].map(terms).filter(a => a.length);
    const questions = (chunk.questions ?? []).map(terms);
    // Repeated aliases do not inflate either field length or term frequency.
    const fields = [terms(chunk.title), [...new Set(chunk.keywords.flatMap(terms))],
      [...new Set(questions.flat())], terms(chunk.content)].map(frequencies);
    for (const term of new Set(fields.flatMap(f => [...f.keys()]))) df.set(term, (df.get(term) ?? 0) + 1);
    return { chunk, fields, aliases, questions, identity: new Set(aliases.flat()) };
  });
  const average = [0, 1, 2, 3].map(i => docs.reduce((sum, d) => sum + [...d.fields[i].values()].reduce((a, b) => a + b, 0), 0) / Math.max(1, docs.length));
  const index = { docs, df, average };
  indexes.set(chunks, index);
  return index;
}
function idf(index: Index, t: string): number {
  return Math.log(1 + (index.docs.length - (index.df.get(t) ?? 0) + .5) / ((index.df.get(t) ?? 0) + .5));
}
function fieldScore(index: Index, doc: Document, query: string[]): number {
  const weights = doc.chunk.tier ? [2.2, 1.7, 2.4, .65] : [1, .3, .3, 2];
  return doc.fields.reduce((sum, field, i) => {
    const length = [...field.values()].reduce((a, b) => a + b, 0);
    const norm = 1.2 * (.25 + .75 * length / Math.max(1, index.average[i]));
    return sum + weights[i] * query.reduce((n, t) => {
      const tf = field.get(t) ?? 0;
      return n + idf(index, t) * tf * 2.2 / (tf + norm);
    }, 0);
  }, 0);
}
function covered(alias: string[], query: Set<string>): boolean {
  return alias.length > 0 && alias.every(t => query.has(t));
}
function concept(chunk: KnowledgeChunk): string { return chunk.conceptId ?? chunk.id.replace(/^curated-/, ''); }
const isTranslation = (chunk: KnowledgeChunk) => !!chunk.locale && !!chunk.sourceLocale && chunk.locale !== chunk.sourceLocale;

type Variants = { source: KnowledgeChunk[]; byConcept: Map<string, KnowledgeChunk[]> };
const variantSets = new WeakMap<KnowledgeChunk[], Variants>();
/**
 * Every rule below assumes one curated chunk per concept (anchors, parent
 * lookups, BM25 statistics), and its tuning, checked by the reference sets in
 * both languages, scores the French source. So the source variant of each
 * concept is scored and the variant in the target locale is served in its
 * place. A corpus without translations is used as is: same result, same index.
 * Downloaded chunks (no tier) are not curated variants and pass through.
 */
function localeVariants(chunks: KnowledgeChunk[]): Variants | null {
  if (!chunks.some(isTranslation)) return null;
  const cached = variantSets.get(chunks);
  if (cached) return cached;
  const curated = chunks.filter(chunk => chunk.tier);
  const kept = new Set(preferKnowledgeLocale(curated));
  const byConcept = new Map<string, KnowledgeChunk[]>();
  for (const chunk of curated) byConcept.set(concept(chunk), [...(byConcept.get(concept(chunk)) ?? []), chunk]);
  const variants = { source: chunks.filter(chunk => !chunk.tier || kept.has(chunk)), byConcept };
  variantSets.set(chunks, variants);
  return variants;
}

/** The selected concepts in the target locale when that variant exists, else as scored. */
function serveInLocale(matches: CuratedMatch[], variants: Variants | null, language?: KnowledgeLocale): CuratedMatch[] {
  if (!variants || !language) return matches;
  return matches.map(match => {
    if (!match.tier) return match;
    const [variant] = preferKnowledgeLocale(variants.byConcept.get(concept(match)) ?? [], language);
    return variant && variant.id !== match.id
      ? { ...variant, retrievalReason: match.retrievalReason, retrievalScore: match.retrievalScore } : match;
  });
}

/** A semantic index may hold every variant of a concept: score the scored one with the best of them. */
function fuseSemanticByConcept(matches: { id: string; score: number }[], all: KnowledgeChunk[], kept: KnowledgeChunk[]): { id: string; score: number }[] {
  if (all === kept) return matches;
  const keptByConcept = new Map(kept.filter(chunk => chunk.tier).map(chunk => [concept(chunk), chunk.id]));
  const idOf = new Map(all.filter(chunk => chunk.tier).map(chunk => [chunk.id, keptByConcept.get(concept(chunk)) ?? chunk.id]));
  const fused = new Map<string, number>();
  for (const match of matches) {
    const id = idOf.get(match.id) ?? match.id;
    fused.set(id, Math.max(fused.get(id) ?? -Infinity, match.score));
  }
  return [...fused].map(([id, score]) => ({ id, score })).sort((a, b) => b.score - a.score);
}

/**
 * BM25 field evidence plus a per-query gate. Parent links grant context, never
 * relevance. Locale variants of a concept count once: the source is scored and
 * the target-locale variant served, so maxChunks counts concepts.
 */
export function selectCuratedKnowledge(
  query: string,
  allChunks: KnowledgeChunk[],
  options: { maxChunks?: number; semanticMatches?: { id: string; score: number }[]; targetLanguage?: KnowledgeLocale } = {},
): CuratedMatch[] {
  const variants = localeVariants(allChunks);
  const chunks = variants?.source ?? allChunks;
  const semanticMatches = options.semanticMatches && fuseSemanticByConcept(options.semanticMatches, allChunks, chunks);
  return serveInLocale(selectSourceKnowledge(query, chunks, { maxChunks: options.maxChunks, semanticMatches }), variants, options.targetLanguage);
}

function selectSourceKnowledge(
  query: string,
  chunks: KnowledgeChunk[],
  options: { maxChunks?: number; semanticMatches?: { id: string; score: number }[] },
): CuratedMatch[] {
  const max = Number.isFinite(options.maxChunks) ? Math.max(1, Math.min(3, Math.floor(options.maxChunks!))) : 3;
  const semanticMatches = options.semanticMatches;
  const index = getIndex(chunks);
  const normalizedQuery = normalizeCuratedText(query);
  const routingState = isLightningRoutingStateQuestion(query);
  // Educational notes contain no account telemetry. Do not retrieve balances
  // as though prose could answer a request for the user's current funds.
  if (/\b(mon|mes|my)\b/.test(normalizedQuery) && (/\b(solde|balance)\b/.test(normalizedQuery) || /\b(wallet|portefeuille)\b/.test(normalizedQuery) && /\b(sats?|satoshis?|funds|fonds|amount|montant)\b/.test(normalizedQuery))
    && /\b(actuel|current|maintenant|now|combien|how much)\b/.test(normalizedQuery)
    && (!routingState || /\b(?:combien|how much|how many)\b/.test(normalizedQuery))) return [];
  const topic = normalizeCuratedText(query);
  const revokedState = isRevokedLightningStateQuestion(query);
  const lightningOverview = isGeneralLightningPaymentExplanation(query) || isLightningPaymentWalkthrough(query);
  const otherPaymentSystem = /\b(ethereum|solana|monero|paypal|bank|banque|bancaire|rbf)\b/.test(topic);
  const bip39Passphrase = !otherPaymentSystem && /\bpassphrase\b/.test(topic)
    && /\b(bip39|mnemonic|seed|phrase|wallet|portefeuille)\b/.test(topic);
  const lightningInvoice = !lightningOverview && !otherPaymentSystem && !/\bbolt12\b/.test(topic)
    && /\b(lightning|bolt11)\b/.test(topic) && /\b(invoices?|factures?|bolt11)\b/.test(topic);
  const lightningRecovery = !otherPaymentSystem && /\b(lightning|lnd|aezeed)\b/.test(topic)
    && /\b(recover\w*|restor\w*|recuper\w*|restaur\w*|backup|sauvegarde|scb)\b/.test(topic)
    && /\b(channels?|canal|canaux|seed|aezeed|scb|node|noeud)\b/.test(topic);
  const lightningPrivacy = !otherPaymentSystem && isLightningPrivacyQuestion(query);
  const lightningLiquidity = !lightningOverview && !otherPaymentSystem && !/\b(splic\w*|remplir)\b/.test(topic) && /\blightning\b/.test(topic)
    && /\b(channels?|canal|canaux|liquidit\w*|liquidity)\b/.test(topic)
    && /\b(receiv\w*|recev\w*|reception|inbound|outbound|entrant\w*|sortant\w*|capacity|capacite|liquidity|liquidite)\b/.test(topic)
    && (!/\b(fees?|frais)\b/.test(topic) || /\b(liquidity|liquidit\w*|fund\w*|financ\w*|capacity|capacite|balance|solde)\b/.test(topic));
  const receivingLiquidity = lightningLiquidity
    && /\b(receiv\w*|recev\w*|reception|inbound|incoming|entrant\w*)\b/.test(topic)
    && !/\b(cln|core lightning|reserves?|htlcs?|fees?|frais)\b/.test(topic);
  const onchain = !/\b(lightning|ark|spark|liquid|cashu|fedimint)\b/.test(topic);
  const majorityAttack = isMajorityHashpowerQuestion(query);
  const issuanceValidity = isMonetaryIssuanceQuestion(query) || onchain && !otherPaymentSystem && !/\b(?:coinbase exchange|exchange coinbase|plateforme coinbase)\b/.test(topic)
    && /\b(?:bitcoin|btc|coinbase)\b/.test(topic) && /\b(?:blocks?|blocs?|coinbase)\b/.test(topic)
    && /\b(?:issuance|emission|subsid\w*|subvention\w*|coins?|creation|creates?|creer|cree\w*)\b/.test(topic)
    && /\b(?:reject\w*|rejet\w*|invalid\w*|unauthori[sz]ed|interdit\w*|too many|too much|excess\w*|trop|depasse\w*)\b/.test(topic);
  const cancellation = onchain && /\b(annul\w*|cancel\w*)\b/.test(topic) && /\b(bitcoin|paiement|payment|transaction)\b/.test(topic);
  const miningDrop = /\b(miners?|mineurs?|hashrate|hachage)\b/.test(topic) && /\b(arret\w*|stop\w*|switch off|shut down|chute|baisse|moitie|half)\b/.test(topic);
  const confirmationCost = onchain && /\b(confirm\w*)\b/.test(topic) && /\b(cheaper|pricier|cher|prix|price|cost|cout|fees|frais)\b/.test(topic);
  // A reorganisation changes the active chain, not the node's pruning policy.
  // Keep count/finality questions on their reviewed transaction evidence; age,
  // height and storage alone must not acquire this interpretation.
  const chainStorage = /\b(prun\w*|elagu\w*|elagage|stockage|storage)\b/.test(topic);
  const orphanBlock = onchain && /\b(?:orphan\w*|orphelin\w*|stale blocks?|blocs? stale|blocs? abandonn\w*)\b/.test(topic);
  const reorganisation = onchain && !chainStorage
    && (orphanBlock || /\b(reorg\w*|reorganis\w*|reorganiz\w*)\b/.test(topic)
      && /\b(bitcoin|btc|blocs?|blocks?|confirm\w*|transactions?|paiement|payment)\b/.test(topic)
      || /^(?:what|qu)\b[^.?!]{0,30}\b(?:a |an |un |une )?(?:reorg\w*|reorganis\w*|reorganiz\w*)\b/.test(topic));
  // A definition of a reorganisation has its own note; a question about the
  // confirmations or the payment it can undo keeps the confirmation and
  // finality notes.
  const reorganisationDefinition = reorganisation && !/\bconfirm\w*\b/.test(topic)
    && !/\b(?:pay\w*|paie\w*|money|argent|funds?|fonds|took|back|repris\w*|rembours\w*|annul\w*|cancel\w*|revers\w*|lose|lost|perd\w*)\b/.test(topic);
  const confirmationMeaning = onchain && !chainStorage && !confirmationCost
    && /\b(confirmations?)\b/.test(topic)
    && (/\b(bitcoin|btc|blocs?|blocks?|transactions?|paiement|payment|reorg\w*)\b/.test(topic)
      || /\b(?:[0-9]+|six|one|une|un) confirmations?\b/.test(topic)
      || /\b(risk|risque|finality|finalite|irreversib\w*|nul|zero|guarantee\w*|garanti\w*)\b/.test(topic));
  const replacement = onchain && /\b(replaceable|remplacable|remplacer|replace)\b/.test(topic) && /\b(transaction|wallet|portefeuille)\b/.test(topic);
  const recoveryWords = /\b(words|mots)\b/.test(topic.replace(/\b(mots de passe|passwords?)\b/g, '')) && /\b(secret\w*|recover\w*|restore|recuper\w*|12|24)\b/.test(topic);
  const etf = /\betf\b/.test(topic);
  const change = onchain && /\b(rest|remainder|remaining|reste|monnaie rendue)\b/.test(topic) && /\b(coin|utxo|bitcoin|btc|transaction)\b/.test(topic);
  const uneconomicSpend = onchain && /\b(uneconomic\w*|non rentable|pas rentable)\b/.test(topic) && /\b(spend|depens\w*)\b/.test(topic);
  const nodeStorage = /\b(gb|go|disk|disque|stockage)\b/.test(topic) && /\b(verif\w*|valid\w*)\b/.test(topic);
  const mempoolWait = onchain && /\b(attend\w*|attente|wait\w*)\b/.test(topic) && /\b(transactions?)\b/.test(topic) && /\b(blocs?|blocks?)\b/.test(topic);
  const printedAddress = /\b(address|adresse)\b/.test(topic) && /\b(business cards?|carte de visite|cartes de visite|print|imprim\w*)\b/.test(topic);
  const nodeComparison = isComparisonRagQuery(query) && /\b(leger\w*|spv|light client)\b/.test(topic) && /\b(full|complet\w*)\b/.test(topic);
  if (nodeComparison) {
    return ['full-node', 'spv-node'].map(id => index.docs.find(d => concept(d.chunk) === id && d.chunk.tier === 'primary'))
      .filter((d): d is Document => !!d).slice(0, max).map(d => ({ ...d.chunk, retrievalReason: 'primary-topic', retrievalScore: 1 }));
  }
  // Consolidating small outputs needs both the per-input economics (dust) and
  // the privacy cost of merging them (consolidation).
  const smallOutputConsolidation = onchain && /\b(?:consolid\w*|regroup\w*|merg\w*|fusion\w*|grouper)\b/.test(topic)
    && /\b(?:dust|poussiere|petites? sorties|petits? utxos?|small (?:outputs?|utxos?|coins?)|tiny (?:outputs?|utxos?)|centaines de sats|hundred sats)\b/.test(topic);
  // Why miners favour some transactions is block-template policy, not the
  // general fee formula.
  const minerSelection = onchain && /\b(?:miners?|mineurs?)\b/.test(topic)
    && /\b(?:choos\w*|chose|choisi\w*|select\w*|priorit\w*|prefer\w*|prefer|privilegi\w*|sort\w*|tri\w*|pick\w*|prenn\w*)\b/.test(topic)
    && /\b(?:transactions?|blocs?|blocks?)\b/.test(topic);
  const cpfp = isImplicitCpfpQuestion(query) || onchain && (/\b(?:cpfp|child pays for parent)\b/.test(topic)
    || /\b(?:child|enfant)\b/.test(topic) && /\bparent\b/.test(topic) && /\btransaction\b/.test(topic));
  const inputOutputAllocation = isInputOutputAllocationQuestion(query);
  const anchorId = revokedState ? 'secondary-lightning-revocation-key' : routingState ? 'lightning-network' : majorityAttack ? '51-attack' : issuanceValidity ? 'bitcoin-monetary-policy' : cpfp ? 'child-pays-for-parent' : isUnconfirmedReceiptReplacementQuestion(query) ? 'replace-by-fee' : bip39Passphrase ? 'bip39-passphrase' : lightningInvoice ? 'lightning-invoice'
    : lightningRecovery ? 'lightning-node-backup' : lightningPrivacy ? 'lightning-privacy-tradeoff'
    : receivingLiquidity ? 'inbound-liquidity' : lightningLiquidity ? 'lightning-liquidity-path' : reorganisationDefinition ? 'chain-reorganization' : reorganisation ? 'bitcoin-transaction-confirmation' : lightningOverview ? 'lightning-network' : inputOutputAllocation ? 'bitcoin-transaction-output' : change ? 'change-output' : smallOutputConsolidation ? 'dust' : uneconomicSpend ? 'dust'
    : nodeStorage ? 'pruned-node' : mempoolWait ? 'bitcoin-mempool' : printedAddress ? 'address-reuse'
    : cancellation ? 'bitcoin-finality'
    : miningDrop ? 'difficulty-adjustment'
    : confirmationCost ? 'transaction-fees'
    : confirmationMeaning ? 'bitcoin-transaction-confirmation'
    : replacement ? 'replace-by-fee'
    : recoveryWords ? 'wallet-recovery-phrase'
    : etf && !isComparisonRagQuery(query) ? 'paper-bitcoin'
    : isBroadBitcoinDefinition(query) ? 'bitcoin-network-vs-asset'
    : minerSelection ? 'miner-transaction-selection'
    : isGeneralBitcoinFeeQuestion(query) ? 'transaction-fees'
    : isExplicitRbfQuestion(query) ? 'replace-by-fee'
    : isMultisigRecoveryQuestion(query) ? 'multisig'
    : isUtxoValidationQuestion(query) ? 'double-spending'
    : isSmallOutputSpendingQuestion(query) ? 'dust' : null;
  const anchor = anchorId ? index.docs.find(d => concept(d.chunk) === anchorId && !!d.chunk.tier) : null;
  if (anchor) {
    const detail = revokedState
      ? index.docs.find(d => concept(d.chunk) === (/\b(?:route|routes|routing|routage|chemins?|paths?)\b/.test(topic) ? 'lightning-network' : 'watchtower') && d.chunk.tier === 'primary')
      : routingState
      ? index.docs.find(d => concept(d.chunk) === 'lightning-routing' && d.chunk.tier === 'primary')
      : inputOutputAllocation
      ? index.docs.find(d => concept(d.chunk) === 'bitcoin-transaction-input' && d.chunk.tier === 'primary')
      : majorityAttack || issuanceValidity
      ? index.docs.find(d => concept(d.chunk) === 'bitcoin-consensus' && d.chunk.tier === 'primary')
      : cpfp && /\brbf\b/.test(topic)
      ? index.docs.find(d => concept(d.chunk) === 'replace-by-fee' && d.chunk.tier === 'primary')
      : lightningRecovery && /\b(lnd|aezeed|scb)\b/.test(topic)
      ? index.docs.find(d => concept(d.chunk) === 'secondary-lightning-static-channel-backup' && d.chunk.tier === 'secondary')
      : anchorId === 'bitcoin-transaction-confirmation' && (reorganisation || confirmationMeaning)
      ? index.docs.find(d => concept(d.chunk) === 'bitcoin-finality' && d.chunk.tier === 'primary')
      : lightningOverview && /\b(?:invoices?|factures?)\b/.test(topic)
      ? index.docs.find(d => concept(d.chunk) === 'lightning-invoice' && d.chunk.tier === 'primary')
      : smallOutputConsolidation ? index.docs.find(d => concept(d.chunk) === 'consolidation-transaction' && d.chunk.tier === 'primary')
      : miningDrop ? index.docs.find(d => concept(d.chunk) === 'mining-difficulty-details' && d.chunk.tier === 'secondary') : null;
    return [anchor, ...(detail ? [detail] : [])].slice(0, max).map(d => ({ ...d.chunk,
      retrievalReason: d.chunk.tier === 'secondary' ? 'secondary-parent-detail' : 'primary-topic', retrievalScore: 1 }));
  }
  const queryTerms = [...new Set(terms(query))];
  if (!queryTerms.length) {
    // Bitcoin itself is a corpus-wide stopword, but its definition is meaningful.
    const normalized = normalizeCuratedText(query);
    const basics = index.docs.find(d => concept(d.chunk) === 'bitcoin-network-vs-asset' && d.chunk.tier === 'primary');
    return /\bbitcoin\b/.test(normalized) && basics
      ? [{ ...basics.chunk, retrievalReason: 'primary-topic', retrievalScore: 1 }] : [];
  }
  const querySet = new Set(queryTerms);
  if (!/\bbitcoin\b/.test(normalizedQuery) && !index.docs.some(d => queryTerms.some(t => d.identity.has(t)))) return [];
  const semantic = new Map((semanticMatches ?? []).filter(s => s.score >= .82).map(s => [s.id, s.score]));
  const totalQueryWeight = queryTerms.reduce((n, t) => n + idf(index, t), 0);
  // The phrase 'child pays for parent' must not make ordinary family or
  // school-payment questions look like Bitcoin package-policy questions.
  const scored = index.docs.filter(doc => concept(doc.chunk) !== 'child-pays-for-parent' || cpfp).map(doc => {
    const exact = doc.aliases.filter(a => covered(a, querySet));
    const aliasScore = Math.max(0, ...exact.map(a => a.reduce((n, t) => n + idf(index, t), 0)));
    const titleTerms = [...doc.fields[0].keys()];
    const titleExact = titleTerms.length && titleTerms.every(t => querySet.has(t))
      && (isComparisonRagQuery(query) || queryTerms.every(t => titleTerms.includes(t)));
    const titleEvidence = titleExact ? queryTerms.reduce((n, t) => n + idf(index, t), 0) * 4 : 0;
    const questionEvidence = Math.max(0, ...doc.questions.map(q => {
      const shared = [...new Set(q)].filter(t => querySet.has(t));
      const coverage = shared.length / Math.max(1, Math.min(q.length, queryTerms.length));
      return shared.length >= 2 ? coverage * shared.reduce((n, t) => n + idf(index, t), 0) : 0;
    }));
    const comparisonQuery = /\b(difference|versus|compare|comparaison|vs|between)\b/.test(normalizedQuery);
    const coverage = queryTerms.filter(t => doc.fields.some(f => f.has(t)))
      .reduce((n, t) => n + idf(index, t), 0) / Math.max(1, totalQueryWeight);
    return { doc, score: (fieldScore(index, doc, queryTerms) + aliasScore * 2 + questionEvidence * 2 + titleEvidence) * (comparisonQuery && exact.length ? 1 : .15 + .85 * coverage ** 2), exact, coverage };
  });
  const lexicalLeader = scored.filter(r => r.doc.chunk.tier === 'primary').sort((a, b) => b.score - a.score)[0];
  if (normalizedQuery !== 'alice' && !isComparisonRagQuery(query) && (lexicalLeader?.exact.some(a => queryTerms.every(t => a.includes(t)))
    || lexicalLeader && queryTerms.every(t => lexicalLeader.doc.identity.has(t)))) {
    return [{ ...lexicalLeader.doc.chunk, retrievalReason: 'primary-topic', retrievalScore: Number(lexicalLeader.score.toFixed(3)) }];
  }
  const maxLexicalScore = Math.max(10, ...scored.map(r => r.score));
  for (const row of scored) {
    const product = concept(row.doc.chunk).startsWith('alice-') || row.doc.chunk.surface === 'alice-app';
    const productIntent = /\b(alice|playground|learn|explorer|private cloud|cloud prive)\b/.test(normalizedQuery);
    if (product && !productIntent) { row.score = 0; semantic.delete(row.doc.chunk.id); continue; }
    const similarity = semantic.get(row.doc.chunk.id);
    const lexicalSupport = queryTerms.some(t => row.doc.identity.has(t)) || row.coverage >= .5;
    const linkedSemanticSupport = index.docs.some(d => (d.chunk.parentIds ?? []).includes(concept(row.doc.chunk))
      && (semantic.get(d.chunk.id) ?? 0) >= .86);
    if (similarity && (lexicalSupport || linkedSemanticSupport || row.doc.chunk.tier === 'secondary')) {
      row.score += maxLexicalScore * (product && queryTerms.every(t => t === 'alice') ? .85 : lexicalSupport ? .25 : .85) * ((similarity - .78) / .22);
    } else semantic.delete(row.doc.chunk.id);
  }
  scored.sort((a, b) => b.score - a.score);
  const primaries = scored.filter(r => r.score >= 2 && r.doc.chunk.tier === 'primary');
  const leader = primaries[0];
  if (isComparisonRagQuery(query)) {
    const subjects = queryTerms.filter(t => primaries.some(r => r.doc.aliases.some(a => a.length === 1 && a[0] === t))
      || primaries.filter(r => concept(r.doc.chunk).startsWith(t + '-')).length >= 3);
    const anchors = subjects.map(t => primaries.find(r => r.doc.identity.has(t)));
    const distinct = anchors.filter((r, i): r is typeof primaries[number] => !!r && anchors.findIndex(a => a?.doc === r.doc) === i);
    if (distinct.length >= 2) return distinct.slice(0, max).map(r => ({ ...r.doc.chunk, retrievalReason: 'primary-topic', retrievalScore: Number(r.score.toFixed(3)) }));
  }
  const byConcept = new Map(index.docs.map(d => [concept(d.chunk), d]));
  // An introduction matching precisely the requested topic needs no appended
  // specialist note. No query-length or conversation-turn rule is involved.
  const broad = leader?.exact.some(a => queryTerms.every(t => a.includes(t))) ?? false;
  const eligible: { match: CuratedMatch; score: number }[] = [];
  for (const row of scored) {
    const { doc, score, exact, coverage } = row;
    if (score < 2) continue;
    let reason: CuratedMatch['retrievalReason'];
    if (doc.chunk.tier === 'primary') {
      if (leader && score < leader.score * .55) continue;
      reason = 'primary-topic';
    } else if (doc.chunk.tier === 'secondary') {
      if (broad) continue;
      const parents = (doc.chunk.parentIds ?? []).map(id => byConcept.get(id.replace(/^curated-/, ''))).filter((d): d is Document => !!d);
      const parentTerms = new Set(parents.flatMap(d => [...d.identity]));
      const distinctive = queryTerms.filter(t => !parentTerms.has(t) && doc.fields.some(f => f.has(t)) && idf(index, t) >= .8);
      const explicit = exact.some(a => a.some(t => !parentTerms.has(t)));
      // A question match catches paraphrases such as adding funds without
      // closing a channel even if the person does not know the word splicing.
      const questionMatch = doc.questions.some(q => {
        const shared = q.filter(t => querySet.has(t));
        return shared.length >= 2;
      });
      const parentRelevant = parents.some(p => queryTerms.some(t => p.fields.some(f => f.has(t))));
      const semanticDetail = (semantic.get(doc.chunk.id) ?? 0) >= .86
        && parents.some(p => (semantic.get(p.chunk.id) ?? 0) >= .82);
      const bodyDetail = distinctive.length >= 3 && coverage >= .9;
      if (explicit && score >= (leader?.score ?? 0) * .6) reason = 'secondary-explicit-topic';
      else if (parentRelevant && distinctive.length >= 2 && (questionMatch || bodyDetail) && score >= (leader?.score ?? 0) * .55) reason = 'secondary-parent-detail';
      else if (parents.length && questionMatch && distinctive.length >= 2 && score >= (leader?.score ?? 0) * 1.15) reason = 'secondary-parent-detail';
      else if (semanticDetail) reason = 'secondary-parent-detail';
      else continue;
    } else {
      // Callers pass only downloaded non-curated packs here. Require complete
      // explicit identity, not incidental vocabulary in their body text.
      if (!exact.length || (leader && score < leader.score * 1.15)) continue;
      reason = 'downloaded-explicit-topic';
    }
    eligible.push({ match: { ...doc.chunk, retrievalReason: reason, retrievalScore: Number(score.toFixed(3)) }, score });
  }
  // An old index cannot inject unknown ids, disabled packs or a secondary
  // rejected above. Semantic similarity only nudges already-supported notes.
  eligible.sort((a, b) => (b.score * (1 + (semantic.get(b.match.id) ?? 0) * .1)) - (a.score * (1 + (semantic.get(a.match.id) ?? 0) * .1)));
  if (!eligible.length) return [];
  const selected: CuratedMatch[] = [];
  const strongest = eligible[0];
  const comparison = /\b(difference|versus|compare|comparaison|vs|between)\b/.test(normalizedQuery);
  const cutoff = comparison ? .45 : .65;
  // Keep one relevant primary as orientation, not all of a secondary's parents.
  const detail = eligible.find(r => r.match.tier === 'secondary' && r.score >= strongest.score * .8);
  const detailParents = detail ? new Set(detail.match.parentIds ?? []) : null;
  const primary = eligible.find(r => r.match.tier === 'primary' && r.score >= strongest.score * .65
    && (!detailParents || detailParents.has(concept(r.match))));
  if (primary) selected.push(primary.match);
  for (const candidate of eligible) {
    if (selected.length >= max) break;
    if (selected.some(c => concept(c) === concept(candidate.match))) continue;
    if (candidate.score < strongest.score * cutoff
      && !(comparison && candidate.match.retrievalReason === 'secondary-explicit-topic')) continue;
    if (detailParents && candidate.match.tier === 'primary' && !detailParents.has(concept(candidate.match))) continue;
    // A broad request is fully answered by its primary; do not fill a budget.
    if (broad && selected.length) break;
    selected.push(candidate.match);
  }
  return selected;
}
