/// checks whether a name matches one of the given paths
export function matches(name, paths) {
  for (const path of paths) {
    if (typeof path === "string") {
      if (name.startsWith(path)) {
        return true;
      }
    } else {
      // needs to be a regexp
      if (name.match(path)) {
        return true;
      }
    }
  }
  return false;
}

/// filters an array in place
export function filterArrayInPlace(a, condition, thisArg) {
  let j = 0;
  a.forEach((e, i) => {
    if (condition.call(thisArg, e, i, a)) {
      if (i !== j) a[j] = e;
      j++;
    }
  });
  a.length = j;
  return a;
}

export function forceDisplay() {
  return new Promise((resolve) => setTimeout(resolve, 0));
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
