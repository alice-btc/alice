import type { Locale } from '@/i18n/config';

// The comparison with ChatGPT. The Private Cloud sentences carry the same
// limit as the trust page: encrypted end-to-end, exact program not yet
// verifiable. A translation keeps both halves.

export type VsChatGptCopy = {
  meta: { title: string; description: string; shareDescription: string };
  eyebrow: string;
  title: string;
  intro: string;
  caption: string;
  columns: { alice: string; chatgpt: string };
  rows: { dimension: string; alice: string; chatgpt: string }[];
  winsTitle: string;
  winsBody: string;
  faqTitle: string;
  faqs: { q: string; a: string }[];
  ctaTitle: string;
  ctaLead: string;
  cta: string;
};

const en: VsChatGptCopy = {
  meta: {
    title: 'Alice vs ChatGPT for Bitcoin',
    description:
      'A private AI companion for Bitcoin vs a general assistant. How Alice compares to ChatGPT on privacy, safety, self-custody, and Bitcoin depth, including where ChatGPT is still better.',
    shareDescription:
      'How a private, Bitcoin-specialized AI companion compares to a general assistant, honestly, including where ChatGPT wins.',
  },
  eyebrow: 'Comparison',
  title: 'Alice vs ChatGPT for Bitcoin',
  intro:
    'Most people already ask ChatGPT about Bitcoin. The difference with Alice is simple: your questions stay private. In Private Cloud they are end-to-end encrypted to confidential hardware; Venice does not yet publish what is needed to verify the exact program inside (the trust page says what is verified). They are answered by a companion built only for Bitcoin. Here’s the honest comparison, including where ChatGPT still wins.',
  caption: 'Alice compared with ChatGPT for Bitcoin',
  columns: { alice: 'Alice', chatgpt: 'ChatGPT' },
  rows: [
    {
      dimension: 'Privacy of your questions',
      alice: 'Private Cloud chats encrypted end-to-end to confidential hardware, never used for training. What Alice remembers to personalize her answers is kept on your device, encrypted in the apps, and you can erase it anytime.',
      chatgpt: 'Conversations may be retained and, depending on settings, used to improve models.',
    },
    {
      dimension: 'Can it move your money?',
      alice: 'No. Alice has no spending authority today, the wallet, not the AI, holds keys and signs.',
      chatgpt: 'No wallet of its own, but plugins/agents wired to one can be given real spending power.',
    },
    {
      dimension: 'Bitcoin focus',
      alice: 'Purpose-built for Bitcoin, self-custody, and privacy, with a Playground to practise sending, receiving and backing up on test coins (on-chain).',
      chatgpt: 'General-purpose; strong broad knowledge, not specialized or connected to your wallet.',
    },
    {
      dimension: 'Honest about limits',
      alice: 'Clearly educational, not financial advice; beta status stated up front.',
      chatgpt: 'General disclaimers; not tailored to Bitcoin risk.',
    },
  ],
  winsTitle: 'Where ChatGPT is still better',
  winsBody:
    'We’re not going to pretend otherwise. ChatGPT is a mature, general-purpose assistant with far broader knowledge and years of refinement. Alice is a focused beta, narrower on purpose, but Private Cloud is end-to-end encrypted to an attested enclave, and Local runs the model on your device in the installed app. Both go further than ChatGPT. If you want a do-everything assistant, ChatGPT wins. If you want a private, Bitcoin-specialized companion that can’t touch your funds, that’s Alice.',
  faqTitle: 'Questions people ask',
  faqs: [
    {
      q: 'Is Alice more private than ChatGPT for Bitcoin questions?',
      a: 'For its Private Cloud mode, Alice encrypts your messages end-to-end to a confidential hardware (TEE) enclave and does not use them as training data. General assistants like ChatGPT may retain conversations and use them to improve their models depending on your settings.',
    },
    {
      q: 'Can Alice spend or move my Bitcoin?',
      a: 'No. Alice is designed so the AI never has spending authority. The wallet code, not the AI model, holds your keys and signs transactions, so a prompt can never move your funds.',
    },
    {
      q: 'Where is ChatGPT still better than Alice?',
      a: 'ChatGPT is a mature, general-purpose assistant with broader world knowledge and a long track record. Alice is a focused beta, narrower on purpose, but Private Cloud is end-to-end encrypted to an attested enclave, and Local runs the model on your device in the installed app. Both go further than ChatGPT.',
    },
    {
      q: 'Do I need to trust Alice with my coins to try her?',
      a: 'No. Alice holds no coins and asks for none. The companion answers your questions on its own, and the Playground lets you practise sending, receiving and backing up on-chain with test coins that are worth nothing. Alice never touches your keys.',
    },
  ],
  ctaTitle: 'Try a private Bitcoin companion',
  ctaLead: 'Free, self-custodial, and open source.',
  cta: 'Open web app',
};

