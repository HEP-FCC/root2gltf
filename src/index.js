import { readFile, writeFile } from "node:fs/promises";
import { parse } from "node:path";

import { geoCfg, openFile } from "jsroot";
import { build } from "jsroot/geom";
import { Scene } from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

import { BUILD_OPTIONS, GEO_GRAD_PER_SEGM } from "./lib/constants.js";
import {
  countGLTFObjects,
  countRootObjects,
  findTrees,
  hideTree,
  removeTrees,
  showNode,
} from "./lib/handleInput.js";
import { deduplicateMaterials, deduplicateMeshes } from "./lib/handleOutput.js";

const root2gltf = async (inputPath, configPath, optionalOutput) => {
  console.log("INFO: Reading files");
  const input = await openFile(inputPath);
  const rootGeometry = await input.readObject(input.fKeys[0].fName);
  const config = await readFile(configPath);
  const { maxLevel, subParts, childrenToHide } = JSON.parse(config);
  const exporter = new GLTFExporter();
  const outputPath = optionalOutput || `${parse(inputPath).name}.gltf`;

  console.log("INFO: Reading files");
  // Filtering out all nodes within hidden paths and beyond a maximum level
  removeTrees(rootGeometry.fNodes.arr[0], new Set(childrenToHide), maxLevel);

  console.log(
    `      Root file has ${countRootObjects(rootGeometry)} objects (after cleanup)`,
  );

  // Set number of degrees per face for circles
  geoCfg("GradPerSegm", GEO_GRAD_PER_SEGM);

  // Dump ROOT to GLtf, using one scene per volume subpart
  const scenes = Object.entries(subParts).map(([key, values]) => {
    const scene = new Scene();

    // Hide volume and all its subparts for the new scene
    hideTree(rootGeometry.fNodes.arr[0]);

    // Show volume
    showNode(rootGeometry.fNodes.arr[0]);

    // Find and show all volume subparts within the target paths
    findTrees(rootGeometry.fNodes.arr[0], new Set(values));

    scene.name = key;
    const built = build(rootGeometry, BUILD_OPTIONS);
    scene.children.push(built);
    scene.userData.visible = true;
    scene.userData.opacity = 0.5;

    // Normalize pivot to null before exporting
    scene.traverse((obj) => {
      // Three.js GLTFExporter checks for `pivot !== null` (which is true for `undefined`),
      // and jsroot's build() doesn't set it.
      if (obj.pivot === undefined) obj.pivot = null;
    });

    console.log(`      ${key} -> ${countGLTFObjects(built)} objects`);

    return scene;
  });

  console.log("INFO: Exporting to GLTF");

  const gltfGeometry = await new Promise((resolve, reject) => {
    exporter.parse(scenes, resolve, reject);
  });

  console.log("INFO: Deduplicating data in GLTF");
  // Reduce the output file size by removing redundant data that jsroot generates
  deduplicateMaterials(gltfGeometry);
  deduplicateMeshes(gltfGeometry);

  console.log("INFO: Writing file");
  await writeFile(outputPath, JSON.stringify(gltfGeometry), "utf8");

  console.log(`INFO: Result saved to: '${outputPath}'`);
};

export default root2gltf;
