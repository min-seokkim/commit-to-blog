import { requestData } from "./client";

import type {
  BranchSummary,
  CommitNormalized,
  CommitSummary,
  CreatePostInput,
  LLMDraft,
  Post,
  RepositorySummary,
  SettingsSummary,
  UpdatePostInput,
} from "../types/commit";

export function getRepos(): Promise<RepositorySummary[]> {
  return requestData<RepositorySummary[]>("/api/repos");
}

export function getBranches(repo: string): Promise<BranchSummary[]> {
  return requestData<BranchSummary[]>(
    `/api/branches?repo=${encodeURIComponent(repo)}`,
  );
}

export function getCommits(
  repo: string,
  branch: string,
): Promise<CommitSummary[]> {
  const params = new URLSearchParams({ repo, branch });

  return requestData<CommitSummary[]>(`/api/commits?${params.toString()}`);
}

export function getCommitDetail(
  repo: string,
  sha: string,
): Promise<CommitNormalized> {
  const params = new URLSearchParams({ repo });

  return requestData<CommitNormalized>(
    `/api/commits/${encodeURIComponent(sha)}?${params.toString()}`,
  );
}

export function generateSummary(commit: CommitNormalized): Promise<LLMDraft> {
  return requestData<LLMDraft>("/api/summary", {
    method: "POST",
    body: JSON.stringify(commit),
  });
}

export function getPosts(): Promise<Post[]> {
  return requestData<Post[]>("/api/posts");
}

export function getPost(id: string): Promise<Post> {
  return requestData<Post>(`/api/posts/${encodeURIComponent(id)}`);
}

export function savePost(input: CreatePostInput): Promise<Post> {
  return requestData<Post>("/api/posts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updatePost(id: string, input: UpdatePostInput): Promise<Post> {
  return requestData<Post>(`/api/posts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deletePost(id: string): Promise<{ id: string }> {
  return requestData<{ id: string }>(`/api/posts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getSettings(): Promise<SettingsSummary> {
  return requestData<SettingsSummary>("/api/settings");
}
