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
/**
 * WFSL GLOBAL DIGITAL TRUST AUTHORITY
 * Trust Graph Engine (TGE)
 * -----------------------------------------------------------
 * This module models the distributed trust fabric:
 * - nodes represent trusted entities (humans, companies, devices, AI agents)
 * - edges represent directional trust relationships
 * - graph scoring predicts risk, trust continuity, anomaly clusters
 * - PQ-ready hashing anchors graph state
 */

import { sha512 } from "./trust-crypto.js";
import { TrustObject } from "./trust-core.js";

/**
 * Node in the trust graph.
 */
export interface TrustNode {
  id: string;
  object: TrustObject;
  lastUpdated: string;
  trustScore: number;        // 0–100
  riskLevel: "low" | "medium" | "high" | "critical";
}

/**
 * A directional trust edge.
 */
export interface TrustEdge {
  from: string;
  to: string;
  weight: number;            // influence factor
  lastUpdated: string;
}

/**
 * The full trust graph structure.
 */
export interface TrustGraph {
  nodes: Map<string, TrustNode>;
  edges: TrustEdge[];
  graphHash: string;
}

/**
 * Create an empty trust graph.
 */
export function createTrustGraph(): TrustGraph {
  return {
    nodes: new Map(),
    edges: [],
    graphHash: sha512("wfsl-trust-graph-empty")
  };
}

/**
 * Add a node to the graph.
 */
export function addTrustNode(graph: TrustGraph, trust: TrustObject): void {
  const node: TrustNode = {
    id: trust.identity.id,
    object: trust,
    lastUpdated: new Date().toISOString(),
    trustScore: trust.metric?.score ?? 50,
    riskLevel: trust.metric?.riskLevel ?? "medium"
  };

  graph.nodes.set(node.id, node);
  recomputeGraphHash(graph);
}

/**
 * Add or update a trust edge.
 */
export function linkTrust(
  graph: TrustGraph,
  from: string,
  to: string,
  weight: number
): void {
  const timestamp = new Date().toISOString();

  const existing = graph.edges.find(e => e.from === from && e.to === to);
  if (existing) {
    existing.weight = weight;
    existing.lastUpdated = timestamp;
  } else {
    graph.edges.push({ from, to, weight, lastUpdated: timestamp });
  }

  recomputeGraphHash(graph);
}

/**
 * Propagate trust through the graph.
 * A node's trustScore is influenced by incoming edges.
 */
export function propagateTrust(graph: TrustGraph): void {
  graph.nodes.forEach(node => {
    let influence = 0;
    let count = 0;

    for (const edge of graph.edges) {
      if (edge.to === node.id) {
        const fromNode = graph.nodes.get(edge.from);
        if (fromNode) {
          influence += fromNode.trustScore * edge.weight;
          count++;
        }
      }
    }

    if (count > 0) {
      const newScore = Math.min(100, Math.max(0, influence / count));
      node.trustScore = newScore;

      if (newScore > 70) node.riskLevel = "low";
      else if (newScore > 40) node.riskLevel = "medium";
      else if (newScore > 20) node.riskLevel = "high";
      else node.riskLevel = "critical";

      node.lastUpdated = new Date().toISOString();
    }
  });

  recomputeGraphHash(graph);
}

/**
 * Compute a PQ-ready global hash of the graph state.
 * Provides:
 * - auditability
 * - anti-tamper detection
 * - reproducible trust snapshots
 */
export function recomputeGraphHash(graph: TrustGraph): void {
  const nodeStrings = Array.from(graph.nodes.values()).map(n =>
    JSON.stringify({
      id: n.id,
      score: n.trustScore,
      risk: n.riskLevel,
      updated: n.lastUpdated
    })
  );

  const edgeStrings = graph.edges.map(e =>
    `${e.from}->${e.to}:${e.weight}:${e.lastUpdated}`
  );

  const material = nodeStrings.concat(edgeStrings).sort().join("|");
  graph.graphHash = sha512(material);
}

/**
 * Detect anomaly clusters:
 * A group of nodes with elevated risk or sudden trust decay.
 */
export function detectAnomalyClusters(graph: TrustGraph): string[] {
  const anomalies: string[] = [];

  graph.nodes.forEach(node => {
    if (node.riskLevel === "high" || node.riskLevel === "critical") {
      anomalies.push(node.id);
    }
  });

  return anomalies;
}

