import type { Locale } from '@/i18n/config';
import type { MemoryFlowCopy } from '@/components/MemoryFlowDiagram';
import { SOURCE_URL } from '@/lib/site';

// The memory page: the words sit apart from the structure so the page reads
// as prose in the source and stays easy to revise. Every sentence is a claim
// about what the code does; a translation says exactly the same thing. The
// warning at the top is the text agreed in the maintainer's note, not a
// softened version, in every language.

type Pair = { title: string; body: string };

export type MemoryCopy = {
  /** The technical documentation in this language, in the repository. */
  docUrl: string;
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  warningEyebrow: string;
  warningLead: string;
  warningBody: string;
  intro: string[];
  capture: { heading: string; lead: string; paths: Pair[]; caption: string };
  refused: { heading: string; lead: string; filters: Pair[]; limits: string; guards: string };
  stored: { heading: string; rows: Pair[]; after: string; trustLabel: string; afterTrust: string };
  used: { heading: string; p1: string; notLead: string; nots: string[]; local: string };
  control: { heading: string; lead: string; items: string[] };
  coming: { heading: string; lead: string; items: string[]; outOfPlan: string };
  closing: { before: string; docLabel: string; between: string; privacyLabel: string; and: string; trustLabel: string; after: string };
  /** The tag in front of each "coming" item. */
  comingTag: string;
  diagram: MemoryFlowCopy;
};

