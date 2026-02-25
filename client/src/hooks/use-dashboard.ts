import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.dashboard.stats.responses[200].parse(await res.json());
    },
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: [api.dashboard.activity.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.activity.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch activity data");
      return api.dashboard.activity.responses[200].parse(await res.json());
    },
  });
}
