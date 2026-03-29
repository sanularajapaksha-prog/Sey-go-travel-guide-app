import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { getApiUrl, authHeaders } from "@/lib/api";

export function useUsers(search?: string) {
  return useQuery({
    queryKey: [api.users.list.path, search],
    queryFn: async () => {
      const url = new URL(getApiUrl(api.users.list.path));
      if (search) url.searchParams.set("search", search);
      const res = await fetch(url.toString(), {
        credentials: "include",
        headers: await authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.users.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'active' | 'disabled' }) => {
      const url = getApiUrl(buildUrl(api.users.updateStatus.path, { id }));
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update user status");
      return api.users.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = getApiUrl(buildUrl(api.users.delete.path, { id }));
      const res = await fetch(url, {
        method: "DELETE",
        headers: await authHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
    },
  });
}
