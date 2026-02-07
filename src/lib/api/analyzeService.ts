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

  if (!payload.tile_id) {
    throw new Error("Validation failed: tile_id is required but was not provided");
  }

  const normalizedPayload = {
    tile_id: payload.tile_id,
    start_year: payload.start_year,
    end_year: payload.end_year,
    change_types: payload.change_types,
  };

  const attempts: Array<{ endpoint: string; status?: number; error: string }> = [];

  try {
    const newRes = await requestWithFallback(["/api/analyze-region", "/analyze-region"], {
      method: "POST",
      headers,
      body: JSON.stringify(normalizedPayload),
    });
    return newRes.json();
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    attempts.push({ endpoint: "/api/analyze-region", error: errorMsg });

    try {
      const legacyRes = await requestWithFallback(["/api/analyze", "/analyze"], {
        method: "POST",
        headers,
        body: JSON.stringify(normalizedPayload),
      });
      return legacyRes.json();
    } catch (err2) {
      const errorMsg2 = err2 instanceof Error ? err2.message : String(err2);
      attempts.push({ endpoint: "/api/analyze", error: errorMsg2 });

      throw new Error(
        `Analysis submission failed to all endpoints. ` +
        `Primary (${attempts[0].endpoint}): ${attempts[0].error}. ` +
        `Fallback (${attempts[1].endpoint}): ${attempts[1].error}`
      );
    }
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

export async function getSummaryStatistics(jobId: string): Promise<{
  deforestation_km2?: number;
  deforestation_pct?: number;
  urban_expansion_km2?: number;
  urban_expansion_pct?: number;
} | null> {
  const res = await fetch(`/api/summary-stats/${jobId}`);
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as {
    statistics?: {
      deforestation_km2?: number;
      deforestation_pct?: number;
      urban_expansion_km2?: number;
      urban_expansion_pct?: number;
    } | null;
  };
  return data.statistics ?? null;
}
