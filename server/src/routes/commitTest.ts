import { Router } from "express";

import { ApiError, sendApiError } from "../errors.js";
import type { GitHubService } from "../services/github.js";
import type { ApiSuccess, CommitNormalized } from "../types/commit.js";

const TEST_COMMIT = {
  owner: "min-seokkim",
  repo: "gwanak-bnb",
  sha: "302e41ddaf24300f9d0a9a3009ffd58e39426276",
};

export function createCommitTestRouter(githubService: GitHubService): Router {
  const router = Router();

  router.get("/commit-test", async (_request, response) => {
    try {
      if (isPlaceholderCommit()) {
        throw new ApiError(
          400,
          "COMMIT_TEST_NOT_CONFIGURED",
          "server/src/routes/commitTest.ts의 테스트 저장소와 SHA를 채워주세요",
        );
      }

      const commit = await githubService.getNormalizedCommit(
        TEST_COMMIT.owner,
        TEST_COMMIT.repo,
        TEST_COMMIT.sha,
      );
      const payload: ApiSuccess<CommitNormalized> = { data: commit };

      response.json(payload);
    } catch (error) {
      sendApiError(response, error);
    }
  });

  return router;
}

function isPlaceholderCommit(): boolean {
  return (
    TEST_COMMIT.owner === "OWNER" ||
    TEST_COMMIT.repo === "REPO" ||
    TEST_COMMIT.sha === "SHA"
  );
}
