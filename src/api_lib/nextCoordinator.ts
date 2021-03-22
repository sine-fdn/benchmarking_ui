import { QueueKind } from "@prisma/client";
import { CoordinatorUrl } from "@sine-fdn/sine-ts";

export default function nextCoordinator(
  _: QueueKind,
  coordinators: string[]
): CoordinatorUrl {
  //const idx = Math.floor(Math.random() * coordinators.length);
  return coordinators[0];
}
