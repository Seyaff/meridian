export function resolveMediaUrl(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/uploads/")) {
      return parsed.pathname;
    }
  } catch {
    if (url.startsWith("/uploads/")) return url;
  }
  return url;
}
