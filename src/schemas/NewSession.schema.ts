import { NewSession, BenchmarkingComputationOptions } from "@sine-fdn/sine-ts";
import * as Yup from "yup";

type UserInput = NewSession["input"][0];

const computationOptionsSchema: Yup.SchemaOf<BenchmarkingComputationOptions> = Yup.object(
  {
    delegated: Yup.mixed().oneOf([true]).required(),
    numShards: Yup.number().integer().min(1).max(1).required(),
    shardId: Yup.number().integer().min(0).max(0).required(),
  }
).test(
  "valid-sharding",
  "Invalid sharding information",
  (value) => value && (value.shardId ?? 0) < (value.numShards ?? 0)
);

const inputSchema: Yup.SchemaOf<UserInput> = Yup.object({
  title: Yup.string().required("Title is required"),
  computation: Yup.mixed().oneOf(["RANKING"]).required(),
  options: computationOptionsSchema.notRequired().default(undefined),
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
