import useSWR, { responseInterface } from "swr";
import {
  GetSessionApiResponse,
  ErrorApiResponse,
  GetSessionApiSuccessResponse,
} from "../interfaces";

type SessionListingResponse = responseInterface<
  GetSessionApiSuccessResponse,
  ErrorApiResponse
>;

async function fetcher(url: string): Promise<GetSessionApiSuccessResponse> {
  return fetch(url)
    .then((r) => r.json())
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
  return useSWR(`/api/v1/${sessionId}`, fetcher, {
    refreshInterval,
  });
}
