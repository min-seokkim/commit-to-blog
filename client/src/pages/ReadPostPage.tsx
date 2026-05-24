import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router";

import PinnedSurface from "../components/PinnedSurface";
import SecondaryButton from "../components/SecondaryButton";
import { usePost } from "../hooks/usePosts";
import type { CommitFile } from "../types/commit";

import styles from "./ReadPostPage.module.css";

type BranchVariant = "main" | "develop" | "feature";

function ReadPostPage() {
  const params = useParams();
  const navigate = useNavigate();
  const post = usePost(params.id ?? null);

  useEffect(() => {
    if (post.data?.status === "draft") {
      navigate(`/post/${post.data.id}/edit`, { replace: true });
    }
  }, [post.data, navigate]);

  if (post.loading) {
    return (
      <p className={styles["read-post-page__muted"]}>글을 불러오는 중...</p>
    );
  }

  if (post.error !== null) {
    return (
      <p className={styles["read-post-page__error"]} role="alert">
        {post.error}
      </p>
    );
  }

  if (post.data === null || post.data.status === "draft") {
    return null;
  }

  const branchVariant = getBranchVariant(post.data.branch);
  const commitFiles = post.data.commitFiles ?? [];

  return (
    <article className={styles["read-post-page"]}>
      <div className={styles["read-post-page__grid"]}>
        <PinnedSurface variant="letter" rotate="b">
          <div className={styles["read-post-page__article"]}>
            <div className={styles["read-post-page__meta"]}>
              <span
                className={`${styles["read-post-page__branch"]} ${
                  styles[`read-post-page__branch--${branchVariant}`]
                }`}
              >
                {post.data.branch}
              </span>
              <span className={styles["read-post-page__date"]}>
                {formatDate(post.data.commitDate)}
              </span>
            </div>

            <h1 className={styles["read-post-page__title"]}>
              {post.data.title}
            </h1>
            <p className={styles["read-post-page__summary"]}>
              {post.data.summary}
            </p>

            <div className={styles["read-post-page__body"]}>
              <ReactMarkdown>{post.data.body}</ReactMarkdown>
            </div>
          </div>
        </PinnedSurface>

        <PinnedSurface variant="card" rotate="c">
          <section
            className={styles["read-post-page__patch"]}
            aria-label="원본 변경"
          >
            <h2 className={styles["read-post-page__patch-heading"]}>
              원본 변경
            </h2>

            {commitFiles.length === 0 ? (
              <p className={styles["read-post-page__empty"]}>
                원본 변경 정보가 없습니다
              </p>
            ) : (
              commitFiles.map((file) => (
                <PatchFile key={file.filename} file={file} />
              ))
            )}
          </section>
        </PinnedSurface>
      </div>

      <div className={styles["read-post-page__actions"]}>
        <SecondaryButton onClick={() => navigate("/saved")}>
          목록으로
        </SecondaryButton>
        <SecondaryButton
          onClick={() => navigate(`/post/${post.data!.id}/edit`)}
        >
          편집
        </SecondaryButton>
      </div>
    </article>
  );
}

function PatchFile({ file }: { file: CommitFile }) {
  return (
    <div className={styles["read-post-page__patch-file"]}>
      <h3 className={styles["read-post-page__filename"]}>{file.filename}</h3>
      {file.patch.trim() === "" ? (
        <p className={styles["read-post-page__muted"]}>(diff 누락)</p>
      ) : (
        <pre className={styles["read-post-page__patch-body"]}>
          {file.patch.split("\n").map((line, index) => (
            <span
              key={index}
              className={lineClassName(line)}
            >
              {line.length === 0 ? " " : line}
              {"\n"}
            </span>
          ))}
        </pre>
      )}
    </div>
  );
}

function lineClassName(line: string): string {
  const first = line.charAt(0);

  if (first === "+") {
    return `${styles["read-post-page__patch-line"]} ${styles["read-post-page__patch-line--add"]}`;
  }

  if (first === "-") {
    return `${styles["read-post-page__patch-line"]} ${styles["read-post-page__patch-line--remove"]}`;
  }

  if (first === "@") {
    return `${styles["read-post-page__patch-line"]} ${styles["read-post-page__patch-line--hunk"]}`;
  }

  return styles["read-post-page__patch-line"];
}

function getBranchVariant(branch: string): BranchVariant {
  if (branch === "main" || branch === "master") {
    return "main";
  }

  if (branch === "develop" || branch === "dev") {
    return "develop";
  }

  return "feature";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default ReadPostPage;
