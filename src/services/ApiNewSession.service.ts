import { NewSession, NewSessionApiResponse } from "./../interfaces/index";

export default async function ApiNewSession(
  data: NewSession
): Promise<NewSessionApiResponse> {
  return fetch(`/api/v1`, {
    method: "POST",
    body: JSON.stringify(data),
  }).then(async (req) =>
    req.json().catch((error) => ({
      success: false,
      message: `Failed to convert body from API. Error is: ${error}`,
    }))
  );
}
