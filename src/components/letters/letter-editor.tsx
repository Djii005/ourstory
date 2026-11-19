"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LetterTheme, LetterFont, DeliveryType, OPEN_WHEN_CATEGORIES } from "@/types/letters";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Send,
  Clock,
  Heart,
  Smile,
  Bold,
  Italic,
  Underline,
  List,
  Quote,
} from "lucide-react";

interface LetterEditorProps {
  currentUserId: string;
  partnerId?: string;
  recipientId?: string;
  partnerName: string;
}

export function LetterEditor({
  currentUserId,
  partnerId,
  recipientId,
  partnerName,
}: LetterEditorProps) {
  const targetRecipientId = recipientId || partnerId || "";
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState<LetterTheme>("rose");
  const [fontFamily, setFontFamily] = useState<LetterFont>("clean");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("instant");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [openWhenCategory, setOpenWhenCategory] = useState(OPEN_WHEN_CATEGORIES[0].id);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertHeartDivider = () => {
    document.execCommand("insertHTML", false, "<div style='text-align:center;margin:1rem 0;color:#f43f5e;'>&hearts; &hearts; &hearts;</div><p><br></p>");
    editorRef.current?.focus();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const htmlContent = editorRef.current?.innerHTML || "";

    if (!title.trim()) {
      setError("Please add a title for your letter.");
      return;
    }

    if (!htmlContent.trim() || htmlContent === "<p><br></p>") {
      setError("Please write some words from the heart before sending.");
      return;
    }

    setSending(true);
    setError(null);

    let openAtIso: string | null = null;
    if (deliveryType === "scheduled") {
      if (!scheduledDate) {
        setError("Please choose a date to unlock this letter.");
        setSending(false);
        return;
      }
      openAtIso = new Date(`${scheduledDate}T${scheduledTime || "00:00"}`).toISOString();
    }

    const { data: letterData, error: letterError } = await supabase
      .from("letters")
      .insert({
        sender_id: currentUserId,
        recipient_id: targetRecipientId,
        title: title.trim(),
        theme,
        font_family: fontFamily,
        delivery_type: deliveryType,
        open_at: openAtIso,
        open_when_category: deliveryType === "open_when" ? openWhenCategory : null,
      })
      .select()
      .single();

    if (letterError || !letterData) {
      setError(letterError?.message || "Failed to create letter envelope.");
      setSending(false);
      return;
    }

    const { error: contentError } = await supabase
      .from("letter_contents")
      .insert({
        letter_id: letterData.id,
        content_html: htmlContent,
      });

    if (contentError) {
      setError(contentError.message || "Failed to save letter message.");
      setSending(false);
      return;
    }

    router.push("/letters");
    router.refresh();
  };

  const fontClass = {
    serif: "font-display",
    handwriting: "font-script text-xl leading-relaxed",
    clean: "font-body",
  }[fontFamily];

  const stationeryTheme = {
    classic: "stationery-classic",
    rose: "stationery-rose",
    midnight: "stationery-midnight",
    vintage: "stationery-vintage",
  }[theme];

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/letters"
          prefetch
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Letters</span>
        </Link>
        <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
          Writing to {partnerName}
        </span>
      </div>

      <form onSubmit={handleSend} className="space-y-6">
        {/* Controls Card */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-rose-200/70 space-y-4 bg-white/80 shadow-xs">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Letter Title
            </label>
            <input
              type="text"
              placeholder="e.g. A midnight thought for you..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-rose-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400/50"
            />
          </div>

          {/* Theme & Font Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Stationery Theme
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "rose", label: "Blush", color: "bg-rose-200" },
                  { id: "classic", label: "Parchment", color: "bg-amber-100" },
                  { id: "midnight", label: "Midnight", color: "bg-indigo-900 text-white" },
                  { id: "vintage", label: "Kraft", color: "bg-[#e8dcbe]" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as LetterTheme)}
                    className={`py-2 px-1 text-xs rounded-xl border font-bold transition-all text-center cursor-pointer ${
                      theme === t.id
                        ? "ring-2 ring-rose-500 border-rose-400 scale-[1.03]"
                        : "border-stone-200 opacity-80"
                    } ${t.color}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Typography
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "handwriting", label: "Cursive", font: "font-script" },
                  { id: "serif", label: "Display", font: "font-display" },
                  { id: "clean", label: "Clean", font: "font-body" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFontFamily(f.id as LetterFont)}
                    className={`py-2 px-2 text-xs rounded-xl border transition-all text-center cursor-pointer ${f.font} ${
                      fontFamily === f.id
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-500 font-bold shadow-xs scale-[1.02]"
                        : "bg-white border-rose-200/60 text-stone-700"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Delivery Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType("instant")}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  deliveryType === "instant"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-500 shadow-xs scale-[1.02]"
                    : "bg-white border-rose-200/60 text-stone-700 hover:bg-rose-50"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Now</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType("scheduled")}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  deliveryType === "scheduled"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-500 shadow-xs scale-[1.02]"
                    : "bg-white border-rose-200/60 text-stone-700 hover:bg-rose-50"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Schedule Lock</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType("open_when")}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  deliveryType === "open_when"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-500 shadow-xs scale-[1.02]"
                    : "bg-white border-rose-200/60 text-stone-700 hover:bg-rose-50"
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Open When...</span>
              </button>
            </div>
          </div>

          {/* Scheduled Date/Time Inputs */}
          {deliveryType === "scheduled" && (
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2 animate-in fade-in">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Database-Enforced Lock Until</span>
              </span>
              <p className="text-[11px] text-amber-700 font-medium">
                Postgres Row Level Security prevents the recipient from reading this content before the date/time arrives.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required={deliveryType === "scheduled"}
                  className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold"
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required={deliveryType === "scheduled"}
                  className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold"
                />
              </div>
            </div>
          )}

          {/* Open When Selector */}
          {deliveryType === "open_when" && (
            <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 space-y-2 animate-in fade-in">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                <span>Select &quot;Open When...&quot; Occasion</span>
              </span>
              <select
                value={openWhenCategory}
                onChange={(e) => setOpenWhenCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-rose-300 text-xs font-bold text-stone-800 focus:outline-none"
              >
                {OPEN_WHEN_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Rich Text Editor Toolbar */}
        <div className="flex items-center gap-1 p-2 rounded-2xl glass-card border border-rose-200/70 flex-wrap bg-white/80">
          <button
            type="button"
            onClick={() => handleFormat("bold")}
            className="p-2 rounded-xl hover:bg-rose-100 text-stone-700 cursor-pointer"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleFormat("italic")}
            className="p-2 rounded-xl hover:bg-rose-100 text-stone-700 cursor-pointer"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleFormat("underline")}
            className="p-2 rounded-xl hover:bg-rose-100 text-stone-700 cursor-pointer"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-rose-200 mx-1" />
          <button
            type="button"
            onClick={() => handleFormat("insertUnorderedList")}
            className="p-2 rounded-xl hover:bg-rose-100 text-stone-700 cursor-pointer"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleFormat("formatBlock", "blockquote")}
            className="p-2 rounded-xl hover:bg-rose-100 text-stone-700 cursor-pointer"
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertHeartDivider}
            className="p-2 rounded-xl hover:bg-rose-100 text-rose-500 font-bold text-xs flex items-center gap-1 cursor-pointer"
            title="Heart Divider"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span className="text-[11px]">Divider</span>
          </button>
        </div>

        {/* Stationery Paper Canvas */}
        <div
          className={`rounded-3xl p-6 sm:p-10 border shadow-xl min-h-[360px] transition-all relative ${stationeryTheme}`}
        >
          <div className="text-xs opacity-75 font-bold mb-4 pb-2 border-b border-current/15 flex justify-between">
            <span>
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>My dearest {partnerName},</span>
          </div>

          <div
            ref={editorRef}
            contentEditable
            role="textbox"
            aria-multiline="true"
            data-placeholder="Pour your heart onto this page..."
            className={`outline-none min-h-[260px] ${fontClass}`}
          />

          <div className="mt-8 pt-4 border-t border-current/15 text-xs opacity-75 text-right font-bold">
            With all my love &hearts;
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-bold">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-60 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-200/60 transition-all cursor-pointer active:scale-[0.99]"
        >
          {sending ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Seal & Send Letter</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
