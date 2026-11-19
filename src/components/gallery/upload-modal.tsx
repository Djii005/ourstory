"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage, formatBytes, CompressedImageResult } from "@/lib/utils/image-compressor";
import { PhotoRecord } from "@/types/gallery";
import { X, Upload, Image as ImageIcon, Sparkles, Check, AlertCircle } from "lucide-react";

interface UploadModalProps {
  existingAlbums: string[];
  currentUserId: string;
  onClose: () => void;
  onUploaded: (newPhoto: PhotoRecord) => void;
}

export function UploadModal({
  existingAlbums,
  currentUserId,
  onClose,
  onUploaded,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedResult, setCompressedResult] = useState<CompressedImageResult | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [album, setAlbum] = useState(existingAlbums[0] || "Memories");
  const [customAlbum, setCustomAlbum] = useState("");
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WebP).");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setCompressing(true);

    try {
      const result = await compressImage(selectedFile, 1600, 0.82);
      setCompressedResult(result);
      const url = URL.createObjectURL(result.blob);
      setPreviewUrl(url);
    } catch {
      setError("Failed to compress image. Please try another photo.");
    } finally {
      setCompressing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compressedResult || !file) {
      setError("Please select a photo to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const finalAlbum = album === "__new__" ? customAlbum.trim() || "Memories" : album;
      const fileId = crypto.randomUUID();
      const storagePath = `${currentUserId}/${fileId}.webp`;

      // 1. Upload compressed WebP to private storage bucket
      const { error: storageError } = await supabase.storage
        .from("photos")
        .upload(storagePath, compressedResult.blob, {
          contentType: "image/webp",
          upsert: false,
        });

      if (storageError) {
        throw new Error(storageError.message || "Failed to upload image to storage");
      }

      // 2. Insert metadata into photos table
      const { data: photoRecord, error: dbError } = await supabase
        .from("photos")
        .insert({
          storage_path: storagePath,
          caption: caption.trim() || null,
          album: finalAlbum,
          taken_at: takenAt,
          width: compressedResult.width,
          height: compressedResult.height,
          size_bytes: compressedResult.sizeBytes,
          blur_data_url: compressedResult.blurDataUrl,
          created_by: currentUserId,
        })
        .select()
        .single();

      if (dbError || !photoRecord) {
        throw new Error(dbError?.message || "Failed to save photo record to database");
      }

      // 3. Generate signed URL for immediate display
      const { data: signedData } = await supabase.storage
        .from("photos")
        .createSignedUrl(storagePath, 3600);

      onUploaded({
        ...photoRecord,
        signed_url: signedData?.signedUrl,
      });

      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const savingsPercent = compressedResult
    ? Math.round(
        (1 - compressedResult.sizeBytes / compressedResult.originalSizeBytes) * 100
      )
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/40 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto glass-card bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200">
        <div className="flex items-center justify-between pb-4 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="font-display font-black text-xl text-stone-800">
              Add Photo to Our Gallery
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-stone-400 hover:text-stone-600 p-1 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* File Picker / Drop Zone */}
          {!previewUrl ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-rose-200 rounded-3xl p-8 text-center cursor-pointer hover:bg-rose-50/50 transition-all flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-stone-700">
                Choose a photo or drag & drop here
              </p>
              <p className="text-xs text-stone-400 font-medium">
                Client-side WebP compression automatically reduces file size by ~85-95%
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Preview with compression badge */}
              <div className="relative rounded-3xl overflow-hidden max-h-56 bg-stone-100 border border-rose-100">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-56 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setCompressedResult(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-900/70 text-white hover:bg-stone-900"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Compression stats banner */}
              {compressedResult && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>
                      {formatBytes(compressedResult.originalSizeBytes)} &rarr;{" "}
                      <strong>{formatBytes(compressedResult.sizeBytes)}</strong>
                    </span>
                  </div>
                  <span className="font-bold">
                    {savingsPercent}% saved
                  </span>
                </div>
              )}
            </div>
          )}

          {compressing && (
            <div className="text-xs text-rose-500 font-bold flex items-center justify-center gap-2 py-2">
              <span className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <span>Optimizing photo to WebP...</span>
            </div>
          )}

          {/* Album Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Album
              </label>
              <select
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-rose-200 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-400/50"
              >
                {existingAlbums.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
                <option value="__new__">+ Create new album...</option>
              </select>
            </div>

            {album === "__new__" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  New Album Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bali Getaway"
                  value={customAlbum}
                  onChange={(e) => setCustomAlbum(e.target.value)}
                  required={album === "__new__"}
                  className="w-full px-3 py-2.5 rounded-2xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Date Taken
              </label>
              <input
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-2xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400/50"
              />
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Caption
            </label>
            <input
              type="text"
              placeholder="A few words about this moment..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400/50"
            />
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !compressedResult}
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {uploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading WebP...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save to Gallery</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
