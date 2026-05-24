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
