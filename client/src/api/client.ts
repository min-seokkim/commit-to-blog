import { API_BASE_URL } from "./config";

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export class ApiRequestError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
  }
}

export async function requestData<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");

  if (init?.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    const code = "NETWORK_ERROR";
    throw new ApiRequestError(mapApiErrorMessage(code), code, 0);
  }
  const payload = await readJson(response);

  if (!response.ok) {
    const apiError = readApiError(payload);

    const code = apiError?.error.code ?? "REQUEST_FAILED";
    throw new ApiRequestError(
      mapApiErrorMessage(code, apiError?.error.message),
      code,
      response.status,
    );
  }

  if (!isRecord(payload) || !("data" in payload)) {
    throw new ApiRequestError(
      "서버 응답 형식이 올바르지 않습니다",
      "INVALID_RESPONSE",
      response.status,
    );
  }

  return payload.data as T;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ApiRequestError(
      "서버 응답을 읽을 수 없습니다",
      "INVALID_RESPONSE",
      response.status,
    );
  }
}

function readApiError(value: unknown): ApiErrorResponse | undefined {
  if (!isRecord(value) || !isRecord(value.error)) {
    return undefined;
  }

  if (
    typeof value.error.code !== "string" ||
    typeof value.error.message !== "string"
  ) {
    return undefined;
  }

  return {
    error: {
      code: value.error.code,
      message: value.error.message,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mapApiErrorMessage(code: string, fallback?: string): string {
  switch (code) {
    case "GITHUB_AUTH":
      return "GitHub 토큰을 확인해주세요";
    case "GITHUB_RATE_LIMIT":
      return "GitHub API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요";
    case "GITHUB_UNAVAILABLE":
      return "GitHub API에 연결할 수 없습니다";
    case "LLM_UPSTREAM":
      return "요약 생성에 실패했습니다";
    case "PROMPT_TOO_LARGE":
      return "커밋이 너무 큽니다. diff 크기를 줄여보세요";
    case "LLM_INVALID_JSON":
      return "응답 형식 오류";
    case "LLM_SCHEMA_MISMATCH":
      return "응답 스키마 불일치";
    case "LLM_TIMEOUT":
      return "요약 생성 시간이 초과되었습니다";
    case "NOT_FOUND":
      return "요청한 항목을 찾을 수 없습니다";
    case "INVALID_JSON":
      return "요청 JSON 형식이 올바르지 않습니다";
    case "NETWORK_ERROR":
      return "서버에 연결할 수 없습니다. Express 서버가 실행 중인지 확인해주세요";
    default:
      return fallback ?? "요청에 실패했습니다";
  }
}
