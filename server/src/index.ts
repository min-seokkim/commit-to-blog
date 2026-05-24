import cors from "cors";
import type { CorsOptions } from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";

import { config } from "./config.js";
import { createDatabase } from "./data/db.js";
import { ApiError, isRecord, sendApiError } from "./errors.js";
import { createGitHubRouter } from "./routes/github.js";
import { createPostsRouter } from "./routes/posts.js";
import { createSettingsRouter } from "./routes/settings.js";
import { createSummaryRouter } from "./routes/summary.js";
import { createGitHubService } from "./services/github.js";
import { createOpenAIService } from "./services/openai.js";

const app = express();
const db = await createDatabase();
const githubService = createGitHubService(config.githubToken);
const openAIService = createOpenAIService({
  apiKey: config.openaiApiKey,
  model: config.llmModel,
  diffSizeCapBytes: config.diffSizeCapBytes,
  requestTimeoutMs: config.llmRequestTimeoutMs,
});

app.use(cors(createCorsOptions(config.clientOrigin)));
app.use(express.json());

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    if (isJsonParseError(error)) {
      sendApiError(
        response,
        new ApiError(400, "INVALID_JSON", "요청 JSON 형식이 올바르지 않습니다"),
      );
      return;
    }

    next(error);
  },
);

app.get("/api/health", (_request, response) => {
  response.json({ data: { ok: true } });
});

app.use("/api", createGitHubRouter(githubService));
app.use("/api", createSummaryRouter(openAIService));
app.use("/api", createPostsRouter(db));
app.use("/api", createSettingsRouter(config));

app.use("/api", (_request, response) => {
  response.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "요청한 API를 찾을 수 없습니다",
    },
  });
});

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    sendApiError(response, error);
  },
);

app.listen(config.port, () => {
  process.stdout.write(`Smart Blog server listening on port ${config.port}\n`);
});

function isJsonParseError(error: unknown): boolean {
  return (
    isRecord(error) &&
    error instanceof SyntaxError &&
    error.status === 400 &&
    error.type === "entity.parse.failed"
  );
}

function createCorsOptions(clientOrigin: string): CorsOptions {
  const allowedOrigins = new Set(
    [
      ...clientOrigin.split(",").map((origin) => origin.trim()),
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://[::1]:5173",
    ].filter((origin) => origin !== ""),
  );

  return {
    origin(origin, callback) {
      if (origin === undefined || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
  };
}
