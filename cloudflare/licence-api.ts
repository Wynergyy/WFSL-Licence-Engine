/**
 * WFSL Licence Engine — Licence Authority API
 * Phase 2: Licence Creation, Activation, Validation and Revocation
 */

export interface Env {
  LICENCE_REG: KVNamespace;       // primary licence registry
  WFSL_REVOKED: KVNamespace;      // revoked licences registry
  WFSL_LOGS: KVNamespace;         // audit logs
}

interface Licence {
  id: string;
  holder: string;
  issued: number;
  active: boolean;
  meta?: Record<string, any>;
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // ------------------------------------
    // 1. CREATE LICENCE
    // ------------------------------------
    if (path === "/licence/create" && request.method === "POST") {
      const body = await request.json();
      const id = crypto.randomUUID();

      const licence: Licence = {
        id,
        holder: body.holder || "unknown",
        issued: Date.now(),
        active: false,
        meta: body.meta || {}
      };

      await env.LICENCE_REG.put(`licence:${id}`, JSON.stringify(licence));

      return json({
        ok: true,
        action: "licence-created",
        licence
      });
    }

    // ------------------------------------
    // 2. ACTIVATE LICENCE
    // ------------------------------------
    if (path === "/licence/activate" && request.method === "POST") {
      const body = await request.json();

      const raw = await env.LICENCE_REG.get(`licence:${body.id}`);
      if (!raw) return json({ ok: false, error: "Licence not found" }, 404);

      const lic = JSON.parse(raw) as Licence;
      lic.active = true;

      await env.LICENCE_REG.put(`licence:${lic.id}`, JSON.stringify(lic));

      return json({
        ok: true,
        action: "licence-activated",
        licence: lic
      });
    }

    // ------------------------------------
    // 3. GET LICENCE
    // ------------------------------------
    if (path.startsWith("/licence/get/")) {
      const id = path.replace("/licence/get/", "");

      const raw = await env.LICENCE_REG.get(`licence:${id}`);
      if (!raw) return json({ ok: false, error: "Licence not found" }, 404);

      return json({ ok: true, licence: JSON.parse(raw) });
    }

    // ------------------------------------
    // 4. VALIDATE LICENCE
    // ------------------------------------
    if (path === "/licence/validate" && request.method === "POST") {
      const body = await request.json();

      const raw = await env.LICENCE_REG.get(`licence:${body.id}`);
      if (!raw) return json({ ok: false, error: "Licence not found" }, 404);

      const lic = JSON.parse(raw) as Licence;

      if (!lic.active) {
        return json({ ok: false, error: "Licence is not active" });
      }

      // Check revocation list
      const revoked = await env.WFSL_REVOKED.get(`revoked:${lic.id}`);
      if (revoked) {
        return json({ ok: false, error: "Licence revoked" });
      }

      // Log validation
      await env.WFSL_LOGS.put(
        `validate:${lic.id}:${Date.now()}`,
        JSON.stringify({ id: lic.id, ts: Date.now() })
      );

      return json({
        ok: true,
        action: "licence-valid",
        licence: lic
      });
    }

    // ------------------------------------
    // 5. REVOKE LICENCE
    // ------------------------------------
    if (path === "/licence/revoke" && request.method === "POST") {
      const body = await request.json();

      await env.WFSL_REVOKED.put(
        `revoked:${body.id}`,
        JSON.stringify({ id: body.id, ts: Date.now() })
      );

      return json({
        ok: true,
        action: "licence-revoked",
        id: body.id
      });
    }

    // ------------------------------------
    // FALLBACK ROUTE
    // ------------------------------------
    return json({ ok: false, error: "Route not found" }, 404);
  }
};
