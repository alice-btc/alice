export type PurchaseSurface = 'web' | 'desktop' | 'android-direct' | 'google-play' | 'ios' | 'unknown';
export type PurchasePresentation = 'checkout' | 'link' | 'text' | 'hidden';
export function purchasePresentation(surface: PurchaseSurface, storefront?: string | null): PurchasePresentation {
  if (surface === 'web') return 'checkout';
  if (surface === 'desktop' || surface === 'android-direct') return 'link';
  if (surface === 'google-play') return 'text';
  if (surface === 'ios' && storefront === 'USA') return 'link';
  return 'hidden';
}
