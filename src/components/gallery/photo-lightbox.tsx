"use client";

import { useEffect } from "react";
import { PhotoRecord } from "@/types/gallery";
import { formatBytes } from "@/lib/utils/image-compressor";
import { X, ChevronLeft, ChevronRight, Download, Trash2, Calendar, Folder } from "lucide-react";

interface PhotoLightboxProps {
  photos: PhotoRecord[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
  onDelete: (photoId: string, storagePath: string) => Promise<void>;
}

export function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
  onDelete,
}: PhotoLightboxProps) {
  const photo = photos[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < photos.length - 1) onNavigate(currentIndex + 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, photos.length, onClose, onNavigate]);

  if (!photo) return null;

  const handleDownload = async () => {
    if (!photo.signed_url) return;
    try {
      const response = await fetch(photo.signed_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `our-space-${photo.taken_at}.webp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(photo.signed_url, "_blank");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this memory?")) {
      await onDelete(photo.id, photo.storage_path);
      if (photos.length <= 1) {
        onClose();
      } else {
        onNavigate(Math.max(0, currentIndex - 1));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top action controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-50">
        <span className="text-xs font-semibold text-white/70">
          {currentIndex + 1} / {photos.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            aria-label="Download photo"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete photo"
            className="p-2 rounded-full bg-white/10 hover:bg-rose-500/80 transition-colors cursor-pointer text-white"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            aria-label="Close fullscreen"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Chevrons */}
      {currentIndex > 0 && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          aria-label="Previous photo"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all cursor-pointer z-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentIndex < photos.length - 1 && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          aria-label="Next photo"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all cursor-pointer z-50"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main image presentation */}
      <div className="max-w-4xl max-h-[80vh] p-4 flex flex-col items-center justify-center">
        {photo.signed_url && (
          <img
            src={photo.signed_url}
            alt={photo.caption || "Gallery memory"}
            className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-2xl animate-in zoom-in-95 duration-200"
          />
        )}

        {/* Metadata Footer */}
        <div className="mt-4 text-center text-white/90 max-w-xl">
          {photo.caption && (
            <p className="font-display text-lg font-medium mb-1">
              {photo.caption}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 text-xs text-white/60">
            <span className="flex items-center gap-1">
              <Folder className="w-3.5 h-3.5" />
              <span>{photo.album}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(photo.taken_at).toLocaleDateString()}</span>
            </span>
            <span>{formatBytes(photo.size_bytes)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
