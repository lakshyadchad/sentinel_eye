"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChangeResultsMap from "./components/ChangeResultsMap";
import { useJobPolling } from "@/hooks/useJobPolling";
import { useJobHistory } from "@/hooks/useJobHistory";
import JobSummaryPanel from "./components/JobSummaryPanel";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export default function ScanResultClient() {
  const params = useSearchParams();
  const jobId = params.get("job_id");
  const {
    status,
    results,
    error,
    progress,
    isProcessing,
    isCompleted,
    queuedSince,
    refresh,
  } = useJobPolling(jobId);
  const { history } = useJobHistory();

  const jobFromHistory = useMemo(() => {
    if (!jobId) return null;
    return history.find((job) => job.job_id === jobId) ?? null;
  }, [history, jobId]);

  const topChanges = useMemo(() => {
    const changes = results?.top_changes;
    if (!changes || !Array.isArray(changes)) return [];
    return [...changes].sort((a, b) => b.area_km2 - a.area_km2).slice(0, 10);
  }, [results]);

  if (!jobId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 rounded-2xl border border-border">
          <p className="text-sm text-muted-foreground">
            No job selected. Start a new analysis from{" "}
            <Link href="/analysis" className="text-primary">
              Map Analysis
            </Link>
            .
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 pb-12 space-y-8">
        <Card className="p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">
                Job Status
              </p>
              <p className="text-lg font-semibold text-foreground">
                {status?.status || "Fetching status..."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Job ID: <span className="font-mono">{jobId}</span>
              </p>
            </div>
            <div className="w-full md:w-80">
              <ProgressBar value={progress} />
              <p className="mt-2 text-xs text-muted-foreground">
                {progress}% complete
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>
          )}

          {isProcessing && (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-muted-foreground">
                We are processing satellite imagery. Results will appear
                automatically when ready.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={refresh}>
                  Refresh Status
                </Button>
              </div>
              {status?.status === "Queued" && queuedSince && (
                <>
                  {Date.now() - queuedSince > 2 * 60 * 1000 && (
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-300">
                      Job is taking longer than expected. The backend may be
                      processing a backlog. Current status: QUEUED
                    </div>
                  )}
                  {Date.now() - queuedSince > 5 * 60 * 1000 && (
                    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground space-y-3">
                      <div>Job appears stuck. This usually means:</div>
                      <ul className="list-disc list-inside text-sm">
                        <li>Backend worker is not running</li>
                        <li>Processing queue has issues</li>
                        <li>Contact support with Job ID: {jobId}</li>
                      </ul>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(jobId)}
                        >
                          Copy Job ID
                        </Button>
                        <Button variant="secondary" asChild>
                          <Link href="/dashboard">Return to Dashboard</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </Card>

        {isCompleted && results ? (
          <>
            <JobSummaryPanel
              jobId={jobId}
              coordinates={
                results.coordinates || status?.coordinates || jobFromHistory?.coordinates
              }
              startYear={status?.start_year || jobFromHistory?.start_year}
              endYear={status?.end_year || jobFromHistory?.end_year}
              changeTypes={jobFromHistory?.change_types}
              submittedAt={jobFromHistory?.created_at}
              completedAt={jobFromHistory?.updated_at}
              totalChanges={results.total_changes}
              changesByType={results.changes_by_type}
            />

            {(() => {
              const deforestation =
                results.statistics.deforestation_area_km2 || 0;
              const urban = results.statistics.urban_expansion_km2 || 0;
              const encroachment = results.statistics.encroachment_km2 || 0;
              const totalArea = deforestation + urban + encroachment;
              return (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card className="p-4 rounded-2xl border border-border">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Total Area
                    </p>
                    <p className="text-2xl font-bold">
                      {totalArea.toFixed(1)} km2
                    </p>
                  </Card>
                  <Card className="p-4 rounded-2xl border border-border">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Deforestation
                    </p>
                    <p className="text-2xl font-bold text-red-500">
                      {deforestation.toFixed(1)} km2
                    </p>
                  </Card>
                  <Card className="p-4 rounded-2xl border border-border">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Urban Expansion
                    </p>
                    <p className="text-2xl font-bold text-blue-500">
                      {urban.toFixed(1)} km2
                    </p>
                  </Card>
                  <Card className="p-4 rounded-2xl border border-border">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Encroachment
                    </p>
                    <p className="text-2xl font-bold text-amber-500">
                      {encroachment.toFixed(1)} km2
                    </p>
                  </Card>
                  <Card className="p-4 rounded-2xl border border-border">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Total Changes
                    </p>
                    <p className="text-2xl font-bold">
                      {results.total_changes}
                    </p>
                  </Card>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <ChangeResultsMap results={results} />

                <Card className="p-5 rounded-2xl border border-border">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">
                    Top Changes
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 text-left">Type</th>
                          <th className="px-4 py-3 text-left">Area (km2)</th>
                          <th className="px-4 py-3 text-left">Coordinates</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {topChanges.map((change, idx) => (
                          <tr key={`${change.type}-${idx}`}>
                            <td className="px-4 py-3 font-semibold">
                              {change.type}
                            </td>
                            <td className="px-4 py-3">
                              {change.area_km2.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {change.location.lat.toFixed(3)},{" "}
                              {change.location.lon.toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <Card className="p-5 rounded-2xl border border-border">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">
                    Downloads
                  </p>
                  <div className="flex flex-col gap-3">
                    {Object.entries(results.files || {}).map(
                      ([filename, url]) => (
                        <Button
                          key={filename}
                          variant="outline"
                          onClick={() => window.open(url, "_blank")}
                        >
                          {filename}
                        </Button>
                      ),
                    )}
                    {Object.keys(results.files || {}).length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No downloadable files available yet.
                      </p>
                    )}
                  </div>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    File URLs expire in ~60 minutes.
                  </p>
                </Card>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
