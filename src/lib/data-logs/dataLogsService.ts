import type { JobHistoryItem } from "@/types/jobs";
import type { DataLogsFilters } from "@/types/dataLogs";
import { getJobHistory } from "@/lib/jobs/jobStorage";

export function getFilteredLogs(filters: DataLogsFilters): JobHistoryItem[] {
  const history = getJobHistory();

  let logs = [...history];

  // filter status
  if (filters.status !== "ALL") {
    const target = String(filters.status).toUpperCase();
    logs = logs.filter((s) => String(s.status).toUpperCase() === target);
  }

  // search query
  if (filters.query.trim().length > 0) {
    const q = filters.query.toLowerCase();
    logs = logs.filter(
      (s) =>
        s.job_id.toLowerCase().includes(q) ||
        `${s.coordinates.lat},${s.coordinates.lon}`.includes(q),
    );
  }

  // sort
  logs.sort((a, b) => {
    const t1 = new Date(a.created_at).getTime();
    const t2 = new Date(b.created_at).getTime();
    return filters.sort === "NEWEST" ? t2 - t1 : t1 - t2;
  });

  return logs;
}
