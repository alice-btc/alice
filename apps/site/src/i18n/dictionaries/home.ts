import type { Locale } from '@/i18n/config';
import { HERO_TITLE, SITE_TAGLINE } from '@/lib/site';

// The home page: hero and app tour, the sovereignty scroll, the mission, the
// FAQ, the ChatGPT teaser and the experimental wallet.

export type TourScreenCopy = { alt: string; eyebrow: string; title: string; body: string };

export type HomeCopy = {
  meta: { description: string };
  appSchemaDescription: string;
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    highlight: string;
  };
  verify: {
    title: string;
    lead: string;
    /** In the order of the claims in VerifyBlock. */
    claims: { claim: string; proof: string }[];
  };
  tour: {
    eyebrow: string;
    title: string;
    /** In the order chat, explorer, learn, playground. */
    screens: TourScreenCopy[];
    sidebar: { newChat: string; explorer: string; learn: string; playground: string };
    greeting: string;
    suggestions: string[];
    typedExamples: string[];
    placeholder: string;
    inputAria: string;
    modelAria: string;
    modelName: string;
    reasoning: string;
    opening: string;
    ask: string;
    explorer: {
      liveBlocks: string;
      blocks: { height: string; fee: string; tx: string; pending?: boolean }[];
      network: string;
      tab: string;
      flow: string;
      inputs: string;
      outputs: string;
    };
    learn: { code: string; title: string; body: string; progress: string };
    playground: {
      title: string;
      network: string;
      lead: string;
      balance: string;
      unit: string;
      refresh: string;
      send: string;
      receive: string;
      faucet: string;
    };
  };
  sovereignty: {
    srTitle: string;
    panelTitle: string;
    or: string;
    always: string;
    layers: { local: string; cloud: string; custody: string };
    steps: { eyebrow: string; title: string; body: string }[];
  };
  missions: {
    eyebrow: string;
    titleLines: [string, string];
    lead: string;
    body: string;
    /** In the order educate, guide, harden, verify. */
    tiles: { title: string; body: string }[];
  };
  faq: {
    title: string;
    items: { q: string; a: string; link?: { label: string; href: string } }[];
  };
  teaser: { title: string; body: string; cta: string };
  wallet: {
    label: string;
    title: string;
    intro: string;
    warning: string;
    mutinynet: string;
    mainnet: string;
    apk: string;
    /** {version} is replaced by the APK's Alice version. */
    apkNoteBefore: string;
    apkNoteLink: string;
    apkNoteAfter: string;
    source: string;
    imageAlt: string;
    caption: string;
  };
};

