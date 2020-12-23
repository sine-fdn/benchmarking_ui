import { useRouter } from "next/router";
import React from "react";

import ErrorMessage from "../components/ErrorMessage";
import Layout from "../components/Layout";
import SessionDump from "../components/SessionDump";
import useSession from "../services/useSession";

export default function SessionPage() {
  const router = useRouter();
  const sessionId =
    typeof router.query.sessionId === "string" ? router.query.sessionId : "";

  const { data, error } = useSession(sessionId);

  return (
    <Layout title="SINE Benchmarking UI: New Session">
      <div className="container content mt-6 pb-3">
        <div className="block">
          <h1 className="title is-2">Benchmarking Session {sessionId}</h1>
        </div>
        <div className="block">
          {data && <SessionDump session={data} />}
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
          {!data && "Session information is being fetched..."}
        </div>
      </div>
    </Layout>
  );
}
