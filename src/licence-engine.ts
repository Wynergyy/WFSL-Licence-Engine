import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";

/**
 * WFSL Licence Object Shape
 */
export interface Licence {
  id: string;
  contractor: string;
  issuedAt: string;
  expiresAt: string;
  signature: string;
}

/**
 * Generates a new licence with:
 * - unique ID
 * - contractor name
 * - timestamp
 * - expiry
 * - secure signature (SHA-256)
 */
export function generateLicence(contractor: string, expiryDate: string): Licence {
  const id = uuidv4();
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(expiryDate).toISOString();

  const raw = `${id}|${contractor}|${issuedAt}|${expiresAt}`;
  const signature = CryptoJS.SHA256(raw).toString();

  return {
    id,
    contractor,
    issuedAt,
    expiresAt,
    signature
  };
}

/**
 * Validates an existing licence.
 * - Checks expiry
 * - Verifies signature is correct
 */
export function validateLicence(licence: Licence): {
  valid: boolean;
  reason?: string;
} {
  const { id, contractor, issuedAt, expiresAt, signature } = licence;

  // Check expiry
  const now = new Date().getTime();
  if (now > new Date(expiresAt).getTime()) {
    return { valid: false, reason: "Licence has expired." };
  }

  // Rebuild original raw string
  const raw = `${id}|${contractor}|${issuedAt}|${expiresAt}`;
  const expectedSignature = CryptoJS.SHA256(raw).toString();

  if (signature !== expectedSignature) {
    return { valid: false, reason: "Signature mismatch. Licence may be tampered." };
  }

  return { valid: true };
}
