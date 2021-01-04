import { NewBenchmarkingSubmission } from "@sine-fdn/sine-ts";
import * as Yup from "yup";

export default function NewBenchmarkingSubmissionSchema(
  numIntegerValues: number
): Yup.SchemaOf<NewBenchmarkingSubmission> {
  return Yup.object({
    sessionId: Yup.string().required("Session ID is required"),
    submitter: Yup.string().required("Submitter name is required"),
    integerValues: Yup.array()
      .of(
        Yup.number()
          .min(0)
          .max(16777729 - 1)
      )
      .min(numIntegerValues)
      .max(numIntegerValues)
      .required("Benchmarking integer values are required"),
  }).required();
}
