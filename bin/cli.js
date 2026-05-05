#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import root2gltf from "../dist/index.js";

const OPTIONS = yargs(hideBin(process.argv))
  .usage("Usage: $0 -i <input-file> -c <config-file> [-o <output-file>] [-h]")
  .option("i", {
    alias: "input-file",
    describe: "Input ROOT file path",
    type: "string",
    demandOption: true,
  })
  .option("o", {
    alias: "output-file",
    describe: "Output glTF file path",
    type: "string",
  })
  .option("c", {
    alias: "config-file",
    describe: "Detector configuration file path",
    type: "string",
    demandOption: true,
  })
  .help("h").argv;

(async () => {
  try {
    await root2gltf({
      inputPath: OPTIONS.inputFile,
      configPath: OPTIONS.configFile,
      outputPath: OPTIONS.outputFile,
    });
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
})();
