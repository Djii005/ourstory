import confetti from "canvas-confetti";

export interface Milestone {
  days: number;
  title: string;
  description: string;
  isUnlocked: boolean;
  daysRemaining: number;
  progressPercent: number;
}

export const MILESTONE_TARGETS = [
  { days: 100, title: "100 Days", description: "Our first triple digit chapter" },
  { days: 200, title: "200 Days", description: "Two hundred sunsets together" },
  { days: 365, title: "1 Year", description: "365 days of unconditional love" },
  { days: 500, title: "500 Days", description: "Half a thousand magical days" },
  { days: 1000, title: "1,000 Days", description: "A grand millennium of us" },
];

export function getMilestones(totalDays: number): Milestone[] {
  return MILESTONE_TARGETS.map((m) => {
    const isUnlocked = totalDays >= m.days;
    const daysRemaining = Math.max(0, m.days - totalDays);
    const progressPercent = Math.min(100, Math.round((totalDays / m.days) * 100));

    return {
      days: m.days,
      title: m.title,
      description: m.description,
      isUnlocked,
      daysRemaining,
      progressPercent,
    };
  });
}

export function triggerRomanticConfetti() {
  confetti({
    particleCount: 75,
    spread: 68,
    origin: { y: 0.65 },
    colors: ["#e11d48", "#f43f5e", "#fb7185", "#c9963b", "#d4af37", "#f5c451"],
  });
}
