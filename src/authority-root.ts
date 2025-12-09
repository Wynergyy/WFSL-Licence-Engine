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

import { sha512 } from "./trust-crypto.js";
import { TrustLineage } from "./trust-core.js";
import crypto from "crypto";

/**
 * Sovereign authority root descriptor.
 */
export interface SovereignAuthorityRoot {
  id: string;               // Unique sovereign identifier
  name: string;             // Legal or cryptographic realm
  publicKey: string;        // RSA public key (PEM)
  privateKey: string;       // RSA private key (PEM) — secure storage only
  createdAt: string;
  pqEnabled: boolean;       // PQ transition flag
  lineage: TrustLineage;
  authoritySeal: string;    // Cryptographic seal for root identity
}

/**
 * Generate the Wynergy sovereign authority root.
 */
export function generateSovereignAuthorityRoot(
  name: string = "WYNERGY_SOVEREIGN_ROOT",
  pqEnabled: boolean = true
): SovereignAuthorityRoot {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });

  const timestamp = new Date().toISOString();

  // Derive unique ID from public key + timestamp
  const idMaterial = publicKey + "|" + timestamp;
  const rootId = sha512(idMaterial).slice(0, 48);

  // Create lineage descriptor
  const lineage: TrustLineage = {
    parentRoots: [],
    derivedRoot: rootId,
    rotationReason: "root-origin",
    timestamp
  };

  // Produce sovereign authority seal
  const authoritySeal = sha512(
    JSON.stringify({
      id: rootId,
      name,
      publicKey,
      pqEnabled,
      timestamp
    })
  );

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
export const WYNERGY_SOVEREIGN_ROOT = generateSovereignAuthorityRoot();
