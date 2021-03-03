import * as Yup from "yup";
import { FunctionDeclaration } from "../types";

const StringArray = Yup.array(Yup.string().required()).required();

const FunctionDeclarationSchema: Yup.SchemaOf<FunctionDeclaration> = Yup.object(
  {
    id: Yup.string().max(100).required("id is required"),
    inputs: StringArray,
    outputs: StringArray,
    inputMatrix: Yup.array(
      Yup.array(Yup.number().integer().defined())
    ).required(),
  }
).required();

export default FunctionDeclarationSchema;
