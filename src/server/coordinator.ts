/**
 * Standalone Coordinator-only server
 *
 * Acts as a communication relay for the different MPC parties
 */
import JIFFServer from "jiff-mpc";
import express from "express";
import http from "http";

const PORT = Number(process.env.PORT) || 8080;

const app = express();
const httpServer = new http.Server(app);

new JIFFServer(httpServer, { logs: true });

httpServer.listen(PORT, function () {
  console.log(`Listening on *:${PORT}`);
});
