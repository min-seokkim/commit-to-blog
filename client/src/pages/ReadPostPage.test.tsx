import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { ToastProvider } from "../components/Toast";
import { mockPublishedPost, seedPosts } from "../test/handlers";

import EditPostPage from "./EditPostPage";
import ReadPostPage from "./ReadPostPage";

function renderAt(path: string) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/post/:id" element={<ReadPostPage />} />
          <Route path="/post/:id/edit" element={<EditPostPage />} />
          <Route path="/saved" element={<div>saved list</div>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe("ReadPostPage", () => {
  it("renders the published post body next to its commit files", async () => {
    seedPosts([mockPublishedPost]);

    renderAt(`/post/${mockPublishedPost.id}`);

    expect(await screen.findByText("토스트 시스템 추가")).toBeInTheDocument();
    expect(screen.getByText("main")).toBeInTheDocument();
    expect(
      screen.getByText("전역 토스트로 요청 결과를 명확하게 안내합니다."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "client/src/components/Toast/ToastProvider.tsx",
      ),
    ).toBeInTheDocument();
    const patchSection = screen.getByLabelText("원본 변경");
    expect(patchSection.textContent).toContain(
      "+export function ToastProvider() {}",
    );
    expect(patchSection.textContent).toContain("-const old = true;");
    expect(patchSection.textContent).toContain("@@ -1,3 +1,5 @@");
  });

  it("navigates to edit when 편집 is clicked", async () => {
    seedPosts([mockPublishedPost]);

    renderAt(`/post/${mockPublishedPost.id}`);

    fireEvent.click(await screen.findByRole("button", { name: "편집" }));

    await waitFor(() =>
      expect(screen.getByLabelText("제목")).toBeInTheDocument(),
    );
  });

  it("shows the empty diff message when commitFiles is missing", async () => {
    seedPosts([
      {
        ...mockPublishedPost,
        commitFiles: undefined,
      },
    ]);

    renderAt(`/post/${mockPublishedPost.id}`);

    expect(
      await screen.findByText("원본 변경 정보가 없습니다"),
    ).toBeInTheDocument();
  });
});
