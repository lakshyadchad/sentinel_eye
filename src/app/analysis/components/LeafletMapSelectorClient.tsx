"use client";

import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Rectangle,
  useMap,
} from "react-leaflet";
import type { LatLngLiteral, LatLngBoundsExpression } from "leaflet";
import { Fragment, useEffect, useMemo } from "react";
import type { TileBounds, TileInfo } from "@/types/jobs";

const DEFAULT_CENTER: LatLngLiteral = {
  lat: 3.0,
  lng: 20.0,
};

const BRAZIL_INDIA_AUSTRALIA_BOUNDS: [[number, number], [number, number]] = [
  [-60.0, -90.0],
  [40.0, 170.0],
];

const sentinel2Url =
  "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg";
const streetsUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const terrainUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

function MapViewport({
  center,
  focusBounds,
  selectedTileBounds,
}: {
  center?: { lat: number; lon: number } | null;
  focusBounds?: LatLngBoundsExpression | null;
  selectedTileBounds?: LatLngBoundsExpression | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (focusBounds) {
      map.fitBounds(focusBounds, { padding: [24, 24], animate: true });
      return;
    }

    if (selectedTileBounds) {
      map.fitBounds(selectedTileBounds, { padding: [24, 24], animate: true });
      return;
    }

    if (center) {
      map.setView(
        { lat: center.lat, lng: center.lon },
        map.getZoom(),
        { animate: true }
      );
    }
  }, [center, focusBounds, selectedTileBounds, map]);

  return null;
}

export default function LeafletMapSelectorClient({
  tiles = [],
  selectedTileId,
  selectedTileBounds,
  focusBounds,
  onTileSelect,
  center,
  height = 460,
}: {
  tiles?: TileInfo[];
  selectedTileId?: string | null;
  selectedTileBounds?: TileBounds | null;
  focusBounds?: TileBounds | null;
  onTileSelect?: (tile: TileInfo) => void;
  center?: { lat: number; lon: number } | null;
  height?: number;
}) {
  const mapFocusBounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!focusBounds) return null;
    return [
      [focusBounds.min_lat, focusBounds.min_lon],
      [focusBounds.max_lat, focusBounds.max_lon],
    ];
  }, [focusBounds]);

  const selectedBounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!selectedTileBounds) return null;
    return [
      [selectedTileBounds.min_lat, selectedTileBounds.min_lon],
      [selectedTileBounds.max_lat, selectedTileBounds.max_lon],
    ];
  }, [selectedTileBounds]);

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden relative z-0"
      style={{ height }}
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={2}
        minZoom={2}
        maxZoom={15}
        maxBounds={BRAZIL_INDIA_AUSTRALIA_BOUNDS}
        maxBoundsViscosity={0.8}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Sentinel-2 (10m)">
            <TileLayer
              url={sentinel2Url}
              maxZoom={15}
              attribution="© Sentinel-2 cloudless by EOX"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Streets">
            <TileLayer url={streetsUrl} />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Terrain">
            <TileLayer url={terrainUrl} />
          </LayersControl.BaseLayer>
        </LayersControl>

        {tiles.map((tile, index) => {
          const bounds: LatLngBoundsExpression = [
            [tile.bbox.min_lat, tile.bbox.min_lon],
            [tile.bbox.max_lat, tile.bbox.max_lon],
          ];
          const isSelected = tile.tile_id === selectedTileId;

          return (
            <Fragment key={`${tile.tile_id}-${index}`}>
              <Rectangle
                bounds={bounds}
                pathOptions={{
                  color: isSelected ? "#facc15" : "#22d3ee",
                  weight: isSelected ? 2 : 1.3,
                  dashArray: "6 4",
                  fillColor: isSelected ? "#facc15" : "#22d3ee",
                  fillOpacity: isSelected ? 0.18 : 0.03,
                }}
                eventHandlers={{
                  click: () => onTileSelect?.(tile),
                }}
              />
            </Fragment>
          );
        })}

        <MapViewport
          center={center}
          focusBounds={mapFocusBounds}
          selectedTileBounds={selectedBounds}
        />
      </MapContainer>
    </div>
  );
}