const fr: VsChatGptCopy = {
  meta: {
    title: 'Alice face à ChatGPT pour Bitcoin',
    description:
      'Un compagnon IA privé pour Bitcoin face à un assistant généraliste. Comment Alice se compare à ChatGPT sur la confidentialité, la sécurité, l’auto-conservation et la connaissance de Bitcoin, y compris là où ChatGPT reste meilleur.',
    shareDescription:
      'Comment un compagnon IA privé et spécialisé dans Bitcoin se compare à un assistant généraliste, honnêtement, y compris là où ChatGPT l’emporte.',
  },
  eyebrow: 'Comparaison',
  title: 'Alice face à ChatGPT pour Bitcoin',
  intro:
    'La plupart des gens posent déjà leurs questions sur Bitcoin à ChatGPT. La différence avec Alice est simple : vos questions restent privées. En Private Cloud, elles sont chiffrées de bout en bout jusqu’à un matériel confidentiel ; Venice ne publie pas encore ce qu’il faut pour vérifier le programme exact qui tourne à l’intérieur (la page Confiance indique ce qui est vérifié). Elles reçoivent la réponse d’un compagnon conçu uniquement pour Bitcoin. Voici la comparaison honnête, y compris là où ChatGPT l’emporte encore.',
  caption: 'Alice comparée à ChatGPT pour Bitcoin',
  columns: { alice: 'Alice', chatgpt: 'ChatGPT' },
  rows: [
    {
      dimension: 'Confidentialité de vos questions',
      alice: 'Conversations Private Cloud chiffrées de bout en bout jusqu’à un matériel confidentiel, jamais utilisées pour l’entraînement. Ce qu’Alice retient pour personnaliser ses réponses est conservé sur votre appareil, chiffré dans les apps, et vous pouvez l’effacer à tout moment.',
      chatgpt: 'Les conversations peuvent être conservées et, selon les réglages, utilisées pour améliorer les modèles.',
    },
    {
      dimension: 'Peut-elle déplacer votre argent ?',
      alice: 'Non. Alice n’a aujourd’hui aucun pouvoir de dépense : c’est le portefeuille, et non l’IA, qui détient les clés et signe.',
      chatgpt: 'Pas de portefeuille à lui, mais des plugins ou des agents qui y sont reliés peuvent recevoir un vrai pouvoir de dépense.',
    },
    {
      dimension: 'Spécialisation Bitcoin',
      alice: 'Conçue pour Bitcoin, l’auto-conservation et la confidentialité, avec un Playground pour s’entraîner à envoyer, recevoir et sauvegarder avec des bitcoins de test (on-chain).',
      chatgpt: 'Généraliste ; de solides connaissances générales, mais ni spécialisé ni relié à votre portefeuille.',
    },
    {
      dimension: 'Honnêteté sur les limites',
      alice: 'Clairement éducatif, pas un conseil financier ; statut de bêta affiché d’emblée.',
      chatgpt: 'Avertissements généraux ; rien d’adapté aux risques propres à Bitcoin.',
    },
  ],
  winsTitle: 'Là où ChatGPT reste meilleur',
  winsBody:
    'Nous n’allons pas prétendre le contraire. ChatGPT est un assistant généraliste mûr, avec des connaissances bien plus larges et des années de mise au point. Alice est une bêta ciblée, volontairement plus étroite, mais Private Cloud est chiffré de bout en bout jusqu’à une enclave attestée, et Local fait tourner le modèle sur votre appareil dans l’app installée. L’un comme l’autre va plus loin que ChatGPT. Si vous voulez un assistant qui fait tout, ChatGPT l’emporte. Si vous voulez un compagnon privé, spécialisé dans Bitcoin, qui ne peut pas toucher à vos fonds, c’est Alice.',
  faqTitle: 'Les questions qu’on nous pose',
  faqs: [
    {
      q: 'Alice est-elle plus privée que ChatGPT pour les questions sur Bitcoin ?',
      a: 'En mode Private Cloud, Alice chiffre vos messages de bout en bout jusqu’à une enclave matérielle confidentielle (TEE) et ne les utilise pas comme données d’entraînement. Les assistants généralistes comme ChatGPT peuvent conserver les conversations et s’en servir pour améliorer leurs modèles, selon vos réglages.',
    },
    {
      q: 'Alice peut-elle dépenser ou déplacer mes bitcoins ?',
      a: 'Non. Alice est conçue pour que l’IA n’ait jamais de pouvoir de dépense. C’est le code du portefeuille, et non le modèle d’IA, qui détient vos clés et signe les transactions : un prompt ne peut donc jamais déplacer vos fonds.',
    },
    {
      q: 'Où ChatGPT reste-t-il meilleur qu’Alice ?',
      a: 'ChatGPT est un assistant généraliste mûr, avec une connaissance du monde plus large et un long historique. Alice est une bêta ciblée, volontairement plus étroite, mais Private Cloud est chiffré de bout en bout jusqu’à une enclave attestée, et Local fait tourner le modèle sur votre appareil dans l’app installée. L’un comme l’autre va plus loin que ChatGPT.',
    },
    {
      q: 'Faut-il confier mes bitcoins à Alice pour l’essayer ?',
      a: 'Non. Alice ne détient aucun bitcoin et n’en demande aucun. Le compagnon répond seul à vos questions, et le Playground vous permet de vous entraîner à envoyer, recevoir et sauvegarder on-chain avec des bitcoins de test qui ne valent rien. Alice ne touche jamais à vos clés.',
    },
  ],
  ctaTitle: 'Essayez un compagnon Bitcoin privé',
  ctaLead: 'Gratuit, en auto-conservation et open source.',
  cta: 'Ouvrir l’app web',
};

export const vsChatGptCopy: Record<Locale, VsChatGptCopy> = { en, fr };
