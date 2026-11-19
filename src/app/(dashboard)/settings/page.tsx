"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Heart, Calendar, User, Save, LogOut, Check, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const [startDate, setStartDate] = useState("2024-01-01");
  const [user1Name, setUser1Name] = useState("Adji");
  const [user2Name, setUser2Name] = useState("Jeehan");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (data) {
        setStartDate(data.relationship_start_date || "2024-01-01");
        setUser1Name(data.user1_name || "Adji");
        setUser2Name(data.user2_name || "Jeehan");
      }
      setLoading(false);
    }

    loadSettings();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const { error } = await supabase
      .from("app_settings")
      .update({
        relationship_start_date: startDate,
        user1_name: user1Name.trim(),
        user2_name: user2Name.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    setSaving(false);
    if (!error) {
      setSavedSuccess(true);
      router.refresh();
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="glass-card rounded-3xl p-8 animate-pulse text-center">
        <div className="h-8 bg-rose-200/50 rounded-2xl w-40 mx-auto mb-4" />
        <div className="h-32 bg-rose-100/40 rounded-3xl w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-stone-800 flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-sm">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <span>Sanctuary Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
          Customize our special anniversary date, names, and preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-card rounded-3xl p-6 sm:p-8 space-y-5 border border-rose-200/70 shadow-sm">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-rose-500" />
            <span>Relationship Start Date</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl border border-rose-200 bg-white/80 text-stone-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50 shadow-xs"
          />
          <p className="text-[11px] text-stone-400 font-medium mt-1.5">
            Used for calculating live counters, milestones, and anniversary countdowns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-rose-500" />
              <span>Partner 1 Nickname</span>
            </label>
            <input
              type="text"
              value={user1Name}
              onChange={(e) => setUser1Name(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-rose-200 bg-white/80 text-stone-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-rose-500" />
              <span>Partner 2 Nickname</span>
            </label>
            <input
              type="text"
              value={user2Name}
              onChange={(e) => setUser2Name(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-rose-200 bg-white/80 text-stone-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50 shadow-xs"
            />
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-xs">
            <Check className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-200/50 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="glass-card rounded-3xl p-6 border border-rose-200/60 shadow-xs">
        <h3 className="font-display font-extrabold text-stone-800 text-base mb-1">
          Account & Session
        </h3>
        <p className="text-xs text-stone-500 font-medium mb-4">
          Sign out of this device. Your data remains safely preserved in Supabase.
        </p>
        <button
          onClick={handleSignOut}
          className="py-2.5 px-4 rounded-2xl border border-rose-200 text-rose-600 text-sm font-bold hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
