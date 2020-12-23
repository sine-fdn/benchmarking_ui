import Link from "next/link";
import React from "react";
import { GetSessionApiSuccessResponse } from "../interfaces";
import Table from "./Table";

type SessionTableProps = {
  session: GetSessionApiSuccessResponse;
};

export default function SessionDump(props: SessionTableProps) {
  const session = props.session;
  const hasFinished = session.process?.status === "FINISHED";

  return (
    <>
      <Nav {...props} />

      <div className="block">
        {hasFinished && (
          <>
            <h3 className="is-3 title">Results</h3>
            <ResultsTable {...props} />
          </>
        )}

        {!hasFinished && (
          <>
            <h3 className="is-3 title">Submissions</h3>
            <SubmissionsTable {...props} />
          </>
        )}
      </div>
    </>
  );
}

function Nav({ session }: SessionTableProps) {
  const hasFinished = session.process?.status === "FINISHED";
  return (
    <nav className="level">
      <div className="level-item has-text-centered">
        <div>
          <p className="heading">Dimensions</p>
          <p className="title">{session.inputTitles.join(", ")}</p>
        </div>
      </div>

      <div className="level-item has-text-centered">
        <div>
          <p className="heading">Status</p>
          <p className="title">{session.process?.status ?? "Pending Input"}</p>
        </div>
      </div>

      {!hasFinished && (
        <div className="level-item has-text-centered">
          <div>
            <p className="heading">Join</p>
            <p className="title">
              <Link href={`/${session.id}/join`}>
                <a className="button is-link is-small">Join</a>
              </Link>
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}

function SubmissionsTable({ session }: SessionTableProps) {
  if (session.submissions.length === 0) {
    return <>No submission recorded, yet</>;
  }

  const rows = session.submissions.map((s) => [s.submitter]);
  return <Table columns={["Submitter"]} rows={rows} />;
}

function ResultsTable({ session }: SessionTableProps) {
  const rows = session.results.map((s) => [
    s.submission.submitter,
    ...s.integerResults,
  ]);
  const dimensions = session.inputTitles.map(
    (dim) => `${dim} (Ranking from highest to lowest)`
  );
  const columns = ["Submitter", ...dimensions];

  return <Table columns={columns} rows={rows} />;
}
