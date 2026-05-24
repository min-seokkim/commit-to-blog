import { Octokit } from "@octokit/rest";

import {
  ApiError,
  isRecord,
  readNumberProperty,
  readStringProperty,
} from "../errors.js";
import type { CommitNormalized } from "../types/commit.js";

type GitHubClient = InstanceType<typeof Octokit>;
type GitHubCommitData = Awaited<
  ReturnType<GitHubClient["rest"]["repos"]["getCommit"]>
>["data"];

export type GitHubService = {
  getNormalizedCommit: (
    owner: string,
    repo: string,
    ref: string,
  ) => Promise<CommitNormalized>;
};

export function createGitHubService(githubToken: string): GitHubService {
  return {
    async getNormalizedCommit(owner, repo, ref) {
      if (githubToken.trim() === "") {
        throw new ApiError(
          500,
          "GITHUB_AUTH",
          "GitHub 토큰을 확인해주세요",
        );
      }

      const octokit = new Octokit({ auth: githubToken });

      try {
        const response = await octokit.rest.repos.getCommit({
          owner,
          repo,
          ref,
        });

        return normalizeCommit(response.data);
      } catch (error) {
        throw mapGitHubError(error);
      }
    },
  };
}

function normalizeCommit(commit: GitHubCommitData): CommitNormalized {
  const authorName =
    commit.commit.author?.name ?? commit.author?.login ?? "Unknown author";
  const authorDate =
    commit.commit.author?.date ??
    commit.commit.committer?.date ??
    new Date(0).toISOString();

  return {
    sha: commit.sha,
    shortSha: commit.sha.slice(0, 7),
    message: commit.commit.message,
    author: authorName,
    date: authorDate,
    stats: {
      additions: commit.stats?.additions ?? 0,
      deletions: commit.stats?.deletions ?? 0,
      total: commit.stats?.total ?? 0,
    },
    files: (commit.files ?? []).map((file) => ({
      filename: file.filename,
      patch: file.patch ?? "",
    })),
  };
}

function mapGitHubError(error: unknown): ApiError {
  const statusCode = readNumberProperty(error, "status");

  if (statusCode === 401) {
    return new ApiError(500, "GITHUB_AUTH", "GitHub 토큰을 확인해주세요");
  }

  if (statusCode === 403) {
    return new ApiError(
      429,
      "GITHUB_RATE_LIMIT",
      "GitHub API 요청 한도 초과. 잠시 후 다시 시도해주세요",
      readRetryAfter(error),
    );
  }

  if (statusCode === 404) {
    return new ApiError(
      404,
      "NOT_FOUND",
      "요청한 저장소 또는 커밋을 찾을 수 없습니다",
    );
  }

  return new ApiError(
    503,
    "GITHUB_UNAVAILABLE",
    "GitHub API에 연결할 수 없습니다",
  );
}

function readRetryAfter(error: unknown): string | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  const response = error.response;
  if (!isRecord(response)) {
    return undefined;
  }

  const headers = response.headers;
  if (!isRecord(headers)) {
    return undefined;
  }

  return readStringProperty(headers, "retry-after");
}
