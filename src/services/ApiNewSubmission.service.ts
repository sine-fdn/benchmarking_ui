import {
  NewBenchmarkingSubmission,
  NewBenchmarkingSubmissionApiResponse,
} from "./../interfaces/index";

const ZP = 16777729;

function mkRandomBytes(bytesNeeded: number): Uint8Array {
  const randomBytes = new Uint8Array(bytesNeeded);
  if (typeof window === "undefined") {
    return randomBytes;
  }
  return window.crypto.getRandomValues(randomBytes);
}

function random(max: number): number {
  if (max > 562949953421312) {
    throw new RangeError("Max value should be smaller than or equal to 2^49");
  }

  const bitsNeeded = Math.ceil(Math.log(max) / Math.log(2));
  const bytesNeeded = Math.ceil(bitsNeeded / 8);
  const maxValue = Math.pow(256, bytesNeeded);

  // Keep trying until we find a random value within bounds
  while (true) {
    // eslint-disable-line
    const randomBytes = mkRandomBytes(bytesNeeded);
    let randomValue = 0;

    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = randomValue * 256 + randomBytes[i];
    }

    // randomValue should be smaller than largest multiple of max within maxBytes
    if (randomValue < maxValue - (maxValue % max)) {
      return randomValue % max;
    }
  }
}

function mod(x: number, y: number) {
  if (x < 0) {
    return (x % y) + y;
  }
  return x % y;
}

function computeShares(n: number, numParties: number, zP = ZP): number[] {
  const randBits = Array.from({ length: numParties - 1 }, () =>
    mod(random(zP), zP)
  );

  const summed = randBits.reduce((lhs, rhs) => mod(lhs + rhs, zP), 0);
  const lastNumber = mod(n - summed, zP);

  randBits.push(lastNumber);
  return randBits;
}

export interface Submission {
  processorHostnames: string[];
  data: NewBenchmarkingSubmission[];
}

export function computeSubmission(
  template: NewBenchmarkingSubmission,
  processorHostnames: string[]
): Submission {
  const shares = template.integerValues.map((v) =>
    computeShares(v, processorHostnames.length)
  );

  return {
    data: processorHostnames.map((_, idx) => ({
      ...template,
      integerValues: shares.map((share) => share[idx]),
    })),
    processorHostnames,
  };
}

export default async function ApiNewSubmission({
  processorHostnames,
  data,
}: Submission): Promise<NewBenchmarkingSubmissionApiResponse> {
  if (processorHostnames.length === 0) {
    return { success: false, message: "No processors given" };
  }
  if (processorHostnames.length !== data.length) {
    return { success: false, message: "Unexpected args" };
  }

  const results = await Promise.all(
    processorHostnames.map((hostname, idx) =>
      fetch(`${hostname}/api/v1/${data[idx].sessionId}`, {
        method: "POST",
        body: JSON.stringify(data[idx]),
      }).then(
        async (req) =>
          req.json().catch((error) => ({
            success: false,
            message: `Failed to convert body from API. Error is: ${error}`,
          })) as Promise<NewBenchmarkingSubmissionApiResponse>
      )
    )
  );

  for (const idx in results) {
    if (!results[idx].success) {
      return results[idx];
    }
  }

  return results[0];
}
