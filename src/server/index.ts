import next from "next";
import express from "express";
import { parse } from "url";
import { Server as HttpServer } from "http";
import JIFFServer from "jiff-mpc";
import * as dotenv from "dotenv";

function load_node_config(debug = false) {
  if (process.argv.length > 2 && process.argv[2]) {
    const file = `.env.production.${process.argv[2]}`;
    dotenv.config({ path: file, debug });
  }
}

dotenv.config();
load_node_config();

const hostname = process.env.LISTEN_HOSTNAME ?? "0.0.0.0";
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const startApp = async () => {
  await app.prepare();
  const server = express();
  const httpServer = new HttpServer(server);

  new JIFFServer(httpServer, { logs: false });

  server.use((req, res) => {
    handle(req, res, parse(req.url, true));
  });

  return httpServer.listen(port, hostname, () => {
    console.log(
      `> Ready on http://${hostname}:${port} (nodeid: ${process.env.MPC_NODE_ID}) (coordinator: ${process.env.COORDINATOR})`
    );
  });
};

startApp();
