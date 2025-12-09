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

import CryptoJS from "crypto-js";
import { TrustObject, SealEnvelope } from "./trust-core.js";

/**
 * Utility: SHA-512 hashing for high integrity.
 */
export function sha512(input: string): string {
  return CryptoJS.SHA512(input).toString();
}

/**
 * Build a Merkle root from a list of hashes.
 * We keep this simple and deterministic.
 */
export function merkleRoot(leaves: string[]): string {
  if (leaves.length === 0) return sha512("wfsl-empty-root");

  let level = leaves.map(l => sha512(l));

  while (level.length > 1) {
    const next: string[] = [];

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
export function generatePQSignature(data: string): string {
  return sha512("pq-" + data); // temporary deterministic PQ placeholder
}

/**
 * Classical signature placeholder (to be replaced by ECDSA/Ed25519).
 */
export function generateClassicalSignature(data: string): string {
  return sha512("classical-" + data);
}

/**
 * Bind and seal a TrustObject with:
 * - classical signature
 * - post-quantum signature (optional)
 * - Merkle audit anchor
 */
export function sealTrustObject(
  trust: TrustObject,
  enablePostQuantum: boolean = false
): TrustObject {
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

  const sealed: SealEnvelope = {
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
export function verifyTrustSeal(
  trust: TrustObject
): {
  valid: boolean;
  reason: string;
} {
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

