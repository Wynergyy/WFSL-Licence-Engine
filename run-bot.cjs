// WFSL Execution Driver: Forces ts-node into stable CJS behaviour.

require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    moduleResolution: "node"
  }
});

const path = require("path");

// Rebuild arguments so engine-launcher receives correct path
const launcher = path.resolve(__dirname, "engine-launcher.ts");
const target = process.argv[2];

// Forward arguments to launcher
process.argv = ["node", launcher, target];

// Execute launcher
require(launcher);
