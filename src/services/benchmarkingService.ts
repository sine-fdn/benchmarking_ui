import { Benchmarking } from "@sine-fdn/sine-ts";

const BenchmarkingService = new Benchmarking({
  baseUrl: "", // connect with "this" Next.js instance
  fetch: typeof window !== "undefined" ? window.fetch.bind(window) : fetch,
});

export default BenchmarkingService;
