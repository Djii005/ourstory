"use client";

import { useEffect, useState } from "react";
import {
  getNextAnniversary,
  getNextMonthsary,
  CountdownInfo,
} from "@/lib/utils/date-calculator";
import { Sparkles, CalendarHeart } from "lucide-react";

interface CountdownsProps {
  startDate: string;
}

export function Countdowns({ startDate }: CountdownsProps) {
  const [anniversary, setAnniversary] = useState<CountdownInfo | null>(null);
  const [monthsary, setMonthsary] = useState<CountdownInfo | null>(null);

  useEffect(() => {
    const update = () => {
      setAnniversary(getNextAnniversary(startDate));
      setMonthsary(getNextMonthsary(startDate));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [startDate]);

  if (!anniversary || !monthsary) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  const yearlyPct = Math.max(0, Math.min(100, Math.round(((365 - anniversary.days) / 365) * 100)));
  const monthlyPct = Math.max(0, Math.min(100, Math.round(((30 - monthsary.days) / 30) * 100)));

  const formatTarget = (d: Date) =>
    d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="countdowns-grid grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
      {/* Yearly Milestone Card */}
      <div className="arch-card countdown-card relative">
        <svg className="leaf-flourish lf-tr" viewBox="0 0 24 24" aria-hidden="true">
          <use href="#botanicalLeaf" />
        </svg>

        <div className="cd-header">
          <div className="cd-badge-icon dither-fill">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="cd-kicker">YEARLY MILESTONE</div>
            <div className="cd-title">{anniversary.label}</div>
          </div>
        </div>

        <div className="cd-live-line">
          <span className="cd-days-big">{anniversary.days}</span>
          <span className="cd-hms">
            days, {pad(anniversary.hours)}h {pad(anniversary.minutes)}m {pad(anniversary.seconds)}s
          </span>
        </div>

        <div className="cd-footer-bar">
          <div className="dither-progress-track">
            <div
              className="dither-progress-fill dither-fill"
              style={{ width: `${yearlyPct}%` }}
            />
          </div>
          <div className="cd-target-row">
            <span>Target: {formatTarget(anniversary.targetDate)}</span>
            <span>{yearlyPct}%</span>
          </div>
        </div>
      </div>

      {/* Monthly Celebration Card */}
      <div className="arch-card countdown-card relative">
        <svg className="leaf-flourish lf-tr" viewBox="0 0 24 24" aria-hidden="true">
          <use href="#botanicalLeaf" />
        </svg>

        <div className="cd-header">
          <div className="cd-badge-icon monthly dither-fill">
            <CalendarHeart className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="cd-kicker monthly">MONTHLY CELEBRATION</div>
            <div className="cd-title">Next Monthsary</div>
          </div>
        </div>

        <div className="cd-live-line">
          <span className="cd-days-big monthly">{monthsary.days}</span>
          <span className="cd-hms">
            days, {pad(monthsary.hours)}h {pad(monthsary.minutes)}m {pad(monthsary.seconds)}s
          </span>
        </div>

        <div className="cd-footer-bar">
          <div className="dither-progress-track">
            <div
              className="dither-progress-fill monthly dither-fill"
              style={{ width: `${monthlyPct}%` }}
            />
          </div>
          <div className="cd-target-row">
            <span>Target: {formatTarget(monthsary.targetDate)}</span>
            <span>{monthlyPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
