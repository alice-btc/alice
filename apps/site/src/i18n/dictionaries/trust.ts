import type { Locale } from '@/i18n/config';
import type { Rich } from '@/i18n/rich';

// The trust page. Every row is a claim about what is implemented, verified
// or still missing: a translation must keep each status exactly as strong
// or as weak as the English one.

export type TrustCopy = {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  intro: Rich;
  notice: Rich;
  privateTitle: string;
  privateBody: Rich;
  partiesTitle: string;
  parties: [string, string][];
  failTitle: string;
  failLead: string;
  refusals: string[];
  failAfter: string;
  statusTitle: string;
  statusLead: string;
  statusRows: [string, string][];
  statusAfter: Rich;
  limitsTitle: string;
  limits: string[];
  sourceBefore: string;
  sourceLink: string;
  sourceAfter: string;
};

const VENICE_DOCS = 'https://docs.venice.ai/guides/features/tee-e2ee-models';

const en: TrustCopy = {
  meta: {
    title: 'Trust & verification',
    description:
      'How Alice keeps your Private Cloud chats end-to-end encrypted, the flow, what each party can see, the fail-closed policy, and an honest status of what is verified and what is not yet.',
  },
  eyebrow: 'Trust',
  title: 'Don’t trust. Verify.',
  intro: [
    'Alice’s Private Cloud runs on ',
    { href: VENICE_DOCS, text: 'Venice' },
    '’s confidential-compute infrastructure: your messages are encrypted on your device and only decrypted inside confidential hardware that the app tries to verify. Here’s exactly what happens, what each party can see, and, honestly, what’s proven today and what isn’t yet.',
  ],
  notice: [
    'Today the reachable assurance level is ',
    { strong: 'attested-unpinned' },
    '. We deliberately do ',
    { strong: 'not' },
    ' display “E2EE verified”, see the ',
    { href: '#status', text: 'status' },
    ' below for why.',
  ],
  privateTitle: 'What “private” means',
  privateBody: [
    'Your message is encrypted on your device before it leaves. It travels as ciphertext through Alice’s proxy and Venice’s infrastructure, and is only decrypted inside a hardware enclave (Intel TDX) that Alice tries to verify. The reply comes back encrypted and is decrypted on your device. Prefer nothing to leave at all? Run Alice fully ',
    { strong: 'Local' },
    '.',
  ],
  partiesTitle: 'What each party can see',
  parties: [
    [
      'Leaves your device',
      'The model id, ordinary network metadata (IP, timing, sizes), and your prompts and replies, only as ciphertext.',
    ],
    [
      'Alice’s proxy (Cloudflare)',
      'Ciphertext, the model id, sizes and timing, and the Venice key it attaches. It cannot decrypt, it holds no key of yours, and never logs message bodies.',
    ],
    ['Venice, outside the enclave', 'Ciphertext and metadata, never your plaintext.'],
    ['Phala / PCCS', 'Only the public attestation collateral (certificates, TCB info). No prompt, no reply.'],
    [
      'The enclave (Intel TDX)',
      'The plaintext, the one place decryption happens. Attestation is our evidence about what runs there.',
    ],
  ],
  failTitle: 'Fail-closed, no silent fallback',
  failLead:
    'For Private Cloud, every one of these is a refusal, never a fallback to a non-encrypted model:',
  refusals: [
    'missing attestation',
    'DCAP unavailable',
    'PCCS unavailable',
    'refused TCB status',
    'wrong or replayed nonce',
    'key not bound',
    'debug enabled',
    'unknown measurement',
    'GPU attestation required but unverified',
    'decryption or authentication failure',
    'unexpected plaintext chunk',
  ],
  failAfter:
    'You see a clear message, “Private Cloud verification failed. No message was sent.” Local and Custom AI keep working.',
  statusTitle: 'Status, what’s verified, what isn’t',
  statusLead: 'We won’t claim more than we can prove. This is the honest state today.',
  statusRows: [
    ['Encryption (AES-256-GCM · ECDH · HKDF)', 'Implemented + verified, round-trips against production'],
    ['Streaming decrypt, fail-closed, no plaintext shown', 'Implemented + verified'],
    ['Fresh nonce per send · anti-replay', 'Implemented + verified'],
    ['DCAP quote verification (signature + TCB)', 'Implemented, a live attestation returned “UpToDate”'],
    ['Strict TCB policy + debug-mode rejection', 'Implemented + verified'],
    ['Key ↔ attestation binding', 'Implemented + verified; deployed version awaits Venice confirmation'],
    ['Measurement pinning mechanism', 'Implemented + verified'],
    ['Measurement reference values', 'Externally blocked, needs Venice / dstack governance data'],
    ['NVIDIA GPU attestation', 'Pending, not implemented; fails closed when required'],
  ],
  statusAfter: [
    'Not ready to display “E2EE verified”: measurement pinning isn’t active (no reference values yet) and GPU attestation is unimplemented, so the reachable assurance is ',
    { strong: 'attested-unpinned' },
    '.',
  ],
  limitsTitle: 'Limits and remaining assumptions',
  limits: [
    'Measurement reference values aren’t available yet, so pinning isn’t active.',
    'NVIDIA GPU attestation is not verified.',
    'DCAP verification reduces, but doesn’t remove, trust in Phala’s availability and Intel’s / NVIDIA’s roots.',
    'We’ve reached out to Venice for the measurement reference values and the attestation-binding confirmation above, and are waiting on their reply.',
  ],
  sourceBefore:
    'The source code is public under the AGPL, so anyone can check these claims independently: ',
  sourceLink: 'read the code',
  sourceAfter: '.',
};

