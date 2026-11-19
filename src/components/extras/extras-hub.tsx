"use client";

import { useState } from "react";
import { BucketItem, DailyQuestion, DailyAnswer } from "@/types/extras";
import { BucketList } from "./bucket-list";
import { DailyQuestionCard } from "./daily-question-card";
import { Sparkles, Calendar, ListCheck } from "lucide-react";

interface ExtrasHubProps {
  bucketItems: BucketItem[];
  todayQuestion: DailyQuestion | null;
  todayAnswers: DailyAnswer[];
  currentUserId: string;
  partnerId: string;
  currentUserName: string;
  partnerName: string;
}

export function ExtrasHub({
  bucketItems,
  todayQuestion,
  todayAnswers,
  currentUserId,
  partnerId,
  currentUserName,
  partnerName,
}: ExtrasHubProps) {
  const [activeTab, setActiveTab] = useState<"daily" | "bucket">("daily");

  const hasAnsweredToday = todayAnswers.some((a) => a.user_id === currentUserId);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12 max-w-2xl mx-auto">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-800 flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <span>Extras & Daily Moments</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
          Daily blind-reveal prompts and our dream bucket list with a random date picker.
        </p>
      </div>

      {/* Switcher Tabs */}
      <div className="glass-card rounded-2xl p-1.5 border border-rose-200/70 grid grid-cols-2 gap-1.5 bg-white/70">
        <button
          onClick={() => setActiveTab("daily")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "daily"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm scale-[1.01]"
              : "text-stone-600 hover:bg-rose-50"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily Question</span>
          {!hasAnsweredToday && todayQuestion && (
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("bucket")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "bucket"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm scale-[1.01]"
              : "text-stone-600 hover:bg-rose-50"
          }`}
        >
          <ListCheck className="w-4 h-4" />
          <span>Bucket List & Picker</span>
        </button>
      </div>

      {activeTab === "daily" ? (
        <DailyQuestionCard
          todayQuestion={todayQuestion}
          initialAnswers={todayAnswers}
          currentUserId={currentUserId}
          partnerId={partnerId}
          currentUserName={currentUserName}
          partnerName={partnerName}
        />
      ) : (
        <BucketList
          initialItems={bucketItems}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
