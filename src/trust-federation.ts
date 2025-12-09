/**
 * WFSL Licence Engine — Proprietary Software
 * Copyright (c) Wynergy Fibre Solutions Ltd.
 * All rights reserved.
 */

import * as crypto from "crypto";
import { TrustState } from "./trust-state";

export interface FederationEntry {
  nodeId: string;
  signature: string;
  state: TrustState;
}

export class TrustFederation {
  private members: Map<string, FederationEntry> = new Map();

  register(state: TrustState, secret: string) {
    const signature = crypto
      .createHmac("sha256", secret)
      .update(state.nodeId + state.timestamp)
      .digest("hex");

    this.members.set(state.nodeId, {
      nodeId: state.nodeId,
      signature,
      state
    });
  }

  verify(nodeId: string, secret: string): boolean {
    const entry = this.members.get(nodeId);
    if (!entry) return false;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(entry.state.nodeId + entry.state.timestamp)
      .digest("hex");

    return expected === entry.signature;
  }

  listMembers() {
    return Array.from(this.members.values());
  }
}
