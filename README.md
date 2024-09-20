# root2gltf

This app converts detector objects from ROOT format to glTF used by
[Phoenix](https://hepsoftwarefoundation.org/phoenix/).
It is a quick hack needed to run conversion headless (e.g. in CI).

Depends on JSROOT and Three.js.

Uses also patched versions of the `GLTFExporter.js` from Three.js and `phoenixExport.js` from
[root_cern-To_gltf-Exporter](https://github.com/HSF/root_cern-To_gltf-Exporter).


## Installation

After git clone run:
```
npm ci
```

## Usage

To run the app in the main directory:
```
node . detector.root
```

In order to convert the geometry one needs to write a configuration file.
The examples of the configuration file are provided in `configs` directory.
Three variables are expected in the configuration file:
  * `subParts` names of the detector subparts to be given separate element in
      the phoenix menu
  * `childrenToHide` stems of names of the subparts to be removed
  * `maxLevel` maximum depth of detail

## Converting xml2gltf

The conversion_xml2gltf_autoConfig.py python script provides a way for an xml file to be converted into a gltf file while providing an initial or automatic configuration file that the user is able to alter if they would like to.

To run the python script in the bin folder with only a compact file:

```bash
python conversion_xml2gltf_autoConfig.py -cm <detector.xml>
```

The script can also be run by inputing a configuration file, a root file or both. The converter automatically saves the files root, gltf and config files in automatic folders named: 

  * `root_files` -root files can choose to be deleted at the end of the run  if the user wishes to
  * `gltf_files`
  * `configs` -config files are automatically created if one is not provided but the run can be ended early if the user wants to edit this file

The user can input where they'd like to save the files:

```bash
python conversion_xml2gltf_autoConfig.py -cm <your-detector-file.xml>
-r_in <input-root-file.root> 
-r_out <output-root-file-loactaion.root>
-cn_in <input-config-file.json> 
-cn_out <output-config-file-loactaion.json>
-g <output-gltf-file-location.gltf>
```

The user can also define how many layers of the detector they would like to see, what colour scheme they would like to use- 'ild' or leave blank for purple -and if they would like to hide any parts of the detector:

```bash
python conversion_xml2gltf_autoConfig.py -cm <detector.xml>
-d <maximum-depth-of-detector-layers> 
-c <default-colours>
-hide <detector-parts-to-hide>
```