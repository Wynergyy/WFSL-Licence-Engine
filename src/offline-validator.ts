/**
 * OfflineValidator
 * Performs offline validation of licence metadata.
 */

export class WFSLOfflineValidator {
  constructor(env: any) {}

  validate(licence: any) {
    if (!licence || !licence.id) {
      return { ok: false, valid: false, reason: "Missing ID" };
    }

    return { ok: true, valid: true };
  }
}
