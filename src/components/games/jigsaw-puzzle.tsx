"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { JigsawDifficulty, JigsawPiece } from "@/types/games";
import { createClient } from "@/lib/supabase/client";
import { triggerRomanticConfetti } from "@/lib/utils/milestones";
import {
  Trophy,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  Clock,
  Footprints,
  CheckCircle2,
  Trash2,
} from "lucide-react";

interface JigsawPuzzleProps {
  imageUrl: string;
  photoId: string | null;
  photoLabel: string;
  isEphemeral: boolean;
  difficulty: JigsawDifficulty;
  currentUserId: string;
  onExit: () => void;
  onDifficultyChange: (newDiff: JigsawDifficulty) => void;
}

export function JigsawPuzzle({
  imageUrl,
  photoId,
  photoLabel,
  isEphemeral,
  difficulty,
  currentUserId,
  onExit,
  onDifficultyChange,
}: JigsawPuzzleProps) {
  const gridSize = {
    "3x3": 3,
    "4x4": 4,
    "6x6": 6,
    "8x8": 8,
  }[difficulty];

  const totalPieces = gridSize * gridSize;

  const [pieces, setPieces] = useState<JigsawPiece[]>([]);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [draggedPieceIndex, setDraggedPieceIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Load best time for this difficulty & photo/label
  useEffect(() => {
    async function loadBestTime() {
      const query = supabase
        .from("jigsaw_records")
        .select("time_seconds")
        .eq("difficulty", difficulty)
        .order("time_seconds", { ascending: true })
        .limit(1);

      if (photoId) {
        query.eq("photo_id", photoId);
      }

      const { data } = await query;
      if (data && data.length > 0) {
        setBestTime(data[0].time_seconds);
      } else {
        setBestTime(null);
      }
    }

    loadBestTime();
  }, [difficulty, photoId, supabase]);

  // Initialize and scramble puzzle
  const initPuzzle = useCallback(() => {
    const initial: JigsawPiece[] = [];
    for (let i = 0; i < totalPieces; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const bgPosX = (col / (gridSize - 1 || 1)) * 100;
      const bgPosY = (row / (gridSize - 1 || 1)) * 100;

      initial.push({
        id: i,
        originalIndex: i,
        currentIndex: i,
        row,
        col,
        bgPosX,
        bgPosY,
      });
    }

    // Fisher-Yates shuffle
    const shuffled = [...initial];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Ensure it's not already solved
    let isSame = true;
    for (let i = 0; i < shuffled.length; i++) {
      if (shuffled[i].originalIndex !== i) {
        isSame = false;
        break;
      }
    }
    if (isSame && shuffled.length > 1) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }

    // Update currentIndex
    const updated = shuffled.map((p, idx) => ({ ...p, currentIndex: idx }));

    setPieces(updated);
    setMoves(0);
    setSeconds(0);
    setIsActive(true);
    setIsCompleted(false);
    setSelectedPieceIndex(null);
  }, [gridSize, totalPieces]);

  useEffect(() => {
    initPuzzle();
  }, [initPuzzle]);

  // Timer loop
  useEffect(() => {
    if (isActive && !isCompleted) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isCompleted]);

  // Check victory condition
  const checkVictory = useCallback(
    async (currentPieces: JigsawPiece[], currentMoves: number, totalTime: number) => {
      const allCorrect = currentPieces.every((p, idx) => p.originalIndex === idx);
      if (allCorrect) {
        setIsCompleted(true);
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        triggerRomanticConfetti();

        // Save record to database
        await supabase.from("jigsaw_records").insert({
          photo_id: photoId,
          photo_label: photoLabel,
          user_id: currentUserId,
          difficulty,
          time_seconds: totalTime,
          moves: currentMoves,
        });

        if (!bestTime || totalTime < bestTime) {
          setBestTime(totalTime);
        }

        // If photo was ephemeral, revoke the object URL upon completion
        if (isEphemeral && imageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(imageUrl);
        }
      }
    },
    [bestTime, currentUserId, difficulty, imageUrl, isEphemeral, photoId, photoLabel, supabase]
  );

  // Swap two tiles
  const swapPieces = useCallback(
    (indexA: number, indexB: number) => {
      if (indexA === indexB || isCompleted) return;

      setPieces((prev) => {
        const next = [...prev];
        const temp = next[indexA];
        next[indexA] = next[indexB];
        next[indexB] = temp;

        const updated = next.map((p, idx) => ({ ...p, currentIndex: idx }));
        const nextMoves = moves + 1;
        setMoves(nextMoves);

        checkVictory(updated, nextMoves, seconds);
        return updated;
      });

      setSelectedPieceIndex(null);
      setDraggedPieceIndex(null);
      setDragOverIndex(null);
    },
    [checkVictory, isCompleted, moves, seconds]
  );

  // Click / Tap to swap
  const handleTileClick = (index: number) => {
    if (isCompleted) return;

    if (selectedPieceIndex === null) {
      setSelectedPieceIndex(index);
    } else if (selectedPieceIndex === index) {
      setSelectedPieceIndex(null);
    } else {
      swapPieces(selectedPieceIndex, index);
    }
  };

  // Drag and Drop (Mouse / Touch)
  const handleDragStart = (index: number) => {
    if (isCompleted) return;
    setDraggedPieceIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedPieceIndex !== null) {
      swapPieces(draggedPieceIndex, index);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const correctCount = pieces.filter((p, idx) => p.originalIndex === idx).length;
  const progressPercent = Math.round((correctCount / totalPieces) * 100);

  return (
    <div className="space-y-5 max-w-xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (isEphemeral && imageUrl.startsWith("blob:")) {
              URL.revokeObjectURL(imageUrl);
            }
            onExit();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Puzzle</span>
        </button>

        {isEphemeral && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider">
            <Trash2 className="w-3 h-3" />
            <span>Ephemeral &middot; Purged after game</span>
          </span>
        )}
      </div>

      {/* Control & Stats Bar */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 border border-rose-200/70 space-y-3 bg-white/80 shadow-xs">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Difficulty selector */}
          <div className="flex items-center gap-1">
            {(["3x3", "4x4", "6x6", "8x8"] as JigsawDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => onDifficultyChange(d)}
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

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded-2xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                showPreview
                  ? "bg-rose-100 text-rose-600 border-rose-300"
                  : "bg-white border-rose-200 text-stone-600"
              }`}
              title="Toggle preview reference"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={initPuzzle}
              className="p-2 rounded-2xl text-xs font-bold flex items-center gap-1 bg-white border border-rose-200 text-stone-600 hover:text-rose-500 cursor-pointer"
              title="Reshuffle"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live metrics */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-rose-100">
          <div className="flex items-center gap-1.5 text-stone-700">
            <Clock className="w-4 h-4 text-rose-500" />
            <span className="font-display font-black text-sm tabular-nums">
              {formatTime(seconds)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-700">
            <Footprints className="w-4 h-4 text-rose-500" />
            <span className="font-display font-black text-sm tabular-nums">
              {moves} moves
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-700 justify-end">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold">
              {bestTime ? formatTime(bestTime) : "--:--"}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-stone-500 font-bold">
            <span>Accuracy</span>
            <span className="font-black text-rose-500">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-rose-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Jigsaw Board */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-3 sm:p-4 border-2 border-rose-200 shadow-xl aspect-square w-full max-w-[500px] mx-auto select-none bg-white/70">
        {/* Preview image overlay */}
        {showPreview && (
          <div className="absolute inset-3 sm:inset-4 z-40 rounded-2xl overflow-hidden pointer-events-none animate-in fade-in">
            <img
              src={imageUrl}
              alt="Reference preview"
              className="w-full h-full object-cover opacity-85"
            />
          </div>
        )}

        {/* Tiles Grid */}
        <div
          className="w-full h-full grid gap-1 rounded-2xl overflow-hidden bg-stone-200"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {pieces.map((piece, index) => {
            const isCorrect = piece.originalIndex === index;
            const isSelected = selectedPieceIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={piece.id}
                draggable={!isCompleted}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => handleTileClick(index)}
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                  backgroundPosition: `${piece.bgPosX}% ${piece.bgPosY}%`,
                }}
                className={`w-full h-full rounded-lg transition-transform cursor-pointer relative shadow-xs ${
                  isSelected
                    ? "ring-4 ring-rose-500 scale-95 z-30 shadow-lg"
                    : isDragOver
                    ? "ring-4 ring-amber-400 scale-95 z-30"
                    : "hover:scale-[0.98] active:scale-95"
                } ${isCorrect && isCompleted ? "ring-0" : ""}`}
              >
                {/* Subtle correct indicator */}
                {isCorrect && !isCompleted && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white/80" />
                )}
              </div>
            );
          })}
        </div>

        {/* Victory Celebration Overlay */}
        {isCompleted && (
          <div className="absolute inset-3 sm:inset-4 z-50 rounded-2xl bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center mb-3 shadow-lg ring-8 ring-rose-400/40 animate-bounce">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl mb-1">
              Puzzle Completed!
            </h2>
            <p className="text-xs text-white/80 max-w-xs mb-4">
              Solved {difficulty} in {formatTime(seconds)} with {moves} moves.
            </p>

            {isEphemeral && (
              <p className="text-[11px] text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-800/80 mb-4 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Temporary photo purged from memory & database!</span>
              </p>
            )}

            <div className="flex gap-2 w-full max-w-xs">
              <button
                onClick={initPuzzle}
                className="flex-1 py-2.5 rounded-xl bg-white text-stone-900 font-bold text-xs hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Play Again
              </button>
              <button
                onClick={() => {
                  if (isEphemeral && imageUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(imageUrl);
                  }
                  onExit();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-stone-400">
        Tap a piece to select, then tap another to swap &middot; Or drag and drop
      </p>
    </div>
  );
}
