/**
 * WFSL Licence Engine — Remote Licence Client
 * Phase 3: Guardian Integration with Licence Authority
 */

export interface LicenceResponse {
  ok: boolean;
  action?: string;
  licence?: any;
  error?: string;
}

const BASE_URL = "https://wfsl-licence-authority.paul-wynn.workers.dev";

export async function fetchLicence(id: string): Promise<LicenceResponse> {
  try {
    const res = await fetch(`${BASE_URL}/licence/get/${id}`);
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function validateLicence(id: string): Promise<LicenceResponse> {
  try {
    const res = await fetch(`${BASE_URL}/licence/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
