import { DatasetListingApiResponse } from "@sine-fdn/sine-ts";
import BenchmarkingService from "./benchmarkingService";

export default async function ApiListDatasets(): Promise<DatasetListingApiResponse> {
  return BenchmarkingService.listDatasets();
}
