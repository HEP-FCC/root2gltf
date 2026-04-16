// Command line options
import { readFileSync } from "node:fs";
import { parse } from "node:path";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { convertGeometry } from "../lib/phoenixExport.js";

const options = yargs(hideBin(process.argv))
  .usage(
    "Usage: [-h] [-n <object-name>] [-o <output-file>] [-c <config-file>] <input-file>",
  )
  .positional("input-file", { describe: "Input ROOT file", type: "string" })
  .option("o", {
    alias: "output-file",
    describe: "Name of output glTF file",
    type: "string",
  })
  .option("n", {
    alias: "object-name",
    describe: "Object name",
    type: "string",
    default: "default",
  })
  .option("c", {
    alias: "config",
    describe: "Configuration file for the detector",
    type: "string",
    default: "config.json",
  })
  .help("h").argv;

if (!options._[0]) {
  console.log("ERROR: Input ROOT file not provided!");
  process.exit(1);
}

let configFilePath = "config.json";
if (options.config) {
  configFilePath = options.config;
}
console.log("INFO: Using this configuration file:");
console.log(`      ${configFilePath}`);
const config = JSON.parse(readFileSync(configFilePath));

const inFilePath = `${options._[0]}`;
console.log("INFO: Reading file:");
console.log(`      ${inFilePath}`);

let outFileName = `${parse(inFilePath).name}.gltf`;
if (options.outputFile) {
  outFileName = options.outputFile;
}

for (const [name, entry] of Object.entries(config.subParts)) {
  const temp = [];
  for (const path of entry[0]) {
    temp.push(new RegExp(path));
  }
  entry[0] = temp;
}

convertGeometry(
  inFilePath,
  outFileName,
  config.maxLevel,
  config.subParts,
  config.childrenToHide,
  options.objectName,
);
