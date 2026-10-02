#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { readFile, writeFile } from "node:fs/promises";
import { openFile } from "jsroot";
import { parse, resolve } from "node:path";
import root2gltf from "../dist/src/index.js";

const OPTIONS = yargs(hideBin(process.argv))
  .usage(
    "Usage: $0 -i <in> [-d -depth] [-c -config] [-o -out] [-v -verbose] [-h]",
  )
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
  .option("v", {
    alias: "verbose",
    describe: "Print detailed progress logs",
    type: "boolean",
  })
  .help("h").argv;

(async () => {
  try {
    const path = OPTIONS.out || `${parse(OPTIONS.in).name}.gltf`;
    let config; // Optional config file content, initially undefined

    console.log("ROOT2glTF | INFO: Opening ROOT file");
    const input = await openFile(resolve(OPTIONS.in));

    if (OPTIONS.config) {
      console.log("ROOT2glTF | INFO: Reading config file");
      config = JSON.parse(await readFile(OPTIONS.config, "utf8"));
    }

    const glTFOutput = await root2gltf({
      input,
      depth: OPTIONS.depth, // If undefined assigns default
      config, // If undefined provides configs
      verbose: OPTIONS.verbose,
    });

    console.log(`ROOT2glTF | INFO: Writing output file in ${path}`);
    await writeFile(path, JSON.stringify(glTFOutput), "utf8");

    process.exitCode = 0;
  } catch (error) {
    console.error(`ROOT2glTF | ERROR: ${error.message}\n${error.cause}`);

    process.exitCode = 1;
  }
})();
