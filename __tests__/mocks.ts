import { jest, beforeEach } from "@jest/globals";
import type { TGeoNodeMatrix, TObjArray } from "../src/lib/types/root.js";
import type { TGLTFGeometry } from "../src/lib/types/gltf.js";

export const makeNode = (
  name: string,
  children: TGeoNodeMatrix[] = [],
  fGeoAtt = 0,
  fFillStyle = 0,
): TGeoNodeMatrix =>
  ({
    fName: name,
    fVolume: {
      fGeoAtt,
      fFillStyle,
      fNodes: children.length > 0 ? { arr: children } : null,
      fShape: { _typename: "TGeoBBox" },
    },
  }) as unknown as TGeoNodeMatrix;

export const makeInput = (
  rootGeo: unknown,
): {
  fKeys: { fName: string }[];
  readObject: ReturnType<typeof jest.fn>;
} => ({
  fKeys: [{ fName: "Geometry" }],
  readObject: jest.fn().mockImplementation(() => Promise.resolve(rootGeo)),
});

export const makeChildren = (names: string[]): TObjArray =>
  ({
    arr: names.map((name) => ({ fName: name })),
  }) as unknown as TObjArray;

export const mat = (
  r: number,
  g: number,
  b: number,
): TGLTFGeometry["materials"][0] => ({
  pbrMetallicRoughness: {
    baseColorFactor: [r, g, b, 1],
    metallicFactor: 0,
    roughnessFactor: 1,
  },
});

export const mesh = (posAccessor: number): TGLTFGeometry["meshes"][0] => ({
  primitives: [
    { attributes: { POSITION: posAccessor, NORMAL: 0 }, material: 0, mode: 4 },
  ],
});

export const silenceConsole = (): void => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });
};
