"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLicence = generateLicence;
exports.validateLicence = validateLicence;
const uuid_1 = require("uuid");
const crypto_js_1 = __importDefault(require("crypto-js"));
/**
 * Generates a new licence with:
 * - unique ID
 * - contractor name
 * - timestamp
 * - expiry
 * - secure signature (SHA-256)
 */
function generateLicence(contractor, expiryDate) {
    const id = (0, uuid_1.v4)();
    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(expiryDate).toISOString();
    const raw = `${id}|${contractor}|${issuedAt}|${expiresAt}`;
    const signature = crypto_js_1.default.SHA256(raw).toString();
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
function validateLicence(licence) {
    const { id, contractor, issuedAt, expiresAt, signature } = licence;
    // Check expiry
    const now = new Date().getTime();
    if (now > new Date(expiresAt).getTime()) {
        return { valid: false, reason: "Licence has expired." };
    }
    // Rebuild original raw string
    const raw = `${id}|${contractor}|${issuedAt}|${expiresAt}`;
    const expectedSignature = crypto_js_1.default.SHA256(raw).toString();
    if (signature !== expectedSignature) {
        return { valid: false, reason: "Signature mismatch. Licence may be tampered." };
    }
    return { valid: true };
}
