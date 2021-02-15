import { mpc, SessionId } from "@sine-fdn/sine-ts";

const SINE_PARTY_ID = 1;
const BROWSER_PARTY_ID = 2;

/**
 * performs the MPC protocol against a single dimension
 * @param jiff_instance low-level MPC connection
 * @param secretInput user-level input vector (to remain secret)
 */
async function benchmarkingProtocol(
  jiff_instance: JIFFClient,
  secretInput: number[]
): Promise<SecretShare> {
  const secrets = await mpc.share_dataset_secrets(
    jiff_instance,
    secretInput,
    SINE_PARTY_ID,
    BROWSER_PARTY_ID
  );

  return mpc.ranking_const(secrets.referenceSecrets[0], secrets.datasetSecrets);
}

export async function datasetBenchmarking(
  sessionId: SessionId,
  secretData: number[],
  numDimensions: number
): Promise<number[]> {
  return new Promise((resolve) => {
    mpc.connect({
      computationId: sessionId,
      hostname: process.env.COORDINATOR ?? "http://localhost:3000/",
      party_id: 2,
      party_count: 2,
      onConnect: async (jiff_instance: JIFFClient) => {
        const ranks: SecretShare[] = [];
        for (let dimension = 0; dimension < numDimensions; ++dimension) {
          ranks.push(await benchmarkingProtocol(jiff_instance, secretData));
        }

        const res = await jiff_instance.open_array(ranks);

        jiff_instance.disconnect(true, true);
        resolve(res);
      },
    });
  });
}
