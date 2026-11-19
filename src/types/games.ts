export type JigsawDifficulty = "3x3" | "4x4" | "6x6" | "8x8";

export interface JigsawRecord {
  id: string;
  photo_id: string | null;
  photo_label: string;
  user_id: string;
  difficulty: JigsawDifficulty;
  time_seconds: number;
  moves: number;
  created_at: string;
}

export interface JigsawPiece {
  id: number;
  originalIndex: number;
  currentIndex: number;
  row: number;
  col: number;
  bgPosX: number;
  bgPosY: number;
}
