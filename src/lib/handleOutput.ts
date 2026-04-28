// Refactored to node.js and O(n) lookup from https://github.com/HSF/root_cern-To_gltf-Exporter

export const deduplicateMaterials = (outputContent: any): void => {
  // jsroot creates a new material per volume, so identical ones end up repeated many times.
  const { materials } = outputContent;
  const initial = materials.length;
  const deduplicated = new Map<string, number>();
  const mapping: Record<number, number> = {};

  // Iterate over all materials
  for (let i = 0; i < materials.length; i++) {
    const key = JSON.stringify(materials[i]);

    // Assign a new index to each material occurrence
    if (!deduplicated.has(key)) deduplicated.set(key, deduplicated.size);

    // Map from old materials index to new one
    mapping[i] = deduplicated.get(key)!;
  }

  // Overwrite materials with the deduplicated set
  outputContent.materials = [...deduplicated.keys()].map((k) => JSON.parse(k));

  // Rewire the primitive references to point to the deduplicated set
  outputContent.meshes.forEach((mesh: any) =>
    mesh.primitives.forEach((primitive: any) => {
      if ("material" in primitive)
        primitive.material = mapping[primitive.material!];
    }),
  );

  console.log(
    `INFO: Materials deduplicated: ${initial} -> ${outputContent.materials.length}`,
  );
};

export const deduplicateMeshes = (outputContent: any): void => {
  // jsroot creates a new shape per volume, so identical ones end up repeated many times.
  const { meshes } = outputContent;
  const initial = meshes.length;
  const deduplicated = new Map<string, number>();
  const mapping: Record<number, number> = {};

  // Iterate ovver all meshes
  for (let i = 0; i < meshes.length; i++) {
    const key = JSON.stringify(meshes[i]);

    // Assign a new index to each mesh occurrence
    if (!deduplicated.has(key)) deduplicated.set(key, deduplicated.size);

    // Map from old meshes index to new one
    mapping[i] = deduplicated.get(key)!;
  }

  // Overwrite meshes with the deduplicated set
  outputContent.meshes = [...deduplicated.keys()].map((k) => JSON.parse(k));

  // Overwrite the node references to point to the deduplicated set
  outputContent.nodes.forEach((node) => {
    if ("mesh" in node) node.mesh = mapping[node.mesh!];
  });

  console.log(
    `INFO: Meshes deduplicated: ${initial} -> ${outputContent.meshes.length}`,
  );
};
