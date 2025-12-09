import { WFSLLicenceAuthority } from "./licence-authority.js";

export class ActivationEngine {
  private env: any;
  private authority: WFSLLicenceAuthority;

  constructor(env: any) {
    this.env = env;
    this.authority = new WFSLLicenceAuthority(env);
  }

  async activate(key: string) {
    return this.authority.activate({ key });
  }
}
