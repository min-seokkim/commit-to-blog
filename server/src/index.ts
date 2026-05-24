import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";

import { config } from "./config.js";
import { ApiError, isRecord, sendApiError } from "./errors.js";
import { createCommitTestRouter } from "./routes/commitTest.js";
import { createSummaryRouter } from "./routes/summary.js";
import { createGitHubService } from "./services/github.js";
import { createOpenAIService } from "./services/openai.js";

const app = express();
const githubService = createGitHubService(config.githubToken);
const openAIService = createOpenAIService({
  apiKey: config.openaiApiKey,
  model: config.llmModel,
  diffSizeCapBytes: config.diffSizeCapBytes,
  requestTimeoutMs: config.llmRequestTimeoutMs,
});

app.use(cors({ origin: config.clientOrigin }));
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

app.use("/api", createCommitTestRouter(githubService));
app.use("/api", createSummaryRouter(openAIService));

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
