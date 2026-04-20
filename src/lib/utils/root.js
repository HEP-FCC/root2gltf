import { matches } from "./helpers.js";
import {
  K_VIS_DAUGHTER,
  K_VIS_THIS,
  SPHERE_NSEG,
  SPHERE_NZ,
  TGEO_COMPOSITE_SHAPE,
  TGEO_SPHERE,
} from "../constants/root.js";

// Filter out all volume subparts within the hidden paths and beyond a maximum level
export function removeTrees(node, hiddenPaths, maxLevel, level = 0) {
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
}

// Makes given node and all its children invisible
export function hideTree(node) {
  node.fVolume.fGeoAtt &= ~K_VIS_THIS;

  node.fVolume.fNodes?.arr.forEach(hideTree);
}

// Avoid megabytes for near-flat shapes like Rich mirrors
function reshapeSphere(shape) {
  if (shape._typename === TGEO_SPHERE) {
    // Reduce the number of faces in a sphere
    shape.fNseg = SPHERE_NSEG;
    shape.fNz = SPHERE_NZ;
  } else if (shape._typename === TGEO_COMPOSITE_SHAPE) {
    // Recurse shape
    reshapeSphere(shape.fNode.fLeft);
    reshapeSphere(shape.fNode.fRight);
  }
}

// Makes given node visible
export function showNode(node) {
  node.fVolume.fGeoAtt |= K_VIS_THIS;

  reshapeSphere(node.fVolume.fShape);
}

// Makes given node and all its children visible
function showTree(node) {
  if (node.fVolume.fFillStyle !== 0) showNode(node);

  node.fVolume.fNodes?.arr.forEach(showTree);
}

// Find and show all volume subparts within the target paths
export function findTrees(node, paths) {
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
}

// @check
//
// /**
//  * Removes children nodes that are not matching paths
//  * these should never have been created, but jsRoot has limitations and may create
//  * unwanted children in cases where the same logical volume is shared by several physical
//  * volumes out of which some should be visible and others not.
//  * Root is never checking the flags of the physical volumes, only of the logical one,
//  * creating this situation
//  */
// export function cleanupChildren(child, paths) {
//   // check all children and call ourselves recursively when we keep one
//   filterArrayInPlace(
//     child.children,
//     (n) =>
//       n.name === "" ||
//       matches(`${n.name}_`, paths) ||
//       cleanupChildren(n, paths),
//   );
//   return child.children.length > 0;
// }
