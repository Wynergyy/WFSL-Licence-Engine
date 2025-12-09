/**
 * WFSL Licence Engine — Proprietary Software
 * Copyright (c) Wynergy Fibre Solutions Ltd.
 * All rights reserved.
 */

export async function sendAttestation(data: any) {
  try {
    const res = await fetch("https://wfsl-attest.example/attest", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });

    return await res.json();
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
