/**
 * WFSL GLOBAL LICENCE AUTHORITY ENGINE (GLAE)
 * -----------------------------------------------------------
 * Built on top of the sovereign trust kernel:
 * - trust-core
 * - trust-crypto
 * - trust-state
 * - trust-verify
 * - trust-graph
 * - trust-federation
 *
 * This module implements:
 * - sovereign licence issuance
 * - PQ-ready sealing
 * - trust-state evolution
 * - validation & attestation
 * - federated authority compliance
 */

import { TrustObject, createTrustObject, TrustIdentity } from "./trust-core.js";
import { sealTrustObject } from "./trust-crypto.js";
import { validateTrustObject, TrustAttestation } from "./trust-verify.js";
import { createInitialState, evaluateTrustState, TrustStateProfile } from "./trust-state.js";
import { TrustGraph, addTrustNode, propagateTrust } from "./trust-graph.js";
import { AuthorityRoot, federateAuthorities } from "./trust-federation.js";

/**
 * Licence object definition.
 */
export interface WFSLLicence {
  licenceId: string;
  issuedAt: string;
  expiresAt: string;
  trust: TrustObject;
  trustState: TrustStateProfile;
}

/**
 * Create a new sovereign WFSL licence.
 */
export function issueLicence(params: {
  identity: TrustIdentity;
  issuerAuthority: AuthorityRoot;
  expiresAt: string;
  graph?: TrustGraph;
}): WFSLLicence {
  const timestamp = new Date().toISOString();

  // Step 1: Create base trust object.
  let trust = createTrustObject({
    identity: params.identity,
    lineage: {
      parentRoots: [],
      derivedRoot: params.issuerAuthority.id,
      rotationReason: "licence-issuance",
      timestamp
    },
    pqEnabled: params.issuerAuthority.pqEnabled
  });

  // Step 2: Seal it cryptographically.
  trust = sealTrustObject(trust, params.issuerAuthority.pqEnabled);

  // Step 3: Initialise trust state.
  const state = createInitialState(trust.metric?.score ?? 50);

  // Step 4: Add to trust graph if provided.
  if (params.graph) {
    addTrustNode(params.graph, trust);
    propagateTrust(params.graph);
  }

  // Step 5: Build final licence.
  const licence: WFSLLicence = {
    licenceId: trust.identity.id + ":" + timestamp,
    issuedAt: timestamp,
    expiresAt: params.expiresAt,
    trust,
    trustState: state
  };

  return licence;
}

/**
 * Validate an existing licence and evolve its trust state.
 */
export function validateLicence(
  licence: WFSLLicence,
  graph?: TrustGraph
): TrustAttestation {
  const attestation = validateTrustObject(licence.trust);

  // Evolve trust state depending on attestation.
  licence.trustState = evaluateTrustState(licence.trust, licence.trustState);

  // Update trust graph if present.
  if (graph) {
    propagateTrust(graph);
  }

  return attestation;
}

/**
 * Renew a licence:
 * - extends expiry
 * - optionally reseals trust
 * - updates lineage if authority rotated roots
 */
export function renewLicence(
  licence: WFSLLicence,
  newExpiresAt: string,
  authority: AuthorityRoot
): WFSLLicence {
  const timestamp = new Date().toISOString();

  // Update lineage to latest authority root.
  licence.trust.lineage.parentRoots.push(licence.trust.lineage.derivedRoot);
  licence.trust.lineage.derivedRoot = authority.id;
  licence.trust.lineage.timestamp = timestamp;
  licence.trust.lineage.rotationReason = "renewal-root-update";

  // Reseal with updated lineage & crypto settings.
  licence.trust = sealTrustObject(licence.trust, authority.pqEnabled);

  // Extend expiry.
  licence.expiresAt = newExpiresAt;

  // Update trust state.
  licence.trustState = evaluateTrustState(licence.trust, licence.trustState);

  return licence;
}

/**
 * Federated licence validation:
 * Trust is merged from multiple authorities.
 */
export function validateFederatedLicence(
  licence: WFSLLicence,
  authorities: AuthorityRoot[]
): TrustAttestation {
  if (authorities.length < 2) {
    return validateTrustObject(licence.trust);
  }

  // Attempt federation.
  const fed = federateAuthorities(authorities[0], authorities[1]);
  if (!fed) {
    return {
      valid: false,
      sealValid: false,
      policyValid: false,
      lineageValid: false,
      metric: licence.trust.metric
        ? {
            score: licence.trust.metric.score,
            level: licence.trust.metric.riskLevel,
            reason: licence.trust.metric.reason
          }
        : undefined,
      details: {
        objectId: licence.trust.identity.id,
        authorityRoot: licence.trust.identity.authorityRoot,
        issuedAt: licence.trust.seal.issuedAt,
        checkedAt: new Date().toISOString()
      }
    };
  }

  // Validation under federated authority alignment.
  return validateTrustObject(licence.trust);
}
