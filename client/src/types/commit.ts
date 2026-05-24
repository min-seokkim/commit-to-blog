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
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreatePostInput = LLMDraft & {
  repoName: string;
  branch: string;
  commitSha: string;
  commitAuthor: string;
  commitDate: string;
};

export type UpdatePostInput = Partial<
  Pick<Post, "title" | "summary" | "body" | "status">
>;

export type SettingsSummary = {
  llmModel: string;
  githubToken: "configured" | "missing";
  openaiKey: "configured" | "missing";
  clientOrigin: string;
  port: number;
};
