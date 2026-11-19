"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { triggerRomanticConfetti } from "@/lib/utils/milestones";
import { RotateCcw, Sparkles, Wifi, Users, CircleDot } from "lucide-react";

interface Connect4BoardProps {
  currentUserId: string;
  partnerId: string;
  currentUserName: string;
  partnerName: string;
}

const ROWS = 6;
const COLS = 7;
type PlayerPiece = "R" | "Y" | null; // Rose (R) vs Yellow/Gold (Y)

export function Connect4Board({
  currentUserId,
  partnerId,
  currentUserName,
  partnerName,
}: Connect4BoardProps) {
  const [board, setBoard] = useState<PlayerPiece[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [turn, setTurn] = useState<"R" | "Y">("R");
  const [winner, setWinner] = useState<"R" | "Y" | "draw" | null>(null);
  const [winningCells, setWinningCells] = useState<[number, number][] | null>(null);
  const [scores, setScores] = useState({ rWins: 0, yWins: 0 });
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [playMode, setPlayMode] = useState<"realtime" | "local">("realtime");

  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const isUserR = currentUserId < partnerId;
  const myPiece: "R" | "Y" = isUserR ? "R" : "Y";

  const rPlayerName = isUserR ? currentUserName : partnerName;
  const yPlayerName = isUserR ? partnerName : currentUserName;

  const checkConnect4Winner = (b: PlayerPiece[][]) => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const piece = b[r][c];
        if (piece && piece === b[r][c + 1] && piece === b[r][c + 2] && piece === b[r][c + 3]) {
          return { winner: piece, cells: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]] as [number, number][] };
        }
      }
    }
    // Vertical
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS; c++) {
        const piece = b[r][c];
        if (piece && piece === b[r + 1][c] && piece === b[r + 2][c] && piece === b[r + 3][c]) {
          return { winner: piece, cells: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]] as [number, number][] };
        }
      }
    }
    // Diagonal Up-Right
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const piece = b[r][c];
        if (piece && piece === b[r - 1][c + 1] && piece === b[r - 2][c + 2] && piece === b[r - 3][c + 3]) {
          return { winner: piece, cells: [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]] as [number, number][] };
        }
      }
    }
    // Diagonal Down-Right
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const piece = b[r][c];
        if (piece && piece === b[r + 1][c + 1] && piece === b[r + 2][c + 2] && piece === b[r + 3][c + 3]) {
          return { winner: piece, cells: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]] as [number, number][] };
        }
      }
    }
    // Draw
    if (b.every((row) => row.every((cell) => cell !== null))) {
      return { winner: "draw" as const, cells: [] };
    }
    return null;
  };

  const handleReset = useCallback((broadcast = true) => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setTurn("R");
    setWinner(null);
    setWinningCells(null);

    if (broadcast && playMode === "realtime" && channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "reset_game",
        payload: {},
      });
    }
  }, [playMode]);

  const dropPiece = useCallback(
    (col: number, isRemote = false) => {
      if (winner) return;

      if (playMode === "realtime" && !isRemote && turn !== myPiece) {
        return;
      }

      // Find lowest available row in column
      let targetRow = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][col]) {
          targetRow = r;
          break;
        }
      }
      if (targetRow === -1) return; // Column full

      const nextBoard = board.map((row) => [...row]);
      nextBoard[targetRow][col] = turn;
      setBoard(nextBoard);

      const result = checkConnect4Winner(nextBoard);
      if (result) {
        setWinner(result.winner);
        setWinningCells(result.cells);
        if (result.winner === "R") {
          setScores((s) => ({ ...s, rWins: s.rWins + 1 }));
          triggerRomanticConfetti();
        } else if (result.winner === "Y") {
          setScores((s) => ({ ...s, yWins: s.yWins + 1 }));
          triggerRomanticConfetti();
        }
      } else {
        setTurn(turn === "R" ? "Y" : "R");
      }

      if (!isRemote && playMode === "realtime" && channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "drop_piece",
          payload: { col, piece: turn },
        });
      }
    },
    [board, myPiece, playMode, turn, winner]
  );

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel("game-connect4", {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "drop_piece" }, ({ payload }) => {
        if (payload?.col !== undefined) {
          dropPiece(payload.col, true);
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
  }, [dropPiece, handleReset, supabase]);

  return (
    <div className="space-y-5 max-w-md mx-auto select-none">
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

      {/* Players Header */}
      <div className="glass-card rounded-3xl p-3 border border-rose-200/70 grid grid-cols-2 gap-2 text-center bg-white/80 shadow-xs">
        <div
          className={`p-2.5 rounded-2xl transition-all ${
            turn === "R" && !winner
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs font-black scale-102"
              : "bg-white text-stone-700 border border-rose-100"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-400 border border-white" />
            <span>{rPlayerName}</span>
          </div>
          <span className="text-[10px] opacity-80 font-bold">{scores.rWins} wins</span>
        </div>

        <div
          className={`p-2.5 rounded-2xl transition-all ${
            turn === "Y" && !winner
              ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-xs font-black scale-102"
              : "bg-white text-stone-700 border border-amber-100"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-white" />
            <span>{yPlayerName}</span>
          </div>
          <span className="text-[10px] opacity-80 font-bold">{scores.yWins} wins</span>
        </div>
      </div>

      {/* Connect 4 Board */}
      <div className="p-3 sm:p-4 rounded-3xl bg-blue-900/95 shadow-2xl border-4 border-blue-800">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array(COLS)
            .fill(0)
            .map((_, col) => (
              <div
                key={col}
                onClick={() => dropPiece(col)}
                className="flex flex-col gap-1.5 sm:gap-2 cursor-pointer group hover:bg-blue-800/40 p-0.5 rounded-2xl transition-colors"
              >
                {Array(ROWS)
                  .fill(0)
                  .map((_, row) => {
                    const cell = board[row][col];
                    const isWinning = winningCells?.some(([wr, wc]) => wr === row && wc === col);

                    return (
                      <div
                        key={row}
                        className={`w-full aspect-square rounded-full flex items-center justify-center transition-all ${
                          cell === "R"
                            ? "bg-gradient-to-tr from-rose-500 to-pink-400 shadow-inner"
                            : cell === "Y"
                            ? "bg-gradient-to-tr from-amber-400 to-amber-200 shadow-inner"
                            : "bg-blue-950/80 group-hover:bg-blue-900/60"
                        } ${isWinning ? "ring-4 ring-white animate-bounce scale-95" : ""}`}
                      >
                        {isWinning && <Sparkles className="w-4 h-4 text-white" />}
                      </div>
                    );
                  })}
              </div>
            ))}
        </div>
      </div>

      {/* Outcome / Actions */}
      <div className="flex items-center justify-between">
        {winner ? (
          <div className="text-xs font-black text-rose-600 flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200">
            <Sparkles className="w-4 h-4" />
            <span>
              {winner === "draw"
                ? "Draw game!"
                : winner === "R"
                ? `${rPlayerName} connects 4!`
                : `${yPlayerName} connects 4!`}
            </span>
          </div>
        ) : (
          <span className="text-xs text-stone-500 font-bold">
            {playMode === "realtime"
              ? turn === myPiece
                ? "Your turn to drop a piece!"
                : `Waiting for ${turn === "R" ? rPlayerName : yPlayerName}...`
              : `${turn === "R" ? rPlayerName : yPlayerName}'s turn`}
          </span>
        )}

        <button
          onClick={() => handleReset(true)}
          className="py-2 px-3.5 rounded-2xl bg-white border border-rose-200 text-xs font-bold text-stone-700 hover:text-rose-600 hover:border-rose-300 flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Game</span>
        </button>
      </div>
    </div>
  );
}
