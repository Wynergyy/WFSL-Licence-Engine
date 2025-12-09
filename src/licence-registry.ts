/**
 * WFSL LICENCE REGISTRY (WLR)
 * -----------------------------------------------------------
 * Enterprise-grade distributed licence registry.
 * Supports:
 * - local registry memory
 * - Cloudflare KV integration (future binding)
 * - revocation lists
 * - lookup, replace, audit trail
 * - PQ-sealed registry hashing
 *
 * This module forms the commercial backbone of WFSL licensing.
 */

import { sha512 } from "./trust-crypto.js";
import { WFSLLicence } from "./licence-authority.js";

/**
 * Registry entry with audit metadata.
 */
export interface RegistryEntry {
  licence: WFSLLicence;
  insertedAt: string;
  updatedAt: string;
  revoked: boolean;
  revokedAt?: string;
  reason?: string;
}

/**
 * The complete registry structure.
 * Supports local storage and future KV sync.
 */
export interface LicenceRegistry {
  store: Map<string, RegistryEntry>;
  registryHash: string; // PQ-ready integrity seal
}

/**
 * Create a new empty registry.
 */
export function createRegistry(): LicenceRegistry {
  return {
    store: new Map(),
    registryHash: sha512("registry-empty")
  };
}

/**
 * Recompute PQ-ready registry hash for integrity.
 */
function updateRegistryHash(reg: LicenceRegistry): void {
  const material = Array.from(reg.store.values())
    .map(e =>
      JSON.stringify({
        id: e.licence.licenceId,
        revoked: e.revoked,
        updated: e.updatedAt
      })
    )
    .sort()
    .join("|");

  reg.registryHash = sha512("registry-" + material);
}

/**
 * Insert a new licence into the registry.
 */
export function registerLicence(
  reg: LicenceRegistry,
  licence: WFSLLicence
): void {
  const timestamp = new Date().toISOString();

  const entry: RegistryEntry = {
    licence,
    insertedAt: timestamp,
    updatedAt: timestamp,
    revoked: false
  };

  reg.store.set(licence.licenceId, entry);
  updateRegistryHash(reg);
}

/**
 * Lookup a licence by ID.
 */
export function getLicence(
  reg: LicenceRegistry,
  licenceId: string
): RegistryEntry | null {
  return reg.store.get(licenceId) ?? null;
}

/**
 * Revoke a licence.
 */
export function revokeLicence(
  reg: LicenceRegistry,
  licenceId: string,
  reason: string
): boolean {
  const entry = reg.store.get(licenceId);
  if (!entry || entry.revoked) return false;

  entry.revoked = true;
  entry.revokedAt = new Date().toISOString();
  entry.reason = reason;
  entry.updatedAt = entry.revokedAt;

  updateRegistryHash(reg);
  return true;
}

/**
 * List all active licences.
 */
export function listActiveLicences(reg: LicenceRegistry): WFSLLicence[] {
  return Array.from(reg.store.values())
    .filter(e => !e.revoked)
    .map(e => e.licence);
}

/**
 * Export audit packet for offline validation.
 * This is crucial for enterprise and regulatory compliance.
 */
export function exportAuditPacket(reg: LicenceRegistry): {
  timestamp: string;
  count: number;
  registryHash: string;
  entries: Array<{
    id: string;
    revoked: boolean;
    updated: string;
  }>;
} {
  return {
    timestamp: new Date().toISOString(),
    count: reg.store.size,
    registryHash: reg.registryHash,
    entries: Array.from(reg.store.values()).map(e => ({
      id: e.licence.licenceId,
      revoked: e.revoked,
      updated: e.updatedAt
    }))
  };
}
