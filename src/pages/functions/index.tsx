import React, { useState } from "react";
import Layout from "../../components/Layout";
import MPCC from "../../services/mpcClient";

const TEST = 20;
const HOW_MANY = 10;

type ComputationState =
  | undefined
  | { s: "RUNNING" }
  | { s: "ERROR"; msg: string }
  | { s: "RESULT"; result: number; runtime: number };

export default function FunctionsPage() {
  const [state, setState] = useState<ComputationState>(undefined);

  async function mpcFunctionCalls(delegated: boolean, howMany: number) {
    return Promise.all(
      Array.from({ length: howMany }).map(() =>
        MPCC.performFunctionCall(
          `test-${TEST}`,
          Array.from({ length: TEST }).map((_, idx) => idx),
          delegated
        ).then((r) => r.result)
      )
    );
  }

  async function performFunctionCall(delegated: boolean) {
    if (state !== undefined && state.s !== "RESULT") return;

    setState({ s: "RUNNING" });

    const d = new Date();
    const result = (await mpcFunctionCalls(delegated, HOW_MANY))[0];
    const d2 = new Date();
    const runtime = d2.valueOf() - d.valueOf();
    setState({ s: "RESULT", result, runtime });
  }

  return (
    <Layout title="SINE Function Call Demo">
      <div className="container content mb-6">
        <div className="block">
          <button
            className="button is-danger"
            onClick={() => performFunctionCall(true)}
          >
            Click me (Delegated call)
          </button>
          <br />
          <button
            className="button is-danger"
            onClick={() => performFunctionCall(false)}
          >
            Click me
          </button>

          {state?.s === "RESULT" && (
            <p>
              Result: {state.result} <br />
              runtime: {state.runtime}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
