import { mpc, SessionId } from "@sine-fdn/sine-ts";

async function benchmarkSingleValue(
  jiff_instance: JIFFClient,
  secretData: number[]
): Promise<SecretShare> {
  const secrets = await mpc.share_dataset_secrets(
    jiff_instance,
    secretData,
    [],
    1,
    2
  );

  return mpc.ranking_const(secrets.referenceSecret, secrets.datasetSecrets);
}

export async function datasetBenchmarking(
  sessionId: SessionId,
  secretData: number[]
): Promise<number[]> {
  return new Promise((resolve) => {
    mpc.connect({
      computationId: sessionId,
      hostname: process.env.COORDINATOR ?? "http://localhost:3000/",
      party_id: 2,
      party_count: 2,
      onConnect: async (jiff_instance: JIFFClient) => {
        console.log("connected!");

        const allResults = await Promise.all(
          secretData.map(() => benchmarkSingleValue(jiff_instance, secretData))
        );
        const res = await jiff_instance.open_array(allResults);
        console.log("result is: ", res);

        jiff_instance.disconnect(true, true);
        resolve(res);
      },
    });
  });
}
