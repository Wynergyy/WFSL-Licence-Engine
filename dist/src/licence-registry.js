"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WFSLLicenceRegistry = void 0;
class WFSLLicenceRegistry {
    constructor(env) {
        this.env = env;
        this.store = new Map();
    }
    add(licence) {
        this.store.set(licence.id, licence);
    }
    get(id) {
        return this.store.get(id) ?? null;
    }
}
exports.WFSLLicenceRegistry = WFSLLicenceRegistry;
