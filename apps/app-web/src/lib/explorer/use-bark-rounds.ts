// React binding for the Bark round registry: keeps a component tree in step
// with the rounds identified on-chain, and drives the walk while the Bark
// network is being explored (use-settlement-sync.ts).

import { useCallback } from 'react';
import type { ChainReader } from './arkade-onchain.ts';
import { barkRoundRegistry, loadOlderBarkRounds, updateBarkRounds } from './bark-onchain.ts';
import { useSettlementSync, type SettlementState } from './use-settlement-sync.ts';

// The server's wallet moves a few times a day; an idle pass is one request
// per frontier output plus the server's last round, so every ten minutes
// keeps the tip fresh at little cost to either endpoint.
const WALK_INTERVAL_MS = 10 * 60_000;

export type BarkRounds = SettlementState;

/**
 * The known Bark rounds, live. While `chain` is set (the Bark network is
 * active), the walk brings the set to the on-chain tip and keeps it there;
 * with `chain` null the hook only mirrors the registry.
 */
export function useBarkRounds(chain: ChainReader | null, serverUrl: string | undefined): BarkRounds {
  const active = !!chain && !!serverUrl;
  const pass = useCallback(
    (signal: AbortSignal) => updateBarkRounds(chain!, serverUrl!, { signal }),
    [chain, serverUrl],
  );
  const older = useCallback(
    (signal: AbortSignal) => loadOlderBarkRounds(chain!, serverUrl!, { signal }),
    [chain, serverUrl],
  );
  return useSettlementSync({ registry: barkRoundRegistry, active, intervalMs: WALK_INTERVAL_MS, pass, older });
}
