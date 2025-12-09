/**
 * WFSL ACTIVATION ENGINE (WAE)
 * -----------------------------------------------------------
 * This subsystem handles the activation lifecycle for a WFSL licence.
 * It manages:
 * - device binding & activation keys
 * - offline activation packets
 * - PQ-ready activation hash seals
 * - policy and trust-state based activation control
 * - activation audit entries
 */

import { sha512 } from "./trust-crypto.js";
import { WFSLLicence } from "./licence-authority.js";
import { RegistryEntry } from "./licence-registry.js";
import { TrustAttestation, validateTrustObject } from "./trust-verify.js";

/**
 * Device activation record.
 */
export interface ActivationRecord {
  deviceId: string;                // hashed hardware ID or fingerprint
  activationKey: string;           // PQ-sealed
  activatedAt: string;
  valid: boolean;
  reason?: string;                 // explains failure
}

/**
 * Offline activation packet — used when activation servers are unreachable.
 */
export interface ActivationPacket {
  licenceId: string;
  deviceId: string;
  timestamp: string;
  pqSeal: string;                  // PQ-ready integrity seal
}

/**
 * Activation result.
 */
export interface ActivationResult {
  success: boolean;
  activation?: ActivationRecord;
  attestation?: TrustAttestation;
  reason?: string;
}

/**
 * Generate PQ-sealed activation key.
 */
function generateActivationKey(licenceId: string, deviceId: string): string {
  return sha512(`activate-${licenceId}-${deviceId}-${Date.now()}`);
}

/**
 * Create an offline activation packet.
 */
export function createActivationPacket(
  licence: WFSLLicence,
  deviceId: string
): ActivationPacket {
  const timestamp = new Date().toISOString();

  return {
    licenceId: licence.licenceId,
    deviceId,
    timestamp,
    pqSeal: sha512(
      `packet-${licence.licenceId}-${deviceId}-${timestamp}`
    )
  };
}

/**
 * Validate an offline activation packet against registry entry.
 */
export function validateActivationPacket(
  packet: ActivationPacket,
  entry: RegistryEntry
): ActivationResult {
  // Basic PQ-ready integrity check.
  const expectedSeal = sha512(
    `packet-${packet.licenceId}-${packet.deviceId}-${packet.timestamp}`
  );

  if (packet.pqSeal !== expectedSeal) {
    return { success: false, reason: "integrity-failure" };
  }

  // Ensure licence exists and is not revoked.
  if (entry.revoked) {
    return { success: false, reason: "licence-revoked" };
  }

  // Trust validation.
  const attestation = validateTrustObject(entry.licence.trust);
  if (!attestation.valid) {
    return { success: false, attestation, reason: "trust-validation-failed" };
  }

  const activation: ActivationRecord = {
    deviceId: packet.deviceId,
    activationKey: generateActivationKey(packet.licenceId, packet.deviceId),
    activatedAt: new Date().toISOString(),
    valid: true
  };

  return {
    success: true,
    activation,
    attestation
  };
}

/**
 * Direct activation without packet (e.g., online activation server).
 */
export function activateLicence(
  entry: RegistryEntry,
  deviceId: string
): ActivationResult {
  if (entry.revoked) {
    return { success: false, reason: "licence-revoked" };
  }

  // Validate trust posture of the licence.
  const attestation = validateTrustObject(entry.licence.trust);
  if (!attestation.valid) {
    return { success: false, attestation, reason: "trust-validation-failed" };
  }

  const activation: ActivationRecord = {
    deviceId,
    activationKey: generateActivationKey(entry.licence.licenceId, deviceId),
    activatedAt: new Date().toISOString(),
    valid: true
  };

  return {
    success: true,
    activation,
    attestation
  };
}
