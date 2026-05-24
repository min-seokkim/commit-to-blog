import dotenv from "dotenv";

dotenv.config();

const DEFAULT_PORT = 3000;
const DEFAULT_CLIENT_ORIGIN = "http://localhost:5173";
const DEFAULT_LLM_MODEL = "gpt-4o-mini";
const DEFAULT_DIFF_SIZE_CAP_BYTES = 8192;
const DEFAULT_LLM_REQUEST_TIMEOUT_MS = 30000;

export type ServerConfig = {
  port: number;
  clientOrigin: string;
  githubToken: string;
  openaiApiKey: string;
  llmModel: string;
  diffSizeCapBytes: number;
  llmRequestTimeoutMs: number;
};

function readPositiveInteger(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue.trim() === "") {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

export const config: ServerConfig = {
  port: readPositiveInteger("PORT", DEFAULT_PORT),
  clientOrigin: process.env.CLIENT_ORIGIN ?? DEFAULT_CLIENT_ORIGIN,
  githubToken: process.env.GITHUB_TOKEN ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  llmModel: process.env.LLM_MODEL ?? DEFAULT_LLM_MODEL,
  diffSizeCapBytes: readPositiveInteger(
    "DIFF_SIZE_CAP_BYTES",
    DEFAULT_DIFF_SIZE_CAP_BYTES,
  ),
  llmRequestTimeoutMs: readPositiveInteger(
    "LLM_REQUEST_TIMEOUT_MS",
    DEFAULT_LLM_REQUEST_TIMEOUT_MS,
  ),
};
