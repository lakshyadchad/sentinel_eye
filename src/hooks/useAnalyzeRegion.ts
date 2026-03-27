"use client";

import { useState } from "react";
import type { AnalyzeRequest, AnalyzeResponse } from "@/types/jobs";
import { submitAnalysis } from "@/lib/api/analyzeService";
import { upsertJob } from "@/lib/jobs/jobStorage";

export function useAnalyzeRegion() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (payload: AnalyzeRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await submitAnalysis(payload);
      setResult(res);

      upsertJob({
        job_id: res.job_id,
        status: res.status,
        progress: res.status === "COMPLETED" ? 100 : 0,
        message: res.message || "",
        coordinates: payload.coordinates || { lat: 0, lon: 0 },
        tile_ids: payload.tile_ids || [payload.tile_id],
        start_year: payload.start_year,
        end_year: payload.end_year,
        change_types: payload.change_types,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return res;
    } catch (e: unknown) {
      let errorMessage: string;
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === "string") {
        errorMessage = e;
      } else {
        errorMessage = "Something went wrong during analysis";
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setResult(null);
    setError(null);
  };

  return { run, loading, result, error, reset };
}

