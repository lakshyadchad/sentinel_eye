"use client";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Rectangle,
  Marker,
  useMap,
} from "react-leaflet";
import { divIcon } from "leaflet";
import type { LatLngLiteral, LatLngBoundsExpression } from "leaflet";
import { Fragment, useEffect, useMemo } from "react";
import type { TileInfo } from "@/types/jobs";

const DEFAULT_CENTER: LatLngLiteral = {
  lat: -15.0,
  lng: -60.0,
};

const SOUTH_AMERICA_BOUNDS: [[number, number], [number, number]] = [
  [-56.0, -82.0],
  [13.0, -34.0],
];

const sentinel2Url =
  "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg";
const streetsUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const terrainUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

function MapViewport({
  center,
  selectedTileBounds,
}: {
  center?: { lat: number; lon: number } | null;
  selectedTileBounds?: LatLngBoundsExpression | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (selectedTileBounds) {
      map.fitBounds(selectedTileBounds, { padding: [24, 24], animate: true });
      return;
    }
    if (center) {
      map.setView({ lat: center.lat, lng: center.lon }, map.getZoom(), {
        animate: true,
      });
    }
  }, [center, selectedTileBounds, map]);

  return null;
}

export default function LeafletMapSelectorClient({
  tiles = [],
  selectedTileId,
  onTileSelect,
  center,
  height = 460,
}: {
  tiles?: TileInfo[];
  selectedTileId?: string | null;
  onTileSelect?: (tileId: string) => void;
  center?: { lat: number; lon: number } | null;
  height?: number;
}) {
  const selectedTile = useMemo(
    () => tiles.find((tile) => tile.tile_id === selectedTileId) || null,
    [tiles, selectedTileId],
  );

  const selectedBounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!selectedTile) return null;
    return [
      [selectedTile.bbox.min_lat, selectedTile.bbox.min_lon],
      [selectedTile.bbox.max_lat, selectedTile.bbox.max_lon],
    ];
  }, [selectedTile]);

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden relative z-0"
      style={{ height }}
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={4}
        minZoom={3}
        maxZoom={15}
        maxBounds={SOUTH_AMERICA_BOUNDS}
        maxBoundsViscosity={0.8}
        scrollWheelZoom
        className="h-full w-full z-0"
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

        {tiles.map((tile) => {
          const bounds: LatLngBoundsExpression = [
            [tile.bbox.min_lat, tile.bbox.min_lon],
            [tile.bbox.max_lat, tile.bbox.max_lon],
          ];
          const isSelected = tile.tile_id === selectedTileId;

          const center: [number, number] = [
            (tile.bbox.min_lat + tile.bbox.max_lat) / 2,
            (tile.bbox.min_lon + tile.bbox.max_lon) / 2,
          ];

          const tileLabelIcon = divIcon({
            className: "tile-id-label bg-transparent border-none",
            html: `<div style="
              color: #ffffff;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.04em;
              text-shadow: 0 1px 3px rgba(0,0,0,0.9);
              white-space: nowrap;
              text-align: center;
              line-height: 1.2;
            ">${tile.tile_id}</div>`,
            iconSize: [120, 30],     // wide enough for most tile IDs (e.g. 20MPS, 21LTK)
            iconAnchor: [60, 15],    // center: half of width & half of height
          });

          return (
            <Fragment key={tile.tile_id}>
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
                  click: () => onTileSelect?.(tile.tile_id),
                }}
              />
              <Marker
                position={center}
                icon={tileLabelIcon}
                interactive={false} // prevent click interference
              />
            </Fragment>
          );
        })}

        <MapViewport center={center} selectedTileBounds={selectedBounds} />
      </MapContainer>
    </div>
  );
}
