import { isTauriMobile } from '@alice-wallet/alice-ai';

// General upsell shortcuts. The Account screen separately resolves the native
// distribution and Apple storefront before showing its web link or checkout
// (account-purchase.ts). Keep unrelated mobile shortcuts conservative.
export function sellsPlans(): boolean {
  return !isTauriMobile();
}
