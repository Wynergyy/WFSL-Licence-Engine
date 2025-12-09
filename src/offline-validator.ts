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

