import type { Locale } from '@/i18n/config';
import type { Rich } from '@/i18n/rich';

// The privacy page. Every sentence here is a claim about what Alice does:
// a translation must say exactly what the English says, no more, no less.

export type PrivacyCopy = {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  intro: Rich;
  inAppTitle: string;
  inApp: { title: string; detail: Rich }[];
  siteTitle: string;
  wedont: string[];
  analyticsTitle: string;
  analytics: string;
};

const link = (href: string, text: string) => ({ href, text });

const en: PrivacyCopy = {
  meta: {
    title: 'Privacy',
    description:
      'How Alice protects you: questions encrypted end-to-end, keys that never leave your device, no email stored in clear, no durable IP record, and a site with no cookies or trackers.',
  },
  eyebrow: 'Privacy',
  title: 'Alice doesn’t track you.',
  intro: [
    'Not in the app, and not on this site. Here is what that means concretely, and every claim below links back to ',
    link('/trust/', 'how we verify it'),
    '.',
  ],
  inAppTitle: 'How Alice protects you in the app',
  inApp: [
    {
      title: 'Your questions',
      detail: [
        'Encrypted on your device before they leave, readable only inside the confidential hardware that answers them: no one in between, including us, can read them. Before every message, Alice checks that this hardware is genuine and up to date. Which exact software runs inside it cannot be verified yet, because the provider has not published its reference values, and the ',
        link('/trust/#status', 'trust page'),
        ' tracks that limit. In Local mode, the installed app runs the model on your device. Downloads, Explorer and other network features still make network requests.',
      ],
    },
    {
      title: 'Your keys',
      detail: [
        'Generated on your device, stored on your device. No server of ours ever sees a recovery phrase or a private key, and the AI has no path to them by construction.',
      ],
    },
    {
      title: 'Your email',
      detail: [
        'An account is optional. When you create one, Alice keeps your address encrypted, so she can warn you before a paid plan runs out and, a few times a year, tell you what Alice can now do. Nothing else: no marketing, no partners. The encryption protects the address if the database or a backup leaks. It does not hide it from our server, which decrypts it to send, so an alias works perfectly well. Signing in uses a one-way fingerprint, and the app only shows a masked label like sat****@bitcoin.com.',
      ],
    },
    {
      title: 'Your Private Cloud usage',
      detail: [
        'To count your free questions and your plan, each Private Cloud request is recorded against your account, or against an anonymous installation if you have none: when it happened and, on a plan, how many encrypted bytes it carried, never what it said. These records last as long as the account does.',
      ],
    },
    {
      title: 'Your IP address',
      detail: [
        'Hashed together with the day, using a server-side secret, so the result changes daily, is used only for rate limiting, and cannot be reversed back to your address. There is no durable IP record anywhere. That covers our side; every site and network you reach still sees the address itself, so we recommend a VPN, which is the only thing that hides it from everyone else.',
      ],
    },
    {
      title: 'What Alice remembers about you',
      detail: [
        'The memory that personalizes her answers is stored on your device and rests encrypted there: with the phone’s secure storage, with a key the desktop app keeps in your system keychain, or, on the web, with a key your browser keeps and never hands out. The same goes for your conversations, your Explorer tabs and saved wallets, and your Playground wallet. “What Alice remembers” lets you inspect and erase the memory anytime. When you use Private Cloud, the relevant memory travels inside the same end-to-end encrypted envelope as your messages, addressed to the attested enclave. The hardware is checked, but the exact program inside cannot be verified yet, pending Venice’s reference values. The ',
        link('/memory/', 'memory page'),
        ' explains what is kept, what the code refuses, and how to erase it.',
      ],
    },
    {
      title: 'Product analytics',
      detail: [
        'Day-level aggregate counters only: an event, a platform, a version. No user id, no session id, no timeline. An individual profile cannot be reconstructed from what we store, even in principle.',
      ],
    },
  ],
  siteTitle: 'What this site does not do',
  wedont: [
    'No cookies, none, not even “functional” ones.',
    'No ad trackers, pixels, or fingerprinting.',
    'No selling or sharing of personal data.',
    'No account, email, or login needed to browse.',
    'No cross-site tracking or third-party profiles.',
  ],
  analyticsTitle: 'On this site’s analytics',
  analytics:
    'This site counts page views with Cloudflare Web Analytics. It sets no cookie, writes nothing to your browser’s storage, and builds no fingerprint, so nothing follows you between sessions or across sites. It tells us which pages get read, from which country, and nothing that identifies you. The app itself is a separate matter, described above.',
};

