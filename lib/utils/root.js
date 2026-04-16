import { filterArrayInPlace, matches } from "./helpers.js";

/**
 * cleans up the geometry in node by dropping all subtress whose path starts with
 * one of the hidden_paths and all nodes byond a given level
 */
export function cleanup_geometry(
  node,
  hidden_paths,
  max_level,
  fullPath,
  level = 0,
  path = "_",
) {
  if (node.fVolume.fNodes) {
    path = `${path + node.fVolume.fName}_`;
    // drop hidden nodes, and everything after level max_level
    filterArrayInPlace(
      node.fVolume.fNodes.arr,
      (n) =>
        level < max_level &&
        !matches((fullPath ? path : "") + n.fName, hidden_paths),
    );
    // recurse to children
    if (node.fVolume.fNodes.arr.length > 0) {
      for (const snode of node.fVolume.fNodes.arr) {
        cleanup_geometry(
          snode,
          hidden_paths,
          max_level,
          fullPath,
          level + 1,
          path,
        );
      }
    }
  }
}

const kVisThis = 0x80;
const kVisDaughter = 0x8;

// goes recursively through shape and sets the number of segments for spheres
function fixSphereShapes(shape) {
  // in case of sphere, do the fix
  if (shape._typename == "TGeoSphere") {
    shape.fNseg = 3;
    shape.fNz = 3;
  }
  // in case of composite shape, recurse
  if (shape._typename == "TGeoCompositeShape") {
    fixSphereShapes(shape.fNode.fLeft);
    fixSphereShapes(shape.fNode.fRight);
  }
}

// makes given node visible
export function setVisible(node) {
  node.fVolume.fGeoAtt = node.fVolume.fGeoAtt | kVisThis;
}
// makes given node's daughters visible
function setVisibleDaughter(node) {
  node.fVolume.fGeoAtt = node.fVolume.fGeoAtt | kVisDaughter;
}
// makes given node invisible
function setInvisible(node) {
  node.fVolume.fGeoAtt = node.fVolume.fGeoAtt & ~kVisThis;
}
// makes given node and all its children recursively visible
function set_visible_recursively(node) {
  if (node.fVolume.fFillStyle != 0) {
    setVisible(node);
  }
  // Change the number of faces for sphere so that we avoid having
  // megabytes for the Rich mirrors, which are actually almost flat
  // Default was 20 and 11
  fixSphereShapes(node.fVolume.fShape);
  if (node.fVolume.fNodes) {
    for (const snode of node.fVolume.fNodes.arr) {
      set_visible_recursively(snode);
    }
  }
}
// makes given node and all its children recursively invisible
export function set_invisible_recursively(node) {
  setInvisible(node);
  if (node.fVolume.fNodes) {
    for (const snode of node.fVolume.fNodes.arr) {
      set_invisible_recursively(snode);
    }
  }
}

/**
 * make only the given paths visible in a geometry and returns
 * whether anything at all is visible
 */
export function keep_only_subpart(node, paths, fullPath, path = "_") {
  if (!node.fVolume) return false;
  const volume = node.fVolume;
  if (!volume.fNodes) return false;
  // mimic here the way root to gltf conversion works :
  // Top node uses master volume name, other use node name
  const name = path == "_" ? node.fVolume.fName : node.fName;
  path = `${path + name}_`;
  let anyfound = false;
  for (const snode of volume.fNodes.arr) {
    if (matches((fullPath ? path : "") + snode.fName, paths)) {
      // need to be recursive in case something deeper was hidden in previous round
      set_visible_recursively(snode);
      anyfound = true;
    } else {
      // make daughers visible if a subpart is shown
      const subpartfound = keep_only_subpart(snode, paths, fullPath, path);
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
export function cleanupChildren(child, paths, fullPath, path = "_") {
  // check all children and call ourselves recursively when we keep one
  filterArrayInPlace(
    child.children,
    (n) =>
      n.name == "" ||
      matches(`${(fullPath ? path : "") + n.name}_`, paths) ||
      cleanupChildren(n, paths, fullPath, `${path + n.name}_`),
  );
  return child.children.length > 0;
}
