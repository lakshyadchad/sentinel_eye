"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getTiles } from "@/lib/api/analyzeService";
import type { ChangeType, TileInfo } from "@/types/jobs";
import { SENTINEL2_TILES_RONDONIA } from "@/hooks/sentinel2-rondonia-tiles";

const YEAR_OPTIONS = [2020, 2021, 2022, 2023, 2024];

function getFallbackTiles(): TileInfo[] {
  return SENTINEL2_TILES_RONDONIA.features
    .map((feature, index) => {
      const tileId = feature.properties?.id;
      if (!tileId || feature.geometry.type !== "Polygon") return null;
      const ring = feature.geometry.coordinates[0];
      if (!ring || ring.length === 0) return null;

      const longitudes = ring.map((point) => point[0]);
      const latitudes = ring.map((point) => point[1]);
      const min_lon = Math.min(...longitudes);
      const max_lon = Math.max(...longitudes);
      const min_lat = Math.min(...latitudes);
      const max_lat = Math.max(...latitudes);

      return {
        tile_id: tileId,
        name: `Tile ${String(index + 1).padStart(2, "0")} - ${tileId}`,
        center: {
          lat: (min_lat + max_lat) / 2,
          lon: (min_lon + max_lon) / 2,
        },
        bbox: { min_lon, min_lat, max_lon, max_lat },
      } satisfies TileInfo;
    })
    .filter((tile): tile is TileInfo => Boolean(tile));
}

export default function MapAnalysisPage() {
  const router = useRouter();
  const { run, loading, error } = useAnalyzeRegion();
  const { history } = useJobHistory();

  const [tiles, setTiles] = useState<TileInfo[]>([]);
  const [tilesError, setTilesError] = useState<string | null>(null);
  const [tilesLoading, setTilesLoading] = useState(true);

  const [selectedTileId, setSelectedTileId] = useState<string>("");
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

  useEffect(() => {
    let mounted = true;

    const loadTiles = async () => {
      try {
        setTilesLoading(true);
        setTilesError(null);
        const data = await getTiles();
        if (!mounted) return;
        setTiles(data.tiles || []);
      } catch {
        if (!mounted) return;
        const fallbackTiles = getFallbackTiles();
        setTiles(fallbackTiles);
        setTilesError("Tile API unavailable. Using local fallback tiles.");
      } finally {
        if (mounted) setTilesLoading(false);
      }
    };

    loadTiles();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedTile = useMemo(
    () => tiles.find((tile) => tile.tile_id === selectedTileId) || null,
    [tiles, selectedTileId],
  );

  const canSubmit = !!selectedTile && changeTypes.length > 0 && endYear >= startYear;
  const recentJobs = useMemo(() => history.slice(0, 6), [history]);

  const toggleChangeType = (value: ChangeType) => {
    setChangeTypes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const handleTileSelect = (tileId: string) => {
    setSelectedTileId(tileId);
    const tile = tiles.find((item) => item.tile_id === tileId);
    if (tile) {
      setMapCenter(tile.center);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTile || !canSubmit || loading) return;

    const res = await run({
      tile_id: selectedTile.tile_id,
      tile_ids: [selectedTile.tile_id],
      coordinates: selectedTile.center,
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
              tiles={tiles}
              selectedTileId={selectedTileId}
              onTileSelect={handleTileSelect}
              center={selectedTile?.center ?? mapCenter}
            />

            <Card className="p-6 rounded-2xl border border-border shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">
                    Sentinel-2 Tile
                  </p>
                  <div className="mt-3">
                    <Select
                      value={selectedTileId}
                      onValueChange={handleTileSelect}
                      disabled={tilesLoading || tiles.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={tilesLoading ? "Loading tiles..." : "Select a tile"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {tiles.map((tile) => (
                          <SelectItem key={tile.tile_id} value={tile.tile_id}>
                            {tile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTile ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Selected: {selectedTile.tile_id}. You can also click a tile directly on the map.
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Choose one tile from dropdown or map.
                    </p>
                  )}

                  {tilesError && (
                    <p className="text-xs text-amber-500 mt-2">{tilesError}</p>
                  )}
                  {!selectedTile && !tilesLoading && (
                    <p className="text-xs text-red-500 mt-2">Select a tile.</p>
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
                  Select tile, years, and change types. Backend processing starts after submission.
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
                          : `${job.coordinates.lat.toFixed(2)}, ${job.coordinates.lon.toFixed(2)}`} 
                        {" - "}
                        {job.start_year} to {job.end_year}
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

