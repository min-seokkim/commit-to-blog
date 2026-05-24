export type CommitStats = {
  additions: number;
  deletions: number;
  total: number;
};

export type CommitFile = {
  filename: string;
  patch: string;
};

export type CommitNormalized = {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  date: string;
  stats: CommitStats;
  files: CommitFile[];
};

export type LLMDraft = {
  title: string;
  summary: string;
  body: string;
};

export type CommitAnalysis = {
  intent: string;
  key_changes: string[];
  affected_areas: string[];
};

export type RepositorySummary = {
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  updatedAt: string | null;
  description: string | null;
};

export type BranchSummary = {
  name: string;
  commitSha: string;
};

export type CommitSummary = {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  date: string;
};

export type PostStatus = "draft" | "published";

export type Post = LLMDraft & {
  id: string;
  repoName: string;
  branch: string;
  commitSha: string;
  commitAuthor: string;
  commitDate: string;
  commitFiles?: CommitFile[];
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
};

export type DBSchema = {
  posts: Post[];
};

export type ApiSuccess<T> = {
  data: T;
};

export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
  };
};
