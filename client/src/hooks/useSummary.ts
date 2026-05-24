import { useState } from "react";

import { generateSummary } from "../api/smartBlog";
import type { CommitNormalized, LLMDraft } from "../types/commit";

export type UseGenerateSummaryState = {
  summary: LLMDraft | null;
  loading: boolean;
  error: string | null;
  generate: (commit: CommitNormalized) => Promise<LLMDraft | null>;
  reset: () => void;
};

export function useGenerateSummary(): UseGenerateSummaryState {
  const [summary, setSummary] = useState<LLMDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(commit: CommitNormalized): Promise<LLMDraft | null> {
    setLoading(true);
    setError(null);

    try {
      const nextSummary = await generateSummary(commit);
      setSummary(nextSummary);
      return nextSummary;
    } catch (errorValue) {
      setError(
        errorValue instanceof Error
          ? errorValue.message
          : "요약 생성에 실패했습니다",
      );
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    summary,
    loading,
    error,
    generate,
    reset: () => {
      setSummary(null);
      setError(null);
    },
  };
}
