import { MPCClient } from "@sine-fdn/sine-ts";
import BenchmarkingService from "./benchmarkingService";

const MPCC = new MPCClient({
  client: BenchmarkingService,
  coordinatorUrl: process.env.COORDINATOR ?? "http://localhost:3010",
});

export default MPCC;
