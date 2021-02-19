import { ImportData } from "../types";
import * as Yup from "yup";
import DatasetSchema from "./DatasetSchema";
import FunctionDeclarationSchema from "./FunctionDeclarationSchema";

const ImportDataSchema: Yup.SchemaOf<ImportData> = Yup.object({
  datasets: Yup.array(DatasetSchema).defined(),
  functions: Yup.array(FunctionDeclarationSchema).defined(),
});

export default ImportDataSchema;
