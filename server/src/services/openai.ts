import OpenAI from "openai";

import {
  ApiError,
  isRecord,
  readNumberProperty,
  readStringProperty,
} from "../errors.js";
import type { CommitNormalized, LLMDraft } from "../types/commit.js";

const SYSTEM_PROMPT = `당신은 개발자를 위한 기술 블로그 작성자입니다.
주어진 GitHub 커밋 정보를 분석해 200-500자의 기능 설명형 글을 작성합니다.
반드시 다음 JSON 스키마로 응답하세요:
{ "title": string, "summary": string, "body": string }
- title: 1줄 짧은 제목
- summary: 1-2문장 미리보기
- body: 200-500자 본문, Markdown 가능`;

export type OpenAIService = {
  generateDraft: (commit: CommitNormalized) => Promise<LLMDraft>;
};

export function createOpenAIService({
  apiKey,
  model,
  diffSizeCapBytes,
  requestTimeoutMs,
}: {
  apiKey: string;
  model: string;
  diffSizeCapBytes: number;
  requestTimeoutMs: number;
}): OpenAIService {
  return {
    async generateDraft(commit) {
      if (apiKey.trim() === "") {
        throw new ApiError(
          502,
          "LLM_UPSTREAM",
          "요약 생성에 실패했습니다",
        );
      }

      const client = new OpenAI({ apiKey });

      try {
        const completion = await client.chat.completions.create(
          {
            model,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: formatCommitForPrompt(commit, diffSizeCapBytes),
              },
            ],
          },
          { timeout: requestTimeoutMs },
        );

        logTokenUsage(completion.usage);

        const content = completion.choices[0]?.message?.content;
        if (typeof content !== "string" || content.trim() === "") {
          throw new ApiError(500, "LLM_INVALID_JSON", "응답 형식 오류");
        }

        return parseDraft(content);
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }

        throw mapOpenAIError(error);
      }
    },
  };
}

function formatCommitForPrompt(
  commit: CommitNormalized,
  diffSizeCapBytes: number,
): string {
  const fileList =
    commit.files.length === 0
      ? "- No file patches returned by GitHub"
      : commit.files.map((file) => `- ${file.filename}`).join("\n");
  const diffText =
    commit.files.length === 0
      ? "(no diff available)"
      : commit.files
          .map(
            (file) =>
              `File: ${file.filename}\n${file.patch || "(patch unavailable)"}`,
          )
          .join("\n\n");
  const cappedDiff = truncateUtf8(diffText, diffSizeCapBytes);
  const diffMarker = cappedDiff.truncated
    ? `\n... (diff truncated at ${diffSizeCapBytes} bytes) ...`
    : "";

  return [
    `Commit SHA: ${commit.sha}`,
    `Short SHA: ${commit.shortSha}`,
    `Message: ${commit.message}`,
    `Author: ${commit.author}`,
    `Date: ${commit.date}`,
    `Stats: +${commit.stats.additions} -${commit.stats.deletions} (${commit.stats.total} total)`,
    "Files:",
    fileList,
    "Diff:",
    `${cappedDiff.text}${diffMarker}`,
  ].join("\n");
}

function truncateUtf8(
  value: string,
  maxBytes: number,
): { text: string; truncated: boolean } {
  const buffer = Buffer.from(value, "utf8");

  if (buffer.byteLength <= maxBytes) {
    return { text: value, truncated: false };
  }

  return {
    text: buffer.subarray(0, maxBytes).toString("utf8"),
    truncated: true,
  };
}

function parseDraft(content: string): LLMDraft {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ApiError(500, "LLM_INVALID_JSON", "응답 형식 오류");
  }

  if (
    !isRecord(parsed) ||
    typeof parsed.title !== "string" ||
    typeof parsed.summary !== "string" ||
    typeof parsed.body !== "string"
  ) {
    throw new ApiError(500, "LLM_SCHEMA_MISMATCH", "응답 스키마 불일치");
  }

  if (parsed.body.length < 50 || parsed.body.length > 2000) {
    process.stderr.write(
      `LLM body length warning: ${parsed.body.length} characters\n`,
    );
  }

  return {
    title: parsed.title,
    summary: parsed.summary,
    body: parsed.body,
  };
}

function logTokenUsage(
  usage:
    | {
        prompt_tokens?: number;
        completion_tokens?: number;
      }
    | null
    | undefined,
): void {
  if (usage === undefined || usage === null) {
    process.stdout.write("LLM token usage prompt=unknown completion=unknown\n");
    return;
  }

  process.stdout.write(
    `LLM token usage prompt=${usage.prompt_tokens ?? "unknown"} completion=${
      usage.completion_tokens ?? "unknown"
    }\n`,
  );
}

function mapOpenAIError(error: unknown): ApiError {
  const statusCode = readNumberProperty(error, "status");
  const errorCode = readStringProperty(error, "code");
  const errorName = readStringProperty(error, "name");

  if (
    statusCode === 408 ||
    errorCode === "ETIMEDOUT" ||
    errorCode === "ECONNABORTED" ||
    errorName?.toLowerCase().includes("timeout") === true
  ) {
    return new ApiError(
      504,
      "LLM_TIMEOUT",
      "요약 생성 시간이 초과되었습니다",
    );
  }

  if (
    statusCode === 413 ||
    (statusCode === 400 && errorCode === "context_length_exceeded")
  ) {
    return new ApiError(
      413,
      "PROMPT_TOO_LARGE",
      "커밋이 너무 큽니다. diff 크기를 줄여보세요",
    );
  }

  if (statusCode !== undefined && statusCode >= 500) {
    return new ApiError(502, "LLM_UPSTREAM", "요약 생성에 실패했습니다");
  }

  return new ApiError(502, "LLM_UPSTREAM", "요약 생성에 실패했습니다");
}
