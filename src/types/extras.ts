export type BucketCategory =
  | "Date Ideas"
  | "Travel"
  | "Food & Cooking"
  | "Life Milestones"
  | "Spontaneous";

export interface BucketItem {
  id: string;
  title: string;
  category: BucketCategory;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface DailyQuestion {
  id: string;
  question_date: string;
  question_text: string;
}

export interface DailyAnswer {
  id: string;
  daily_question_id: string;
  user_id: string;
  answer: string;
  created_at: string;
}
