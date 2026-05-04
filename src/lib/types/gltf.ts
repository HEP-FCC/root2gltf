interface GLTFPrimitiveAttributes {
  POSITION: number;
  NORMAL: number;
}

interface GLTFPrimitive {
  attributes: GLTFPrimitiveAttributes;
  material: number;
  mode: number;
}

interface GLTFMesh {
  primitives: GLTFPrimitive[];
}

interface GLTFPbrMetallicRoughness {
  baseColorFactor: [number, number, number, number];
  metallicFactor: number;
  roughnessFactor: number;
}

interface GLTFMaterial {
  pbrMetallicRoughness: GLTFPbrMetallicRoughness;
  alphaMode?: string;
}

interface GLTFLeafNode {
  name?: string;
  mesh: number;
}

interface GLTFBranchNode {
  name?: string;
  children?: number[];
  matrix?: number[];
}

export type GLTFNode = GLTFLeafNode | GLTFBranchNode;

export interface TGLTFGeometry {
  nodes: GLTFNode[];
  meshes: GLTFMesh[];
  materials: GLTFMaterial[];
}
