import { geoCfg } from "jsroot";
import { build } from "jsroot/geom";
import { Scene } from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

import { findTrees, hideTree, pruneTree } from "./handleInput.js";
import {
  countGLTFObjects,
  deduplicateMaterials,
  deduplicateMeshes,
} from "./deduplicateOutput.js";
import mergeGLTF from "./concatenateOutput.js";

// Constants
import {
  DEFAULT_DEPTH,
  GEO_GRAD_PER_SEGM,
  MAX_OPACITY,
  MIN_OPACITY,
  SCENE_OPTIONS,
} from "./lib/constants.js";

// Types
import type { TParams } from "./lib/types/converter.js";
import type { TGeoManager } from "./lib/types/root.js";
import type { TGLTFGeometry } from "./lib/types/gltf.js";

// Utils
import generateConfig from "./lib/utils/generateConfig.js";
import {
  installPolyfills,
  normalizePivot,
} from "./lib/utils/nodeWorkarounds.js";
import assignColors from "./lib/utils/assignColors.js";

// Polyfill FileReader for Node.js using the native Blob.arrayBuffer()
installPolyfills();

const root2gltf = async ({
  input,
  depth,
  config,
}: TParams): Promise<TGLTFGeometry> => {
  try {
    const verbose = true;

    if (depth !== undefined && !(Number.isInteger(depth) && depth > 0))
      throw new Error("Depth must be a positive integer");

    console.log("ROOT2glTF: Reading detector geometry (might take a while)...");

    const rootGeo: TGeoManager = await input.readObject(input.fKeys[0].fName);
    if (!rootGeo) throw new Error("Failed to read detector geometry");

    const rootNode = rootGeo.fNodes.arr[0]; // Root volume is shared by all the scenes
    if (!rootNode) throw new Error("Geometry has no parent node");

    const children = rootNode.fVolume.fNodes;
    if (!children) throw new Error("Parent node has no subparts");

    console.log("ROOT2glTF: starting glTF conversion...");

    const treeDepth = depth ?? DEFAULT_DEPTH;
    const currentConfig = generateConfig(config, children);
    const exporter = new GLTFExporter();
    const totalScenes = Object.keys(currentConfig.namedScenes).length - 1;

    let i = 0; // Current value to apply dynamic transparency
    let gltfGeo: TGLTFGeometry | null = null;

    // Filter out all nodes within hidden paths and beyond a maximum level
    pruneTree(rootNode, new Set(currentConfig.hiddenVolumes), treeDepth);

    // Optionally assign a random color to volumes with an undefined, black or white value
    if (currentConfig.missingColors) assignColors(rootNode, verbose);

    // Set number of degrees per face for circles
    geoCfg("GradPerSegm", GEO_GRAD_PER_SEGM);

    for (const [key, values] of Object.entries(currentConfig.namedScenes)) {
      const rootScene = new Scene(); // Use one scene per config subpart
      const sceneOptions = SCENE_OPTIONS;

      hideTree(rootNode); // Reset the volume by hiding all subparts shown in the previous iteration
      findTrees(rootNode, new Set(values)); // Find and show all subparts corresponding to the current iteration

      rootScene.name = key;
      rootScene.children.push(build(rootGeo, sceneOptions)); // Build from reassigned parameters
      rootScene.userData.visible = true;

      // Optionally assign increasing transparency
      if (currentConfig.reduceOpacity) {
        rootScene.userData.opacity =
          ((totalScenes - i) * (MAX_OPACITY - MIN_OPACITY)) / totalScenes +
          MIN_OPACITY;
      }

      if (verbose) {
        const childrenNumber = countGLTFObjects(rootScene.children.at(-1));
        console.log(`ROOT2glTF: Parent ${key} has ${childrenNumber} nodes`);
      }

      normalizePivot(rootScene); // ROOTJS workaround

      // Build one scene at a time so each graph is freed instead of accumulating in memory
      const gltfScene = (await new Promise<unknown>((resolve, reject) => {
        exporter.parse(rootScene, resolve, reject);
      })) as TGLTFGeometry;

      if (!gltfGeo) gltfGeo = gltfScene;
      else mergeGLTF(gltfGeo, gltfScene);

      i++;
    }

    console.log("ROOT2glTF: Removing redundant data...");
    deduplicateMaterials(gltfGeo!);
    deduplicateMeshes(gltfGeo!);

    return gltfGeo!;
  } catch (error) {
    throw new Error("Failed to convert ROOT file to glTF", {
      cause: error,
    });
  }
};

export default root2gltf;
