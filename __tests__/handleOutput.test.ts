import { describe, it, expect } from "@jest/globals";
import {
  deduplicateMaterials,
  deduplicateMeshes,
  countGLTFObjects,
} from "../src/handleOutput.js";
import type { TGLTFGeometry } from "../src/lib/types/gltf.js";
import { mat, mesh, silenceConsole } from "./mocks.js";

silenceConsole();

describe("deduplicateMaterials", () => {
  describe("given all materials are unique", () => {
    describe("when deduplicateMaterials is called", () => {
      it("then leaves them unchanged", () => {
        const geo: TGLTFGeometry = {
          materials: [mat(1, 0, 0), mat(0, 1, 0)],
          meshes: [
            {
              primitives: [
                {
                  attributes: { POSITION: 0, NORMAL: 0 },
                  material: 0,
                  mode: 4,
                },
              ],
            },
          ],
          nodes: [],
        };

        deduplicateMaterials(geo);
        expect(geo.materials).toHaveLength(2);
      });
    });
  });

  describe("given duplicate materials exist", () => {
    describe("when deduplicateMaterials is called", () => {
      it("then removes duplicates", () => {
        const geo: TGLTFGeometry = {
          materials: [mat(1, 0, 0), mat(0, 1, 0), mat(1, 0, 0)],
          meshes: [],
          nodes: [],
        };

        deduplicateMaterials(geo);
        expect(geo.materials).toHaveLength(2);
      });

      it("then rewires primitive material indices", () => {
        const geo: TGLTFGeometry = {
          materials: [mat(1, 0, 0), mat(0, 1, 0), mat(1, 0, 0)],
          meshes: [
            {
              primitives: [
                {
                  attributes: { POSITION: 0, NORMAL: 0 },
                  material: 0,
                  mode: 4,
                },
                {
                  attributes: { POSITION: 0, NORMAL: 0 },
                  material: 2,
                  mode: 4,
                },
              ],
            },
          ],
          nodes: [],
        };

        deduplicateMaterials(geo);
        expect(geo.meshes[0]!.primitives[0]!.material).toBe(0);
        expect(geo.meshes[0]!.primitives[1]!.material).toBe(0);
      });
    });
  });
});

describe("deduplicateMeshes", () => {
  describe("given all meshes are unique", () => {
    describe("when deduplicateMeshes is called", () => {
      it("then leaves them unchanged", () => {
        const geo: TGLTFGeometry = {
          materials: [],
          meshes: [mesh(0), mesh(1)],
          nodes: [],
        };

        deduplicateMeshes(geo);
        expect(geo.meshes).toHaveLength(2);
      });
    });
  });

  describe("given duplicate meshes exist", () => {
    describe("when deduplicateMeshes is called", () => {
      it("then removes duplicates", () => {
        const geo: TGLTFGeometry = {
          materials: [],
          meshes: [mesh(0), mesh(1), mesh(0)],
          nodes: [],
        };

        deduplicateMeshes(geo);
        expect(geo.meshes).toHaveLength(2);
      });

      it("then rewires node mesh indices", () => {
        const geo: TGLTFGeometry = {
          materials: [],
          meshes: [mesh(0), mesh(1), mesh(0)],
          nodes: [{ mesh: 0 }, { mesh: 2 }],
        };

        deduplicateMeshes(geo);
        expect((geo.nodes[0] as { mesh: number }).mesh).toBe(0);
        expect((geo.nodes[1] as { mesh: number }).mesh).toBe(0);
      });
    });
  });
});

describe("countGLTFObjects", () => {
  describe("given a leaf node with no children", () => {
    describe("when countGLTFObjects is called", () => {
      it("then returns 0", () => {
        expect(countGLTFObjects({ children: [] })).toBe(0);
      });
    });
  });

  describe("given a node with direct children", () => {
    describe("when countGLTFObjects is called", () => {
      it("then counts them", () => {
        const node = { children: [{ children: [] }, { children: [] }] };

        expect(countGLTFObjects(node)).toBe(2);
      });
    });
  });

  describe("given a node with nested children", () => {
    describe("when countGLTFObjects is called", () => {
      it("then counts recursively", () => {
        const node = { children: [{ children: [{ children: [] }] }] };

        expect(countGLTFObjects(node)).toBe(2);
      });
    });
  });
});
