/**
 * WFSL Licence Engine — Proprietary Software
 * Attestation Client
 *
 * Sends attestation payloads to the WFSL Validator Worker.
 */

const ATTEST_URL = "https://wstp-validator.paul-wynn.workers.dev/attest";

export interface AttestationPayload {
  node: string;
  ts: number;
  verified: boolean;
}

export interface AttestationResult {
  ok: boolean;
  error?: string;
  response?: any;
}

/**
 * Send attestation payload to the Validator Worker.
 */
export async function sendAttestation(
  payload: AttestationPayload
): Promise<AttestationResult> {
  try {
    const res = await fetch(ATTEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `Worker responded with status ${res.status}`,
        response: await safeJson(res)
      };
    }

    const data = await safeJson(res);
    return {
      ok: true,
      response: data
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || String(err)
    };
  }
}

/**
 * Safely parse JSON from Worker response.
 */
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
