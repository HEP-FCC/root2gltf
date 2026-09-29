#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { readFile, writeFile } from "node:fs/promises";
import { openFile } from "jsroot";
import { parse, resolve } from "node:path";
import root2gltf from "../dist/src/index.js";

const OPTIONS = yargs(hideBin(process.argv))
  .usage("Usage: $0 -i <in> [-d -depth] [-c -config] [-o -out] [-h]")
  .option("i", {
    alias: "in",
    describe: "Input ROOT file path",
    type: "string",
    demandOption: true,
  })
  .option("d", {
    alias: "depth",
    describe: "Tree depth",
    type: "number",
  })
  .option("o", {
    alias: "out",
    describe: "Output glTF file path",
    type: "string",
  })
  .option("c", {
    alias: "config",
    describe: "Detector configuration file path",
    type: "string",
  })
  .help("h").argv;

(async () => {
  try {
    const path = OPTIONS.out || `${parse(OPTIONS.in).name}.gltf`;
    let config; // Optional config file content, initally undefined

    console.log("INFO: Reading root file");
    const input = await openFile(resolve(OPTIONS.in));

    if (OPTIONS.config) {
      console.log("INFO: Reading config file");
      config = JSON.parse(await readFile(OPTIONS.config, "utf8"));
    }

    console.log("INFO: Starting glTF conversion");
    const glTFOutput = await root2gltf({
      input,
      depth: OPTIONS.depth, // If undefined assigns default
      config, // If undefined provides configs
    });

    console.log("INFO: Writing output file");
    await writeFile(path, JSON.stringify(glTFOutput), "utf8");

    console.log(`INFO: glTF content saved to '${path}'`);
    process.exitCode = 0;
  } catch (error) {
    console.error(`ERROR: ${error.message}, reason below:\n  ${error.cause}`);
    process.exitCode = 1;
  }
})();
