/**
 * High-level federation resolver used by Cloudflare validation API.
 * Accepts a stored registry entry and produces a federated lineage +
 * sealed federation envelope for attestation output.
 */
export function mergeFederation(registryEntry: any) {
  try {
    // Extract authorities if present, otherwise fallback to single-authority mode
    const authorities: AuthorityRoot[] = registryEntry.authorities ?? [];

    if (!Array.isArray(authorities) || authorities.length === 0) {
      return {
        ok: false,
        reason: "NO_FEDERATION_DATA",
        envelope: null,
        lineage: null
      };
    }

    // Build merged lineage descriptor
    const lineage = mergeLineage(authorities);

    // Build full federation envelope
    const envelope = createFederationEnvelope(
      authorities,
      0.7,
      "wfsl-auto-federation"
    );

    return {
      ok: true,
      envelope,
      lineage
    };
  } catch (err: any) {
    return {
      ok: false,
      reason: "FEDERATION_ERROR",
      detail: err?.message || String(err),
      envelope: null,
      lineage: null
    };
  }
}
