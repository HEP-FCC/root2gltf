interface RootBitOps {
  TestBit: (bit: number) => boolean;
  InvertBit: (bit: number) => void;
  SetBit: (bit: number, value?: boolean) => void;
}

export type TGeoIdentity = RootBitOps & {
  _typename: "TGeoIdentity";
  fUniqueID: number;
  fBits: number;
  fName: string;
  fTitle: string;
};

export type TGeoBBox = RootBitOps & {
  _typename: "TGeoBBox";
  fUniqueID: number;
  fBits: number;
  fName: string;
  fTitle: string;
  fShapeId: number;
  fShapeBits: number;
  fDX: number;
  fDY: number;
  fDZ: number;
  fOrigin: Float64Array;
  $nfaces: number;
};

export type TGeoMedium = RootBitOps & {
  _typename: "TGeoMedium";
  fUniqueID: number;
  fBits: number;
  fName: string;
  fTitle: string;
  fId: number;
  fParams: Float64Array;
  fMaterial: object;
};

export type TGeoVoxelFinder = RootBitOps & {
  _typename: "TGeoVoxelFinder";
  fUniqueID: number;
  fBits: number;
  fVolume: TGeoVolume;
  fIbx: number;
  fIby: number;
  fIbz: number;
  fNboxes: number;
  fNox: number;
  fNoy: number;
  fNoz: number;
  fNex: number;
  fNey: number;
  fNez: number;
  fNx: number;
  fNy: number;
  fNz: number;
  fPriority: Int32Array;
  fBoxes: Float64Array;
  fXb: Float64Array;
  fYb: Float64Array;
  fZb: Float64Array;
  fOBx: Int32Array;
  fOBy: Int32Array;
  fOBz: Int32Array;
  fOEx: Int32Array;
  fOEy: Int32Array;
  fOEz: Int32Array;
  fExtraX: Int32Array;
  fExtraY: Int32Array;
  fExtraZ: Int32Array;
  fNsliceX: Int32Array;
  fNsliceY: Int32Array;
  fNsliceZ: Int32Array;
  fIndcX: Uint8Array;
  fIndcY: Uint8Array;
  fIndcZ: Uint8Array;
};

export type TObjArray = RootBitOps & {
  _typename: "TObjArray";
  $kind: "TObjArray";
  name: string;
  fUniqueID: number;
  fBits: number;
  arr: TGeoNodeMatrix[];
  fLast: number;
  fLowerBound: number;
};

export type TGeoVolume = RootBitOps & {
  _typename: "TGeoVolume";
  fUniqueID: number;
  fBits: number;
  fName: string;
  fTitle: string;
  fGeoAtt: number;
  fLineColor: number;
  fLineStyle: number;
  fLineWidth: number;
  fFillColor: number;
  fFillStyle: number;
  fNodes: TObjArray;
  fShape: TGeoBBox;
  fMedium: TGeoMedium;
  fFinder: null;
  fVoxels: TGeoVoxelFinder;
  fNumber: number;
  fNtotal: number;
  fRefCount: number;
  fTransparency: number;
};

export type TGeoNodeMatrix = RootBitOps & {
  _typename: "TGeoNodeMatrix";
  fUniqueID: number;
  fBits: number;
  fName: string;
  fTitle: string;
  fGeoAtt: number;
  fVolume: TGeoVolume;
  fMother: null;
  fNumber: number;
  fNovlp: number;
  fOverlaps: never[];
  fMatrix: TGeoIdentity;
};
