import { Benchmarking } from "@sine-fdn/sine-ts";

const BenchmarkingService = new Benchmarking({
  baseUrl: "", // connect with "this" Next.js instance
  fetch: fetch,
});

export default BenchmarkingService;
