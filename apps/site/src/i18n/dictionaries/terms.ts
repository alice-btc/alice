import type { Locale } from '@/i18n/config';
import type { Rich } from '@/i18n/rich';
import { CONTACT_EMAIL, SOURCE_URL } from '@/lib/site';

// The terms of service, the address Google Play shows next to the trader
// status. Plan rules follow apps/venice-proxy-worker/src/billing.ts: bitcoin
// only through BTCPay, 30-day periods, 1 to 24 at once, added to the time
// left, no renewal, reminders 3 days before and on the day, failed requests
// refunded to the quota. A translation says exactly what the English says.

type Section = { id: string; heading: string; body: Rich[]; list?: Rich[] };

export type TermsCopy = {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  updated: string;
  intro: Rich;
  sections: Section[];
};

const mail = { href: `mailto:${CONTACT_EMAIL}`, text: CONTACT_EMAIL };
const link = (href: string, text: string) => ({ href, text });

const en: TermsCopy = {
  meta: {
    title: 'Terms of Service',
    description:
      'The terms for using Alice and its Private Cloud plans: who runs Alice, what a plan includes, payment in bitcoin, refunds, fair use and liability.',
  },
  eyebrow: 'Terms of Service',
  title: 'Terms of Service',
  updated: 'Last updated 5 November 2026',
  intro: [
    'These terms apply when you use Alice: the apps for Android, iOS, macOS, Windows and Linux, the web app, and the Private Cloud plans. “We” means the person who runs Alice. They do not take away any protection that the consumer law of the country where you live gives you.',
  ],
  sections: [
    {
      id: 'who',
      heading: 'Who runs Alice',
      body: [
        [
          'Alice is run by Marius Farashi, as an individual trader. You can reach us at ',
          mail,
          '. The trader details required in the European Union are shown on Alice’s store pages once each store has verified them.',
        ],
      ],
    },
    {
      id: 'what',
      heading: 'What Alice is',
      body: [
        [
          'Alice is an AI companion for learning Bitcoin. She answers questions, explains courses and transactions, lets you explore public Bitcoin data, and lets you try transactions on a test network with coins that have no value. Alice does not hold your bitcoin or your keys, and cannot send a transaction for you.',
        ],
      ],
    },
    {
      id: 'answers',
      heading: 'Answers can be wrong',
      body: [
        [
          'Alice’s answers come from a language model. They can be incomplete, out of date or wrong, even when they sound sure. They are education, not financial, investment, legal or tax advice. Check anything that matters, above all before you move money, and never type a recovery phrase or a private key into the chat.',
        ],
      ],
    },
    {
      id: 'account',
      heading: 'Your account',
      body: [
        [
          'You can use Alice without an account. A paid plan needs one, so that the plan follows you to another device. You must be 18 or older to create an account or buy a plan.',
        ],
        [
          'Keep your password and passkeys to yourself, since whoever signs in with them uses your plan. You can delete your account at any time, as explained on the ',
          link('/account-deletion/', 'account deletion page'),
          '.',
        ],
      ],
    },
    {
      id: 'free',
      heading: 'Free use',
      body: [
        [
          'Alice Local, which answers on your device, is free and unlimited. Each installation also gets 21 free Private Cloud requests to try the larger model. We may change the free allowance for new installations. A change never affects a plan already paid for.',
        ],
      ],
    },
    {
      id: 'plans',
      heading: 'Paid plans',
      body: [],
      list: [
        [
          'A plan buys Private Cloud capacity and nothing else. What it includes and its price are shown on the ',
          link('/pricing/', 'pricing page'),
          ' and before you pay.',
        ],
        [
          'Payment is in bitcoin only, through an invoice from Alice’s BTCPay server. The price is set in satoshis when the invoice is created. An invoice that is not paid in time expires.',
        ],
        [
          'A plan starts when the payment is confirmed. A period lasts 30 days, and you can buy 1 to 24 periods at once. New periods are added to the time you have left.',
        ],
        [
          'A plan never renews on its own, since there is no card on file. When it runs out, you go back to free use. If you gave an email address for reminders, we write 3 days before the end and on the last day.',
        ],
        [
          'Your messages are end-to-end encrypted, so we cannot count tokens exactly. Usage is estimated from the volume of encrypted data, and the app shows it as an estimate.',
        ],
        ['A Private Cloud request that fails on our side is not counted against your plan.'],
      ],
    },
    {
      id: 'refunds',
      heading: 'Refunds',
      body: [],
      list: [
        [
          'Within 14 days of a payment, you can ask for a refund without giving a reason. Write to ',
          mail,
          ' with the invoice or the account’s username, and a bitcoin address. We refund what you paid, less the share of the plan you already used, within 14 days of your request.',
        ],
        [
          'If a payment goes wrong, for example an amount paid twice or a plan that was not credited, write to us and we credit the plan or refund what was paid too much.',
        ],
        ['If we stop Private Cloud or stop selling plans, we refund the unused time of every plan.'],
        ['Refunds are paid in bitcoin and calculated on the amount in satoshis that you paid.'],
      ],
    },
    {
      id: 'use',
      heading: 'Fair use',
      body: [
        [
          'Do not use Alice to break the law or to harm others, and do not attack, overload or probe the service. Do not get around the free allowance or a plan’s limits, by script or by any other means, and do not resell access to Private Cloud.',
        ],
        [
          'We may suspend an account that does this. If it holds a paid plan, we refund the unused time, unless the plan was paid or used through fraud.',
        ],
      ],
    },
    {
      id: 'third-parties',
      heading: 'Third-party services and content',
      body: [
        [
          'Private Cloud answers come from models run by Venice AI on confidential hardware. Local models are downloaded from Hugging Face and keep their own licences. The Explorer reads public data from block explorers such as mempool.space. Courses and the Bitcoin Dictionary are used under their authors’ licences, listed on the ',
          link('/credits/', 'credits page'),
          '. We do not control these services and cannot promise that they stay available.',
        ],
      ],
    },
    {
      id: 'data',
      heading: 'Your data',
      body: [
        [
          'How Alice handles your data is set out on the ',
          link('/privacy/', 'privacy page'),
          '. Your conversations and Alice’s memory are stored only on your device, and Private Cloud messages are end-to-end encrypted.',
        ],
      ],
    },
    {
      id: 'code',
      heading: 'Open source',
      body: [
        [
          'Alice’s ',
          link(SOURCE_URL, 'source code'),
          ' is published under the GNU Affero General Public License, version 3 or later. These terms cover the service we run. The licence covers what you can do with the code.',
        ],
      ],
    },
    {
      id: 'beta',
      heading: 'Beta and changes to the service',
      body: [
        [
          'Alice is in beta. Features can change or stop, and the service can be interrupted. A change that reduces what a paid plan includes is announced on this page in advance and never applies to time already paid for.',
        ],
      ],
    },
    {
      id: 'liability',
      heading: 'Liability',
      body: [
        [
          'Alice is provided as is. As far as the law allows, we are not liable for losses that come from relying on an answer, from an interruption of the service, or from a third-party service.',
        ],
        [
          'Nothing in these terms limits a liability that the law does not allow to be limited, such as for fraud or gross negligence, and nothing in them limits your rights as a consumer.',
        ],
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to these terms',
      body: [
        [
          'A new version is published on this page with its date, at least 30 days before it applies. A plan already paid for keeps the terms it was bought under.',
        ],
      ],
    },
    {
      id: 'contact',
      heading: 'Contact',
      body: [['Questions about these terms, refunds and any other request: ', mail, '.']],
    },
  ],
};

const fr: TermsCopy = {
  meta: {
    title: 'Conditions d’utilisation',
    description:
      'Les conditions d’utilisation d’Alice et de ses forfaits Private Cloud : qui gère Alice, ce que comprend un forfait, le paiement en bitcoin, les remboursements, l’usage loyal et la responsabilité.',
  },
  eyebrow: 'Conditions d’utilisation',
  title: 'Conditions d’utilisation',
  updated: 'Dernière mise à jour le 5 novembre 2026',
  intro: [
    'Ces conditions s’appliquent quand vous utilisez Alice : les apps pour Android, iOS, macOS, Windows et Linux, l’app web et les forfaits Private Cloud. « Nous » désigne la personne qui gère Alice. Elles ne vous retirent aucune protection que vous accorde le droit de la consommation du pays où vous vivez.',
  ],
  sections: [
    {
      id: 'who',
      heading: 'Qui gère Alice',
      body: [
        [
          'Alice est gérée par Marius Farashi, en tant que professionnel indépendant. Vous pouvez nous écrire à ',
          mail,
          '. Les coordonnées de professionnel exigées dans l’Union européenne figurent sur les pages d’Alice dans les stores, une fois vérifiées par chaque store.',
        ],
      ],
    },
    {
      id: 'what',
      heading: 'Ce qu’est Alice',
      body: [
        [
          'Alice est un compagnon IA pour apprendre Bitcoin. Elle répond aux questions, explique des cours et des transactions, permet d’explorer les données publiques de Bitcoin et d’essayer des transactions sur un réseau de test, avec des pièces sans valeur. Alice ne détient ni vos bitcoins ni vos clés, et ne peut pas envoyer de transaction à votre place.',
        ],
      ],
    },
    {
      id: 'answers',
      heading: 'Les réponses peuvent être fausses',
      body: [
        [
          'Les réponses d’Alice viennent d’un modèle de langage. Elles peuvent être incomplètes, dépassées ou fausses, même quand elles ont l’air sûres. Elles servent à apprendre et ne sont pas un conseil financier, d’investissement, juridique ou fiscal. Vérifiez tout ce qui compte, surtout avant de déplacer de l’argent, et ne tapez jamais une phrase de récupération ou une clé privée dans le chat.',
        ],
      ],
    },
    {
      id: 'account',
      heading: 'Votre compte',
      body: [
        [
          'Vous pouvez utiliser Alice sans compte. Un forfait payant en demande un, pour qu’il vous suive sur un autre appareil. Il faut avoir 18 ans ou plus pour créer un compte ou acheter un forfait.',
        ],
        [
          'Gardez votre mot de passe et vos clés d’accès pour vous, car toute personne qui se connecte avec eux utilise votre forfait. Vous pouvez supprimer votre compte à tout moment, comme l’explique la ',
          link('/account-deletion/', 'page de suppression du compte'),
          '.',
        ],
      ],
    },
    {
      id: 'free',
      heading: 'Usage gratuit',
      body: [
        [
          'Alice Local, qui répond sur votre appareil, est gratuit et sans limite. Chaque installation reçoit aussi 21 requêtes Private Cloud gratuites pour essayer le modèle plus grand. Nous pouvons modifier cette offre gratuite pour les nouvelles installations. Une modification ne touche jamais un forfait déjà payé.',
        ],
      ],
    },
    {
      id: 'plans',
      heading: 'Forfaits payants',
      body: [],
      list: [
        [
          'Un forfait achète de la capacité Private Cloud, rien d’autre. Son contenu et son prix sont indiqués sur la ',
          link('/pricing/', 'page Tarifs'),
          ' et avant le paiement.',
        ],
        [
          'Le paiement se fait uniquement en bitcoin, par une facture du serveur BTCPay d’Alice. Le prix est fixé en satoshis à la création de la facture. Une facture qui n’est pas payée à temps expire.',
        ],
        [
          'Un forfait commence quand le paiement est confirmé. Une période dure 30 jours, et vous pouvez en acheter de 1 à 24 à la fois. Les nouvelles périodes s’ajoutent au temps qu’il vous reste.',
        ],
        [
          'Un forfait ne se renouvelle jamais tout seul, puisqu’aucune carte n’est enregistrée. Quand il arrive à son terme, vous revenez à l’usage gratuit. Si vous avez donné une adresse e-mail pour les rappels, nous vous écrivons 3 jours avant la fin et le dernier jour.',
        ],
        [
          'Vos messages sont chiffrés de bout en bout, nous ne pouvons donc pas compter les tokens exactement. L’usage est estimé à partir du volume de données chiffrées, et l’app l’affiche comme une estimation.',
        ],
        ['Une requête Private Cloud qui échoue de notre côté n’est pas décomptée de votre forfait.'],
      ],
    },
    {
      id: 'refunds',
      heading: 'Remboursements',
      body: [],
      list: [
        [
          'Dans les 14 jours qui suivent un paiement, vous pouvez demander un remboursement sans donner de raison. Écrivez à ',
          mail,
          ' avec la facture ou le nom d’utilisateur du compte, et une adresse bitcoin. Nous remboursons ce que vous avez payé, moins la part du forfait déjà utilisée, dans les 14 jours qui suivent votre demande.',
        ],
        [
          'Si un paiement se passe mal, par exemple un montant payé 2 fois ou un forfait qui n’a pas été crédité, écrivez-nous et nous créditons le forfait ou remboursons le trop-perçu.',
        ],
        ['Si nous arrêtons Private Cloud ou la vente des forfaits, nous remboursons le temps non utilisé de chaque forfait.'],
        ['Les remboursements sont payés en bitcoin et calculés sur le montant en satoshis que vous avez payé.'],
      ],
    },
    {
      id: 'use',
      heading: 'Usage loyal',
      body: [
        [
          'N’utilisez pas Alice pour enfreindre la loi ou nuire à d’autres personnes, et n’attaquez pas, ne surchargez pas et ne sondez pas le service. Ne contournez pas l’offre gratuite ni les limites d’un forfait, par un script ou par tout autre moyen, et ne revendez pas l’accès à Private Cloud.',
        ],
        [
          'Nous pouvons suspendre un compte qui le fait. S’il a un forfait payant, nous remboursons le temps non utilisé, sauf si le forfait a été payé ou utilisé par une fraude.',
        ],
      ],
    },
    {
      id: 'third-parties',
      heading: 'Services et contenus de tiers',
      body: [
        [
          'Les réponses Private Cloud viennent de modèles que Venice AI fait tourner sur du matériel confidentiel. Les modèles locaux sont téléchargés depuis Hugging Face et gardent leurs propres licences. L’Explorer lit des données publiques auprès d’explorateurs de blocs comme mempool.space. Les cours et le Dictionnaire de Bitcoin sont utilisés selon les licences de leurs auteurs, indiquées sur la ',
          link('/credits/', 'page Crédits'),
          '. Nous ne contrôlons pas ces services et ne pouvons pas promettre qu’ils restent disponibles.',
        ],
      ],
    },
    {
      id: 'data',
      heading: 'Vos données',
      body: [
        [
          'La façon dont Alice traite vos données est décrite sur la ',
          link('/privacy/', 'page Confidentialité'),
          '. Vos conversations et la mémoire d’Alice ne sont gardées que sur votre appareil, et les messages Private Cloud sont chiffrés de bout en bout.',
        ],
      ],
    },
    {
      id: 'code',
      heading: 'Code source ouvert',
      body: [
        [
          'Le ',
          link(SOURCE_URL, 'code source'),
          ' d’Alice est publié sous la licence GNU Affero General Public License, version 3 ou ultérieure. Ces conditions couvrent le service que nous faisons tourner. La licence couvre ce que vous pouvez faire du code.',
        ],
      ],
    },
    {
      id: 'beta',
      heading: 'Bêta et évolutions du service',
      body: [
        [
          'Alice est en bêta. Des fonctions peuvent changer ou s’arrêter, et le service peut être interrompu. Un changement qui réduit ce que comprend un forfait payant est annoncé à l’avance sur cette page et ne s’applique jamais au temps déjà payé.',
        ],
      ],
    },
    {
      id: 'liability',
      heading: 'Responsabilité',
      body: [
        [
          'Alice est fournie telle quelle. Dans la mesure permise par la loi, nous ne sommes pas responsables des pertes qui viennent de la confiance accordée à une réponse, d’une interruption du service ou d’un service tiers.',
        ],
        [
          'Rien dans ces conditions ne limite une responsabilité que la loi interdit de limiter, comme en cas de fraude ou de faute lourde, et rien n’y limite vos droits de consommateur.',
        ],
      ],
    },
    {
      id: 'changes',
      heading: 'Modification de ces conditions',
      body: [
        [
          'Une nouvelle version est publiée sur cette page avec sa date, au moins 30 jours avant de s’appliquer. Un forfait déjà payé garde les conditions sous lesquelles il a été acheté.',
        ],
      ],
    },
    {
      id: 'contact',
      heading: 'Contact',
      body: [['Questions sur ces conditions, remboursements et toute autre demande : ', mail, '.']],
    },
  ],
};

export const termsCopy: Record<Locale, TermsCopy> = { en, fr };
