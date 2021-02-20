#!/usr/bin/env node

import { Command } from "commander";
import cmd_set_function, {
  cmd_create_function_prototype,
} from "./command/set_function";
import cmd_set_dataset, {
  cmd_create_dataset_prototype,
} from "./command/set_dataset";
import prismaClient from "./prismaClient";
import cmd_import, { cmd_create_import_prototype } from "./command/import";
import cmd_cozero_import from "./command/cozero_import";

const program = new Command();

program
  .command("set-function <json-file>")
  .description("Creates or updates a MPC function")
  .action(cmd_set_function);

program
  .command("set-dataset <json-file>")
  .description("Creates or updates a dataset")
  .action(cmd_set_dataset);

program
  .command("import <json-file>")
  .description("Perform batch import of functions and datasets")
  .action(cmd_import);

program
  .command("create-function-prototype")
  .description("Outputs a function definition JSON")
  .action(cmd_create_function_prototype);

program
  .command("create-dataset-prototype")
  .description("Outputs a dataset definition JSON")
  .action(cmd_create_dataset_prototype);

program
  .command("create-import-prototype")
  .description("Outputs a bulk import JSON definition")
  .action(cmd_create_import_prototype);

program
  .command("cozero-import")
  .description("Perform cozero-specific data import")
  .action(cmd_cozero_import);

(async function main() {
  await program.parseAsync();
  await prismaClient().$disconnect();
  //process.exit(0);
})();
