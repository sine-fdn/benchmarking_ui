import React, { useState } from "react";
import Layout from "../../components/Layout";
import MPCC from "../../services/mpcClient";

const TEST = 80;

type ComputationState =
  | undefined
  | { s: "RUNNING" }
  | { s: "ERROR"; msg: string }
  | { s: "RESULT"; result: number; runtime: number };

export default function FunctionsPage() {
  const [state, setState] = useState<ComputationState>(undefined);

  async function performFunctionCall() {
    if (state !== undefined) return;

    setState({ s: "RUNNING" });

    const d = new Date();
    const res = await MPCC.performFunctionCall(
      `test-${TEST}`,
      Array.from({ length: TEST }).map((_, idx) => idx)
    );
    const result = await res.result;
    const d2 = new Date();
    const runtime = d2.valueOf() - d.valueOf();
    setState({ s: "RESULT", result, runtime });
  }

  return (
    <Layout title="SINE Function Call Demo">
      <div className="container content mb-6">
        <div className="block">
          <button className="button is-danger" onClick={performFunctionCall}>
            Click me
          </button>

          {state?.s === "RESULT" && (
            <div>
              Result: {state.result} <br />
              runtime: {state.runtime}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
