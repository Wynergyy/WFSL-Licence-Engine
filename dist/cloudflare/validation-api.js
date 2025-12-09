/**
 * Wynergy Sovereign Trust Platform (WSTP)
 * Cloudflare Validation + Federation API
 */
import { validateTrustObject } from "../src/trust-verify";
import { buildTrustState } from "../src/trust-state";
import { mergeFederation } from "../src/trust-federation";
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        // -------------------------------
        // GET /federation
        // -------------------------------
        if (url.pathname === "/federation") {
            try {
                const raw = await env.WSTP_REGISTRY.get("WSTP_FEDERATION");
                if (!raw) {
                    return json({
                        ok: false,
                        reason: "FEDERATION_NOT_FOUND",
                        federation: null
                    }, 200);
                }
                let parsed = null;
                try {
                    parsed = JSON.parse(raw);
                }
                catch {
                    return json({
                        ok: false,
                        reason: "FEDERATION_CORRUPT_JSON",
                        federationRaw: raw
                    }, 200);
                }
                return json({
                    ok: true,
                    federation: parsed
                }, 200);
            }
            catch (err) {
                return json({
                    ok: false,
                    error: "INTERNAL_ERROR",
                    detail: err?.message ?? String(err)
                }, 500);
            }
        }
        // -------------------------------
        // POST /validate
        // -------------------------------
        if (url.pathname === "/validate" && request.method === "POST") {
            try {
                const body = await request.json();
                if (!body.licenceId || !body.envelope) {
                    return json({ ok: false, reason: "INVALID_REQUEST" }, 400);
                }
                const entry = await env.WSTP_REGISTRY.get(body.licenceId, { type: "json" });
                if (!entry) {
                    return json({ ok: false, reason: "LICENCE_NOT_FOUND" }, 404);
                }
                const trustState = buildTrustState(entry);
                const validation = validateTrustObject(body.envelope);
                let federation = null;
                if (body.includeFederation) {
                    federation = mergeFederation(entry);
                }
                return json({
                    ok: true,
                    licenceId: body.licenceId,
                    attestation: validation,
                    trustState,
                    federation
                }, 200);
            }
            catch (err) {
                return json({
                    ok: false,
                    error: "INTERNAL_ERROR",
                    detail: err?.message ?? String(err)
                }, 500);
            }
        }
        // -------------------------------
        // Default response
        // -------------------------------
        return new Response("WSTP Validator Online", { status: 200 });
    }
};
/**
 * JSON helper
 */
function json(obj, status = 200) {
    return new Response(JSON.stringify(obj, null, 2), {
        status,
        headers: { "Content-Type": "application/json" }
    });
}
