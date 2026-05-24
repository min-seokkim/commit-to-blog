import { useNavigate } from "react-router";

import PostCard from "../components/PostCard";
import WaxSealButton from "../components/WaxSealButton";
import { useDeletePost, usePosts, useUpdatePost } from "../hooks/usePosts";
import type { Post } from "../types/commit";

import styles from "./SavedPostsPage.module.css";

function SavedPostsPage() {
  const navigate = useNavigate();
  const posts = usePosts();
  const updatePost = useUpdatePost();
  const deletePostMutation = useDeletePost();

  async function publish(post: Post) {
    const updated = await updatePost.update(post.id, { status: "published" });

    if (updated !== null) {
      posts.refetch();
    }
  }

  async function remove(post: Post) {
    if (!window.confirm("이 글을 삭제할까요?")) {
      return;
    }

    const removed = await deletePostMutation.remove(post.id);

    if (removed) {
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
            deleting={deletePostMutation.loading}
            onPublish={publish}
            onDelete={remove}
          />
        ))}
      </div>
    </section>
  );
}

export default SavedPostsPage;
