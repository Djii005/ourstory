"use client";

import { useEffect, useState } from "react";
import { calculateTimeTogether, TimeBreakdown } from "@/lib/utils/date-calculator";

interface LiveCounterProps {
  startDate: string;
  partner1: string;
  partner2: string;
}

export function LiveCounter({ startDate, partner1, partner2 }: LiveCounterProps) {
  const [time, setTime] = useState<TimeBreakdown | null>(null);

  useEffect(() => {
    setTime(calculateTimeTogether(startDate));
    const interval = setInterval(() => {
      setTime(calculateTimeTogether(startDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  // Format est date
  const estDateString = (() => {
    try {
      const d = new Date(startDate);
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      return `EST. ${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    } catch {
      return `EST. ${startDate}`;
    }
  })();

  if (!time) {
    return (
      <div className="arch-card hero-bento animate-pulse text-center p-8">
        <div className="h-6 bg-[var(--line-hairline)] rounded-full w-48 mx-auto mb-4" />
        <div className="h-24 bg-[var(--bg-subtle)] rounded-2xl w-full" />
      </div>
    );
  }

  // Astrolabe calculations
  const daysInCycle = 365;
  const currentCycleDays = time.totalDays % daysInCycle;
  const orbitPct = Math.min(100, Math.max(0, (currentCycleDays / daysInCycle) * 100));
  const circleCircumference = 339.29;
  const strokeDashoffset = circleCircumference * (1 - orbitPct / 100);
  const nextYearGoal = time.years + 1;

  const units = [
    { label: "Years", value: time.years },
    { label: "Months", value: time.months },
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Mins", value: time.minutes },
    { label: "Secs", value: time.seconds },
  ];

  return (
    <div className="arch-card hero-bento relative">
      {/* Corner Botanical Flourishes */}
      <svg className="leaf-flourish lf-tl" viewBox="0 0 24 24" aria-hidden="true">
        <use href="#botanicalLeaf" />
      </svg>
      <svg className="leaf-flourish lf-tr" viewBox="0 0 24 24" aria-hidden="true">
        <use href="#botanicalLeaf" />
      </svg>
      <svg className="leaf-flourish lf-bl" viewBox="0 0 24 24" aria-hidden="true">
        <use href="#botanicalLeaf" />
      </svg>
      <svg className="leaf-flourish lf-br" viewBox="0 0 24 24" aria-hidden="true">
        <use href="#botanicalLeaf" />
      </svg>

      <div className="hero-top-grid">
        <div>
          {/* Gold Hairline Wings Flanking Twin-Leaf Crest */}
          <div className="editorial-couple-lockup">
            <span className="hairline-wing" />
            <span className="couple-names-display">
              <span>{partner1.toUpperCase()}</span>
              <svg
                width="22"
                height="16"
                viewBox="0 0 24 18"
                style={{ color: "var(--accent-gold)", flexShrink: 0 }}
                aria-hidden="true"
              >
                <use href="#twinLeafEmblem" />
              </svg>
              <span className="couple-amp">&amp;</span>
              <span>{partner2.toUpperCase()}</span>
            </span>
            <span className="hairline-wing right" />
          </div>

          <div className="archival-tag">
            <span>CHAPTER I</span>
            <span>&bull;</span>
            <span>{estDateString}</span>
          </div>

          <h1 className="hero-editorial-title">
            Every Day <span className="hero-editorial-accent">Written Together</span>
          </h1>

          {/* Vertical Gold-Framed Counter Plaque */}
          <div className="counter-plaque">
            <span className="plaque-pillar" aria-hidden="true" />
            <span className="plaque-num">{time.totalDays.toLocaleString()}</span>
            <span className="plaque-pillar" aria-hidden="true" />
            <div className="plaque-copy-stack">
              <span className="plaque-unit">days side by side</span>
              <span className="plaque-poetic-sub">
                {String(time.months).padStart(2, "0")} months &amp; {String(time.days).padStart(2, "0")} days of choosing each other
              </span>
            </div>
          </div>
        </div>

        {/* Gilded Celestial Astrolabe Dial */}
        <div className="astrolabe-widget">
          <div className="astrolabe-svg-wrap">
            <svg width="146" height="146" viewBox="0 0 146 146">
              <defs>
                <linearGradient id="astrolabeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="52%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#d4af37" />
                </linearGradient>
              </defs>
              {/* Outer Gold Astrolabe Ring & Cardinal Ticks */}
              <circle
                cx="73"
                cy="73"
                r="66"
                fill="none"
                stroke="var(--line-hairline)"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
              <line x1="73" y1="3" x2="73" y2="11" stroke="var(--accent-gold)" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="73" y1="135" x2="73" y2="143" stroke="var(--accent-gold)" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="3" y1="73" x2="11" y2="73" stroke="var(--accent-gold)" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="135" y1="73" x2="143" y2="73" stroke="var(--accent-gold)" strokeWidth="1.4" strokeLinecap="round" />
              {/* Inner Dashed Track */}
              <circle
                cx="73"
                cy="73"
                r="54"
                fill="none"
                stroke="var(--line-strong)"
                strokeWidth="7.5"
                strokeDasharray="2 3.5"
              />
              {/* Active Rose-to-Gold Progress Arc */}
              <circle
                cx="73"
                cy="73"
                r="54"
                fill="none"
                stroke="url(#astrolabeGrad)"
                strokeWidth="7.5"
                strokeLinecap="round"
                strokeDasharray={circleCircumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 73 73)"
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
            <div className="astrolabe-center-text">
              <div className="astrolabe-pct">{orbitPct.toFixed(1)}%</div>
              <div className="astrolabe-sub">TO YEAR {nextYearGoal}</div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: "8px" }}>
            <div style={{ fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.02em" }}>
              Celestial Astrolabe
            </div>
            <div
              style={{
                fontSize: "0.69rem",
                color: "var(--accent-gold)",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
              }}
            >
              {currentCycleDays} / {daysInCycle} DAYS
            </div>
          </div>
        </div>
      </div>

      {/* 6 Live Tabular Digit Boxes */}
      <div className="capsules-grid">
        {units.map((unit) => (
          <div key={unit.label} className="time-capsule">
            <div className="capsule-val">{String(unit.value).padStart(2, "0")}</div>
            <div className="capsule-lbl">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
