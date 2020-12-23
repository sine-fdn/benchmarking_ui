import useSWR, { responseInterface } from "swr";
import {
  SessionListingApiResponse,
  ErrorApiResponse,
  SessionListingApiSuccessResponse,
} from "../interfaces";

type SessionListingResponse = responseInterface<
  SessionListingApiSuccessResponse,
  ErrorApiResponse
>;

type ProcessStatus = "processing" | "finished" | undefined;

async function fetcher(url: string): Promise<SessionListingApiSuccessResponse> {
  return fetch(url)
    .then((r) => r.json())
    .catch((error) => ({
      success: false,
      message: `Failed to parse server response: ${error}`,
    }))
    .then((res: SessionListingApiResponse) =>
      res.success ? Promise.resolve(res) : Promise.reject(res)
    );
}

export default function useSessionListing(
  status?: ProcessStatus,
  refreshInterval = 1500
): SessionListingResponse {
  const url = "/api/v1";
  const getUrl = status ? `${url}?status=${status}` : url;
  return useSWR(getUrl, fetcher, {
    refreshInterval,
  });
}
