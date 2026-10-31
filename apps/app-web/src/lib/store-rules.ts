import { isTauriMobile } from '@alice-wallet/alice-ai';

// The App Store and Google Play require their own payment system for anything
// that unlocks a feature inside an app, and refuse a button that sends to
// another way to pay. The phone apps therefore sell nothing and point to no
// purchase: a plan bought on the desktop app or the web works on the phone
// once signed in. The web app, phones included, keeps selling.
export function sellsPlans(): boolean {
  return !isTauriMobile();
}
