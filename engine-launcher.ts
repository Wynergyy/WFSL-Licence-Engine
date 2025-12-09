/**
 * WFSL Engine Launcher (Stable TS Loader)
 */

import * as path from "path";
import * as fs from "fs";

async function loadModule(modulePath: string) {
  const fullPath = path.resolve(process.cwd(), modulePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Module not found: ${fullPath}`);
  }

  return await import(fullPath);
}

async function executeModule(mod: any) {
  // Default export is class
  if (mod.default && typeof mod.default === "function") {
    const instance = new mod.default();
    if (typeof instance.run === "function") {
      return await instance.run();
    }
  }

  // Named exports
  for (const key of Object.keys(mod)) {
    const value = mod[key];
    if (typeof value === "function") {
      try {
        const instance = new value();
        if (typeof instance.run === "function") {
          return await instance.run();
        }
      } catch { continue; }
    }
  }

  return { status: "Loaded but no runnable entrypoint found." };
}

async function main() {
  const target = process.argv[2];

  console.log(`WFSL Engine Launcher: Loading ${target}`);
  const mod = await loadModule(target);
  const result = await executeModule(mod);

  console.log("=== WFSL ENGINE LAUNCH RESULT ===");
  console.log(JSON.stringify(result, null, 2));
  console.log("=================================");
}

main();
