import { http, HttpResponse } from "msw";

import type {
  BranchSummary,
  CommitNormalized,
  CommitSummary,
  CreatePostInput,
  LLMDraft,
  Post,
  RepositorySummary,
} from "../types/commit";

export const mockRepo: RepositorySummary = {
  name: "smart-blog",
  fullName: "min-seokkim/smart-blog",
  owner: "min-seokkim",
  defaultBranch: "main",
  isPrivate: false,
  updatedAt: "2026-05-24T00:00:00.000Z",
  description: "Smart Blog test repo",
};

export const mockBranch: BranchSummary = {
  name: "main",
  commitSha: "abcdef1234567890",
};

export const mockCommitSummary: CommitSummary = {
  sha: "abcdef1234567890",
  shortSha: "abcdef1",
  message: "Add toast system",
  author: "Minseok",
  date: "2026-05-24T00:00:00.000Z",
};

export const mockCommitDetail: CommitNormalized = {
  ...mockCommitSummary,
  stats: {
    additions: 42,
    deletions: 7,
    total: 49,
  },
  files: [
    {
      filename: "client/src/components/Toast/ToastProvider.tsx",
      patch: "+export function ToastProvider() {}",
    },
  ],
};

export const mockDraft: LLMDraft = {
  title: "토스트 시스템 추가",
  summary: "전역 토스트로 요청 결과를 명확하게 안내합니다.",
  body: "전역 `ToastProvider`를 추가해 저장, 수정, 요약 생성 결과를 화면 상단에서 안내하도록 개선했습니다. API 오류 코드는 한국어 메시지로 변환되어 사용자가 실패 원인을 더 쉽게 이해할 수 있습니다.",
};

export const savedPostRequests: CreatePostInput[] = [];

let posts: Post[] = [];

export function resetTestState() {
  savedPostRequests.length = 0;
  posts = [];
}

export const handlers = [
  http.get("http://localhost:3000/api/repos", () =>
    HttpResponse.json({ data: [mockRepo] }),
  ),

  http.get("http://localhost:3000/api/branches", () =>
    HttpResponse.json({ data: [mockBranch] }),
  ),

  http.get("http://localhost:3000/api/commits", () =>
    HttpResponse.json({ data: [mockCommitSummary] }),
  ),

  http.get("http://localhost:3000/api/commits/:sha", () =>
    HttpResponse.json({ data: mockCommitDetail }),
  ),

  http.post("http://localhost:3000/api/summary", () =>
    HttpResponse.json({ data: mockDraft }),
  ),

  http.get("http://localhost:3000/api/posts", () =>
    HttpResponse.json({ data: posts }),
  ),

  http.get("http://localhost:3000/api/posts/:id", ({ params }) => {
    const post = posts.find((candidate) => candidate.id === params.id);

    if (post === undefined) {
      return HttpResponse.json(
        { error: { code: "NOT_FOUND", message: "not found" } },
        { status: 404 },
      );
    }

    return HttpResponse.json({ data: post });
  }),

  http.post("http://localhost:3000/api/posts", async ({ request }) => {
    const input = (await request.json()) as CreatePostInput;
    const post: Post = {
      ...input,
      id: "post-1",
      status: "draft",
      createdAt: "2026-05-24T00:00:00.000Z",
      updatedAt: "2026-05-24T00:00:00.000Z",
    };

    savedPostRequests.push(input);
    posts = [post];

    return HttpResponse.json({ data: post }, { status: 201 });
  }),

  http.patch("http://localhost:3000/api/posts/:id", async ({ request }) => {
    const patch = (await request.json()) as Partial<Post>;
    const currentPost = posts[0];
    const post: Post = {
      ...currentPost,
      ...patch,
      updatedAt: "2026-05-24T00:00:01.000Z",
    };

    posts = [post];

    return HttpResponse.json({ data: post });
  }),

  http.get("http://localhost:3000/api/settings", () =>
    HttpResponse.json({
      data: {
        llmModel: "gpt-4o-mini",
        githubToken: "configured",
        openaiKey: "configured",
        clientOrigin: "http://localhost:5173",
        port: 3000,
      },
    }),
  ),
];
