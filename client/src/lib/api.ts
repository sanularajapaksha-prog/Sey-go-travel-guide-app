const apiBaseUrl = import.meta.env.VITE_API_URL?.trim();

export function getApiUrl(path: string): string {
  if (!apiBaseUrl) {
    return path;
  }

  return new URL(path, apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`).toString();
}

