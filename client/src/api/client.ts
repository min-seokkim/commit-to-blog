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
    throw new ApiRequestError(
      "서버에 연결할 수 없습니다. Express 서버가 실행 중인지 확인해주세요",
      "NETWORK_ERROR",
      0,
    );
  }
  const payload = await readJson(response);

  if (!response.ok) {
    const apiError = readApiError(payload);

    throw new ApiRequestError(
      apiError?.error.message ?? "요청에 실패했습니다",
      apiError?.error.code ?? "REQUEST_FAILED",
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
