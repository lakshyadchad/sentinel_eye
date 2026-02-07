"use client";

import { useEffect, useMemo, useState } from "react";
import type { JobResultsResponse, JobStatusResponse } from "@/types/jobs";
import { getJobResults, getJobStatus } from "@/lib/api/analyzeService";
import { getJobById, upsertJob } from "@/lib/jobs/jobStorage";

export function useJobPolling(jobId: string | null) {
  const [status, setStatus] = useState<JobStatusResponse | null>(null);
  const [results, setResults] = useState<JobResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queuedSince, setQueuedSince] = useState<number | null>(null);
  const pollRef = useState<{ fn?: () => Promise<void> }>({})[0];

  useEffect(() => {
    if (!jobId) return;

    let interval: NodeJS.Timeout | null = null;
    let mounted = true;

    const poll = async () => {
      try {
        const statusData = await getJobStatus(jobId);
        const normalizedStatus =
          statusData.status === "COMPLETED" ? "Completed" : statusData.status;
        const normalized = { ...statusData, status: normalizedStatus };
        if (!mounted) return;

        setStatus(normalized);
        if (normalized.status === "Queued") {
          setQueuedSince((prev) => prev ?? Date.now());
        } else {
          setQueuedSince(null);
        }
        const existing = getJobById(jobId);
        upsertJob({
          job_id: normalized.job_id,
          status: normalized.status,
          progress: normalized.progress ?? 0,
          message: normalized.message || "",
          coordinates:
            normalized.coordinates ||
            existing?.coordinates || { lat: 0, lon: 0 },
          tile_ids: normalized.tile_ids || existing?.tile_ids || [],
          start_year: normalized.start_year ?? existing?.start_year ?? 0,
          end_year: normalized.end_year ?? existing?.end_year ?? 0,
          change_types: existing?.change_types ?? [],
          created_at: existing?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
          results_summary: existing?.results_summary,
        });

        if (normalized.status === "Completed") {
          const resultsData = await getJobResults(jobId);
          setResults(resultsData);
          const existingAfter = getJobById(jobId);
          const deforestation = resultsData.statistics.deforestation_area_km2 || 0;
          const urban = resultsData.statistics.urban_expansion_km2 || 0;
          upsertJob({
            job_id: resultsData.job_id,
            status: "Completed",
            progress: 100,
            message: "Completed",
            coordinates:
              normalized.coordinates ||
              existingAfter?.coordinates ||
              resultsData.coordinates || { lat: 0, lon: 0 },
            tile_ids:
              normalized.tile_ids ||
              resultsData.tile_ids ||
              existingAfter?.tile_ids ||
              [],
            start_year:
              normalized.start_year ?? existingAfter?.start_year ?? 0,
            end_year: normalized.end_year ?? existingAfter?.end_year ?? 0,
            change_types: existingAfter?.change_types ?? [],
            created_at: existingAfter?.created_at ?? new Date().toISOString(),
            updated_at: new Date().toISOString(),
            results_summary: {
              total_area_changed_km2: deforestation + urban,
              deforestation_km2: deforestation,
              urban_expansion_km2: urban,
              total_changes: resultsData.total_changes ?? 0,
              encroachment_km2: 0,
            },
          });

          if (interval) clearInterval(interval);
        } else if (statusData.status === "Failed") {
          setError(statusData.message || "Job processing failed");
          if (interval) clearInterval(interval);
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Polling failed");
        if (interval) clearInterval(interval);
      }
    };

    pollRef.fn = poll;
    poll();
    interval = setInterval(poll, 5000);

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [jobId]);

  const progress = status?.progress ?? (status?.status === "Completed" ? 100 : 0);
  const isProcessing =
    status?.status === "Queued" || status?.status === "Processing";
  const isCompleted = status?.status === "Completed";

  return {
    status,
    results,
    error,
    isProcessing,
    isCompleted,
    progress,
    queuedSince,
    refresh: async () => {
      if (pollRef.fn) await pollRef.fn();
    },
  };
}
