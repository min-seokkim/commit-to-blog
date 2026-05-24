import type { Response } from "express";

import type { ApiErrorPayload } from "./types/commit.js";

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly retryAfter?: string;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    retryAfter?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readStringProperty(
  value: unknown,
  propertyName: string,
): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const propertyValue = value[propertyName];
  return typeof propertyValue === "string" ? propertyValue : undefined;
}

export function readNumberProperty(
  value: unknown,
  propertyName: string,
): number | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const propertyValue = value[propertyName];
  return typeof propertyValue === "number" ? propertyValue : undefined;
}

export function sendApiError(response: Response, error: unknown): void {
  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError(
          500,
          "INTERNAL_ERROR",
          "요청 처리 중 오류가 발생했습니다",
        );

  if (apiError.retryAfter !== undefined) {
    response.setHeader("Retry-After", apiError.retryAfter);
  }

  const payload: ApiErrorPayload = {
    error: {
      code: apiError.code,
      message: apiError.message,
    },
  };

  response.status(apiError.statusCode).json(payload);
}
