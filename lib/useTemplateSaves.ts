import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  createCandidateResourceSave,
  deleteCandidateResourceSave,
  fetchCandidateResourceSaves,
} from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { getMarketingSiteUrl } from "@/lib/config";

const SAVES_KEY = ["candidate", "resource-saves"];

export function useTemplateSaves(returnTo: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [failed, setFailed] = useState(false);

  const savesQuery = useQuery({
    queryKey: SAVES_KEY,
    queryFn: fetchCandidateResourceSaves,
    enabled: Boolean(token),
  });
  const saves = savesQuery.data?.data ?? [];
  const onSuccess = () => void queryClient.invalidateQueries({ queryKey: SAVES_KEY });
  const onError = () => setFailed(true);
  const saveMutation = useMutation({ mutationFn: createCandidateResourceSave, onSuccess, onError });
  const removeMutation = useMutation({ mutationFn: deleteCandidateResourceSave, onSuccess, onError });

  function isSaved(slug: string) {
    return saves.some((row) => row.resourceSlug === slug);
  }

  function toggle(slug: string, title: string) {
    setFailed(false);
    if (!token) {
      router.push({ pathname: "/login", params: { returnTo } });
      return;
    }
    const existing = saves.find((row) => row.resourceSlug === slug);
    if (existing) {
      removeMutation.mutate(existing.id ?? existing._id);
      return;
    }
    saveMutation.mutate({
      resourceSlug: slug,
      title,
      resourceUrl: `${getMarketingSiteUrl()}/resources/${encodeURIComponent(slug)}`,
    });
  }

  return {
    signedIn: Boolean(token),
    count: saves.length,
    isSaved,
    toggle,
    busy: saveMutation.isPending || removeMutation.isPending,
    failed,
  };
}
