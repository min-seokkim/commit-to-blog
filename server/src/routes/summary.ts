import { Router } from "express";

import { ApiError, isRecord } from "../errors.js";
import type { OpenAIService } from "../services/openai.js";
import type {
  ApiSuccess,
  CommitFile,
  CommitNormalized,
  CommitStats,
  LLMDraft,
} from "../types/commit.js";

export function createSummaryRouter(openAIService: OpenAIService): Router {
  const router = Router();

  router.post("/summary", async (request, response) => {
    const requestBody: unknown = request.body;

    if (!isCommitNormalized(requestBody)) {
      throw new ApiError(
        400,
        "INVALID_COMMIT_PAYLOAD",
        "커밋 정보 형식이 올바르지 않습니다",
      );
    }

    const draft = await openAIService.generateDraft(requestBody);
    const payload: ApiSuccess<LLMDraft> = { data: draft };

    response.json(payload);
  });

  return router;
}

function isCommitNormalized(value: unknown): value is CommitNormalized {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.sha === "string" &&
    typeof value.shortSha === "string" &&
    typeof value.message === "string" &&
    typeof value.author === "string" &&
    typeof value.date === "string" &&
    isCommitStats(value.stats) &&
    Array.isArray(value.files) &&
    value.files.every(isCommitFile)
  );
}

function isCommitStats(value: unknown): value is CommitStats {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.additions === "number" &&
    typeof value.deletions === "number" &&
    typeof value.total === "number"
  );
}

function isCommitFile(value: unknown): value is CommitFile {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.filename === "string" && typeof value.patch === "string";
}
