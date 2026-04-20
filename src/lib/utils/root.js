import { filterArrayInPlace, matches } from "./helpers.js";

/**
 * cleans up the geometry in node by dropping all subtress whose path starts
 * with one of the hiddenPaths and all nodes beyond a given level
 */
export function cleanupGeometry(node, hiddenPaths, maxLevel, currLevel = 0) {
  if (node.fVolume.fNodes) {
    // drop hidden nodes, and everything after level maxLevel
    filterArrayInPlace(
      node.fVolume.fNodes.arr,
      (n) => currLevel < maxLevel && !matches(n.fName, hiddenPaths),
    );
    // @fix if (node.fVolume.fNodes.arr.length > 0) {
    for (const snode of node.fVolume.fNodes.arr) {
      cleanupGeometry(snode, hiddenPaths, maxLevel, currLevel + 1);
    }
  }
}

const kVisThis = 0x80;
const kVisDaughter = 0x8;

// goes recursively through shape and sets the number of segments for spheres
function fixSphereShapes(shape) {
  // in case of sphere, do the fix
  if (shape._typename === "TGeoSphere") {
    shape.fNseg = 3;
    shape.fNz = 3;
  }
  // in case of composite shape, recurse
  if (shape._typename === "TGeoCompositeShape") {
    fixSphereShapes(shape.fNode.fLeft);
    fixSphereShapes(shape.fNode.fRight);
  }
}

// makes given node visible
export function setVisible(node) {
  // eslint-disable-next-line no-bitwise
  node.fVolume.fGeoAtt |= kVisThis;

  // @fix moved from setVisibleRecursively
  // Change the number of faces for sphere so that we avoid having
  // megabytes for the Rich mirrors, which are actually almost flat
  // Default was 20 and 11
  fixSphereShapes(node.fVolume.fShape);
}
// makes given node's daughters visible
function setVisibleDaughter(node) {
  // eslint-disable-next-line no-bitwise
  node.fVolume.fGeoAtt |= kVisDaughter;
}
// makes given node invisible
function setInvisible(node) {
  // eslint-disable-next-line no-bitwise
  node.fVolume.fGeoAtt &= ~kVisThis;
}
// makes given node and all its children recursively visible
function setVisibleRecursively(node) {
  if (node.fVolume.fFillStyle !== 0) {
    setVisible(node);
  }
  // Change the number of faces for sphere so that we avoid having
  // megabytes for the Rich mirrors, which are actually almost flat
  // Default was 20 and 11
  if (node.fVolume.fNodes) {
    for (const snode of node.fVolume.fNodes.arr) {
      setVisibleRecursively(snode);
    }
  }
}

// makes given node and all its children recursively invisible
export function setInvisibleRecursively(node) {
  setInvisible(node);
  if (node.fVolume.fNodes) {
    for (const snode of node.fVolume.fNodes.arr) {
      setInvisibleRecursively(snode);
    }
  }
}

/**
 * make only the given paths visible in a geometry and returns
 * whether anything at all is visible
 */
export function keepOnlySubpart(node, paths) {
  if (!node.fNodes) return false;
  const volume = node.fVolume;
  if (!volume.fNodes) return false;
  // mimic here the way root to gltf conversion works :
  // Top node uses master volume name, other use node name
  let anyfound = false;

  for (const snode of volume.fNodes.arr) {
    if (matches(snode.fName, paths)) {
      // need to be resursive in case something deeper was hidden in previous round
      setVisibleRecursively(snode);
      anyfound = true;
    } else {
      // make daughers visible if a subpart is shown
      const subpartfound = keepOnlySubpart(snode, paths);
      if (subpartfound) {
        setVisibleDaughter(snode);
        anyfound = true;
      }
    }
  }
  return anyfound;
}

/**
 * Removes children nodes that are not matching paths
 * these should never have been created, but jsRoot has limitations and may create
 * unwanted children in cases where the same logical volume is shared by several physical
 * volumes out of which some should be visible and others not.
 * Root is never checking the flags of the physical volumes, only of the logical one,
 * creating this situation
 */
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
