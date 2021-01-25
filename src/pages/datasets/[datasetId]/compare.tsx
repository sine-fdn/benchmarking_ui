import { ComputationKind } from "@prisma/client";
import {
  DatasetListingApiSuccessResponse,
  NewBenchmarkingSubmission,
  NewSession,
} from "@sine-fdn/sine-ts";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import ErrorMessage from "../../../components/ErrorMessage";
import NewSubmissionForm from "../../../components/forms/NewSubmissionForm";
import Layout from "../../../components/Layout";
import { datasetBenchmarking } from "../../../mpc/browserbased_mpc";
import ApiNewDatasetSession from "../../../services/ApiNewDatasetSession.service";
import useDatasetListing from "../../../services/useDatasetListing";

type Dataset = DatasetListingApiSuccessResponse["datasets"][0];
type ProcessingStatus =
  | { s: "LOADING_DATASET" }
  | { s: "NEEDS_INPUT" }
  | { s: "SESSION_CREATION" }
  | { s: "MPC_RUNNING" }
  | { s: "FINISHED"; res: number[] }
  | { s: "ERROR"; message: string };

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

    console.log("update ds: ", ds, datasets, datasetId, router.query);
    return ds;
  }, [datasets]);

  async function onSubmit(submission: NewBenchmarkingSubmission) {
    console.log("onSubmit()");
    if ((s.s !== "NEEDS_INPUT" && s.s !== "ERROR") || !dataset) return;
    setProcessingStatus({ s: "SESSION_CREATION" });

    const newSession: NewSession = {
      title: dataset.name,
      numParties: 2,
      input: dataset.dimensions.map((d) => ({
        title: d,
        computation: ComputationKind.RANKING,
      })),
    };

    const res = await ApiNewDatasetSession(dataset.id, newSession);
    if (!res.success) {
      setProcessingStatus({
        s: "ERROR",
        message: res.message ?? "Fatal error while processing request",
      });
      return;
    }

    setProcessingStatus({ s: "MPC_RUNNING" });

    try {
      const result = await datasetBenchmarking(
        res.id,
        submission.integerValues
      );
      setProcessingStatus({ s: "FINISHED", res: result });
    } catch (error) {
      setProcessingStatus({
        s: "ERROR",
        message: `Failure while performing MPC: ${error}`,
      });
    }

    await router.push(`/${res.id}`);
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
              inputTitles={dataset.dimensions}
            />
          )}
          {s.s === "SESSION_CREATION" && (
            <p>Creating new benchmarking session at the remote server...</p>
          )}
          {s.s === "MPC_RUNNING" && (
            <p>Secure Multi-Party Computation is being performed...</p>
          )}
          {s.s === "FINISHED" && (
            <p>
              Computation finished. You are now being redirected to the results
              page...
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
