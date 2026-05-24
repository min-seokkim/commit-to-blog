import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import PinnedSurface from "../components/PinnedSurface";
import PostEditor from "../components/PostEditor";
import SecondaryButton from "../components/SecondaryButton";
import WaxSealButton from "../components/WaxSealButton";
import {
  useBranches,
  useCommitDetail,
  useCommits,
  useRepos,
} from "../hooks/useGitHubData";
import { useSavePost } from "../hooks/usePosts";
import { useGenerateSummary } from "../hooks/useSummary";
import type { CommitSummary, LLMDraft } from "../types/commit";

import styles from "./MyBlogPage.module.css";

const EMPTY_DRAFT: LLMDraft = {
  title: "",
  summary: "",
  body: "",
};

function MyBlogPage() {
  const navigate = useNavigate();
  const repos = useRepos();
  const [repoInput, setRepoInput] = useState("");
  const selectedRepo = useMemo(
    () => repos.data?.find((repo) => repo.fullName === repoInput) ?? null,
    [repoInput, repos.data],
  );
  const repoForFetch =
    selectedRepo?.fullName ?? (repoInput.includes("/") ? repoInput : null);
  const branches = useBranches(repoForFetch);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const commits = useCommits(repoForFetch, selectedBranch);
  const [selectedSha, setSelectedSha] = useState<string | null>(null);
  const selectedCommitDetail = useCommitDetail(repoForFetch, selectedSha);
  const summary = useGenerateSummary();
  const savePost = useSavePost();
  const [draft, setDraft] = useState<LLMDraft>(EMPTY_DRAFT);
  const [pendingGenerateSha, setPendingGenerateSha] = useState<string | null>(
    null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (repoInput === "" && repos.data !== null && repos.data.length > 0) {
      setRepoInput(repos.data[0].fullName);
    }
  }, [repoInput, repos.data]);

  useEffect(() => {
    setSelectedBranch(null);
    setSelectedSha(null);
    setDraft(EMPTY_DRAFT);
  }, [repoForFetch]);

  useEffect(() => {
    if (branches.data === null || branches.data.length === 0) {
      return;
    }

    const defaultBranch = selectedRepo?.defaultBranch;
    const branchNames = branches.data.map((branch) => branch.name);

    if (selectedBranch !== null && branchNames.includes(selectedBranch)) {
      return;
    }

    setSelectedBranch(
      defaultBranch !== undefined && branchNames.includes(defaultBranch)
        ? defaultBranch
        : branches.data[0].name,
    );
  }, [branches.data, selectedBranch, selectedRepo]);

  useEffect(() => {
    if (commits.data === null || commits.data.length === 0) {
      return;
    }

    if (
      selectedSha !== null &&
      commits.data.some((commit) => commit.sha === selectedSha)
    ) {
      return;
    }

    setSelectedSha(commits.data[0].sha);
  }, [commits.data, selectedSha]);

  useEffect(() => {
    if (
      pendingGenerateSha === null ||
      selectedCommitDetail.data === null ||
      selectedCommitDetail.data.sha !== pendingGenerateSha ||
      summary.loading
    ) {
      return;
    }

    setPendingGenerateSha(null);
    void summary.generate(selectedCommitDetail.data).then((nextDraft) => {
      if (nextDraft !== null) {
        setDraft(nextDraft);
      }
    });
  }, [pendingGenerateSha, selectedCommitDetail.data, summary]);

  function updateDraft(field: keyof LLMDraft, value: string) {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  }

  function selectCommit(commit: CommitSummary) {
    setSelectedSha(commit.sha);
    setPendingGenerateSha(null);
  }

  function generateForCommit(commit: CommitSummary) {
    setNotice(null);
    setSelectedSha(commit.sha);
    setPendingGenerateSha(commit.sha);
  }

  async function saveDraft() {
    if (
      repoForFetch === null ||
      selectedBranch === null ||
      selectedCommitDetail.data === null
    ) {
      setNotice("저장할 커밋을 먼저 선택해주세요");
      return;
    }

    const savedPost = await savePost.save({
      ...draft,
      repoName: repoForFetch,
      branch: selectedBranch,
      commitSha: selectedCommitDetail.data.sha,
      commitAuthor: selectedCommitDetail.data.author,
      commitDate: selectedCommitDetail.data.date,
    });

    if (savedPost !== null) {
      navigate("/saved");
    }
  }

  const pageError =
    repos.error ??
    branches.error ??
    commits.error ??
    selectedCommitDetail.error ??
    notice;

  return (
    <div className={styles["my-blog-page"]}>
      <aside className={styles["my-blog-page__aside"]}>
        <div className={styles["my-blog-page__field"]}>
          <label
            className={styles["my-blog-page__label"]}
            htmlFor="repo-select"
          >
            저장소
          </label>
          <select
            id="repo-select"
            className={styles["my-blog-page__input"]}
            value={repoInput}
            disabled={repos.loading || repos.data === null}
            onChange={(event) => setRepoInput(event.currentTarget.value)}
          >
            {repos.data?.map((repo) => (
              <option key={repo.fullName} value={repo.fullName}>
                {repo.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className={styles["my-blog-page__field"]}>
          <label
            className={styles["my-blog-page__label"]}
            htmlFor="branch-select"
          >
            브랜치
          </label>
          <select
            id="branch-select"
            className={styles["my-blog-page__input"]}
            value={selectedBranch ?? ""}
            disabled={branches.loading || branches.data === null}
            onChange={(event) => {
              setSelectedBranch(event.currentTarget.value);
              setSelectedSha(null);
            }}
          >
            {branches.data?.map((branch) => (
              <option key={branch.name} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles["my-blog-page__commits"]}>
          <p className={styles["my-blog-page__label"]}>최근 커밋</p>
          {commits.loading ? (
            <p className={styles["my-blog-page__muted"]}>
              커밋을 불러오는 중...
            </p>
          ) : null}
          {commits.data?.map((commit, index) => (
            <PinnedSurface
              key={commit.sha}
              variant="memo"
              rotate={index % 2 === 0 ? "a" : "b"}
              pin={index % 2 === 0 ? "left" : "right"}
              className={
                selectedSha === commit.sha
                  ? styles["my-blog-page__commit--selected"]
                  : ""
              }
            >
              <button
                className={styles["my-blog-page__commit-button"]}
                type="button"
                onClick={() => selectCommit(commit)}
              >
                <span className={styles["my-blog-page__commit-sha"]}>
                  {commit.shortSha}
                </span>
                <span className={styles["my-blog-page__commit-message"]}>
                  {firstLine(commit.message)}
                </span>
                <span className={styles["my-blog-page__commit-meta"]}>
                  {commit.author} · {formatDate(commit.date)}
                </span>
              </button>
              <WaxSealButton
                compact
                disabled={summary.loading && pendingGenerateSha === commit.sha}
                onClick={() => generateForCommit(commit)}
              >
                생성하기
              </WaxSealButton>
            </PinnedSurface>
          ))}
        </div>
      </aside>

      <section className={styles["my-blog-page__main"]}>
        {pageError !== null ? (
          <p className={styles["my-blog-page__error"]} role="alert">
            {pageError}
          </p>
        ) : null}

        <PinnedSurface variant="large" rotate="c" pin="right">
          <div className={styles["my-blog-page__commit-detail"]}>
            <p className={styles["my-blog-page__label"]}>선택한 커밋</p>
            {selectedCommitDetail.data !== null ? (
              <>
                <span className={styles["my-blog-page__sha-badge"]}>
                  {selectedCommitDetail.data.shortSha}
                </span>
                <h1 className={styles["my-blog-page__heading"]}>
                  {firstLine(selectedCommitDetail.data.message)}
                </h1>
                <p className={styles["my-blog-page__muted"]}>
                  {selectedCommitDetail.data.author} ·{" "}
                  {formatDate(selectedCommitDetail.data.date)}
                </p>
                <p className={styles["my-blog-page__stats"]}>
                  +{selectedCommitDetail.data.stats.additions} / -
                  {selectedCommitDetail.data.stats.deletions} / 총{" "}
                  {selectedCommitDetail.data.stats.total}
                </p>
              </>
            ) : (
              <p className={styles["my-blog-page__muted"]}>
                검토할 커밋을 선택하세요.
              </p>
            )}
          </div>
        </PinnedSurface>

        <PinnedSurface variant="letter" rotate="d" pin="left">
          <PostEditor
            value={draft}
            onChange={updateDraft}
            actions={
              <>
                <SecondaryButton onClick={() => navigate("/saved")}>
                  취소
                </SecondaryButton>
                <WaxSealButton
                  disabled={
                    savePost.loading ||
                    draft.title.trim() === "" ||
                    draft.summary.trim() === "" ||
                    draft.body.trim() === ""
                  }
                  onClick={saveDraft}
                >
                  저장
                </WaxSealButton>
              </>
            }
          />
        </PinnedSurface>
      </section>
    </div>
  );
}

function firstLine(value: string): string {
  return value.split("\n")[0];
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default MyBlogPage;