const en: MemoryCopy = {
    docUrl: `${SOURCE_URL}/blob/main/docs/ALICE_USER_MEMORY.md`,
    meta: {
      title: 'Memory',
      description:
        'What Alice remembers about you, how a fact is captured and filtered, where it is stored (on your device only, never on a server), how it shapes an answer, and how to see and erase all of it.',
    },
    eyebrow: 'Memory',
    title: 'What Alice remembers about you.',
    warningEyebrow: 'Read this first',
    warningLead: 'Alice can get this wrong.',
    warningBody:
      'She may misread a sentence and keep something she should not have kept, and the filters described here can miss a case they did not anticipate. They are a safeguard, not a guarantee. Do not fully trust what is shown as remembered or as forgotten. The real protection is to give Alice only the minimum your question needs, and never an address, a key, a recovery phrase, an amount or anything that identifies you. What you type in the conversation remains your responsibility.',
    intro: [
      'Alice keeps two memories, both on your device. The personal memory holds short facts you said about yourself: a preference for short answers, the hardware you use, a project you are building, a constraint to keep in mind, or a sentence you asked her to keep. The learning profile holds how familiar you are with fourteen Bitcoin concepts, so she can pick the right vocabulary and depth. Neither is stored on our servers, and neither is a source of truth for Alice: they only change how she answers, never what she holds to be true.',
      'This page describes what the code does today, in Alice App 0.2.7 on the web and on desktop. The parts that are decided and not yet in the app are listed at the end, under “Coming”, and nowhere else.',
    ],
    capture: {
      heading: 'What Alice remembers, and how',
      lead: 'A fact can reach the memory by three paths. All of them go through the same filters before anything is written.',
      paths: [
        {
          title: 'Fixed patterns, in the code',
          body: 'A short list of sentence shapes is checked against your message, without any model: “I prefer concise answers” or “detailed answers”, “I am building…”, “I am working on…”, “my goal is…”, “I want to…”, and their French forms. At most two facts per message come out of this path.',
        },
        {
          title: '“Remember that…”, when you ask',
          body: 'When you ask in so many words (“remember that…”, “please remember…”, “retiens que…”), Alice keeps your sentence as you wrote it, in a Requested notes category. The sentence must be about you and must not contain a question; otherwise it is an ordinary message. When the request is your whole message, Alice answers “Noted: …” only once the note is actually saved, and if a filter refuses it, she says so and names what it caught.',
        },
        {
          title: 'A proposal from the model',
          body: 'When memory is on, the model is asked to append a hidden block after its visible answer, with zero to three facts, each in one of eight categories: preference, setup, experience, goal, project, interest, background, constraint. It is told to keep only what you stated explicitly about yourself, never to infer identity, personality, beliefs, expertise or circumstances, and never to save an amount or an exchange account. It cannot file anything as a requested note. The app reads that block and removes it before the answer is shown.',
        },
        {
          title: 'The learning profile, separately',
          body: 'The concepts your questions touch count as signals, and a sentence like “I am comfortable with UTXOs” sets a declared level that the model must respect. In Learn, reading a chapter counts as a signal and finishing a course sets a level. The profile stores, per concept, one familiarity state (never seen, introduced, exploring, familiar), a count of signals and dates rounded to the day. Nothing else.',
        },
      ],
      caption:
        'From a message to the memory on your device. Whatever the path, the same five filters run first. A refused fact is not written, and only a “remember that” request gets an answer saying why. Our servers hold no copy at any point.',
    },
    refused: {
      heading: 'What the code refuses',
      lead: 'Every candidate, whichever path it came from, passes five filters written in the code. One refusal is enough: nothing is written. Most refusals are silent. When your message is only a “remember that” request, or when you edit a fact on the memory screen, the reason is shown instead.',
      filters: [
        {
          title: '1. The secrets detector',
          body: 'Twelve or more words in a row from the recovery-phrase word list, private keys in WIF format, extended private keys, and a hexadecimal key preceded by the words “private key” or “secret key”.',
        },
        {
          title: '2. Raw values',
          body: 'Bitcoin addresses, xpub and xprv keys of every family, Nostr keys, Lightning invoices, 64-character hexadecimal strings, email addresses, phone numbers, identifiers with a hash sign, UUIDs.',
        },
        {
          title: '3. Amounts',
          body: 'A number followed by a bitcoin or currency unit (“0.5 BTC”, “20k sats”, “150 €”, “two bitcoins”), or a currency sign or code followed by a number (“$300”). A bare number stays allowed, so “since 2021” or “a 2-of-3 multisig” can be kept.',
        },
        {
          title: '4. Exchange accounts',
          body: 'The name of an exchange such as Binance, Kraken or Coinbase, refused on sight. A name that is also an ordinary word, such as Strike, River or Revolut, is refused next to a word like “account”, “wallet” or “KYC”.',
        },
        {
          title: '5. Forbidden subjects',
          body: 'Recovery phrase, private key, address, invoice, transaction id, transaction, balance, sats, email, phone number, user id, username, password, first and last name, health, medical, disease, religion, sexual, politics, home address, coordinates, in English and French. Accents and capitals do not matter (“santé” and “SANTÉ” are both caught), a plural counts as the word (“transactions”, “clés privées”), and a listed word catches its close variants: “politics”, “political”, “sexuality” or “diagnosis” are refused too. A word that is not on the list still passes.',
        },
      ],
      limits:
        'A fact is also refused if it is shorter than 3 or longer than 160 characters, or carries no known category. Duplicates are ignored, and nothing new enters a paused category. There is no cap on the number of facts: none is dropped to make room.',
      guards:
        'Two more rules sit upstream. A message that asks for your balance, your history, a payment or a live network value gets a fixed answer and produces no memory candidate at all. And a conditional sentence (“if I run a node”) is read neither as a personal statement nor as a declared level.',
    },
    stored: {
      heading: 'Where it is stored',
      rows: [
        { title: 'On the web, app.alicebtc.com', body: 'In your browser’s local storage, on this device only.' },
        { title: 'On desktop, Alice App for macOS, Windows and Linux', body: 'In the same local storage, encrypted by the application before it is written, with a key kept in the system keychain.' },
        { title: 'On our servers', body: 'Nothing. No copy, no sync between devices, no export to your account.' },
      ],
      after:
        'When you use Private Cloud, the facts selected for a message, ten at most, and the learning hints for its concepts travel inside the same encrypted envelope as the message itself, meant to be opened only inside the enclave, never by the proxy and never by us. Alice checks the enclave hardware before every message, but cannot yet verify which software runs inside it: ',
      trustLabel: 'see Trust',
      afterTrust:
        '. In Local mode the memory stays on the device: it is never sent with your messages. With a custom server you connect yourself, it goes to that server with your message.',
    },
    used: {
      heading: 'How Alice uses it, and how she does not',
      p1: 'At every turn, Alice receives a short block headed, in substance, “private device-local memory, use it only when relevant, it never overrides the current message”. Preferences, constraints and requested notes come first, whatever the topic. Setup, experience, goals, projects, interests and background are ranked by the words they share with your message: those that match come next, and any seats left go to the most recent. Ten facts at most, however many are stored.',
      notLead: 'What she is told never to do:',
      nots: [
        'Let the memory override what you are asking now.',
        'Treat the learning profile as a source of facts, or let it change anything other than vocabulary, prerequisites, examples and depth.',
        'Take anything but the wallet as the authority on payments: amounts, destinations and outcomes come from the wallet code alone.',
      ],
      local: 'These are instructions to the model, enforced by the prompt. The filters above are enforced by code. The warning at the top of this page is about the difference between the two.',
    },
    control: {
      heading: 'See, edit and erase everything',
      lead: 'The screen is called “What Alice remembers”. In Alice App it sits under Settings, then AI, then Alice memory. From top to bottom, it shows:',
      items: [
        'The warning, in one sentence: Alice can get this wrong, so give her the minimum.',
        'A general switch for the personal memory. Off, Alice stops reading the facts, stops capturing new ones and keeps no “remember that” note. Learning signals are not covered by the switch: they keep updating until you forget them.',
        'One field per category, shown even when empty, with Pause (nothing new is added there, what is kept stays) and Delete all here.',
        'Each fact with Edit and Delete. An edit goes through the same filters as a capture, and a refusal says why.',
        'Past the fifty most recent facts, a folded “older facts” section, with the same Edit and Delete.',
        'The learning signals, concept by concept, each with a Forget button.',
        'Forget everything, which erases both memories on this device. Your conversations and your Playground wallet are untouched.',
      ],
    },
    coming: {
      heading: 'Coming, not shipped yet',
      lead: 'These decisions are taken and not yet in the app. Until they ship, nothing on this page should be read as if they were.',
      items: [
        'A notice under the answer, “Alice remembers: …”, with Keep and Forget, shown every time something is captured. Until then, a capture shows only on the “What Alice remembers” screen, or in the reply to a “remember that” request.',
        'Fixed patterns for Setup and Experience (“I have a multisig”, “I use a hardware wallet”, “I run a node”). Until then, these facts come only from the model’s proposal or from a “remember that” request.',
      ],
      outOfPlan: 'Out of scope, by decision: no copy off the device, no sync between devices, no export to your account.',
    },
    closing: {
      before: 'The source is public under the AGPL. The technical version of this page, with file names and the exact filter lists, lives in the repository: ',
      docLabel: 'read the memory documentation',
      between: '. See also ',
      privacyLabel: 'Privacy',
      and: ' and ',
      trustLabel: 'Trust',
      after: '.',
    },
    comingTag: 'coming',
    diagram: {
      title: 'From a message to the memory on your device',
      description:
        'Your message can reach the memory by two kinds of path. In the code: fixed patterns, which keep at most two facts, and an explicit “remember that” request, kept word for word. From the model: zero to three facts in a hidden block after its answer, never inferred. Everything goes through five filters in the code: a secrets detector, raw values, amounts, exchange accounts and forbidden subjects. A refused fact is not written, and only a “remember that” request gets an answer saying why. An accepted fact goes to the memory on your device, 160 characters a fact and no cap on their number: in the browser’s local storage on the web, encrypted by the app on desktop. That memory feeds the next conversation, where preferences, constraints and requested notes come first and the rest is ranked by the message, ten at most, and the “What Alice remembers” screen, with Edit and Delete per fact, Pause and Delete all per category, Forget per concept and Forget everything.',
      message: 'Your message',
      patterns: { title: 'In the code', lines: ['“I prefer”, “my goal is”,', '“I am working on”:', '2 facts at most;', '“remember that…”:', 'kept word for word'] },
      model: { title: 'The model proposes', lines: ['0 to 3 facts in a hidden', 'block after its answer,', 'never inferred'] },
      filters: { title: 'Five filters, in the code', lines: ['1. secrets detector (seed, keys)', '2. raw values (addresses, ids)', '3. amounts in any unit', '4. exchange accounts', '5. forbidden subjects'] },
      refused: { title: 'Refused', lines: ['nothing is written;', 'on “remember that”,', 'Alice says why'] },
      stored: { title: 'Memory on your device', lines: ['160 characters a fact, no cap', 'web: local storage', 'desktop: encrypted by the app'] },
      next: { title: 'Next conversation', lines: ['preferences, constraints,', 'requested notes first,', 'the rest ranked by', 'the message, 10 at most'] },
      screen: { title: '“What Alice remembers”', lines: ['Edit, Delete per fact,', 'Pause, Delete all here,', 'Forget per concept,', 'Forget everything'] },
    },
};

