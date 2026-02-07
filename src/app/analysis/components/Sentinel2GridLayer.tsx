"use client";

import { GeoJSON } from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import { SENTINEL2_TILES_RONDONIA } from "@/hooks/sentinel2-rondonia-tiles";

export default function Sentinel2GridLayer({
  selectedTileIds,
  onToggleTile,
}: {
  selectedTileIds: string[];
  onToggleTile: (tileId: string) => void;
}) {
  const selected = new Set(selectedTileIds);

  return (
    <GeoJSON
      data={SENTINEL2_TILES_RONDONIA as GeoJsonObject}
      style={(feature) => {
        const id = feature?.properties?.id as string | undefined;
        const isSelected = !!id && selected.has(id);
        return {
          color: isSelected ? "#facc15" : "#00e5ff",
          weight: isSelected ? 2 : 1,
          dashArray: isSelected ? "2 2" : "4 4",
          fillColor: isSelected ? "#facc15" : "#00e5ff",
          fillOpacity: isSelected ? 0.18 : 0,
        };
      }}
      onEachFeature={(feature, layer) => {
        const id = feature.properties?.id;
        if (id) {
          layer.bindTooltip(id, {
            permanent: true,
            direction: "center",
            className: "sentinel-tile-label",
            opacity: 1,
          });
          layer.on("click", () => onToggleTile(id));
        }
      }}
    />
  );
}
