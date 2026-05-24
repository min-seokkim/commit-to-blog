import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ToastProvider } from "../components/Toast";
import { mockCommitDetail, mockDraft } from "../test/handlers";

import { useGenerateSummary } from "./useSummary";

describe("useGenerateSummary", () => {
  it("generates a draft through the summary mutation", async () => {
    const { result } = renderHook(() => useGenerateSummary(), {
      wrapper: ToastProvider,
    });

    await act(async () => {
      await result.current.generate(mockCommitDetail);
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary).toEqual(mockDraft);
    expect(result.current.error).toBeNull();
  });
});
