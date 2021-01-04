import { NextApiRequest, NextApiResponse } from "next";
import {
  NewSession,
  NewSessionApiResponse,
  SessionListingApiResponse,
} from "@sine-fdn/sine-ts";
import { Prisma, ProcessingStatus, XOR } from "@prisma/client";
import NewSessionSchema from "../../../schemas/NewSession.schema";
import prismaConnection from "../../../utils/prismaConnection";

export default async function NewBenchmarkingSession(
  req: NextApiRequest,
  res: NextApiResponse<NewSessionApiResponse | SessionListingApiResponse>
) {
  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  if (req.method === "POST" || req.method === "CREATE") {
    return await post(req, res);
  }

  if (req.method !== "GET") {
    return res
      .status(400)
      .json({ success: false, message: "Unrecognized Verb" });
  }

  if (req.query.status === "processing" || req.query.status === "finished") {
    return await listSessions(res, {
      status:
        req.query.status === "processing"
          ? ProcessingStatus.PROCESSING
          : ProcessingStatus.FINISHED,
    });
  }

  return await listSessions(res, {
    is: null,
  });
}

async function listSessions(
  res: NextApiResponse<SessionListingApiResponse>,
  processFilter: XOR<
    Prisma.ProcessingQueueWhereInput,
    Prisma.ProcessingQueueRelationFilter
  >
) {
  try {
    const openSessions = await prismaConnection().benchmarkingSession.findMany({
      select: {
        id: true,
        title: true,
        numParties: true,
        submissions: {
          select: {
            id: true,
          },
        },
      },
      where: {
        process: processFilter,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      sessions: openSessions.map(({ id, title, numParties, submissions }) => ({
        id,
        title,
        numParties,
        numSubmissions: submissions.length,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to query database",
    });
  }
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<NewSessionApiResponse>
) {
  const PROCESSOR_HOSTNAMES = process.env.PROCESSOR_HOSTNAMES;
  if (!PROCESSOR_HOSTNAMES) {
    return res.status(500).json({
      success: false,
      message: "Server not set up (PROCESSOR_HOSTNAMES)",
    });
  }

  const maybeNewSession = validateBody(req);
  if (!maybeNewSession) {
    return res
      .status(400)
      .json({ success: false, message: "Unrecognized Body" });
  }

  const maybeId = await createSession(
    maybeNewSession,
    PROCESSOR_HOSTNAMES.split(",").map((s: string) => s.trim())
  );
  if (!maybeId) {
    return res.status(400).json({
      success: false,
      message: "Unable to create session at Database",
    });
  }

  return res.status(201).json({
    success: true,
    id: maybeId,
  });
}

async function createSession(
  data: NewSession,
  processorHostnames: string[]
): Promise<string | undefined> {
  const { title, numParties, input } = data;
  const inputTitles = input.map((d) => d.title);
  const inputComputations = input.map((d) => d.computation);

  try {
    const { id } = await prismaConnection().benchmarkingSession.create({
      select: {
        id: true,
      },
      data: {
        title,
        numParties,
        inputTitles,
        inputComputations,
        processorHostnames,
      },
    });

    return id;
  } catch (error) {
    console.error("createSession", data, error);
    return undefined;
  }
}

function validateBody(req: NextApiRequest): NewSession | undefined {
  try {
    return NewSessionSchema.validateSync(req.body, { stripUnknown: true });
  } catch (_) {
    return undefined;
  }
}
