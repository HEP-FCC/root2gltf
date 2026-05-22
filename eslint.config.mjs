import path from "node:path";

import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import { configs, plugins } from "eslint-config-airbnb-extended";
import { rules as prettierConfigRules } from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import globals from "globals";

const gitignorePath = path.resolve(".", ".gitignore");

const jsConfig = defineConfig([
  // ESLint recommended config
  {
    name: "js/config",
    ...js.configs.recommended,
  },
  // Stylistic plugin
  plugins.stylistic,
  // Import X plugin
  plugins.importX,
  // Airbnb base recommended config
  ...configs.base.recommended,
]);

const nodeConfig = defineConfig([
  // Node plugin
  plugins.node,
  // Airbnb Node recommended config
  ...configs.node.recommended,
]);

const typescriptConfig = defineConfig([
  // TypeScript ESLint plugin
  plugins.typescriptEslint,
  // Airbnb base TypeScript config
  ...configs.base.typescript,
]);

const prettierConfig = defineConfig([
  // Prettier plugin
  {
    name: "prettier/plugin/config",
    plugins: {
      prettier: prettierPlugin,
    },
  },
  // Prettier config
  {
    name: "prettier/config",
    rules: {
      ...prettierConfigRules,
      "prettier/prettier": "error",
    },
  },
]);

const jestConfig = defineConfig([
  {
    name: "jest/config",
    files: ["**/*.test.ts", "__tests__/mocks.ts"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
      parserOptions: {
        projectService: false,
        project: "./tsconfig.json",
      },
    },
  },
]);

const overridesConfig = defineConfig([
  {
    name: "overrides",
    languageOptions: {
      ecmaVersion: "latest",
    },
    rules: {
      "import-x/extensions": "off",
      "import-x/no-useless-path-segments": "off",
      "no-plusplus": "off",
      "no-bitwise": "off",
      "no-underscore-dangle": "off",
      "no-param-reassign": "warn",
      "no-await-in-loop": "warn",
      "no-restricted-syntax": "off",
    },
  },
]);

export default defineConfig([
  // Ignore files and folders listed in .gitignore
  includeIgnoreFile(gitignorePath),
  // Ignore config files
  { ignores: ["*.config.*"] },
  // JavaScript config
  ...jsConfig,
  // Node config
  ...nodeConfig,
  // TypeScript config
  ...typescriptConfig,
  // Prettier config
  ...prettierConfig,
  // Jest config
  ...jestConfig,
  // Overrides config
  ...overridesConfig,
]);
