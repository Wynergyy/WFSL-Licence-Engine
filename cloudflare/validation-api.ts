/**
 * WFSL Licence Engine — Cloudflare Validation API
 * Provides attestation endpoint for federation bots.
 */

export interface Env {
  WFSL_FEDERATION: KVNamespace;
  WFSL_LOGS: KVNamespace;
  WFSL_REVOKED: KVNamespace;
  WFSL_BANLIST: KVNamespace;
  GUARDIAN_STATE: KVNamespace;
  VERIFY_CHAIN: KVNamespace;
}

interface AttestationRequest {
  node: string;
  ts: number;
  verified: boolean;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // POST /attest
    if (url.pathname === "/attest" && request.method === "POST") {
      try {
        const body = (await request.json()) as AttestationRequest;

        // Minimal schema validation
        if (!body.node || typeof body.verified !== "boolean") {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "Invalid attestation payload"
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        // Store audit log entry
        const logEntry = {
          node: body.node,
          ts: body.ts,
          verified: body.verified,
          received: Date.now()
        };

        await env.WFSL_LOGS.put(
          `attest:${body.node}:${body.ts}`,
          JSON.stringify(logEntry)
        );

        return new Response(
          JSON.stringify({
            ok: true,
            action: "attestation-recorded",
            node: body.node,
            verified: body.verified
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: err?.message || "Unhandled error in /attest"
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Default 404 handler
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Route not found"
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
};
