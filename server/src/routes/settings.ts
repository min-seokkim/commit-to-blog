import { Router } from "express";

import type { ServerConfig } from "../config.js";
import type { ApiSuccess } from "../types/commit.js";

export type SettingsSummary = {
  llmModel: string;
  githubToken: "configured" | "missing";
  openaiKey: "configured" | "missing";
  clientOrigin: string;
  port: number;
};

export function createSettingsRouter(config: ServerConfig): Router {
  const router = Router();

  router.get("/settings", (_request, response) => {
    const payload: ApiSuccess<SettingsSummary> = {
      data: {
        llmModel: config.llmModel,
        githubToken:
          config.githubToken.trim() !== "" ? "configured" : "missing",
        openaiKey:
          config.openaiApiKey.trim() !== "" ? "configured" : "missing",
        clientOrigin: config.clientOrigin,
        port: config.port,
      },
    };

    response.json(payload);
  });

  return router;
}
