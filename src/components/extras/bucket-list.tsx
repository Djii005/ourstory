"use client";

import { useState } from "react";
import { BucketItem, BucketCategory } from "@/types/extras";
import { createClient } from "@/lib/supabase/client";
import { triggerRomanticConfetti } from "@/lib/utils/milestones";
import {
  CheckCircle2,
  Circle,
  Plus,
  Dices,
  Trash2,
  Sparkles,
  Compass,
  Utensils,
  Heart,
  Flag,
  X,
} from "lucide-react";

interface BucketListProps {
  initialItems: BucketItem[];
  currentUserId: string;
}

const CATEGORIES: { id: BucketCategory; label: string; icon: typeof Heart }[] = [
  { id: "Date Ideas", label: "Date Ideas", icon: Heart },
  { id: "Travel", label: "Travel & Trips", icon: Compass },
  { id: "Food & Cooking", label: "Food & Cooking", icon: Utensils },
  { id: "Spontaneous", label: "Spontaneous", icon: Sparkles },
  { id: "Life Milestones", label: "Milestones", icon: Flag },
];

export function BucketList({ initialItems, currentUserId }: BucketListProps) {
  const [items, setItems] = useState<BucketItem[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRandomPickerOpen, setIsRandomPickerOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [pickedItem, setPickedItem] = useState<BucketItem | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<BucketCategory>("Date Ideas");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  const handleToggleComplete = async (item: BucketItem) => {
    const nextCompleted = !item.is_completed;
    const completedAt = nextCompleted ? new Date().toISOString() : null;

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, is_completed: nextCompleted, completed_at: completedAt }
          : i
      )
    );

    if (nextCompleted) {
      triggerRomanticConfetti();
    }

    await supabase
      .from("bucket_items")
      .update({
        is_completed: nextCompleted,
        completed_at: completedAt,
      })
      .eq("id", item.id);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    const { data, error } = await supabase
      .from("bucket_items")
      .insert({
        title: title.trim(),
        category,
        notes: notes.trim() || null,
        created_by: currentUserId,
      })
      .select()
      .single();

    if (!error && data) {
      setItems((prev) => [data, ...prev]);
      setTitle("");
      setNotes("");
      setIsModalOpen(false);
    }
    setSubmitting(false);
  };

  const handleDeleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("bucket_items").delete().eq("id", id);
  };

  const handleRollRandom = () => {
    const uncompleted = items.filter((i) => !i.is_completed);
    if (uncompleted.length === 0) return;

    setIsRandomPickerOpen(true);
    setIsRolling(true);
    setPickedItem(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * uncompleted.length);
      setPickedItem(uncompleted[randomIdx]);
      counter++;

      if (counter > 15) {
        clearInterval(interval);
        setIsRolling(false);
        triggerRomanticConfetti();
      }
    }, 120);
  };

  const filteredItems = items.filter((i) => {
    if (activeCategory === "All") return true;
    return i.category === activeCategory;
  });

  const completedCount = items.filter((i) => i.is_completed).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-black text-xl text-stone-800 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>Our Shared Bucket List</span>
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            {completedCount} of {items.length} adventures achieved together!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRollRandom}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Dices className="w-4 h-4" />
            <span>Pick a Date For Us</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Idea</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeCategory === "All"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs scale-[1.02]"
              : "bg-white/80 border border-rose-200/60 text-stone-600 hover:bg-rose-50"
          }`}
        >
          All ({items.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = items.filter((i) => i.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs scale-[1.02]"
                  : "bg-white/80 border border-rose-200/60 text-stone-600 hover:bg-rose-50"
              }`}
            >
              <span>{cat.label}</span>
              <span className="ml-1 opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`glass-card rounded-2xl p-4 border transition-all flex items-start justify-between gap-3 group ${
              item.is_completed
                ? "bg-rose-50/50 border-rose-200/60 opacity-80"
                : "bg-white/80 border-rose-100 hover:border-rose-200 hover:shadow-xs"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggleComplete(item)}
                className="mt-0.5 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                aria-label="Toggle completed"
              >
                {item.is_completed ? (
                  <CheckCircle2 className="w-5 h-5 text-rose-500 fill-rose-100" />
                ) : (
                  <Circle className="w-5 h-5 text-stone-300 hover:text-rose-400" />
                )}
              </button>
              <div>
                <span
                  className={`text-sm font-bold block transition-all ${
                    item.is_completed
                      ? "line-through text-stone-400"
                      : "text-stone-800"
                  }`}
                >
                  {item.title}
                </span>
                {item.notes && (
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    {item.notes}
                  </p>
                )}
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full mt-1.5">
                  {item.category}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDeleteItem(item.id)}
              className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-rose-500 transition-opacity p-1.5 rounded-xl cursor-pointer"
              aria-label="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Random Date Picker Modal */}
      {isRandomPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-in fade-in">
          <div className="glass-card bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 border border-rose-200 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-800 mx-auto flex items-center justify-center shadow-md">
              <Dices className={`w-8 h-8 ${isRolling ? "animate-spin" : ""}`} />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                Random Date Decider
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-stone-800 mt-1">
                {isRolling ? "Spinning our ideas..." : "Tonight's Date Adventure!"}
              </h3>
            </div>

            {pickedItem && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 text-left shadow-xs">
                <span className="text-[10px] font-black uppercase text-rose-500">
                  {pickedItem.category}
                </span>
                <p className="font-display font-black text-base text-stone-800 mt-0.5">
                  {pickedItem.title}
                </p>
                {pickedItem.notes && (
                  <p className="text-xs text-stone-600 font-medium mt-1">
                    {pickedItem.notes}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleRollRandom}
                disabled={isRolling}
                className="flex-1 py-2.5 rounded-2xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Roll Again
              </button>
              <button
                onClick={() => setIsRandomPickerOpen(false)}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Let&apos;s Do This!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <h3 className="font-display font-black text-lg text-stone-800">
                Add Bucket List Idea
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Adventure / Date Idea
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midnight drive to the coast"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-rose-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BucketCategory)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-rose-200 bg-white text-xs font-bold focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Details, location, special preparations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-2xl border border-rose-200 bg-white text-sm font-medium focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-stone-200 text-xs font-bold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  {submitting ? "Saving..." : "Add to List"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
