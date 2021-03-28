/**
 * Standalone Coordinator-only server
 *
 * Acts as a communication relay for the different MPC parties
 */
import JIFFServer from "jiff-mpc";
import express from "express";
import http from "http";
import bignumExt from "jiff-mpc/lib/ext/jiff-server-bignumber.js";

const PORT = Number(process.env.PORT) || 8080;

const app = express();
const httpServer = new http.Server(app);

const jserv = new JIFFServer(httpServer, { logs: false });
jserv.apply_extension(bignumExt);

httpServer.listen(PORT, function () {
  console.log(`Listening on *:${PORT}`);
});
