import type { Message } from './llm.ts';
import type { SupportedLanguage } from './language-policy.ts';

type Subject = 'fees' | 'dust' | 'coinjoin' | 'ark';
const ANSWERS: Record<Subject, Record<SupportedLanguage, string>> = {
  fees: {
    fr: 'Les frais Bitcoin dépendent des données de la transaction, pas du montant envoyé : frais = taille virtuelle en vB × taux en sat/vB. Le nombre et le type des entrées et des sorties déterminent cette taille. 2 paiements de montants différents peuvent donc coûter autant si leur taille et leur taux sont identiques. Un petit paiement n’est pas nécessairement plus petit en données.\n\nLe portefeuille ou l’utilisateur choisit le taux, en tenant compte de la demande pour l’espace de bloc et du délai souhaité. Les mineurs sélectionnent les transactions et reçoivent les frais ; ils ne paient pas cet espace. Consulte l’estimation du portefeuille avant de confirmer. Aucun taux actuel n’est déduit ici.',
    en: 'Bitcoin fees depend on transaction data, not the amount sent: fee = virtual size in vB × fee rate in sat/vB. Input and output counts and script types determine the size. Different payment amounts can therefore cost the same if their sizes and fee rates are equal. A small payment is not necessarily smaller in data.\n\nThe wallet or sender chooses the fee rate in response to demand for block space and the desired confirmation time. Miners select transactions and receive fees; they do not pay for that space. Check the wallet’s estimate before confirming. This explanation does not supply a current fee rate.',
  },
  dust: {
    fr: 'Oui, une sortie peut dépasser le seuil dust applicable et coûter plus cher à dépenser que sa valeur à un taux donné. La dépenser ajoute une entrée à une transaction : son coût dépend du type de script et du taux de frais en sat/vB. Il n’existe donc pas de seuil universel de rentabilité. Les fonds ne disparaissent pas parce que le portefeuille les juge non rentables.\n\nC’est différent du dust : la politique de relais juge les sorties à leur création selon des paramètres et un type de sortie ; elle ne mesure pas le coût réel de dépenser aujourd’hui une sortie déjà reçue.\n\nLa consolidation partage certains frais fixes, mais paie toujours chaque entrée. Si une entrée coûte à elle seule plus que sa valeur, la regrouper ne supprime pas cette perte. Un taux plus bas peut améliorer la rentabilité, sans garantie ; vérifie l’estimation du portefeuille.',
    en: 'Yes. An output can be above the applicable dust threshold and still cost more to spend than it is worth at a given fee rate. Spending it adds an input to a transaction; its cost depends on the script type and fee rate in sat/vB. There is no universal economic threshold. The funds do not disappear when a wallet considers them uneconomic.\n\nThis differs from dust relay policy, which evaluates outputs when they are created using policy parameters and output types. It is not a measurement of today’s actual cost to spend an existing output.\n\nConsolidation shares some transaction overhead but still pays for every input. If one input alone costs more than its value, grouping it does not remove that loss. A lower fee rate may help, without a guarantee; check the wallet’s estimate.',
  },
  coinjoin: {
    fr: 'Un CoinJoin ne rend pas invisible sur la blockchain. Plusieurs participants réunissent leurs entrées et leurs sorties dans une transaction collaborative pour rendre les liens entre elles plus difficiles à établir. La transaction, ses entrées, ses sorties et ses montants restent publics ; l’historique antérieur n’est pas effacé. Un service qui connaît déjà ton identité conserve cette information.\n\nLe gain dépend de l’ensemble d’anonymat (les participants ou sorties avec lesquels on peut te confondre) et des motifs de montants. Des montants distinctifs peuvent réduire ce gain ; tous les CoinJoin n’offrent pas la même confidentialité.\n\nRéutiliser une adresse, rapprocher des opérations dans le temps ou fusionner ensuite plusieurs sorties peut recréer des liens. Ce n’est pas une garantie d’anonymat absolu.',
    en: 'CoinJoin does not make you invisible on the blockchain. Several participants combine their inputs and outputs in one collaborative transaction to make the links between them harder to establish. The transaction, inputs, outputs and amounts remain public; earlier history is not erased. A service that already knows your identity retains that information.\n\nThe benefit depends on the anonymity set (participants or outputs with which yours can be confused) and on amount patterns. Distinctive amounts can weaken it; different CoinJoin designs offer different privacy properties.\n\nAddress reuse, transaction timing and later merging of outputs can recreate links. CoinJoin is not a guarantee of absolute anonymity.',
  },
  ark: {
    fr: 'Dans la voie normale de dépense d’un VTXO Ark, la signature du détenteur est nécessaire : l’opérateur ne le dépense pas seul. Cette protection n’est pas une garantie générale contre le vol ou la perte : l’expiration et la collusion doivent être considérées séparément.\n\nL’opérateur coordonne les paiements, voit l’activité qu’il traite et peut cesser de coopérer. Les tours et renouvellements coopératifs dépendent de lui. Avec les données de sortie valides et suffisamment de temps, une sortie unilatérale ne demande pas son autorisation ; il faut payer des frais sur Bitcoin, respecter les délais de verrouillage et terminer les confirmations avant l’expiration.\n\nÀ l’expiration, une voie de récupération peut permettre au serveur de reprendre les fonds selon la construction. La simple diffusion en mempool avant l’échéance ne suffit pas : les étapes nécessaires de la sortie doivent être confirmées à temps. Après expiration, la récupération dépend de sa coopération et les fonds peuvent être perdus s’il refuse. Les transferts arkoor ajoutent une hypothèse de non-collusion entre anciens émetteurs et serveur : leur collusion peut permettre une double dépense au détriment du destinataire. Les règles et garanties varient selon le type de VTXO et l’implémentation : vérifie celles du portefeuille et du serveur concernés.',
    en: 'Normal spending of an Ark VTXO requires the holder’s signature: the operator cannot spend it alone through that path. This is not a blanket guarantee against theft or loss; expiry and collusion risks must be considered separately.\n\nThe operator coordinates payments, sees the activity it handles and can stop cooperating. Cooperative rounds and refreshes depend on it. With valid exit data and enough time, a unilateral exit does not require its permission; it requires Bitcoin transaction fees, timelocks and completion of confirmations before expiry.\n\nAt expiry, a recovery path may allow the server to reclaim funds, depending on the construction. Broadcasting into the mempool before the deadline is not enough: the required exit steps must confirm in time. After expiry, recovery depends on the operator’s cooperation and funds may be lost if it refuses. Arkoor transfers add a non-collusion assumption involving previous senders and the server: collusion can allow a double-spend that undermines the recipient’s claim. Rules and guarantees differ by VTXO type and implementation: check the relevant wallet and server documentation.',
  },
};

