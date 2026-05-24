import { Router } from "express";

import type { ServerConfig } from "../config.js";
import type { ApiSuccess } from "../types/commit.js";

export type SettingsSummary = {
  llmModel: string;
  githubTokenConfigured: boolean;
  openaiKeyConfigured: boolean;
};

export function createSettingsRouter(config: ServerConfig): Router {
  const router = Router();

  router.get("/settings", (_request, response) => {
    const payload: ApiSuccess<SettingsSummary> = {
      data: {
        llmModel: config.llmModel,
        githubTokenConfigured: config.githubToken.trim() !== "",
        openaiKeyConfigured: config.openaiApiKey.trim() !== "",
      },
    };

    response.json(payload);
  });

  return router;
}
