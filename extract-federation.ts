/**
 * Federation Extractor — ES Module Safe
 * Avoids any dependency on trust-crypto or other Worker-only modules.
 */

import { writeFileSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";

async function run() {
  const envelopeUrl = pathToFileURL(
    path.resolve("./src/federation-envelope.ts")
  ).href;

  const mod = await import(envelopeUrl);

  if (!mod.WSTP_PRODUCTION_FEDERATION) {
    throw new Error("WSTP_PRODUCTION_FEDERATION not exported.");
  }

  writeFileSync(
    "federation.json",
    JSON.stringify(mod.WSTP_PRODUCTION_FEDERATION, null, 2)
  );

  console.log("Saved federation.json");
}

run();