const fr: PrivacyCopy = {
  meta: {
    title: 'Confidentialité',
    description:
      'Comment Alice vous protège : questions chiffrées de bout en bout, clés qui ne quittent jamais votre appareil, aucun e-mail stocké en clair, aucune trace durable de l’adresse IP, et un site sans cookies ni traceurs.',
  },
  eyebrow: 'Confidentialité',
  title: 'Alice ne vous piste pas.',
  intro: [
    'Ni dans l’app, ni sur ce site. Voici ce que cela veut dire concrètement, et chaque affirmation ci-dessous renvoie à ',
    link('/trust/', 'la façon dont nous la vérifions'),
    '.',
  ],
  inAppTitle: 'Comment Alice vous protège dans l’app',
  inApp: [
    {
      title: 'Vos questions',
      detail: [
        'Chiffrées sur votre appareil avant de partir, lisibles uniquement à l’intérieur du matériel confidentiel qui y répond : personne entre les deux, nous compris, ne peut les lire. Avant chaque message, Alice vérifie que ce matériel est authentique et à jour. Le logiciel exact qui tourne à l’intérieur ne peut pas encore être vérifié, parce que le fournisseur n’a pas publié ses valeurs de référence, et la ',
        link('/trust/#status', 'page Confiance'),
        ' suit cette limite. En mode Local, l’app installée fait tourner le modèle sur votre appareil. Les téléchargements, l’Explorer et les autres fonctions réseau font toujours des requêtes réseau.',
      ],
    },
    {
      title: 'Vos clés',
      detail: [
        'Générées sur votre appareil, stockées sur votre appareil. Aucun de nos serveurs ne voit jamais une phrase de récupération (seed phrase) ni une clé privée, et l’IA n’a, par construction, aucun moyen d’y accéder.',
      ],
    },
    {
      title: 'Votre e-mail',
      detail: [
        'Un compte est facultatif. Si vous en créez un, Alice conserve votre adresse chiffrée, pour vous prévenir avant la fin d’un forfait payant et, quelques fois par an, vous dire ce qu’Alice sait désormais faire. Rien d’autre : pas de marketing, pas de partenaires. Le chiffrement protège l’adresse en cas de fuite de la base de données ou d’une sauvegarde. Il ne la cache pas à notre serveur, qui la déchiffre pour envoyer les messages : un alias fonctionne donc parfaitement. La connexion utilise une empreinte à sens unique, et l’app n’affiche qu’un libellé masqué comme sat****@bitcoin.com.',
      ],
    },
    {
      title: 'Votre usage de Private Cloud',
      detail: [
        'Pour compter vos questions gratuites et votre forfait, chaque requête Private Cloud est enregistrée sur votre compte, ou sur une installation anonyme si vous n’en avez pas : quand elle a eu lieu et, avec un forfait, combien d’octets chiffrés elle transportait, jamais ce qu’elle disait. Ces enregistrements durent aussi longtemps que le compte.',
      ],
    },
    {
      title: 'Votre adresse IP',
      detail: [
        'Hachée avec le jour, à l’aide d’un secret côté serveur : le résultat change chaque jour, ne sert qu’à limiter le nombre de requêtes et ne permet pas de remonter à votre adresse. Il n’existe nulle part de trace durable de l’adresse IP. Cela vaut pour notre côté ; chaque site et chaque réseau que vous joignez voit toujours l’adresse elle-même : nous recommandons donc un VPN, le seul moyen de la cacher à tous les autres.',
      ],
    },
    {
      title: 'Ce qu’Alice retient de vous',
      detail: [
        'La mémoire qui personnalise ses réponses est stockée sur votre appareil et y repose chiffrée : avec le stockage sécurisé du téléphone, avec une clé que l’app de bureau garde dans le trousseau de votre système ou, sur le web, avec une clé que votre navigateur garde et ne livre jamais. Il en va de même pour vos conversations, vos onglets et portefeuilles enregistrés de l’Explorer, et votre portefeuille Playground. « Ce qu’Alice retient » vous permet d’inspecter et d’effacer la mémoire à tout moment. Quand vous utilisez Private Cloud, la mémoire pertinente voyage dans la même enveloppe chiffrée de bout en bout que vos messages, adressée à l’enclave attestée. Le matériel est vérifié, mais le programme exact qui tourne à l’intérieur ne peut pas encore être vérifié, en attendant les valeurs de référence de Venice. La ',
        link('/memory/', 'page Mémoire'),
        ' explique ce qui est conservé, ce que le code refuse et comment l’effacer.',
      ],
    },
    {
      title: 'Statistiques du produit',
      detail: [
        'Uniquement des compteurs agrégés à la journée : un événement, une plateforme, une version. Pas d’identifiant d’utilisateur, pas d’identifiant de session, pas de chronologie. Un profil individuel ne peut pas être reconstitué à partir de ce que nous stockons, même en principe.',
      ],
    },
  ],
  siteTitle: 'Ce que ce site ne fait pas',
  wedont: [
    'Aucun cookie, pas un seul, pas même des cookies « fonctionnels ».',
    'Aucun traceur publicitaire, pixel ou empreinte numérique.',
    'Aucune vente ni aucun partage de données personnelles.',
    'Aucun compte, e-mail ou identifiant nécessaire pour naviguer.',
    'Aucun pistage entre sites ni profil tiers.',
  ],
  analyticsTitle: 'À propos des statistiques de ce site',
  analytics:
    'Ce site compte les pages vues avec Cloudflare Web Analytics. Il ne dépose aucun cookie, n’écrit rien dans le stockage de votre navigateur et ne crée aucune empreinte : rien ne vous suit d’une session à l’autre ni d’un site à l’autre. Il nous indique quelles pages sont lues, depuis quel pays, et rien qui vous identifie. L’app elle-même est une autre affaire, décrite plus haut.',
};

export const privacyCopy: Record<Locale, PrivacyCopy> = { en, fr };
