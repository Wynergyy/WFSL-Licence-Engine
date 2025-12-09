/**
 * WFSL Licence Authority Worker
 * Minimal bootstrap to allow deployment.
 */

export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("WFSL Licence Authority Worker online", {
      headers: { "Content-Type": "text/plain" }
    });
  }
};
