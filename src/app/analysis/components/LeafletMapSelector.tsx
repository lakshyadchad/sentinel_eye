"use client";

import dynamic from "next/dynamic";
import type { TileBounds, TileInfo } from "@/types/jobs";

const LeafletMapSelectorClient = dynamic(
  () => import("./LeafletMapSelectorClient"),
  { ssr: false }
);

export default function LeafletMapSelector(props: {
  tiles?: TileInfo[];
  selectedTileId?: string | null;
  selectedTileBounds?: TileBounds | null;
  focusBounds?: TileBounds | null;
  onTileSelect?: (tile: TileInfo) => void;
  center?: { lat: number; lon: number } | null;
  height?: number;
}) {
  return <LeafletMapSelectorClient {...props} />;
}

