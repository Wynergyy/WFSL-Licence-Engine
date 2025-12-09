import { WFSLLicenceAuthority } from "./licence-authority.js";

export class WFSLLicenceRegistry {
  private env: any;
  private store: Map<string, any>;

  constructor(env: any) {
    this.env = env;
    this.store = new Map();
  }

  add(licence: any) {
    this.store.set(licence.id, licence);
  }

  get(id: string) {
    return this.store.get(id) ?? null;
  }
}
