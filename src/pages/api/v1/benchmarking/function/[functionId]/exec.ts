import { FunctionCallApiResponse } from "@sine-fdn/sine-ts";
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

import { PerformFunctionCall } from "../../../../../../mpc";
import initMiddleware from "../../../../../../utils/initMiddleware";
import prismaConnection from "../../../../../../utils/prismaConnection";

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
  const functionId =
    typeof req.query.functionId === "string" ? req.query.functionId : "";
  const mpcfun = await prismaConnection().mpcFunction.findUnique({
    where: { id: functionId },
  });

  if (!mpcfun) {
    return res
      .status(404)
      .json({ success: false, message: "MPC Function not found" });
  }

  const { id: sessionId } = await prismaConnection().benchmarkingSession.create(
    {
      select: {
        id: true,
      },
      data: {
        title: `mpcfunction://${functionId}`,
        numParties: 2,
        inputTitles: mpcfun.inputs,
        inputComputations: ["FUNCTION_CALL"],
      },
    }
  );

  PerformFunctionCall(sessionId, mpcfun);

  return res.status(201).json({ success: true, sessionId });
}
