import { NewSession, NewSessionApiResponse } from "@sine-fdn/sine-ts";
import BenchmarkingService from "./benchmarkingService";

export default async function ApiNewSession(
  data: NewSession
): Promise<NewSessionApiResponse> {
  return BenchmarkingService.newSession(data);
}
