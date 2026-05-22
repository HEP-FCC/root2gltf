import type { TTraversable } from "../types/converter.js";

export function installPolyfills(): void {
  // Required because Three.js GLTFExporter uses FileReader (browser API)
  // to base64-encode binary buffers.
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

  (globalThis as unknown as { FileReader: unknown }).FileReader =
    NodeFileReader;
}

export function normalizePivot(scene: TTraversable): void {
  // Required because Three.js GLTFExporter checks for `pivot !== null` and
  // jsroot's build() doesn't set it (which is true for `undefined`)
  scene.traverse((obj) => {
    const o = obj as Record<string, unknown>;
    if (o.pivot === undefined) o.pivot = null;
  });
}
