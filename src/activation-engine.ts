/**
 * ActivationEngine
 * WFSL Licence Engine component responsible for activation workflow.
 */

import { WFSLLicenceAuthority } from "./licence-authority.ts";

export class ActivationEngine {
  private authority: any;

  constructor(env: any) {
    this.authority = new WFSLLicenceAuthority(env);
  }

  async activate(key: string) {
    return await this.authority.activate({
      key,
      metadata: {},
      device: "unknown"
    });
  }
}
