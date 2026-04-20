/// checks whether a name matches one of the given paths
export function matches(name, paths) {
  for (const path of paths) {
    if (typeof path === "string") {
      if (name.startsWith(path)) {
        return true;
      }
    } else if (name.match(path)) {
      // needs to be a regexp
      return true;
    }
  }
  return false;
}

/**
 * Counts the number of objects in a hierarchy
 */
export function countGLTFObjects(node) {
  let n = node.children.length;
  for (const child of node.children) {
    n += countGLTFObjects(child);
  }
  return n;
}

/**
 * Counts the number of objects in a hierarchy
 */
export function countRootObjects(volume) {
  let n = volume.fNodes.arr.length;
  for (const child of volume.fNodes.arr) {
    if (child.fVolume.fNodes) {
      n += countRootObjects(child.fVolume);
    }
  }
  return n;
}
