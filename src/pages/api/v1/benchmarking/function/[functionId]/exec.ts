import { FunctionCallApiResponse } from "@sine-fdn/sine-ts";
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

import { enqueueFunctionCall } from "../../../../../../mpc";
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
  const delegated = req.query.delegated !== undefined;
  const mpcfun = await prismaConnection().mpcFunction.findUnique({
    where: { id: functionId },
  });

  console.log("Function call", functionId, delegated);

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

  if (delegated) {
    const r = await fetch(
      `${process.env.DELEGATED_UPSTREAM_HOST}/api/v1/benchmarking/function/${functionId}/join/${sessionId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );
    if (!r.ok) {
      return res
        .status(400)
        .json({ success: false, message: "Upstream host failed" });
    }
  }

  enqueueFunctionCall(
    sessionId,
    mpcfun.inputMatrix,
    delegated ? "LEADER" : undefined
  );

  return res.status(201).json({ success: true, sessionId });
}
