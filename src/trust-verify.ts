/**
 * Wynergy Sovereign Trust Platform (WSTP)
 * Envelope Verification Engine
 *
 * This module validates a LicenceEnvelope against a TrustState.
 * It is intentionally deterministic so it can run inside:
 * - Cloudflare Workers
 * - Offline validators
 * - Local activation engines
 *
 * Required exports:
 *  - validateEnvelope()
 */

import CryptoJS from "crypto-js";
import { TrustCoreObject } from "./trust-core";

/**
 * Envelope shape as used by validation-api.ts
 */
export interface LicenceEnvelope {
  id: string;
  issuedAt: number;
  expiresAt: number;
  payload: any;
  signature: string;
  machineHash?: string;
}

/**
 * Result of validation.
 */
export interface EnvelopeValidationResult {
  ok: boolean;
  reasons: string[];
  sealValid: boolean;
  expired: boolean;
  machineMismatch: boolean;
}

/**
 * Deterministic SHA-512 hashing for envelope sealing.
 */
function hashEnvelope(env: LicenceEnvelope): string {
  const canonical = JSON.stringify({
    id: env.id,
    issuedAt: env.issuedAt,
    expiresAt: env.expiresAt,
    payload: env.payload
  });

  return CryptoJS.SHA512(canonical).toString(CryptoJS.enc.Hex);
}

/**
 * Signature verify using TrustCoreObject public key.
 * For now we use deterministic SHA-512, not RSA/PQ.
 */
function verifySignature(
  env: LicenceEnvelope,
  trust: TrustCoreObject
): boolean {
  const expectedHash = hashEnvelope(env);
  return env.signature === expectedHash;
}

/**
 * Validate a LicenceEnvelope.
 */
export function validateEnvelope(
  env: LicenceEnvelope,
  trustState: TrustCoreObject
): EnvelopeValidationResult {
  const reasons: string[] = [];

  // 1. Expiration check
  const now = Date.now();
  const expired = env.expiresAt < now;
  if (expired) reasons.push("EXPIRED");

  // 2. Seal validation
  const sealValid = verifySignature(env, trustState);
  if (!sealValid) reasons.push("INVALID_SIGNATURE");

  // 3. Optional machine binding
  let machineMismatch = false;
  if (env.machineHash && trustState.machineHash) {
    machineMismatch = env.machineHash !== trustState.machineHash;
    if (machineMismatch) reasons.push("MACHINE_MISMATCH");
  }

  const ok = !expired && sealValid && !machineMismatch;

  return {
    ok,
    reasons,
    sealValid,
    expired,
    machineMismatch
  };
}
