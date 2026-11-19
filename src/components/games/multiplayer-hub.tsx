"use client";

import { useState } from "react";
import Link from "next/link";
import { TicTacToeBoard } from "./tictactoe-board";
import { Connect4Board } from "./connect4-board";
import { ArrowLeft, Swords, CircleDot, Grid3X3 } from "lucide-react";

interface MultiplayerHubProps {
  currentUserId: string;
  partnerId: string;
  currentUserName: string;
  partnerName: string;
}

export function MultiplayerHub({
  currentUserId,
  partnerId,
  currentUserName,
  partnerName,
}: MultiplayerHubProps) {
  const [activeGame, setActiveGame] = useState<"tictactoe" | "connect4">("tictactoe");

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-12 animate-in fade-in">
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
          <Swords className="w-4 h-4" />
          <span>2-Player Realtime</span>
        </span>
      </div>

      {/* Game Selector Switcher */}
      <div className="glass-card rounded-2xl p-1.5 border border-rose-200/70 grid grid-cols-2 gap-1.5 bg-white/70">
        <button
          onClick={() => setActiveGame("tictactoe")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeGame === "tictactoe"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs scale-[1.01]"
              : "text-stone-600 hover:bg-rose-50"
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          <span>Tic-Tac-Toe</span>
        </button>

        <button
          onClick={() => setActiveGame("connect4")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeGame === "connect4"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs scale-[1.01]"
              : "text-stone-600 hover:bg-rose-50"
          }`}
        >
          <CircleDot className="w-4 h-4" />
          <span>Connect Four</span>
        </button>
      </div>

      {activeGame === "tictactoe" ? (
        <TicTacToeBoard
          currentUserId={currentUserId}
          partnerId={partnerId}
          currentUserName={currentUserName}
          partnerName={partnerName}
        />
      ) : (
        <Connect4Board
          currentUserId={currentUserId}
          partnerId={partnerId}
          currentUserName={currentUserName}
          partnerName={partnerName}
        />
      )}
    </div>
  );
}
