import { supabase } from "@/lib/supabase";

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim();

/** Returns the current Supabase access token for use in Authorization headers. */
export async function getAuthToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Returns Authorization headers if a token is available. */
export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/api/")
    ? path
    : path.startsWith("/")
      ? `/api${path}`
      : `/api/${path}`;

  if (!apiBaseUrl) {
    return normalizedPath;
  }

  return new URL(
    normalizedPath,
    apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`,
  ).toString();
}

