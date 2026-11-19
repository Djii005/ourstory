"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { triggerRomanticConfetti } from "@/lib/utils/milestones";
import { Heart, X, RotateCcw, Trophy, Sparkles, Wifi, Users } from "lucide-react";

interface TicTacToeBoardProps {
  currentUserId: string;
  partnerId: string;
  currentUserName: string;
  partnerName: string;
}

type CellValue = "X" | "O" | null;

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6],           // Diagonals
];

export function TicTacToeBoard({
  currentUserId,
  partnerId,
  currentUserName,
  partnerName,
}: TicTacToeBoardProps) {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<"X" | "O" | "draw" | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [scores, setScores] = useState({ xWins: 0, oWins: 0, draws: 0 });
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [playMode, setPlayMode] = useState<"realtime" | "local">("realtime");

  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Determine which symbol current user is in realtime mode
  // User 1 is X, Partner is O
  const isUserX = currentUserId < partnerId;
  const mySymbol: "X" | "O" = isUserX ? "X" : "O";

  const checkWinner = (currentBoard: CellValue[]) => {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo };
      }
    }
    if (currentBoard.every((cell) => cell !== null)) {
      return { winner: "draw" as const, line: null };
    }
    return null;
  };

  const handleReset = useCallback((broadcast = true) => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setWinner(null);
    setWinningLine(null);

    if (broadcast && playMode === "realtime" && channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "reset_game",
        payload: {},
      });
    }
  }, [playMode]);

  // Handle a move
  const makeMove = useCallback(
    (index: number, isRemote = false) => {
      if (board[index] || winner) return;

      // In realtime mode, block player if not their turn
      if (playMode === "realtime" && !isRemote && turn !== mySymbol) {
        return;
      }

      const nextBoard = [...board];
      nextBoard[index] = turn;
      setBoard(nextBoard);

      const result = checkWinner(nextBoard);
      if (result) {
        setWinner(result.winner);
        setWinningLine(result.line);
        if (result.winner === "X") {
          setScores((s) => ({ ...s, xWins: s.xWins + 1 }));
          triggerRomanticConfetti();
        } else if (result.winner === "O") {
          setScores((s) => ({ ...s, oWins: s.oWins + 1 }));
          triggerRomanticConfetti();
        } else {
          setScores((s) => ({ ...s, draws: s.draws + 1 }));
        }
      } else {
        setTurn(turn === "X" ? "O" : "X");
      }

      if (!isRemote && playMode === "realtime" && channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "move",
          payload: { index, symbol: turn },
        });
      }
    },
    [board, mySymbol, playMode, turn, winner]
  );

  // Setup Supabase Realtime Channel
  useEffect(() => {
    const channel = supabase.channel("game-tictactoe", {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "move" }, ({ payload }) => {
        if (payload?.index !== undefined) {
          makeMove(payload.index, true);
        }
      })
      .on("broadcast", { event: "reset_game" }, () => {
        handleReset(false);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsRealtimeConnected(true);
        } else {
          setIsRealtimeConnected(false);
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleReset, makeMove, supabase]);

  const xPlayerName = isUserX ? currentUserName : partnerName;
  const oPlayerName = isUserX ? partnerName : currentUserName;

  return (
    <div className="space-y-5 max-w-sm mx-auto select-none">
      {/* Mode & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/80 border border-rose-200 text-xs font-bold shadow-xs">
          <button
            onClick={() => setPlayMode("realtime")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              playMode === "realtime"
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              <span>Live 2P</span>
            </span>
          </button>
          <button
            onClick={() => setPlayMode("local")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              playMode === "local"
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Pass & Play</span>
            </span>
          </button>
        </div>

        {playMode === "realtime" && (
          <span
            className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full ${
              isRealtimeConnected
                ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                : "text-stone-500 bg-stone-100 border border-stone-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isRealtimeConnected ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
              }`}
            />
            <span>{isRealtimeConnected ? "Synced" : "Connecting..."}</span>
          </span>
        )}
      </div>

      {/* Players Card */}
      <div className="glass-card rounded-3xl p-3 border border-rose-200/70 grid grid-cols-2 gap-2 text-center bg-white/80 shadow-xs">
        <div
          className={`p-2.5 rounded-2xl transition-all ${
            turn === "X" && !winner
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs font-black scale-102"
              : "bg-white text-stone-700 border border-rose-100"
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-xs font-bold">
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>{xPlayerName}</span>
          </div>
          <span className="text-[10px] opacity-80 font-bold">{scores.xWins} wins</span>
        </div>

        <div
          className={`p-2.5 rounded-2xl transition-all ${
            turn === "O" && !winner
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs font-black scale-102"
              : "bg-white text-stone-700 border border-rose-100"
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-xs font-bold">
            <Heart className="w-4 h-4 fill-current text-rose-500" />
            <span>{oPlayerName}</span>
          </div>
          <span className="text-[10px] opacity-80 font-bold">{scores.oWins} wins</span>
        </div>
      </div>

      {/* 3x3 Grid */}
      <div className="glass-card rounded-3xl p-3 border-2 border-rose-200 shadow-xl aspect-square grid grid-cols-3 gap-2.5 bg-white/70">
        {board.map((cell, index) => {
          const isWinningCell = winningLine?.includes(index);

          return (
            <button
              key={index}
              onClick={() => makeMove(index)}
              disabled={Boolean(cell) || Boolean(winner)}
              className={`rounded-2xl transition-all flex items-center justify-center text-4xl font-extrabold cursor-pointer border ${
                isWinningCell
                  ? "bg-gradient-to-tr from-rose-500 to-pink-500 text-white border-rose-400 scale-98 shadow-md"
                  : cell
                  ? "bg-white text-rose-500 border-rose-200 shadow-xs"
                  : "bg-white/60 border-rose-100 hover:bg-rose-50 hover:border-rose-200"
              }`}
            >
              {cell === "X" && <X className="w-10 h-10 stroke-[2.5] text-rose-600" />}
              {cell === "O" && <Heart className="w-10 h-10 fill-rose-500 text-rose-500" />}
            </button>
          );
        })}
      </div>

      {/* Outcome / Reset */}
      <div className="flex items-center justify-between">
        {winner ? (
          <div className="text-xs font-black text-rose-600 flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200">
            <Sparkles className="w-4 h-4" />
            <span>
              {winner === "draw"
                ? "It's a romantic tie!"
                : winner === "X"
                ? `${xPlayerName} wins!`
                : `${oPlayerName} wins!`}
            </span>
          </div>
        ) : (
          <span className="text-xs text-stone-500 font-bold">
            {playMode === "realtime"
              ? turn === mySymbol
                ? "Your turn to move!"
                : `Waiting for ${turn === "X" ? xPlayerName : oPlayerName}...`
              : `${turn === "X" ? xPlayerName : oPlayerName}'s turn`}
          </span>
        )}

        <button
          onClick={() => handleReset(true)}
          className="py-2 px-3.5 rounded-2xl bg-white border border-rose-200 text-xs font-bold text-stone-700 hover:text-rose-600 hover:border-rose-300 flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Round</span>
        </button>
      </div>
    </div>
  );
}
