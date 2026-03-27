import { NextResponse } from "next/server";
import { buildAwsApiUrl, getAwsBaseUrl } from "@/lib/server/awsProxy";

/**
 * API Route: /api/results/[job_id]
 * 
 * PROXY MODE: Forwards polling requests to AWS backend to avoid CORS issues
 * 
 * Usage: GET /api/results/123e4567-e89b-12d3-a456-426614174000
 * Forwards to: GET https://{base}/api/results/{job_id}
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  try {
    const { job_id } = await params;
    
    console.log(`[API Proxy] /api/results/${job_id} - Forwarding to AWS...`);

    // Forward to AWS backend (server-to-server, no CORS issues!)
    const awsUrl = buildAwsApiUrl(`/results/${job_id}`);
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
      console.error(`[API Proxy] AWS Error ${awsResponse.status}:`, errorText);
      return NextResponse.json(
        { error: `AWS Backend Error: ${awsResponse.status}`, details: errorText },
        { status: awsResponse.status }
      );
    }

    // Get the response from AWS
    const awsData = await awsResponse.json();
    console.log(`[API Proxy] AWS Response for ${job_id}:`, awsData.status);

    // Return to frontend (same-origin, no CORS!)
    return NextResponse.json(awsData);

  } catch (error) {
    console.error("[API Proxy] Error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request to AWS backend", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
