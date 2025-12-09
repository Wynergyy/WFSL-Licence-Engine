"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WFSLLicenceAuthority = void 0;
class WFSLLicenceAuthority {
    constructor(env) {
        this.env = env;
    }
    async activate(request) {
        const { key, device, metadata } = request;
        const record = {
            activated: true,
            device: device ?? "unknown",
            metadata: metadata ?? {},
            timestamp: Date.now()
        };
        await this.env.WSTP_REGISTRY.put(key, JSON.stringify(record));
        return {
            ok: true,
            activated: true,
            message: "Licence activated",
            state: record
        };
    }
    async verify(key) {
        const raw = await this.env.WSTP_REGISTRY.get(key);
        if (!raw) {
            return {
                ok: false,
                valid: false,
                message: "No licence found"
            };
        }
        return {
            ok: true,
            valid: true,
            data: JSON.parse(raw)
        };
    }
}
exports.WFSLLicenceAuthority = WFSLLicenceAuthority;
