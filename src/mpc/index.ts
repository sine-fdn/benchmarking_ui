import {
  BenchmarkingSession,
  ProcessingStatus,
  Submission,
} from "@prisma/client";
import { MPCTaskOp } from "../server/types";
import prismaConnection from "../utils/prismaConnection";

const PARTY_ID = Number(process.env.MPC_NODE_ID ?? "0");
const DEFAULT_COORDINATOR = process.env.COORDINATOR ?? "http://localhost:8080";

type ExpandedBenchmarkingSession = BenchmarkingSession & {
  submissions: Submission[];
};

type DelegationType = "LEADER" | "FOLLOWER";

export async function enqueueFunctionCall(
  sessionId: string,
  inputMatrix: number[],
  delegation?: DelegationType
): Promise<void> {
  const ops: MPCTaskOp[] = [
    {
      c: delegation ? "FUNCTION_CALL_DELEGATED" : "FUNCTION_CALL",
      transforms: inputMatrix,
    },
  ];
  await enqueueTask(
    sessionId,
    ops,
    delegation === "FOLLOWER" ? 2 : 1,
    delegation ? 3 : 2
  );
}

type ShardingOptions = { numShards: number; shardId: number };

export async function enqueueBenchmarkingAsLead(
  sessionId: string,
  options?: ShardingOptions
) {
  console.log("Enqueueing benchmarking session", sessionId, options);

  const session = await getSession(sessionId);
  if (!session) {
    throw new Error("Failed to find session");
  }

  const ops = session.datasetId
    ? await fromDataset(session, options)
    : verticalize(session);
  if (!ops) {
    throw new Error("Failed to construct session for interpreter");
  }

  const party_id = PARTY_ID;
  const party_count = options ? 3 : 2;
  await enqueueTask(sessionId, ops, party_id, party_count);
}

export async function enqueueJoinBenchmarking(sessionId: string) {
  console.log("Joining benchmarking session", sessionId);

  const session = await getSession(sessionId);
  if (!session) {
    throw new Error("Failed to find session");
  }

  const ops: MPCTaskOp[] = [{ c: "RANKING_DATASET_DELEGATED", dataset: [] }];
  const party_id = PARTY_ID;
  const party_count = 3;
  await enqueueTask(sessionId, ops, party_id, party_count); // let this crash in case a concurrent start happend
}

/* input data is organized by submitter ("horizontal")
 * by verticalizing the input data, it is grouped by benchmarking dimension
 *  **across** the submitters.
 */
function verticalize(
  s: BenchmarkingSession & {
    submissions: Submission[];
  }
): MPCTaskOp[] {
  return s.inputComputations.map((_, idx) => ({
    submissions: s.submissions.map((s) => s.integerValues[idx]),
    c: "RANKING",
  }));
}

async function fromDataset(
  s: ExpandedBenchmarkingSession,
  options?: ShardingOptions
): Promise<MPCTaskOp[] | null> {
  try {
    const dataset = s.datasetId ? await getDataset(s.datasetId) : null;

    if (!dataset) {
      console.error("Failed to find dataset ", s.datasetId);
      return null;
    }

    // for each output dimension, perform MPC of kind "RANKING_DATASET"
    return dataset.dimensions.map((t) => ({
      c: options ? "RANKING_DATASET_DELEGATED" : "RANKING_DATASET",
      dataset: shardDataset(t.integerValues, options),
    }));
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

async function enqueueTask(
  sessionId: string,
  ops: MPCTaskOp[],
  partyId: number,
  partyCount: number
) {
  return prismaConnection().processingQueue.create({
    data: {
      status: ProcessingStatus.PENDING,
      ops,
      partyId,
      partyCount,
      coordinator: DEFAULT_COORDINATOR,
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
