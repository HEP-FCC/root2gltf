#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { root2gltf } from "../src/index.js";

// Three.js GLTFExporter uses FileReader (browser API) to base64-encode binary
// buffers. Polyfill it for Node.js using the native Blob.arrayBuffer().
globalThis.FileReader = class FileReader {
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = `data:${blob.type || "application/octet-stream"};base64,${Buffer.from(buffer).toString("base64")}`;
      if (this.onloadend) this.onloadend();
    });
  }

  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      if (this.onloadend) this.onloadend();
    });
  }
};

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
    await root2gltf(OPTIONS.inputFile, OPTIONS.configFile, OPTIONS.outputFile);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`ERROR: ${error.message}`);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
})();
