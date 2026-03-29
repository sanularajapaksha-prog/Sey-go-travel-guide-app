import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { getApiUrl, authHeaders } from "@/lib/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function withParam(base: string, key: string, value: string): string {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

// ---------------------------------------------------------------------------
// Reviews — queries
// ---------------------------------------------------------------------------

export function useAllReviews() {
  return useQuery({
    queryKey: [api.moderation.reviews.list.path],
    queryFn: async () => {
      const url = getApiUrl(api.moderation.reviews.list.path);
      const res = await fetch(url, {
        credentials: "include",
        headers: await authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return api.moderation.reviews.list.responses[200].parse(await res.json());
    },
  });
}

export function useReviews(status: string = "pending") {
  return useQuery({
    queryKey: [api.moderation.reviews.list.path, status],
    queryFn: async () => {
      const url = withParam(getApiUrl(api.moderation.reviews.list.path), "status", status);
      const res = await fetch(url, {
        credentials: "include",
        headers: await authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return api.moderation.reviews.list.responses[200].parse(await res.json());
    },
  });
}

// ---------------------------------------------------------------------------
// Reviews — mutations
// ---------------------------------------------------------------------------

export function useApproveReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const url = getApiUrl(buildUrl(api.moderation.reviews.approve.path, { id }));
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({}),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve review");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.moderation.reviews.list.path] });
    },
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason?: string }) => {
      const url = getApiUrl(buildUrl(api.moderation.reviews.reject.path, { id }));
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ reason }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reject review");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.moderation.reviews.list.path] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const url = getApiUrl(buildUrl(api.moderation.reviews.delete.path, { id }));
      const res = await fetch(url, {
        method: "DELETE",
        headers: await authHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete review");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.moderation.reviews.list.path] });
    },
  });
}

/** Generic status update — backward-compat. */
export function useReviewAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "approved" | "rejected" }) => {
      const url = getApiUrl(buildUrl(api.moderation.reviews.action.path, { id }));
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export function usePhotos(status: string = "pending") {
  return useQuery({
    queryKey: [api.moderation.photos.list.path, status],
    queryFn: async () => {
      const url = withParam(getApiUrl(api.moderation.photos.list.path), "status", status);
      const res = await fetch(url, {
        credentials: "include",
        headers: await authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch photos");
      return api.moderation.photos.list.responses[200].parse(await res.json());
    },
  });
}

export function usePhotoAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "approved" | "rejected" }) => {
      const url = getApiUrl(buildUrl(api.moderation.photos.action.path, { id }));
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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
