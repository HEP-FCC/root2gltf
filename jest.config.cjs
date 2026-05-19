const { createDefaultEsmPreset } = require("ts-jest");

const presetConfig = createDefaultEsmPreset({ tsconfig: { isolatedModules: true } });

/** @type {import("jest").Config} * */
module.exports = {
  testEnvironment: "node",
  ...presetConfig,
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/__tests__/*.test.ts"],
};
