import React from "react";
import Link from "next/link";

import Layout from "../../components/Layout";
import Table from "../../components/Table";
import useDatasetListing from "../../services/useDatasetListing";
import ErrorMessage from "../../components/ErrorMessage";

export default function DatasetListingPage() {
  const { data: datasetsRaw, error } = useDatasetListing();
  const dimensions = datasetsRaw?.success ? datasetsRaw.datasets : undefined;
  const rows = dimensions?.map((d) => [
    <Link key={d.id + "-1"} href={`/datasets/${d.id}`}>
      <a>{d.name}</a>
    </Link>,
    <Link key={d.id} href={`/datasets/${d.id}`}>
      <a>{d.id}</a>
    </Link>,
    <Link key={d.id} href={`/datasets/${d.id}/compare`}>
      <a className="button is-link is-small">Secure Comparison</a>
    </Link>,
  ]);

  return (
    <Layout title="SINE Benchmarking UI">
      <div className="container content mb-6">
        <div className="block">
          {error && <ErrorMessage>{error.message}</ErrorMessage>}

          <div className="is-flex-tablet is-justify-content-space-between">
            <h1 className="title is-2">
              Compare yourself against an existing dataset
            </h1>
          </div>
        </div>

        <div className="block">
          {!rows && "Dataset information is being fetched..."}
          {rows && <Table columns={["Name", "ID", ""]} rows={rows} />}
        </div>
        <div className="block">
          <Link href="/">
            <a className="button is-primary">Back to Overview</a>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
