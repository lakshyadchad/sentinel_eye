import { NextResponse } from "next/server";
type SummaryStats = {
  deforestation_km2?: number;
  deforestation_pct?: number;
  urban_expansion_km2?: number;
  urban_expansion_pct?: number;
};

const API_BASE =
  process.env.AWS_API_BASE_URL ||
  process.env.NEXT_PUBLIC_ANALYSIS_API_BASE ||
  "https://3y53hcmnt8.execute-api.us-west-2.amazonaws.com/dev";

function joinUrl(path: string) {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

async function fetchResults(jobId: string) {
  const paths = [`/api/results/${jobId}`, `/results/${jobId}`];
  for (const path of paths) {
    const res = await fetch(joinUrl(path), { method: "GET", cache: "no-store" });
    if (res.ok) return res;
  }
  return null;
}

function findSummaryUrl(files: Record<string, string> | undefined) {
  if (!files) return null;
  const exact = Object.entries(files).find(([key]) => key.toLowerCase() === "summary.json");
  if (exact?.[1]) return exact[1];
  const match = Object.entries(files).find(([key]) => {
    const lower = key.toLowerCase();
    return lower.includes("summary") && lower.includes(".json");
  });
  return match?.[1] ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ job_id: string }> },
) {
  try {
    const { job_id } = await params;
    const resultsRes = await fetchResults(job_id);
    if (!resultsRes) {
      return NextResponse.json(
        { error: "Results fetch failed", details: "No working results endpoint" },
        { status: 502 },
      );
    }

    const resultsData = (await resultsRes.json()) as {
      files?: Record<string, string>;
    };

    const summaryUrl = findSummaryUrl(resultsData.files);
    if (!summaryUrl) {
      return NextResponse.json({ statistics: null }, { status: 200 });
    }

    const summaryRes = await fetch(summaryUrl, { method: "GET", cache: "no-store" });
    if (!summaryRes.ok) {
      const details = await summaryRes.text();
      return NextResponse.json(
        { error: `Summary fetch failed: ${summaryRes.status}`, details },
        { status: summaryRes.status },
      );
    }

    const summaryData = (await summaryRes.json()) as {
      statistics?: SummaryStats;
    };

    return NextResponse.json(
      { statistics: summaryData.statistics ?? null },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch summary stats", details: String(error) },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
