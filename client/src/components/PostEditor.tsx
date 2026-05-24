import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";

import type { LLMDraft } from "../types/commit";

import styles from "./PostEditor.module.css";

type PostEditorProps = {
  value: LLMDraft;
  onChange: (field: keyof LLMDraft, value: string) => void;
  actions: ReactNode;
  eyebrow?: string;
  title?: string;
};

function PostEditor({
  value,
  onChange,
  actions,
  eyebrow = "AI draft",
  title = "Draft editor",
}: PostEditorProps) {
  return (
    <section className={styles["post-editor"]}>
      <div className={styles["post-editor__header"]}>
        <p className={styles["post-editor__eyebrow"]}>{eyebrow}</p>
        <h2 className={styles["post-editor__title"]}>{title}</h2>
      </div>

      <label className={styles["post-editor__field"]}>
        <span className={styles["post-editor__label"]}>Title</span>
        <textarea
          className={styles["post-editor__textarea"]}
          rows={2}
          value={value.title}
          onChange={(event) => onChange("title", event.currentTarget.value)}
        />
      </label>

      <label className={styles["post-editor__field"]}>
        <span className={styles["post-editor__label"]}>Summary</span>
        <textarea
          className={styles["post-editor__textarea"]}
          rows={4}
          value={value.summary}
          onChange={(event) => onChange("summary", event.currentTarget.value)}
        />
      </label>

      <label className={styles["post-editor__field"]}>
        <span className={styles["post-editor__label"]}>Body</span>
        <textarea
          className={`${styles["post-editor__textarea"]} ${styles["post-editor__textarea--body"]}`}
          rows={12}
          value={value.body}
          onChange={(event) => onChange("body", event.currentTarget.value)}
        />
      </label>

      <div className={styles["post-editor__preview"]}>
        <p className={styles["post-editor__label"]}>Markdown preview</p>
        <div className={styles["post-editor__preview-body"]}>
          <ReactMarkdown>{value.body}</ReactMarkdown>
        </div>
      </div>

      <div className={styles["post-editor__actions"]}>{actions}</div>
    </section>
  );
}

export default PostEditor;
