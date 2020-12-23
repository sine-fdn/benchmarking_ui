import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import ErrorMessage from "../components/ErrorMessage";
import Layout from "../components/Layout";
import NotificationMessage from "../components/NotificationMessage";
import Table from "../components/Table";
import useSessionListing from "../services/useSessionListing";

const IndexPage = () => {
  const router = useRouter();
  const maybeSession = router.query.session;
  const maybeSubmission = router.query.submission;
  const { data, error } = useSessionListing();
  const { data: processing } = useSessionListing("processing");
  const { data: completed, error: completedError } = useSessionListing(
    "finished"
  );

  return (
    <Layout title="SINE Benchmarking UI">
      <div className="container content mt-6 mb-6">
        {maybeSubmission && (
          <div className="block">
            <NotificationMessage>
              Successfully submitted your values to the benchmarking service.
            </NotificationMessage>
          </div>
        )}
        {maybeSession && (
          <div className="block">
            <NotificationMessage>
              Successfully created the new benchmarking session.
            </NotificationMessage>
          </div>
        )}
        <div className="block">
          <div className="is-flex-tablet is-justify-content-space-between">
            <h1 className="title is-2">Hello Shiny new Benchmarking World</h1>
            <Link href="/new">
              <a className="button is-link is-hidden-mobile">
                + Create New Benchmark
              </a>
            </Link>
          </div>
          <p className="subtitle is-4" style={{ maxWidth: 640 }}>
            This is the demonstration UI for{" "}
            <a href="https://sine.foundation/" rel="noreferrer" target="_blank">
              SINE
            </a>
            {"'"}s benchmarking API.
          </p>
        </div>

        <div className="block">
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
          {data && (
            <Table
              columns={["Title", "Progress", ""]}
              rows={data.sessions.map((s) => [
                <Link key={s.id} href={`/${s.id}`}>
                  <a>{s.title}</a>
                </Link>,
                `${s.numSubmissions} / ${s.numParties}`,
                <Link key={s.id} href={`/${s.id}/join`}>
                  <a className="button is-link is-small">Join</a>
                </Link>,
              ])}
            />
          )}
          {!data && <p>Data is being loaded</p>}
        </div>

        <div className="block">
          <Link href="/new">
            <a className="button is-link">+ Create New Benchmark</a>
          </Link>
        </div>

        {processing?.sessions?.length ? (
          <div className="block">
            <h2 className="title is-3">Active Benchmarking Sessions</h2>
            <Table
              columns={["Title", "ID"]}
              rows={processing.sessions.map((s) => [
                <Link key={s.id + "-1"} href={`/${s.id}`}>
                  <a>{s.title}</a>
                </Link>,
                <Link key={s.id} href={`/${s.id}`}>
                  <a>{s.id}</a>
                </Link>,
              ])}
            />
          </div>
        ) : null}

        <div className="block">
          <h2 className="title is-3">Completed Benchmarking Sessions</h2>
          {completedError && (
            <ErrorMessage>{completedError.message}</ErrorMessage>
          )}
          {completed && (
            <Table
              columns={["Title", "ID"]}
              rows={completed.sessions.map((s) => [
                <Link key={s.id + "-1"} href={`/${s.id}`}>
                  <a>{s.title}</a>
                </Link>,
                <Link key={s.id} href={`/${s.id}`}>
                  <a>{s.id}</a>
                </Link>,
              ])}
            />
          )}
          {!completed && <p>Data is being loaded</p>}
        </div>
      </div>
    </Layout>
  );
};

export default IndexPage;
