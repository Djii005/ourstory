import Link from "next/link";
import {
  Gamepad2,
  Puzzle,
  Grid2X2,
  Swords,
  HelpCircle,
  ArrowRight,
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
    },
    {
      id: "memory",
      title: "Memory Match",
      description:
        "Flip and match pairs of our own photos. 4x3 to 6x4 grids, 3D card flips, turn counters, and best times.",
      icon: Grid2X2,
      href: "/games/memory",
    },
    {
      id: "multiplayer",
      title: "Tic-Tac-Toe & Connect Four",
      description:
        "Real-time turn-based duels synchronized live via Supabase Realtime with win streaks and pass-and-play.",
      icon: Swords,
      href: "/games/multiplayer",
    },
    {
      id: "quiz",
      title: "How Well Do You Know Me?",
      description:
        "Write custom trivia questions for each other, guess answers, and track your mutual scores.",
      icon: HelpCircle,
      href: "/games/quiz",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-[var(--text-primary)] flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[var(--accent-rose)] to-[var(--accent-coral)] text-white shadow-md">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <span>Our Game Corner</span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 font-medium">
          Cozy challenges, photo puzzles, and playful competitions made for two.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {games.map((game) => {
          const Icon = game.icon;

          return (
            <div
              key={game.id}
              className="arch-card p-5 sm:p-6 flex flex-col justify-between transition-all hover:scale-[1.01] hover:border-[var(--line-strong)]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--line-hairline)] text-[var(--accent-rose)] flex items-center justify-center mb-4 shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>

                <h2 className="font-display font-extrabold text-lg sm:text-xl text-[var(--text-primary)] mb-1.5">
                  {game.title}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[var(--line-hairline)] flex items-center justify-between">
                <Link
                  href={game.href}
                  prefetch
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-rose)] hover:text-[var(--accent-coral)] transition-colors cursor-pointer group"
                >
                  <span>Play Game</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
