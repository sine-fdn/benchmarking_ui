/**
 * general error response from API
 */
export interface ErrorApiResponse {
  success: false;
  message: string;
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
