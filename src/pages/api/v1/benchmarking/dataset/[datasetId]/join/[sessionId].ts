import { NewSession, NewSessionApiResponse } from "@sine-fdn/sine-ts";
import { NextApiRequest, NextApiResponse } from "next";
import { JoinBenchmarking } from "../../../../../../../mpc";
import NewSessionSchema from "../../../../../../../schemas/NewSession.schema";
import prismaConnection from "../../../../../../../utils/prismaConnection";

export default async function JoinSession(
  req: NextApiRequest,
  res: NextApiResponse<NewSessionApiResponse>
) {
  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(400)
      .json({ success: false, message: "Unrecognized verb" });
  }

  const datasetId = req.query.datasetId;
  const sessionId = req.query.sessionId;
  if (typeof datasetId !== "string" || typeof sessionId !== "string") {
    return res.status(500).json({ success: false, message: "oops" });
  }

  const newSession = validateBody(req);
  if (!newSession) {
    return res
      .status(400)
      .json({ success: false, message: "Unrecognized body" });
  }

  await createSession(newSession, sessionId, ["", "", ""], 0);
  JoinBenchmarking(sessionId);

  return res.status(201).json({
    success: true,
    id: sessionId,
  });
}

async function createSession(
  data: NewSession,
  sessionId: string,
  processorHostnames: string[],
  numParties: number
): Promise<string | undefined> {
  const { title, input } = data;
  const inputTitles = input.map((d) => d.title);
  const inputComputations = input.map((d) => d.computation);

  try {
    const { id } = await prismaConnection().benchmarkingSession.create({
      select: {
        id: true,
      },
      data: {
        id: sessionId,
        title,
        numParties,
        inputTitles,
        inputComputations,
        processorHostnames,
        submissions: {
          create: [{ submitter: "You" }],
        },
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
  } catch (error) {
    console.error("Unrecognized body: ", error);
    return undefined;
  }
}
