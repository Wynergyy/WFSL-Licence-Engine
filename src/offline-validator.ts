import { WFSLLicenceAuthority } from "./licence-authority.js";

export class WFSLOfflineValidator {
  private env: any;

  constructor(env: any) {
    this.env = env;
  }

  validate(licence: any) {
    if (!licence) {
      return { ok: false, valid: false, message: "No licence provided" };
    }

    return { ok: true, valid: true };
  }
}
