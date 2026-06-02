import { config } from "./config.js";
import express from "express";

const app = express();
const port = config.server.port;

app.get("/", (req, res) => {
  res.send("RAG + EXPRESS");
});

app.listen(port, () => {
  console.log("Servidor online");
});
