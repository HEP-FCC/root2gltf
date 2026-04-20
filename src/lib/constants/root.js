// Visibility flags
export const K_VIS_THIS = 0x80;
export const K_VIS_DAUGHTER = 0x8;

// Root type names
export const TGEO_SPHERE = "TGeoSphere";
export const TGEO_COMPOSITE_SHAPE = "TGeoCompositeShape";

// Sphere segment counts
export const SPHERE_NSEG = 3;
export const SPHERE_NZ = 3;

// jsroot build parameters
export const GEO_GRAD_PER_SEGM = 360 / 24;
export const BUILD_OPTIONS = {
  dflt_colors: true,
  vislevel: 10,
  numfaces: 10000000,
  numnodes: 500000,
};
