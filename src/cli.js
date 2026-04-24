#!/usr/bin/env node
/* eslint-disable import-x/no-useless-path-segments */
import { root2gltf } from "./index.js";
import OPTIONS from "./lib/constants/cliOptions.js";

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
