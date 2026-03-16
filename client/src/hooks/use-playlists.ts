import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertPlaylist } from "../../../server/shared/schema";
import { getApiUrl } from "@/lib/api";

export function usePlaylists(status?: string) {
  return useQuery({
    queryKey: [api.playlists.list.path, status],
    queryFn: async () => {
      const url = new URL(getApiUrl(api.playlists.list.path));
      if (status) url.searchParams.set("status", status);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch playlists");
      return api.playlists.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPlaylist) => {
      const res = await fetch(getApiUrl(api.playlists.create.path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create playlist");
      return api.playlists.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.playlists.list.path] });
    },
  });
}

export function useUpdatePlaylistStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'approved' | 'rejected' | 'pending' }) => {
      const url = getApiUrl(buildUrl(api.playlists.updateStatus.path, { id }));
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.playlists.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.playlists.list.path] });
    },
  });
}
