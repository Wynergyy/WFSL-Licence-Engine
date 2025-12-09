"use strict";
/**
 * WFSL GLOBAL DIGITAL TRUST AUTHORITY — CORE TRUST PRIMITIVES
 * -----------------------------------------------------------
 * This file defines the sovereign-grade trust structures used across:
 * - licensing
 * - compliance
 * - identity
 * - audit
 * - AI governance
 * - trust propagation
 * - federation
 * - post-quantum readiness
 *
 * NOTHING in the system exists above this layer.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrustObject = createTrustObject;
/**
 * TrustCore factory — generates a blank trust object template
 * which other WFSL systems extend (licensing, autonomy, audit, federation).
 */
function createTrustObject(base) {
    const timestamp = new Date().toISOString();
    return {
        trustVersion: base.pqEnabled ? "3.0-pq" : "2.0-sov",
        identity: base.identity,
        policy: base.policy ?? {
            version: "1.0",
            rules: []
        },
        lineage: base.lineage ?? {
            parentRoots: [],
            derivedRoot: base.identity.authorityRoot,
            rotationReason: "initialisation",
            timestamp
        },
        seal: {
            classicalSignature: "",
            pqSignature: base.pqEnabled ? "" : undefined,
            merkleAnchor: "",
            issuedAt: timestamp
        },
        metric: undefined
    };
}
