export interface StateSignal {
  state: string;
  timestamp?: number;
}

export interface StateResult {
  ok: boolean;
  message: string;
  state: any;
}

export class TrustState {
  constructor(private env: any) {}

  async setState(key: string, signal: StateSignal): Promise<StateResult> {
    const record = {
      state: signal.state,
      timestamp: signal.timestamp ?? Date.now()
    };

    await this.env.WSTP_REGISTRY.put(key, JSON.stringify(record));

    return {
      ok: true,
      message: "State updated",
      state: record
    };
  }

  async getState(key: string): Promise<StateResult> {
    const raw = await this.env.WSTP_REGISTRY.get(key);

    if (!raw) {
      return {
        ok: false,
        message: "No state found",
        state: null
      };
    }

    return {
      ok: true,
      message: "State retrieved",
      state: JSON.parse(raw)
    };
  }
}
