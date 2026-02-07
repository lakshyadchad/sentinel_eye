"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AnalysisHeader from "./components/AnalysisHeader";
import LeafletMapSelector from "./components/LeafletMapSelector";
import { useAnalyzeRegion } from "@/hooks/useAnalyzeRegion";
import { useJobHistory } from "@/hooks/useJobHistory";
import type { ChangeType } from "@/types/jobs";
import { getTileCenterById } from "@/hooks/sentinel2-rondonia-tiles";

const YEAR_OPTIONS = [2020, 2021, 2022, 2023, 2024];

export default function MapAnalysisPage() {
  const router = useRouter();
  const { run, loading, error } = useAnalyzeRegion();
  const { history } = useJobHistory();

  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number }>({
    lat: -10.0,
    lon: -63.0,
  });

  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number } | null>({
    lat: -10.0,
    lon: -63.0,
  });

  const [startYear, setStartYear] = useState(2021);
  const [endYear, setEndYear] = useState(2024);
  const [changeTypes, setChangeTypes] = useState<ChangeType[]>([
    "deforestation",
    "urban_expansion",
  ]);

  const canSubmit =
    selectedTileIds.length > 0 && changeTypes.length > 0 && endYear >= startYear;

  const recentJobs = useMemo(() => history.slice(0, 6), [history]);

  const toggleChangeType = (value: ChangeType) => {
    setChangeTypes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;

    const centerFromTile = getTileCenterById(selectedTileIds[0]);
    const res = await run({
      tile_ids: selectedTileIds,
      coordinates: centerFromTile ?? coordinates,
      start_year: startYear,
      end_year: endYear,
      change_types: changeTypes,
    });

    router.push(`/scan-result?job_id=${res.job_id}`);
  };

  return (
    <div className="text-foreground transition-colors duration-300">
      <div className="container mx-auto px-6 py-4">
        <AnalysisHeader />
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <LeafletMapSelector
              selectedTileIds={selectedTileIds}
              onTileSelectionChange={(nextIds) => {
                setSelectedTileIds(nextIds);
                const center = nextIds.length > 0 ? getTileCenterById(nextIds[0]) : null;
                if (center) {
                  setCoordinates(center);
                  setMapCenter(center);
                }
              }}
              center={mapCenter}
            />

            <Card className="p-6 rounded-2xl border border-border shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">
                    Selected Tile IDs
                  </p>
                  <div className="mt-3 min-h-16 rounded-xl border border-border bg-muted/30 p-3">
                    {selectedTileIds.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Click one or more Sentinel-2 grid tiles on the map.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedTileIds.map((tileId) => (
                          <span
                            key={tileId}
                            className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                          >
                            {tileId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Click a tile again to remove it. The analysis request sends these tile IDs.
                  </p>
                  {selectedTileIds.length === 0 && (
                    <p className="text-xs text-red-500 mt-2">Select at least one tile ID.</p>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">
                    Date Range
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Select
                      value={String(startYear)}
                      onValueChange={(value) => setStartYear(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Start year" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={String(endYear)}
                      onValueChange={(value) => setEndYear(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="End year" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {endYear < startYear && (
                    <p className="text-xs text-red-500 mt-2">
                      End year must be greater than or equal to start year.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">
                  Change Types
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  {(
                    [
                      { label: "Deforestation", value: "deforestation" },
                      { label: "Urban Expansion", value: "urban_expansion" },
                      { label: "Encroachment", value: "encroachment" },
                    ] as const
                  ).map((item) => (
                    <label
                      key={item.value}
                      className="flex items-center gap-2 rounded-full border border-border px-4 py-2 bg-muted/30 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={changeTypes.includes(item.value)}
                        onChange={() => toggleChangeType(item.value)}
                        className="accent-primary"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Submit to backend job queue. Results will appear once the job completes.
                </div>
                <Button disabled={!canSubmit || loading} onClick={handleSubmit} className="px-6">
                  {loading ? "Submitting..." : "Submit Analysis"}
                </Button>
              </div>

              {error && <div className="mt-4 text-sm text-red-500 font-medium">{error}</div>}
            </Card>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <Card className="p-5 rounded-2xl border border-border shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                Job History
              </p>
              <div className="mt-4 space-y-3">
                {recentJobs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No jobs yet. Run your first analysis.
                  </p>
                ) : (
                  recentJobs.map((job) => (
                    <button
                      key={job.job_id}
                      onClick={() => router.push(`/scan-result?job_id=${job.job_id}`)}
                      className="w-full text-left rounded-xl border border-border bg-muted/30 px-4 py-3 hover:bg-muted/50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-primary">
                          {job.job_id.slice(0, 10)}...
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {job.status}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {job.tile_ids && job.tile_ids.length > 0
                          ? job.tile_ids.join(", ")
                          : `${job.coordinates.lat.toFixed(2)}, ${job.coordinates.lon.toFixed(2)}`}{" "}
                        • {job.start_year}→{job.end_year}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}