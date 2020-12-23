import { ErrorApiResponse } from "./../interfaces/index";
import { NextApiRequest, NextApiResponse } from "next";

type Middleware<T> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
  next: (err?: unknown) => unknown
) => void;

export default function initMiddleware<T>(middleware: Middleware<T>) {
  return (req: NextApiRequest, res: NextApiResponse<T | ErrorApiResponse>) =>
    new Promise((resolve) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) {
          console.error("Rejecting request in CORS preflight", req);
          res.status(400).json({
            success: false,
            message: "CORS preflight check failed",
          });
          return resolve(false);
        }
        return resolve(true);
      });
    });
}
