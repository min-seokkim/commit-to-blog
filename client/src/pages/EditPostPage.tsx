import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import PinnedSurface from "../components/PinnedSurface";
import PostEditor from "../components/PostEditor";
import SecondaryButton from "../components/SecondaryButton";
import WaxSealButton from "../components/WaxSealButton";
import { usePost, useUpdatePost } from "../hooks/usePosts";
import type { LLMDraft } from "../types/commit";

import styles from "./EditPostPage.module.css";

const EMPTY_DRAFT: LLMDraft = {
  title: "",
  summary: "",
  body: "",
};

function EditPostPage() {
  const params = useParams();
  const navigate = useNavigate();
  const post = usePost(params.id ?? null);
  const updatePost = useUpdatePost();
  const [draft, setDraft] = useState<LLMDraft>(EMPTY_DRAFT);

  useEffect(() => {
    if (post.data !== null) {
      setDraft({
        title: post.data.title,
        summary: post.data.summary,
        body: post.data.body,
      });
    }
  }, [post.data]);

  function updateDraft(field: keyof LLMDraft, value: string) {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  }

  async function save() {
    if (post.data === null) {
      return;
    }

    const updated = await updatePost.update(post.data.id, draft);

    if (updated !== null) {
      navigate("/saved");
    }
  }

  return (
    <section className={styles["edit-post-page"]}>
      <div className={styles["edit-post-page__header"]}>
        <p className={styles["edit-post-page__subtitle"]}>저장된 초안</p>
        <h1 className={styles["edit-post-page__title"]}>글 편집</h1>
      </div>

      {post.error !== null ? (
        <p className={styles["edit-post-page__error"]} role="alert">
          {post.error}
        </p>
      ) : null}

      {post.loading ? (
        <p className={styles["edit-post-page__muted"]}>글을 불러오는 중...</p>
      ) : null}

      <PinnedSurface variant="letter" rotate="b">
        <PostEditor
          value={draft}
          onChange={updateDraft}
          eyebrow={post.data?.repoName ?? "글 편집기"}
          title={post.data?.title ?? "초안 편집"}
          actions={
            <>
              <SecondaryButton onClick={() => navigate("/saved")}>
                취소
              </SecondaryButton>
              <WaxSealButton disabled={updatePost.loading} onClick={save}>
                저장
              </WaxSealButton>
            </>
          }
        />
      </PinnedSurface>
    </section>
  );
}

export default EditPostPage;
