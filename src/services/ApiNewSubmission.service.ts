import {
  NewBenchmarkingSubmission,
  SplitSubmission,
  NewSubmissionApiResponse,
} from "@sine-fdn/sine-ts";
import BenchmarkingService from "./benchmarkingService";

export function computeSubmission(
  template: NewBenchmarkingSubmission,
  processorHostnames: string[]
): SplitSubmission {
  return BenchmarkingService.computeSubmission(template, processorHostnames);
}

export default async function ApiNewSubmission(
  submission: SplitSubmission
): Promise<NewSubmissionApiResponse> {
  return BenchmarkingService.newSubmission(submission).catch((error) => ({
    success: false,
    message: `Failed to parse server response: ${error}`,
  }));
}
