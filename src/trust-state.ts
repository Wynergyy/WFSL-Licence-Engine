/**
 * WFSL GLOBAL DIGITAL TRUST AUTHORITY
 * Sovereign Trust State Machine Engine (STSME)
 * -----------------------------------------------------------
 * This subsystem governs:
 * - trust state transitions
 * - anomaly reactions
 * - policy-driven trust evolution
 * - authority overrides
 * - risk decay and reinforcement
 * - PQ-ready state hashing
 *
 * This engine makes WFSL a self-regulating trust platform.
 */

import { sha512 } from "./trust-crypto.js";
import { TrustObject } from "./trust-core.js";

/**
 * Sovereign trust states.
 */
export type TrustState =
  | "sovereign"
  | "trusted"
  | "caution"
  | "restricted"
  | "compromised"
  | "revoked";

/**
 * Trust state transition descriptor.
 */
export interface StateTransition {
  from: TrustState;
  to: TrustState;
  reason: string;
  timestamp: string;
}

/**
 * Complete trust state profile.
 */
export interface TrustStateProfile {
  state: TrustState;
  score: number;
  transitions: StateTransition[];
  lastUpdated: string;
  hash: string; // PQ-ready state integrity hash
}

/**
 * Create initial trust state profile.
 */
export function createInitialState(score: number = 50): TrustStateProfile {
  const initial: TrustState = score >= 70 ? "trusted" : "caution";

  const timestamp = new Date().toISOString();

  return {
    state: initial,
    score,
    transitions: [
      {
        from: initial,
        to: initial,
        reason: "initialisation",
        timestamp
      }
    ],
    lastUpdated: timestamp,
    hash: sha512(`initial-${initial}-${score}-${timestamp}`)
  };
}

/**
 * Compute updated PQ-ready state hash.
 */
function computeStateHash(profile: TrustStateProfile): string {
  return sha512(
    JSON.stringify({
      state: profile.state,
      score: profile.score,
      transitions: profile.transitions
    })
  );
}

/**
 * Determine state based on updated trust score.
 */
function determineState(score: number): TrustState {
  if (score >= 80) return "sovereign";
  if (score >= 60) return "trusted";
  if (score >= 40) return "caution";
  if (score >= 20) return "restricted";
  if (score > 0) return "compromised";
  return "revoked";
}

/**
 * Apply trust decay over time.
 * Real systems would use time-based decay; here we keep deterministic.
 */
export function applyTrustDecay(profile: TrustStateProfile): void {
  profile.score = Math.max(0, profile.score - 2);
  profile.state = determineState(profile.score);
  profile.lastUpdated = new Date().toISOString();
  profile.hash = computeStateHash(profile);
}

/**
 * Reinforce trust when strong positive behaviours occur.
 */
export function reinforceTrust(profile: TrustStateProfile): void {
  profile.score = Math.min(100, profile.score + 3);
  profile.state = determineState(profile.score);
  profile.lastUpdated = new Date().toISOString();
  profile.hash = computeStateHash(profile);
}

/**
 * Trigger anomaly reaction.
 */
export function flagAnomaly(profile: TrustStateProfile, reason: string): void {
  const timestamp = new Date().toISOString();

  profile.transitions.push({
    from: profile.state,
    to: "restricted",
    reason,
    timestamp
  });

  profile.state = "restricted";
  profile.score = Math.max(0, profile.score - 15);
  profile.lastUpdated = timestamp;
  profile.hash = computeStateHash(profile);
}

/**
 * Authority override — used by sovereign trust issuers.
 */
export function applyAuthorityOverride(
  profile: TrustStateProfile,
  newState: TrustState,
  reason: string
): void {
  const timestamp = new Date().toISOString();

  profile.transitions.push({
    from: profile.state,
    to: newState,
    reason,
    timestamp
  });

  profile.state = newState;
  profile.lastUpdated = timestamp;
  profile.hash = computeStateHash(profile);
}

/**
 * Evaluate trust state based on a TrustObject’s AI metric & lineage.
 */
export function evaluateTrustState(
  trust: TrustObject,
  profile: TrustStateProfile
): TrustStateProfile {
  const metric = trust.metric;

  // AI metric influence
  if (metric) {
    if (metric.riskLevel === "critical") {
      flagAnomaly(profile, "ai-critical-risk");
    } else if (metric.riskLevel === "high") {
      profile.score = Math.max(0, profile.score - 10);
      profile.state = determineState(profile.score);
    } else if (metric.riskLevel === "low") {
      reinforceTrust(profile);
    }
  }

  // Lineage influence (trust continuity)
  if (trust.lineage.parentRoots.length > 3) {
    // indicates multi-root authority evolution
    reinforceTrust(profile);
  }

  profile.lastUpdated = new Date().toISOString();
  profile.hash = computeStateHash(profile);

  return profile;
}
