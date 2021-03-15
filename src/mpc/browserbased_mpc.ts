import {
  BenchmarkingResult,
  DatasetListingApiSuccessResponse,
} from "@sine-fdn/sine-ts";
import MPCC from "../services/mpcClient";

type Dataset = DatasetListingApiSuccessResponse["datasets"][0];

export async function performBenchmarking(
  dataset: Dataset,
  secretData: number[],
  numShards?: number
): Promise<BenchmarkingResult> {
  return MPCC.performBenchmarking(dataset, secretData, numShards);
}
