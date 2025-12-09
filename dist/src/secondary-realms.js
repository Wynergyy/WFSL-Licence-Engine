"use strict";
/**
 * WYNERGY SYSTEMS — FEDERATED REALMS
 * Secondary Authority Realms (SAR)
 * -----------------------------------------------------------
 * This module defines three production-grade secondary realms:
 *
 * - WFSL_REALM
 * - SAS_CIC_REALM
 * - WYNERGY_COMPLIANCE_REALM
 *
 * Each realm:
 * - Generates an authority identity
 * - Produces an RSA keypair
 * - Derives lineage from the sovereign root
 * - Prepares for cross-realm federation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WYNERGY_COMPLIANCE_REALM = exports.SAS_CIC_REALM = exports.WFSL_REALM = void 0;
exports.createRealmAuthority = createRealmAuthority;
const trust_crypto_js_1 = require("./trust-crypto.js");
const crypto_1 = __importDefault(require("crypto"));
const authority_root_js_1 = require("./authority-root.js");
/**
 * Create a new authority realm derived from the sovereign root.
 */
function createRealmAuthority(realmName, pqEnabled = true) {
    const { publicKey, privateKey } = crypto_1.default.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });
    const timestamp = new Date().toISOString();
    const idMaterial = publicKey + "|" + timestamp + "|" + realmName;
    const realmId = (0, trust_crypto_js_1.sha512)(idMaterial).slice(0, 48);
    const lineage = {
        parentRoots: [authority_root_js_1.WYNERGY_SOVEREIGN_ROOT.id],
        derivedRoot: realmId,
        rotationReason: "sovereign-derived",
        timestamp
    };
    const authoritySeal = (0, trust_crypto_js_1.sha512)(JSON.stringify({
        id: realmId,
        realmName,
        publicKey,
        pqEnabled,
        parent: authority_root_js_1.WYNERGY_SOVEREIGN_ROOT.id,
        timestamp
    }));
    return {
        id: realmId,
        name: realmName,
        publicKey,
        privateKey,
        createdAt: timestamp,
        pqEnabled,
        lineage,
        authoritySeal
    };
}
/**
 * Production Realms
 * -----------------------------------------------------------
 * These are the live authority realms that will federate under
 * the Wynergy Sovereign Trust Platform.
 */
exports.WFSL_REALM = createRealmAuthority("WFSL_REALM");
exports.SAS_CIC_REALM = createRealmAuthority("SAS_CIC_REALM");
exports.WYNERGY_COMPLIANCE_REALM = createRealmAuthority("WYNERGY_COMPLIANCE_REALM");
