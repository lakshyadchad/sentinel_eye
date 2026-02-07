"use client";

import { GeoJSON } from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import { SENTINEL2_TILES_RONDONIA } from "@/hooks/sentinel2-rondonia-tiles";

export default function Sentinel2GridLayer() {
  return (
    <GeoJSON
      data={SENTINEL2_TILES_RONDONIA as GeoJsonObject}
      style={{
        color: "#00e5ff",
        weight: 1,
        dashArray: "4 4",
        fillOpacity: 0,
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
        }
      }}
    />
  );
}