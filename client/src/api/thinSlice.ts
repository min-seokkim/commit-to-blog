import { API_BASE_URL } from "./config";

import type {
  CommitFile,
  CommitNormalized,
  CommitStats,
  LLMDraft,
} from "../types/commit";

export async function fetchCommitTest(): Promise<CommitNormalized> {
  return requestData("/api/commit-test", undefined, isCommitNormalized);
}

export async function generateSummary(
  commit: CommitNormalized,
): Promise<LLMDraft> {
  return requestData(
    "/api/summary",
    {
      method: "POST",
      body: JSON.stringify({ commit }),
    },
    isLLMDraft,
  );
}

async function requestData<T>(
  path: string,
  init: RequestInit | undefined,
  validate: (value: unknown) => value is T,
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");

  if (init?.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(readApiErrorMessage(payload) ?? "요청에 실패했습니다");
  }

  if (!isRecord(payload) || !("data" in payload) || !validate(payload.data)) {
    throw new Error("서버 응답 형식이 올바르지 않습니다");
  }

  return payload.data;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    if (response.ok) {
      throw new Error("서버 응답을 읽을 수 없습니다");
    }

    throw new Error("요청에 실패했습니다");
  }
}

function readApiErrorMessage(payload: unknown): string | undefined {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return undefined;
  }

  return typeof payload.error.message === "string"
    ? payload.error.message
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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

function isLLMDraft(value: unknown): value is LLMDraft {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.title === "string" &&
    typeof value.summary === "string" &&
    typeof value.body === "string"
  );
}
