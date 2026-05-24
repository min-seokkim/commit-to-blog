import { Octokit } from "@octokit/rest";

import {
  ApiError,
  isRecord,
  readNumberProperty,
  readStringProperty,
} from "../errors.js";
import type {
  BranchSummary,
  CommitNormalized,
  CommitSummary,
  RepositorySummary,
} from "../types/commit.js";

type GitHubClient = InstanceType<typeof Octokit>;
type GitHubCommitData = Awaited<
  ReturnType<GitHubClient["rest"]["repos"]["getCommit"]>
>["data"];
type GitHubRepoData = Awaited<
  ReturnType<GitHubClient["rest"]["repos"]["listForAuthenticatedUser"]>
>["data"][number];
type GitHubBranchData = Awaited<
  ReturnType<GitHubClient["rest"]["repos"]["listBranches"]>
>["data"][number];
type GitHubCommitListData = Awaited<
  ReturnType<GitHubClient["rest"]["repos"]["listCommits"]>
>["data"][number];

export type GitHubService = {
  listRepos: () => Promise<RepositorySummary[]>;
  listBranches: (owner: string, repo: string) => Promise<BranchSummary[]>;
  listCommits: (
    owner: string,
    repo: string,
    branch: string,
  ) => Promise<CommitSummary[]>;
  getNormalizedCommit: (
    owner: string,
    repo: string,
    ref: string,
  ) => Promise<CommitNormalized>;
};

export function createGitHubService(githubToken: string): GitHubService {
  const octokit = new Octokit({ auth: githubToken });

  return {
    async listRepos() {
      ensureGitHubToken(githubToken);

      try {
        const response = await octokit.rest.repos.listForAuthenticatedUser({
          sort: "updated",
          direction: "desc",
          per_page: 100,
        });

        return response.data.map(normalizeRepo);
      } catch (error) {
        throw mapGitHubError(error);
      }
    },

    async listBranches(owner, repo) {
      ensureGitHubToken(githubToken);

      try {
        const response = await octokit.rest.repos.listBranches({
          owner,
          repo,
          per_page: 100,
        });

        return response.data.map(normalizeBranch);
      } catch (error) {
        throw mapGitHubError(error);
      }
    },

    async listCommits(owner, repo, branch) {
      ensureGitHubToken(githubToken);

      try {
        const response = await octokit.rest.repos.listCommits({
          owner,
          repo,
          sha: branch,
          per_page: 30,
        });

        return response.data.map(normalizeCommitSummary);
      } catch (error) {
        throw mapGitHubError(error);
      }
    },

    async getNormalizedCommit(owner, repo, ref) {
      ensureGitHubToken(githubToken);

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

function ensureGitHubToken(githubToken: string): void {
  if (githubToken.trim() === "") {
    throw new ApiError(500, "GITHUB_AUTH", "GitHub 토큰을 확인해주세요");
  }
}

function normalizeRepo(repo: GitHubRepoData): RepositorySummary {
  return {
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner.login,
    defaultBranch: repo.default_branch,
    isPrivate: repo.private,
    updatedAt: repo.updated_at,
    description: repo.description,
  };
}

function normalizeBranch(branch: GitHubBranchData): BranchSummary {
  return {
    name: branch.name,
    commitSha: branch.commit.sha,
  };
}

function normalizeCommitSummary(commit: GitHubCommitListData): CommitSummary {
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