const en: HomeCopy = {
  meta: { description: SITE_TAGLINE },
  appSchemaDescription:
    'A private AI companion that helps you understand, hold, and use Bitcoin. Self-custody is built in; the AI explains and guides but never holds your keys.',
  hero: {
    eyebrow: 'Private AI · Open source',
    title: HERO_TITLE,
    body: 'Alice guides you all the way down the Bitcoin rabbit hole: she explains in plain words, walks you into self-custody, and answers every question locally on your device or end-to-end encrypted. ',
    highlight: 'And she can never touch your keys.',
  },
  verify: {
    title: 'Don’t trust. Verify.',
    lead: 'Every claim links to its proof, not a marketing promise.',
    claims: [
      { claim: 'Private Cloud is encrypted end-to-end to attested hardware', proof: 'what’s verified' },
      { claim: 'Run Local, and the model answers on your device', proof: 'how it works' },
      { claim: 'No tracking. No cookies.', proof: 'privacy' },
      { claim: 'Honest about what’s verified, and what isn’t', proof: 'status' },
      { claim: 'Open source, AGPL', proof: 'read the code' },
    ],
  },
  tour: {
    eyebrow: 'Inside the app',
    title: 'Take the tour without installing anything.',
    screens: [
      {
        alt: 'The updated Alice chat on a phone, with the rabbit beside its greeting and model controls below',
        eyebrow: 'Ask Alice',
        title: 'Chat with Alice',
        body: 'The companion at the heart of the app. Ask in plain words, get answers at your level: Alice remembers what you are learning, on your device, and picks the next step with you.',
      },
      {
        alt: 'The block explorer screen on a phone, with live blocks and famous transactions',
        eyebrow: 'Explorer',
        title: 'See the chain for yourself',
        body: 'Live blocks, fees, famous transactions, notorious addresses. Watch any address or xpub, and ask Alice to explain what you are looking at.',
      },
      {
        alt: 'The Learn screen on a phone, showing the Plan B Academy course catalogue',
        eyebrow: 'Learn',
        title: 'Courses that feed the conversation',
        body: 'The school inside the app: the full Plan B Academy catalogue, from first steps to cryptography. Finish a chapter and Alice knows, so her answers keep up with you.',
      },
      {
        alt: 'The Playground screen on a phone, a practice Bitcoin wallet on the Mutinynet test network',
        eyebrow: 'Playground',
        title: 'Practice with coins that cost nothing',
        body: 'A sandbox with real rules. A real Bitcoin wallet on Mutinynet, a test network with free coins: send, receive, back up, and make every mistake here instead of on mainnet.',
      },
    ],
    sidebar: { newChat: 'New Chat', explorer: 'Explorer', learn: 'Learn', playground: 'Playground' },
    greeting: 'Hi! What would you like to learn about today?',
    suggestions: [
      'What is Bitcoin?',
      'How do I secure my wallet?',
      'Explain Lightning Network',
      'What is self-custody?',
    ],
    typedExamples: [
      'What is self-custody?',
      'Is my AI chat private?',
      'How do I secure my Bitcoin?',
      'What is the Ark protocol?',
    ],
    placeholder: 'Ask Alice something...',
    inputAria: 'Ask Alice a question',
    modelAria: 'Model: Private. Reasoning: Medium.',
    modelName: 'Private',
    reasoning: 'Medium',
    opening: 'Opening Alice',
    ask: 'Ask Alice',
    explorer: {
      liveBlocks: 'Live blocks',
      blocks: [
        { height: 'Next block', fee: '~2 sat/vB', tx: '4,338 tx', pending: true },
        { height: '963,313', fee: '~3 sat/vB', tx: '3,300 tx' },
        { height: '963,312', fee: '~1 sat/vB', tx: '5,029 tx' },
        { height: '963,311', fee: '~1 sat/vB', tx: '5,319 tx' },
      ],
      network: 'Bitcoin',
      tab: 'Transaction',
      flow: 'Transaction flow',
      inputs: '2 inputs · 0.50 BTC',
      outputs: '3 outputs',
    },
    learn: {
      code: 'BTC101',
      title: 'The Bitcoin Journey',
      body: 'Money has changed shape many times: shells, gold, paper, plastic. Bitcoin is the next step, the first money that lives on the internet and belongs to no company and no state. In this course you will follow its whole journey, from why it was invented to how you hold it yourself.',
      progress: 'Chapter 1 of 25 · 7h',
    },
    playground: {
      title: 'Playground',
      network: 'Mutinynet',
      lead: 'Learn by experimenting. These sats have no real value.',
      balance: '21,000',
      unit: 'test sats',
      refresh: 'Refresh',
      send: 'Send',
      receive: 'Receive',
      faucet: 'Free sats',
    },
  },
  sovereignty: {
    srTitle: 'How Alice runs, Local or Private Cloud, and how your Bitcoin stays self-custody',
    panelTitle: 'How Alice runs, you choose',
    or: 'or',
    always: 'Your Bitcoin, always',
    layers: {
      local: 'Local, on your device',
      cloud: 'Private Cloud, encrypted',
      custody: 'Self-custody, your keys',
    },
    steps: [
      {
        eyebrow: 'Option 1 · On your device',
        title: 'Local runs on your device',
        body: 'Local runs the model on your own device in the installed app; the web app has no local inference. Custom AI is different: it points Alice at your own server through its API, so questions travel to that server. Downloads and other network features still use the network.',
      },
      {
        eyebrow: 'Option 2 · When you need power',
        title: 'Private Cloud, encrypted end-to-end',
        body: 'Ask anything about Bitcoin. When you need a bigger model, your messages travel end-to-end encrypted to confidential hardware (a TEE). Its hardware is verified before every message; the exact program inside cannot be verified yet, pending Venice’s reference values. On installed apps, you can switch between Local and Private Cloud.',
      },
      {
        eyebrow: 'Whichever you pick',
        title: 'One companion, from the first question to the first payment',
        body: 'Learn in the app and practise in the Playground, with coins that cost nothing. However she runs, your keys stay yours: you hold them, and Alice never can.',
      },
    ],
  },
  missions: {
    eyebrow: 'Alice’s mission',
    titleLines: ['Hold your keys.', 'Hold your chats.'],
    lead: 'Not a wallet with a chatbot bolted on. Alice is a companion first.',
    body: 'Uncensorable and private like Bitcoin itself, private by design, never able to touch your keys, and Bitcoin-native to the core. She teaches, guides, and helps you tighten your security and privacy, while your wallet checks everything on your device. Need more power? Private Cloud is one tap away, still end-to-end encrypted.',
    tiles: [
      { title: 'Educate', body: 'Bitcoin in plain words, at your pace. No jargon, no pressure to buy.' },
      { title: 'Guide', body: 'Set up self-custody and payments step by step, whenever you get stuck.' },
      { title: 'Harden', body: 'Tighten your security and on-chain privacy with practical, honest OPSEC.' },
      { title: 'Verify locally', body: 'Your wallet validates on your device; Alice only advises, she never signs.' },
    ],
  },
  faq: {
    title: 'Questions people ask',
    items: [
      {
        q: 'Is Alice really private?',
        a: 'Yes. The Local model runs on your device in the installed app; other features, such as downloads and the Explorer, use the network. Private Cloud encrypts your messages end-to-end to confidential hardware; the exact program inside cannot be verified yet, pending Venice’s reference values. The trust page says what is verified today.',
      },
      {
        q: 'Can Alice spend or move my Bitcoin?',
        a: 'No. Alice is self-custodial: your keys stay on your device and the AI never holds them. The AI and the wallet are separate code, by construction: inside the app, the Playground is its own wallet with nothing shared with the model. The wallet, not the model, validates and signs, so a prompt can never move your funds.',
      },
      {
        q: 'Do you track me?',
        a: 'No. No cookies, no ad trackers, no fingerprinting, no selling data. Private Cloud messages are end-to-end encrypted: we cannot read them or count their tokens, and usage is estimated from the volume of encrypted bytes. At most, cookieless aggregate page-view counts elsewhere, nothing that identifies you.',
      },
      {
        q: 'Is it free?',
        a: 'Yes, the app is free and self-custodial, and Alice Local answers without limits. A plan buys exactly one thing: capacity on the larger Private Cloud model hosted in the cloud, nothing else. Alice is still a beta.',
      },
      {
        q: 'Is Alice on mainnet?',
        a: 'Not with real funds. The Playground inside Alice App only ever uses Mutinynet test coins, nothing there is real money. The Explorer reads the real chain. Private Cloud’s own end-to-end verification is still being completed, and the trust page says exactly what is proven today.',
      },
      {
        q: 'What is Mutinynet?',
        a: 'A Bitcoin test network, run independently of Alice. The Playground in Alice App runs on it with free test coins, so you can practice sending and receiving safely before touching real sats.',
        link: { label: 'mutinynet.com', href: 'https://mutinynet.com' },
      },
      {
        q: 'Is Alice open source?',
        a: 'Yes. The source, release tags, installer checksums, and security model are public, so anyone can inspect the code and check that a downloaded file is the one we published. Builds are not yet reproducible byte for byte, so that check proves the file, not yet how it was built.',
      },
    ],
  },
  teaser: {
    title: 'The Bitcoin AI that answers you, and forgets to spy on you.',
    body: 'You already ask AI about Bitcoin. Here’s honestly how Alice compares to ChatGPT, where she wins, and where she doesn’t.',
    cta: 'Alice vs ChatGPT →',
  },
  wallet: {
    label: 'EXPERIMENTAL · ALICE WALLET',
    title: 'A wallet, still taking shape.',
    intro:
      'Alongside the companion, we’re exploring a self-custodial Bitcoin wallet with Alice to explain each step. This is a separate, experimental project for people who want to test early software and follow its development.',
    warning:
      'Beta, not audited. The wallet can hold real bitcoin on mainnet. Use small amounts only and keep your recovery words backed up. To try it without risking anything, start on Mutinynet, a test network with free coins.',
    mutinynet: 'Try it on Mutinynet · test coins',
    mainnet: 'Web wallet · mainnet',
    apk: 'Android APK · August 2026 build',
    apkNoteBefore:
      'The web versions run the current code. The Android APK is the last build, Alice {version}, released before the wallet moved to its own repository, so it lacks the changes made since; its checksum is on ',
    apkNoteLink: 'its release page',
    apkNoteAfter: '.',
    source: 'Source code & changelog on GitHub',
    imageAlt: 'Alice Wallet’s existing mobile interface with options to create or import a wallet',
    caption: 'Mobile prototype',
  },
};

