/**
 * GuardianBot01
 * WFSL Licence Engine Autonomous Integrity Guardian
 */

import { WFSLLicenceAuthority } from "../src/licence-authority.ts";
import { WFSLLicenceRegistry } from "../src/licence-registry.ts";
import { WFSLOfflineValidator } from "../src/offline-validator.ts";
import { ActivationEngine } from "../src/activation-engine.ts";

const mockEnv = {
  WSTP_REGISTRY: {
    store: new Map(),
    async put(k, v) { this.store.set(k, v); },
    async get(k) { return this.store.get(k) ?? null; }
  }
};

export default class GuardianBot01 {
  private report: any[] = [];
  private authority: any;
  private registry: any;
  private validator: any;
  private engine: any;

  constructor() {
    this.authority = new WFSLLicenceAuthority(mockEnv);
    this.registry = new WFSLLicenceRegistry(mockEnv);
    this.validator = new WFSLOfflineValidator(mockEnv);
    this.engine = new ActivationEngine(mockEnv);
  }

  log(title: string, data: any) {
    this.report.push({ title, data, timestamp: Date.now() });
  }

  async testActivation() {
    const res = await this.engine.activate("GUARDIAN_TEST_KEY");
    this.log("Activation Test", res);
  }

  testRegistry() {
    const lic = { id: "G-TEST", subject: "guardian", issuedAt: Date.now() };
    this.registry.add(lic);
    this.log("Registry Test", this.registry.get("G-TEST"));
  }

  testValidator() {
    const output = this.validator.validate({ id: "VAL-TEST", subject: "validator" });
    this.log("Offline Validator Test", output);
  }

  async run() {
    this.log("GuardianBot01 Startup", "Beginning integrity sweep");
    await this.testActivation();
    this.testRegistry();
    this.testValidator();
    this.log("GuardianBot01 Completed", "Integrity sweep complete");
    return this.report;
  }
}
