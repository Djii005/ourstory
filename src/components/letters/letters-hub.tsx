"use client";

import { useState } from "react";
import Link from "next/link";
import { LetterSummary } from "@/types/letters";
import { EnvelopeCard } from "./envelope-card";
import { LetterReader } from "./letter-reader";
import { Mail, PenLine, Heart, Clock, Sparkles } from "lucide-react";

interface LettersHubProps {
  initialLetters: LetterSummary[];
  currentUserId: string;
  user1Id: string;
  user2Id: string;
  user1Name: string;
  user2Name: string;
}

export function LettersHub({
  initialLetters,
  currentUserId,
  user1Id,
  user2Id,
  user1Name,
  user2Name,
}: LettersHubProps) {
  const [letters, setLetters] = useState<LetterSummary[]>(initialLetters);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "open_when">("inbox");
  const [readingLetter, setReadingLetter] = useState<LetterSummary | null>(null);

  const isUser1 = currentUserId === user1Id;
  const currentUserName = isUser1 ? user1Name : user2Name;
  const partnerName = isUser1 ? user2Name : user1Name;

  const inboxLetters = letters.filter((l) => l.recipient_id === currentUserId);
  const sentLetters = letters.filter((l) => l.sender_id === currentUserId);
  const openWhenLetters = letters.filter(
    (l) => l.delivery_type === "open_when" && l.recipient_id === currentUserId
  );

  const unreadCount = inboxLetters.filter(
    (l) =>
      !l.is_opened &&
      (!l.open_at || new Date(l.open_at).getTime() <= Date.now())
  ).length;

  const handleMarkRead = (letterId: string) => {
    setLetters((prev) =>
      prev.map((l) =>
        l.id === letterId
          ? { ...l, is_opened: true, opened_at: new Date().toISOString() }
          : l
      )
    );
  };

  const displayedLetters = {
    inbox: inboxLetters,
    sent: sentLetters,
    open_when: openWhenLetters,
  }[activeTab];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-800 flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-sm">
              <Mail className="w-6 h-6 fill-white" />
            </div>
            <span>Love Letters</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Handwritten thoughts, scheduled seals, and timeless envelopes.
          </p>
        </div>

        <Link
          href="/letters/new"
          prefetch
          className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-200/60 transition-all active:scale-[0.98] cursor-pointer"
        >
          <PenLine className="w-4 h-4" />
          <span>Write a Letter</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-rose-200/70 pb-3">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "inbox"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs scale-[1.02]"
              : "text-stone-600 hover:bg-rose-50"
          }`}
        >
          <span>For Me</span>
          {unreadCount > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "inbox"
                  ? "bg-white text-rose-600"
                  : "bg-rose-500 text-white"
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("sent")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "sent"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs scale-[1.02]"
              : "text-stone-600 hover:bg-rose-50"
          }`}
        >
          <span>Sent by Me ({sentLetters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("open_when")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "open_when"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs scale-[1.02]"
              : "text-stone-600 hover:bg-rose-50"
          }`}
        >
          <span>Open When... ({openWhenLetters.length})</span>
        </button>
      </div>

      {/* Grid of Letters */}
      {displayedLetters.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center border border-dashed border-rose-300 bg-white/70">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 mx-auto flex items-center justify-center mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-stone-700 text-base">
            No letters here yet
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto font-medium">
            {activeTab === "inbox"
              ? `${partnerName} hasn't sent any letters here yet. Why not surprise them first?`
              : activeTab === "sent"
              ? "You haven't written any letters yet. Pen your first one today!"
              : "No 'Open When...' envelopes saved yet."}
          </p>
          <div className="mt-5">
            <Link
              href="/letters/new"
              prefetch
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-2xl bg-rose-100 text-rose-600 font-bold text-xs hover:bg-rose-200 transition-colors"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Compose First Letter</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedLetters.map((letter) => {
            const isSender = letter.sender_id === currentUserId;
            const cardSenderName = isSender ? currentUserName : partnerName;
            const cardRecipientName = isSender ? partnerName : currentUserName;

            return (
              <EnvelopeCard
                key={letter.id}
                letter={letter}
                currentUserId={currentUserId}
                senderName={cardSenderName}
                recipientName={cardRecipientName}
                onOpenLetter={(sel) => setReadingLetter(sel)}
              />
            );
          })}
        </div>
      )}

      {/* Reader Modal */}
      {readingLetter && (
        <LetterReader
          letter={readingLetter}
          currentUserId={currentUserId}
          senderName={
            readingLetter.sender_id === currentUserId
              ? currentUserName
              : partnerName
          }
          recipientName={
            readingLetter.recipient_id === currentUserId
              ? currentUserName
              : partnerName
          }
          onClose={() => setReadingLetter(null)}
          onMarkRead={handleMarkRead}
        />
      )}
    </div>
  );
}
