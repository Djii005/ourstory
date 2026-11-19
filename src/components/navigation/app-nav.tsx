"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  Mail,
  Image as ImageIcon,
  Gamepad2,
  Sparkles,
  Settings,
  Moon,
  Sun,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateTimeTogether } from "@/lib/utils/date-calculator";

interface NavProps {
  currentUserName?: string;
  partnerName?: string;
  startDate?: string;
}

export function AppNav({
  currentUserName = "Adjie",
  partnerName = "Jeehan",
  startDate = "2026-05-30",
}: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [daysCount, setDaysCount] = useState<number>(() => {
    return calculateTimeTogether(startDate).totalDays;
  });

  const popoverRef = useRef<HTMLDivElement>(null);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

  // Sync theme with document root & localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ourspace_theme") as "light" | "dark" | null;
    const initialTheme = saved || "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Update live day count
  useEffect(() => {
    const timer = setInterval(() => {
      setDaysCount(calculateTimeTogether(startDate).totalDays);
    }, 60000);
    return () => clearInterval(timer);
  }, [startDate]);

  // Handle outside click for profile popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        avatarBtnRef.current &&
        !avatarBtnRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("ourspace_theme", nextTheme);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Tracker", href: "/", icon: Heart },
    { label: "Letters", href: "/letters", icon: Mail },
    { label: "Gallery", href: "/gallery", icon: ImageIcon },
    { label: "Games", href: "/games", icon: Gamepad2 },
    { label: "Extras", href: "/extras", icon: Sparkles },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const firstLetter = currentUserName.charAt(0).toUpperCase() || "A";

  return (
    <>
      {/* ========================================================================
          UNIFIED ARCHITECTURAL TOP MASTHEAD
          ======================================================================== */}
      <header className="masthead-wrap">
        <div className="masthead">
          <Link href="/" className="brand-crest" title="Our Space">
            <div className="brand-crest-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="url(#brandHeartGrad)"
                />
                <defs>
                  <linearGradient id="brandHeartGrad" x1="2" y1="3" x2="22" y2="21.35" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fb7185" />
                    <stop offset="0.5" stopColor="#f43f5e" />
                    <stop offset="1" stopColor="#c9963b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div className="brand-name">Our Space</div>
              <div className="brand-sub">
                {currentUserName} &amp; {partnerName}
              </div>
            </div>
          </Link>

          <nav className="desktop-nav" aria-label="Primary Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={`nav-btn ${isActive ? "active dither-fill" : ""}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="masthead-actions">
            <div className="live-chip" title="Live Synchronized Heartbeat">
              <span className="pulse-dot" />
              <span>DAY {daysCount}</span>
            </div>

            <button
              className="icon-circle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-300" />
              )}
            </button>

            <button
              ref={avatarBtnRef}
              className="user-avatar-btn"
              onClick={() => setPopoverOpen((prev) => !prev)}
              title="Account & Space Menu"
              aria-label="Profile Menu"
              aria-expanded={popoverOpen}
            >
              {firstLetter}
            </button>
          </div>
        </div>

        {/* Profile Popover */}
        {popoverOpen && (
          <div ref={popoverRef} className="arch-card profile-popover open">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--line-hairline)]">
              <div className="user-avatar-btn pointer-events-none">{firstLetter}</div>
              <div>
                <div className="font-bold text-sm text-[var(--text-primary)]">
                  {currentUserName} &amp; {partnerName}
                </div>
                <div className="text-xs font-mono font-bold text-[var(--accent-gold)]">
                  Signed in as {currentUserName}
                </div>
              </div>
            </div>

            <div className="pt-2.5 flex flex-col gap-1.5">
              <Link
                href="/settings"
                onClick={() => setPopoverOpen(false)}
                className="ghost-btn w-full justify-start text-xs"
              >
                <Settings className="w-3.5 h-3.5 mr-2" />
                <span>Space Settings</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="ghost-btn w-full justify-start text-xs text-[var(--accent-rose)]"
              >
                <Lock className="w-3.5 h-3.5 mr-2" />
                <span>Lock Sanctuary</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================
          MOBILE BOTTOM FLOATING CAPSULE DOCK
          ======================================================================== */}
      <nav className="mobile-dock" aria-label="Mobile Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={`mobile-dock-btn ${isActive ? "active dither-fill" : ""}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
