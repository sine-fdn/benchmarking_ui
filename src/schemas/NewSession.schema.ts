import { NewSession } from "./../interfaces/index";
import * as Yup from "yup";

const NewSessionSchema: Yup.SchemaOf<NewSession> = Yup.object({
  title: Yup.string().required("Session title is required"),
  numParties: Yup.number()
    .integer("Must be an integer")
    .min(2, "Minimum number of parties is 2")
    .required("Number of benchmarking parties is required"),
  valueTitle: Yup.string().required("Titel is required"),
}).required();

export default NewSessionSchema;
