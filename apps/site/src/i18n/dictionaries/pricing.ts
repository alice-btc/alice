import type { Locale } from '@/i18n/config';

// The pricing page and the plan cards it shows.

export type PricingCopy = {
  meta: { title: string; description: string; shareDescription: string };
  eyebrow: string;
  title: string;
  lead: string;
  status: string;
  plans: {
    loading: string;
    unavailable: string;
    perMonth: string;
    free: { name: string; amount: string; period: string; items: string[]; note: string };
    cloud: { name: string; items: string[]; note: string };
    cta: string;
    footnote: string;
  };
  faqTitle: string;
  faqs: { q: string; a: string }[];
};

const en: PricingCopy = {
  meta: {
    title: 'Alice Pricing',
    description:
      'Alice Local is free and unlimited on your device. Private Cloud plans add millions of end-to-end encrypted tokens each month, paid in bitcoin, with no card on file and no automatic renewal.',
    shareDescription:
      'Free local AI. Private Cloud plans in millions of tokens, paid in bitcoin, no automatic renewal.',
  },
  eyebrow: 'Pricing',
  title: 'One AI on your device, free. One in the cloud, priced plainly.',
  lead: 'Alice answers on your device for free, without limits, forever. A plan buys exactly one thing: capacity on the larger Private Cloud model, end-to-end encrypted, for the questions your device cannot carry alone.',
  status: 'Alice is in beta, on mainnet. Plans are on sale in the app, paid in bitcoin.',
  plans: {
    loading: 'Loading satoshi quote…',
    unavailable: 'Satoshi quote unavailable',
    perMonth: '/ month',
    free: {
      name: 'Free',
      amount: '0',
      period: 'forever',
      items: [
        'Alice Local on your device, unlimited',
        '21 Private Cloud requests to try the larger model',
        'Your conversations stay on your device, encrypted',
      ],
      note: 'Local answers never expire and are never counted. The plan beside this one buys cloud capacity, nothing else.',
    },
    cloud: {
      name: 'Cloud',
      items: [
        '8M input and 2M output tokens of Private Cloud each month',
        'End-to-end encrypted to confidential hardware',
        'Never used for training',
        'Everything in Free, always',
      ],
      note: 'Paid in bitcoin. No card on file, no automatic renewal: a plan runs out, and you decide whether to buy another.',
    },
    cta: 'Get more Private Cloud',
    footnote:
      'Prices are quoted in satoshis, pinned to an exchange rate that moves a few times a day at most, so what you see here is what the invoice asks for. Usage on paid plans is estimated from the volume of encrypted data: your messages are end-to-end encrypted, so Alice cannot count tokens exactly, and says so instead of pretending otherwise.',
  },
  faqTitle: 'Fair questions',
  faqs: [
    {
      q: 'Why bitcoin only?',
      a: 'Because it is what Alice is for, and because it means no card on file. Nothing can charge you on its own: a plan runs out and stops, and renewing is a decision you make, never one made for you.',
    },
    {
      q: 'Why are prices in satoshis?',
      a: 'You pay in bitcoin, so you are quoted in bitcoin. The euro figure underneath is the same price read a second way, and the satoshi amount is what the invoice actually asks for. The rate behind it is pinned server-side and moves a few times a day at most, so the price does not tick while you read it.',
    },
    {
      q: 'What happens when a plan expires?',
      a: 'Nothing dramatic. You go back to the free plan. Alice Local keeps answering without limits, and everything Alice remembers for you stays on your device, because none of that was ever behind the paywall. Only the cloud capacity ends.',
    },
    {
      q: 'Can I pay for several months at once?',
      a: 'Yes. Prepaid months are added to whatever time you have left, never instead of it, and Alice warns you by email, at the address on your account, three days before the last one runs out and on the day.',
    },
    {
      q: 'How is usage counted if my messages are encrypted?',
      a: 'Alice cannot read your messages, so she cannot count tokens exactly. She measures the volume of encrypted data passing through and converts it with a calibrated ratio. Your account shows a percentage estimated that way, and it is labeled as an estimate because that is what it is.',
    },
  ],
};

