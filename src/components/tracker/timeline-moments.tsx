"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Calendar, Image as ImageIcon, Trash2, X } from "lucide-react";

export interface TimelineMoment {
  id: string;
  title: string;
  event_date: string;
  caption: string | null;
  photo_url: string | null;
  created_at: string;
}

interface TimelineMomentsProps {
  initialMoments: TimelineMoment[];
}

export function TimelineMoments({ initialMoments }: TimelineMomentsProps) {
  const [moments, setMoments] = useState<TimelineMoment[]>(initialMoments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [caption, setCaption] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const handleAddMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventDate) return;

    setSubmitting(true);
    const { data, error } = await supabase
      .from("timeline_moments")
      .insert({
        title: title.trim(),
        event_date: eventDate,
        caption: caption.trim() || null,
        photo_url: photoUrl.trim() || null,
      })
      .select()
      .single();

    if (!error && data) {
      setMoments((prev) =>
        [...prev, data].sort(
          (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
        )
      );
      setIsModalOpen(false);
      setTitle("");
      setCaption("");
      setPhotoUrl("");
    }
    setSubmitting(false);
  };

  const handleDeleteMoment = async (id: string) => {
    const { error } = await supabase.from("timeline_moments").delete().eq("id", id);
    if (!error) {
      setMoments((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <section className="space-y-4 pt-2">
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <svg
              width="22"
              height="16"
              viewBox="0 0 24 18"
              style={{ color: "var(--accent-gold)", flexShrink: 0 }}
              aria-hidden="true"
            >
              <use href="#twinLeafEmblem" />
            </svg>
            <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">
              Special Moments Timeline
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
            Chapters and unforgettable milestones in our journey
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="primary-btn text-xs py-2 px-3.5"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Add Moment</span>
        </button>
      </div>

      {moments.length === 0 ? (
        <div className="arch-card p-8 text-center border-dashed">
          <Calendar className="w-10 h-10 text-[var(--accent-gold)] mx-auto mb-3 opacity-60" />
          <p className="font-display font-bold text-base text-[var(--text-primary)]">
            No special moments added yet
          </p>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-1 max-w-xs mx-auto">
            Add the day you first met, first date, or unforgettable trips together!
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-5 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-px before:bg-[var(--line-strong)]">
          {moments.map((moment) => (
            <article
              key={moment.id}
              className="relative arch-card p-4 sm:p-5 hover:shadow-md transition-all group"
            >
              <div className="absolute -left-6 sm:-left-8 top-5 w-3.5 h-3.5 rounded-full bg-[var(--accent-rose)] ring-4 ring-[var(--line-hairline)]" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block text-[11px] font-mono font-bold text-[var(--accent-gold)] uppercase tracking-wider mb-1">
                    {new Date(moment.event_date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <h3 className="font-display font-bold text-[var(--text-primary)] text-lg">
                    {moment.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleDeleteMoment(moment.id)}
                  aria-label="Delete moment"
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-[var(--text-muted)] hover:text-[var(--accent-rose)] transition-opacity p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {moment.caption && (
                <p className="text-sm text-[var(--text-secondary)] font-medium mt-2 whitespace-pre-line leading-relaxed">
                  {moment.caption}
                </p>
              )}

              {moment.photo_url && (
                <div className="mt-3 rounded-2xl overflow-hidden max-h-72 border border-[var(--line-hairline)] shadow-xs">
                  <img
                    src={moment.photo_url}
                    alt={moment.title}
                    className="w-full h-auto object-cover max-h-72 hover:scale-[1.01] transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Add Moment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="arch-card p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line-hairline)]">
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                New Special Moment
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMoment} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. First time we watched the stars"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[var(--line-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:border-[var(--accent-gold)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[var(--line-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:border-[var(--accent-gold)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Story / Caption
                </label>
                <textarea
                  placeholder="What made this day so special..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[var(--line-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:border-[var(--accent-gold)] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Optional Photo URL
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-[var(--line-hairline)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:border-[var(--accent-gold)]"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="ghost-btn flex-1 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="primary-btn flex-1 py-2.5 text-xs disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Moment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
