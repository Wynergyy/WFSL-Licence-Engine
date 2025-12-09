/**
 * WFSL Licence Engine — Proprietary Software
 * Copyright (c) Wynergy Fibre Solutions Ltd.
 * All rights reserved.
 */

export interface TrustState {
  nodeId: string;
  nodeType: "engine" | "guardian" | "worker";
  version: string;
  timestamp: number;
  healthy: boolean;
}

export function createTrustState(nodeId: string, nodeType: "engine" | "guardian" | "worker"): TrustState {
  return {
    nodeId,
    nodeType,
    version: "1.0.0",
    timestamp: Date.now(),
    healthy: true
  };
}
