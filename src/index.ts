import "./lib/utils/polyfill.js";

import { geoCfg } from "jsroot";
import { build } from "jsroot/geom";
import { Scene } from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

import { BUILD_OPTIONS, GEO_GRAD_PER_SEGM } from "./lib/constants.js";
import {
  countRootObjects,
  findTrees,
  hideTree,
  removeTrees,
  showNode,
} from "./handleInput.js";
import {
  countGLTFObjects,
  deduplicateMaterials,
  deduplicateMeshes,
} from "./handleOutput.js";
import type { TParams } from "./lib/types/converter.js";
import type { TGeoManager } from "./lib/types/root.js";
import type { TGLTFGeometry } from "./lib/types/gltf.js";
import generateConfig from "./lib/utils/generateConfig.js";

const root2gltf = async ({
  input,
  config = null,
}: TParams): Promise<TGLTFGeometry> => {
  try {
    const rootGeo: TGeoManager = await input.readObject(input.fKeys[0].fName);
    if (!rootGeo) throw new Error("Failed to read detector geometry");

    const rootNode = rootGeo.fNodes.arr[0];
    if (!rootNode) throw new Error("Geometry has no parent node");

    const childrenNodes = rootNode.fVolume.fNodes;
    if (!childrenNodes) throw new Error("Parent node has no subparts");

    const { hidden, depth, subparts } = generateConfig(config, childrenNodes);
    const exporter = new GLTFExporter();

    console.log(
      `INFO: Parsing input file (${countRootObjects(rootGeo)} objects)`,
    );

    // Filter out all nodes within hidden paths and beyond a maximum level
    removeTrees(rootNode, new Set(hidden), depth);

    // Set number of degrees per face for circles
    geoCfg("GradPerSegm", GEO_GRAD_PER_SEGM);

    const scenes = Object.entries(subparts).map(
      ([key, values]: [string, string[]], index) => {
        const scene = new Scene(); // Use one scene per config subpart

        hideTree(rootNode); // Hide volume and all its subparts for the new scene
        showNode(rootNode); // Show volume
        findTrees(rootNode, new Set(values)); // Find and show all volume subparts within the target paths

        scene.name = key;
        scene.children.push(build(rootGeo, BUILD_OPTIONS)); // Build from reassigned parameters
        scene.userData.visible = true;
        scene.userData.opacity = 0.5; // 50% transparency

        // Normalize pivot to null before exporting
        scene.traverse((obj) => {
          // Three.js GLTFExporter checks for `pivot !== null` (which is true for `undefined`),
          // and jsroot's build() doesn't set it.
          if (obj.pivot === undefined) obj.pivot = null;
        });

        console.log(
          `INFO: ${index}: ${key} has ${countGLTFObjects(scene.children[scene.children.length - 1])} objects`,
        );

        return scene;
      },
    );

    // Configure output file
    const gltfGeo = (await new Promise<unknown>((resolve, reject) => {
      exporter.parse(scenes, resolve, reject);
    })) as TGLTFGeometry;

    // Reduce the output file size by removing redundant data that jsroot generates
    console.log("INFO: Optimizing output file");
    deduplicateMaterials(gltfGeo);
    deduplicateMeshes(gltfGeo);

    return gltfGeo;
  } catch (error) {
    throw new Error("Failed to convert ROOT file to glTF", {
      cause: error,
    });
  }
};

export default root2gltf;
