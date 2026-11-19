"use client";

import { useState } from "react";
import { DailyQuestion, DailyAnswer } from "@/types/extras";
import { createClient } from "@/lib/supabase/client";
import { triggerRomanticConfetti } from "@/lib/utils/milestones";
import {
  Lock,
  Send,
  Heart,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface DailyQuestionCardProps {
  todayQuestion: DailyQuestion | null;
  initialAnswers: DailyAnswer[];
  currentUserId: string;
  partnerId: string;
  currentUserName: string;
  partnerName: string;
}

export function DailyQuestionCard({
  todayQuestion,
  initialAnswers,
  currentUserId,
  partnerId,
  currentUserName,
  partnerName,
}: DailyQuestionCardProps) {
  const [answers, setAnswers] = useState<DailyAnswer[]>(initialAnswers);
  const [myAnswerText, setMyAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const myAnswer = answers.find((a) => a.user_id === currentUserId);
  const partnerAnswer = answers.find((a) => a.user_id === partnerId);
  const bothAnswered = Boolean(myAnswer && partnerAnswer);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todayQuestion || !myAnswerText.trim()) return;

    setSubmitting(true);
    setError(null);

    const { data: newAns, error: insertErr } = await supabase
      .from("daily_answers")
      .insert({
        daily_question_id: todayQuestion.id,
        user_id: currentUserId,
        answer: myAnswerText.trim(),
      })
      .select()
      .single();

    if (insertErr) {
      setError(insertErr.message || "Failed to submit answer.");
      setSubmitting(false);
      return;
    }

    const { data: partnerData } = await supabase
      .from("daily_answers")
      .select("*")
      .eq("daily_question_id", todayQuestion.id)
      .eq("user_id", partnerId)
      .maybeSingle();

    const updated = [newAns];
    if (partnerData) {
      updated.push(partnerData);
      triggerRomanticConfetti();
    }

    setAnswers(updated);
    setMyAnswerText("");
    setSubmitting(false);
  };

  if (!todayQuestion) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center border border-dashed border-rose-200 bg-white/70">
        <Calendar className="w-10 h-10 text-rose-300 mx-auto mb-2" />
        <h3 className="font-display font-bold text-stone-700">
          No question scheduled for today
        </h3>
        <p className="text-xs text-stone-400 mt-1 font-medium">
          Check back tomorrow morning for a new thought!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-rose-200/70 relative overflow-hidden text-center space-y-4 bg-white/80 shadow-soft">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 text-xs font-black uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily Question &middot; {todayQuestion.question_date}</span>
        </div>

        <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-800 max-w-xl mx-auto leading-snug">
          &ldquo;{todayQuestion.question_text}&rdquo;
        </h2>

        {!myAnswer && (
          <form onSubmit={handleSubmitAnswer} className="max-w-md mx-auto space-y-3 pt-2">
            <textarea
              placeholder="Write your honest, heartfelt answer..."
              value={myAnswerText}
              onChange={(e) => setMyAnswerText(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-rose-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400/50 resize-none shadow-xs text-stone-800"
            />

            {error && (
              <p className="text-xs text-rose-500 font-bold">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs shadow-md shadow-rose-200/50 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Sealing..." : "Lock In My Answer"}</span>
            </button>
            <p className="text-[11px] text-stone-400 font-medium">
              Answers are kept hidden until both of you have answered!
            </p>
          </form>
        )}
      </div>

      {/* Answers Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* User's Answer Card */}
        <div className="glass-card rounded-3xl p-5 border border-rose-200/70 space-y-2 bg-white/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-rose-600">
              {currentUserName}&apos;s Answer
            </span>
            {myAnswer && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Submitted</span>
              </span>
            )}
          </div>

          {myAnswer ? (
            <p className="text-sm text-stone-700 font-medium whitespace-pre-wrap leading-relaxed pt-1">
              {myAnswer.answer}
            </p>
          ) : (
            <p className="text-xs text-stone-400 italic pt-2 font-medium">
              You haven&apos;t answered yet. Type your answer above!
            </p>
          )}
        </div>

        {/* Partner's Answer Card (Blind Reveal) */}
        <div className="glass-card rounded-3xl p-5 border border-rose-200/70 space-y-2 relative overflow-hidden bg-white/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-rose-600">
              {partnerName}&apos;s Answer
            </span>
            {bothAnswered ? (
              <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span>Revealed</span>
              </span>
            ) : partnerAnswer ? (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Answered &middot; Sealed
              </span>
            ) : (
              <span className="text-[10px] text-stone-400 font-medium">Waiting</span>
            )}
          </div>

          {!myAnswer ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-stone-600">
                Sealed by Postgres RLS
              </p>
              <p className="text-[11px] text-stone-400 max-w-xs mx-auto font-medium">
                Submit your own answer first to reveal what {partnerName} wrote!
              </p>
            </div>
          ) : !partnerAnswer ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center animate-pulse">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <p className="text-xs font-bold text-stone-600">
                Waiting for {partnerName}...
              </p>
              <p className="text-[11px] text-stone-400 max-w-xs mx-auto font-medium">
                Your answer is safely locked. The moment {partnerName} answers, both will unlock!
              </p>
            </div>
          ) : (
            <div className="pt-1 animate-in zoom-in-95">
              <p className="text-sm text-stone-700 font-medium whitespace-pre-wrap leading-relaxed">
                {partnerAnswer.answer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
