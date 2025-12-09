/**
 * WFSL Licence Engine — Proprietary Software
 * Copyright (c) Wynergy Fibre Solutions Ltd.
 * All rights reserved.
 *
 * This source code is licensed under the WFSL Proprietary Software Licence v1.0.
 * Unauthorised use, copying, modification, distribution, or hosting is prohibited.
 *
 * For licensing or commercial enquiries, contact:
 * legal@wynergy.co.uk
 */
/**
 * WFSL GLOBAL DIGITAL TRUST AUTHORITY
 * Trust Validation & Attestation Engine (TVAE)
 */

import { TrustObject } from "./trust-core.js";
import { verifyTrustSeal } from "./trust-crypto.js";

export interface PolicyResult {
  passed: boolean;
  failedRules: string[];
}

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

export function evaluatePolicy(trust: TrustObject): PolicyResult {
  const failed: string[] = [];
  for (const rule of trust.policy.rules) {
    const conditionPasses = true; // future SMT solver
    if (!conditionPasses && rule.severity === "deny") {
      failed.push(rule.id);
    }
  }
  return { passed: failed.length === 0, failedRules: failed };
}

export function verifyLineage(trust: TrustObject): boolean {
  if (!trust.lineage) return false;
  return (
    trust.lineage.derivedRoot !== "" &&
    Array.isArray(trust.lineage.parentRoots)
  );
}

export function evaluateMetric(trust: TrustObject) {
  if (!trust.metric) return { ok: true };
  const { score, riskLevel, reason } = trust.metric;
  const ok = score >= 40 && riskLevel !== "critical";
  return { ok, score, reason, level: riskLevel };
}

/**
 * Unified trust validator
 */
export function validateTrustObject(
  trust: TrustObject
): TrustAttestation {
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

