import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

import initMiddleware from "../../../../../utils/initMiddleware";
import prismaConnection from "../../../../../utils/prismaConnection";
import {
  FunctionListingApiResponse,
  FunctionListingApiSuccessResponse,
  FunctionMetadata,
} from "@sine-fdn/sine-ts";

const cors = initMiddleware(
  Cors({
    methods: ["GET", "HEAD", "OPTIONS"],
  })
);

export default async function MpcFunctionListing(
  req: NextApiRequest,
  res: NextApiResponse<FunctionListingApiResponse>
) {
  if (!(await cors(req, res))) return;

  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return await httpGet(res);
  }

  return res.status(400).json({ success: false, message: "Bad Request" });
}

async function httpGet(
  res: NextApiResponse<FunctionListingApiSuccessResponse>
) {
  const functions: FunctionMetadata[] = await prismaConnection().mpcFunction.findMany(
    {
      select: {
        id: true,
        inputs: true,
        outputs: true,
      },
    }
  );

  return res.status(200).json({
    success: true,
    functions,
  });
}
