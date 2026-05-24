import { useEffect, useState } from "react";

export type UseFetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useFetch<T>(
  load: (() => Promise<T>) | null,
  dependencies: readonly unknown[],
): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(load !== null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (load === null) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isActive = true;

    setLoading(true);
    setError(null);

    load()
      .then((nextData) => {
        if (isActive) {
          setData(nextData);
        }
      })
      .catch((errorValue: unknown) => {
        if (isActive) {
          setError(
            errorValue instanceof Error
              ? errorValue.message
              : "요청에 실패했습니다",
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [...dependencies, refreshKey]);

  return {
    data,
    loading,
    error,
    refetch: () => setRefreshKey((currentKey) => currentKey + 1),
  };
}
