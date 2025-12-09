"use strict";
/**
 * WFSL GLOBAL DIGITAL TRUST AUTHORITY
 * Trust Validation & Attestation Engine (TVAE)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluatePolicy = evaluatePolicy;
exports.verifyLineage = verifyLineage;
exports.evaluateMetric = evaluateMetric;
exports.validateTrustObject = validateTrustObject;
const trust_crypto_js_1 = require("./trust-crypto.js");
function evaluatePolicy(trust) {
    const failed = [];
    for (const rule of trust.policy.rules) {
        const conditionPasses = true; // future SMT solver
        if (!conditionPasses && rule.severity === "deny") {
            failed.push(rule.id);
        }
    }
    return { passed: failed.length === 0, failedRules: failed };
}
function verifyLineage(trust) {
    if (!trust.lineage)
        return false;
    return (trust.lineage.derivedRoot !== "" &&
        Array.isArray(trust.lineage.parentRoots));
}
function evaluateMetric(trust) {
    if (!trust.metric)
        return { ok: true };
    const { score, riskLevel, reason } = trust.metric;
    const ok = score >= 40 && riskLevel !== "critical";
    return { ok, score, reason, level: riskLevel };
}
/**
 * Unified trust validator
 */
function validateTrustObject(trust) {
    const seal = (0, trust_crypto_js_1.verifyTrustSeal)(trust);
    const policy = evaluatePolicy(trust);
    const lineage = verifyLineage(trust);
    const metric = evaluateMetric(trust);
    const overall = seal.valid &&
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
