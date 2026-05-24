import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFetch } from "./useFetch";

describe("useFetch", () => {
  it("loads data successfully", async () => {
    const { result } = renderHook(() =>
      useFetch(async () => "loaded", []),
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBe("loaded");
    expect(result.current.error).toBeNull();
  });

  it("keeps loading state before a pending request resolves", () => {
    const { result } = renderHook(() =>
      useFetch(() => new Promise<string>(() => undefined), []),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it("stores an error message when loading fails", async () => {
    const { result } = renderHook(() =>
      useFetch<string>(async () => {
        throw new Error("boom");
      }, []),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("boom");
  });
});
