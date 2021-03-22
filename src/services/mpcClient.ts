import { MPCClient } from "@sine-fdn/sine-ts";
import BenchmarkingService from "./benchmarkingService";

const MPCC = new MPCClient({
  client: BenchmarkingService,
});

export default MPCC;
