import { QueueKind } from "@prisma/client";
import { CoordinatorUrl } from "@sine-fdn/sine-ts";
import prismaConnection from "../utils/prismaConnection";

export default async function nextCoordinator(
  qkind: QueueKind,
  coordinators: string[]
): Promise<CoordinatorUrl> {
  if (qkind !== QueueKind.DATASET || coordinators.length < 2) {
    return coordinators[0];
  }

  const { count } = await prismaConnection().processingQueue.aggregate({
    count: true,
    where: {
      qkind,
    },
  });

  // dedicate the first coordinator for non-dataset calls
  const coordinator = coordinators[1 + (count % (coordinators.length - 1))];
  return coordinator;
}
