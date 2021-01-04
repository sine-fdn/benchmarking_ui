import useSWR, { responseInterface } from "swr";
import {
  Benchmarking,
  ErrorApiResponse,
  SessionListingApiSuccessResponse,
  ListSessionsOpts,
} from "@sine-fdn/sine-ts";

type SessionListingResponse = responseInterface<
  SessionListingApiSuccessResponse,
  ErrorApiResponse
>;

type ProcessStatus = ListSessionsOpts["status"];

async function fetcher(
  _: string,
  status: ProcessStatus
): Promise<SessionListingApiSuccessResponse> {
  const BenchmarkingService = new Benchmarking({
    baseUrl: "", // connect with "this" Next.js instance
    fetch: fetch.bind(window),
  });

  const res = await BenchmarkingService.listSessions({ status });
  if (!res.success) return Promise.reject(res);
  else return Promise.resolve(res);
}

export default function useSessionListing(
  status?: ProcessStatus,
  refreshInterval = 1500
): SessionListingResponse {
  return useSWR(["sessionListing", status], fetcher, {
    refreshInterval,
  });
}
