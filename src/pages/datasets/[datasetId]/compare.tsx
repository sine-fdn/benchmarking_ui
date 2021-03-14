import {
  DatasetListingApiSuccessResponse,
  NewBenchmarkingSubmission,
} from "@sine-fdn/sine-ts";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import ErrorMessage from "../../../components/ErrorMessage";
import NewSubmissionForm from "../../../components/forms/NewSubmissionForm";
import Layout from "../../../components/Layout";
import Table from "../../../components/Table";
import { performBenchmarking } from "../../../mpc/browserbased_mpc";
import useDatasetListing from "../../../services/useDatasetListing";

type Dataset = DatasetListingApiSuccessResponse["datasets"][0];
type ProcessingStatus =
  | { s: "LOADING_DATASET" }
  | { s: "NEEDS_INPUT" }
  | { s: "MPC_RUNNING" }
  | { s: "FINISHED"; res: number[] }
  | { s: "ERROR"; message: string };

const NUM_SHARDS = 1;

export default function DatasetPage() {
  const { data: datasets, error } = useDatasetListing();
  const [s, setProcessingStatus] = useState<ProcessingStatus>({
    s: "NEEDS_INPUT",
  });
  const router = useRouter();
  const datasetId = router.query.datasetId;

  const dataset = useMemo<Dataset | undefined>(() => {
    if (!datasets && error) {
      setProcessingStatus({ s: "ERROR", message: error.message });
      return;
    }

    const ds = datasets?.datasets.find((d) => d.id === datasetId);
    if (ds) {
      setProcessingStatus({ s: "NEEDS_INPUT" });
    }

    return ds;
  }, [datasets]);

  async function onSubmit(submission: NewBenchmarkingSubmission) {
    if ((s.s !== "NEEDS_INPUT" && s.s !== "ERROR") || !dataset) return;
    setProcessingStatus({ s: "MPC_RUNNING" });
    const startTS = new Date();
    try {
      const { results: resultsPromise, sessionId } = await performBenchmarking(
        dataset,
        submission.integerValues,
        NUM_SHARDS
      );

      const results = await resultsPromise;
      console.log(
        "Runtime: ",
        Math.abs(new Date().getTime() - startTS.getTime())
      );
      setProcessingStatus({ s: "FINISHED", res: results });
      await router.push(`/${sessionId}`);
    } catch (error) {
      setProcessingStatus({
        s: "ERROR",
        message: `Failure while performing MPC: ${error}`,
      });
    }
  }

  const showForm = dataset && (s.s === "NEEDS_INPUT" || s.s === "ERROR");

  return (
    <Layout title="SINE Benchmarking UI: New Session against a dataset">
      <div className="container content mt-6 pb-3">
        <div className="block">
          <h1 className="title is-2">
            Benchmark yourself against a reference dataset
          </h1>
          <p className="subtitle is-4" style={{ maxWidth: 640 }}>
            You can benchmark yourself against the dataset {dataset?.name} by
            entering the necessary values.
            <br />
            Your input will stay secure thanks to the use of Secure Multi-Party
            Computation
          </p>
        </div>

        <div className="block">
          {!dataset && <p>Loading dataset information...</p>}
          {s.s === "ERROR" && <ErrorMessage>{s.message}</ErrorMessage>}
          {showForm && dataset && (
            <NewSubmissionForm
              sessionId={dataset.id}
              onSubmit={onSubmit}
              inputTitles={dataset.inputDimensions}
            />
          )}

          {s.s === "MPC_RUNNING" && (
            <p>Secure Multi-Party Computation is being performed...</p>
          )}
          {s.s === "FINISHED" && (
            <Table
              columns={["Dimension", "Rank"]}
              rows={s.res.map((rank, idx) => [
                <span key={`${idx}-1`}>{dataset?.dimensions[idx]}</span>,
                <span key={`${idx}-2`}>{rank}</span>,
              ])}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
