import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { Post } from "../types/commit";

import PostCard from "./PostCard";

const post: Post = {
  id: "post-1",
  title: "토스트 시스템 추가",
  summary: "요청 결과를 토스트로 보여줍니다.",
  body: "본문",
  repoName: "min-seokkim/smart-blog",
  branch: "main",
  commitSha: "abcdef1234567890",
  commitAuthor: "Minseok",
  commitDate: "2026-05-24T00:00:00.000Z",
  status: "draft",
  createdAt: "2026-05-24T00:00:00.000Z",
  updatedAt: "2026-05-24T00:00:00.000Z",
};

describe("PostCard", () => {
  it("renders post metadata and actions", () => {
    const onPublish = vi.fn();
    const onDelete = vi.fn();

    render(
      <MemoryRouter>
        <PostCard
          post={post}
          index={0}
          onPublish={onPublish}
          onDelete={onDelete}
          publishing={false}
          deleting={false}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("main")).toBeInTheDocument();
    expect(screen.getByText("토스트 시스템 추가")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "편집" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "발행" }));

    expect(onPublish).toHaveBeenCalledWith(post);

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(onDelete).toHaveBeenCalledWith(post);
  });
});
