import type { TConfig } from "../types/converter.js";
import type { TObjArray } from "../types/root.js";

const generateConfig = (config: TConfig | null, childrenNodes: TObjArray) => {
  if (config !== null) return config;

  console.log(`INFO: Exporting the full geometry`);

  return {
    hiddenVolumes: [],
    namedScenes: Object.fromEntries(
      childrenNodes.arr.map((node) => [node.fName, [node.fName]]),
    ),
  };
};

export default generateConfig;
