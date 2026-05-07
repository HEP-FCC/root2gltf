#!/usr/bin/env node
/* eslint-disable n/no-process-exit */
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { readFile, writeFile } from "node:fs/promises";
import { openFile } from "jsroot";
import { parse } from "node:path";
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
    const path = OPTIONS.outputFile || `${parse(OPTIONS.inputFile).name}.gltf`;

    console.log("INFO: Reading root file");
    const input = await openFile(OPTIONS.inputFile);

    console.log("INFO: Reading config file");
    const config = JSON.parse(await readFile(OPTIONS.configFile, "utf8"));

    console.log("INFO: Starting glTF conversion");
    const glTFOutput = await root2gltf({ input, config });

    console.log("INFO: Writing output file");
    await writeFile(path, JSON.stringify(glTFOutput), "utf8");

    console.log(`INFO: glTF content saved to '${path}'`);
    process.exit(0);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
})();
