import { geoCfg } from "jsroot";
import { build } from "jsroot/geom";
import { Scene } from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

import { findTrees, hideTree, removeTrees, showNode } from "./handleInput.js";
import {
  countGLTFObjects,
  deduplicateMaterials,
  deduplicateMeshes,
} from "./deduplicateOutput.js";
import mergeGLTF from "./concatenateOutput.js";

// Constants
import { BUILD_OPTIONS, GEO_GRAD_PER_SEGM } from "./lib/constants.js";

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

// Polyfill FileReader for Node.js using the native Blob.arrayBuffer()
installPolyfills();

const root2gltf = async ({
  input,
  config = null,
}: TParams): Promise<TGLTFGeometry> => {
  try {
    // Read file detector geometry
    const rootGeo: TGeoManager = await input.readObject(input.fKeys[0].fName);
    if (!rootGeo) throw new Error("Failed to read detector geometry");

    // Read geometry parent node
    const rootNode = rootGeo.fNodes.arr[0];
    if (!rootNode) throw new Error("Geometry has no parent node");

    // Read parent node subparts
    const childrenNodes = rootNode.fVolume.fNodes;
    if (!childrenNodes) throw new Error("Parent node has no subparts");

    // Define variables
    const { hidden, depth, subparts } = generateConfig(config, childrenNodes);
    const exporter = new GLTFExporter();
    let gltfGeo: TGLTFGeometry | null = null;

    // Filter out all nodes within hidden paths and beyond a maximum level
    removeTrees(rootNode, new Set(hidden), depth);

    // Set number of degrees per face for circles
    geoCfg("GradPerSegm", GEO_GRAD_PER_SEGM);

    for (const [key, values] of Object.entries(subparts)) {
      const rootScene = new Scene(); // Use one scene per config subpart

      hideTree(rootNode); // Hide volume and all its subparts for the new scene
      showNode(rootNode); // Show volume
      findTrees(rootNode, new Set(values)); // Find and show all volume subparts within the target paths
      normalizePivot(rootScene); // Normalize pivot to null before exporting for Three.js GLTFExporter

      rootScene.name = key;
      rootScene.children.push(build(rootGeo, BUILD_OPTIONS)); // Build from reassigned parameters
      rootScene.userData.visible = true;
      rootScene.userData.opacity = 0.5; // 50% transparency

      console.log(
        `INFO: ${key} has ${countGLTFObjects(rootScene.children[rootScene.children.length - 1])} objects`,
      );

      // Build one scene at a time so each graph is freed instead of accumulating in memory.
      const gltfScene = (await new Promise<unknown>((resolve, reject) => {
        exporter.parse(rootScene, resolve, reject);
      })) as TGLTFGeometry;

      if (!gltfGeo) gltfGeo = gltfScene;
      else mergeGLTF(gltfGeo, gltfScene);
    }

    // Reduce the output file size by removing redundant data that jsroot generates
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
