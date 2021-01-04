import useSWR, { responseInterface } from "swr";
import {
  ErrorApiResponse,
  GetSessionApiResponse,
  GetSessionApiSuccessResponse,
} from "@sine-fdn/sine-ts";
import BenchmarkingService from "./benchmarkingService";

type SessionListingResponse = responseInterface<
  GetSessionApiSuccessResponse,
  ErrorApiResponse
>;

async function fetcher(
  _: string,
  sessionId: string
): Promise<GetSessionApiSuccessResponse> {
  return BenchmarkingService.getSession(sessionId)
    .catch((error) => ({
      success: false,
      message: `Failed to parse server response: ${error}`,
    }))
    .then((res: GetSessionApiResponse) =>
      res.success ? Promise.resolve(res) : Promise.reject(res)
    );
}

export default function useSession(
  sessionId: string,
  refreshInterval = 1000
): SessionListingResponse {
  return useSWR(["session", sessionId], fetcher, {
    refreshInterval,
  });
}
