"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivationEngine = void 0;
const licence_authority_js_1 = require("./licence-authority.js");
class ActivationEngine {
    constructor(env) {
        this.env = env;
        this.authority = new licence_authority_js_1.WFSLLicenceAuthority(env);
    }
    async activate(key) {
        return this.authority.activate({ key });
    }
}
exports.ActivationEngine = ActivationEngine;
