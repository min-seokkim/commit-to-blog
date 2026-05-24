import {
  getBranches,
  getCommitDetail,
  getCommits,
  getRepos,
} from "../api/smartBlog";
import type { BranchSummary, CommitNormalized, CommitSummary, RepositorySummary } from "../types/commit";

import { useFetch, type UseFetchState } from "./useFetch";

export function useRepos(): UseFetchState<RepositorySummary[]> {
  return useFetch(getRepos, []);
}

export function useBranches(
  repo: string | null,
): UseFetchState<BranchSummary[]> {
  return useFetch(repo === null ? null : () => getBranches(repo), [repo]);
}

export function useCommits(
  repo: string | null,
  branch: string | null,
): UseFetchState<CommitSummary[]> {
  return useFetch(
    repo === null || branch === null ? null : () => getCommits(repo, branch),
    [repo, branch],
  );
}

export function useCommitDetail(
  repo: string | null,
  sha: string | null,
): UseFetchState<CommitNormalized> {
  return useFetch(
    repo === null || sha === null ? null : () => getCommitDetail(repo, sha),
    [repo, sha],
  );
}
