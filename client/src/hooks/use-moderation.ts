import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// Reviews
export function useReviews(status: string = 'pending') {
  return useQuery({
    queryKey: [api.moderation.reviews.list.path, status],
    queryFn: async () => {
      const url = new URL(api.moderation.reviews.list.path, window.location.origin);
      url.searchParams.set("status", status);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return api.moderation.reviews.list.responses[200].parse(await res.json());
    },
  });
}

export function useReviewAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'approved' | 'rejected' }) => {
      const url = buildUrl(api.moderation.reviews.action.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update review");
      return api.moderation.reviews.action.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.moderation.reviews.list.path] });
    },
  });
}

// Photos
export function usePhotos(status: string = 'pending') {
  return useQuery({
    queryKey: [api.moderation.photos.list.path, status],
    queryFn: async () => {
      const url = new URL(api.moderation.photos.list.path, window.location.origin);
      url.searchParams.set("status", status);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch photos");
      return api.moderation.photos.list.responses[200].parse(await res.json());
    },
  });
}

export function usePhotoAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'approved' | 'rejected' }) => {
      const url = buildUrl(api.moderation.photos.action.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update photo");
      return api.moderation.photos.action.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.moderation.photos.list.path] });
    },
  });
}
