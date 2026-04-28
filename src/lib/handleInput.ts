import {
  K_VIS_DAUGHTER,
  K_VIS_THIS,
  SPHERE_NSEG,
  SPHERE_NZ,
  TGEO_COMPOSITE_SHAPE,
  TGEO_SPHERE,
} from "./constants.js";

// Filter out all volume subparts within the hidden paths and beyond a maximum level
export const removeTrees = (
  node: any,
  hiddenPaths: Set<string>,
  maxLevel: number,
  level = 0,
): void => {
  if (!node.fVolume.fNodes) return;

  const nodes = node.fVolume.fNodes.arr;
  let j = 0;

  nodes.forEach((n: any, i: number) => {
    if (level < maxLevel && !hiddenPaths.has(n.fName)) nodes[j++] = nodes[i];
  });

  nodes.length = j;

  nodes.forEach((snode: any) =>
    removeTrees(snode, hiddenPaths, maxLevel, level + 1),
  );
};

// Makes given node and all its children invisible
export const hideTree = (node: any): void => {
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
export const showNode = (node: any): void => {
  node.fVolume.fGeoAtt |= K_VIS_THIS;

  reshapeSphere(node.fVolume.fShape);
};

// Makes given node and all its children visible
const showTree = (node: any): void => {
  if (node.fVolume.fFillStyle !== 0) showNode(node);

  if (node.fVolume.fNodes) node.fVolume.fNodes.arr.forEach(showTree);
};

// Find and show all volume subparts within the target paths
export const findTrees = (node: any, paths: Set<string>): boolean => {
  if (!node.fVolume.fNodes) return false;

  let isFound = false;

  node.fVolume.fNodes.arr.forEach((snode: any) => {
    if (paths.has(snode.fName)) {
      // Make given node and all its children visible
      showTree(snode);
      // Mark found
      isFound = true;
    } else if (findTrees(snode, paths)) {
      // If the node name did not match one of the target paths
      // but one of its children's did, then set visibility flag
      snode.fVolume.fGeoAtt |= K_VIS_DAUGHTER;
      isFound = true;
    }
  });

  return isFound;
};

// Counts the number of objects in a hierarchy
export function countGLTFObjects(node: any): number {
  let n = node.children.length;

  // eslint-disable-next-line no-restricted-syntax
  for (const child of node.children) {
    n += countGLTFObjects(child);
  }

  return n;
}

// Counts the number of objects in a hierarchy
export function countRootObjects(container: { fNodes: any }): number {
  let n = container.fNodes.arr.length;

  // eslint-disable-next-line no-restricted-syntax
  for (const child of container.fNodes.arr) {
    if (child.fVolume.fNodes) {
      n += countRootObjects(child.fVolume);
    }
  }

  return n;
}
