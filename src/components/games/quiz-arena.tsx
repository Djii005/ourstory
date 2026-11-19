"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { triggerRomanticConfetti } from "@/lib/utils/milestones";
import {
  ArrowLeft,
  HelpCircle,
  Plus,
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  PenLine,
} from "lucide-react";

export interface QuizQuestionItem {
  id: string;
  creator_id: string;
  target_user_id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  created_at: string;
  answer?: {
    selected_option_index: number;
    is_correct: boolean;
  } | null;
}

interface QuizArenaProps {
  initialQuestions: QuizQuestionItem[];
  currentUserId: string;
  partnerId: string;
  currentUserName: string;
  partnerName: string;
}

export function QuizArena({
  initialQuestions,
  currentUserId,
  partnerId,
  currentUserName,
  partnerName,
}: QuizArenaProps) {
  const [questions, setQuestions] = useState<QuizQuestionItem[]>(initialQuestions);
  const [tab, setTab] = useState<"answer" | "write" | "scoreboard">("answer");

  // New question form state
  const [newQuestion, setNewQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const questionsForMe = questions.filter((q) => q.target_user_id === currentUserId);
  const questionsByMe = questions.filter((q) => q.creator_id === currentUserId);

  const correctCountForMe = questionsForMe.filter((q) => q.answer?.is_correct).length;
  const correctCountByPartner = questionsByMe.filter((q) => q.answer?.is_correct).length;

  const handleSelectAnswer = async (
    question: QuizQuestionItem,
    selectedIdx: number
  ) => {
    if (question.answer) return;

    const isCorrect = selectedIdx === question.correct_option_index;

    if (isCorrect) {
      triggerRomanticConfetti();
    }

    const { data: newAns, error: ansError } = await supabase
      .from("quiz_answers")
      .insert({
        quiz_question_id: question.id,
        user_id: currentUserId,
        selected_option_index: selectedIdx,
        is_correct: isCorrect,
      })
      .select()
      .single();

    if (!ansError && newAns) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? { ...q, answer: newAns } : q))
      );
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const validOptions = options.map((o) => o.trim());
    if (validOptions.some((o) => !o)) {
      setError("Please fill in all 4 options.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error: insertErr } = await supabase
      .from("quiz_questions")
      .insert({
        creator_id: currentUserId,
        target_user_id: partnerId,
        question: newQuestion.trim(),
        options: validOptions,
        correct_option_index: correctIndex,
      })
      .select()
      .single();

    if (insertErr || !data) {
      setError(insertErr?.message || "Failed to create question.");
      setSubmitting(false);
      return;
    }

    setQuestions((prev) => [data as QuizQuestionItem, ...prev]);
    setNewQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
    setSubmitting(false);
    setTab("answer");
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12 animate-in fade-in">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          prefetch
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games Hub</span>
        </Link>
        <span className="text-xs font-bold text-rose-500 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-full">
          <HelpCircle className="w-4 h-4" />
          <span>Couple Quiz</span>
        </span>
      </div>

      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-800 flex items-center gap-2">
          <span>How Well Do You Know Me?</span>
          <Sparkles className="w-5 h-5 text-rose-500" />
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
          Create customized trivia, guess your partner&apos;s secrets, and track scores.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card rounded-2xl p-1.5 border border-rose-200/70 grid grid-cols-3 gap-1.5 bg-white/70">
        <button
          onClick={() => setTab("answer")}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            tab === "answer"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs scale-[1.01]"
              : "text-stone-600 hover:bg-rose-50"
          }`}
        >
          <span>Answer ({questionsForMe.length})</span>
        </button>

        <button
          onClick={() => setTab("write")}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            tab === "write"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs scale-[1.01]"
              : "text-stone-600 hover:bg-rose-50"
          }`}
        >
          <span className="flex items-center justify-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Write</span>
          </span>
        </button>

        <button
          onClick={() => setTab("scoreboard")}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            tab === "scoreboard"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs scale-[1.01]"
              : "text-stone-600 hover:bg-rose-50"
          }`}
        >
          <span className="flex items-center justify-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Scores</span>
          </span>
        </button>
      </div>

      {/* TAB 1: Answer Partner's Questions */}
      {tab === "answer" && (
        <div className="space-y-4">
          {questionsForMe.length === 0 ? (
            <div className="glass-card rounded-3xl p-8 text-center border border-dashed border-rose-200 bg-white/70">
              <HelpCircle className="w-10 h-10 text-rose-300 mx-auto mb-2" />
              <h3 className="font-display font-bold text-stone-700">
                No questions from {partnerName} yet
              </h3>
              <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto font-medium">
                Ask {partnerName} to write some trivia about themselves, or tap &quot;Write&quot; to test them first!
              </p>
            </div>
          ) : (
            questionsForMe.map((q, qIdx) => {
              const isAnswered = Boolean(q.answer);

              return (
                <div
                  key={q.id}
                  className="glass-card rounded-3xl p-5 border border-rose-200/70 space-y-3 bg-white/80 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600">
                      Question {qIdx + 1}
                    </span>
                    {isAnswered && (
                      <span className="flex items-center gap-1 text-[11px] font-bold">
                        {q.answer?.is_correct ? (
                          <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Correct!</span>
                          </span>
                        ) : (
                          <span className="text-rose-500 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Oops!</span>
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-black text-base sm:text-lg text-stone-800">
                    {q.question}
                  </h3>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = q.answer?.selected_option_index === optIdx;
                      const isCorrectAnswer = optIdx === q.correct_option_index;

                      let btnStyle = "bg-white border-rose-200 hover:border-rose-400 text-stone-800";

                      if (isAnswered) {
                        if (isCorrectAnswer) {
                          btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold";
                        } else if (isSelected && !q.answer?.is_correct) {
                          btnStyle = "bg-rose-50 border-rose-400 text-rose-800 line-through opacity-80";
                        } else {
                          btnStyle = "opacity-50 border-stone-100 text-stone-500";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswered}
                          onClick={() => handleSelectAnswer(q, optIdx)}
                          className={`w-full p-3 rounded-2xl border text-xs sm:text-sm text-left transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-black flex items-center justify-center">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="font-semibold">{opt}</span>
                          </div>

                          {isAnswered && isCorrectAnswer && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Write a Question for Partner */}
      {tab === "write" && (
        <form
          onSubmit={handleCreateQuestion}
          className="glass-card rounded-3xl p-5 sm:p-6 border border-rose-200/70 space-y-4 bg-white/80 shadow-xs"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
            <PenLine className="w-4 h-4 text-rose-500" />
            <h3 className="font-display font-black text-base text-stone-800">
              Write a Question for {partnerName}
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Your Question
            </label>
            <input
              type="text"
              placeholder="e.g. What was our first meal together?"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-rose-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Options (Select the correct one)
            </label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={correctIndex === idx}
                  onChange={() => setCorrectIndex(idx)}
                  className="w-4 h-4 text-rose-500 accent-rose-500 cursor-pointer"
                  title="Mark as correct answer"
                />
                <input
                  type="text"
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  value={opt}
                  onChange={(e) => {
                    const next = [...options];
                    next[idx] = e.target.value;
                    setOptions(next);
                  }}
                  required
                  className="flex-1 px-3 py-2 rounded-2xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                />
              </div>
            ))}
          </div>

          {error && (
            <p className="text-xs text-rose-500 bg-rose-50 p-2.5 rounded-2xl font-bold">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Add Question to Quiz"}
          </button>
        </form>
      )}

      {/* TAB 3: Scoreboard */}
      {tab === "scoreboard" && (
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-5 border border-rose-200/70 text-center space-y-4 bg-white/80 shadow-xs">
            <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="font-display font-black text-lg text-stone-800">
              Quiz Match Scores
            </h3>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
                  {currentUserName}&apos;s Knowledge
                </span>
                <p className="font-display font-black text-2xl text-stone-800 mt-1">
                  {correctCountForMe} / {questionsForMe.length}
                </p>
                <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                  About {partnerName}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                  {partnerName}&apos;s Knowledge
                </span>
                <p className="font-display font-black text-2xl text-stone-800 mt-1">
                  {correctCountByPartner} / {questionsByMe.length}
                </p>
                <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                  About {currentUserName}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
