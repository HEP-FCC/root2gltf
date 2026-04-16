import { GLTFExporter } from "gltfexporter";

import { forceDisplay } from "./helpers.js";

/// deduplicates identical materials in the given gltf file
async function deduplicate(gltf, body) {
  // deduplicate materials
  body.innerHTML += "<h3>Materials</h3>";
  await forceDisplay();
  // scan them, build table of correspondance
  let kept = [];
  let links = {};
  const { materials } = gltf;
  body.innerHTML += `initial number of materials : ${materials.length}</br>`;
  await forceDisplay();
  for (var index = 0; index < materials.length; index++) {
    var found = false;
    for (var kindex = 0; kindex < kept.length; kindex++) {
      if (JSON.stringify(kept[kindex]) == JSON.stringify(materials[index])) {
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
  body.innerHTML += `new number of materials : ${gltf.materials.length}</br>`;
  // deduplicate meshes
  body.innerHTML += "<h3>Meshes</h3>";
  body.innerHTML += `initial number of meshes/accessors : ${
    gltf.meshes.length
  }/${gltf.accessors.length}</br>`;
  await forceDisplay();
  kept = [];
  links = {};
  for (var index = 0; index < gltf.meshes.length; index++) {
    var found = false;
    for (var kindex = 0; kindex < kept.length; kindex++) {
      if (JSON.stringify(kept[kindex]) == JSON.stringify(gltf.meshes[index])) {
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
  body.innerHTML += `new number of meshes/accessors : ${gltf.meshes.length}/${
    gltf.accessors.length
  }</br>`;
  await forceDisplay();

  let json = JSON.stringify(gltf);
  json = json.replace(
    /"mesh":([0-9]+)/g,
    (a, b) => `"mesh":${links[parseInt(b)]}`,
  );
  return JSON.parse(json);
}

/// convert given geometry to GLTF
export async function convert_geometry(obj3d, name, body) {
  body.innerHTML += "<h2>Exporting to GLTF</h2>";
  await forceDisplay();
  const exporter = new GLTFExporter();
  let gltf = await new Promise((resolve, reject) =>
    exporter.parse(obj3d, resolve, reject, { binary: false }),
  );
  // json output
  body.innerHTML += "<h2>Deduplicating data in GLTF</h2>";
  await forceDisplay();
  gltf = await deduplicate(gltf, body);
  const fileToSave = new Blob([JSON.stringify(gltf)], {
    type: "application/json",
    name,
  });
  saveAs(fileToSave, name);
}
