/**
 * javascript code to export a ROOT geometry to GLTF
 *
 * Main supported features :
 *   - able to cleanup the geometry by dropping all subtrees of a given list
 *   - able to split the geometry into pieces and match them to the hierarchical menu in phoenix
 *   - supports default opacity and visibility for each piece
 *   - simplifies the geometry for spheres and cones to avoid too many faces
 *   - deduplicate materials in the resulting gltf file
 */
import { geoCfg, openFile } from "root";
import { build } from "rootgeom";
import { Scene } from "three";

import { convert_geometry } from "./utils/gltf.js";
import {
  countGLTFObjects,
  countRootObjects,
  forceDisplay,
} from "./utils/helpers.js";
import {
  cleanup_geometry,
  cleanupChildren,
  keep_only_subpart,
  set_invisible_recursively,
  setVisible,
} from "./utils/rootGeometry.js";

/**
 * Convert a given geometry to the gltf file
 * @parameter obj the input geometry
 * @parameter filename the name of the resulting file
 * @parameter max_level maximum depth to convert. Anything below will be discarded
 * @parameter hide_children array of paths prefix for nodes that should be ignored
 * @parameter subparts definition of the subparts to create in the geometry
 * @parameter body the body tag of the page, for writing log to it
 * @parameter nFaces number of faces to be used for spheres
 * @parameter fullPath whether to compare subparts and hide_children with full path or only names
 *
 * subparts is a dictionnary with
 *   - key being the path of the subpart in the phoenix menu, with ' > ' as separator
 *     for the different levels, e.g. "a > b > c" will be entry c in submenu b of menu a
 *   - value being an array of 2 items :
 *      + an array of paths to consider for thea part
 *      + a boolean or a float between 0 and 1 defining the default visibility of the part
 *        false means not visible, true means visible, float means visible with that opacity
 */
async function internal_convert_geometry(
  obj,
  filename,
  max_level,
  subparts,
  hide_children,
  body,
  nFaces,
  fullPath,
) {
  const scenes = [];
  // for each geometry subpart, duplicate the geometry and keep only the subpart
  body.innerHTML += "<h2>Generating all scenes (one per subpart)</h2>";
  // drop nodes we do not want to see at all (usually too detailed parts)
  cleanup_geometry(obj.fNodes.arr[0], hide_children, max_level, fullPath);
  body.innerHTML += `  initial Root file has ${countRootObjects(
    obj,
  )} objects (after cleanup)</br>`;
  await forceDisplay();

  for (const [name, entry] of Object.entries(subparts)) {
    // dump to gltf, using one scene per subpart
    // set nb of degrees per face for circles approximation to nFaces
    geoCfg("GradPerSegm", 360 / nFaces);
    const paths = entry[0];
    const visibility = entry[1];
    // extract subpart of ROOT geometry
    const masterNode = obj.fNodes.arr[0];
    // first reset visibility to be sure eveything is invisible
    set_invisible_recursively(masterNode);
    // make top node visible
    setVisible(masterNode);
    keep_only_subpart(masterNode, paths, fullPath);
    // convert to gltf
    const scene = new Scene();
    scene.name = name;
    const children = build(obj, {
      dflt_colors: true,
      vislevel: 10,
      numfaces: 10000000,
      numnodes: 500000,
    });
    // remove from children paths that should not be there
    cleanupChildren(children, paths, fullPath);
    scene.children.push(children);
    if (typeof visibility === "boolean") {
      scene.userData = { visible: visibility };
    } else {
      scene.userData = { visible: true, opacity: visibility };
    }
    body.innerHTML += `  ${name} -> ${countGLTFObjects(children)} objects</br>`;
    await forceDisplay();
    scenes.push(scene);
  }
  body.innerHTML += `</br>${scenes.length} scenes generated</br>`;
  await forceDisplay();
  await convert_geometry(scenes, filename, body);
}

async function convertGeometry(
  inputFile,
  outputFile,
  max_level,
  subparts,
  hide_children,
  fullPath = false,
  objectName = "Default",
  nFaces = 24,
) {
  const { body } = document;
  body.innerHTML = `<h1>Converting ROOT geometry to GLTF</h1>Input file : ${
    inputFile
  }</br>Output file : ${outputFile}</br>Reading input...`;
  const file = await openFile(inputFile);
  const obj = await file.readObject(`${objectName};1`);
  await internal_convert_geometry(
    obj,
    outputFile,
    max_level,
    subparts,
    hide_children,
    body,
    nFaces,
    fullPath,
  );
  body.innerHTML += "<h1>Convertion succeeded !</h1>";
}

export { convertGeometry };
