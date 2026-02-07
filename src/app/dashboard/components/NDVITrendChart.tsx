"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useMemo } from "react";
import { useJobHistory } from "@/hooks/useJobHistory";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function buildSeries() {
  const now = new Date();
  const series: { month: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    series.push({ month: MONTHS[d.getMonth()], value: 0 });
  }
  return series;
}

export default function NDVITrendChart() {
  const { history } = useJobHistory();

  const data = useMemo(() => {
    const series = buildSeries();
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime();

    history.forEach((job) => {
      if (String(job.status).toUpperCase() !== "COMPLETED" || !job.results_summary) return;
      const ts = new Date(job.updated_at || job.created_at).getTime();
      if (Number.isNaN(ts) || ts < cutoff) return;
      const date = new Date(ts);
      const monthIndex = date.getMonth();
      const label = MONTHS[monthIndex];
      const bucket = series.find((s) => s.month === label);
      if (bucket) {
        bucket.value +=
          job.results_summary.total_area_changed_km2 ||
          job.results_summary.total_changes ||
          0;
      }
    });

    return series;
  }, [history]);

  const hasData = data.some((d) => d.value > 0);

  return (
    <div
      className="h-full rounded-2xl border border-border bg-card
                 p-4 sm:p-5 lg:p-6 shadow-sm"
    >
      {/* Header */}
      <div
        className="mb-5 sm:mb-6 lg:mb-8
                      flex flex-col sm:flex-row
                      gap-2 sm:items-center sm:justify-between"
      >
        <p
          className="text-[9px] sm:text-[10px]
                      font-black uppercase tracking-[0.2em]
                      text-muted-foreground"
        >
          NDVI Trend
        </p>

        <span
          className="w-fit text-[9px] sm:text-[10px]
                     py-1 px-2 rounded-md
                     bg-muted border border-border
                     text-muted-foreground uppercase"
        >
          6 Month Analysis
        </span>
      </div>

      {/* Chart */}
      <div className="h-[200px] sm:h-[220px] lg:h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              dy={10}
              tick={{
                fill: "hsl(var(--muted-foreground))",
                fontSize: 10,
              }}
            />

            <YAxis
              domain={[0, "auto"]}
              axisLine={false}
              tickLine={false}
              width={32}
              tick={{
                fill: "hsl(var(--muted-foreground))",
                fontSize: 10,
              }}
              tickFormatter={(v) => `${Number(v).toFixed(1)}`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
                borderRadius: "10px",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#10b981" }}
              cursor={{ stroke: "hsl(var(--border))" }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {hasData
          ? "Derived from completed job area-change summaries (km2)"
          : "Historical trends coming soon"}
      </p>
    </div>
  );
}
