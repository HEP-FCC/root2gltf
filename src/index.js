import { readFile, writeFile } from "node:fs/promises";
import { parse } from "node:path";

import { geoCfg, openFile } from "jsroot";
import { build } from "jsroot/geom";
import { Scene } from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

import { BUILD_OPTIONS, GEO_GRAD_PER_SEGM } from "./lib/constants/root.js";
import deduplicate from "./lib/utils/gltf.js";
import {
  findTrees,
  hideTree,
  removeTrees,
  showNode,
} from "./lib/utils/root.js";

// eslint-disable-next-line import-x/prefer-default-export
export const root2gltf = async (inputPath, configPath, optionalOutput) => {
  console.log("INFO: Reading files");
  const input = await openFile(inputPath);
  const rawGeometry = await input.readObject(input.fKeys[0].fName);
  const config = await readFile(configPath);
  const { maxLevel, subParts, childrenToHide } = JSON.parse(config);

  for (const entry of Object.values(subParts)) {
    // @todo
    entry[0] = entry[0].map((p) => new RegExp(p));
  }

  // for each geometry subpart, duplicate the geometry and keep only the subpart
  console.log("INFO: Generating all scenes (one per subpart):");

  // Filter out all nodes within hidden paths and beyond a maximum level
  removeTrees(rawGeometry.fNodes.arr[0], childrenToHide, maxLevel);

  // Set number of degrees per face for circles
  geoCfg("GradPerSegm", GEO_GRAD_PER_SEGM);

  // Dump ROOT to GLtf, using one scene per subpart
  const scenes = Object.entries(subParts).map(([name, entry]) => {
    const scene = new Scene();

    // Hide volume and all its subparts for the new scene
    hideTree(rawGeometry.fNodes.arr[0]);

    // Show volume
    showNode(rawGeometry.fNodes.arr[0]);

    // Find and show all volume subparts within the target paths
    findTrees(rawGeometry.fNodes.arr[0], entry[0]);

    scene.name = name;
    scene.children.push(build(rawGeometry, BUILD_OPTIONS));

    scene.userData = // @refactor
      typeof entry[1] === "boolean"
        ? { visible: entry[1] }
        : { visible: true, opacity: entry[1] };

    return scene;
  });

  const exporter = new GLTFExporter();
  const outputPath = optionalOutput || `${parse(inputPath).name}.gltf`;

  // Three.js GLTFExporter checks `pivot !== null` which is true for `undefined`,
  // but jsroot's build() doesn't set pivot — normalize to null before exporting.
  for (const scene of scenes) {
    scene.traverse((obj) => {
      // eslint-disable-next-line no-param-reassign
      if (obj.pivot === undefined) obj.pivot = null;
    });
  }

  console.log("INFO: Exporting to GLTF");
  exporter.parse(scenes, (gltf) => {
    console.log("INFO: Deduplicating data in GLTF");
    const deduplicatedGeometry = deduplicate(gltf);

    console.log("INFO: Writing file");
    writeFile(
      outputPath,
      JSON.stringify(deduplicatedGeometry),
      "utf8",
      (err) => {
        if (err) console.log("ERROR: File can't be saved!");
        else console.log(`INFO: Result saved to: '${outputPath}`);
      },
    );
  });
};
