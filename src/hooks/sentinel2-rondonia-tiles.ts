import { FeatureCollection } from "geojson";

/**
 * APPROXIMATE Sentinel-2 tile footprints for Rondônia (UI / interaction use)
 * NOT for scientific analysis.
 */
export const SENTINEL2_TILES_RONDONIA: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    // ────────────── M BAND ──────────────
    tile("20MPS", box(-64, -8, -63, -9)),
    tile("20MQS", box(-63, -8, -62, -9)),
    tile("20MRS", box(-62, -8, -61, -9)),
    tile("21MTM", box(-61, -8, -60, -9)),
    tile("21MUM", box(-60, -8, -59, -9)),

    // ────────────── L BAND (row 1) ──────────────
    tile("20LPR", box(-65, -9, -64, -10)),
    tile("20LQR", box(-64, -9, -63, -10)),
    tile("20LRR", box(-63, -9, -62, -10)),
    tile("20LTL", box(-62, -9, -61, -10)),
    tile("20LUL", box(-61, -9, -60, -10)),

    // ────────────── L BAND (row 2) ──────────────
    tile("20LPQ", box(-65, -10, -64, -11)),
    tile("20LQQ", box(-64, -10, -63, -11)),
    tile("20LRQ", box(-63, -10, -62, -11)),
    tile("21LTK", box(-62, -10, -61, -11)),

    // ────────────── L BAND (row 3) ──────────────
    tile("20LPP", box(-65, -11, -64, -12)),
    tile("20LQP", box(-64, -11, -63, -12)),
    tile("20LRP", box(-63, -11, -62, -12)),
    tile("21LTJ", box(-62, -11, -61, -12)),

    // ────────────── L BAND (row 4) ──────────────
    tile("20LNN", box(-65, -12, -64, -13)),
    tile("20LPN", box(-64, -12, -63, -13)),
    tile("20LQN", box(-63, -12, -62, -13)),
    tile("20LRN", box(-62, -12, -61, -13)),

    // ────────────── L BAND (row 5) ──────────────
    tile("20LNM", box(-65, -13, -64, -14)),
    tile("20LPM", box(-64, -13, -63, -14)),
    tile("20LQM", box(-63, -13, -62, -14)),
    tile("20LRM", box(-62, -13, -61, -14)),

    // ────────────── L BAND (row 6) ──────────────
    tile("20LNL", box(-65, -14, -64, -15)),
    tile("20LPL", box(-64, -14, -63, -15)),
    tile("20LQL", box(-63, -14, -62, -15)),
    tile("20LRL", box(-62, -14, -61, -15)),

    // ────────────── L BAND (row 7) ──────────────
    tile("20LNK", box(-65, -15, -64, -16)),
    tile("20LPK", box(-64, -15, -63, -16)),
    tile("20LQK", box(-63, -15, -62, -16)),
    tile("20LRK", box(-62, -15, -61, -16)),

    // ────────────── L BAND (row 8) ──────────────
    tile("20LNJ", box(-65, -16, -64, -17)),
    tile("20LPJ", box(-64, -16, -63, -17)),
    tile("20LQJ", box(-63, -16, -62, -17)),
    tile("20LRJ", box(-62, -16, -61, -17)),
  ],
};

/* ─────────────────────────────────────────────── */

function box(w: number, n: number, e: number, s: number): [number, number][] {
  return [
    [w, n],
    [e, n],
    [e, s],
    [w, s],
  ];
}

function tile(
  id: string,
  corners: [number, number][]
): GeoJSON.Feature<GeoJSON.Polygon> {
  return {
    type: "Feature",
    properties: { id },
    geometry: {
      type: "Polygon",
      coordinates: [[...corners, corners[0]]],
    },
  };
}