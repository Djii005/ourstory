"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { AmbientStage } from "@/components/ui/ambient-stage";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleQuickSelect = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message || "Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <>
      <AmbientStage />
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md mx-auto">
          {/* Couple Lockup Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--line-strong)] text-[var(--accent-rose)] mb-4 shadow-lg p-0.5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="url(#loginHeartGrad)"
                />
                <defs>
                  <linearGradient id="loginHeartGrad" x1="2" y1="3" x2="22" y2="21.35" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fb7185" />
                    <stop offset="0.5" stopColor="#f43f5e" />
                    <stop offset="1" stopColor="#c9963b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex items-center justify-center gap-3 mb-1">
              <span className="w-10 h-px bg-gradient-to-r from-transparent to-[var(--accent-gold)]" />
              <div className="archival-tag !mb-0">
                <span>OUR SPACE</span>
                <span>&bull;</span>
                <span>SANCTUARY</span>
              </div>
              <span className="w-10 h-px bg-gradient-to-l from-transparent to-[var(--accent-gold)]" />
            </div>

            <h1 className="font-display text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              Welcome Home
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1.5">
              Just the two of us. Choose your account to continue.
            </p>
          </div>

          <div className="arch-card p-6 sm:p-8 relative">
            {/* Corner Flourishes */}
            <svg className="leaf-flourish lf-tl" viewBox="0 0 24 24" aria-hidden="true">
              <use href="#botanicalLeaf" />
            </svg>
            <svg className="leaf-flourish lf-tr" viewBox="0 0 24 24" aria-hidden="true">
              <use href="#botanicalLeaf" />
            </svg>
            <svg className="leaf-flourish lf-bl" viewBox="0 0 24 24" aria-hidden="true">
              <use href="#botanicalLeaf" />
            </svg>
            <svg className="leaf-flourish lf-br" viewBox="0 0 24 24" aria-hidden="true">
              <use href="#botanicalLeaf" />
            </svg>

            <div className="mb-6 relative">
              <span className="text-[11px] font-mono font-bold text-[var(--accent-gold)] uppercase tracking-wider block mb-2.5">
                Quick Select
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickSelect("suryaadjii17@gmail.com")}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                    email === "suryaadjii17@gmail.com"
                      ? "primary-btn border-transparent"
                      : "ghost-btn"
                  }`}
                >
                  <span>Adjie</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect(email && email !== "suryaadjii17@gmail.com" ? email : "")}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                    email && email !== "suryaadjii17@gmail.com"
                      ? "primary-btn border-transparent"
                      : "ghost-btn"
                  }`}
                >
                  <span>Jeehan</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 relative">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--line-hairline)] text-sm text-[var(--text-primary)] font-medium placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--line-hairline)] text-sm text-[var(--text-primary)] font-medium placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-[var(--accent-rose)] font-bold"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="primary-btn w-full py-3 text-sm disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Our Space</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs font-semibold text-[var(--text-muted)] mt-6 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <span>Encrypted with Row Level Security &middot; Private sanctuary</span>
          </p>
        </div>
      </main>
    </>
  );
}
