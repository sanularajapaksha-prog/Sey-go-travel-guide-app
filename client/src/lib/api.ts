const apiBaseUrl = import.meta.env.VITE_API_URL?.trim();

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

