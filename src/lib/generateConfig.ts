import type { TConfig } from "./types/converter.js";
import type { TObjArray } from "./types/root.js";

const generateConfig = (config: TConfig, childrenNodes: TObjArray) =>
  config !== null
    ? config
    : {
        hidden: [],
        subparts: childrenNodes.arr.forEach((node) => node.fName),
        depth: 2,
      };

export default generateConfig;