const ARK_FOLLOWUP: Record<SupportedLanguage, { exit: string; collusion: string; limits: string }> = {
  fr: {
    exit: 'Pour la sortie, la simple diffusion en mempool ne suffit pas. Il faut les données de sortie valides, des frais sur Bitcoin et assez de temps pour respecter les délais de verrouillage (timelocks) : les étapes nécessaires doivent être confirmées à temps, avant l’expiration. Avec ces conditions réunies, la sortie unilatérale ne demande pas l’autorisation de l’opérateur.',
    collusion: 'Le risque arkoor est distinct : une collusion entre le serveur et un ancien émetteur peut permettre une double dépense au détriment du destinataire. La signature exigée pour une dépense normale ne supprime pas cette hypothèse de non-collusion.',
    limits: 'Les chemins et garanties dépendent du type de VTXO et de l’implémentation. Après expiration, une récupération peut dépendre de la coopération du serveur ; elle n’est pas garantie.',
  },
  en: {
    exit: 'For the exit, broadcasting into the mempool is not enough. You need valid exit data, Bitcoin transaction fees and enough time to satisfy the required timelocks: the necessary exit steps must confirm before expiry. With those conditions met, a unilateral exit does not require the operator’s permission.',
    collusion: 'The arkoor risk is separate: collusion between the server and a previous sender can enable a double-spend that undermines the recipient’s claim. The signature required for an ordinary spend does not eliminate this non-collusion assumption.',
    limits: 'Paths and guarantees depend on the VTXO type and implementation. After expiry, recovery may depend on the server’s cooperation; it is not guaranteed.',
  },
};

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const subjectOf = (text: string): Subject | null => {
  const subjects: Subject[] = [];
  if (/\b(?:ark|arkoor|vtxo)\b/.test(text)) subjects.push('ark');
  if (/\bcoinjoin\b/.test(text)) subjects.push('coinjoin');
  if (/\b(?:dust|non rentable|uneconomic|unprofitable)\b/.test(text)) subjects.push('dust');
  return subjects.length === 1 ? subjects[0] : null;
};

