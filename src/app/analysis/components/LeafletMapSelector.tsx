"use client";

import dynamic from "next/dynamic";
import type { TileInfo } from "@/types/jobs";

const LeafletMapSelectorClient = dynamic(
  () => import("./LeafletMapSelectorClient"),
  { ssr: false }
);

export default function LeafletMapSelector(props: {
  tiles?: TileInfo[];
  selectedTileId?: string | null;
  onTileSelect?: (tileId: string) => void;
  center?: { lat: number; lon: number } | null;
  height?: number;
}) {
  return <LeafletMapSelectorClient {...props} />;
}

