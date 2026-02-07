import type {
  AnalyzeRequest,
  AnalyzeResponse,
  GenerateDownloadRequest,
  GenerateDownloadResponse,
  JobResultsResponse,
  JobStatusResponse,
  TileListResponse,
} from "@/types/jobs";

const API_BASE =
  process.env.NEXT_PUBLIC_ANALYSIS_API_BASE ||
  "https://3y53hcmnt8.execute-api.us-west-2.amazonaws.com/dev";

function joinUrl(base: string, path: string) {
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function readError(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

async function requestWithFallback(paths: string[], init?: RequestInit) {
  const attempts: Array<{ path: string; status: number; body: string }> = [];
  let lastNetworkError: unknown = null;

  for (const path of paths) {
    try {
      const res = await fetch(joinUrl(API_BASE, path), init);
      if (res.ok) return res;

      const body = await readError(res);
      attempts.push({ path, status: res.status, body });

      if (res.status === 403 || res.status === 404 || res.status === 405) {
        continue;
      }

      throw new Error(`Request failed (${path}): ${res.status} - ${body}`);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Request failed (")) {
        throw err;
      }
      lastNetworkError = err;
      continue;
    }
  }

  if (attempts.length > 0) {
    const last = attempts[attempts.length - 1];
    throw new Error(`Request failed (${last.path}): ${last.status} - ${last.body}`);
  }

  if (lastNetworkError instanceof Error) {
    throw lastNetworkError;
  }

  throw new Error("Request failed: no reachable endpoint");
}

export async function getTiles(): Promise<TileListResponse> {
  const res = await requestWithFallback(["/api/tiles", "/tiles"]);
  return res.json();
}

export async function submitAnalysis(
  payload: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  const headers = { "Content-Type": "application/json" };

  try {
    const newRes = await requestWithFallback(["/api/analyze-region", "/analyze-region"], {
      method: "POST",
      headers,
      body: JSON.stringify({
        tile_id: payload.tile_id,
        start_year: payload.start_year,
        end_year: payload.end_year,
        change_types: payload.change_types,
      }),
    });
    return newRes.json();
  } catch {
    const legacyRes = await requestWithFallback(["/api/analyze", "/analyze"], {
      method: "POST",
      headers,
      body: JSON.stringify({
        tile_ids: payload.tile_ids || [payload.tile_id],
        coordinates: payload.coordinates,
        start_year: payload.start_year,
        end_year: payload.end_year,
        change_types: payload.change_types,
      }),
    });
    return legacyRes.json();
  }
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await requestWithFallback([`/api/status/${jobId}`, `/status/${jobId}`]);
  return res.json();
}

export async function getJobResults(jobId: string): Promise<JobResultsResponse> {
  const res = await requestWithFallback([`/api/results/${jobId}`, `/results/${jobId}`]);
  return res.json();
}

export async function generateDownloadUrl(
  payload: GenerateDownloadRequest,
): Promise<GenerateDownloadResponse> {
  try {
    const res = await requestWithFallback(["/api/generate-download", "/generate-download"], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  } catch {
    const results = await getJobResults(payload.job_id);
    const url = results.files?.[payload.file_type];
    if (!url) {
      throw new Error(`File not available for type: ${payload.file_type}`);
    }
    return { download_url: url, expires_in: 3600 };
  }
}
