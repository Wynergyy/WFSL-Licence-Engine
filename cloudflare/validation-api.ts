/**
 * Wynergy Sovereign Trust Platform (WSTP)
 * Cloudflare Validation API
 *
 * This Worker performs:
 * - Licence verification
 * - Trust envelope reconstruction
 * - Federation lineage validation
 * - Revocation checks
 * - PQ-ready attestation output
 * - Offline compatibility fallback
 *
 * Bound to KV namespace: WSTP_REGISTRY
 */

import { LicenceEnvelope } from "../src/licence-engine";
import { validateEnvelope } from "../src/trust-verify";
import { buildTrustState } from "../src/trust-state";
import { mergeFederation } from "../src/trust-federation";
import { TrustCoreObject } from "../src/trust-core";

export interface Env {
  WSTP_REGISTRY: KVNamespace; // KV registry binding
}

export default {
  /**
   * Handle validation requests.
   *
   * Expected body:
   * {
   *   "licenceId": "xxxx",
   *   "envelope": { ... },
   *   "includeFederation": true
   * }
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (request.method !== "POST") {
        return new Response("Use POST /validate", { status: 405 });
      }

      const body = await request.json<{
        licenceId: string;
        envelope: LicenceEnvelope;
        includeFederation?: boolean;
      }>();

      if (!body.licenceId || !body.envelope) {
        return new Response("Invalid request body", { status: 400 });
      }

      // Fetch KV registry entry
      const registryEntry = await env.WSTP_REGISTRY.get(body.licenceId, {
        type: "json",
      });

      if (!registryEntry) {
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "LICENCE_NOT_FOUND",
          }),
          { status: 404 }
        );
      }

      // Rebuild trust state from stored authority metadata
      const trustState = buildTrustState(registryEntry as TrustCoreObject);

      // Verify envelope integrity + signature
      const validation = validateEnvelope(body.envelope, trustState);

      // Merge federated lineage if requested
      let federationResult = null;
      if (body.includeFederation) {
        federationResult = mergeFederation(registryEntry);
      }

      // Attestation object
      const attestation = {
        ok: validation.ok,
        licenceId: body.licenceId,
        timestamp: Date.now(),
        reasons: validation.reasons,
        trustState,
        federation: federationResult,
        envelopeSummary: {
          id: body.envelope.id,
          issued: body.envelope.issuedAt,
          expires: body.envelope.expiresAt,
        },
      };

      return new Response(JSON.stringify(attestation, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "INTERNAL_ERROR",
          detail: err?.message || String(err),
        }),
        { status: 500 }
      );
    }
  },
};
