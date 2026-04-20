#!/usr/bin/env node
import { root2gltf } from ".";
import OPTIONS from "./lib/constants/cliOptions.js";

(async () => {
  try {
    await root2gltf(OPTIONS.inputFile, OPTIONS.configFile, OPTIONS.outputFile);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
})();
