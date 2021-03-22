import {
  Prisma,
  PrismaClient,
  ProcessingStatus,
  QueueKind,
} from "@prisma/client";
import { Zp, mpc, SessionId } from "@sine-fdn/sine-ts";
import * as dotenv from "dotenv";
import { MPCTaskOp } from "./types";

function load_node_config(debug = false) {
  const suffix =
    process.argv.length > 2 && process.argv[2] ? process.argv[2] : "local";
  const file = `.env.production.${suffix}`;
  dotenv.config({ path: file, debug });
}

dotenv.config();
load_node_config();

const CLIENT = new PrismaClient();
const TIMED_WAIT = 500; // retry every 500ms
const PROCESSING_TIMEOUT = Number(process.env.PROCESSING_TIMEOUT ?? "60000");
const DEFAULT_COORDINATOR =
  process.env.COORDINATOR ?? "https://coordinator.benchmarking.sine.foundation";
const CONCURRENCY = Math.max(0, Number(process.env.CONCURRENCY ?? "1"));
const DATASET_CONCURRENCY = Math.max(
  0,
  Number(process.env.DATASET_CONCURRENCY ?? "1")
);

interface MPCTask {
  id: SessionId;
  taskId: number;
  partyId: number;
  partyCount: number;
  coordinator: string;
  submissionIds: string[];
  ops: MPCTaskOp[];
}

async function main(qkind: QueueKind) {
  for await (const task of grabTask(qkind)) {
    try {
      console.log(`[${qkind}] executing task`, task);
      await performTask(task);
    } catch (error) {
      console.error("Update session to error", task, error);
      await logErrorResult(task.taskId);
    }
  }
}

async function* grabTask(qkind: QueueKind) {
  do {
    const sessionIds = await CLIENT.$queryRaw<{ id: number }[]>(
      `
      UPDATE processing_queue
      SET status = 'PROCESSING'
        , updated_at = now()
      WHERE id = (
          SELECT id from processing_queue
          WHERE status = 'PENDING' and qkind = '${qkind}'
          ORDER BY created_at, id
          FOR UPDATE SKIP LOCKED
          LIMIT 1
      )
      RETURNING id
      `
    );
    if (sessionIds.length === 1) {
      yield await getSession(sessionIds[0].id);
    } else {
      await waitMS();
    }
  } while (true);
}

async function performTask(task: MPCTask): Promise<number[][]> {
  return new Promise<number[][]>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("MPC Task Processing timeout")),
      PROCESSING_TIMEOUT
    );
    try {
      console.log("MPC Task is starting...", task);
      mpc.connect({
        computationId: task.id,
        hostname: task.coordinator,
        party_id: task.partyId,
        party_count: task.partyCount,
        Zp,
        onConnect: interpreter(task, resolve, timer),
      });
    } catch (err) {
      console.error("MPC processing failed", err);
      reject(err);
    }
  });
}

const interpreter = (
  task: MPCTask,
  resolve: (result: number[][]) => void,
  timeout: NodeJS.Timeout
) => async (jiff_instance: JIFFClient) => {
  console.log("MPC Connected!", task);

  const allSecrets = task.ops.map(async (op) => {
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
      case "FUNCTION_CALL_DELEGATED": {
        const allSecrets = await jiff_instance.share_array(
          op.transforms,
          undefined,
          undefined,
          [1, 2]
        );
        const referenceInput = allSecrets[3];

        const result = mpc.dotproduct(allSecrets[1], referenceInput);
        const resultPublic = jiff_instance.reshare(
          result,
          undefined,
          [1, 2, 3],
          [1, 2]
        );

        const res = await jiff_instance.open(resultPublic);
        return [res];
      }
    }
  });

  const allResults = await Promise.all(allSecrets);

  console.log("allResults: ", allResults);

  await logResults(task, rotate(allResults));

  jiff_instance.disconnect(true, true);

  clearTimeout(timeout);
  resolve(allResults);
};

async function remerge_secrets(
  jiff_instance: JIFFClient,
  my_secrets: number[]
): Promise<SecretShare[]> {
  const all_secrets = await jiff_instance.share_array(
    my_secrets,
    my_secrets.length
  );

  const secret_values = all_secrets[1];
  for (let secret = 0; secret < secret_values.length; ++secret) {
    for (let node = 2; node <= jiff_instance.party_count; ++node) {
      secret_values[secret] = secret_values[secret].add(
        all_secrets[node][secret]
      );
    }
  }

  return secret_values;
}

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

async function getSession(taskId: number): Promise<MPCTask> {
  const task = await CLIENT.processingQueue.findUnique({
    select: {
      id: true,
      partyId: true,
      partyCount: true,
      coordinator: true,
      ops: true,
      session: {
        select: { id: true, submissions: true, numParties: true },
      },
    },
    where: {
      id: taskId,
    },
  });
  if (!task) {
    throw new Error("DB invariant failed");
  }

  const session: MPCTask = {
    id: task.session.id,
    taskId: task.id,
    partyId: task.partyId,
    partyCount: task.partyCount,
    coordinator: task.coordinator ?? DEFAULT_COORDINATOR,
    submissionIds: task.session.submissions.map((s) => s.id),
    ops: task.ops ? (task.ops as MPCTaskOp[]) : [],
  };

  return session;
}

async function logResults(session: MPCTask, resultsRotated: number[][]) {
  const resultInserts: Prisma.ResultCreateWithoutSessionInput[] = session.submissionIds.map(
    (sid, idx) => ({
      integerResults: resultsRotated[idx],
      submission: { connect: { id: sid } },
    })
  );
  return CLIENT.benchmarkingSession.update({
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

async function logErrorResult(taskId: number) {
  return CLIENT.processingQueue.updateMany({
    data: {
      status: ProcessingStatus.FINISHED_WITH_ERROR,
    },
    where: {
      id: taskId,
      status: ProcessingStatus.PROCESSING,
    },
  });
}

async function waitMS(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, TIMED_WAIT));
}

function parallelMain(numTasks: number, qkind: QueueKind) {
  Array.from({ length: numTasks }).map(() =>
    main(qkind)
      .catch((error) => {
        console.error(`[${qkind}] task runner failed :/`, error);
      })
      .then(() => {
        process.exit(1);
      })
  );
}

console.log(
  `Starting taskrunner with concurrency=${CONCURRENCY}, dataset_concurrency=${DATASET_CONCURRENCY}`
);
parallelMain(CONCURRENCY, QueueKind.OTHER);
parallelMain(DATASET_CONCURRENCY, QueueKind.DATASET);
