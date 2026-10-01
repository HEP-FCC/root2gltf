import { MISSING_COLORS, REDUCE_OPACITY } from "../constants.js";
import type { TConfig } from "../types/converter.js";
import type { TObjArray } from "../types/root.js";

const generateConfig = (
  config: TConfig | undefined,
  childrenNodes: TObjArray,
): TConfig => {
  if (!config) console.log(`INFO: Exporting the full geometry`);

  return {
    missingColors: config?.missingColors ?? MISSING_COLORS,
    reduceOpacity: config?.reduceOpacity ?? REDUCE_OPACITY,
    hiddenVolumes: config?.hiddenVolumes ?? [],
    namedScenes:
      config?.namedScenes ??
      Object.fromEntries(
        childrenNodes.arr.map((node) => [node.fName, [node.fName]]),
      ),
  };
};

export default generateConfig;
