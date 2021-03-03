import babel from "rollup-plugin-babel";
import ts from "rollup-plugin-typescript2";
import replace from "@rollup/plugin-replace";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import shebang from "rollup-plugin-preserve-shebang";

import pkg from "./package.json";

const PLUGINS = [
  nodeResolve(),
  shebang(),
  ts({
    useTsconfigDeclarationDir: true,
  }),
  babel({
    extensions: [".ts", ".js", ".tsx", ".jsx"],
  }),
  replace({
    _VERSION: JSON.stringify(pkg.version),
  }),
];

export default [
  {
    input: "src/index.ts",
    output: [{ file: pkg.main, format: "cjs" }],
    plugins: PLUGINS,
    external: ["commander", "yup", "fs", "@prisma/client"],
  },
];
