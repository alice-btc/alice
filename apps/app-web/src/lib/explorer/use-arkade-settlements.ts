// React binding for the Arkade settlement registry: keeps a component tree in
// step with the settlements identified on-chain, and drives the chain walk
// while the Arkade network is being explored (use-settlement-sync.ts).

import { useCallback } from 'react';
import { loadOlderSettlements, settlementRegistry, updateSettlements, type ChainReader } from './arkade-onchain.ts';
import { useSettlementSync, type SettlementState } from './use-settlement-sync.ts';

// Once at the tip, a pass is a couple of requests (the frontier's outspends
// and the Worker's anchor); every five minutes keeps it fresh without
// hammering either endpoint. A commitment lands every day or two.
const WALK_INTERVAL_MS = 5 * 60_000;

export type ArkadeSettlements = SettlementState;

/**
 * The known Arkade settlements, live. While `chain` is set (the Arkade network
 * is active), the walk brings the set to the on-chain tip and keeps it there;
 * with `chain` null the hook only mirrors the registry.
 */
export function useArkadeSettlements(chain: ChainReader | null, arkApiUrl: string | undefined): ArkadeSettlements {
  const active = !!chain && !!arkApiUrl;
  const pass = useCallback(
    (signal: AbortSignal) => updateSettlements(chain!, arkApiUrl!, { signal }),
    [chain, arkApiUrl],
  );
  const older = useCallback(
    (signal: AbortSignal) => loadOlderSettlements(chain!, arkApiUrl!, { signal }),
    [chain, arkApiUrl],
  );
  return useSettlementSync({ registry: settlementRegistry, active, intervalMs: WALK_INTERVAL_MS, pass, older });
}
