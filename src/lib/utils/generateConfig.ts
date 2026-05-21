import type { TConfig } from "../types/converter.js";
import type { TObjArray } from "../types/root.js";

const generateConfig = (config: TConfig | null, childrenNodes: TObjArray) =>
  config !== null
    ? config
    : {
        hidden: [],
        subparts: Object.fromEntries(
          childrenNodes.arr.map((node) => [node.fName, [node.fName]]),
        ),
        depth: 2,
      };

export default generateConfig;
