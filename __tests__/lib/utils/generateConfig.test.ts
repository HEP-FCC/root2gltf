import { describe, it, expect } from "@jest/globals";
import generateConfig from "../../../src/lib/utils/generateConfig.js";
import type { TConfig } from "../../../src/lib/types/converter.js";
import { makeChildren } from "../../mocks.js";

describe("generateConfig", () => {
  describe("given an explicit config is provided", () => {
    describe("when generateConfig is called", () => {
      it("then returns it unchanged", () => {
        const config: TConfig = {
          hidden: ["A"],
          subparts: { Group: ["B"] },
          depth: 5,
        };
        const result = generateConfig(config, makeChildren(["B"]));

        expect(result).toBe(config);
      });
    });
  });

  describe("given config is null", () => {
    describe("when generateConfig is called with children", () => {
      it("then auto-generates config from children", () => {
        const result = generateConfig(null, makeChildren(["A", "B", "C"]));

        expect(result.hidden).toEqual([]);
        expect(result.depth).toBe(2);
        expect(result.subparts).toEqual({ A: ["A"], B: ["B"], C: ["C"] });
      });

      it("then produces one subpart entry per child node", () => {
        const result = generateConfig(null, makeChildren(["X", "Y"]));

        expect(Object.keys(result.subparts)).toHaveLength(2);
      });
    });
  });
});
