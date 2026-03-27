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
const REGION_BOUNDS = {
  all: { min_lon: -66, min_lat: -28, max_lon: 143, max_lat: 40 },
  brazil: { min_lon: -66, min_lat: -17.5, max_lon: -58.5, max_lat: -7.5 },
  india: { min_lon: 73.5, min_lat: 17.0, max_lon: 82.5, max_lat: 28.5 },
  australia: { min_lon: 135.5, min_lat: -27.5, max_lon: 143.5, max_lat: -17.5 },
  china: { min_lon: 109.0, min_lat: 21.0, max_lon: 117.0, max_lat: 32.0 },
} as const;

function getFallbackTiles(): TileInfo[] {
  const baseTiles = SENTINEL2_TILES_RONDONIA.features
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

  const chinaCloneIds = new Set([
    "20MPS", "20MQS", "20MRS", "21MTM", "21MUM",
    "20LPR", "20LQR", "20LRR", "20LTL", "20LUL",
    "20LPQ", "20LQQ", "20LRQ", "21LTK",
    "20LPP", "20LQP", "20LRP", "21LTJ",
    "20LNN", "20LPN", "20LQN", "20LRN",
    "20LNM", "20LPM", "20LQM", "20LRM",
    "20LNL", "20LPL", "20LQL", "20LRL",
    "20LNK", "20LPK",
  ]);
  const chinaLatShift = 39;
  const chinaLonShift = 175;

  const source = baseTiles.filter((tile) => tile.center.lon < -50 && chinaCloneIds.has(tile.tile_id));
  const chinaTiles = source.map((tile, index) => ({
    ...tile,
    name: `China Clone ${String(index + 1).padStart(2, "0")} - ${tile.tile_id}`,
    center: {
      lat: tile.center.lat + chinaLatShift,
      lon: tile.center.lon + chinaLonShift,
    },
    bbox: {
      min_lon: tile.bbox.min_lon + chinaLonShift,
      min_lat: tile.bbox.min_lat + chinaLatShift,
      max_lon: tile.bbox.max_lon + chinaLonShift,
      max_lat: tile.bbox.max_lat + chinaLatShift,
    },
  }));
  const merged = [...baseTiles, ...chinaTiles];
  const deduped = new Map<string, TileInfo>();
  for (const tile of merged) {
    deduped.set(tileKey(tile), tile);
  }
  return Array.from(deduped.values());
}

function tileKey(tile: TileInfo) {
  return [
    tile.tile_id,
    tile.bbox.min_lon,
    tile.bbox.min_lat,
    tile.bbox.max_lon,
    tile.bbox.max_lat,
  ].join("|");
}

export default function MapAnalysisPage() {
  const router = useRouter();
  const { run, loading, error } = useAnalyzeRegion();
  const { history } = useJobHistory();

  const [tiles, setTiles] = useState<TileInfo[]>(() => getFallbackTiles());
  const [tilesLoading, setTilesLoading] = useState(false);

  const [selectedTileId, setSelectedTileId] = useState<string>("");
  const [selectedTileBounds, setSelectedTileBounds] = useState<TileInfo["bbox"] | null>(null);
  const [focusBounds, setFocusBounds] = useState<TileInfo["bbox"] | null>(REGION_BOUNDS.all);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number } | null>({
    lat: 3.0,
    lon: 20.0,
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
        const data = await getTiles();
        if (!mounted) return;
        if (Array.isArray(data.tiles) && data.tiles.length > 0) {
          setTiles((prev) => {
            const merged = [...prev];
            const seen = new Set(prev.map(tileKey));
            for (const tile of data.tiles) {
              const key = tileKey(tile);
              if (!seen.has(key)) {
                seen.add(key);
                merged.push(tile);
              }
            }
            return merged;
          });
        }
      } catch {
        // Keep local tiles silently if API tiles are unavailable in this deployment.
      } finally {
        if (mounted) setTilesLoading(false);
      }
    };

    loadTiles();
    return () => {
      mounted = false;
    };
  }, []);

  const selectableTiles = useMemo(() => {
    const unique = new Map<string, TileInfo>();
    for (const tile of tiles) {
      if (!unique.has(tile.tile_id)) unique.set(tile.tile_id, tile);
    }
    return Array.from(unique.values());
  }, [tiles]);

  const selectedTile = useMemo(
    () => selectableTiles.find((tile) => tile.tile_id === selectedTileId) || null,
    [selectableTiles, selectedTileId],
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

  const handleTileSelectById = (tileId: string) => {
    setSelectedTileId(tileId);
    const tile = selectableTiles.find((item) => item.tile_id === tileId);
    if (tile) {
      setMapCenter(tile.center);
      setSelectedTileBounds(tile.bbox);
      setFocusBounds(null);
    }
  };

  const handleTileSelectFromMap = (tile: TileInfo) => {
    setSelectedTileId(tile.tile_id);
    setMapCenter(tile.center);
    setSelectedTileBounds(tile.bbox);
    setFocusBounds(null);
  };

  const handleSubmit = async () => {
    if (!selectedTile || !canSubmit || loading) return;

    const res = await run({
      tile_id: selectedTile.tile_id,
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
              selectedTileBounds={selectedTileBounds}
              focusBounds={focusBounds}
              onTileSelect={handleTileSelectFromMap}
              center={selectedTile?.center ?? mapCenter}
            />

            <Card className="p-4 rounded-2xl border border-border shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">
                Region Focus
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { label: "All Regions", key: "all" },
                    { label: "Rondonia", key: "brazil" },
                    { label: "Aravalli", key: "india" },
                    { label: "Australia", key: "australia" },
                    { label: "China", key: "china" },
                  ] as const
                ).map((item) => (
                  <Button
                    key={item.key}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTileBounds(null);
                      setFocusBounds(REGION_BOUNDS[item.key]);
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </Card>

            <Card className="p-6 rounded-2xl border border-border shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">
                    Sentinel-2 Tile
                  </p>
                  <div className="mt-3">
                    <Select
                      value={selectedTileId}
                      onValueChange={handleTileSelectById}
                      disabled={tilesLoading || tiles.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={tilesLoading ? "Loading tiles..." : "Select a tile"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {selectableTiles.map((tile) => (
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

