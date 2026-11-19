export interface PhotoRecord {
  id: string;
  storage_path: string;
  caption: string | null;
  album: string;
  taken_at: string;
  width: number | null;
  height: number | null;
  size_bytes: number;
  blur_data_url: string | null;
  created_by: string;
  created_at: string;
  signed_url?: string;
}

export interface StorageUsage {
  totalBytes: number;
  maxBytes: number;
  percentage: number;
  photoCount: number;
}
