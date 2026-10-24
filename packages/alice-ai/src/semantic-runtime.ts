// Platform dispatch: Next (web/desktop) resolves this file, which forwards to
// the browser implementation; Metro web resolves semantic-runtime.web.ts. The
// native engine lives with the wallet, in alice-btc/alice-wallet.
export * from './semantic-runtime-browser';
