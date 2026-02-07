export type ChangeType =
  | "deforestation"
  | "urban_expansion"
  | "encroachment";

export type ResultChangeType = "deforestation" | "urban" | "encroachment";

export type JobStatus = "Queued" | "Processing" | "Completed" | "Failed" | "COMPLETED";

export interface AnalyzeRequest {
  coordinates?: {
    lat: number;
    lon: number;
  };
  tile_ids?: string[];
  start_year: number;
  end_year: number;
  change_types: ChangeType[];
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
  coordinates?: { lat: number; lon: number };
  tile_ids?: string[];
  start_year?: number;
  end_year?: number;
}

export interface JobResultsResponse {
  job_id: string;
  status: "COMPLETED" | "Completed";
  coordinates: { lat: number; lon: number };
  tile_ids?: string[];
  statistics: {
    deforestation_area_km2?: number;
    urban_expansion_km2?: number;
    encroachment_km2?: number;
  };
  total_changes: number;
  changes_by_type: {
    deforestation: number;
    urban: number;
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
