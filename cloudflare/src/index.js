// WFSL LICENCE VERIFICATION API
// Full WFSL Spec Implementation
// Version: v1.0-enterprise

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route selection
    if (request.method === "POST" && url.pathname === "/verify") {
      return verifyLicence(request, env);
    }

    if (request.method === "POST" && url.pathname === "/revoke") {
      return revokeLicence(request, env);
    }

    if (request.method === "GET" && url.pathname === "/status") {
      return statusReport(env);
    }

    return new Response("Not Found", { status: 404 });
  }
};

/* ---------------------------------------------------
   VERIFY LICENCE
--------------------------------------------------- */
async function verifyLicence(request, env) {
  try {
    const body = await request.json();
    const { licenceId, hash, signature, product, machineId } = body;

    if (!licenceId || !hash || !signature) {
      return fail("Missing required fields", 400);
    }

    // Load revocation list
    const raw = await env.WFSL_REVOKED.get("revoked", { type: "json" });
    const revokedList = raw || [];

    // Check revocation
    if (revokedList.find(x => x.licenceId === licenceId)) {
      return fail("Licence revoked", 403);
    }

    // Basic integrity check (same logic as PowerShell hasher)
    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`${licenceId}:${product}:${machineId}`));
    const expectedHash = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");

    if (expectedHash !== hash) {
      return fail("Hash mismatch", 498);
    }

    // OK
    return ok({
      licenceId,
      product,
      machineId,
      valid: true,
      reason: "Licence valid"
    });
  } catch (err) {
    return fail("Invalid request body");
  }
}

/* ---------------------------------------------------
   REVOKE LICENCE (ADMIN TOKEN REQUIRED)
--------------------------------------------------- */
async function revokeLicence(request, env) {
  const auth = request.headers.get("x-wfsl-auth");

  if (!auth || auth !== env.WFSL_ADMIN_TOKEN) {
    return fail("Unauthorised", 401);
  }

  const body = await request.json();
  const { licenceId, reason } = body;

  if (!licenceId) return fail("Missing licenceId", 400);

  const raw = await env.WFSL_REVOKED.get("revoked", { type: "json" });
  const list = raw || [];

  // Prevent duplicates
  if (!list.some(x => x.licenceId === licenceId)) {
    list.push({
      licenceId,
      reason: reason || "No reason",
      revokedAt: Date.now()
    });
  }

  await env.WFSL_REVOKED.put("revoked", JSON.stringify(list));

  return ok({ success: true, licenceId });
}

/* ---------------------------------------------------
   STATUS ENDPOINT
--------------------------------------------------- */
async function statusReport(env) {
  const raw = await env.WFSL_REVOKED.get("revoked", { type: "json" });

  return ok({
    service: "WFSL Licence Verification API",
    version: "1.0-enterprise",
    revokedCount: (raw || []).length,
    timestamp: Date.now()
  });
}

/* ---------------------------------------------------
   HELPERS
--------------------------------------------------- */
function ok(obj) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: wfslHeaders()
  });
}

function fail(msg, code = 400) {
  return new Response(JSON.stringify({
    valid: false,
    reason: msg
  }), {
    status: code,
    headers: wfslHeaders()
  });
}

function wfslHeaders() {
  return {
    "content-type": "application/json",
    "x-wfsl-version": "1.0-enterprise",
    "x-wfsl-engine": "wfsl-licence-engine"
  };
}
