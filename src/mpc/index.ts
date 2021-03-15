import {
  BenchmarkingSession,
  ProcessingStatus,
  Prisma,
  Submission,
  MpcFunction,
} from "@prisma/client";
import prismaConnection from "../utils/prismaConnection";
import { mpc } from "@sine-fdn/sine-ts";
import { remerge_secrets } from "./mpc_primitives";

const ZP = 16777729;
const PARTY_ID = Number(process.env.MPC_NODE_ID ?? "0");
const DEFAULT_COORDINATOR = "http://localhost:8080";

type Op =
  | { c: "RANKING"; submissions: number[] }
  | {
      c: "RANKING_DATASET" | "RANKING_DATASET_DELEGATED";
      dataset: number[];
    }
  | {
      c: "FUNCTION_CALL";
      transforms: number[];
    };

type Session = {
  id: string;
  submissionIds: string[];
  ops: Op[];
};

type ExpandedBenchmarkingSession = BenchmarkingSession & {
  submissions: Submission[];
};

export async function PerformFunctionCall(
  sessionId: string,
  mpcfun: MpcFunction
) {
  console.log("Starting function call", sessionId);

  try {
    const session = await getSession(sessionId);
    if (!session) {
      console.error("Failed to find session: ", sessionId);
      return;
    }

    await startSession(sessionId);

    const s: Session = {
      id: sessionId,
      submissionIds: [],
      ops: [{ c: "FUNCTION_CALL", transforms: mpcfun.inputMatrix }],
    };

    console.log("MPC is starting...");
    mpc.connect({
      computationId: sessionId,
      hostname: process.env.COORDINATOR ?? DEFAULT_COORDINATOR,
      party_id: PARTY_ID,
      party_count: 2,
      Zp: ZP,
      //onConnect: preprocess(interpreter(s)),
      onConnect: interpreter(s),
    });
  } catch (error) {}
}

type ShardingOptions = { numShards: number; shardId: number };

export async function PerformBenchmarkingAsLead(
  sessionId: string,
  options?: ShardingOptions
) {
  console.log("Starting benchmarking session", sessionId);

  try {
    const session = await getSession(sessionId);
    if (!session) {
      console.error("Failed to find session: ", sessionId);
      return;
    }

    await startSession(sessionId); // let this crash in case a concurrent start happend

    const s = session.datasetId
      ? await fromDataset(session, options)
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
      party_count: options ? 3 : 2,
      Zp: ZP,
      onConnect: interpreter(s),
    });
  } catch (error) {
    console.error("Failed to perform MPC", error);
  }
}

export async function JoinBenchmarking(sessionId: string) {
  console.log("Joining benchmarking session", sessionId);

  try {
    const session = await getSession(sessionId);
    if (!session) {
      console.error("Failed to find session: ", sessionId);
      return;
    }

    await startSession(sessionId); // let this crash in case a concurrent start happend

    const s: Session = {
      id: sessionId,
      submissionIds: [],
      ops: [{ c: "RANKING_DATASET_DELEGATED", dataset: [] }],
    };

    console.log("MPC is starting...");
    mpc.connect({
      computationId: sessionId,
      hostname: process.env.COORDINATOR ?? DEFAULT_COORDINATOR,
      party_id: PARTY_ID,
      party_count: 3,
      Zp: ZP,
      onConnect: interpreter(s),
    });
  } catch (error) {
    console.error("Failed to perform MPC", error);
  }
}

/*
const preprocess = (fn: (c: JIFFClient) => unknown) => (c: JIFFClient) => {
  console.log("Starting preprocessing");
  c.preprocessing(
    "smult",
    6,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    { div: false }
  );
  c.preprocessing("sdiv", 1);
  c.preprocessing("sgt", 5);
  c.executePreprocessing(() => {
    console.log("Finished preprocessing");
    fn(c);
  });
};*/

/* input data is organized by submitter ("horizontal")
 * by verticalizing the input data, it is grouped by benchmarking dimension
 *  **across** the submitters.
 */
function verticalize(
  s: BenchmarkingSession & {
    submissions: Submission[];
  }
): Session {
  const ops: Session["ops"] = s.inputComputations.map((_, idx) => ({
    submissions: s.submissions.map((s) => s.integerValues[idx]),
    c: "RANKING",
  }));

  return {
    id: s.id,
    submissionIds: s.submissions.map((s) => s.id),
    ops,
  };
}

async function fromDataset(
  s: ExpandedBenchmarkingSession,
  options?: ShardingOptions
): Promise<Session | null> {
  try {
    const dataset = s.datasetId ? await getDataset(s.datasetId) : null;

    if (!dataset) {
      console.error("Failed to find dataset ", s.datasetId);
      return null;
    }

    // for each output dimension, perform MPC of kind "RANKING_DATASET"
    const ops: Session["ops"] = dataset.dimensions.map((t) => ({
      c: options ? "RANKING_DATASET_DELEGATED" : "RANKING_DATASET",
      dataset: shardDataset(t.integerValues, options),
    }));

    return {
      id: s.id,
      submissionIds: s.submissions.map((s) => s.id),
      ops,
    };
  } catch (error) {}

  return null;
}

function shardDataset(
  integerValues: number[],
  options?: ShardingOptions
): number[] {
  if (!options) {
    return integerValues;
  }

  const res: number[] = [];
  for (
    let idx = options.shardId;
    idx < integerValues.length;
    idx += options.numShards
  ) {
    res.push(integerValues[idx]);
  }

  console.log("shard dataset", res, integerValues);

  return res;
}

const interpreter = (session: Session) => async (jiff_instance: JIFFClient) => {
  console.log("MPC Connected!", session);

  const allSecrets = session.ops.map(async (op) => {
    switch (op.c) {
      case "RANKING": {
        const secrets = await remerge_secrets(jiff_instance, op.submissions);
        const secrets_sorted = mpc.sort(secrets);
        return jiff_instance.open_array(mpc.ranking(secrets_sorted, secrets));
      }
      case "RANKING_DATASET": {
        const {
          referenceSecrets,
          datasetSecrets,
        } = await mpc.share_dataset_secrets(jiff_instance, op.dataset, 1, 2);
        const res = await jiff_instance.open(
          mpc.ranking_const(referenceSecrets[0], datasetSecrets)
        );
        return [res];
      }
      case "RANKING_DATASET_DELEGATED": {
        const allSecrets = await jiff_instance.share_array(
          op.dataset,
          undefined,
          undefined,
          [1, 2]
        );
        const referenceSecret = allSecrets[3][0];
        const rank = mpc.ranking_const(referenceSecret, allSecrets[1]);
        const rankPublic = jiff_instance.reshare(
          rank,
          undefined,
          [1, 2, 3],
          [1, 2]
        );

        const res = await jiff_instance.open(rankPublic);
        return [res];
      }
      case "FUNCTION_CALL": {
        const secrets = await mpc.share_dataset_secrets(
          jiff_instance,
          op.transforms,
          1,
          2
        );

        const res = await jiff_instance.open(
          mpc.dotproduct(secrets.datasetSecrets, secrets.referenceSecrets)
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
  const res = Array.from({ length: results[0].length }, () =>
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
    unitTransform: number[];
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
          unitTransform: true,
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
