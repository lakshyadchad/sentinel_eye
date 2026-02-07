"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JobStatusResponse, JobStatus } from "@/types/jobs";
import { generateDownloadUrl, getJobStatus } from "@/lib/api/analyzeService";
import { getJobById, upsertJob } from "@/lib/jobs/jobStorage";

const STATUS_MAP: Record<string, { text: string; pct: number }> = {
  QUEUED: { text: "Waiting in queue...", pct: 0 },
  PROCESSING: { text: "Starting analysis...", pct: 10 },
  DOWNLOADING: { text: "Downloading satellite imagery...", pct: 15 },
  CALCULATING_NDVI: { text: "Calculating vegetation index...", pct: 45 },
  CALCULATING_NDBI: { text: "Calculating built-up index...", pct: 60 },
  DETECTING_CHANGES: { text: "Detecting land use changes...", pct: 70 },
  CREATING_MAPS: { text: "Creating change maps...", pct: 80 },
  GENERATING_PNG: { text: "Generating visualization...", pct: 85 },
  UPLOADING: { text: "Uploading results...", pct: 90 },
  COMPLETED: { text: "Analysis complete!", pct: 100 },
  FAILED: { text: "Analysis failed", pct: 0 },
};

function normalizeStatus(status?: JobStatus): JobStatus {
  if (!status) return "PROCESSING";
  const upper = status.toUpperCase();
  if (upper === "QUEUED" || upper === "PROCESSING") return upper as JobStatus;
  if (STATUS_MAP[upper]) return upper as JobStatus;
  if (upper === "COMPLETED") return "COMPLETED";
  if (upper === "FAILED") return "FAILED";
  return "PROCESSING";
}

export function useJobPolling(jobId: string | null) {
  const [status, setStatus] = useState<JobStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queuedSince, setQueuedSince] = useState<number | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [isFetchingImage, setIsFetchingImage] = useState(false);
  const pollRef = useRef<(() => Promise<void>) | null>(null);

  const fetchAnalysisPng = useCallback(async () => {
    if (!jobId) return;
    try {
      setIsFetchingImage(true);
      const res = await generateDownloadUrl({
        job_id: jobId,
        file_type: "analysis_png",
      });
      setResultImageUrl(res.download_url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load analysis image");
    } finally {
      setIsFetchingImage(false);
    }
  }, [jobId]);

  const downloadFile = useCallback(
    async (fileType: string) => {
      if (!jobId) return;
      const res = await generateDownloadUrl({ job_id: jobId, file_type: fileType });
      window.open(res.download_url, "_blank", "noopener,noreferrer");
    },
    [jobId],
  );

  useEffect(() => {
    if (!jobId) return;

    let interval: NodeJS.Timeout | null = null;
    let mounted = true;
    let pngFetched = false;

    const poll = async () => {
      try {
        const statusData = await getJobStatus(jobId);
        if (!mounted) return;

        const normalizedStatus = normalizeStatus(statusData.status);
        const statusProgress =
          typeof statusData.progress === "number"
            ? statusData.progress
            : STATUS_MAP[normalizedStatus]?.pct ?? 0;

        setStatus({ ...statusData, status: normalizedStatus, progress: statusProgress });

        if (normalizedStatus === "QUEUED") {
          setQueuedSince((prev) => prev ?? Date.now());
        } else {
          setQueuedSince(null);
        }

        const existing = getJobById(jobId);
        upsertJob({
          job_id: statusData.job_id,
          status: normalizedStatus,
          progress: statusProgress,
          message: statusData.message || STATUS_MAP[normalizedStatus]?.text || "",
          coordinates: statusData.coordinates || existing?.coordinates || { lat: 0, lon: 0 },
          tile_ids:
            statusData.tile_ids ||
            (statusData.tile_id ? [statusData.tile_id] : undefined) ||
            existing?.tile_ids ||
            [],
          start_year: statusData.start_year ?? existing?.start_year ?? 0,
          end_year: statusData.end_year ?? existing?.end_year ?? 0,
          change_types: existing?.change_types ?? [],
          created_at: existing?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
          results_summary: existing?.results_summary,
        });

        if (normalizedStatus === "COMPLETED") {
          if (!pngFetched) {
            pngFetched = true;
            await fetchAnalysisPng();
          }
          if (interval) clearInterval(interval);
          return;
        }

        if (normalizedStatus === "FAILED") {
          setError(statusData.error_message || statusData.message || "Job processing failed");
          if (interval) clearInterval(interval);
        }
      } catch (err: unknown) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Polling failed");
        if (interval) clearInterval(interval);
      }
    };

    pollRef.current = poll;
    poll();
    interval = setInterval(poll, 5000);

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [jobId, fetchAnalysisPng]);

  const normalizedStatus = normalizeStatus(status?.status);
  const progress = status?.progress ?? STATUS_MAP[normalizedStatus]?.pct ?? 0;
  const statusText = STATUS_MAP[normalizedStatus]?.text || status?.status || "Processing";
  const isProcessing = normalizedStatus !== "COMPLETED" && normalizedStatus !== "FAILED";
  const isCompleted = normalizedStatus === "COMPLETED";

  const availableFileTypes = useMemo(
    () => [
      { label: "Analysis PNG", type: "analysis_png" },
      { label: "Deforestation Map", type: "deforestation" },
      { label: "Urban Expansion Map", type: "urban_expansion" },
      { label: "Combined Changes", type: "combined_map" },
      { label: "NDVI Start Year", type: "start_ndvi" },
      { label: "NDVI End Year", type: "end_ndvi" },
      { label: "NDBI Start Year", type: "start_ndbi" },
      { label: "NDBI End Year", type: "end_ndbi" },
    ],
    [],
  );

  return {
    status,
    error,
    isProcessing,
    isCompleted,
    progress,
    statusText,
    queuedSince,
    resultImageUrl,
    isFetchingImage,
    availableFileTypes,
    refresh: async () => {
      if (pollRef.current) await pollRef.current();
    },
    refetchImage: fetchAnalysisPng,
    downloadFile,
  };
}

