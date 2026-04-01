export type ChangeType =
  | "deforestation"
  | "urban_expansion"
  | "encroachment";

export type ResultChangeType = "deforestation" | "urban" | "encroachment";

export type JobStatus =
  | "Queued"
  | "Processing"
  | "Completed"
  | "Failed"
  | "QUEUED"
  | "PROCESSING"
  | "DOWNLOADING"
  | "CALCULATING_NDVI"
  | "CALCULATING_NDBI"
  | "DETECTING_CHANGES"
  | "CREATING_MAPS"
  | "GENERATING_PNG"
  | "UPLOADING"
  | "COMPLETED"
  | "FAILED";

export interface TileBounds {
  min_lon: number;
  min_lat: number;
  max_lon: number;
  max_lat: number;
}

export interface TileInfo {
  tile_id: string;
  name: string;
  center: { lat: number; lon: number };
  bbox: TileBounds;
}

export interface TileListResponse {
  tiles: TileInfo[];
}

export interface AnalyzeRequest {
  tile_id: string;
  start_year: number;
  end_year: number;
  change_types: ChangeType[];
  coordinates?: { lat: number; lon: number };
  tile_ids?: string[];
}

export interface AnalyzeResponse {
  job_id: string;
  status: JobStatus;
  message: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  progress?: number;
  message?: string;
  error_message?: string;
  coordinates?: { lat: number; lon: number };
  tile_id?: string;
  tile_ids?: string[];
  start_year?: number;
  end_year?: number;
  change_types?: Record<string, number>;
  changes_by_type?: Record<string, number>;
  total_changes?: number;
  results?: {
    files?: Record<string, string>;
    change_types?: Record<string, number>;
    changes_by_type?: Record<string, number>;
    total_changes?: number;
    statistics?: {
      deforestation_km2?: number;
      deforestation_pct?: number;
      urban_expansion_km2?: number;
      urban_expansion_pct?: number;
    };
  };
}

export interface GenerateDownloadRequest {
  job_id: string;
  file_type: string;
}

export interface GenerateDownloadResponse {
  download_url: string;
  expires_in: number;
}

export interface JobResultsResponse {
  job_id: string;
  status: "COMPLETED" | "Completed";
  coordinates: { lat: number; lon: number };
  tile_ids?: string[];
  change_types?: Record<string, number>;
  statistics: {
    deforestation_area_km2?: number;
    urban_expansion_km2?: number;
    encroachment_km2?: number;
  };
  total_changes: number;
  changes_by_type: {
    deforestation: number;
    urban: number;
    urban_expansion?: number;
    encroachment: number;
  };
  top_changes: Array<{
    type: ResultChangeType;
    area_km2: number;
    location: { lat: number; lon: number };
  }>;
  files: {
    [key: string]: string;
  };
}

export interface JobResultsSummary {
  total_area_changed_km2: number;
  deforestation_km2: number;
  urban_expansion_km2: number;
  total_changes: number;
  encroachment_km2?: number;
}

export interface JobHistoryItem {
  job_id: string;
  status: JobStatus;
  progress: number;
  message: string;
  coordinates: { lat: number; lon: number };
  tile_ids?: string[];
  start_year: number;
  end_year: number;
  change_types: ChangeType[];
  created_at: string;
  updated_at: string;
  results_summary?: JobResultsSummary;
}

