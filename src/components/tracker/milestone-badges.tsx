"use client";

import { useEffect, useState, useRef } from "react";
import { getMilestones, Milestone, triggerRomanticConfetti } from "@/lib/utils/milestones";
import { calculateTimeTogether } from "@/lib/utils/date-calculator";
import { CheckCircle2, Lock } from "lucide-react";

interface MilestoneBadgesProps {
  startDate: string;
}

export function MilestoneBadges({ startDate }: MilestoneBadgesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const time = calculateTimeTogether(startDate);
    return getMilestones(time.totalDays);
  });
  const hasTriggeredInitialConfetti = useRef(false);

  useEffect(() => {
    const time = calculateTimeTogether(startDate);
    const calculated = getMilestones(time.totalDays);
    setMilestones(calculated);

    if (!hasTriggeredInitialConfetti.current && calculated.some((m) => m.isUnlocked)) {
      hasTriggeredInitialConfetti.current = true;
    }
  }, [startDate]);

  const handleCardClick = (m: Milestone) => {
    if (m.isUnlocked) {
      triggerRomanticConfetti();
    }
  };

  return (
    <section>
      {/* Twin-Leaf Botanical Divider + Love Milestones */}
      <div className="hairline-divider">
        <div className="section-title-group">
          <span className="divider-twin-leaf">
            <svg width="24" height="18" viewBox="0 0 24 18" aria-hidden="true">
              <use href="#twinLeafEmblem" />
            </svg>
          </span>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
            Love Milestones
          </h2>
        </div>
        <div className="line" />
        <button
          type="button"
          className="confetti-trigger-btn"
          onClick={triggerRomanticConfetti}
          title="Celebrate with rose-gold confetti"
        >
          <span>&#10024;</span>
          <span>Tap for confetti</span>
        </button>
      </div>

      <div className="milestones-grid">
        {milestones.map((m) => (
          <div
            key={m.days}
            onClick={() => handleCardClick(m)}
            className={`milestone-card ${m.isUnlocked ? "unlocked cursor-pointer" : "locked"}`}
          >
            <div className="ms-top">
              <span className={`ms-pill ${m.isUnlocked ? "dither-fill" : ""}`}>
                {m.title.toUpperCase()}
              </span>
              {m.isUnlocked ? (
                <CheckCircle2 className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              )}
            </div>
            <div className="ms-desc">{m.description}</div>
            <div className="ms-foot">
              {m.isUnlocked ? "UNLOCKED • TAP TO CELEBRATE" : `IN ${m.daysRemaining} DAYS`}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
