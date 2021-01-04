import { NewSession } from "@sine-fdn/sine-ts";
import * as Yup from "yup";

type UserInput = NewSession["input"][0];

const inputSchema: Yup.SchemaOf<UserInput> = Yup.object({
  title: Yup.string().required("Title is required"),
  computation: Yup.mixed().oneOf(["RANKING"]).required(),
});

const NewSessionSchema: Yup.SchemaOf<NewSession> = Yup.object({
  title: Yup.string().required("Session title is required"),
  numParties: Yup.number()
    .integer("Must be an integer")
    .min(2, "Minimum number of parties is 2")
    .required("Number of benchmarking parties is required"),
  input: Yup.array().of(inputSchema.required()).min(1).max(25).required(),
}).required();

export default NewSessionSchema;
