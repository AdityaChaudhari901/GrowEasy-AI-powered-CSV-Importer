import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();
const server = app.listen(env.port, () => {
  console.log(`GrowEasy API listening on http://localhost:${env.port}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`${signal} received. Closing API server.`);
  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 10_000).unref();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
