import fs from "fs";
import prismaClient from "../prismaClient";
import DatasetSchema from "../schema/DatasetSchema";
import { Dataset } from "../types";

export default async function cmd_set_dataset(path: string) {
  try {
    const fileContents = fs.readFileSync(path).toString();
    const ds = (await DatasetSchema.validate(JSON.parse(fileContents), {
      stripUnknown: true,
    })) as Dataset;

    const { id } = await set_dataset(ds);
    console.log(`Dataset ${id} created`);
  } catch (error) {
    console.error("Fatal error while creating function:", error);
    process.exit(1);
  }
}

export async function set_dataset(ds: Dataset) {
  const inputDimensions = ds.dimensions.map((d) => d.id);
  const dimensions = ds.dimensions.map((d) => ({
    name: d.id,
    integerValues: d.integerValues,
  }));
  const {
    id,
    dimensions: existingDimensions,
  } = await prismaClient().dataset.upsert({
    select: {
      id: true,
      dimensions: {
        select: {
          name: true,
        },
      },
    },
    create: {
      id: ds.id,
      inputDimensions,
      dimensions: {
        create: dimensions,
      },
    },
    update: {
      inputDimensions: { set: inputDimensions },
      dimensions: {
        upsert: ds.dimensions.map((d) => ({
          where: {
            datasetId_name: {
              datasetId: ds.id,
              name: d.id,
            },
          },
          update: {
            integerValues: d.integerValues,
          },
          create: {
            name: d.id,
            integerValues: d.integerValues,
          },
        })),
      },
    },
    where: {
      id: ds.id,
    },
  });

  // perform set difference and drop non-expected dimensions accordingly
  const dimensionsToDelete = difference(
    existingDimensions.map(({ name }) => name),
    dimensions.map((d) => d.name)
  );

  if (dimensionsToDelete.length > 0) {
    await prismaClient().datasetDimension.deleteMany({
      where: {
        datasetId: ds.id,
        name: { in: dimensionsToDelete },
      },
    });
    console.log("Dropped dimensions: ", dimensionsToDelete);
  }

  return { id };
}

function difference(lhs: string[], rhs: string[]): string[] {
  const l = new Set(lhs);
  const r = new Set(rhs);

  for (const rr of r) l.delete(rr);

  return [...l.values()];
}

export function cmd_create_dataset_prototype() {
  const prtyp: Dataset = {
    id: `new-dataset-id`,
    dimensions: [
      { id: "Dimension 1", integerValues: [1, 2, 3] },
      { id: "Dimension 2", integerValues: [4, 5, 6] },
    ],
  };

  console.log("Prototype is: ");
  console.log("%% snip %%");
  console.log(JSON.stringify(prtyp, undefined, 2));
  console.log("%% snip %%");
}
