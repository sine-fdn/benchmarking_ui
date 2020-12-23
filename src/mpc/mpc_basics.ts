import JIFFClient from "jiff-mpc/lib/jiff-client.js";

const DEFAULT_JIFF_OPTIONS: Partial<JIFFClientOptions> = {
  crypto_provider: true,
  onError: function (_, error: Error) {
    console.error("ERROR ", error);
  },
};

interface ConnectProps extends JIFFClientOptions {
  computationId: string;
  hostname: string;
}

export function connect({
  computationId,
  hostname,
  ...opts
}: ConnectProps): JIFFClient {
  return new JIFFClient(hostname, computationId, {
    ...DEFAULT_JIFF_OPTIONS,
    ...opts,
  });
}

export function remerge_secrets(
  jiff_instance: JIFFClient,
  my_secrets: number[]
): SecretShare[] {
  const all_secrets = jiff_instance.share_array(my_secrets, my_secrets.length);

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

export function sort(secrets_in: SecretShare[]): SecretShare[] {
  function oddEvenSort(a: SecretShare[], lo: number, n: number) {
    if (n > 1) {
      const m = Math.floor(n / 2);
      oddEvenSort(a, lo, m);
      oddEvenSort(a, lo + m, m);
      oddEvenMerge(a, lo, n, 1);
    }
  }

  // lo: lower bound of indices, n: number of elements, r: step
  function oddEvenMerge(a: SecretShare[], lo: number, n: number, r: number) {
    const m = r * 2;
    if (m < n) {
      oddEvenMerge(a, lo, n, m);
      oddEvenMerge(a, lo + r, n, m);

      for (let i = lo + r; i + r < lo + n; i += m) {
        compareExchange(a, i, i + r);
      }
    } else {
      compareExchange(a, lo, lo + r);
    }
  }

  function compareExchange(a: SecretShare[], i: number, j: number) {
    if (j >= a.length || i >= a.length) {
      return;
    }

    const x = a[i];
    const y = a[j];

    const cmp = x.gt(y);
    a[i] = cmp.if_else(x, y);
    a[j] = cmp.if_else(y, x);
  }

  const secrets = secrets_in.map((s) => s.add(0));
  oddEvenSort(secrets, 0, secrets.length);
  return secrets;
}

export function ranking(
  secrets_sorted: SecretShare[],
  secrets: SecretShare[]
): SecretShare[] {
  const ranks: (number | SecretShare)[] = Array.from(
    { length: secrets_sorted.length },
    () => 0
  );

  for (let i = 0; i < secrets_sorted.length; i++) {
    for (let j = 0; j < secrets_sorted.length; j++) {
      const cmp = secrets_sorted[i].seq(secrets[j]);
      ranks[j] = cmp.if_else(i + 1, ranks[j]);
    }
  }

  return ranks as SecretShare[]; //TODO
}
