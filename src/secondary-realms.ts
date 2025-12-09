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
 * WYNERGY SYSTEMS — FEDERATED REALMS
 * Secondary Authority Realms (SAR)
 * -----------------------------------------------------------
 * This module defines three production-grade secondary realms:
 *
 * - WFSL_REALM
 * - SAS_CIC_REALM
 * - WYNERGY_COMPLIANCE_REALM
 *
 * Each realm:
 * - Generates an authority identity
 * - Produces an RSA keypair
 * - Derives lineage from the sovereign root
 * - Prepares for cross-realm federation
 */

import { sha512 } from "./trust-crypto.js";
import { TrustLineage } from "./trust-core.js";
import crypto from "crypto";
import { WYNERGY_SOVEREIGN_ROOT } from "./authority-root.js";

/**
 * Generic realm authority descriptor.
 */
export interface RealmAuthority {
  id: string;
  name: string;
  publicKey: string;
  privateKey: string;
  createdAt: string;
  pqEnabled: boolean;
  lineage: TrustLineage;
  authoritySeal: string;
}

/**
 * Create a new authority realm derived from the sovereign root.
 */
export function createRealmAuthority(
  realmName: string,
  pqEnabled: boolean = true
): RealmAuthority {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });

  const timestamp = new Date().toISOString();

  const idMaterial = publicKey + "|" + timestamp + "|" + realmName;
  const realmId = sha512(idMaterial).slice(0, 48);

  const lineage: TrustLineage = {
    parentRoots: [WYNERGY_SOVEREIGN_ROOT.id],
    derivedRoot: realmId,
    rotationReason: "sovereign-derived",
    timestamp
  };

  const authoritySeal = sha512(
    JSON.stringify({
      id: realmId,
      realmName,
      publicKey,
      pqEnabled,
      parent: WYNERGY_SOVEREIGN_ROOT.id,
      timestamp
    })
  );

  return {
    id: realmId,
    name: realmName,
    publicKey,
    privateKey,
    createdAt: timestamp,
    pqEnabled,
    lineage,
    authoritySeal
  };
}

/**
 * Production Realms
 * -----------------------------------------------------------
 * These are the live authority realms that will federate under
 * the Wynergy Sovereign Trust Platform.
 */

export const WFSL_REALM = createRealmAuthority("WFSL_REALM");
export const SAS_CIC_REALM = createRealmAuthority("SAS_CIC_REALM");
export const WYNERGY_COMPLIANCE_REALM = createRealmAuthority("WYNERGY_COMPLIANCE_REALM");

