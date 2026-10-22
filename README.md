# ROOT2glTF

[![Node.js Package](https://github.com/HEP-FCC/root2gltf/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/HEP-FCC/root2gltf/actions/workflows/npm-publish.yml) 

ROOT2glTF is a Node.js package that converts detector geometries from ROOT to the glTF format used by [Phoenix](https://github.com/HSF/phoenix). It is based on the browser-based converter [root_cern-To_gltf-Exporter](https://github.com/HSF/root_cern-To_gltf-Exporter) from HSF. This package optionally limits traversal depth, dynamically defines a configuration (it can be changed to hide specific parts or group volumes into named views), and deduplicates redundant mesh and material data. To use ROOT2glTF, install it from npm, and either use the API or the CLI entry point (check the Usage section).

This package is written in TypeScript. And implements CI/CD automations, with code linting and unit testing. It introduces performance improvements such as: deloading Node.js call stack by turning recursive functions into iterative (which uses the heap), exporting one scene at a time so each structure is freed instead of accumulating in memory, implementing hash maps and sets for constant lookup...

## Usage

### Install

```bash
npm install @hep-fcc/root2gltf
```

### Build

```bash
npm run build
```

### CLI Entry Point

```bash
npx root2gltf -i <input.root> [-d] [-c <config.json>] [-o <output.gltf>] [-v]
```

| Flag              | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `-i`, `--input`   | Required path to the input ROOT file                                     |
| `-d`, `--depth`   | How many levels deep to traverse the geometry tree (defaults to 3)       |
| `-c`, `--config`  | Optional path to a detector config file                                  |
| `-o`, `--output`  | Optional path for the output glTF file (defaults to `<input-name>.gltf`) |
| `-v`, `--verbose` | Print detailed progress logs                                             |

Example with custom depth:

```bash
npx root2gltf -i CLD_o4_v05.root -d 4 -o CLD_o4_v05.gltf
```

Example without custom depth

```bash
# CLD
npx root2gltf -i CLD_o2_v08.root -o CLD_o2_v08.gltf
npx root2gltf -i CLD_o3_v01.root -o CLD_o3_v01.gltf
npx root2gltf -i CLD_o4_v05.root -o CLD_o4_v05.gltf

# ALLEGRO
npx root2gltf -i ALLEGRO_o1_v03.root -o ALLEGRO_o1_v03.gltf
npx root2gltf -i ALLEGRO_o2_v01.root -o ALLEGRO_o2_v01.gltf

# IDEA
npx root2gltf -i IDEA_o1_v04.root -o IDEA_o1_v04.gltf
npx root2gltf -i IDEA_o2_v01.root -o IDEA_o2_v01.gltf

# ILD FCCee
npx root2gltf -i ILD_FCCee_v02.root -o ILD_FCCee_v02.gltf

# FCChh
npx root2gltf -i FCChh_DectMaster.root -o FCChh_DectMaster.gltf
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
    missingColors: true,
    reduceOpacity: true,
    hiddenVolumes: ["BeamPipeShield_assembly_0"],
    namedScenes: { "Beam Pipe": ["BeBeampipe_assembly_0"] },
  },
});

await writeFile("CLD.gltf", JSON.stringify(gltfContent), "utf8");
```

## Config file

Config file/object is optional, you do not need to fill all the fields for the config to work

| Field           | Default               | Description                                                                         |
| --------------- | --------------------- | ----------------------------------------------------------------------------------- |
| `missingColors` | `true`                | Optionally assign a random color to volumes with an undefined, black or white value |
| `reduceOpacity` | `true`                | Apply decreasing opacity across scenes so nested volumes are visible                |
| `hiddenVolumes` | `[]` (Nothing hidden) | Exclude specific volumes from the output                                            |
| `namedScenes`   | One scene per volume  | Combine multiple volumes into a view                                                |

Ready-to-use configs for several FCC-ee detector concepts are in [configs/](configs/).

### Example: Allegro_o2_v01

```json
{
  "missingColors": false,
  "reduceOpacity": false,
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
  }
}
```