const fr: TrustCopy = {
  meta: {
    title: 'Confiance et vérification',
    description:
      'Comment Alice garde vos conversations Private Cloud chiffrées de bout en bout : le parcours, ce que chaque partie peut voir, la politique d’échec fermé, et un état honnête de ce qui est vérifié et de ce qui ne l’est pas encore.',
  },
  eyebrow: 'Confiance',
  title: 'Ne faites pas confiance. Vérifiez.',
  intro: [
    'Le Private Cloud d’Alice fonctionne sur l’infrastructure de calcul confidentiel de ',
    { href: VENICE_DOCS, text: 'Venice' },
    ' : vos messages sont chiffrés sur votre appareil et ne sont déchiffrés qu’à l’intérieur d’un matériel confidentiel que l’app essaie de vérifier. Voici exactement ce qui se passe, ce que chaque partie peut voir et, honnêtement, ce qui est prouvé aujourd’hui et ce qui ne l’est pas encore.',
  ],
  notice: [
    'Aujourd’hui, le niveau d’assurance atteignable est ',
    { strong: 'attested-unpinned' },
    '. Nous n’affichons délibérément ',
    { strong: 'pas' },
    ' « E2EE vérifié » : la section ',
    { href: '#status', text: 'État' },
    ' plus bas explique pourquoi.',
  ],
  privateTitle: 'Ce que « privé » veut dire',
  privateBody: [
    'Votre message est chiffré sur votre appareil avant de partir. Il transite sous forme chiffrée par le proxy d’Alice et l’infrastructure de Venice, et n’est déchiffré qu’à l’intérieur d’une enclave matérielle (Intel TDX) qu’Alice essaie de vérifier. La réponse revient chiffrée et est déchiffrée sur votre appareil. Vous préférez que rien ne sorte ? Faites fonctionner Alice entièrement en ',
    { strong: 'Local' },
    '.',
  ],
  partiesTitle: 'Ce que chaque partie peut voir',
  parties: [
    [
      'Ce qui quitte votre appareil',
      'L’identifiant du modèle, les métadonnées réseau ordinaires (IP, minutage, tailles), et vos prompts et réponses, uniquement sous forme chiffrée.',
    ],
    [
      'Le proxy d’Alice (Cloudflare)',
      'Le contenu chiffré, l’identifiant du modèle, les tailles et le minutage, et la clé Venice qu’il ajoute. Il ne peut pas déchiffrer, il ne détient aucune de vos clés, et n’enregistre jamais le corps des messages.',
    ],
    ['Venice, hors de l’enclave', 'Le contenu chiffré et les métadonnées, jamais votre texte en clair.'],
    ['Phala / PCCS', 'Uniquement les éléments publics d’attestation (certificats, informations TCB). Aucun prompt, aucune réponse.'],
    [
      'L’enclave (Intel TDX)',
      'Le texte en clair, le seul endroit où le déchiffrement a lieu. L’attestation est notre élément de preuve sur ce qui y tourne.',
    ],
  ],
  failTitle: 'Échec fermé, aucun repli silencieux',
  failLead:
    'Pour Private Cloud, chacun de ces cas est un refus, jamais un repli vers un modèle non chiffré :',
  refusals: [
    'attestation absente',
    'DCAP indisponible',
    'PCCS indisponible',
    'statut TCB refusé',
    'nonce erroné ou rejoué',
    'clé non liée',
    'mode debug activé',
    'mesure inconnue',
    'attestation GPU exigée mais non vérifiée',
    'échec du déchiffrement ou de l’authentification',
    'fragment de texte en clair inattendu',
  ],
  failAfter:
    'Vous voyez un message clair, « La vérification de Private Cloud a échoué. Aucun message n’a été envoyé. » Local et l’IA personnalisée continuent de fonctionner.',
  statusTitle: 'État : ce qui est vérifié, ce qui ne l’est pas',
  statusLead: 'Nous n’affirmerons pas plus que ce que nous pouvons prouver. Voici l’état honnête aujourd’hui.',
  statusRows: [
    ['Chiffrement (AES-256-GCM · ECDH · HKDF)', 'Implémenté + vérifié, par des allers-retours avec la production'],
    ['Déchiffrement en flux, échec fermé, aucun texte en clair affiché', 'Implémenté + vérifié'],
    ['Nonce neuf à chaque envoi · anti-rejeu', 'Implémenté + vérifié'],
    ['Vérification de la quote DCAP (signature + TCB)', 'Implémenté, une attestation réelle a renvoyé « UpToDate »'],
    ['Politique TCB stricte + rejet du mode debug', 'Implémenté + vérifié'],
    ['Liaison clé ↔ attestation', 'Implémenté + vérifié ; la version déployée attend la confirmation de Venice'],
    ['Mécanisme d’épinglage des mesures', 'Implémenté + vérifié'],
    ['Valeurs de référence des mesures', 'Bloqué de l’extérieur, nécessite des données de gouvernance de Venice / dstack'],
    ['Attestation GPU NVIDIA', 'En attente, non implémenté ; échec fermé quand elle est exigée'],
  ],
  statusAfter: [
    'Pas prêt à afficher « E2EE vérifié » : l’épinglage des mesures n’est pas actif (pas encore de valeurs de référence) et l’attestation GPU n’est pas implémentée ; l’assurance atteignable est donc ',
    { strong: 'attested-unpinned' },
    '.',
  ],
  limitsTitle: 'Limites et hypothèses restantes',
  limits: [
    'Les valeurs de référence des mesures ne sont pas encore disponibles : l’épinglage n’est donc pas actif.',
    'L’attestation GPU NVIDIA n’est pas vérifiée.',
    'La vérification DCAP réduit, sans la supprimer, la confiance accordée à la disponibilité de Phala et aux racines d’Intel et de NVIDIA.',
    'Nous avons contacté Venice pour obtenir les valeurs de référence des mesures et la confirmation de liaison d’attestation mentionnée plus haut, et nous attendons leur réponse.',
  ],
  sourceBefore:
    'Le code source est public sous licence AGPL, ce qui permet à chacun de vérifier ces affirmations de façon indépendante : ',
  sourceLink: 'lire le code',
  sourceAfter: '.',
};

export const trustCopy: Record<Locale, TrustCopy> = { en, fr };
