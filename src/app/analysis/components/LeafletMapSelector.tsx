"use client";

import dynamic from "next/dynamic";

const LeafletMapSelectorClient = dynamic(
  () => import("./LeafletMapSelectorClient"),
  { ssr: false }
);

export default function LeafletMapSelector(props: {
  selectedTileIds: string[];
  onTileSelectionChange: (tileIds: string[]) => void;
  center?: { lat: number; lon: number } | null;
  height?: number;
}) {
  return <LeafletMapSelectorClient {...props} />;
}
