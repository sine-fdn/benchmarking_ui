export type MPCTaskOp =
  | { c: "RANKING"; submissions: number[] }
  | {
      c: "RANKING_DATASET" | "RANKING_DATASET_DELEGATED";
      dataset: number[];
    }
  | {
      c: "FUNCTION_CALL" | "FUNCTION_CALL_DELEGATED";
      transforms: number[];
    };
