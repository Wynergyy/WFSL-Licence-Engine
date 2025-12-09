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
 * Licence Registry
 * Stores, retrieves, and manages licence records.
 */

export class WFSLLicenceRegistry {
  private store: Map<string, any>;

  constructor(env: any) {
    this.store = new Map();
  }

  add(licence: any) {
    this.store.set(licence.id, licence);
  }

  get(id: string) {
    return this.store.get(id) || null;
  }
}

