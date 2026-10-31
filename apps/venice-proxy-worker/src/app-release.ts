// The released Alice version, served at GET /app-version. The three surfaces
// carry one shared number (CHANGELOG.md) and the Worker deploys with every
// release, which makes this constant the single source the update banners
// poll. Bump it as part of the release checklist, with the CHANGELOG entry.
export const APP_RELEASE_VERSION = '0.2.7';

// Alice Wallet is released from its own repository (alice-btc/alice-wallet)
// with its own numbers, but it polls the same door: its banner reads the
// `wallet` field and stays silent when the field is missing. Bump this one
// when a wallet release is published.
export const WALLET_RELEASE_VERSION = '0.1.0';
