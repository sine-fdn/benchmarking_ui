import { BenchmarkingSession } from "@prisma/client";
import { GetSessionApiResponse } from "@sine-fdn/sine-ts";
import prismaConnection from "../utils/prismaConnection";

const UPSTREAM_HOSTS: string[] = (
  process.env.UPSTREAM_HOSTNAME ??
  process.env.PROCESSOR_HOSTNAMES ??
  ""
).split(",");

export async function sessionFetchLogic(
  id: string
): Promise<BenchmarkingSession | null> {
  const localSession = await findSessionLocal(id);
  if (localSession) {
    return localSession;
  }

  let session: GetSessionApiResponse | null = null;
  console.log("Fetching session from upstream... ", UPSTREAM_HOSTS);
  for (const idx in UPSTREAM_HOSTS) {
    session = await fetchFromUpstream(UPSTREAM_HOSTS[idx], id);
    if (session) break;
  }

  if (!session || !session.success) return null;

  return await prismaConnection().benchmarkingSession.upsert({
    create: {
      id,
      title: session.title,
      numParties: session.numParties,
      inputTitles: session.inputTitles,
      processorHostnames: session.processorHostnames,
      inputComputations: session.inputComputations,
    },
    update: {},
    where: {
      id,
    },
  });
}

async function fetchFromUpstream(
  baseUrl: string,
  id: string
): Promise<GetSessionApiResponse | null> {
  try {
    const res = await fetch(`${baseUrl}/api/v1/${id}`);
    return await res.json(); // TODO
  } catch (error) {
    console.warn(`Failed to fetch benchmarking session from ${baseUrl}`);
    return null;
  }
}

async function findSessionLocal(id: string) {
  try {
    return await prismaConnection().benchmarkingSession.findUnique({
      where: {
        id,
      },
    });
  } catch (_) {
    return null;
  }
}
