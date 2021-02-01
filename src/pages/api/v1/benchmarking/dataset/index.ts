import { DatasetListingApiResponse } from "@sine-fdn/sine-ts";
import { NextApiRequest, NextApiResponse } from "next";
import prismaConnection from "../../../../../utils/prismaConnection";

export default async function NewBenchmarkingSession(
  req: NextApiRequest,
  res: NextApiResponse<DatasetListingApiResponse>
) {
  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res
      .status(400)
      .json({ success: false, message: "Unrecognized Verb" });
  }

  try {
    const datasets = await prismaConnection().dataset.findMany({
      select: {
        id: true,
        inputDimensions: true,
        dimensions: {
          select: {
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      datasets: datasets.map((ds) => ({
        name: ds.id,
        id: ds.id,
        dimensions: ds.dimensions.map((d) => d.name),
        inputDimensions: ds.inputDimensions,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch datasets from DB", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch datasets from DB" });
  }
}
