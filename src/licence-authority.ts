export interface LicenceActivationRequest {
  key: string;
  device?: string;
  metadata?: Record<string, unknown>;
}

export interface LicenceActivationResponse {
  ok: boolean;
  activated: boolean;
  message: string;
  state?: any;
}

export class WFSLLicenceAuthority {
  private env: any;

  constructor(env: any) {
    this.env = env;
  }

  async activate(request: LicenceActivationRequest): Promise<LicenceActivationResponse> {
    const { key, device, metadata } = request;

    const record = {
      activated: true,
      device: device ?? "unknown",
      metadata: metadata ?? {},
      timestamp: Date.now()
    };

    await this.env.WSTP_REGISTRY.put(key, JSON.stringify(record));

    return {
      ok: true,
      activated: true,
      message: "Licence activated",
      state: record
    };
  }

  async verify(key: string): Promise<any> {
    const raw = await this.env.WSTP_REGISTRY.get(key);

    if (!raw) {
      return {
        ok: false,
        valid: false,
        message: "No licence found"
      };
    }

    return {
      ok: true,
      valid: true,
      data: JSON.parse(raw)
    };
  }
}
