// Three.js GLTFExporter uses FileReader (browser API) to base64-encode
// binary buffers. Polyfill it for Node.js using the native Blob.arrayBuffer().

class NodeFileReader {
  result: string | ArrayBuffer | null = null;

  onloadend: (() => void) | null = null;

  readAsDataURL(blob: Blob): void {
    blob.arrayBuffer().then((buffer) => {
      this.result = `data:${blob.type || "application/octet-stream"};base64,${Buffer.from(buffer).toString("base64")}`;
      if (this.onloadend) this.onloadend();
    });
  }

  readAsArrayBuffer(blob: Blob): void {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      if (this.onloadend) this.onloadend();
    });
  }
}

(globalThis as unknown as { FileReader: unknown }).FileReader = NodeFileReader;
