import type { JobHistoryItem } from "@/types/jobs";

const DAY_MS = 24 * 60 * 60 * 1000;

export function getJobDate(job: JobHistoryItem) {
  return new Date(job.updated_at || job.created_at);
}

export function isCompletedJob(job: JobHistoryItem) {
  return job.status === "Completed" && !!job.results_summary;
}

export function isHighSeverityJob(job: JobHistoryItem) {
  if (!job.results_summary) return false;
  const summary = job.results_summary;
  return (
    (summary.deforestation_km2 ?? 0) >= 300 ||
    (summary.urban_expansion_km2 ?? 0) >= 50 ||
    (summary.encroachment_km2 ?? 0) >= 30 ||
    (summary.total_area_changed_km2 ?? 0) >= 400
  );
}

export function computeDashboardStats(jobs: JobHistoryItem[]) {
  const completed = jobs.filter(isCompletedJob);
  const totalScans = completed.length;
  const activeThreats = completed.filter(isHighSeverityJob).length;

  const areaMonitoredKm2 = completed.reduce(
    (sum, job) => sum + (job.results_summary?.total_area_changed_km2 || 0),
    0,
  );

  const sevenDaysAgo = Date.now() - 7 * DAY_MS;
  const recentChanges = completed.reduce((sum, job) => {
    const date = getJobDate(job).getTime();
    if (date >= sevenDaysAgo) {
      return sum + (job.results_summary?.total_changes || 0);
    }
    return sum;
  }, 0);

  return {
    totalScans,
    activeThreats,
    areaMonitoredKm2,
    recentChanges,
  };
}

export function computeThreatMetrics(jobs: JobHistoryItem[]) {
  const now = Date.now();
  const last30 = now - 30 * DAY_MS;
  const prev30 = now - 60 * DAY_MS;

  const recent = jobs.filter(
    (job) => isCompletedJob(job) && getJobDate(job).getTime() >= last30,
  );
  const previous = jobs.filter((job) => {
    const t = getJobDate(job).getTime();
    return isCompletedJob(job) && t < last30 && t >= prev30;
  });

  const recentHigh = recent.filter(isHighSeverityJob).length;
  const prevHigh = previous.filter(isHighSeverityJob).length;

  const recentRate = recent.length === 0 ? 0 : recentHigh / recent.length;
  const prevRate = previous.length === 0 ? 0 : prevHigh / previous.length;

  let trend: "Increasing" | "Decreasing" | "Stable" = "Stable";
  if (recentRate > prevRate + 0.05) trend = "Increasing";
  if (recentRate + 0.05 < prevRate) trend = "Decreasing";

  return {
    recentJobs: recent.length,
    recentHigh,
    recentRate,
    trend,
  };
}