const fr: PricingCopy = {
  meta: {
    title: 'Tarifs d’Alice',
    description:
      'Alice Local est gratuit et illimité sur votre appareil. Les forfaits Private Cloud ajoutent chaque mois des millions de tokens chiffrés de bout en bout, payés en bitcoin, sans carte enregistrée ni renouvellement automatique.',
    shareDescription:
      'IA locale gratuite. Forfaits Private Cloud en millions de tokens, payés en bitcoin, sans renouvellement automatique.',
  },
  eyebrow: 'Tarifs',
  title: 'Une IA sur votre appareil, gratuite. Une autre dans le cloud, à un prix clair.',
  lead: 'Alice répond sur votre appareil gratuitement, sans limite, pour toujours. Un forfait achète une seule chose : de la capacité sur le modèle Private Cloud plus grand, chiffré de bout en bout, pour les questions que votre appareil ne peut pas porter seul.',
  status: 'Alice est en bêta sur le mainnet. Les forfaits sont en vente dans l’app, payés en bitcoin.',
  plans: {
    loading: 'Chargement du prix en satoshis…',
    unavailable: 'Prix en satoshis indisponible',
    perMonth: '/ mois',
    free: {
      name: 'Gratuit',
      amount: '0',
      period: 'pour toujours',
      items: [
        'Alice Local sur votre appareil, sans limite',
        '21 requêtes Private Cloud pour essayer le modèle plus grand',
        'Vos conversations restent sur votre appareil, chiffrées',
      ],
      note: 'Les réponses locales n’expirent jamais et ne sont jamais comptées. Le forfait d’à côté achète de la capacité dans le cloud, rien d’autre.',
    },
    cloud: {
      name: 'Cloud',
      items: [
        '8 millions de tokens en entrée et 2 millions en sortie sur Private Cloud, chaque mois',
        'Chiffré de bout en bout jusqu’à un matériel confidentiel',
        'Jamais utilisé pour l’entraînement',
        'Tout ce que comprend Gratuit, toujours',
      ],
      note: 'Payé en bitcoin. Pas de carte enregistrée, pas de renouvellement automatique : un forfait arrive à son terme, et vous décidez d’en acheter un autre ou non.',
    },
    cta: 'Obtenir plus de Private Cloud',
    footnote:
      'Les prix sont indiqués en satoshis, sur la base d’un taux de change fixé qui bouge au plus quelques fois par jour : ce que vous voyez ici est ce que la facture demande. Sur les forfaits payants, l’usage est estimé à partir du volume de données chiffrées : vos messages sont chiffrés de bout en bout, Alice ne peut donc pas compter les tokens exactement, et le dit au lieu de faire semblant.',
  },
  faqTitle: 'Questions légitimes',
  faqs: [
    {
      q: 'Pourquoi uniquement en bitcoin ?',
      a: 'Parce que c’est la raison d’être d’Alice, et parce que cela veut dire aucune carte enregistrée. Rien ne peut vous débiter de lui-même : un forfait arrive à son terme et s’arrête, et le renouveler est une décision que vous prenez, jamais une décision prise pour vous.',
    },
    {
      q: 'Pourquoi les prix sont-ils en satoshis ?',
      a: 'Vous payez en bitcoin, donc le prix vous est indiqué en bitcoin. Le montant en euros affiché dessous est le même prix, lu autrement, et le montant en satoshis est ce que la facture demande réellement. Le taux qui le sous-tend est fixé côté serveur et bouge au plus quelques fois par jour : le prix ne change donc pas pendant que vous le lisez.',
    },
    {
      q: 'Que se passe-t-il quand un forfait expire ?',
      a: 'Rien de dramatique. Vous revenez au forfait gratuit. Alice Local continue de répondre sans limite, et tout ce qu’Alice retient pour vous reste sur votre appareil, car rien de tout cela n’a jamais été payant. Seule la capacité dans le cloud prend fin.',
    },
    {
      q: 'Puis-je payer plusieurs mois d’un coup ?',
      a: 'Oui. Les mois prépayés s’ajoutent au temps qu’il vous reste, jamais à sa place, et Alice vous prévient par e-mail, à l’adresse de votre compte, 3 jours avant la fin du dernier, puis le jour même.',
    },
    {
      q: 'Comment l’usage est-il compté si mes messages sont chiffrés ?',
      a: 'Alice ne peut pas lire vos messages : elle ne peut donc pas compter les tokens exactement. Elle mesure le volume de données chiffrées qui transitent et le convertit avec un ratio calibré. Votre compte affiche un pourcentage estimé de cette façon, présenté comme une estimation parce que c’en est une.',
    },
  ],
};

export const pricingCopy: Record<Locale, PricingCopy> = { en, fr };
