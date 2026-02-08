"use client";

import type { JobHistoryItem } from "@/types/jobs";
import Link from "next/link";

export default function DataLogsTable({ logs }: { logs: JobHistoryItem[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm overflow-hidden">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
        Analysis Records
      </p>

      <div className="overflow-x-auto rounded-xl border border-border bg-background/50">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left p-4 font-bold uppercase text-[10px] tracking-wider">
                Job ID
              </th>
              <th className="text-left p-4 font-bold uppercase text-[10px] tracking-wider">
                Date Range
              </th>
              <th className="text-left p-4 font-bold uppercase text-[10px] tracking-wider">
                Status
              </th>
              <th className="text-left p-4 font-bold uppercase text-[10px] tracking-wider">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {logs.length === 0 ? (
              <tr>
                <td
                  className="p-8 text-center text-muted-foreground font-medium"
                  colSpan={4}  // ← changed from 5 to 4
                >
                  No scan logs found. Run a scan from Map Analysis first.
                </td>
              </tr>
            ) : (
              logs.map((s) => (
                <tr
                  key={s.job_id}
                  className="text-foreground/80 hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4 font-mono font-bold text-xs">
                    {s.job_id}
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {s.start_year} → {s.end_year}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={[
                        "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter",
                        s.status === "Failed"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                          : s.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
                      ].join(" ")}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/scan-result?job_id=${s.job_id}`}
                      className="rounded-lg border border-border bg-secondary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all inline-block shadow-sm"
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