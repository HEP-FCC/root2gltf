import { readFile, writeFile } from "node:fs/promises";
import { parse } from "node:path";

import { geoCfg, openFile } from "jsroot";
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
import type { TConfig } from "./lib/types/config.js";
import type { TGeoManager } from "./lib/types/root.js";
import type { TGLTFGeometry } from "./lib/types/gltf.js";

const root2gltf = async (
  inputPath: string,
  configPath: string,
  optionalOutput?: string,
): Promise<void> => {
  console.log("INFO: Reading input file");
  const input = await openFile(inputPath);
  const rootGeo: TGeoManager = await input.readObject(input.fKeys[0].fName);
  const rootNode = rootGeo.fNodes.arr[0]!;

  console.log("INFO: Reading config file");
  const config = await readFile(configPath);
  const settings: TConfig = JSON.parse(config.toString());
  const { childrenToHide, maxLevel, subParts } = settings;

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
  const exporter = new GLTFExporter();
  const outputPath = optionalOutput || `${parse(inputPath).name}.gltf`;
  const gltfGeo = (await new Promise<unknown>((resolve, reject) => {
    exporter.parse(scenes, resolve, reject);
  })) as TGLTFGeometry;

  // Reduce the output file size by removing redundant data that jsroot generates
  console.log("INFO: Deduplicating GLTF data");
  deduplicateMaterials(gltfGeo);
  deduplicateMeshes(gltfGeo);

  console.log("INFO: Writing output file");
  await writeFile(outputPath, JSON.stringify(gltfGeo), "utf8");

  console.log(`INFO: Result saved to '${outputPath}'`);
};

export default root2gltf;
