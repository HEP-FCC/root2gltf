// Refactored to node.js from https://github.com/HSF/root_cern-To_gltf-Exporter

import { writeFile } from "node:fs/promises";

import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

/// deduplicates identical materials in the given gltf file
function deduplicate(gltf) {
  // deduplicate materials
  console.log("INFO: Materials:");
  // scan them, build table of correspondance
  let kept = [];
  let links = {};
  const { materials } = gltf;
  console.log(`      Initial number of materials: ${materials.length}`);
  for (let index = 0; index < materials.length; index++) {
    let found = false;
    for (let kindex = 0; kindex < kept.length; kindex++) {
      if (JSON.stringify(kept[kindex]) === JSON.stringify(materials[index])) {
        links[index] = kindex;
        found = true;
        break;
      }
    }
    if (!found) {
      links[index] = kept.length;
      kept.push(materials[index]);
    }
  }
  // now rewrite the materials table and fix the meshes
  gltf.materials = kept;
  for (const mesh of gltf.meshes) {
    for (const primitive of mesh.primitives) {
      if ("material" in primitive) {
        primitive.material = links[primitive.material];
      }
    }
  }
  console.log(`      New number of materials: ${gltf.materials.length}`);
  // deduplicate meshes
  console.log("INFO: Meshes:");
  console.log(
    `      Initial number of meshes/accessors: ${gltf.meshes.length}/${gltf.accessors.length}`,
  );
  kept = [];
  links = {};
  for (let index = 0; index < gltf.meshes.length; index++) {
    let found = false;
    for (let kindex = 0; kindex < kept.length; kindex++) {
      if (JSON.stringify(kept[kindex]) === JSON.stringify(gltf.meshes[index])) {
        links[index] = kindex;
        found = true;
        break;
      }
    }
    if (!found) {
      links[index] = kept.length;
      kept.push(gltf.meshes[index]);
    }
  }
  // now rewrite the meshes table and fix the nodes
  gltf.meshes = kept;
  console.log(
    `      New number of meshes/accessors: ${gltf.meshes.length}/${gltf.accessors.length}`,
  );

  let json = JSON.stringify(gltf);
  json = json.replace(
    /"mesh":([0-9]+)/g,
    (a, b) => `"mesh":${links[parseInt(b)]}`,
  );
  return JSON.parse(json);
}

/// convert given geometry to GLTF
async function convertGeometry(obj3d, outputFileName) {
  console.log("Exporting to GLTF");
  const exporter = new GLTFExporter();
  const gltf = await exporter.parseAsync(obj3d); // @todo or without async
  console.log("Deduplicating data in GLTF");
  const deduplicatedGltf = deduplicate(gltf);

  // @todo async when writing file
  writeFile(outputFileName, JSON.stringify(deduplicatedGltf), "utf8", (err) => {
    if (err) console.log("ERROR: File can't be saved!");
    else console.log(`INFO: Result saved to: '${outputFileName}`);
  });
}

export default convertGeometry;
