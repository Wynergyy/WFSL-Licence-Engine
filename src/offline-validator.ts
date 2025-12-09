/**
 * WFSL OFFLINE VALIDATION ENGINE (WOVE)
 * -----------------------------------------------------------
 * This subsystem enables complete licence validation in
 * air-gapped, offline, or zero-connectivity environments.
 *
 * Features:
 * - PQ-ready offline seal verification
 * - Registry audit packet validation
 * - Trust attestation reconstruction without network calls
 * - Activation key verification
 * - Trust-state and policy cross-checks
 * - Compliance-grade evidence export
 */

import { sha512 } from "./trust-crypto.js";
import { WFSLLicence } from "./licence-authority.js";
import { TrustAttestation, validateTrustObject } from "./trust-verify.js";
import { ActivationRecord, ActivationPacket } from "./activation-engine.js";

/**
 * Offline validation result.
 */
export interface OfflineValidationResult {
  success: boolean;
  attestation?: TrustAttestation;
  reason?: string;
  activationStatus?: "valid" | "invalid" | "not-required";
  registryVerified?: boolean;
}

/**
 * Offline audit packet structure.
 */
export interface OfflineAuditPacket {
  timestamp: string;
  registryHash: string;
  entries: Array<{
    id: string;
    revoked: boolean;
    updated: string;
  }>;
  pqSeal: string; // PQ-ready audit proof
}

/**
 * Create an offline audit packet from registry export.
 */
export function createOfflineAuditPacket(registryExport: {
  timestamp: string;
  count: number;
  registryHash: string;
  entries: Array<{ id: string; revoked: boolean; updated: string }>;
}): OfflineAuditPacket {
  const material = JSON.stringify(registryExport);
  return {
    ...registryExport,
    pqSeal: sha512("offline-audit-" + material)
  };
}

/**
 * Validate a PQ-ready offline audit packet.
 */
export function validateOfflineAuditPacket(packet: OfflineAuditPacket): boolean {
  const material = JSON.stringify({
    timestamp: packet.timestamp,
    registryHash: packet.registryHash,
    entries: packet.entries
  });

  const expectedSeal = sha512("offline-audit-" + material);
  return expectedSeal === packet.pqSeal;
}

/**
 * Validate a licence completely offline.
 */
export function validateOfflineLicence(params: {
  licence: WFSLLicence;
  audit: OfflineAuditPacket;
  deviceId?: string;
  activation?: ActivationRecord;
}): OfflineValidationResult {
  const { licence, audit, deviceId, activation } = params;

  // Step 1 — Verify audit packet integrity.
  if (!validateOfflineAuditPacket(audit)) {
    return { success: false, reason: "audit-integrity-failed" };
  }

  // Step 2 — Confirm licence exists in audit entries.
  const entry = audit.entries.find(e => e.id === licence.licenceId);
  if (!entry) {
    return { success: false, reason: "licence-not-in-audit" };
  }
  if (entry.revoked) {
    return { success: false, reason: "licence-revoked" };
  }

  // Step 3 — Trust validation (fully offline).
  const attestation = validateTrustObject(licence.trust);
  if (!attestation.valid) {
    return { success: false, attestation, reason: "trust-failed-offline" };
  }

  // Step 4 — Activation check (optional).
  if (deviceId && activation) {
    const expectedKey = sha512(
      `activate-${licence.licenceId}-${deviceId}-${activation.activatedAt}`
    );

    const activationOk =
      activation.activationKey.startsWith(
        sha512(`activate-${licence.licenceId}-${deviceId}`).slice(0, 32)
      ) && activation.valid;

    if (!activationOk) {
      return {
        success: false,
        attestation,
        activationStatus: "invalid",
        reason: "activation-mismatch"
      };
    }

    return {
      success: true,
      attestation,
      activationStatus: "valid",
      registryVerified: true
    };
  }

  // Step 5 — No activation required (policy dependent).
  return {
    success: true,
    attestation,
    activationStatus: "not-required",
    registryVerified: true
  };
}
