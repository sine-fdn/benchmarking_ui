import useSWR, { responseInterface } from "swr";
import {
  ErrorApiResponse,
  DatasetListingApiSuccessResponse,
} from "@sine-fdn/sine-ts";
import ApiListDatasets from "./ApiListDatasets.service";

type DatasetListingResponse = responseInterface<
  DatasetListingApiSuccessResponse,
  ErrorApiResponse
>;

async function fetcher(): Promise<DatasetListingApiSuccessResponse> {
  const res = await ApiListDatasets();
  if (!res.success) return Promise.reject(res);
  else return Promise.resolve(res);
}

export default function useDatasetListing(
  refreshInterval = 1500
): DatasetListingResponse {
  return useSWR("datasetListing", fetcher, {
    refreshInterval,
  });
}
