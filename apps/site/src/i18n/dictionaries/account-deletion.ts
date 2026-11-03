import type { Locale } from '@/i18n/config';

// The account deletion page, the address the App Store and Google Play show
// for deleting an account outside the app. Every sentence is a claim about
// what the code does: the list of erased data follows adminDeleteAccount in
// apps/venice-proxy-worker/src/admin.ts, and a translation says exactly the
// same thing.

type Pair = { title: string; body: string };

export type AccountDeletionCopy = {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  intro: string;
  inApp: { heading: string; steps: string[]; after: string };
  byEmail: { heading: string; before: string; subject: string; mailSubject: string; after: string };
  erased: { heading: string; lead: string; rows: Pair[] };
  kept: { heading: string; rows: Pair[] };
  device: { heading: string; body: string };
  timing: { heading: string; body: string };
};

const en: AccountDeletionCopy = {
  meta: {
    title: 'Delete your account',
    description:
      'How to delete your Alice account, in the app or by email, what is erased from our servers, what is kept, and how long it takes.',
  },
  eyebrow: 'Account deletion',
  title: 'Delete your Alice account',
  intro:
    'You can delete your Alice account at any time, from the app or by email, on Android, iOS, desktop or the web. It costs nothing and needs no reason.',
  inApp: {
    heading: 'From the app',
    steps: [
      'Open Settings, then the Account tab.',
      'Choose Manage.',
      'Choose Delete account, then confirm.',
    ],
    after: 'You are signed out on every device at once, and the account can no longer be used.',
  },
  byEmail: {
    heading: 'By email',
    before: 'Write to',
    subject: 'with the subject “Delete my Alice account”',
    mailSubject: 'Delete my Alice account',
    after:
      'from the email address linked to the account, or give its username. We may reply to confirm that the request comes from you before erasing anything.',
  },
  erased: {
    heading: 'What is erased',
    lead: 'Everything our servers hold about the account:',
    rows: [
      { title: 'Identity', body: 'Username, display name, email address, and the fingerprints of your password and passkeys.' },
      { title: 'Sessions and installations', body: 'Every sign-in session and every installation linked to the account.' },
      { title: 'Usage', body: 'Question counters, free allowance, and the log of Private Cloud requests, which holds dates and sizes, never the content of a message.' },
      { title: 'Plans and billing', body: 'Active plans, invoices, billing contact, payment reminders and redeemed promo codes.' },
    ],
  },
  kept: {
    heading: 'What is kept',
    rows: [
      { title: 'Day-level counters', body: 'An event, a platform and a version, counted per day. They never carried a user id, so there is nothing in them to delete.' },
      { title: 'Technical error records', body: 'Kept with the link to the account removed.' },
      { title: '1 line in the operator log', body: 'The date of the deletion and the deleted username, to show that the request was handled.' },
      { title: 'Database backups', body: 'Automatic restore copies of the database expire after 30 days at most.' },
      { title: 'Bitcoin payments', body: 'A plan paid in bitcoin stays on the public blockchain, like any transaction.' },
    ],
  },
  device: {
    heading: 'What stays on your device',
    body: 'Your conversations, Alice’s memory, your Explorer tabs and wallets are stored only on your device, so deleting the account does not remove them. Erase the memory in “What Alice remembers”, or uninstall the app to remove all of it.',
  },
  timing: {
    heading: 'How long it takes',
    body: 'The account stops working the moment you confirm. Its data is erased from our servers within 30 days, and an email request is handled within the same 30 days.',
  },
};

const fr: AccountDeletionCopy = {
  meta: {
    title: 'Supprimer votre compte',
    description:
      'Comment supprimer votre compte Alice, dans l’app ou par e-mail, ce qui est effacé de nos serveurs, ce qui est gardé et en combien de temps.',
  },
  eyebrow: 'Suppression du compte',
  title: 'Supprimer votre compte Alice',
  intro:
    'Vous pouvez supprimer votre compte Alice à tout moment, depuis l’app ou par e-mail, sur Android, iOS, ordinateur ou le web. C’est gratuit et vous n’avez pas à donner de raison.',
  inApp: {
    heading: 'Depuis l’app',
    steps: [
      'Ouvrez les Paramètres, puis l’onglet Compte.',
      'Choisissez Gérer.',
      'Choisissez Supprimer le compte, puis confirmez.',
    ],
    after: 'Vous êtes déconnecté de tous vos appareils en même temps, et le compte ne peut plus servir.',
  },
  byEmail: {
    heading: 'Par e-mail',
    before: 'Écrivez à',
    subject: 'avec l’objet « Supprimer mon compte Alice »',
    mailSubject: 'Supprimer mon compte Alice',
    after:
      'depuis l’adresse e-mail liée au compte, ou en donnant son nom d’utilisateur. Nous pouvons vous répondre pour vérifier que la demande vient bien de vous avant d’effacer quoi que ce soit.',
  },
  erased: {
    heading: 'Ce qui est effacé',
    lead: 'Tout ce que nos serveurs gardent sur le compte :',
    rows: [
      { title: 'Identité', body: 'Nom d’utilisateur, nom affiché, adresse e-mail, et les empreintes de votre mot de passe et de vos clés d’accès.' },
      { title: 'Sessions et installations', body: 'Toutes les sessions de connexion et toutes les installations liées au compte.' },
      { title: 'Utilisation', body: 'Les compteurs de questions, le quota gratuit et le journal des requêtes Private Cloud, qui contient des dates et des tailles, jamais le contenu d’un message.' },
      { title: 'Forfaits et facturation', body: 'Les forfaits actifs, les factures, le contact de facturation, les rappels de paiement et les codes promo utilisés.' },
    ],
  },
  kept: {
    heading: 'Ce qui est gardé',
    rows: [
      { title: 'Compteurs par jour', body: 'Un événement, une plateforme et une version, comptés par jour. Ils n’ont jamais contenu d’identifiant d’utilisateur, il n’y a donc rien à y effacer.' },
      { title: 'Erreurs techniques', body: 'Gardées, avec le lien vers le compte retiré.' },
      { title: '1 ligne dans le journal de l’opérateur', body: 'La date de la suppression et le nom d’utilisateur supprimé, pour prouver que la demande a été traitée.' },
      { title: 'Sauvegardes de la base', body: 'Les copies de restauration automatiques de la base expirent au bout de 30 jours au plus.' },
      { title: 'Paiements en bitcoin', body: 'Un forfait payé en bitcoin reste inscrit sur la blockchain publique, comme toute transaction.' },
    ],
  },
  device: {
    heading: 'Ce qui reste sur votre appareil',
    body: 'Vos conversations, la mémoire d’Alice, vos onglets de l’Explorateur et vos portefeuilles ne sont gardés que sur votre appareil, la suppression du compte ne les retire donc pas. Effacez la mémoire dans « Ce qu’Alice retient », ou désinstallez l’app pour tout retirer.',
  },
  timing: {
    heading: 'En combien de temps',
    body: 'Le compte cesse de fonctionner dès votre confirmation. Ses données sont effacées de nos serveurs sous 30 jours, et une demande par e-mail est traitée dans les mêmes 30 jours.',
  },
};

export const accountDeletionCopy: Record<Locale, AccountDeletionCopy> = { en, fr };
