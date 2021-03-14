import { NextApiRequest, NextApiResponse } from "next";
import { BenchmarkingSession } from "@prisma/client";
import {
  GetSessionApiResponse,
  NewBenchmarkingSubmission,
  NewSubmissionApiResponse,
} from "@sine-fdn/sine-ts";
import Cors from "cors";

import NewBenchmarkingSubmissionSchema from "../../../schemas/NewBenchmarkingSubmission.schema";
import prismaConnection from "../../../utils/prismaConnection";
import initMiddleware from "../../../utils/initMiddleware";
import { PerformBenchmarkingAsLead } from "../../../mpc";
import { sessionFetchLogic } from "../../../api_lib/sessionFetchLogic";

const cors = initMiddleware(
  Cors({
    methods: ["GET", "POST", "HEAD", "CREATE", "OPTIONS"],
  })
);

export default async function BenchmarkingSubmission(
  req: NextApiRequest,
  res: NextApiResponse<NewSubmissionApiResponse | GetSessionApiResponse>
) {
  if (!(await cors(req, res))) return;

  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  if (typeof req.query.sessionId !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid sessionId parameter" });
  }

  if (req.method === "POST" || req.method === "CREATE") {
    return addSubmission(req.query.sessionId, req, res);
  }

  if (req.method === "GET") {
    return getSession(req.query.sessionId, res);
  }
}

async function getSession(
  sessionId: string,
  res: NextApiResponse<GetSessionApiResponse>
) {
  const session = await prismaConnection().benchmarkingSession.findUnique({
    select: {
      id: true,
      title: true,
      numParties: true,
      inputTitles: true,
      inputComputations: true,
      processorHostnames: true,
      submissions: {
        select: {
          submitter: true,
        },
      },
      process: {
        select: {
          status: true,
        },
      },
      results: {
        select: {
          integerResults: true,
          submission: {
            select: {
              submitter: true,
            },
          },
        },
      },
    },
    where: {
      id: sessionId,
    },
  });
  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    });
  }

  return res.status(200).json({
    ...session,
    success: true,
  });
}

async function addSubmission(
  sessionId: string,
  req: NextApiRequest,
  res: NextApiResponse<NewSubmissionApiResponse>
) {
  const session = await sessionFetchLogic(sessionId);
  if (!session) {
    return res
      .status(404)
      .json({ success: false, message: "Session not found" });
  }

  const maybeSubmission = validateBody(req, session);
  if (!maybeSubmission) {
    return res
      .status(400)
      .json({ success: false, message: "Unrecognized Body" });
  }

  const expectInputLength = session.inputTitles.length;
  const gotInputLength = maybeSubmission.integerValues.length;
  if (gotInputLength !== expectInputLength) {
    return res.status(400).json({
      success: false,
      message: `Illegal number of submitted values. Expected ${expectInputLength}, got ${gotInputLength}`,
    });
  }

  const id = await createSubmission(maybeSubmission);

  await maybeTriggerMpc(sessionId, session.numParties);

  return id
    ? res.status(201).json({ success: true, id })
    : res.status(400).json({
        success: false,
        message: "Failed to add submission to Database",
      });
}

async function maybeTriggerMpc(sessionId: string, numParties: number) {
  const count = await prismaConnection().submission.count({
    where: {
      sessionId,
    },
  });

  console.log("maybeTriggerMPC: ", { count, sessionId, numParties });

  if (count < numParties) {
    return;
  }

  PerformBenchmarkingAsLead(sessionId);
}

function validateBody(
  req: NextApiRequest,
  session: BenchmarkingSession
): NewBenchmarkingSubmission | undefined {
  try {
    return NewBenchmarkingSubmissionSchema(
      session.inputTitles.length
    ).validateSync(req.body, {
      stripUnknown: true,
    });
  } catch (_) {
    return undefined;
  }
}

async function createSubmission(maybeSubmission: NewBenchmarkingSubmission) {
  try {
    const { integerValues, submitter, sessionId } = maybeSubmission;
    const { id } = await prismaConnection().submission.create({
      data: {
        integerValues,
        submitter,
        session: { connect: { id: sessionId } },
      },
    });

    return id;
  } catch (_) {
    return null;
  }
}
