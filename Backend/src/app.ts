import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env";
import { importRouter } from "./features/imports/import.routes";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { requestContext } from "./middleware/request-context";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestContext);
  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: "cross-origin"
      }
    })
  );
  app.use(compression());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin is not allowed by CORS"));
      }
    })
  );
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 30,
      standardHeaders: "draft-8",
      legacyHeaders: false
    })
  );
  app.use(express.json({ limit: "256kb" }));

  app.get("/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "groweasy-api"
    });
  });

  app.use("/api/imports", importRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
