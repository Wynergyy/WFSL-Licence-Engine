/**
 * LicenceAuthority
 * Core component for activation and state retrieval.
 */

export class WFSLLicenceAuthority {
  private env: any;

  constructor(env: any) {
    this.env = env;
  }

  async activate(request: any) {
    const record = {
      activated: true,
      device: request.device || "unknown",
      metadata: request.metadata || {},
      timestamp: Date.now()
    };

    await this.env.WSTP_REGISTRY.put(request.key, JSON.stringify(record));

    return {
      ok: true,
      activated: true,
      message: "Licence activated",
      state: record
    };
  }

  async verify(key: string) {
    const raw = await this.env.WSTP_REGISTRY.get(key);

    if (!raw) {
      return { ok: false, valid: false, reason: "Not found" };
    }

    return { ok: true, valid: true, data: JSON.parse(raw) };
  }
}
