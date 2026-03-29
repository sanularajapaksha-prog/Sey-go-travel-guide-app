import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertPlace } from "../../../server/shared/schema";
import { getApiUrl, authHeaders } from "@/lib/api";

export function usePlaces(search?: string) {
  return useQuery({
    queryKey: [api.places.list.path, search],
    queryFn: async () => {
      const url = new URL(getApiUrl(api.places.list.path));
      if (search) url.searchParams.set("search", search);
      
      const res = await fetch(url.toString(), { credentials: "include", headers: await authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch places");
      return api.places.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPlace) => {
      const res = await fetch(getApiUrl(api.places.create.path), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) throw new Error("Validation failed");
        throw new Error("Failed to create place");
      }
      return api.places.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.places.list.path] });
    },
  });
}

export function useUpdatePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPlace> }) => {
      const url = getApiUrl(buildUrl(api.places.update.path, { id }));
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update place");
      return api.places.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.places.list.path] });
    },
  });
}

export function useDeletePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = getApiUrl(buildUrl(api.places.delete.path, { id }));
      const res = await fetch(url, { method: "DELETE", credentials: "include", headers: await authHeaders() });
      if (!res.ok) throw new Error("Failed to delete place");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.places.list.path] });
    },
  });
}
