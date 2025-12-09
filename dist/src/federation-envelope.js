"use strict";
/**
 * WYNERGY SYSTEMS — GLOBAL FEDERATION ENVELOPE
 * Production Federation Builder (PFB)
 * -----------------------------------------------------------
 * This module creates the real, production-grade federation
 * envelope for the Wynergy Sovereign Trust Platform.
 *
 * It federates:
 *  - WYNERGY_SOVEREIGN_ROOT
 *  - WFSL_REALM
 *  - SAS_CIC_REALM
 *  - WYNERGY_COMPLIANCE_REALM
 *
 * The resulting envelope:
 *  - binds all realms into one trust fabric
 *  - includes PQ-safe integrity sealing
 *  - defines trust weights
 *  - includes unified lineage merging
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSTP_PRODUCTION_FEDERATION = void 0;
exports.createProductionFederationEnvelope = createProductionFederationEnvelope;
const trust_crypto_js_1 = require("./trust-crypto.js");
const authority_root_js_1 = require("./authority-root.js");
const secondary_realms_js_1 = require("./secondary-realms.js");
/**
 * Create a merged lineage hash for all authorities.
 */
function computeMergedLineage() {
    const material = authority_root_js_1.WYNERGY_SOVEREIGN_ROOT.id +
        secondary_realms_js_1.WFSL_REALM.id +
        secondary_realms_js_1.SAS_CIC_REALM.id +
        secondary_realms_js_1.WYNERGY_COMPLIANCE_REALM.id;
    return (0, trust_crypto_js_1.sha512)("merged-lineage|" + material).slice(0, 64);
}
/**
 * Create the final production federation envelope.
 */
function createProductionFederationEnvelope() {
    const timestamp = new Date().toISOString();
    const idMaterial = [
        authority_root_js_1.WYNERGY_SOVEREIGN_ROOT.id,
        secondary_realms_js_1.WFSL_REALM.id,
        secondary_realms_js_1.SAS_CIC_REALM.id,
        secondary_realms_js_1.WYNERGY_COMPLIANCE_REALM.id,
        timestamp
    ].join("|");
    const envelopeId = (0, trust_crypto_js_1.sha512)(idMaterial).slice(0, 48);
    const mergedLineage = computeMergedLineage();
    // Trust weight model (future: dynamic AI weighting)
    const trustWeights = {
        sovereign: 1.0,
        wfsl: 0.92,
        sasCic: 0.88,
        wynergyCompliance: 0.90
    };
    // Federation policy for cross-domain licence governance
    const policy = "wynergy-global-federation-v1";
    const pqSeal = (0, trust_crypto_js_1.sha512)(JSON.stringify({
        envelopeId,
        authorities: idMaterial,
        mergedLineage,
        trustWeights,
        policy,
        timestamp
    }));
    return {
        id: envelopeId,
        createdAt: timestamp,
        authorities: {
            sovereign: authority_root_js_1.WYNERGY_SOVEREIGN_ROOT.id,
            wfsl: secondary_realms_js_1.WFSL_REALM.id,
            sasCic: secondary_realms_js_1.SAS_CIC_REALM.id,
            wynergyCompliance: secondary_realms_js_1.WYNERGY_COMPLIANCE_REALM.id
        },
        trustWeights,
        mergedLineageRoot: mergedLineage,
        pqSeal,
        policy
    };
}
/**
 * Exported live federation envelope.
 * This will be stored in Cloudflare KV during deployment.
 */
exports.WSTP_PRODUCTION_FEDERATION = createProductionFederationEnvelope();
