"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrustGraph = createTrustGraph;
exports.addTrustNode = addTrustNode;
exports.linkTrust = linkTrust;
exports.propagateTrust = propagateTrust;
exports.recomputeGraphHash = recomputeGraphHash;
exports.detectAnomalyClusters = detectAnomalyClusters;
const trust_crypto_js_1 = require("./trust-crypto.js");
/**
 * Create an empty trust graph.
 */
function createTrustGraph() {
    return {
        nodes: new Map(),
        edges: [],
        graphHash: (0, trust_crypto_js_1.sha512)("wfsl-trust-graph-empty")
    };
}
/**
 * Add a node to the graph.
 */
function addTrustNode(graph, trust) {
    const node = {
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
function linkTrust(graph, from, to, weight) {
    const timestamp = new Date().toISOString();
    const existing = graph.edges.find(e => e.from === from && e.to === to);
    if (existing) {
        existing.weight = weight;
        existing.lastUpdated = timestamp;
    }
    else {
        graph.edges.push({ from, to, weight, lastUpdated: timestamp });
    }
    recomputeGraphHash(graph);
}
/**
 * Propagate trust through the graph.
 * A node's trustScore is influenced by incoming edges.
 */
function propagateTrust(graph) {
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
            if (newScore > 70)
                node.riskLevel = "low";
            else if (newScore > 40)
                node.riskLevel = "medium";
            else if (newScore > 20)
                node.riskLevel = "high";
            else
                node.riskLevel = "critical";
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
function recomputeGraphHash(graph) {
    const nodeStrings = Array.from(graph.nodes.values()).map(n => JSON.stringify({
        id: n.id,
        score: n.trustScore,
        risk: n.riskLevel,
        updated: n.lastUpdated
    }));
    const edgeStrings = graph.edges.map(e => `${e.from}->${e.to}:${e.weight}:${e.lastUpdated}`);
    const material = nodeStrings.concat(edgeStrings).sort().join("|");
    graph.graphHash = (0, trust_crypto_js_1.sha512)(material);
}
/**
 * Detect anomaly clusters:
 * A group of nodes with elevated risk or sudden trust decay.
 */
function detectAnomalyClusters(graph) {
    const anomalies = [];
    graph.nodes.forEach(node => {
        if (node.riskLevel === "high" || node.riskLevel === "critical") {
            anomalies.push(node.id);
        }
    });
    return anomalies;
}
