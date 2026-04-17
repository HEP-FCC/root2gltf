import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const OPTIONS = yargs(hideBin(process.argv))
  .usage("Usage: $0 <input-file> [-o <output-file>] [-c <config-file>] [-h]")
  .positional("input-file", { describe: "Input ROOT file", type: "string" })
  .option("o", {
    alias: "output-file",
    describe: "Output glTF file path",
    type: "string",
  })
  .option("c", {
    alias: "config-file",
    describe: "Detector configuration file path",
    type: "string",
  })
  .help("h").argv;

export default OPTIONS;