/** Controlled conceptual answers require a matching retrieved source. Follow-ups
 * may inherit only the immediately preceding user subject, never model claims. */
export function groundedExplanation(question: string, language: SupportedLanguage, context: string, history: Message[] = []): string | null {
  const q = normalize(question);
  if (q.length > 800 || q.includes('\n')) return null;
  // Remove only an explicit instruction not to supply a live rate; a separate
  // positive live-rate request elsewhere in the question still fails the guard.
  const guarded = q.replace(/\bwithout (?:quoting|giving|using|providing) (?:any )?(?:current|live) fee rates?\b/g, '')
    .replace(/\bsans (?:donner|citer|utiliser) (?:de |les |des )?(?:taux de frais actuels|frais actuels)\b/g, '');
  if (/\b(?:translate|tradu\w*|poem|poeme|code|api|python|javascript|versus|compare\w*|compar\w*|actuel\w*|current|today|aujourd|now|maintenant|live|version|bark|arkade|lightning|ethereum|solana|paypal|bank|bancair\w*|carte|rbf|cpfp|restaur\w*)\b/.test(guarded)) return null;
  if (/\b(?:write|ecris|generate|genere)\b.*\bscript\b/.test(q)) return null;
  if (/\b(?:one|1|une)\s+(?:short\s+|courte\s+)?(?:sentence|phrase)\b/.test(q)) return null;
  if (/\b(?:ignore|ignorer|instead|plutot|not about|pas de|pas sur|ne parle pas)\b/.test(q)) return null;
  if (/^(?:send|envoie|envoyez|sign|signe|broadcast|diffuse|execute|executez)\b/.test(q)) return null;
  if (/\b(?:recover|recuper\w*)\b.*\b(?:my wallet|mon portefeuille|seed|phrase)\b/.test(q)) return null;
  // Numerical questions belong to the calculator or generation, not a generic explanation.
  if (/\d\s*(?:vb|sat\s*\/\s*vb)/.test(q)) return null;
  if (/\b(?:mining|minage|proof of work|preuve de travail|halving|multisig|taproot|segwit)\b/.test(q)) return null;
  const topics = context.split('\n').filter(line => line.startsWith('Topic: ')).map(line => normalize(line.slice(7)));
  const evidence = (names: string[]) => names.some(name => topics.includes(normalize(name)));
  const explicit = subjectOf(q);
  const count = [/\b(?:ark|arkoor|vtxo)\b/, /\bcoinjoin\b/, /\b(?:dust|non rentable|uneconomic)\b/].filter(p => p.test(q)).length;
  if (count > 1) return null;
  const previousUsers = history.filter(message => message.role === 'user');
  if (previousUsers.at(-1)?.content === question) previousUsers.pop();
  const previousSubject = subjectOf(normalize(previousUsers.at(-1)?.content ?? ''));
  const followup = /^(?:and\b|then\b|so\b|et\b|donc\b)/.test(q)
    && !/\b(?:autre sujet|another topic|different topic|changeons|fees?|frais|bitcoin|blockchain)\b/.test(q);
  const subject = explicit ?? (followup ? previousSubject : null);
  if (subject === 'coinjoin' && /\b(?:fees?|frais)\b/.test(q)) return null;
  if (subject === 'ark' && /\b(?:fees?|frais)\b/.test(q) && !/\b(?:exit|sortie|expir\w*|deadline|timelock\w*)\b/.test(q)) return null;
  if (subject === 'coinjoin' && evidence(['comprendre coinjoin', 'coinjoin', 'understanding coinjoin'])) {
    if (/\b(?:combin\w*|merg\w*|regroup\w*|fusion\w*)\b/.test(q)) {
      if (!/\b(?:privacy|confidential\w*|anonym\w*|harm|hurt|liens?|risk|risqu\w*)\b/.test(q)) return null;
      const parts = language === 'fr'
        ? ['Non, regrouper les sorties peut donner de nouveaux indices de propriété et réduire la confidentialité.', 'La perte dépend de la transaction et des autres informations de l’observateur ; cela ne révèle pas automatiquement tout l’historique de chaque participant.']
        : ['No. Combining outputs can create new ownership clues and reduce privacy.', 'The loss depends on the transaction and the observer’s other information; it does not automatically reveal every participant’s entire history.'];
      return /\b(?:two|2|deux)\b.*\b(?:bullets?|puces?)\b/.test(q) ? parts.map(part => `- ${part}`).join('\n') : parts.join(' ');
    }
    if (/\b(?:invisib\w*|anonym\w*|privacy|confidential\w*|trace\w*|privee|histor\w*|efface\w*|hide|public|ownership|identit\w*)\b/.test(q)) return ANSWERS.coinjoin[language];
  }
  if (subject === 'ark' && evidence(['les hypothèses de sécurité d’ark', "ark's security assumptions", 'ark security model', 'les paiements avec ark', 'payments with ark', 'ark operator / asp', 'entrer et sortir d’ark', 'entering and exiting ark'])) {
    // A focused follow-up answers the newly requested conditions instead of
    // repeating the general overview. Only the immediate user topic qualifies;
    // an assistant mentioning Ark or an earlier, superseded topic does not.
    const exitFocus = /\b(?:exit|sortie)\b/.test(q)
      && /\b(?:confirm\w*|broadcast\w*|diffus\w*|data|donnees|ready|pret\w*|timelock\w*|deadline|expir\w*)\b/.test(q);
    const collusionFocus = /\b(?:collusion|collud\w*|conspir\w*|s.alli\w*|s.entend\w*|arkoor)\b/.test(q);
    const otherArkRequest = /\b(?:signature|signatures|refresh\w*|renouvel\w*|rounds?|tours?|visib\w*|voit|sees|coordinate\w*|coordonn\w*)\b/.test(q);
    if (previousSubject === 'ark' && (exitFocus || collusionFocus) && !otherArkRequest) {
      const focused = ARK_FOLLOWUP[language];
      return [exitFocus ? focused.exit : null, collusionFocus ? focused.collusion : null, focused.limits]
        .filter(Boolean).join('\n\n');
    }
    if (/\b(?:operator|operateur|asp|signature|expiry|expiration|expire\w*|deadline|unilateral\w*|collusion|collud\w*|arkoor|trust\w*|confiance|hypothes\w*|assumptions?)\b/.test(q)) return ANSWERS.ark[language];
  }
  if (subject === 'dust' && evidence(['le dust et les sorties non rentables', 'dust and uneconomic outputs'])) {
    if (/\b(?:consensus|invalid\w*|valide|validite)\b/.test(q)) return language === 'fr'
      ? 'Non. La politique de relais dust et les règles de consensus sont distinctes. Un refus de relais pour création de dust ne rend pas à lui seul une transaction ou un bloc invalide au consensus. Un mineur peut inclure la transaction si elle et le bloc respectent les règles de consensus ; cela ne garantit pas que chaque nœud la relaie.'
      : 'No. Dust relay policy and consensus rules are distinct. Rejection for creating dust does not by itself make a transaction or block consensus-invalid. A miner can include the transaction if it and the block satisfy consensus rules; that does not guarantee every node will relay it.';
    if (/\b(?:lost|perdu\w*|destroy\w*|detruit\w*)\b/.test(q)) return language === 'fr'
      ? 'Non, ces fonds ne sont pas définitivement perdus parce que leur dépense coûte trop cher à un taux donné. La sortie reste dépensable selon ses conditions. Un taux plus bas peut améliorer sa rentabilité, sans garantie que les frais baissent ni qu’une dépense devienne rentable.'
      : 'No. An output is not permanently lost because spending it costs too much at one fee rate. It remains spendable under its spending conditions. A lower rate may improve its economics, without a guarantee that rates will fall or spending will become profitable.';
    if (/\b(?:non rentable|uneconomic|unprofitable|not worth|cost more.*spend|worth)\b/.test(q)) return ANSWERS.dust[language];
  }
  if (/\b(?:fee\w*|frais)\b/.test(q) && /\b(?:small|tiny|large|petit\w*|gros|amount|montant|twice|fois)\b/.test(q)
    && /\b(?:why|pourquoi|explain|explique|same|meme|depend\w*|double\w*|twice|fois)\b/.test(q)
    && evidence(['les frais de transaction', 'transaction fees'])) return ANSWERS.fees[language];
  return null;
}
