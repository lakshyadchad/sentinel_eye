import { NextResponse } from "next/server";
import { buildAwsApiUrl, getAwsBaseUrl } from "@/lib/server/awsProxy";

/**
 * API Route: /api/status/[job_id]
 *
 * PROXY MODE: Forwards job status polling requests to AWS backend
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ job_id: string }> },
) {
  try {
    const { job_id } = await params;
    const awsUrl = buildAwsApiUrl(`/status/${job_id}`);

    console.log(`[API Proxy] AWS Base URL: ${getAwsBaseUrl()}`);
    console.log(`[API Proxy] GET ${awsUrl}`);

    const awsResponse = await fetch(awsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!awsResponse.ok) {
      const errorText = await awsResponse.text();
      return NextResponse.json(
        { error: `AWS Backend Error: ${awsResponse.status}`, details: errorText },
        { status: awsResponse.status },
      );
    }

    const awsData = await awsResponse.json();
    return NextResponse.json(awsData);
  } catch (error) {
    console.error("[API Proxy] Error:", error);
    return NextResponse.json(
      { error: "Failed to proxy status request", details: String(error) },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
