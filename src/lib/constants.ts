// Build constants
export const DEFAULT_DEPTH = 3;
export const MISSING_COLORS = true;
export const REDUCE_OPACITY = true;

// Scene options
export const THRESHOLD = 1e-4; // Minimum distance from the parent volume to be considered rudundant
export const MAX_OPACITY = 1; // Maximum opacity limit
export const MIN_OPACITY = 0.5; // Minimum opacity limit
export const SCENE_OPTIONS = {
  // vislevel: 4, // guardrail on the depth of the geometry hierarchy to traverse and render
  // numnodes: 1000, // guardrail on the total number of visible nodes across the whole scene
  numfaces: 1000, // (default 10000) guardrail on the total number of triangle faces across the whole scene
  // dflt_colors: false, // avoids overriding predefined colors
  // no_screen: false, // ignores kVisOnScreen visibility bits when set
  // composite: false, // unfolds composite shapes into separate parts
  // showtop: false, // renders the top/master volume (TGeoManager only)
  // instancing: -1, // -1 disables InstancedMesh, 1 forces it, 0 lets jsroot decide
  // frustum: null, // camera frustum used for LOD culling (irrelevant when rendering headless)
  material_kind: "standard", // three.js material used for generated meshes (GLTFExporter only accepts standard or basic)
  metalness: 0, // same exported metallicFactor and roughnessFactor as the default lambert material
  roughness: 1,
  // set_names: true, // attaches volume names to generated meshes
};
export const SHRINK_FACTOR = 0.999; // Scale applied to every dimension field of a shape.
/*
 * Changing the shrinkage factor to 0.9999 instead of 0.999 brings
 * back tesellation, check https://github.com/HEP-FCC/root2gltf/pull/15.
 */

// Visibility flags
export const K_VIS_ON_SCREEN = 0x80;
export const K_VIS_DAUGHTER = 0x8;

// jsroot properties
export const T_GEO_B_BOX_IDENTITY_FIELDS = new Set([
  "fUniqueID",
  "fBits",
  "fName",
  "fTitle",
  "fShapeId",
  "fShapeBits",
]);
export const MATRIX_TYPES = new Set([
  "TGeoIdentity",
  "TGeoTranslation",
  "TGeoRotation",
  "TGeoScale",
  "TGeoCombiTrans",
  "TGeoGenTrans",
  "TGeoHMatrix",
]);

// Sphere segment counts
export const SPHERE_NSEG = 3;
export const SPHERE_NZ = 3;
export const T_GEO_SPHERE = "TGeoSphere";
export const T_GEO_COMPOSITE_SHAPE = "TGeoCompositeShape";

// jsroot build parameters
export const GEO_GRAD_PER_SEGM = 360 / 30;

// Color constants
export const K_WHITE = 0; // ROOT white
export const K_BLACK = 1; // ROOT black
export const K_LINE = 1; // Line color of ROOT volumes without visualization attributes
export const K_FILL = 19; // Fill color of ROOT volumes without visualization attributes
