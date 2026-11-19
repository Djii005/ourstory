"use client";

import { useEffect, useState } from "react";
import { LetterSummary, OPEN_WHEN_CATEGORIES } from "@/types/letters";
import { Mail, Lock, Clock, Sparkles, CheckCheck } from "lucide-react";

interface EnvelopeCardProps {
  letter: LetterSummary;
  currentUserId: string;
  senderName: string;
  recipientName: string;
  onOpenLetter: (letter: LetterSummary) => void;
}

export function EnvelopeCard({
  letter,
  currentUserId,
  senderName,
  recipientName,
  onOpenLetter,
}: EnvelopeCardProps) {
  const isSender = letter.sender_id === currentUserId;
  const isScheduled = letter.delivery_type === "scheduled" && letter.open_at;

  const [isLocked, setIsLocked] = useState(() => {
    if (!isScheduled || !letter.open_at) return false;
    return new Date(letter.open_at).getTime() > Date.now();
  });

  const [countdownText, setCountdownText] = useState("");

  useEffect(() => {
    if (!isScheduled || !letter.open_at) return;

    const calculateCountdown = () => {
      const now = Date.now();
      const target = new Date(letter.open_at!).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsLocked(false);
        setCountdownText("Unlocked just now");
        return;
      }

      setIsLocked(true);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdownText(`Unlocks in ${days}d ${hours}h ${minutes}m`);
      } else {
        setCountdownText(`Unlocks in ${hours}h ${minutes}m ${seconds}s`);
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [isScheduled, letter.open_at]);

  const openWhenMeta = letter.open_when_category
    ? OPEN_WHEN_CATEGORIES.find((c) => c.id === letter.open_when_category)
    : null;

  const themeBorder = {
    classic: "border-amber-200 bg-amber-50/50",
    rose: "border-rose-200 bg-rose-50/50",
    midnight: "border-indigo-200 bg-indigo-50/50",
    vintage: "border-stone-200 bg-[#f7f2e7]/60",
  }[letter.theme] || "border-rose-200 bg-white/80";

  return (
    <div
      onClick={() => {
        if (!isLocked || isSender) {
          onOpenLetter(letter);
        }
      }}
      className={`glass-card rounded-3xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${themeBorder} ${
        isLocked && !isSender
          ? "cursor-not-allowed opacity-90"
          : "cursor-pointer hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]"
      }`}
    >
      {/* Wax Seal / Status Pill */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs border ${
              isLocked && !isSender
                ? "bg-stone-100 text-stone-500 border-stone-200"
                : letter.is_opened
                ? "bg-rose-100 text-rose-500 border-rose-200"
                : "bg-gradient-to-tr from-rose-500 to-pink-500 text-white border-rose-400 animate-pulse"
            }`}
          >
            {isLocked && !isSender ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-600 block">
              {isSender ? `To: ${recipientName}` : `From: ${senderName}`}
            </span>
            <span className="text-[10px] text-stone-400 font-medium">
              {new Date(letter.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5">
          {!letter.is_opened && !isSender && !isLocked && (
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black tracking-wider uppercase shadow-xs animate-bounce">
              New
            </span>
          )}
          {letter.is_opened && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200">
              <CheckCheck className="w-3 h-3" />
              <span>Read</span>
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="my-2">
        <h3 className="font-display font-black text-lg text-stone-800 line-clamp-1">
          {letter.title}
        </h3>
        {openWhenMeta && (
          <p className="text-xs font-bold text-rose-600 mt-1 flex items-center gap-1">
            <span>{openWhenMeta.emoji}</span>
            <span>{openWhenMeta.label}</span>
          </p>
        )}
      </div>

      {/* Footer / Lock Countdown */}
      <div className="mt-3 pt-3 border-t border-rose-100 flex items-center justify-between text-xs">
        {isLocked ? (
          <div className="flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span className="tabular-nums">{countdownText}</span>
          </div>
        ) : (
          <span className="text-stone-500 text-[11px] font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>Ready to read</span>
          </span>
        )}

        <span className="text-[11px] font-bold capitalize text-stone-400 bg-white/60 px-2 py-0.5 rounded-full border border-stone-100">
          {letter.theme} theme
        </span>
      </div>
    </div>
  );
}
