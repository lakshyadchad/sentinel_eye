function normalizeBaseUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const pathname = url.pathname.replace(/\/+$/, "");
    url.pathname = pathname;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getAwsBaseUrl(): string {
  const candidate =
    process.env.AWS_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_AWS_API_BASE ||
    "";

  const normalized = normalizeBaseUrl(candidate);
  if (!normalized) {
    throw new Error(
      "Missing or invalid AWS API base URL. Set AWS_API_BASE_URL (preferred) or NEXT_PUBLIC_API_URL.",
    );
  }

  return normalized;
}

export function buildAwsApiUrl(path: string): string {
  const baseUrl = getAwsBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `${baseUrl}/`).toString();
}
