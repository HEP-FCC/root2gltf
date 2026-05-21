import { describe, it, expect, jest } from "@jest/globals";

import { makeNode, makeInput, silenceConsole } from "./mocks.js";

// Mock geoCfg from jsroot
jest.unstable_mockModule("jsroot", () => ({
  geoCfg: jest.fn(),
}));

// Mock build from jsroot/geom
jest.unstable_mockModule("jsroot/geom", () => ({
  build: jest.fn(() => ({ children: [] })),
}));

// Mock scene from three.js
jest.unstable_mockModule("three", () => ({
  Scene: jest.fn().mockImplementation(() => ({
    name: "",
    children: [],
    userData: {},
    traverse: jest.fn(),
  })),
}));

// Mock GLTFExporter from three/examples/jsm/exporters/GLTFExporter.js
jest.unstable_mockModule(
  "three/examples/jsm/exporters/GLTFExporter.js",
  () => ({
    GLTFExporter: jest.fn().mockImplementation(() => ({
      parse: jest.fn((_scenes: unknown, resolve: (v: unknown) => void) =>
        resolve({ nodes: [], meshes: [], materials: [] }),
      ),
    })),
  }),
);

const { default: root2gltf } = await import("../src/index.js");

silenceConsole();

describe("root2gltf", () => {
  describe("given readObject returns null", () => {
    describe("when root2gltf is called", () => {
      it("then throws an error with a cause", async () => {
        const input = makeInput(null);
        const err = await root2gltf({ input }).catch((e) => e);

        expect(err).toBeInstanceOf(Error);
        expect(err.cause).toBeInstanceOf(Error);
      });
    });
  });

  describe("given rootGeo has no nodes", () => {
    describe("when root2gltf is called", () => {
      it("then throws an error with a cause", async () => {
        const input = makeInput({ fNodes: { arr: [] } });
        const err = await root2gltf({ input }).catch((e) => e);

        expect(err).toBeInstanceOf(Error);
        expect(err.cause).toBeInstanceOf(Error);
      });
    });
  });

  describe("given the root node has no children", () => {
    describe("when root2gltf is called", () => {
      it("then throws an error with a cause", async () => {
        const input = makeInput({ fNodes: { arr: [makeNode("Root")] } });
        const err = await root2gltf({ input }).catch((e) => e);

        expect(err).toBeInstanceOf(Error);
        expect(err.cause).toBeInstanceOf(Error);
      });
    });
  });

  describe("given a valid geometry with two top-level children", () => {
    const child1 = makeNode("PartA");
    const child2 = makeNode("PartB");
    const rootGeo = { fNodes: { arr: [makeNode("Root", [child1, child2])] } };

    describe("when called without config", () => {
      it("then returns a TGLTFGeometry-shaped object", async () => {
        const result = await root2gltf({ input: makeInput(rootGeo) });

        expect(result).toMatchObject({ nodes: [], meshes: [], materials: [] });
      });

      it("then creates one scene per top-level child", async () => {
        const { Scene } = await import("three");

        jest.mocked(Scene).mockClear();
        await root2gltf({ input: makeInput(rootGeo) });
        expect(jest.mocked(Scene).mock.calls).toHaveLength(2);
      });
    });

    describe("when config specifies subparts", () => {
      it("then creates one scene per subpart entry", async () => {
        const { Scene } = await import("three");

        jest.mocked(Scene).mockClear();
        await root2gltf({
          input: makeInput(rootGeo),
          config: {
            hidden: [],
            subparts: { "Group A": ["PartA", "PartB"] },
            depth: 2,
          },
        });
        expect(jest.mocked(Scene).mock.calls).toHaveLength(1);
      });
    });
  });
});
