"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getNextAnniversary,
  getNextMonthsary,
  getNextBirthday,
  CountdownInfo,
  BirthdayCountdownInfo,
} from "@/lib/utils/date-calculator";
import { triggerRomanticConfetti } from "@/lib/utils/milestones";
import { Sparkles, CalendarHeart, Cake, ArrowRight, PartyPopper } from "lucide-react";

interface CountdownsProps {
  startDate: string;
  user1Birthday?: string | null;
  user2Birthday?: string | null;
  partner1Name?: string;
  partner2Name?: string;
}

export function Countdowns({
  startDate,
  user1Birthday,
  user2Birthday,
  partner1Name = "Adji",
  partner2Name = "Najwa",
}: CountdownsProps) {
  const [anniversary, setAnniversary] = useState<CountdownInfo | null>(null);
  const [monthsary, setMonthsary] = useState<CountdownInfo | null>(null);
  const [bday1, setBday1] = useState<BirthdayCountdownInfo | null>(null);
  const [bday2, setBday2] = useState<BirthdayCountdownInfo | null>(null);

  useEffect(() => {
    const update = () => {
      setAnniversary(getNextAnniversary(startDate));
      setMonthsary(getNextMonthsary(startDate));
      if (user1Birthday) {
        setBday1(getNextBirthday(user1Birthday, partner1Name));
      } else {
        setBday1(null);
      }
      if (user2Birthday) {
        setBday2(getNextBirthday(user2Birthday, partner2Name));
      } else {
        setBday2(null);
      }
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [startDate, user1Birthday, user2Birthday, partner1Name, partner2Name]);

  if (!anniversary || !monthsary) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  const yearlyPct = Math.max(0, Math.min(100, Math.round(((365 - anniversary.days) / 365) * 100)));
  const monthlyPct = Math.max(0, Math.min(100, Math.round(((30 - monthsary.days) / 30) * 100)));

  const formatTarget = (d: Date) =>
    d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  const birthdaysToRender = [bday1, bday2].filter(Boolean) as BirthdayCountdownInfo[];

  return (
    <div className="space-y-6 my-6">
      {/* 1. Relationship Milestones (Anniversary & Monthsary) */}
      <div className="countdown-duo-grid grid grid-cols-1 md:grid-cols-2 gap-5">
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

      {/* 2. Birthday Tracker (Separate Row Below) */}
      <div className={`countdown-duo-grid grid gap-5 ${birthdaysToRender.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
        {birthdaysToRender.length > 0 ? (
          birthdaysToRender.map((bday) => (
            <div key={bday.name} className="arch-card countdown-card relative">
              <svg className="leaf-flourish lf-tr" viewBox="0 0 24 24" aria-hidden="true">
                <use href="#botanicalLeaf" />
              </svg>

              <div className="cd-header">
                <div className="cd-badge-icon dither-fill bg-gradient-to-tr from-rose-500 to-amber-500 shadow-md">
                  <Cake className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="cd-kicker">
                    {bday.turningAge ? `TURNING ${bday.turningAge}` : "BIRTHDAY CELEBRATION"}
                  </div>
                  <div className="cd-title">{bday.label}</div>
                </div>
              </div>

              {bday.isToday ? (
                <div className="py-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs shadow-md mb-2">
                    <PartyPopper className="w-4 h-4" />
                    <span>IT&apos;S TODAY! HAPPY BIRTHDAY!</span>
                  </div>
                  <button
                    type="button"
                    onClick={triggerRomanticConfetti}
                    className="block text-xs font-bold text-[var(--accent-rose)] hover:underline cursor-pointer"
                  >
                    Trigger Birthday Confetti &hearts;
                  </button>
                </div>
              ) : (
                <div className="cd-live-line">
                  <span className="cd-days-big">{bday.days}</span>
                  <span className="cd-hms">
                    days, {pad(bday.hours)}h {pad(bday.minutes)}m {pad(bday.seconds)}s
                  </span>
                </div>
              )}

              <div className="cd-footer-bar">
                <div className="dither-progress-track">
                  <div
                    className="dither-progress-fill dither-fill"
                    style={{ width: `${bday.progressPct}%` }}
                  />
                </div>
                <div className="cd-target-row">
                  <span>Target: {formatTarget(bday.targetDate)}</span>
                  <span>{bday.progressPct}%</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="arch-card countdown-card relative flex flex-col justify-between md:col-span-2">
            <svg className="leaf-flourish lf-tr" viewBox="0 0 24 24" aria-hidden="true">
              <use href="#botanicalLeaf" />
            </svg>

            <div className="cd-header">
              <div className="cd-badge-icon dither-fill bg-gradient-to-tr from-amber-500 to-rose-400 shadow-md">
                <Cake className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="cd-kicker">BIRTHDAY TRACKER</div>
                <div className="cd-title">Track Our Birthdays</div>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed my-1">
              Add both of your birthdays in Sanctuary Settings to unlock live birthday countdowns, milestone age tracking, and celebration confetti.
            </p>

            <div className="cd-footer-bar pt-1">
              <Link
                href="/settings"
                prefetch
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-rose)] hover:text-[var(--accent-coral)] transition-colors"
              >
                <span>Add birthdays in Settings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
