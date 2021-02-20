import fs from "fs";
import ImportDataSchema from "../schema/ImportDataSchema";
import { ImportData } from "../types";
import { set_dataset } from "./set_dataset";
import { set_function } from "./set_function";

export default async function cmd_import(path: string) {
  try {
    const fileContents = fs.readFileSync(path).toString();
    const importData = (await ImportDataSchema.validate(
      JSON.parse(fileContents),
      {
        stripUnknown: true,
      }
    )) as ImportData;

    await do_import(importData);
    console.log(`${importData.datasets.length} Datasets imported`);
    console.log(`${importData.functions.length} Functions imported`);
    console.log(`Import succeeded`);
  } catch (error) {
    console.error("Fatal error while creating function:", error);
    process.exit(1);
  }
}

export async function do_import(importData: ImportData) {
  await Promise.all(importData.datasets.map(set_dataset));
  await Promise.all(importData.functions.map(set_function));
}

export function cmd_create_import_prototype() {
  const prtyp: ImportData = {
    datasets: [
      {
        id: `new-dataset-id`,
        dimensions: [
          { id: "Dimension 1", integerValues: [1, 2, 3] },
          { id: "Dimension 2", integerValues: [4, 5, 6] },
        ],
      },
    ],
    functions: [
      {
        id: `new-function-id`,
        inputs: [`input-1-name`, `input-2-name`],
        outputs: [`output-name`],
        inputMatrix: [[1, 1]],
      },
    ],
  };

  console.log("Prototype is: ");
  console.log("%% snip %%");
  console.log(JSON.stringify(prtyp, undefined, 2));
  console.log("%% snip %%");
}
