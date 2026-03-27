"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useJobHistory } from "@/hooks/useJobHistory";

export default function RecentScansTable() {
  const { history } = useJobHistory();
  const rows = history.slice(0, 6);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="p-6 border-b border-border">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          Recent Jobs
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-6 py-4 text-left">Job ID</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Range</th>
              <th className="px-6 py-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}  // ← changed from 5 to 4
                  className="px-6 py-8 text-center text-xs text-muted-foreground"
                >
                  No jobs yet. Start a new analysis to populate this table.
                </td>
              </tr>
            ) : (
              rows.map((job) => (
                <tr
                  key={job.job_id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs font-bold text-primary italic">
                    {job.job_id}
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-[10px]">
                      {job.status}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {job.start_year} → {job.end_year}
                  </td>

                  <td className="px-6 py-4">
                    <Link
                      href={`/scan-result?job_id=${job.job_id}`}
                      className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}