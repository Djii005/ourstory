"use client";

import { useEffect, useState } from "react";
import { LetterSummary } from "@/types/letters";
import { createClient } from "@/lib/supabase/client";
import { triggerRomanticConfetti } from "@/lib/utils/milestones";
import { X, Heart, Lock, Calendar, Sparkles } from "lucide-react";

interface LetterReaderProps {
  letter: LetterSummary;
  currentUserId: string;
  senderName: string;
  recipientName: string;
  onClose: () => void;
  onMarkRead: (letterId: string) => void;
}

export function LetterReader({
  letter,
  currentUserId,
  senderName,
  recipientName,
  onClose,
  onMarkRead,
}: LetterReaderProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnsealed, setIsUnsealed] = useState(letter.is_opened);
  const [animatingOpen, setAnimatingOpen] = useState(false);
  const supabase = createClient();
  const isRecipient = letter.recipient_id === currentUserId;

  useEffect(() => {
    async function fetchLetterContent() {
      setLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from("letter_contents")
        .select("content_html")
        .eq("letter_id", letter.id)
        .maybeSingle();

      if (fetchErr) {
        setError("This letter is securely locked by database rules.");
      } else if (!data) {
        setError("Content is sealed until delivery time.");
      } else {
        setContent(data.content_html);
      }
      setLoading(false);
    }

    fetchLetterContent();
  }, [letter.id, supabase]);

  const handleBreakSeal = async () => {
    setAnimatingOpen(true);
    triggerRomanticConfetti();

    setTimeout(async () => {
      setIsUnsealed(true);
      setAnimatingOpen(false);

      if (isRecipient && !letter.is_opened) {
        await supabase
          .from("letters")
          .update({
            is_opened: true,
            opened_at: new Date().toISOString(),
          })
          .eq("id", letter.id);

        onMarkRead(letter.id);
      }
    }, 600);
  };

  const fontClass = {
    handwriting: "font-script text-2xl sm:text-3xl leading-relaxed",
    serif: "font-display text-lg sm:text-xl leading-loose",
    clean: "font-body text-base leading-relaxed",
  }[letter.font_family] || "font-script text-2xl leading-relaxed";

  const stationeryTheme = {
    classic: "stationery-classic",
    rose: "stationery-rose",
    midnight: "stationery-midnight",
    vintage: "stationery-vintage",
  }[letter.theme] || "stationery-classic";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close letter"
          className="absolute -top-12 right-0 sm:-right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer z-50"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="glass-card rounded-3xl p-12 text-center text-stone-600 bg-white/90">
            <div className="w-12 h-12 border-3 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-display font-bold text-lg text-stone-800">Retrieving our letter...</p>
          </div>
        ) : error ? (
          <div className="glass-card rounded-3xl p-8 text-center bg-white border border-rose-200">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-500 mx-auto flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="font-display font-black text-xl text-stone-800">
              Sealed with Row Level Security
            </h3>
            <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto font-medium">
              {error}
            </p>
            {letter.open_at && (
              <p className="text-xs font-bold text-rose-500 mt-4 bg-rose-50 px-3 py-1 rounded-full inline-block">
                Opens on: {new Date(letter.open_at).toLocaleString()}
              </p>
            )}
          </div>
        ) : !isUnsealed && isRecipient ? (
          /* Sealed 3D Envelope Animation Trigger */
          <div className="glass-card rounded-3xl p-8 text-center bg-gradient-to-br from-[#fff7f7] to-[#fae6e6] border-2 border-rose-300/80 shadow-2xl relative overflow-hidden">
            <div className="max-w-md mx-auto space-y-6">
              <div className="relative inline-block my-4">
                <button
                  onClick={handleBreakSeal}
                  disabled={animatingOpen}
                  className="group relative cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-xl flex flex-col items-center justify-center border-4 border-rose-300 ring-8 ring-rose-200/50 group-hover:ring-rose-300">
                    <Heart className="w-8 h-8 fill-white animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-widest mt-1">
                      Break Seal
                    </span>
                  </div>
                  <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-spin" />
                </button>
              </div>

              <div>
                <span className="text-xs font-black text-rose-500 uppercase tracking-widest block mb-1">
                  Private Letter for You
                </span>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-800">
                  {letter.title}
                </h2>
                <p className="text-xs text-stone-500 font-medium mt-2">
                  Written by {senderName} with love &middot; Tap the wax seal to open
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Open Letter Paper */
          <div
            className={`rounded-3xl p-6 sm:p-10 border shadow-2xl relative transition-all animate-in zoom-in-95 duration-300 ${stationeryTheme}`}
          >
            {/* Header info */}
            <div className="flex items-center justify-between border-b pb-4 mb-6 border-current/15 text-xs opacity-75">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(letter.created_at).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <span className="font-semibold uppercase tracking-wider">
                For {recipientName}
              </span>
            </div>

            {/* Letter Title */}
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-6 tracking-tight">
              {letter.title}
            </h1>

            {/* Letter Body HTML */}
            <div
              className={`space-y-4 whitespace-pre-wrap break-words ${fontClass}`}
              dangerouslySetInnerHTML={{ __html: content || "" }}
            />

            {/* Footer Signature */}
            <div className="mt-10 pt-6 border-t border-current/15 flex items-center justify-between text-xs opacity-80">
              <div className="flex items-center gap-1.5 font-medium">
                <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
                <span>Forever yours, {senderName}</span>
              </div>
              <span className="italic capitalize">{letter.theme} stationery</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
