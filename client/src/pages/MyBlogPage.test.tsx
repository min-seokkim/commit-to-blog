import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { ToastProvider } from "../components/Toast";
import {
  mockBranch,
  mockCommitSummary,
  mockDraft,
  mockRepo,
  savedPostRequests,
} from "../test/handlers";

import MyBlogPage from "./MyBlogPage";

describe("MyBlogPage", () => {
  it("selects repository data, generates a draft, and saves it", async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <MyBlogPage />
        </MemoryRouter>
      </ToastProvider>,
    );

    const repoInput = await screen.findByLabelText("Repository");
    await waitFor(() => expect(repoInput).toHaveValue(mockRepo.fullName));

    await waitFor(() =>
      expect(screen.getByLabelText("Branch")).toHaveValue(mockBranch.name),
    );

    fireEvent.click(await screen.findByText(mockCommitSummary.message));
    fireEvent.click(await screen.findByRole("button", { name: "Generate" }));

    await waitFor(() =>
      expect(screen.getByLabelText("Title")).toHaveValue(mockDraft.title),
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(savedPostRequests).toHaveLength(1));

    expect(savedPostRequests[0]).toMatchObject({
      title: mockDraft.title,
      repoName: mockRepo.fullName,
      branch: mockBranch.name,
      commitSha: mockCommitSummary.sha,
    });
  });
});
