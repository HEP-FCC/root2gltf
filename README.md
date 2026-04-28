# root2gltf

Converts particle physics detector geometries from ROOT files to the glTF format used by [Phoenix](https://github.com/HSF/phoenix).

It reads a ROOT geometry file, filters and splits it into named subparts according to a config file, deduplicates redundant mesh and material data, and writes out a single `.gltf` file ready to load in Phoenix.

## Usage

### Install

```bash
npm install
```

### CLI

```bash
node bin/cli.js -i <input.root> -c <config.json> [-o <output.gltf>]
```

| Flag                  | Description                                                                    |
| --------------------- | ------------------------------------------------------------------------------ |
| `-i`, `--input-file`  | Required path to the input ROOT file                                           |
| `-c`, `--config-file` | Required path to the detector config file                                      |
| `-o`, `--output-file` | Optional path for the output glTF file (which defaults to `<input-name>.gltf`) |

Example:

```bash
node bin/cli.js -i detectors/CLD_o4_v05.root -c configs/CLD_o4_v05.config.json -o CLD.gltf
```

### API

You can also call the converter in code:

```js
import root2gltf from "root2gltf";

await root2gltf(
  "detectors/CLD_o4_v05.root",
  "configs/CLD_o4_v05.config.json",
  "CLD.gltf",
);
```

## Config

Each detector needs a custom JSON config file. Here is what the fields do:

| Field            | Description                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| `maxLevel`       | How many levels deep to traverse the geometry tree. Higher values produce more detail but larger files. |
| `childrenToHide` | List of node names to remove before processing.                                                         |
| `subParts`       | Maps a display name to a list of volume names. Each entry becomes a separate scene in the glTF file.    |

Ready-to-use configs for several FCC-ee detector concepts are in [configs/](configs/).

## Project structure

```
root2gltf/
├── bin/
│   └── cli.js           # CLI entry point (argument parsing, FileReader polyfill)
├── src/
│   ├── index.js         # Main conversion logic
│   └── lib/
│       ├── constants.js     # Build options and geometry settings
│       ├── handleInput.js   # ROOT tree traversal and filtering helpers
│       └── handleOutput.js  # glTF deduplication (materials and meshes)
├── configs/             # Example config files for known detectors
└── detectors/           # Example ROOT geometry files
```
