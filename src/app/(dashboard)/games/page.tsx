import Link from "next/link";
import {
  Gamepad2,
  Puzzle,
  Grid2X2,
  Swords,
  HelpCircle,
  ArrowRight,
  Flame,
} from "lucide-react";

export default function GamesHubPage() {
  const games = [
    {
      id: "jigsaw",
      title: "Photo Jigsaw",
      description:
        "Piece together our memories. Supports 3x3 to 8x8 with touch/mouse drag & drop, snap-to-grid, and ephemeral photo upload.",
      icon: Puzzle,
      href: "/games/jigsaw",
      status: "Available",
      badgeColor: "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs",
      highlight: true,
    },
    {
      id: "memory",
      title: "Memory Match",
      description:
        "Flip and match pairs of our own photos. 4x3 to 6x4 grids, 3D card flips, turn counters, and best times.",
      icon: Grid2X2,
      href: "/games/memory",
      status: "Available",
      badgeColor: "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs",
      highlight: false,
    },
    {
      id: "multiplayer",
      title: "Tic-Tac-Toe & Connect Four",
      description:
        "Real-time turn-based duels synchronized live via Supabase Realtime with win streaks and pass-and-play.",
      icon: Swords,
      href: "/games/multiplayer",
      status: "Live 2P",
      badgeColor: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs",
      highlight: true,
    },
    {
      id: "quiz",
      title: "How Well Do You Know Me?",
      description:
        "Write custom trivia questions for each other, guess answers, and track your mutual scores.",
      icon: HelpCircle,
      href: "/games/quiz",
      status: "Available",
      badgeColor: "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs",
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-800 flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-sm">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <span>Our Game Corner</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
          Cozy challenges, photo puzzles, and playful competitions made for two.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {games.map((game) => {
          const Icon = game.icon;

          return (
            <div
              key={game.id}
              className={`glass-card rounded-3xl p-5 sm:p-6 border transition-all relative overflow-hidden flex flex-col justify-between ${
                game.highlight
                  ? "bg-gradient-to-br from-rose-50/60 via-white to-pink-50/40 border-rose-300 shadow-md hover:shadow-lg hover:scale-[1.02]"
                  : "bg-white/80 border-rose-200/60 hover:border-rose-300 hover:shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-100 to-pink-100 text-rose-500 flex items-center justify-center shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${game.badgeColor}`}
                  >
                    {game.status}
                  </span>
                </div>

                <h2 className="font-display font-extrabold text-lg text-stone-800 mb-1">
                  {game.title}
                </h2>
                <p className="text-xs text-stone-600 font-medium leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-rose-100 flex items-center justify-between">
                <Link
                  href={game.href}
                  prefetch
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <span>Play Game</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {game.highlight && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full">
                    <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>Popular</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
