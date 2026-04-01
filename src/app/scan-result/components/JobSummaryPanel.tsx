"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ChangeType } from "@/types/jobs";

function formatMinutes(start?: string, end?: string) {
  if (!start || !end) return "Calculating...";
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return "Calculating...";
  const mins = Math.max(0, Math.round((endMs - startMs) / 60000));
  return `${mins} min`;
}

export default function JobSummaryPanel({
  jobId,
  startYear,
  endYear,
  changeTypes,
  submittedAt,
  completedAt,
  totalChanges,
  changesByType,
}: {
  jobId: string;
  startYear?: number;
  endYear?: number;
  changeTypes?: ChangeType[];
  submittedAt?: string;
  completedAt?: string;
  totalChanges?: number;
  changesByType?: {
    deforestation: number;
    urban: number;
    encroachment: number;
  };
}) {
  const periodLabel =
    startYear && endYear ? `${startYear} → ${endYear}` : "Unknown";
  const types = changeTypes && changeTypes.length > 0 ? changeTypes : [];

  return (
    <Card className="p-6 rounded-2xl border border-border shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
            Analysis Summary
          </p>
          <p className="text-xs text-muted-foreground">
            Time period: {periodLabel}
          </p>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p>Processing time: {formatMinutes(submittedAt, completedAt)}</p>
          <p>
            Job ID: <span className="font-mono">{jobId}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Change Types
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {types.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              Not specified
            </span>
          ) : (
            types.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type.replace("_", " ")}
              </Badge>
            ))
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
              Total Changes
            </p>
            <p className="text-lg font-semibold text-foreground">
              {totalChanges ?? 0}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
              Changes by Type
            </p>
            <div className="mt-1 space-y-1">
              <p>Deforestation: {changesByType?.deforestation ?? 0}</p>
              <p>Urban: {changesByType?.urban ?? 0}</p>
              <p>Encroachment: {changesByType?.encroachment ?? 0}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}