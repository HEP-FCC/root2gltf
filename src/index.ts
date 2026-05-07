import "./lib/polyfill.js";

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

const root2gltf = async ({
  input,
  config,
}: TParams): Promise<TGLTFGeometry> => {
  const rootGeo: TGeoManager = await input.readObject(input.fKeys[0].fName);
  const rootNode = rootGeo.fNodes.arr[0]!;
  const { childrenToHide, maxLevel, subParts } = config;
  const exporter = new GLTFExporter();

  console.log(`INFO: Input has ${countRootObjects(rootGeo)} objects`);

  // Filter out all nodes within hidden paths and beyond a maximum level
  removeTrees(rootNode, new Set(childrenToHide), maxLevel);

  // Set number of degrees per face for circles
  geoCfg("GradPerSegm", GEO_GRAD_PER_SEGM);

  const scenes = Object.entries(subParts).map(
    ([key, values]: [string, string[]]) => {
      // Use one scene per config subpart
      const scene = new Scene();

      // Hide volume and all its subparts for the new scene
      hideTree(rootNode);

      // Show volume
      showNode(rootNode);

      // Find and show all volume subparts within the target paths
      findTrees(rootNode, new Set(values));

      const built = build(rootGeo, BUILD_OPTIONS);

      // Define scene properties
      scene.name = key;
      scene.children.push(built);
      scene.userData.visible = true;
      scene.userData.opacity = 0.5;

      // Normalize pivot to null before exporting
      scene.traverse((obj) => {
        // Three.js GLTFExporter checks for `pivot !== null` (which is true for `undefined`),
        // and jsroot's build() doesn't set it.
        if (obj.pivot === undefined) obj.pivot = null;
      });

      console.log(`INFO: ${key} has ${countGLTFObjects(built)} objects`);

      return scene;
    },
  );

  // Configure output file
  const gltfGeo = (await new Promise<unknown>((resolve, reject) => {
    exporter.parse(scenes, resolve, reject);
  })) as TGLTFGeometry;

  // Reduce the output file size by removing redundant data that jsroot generates
  console.log("INFO: Deduplicating GLTF data");
  deduplicateMaterials(gltfGeo);
  deduplicateMeshes(gltfGeo);

  return gltfGeo;
};

export default root2gltf;
