import React, { useState } from "react";
import { BenchmarkingSession } from "@prisma/client";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import NewSubmissionForm from "../../components/forms/NewSubmissionForm";
import Layout from "../../components/Layout";
import { NewBenchmarkingSubmission } from "../../interfaces";
import ApiNewSession, {
  computeSubmission,
} from "../../services/ApiNewSubmission.service";
import prismaConnection from "../../utils/prismaConnection";
import ErrorMessage from "../../components/ErrorMessage";

type JoinSessionProps = {
  id: string;
  title: BenchmarkingSession["title"];
  inputTitles: BenchmarkingSession["inputTitles"];
  processorHostnames: BenchmarkingSession["processorHostnames"];
  process: {
    id: number;
  } | null;
};

export default function JoinBenchmarkingSession({
  id,
  inputTitles,
  processorHostnames,
}: JoinSessionProps) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | undefined>(undefined);

  async function onSubmit(data: NewBenchmarkingSubmission) {
    try {
      const res = await ApiNewSession(
        computeSubmission(data, processorHostnames)
      );
      if (!res.success) {
        return setApiError(
          res.message ?? "Failed to create session (no reason given)"
        );
      }

      await router.push(`/?submission=${res.id}`);
    } catch (error) {
      return setApiError(`Failed to create session: ${error}`);
    }
  }

  return (
    <Layout title="SINE Benchmarking UI: New Session">
      <div className="container content mt-6 pb-3">
        <div className="block">
          <h1 className="title is-2">Join Benchmarking Session</h1>
          <p className="subtitle is-4" style={{ maxWidth: 640 }}>
            You can join a benchmarking session by picking a random nickname and
            by entering the necessary values.
          </p>
          {apiError && <ErrorMessage>{apiError}</ErrorMessage>}
        </div>

        <div className="block">
          <NewSubmissionForm
            sessionId={id}
            onSubmit={onSubmit}
            inputTitles={inputTitles}
          />
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<JoinSessionProps> = async (
  context
) => {
  if (typeof context.params?.sessionId !== "string") {
    return { notFound: true };
  }

  const session = await prismaConnection().benchmarkingSession.findUnique({
    select: {
      id: true,
      title: true,
      inputTitles: true,
      processorHostnames: true,
      process: {
        select: {
          id: true,
        },
      },
    },
    where: {
      id: context.params?.sessionId,
    },
  });

  if (!session) {
    return { notFound: true };
  }

  return { props: session };
};
