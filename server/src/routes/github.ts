import { Router } from "express";

import { ApiError, readQueryString } from "../errors.js";
import type { GitHubService } from "../services/github.js";
import type {
  ApiSuccess,
  BranchSummary,
  CommitNormalized,
  CommitSummary,
  RepositorySummary,
} from "../types/commit.js";

export function createGitHubRouter(githubService: GitHubService): Router {
  const router = Router();

  router.get("/repos", async (_request, response) => {
    const repos = await githubService.listRepos();
    const payload: ApiSuccess<RepositorySummary[]> = { data: repos };

    response.json(payload);
  });

  router.get("/branches", async (request, response) => {
    const repoParam = readQueryString(request.query.repo);
    const repoRef = parseRepoParam(repoParam);
    const branches = await githubService.listBranches(repoRef.owner, repoRef.repo);
    const payload: ApiSuccess<BranchSummary[]> = { data: branches };

    response.json(payload);
  });

  router.get("/commits", async (request, response) => {
    const repoParam = readQueryString(request.query.repo);
    const branch = readQueryString(request.query.branch);
    const repoRef = parseRepoParam(repoParam);

    if (branch === undefined || branch.trim() === "") {
      throw new ApiError(400, "INVALID_QUERY", "branch 쿼리가 필요합니다");
    }

    const commits = await githubService.listCommits(
      repoRef.owner,
      repoRef.repo,
      branch,
    );
    const payload: ApiSuccess<CommitSummary[]> = { data: commits };

    response.json(payload);
  });

  router.get("/commits/:sha", async (request, response) => {
    const repoParam = readQueryString(request.query.repo);
    const repoRef = parseRepoParam(repoParam);
    const commit = await githubService.getNormalizedCommit(
      repoRef.owner,
      repoRef.repo,
      request.params.sha,
    );
    const payload: ApiSuccess<CommitNormalized> = { data: commit };

    response.json(payload);
  });

  return router;
}

function parseRepoParam(repoParam: string | undefined): {
  owner: string;
  repo: string;
} {
  if (repoParam === undefined || repoParam.trim() === "") {
    throw new ApiError(400, "INVALID_QUERY", "repo 쿼리가 필요합니다");
  }

  const [owner, repo] = repoParam.split("/");

  if (
    owner === undefined ||
    owner.trim() === "" ||
    repo === undefined ||
    repo.trim() === ""
  ) {
    throw new ApiError(
      400,
      "INVALID_QUERY",
      "repo는 owner/repo 형식이어야 합니다",
    );
  }

  return { owner, repo };
}
