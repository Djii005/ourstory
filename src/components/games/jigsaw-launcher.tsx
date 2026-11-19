"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { PhotoRecord } from "@/types/gallery";
import { JigsawDifficulty, JigsawRecord } from "@/types/games";
import { JigsawPuzzle } from "./jigsaw-puzzle";
import {
  Upload,
  Image as ImageIcon,
  Trophy,
  ArrowLeft,
  Sparkles,
  Puzzle,
  Trash2,
  Clock,
  Footprints,
} from "lucide-react";

interface JigsawLauncherProps {
  galleryPhotos: PhotoRecord[];
  topRecords: JigsawRecord[];
  currentUserId: string;
}

export function JigsawLauncher({
  galleryPhotos,
  topRecords,
  currentUserId,
}: JigsawLauncherProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>("Memory Puzzle");
  const [isEphemeral, setIsEphemeral] = useState(false);
  const [difficulty, setDifficulty] = useState<JigsawDifficulty>("3x3");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle temporary ephemeral photo upload
  const handleEphemeralUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const blobUrl = URL.createObjectURL(file);
    setSelectedImage(blobUrl);
    setSelectedPhotoId(null);
    setSelectedLabel(file.name.replace(/\.[^/.]+$/, "") || "Custom Puzzle");
    setIsEphemeral(true);
  };

  // Handle picking from existing gallery
  const handlePickGallery = (photo: PhotoRecord) => {
    if (!photo.signed_url) return;
    setSelectedImage(photo.signed_url);
    setSelectedPhotoId(photo.id);
    setSelectedLabel(photo.caption || `${photo.album} memory`);
    setIsEphemeral(false);
  };

  const handleExitGame = () => {
    setSelectedImage(null);
    setSelectedPhotoId(null);
    setIsEphemeral(false);
  };

  if (selectedImage) {
    return (
      <JigsawPuzzle
        imageUrl={selectedImage}
        photoId={selectedPhotoId}
        photoLabel={selectedLabel}
        isEphemeral={isEphemeral}
        difficulty={difficulty}
        currentUserId={currentUserId}
        onExit={handleExitGame}
        onDifficultyChange={(newDiff) => setDifficulty(newDiff)}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-2xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          prefetch
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games Hub</span>
        </Link>
        <span className="text-xs font-bold text-rose-500 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-full">
          <Puzzle className="w-4 h-4" />
          <span>Photo Jigsaw</span>
        </span>
      </div>

      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-800 flex items-center gap-2">
          <span>Our Photo Jigsaw</span>
          <Sparkles className="w-5 h-5 text-rose-500" />
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
          Piece together our memories. Upload a temporary picture or choose from our gallery.
        </p>
      </div>

      {/* Option 1: Ephemeral Photo Upload (Purged after finish) */}
      <section className="glass-card rounded-3xl p-6 border-2 border-dashed border-rose-300 text-center space-y-3 bg-gradient-to-br from-rose-50/60 via-white to-pink-50/40">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 mx-auto flex items-center justify-center shadow-xs">
          <Upload className="w-6 h-6" />
        </div>

        <div>
          <h2 className="font-display font-black text-lg text-stone-800">
            Upload a Temporary Picture
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto font-medium">
            Zero persistence &middot; Image stays purely in browser memory and is <strong>permanently purged</strong> as soon as the puzzle is solved.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleEphemeralUpload(e.target.files[0]);
            }
          }}
        />

        <div className="pt-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs shadow-md shadow-rose-200/50 transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Select Temporary Photo</span>
          </button>
        </div>
      </section>

      {/* Option 2: Choose from Gallery Memories */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-lg text-stone-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-rose-500" />
            <span>Or Pick from Our Gallery</span>
          </h2>
          <span className="text-xs text-stone-400 font-semibold">
            {galleryPhotos.length} photos available
          </span>
        </div>

        {galleryPhotos.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center text-xs text-stone-500 font-medium">
            No gallery photos uploaded yet. Upload a temporary photo above or visit the Gallery!
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {galleryPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => handlePickGallery(photo)}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-rose-200/70 hover:scale-102 hover:shadow-md transition-all cursor-pointer bg-rose-50"
              >
                {photo.signed_url ? (
                  <img
                    src={photo.signed_url}
                    alt={photo.caption || "Gallery photo"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-rose-100/40 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-rose-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-black">
                  Play Jigsaw
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* High Scores & Best Times */}
      <section className="glass-card rounded-3xl p-5 sm:p-6 border border-rose-200/70 space-y-4 bg-white/80">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-base text-stone-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Jigsaw Best Times</span>
          </h2>
          <span className="text-[11px] text-stone-400 font-semibold">Top records</span>
        </div>

        {topRecords.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-3 font-medium">
            No records yet! Be the first to complete a puzzle.
          </p>
        ) : (
          <div className="space-y-2">
            {topRecords.slice(0, 5).map((rec, i) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-rose-100 text-xs shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-black text-[10px] flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-stone-800">
                      {rec.photo_label || "Jigsaw Puzzle"}
                    </p>
                    <span className="text-[10px] font-extrabold text-rose-500 uppercase">
                      {rec.difficulty}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display font-black text-stone-800 tabular-nums">
                    {Math.floor(rec.time_seconds / 60)}:
                    {String(Math.floor(rec.time_seconds % 60)).padStart(2, "0")}
                  </span>
                  <p className="text-[10px] text-stone-400 font-semibold">
                    {rec.moves} moves
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
