import { useState } from "react";
import { useRouter } from "next/router";

import Layout from "../components/Layout";
import NewSessionForm from "../components/forms/NewSessionForm";
import { NewSession } from "../interfaces";
import ApiNewSession from "../services/ApiNewSession.service";
import ErrorMessage from "../components/ErrorMessage";

export default function NewBenchmarkingSession() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | undefined>(undefined);

  async function onSubmit(data: NewSession): Promise<void> {
    try {
      const res = await ApiNewSession(data);
      if (!res.success) {
        return setApiError(
          res.message ?? "Failed to create session (no reason given)"
        );
      }

      await router.push(`/?session=${res.id}`);
    } catch (error) {
      return setApiError(`Failed to create session: ${error}`);
    }
  }

  return (
    <Layout title="SINE Benchmarking UI: New Session">
      <div className="container content mt-6 pb-3">
        <div className="block">
          <h1 className="title is-2">New Benchmarking Session</h1>
          <p className="subtitle is-4" style={{ maxWidth: 640 }}>
            A benchmarking session consists of a set of input data plus the
            expected number of parties to participate.
          </p>
          {apiError && <ErrorMessage>{apiError}</ErrorMessage>}
        </div>
        <div className="block">
          <NewSessionForm onSubmit={onSubmit} />
        </div>
      </div>
    </Layout>
  );
}
