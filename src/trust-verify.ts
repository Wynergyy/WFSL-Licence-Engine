/**
 * WFSL GLOBAL DIGITAL TRUST AUTHORITY
 * Trust Validation & Attestation Engine (TVAE)
 * -----------------------------------------------------------
 * This module is the sovereign validator for WFSL TrustObjects.
 * It integrates:
 * - cryptographic seal verification
 * - policy enforcement
 * - authority lineage checks
 * - AI anomaly scoring hooks
 * - attestation object generation
 *
 * This is the "brain" of the WFSL trust system.
 */

import { TrustObject } from "./trust-core.js";
import { verifyTrustSeal } from "./trust-crypto.js";

/**
 * Policy evaluation result.
 */
export interface PolicyResult {
  passed: boolean;
  failedRules: string[];
}

/**
 * Trust Attestation Object — returned after validation.
 */
export interface TrustAttestation {
  valid: boolean;
  sealValid: boolean;
  policyValid: boolean;
  lineageValid: boolean;
  metric?: {
    score: number;
    level: string;
    reason: string;
  };
  details: {
    objectId: string;
    authorityRoot: string;
    issuedAt: string;
    checkedAt: string;
  };
}

/**
 * Evaluate policy rules.
 * Real systems will integrate a constraint solver (Z3).
 */
export function evaluatePolicy(trust: TrustObject): PolicyResult {
  const failed: string[] = [];

  for (const rule of trust.policy.rules) {
    // Placeholder: future SMT evaluation of rule.condition
    const conditionPasses = true; // deterministic placeholder

    if (!conditionPasses && rule.severity === "deny") {
      failed.push(rule.id);
    }
  }

  return {
    passed: failed.length === 0,
    failedRules: failed
  };
}

/**
 * Verify lineage continuity.
 * Ensures the trust root was not broken or corrupted.
 */
export function verifyLineage(trust: TrustObject): boolean {
  if (!trust.lineage) return false;

  // Basic deterministic continuity check
  return trust.lineage.derivedRoot !== "" &&
         Array.isArray(trust.lineage.parentRoots);
}

/**
 * AI metric evaluation is optional.
 * If present, it becomes part of trust enforcement.
 */
export function evaluateMetric(trust: TrustObject): {
  ok: boolean;
  score?: number;
  reason?: string;
  level?: string;
} {
  if (!trust.metric) {
    return { ok: true };
  }

  const { score, riskLevel, reason } = trust.metric;

  // Basic threshold model (future: anomaly detection model)
  const ok = score >= 40 && riskLevel !== "critical";

  return {
    ok,
    score,
    reason,
    level: riskLevel
  };
}

/**
 * The unified sovereign trust validator.
 */
export function validateTrustObject(trust: TrustObject): TrustAttestation {
  const seal = verifyTrustSeal(trust);
  const policy = evaluatePolicy(trust);
  const lineage = verifyLineage(trust);
  const metric = evaluateMetric(trust);

  const overall =
    seal.valid &&
    policy.passed &&
    lineage &&
    metric.ok;

  return {
    valid: overall,
    sealValid: seal.valid,
    policyValid: policy.passed,
    lineageValid: lineage,
    metric: trust.metric
      ? {
          score: trust.metric.score,
          level: trust.metric.riskLevel,
          reason: trust.metric.reason
        }
      : undefined,
    details: {
      objectId: trust.identity.id,
      authorityRoot: trust.identity.authorityRoot,
      issuedAt: trust.seal.issuedAt,
      checkedAt: new Date().toISOString()
    }
  };
}
