"use client";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngLiteral } from "leaflet";
import { useEffect } from "react";
import Sentinel2GridLayer from "./Sentinel2GridLayer";

/* 🌎 South America center */
const DEFAULT_CENTER: LatLngLiteral = {
  lat: -15.0,
  lng: -60.0,
};

/* 🌎 South America bounds */
const SOUTH_AMERICA_BOUNDS: [[number, number], [number, number]] = [
  [-56.0, -82.0],
  [13.0, -34.0],
];

// Sentinel-2 Cloudless mosaic
const sentinel2Url =
  "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg";
const streetsUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const terrainUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

function ClickHandler({ onPick }: { onPick: (value: LatLngLiteral) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapPanTo({ center }: { center?: { lat: number; lon: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.setView(
      { lat: center.lat, lng: center.lon },
      map.getZoom(),
      { animate: true }
    );
  }, [center, map]);
  return null;
}

export default function LeafletMapSelectorClient({
  onChange,
  center,
  height = 460,
}: {
  value: { lat: number; lon: number } | null;
  onChange: (value: { lat: number; lon: number }) => void;
  center?: { lat: number; lon: number } | null;
  height?: number;
}) {
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
          <LayersControl.Overlay checked name="Sentinel-2 Tile Grid">
            <Sentinel2GridLayer />
          </LayersControl.Overlay>

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

        {/* Click still returns lat/lon */}
        <ClickHandler
          onPick={(picked) =>
            onChange({ lat: picked.lat, lon: picked.lng })
          }
        />

        <MapPanTo center={center} />
      </MapContainer>
    </div>
  );
}