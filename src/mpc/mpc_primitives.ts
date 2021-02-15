export async function remerge_secrets(
  jiff_instance: JIFFClient,
  my_secrets: number[]
): Promise<SecretShare[]> {
  const all_secrets = await jiff_instance.share_array(
    my_secrets,
    my_secrets.length
  );

  const secret_values = all_secrets[1];
  for (let secret = 0; secret < secret_values.length; ++secret) {
    for (let node = 2; node <= jiff_instance.party_count; ++node) {
      secret_values[secret] = secret_values[secret].add(
        all_secrets[node][secret]
      );
    }
  }

  return secret_values;
}
