export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    const { licenceId, reason } = await request.json();

    if (!licenceId) return json({ ok: false, error: "Missing licenceId" }, 400);
    if (!reason) return json({ ok: false, error: "Missing reason" }, 400);

    await env.WFSL_REVOCATION.put(licenceId, JSON.stringify({
      licenceId,
      reason,
      revokedAt: Date.now()
    }));

    return json({ ok: true });
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" }
  });
}
