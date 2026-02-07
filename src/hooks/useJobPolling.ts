"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JobStatusResponse, JobStatus, JobResultsResponse } from "@/types/jobs";
import {
  generateDownloadUrl,
  getJobResults,
  getJobStatus,
  getSummaryStatistics,
} from "@/lib/api/analyzeService";
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

function toLabel(fileKey: string) {
  return fileKey
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function isHttpUrl(value?: string) {
  return !!value && (value.startsWith("http://") || value.startsWith("https://"));
}

type JobFileItem = {
  fileType: string;
  label: string;
  sourceUrl?: string;
};

type ChangeMetrics = {
  totalChanges: number;
  changesByType: {
    deforestation: number;
    urban: number;
    encroachment: number;
  };
};

type SummaryStatistics = {
  deforestationKm2: number;
  deforestationPct: number;
  urbanExpansionKm2: number;
  urbanExpansionPct: number;
};

type SummaryJsonResponse = {
  statistics?: {
    deforestation_km2?: number;
    deforestation_pct?: number;
    urban_expansion_km2?: number;
    urban_expansion_pct?: number;
  };
};

function pickNumber(
  source: Record<string, number> | undefined,
  keys: string[],
): number | undefined {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number") return value;
  }
  return undefined;
}

function buildChangeMetrics(
  statusData: JobStatusResponse,
  resultsData?: JobResultsResponse,
  summaryStats?: SummaryStatistics | null,
): ChangeMetrics {
  const statusChanges = statusData.changes_by_type || statusData.results?.changes_by_type;
  const statusChangeTypes = statusData.change_types || statusData.results?.change_types;
  const resultChanges = resultsData?.changes_by_type;
  const resultChangeTypes = resultsData?.change_types;
  const statusStats = statusData.results?.statistics;

  const deforestation =
    summaryStats?.deforestationKm2 ??
    statusStats?.deforestation_km2 ??
    pickNumber(resultChanges, ["deforestation"]) ??
    pickNumber(resultChangeTypes, ["deforestation"]) ??
    pickNumber(statusChanges, ["deforestation"]) ??
    pickNumber(statusChangeTypes, ["deforestation"]) ??
    pickNumber(resultsData?.change_types, ["deforestation"]) ??
    resultsData?.statistics?.deforestation_area_km2 ??
    0;

  const urban =
    summaryStats?.urbanExpansionKm2 ??
    statusStats?.urban_expansion_km2 ??
    pickNumber(resultChanges, ["urban_expansion", "urban"]) ??
    pickNumber(resultChangeTypes, ["urban_expansion", "urban"]) ??
    pickNumber(statusChanges, ["urban_expansion", "urban"]) ??
    pickNumber(statusChangeTypes, ["urban_expansion", "urban"]) ??
    pickNumber(resultsData?.change_types, ["urban_expansion", "urban"]) ??
    resultsData?.statistics?.urban_expansion_km2 ??
    0;

  const encroachment =
    pickNumber(resultChanges, ["encroachment"]) ??
    pickNumber(resultChangeTypes, ["encroachment"]) ??
    pickNumber(statusChanges, ["encroachment"]) ??
    pickNumber(statusChangeTypes, ["encroachment"]) ??
    resultsData?.statistics?.encroachment_km2 ??
    0;

  const totalChanges =
    resultsData?.total_changes ??
    statusData.total_changes ??
    statusData.results?.total_changes ??
    deforestation + urban + encroachment;

  return {
    totalChanges,
    changesByType: { deforestation, urban, encroachment },
  };
}

async function tryFetchSummaryStatistics(jobId: string): Promise<SummaryStatistics | null> {
  try {
    const stats = (await getSummaryStatistics(jobId)) as SummaryJsonResponse["statistics"] | null;
    if (!stats) return null;
    return {
      deforestationKm2: stats.deforestation_km2 ?? 0,
      deforestationPct: stats.deforestation_pct ?? 0,
      urbanExpansionKm2: stats.urban_expansion_km2 ?? 0,
      urbanExpansionPct: stats.urban_expansion_pct ?? 0,
    };
  } catch {
    return null;
  }
}

