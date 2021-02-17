/// <reference types="next" />
/// <reference types="next/types/global" />

declare module "jiff-mpc/lib/jiff-client.js";

declare type JIFFClientOptions = {
  Zp?: number;
  party_id: number;
  party_count: number;
  crypto_provider?: boolean;
  onError?: (jiff_instance: JIFFClient, error: Error) => void;
  onConnect: (cl: JIFFClient) => void;
};

declare class SecretShare {
  add(n: number | SecretShare): SecretShare;
  sadd(n: number | SecretShare): SecretShare;
  sub(s: SecretShare | number): SecretShare;
  mult(s: SecretShare | number): SecretShare;

  gt(n: number | SecretShare): SecretShare;
  sgt(s: SecretShare): SecretShare;
  if_else(t: number | SecretShare, f: number | SecretShare): SecretShare;
  seq(s: SecretShare): SecretShare;
}

declare class JIFFClient {
  constructor(
    hostname: string,
    computation_id: string,
    options: JIFFClientOptions
  );

  party_count: number;

  share(secret: number): { [party_id: string]: SecretShare };
  open(s: SecretShare): Promise<number>;
  share_array(
    secrets: number[],
    length?: number
  ): { [party_id: string]: SecretShare[] };
  open_array(shares: SecretShare[]): Promise<number[]>;

  disconnect(safe?: boolean, free?: boolean): void;
}
