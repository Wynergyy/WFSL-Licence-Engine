"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mockEnv = {
    WSTP_REGISTRY: {
        store: new Map(),
        async put(k, v) { this.store.set(k, v); },
        async get(k) { return this.store.get(k) ?? null; }
    }
};
const licence_authority_js_1 = require("../src/licence-authority.js");
const licence_registry_js_1 = require("../src/licence-registry.js");
const offline_validator_js_1 = require("../src/offline-validator.js");
const activation_engine_js_1 = require("../src/activation-engine.js");
async function main() {
    console.log("=== WFSL Licence Engine Runtime Test ===");
    const authority = new licence_authority_js_1.WFSLLicenceAuthority(mockEnv);
    const registry = new licence_registry_js_1.WFSLLicenceRegistry(mockEnv);
    const validator = new offline_validator_js_1.WFSLOfflineValidator(mockEnv);
    const engine = new activation_engine_js_1.ActivationEngine(mockEnv);
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
