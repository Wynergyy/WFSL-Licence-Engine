"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WFSLOfflineValidator = void 0;
class WFSLOfflineValidator {
    constructor(env) {
        this.env = env;
    }
    validate(licence) {
        if (!licence) {
            return { ok: false, valid: false, message: "No licence provided" };
        }
        return { ok: true, valid: true };
    }
}
exports.WFSLOfflineValidator = WFSLOfflineValidator;
