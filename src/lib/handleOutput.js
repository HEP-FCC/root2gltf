// Refactored to node.js from https://github.com/HSF/root_cern-To_gltf-Exporter

export const deduplicateMaterials = (outputContent) => {
  // jsroot creates a new material per volume, so identical ones end up repeated many times.
  console.log("INFO: Deduplicating materials:");

  const { materials } = outputContent;
  const deduplicated = new Map();
  const mapping = {};

  console.log(`      Initial number of materials: ${materials.length}`);

  // Iterate over all materials
  for (let i = 0; i < materials.length; i++) {
    const key = JSON.stringify(materials[i]);

    // Assign a new index to each material occurrence
    if (!deduplicated.has(key)) deduplicated.set(key, deduplicated.size);

    // Map from old materials index to new one
    mapping[i] = deduplicated.get(key);
  }

  // Overwrite materials with the deduplicated set
  outputContent.materials = [...deduplicated.keys()].map((k) => JSON.parse(k));

  // Rewire the primitive references to point to the deduplicated set
  outputContent.meshes.forEach((mesh) =>
    mesh.primitives.forEach((primitive) => {
      if ("material" in primitive)
        primitive.material = mapping[primitive.material];
    }),
  );

  console.log(
    `      New number of materials: ${outputContent.materials.length}`,
  );
};

export const deduplicateMeshes = (outputContent) => {
  // jsroot creates a new shape per volume, so identical ones end up repeated many times.
  console.log("INFO: Deduplicating meshes:");

  const { meshes } = outputContent;
  const deduplicated = new Map();
  const mapping = {};

  console.log(`      Initial number of meshes: ${meshes.length}`);

  // Iterate ovver all meshes
  for (let i = 0; i < meshes.length; i++) {
    const key = JSON.stringify(meshes[i]);

    // Assign a new index to each mesh occurrence
    if (!deduplicated.has(key)) deduplicated.set(key, deduplicated.size);

    // Map from old meshes index to new one
    mapping[i] = deduplicated.get(key);
  }

  // Overwrite meshes with the deduplicated set
  outputContent.meshes = [...deduplicated.keys()].map((k) => JSON.parse(k));

  // Overwrite the node references to point to the deduplicated set
  outputContent.nodes.forEach((node) => {
    if ("mesh" in node) node.mesh = mapping[node.mesh];
  });

  console.log(
    `      New number of meshes/accessors: ${outputContent.meshes.length}`,
  );
};
