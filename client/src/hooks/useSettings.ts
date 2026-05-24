import { getSettings } from "../api/smartBlog";
import type { SettingsSummary } from "../types/commit";

import { useFetch, type UseFetchState } from "./useFetch";

export function useSettings(): UseFetchState<SettingsSummary> {
  return useFetch(getSettings, []);
}
