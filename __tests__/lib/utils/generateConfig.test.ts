import { describe, it, expect } from "@jest/globals";
import generateConfig from "../../../src/lib/utils/generateConfig.js";
import type { TConfig } from "../../../src/lib/types/converter.js";
import { makeChildren } from "../../mocks.js";

describe("generateConfig", () => {
  describe("given an explicit config is provided", () => {
    describe("when generateConfig is called", () => {
      it("then returns it unchanged", () => {
        const config: TConfig = {
          hiddenVolumes: ["A"],
          namedScenes: { Group: ["B"] },
          missingColors: true,
          reduceOpacity: true,
        };
        const result = generateConfig(config, makeChildren(["B"]));

        expect(result).toStrictEqual(config);
      });
    });
  });

  describe("given config is undefined", () => {
    describe("when generateConfig is called with children", () => {
      it("then auto-generates config from children", () => {
        const result = generateConfig(undefined, makeChildren(["A", "B", "C"]));

        expect(result.hiddenVolumes).toEqual([]);
        expect(result.namedScenes).toEqual({ A: ["A"], B: ["B"], C: ["C"] });
      });

      it("then produces one subpart entry per child node", () => {
        const result = generateConfig(undefined, makeChildren(["X", "Y"]));

        expect(Object.keys(result.namedScenes)).toHaveLength(2);
      });
    });
  });
});
