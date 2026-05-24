import { useState } from "react";

import { generateSummary } from "../api/smartBlog";
import { useToast } from "../components/Toast";
import type { CommitNormalized, LLMDraft } from "../types/commit";

export type UseGenerateSummaryState = {
  summary: LLMDraft | null;
  loading: boolean;
  error: string | null;
  generate: (commit: CommitNormalized) => Promise<LLMDraft | null>;
  reset: () => void;
};

export function useGenerateSummary(): UseGenerateSummaryState {
  const { showToast } = useToast();
  const [summary, setSummary] = useState<LLMDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(commit: CommitNormalized): Promise<LLMDraft | null> {
    setLoading(true);
    setError(null);

    try {
      const nextSummary = await generateSummary(commit);
      setSummary(nextSummary);
      showToast("요약 초안을 생성했습니다");
      return nextSummary;
    } catch (errorValue) {
      const message =
        errorValue instanceof Error
          ? errorValue.message
          : "요약 생성에 실패했습니다";
      setError(message);
      showToast(message, "error");
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
