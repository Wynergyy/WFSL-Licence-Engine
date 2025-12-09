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
const mockEnv = {
  WSTP_REGISTRY: {
    store: new Map(),
    async put(k, v) { this.store.set(k, v); },
    async get(k) { return this.store.get(k) ?? null; }
  }
};

import { WFSLLicenceAuthority } from "../src/licence-authority.js";
import { WFSLLicenceRegistry } from "../src/licence-registry.js";
import { WFSLOfflineValidator } from "../src/offline-validator.js";
import { ActivationEngine } from "../src/activation-engine.js";

async function main() {
  console.log("=== WFSL Licence Engine Runtime Test ===");

  const authority = new WFSLLicenceAuthority(mockEnv);
  const registry = new WFSLLicenceRegistry(mockEnv);
  const validator = new WFSLOfflineValidator(mockEnv);
  const engine = new ActivationEngine(mockEnv);

  const licence = {
    id: "TEST",
    subject: "demo",
    issuedAt: Date.now()
  };

  registry.add(licence);

  console.log("Retrieved:", registry.get("TEST"));
  console.log("Validated:", validator.validate(licence));

  console.log("Activate:", await engine.activate("TEST"));

  console.log("=== Test Complete ===");
}

main();

