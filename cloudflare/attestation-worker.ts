/**
 * WFSL Attestation Authority Worker
 * Remote trust oracle for distributed WFSL nodes.
 */

export interface AttestationRequest {
  nodeId: string;
  timestamp: number;
  signature: string;
}

export interface AttestationResponse {
  ok: boolean;
  verified: boolean;
  message: string;
  state?: any;
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    try {
      const body = await request.json() as AttestationRequest;

      // Basic validation
      if (!body.nodeId || !body.timestamp || !body.signature) {
        return new Response(JSON.stringify({
          ok: false,
          verified: false,
          message: "Malformed attestation request"
        }), { status: 400 });
      }

      // Expected signature from KV
      const stored = await env.WFSL_FEDERATION.get(body.nodeId);
      if (!stored) {
        return new Response(JSON.stringify({
          ok: false,
          verified: false,
          message: "Node not registered"
        }), { status: 404 });
      }

      const parsed = JSON.parse(stored);

      const expectedSignature = parsed.signature;

      const verified = expectedSignature === body.signature;

      return new Response(JSON.stringify({
        ok: true,
        verified,
        message: verified ? "Attestation valid" : "Attestation mismatch",
        state: parsed.state
      }), { status: 200 });

    } catch (err: any) {
      return new Response(JSON.stringify({
        ok: false,
        verified: false,
        message: "Attestation worker error",
        error: err?.message
      }), { status: 500 });
    }
  }
};
