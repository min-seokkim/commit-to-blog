import { useState } from "react";

import { getPost, getPosts, savePost, updatePost } from "../api/smartBlog";
import { useToast } from "../components/Toast";
import type { CreatePostInput, Post, UpdatePostInput } from "../types/commit";

import { useFetch, type UseFetchState } from "./useFetch";

export function usePosts(): UseFetchState<Post[]> {
  return useFetch(getPosts, []);
}

export function usePost(id: string | null): UseFetchState<Post> {
  return useFetch(id === null ? null : () => getPost(id), [id]);
}

export type SavePostState = {
  save: (input: CreatePostInput) => Promise<Post | null>;
  loading: boolean;
  error: string | null;
};

export function useSavePost(): SavePostState {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(input: CreatePostInput): Promise<Post | null> {
    setLoading(true);
    setError(null);

    try {
      const post = await savePost(input);
      showToast("저장했습니다");
      return post;
    } catch (errorValue) {
      const message =
        errorValue instanceof Error ? errorValue.message : "저장에 실패했습니다";
      setError(message);
      showToast(message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { save, loading, error };
}

export type UpdatePostState = {
  update: (id: string, input: UpdatePostInput) => Promise<Post | null>;
  loading: boolean;
  error: string | null;
};

export function useUpdatePost(): UpdatePostState {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(
    id: string,
    input: UpdatePostInput,
  ): Promise<Post | null> {
    setLoading(true);
    setError(null);

    try {
      const post = await updatePost(id, input);
      showToast("수정했습니다");
      return post;
    } catch (errorValue) {
      const message =
        errorValue instanceof Error
          ? errorValue.message
          : "수정에 실패했습니다";
      setError(message);
      showToast(message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { update, loading, error };
}
