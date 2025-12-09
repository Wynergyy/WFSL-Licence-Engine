/**
 * WFSL Licence Engine — Proprietary Software
 * Copyright (c) Wynergy Fibre Solutions Ltd.
 * All rights reserved.
 *
 * This source code is licensed under the WFSL Proprietary Software Licence v1.0.
 * Unauthorised use, copying, modification, distribution, or hosting is prohibited.
 *
 * For licensing or commercial enquiries, contact:
 * legal@wynergy.co.uk
 */
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

