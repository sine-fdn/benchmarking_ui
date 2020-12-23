/**
 * type used for creating benchmarking sessions
 */
export interface NewSession {
  title: string;
  numParties: number;
  valueTitle: string;
}

/**
 * submission to an existing benchmarking session
 */
export type NewBenchmarkingSubmission = {
  sessionId: string;
  submitter: string;
  integerValues: number[];
};

export type NewBenchmarkingSubmissionApiResponse = NewSessionApiResponse;

/**
 * general error response from API
 */
export interface ErrorApiResponse {
  success: false;
  message: string;
}

/**
 * API response when submitting a {NewSession} to it
 */
export type NewSessionApiResponse =
  | { success: true; id: string }
  | ErrorApiResponse;

/**
 * API response when GET'ing list of sessions
 */
export type SessionListingApiResponse =
  | SessionListingApiSuccessResponse
  | ErrorApiResponse;

export interface SessionListingApiSuccessResponse {
  success: true;
  sessions: {
    title: string;
    id: string;
    numParties: number;
    numSubmissions: number;
  }[];
}

export type GetSessionApiResponse =
  | GetSessionApiSuccessResponse
  | ErrorApiResponse;

export type ComputationKind = "RANKING";
export type ProcessingStatus =
  | "PENDING"
  | "PROCESSING"
  | "FINISHED"
  | "FINISHED_WITH_ERROR";

export interface GetSessionApiSuccessResponse {
  success: true;

  id: string;
  title: string;
  numParties: number;
  inputTitles: string[];
  processorHostnames: string[];
  inputComputations: ComputationKind[];

  process: {
    status: ProcessingStatus;
  } | null;

  submissions: {
    submitter: string;
  }[];

  results: {
    integerResults: number[];
    submission: {
      submitter: string;
    };
  }[];
}