export function useJobPolling(jobId: string | null) {
  const [status, setStatus] = useState<JobStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queuedSince, setQueuedSince] = useState<number | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [resultImageFileType, setResultImageFileType] = useState<string | null>(null);
  const [isFetchingImage, setIsFetchingImage] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<JobFileItem[]>([]);
  const [changeMetrics, setChangeMetrics] = useState<ChangeMetrics>({
    totalChanges: 0,
    changesByType: { deforestation: 0, urban: 0, encroachment: 0 },
  });
  const [summaryStatistics, setSummaryStatistics] = useState<SummaryStatistics | null>(null);
  const pollRef = useRef<(() => Promise<void>) | null>(null);

  const fetchResultImage = useCallback(async (fileType?: string, sourceUrl?: string) => {
    if (!jobId) return;
    const targetType = fileType || "analysis_png";
    try {
      setIsFetchingImage(true);
      if (isHttpUrl(sourceUrl)) {
        setResultImageUrl(sourceUrl || null);
        setResultImageFileType(targetType);
        return;
      }
      const res = await generateDownloadUrl({ job_id: jobId, file_type: targetType });
      setResultImageUrl(res.download_url);
      setResultImageFileType(targetType);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load analysis image");
    } finally {
      setIsFetchingImage(false);
    }
  }, [jobId]);

  const downloadFile = useCallback(
    async (fileType: string, sourceUrl?: string) => {
      if (!jobId) return;
      try {
        const res = await generateDownloadUrl({ job_id: jobId, file_type: fileType });
        window.open(res.download_url, "_blank", "noopener,noreferrer");
      } catch {
        if (isHttpUrl(sourceUrl)) {
          window.open(sourceUrl, "_blank", "noopener,noreferrer");
          return;
        }
        throw new Error(`Unable to generate download URL for ${fileType}`);
      }
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
          let resultsData: JobResultsResponse | undefined;
          let fileMap: Record<string, string> = statusData.results?.files || {};
          if (Object.keys(fileMap).length === 0) {
            try {
              resultsData = await getJobResults(jobId);
              fileMap = resultsData.files || {};
            } catch {
              // Keep empty list if results endpoint is unavailable on this backend.
            }
          }

          const statusStats = statusData.results?.statistics;
          let resolvedStats: SummaryStatistics = {
            deforestationKm2:
              statusStats?.deforestation_km2 ??
              resultsData?.statistics?.deforestation_area_km2 ??
              0,
            deforestationPct: statusStats?.deforestation_pct ?? 0,
            urbanExpansionKm2:
              statusStats?.urban_expansion_km2 ??
              resultsData?.statistics?.urban_expansion_km2 ??
              0,
            urbanExpansionPct: statusStats?.urban_expansion_pct ?? 0,
          };

          if (resolvedStats.deforestationKm2 === 0 && resolvedStats.urbanExpansionKm2 === 0) {
            const summaryFromFile = await tryFetchSummaryStatistics(jobId);
            if (summaryFromFile) {
              resolvedStats = summaryFromFile;
            }
          }

          setSummaryStatistics(resolvedStats);
          setChangeMetrics(buildChangeMetrics(statusData, resultsData, resolvedStats));

          const files = Object.entries(fileMap).map(([fileType, sourceUrl]) => ({
            fileType,
            sourceUrl,
            label: toLabel(fileType),
          }));
          setAvailableFiles(files);

          const preferredImage =
            files.find((file) => file.fileType === "analysis_png") ||
            files.find((file) => file.fileType.toLowerCase().includes("png")) ||
            files.find((file) => file.fileType.toLowerCase().endsWith(".png"));

          if (!pngFetched && preferredImage) {
            pngFetched = true;
            await fetchResultImage(preferredImage.fileType, preferredImage.sourceUrl);
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
  }, [jobId, fetchResultImage]);

  const normalizedStatus = normalizeStatus(status?.status);
  const progress = status?.progress ?? STATUS_MAP[normalizedStatus]?.pct ?? 0;
  const statusText = STATUS_MAP[normalizedStatus]?.text || status?.status || "Processing";
  const isProcessing = normalizedStatus !== "COMPLETED" && normalizedStatus !== "FAILED";
  const isCompleted = normalizedStatus === "COMPLETED";

  const availableFileTypes = useMemo(
    () =>
      availableFiles.map((file) => ({
        label: file.label,
        type: file.fileType,
        sourceUrl: file.sourceUrl,
      })),
    [availableFiles],
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
    resultImageFileType,
    changeMetrics,
    summaryStatistics,
    availableFileTypes,
    refresh: async () => {
      if (pollRef.current) await pollRef.current();
    },
    refetchImage: async () => {
      const preferred =
        availableFiles.find((file) => file.fileType === "analysis_png") ||
        availableFiles.find((file) => file.fileType === resultImageFileType) ||
        availableFiles.find((file) => file.fileType.toLowerCase().includes("png")) ||
        availableFiles.find((file) => file.fileType.toLowerCase().endsWith(".png"));
      await fetchResultImage(preferred?.fileType, preferred?.sourceUrl);
    },
    downloadFile,
  };
}

