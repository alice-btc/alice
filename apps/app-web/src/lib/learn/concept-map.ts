/** Small, inspectable vocabulary for Learn retrieval, not generated factual knowledge. */
export type LearnRelation = 'explains' | 'defines' | 'applies';
export type LearnConcept = { id: string; aliases: readonly string[]; related: readonly string[] };

// Relations express nearby teaching subjects, never equivalence or a factual
// claim to quote. Expansion stops after one hop and cannot qualify a document
// by itself: its metadata or emitted passage must name a requested concept.
export const LEARN_CONCEPTS: readonly LearnConcept[] = [
  { id: 'lightning', aliases: ['lightning', 'lightning network', 'reseau lightning'], related: ['channels', 'invoice', 'routing', 'liquidity', 'payment-fees'] },
  { id: 'channels', aliases: ['payment channel', 'payment channels', 'canal de paiement', 'canaux de paiement', 'canal lightning', 'canaux lightning'], related: ['lightning', 'liquidity'] },
  { id: 'invoice', aliases: ['invoice', 'invoices', 'facture', 'factures', 'bolt11'], related: ['lightning', 'routing'] },
  { id: 'routing', aliases: ['routing', 'routage', 'payment route', 'chemin de paiement'], related: ['lightning', 'liquidity', 'payment-fees'] },
  { id: 'liquidity', aliases: ['liquidity', 'liquidite', 'liquidites'], related: ['channels', 'routing'] },
  { id: 'payment-fees', aliases: ['transaction fee', 'transaction fees', 'routing fee', 'routing fees', 'frais de transaction', 'frais de routage', 'feerate', 'fee rate', 'taux de frais'], related: ['transactions', 'routing'] },
  { id: 'transactions', aliases: ['transaction', 'transactions'], related: ['utxo', 'inputs', 'outputs', 'payment-fees'] },
  { id: 'utxo', aliases: ['utxo', 'utxos', 'unspent output', 'unspent outputs', 'sortie non depensee', 'sorties non depensees'], related: ['transactions', 'inputs', 'outputs'] },
  { id: 'inputs', aliases: ['transaction input', 'transaction inputs', 'entree de transaction', 'entrees de transaction'], related: ['transactions', 'utxo', 'outputs'] },
  { id: 'outputs', aliases: ['transaction output', 'transaction outputs', 'sortie de transaction', 'sorties de transaction', 'change output', 'monnaie rendue'], related: ['transactions', 'utxo', 'inputs'] },
  { id: 'issuance', aliases: ['issuance', 'monetary issuance', 'emission monetaire', 'creation monetaire', 'new coins', 'nouveaux bitcoins', 'block subsidy', 'subvention de bloc', 'coinbase', 'halving'], related: ['mining', 'consensus'] },
  { id: 'mining', aliases: ['mining', 'miner', 'miners', 'minage', 'mineur', 'mineurs'], related: ['issuance', 'consensus'] },
  { id: 'consensus', aliases: ['consensus', 'validation', 'validity rules', 'regles de validite'], related: ['issuance', 'nodes'] },
  { id: 'nodes', aliases: ['full node', 'full nodes', 'noeud complet', 'noeuds complets', 'bitcoin node', 'noeud bitcoin'], related: ['consensus'] },
  { id: 'backup', aliases: ['recovery phrase', 'seed phrase', 'phrase de recuperation', 'phrase mnemonique', 'wallet backup', 'sauvegarde du portefeuille'], related: ['wallets'] },
  { id: 'wallets', aliases: ['wallet', 'wallets', 'portefeuille', 'portefeuilles'], related: ['backup', 'utxo'] },
  { id: 'privacy', aliases: ['privacy', 'confidentialite', 'address reuse', 'reutilisation des adresses'], related: ['transactions', 'lightning'] },
];

export function normalizeConceptText(text: string): string {
  return text.toLowerCase().replace(/œ/g, 'oe').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

const CONCEPT_ALIASES = LEARN_CONCEPTS.map(concept => ({
  concept, aliases: concept.aliases.map(alias => ({ alias, needle: ` ${normalizeConceptText(alias)} ` })),
}));

export function conceptsIn(text: string): string[] {
  const normalized = ` ${normalizeConceptText(text)} `;
  return CONCEPT_ALIASES.filter(item => item.aliases.some(alias => normalized.includes(alias.needle))).map(item => item.concept.id);
}

export function relatedConcepts(ids: readonly string[]): string[] {
  return [...new Set(LEARN_CONCEPTS.filter(concept => ids.includes(concept.id)).flatMap(concept => concept.related))].filter(id => !ids.includes(id));
}

export type LearnConceptEdge = {
  resourceId: string;
  relation: LearnRelation;
  conceptId: string;
  evidence: { field: string; alias: string };
};

/** Every resource edge has a literal alias in a named metadata field. */
export function describeLearnResource(resourceId: string, relation: LearnRelation, fields: Record<string, string>): LearnConceptEdge[] {
  const edges: LearnConceptEdge[] = [];
  const normalizedFields = Object.entries(fields).map(([field, value]) => [field, ` ${normalizeConceptText(value)} `]);
  for (const { concept, aliases } of CONCEPT_ALIASES) {
    for (const [field, value] of normalizedFields) {
      const match = aliases.find(candidate => value.includes(candidate.needle));
      if (match) { edges.push({ resourceId, relation, conceptId: concept.id, evidence: { field, alias: match.alias } }); break; }
    }
  }
  return edges;
}

export function learnIntent(query: string): LearnRelation {
  const text = normalizeConceptText(query);
  if (/\b(?:install|installer|configure|configurer|setup|set up|build|construire|connect|connecter|trigger|declencher|integrate|integrer|program|programmer|implement|implementer)\b/.test(text)) return 'applies';
  if (/\b(?:what is|what are|define|definition|definir|qu est ce|c est quoi|que signifie)\b/.test(text)) return 'defines';
  return 'explains';
}

/** Relations adjust a relevant candidate, never make an unrelated one relevant. */
export function conceptAffinity(query: string, edges: readonly LearnConceptEdge[]): { direct: number; related: number; score: number } {
  const requested = conceptsIn(query);
  const nearby = relatedConcepts(requested);
  const direct = edges.filter(edge => requested.includes(edge.conceptId)).length;
  const related = edges.filter(edge => nearby.includes(edge.conceptId)).length;
  if (!direct) return { direct: 0, related, score: 0 };
  const intent = learnIntent(query);
  const relation = edges[0]?.relation;
  const purpose = relation === intent ? 10
    : intent === 'defines' && relation === 'explains' ? 4
      : relation === 'applies' && intent !== 'applies' ? -8 : 0;
  return { direct, related, score: Math.min(direct, 3) * 3 + Math.min(related, 3) + purpose };
}

