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
