import { readFile } from "node:fs/promises";
import { parse } from "node:path";

import { openFile, settings } from "jsroot";
import { build } from "jsroot/geom";
import { Scene } from "three";

import convertGeometry from "./lib/utils/gltf.js";
import {
  cleanupGeometry,
  keepOnlySubpart,
  setVisible,
} from "./lib/utils/root.js";

// eslint-disable-next-line import-x/prefer-default-export
export const root2gltf = async (inputPath, configPath, outputPath) => {
  const resolvedOutput = outputPath || `${parse(inputPath).name}.gltf`;
  const configContent = await readFile(configPath);
  const { maxLevel, subParts, childrenToHide } = JSON.parse(configContent);
  const inputContent = await openFile(inputPath);
  const geometry = await inputContent.readObject(inputContent.fKeys[0].fName);

  console.log("INFO: Reading file:");
  console.log(`      ${inputPath}`);

  console.log("INFO: Writing file:");
  console.log(`      ${resolvedOutput}`);

  console.log("INFO: Using this configuration file:");
  console.log(`      ${configPath}`);

  for (const entry of Object.values(subParts)) {
    entry[0] = entry[0].map((p) => new RegExp(p));
  }

  // for each geometry subpart, duplicate the geometry and keep only the subpart
  console.log("INFO: Generating all scenes (one per subpart):");

  // drop nodes we do not want to see at all (usually too detailed parts)
  cleanupGeometry(geometry.fNodes.arr[0], childrenToHide, maxLevel);

  const scenes = Object.entries(subParts).map(([name, entry]) => {
    console.log(`      ${name}`);
    // dump to gltf, using one scene per subpart
    // set nb of degrees per face for circles approximation (default 24)
    settings.GeoGradPerSegm = 360 / 24; // @fix geoCfg('GradPerSegm', 360/nFaces);
    const paths = entry[0];
    const visibility = entry[1];
    // @fix first reset visibility to be sure eveything is invisible
    // @fix set_invisible_recursively(geometry.fNodes.arr[0]);
    // make top node visible
    setVisible(geometry.fNodes.arr[0]);
    keepOnlySubpart(geometry.fNodes.arr[0], paths);
    // convert to gltf
    const scene = new Scene();
    scene.name = name;
    const children = build(geometry, {
      dflt_colors: true,
      vislevel: 10,
      numfaces: 10000000,
      numnodes: 500000,
    });
    // @fix remove from children paths that should not be there
    // @fix cleanupChildren(children, paths, fullPath)
    scene.children.push(children);
    if (typeof visibility === "boolean") {
      scene.userData = { visible: visibility };
    } else {
      scene.userData = { visible: true, opacity: visibility };
    }

    return scene;
  });

  await convertGeometry(scenes, resolvedOutput);
};
