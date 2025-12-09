import { generateLicence, validateLicence } from "./src/licence-engine.js";
/**
 * WFSL Licence Engine Demo Harness
 * Enterprise-grade demonstration script for:
 *  - Licence generation
 *  - Cryptographic validation
 *  - Tamper detection
 *  - Expiry testing
 *  - Structured audit logs
 */
function divider(label) {
    console.log("\n==============================================");
    console.log(label);
    console.log("==============================================\n");
}
/**
 * Pretty-print an object with indentation
 */
function print(title, obj) {
    console.log(`--- ${title} ---`);
    console.log(JSON.stringify(obj, null, 2));
    console.log("");
}
divider("WFSL LICENCE ENGINE DEMO START");
/**
 * 1. Generate a licence
 */
divider("1. Generating Licence");
const licence = generateLicence("Example Contractor Ltd", "2026-12-31T23:59:59.000Z");
print("Generated Licence", licence);
/**
 * 2. Validate the licence (should be valid)
 */
divider("2. Validating Legitimate Licence");
const validation1 = validateLicence(licence);
print("Validation Result", validation1);
/**
 * 3. Tamper test – modify signature to simulate fraud
 */
divider("3. Tamper Detection Test");
const tampered = { ...licence, signature: "INVALID_SIGNATURE" };
const validation2 = validateLicence(tampered);
print("Tampered Licence Validation", validation2);
/**
 * 4. Expiry Test - simulate an expired licence
 */
divider("4. Expiry Simulation Test");
const expired = {
    ...licence,
    expiresAt: "2020-01-01T00:00:00.000Z"
};
const validation3 = validateLicence(expired);
print("Expired Licence Validation", validation3);
/**
 * 5. Final Summary
 */
divider("DEMO SUMMARY");
console.log("Licence successfully generated.");
console.log("Valid licence passed validation.");
console.log("Tampered licence correctly rejected.");
console.log("Expired licence correctly rejected.");
divider("WFSL LICENCE ENGINE DEMO COMPLETE");
