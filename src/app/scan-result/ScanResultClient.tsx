"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    error,
    progress,
    statusText,
    isProcessing,
    isCompleted,
    queuedSince,
    refresh,
    resultImageUrl,
    isFetchingImage,
    refetchImage,
    changeMetrics,
    summaryStatistics,
    availableFileTypes,
    downloadFile,
  } = useJobPolling(jobId);
  const { history } = useJobHistory();
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  const jobFromHistory = useMemo(() => {
    if (!jobId) return null;
    return history.find((job) => job.job_id === jobId) ?? null;
  }, [history, jobId]);

  const visibleDownloadFiles = useMemo(
    () =>
      availableFileTypes.filter((file) => {
        const key = file.type.toLowerCase();
        return key !== "deforestation" && key !== "urban_expansion";
      }),
    [availableFileTypes],
  );

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
                {statusText}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Raw state: {status?.status || "POLLING"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Job ID: <span className="font-mono">{jobId}</span>
              </p>
            </div>
            <div className="w-full md:w-80">
              <ProgressBar value={progress} />
              <p className="mt-2 text-xs text-muted-foreground">{progress}% complete</p>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>}

          <div className="mt-3 space-y-3">
            <p className="text-sm text-muted-foreground">
              Polling backend status every 5 seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={refresh}>
                Refresh Status
              </Button>
              {isCompleted && (
                <Button variant="outline" onClick={refetchImage} disabled={isFetchingImage}>
                  {isFetchingImage ? "Refreshing Image..." : "Refresh PNG URL"}
                </Button>
              )}
            </div>

            {status?.status === "QUEUED" && queuedSince && Date.now() - queuedSince > 2 * 60 * 1000 && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-300">
                Job is taking longer than expected and is still queued.
              </div>
            )}
          </div>
        </Card>

        <JobSummaryPanel
          jobId={jobId}
          coordinates={status?.coordinates || jobFromHistory?.coordinates}
          startYear={status?.start_year || jobFromHistory?.start_year}
          endYear={status?.end_year || jobFromHistory?.end_year}
          changeTypes={jobFromHistory?.change_types}
          submittedAt={jobFromHistory?.created_at}
          completedAt={jobFromHistory?.updated_at}
          totalChanges={changeMetrics.totalChanges}
          changesByType={changeMetrics.changesByType}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {isCompleted && summaryStatistics && (
              <Card className="p-5 rounded-2xl border border-border mb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">
                  Land-Use Statistics
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    Deforestation:{" "}
                    <span className="font-semibold">
                      {summaryStatistics.deforestationKm2.toFixed(2)} km2
                    </span>{" "}
                    ({summaryStatistics.deforestationPct.toFixed(2)}%)
                  </p>
                  <p>
                    Urban Growth:{" "}
                    <span className="font-semibold">
                      {summaryStatistics.urbanExpansionKm2.toFixed(2)} km2
                    </span>{" "}
                    ({summaryStatistics.urbanExpansionPct.toFixed(2)}%)
                  </p>
                </div>
              </Card>
            )}

            <Card className="p-5 rounded-2xl border border-border">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">
                Analysis Visualization
              </p>
              {resultImageUrl ? (
                <img
                  src={resultImageUrl}
                  alt="Analysis result"
                  className="w-full rounded-lg border border-border"
                />
              ) : (
                <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                  {isProcessing
                    ? "PNG will appear after the job is completed."
                    : "No PNG URL yet. Use Refresh PNG URL."}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="p-5 rounded-2xl border border-border">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">
                Downloads
              </p>
              <div className="flex flex-col gap-3">
                {visibleDownloadFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {isCompleted
                      ? "No output files were returned for this job."
                      : "Files will appear after completion."}
                  </p>
                ) : (
                  visibleDownloadFiles.map((file) => (
                    <Button
                      key={file.type}
                      variant="outline"
                      disabled={!isCompleted || downloadingType === file.type}
                      onClick={async () => {
                        try {
                          setDownloadingType(file.type);
                          await downloadFile(file.type, file.sourceUrl);
                        } finally {
                          setDownloadingType(null);
                        }
                      }}
                    >
                      {downloadingType === file.type ? `Loading ${file.label}...` : file.label}
                    </Button>
                  ))
                )}
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Download links are generated on demand and expire.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
