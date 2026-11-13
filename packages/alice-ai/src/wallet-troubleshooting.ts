import type { SupportedLanguage } from './languages.ts';

export type WalletTroubleshootingReason = 'ambiguous-reset' | 'watch-only-app-password' | 'seed-digital-backup' | 'confirmed-rbf-reversal';

function asksAboutDigitalSecretBackup(text: string): boolean {
  // Bind the proposed medium, secret and suitability question to the same
  // sentence, so a separate public-address backup does not inherit a seed.
  return text.split(/(?<=[.!?;])\s+/).some(sentence => {
    const secretMatch = /\b(?:recovery (?:phrase|words)|seed (?:phrase|words)|private keys?|phrase de recuperation|mots de recuperation|cles? privees?)\b/.exec(sentence);
    const secret = secretMatch && !/\b(?:not|without|instead of|rather than|pas|sans|plutot que)\s+(?:(?:my|the|ma|mon|mes|la|les)\s+)?$/.test(sentence.slice(0, secretMatch.index));
    const digitalMatch = /\b(?:photos?|photograph\w*|pictures?|screenshots?|cloud|digital|numerique|captures? d'ecran|password manager|gestionnaire de mots de passe)\b/.exec(sentence);
    // "If I never take a photo of it" rules the medium out instead of proposing it.
    const digital = digitalMatch && !/\b(?:never|jamais|no|aucune?)\b[^.!?;]{0,25}$/.test(sentence.slice(0, digitalMatch.index));
    const suitability = /\b(?:is|are|would|est[- ]ce|est[- ]il|serait[- ]il|est[- ]elle)\b[^.!?;]*\b(?:safe|secure|okay|ok|good|sensible|reasonable|safely|bonne?\w*|sur(?! (?:le|la|les|l'|un|une|mon|ma|mes|ce|cette|des|du|internet|icloud|google)\b)|sure|prudent\w*|securis\w*|fiable)\b/.test(sentence)
      || /\b(?:should i|can i|could i|puis[- ]je|dois[- ]je|devrais[- ]je|peut[- ]on)\b[^.!?;]*\b(?:keep|store|save|back up|take|photograph|garder|stocker|sauvegarder|enregistrer|prendre|photographier)\b/.test(sentence);
    return secret && digital && suitability;
  });
}

function asksToReverseOwnConfirmedPayment(text: string): boolean {
  if (!/\b(?:rbf|replace[- ]by[- ]fee)\b/.test(text)) return false;
  if (/\b(?:if|suppose|imagine|hypothetically|si|supposons|imaginons|unconfirmed|non confirmee?|not (?:yet )?confirmed|pas (?:encore )?confirmee?|(?:zero|no|0|aucune) confirmations?)\b/.test(text)) return false;
  const ownPayment = /\b(?:my (?:bitcoin )?(?:payment|transaction)|i (?:sent|paid)|mon paiement|ma transaction|j'ai (?:envoye|paye))\b/.test(text);
  const confirmed = /\b(?:my|the|this|mon|ma|la|le|cette|ce) (?:bitcoin )?(?:payment|transaction|paiement)\b[^.!?;]{0,70}\b(?:is (?:already )?confirmed|has (?:already )?(?:(?:[1-9]\d*|one|two|three|six|several) )confirmations?|already has (?:(?:[1-9]\d*|one|two|three|six|several) )confirmations?|est (?:deja )?confirmee?|a (?:deja )?(?:(?:[1-9]\d*|une|deux|trois|six|plusieurs) )confirmations?)\b/.test(text);
  const reversalRequest = /\b(?:can i|could i|how (?:can|do) i|can you|puis[- ]je|pourrais[- ]je|comment (?:puis[- ]je|faire)|peux[- ]tu)\b[^.!?;]*\b(?:cancel|replace|reverse|refund|get (?:the |my )?money back|annuler|remplacer|inverser|rembourser|recuperer)\b/.test(text);
  return ownPayment && confirmed && reversalRequest;
}

/** Narrow current-message clarification, not a diagnosis or a repair tool. */
export function walletTroubleshootingReason(message: string): WalletTroubleshootingReason | null {
  const text = message.replace(/"[^"\n]*"|«[^»\n]*»|“[^”\n]*”/g, ' ')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'").toLowerCase();
  if (asksAboutDigitalSecretBackup(text)) return 'seed-digital-backup';
  if (asksToReverseOwnConfirmedPayment(text)) return 'confirmed-rbf-reversal';
  const wallet = /\b(?:bitcoin|wallet|portefeuille)\b/.test(text);
  if (!wallet) return null;
  const referents = [
    /\b(?:app(?:lication)?|appli)\b/,
    /\b(?:phone|telephone|smartphone)\b/,
    /\b(?:hardware wallet|portefeuille materiel)\b/,
    /\b(?:password|mot de passe|pin|passphrase)\b/,
    /\b(?:backup|sauvegarde)\b/,
  ].filter(pattern => pattern.test(text)).length;
  const resetQuestion = /\b(?:should i|do you (?:recommend|advise)|would you recommend)\b[^.!?;]{0,45}\breset(?:ting)?\s+(?:it|this|that)\b/.test(text)
    || /\b(?:tu me conseilles|conseilles[- ]tu|dois[- ]je|faut[- ]il|devrais[- ]je)\b[^.!?;]{0,45}(?:\b(?:le|la|les)\s+|\bl')reinitialis\w*/.test(text);
  if (referents >= 2 && resetQuestion) return 'ambiguous-reset';

  const watchOnly = /\b(?:watch[- ]only|read[- ]only|lecture seule)\b/.test(text)
    && !/\b(?:not (?:a |in )?|pas (?:en )?)(?:watch[- ]only|read[- ]only|lecture seule)\b/.test(text);
  const hardware = /\b(?:hardware wallet|portefeuille materiel)\b/.test(text);
  const localPassword = /\b(?:app(?:lication)?(?:'s)? (?:local )?password|password (?:of|for|in) (?:the|my) app(?:lication)?|mot de passe[^.!?;]{0,45}(?:de |de l'|celui de l')(?:application|appli))\b/.test(text);
  const personal = /\b(?:my|mon|ma|mes|je|i)\b|\bj'/.test(text);
  const asksForChecks = /\b(?:what (?:should i )?(?:check|verify)|what should i (?:look at|do)|que (?:dois[- ]je )?verifier|quoi verifier|que regarder|que dois[- ]je faire)\b/.test(text);
  if (watchOnly && hardware && localPassword && personal && asksForChecks) return 'watch-only-app-password';
  return null;
}

export function directWalletTroubleshootingResponse(reason: WalletTroubleshootingReason, language: SupportedLanguage): string {
  if (reason === 'seed-digital-backup') return language === 'fr'
    ? "Non, une photo ou une copie numérique de mots de récupération ou de clés privées n’est pas une bonne sauvegarde à conseiller ici. Le téléphone, la synchronisation et le compte cloud ajoutent des points d’exposition d’un secret qui peut donner le contrôle des fonds du portefeuille, y compris ceux qui y seraient ajoutés plus tard. La protection du portefeuille matériel ne protège pas une copie exposée de ce secret.\n\nPrivilégie une sauvegarde physique hors ligne : les mots écrits à la main sur papier ou un support métallique adapté, protégés contre l’accès non autorisé, la perte et les dégâts. Préserve aussi les éventuels paramètres ou secrets supplémentaires nécessaires à cette configuration. Pour vérifier la sauvegarde, suis la procédure compatible du fabricant, par exemple une vérification directement sur le dispositif si elle existe, sans effacer le portefeuille ni importer sa phrase dans un téléphone ou un ordinateur pour un simple test. Ne partage ni les mots, ni les clés, ni une photo ici."
    : "No, a photo or digital copy of recovery words or private keys is not a backup plan to recommend here. The phone, synchronization and cloud account add exposure points for a secret that can give control of the wallet’s funds, including funds added later. Hardware-wallet protection does not protect an exposed copy of that secret.\n\nPrefer a physical offline backup: words written by hand on paper or an appropriate metal backup, protected from unauthorized access, loss and damage. Preserve any additional settings or secrets required by that wallet setup too. To check the backup, follow the manufacturer’s compatible procedure, such as verification directly on the device if available, without wiping the wallet or importing its phrase into a phone or computer merely to test it. Do not share the words, keys or a photo here.";
  if (reason === 'confirmed-rbf-reversal') return language === 'fr'
    ? "Si ton paiement est déjà confirmé comme tu l’indiques, RBF ne permet pas de l’annuler ni de remplacer son destinataire : il concerne le remplacement de transactions non confirmées selon les règles du mempool. CPFP augmente les frais d’un ensemble parent-enfant pour favoriser sa confirmation ; il ne rembourse ni ne redirige un paiement confirmé.\n\nNi cette conversation ni Alice App ne peuvent annuler ce paiement. Si tu peux identifier le destinataire et qu’il contrôle les fonds, il peut accepter de les renvoyer dans une nouvelle transaction distincte ; ce retour n’est pas garanti. Cela ne signifie pas que toute confirmation est mathématiquement irréversible : une réorganisation est différente d’une fonction RBF ou CPFP que tu pourrais utiliser pour récupérer ce paiement."
    : "If your payment is already confirmed as you describe, RBF cannot cancel it or replace its recipient: it replaces unconfirmed transactions under mempool rules. CPFP raises the fees of a parent-and-child package to encourage confirmation; it does not refund or redirect a confirmed payment.\n\nNeither this chat nor Alice App can undo that payment. If you can identify the recipient and they control the funds, they may voluntarily send them back in a separate new transaction; a return is not guaranteed. This does not mean every confirmation is mathematically irreversible: a reorganization is different from an RBF or CPFP feature you could use to recover this payment.";
  if (reason === 'ambiguous-reset') return language === 'fr'
    ? "Quand tu dis « le réinitialiser », parles-tu du téléphone, de l’application ou du portefeuille matériel ? Quel mot de passe as-tu changé : celui de l’application, le PIN du matériel ou une passphrase BIP39 ? Et l’application est-elle en lecture seule, reliée au portefeuille matériel ? Avant de préciser ces points, ne réinitialise ni ne désinstalle rien et ne saisis pas la phrase de récupération du matériel dans l’application. Un solde qui ne s’affiche plus ne suffit pas à conclure que les clés ou les fonds ont changé."
    : "When you say reset it, do you mean the phone, the app, or the hardware wallet? Which password changed: the app password, the hardware PIN, or a BIP39 passphrase? Is the app watch-only and linked to the hardware wallet? Before clarifying these points, do not reset or uninstall anything or enter the hardware wallet’s recovery phrase into the app. A missing balance display alone does not establish that the keys or funds changed.";
  return language === 'fr'
    ? "Dans cette configuration en lecture seule, les clés privées restent dans le portefeuille matériel : l’application utilise des informations publiques pour afficher le solde, sans lire les clés privées. Le mot de passe local de l’application n’est pas une passphrase BIP39 ; le changer ne déplace pas les bitcoins et ne change pas, à lui seul, les clés du matériel.\n\nVérifie d’abord que le bon portefeuille et le bon compte sont sélectionnés, puis que le bon réseau et les informations publiques du portefeuille (par exemple un descripteur ou une clé publique étendue) correspondent à la configuration attendue. Vérifie ensuite la connexion de l’application à son serveur ou nœud et l’état de synchronisation ou d’affichage. Selon l’application, rétablir l’association peut se faire avec ces informations publiques, sans importer la phrase de récupération ni une clé privée. Il n’est pas nécessaire de les partager ici.\n\nNe réinitialise pas le matériel et n’envoie pas de paiement pour diagnostiquer cet affichage. Une liaison Bluetooth n’est pas une exigence générale pour consulter un portefeuille en lecture seule. Quelle application utilises-tu, et quel message affiche-t-elle ?"
    : "In this watch-only setup, the private keys stay in the hardware wallet: the app uses public wallet information to display the balance, without reading private keys. The app’s local password is not a BIP39 passphrase; changing it does not move bitcoin or, by itself, change the hardware wallet’s keys.\n\nFirst check that the correct wallet and account are selected, then that the network and public wallet information (such as a descriptor or extended public key) match the intended setup. Next check the app’s server or node connection and its synchronization or display status. Depending on the app, restoring the association can use that public information without importing a recovery phrase or private key. You do not need to share them here.\n\nDo not reset the hardware or send a payment to diagnose this display issue. Bluetooth is not a general requirement for viewing a watch-only wallet. Which app are you using, and what message does it display?";
}
