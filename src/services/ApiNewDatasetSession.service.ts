import { NewSession, NewSessionApiResponse } from "@sine-fdn/sine-ts";
import BenchmarkingService from "./benchmarkingService";

export default async function ApiNewDatasetSession(
  datasetId: string,
  data: NewSession
): Promise<NewSessionApiResponse> {
  return BenchmarkingService.newDatasetSession(datasetId, data);
}
