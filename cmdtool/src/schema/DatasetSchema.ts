import * as Yup from "yup";
import { Dataset, DatasetDimension } from "../types";

const DatasetDimensionSchema: Yup.SchemaOf<DatasetDimension> = Yup.object({
  id: Yup.string().required(),
  integerValues: Yup.array(Yup.number().integer().defined()).required(),
});

const DatasetSchema: Yup.SchemaOf<Dataset> = Yup.object({
  id: Yup.string().required(),
  dimensions: Yup.array(DatasetDimensionSchema).required(),
})
  .test({
    name: "dimension-ids-are-unique",
    message: "Dimension IDs are not unique",
    test: (ds: Dataset) =>
      new Set(ds.dimensions.map((d) => d.id)).size === ds.dimensions.length,
  })
  .required();

export default DatasetSchema;
