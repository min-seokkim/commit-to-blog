import { Link, useNavigate } from "react-router";

import type { Post, PostStatus } from "../types/commit";

import PinnedSurface, { type PinnedSurfaceRotate } from "./PinnedSurface";
import SecondaryButton from "./SecondaryButton";
import WaxSealButton from "./WaxSealButton";
import styles from "./PostCard.module.css";

type PostCardProps = {
  post: Post;
  index: number;
  onPublish: (post: Post) => void;
  onDelete: (post: Post) => void;
  publishing: boolean;
  deleting: boolean;
};

const ROTATES: PinnedSurfaceRotate[] = ["a", "b", "c", "d"];

const STATUS_DISPLAY: Record<PostStatus, string> = {
  draft: "초안",
  published: "PUBLISHED",
};

function PostCard({
  post,
  index,
  onPublish,
  onDelete,
  publishing,
  deleting,
}: PostCardProps) {
  const navigate = useNavigate();
  const branchVariant = getBranchVariant(post.branch);
  const rotate = ROTATES[index % ROTATES.length];

  return (
    <PinnedSurface rotate={rotate}>
      <div className={styles["post-card"]}>
        <div className={styles["post-card__meta-row"]}>
          <span
            className={`${styles["post-card__branch"]} ${styles[`post-card__branch--${branchVariant}`]}`}
          >
            {post.branch}
          </span>
          <span className={styles["post-card__date"]}>
            {formatDate(post.commitDate)}
          </span>
        </div>

        <div className={styles["post-card__thumbnail"]} aria-hidden="true" />

        {post.status === "published" ? (
          <Link
            to={`/post/${post.id}`}
            className={styles["post-card__title-link"]}
          >
            <h2 className={styles["post-card__title"]}>{post.title}</h2>
          </Link>
        ) : (
          <h2 className={styles["post-card__title"]}>{post.title}</h2>
        )}
        <p className={styles["post-card__summary"]}>{post.summary}</p>

        {post.status === "published" ? (
          <span className={styles["post-card__stamp"]}>
            {STATUS_DISPLAY.published}
          </span>
        ) : null}

        <div className={styles["post-card__actions"]}>
          <SecondaryButton onClick={() => navigate(`/post/${post.id}/edit`)}>
            편집
          </SecondaryButton>
          <SecondaryButton
            disabled={deleting}
            onClick={() => onDelete(post)}
          >
            삭제
          </SecondaryButton>
          <WaxSealButton
            compact
            disabled={publishing || post.status === "published"}
            onClick={() => onPublish(post)}
          >
            발행
          </WaxSealButton>
        </div>
      </div>
    </PinnedSurface>
  );
}

function getBranchVariant(branch: string): "main" | "develop" | "feature" {
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

export default PostCard;
