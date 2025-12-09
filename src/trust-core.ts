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

export type TrustVersion = "1.0" | "1.1" | "2.0-sov" | "3.0-pq";

/**
 * Core cryptographic identity for any entity:
 * - humans
 * - companies
 * - devices
 * - AI agents
 * - services
 * - systems
 */
export interface TrustIdentity {
  id: string;                    // globally unique DID-style identifier
  type: "human" | "company" | "device" | "service" | "ai-agent";
  authorityRoot: string;         // the issuing sovereign authority root
  createdAt: string;             // ISO timestamp
  publicKey: string;             // canonical public key for verification
}

/**
 * Post-quantum seal envelope.
 * Supports transition from classical crypto to PQ-safe KEM + signatures.
 */
export interface SealEnvelope {
  classicalSignature: string;    // ECDSA or Ed25519
  pqSignature?: string;          // Dilithium / Falcon / SPHINCS+
  merkleAnchor: string;          // root of audit Merkle structure
  issuedAt: string;              // ISO timestamp
  expiresAt?: string;            // optional PQ-transition expiry
}

/**
 * AI-scored trust metric for autonomous governance and risk engines.
 */
export interface TrustMetric {
  score: number;                 // 0–100 confidence score
  riskLevel: "low" | "medium" | "high" | "critical";
  reason: string;                // AI explanation
  updatedAt: string;             // ISO timestamp
}

/**
 * Policy binding structure — defines trust rules, constraints and compliance.
 * Combined with a future SMT (Z3) policy solver for deterministic evaluation.
 */
export interface TrustPolicy {
  version: string;
  rules: Array<{
    id: string;
    description: string;
    condition: string;           // logical expression for solver
    severity: "info" | "warn" | "deny";
  }>;
}

/**
 * Distributed Trust Lineage — provides cryptographic ancestry.
 * Ensures continuity of trust even across authority rotations or splits.
 */
export interface TrustLineage {
  parentRoots: string[];         // previous sovereign roots
  derivedRoot: string;           // new active root
  rotationReason: string;        // security, PQ upgrade, breach isolation, etc.
  timestamp: string;
}

/**
 * Trust Object — the sovereign trust primitive for the entire WFSL ecosystem.
 * Licences, identities, audits, AI-agents, devices all extend this.
 */
export interface TrustObject {
  trustVersion: TrustVersion;
  identity: TrustIdentity;       // bound actor/entity identity
  policy: TrustPolicy;           // what rules govern this object
  lineage: TrustLineage;         // authority continuity and root provenance
  seal: SealEnvelope;            // cryptographic integrity envelope
  metric?: TrustMetric;          // optional AI-governed trust evaluation
}

/**
 * TrustCore factory — generates a blank trust object template
 * which other WFSL systems extend (licensing, autonomy, audit, federation).
 */
export function createTrustObject(base: {
  identity: TrustIdentity;
  policy?: TrustPolicy;
  lineage?: TrustLineage;
  pqEnabled?: boolean;
}): TrustObject {
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

