import { FunctionCallApiResponse } from "@sine-fdn/sine-ts";
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

import { enqueueFunctionCall } from "../../../../../../../mpc";
import initMiddleware from "../../../../../../../utils/initMiddleware";
import prismaConnection from "../../../../../../../utils/prismaConnection";

const cors = initMiddleware(
  Cors({
    methods: ["POST", "HEAD", "OPTIONS"],
  })
);

export default async function MpcFunctionExecution(
  req: NextApiRequest,
  res: NextApiResponse<FunctionCallApiResponse>
) {
  if (!(await cors(req, res))) return;

  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    return await post(req, res);
  }

  return res.status(400).json({ success: false, message: "Bad Request" });
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<FunctionCallApiResponse>
) {
  try {
    const functionId = req.query.functionId;
    const sessionId = req.query.sessionId;
    if (typeof functionId !== "string" || typeof sessionId !== "string") {
      return res.status(500).json({ success: false, message: "oops" });
    }

    await prismaConnection().benchmarkingSession.create({
      select: {
        id: true,
      },
      data: {
        id: sessionId,
        title: `mpcfunction://${functionId}`,
        numParties: 3,
        inputTitles: [],
        inputComputations: ["FUNCTION_CALL"],
      },
    });

    const coordinatorUrl = await enqueueFunctionCall(sessionId, [], "FOLLOWER");

    return res.status(201).json({ success: true, sessionId, coordinatorUrl });
  } catch (error) {
    console.error("Delegated function call failed", error);
    return res.status(500).json({ success: false, message: `Error: ${error}` });
  }
}
