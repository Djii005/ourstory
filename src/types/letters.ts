export type DeliveryType = "instant" | "scheduled" | "open_when";

export type LetterTheme = "classic" | "rose" | "midnight" | "vintage";

export type LetterFont = "handwriting" | "serif" | "clean";

export interface LetterSummary {
  id: string;
  sender_id: string;
  recipient_id: string;
  title: string;
  theme: LetterTheme;
  font_family: LetterFont;
  delivery_type: DeliveryType;
  open_when_category: string | null;
  open_at: string | null;
  is_opened: boolean;
  opened_at: string | null;
  created_at: string;
}

export interface LetterDetail extends LetterSummary {
  content?: string;
}

export const OPEN_WHEN_CATEGORIES = [
  { id: "sad", label: "Open when you are feeling sad", emoji: "🥺" },
  { id: "miss_me", label: "Open when you miss me", emoji: "💌" },
  { id: "cant_sleep", label: "Open when you can't sleep", emoji: "🌙" },
  { id: "need_laugh", label: "Open when you need a smile", emoji: "😊" },
  { id: "proud", label: "Open when you need a reminder of how proud I am", emoji: "✨" },
  { id: "mad", label: "Open when you are annoyed with me", emoji: "🕊️" },
  { id: "anniversary", label: "Open on our anniversary", emoji: "🥂" },
];
