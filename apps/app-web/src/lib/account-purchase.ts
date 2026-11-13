import { tauriShell, tauriInvoke } from '@alice-wallet/alice-ai';
import { purchasePresentation, type PurchasePresentation } from './purchase-policy';

export function accountWebUrl(): string {
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined'
      && new URLSearchParams(window.location.search).has('purchase-preview')) {
    // A local review must never send its fake accounts to the live payment site.
    return `${window.location.origin}/?settings=account&auth=signin`;
  }
  return 'https://app.alicebtc.com/?settings=account&auth=signin';
}

export async function accountPurchasePresentation(): Promise<PurchasePresentation> {
  // Only a development build can simulate a distribution for local design review.
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    const preview = new URLSearchParams(window.location.search).get('purchase-preview');
    if (preview === 'ios-us' || preview === 'direct' || preview === 'desktop') return 'link';
    if (preview === 'play') return 'text';
    if (preview === 'ios-other') return 'hidden';
    if (preview === 'web') return 'checkout';
  }
  const shell = tauriShell();
  if (shell === null) return 'checkout';
  if (shell === 'desktop') return 'link';
  try {
    const context = await tauriInvoke<{ channel: string; storefront: string | null }>('account_purchase_context');
    if (shell === 'ios') return purchasePresentation('ios', context.storefront);
    return purchasePresentation(context.channel === 'android-direct' ? 'android-direct' : 'google-play');
  } catch {
    return shell === 'android' ? 'text' : 'hidden';
  }
}
