"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustFederation = void 0;
class TrustFederation {
    async dispatch(command) {
        return {
            ok: true,
            message: "Federation command accepted",
            echo: {
                action: command.action,
                data: command.data ?? {}
            }
        };
    }
}
exports.TrustFederation = TrustFederation;
