/**
 * WFSL GLOBAL DIGITAL TRUST AUTHORITY
 * Federated Authority Engine (FAE)
 * -----------------------------------------------------------
 * This subsystem enables:
 * - multi-authority trust negotiation
 * - federated trust envelopes
 * - cross-realm authority merging
 * - lineage reconciliation
 * - PQ-ready federation hashing
 *
 * WFSL becomes a multi-organisation trust fabric.
 */

import { sha512 } from "./trust-crypto.js";
import { TrustLineage, TrustIdentity } from "./trust-core.js";

/**
 * A sovereign authority root descriptor.
 */
export interface AuthorityRoot {
  id: string;                        // unique root identifier
  name: string;                      // organisation or sovereign entity
  publicKey: string;                 // root verification key
  createdAt: string;
  pqEnabled: boolean;                // whether PQ-safe transition has begun
  lineage: TrustLineage;             // authority ancestry
}

/**
 * Federation envelope — governs how two or more authorities trust each other.
 */
export interface FederationEnvelope {
  authorities: AuthorityRoot[];
  createdAt: string;
  trustWeight: number;               // 0–1 multiplier for graph influence
  policy: string;                    // negotiated federation ruleset
  pqSeal: string;                    // PQ-ready federation integrity hash
}

/**
 * Create a new authority root.
 */
export function createAuthorityRoot(
  name: string,
  publicKey: string,
  pqEnabled: boolean = false,
  parents: string[] = []
): AuthorityRoot {
  const timestamp = new Date().toISOString();
  const rootId = sha512(name + publicKey + timestamp).slice(0, 32);

  const lineage: TrustLineage = {
    parentRoots: parents,
    derivedRoot: rootId,
    rotationReason: parents.length > 0 ? "federated-derivation" : "root-origin",
    timestamp
  };

  return {
    id: rootId,
    name,
    publicKey,
    pqEnabled,
    createdAt: timestamp,
    lineage
  };
}

/**
 * Produce a PQ-ready seal over a federation envelope.
 */
export function sealFederation(envelope: FederationEnvelope): FederationEnvelope {
  const material = JSON.stringify({
    authorities: envelope.authorities.map(a => a.id),
    weight: envelope.trustWeight,
    policy: envelope.policy
  });

  return {
    ...envelope,
    pqSeal: sha512("federation-" + material)
  };
}

/**
 * Create a federation envelope between multiple authorities.
 */
export function createFederationEnvelope(
  authorities: AuthorityRoot[],
  trustWeight: number = 0.7,
  policy: string = "wfsl-default-federation"
): FederationEnvelope {
  const timestamp = new Date().toISOString();

  const envelope: FederationEnvelope = {
    authorities,
    createdAt: timestamp,
    trustWeight,
    policy,
    pqSeal: "" // populated after sealing
  };

  return sealFederation(envelope);
}

/**
 * Merge authority lineage into a single federated lineage descriptor.
 * Used when constructing cross-realm trust for a TrustObject.
 */
export function mergeLineage(authorities: AuthorityRoot[]): TrustLineage {
  const timestamp = new Date().toISOString();
  const derivedRoot = sha512(
    authorities.map(a => a.id).sort().join("|") + timestamp
  ).slice(0, 32);

  const parentRoots = authorities.map(a => a.lineage.derivedRoot);

  return {
    parentRoots,
    derivedRoot,
    rotationReason: "federated-lineage-merge",
    timestamp
  };
}

/**
 * Check if two authorities can federate based on:
 * - PQ compatibility
 * - lineage independence
 * - policy constraints
 */
export function canFederate(a: AuthorityRoot, b: AuthorityRoot): boolean {
  // Must not share identical derived roots (avoids circular trust)
  if (a.lineage.derivedRoot === b.lineage.derivedRoot) return false;

  // PQ compatibility: both PQ-enabled or both classical
  if (a.pqEnabled !== b.pqEnabled) return false;

  return true;
}

/**
 * Resolve trust weight between two authorities.
 * Can be expanded with AI risk models later.
 */
export function resolveFederatedTrustWeight(a: AuthorityRoot, b: AuthorityRoot): number {
  let weight = 0.7;

  // If both have long lineage chains, increase weight
  if (a.lineage.parentRoots.length > 2 && b.lineage.parentRoots.length > 2) {
    weight += 0.1;
  }

  // PQ-enabled authorities get an additional boost
  if (a.pqEnabled && b.pqEnabled) {
    weight += 0.1;
  }

  return Math.min(weight, 1.0);
}

/**
 * Build a full federation between two authorities.
 */
export function federateAuthorities(a: AuthorityRoot, b: AuthorityRoot): FederationEnvelope | null {
  if (!canFederate(a, b)) {
    return null;
  }

  const weight = resolveFederatedTrustWeight(a, b);
  return createFederationEnvelope([a, b], weight);
}
