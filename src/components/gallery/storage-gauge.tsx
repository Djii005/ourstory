"use client";

import { formatBytes } from "@/lib/utils/image-compressor";
import { HardDrive, Sparkles } from "lucide-react";

interface StorageGaugeProps {
  totalBytes: number;
  photoCount: number;
}

export function StorageGauge({ totalBytes, photoCount }: StorageGaugeProps) {
  const MAX_BYTES = 1024 * 1024 * 1024; // 1 GB Supabase free quota
  const percentage = Math.min(100, (totalBytes / MAX_BYTES) * 100);
  const formattedUsed = formatBytes(totalBytes);
  const remainingBytes = Math.max(0, MAX_BYTES - totalBytes);
  const estimatedRemainingPhotos = Math.floor(remainingBytes / (220 * 1024));

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-5 border border-rose-200/70 bg-white/80 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-rose-100 text-rose-500">
            <HardDrive className="w-4 h-4" />
          </div>
          <span className="text-xs font-black text-stone-800">
            Free Storage Telemetry
          </span>
        </div>
        <span className="text-xs font-black text-rose-500 tabular-nums bg-rose-50 px-2.5 py-0.5 rounded-full">
          {percentage.toFixed(1)}% of 1 GB
        </span>
      </div>

      <div className="w-full h-2.5 bg-rose-100/70 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage > 90
              ? "bg-red-500"
              : percentage > 75
              ? "bg-amber-500"
              : "bg-gradient-to-r from-rose-500 to-pink-500"
          }`}
          style={{ width: `${Math.max(percentage, 0.5)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium mt-2.5">
        <span>
          {formattedUsed} used &middot; {photoCount} {photoCount === 1 ? "photo" : "photos"}
        </span>
        <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3" />
          <span>~{estimatedRemainingPhotos.toLocaleString()} photos left</span>
        </span>
      </div>
    </div>
  );
}