const fr: HomeCopy = {
  meta: {
    description: 'Un compagnon IA privé qui vous aide à comprendre, détenir et utiliser Bitcoin.',
  },
  appSchemaDescription:
    'Un compagnon IA privé qui vous aide à comprendre, détenir et utiliser Bitcoin. L’auto-conservation est intégrée ; l’IA explique et guide, mais ne détient jamais vos clés.',
  hero: {
    eyebrow: 'IA privée · Open source',
    title: 'Vos questions sur Bitcoin ne regardent que vous.',
    body: 'Alice vous guide jusqu’au fond du terrier Bitcoin : elle explique avec des mots simples, vous accompagne vers l’auto-conservation et répond à chaque question en local sur votre appareil ou en mode chiffré de bout en bout. ',
    highlight: 'Et elle ne peut jamais toucher à vos clés.',
  },
  verify: {
    title: 'Ne faites pas confiance. Vérifiez.',
    lead: 'Chaque affirmation renvoie à sa preuve, pas à une promesse marketing.',
    claims: [
      { claim: 'Private Cloud est chiffré de bout en bout jusqu’à un matériel attesté', proof: 'ce qui est vérifié' },
      { claim: 'Choisissez Local, et le modèle répond sur votre appareil', proof: 'fonctionnement' },
      { claim: 'Aucun pistage. Aucun cookie.', proof: 'confidentialité' },
      { claim: 'Honnête sur ce qui est vérifié, et sur ce qui ne l’est pas', proof: 'état' },
      { claim: 'Open source, AGPL', proof: 'lire le code' },
    ],
  },
  tour: {
    eyebrow: 'Dans l’app',
    title: 'Faites le tour sans rien installer.',
    screens: [
      {
        alt: 'La discussion d’Alice mise à jour, sur un téléphone, avec le lapin à côté de son message d’accueil et les réglages du modèle en dessous',
        eyebrow: 'Demander à Alice',
        title: 'Discuter avec Alice',
        body: 'Le compagnon au cœur de l’app. Posez vos questions avec des mots simples, obtenez des réponses à votre niveau : Alice retient ce que vous apprenez, sur votre appareil, et choisit l’étape suivante avec vous.',
      },
      {
        alt: 'L’écran de l’explorateur de blocs sur un téléphone, avec les blocs en direct et des transactions célèbres',
        eyebrow: 'Explorer',
        title: 'Voir la chaîne par vous-même',
        body: 'Blocs en direct, frais, transactions célèbres, adresses notoires. Surveillez n’importe quelle adresse ou xpub, et demandez à Alice d’expliquer ce que vous regardez.',
      },
      {
        alt: 'L’écran Learn sur un téléphone, avec le catalogue de cours de Plan B Academy',
        eyebrow: 'Learn',
        title: 'Des cours qui nourrissent la conversation',
        body: 'L’école intégrée à l’app : tout le catalogue de Plan B Academy, des premiers pas à la cryptographie. Terminez un chapitre et Alice le sait : ses réponses suivent vos progrès.',
      },
      {
        alt: 'L’écran Playground sur un téléphone, un portefeuille Bitcoin d’entraînement sur le réseau de test Mutinynet',
        eyebrow: 'Playground',
        title: 'S’entraîner avec des bitcoins qui ne coûtent rien',
        body: 'Un bac à sable aux vraies règles. Un vrai portefeuille Bitcoin sur Mutinynet, un réseau de test où les bitcoins sont gratuits : envoyez, recevez, sauvegardez, et faites toutes vos erreurs ici plutôt que sur le mainnet.',
      },
    ],
    sidebar: { newChat: 'Nouveau chat', explorer: 'Explorer', learn: 'Learn', playground: 'Playground' },
    greeting: 'Bonjour ! Qu’aimeriez-vous apprendre aujourd’hui ?',
    suggestions: [
      'Qu’est-ce que Bitcoin ?',
      'Comment sécuriser mon portefeuille ?',
      'Expliquer le Lightning Network',
      'Qu’est-ce que l’auto-conservation ?',
    ],
    typedExamples: [
      'Qu’est-ce que l’auto-conservation ?',
      'Mes conversations avec l’IA sont-elles privées ?',
      'Comment sécuriser mes bitcoins ?',
      'Qu’est-ce que le protocole Ark ?',
    ],
    placeholder: 'Demandez quelque chose à Alice…',
    inputAria: 'Poser une question à Alice',
    modelAria: 'Modèle : Private. Raisonnement : moyen.',
    modelName: 'Private',
    reasoning: 'Moyen',
    opening: 'Ouverture d’Alice',
    ask: 'Demander à Alice',
    explorer: {
      liveBlocks: 'Blocs en direct',
      blocks: [
        { height: 'Prochain bloc', fee: '~2 sat/vB', tx: '4 338 tx', pending: true },
        { height: '963 313', fee: '~3 sat/vB', tx: '3 300 tx' },
        { height: '963 312', fee: '~1 sat/vB', tx: '5 029 tx' },
        { height: '963 311', fee: '~1 sat/vB', tx: '5 319 tx' },
      ],
      network: 'Bitcoin',
      tab: 'Transaction',
      flow: 'Flux de la transaction',
      inputs: '2 entrées · 0,50 BTC',
      outputs: '3 sorties',
    },
    learn: {
      code: 'BTC101',
      title: 'Le voyage de Bitcoin',
      body: 'La monnaie a changé de forme bien des fois : coquillages, or, papier, plastique. Bitcoin est l’étape suivante, la première monnaie qui vit sur Internet et n’appartient à aucune entreprise ni à aucun État. Dans ce cours, vous suivrez tout son parcours, des raisons de son invention à la façon de le détenir vous-même.',
      progress: 'Chapitre 1 sur 25 · 7 h',
    },
    playground: {
      title: 'Playground',
      network: 'Mutinynet',
      lead: 'Apprenez en expérimentant. Ces sats n’ont aucune valeur réelle.',
      balance: '21 000',
      unit: 'sats de test',
      refresh: 'Actualiser',
      send: 'Envoyer',
      receive: 'Recevoir',
      faucet: 'Sats gratuits',
    },
  },
  sovereignty: {
    srTitle: 'Comment Alice fonctionne, en Local ou en Private Cloud, et comment vos bitcoins restent en auto-conservation',
    panelTitle: 'Comment Alice fonctionne : à vous de choisir',
    or: 'ou',
    always: 'Vos bitcoins, toujours',
    layers: {
      local: 'Local, sur votre appareil',
      cloud: 'Private Cloud, chiffré',
      custody: 'Auto-conservation, vos clés',
    },
    steps: [
      {
        eyebrow: 'Option 1 · Sur votre appareil',
        title: 'Local fonctionne sur votre appareil',
        body: 'Local fait tourner le modèle sur votre propre appareil, dans l’app installée ; l’app web n’a pas d’inférence locale. L’IA personnalisée, c’est autre chose : elle relie Alice à votre propre serveur via son API, et vos questions voyagent donc jusqu’à ce serveur. Les téléchargements et les autres fonctions réseau utilisent toujours le réseau.',
      },
      {
        eyebrow: 'Option 2 · Quand il vous faut de la puissance',
        title: 'Private Cloud, chiffré de bout en bout',
        body: 'Posez n’importe quelle question sur Bitcoin. Quand il vous faut un modèle plus grand, vos messages voyagent chiffrés de bout en bout jusqu’à un matériel confidentiel (un TEE). Ce matériel est vérifié avant chaque message ; le programme exact qui tourne à l’intérieur ne peut pas encore être vérifié, en attendant les valeurs de référence de Venice. Dans les apps installées, vous pouvez passer de Local à Private Cloud et inversement.',
      },
      {
        eyebrow: 'Quel que soit votre choix',
        title: 'Un seul compagnon, de la première question au premier paiement',
        body: 'Apprenez dans l’app et entraînez-vous dans le Playground, avec des bitcoins qui ne coûtent rien. Quelle que soit la façon dont elle fonctionne, vos clés restent les vôtres : c’est vous qui les détenez, et Alice ne le pourra jamais.',
      },
    ],
  },
  missions: {
    eyebrow: 'La mission d’Alice',
    titleLines: ['Gardez vos clés.', 'Gardez vos conversations.'],
    lead: 'Pas un portefeuille avec un chatbot greffé dessus. Alice est d’abord un compagnon.',
    body: 'Incensurable et privée comme Bitcoin lui-même, privée par conception, jamais en mesure de toucher à vos clés, et Bitcoin jusqu’au cœur. Elle enseigne, guide et vous aide à renforcer votre sécurité et votre confidentialité, pendant que votre portefeuille vérifie tout sur votre appareil. Besoin de plus de puissance ? Private Cloud est à portée de main, toujours chiffré de bout en bout.',
    tiles: [
      { title: 'Éduquer', body: 'Bitcoin avec des mots simples, à votre rythme. Pas de jargon, aucune pression pour acheter.' },
      { title: 'Guider', body: 'Mettre en place l’auto-conservation et les paiements étape par étape, chaque fois que vous bloquez.' },
      { title: 'Renforcer', body: 'Améliorer votre sécurité et votre confidentialité on-chain avec une OPSEC pratique et honnête.' },
      { title: 'Vérifier en local', body: 'Votre portefeuille valide sur votre appareil ; Alice ne fait que conseiller, elle ne signe jamais.' },
    ],
  },
  faq: {
    title: 'Les questions qu’on nous pose',
    items: [
      {
        q: 'Alice est-elle vraiment privée ?',
        a: 'Oui. Le modèle Local fonctionne sur votre appareil, dans l’app installée ; d’autres fonctions, comme les téléchargements et l’Explorer, utilisent le réseau. Private Cloud chiffre vos messages de bout en bout jusqu’à un matériel confidentiel ; le programme exact qui tourne à l’intérieur ne peut pas encore être vérifié, en attendant les valeurs de référence de Venice. La page Confiance indique ce qui est vérifié aujourd’hui.',
      },
      {
        q: 'Alice peut-elle dépenser ou déplacer mes bitcoins ?',
        a: 'Non. Alice repose sur l’auto-conservation : vos clés restent sur votre appareil et l’IA ne les détient jamais. L’IA et le portefeuille sont des codes séparés, par construction : dans l’app, le Playground est un portefeuille à part, qui ne partage rien avec le modèle. C’est le portefeuille, et non le modèle, qui valide et signe : un prompt ne peut donc jamais déplacer vos fonds.',
      },
      {
        q: 'Est-ce que vous me pistez ?',
        a: 'Non. Aucun cookie, aucun traceur publicitaire, aucune empreinte numérique, aucune revente de données. Les messages Private Cloud sont chiffrés de bout en bout : nous ne pouvons ni les lire ni compter leurs tokens, et l’usage est estimé à partir du volume d’octets chiffrés. Tout au plus, ailleurs, des comptages agrégés de pages vues, sans cookie, rien qui vous identifie.',
      },
      {
        q: 'Est-ce gratuit ?',
        a: 'Oui, l’app est gratuite et en auto-conservation, et Alice Local répond sans limite. Un forfait achète une seule chose : de la capacité sur le modèle Private Cloud plus grand, hébergé dans le cloud, rien d’autre. Alice est encore en bêta.',
      },
      {
        q: 'Alice fonctionne-t-elle sur le mainnet ?',
        a: 'Pas avec des fonds réels. Le Playground d’Alice App n’utilise que des bitcoins de test Mutinynet : rien n’y est de l’argent réel. L’Explorer lit la vraie chaîne. La vérification de bout en bout propre à Private Cloud est encore en cours de finalisation, et la page Confiance dit exactement ce qui est prouvé aujourd’hui.',
      },
      {
        q: 'Qu’est-ce que Mutinynet ?',
        a: 'Un réseau de test Bitcoin, géré indépendamment d’Alice. Le Playground d’Alice App fonctionne dessus avec des bitcoins de test gratuits, pour que vous puissiez vous entraîner à envoyer et à recevoir sans risque avant de toucher à de vrais sats.',
        link: { label: 'mutinynet.com', href: 'https://mutinynet.com' },
      },
      {
        q: 'Alice est-elle open source ?',
        a: 'Oui. Le code source, les tags de version, les sommes de contrôle des programmes d’installation et le modèle de sécurité sont publics : chacun peut inspecter le code et vérifier qu’un fichier téléchargé est bien celui que nous avons publié. Les builds ne sont pas encore reproductibles octet par octet : cette vérification prouve donc le fichier, pas encore la façon dont il a été construit.',
      },
    ],
  },
  teaser: {
    title: 'L’IA Bitcoin qui vous répond, et qui oublie de vous espionner.',
    body: 'Vous posez déjà vos questions sur Bitcoin à une IA. Voici, honnêtement, comment Alice se compare à ChatGPT : où elle l’emporte, et où ce n’est pas le cas.',
    cta: 'Alice face à ChatGPT →',
  },
  wallet: {
    label: 'EXPÉRIMENTAL · ALICE WALLET',
    title: 'Un portefeuille, encore en construction.',
    intro:
      'À côté du compagnon, nous explorons un portefeuille Bitcoin en auto-conservation, avec Alice pour expliquer chaque étape. C’est un projet distinct et expérimental, pour celles et ceux qui veulent tester un logiciel à ses débuts et suivre son développement.',
    warning:
      'Bêta, non audité. Le portefeuille peut détenir de vrais bitcoins sur le mainnet. N’utilisez que de petits montants et gardez une sauvegarde de votre phrase de récupération (seed phrase). Pour l’essayer sans rien risquer, commencez sur Mutinynet, un réseau de test où les bitcoins sont gratuits.',
    mutinynet: 'L’essayer sur Mutinynet · bitcoins de test',
    mainnet: 'Portefeuille web · mainnet',
    apk: 'APK Android · version d’août 2026',
    apkNoteBefore:
      'Les versions web font tourner le code actuel. L’APK Android est le dernier build, Alice {version}, publié avant que le portefeuille ne passe dans son propre dépôt : il ne contient donc pas les changements faits depuis ; sa somme de contrôle est sur ',
    apkNoteLink: 'sa page de version',
    apkNoteAfter: '.',
    source: 'Code source et journal des modifications sur GitHub',
    imageAlt: 'L’interface mobile actuelle d’Alice Wallet, avec les options pour créer ou importer un portefeuille',
    caption: 'Prototype mobile',
  },
};

export const homeCopy: Record<Locale, HomeCopy> = { en, fr };
