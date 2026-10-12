// The Spark on-chain registry as React state: the set of Bitcoin txids this
// browser knows to be Spark deposits or exits, refreshed whenever a page
// feeds the registry (a leaf walked down, Sparkscan's feed or an address's
// history). The panel badges those rows wherever they are listed.

import { useEffect, useMemo, useState } from 'react';
import { sparkOnchainRegistry } from './spark-onchain.ts';

export function useSparkOnchain(): { txids: ReadonlySet<string>; version: number } {
  const [version, setVersion] = useState(0);
  useEffect(() => sparkOnchainRegistry.subscribe(() => setVersion(v => v + 1)), []);
  // `version` is the registry's change counter: the set is rebuilt on each change.
  const txids = useMemo(() => new Set(sparkOnchainRegistry.txids()), [version]);
  return { txids, version };
}
