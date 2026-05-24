import { useNavigate } from "react-router";

import PostCard from "../components/PostCard";
import WaxSealButton from "../components/WaxSealButton";
import { usePosts, useUpdatePost } from "../hooks/usePosts";
import type { Post } from "../types/commit";

import styles from "./SavedPostsPage.module.css";

function SavedPostsPage() {
  const navigate = useNavigate();
  const posts = usePosts();
  const updatePost = useUpdatePost();

  async function publish(post: Post) {
    const updated = await updatePost.update(post.id, { status: "published" });

    if (updated !== null) {
      posts.refetch();
    }
  }

  return (
    <section className={styles["saved-posts-page"]}>
      <div className={styles["saved-posts-page__header"]}>
        <div>
          <p className={styles["saved-posts-page__subtitle"]}>원고 보관함</p>
          <h1 className={styles["saved-posts-page__title"]}>저장된 글</h1>
        </div>
        <WaxSealButton onClick={() => navigate("/my-blog")}>
          새 글 쓰기
        </WaxSealButton>
      </div>

      {posts.error !== null ? (
        <p className={styles["saved-posts-page__error"]} role="alert">
          {posts.error}
        </p>
      ) : null}

      {posts.loading ? (
        <p className={styles["saved-posts-page__empty"]}>저장된 글을 불러오는 중...</p>
      ) : null}

      {posts.data !== null && posts.data.length === 0 ? (
        <p className={styles["saved-posts-page__empty"]}>
          아직 저장된 포스트가 없습니다…
        </p>
      ) : null}

      <div className={styles["saved-posts-page__grid"]}>
        {posts.data?.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            index={index}
            publishing={updatePost.loading}
            onPublish={publish}
          />
        ))}
      </div>
    </section>
  );
}

export default SavedPostsPage;
