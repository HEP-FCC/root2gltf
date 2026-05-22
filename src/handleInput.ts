import {
  K_VIS_DAUGHTER,
  K_VIS_THIS,
  SPHERE_NSEG,
  SPHERE_NZ,
  TGEO_COMPOSITE_SHAPE,
  TGEO_SPHERE,
} from "./lib/constants.js";
import type {
  TGeoNodeMatrix,
  TGeoVolume,
  TGeoManager,
} from "./lib/types/root.js";

// Filter out all volume subparts within the hidden paths and beyond a maximum level
export const removeTrees = (
  node: TGeoNodeMatrix,
  hiddenPaths: Set<string>,
  maxLevel: number,
  level = 0,
): void => {
  if (!node.fVolume.fNodes) return;

  const nodes = node.fVolume.fNodes.arr;
  let j = 0;

  nodes.forEach((n) => {
    if (level < maxLevel && !hiddenPaths.has(n.fName)) nodes[j++] = n;
  });

  nodes.length = j;

  nodes.forEach((n) => removeTrees(n, hiddenPaths, maxLevel, level + 1));
};

// Makes given node and all its children invisible
export const hideTree = (node: TGeoNodeMatrix): void => {
  node.fVolume.fGeoAtt &= ~K_VIS_THIS;

  if (node.fVolume.fNodes) node.fVolume.fNodes.arr.forEach(hideTree);
};

// Avoid megabytes for near-flat shapes like Rich mirrors
const reshapeSphere = (shape: any): void => {
  if (shape._typename === TGEO_SPHERE) {
    // Reduce the number of faces in a sphere
    shape.fNseg = SPHERE_NSEG;
    shape.fNz = SPHERE_NZ;
  } else if (shape._typename === TGEO_COMPOSITE_SHAPE) {
    // Recurse shape
    reshapeSphere(shape.fNode.fLeft);
    reshapeSphere(shape.fNode.fRight);
  }
};

// Makes given node visible
export const showNode = (node: TGeoNodeMatrix): void => {
  node.fVolume.fGeoAtt |= K_VIS_THIS;

  reshapeSphere(node.fVolume.fShape);
};

// Makes given node and all its children visible
const showTree = (node: TGeoNodeMatrix): void => {
  if (node.fVolume.fFillStyle !== 0) showNode(node);

  if (node.fVolume.fNodes) node.fVolume.fNodes.arr.forEach(showTree);
};

// Find and show all volume subparts within the target paths
export const findTrees = (
  node: TGeoNodeMatrix,
  paths: Set<string>,
): boolean => {
  if (!node.fVolume.fNodes) return false;

  let isFound = false;

  node.fVolume.fNodes.arr.forEach((n) => {
    if (paths.has(n.fName)) {
      // Make given node and all its children visible
      showTree(n);
      // Mark found
      isFound = true;
    } else if (findTrees(n, paths)) {
      // If the node name did not match one of the target paths
      // but one of its children's did, then set visibility flag
      n.fVolume.fGeoAtt |= K_VIS_DAUGHTER;
      isFound = true;
    }
  });

  return isFound;
};
