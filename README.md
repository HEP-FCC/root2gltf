# ROOT2glTF

[![Node.js Package](https://github.com/HEP-FCC/root2gltf/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/HEP-FCC/root2gltf/actions/workflows/npm-publish.yml)

Converts detector geometries from ROOT to the glTF format used by [Phoenix](https://github.com/HSF/phoenix).

It reads a ROOT geometry file, deduplicates redundant mesh and material data, and writes out a single `.gltf` file ready to load in Phoenix. An optional config file can be used to hide specific parts, group volumes into named views, or control traversal depth.

This project is based on [root_cern-To_gltf-Exporter](https://github.com/HSF/root_cern-To_gltf-Exporter), a browser-based ROOT to glTF converter.

## Usage

### Install

```bash
npm install
```

### Build

```bash
npm run build
```

### CLI

```bash
node bin/cli.js -i <input.root> [-d] [-c <config.json>] [-o <output.gltf>]
```

| Flag             | Description                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| `-i`, `--input`  | Required path to the input ROOT file                                     |
| `-d`, `--depth`  | How many levels deep to traverse the geometry tree (defaults to 3)       |
| `-c`, `--config` | Optional path to a detector config file                                  |
| `-o`, `--output` | Optional path for the output glTF file (defaults to `<input-name>.gltf`) |

Example with custom depth:

```bash
node bin/cli.js -i CLD_o4_v05.root -d 4 -o CLD_o4_v05.gltf
```

### API

You can also call the converter in code. File I/O is your responsibility — pass an already-opened ROOT file and an optional config object:

Example with a config:

```ts
import { writeFile } from "node:fs/promises";
import { openFile } from "jsroot";
import root2gltf from "root2gltf";

const input = await openFile("CLD_o4_v05.root");

const gltfContent = await root2gltf({
  input,
  depth: 3,
  config: {
    hiddenVolumes: ["BeamPipeShield_assembly_0"],
    namedScenes: { "Beam Pipe": ["BeBeampipe_assembly_0"] },
    missingColors: true,
    reduceOpacity: true,
  },
});

await writeFile("CLD.gltf", JSON.stringify(gltfContent), "utf8");
```

## Config file

Config file/object is optional, you do not need to fill all the fields for the config to work

| Field           | Default               | Description                                                                         |
| --------------- | --------------------- | ----------------------------------------------------------------------------------- |
| `hiddenVolumes` | `[]` (Nothing hidden) | Exclude specific volumes from the output                                            |
| `namedScenes`   | One scene per volume  | Combine multiple volumes into a view                                                |
| `missingColors` | `true`                | Optionally assign a random color to volumes with an undefined, black or white value |
| `reduceOpacity` | `true`                | Apply decreasing opacity across scenes so nested volumes are visible                |

Ready-to-use configs for several FCC-ee detector concepts are in [configs/](configs/).

### Example: Allegro_o2_v01

```json
{
  "hiddenVolumes": [],
  "namedScenes": {
    "Beam Pipe": [
      "BeBeampipe_assembly_0",
      "BeamPipe_assembly_1",
      "SynchRadMask_assembly_2",
      "BeamPipeShield_assembly_3",
      "BeamPipeShield_noRot_assembly_4"
    ],
    "Screen Solenoid": ["CompSol_assembly_5", "ScreenSol_assembly_6"],
    "LumiCal": [
      "LumiCal_envelope_7",
      "LumiCalInstrumentation_envelope_8",
      "LumiCalCooling_envelope_9",
      "LumiCalBackShield_envelope_10"
    ],
    "Vertex": ["Vertex_11"],
    "STT": ["STT_o1_v01_envelope_12"],
    "Silicon Wrapper": ["SiWrB_envelope_13", "SiWrD_envelope_14"],
    "ECal": ["ECalBarrel_vol_15"],
    "HCal": ["HCalEnvelopeVolume_16"],
    "ECal Endcap": ["ECalEndcaps_turbine_17"],
    "HCal Endcap": ["HCalThreePartsEndcap_volume_18"],
    "Endcap": ["Barrel_assembly_19", "Endcaps_assembly_20"]
  },
  "missingColors": false,
  "reduceOpacity": false
}
```

## Performance improvements

Memory

- Export one scene at a time so each graph is freed instead of accumulating in memory
- Keep a reference to the first occurrence of each object instead of JSON-parsing during deduplication
- Deload Node.js call stack by turning recursive functions into iterative (which uses the heap)
