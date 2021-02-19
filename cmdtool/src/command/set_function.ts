import fs from "fs";
import prismaClient from "../prismaClient";
import FunctionDeclarationSchema from "../schema/FunctionDeclarationSchema";
import { FunctionDeclaration } from "../types";

export default async function cmd_set_function(path: string) {
  console.log("cmd_create_function", path);

  try {
    const fileContents = fs.readFileSync(path).toString();
    const request = (await FunctionDeclarationSchema.validate(
      JSON.parse(fileContents),
      { stripUnknown: true }
    )) as FunctionDeclaration;

    const { id } = await set_function(request);
    console.log(`Function ${id} created`);
  } catch (error) {
    console.error("Fatal error while creating function:", error);
    process.exit(1);
  }
}

export async function set_function(request: FunctionDeclaration) {
  const inputMatrix = ([] as number[]).concat(...request.inputMatrix);
  return prismaClient().mpcFunction.upsert({
    select: { id: true },
    create: { ...request, inputMatrix },
    update: {
      inputs: { set: request.inputs },
      outputs: { set: request.outputs },
      inputMatrix: { set: inputMatrix },
    },
    where: {
      id: request.id,
    },
  });
}

export function cmd_create_function_prototype() {
  const prtyp: FunctionDeclaration = {
    id: `new-function-id`,
    inputs: [`input-1-name`, `input-2-name`],
    outputs: [`output-name`],
    inputMatrix: [[1, 1]],
  };

  console.log("Prototype is: ");
  console.log("%% snip %%");
  console.log(JSON.stringify(prtyp, undefined, 2));
  console.log("%% snip %%");
}