const fr: MemoryCopy = {
    // The public repository carries the English document only; the French
    // one is the maintainer's reference and stays private.
    docUrl: `${SOURCE_URL}/blob/main/docs/ALICE_USER_MEMORY.md`,
    meta: {
      title: 'Mémoire',
      description:
        'Ce qu’Alice retient de vous, comment un fait est capturé et filtré, où il est stocké (sur votre appareil uniquement, jamais sur un serveur), comment il influence une réponse, et comment tout voir et tout effacer.',
    },
    eyebrow: 'Mémoire',
    title: 'Ce qu’Alice retient de vous.',
    warningEyebrow: 'À lire d’abord',
    warningLead: 'Alice peut se tromper.',
    warningBody:
      'Elle peut mal comprendre une phrase et retenir quelque chose qu’elle n’aurait pas dû retenir, et les filtres décrits ici peuvent laisser passer un cas qu’ils n’ont pas prévu. Ils sont un garde-fou, pas une garantie. Ne faites pas entièrement confiance à ce qui est affiché comme retenu ou comme oublié. La vraie protection, c’est de ne donner à Alice que le minimum dont votre question a besoin, et jamais une adresse, une clé, une phrase de récupération (seed phrase), un montant ou quoi que ce soit qui vous identifie. Ce que vous écrivez dans la conversation reste sous votre responsabilité.',
    intro: [
      'Alice tient 2 mémoires, l’une et l’autre sur votre appareil. La mémoire personnelle garde de courts faits que vous avez dits sur vous : une préférence pour des réponses courtes, le matériel que vous utilisez, un projet que vous construisez, une contrainte à garder en tête, ou une phrase que vous lui avez demandé de retenir. Le profil d’apprentissage garde votre degré de familiarité avec 14 notions Bitcoin, pour qu’elle choisisse le bon vocabulaire et la bonne profondeur. Aucune des deux n’est stockée sur nos serveurs, et aucune n’est une source de vérité pour Alice : elles changent seulement sa façon de répondre, jamais ce qu’elle tient pour vrai.',
      'Cette page décrit ce que fait le code aujourd’hui, dans Alice App 0.2.7 sur le web et sur le bureau. Les éléments décidés mais pas encore dans l’app sont listés à la fin, sous « À venir », et nulle part ailleurs.',
    ],
    capture: {
      heading: 'Ce qu’Alice retient, et comment',
      lead: 'Un fait peut entrer dans la mémoire par 3 chemins. Tous passent par les mêmes filtres avant que quoi que ce soit ne soit écrit.',
      paths: [
        {
          title: 'Des motifs fixes, dans le code',
          body: 'Une courte liste de formes de phrase est comparée à votre message, sans aucun modèle : « je préfère des réponses concises » ou « détaillées », « je construis… », « je travaille sur… », « mon objectif est… », « je veux… », et leurs formes anglaises. Ce chemin produit 2 faits au plus par message.',
        },
        {
          title: '« Retiens que… », quand vous le demandez',
          body: 'Quand vous le demandez en toutes lettres (« retiens que… », « peux-tu retenir… », « remember that… »), Alice garde votre phrase telle que vous l’avez écrite, dans une catégorie Notes demandées. La phrase doit parler de vous et ne pas contenir de question ; sinon, c’est un message ordinaire. Quand la demande constitue tout votre message, Alice répond « Retenu : … » seulement une fois la note réellement enregistrée, et si un filtre la refuse, elle le dit et nomme ce qu’il a détecté.',
        },
        {
          title: 'Une proposition du modèle',
          body: 'Quand la mémoire est activée, il est demandé au modèle d’ajouter un bloc caché après sa réponse visible, avec 0 à 3 faits, chacun dans l’une de 8 catégories : préférence, installation, expérience, objectif, projet, centre d’intérêt, contexte, contrainte. Il a pour consigne de ne garder que ce que vous avez explicitement dit de vous, de ne jamais déduire l’identité, la personnalité, les croyances, l’expertise ou la situation, et de ne jamais enregistrer un montant ni un compte de plateforme d’échange. Il ne peut rien classer comme note demandée. L’app lit ce bloc et le retire avant que la réponse ne s’affiche.',
        },
        {
          title: 'Le profil d’apprentissage, à part',
          body: 'Les notions que touchent vos questions comptent comme des signaux, et une phrase comme « je maîtrise les UTXO » fixe un niveau déclaré que le modèle doit respecter. Dans Learn, lire un chapitre compte comme un signal et terminer un cours fixe un niveau. Le profil stocke, par notion, un état de familiarité (jamais vue, introduite, en exploration, familière), un nombre de signaux et des dates arrondies au jour. Rien d’autre.',
        },
      ],
      caption:
        'D’un message à la mémoire de votre appareil. Quel que soit le chemin, les 5 mêmes filtres passent d’abord. Un fait refusé n’est pas écrit, et seule une demande « retiens que » reçoit une réponse qui dit pourquoi. Nos serveurs n’en gardent aucune copie, à aucun moment.',
    },
    refused: {
      heading: 'Ce que le code refuse',
      lead: 'Chaque candidat, quel que soit son chemin, passe par 5 filtres écrits dans le code. Un seul refus suffit : rien n’est écrit. La plupart des refus sont silencieux. Quand votre message n’est qu’une demande « retiens que », ou quand vous modifiez un fait sur l’écran de la mémoire, le motif s’affiche à la place.',
      filters: [
        {
          title: '1. Le détecteur de secrets',
          body: '12 mots ou plus à la suite tirés de la liste de mots des seed phrases, les clés privées au format WIF, les clés privées étendues, et une clé hexadécimale précédée des mots « private key » ou « secret key ».',
        },
        {
          title: '2. Les valeurs brutes',
          body: 'Adresses Bitcoin, clés xpub et xprv de toutes les familles, clés Nostr, factures Lightning, chaînes hexadécimales de 64 caractères, adresses e-mail, numéros de téléphone, identifiants avec un dièse, UUID.',
        },
        {
          title: '3. Les montants',
          body: 'Un nombre suivi d’une unité de bitcoin ou d’une devise (« 0,5 BTC », « 20k sats », « 150 € », « deux bitcoins »), ou un symbole ou un code de devise suivi d’un nombre (« $300 »). Un nombre seul reste permis : « depuis 2021 » ou « un multisig 2 sur 3 » peuvent être conservés.',
        },
        {
          title: '4. Les comptes de plateformes d’échange',
          body: 'Le nom d’une plateforme d’échange comme Binance, Kraken ou Coinbase, refusé d’office. Un nom qui est aussi un mot ordinaire, comme Strike, River ou Revolut, est refusé à côté d’un mot comme « compte », « portefeuille » ou « KYC ».',
        },
        {
          title: '5. Les sujets interdits',
          body: 'Seed phrase, clé privée, adresse, facture, identifiant de transaction, transaction, solde, sats, e-mail, numéro de téléphone, user id, username, mot de passe, prénom et nom de famille, santé, médical, maladie, religion, sexualité, politique, adresse personnelle, coordonnées, en anglais et en français. Les accents et les majuscules ne comptent pas (« santé » comme « SANTÉ » est détecté), un pluriel compte comme le mot (« transactions », « clés privées »), et un mot de la liste attrape ses variantes proches : « politicien », « political », « sexuality » ou « diagnostic » sont refusés aussi. Un mot qui n’est pas dans la liste passe toujours.',
        },
      ],
      limits:
        'Un fait est aussi refusé s’il fait moins de 3 ou plus de 160 caractères, ou s’il n’a pas de catégorie connue. Les doublons sont ignorés, et rien de nouveau n’entre dans une catégorie en pause. Le nombre de faits n’a pas de plafond : aucun n’est supprimé pour faire de la place.',
      guards:
        '2 autres règles agissent en amont. Un message qui demande votre solde, votre historique, un paiement ou une valeur réseau en direct reçoit une réponse fixe et ne produit aucun candidat de mémoire. Et une phrase conditionnelle (« si je fais tourner un nœud ») n’est lue ni comme une déclaration personnelle ni comme un niveau déclaré.',
    },
    stored: {
      heading: 'Où c’est stocké',
      rows: [
        { title: 'Sur le web, app.alicebtc.com', body: 'Dans le stockage local de votre navigateur, sur cet appareil uniquement.' },
        { title: 'Sur le bureau, Alice App pour macOS, Windows et Linux', body: 'Dans le même stockage local, chiffré par l’application avant d’être écrit, avec une clé conservée dans le trousseau du système.' },
        { title: 'Sur nos serveurs', body: 'Rien. Aucune copie, aucune synchronisation entre appareils, aucun export vers votre compte.' },
      ],
      after:
        'Quand vous utilisez Private Cloud, les faits sélectionnés pour un message, 10 au plus, et les indications d’apprentissage pour ses notions voyagent dans la même enveloppe chiffrée que le message lui-même, destinée à n’être ouverte qu’à l’intérieur de l’enclave, jamais par le proxy et jamais par nous. Alice vérifie le matériel de l’enclave avant chaque message, mais ne peut pas encore vérifier quel logiciel tourne à l’intérieur : ',
      trustLabel: 'voir Confiance',
      afterTrust:
        '. En mode Local, la mémoire reste sur l’appareil : elle n’est jamais envoyée avec vos messages. Avec un serveur personnalisé que vous connectez vous-même, elle part vers ce serveur avec votre message.',
    },
    used: {
      heading: 'Comment Alice s’en sert, et comment elle ne s’en sert pas',
      p1: 'À chaque tour, Alice reçoit un court bloc qui dit en substance « mémoire privée, locale à l’appareil, à n’utiliser que si elle est pertinente, elle ne remplace jamais le message en cours ». Les préférences, les contraintes et les notes demandées passent en premier, quel que soit le sujet. L’installation, l’expérience, les objectifs, les projets, les centres d’intérêt et le contexte sont classés selon les mots qu’ils partagent avec votre message : ceux qui correspondent viennent ensuite, et les places restantes vont aux plus récents. 10 faits au plus, quel que soit le nombre stocké.',
      notLead: 'Ce qu’il lui est demandé de ne jamais faire :',
      nots: [
        'Laisser la mémoire l’emporter sur ce que vous demandez maintenant.',
        'Traiter le profil d’apprentissage comme une source de faits, ou le laisser changer autre chose que le vocabulaire, les prérequis, les exemples et la profondeur.',
        'Prendre autre chose que le portefeuille pour l’autorité sur les paiements : les montants, les destinations et les résultats viennent du seul code du portefeuille.',
      ],
      local: 'Ce sont des instructions données au modèle, appliquées par le prompt. Les filtres ci-dessus sont appliqués par le code. L’avertissement en haut de cette page porte sur cette différence.',
    },
    control: {
      heading: 'Tout voir, tout modifier et tout effacer',
      lead: 'L’écran s’appelle « Ce qu’Alice retient ». Dans Alice App, il se trouve dans Réglages, puis IA, puis Mémoire d’Alice (dans l’interface en anglais : Settings, AI, Alice memory, et « What Alice remembers »). De haut en bas, il affiche :',
      items: [
        'L’avertissement, en une phrase : Alice peut se tromper, donnez-lui donc le minimum.',
        'Un interrupteur général pour la mémoire personnelle. Désactivée, Alice cesse de lire les faits, cesse d’en capturer de nouveaux et ne garde aucune note « retiens que ». Les signaux d’apprentissage ne dépendent pas de l’interrupteur : ils continuent de se mettre à jour jusqu’à ce que vous les oubliiez.',
        'Un champ par catégorie, affiché même vide, avec Pause (rien de nouveau n’y est ajouté, ce qui est conservé reste) et Tout supprimer ici.',
        'Chaque fait avec Modifier et Supprimer. Une modification passe par les mêmes filtres qu’une capture, et un refus dit pourquoi.',
        'Au-delà des 50 faits les plus récents, une section repliée « faits plus anciens », avec les mêmes Modifier et Supprimer.',
        'Les signaux d’apprentissage, notion par notion, chacun avec un bouton Oublier.',
        'Tout oublier, qui efface les 2 mémoires sur cet appareil. Vos conversations et votre portefeuille Playground ne sont pas touchés.',
      ],
    },
    coming: {
      heading: 'À venir, pas encore livré',
      lead: 'Ces décisions sont prises et pas encore dans l’app. Tant qu’elles ne sont pas livrées, rien sur cette page ne doit être lu comme si elles l’étaient.',
      items: [
        'Un avis sous la réponse, « Alice retient : … », avec Garder et Oublier, affiché chaque fois que quelque chose est capturé. D’ici là, une capture n’apparaît que sur l’écran « Ce qu’Alice retient », ou dans la réponse à une demande « retiens que ».',
        'Des motifs fixes pour l’installation et l’expérience (« j’ai un multisig », « j’utilise un portefeuille matériel », « je fais tourner un nœud »). D’ici là, ces faits ne viennent que de la proposition du modèle ou d’une demande « retiens que ».',
      ],
      outOfPlan: 'Hors périmètre, par décision : aucune copie hors de l’appareil, aucune synchronisation entre appareils, aucun export vers votre compte.',
    },
    closing: {
      before: 'Le code source est public sous licence AGPL. La version technique de cette page, avec les noms de fichiers et les listes exactes des filtres, se trouve dans le dépôt : ',
      docLabel: 'lire la documentation de la mémoire',
      between: '. Voir aussi ',
      privacyLabel: 'Confidentialité',
      and: ' et ',
      trustLabel: 'Confiance',
      after: '.',
    },
    comingTag: 'à venir',
    diagram: {
      title: 'D’un message à la mémoire de votre appareil',
      description:
        'Votre message peut atteindre la mémoire par 2 sortes de chemins. Dans le code : des motifs fixes, qui gardent 2 faits au plus, et une demande explicite « retiens que », gardée mot pour mot. Depuis le modèle : 0 à 3 faits dans un bloc caché après sa réponse, jamais déduits. Tout passe par 5 filtres dans le code : un détecteur de secrets, les valeurs brutes, les montants, les comptes de plateformes d’échange et les sujets interdits. Un fait refusé n’est pas écrit, et seule une demande « retiens que » reçoit une réponse qui dit pourquoi. Un fait accepté va dans la mémoire de votre appareil, 160 caractères par fait et sans plafond sur leur nombre : dans le stockage local du navigateur sur le web, chiffré par l’app sur le bureau. Cette mémoire alimente la conversation suivante, où les préférences, les contraintes et les notes demandées passent en premier et où le reste est classé selon le message, 10 au plus, ainsi que l’écran « Ce qu’Alice retient », avec Modifier et Supprimer par fait, Pause et Tout supprimer par catégorie, Oublier par notion et Tout oublier.',
      message: 'Votre message',
      patterns: { title: 'Dans le code', lines: ['« je préfère »,', '« mon objectif est »,', '« je travaille sur » :', '2 faits au plus ;', '« retiens que… » :', 'gardé mot pour mot'] },
      model: { title: 'Le modèle propose', lines: ['0 à 3 faits dans un bloc', 'caché après sa réponse,', 'jamais déduits'] },
      filters: { title: '5 filtres, dans le code', lines: ['1. détecteur de secrets (seed, clés)', '2. valeurs brutes (adresses, identifiants)', '3. montants dans toute unité', '4. comptes de plateformes d’échange', '5. sujets interdits'] },
      refused: { title: 'Refusé', lines: ['rien n’est écrit ;', 'sur « retiens que »,', 'Alice dit pourquoi'] },
      stored: { title: 'Mémoire sur l’appareil', lines: ['160 caractères par fait,', 'sans plafond', 'web : stockage local', 'bureau : chiffré par l’app'] },
      next: { title: 'Conversation suivante', lines: ['préférences, contraintes,', 'notes demandées d’abord,', 'le reste classé selon', 'le message, 10 au plus'] },
      screen: { title: '« Ce qu’Alice retient »', lines: ['Modifier, Supprimer', 'par fait ; Pause,', 'Tout supprimer ici ;', 'Oublier par notion ;', 'Tout oublier'] },
    },
};

export const memoryCopy: Record<Locale, MemoryCopy> = { en, fr };
