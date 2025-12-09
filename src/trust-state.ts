/**
 * Wynergy Sovereign Trust Platform (WSTP)
 * Trust State Reconstruction Engine
 *
 * This module produces the in-memory TrustState object required
 * by the Cloudflare validation API and offline validators.
 *
 * Required export:
 *   buildTrustState()
 */

import { TrustCoreObject } from "./trust-core";

/**
 * Rebuild a TrustState from stored registry metadata.
 * This is deterministic, Cloudflare-safe, and offline compatible.
 */
export function buildTrustState(registryEntry: TrustCoreObject): TrustCoreObject {
  // In a future version, state evolution and lineage scoring
  // will be performed here. For now we simply return the registry entry.
  return {
    identity: registryEntry.identity,
    lineage: registryEntry.lineage,
    policy: registryEntry.policy,
    seal: registryEntry.seal,
    metric: registryEntry.metric,
    machineHash: registryEntry.machineHash ?? null
  };
}
