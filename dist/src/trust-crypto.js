"use strict";
/**
 * WFSL GLOBAL DIGITAL TRUST AUTHORITY
 * Sovereign Cryptographic Runtime (SCR)
 * -----------------------------------------------------------
 * This module provides the cryptographic primitives that seal,
 * verify, and anchor TrustObjects with:
 * - Merkle-chain audit proofs
 * - Hybrid classical + post-quantum signatures
 * - Identity and authority lineage binding
 *
 * This becomes the cryptographic centre of the WFSL Trust Layer.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha512 = sha512;
exports.merkleRoot = merkleRoot;
exports.generatePQSignature = generatePQSignature;
exports.generateClassicalSignature = generateClassicalSignature;
exports.sealTrustObject = sealTrustObject;
exports.verifyTrustSeal = verifyTrustSeal;
const crypto_js_1 = __importDefault(require("crypto-js"));
/**
 * Utility: SHA-512 hashing for high integrity.
 */
function sha512(input) {
    return crypto_js_1.default.SHA512(input).toString();
}
/**
 * Build a Merkle root from a list of hashes.
 * We keep this simple and deterministic.
 */
function merkleRoot(leaves) {
    if (leaves.length === 0)
        return sha512("wfsl-empty-root");
    let level = leaves.map(l => sha512(l));
    while (level.length > 1) {
        const next = [];
        for (let i = 0; i < level.length; i += 2) {
            const left = level[i];
            const right = level[i + 1] ?? left; // mirror node if odd count
            next.push(sha512(left + right));
        }
        level = next;
    }
    return level[0];
}
/**
 * Placeholder PQ-safe signature generator.
 * In future this will integrate Kyber/Dilithium.
 */
function generatePQSignature(data) {
    return sha512("pq-" + data); // temporary deterministic PQ placeholder
}
/**
 * Classical signature placeholder (to be replaced by ECDSA/Ed25519).
 */
function generateClassicalSignature(data) {
    return sha512("classical-" + data);
}
/**
 * Bind and seal a TrustObject with:
 * - classical signature
 * - post-quantum signature (optional)
 * - Merkle audit anchor
 */
function sealTrustObject(trust, enablePostQuantum = false) {
    const timestamp = new Date().toISOString();
    // Serialize essential fields for sealing
    const payload = JSON.stringify({
        id: trust.identity.id,
        policy: trust.policy,
        root: trust.lineage.derivedRoot,
        time: timestamp
    });
    const classical = generateClassicalSignature(payload);
    const pq = enablePostQuantum ? generatePQSignature(payload) : undefined;
    const anchor = merkleRoot([
        classical,
        pq ?? "",
        trust.identity.publicKey,
        trust.lineage.derivedRoot,
        timestamp
    ]);
    const sealed = {
        classicalSignature: classical,
        pqSignature: pq,
        merkleAnchor: anchor,
        issuedAt: timestamp,
        expiresAt: trust.seal.expiresAt
    };
    return {
        ...trust,
        seal: sealed
    };
}
/**
 * Verify seal integrity.
 */
function verifyTrustSeal(trust) {
    const envelope = trust.seal;
    const timestamp = envelope.issuedAt;
    const payload = JSON.stringify({
        id: trust.identity.id,
        policy: trust.policy,
        root: trust.lineage.derivedRoot,
        time: timestamp
    });
    const expectedClassical = generateClassicalSignature(payload);
    if (expectedClassical !== envelope.classicalSignature) {
        return { valid: false, reason: "classical-signature-mismatch" };
    }
    if (envelope.pqSignature) {
        const expectedPQ = generatePQSignature(payload);
        if (expectedPQ !== envelope.pqSignature) {
            return { valid: false, reason: "pq-signature-mismatch" };
        }
    }
    const expectedAnchor = merkleRoot([
        envelope.classicalSignature,
        envelope.pqSignature ?? "",
        trust.identity.publicKey,
        trust.lineage.derivedRoot,
        timestamp
    ]);
    if (expectedAnchor !== envelope.merkleAnchor) {
        return { valid: false, reason: "merkle-anchor-mismatch" };
    }
    return { valid: true, reason: "ok" };
}
