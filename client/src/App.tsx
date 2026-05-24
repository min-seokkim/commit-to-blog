import { useState } from "react";

import { fetchCommitTest, generateSummary } from "./api/thinSlice";
import type { LLMDraft } from "./types/commit";

function App() {
  const [draft, setDraft] = useState<LLMDraft | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const commit = await fetchCommitTest();
      const nextDraft = await generateSummary(commit);
      setDraft(nextDraft);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "요약 생성에 실패했습니다",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function updateDraftField(field: keyof LLMDraft, value: string) {
    setDraft((currentDraft) =>
      currentDraft === null
        ? currentDraft
        : {
            ...currentDraft,
            [field]: value,
          },
    );
  }

  return (
    <main>
      <h1>Smart Blog Thin Slice</h1>
      <button type="button" onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? "Generating..." : "Generate"}
      </button>

      {errorMessage !== null ? <p role="alert">{errorMessage}</p> : null}

      {draft !== null ? (
        <section>
          <label htmlFor="draft-title">Title</label>
          <br />
          <textarea
            id="draft-title"
            rows={2}
            cols={80}
            value={draft.title}
            onChange={(event) =>
              updateDraftField("title", event.currentTarget.value)
            }
          />
          <br />

          <label htmlFor="draft-summary">Summary</label>
          <br />
          <textarea
            id="draft-summary"
            rows={4}
            cols={80}
            value={draft.summary}
            onChange={(event) =>
              updateDraftField("summary", event.currentTarget.value)
            }
          />
          <br />

          <label htmlFor="draft-body">Body</label>
          <br />
          <textarea
            id="draft-body"
            rows={12}
            cols={80}
            value={draft.body}
            onChange={(event) =>
              updateDraftField("body", event.currentTarget.value)
            }
          />
        </section>
      ) : null}
    </main>
  );
}

export default App;
