"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { PhotoRecord } from "@/types/gallery";
import { createClient } from "@/lib/supabase/client";
import { triggerRomanticConfetti } from "@/lib/utils/milestones";
import {
  Trophy,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Clock,
  Grid2X2,
  Heart,
  CheckCircle2,
} from "lucide-react";

export type MemoryDifficulty = "4x3" | "4x4" | "6x4";

interface MemoryCard {
  id: number;
  pairId: number;
  imageUrl?: string;
  emojiFallback?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchProps {
  galleryPhotos: PhotoRecord[];
  currentUserId: string;
}

const FALLBACK_EMOJIS = [
  "💖", "🌹", "💌", "✨", "🎀", "☕",
  "🥂", "🍓", "🌙", "🧸", "✈️", "🎡"
];

export function MemoryMatch({ galleryPhotos, currentUserId }: MemoryMatchProps) {
  const [difficulty, setDifficulty] = useState<MemoryDifficulty>("4x3");
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [bestScore, setBestScore] = useState<{ time: number; turns: number } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  const pairsCount = {
    "4x3": 6,
    "4x4": 8,
    "6x4": 12,
  }[difficulty];

  // Fetch best record for difficulty
  useEffect(() => {
    async function loadBestRecord() {
      const { data } = await supabase
        .from("memory_match_records")
        .select("time_seconds, turns")
        .eq("difficulty", difficulty)
        .order("turns", { ascending: true })
        .limit(1);

      if (data && data.length > 0) {
        setBestScore({
          time: Number(data[0].time_seconds),
          turns: data[0].turns,
        });
      } else {
        setBestScore(null);
      }
    }
    loadBestRecord();
  }, [difficulty, supabase]);

  // Initialize and shuffle board
  const setupGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Pick photos or fallbacks
    const selectedPairs: { imageUrl?: string; emojiFallback?: string }[] = [];
    const validPhotos = galleryPhotos.filter((p) => p.signed_url);

    for (let i = 0; i < pairsCount; i++) {
      if (validPhotos[i % validPhotos.length]?.signed_url) {
        selectedPairs.push({ imageUrl: validPhotos[i % validPhotos.length].signed_url });
      } else {
        selectedPairs.push({ emojiFallback: FALLBACK_EMOJIS[i % FALLBACK_EMOJIS.length] });
      }
    }

    const deck: MemoryCard[] = [];
    selectedPairs.forEach((pair, pairIdx) => {
      deck.push({
        id: pairIdx * 2,
        pairId: pairIdx,
        imageUrl: pair.imageUrl,
        emojiFallback: pair.emojiFallback,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: pairIdx * 2 + 1,
        pairId: pairIdx,
        imageUrl: pair.imageUrl,
        emojiFallback: pair.emojiFallback,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedCards([]);
    setTurns(0);
    setSeconds(0);
    setIsStarted(false);
    setIsCompleted(false);
    setIsBusy(false);
  }, [galleryPhotos, pairsCount]);

  useEffect(() => {
    setupGame();
  }, [setupGame]);

  // Timer loop
  useEffect(() => {
    if (isStarted && !isCompleted) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isCompleted]);

  // Handle card click
  const handleCardClick = (index: number) => {
    if (isBusy || cards[index].isFlipped || cards[index].isMatched) return;

    if (!isStarted) setIsStarted(true);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsBusy(true);
      const nextTurns = turns + 1;
      setTurns(nextTurns);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // Matched
        setTimeout(async () => {
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setCards([...newCards]);
          setFlippedCards([]);
          setIsBusy(false);

          // Check if all matched
          if (newCards.every((c) => c.isMatched)) {
            setIsCompleted(true);
            if (timerRef.current) clearInterval(timerRef.current);
            triggerRomanticConfetti();

            await supabase.from("memory_match_records").insert({
              user_id: currentUserId,
              difficulty,
              turns: nextTurns,
              time_seconds: seconds,
            });

            if (!bestScore || nextTurns < bestScore.turns) {
              setBestScore({ time: seconds, turns: nextTurns });
            }
          }
        }, 400);
      } else {
        // No match: flip back
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards([...newCards]);
          setFlippedCards([]);
          setIsBusy(false);
        }, 900);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const matchedPairs = cards.filter((c) => c.isMatched).length / 2;

  const gridColsClass = {
    "4x3": "grid-cols-4",
    "4x4": "grid-cols-4",
    "6x4": "grid-cols-4 sm:grid-cols-6",
  }[difficulty];

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
          <Grid2X2 className="w-4 h-4" />
          <span>Memory Match</span>
        </span>
      </div>

      {/* Control & Score Card */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 border border-rose-200/70 space-y-3 bg-white/80 shadow-xs">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {(["4x3", "4x4", "6x4"] as MemoryDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-1.5 px-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  difficulty === d
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs scale-105"
                    : "bg-white text-stone-600 hover:bg-rose-50 border border-rose-100"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={setupGame}
            className="p-2 rounded-2xl text-xs font-bold flex items-center gap-1 bg-white border border-rose-200 text-stone-600 hover:text-rose-500 cursor-pointer"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[11px]">Restart</span>
          </button>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-rose-100 text-xs">
          <div className="flex items-center gap-1.5 text-stone-700">
            <Clock className="w-4 h-4 text-rose-500" />
            <span className="font-display font-black text-sm tabular-nums">
              {formatTime(seconds)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-700">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="font-display font-black text-sm tabular-nums">
              {matchedPairs}/{pairsCount} pairs
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-700 justify-end">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-xs">
              {bestScore ? `${bestScore.turns} turns` : "--"}
            </span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className={`grid gap-2 sm:gap-3 ${gridColsClass}`}>
        {cards.map((card, index) => {
          const isRevealed = card.isFlipped || card.isMatched;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className="perspective-1000 aspect-square cursor-pointer select-none"
            >
              <div
                className={`relative w-full h-full transform-style-3d transition-transform duration-500 rounded-2xl ${
                  isRevealed ? "rotate-y-180" : "hover:scale-102"
                }`}
              >
                {/* Card Back (Faced Down) */}
                <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-rose-400 via-rose-500 to-pink-500 flex items-center justify-center text-white shadow-sm border border-rose-300">
                  <Heart className="w-6 h-6 fill-white/80 text-white" />
                </div>

                {/* Card Front (Faced Up) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden bg-white border-2 border-rose-400 shadow-md flex items-center justify-center">
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt="Memory"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{card.emojiFallback}</span>
                  )}
                  {card.isMatched && (
                    <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Victory Modal */}
      {isCompleted && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 text-center bg-gradient-to-br from-rose-50 via-white to-amber-50 border-2 border-rose-300 animate-in zoom-in-95 shadow-xl">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white mx-auto flex items-center justify-center mb-3 shadow-lg shadow-rose-200">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="font-display font-black text-2xl text-stone-800 mb-1">
            Perfect Match!
          </h2>
          <p className="text-xs text-stone-600 font-medium mb-4">
            Found all {pairsCount} pairs in {turns} turns ({formatTime(seconds)}).
          </p>
          <button
            onClick={setupGame}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs shadow-md shadow-rose-200 transition-all cursor-pointer"
          >
            Play Another Round
          </button>
        </div>
      )}
    </div>
  );
}
