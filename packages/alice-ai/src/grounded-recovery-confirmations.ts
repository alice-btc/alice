import type {Message} from './llm.ts';
import type {SupportedLanguage} from './language-policy.ts';

type Topic = 'bip39' | 'confirmations';
const fold = (value:string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").trim();
const bip39 = (q:string) => /\bbip[ -]?39\b/.test(q) && /\b(?:passphrase|phrase|seed|mnemonic|mots|words)\b/.test(q);
const confirmations = (q:string) => /\b(?:confirmations?|reorg\w*|reorganis\w*|reorganiz\w*)\b/.test(q)
  && /\b(?:bitcoin|btc|blocks?|blocs?|chaine|chain|transaction\w*|payment|paiement|risk|risqu\w*|finalit\w*|zero|nul|[0-9]+)\b/.test(q);
const subject = (q:string):Topic|null => bip39(q) ? 'bip39' : confirmations(q) ? 'confirmations' : null;

const recovery:Record<SupportedLanguage,string> = {
  en: 'The same BIP39 wallet requires the recovery words AND the exact original passphrase, with compatible derivation settings. The passphrase participates in deriving the seed and private keys; a device PIN or local app password only controls access and cannot substitute for it.\n\nBIP39 has no universal passphrase reset or guaranteed recovery service. What can be recovered depends on what is still known and the secret’s strength: checking a limited set of known candidates may sometimes help, so forgetting it does not prove universal mathematical impossibility. Keep the words and passphrase private; do not send them here.',
  fr: 'Retrouver le même portefeuille BIP39 demande les mots de récupération ET la passphrase originale exacte, avec les paramètres de dérivation compatibles. La passphrase participe à la dérivation de la seed et des clés privées ; un PIN d’appareil ou mot de passe local d’application contrôle seulement un accès et ne la remplace pas.\n\nBIP39 ne prévoit ni réinitialisation universelle de passphrase ni service de récupération garanti. La faisabilité dépend des éléments encore connus et de la robustesse du secret : vérifier un ensemble limité de candidats connus peut parfois aider, donc un oubli ne prouve pas une impossibilité mathématique universelle. Garde les mots et la passphrase privés ; ne les envoie pas ici.',
};
const empty:Record<SupportedLanguage,string> = {
  en: 'An empty display without an error proves neither that the passphrase is correct nor that the original funds were lost, stolen or moved. Every BIP39 passphrase, including an empty one, derives a valid seed and private keys. A different passphrase can produce another valid wallet without an incorrect-password error; successful opening does not validate the intended passphrase.\n\nThe display alone also does not establish that a different wallet was derived. Possible causes include the passphrase, derivation path, account, network or incomplete synchronization. Compare previously known public wallet details, such as a used receiving address, locally with the correct recovery settings. No one can diagnose the actual cause from this description alone; do not share the recovery words or passphrase.',
  fr: 'Un affichage vide sans erreur ne prouve ni que la passphrase est correcte ni que les fonds initiaux ont disparu, ont été volés ou déplacés. Toute passphrase BIP39, même vide, dérive une seed et des clés privées valides. Une autre passphrase peut produire un autre portefeuille valide sans erreur de mot de passe ; l’ouverture ne valide pas la passphrase recherchée.\n\nL’affichage seul ne prouve pas non plus qu’un portefeuille différent a été dérivé. Les causes possibles comprennent la passphrase, le chemin de dérivation, le compte, le réseau ou une synchronisation incomplète. Compare localement des repères publics déjà connus, comme une adresse de réception utilisée, avec les bons paramètres de restauration. Cette description seule ne permet pas de diagnostiquer la cause ; ne partage ni mots de récupération ni passphrase.',
};
const reorg:Record<SupportedLanguage,string> = {
  en: 'Losing a confirmation in a reorganization does not itself prove theft or that the sender took the payment back. The block containing the transaction may have left the active chain when nodes switched to a valid branch with more cumulative proof of work; this is a change of branch, not a longer individual block.\n\nIf still valid, the transaction can return to an unconfirmed state, potentially enter a mempool and be included again, without a guarantee. A conflicting transaction spending the same input outpoint (transaction ID and output index) is also possible. Address receipts or balances alone do not prove that conflict. Check the actual transaction and its inputs; I cannot infer their current state from the lost confirmation alone.',
  fr: 'Perdre une confirmation lors d’une réorganisation ne prouve pas à lui seul un vol ni que l’expéditeur a repris le paiement. Le bloc contenant la transaction a pu quitter la chaîne active lorsque les nœuds ont retenu une branche valide avec davantage de travail cumulé. C’est un changement de branche, pas un bloc individuel plus long.\n\nSi elle reste valide, la transaction peut redevenir non confirmée, éventuellement revenir dans une mempool et être réincluse, sans garantie. Une transaction concurrente dépensant le même outpoint d’entrée (identifiant de transaction et indice de sortie) est aussi possible. Les réceptions ou soldes d’une adresse ne prouvent pas ce conflit. Vérifie la transaction et ses entrées : la confirmation perdue seule ne permet pas d’en déduire l’état actuel.',
};
const risk:Record<SupportedLanguage,string> = {
  en: 'Additional confirmations generally reduce reversal risk under the relevant network and attacker assumptions; no universal count makes it mathematically zero. A reorganization does not necessarily require majority hash power. An acceptance threshold is a risk decision influenced by the value at stake and the threat assumptions, not a universal guarantee. No precise reversal probability or safe threshold follows from the count alone.',
  fr: 'Des confirmations supplémentaires réduisent généralement le risque de retour en arrière selon les hypothèses sur le réseau et l’attaquant ; aucun nombre universel ne le rend mathématiquement nul. Une réorganisation n’exige pas nécessairement une majorité de puissance de calcul. Le seuil d’acceptation relève d’une décision de risque tenant compte de la valeur en jeu et des menaces envisagées, pas d’une garantie universelle. Le compteur seul ne donne ni probabilité précise ni seuil sûr.',
};

/** Existing reviewed recovery/finality concepts only, with an exact current
 * source. Context may come from the immediately preceding USER topic, never
 * from assistant claims, older subjects or selected personal memory.
 * https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
 * https://developer.bitcoin.org/devguide/block_chain.html */
export function groundedRecoveryConfirmations(
  question:string, language:SupportedLanguage, context:string, history:Message[] = [],
):string|null {
  const q=fold(question);
  if (q.length>650 || q.includes('\n') || (q.match(/\?/g)?.length??0)>1 || !/[?]|\b(?:explain|explique\w*|why|pourquoi|what|comment)\b/.test(q)) return null;
  if (/\b(?:lightning|ark|coinjoin|ethereum|solana|monero|bank|banque|bancair\w*|email|courriel|booking|reservation|medical|prun\w*|elagu\w*|stockage|storage|coinbase|subsid\w*|subvention\w*|rbf|cpfp)\b/.test(q)) return null;
  if (/\b(?:code|python|javascript|api|script|pbkdf\w*|sha\w*|hmac|salt|sel cryptographique|entropy|entropie|unicode|nfkd|translate|tradu\w*|poem\w*|poeme|bullets?|puces?|one sentence|en une phrase|une seule phrase|tableau|diagram\w*|compare\w*|compar\w*|versus|calculate|calcul\w*|probability of|probabilite de)\b/.test(q)) return null;
  if (/\b(?:ignore|instead|plutot|autre sujet|another topic|different topic|changeons|not about|pas sur|ne parle pas)\b/.test(q)) return null;
  if (/\b(?:[0-9]+|two|three|deux|trois)\s+(?:sentences?|phrases?|paragraphs?|paragraphes?)\b|\b(?:in|en)\s+[0-9]+\s+(?:words|mots)\b/.test(q)) return null;
  if (/\b(?:and|also|et|aussi)\s+(?:explain|explique\w*|show|montre|calculate|calcul\w*|send|envoi\w*|reset|reinitial\w*)\b/.test(q)) return null;
  if (/^(?:send|envoie|sign|signe|broadcast|diffuse|restore|restaure|recover|recupere|open|ouvre|check|verifie|inspect|regarde)\b/.test(q)
    || /\b(?:can you|could you|peux.tu|pourrais.tu)\s+(?:restore|recover|open|check|inspect|send|restaur\w*|recuper\w*|ouvrir|verifi\w*|envoy\w*)\b/.test(q)) return null;
  const users=history.filter(m=>m.role==='user');
  if (users.at(-1)?.content===question) users.pop();
  const previous=fold(users.at(-1)?.content??'');
  const prior=subject(previous);
  const current=subject(q);
  if (bip39(q) && confirmations(q)) return null;
  const passphraseReference=/\b(?:passphrase|variante|variant|guess\w*|essaye\w*)\b/.test(q);
  const confirmationReference=/^(?:and|so|then|et|donc|alors)\b/.test(q) && /\b(?:confirm\w*|risqu\w*|risk|zero|nul|irreversib\w*|finalit\w*)\b/.test(q);
  const topic=current ?? (prior==='bip39' && passphraseReference ? prior : prior==='confirmations' && confirmationReference ? prior : null);
  const titles=context.split('\n').filter(line=>line.startsWith('Topic: ')).map(line=>fold(line.slice(7)));
  if (topic==='bip39') {
    if (!titles.some(t=>['la passphrase optionnelle','the optional passphrase'].includes(t))) return null;
    if (/\b(?:never (?:set|added|used)|did not (?:set|add|use)|didn't (?:set|add|use)|jamais (?:defini|ajoute|utilise))\b/.test(q)) return null;
    if (/\b(?:confirm\w*|reorg\w*|mining|minage|fee\w*|frais)\b/.test(q)) return null;
    const isEmpty=/\b(?:empty|vide|zero|nul|0)\b/.test(q) && /\b(?:wallet|portefeuille|balance|solde|display|affich\w*|error|erreur|passphrase)\b/.test(q);
    const isRecovery=/\b(?:forgot\w*|oubli\w*|lost|perdu\w*|recover\w*|recuper\w*|restor\w*|restaur\w*|suffi\w*|enough|reset|reinitial\w*|pin|password|mot de passe)\b/.test(q);
    if (isEmpty && isRecovery && /\b(?:and|also|et|aussi)\b/.test(q)) return null;
    return isEmpty ? empty[language] : isRecovery ? recovery[language] : null;
  }
  if (topic==='confirmations') {
    if (!titles.some(t=>['les confirmations','confirmations'].includes(t))) return null;
    if (/\b(?:passphrase|seed|mnemonic|wallet backup|sauvegarde|fee\w*|frais|hashrate|hash power|puissance de calcul)\b/.test(q)) return null;
    const isRisk=/\b(?:risk|risqu\w*|zero|nul|impossible|guarantee\w*|garanti\w*|finalit\w*|irreversib\w*|safe|sur|seuil|threshold)\b/.test(q);
    const isReorg=/\b(?:reorg\w*|reorganis\w*|reorganiz\w*|lost|perdu\w*|disappear\w*|disparu\w*|repris|refund\w*|rembours\w*|stolen|vol\w*|back)\b/.test(q);
    const count=q.match(/\b([0-9]+|six)\s+confirmations?\b/);
    if (!isRisk && !isReorg && !count) return null;
    const n=count ? count[1]==='six'?6:Number(count[1]) : null;
    if (n!==null && (n<1 || n>1000000) && !isReorg) return null;
    const counted=n===1 ? (language==='fr' ? 'Le bloc contenant la transaction est la confirmation 1.' : 'The block containing the transaction is confirmation 1.')
      : n!==null && n>=1 && n<=1000000 ? (language==='fr'
      ? `Le bloc contenant la transaction est la confirmation 1. ${n} confirmations comptent ce bloc puis ${n-1} ${n===2?'bloc construit':'blocs construits'} après lui ; la transaction n’est pas répétée dans ${n===2?'ce bloc suivant':'ces blocs suivants'}.`
      : `The block containing the transaction is confirmation 1. ${n} confirmations count that block plus ${n-1} ${n===2?'block':'blocks'} built after it; the transaction is not repeated in ${n===2?'that subsequent block':'those subsequent blocks'}.`) : '';
    return [isReorg ? reorg[language] : null, counted || null, isRisk ? risk[language] : null].filter(Boolean).join('\n\n') || null;
  }
  return null;
}
