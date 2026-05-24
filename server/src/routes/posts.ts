import { randomUUID } from "node:crypto";

import { Router } from "express";
import type { Low } from "lowdb";

import { ApiError, isRecord } from "../errors.js";
import type {
  ApiSuccess,
  CommitFile,
  DBSchema,
  Post,
  PostStatus,
} from "../types/commit.js";

export function createPostsRouter(db: Low<DBSchema>): Router {
  const router = Router();

  router.get("/posts", async (_request, response) => {
    await db.read();
    const payload: ApiSuccess<Post[]> = {
      data: [...db.data.posts].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      ),
    };

    response.json(payload);
  });

  router.get("/posts/:id", async (request, response) => {
    const post = await findPost(db, request.params.id);
    const payload: ApiSuccess<Post> = { data: post };

    response.json(payload);
  });

  router.post("/posts", async (request, response) => {
    const input = parseCreatePostPayload(request.body);
    const now = new Date().toISOString();
    const post: Post = {
      ...input,
      id: randomUUID(),
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    await db.read();
    db.data.posts.push(post);
    await db.write();

    const payload: ApiSuccess<Post> = { data: post };
    response.status(201).json(payload);
  });

  router.patch("/posts/:id", async (request, response) => {
    const patch = parseUpdatePostPayload(request.body);

    await db.read();
    const postIndex = db.data.posts.findIndex(
      (post) => post.id === request.params.id,
    );

    if (postIndex < 0) {
      throw new ApiError(404, "NOT_FOUND", "저장된 포스트를 찾을 수 없습니다");
    }

    const currentPost = db.data.posts[postIndex];
    const updatedPost: Post = {
      ...currentPost,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    db.data.posts[postIndex] = updatedPost;
    await db.write();

    const payload: ApiSuccess<Post> = { data: updatedPost };
    response.json(payload);
  });

  router.delete("/posts/:id", async (request, response) => {
    await db.read();
    const postIndex = db.data.posts.findIndex(
      (post) => post.id === request.params.id,
    );

    if (postIndex < 0) {
      throw new ApiError(404, "NOT_FOUND", "저장된 포스트를 찾을 수 없습니다");
    }

    db.data.posts.splice(postIndex, 1);
    await db.write();

    const payload: ApiSuccess<{ id: string }> = {
      data: { id: request.params.id },
    };
    response.json(payload);
  });

  return router;
}

async function findPost(db: Low<DBSchema>, id: string): Promise<Post> {
  await db.read();

  const post = db.data.posts.find((candidate) => candidate.id === id);

  if (post === undefined) {
    throw new ApiError(404, "NOT_FOUND", "저장된 포스트를 찾을 수 없습니다");
  }

  return post;
}

function parseCreatePostPayload(
  value: unknown,
): Omit<Post, "id" | "status" | "createdAt" | "updatedAt"> {
  if (!isRecord(value)) {
    throw new ApiError(400, "INVALID_POST_PAYLOAD", "포스트 형식이 올바르지 않습니다");
  }

  const title = readRequiredString(value, "title");
  const summary = readRequiredString(value, "summary");
  const body = readRequiredString(value, "body");
  const repoName = readRequiredString(value, "repoName");
  const branch = readRequiredString(value, "branch");
  const commitSha = readRequiredString(value, "commitSha");
  const commitAuthor = readRequiredString(value, "commitAuthor");
  const commitDate = readRequiredString(value, "commitDate");
  const commitFiles = parseCommitFiles(value.commitFiles);

  return {
    title,
    summary,
    body,
    repoName,
    branch,
    commitSha,
    commitAuthor,
    commitDate,
    ...(commitFiles !== undefined ? { commitFiles } : {}),
  };
}

function parseCommitFiles(value: unknown): CommitFile[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ApiError(
      400,
      "INVALID_POST_PAYLOAD",
      "commitFiles는 배열이어야 합니다",
    );
  }

  return value.map((entry, index) => {
    if (
      !isRecord(entry) ||
      typeof entry.filename !== "string" ||
      typeof entry.patch !== "string"
    ) {
      throw new ApiError(
        400,
        "INVALID_POST_PAYLOAD",
        `commitFiles[${index}] 형식이 올바르지 않습니다`,
      );
    }

    return { filename: entry.filename, patch: entry.patch };
  });
}

function parseUpdatePostPayload(
  value: unknown,
): Partial<Pick<Post, "title" | "summary" | "body" | "status">> {
  if (!isRecord(value)) {
    throw new ApiError(
      400,
      "INVALID_POST_PAYLOAD",
      "포스트 수정 형식이 올바르지 않습니다",
    );
  }

  const patch: Partial<Pick<Post, "title" | "summary" | "body" | "status">> = {};

  if ("title" in value) {
    patch.title = readRequiredString(value, "title");
  }

  if ("summary" in value) {
    patch.summary = readRequiredString(value, "summary");
  }

  if ("body" in value) {
    patch.body = readRequiredString(value, "body");
  }

  if ("status" in value) {
    patch.status = readStatus(value.status);
  }

  if (Object.keys(patch).length === 0) {
    throw new ApiError(
      400,
      "INVALID_POST_PAYLOAD",
      "수정할 필드가 필요합니다",
    );
  }

  return patch;
}

function readRequiredString(
  source: Record<string, unknown>,
  propertyName: string,
): string {
  const value = source[propertyName];

  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiError(
      400,
      "INVALID_POST_PAYLOAD",
      `${propertyName} 값이 필요합니다`,
    );
  }

  return value;
}

function readStatus(value: unknown): PostStatus {
  if (value === "draft" || value === "published") {
    return value;
  }

  throw new ApiError(
    400,
    "INVALID_POST_PAYLOAD",
    "status는 draft 또는 published여야 합니다",
  );
}
