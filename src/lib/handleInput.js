import {
  K_VIS_THIS,
  K_VIS_DAUGHTER,
  TGEO_SPHERE,
  TGEO_COMPOSITE_SHAPE,
  SPHERE_NSEG,
  SPHERE_NZ,
} from "./constants.js";

/// checks whether a name matches one of the given paths
export const matches = (name, paths) => {
  for (const path of paths) {
    if (typeof path === "string" && name.startsWith(path)) return true;
    if (name.match(path)) return true; // @todo needs to be a regexp
  }

  return false;
};

// Filter out all volume subparts within the hidden paths and beyond a maximum level
export const removeTrees = (node, hiddenPaths, maxLevel, level = 0) => {
  if (!node.fVolume.fNodes) return;

  const nodes = node.fVolume.fNodes.arr;
  let j = 0;

  nodes.forEach((n, i) => {
    if (level < maxLevel && !matches(n.fName, hiddenPaths))
      nodes[j++] = nodes[i];
  });

  nodes.length = j;

  nodes.forEach((snode) =>
    removeTrees(snode, hiddenPaths, maxLevel, level + 1),
  );
};

// Makes given node and all its children invisible
export const hideTree = (node) => {
  node.fVolume.fGeoAtt &= ~K_VIS_THIS;

  if (node.fVolume.fNodes) node.fVolume.fNodes.arr.forEach(hideTree);
};

// Avoid megabytes for near-flat shapes like Rich mirrors
const reshapeSphere = (shape) => {
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
export const showNode = (node) => {
  node.fVolume.fGeoAtt |= K_VIS_THIS;

  reshapeSphere(node.fVolume.fShape);
};

// Makes given node and all its children visible
const showTree = (node) => {
  if (node.fVolume.fFillStyle !== 0) showNode(node);

  if (node.fVolume.fNodes) node.fVolume.fNodes.arr.forEach(showTree);
};

// Find and show all volume subparts within the target paths
export const findTrees = (node, paths) => {
  if (!node.fVolume.fNodes) return false;

  let isFound = false;

  node.fVolume.fNodes.arr.forEach((snode) => {
    if (matches(snode.fName, paths)) {
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
export function countGLTFObjects(node) {
  let n = node.children.length;

  for (const child of node.children) {
    n += countGLTFObjects(child);
  }

  return n;
}

// Counts the number of objects in a hierarchy
export function countRootObjects(volume) {
  let n = volume.fNodes.arr.length;

  for (const child of volume.fNodes.arr) {
    if (child.fVolume.fNodes) {
      n += countRootObjects(child.fVolume);
    }
  }

  return n;
}
