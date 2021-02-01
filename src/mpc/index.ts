import {
  BenchmarkingSession,
  ComputationKind,
  ProcessingStatus,
  Prisma,
  Submission,
} from "@prisma/client";
import prismaConnection from "../utils/prismaConnection";
import * as mpc from "./mpc_basics";

const ZP = 16777729;
const PARTY_ID = Number(process.env.MPC_NODE_ID ?? "0");
const DEFAULT_COORDINATOR = "http://localhost:8080";

type Op =
  | { submissions: number[]; c: ComputationKind }
  | { dataset: number[]; transforms: number[]; c: "RANKING_DATASET" };

type Session = {
  id: string;
  submissionIds: string[];
  ops: Op[];
};

type ExpandedBenchmarkingSession = BenchmarkingSession & {
  submissions: Submission[];
};

export async function PerformBenchmarking(sessionId: string) {
  console.log("Starting benchmarking session", sessionId);

  try {
    const session = await getSession(sessionId);
    if (!session) {
      console.error("Failed to find session: ", sessionId);
      return;
    }

    await startSession(sessionId); // let this crash in case a concurrent start happend

    const s = session.datasetId
      ? await fromDataset(session)
      : verticalize(session);

    if (!s) {
      console.error("Failed to construct session for interpreter");
      return;
    }

    console.log("MPC is starting...");
    mpc.connect({
      computationId: sessionId,
      hostname: process.env.COORDINATOR ?? DEFAULT_COORDINATOR,
      party_id: PARTY_ID,
      party_count: session.processorHostnames.length,
      Zp: ZP,
      onConnect: interpreter(s),
    });
  } catch (error) {
    console.error("Failed to perform MPC", error);
  }
}
/* input data is organized by submitter ("horizontal")
 * by verticalizing the input data, it is grouped by benchmarking dimension
 *  **across** the submitters.
 */
function verticalize(
  s: BenchmarkingSession & {
    submissions: Submission[];
  }
): Session {
  const ops: Session["ops"] = s.inputComputations.map((comp, idx) => ({
    submissions: s.submissions.map((s) => s.integerValues[idx]),
    c: comp,
  }));

  return {
    id: s.id,
    submissionIds: s.submissions.map((s) => s.id),
    ops,
  };
}

async function fromDataset(
  s: ExpandedBenchmarkingSession
): Promise<Session | null> {
  try {
    const dataset = s.datasetId ? await getDataset(s.datasetId) : null;

    if (!dataset) {
      console.error("Failed to find dataset ", s.datasetId);
      return null;
    }

    // for each output dimension, perform MPC of kind "RANKING_DATASET"
    const ops: Session["ops"] = dataset.dimensions.map((t) => ({
      c: "RANKING_DATASET",
      dataset: t.integerValues,
      transforms: t.inputTransform,
    }));

    return {
      id: s.id,
      submissionIds: s.submissions.map((s) => s.id),
      ops,
    };
  } catch (error) {}

  return null;
}

const interpreter = (session: Session) => async (jiff_instance: JIFFClient) => {
  console.log("MPC Connected!", session);

  const allSecrets = session.ops.map(async (op) => {
    switch (op.c) {
      case "RANKING": {
        const secrets = mpc.remerge_secrets(jiff_instance, op.submissions);
        const secrets_sorted = mpc.sort(secrets);
        return jiff_instance.open_array(mpc.ranking(secrets_sorted, secrets));
      }
      case "RANKING_DATASET": {
        const {
          referenceSecret,
          datasetSecrets,
        } = await mpc.share_dataset_secrets(
          jiff_instance,
          op.transforms,
          op.dataset,
          1,
          2
        );
        const res = await jiff_instance.open(
          mpc.ranking_const(referenceSecret, datasetSecrets)
        );
        return [res];
      }
    }
  });

  const allResults = await Promise.all(allSecrets);

  console.log("allResults: ", allResults);

  await logResults(session, rotate(allResults));

  jiff_instance.disconnect(true, true);
};

function rotate(results: number[][]): number[][] {
  const res = Array.from({ length: results[0].length }, (_) =>
    Array.from({ length: results.length }, () => 0)
  );

  for (const dimensionId in results) {
    for (const submissionId in results[dimensionId]) {
      res[submissionId][dimensionId] = results[dimensionId][submissionId];
    }
  }

  return res;
}

async function logResults(session: Session, resultsRotated: number[][]) {
  const resultInserts: Prisma.ResultCreateWithoutSessionInput[] = session.submissionIds.map(
    (sid, idx) => ({
      integerResults: resultsRotated[idx],
      submission: { connect: { id: sid } },
    })
  );
  return prismaConnection().benchmarkingSession.update({
    data: {
      process: {
        update: {
          status: ProcessingStatus.FINISHED,
        },
      },
      results: { create: resultInserts },
    },
    where: {
      id: session.id,
    },
  });
}

async function getSession(sessionId: string) {
  return prismaConnection().benchmarkingSession.findUnique({
    include: {
      submissions: {
        orderBy: {
          submitter: "asc",
        },
      },
    },
    where: { id: sessionId },
  });
}

async function startSession(sessionId: string) {
  return prismaConnection().processingQueue.create({
    data: {
      status: ProcessingStatus.PROCESSING,
      session: { connect: { id: sessionId } },
    },
  });
}

type DatasetKV = {
  dimensions: {
    name: string;
    inputTransform: number[];
    integerValues: number[];
  }[];
};

async function getDataset(datasetId: string): Promise<DatasetKV | null> {
  return prismaConnection().dataset.findUnique({
    select: {
      dimensions: {
        select: {
          name: true,
          integerValues: true,
          inputTransform: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
    where: { id: datasetId },
  });
}

/*async function finishSession(sessionId: string) {
  return prismaConnection().processingQueue.update({
    data: {
      status: ProcessingStatus.FINISHED,
    },
    where: {
      sessionId,
    },
  });
}
*/
