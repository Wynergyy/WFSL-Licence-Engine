"use strict";
/**
 * WYNERGY SYSTEMS — SOVEREIGN TRUST AUTHORITY
 * Authority Root Generator (ARG)
 * -----------------------------------------------------------
 * This module defines the sovereign authority root for the
 * Wynergy Trust Kernel. It generates:
 *
 * - Sovereign authority identity
 * - Public/private keypair (RSA 4096)
 * - Lineage descriptor
 * - PQ transition marker
 * - Authority seal (SHA-512)
 *
 * All downstream realms federate from this sovereign root.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WYNERGY_SOVEREIGN_ROOT = void 0;
exports.generateSovereignAuthorityRoot = generateSovereignAuthorityRoot;
const trust_crypto_js_1 = require("./trust-crypto.js");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generate the Wynergy sovereign authority root.
 */
function generateSovereignAuthorityRoot(name = "WYNERGY_SOVEREIGN_ROOT", pqEnabled = true) {
    const { publicKey, privateKey } = crypto_1.default.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });
    const timestamp = new Date().toISOString();
    // Derive unique ID from public key + timestamp
    const idMaterial = publicKey + "|" + timestamp;
    const rootId = (0, trust_crypto_js_1.sha512)(idMaterial).slice(0, 48);
    // Create lineage descriptor
    const lineage = {
        parentRoots: [],
        derivedRoot: rootId,
        rotationReason: "root-origin",
        timestamp
    };
    // Produce sovereign authority seal
    const authoritySeal = (0, trust_crypto_js_1.sha512)(JSON.stringify({
        id: rootId,
        name,
        publicKey,
        pqEnabled,
        timestamp
    }));
    return {
        id: rootId,
        name,
        publicKey,
        privateKey,
        createdAt: timestamp,
        pqEnabled,
        lineage,
        authoritySeal
    };
}
/**
 * Exported default instance — this becomes the live sovereign root.
 */
exports.WYNERGY_SOVEREIGN_ROOT = generateSovereignAuthorityRoot();
