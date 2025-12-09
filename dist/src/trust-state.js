"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustState = void 0;
class TrustState {
    constructor(env) {
        this.env = env;
    }
    async setState(key, signal) {
        const record = {
            state: signal.state,
            timestamp: signal.timestamp ?? Date.now()
        };
        await this.env.WSTP_REGISTRY.put(key, JSON.stringify(record));
        return {
            ok: true,
            message: "State updated",
            state: record
        };
    }
    async getState(key) {
        const raw = await this.env.WSTP_REGISTRY.get(key);
        if (!raw) {
            return {
                ok: false,
                message: "No state found",
                state: null
            };
        }
        return {
            ok: true,
            message: "State retrieved",
            state: JSON.parse(raw)
        };
    }
}
exports.TrustState = TrustState;
