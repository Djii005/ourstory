"use client";

import { useEffect, useState, useMemo } from "react";
import { PhotoRecord } from "@/types/gallery";
import { StorageGauge } from "./storage-gauge";
import { UploadModal } from "./upload-modal";
import { PhotoLightbox } from "./photo-lightbox";
import { createClient } from "@/lib/supabase/client";
import { Image as ImageIcon, Plus, Calendar, Folder } from "lucide-react";

interface GalleryHubProps {
  initialPhotos: PhotoRecord[];
  currentUserId: string;
}

export function GalleryHub({ initialPhotos, currentUserId }: GalleryHubProps) {
  const [photos, setPhotos] = useState<PhotoRecord[]>(initialPhotos);
  const [activeAlbum, setActiveAlbum] = useState<string>("All");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const supabase = createClient();

  const albums = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.album) set.add(p.album);
    });
    return Array.from(set);
  }, [photos]);

  const totalStorageBytes = useMemo(() => {
    return photos.reduce((acc, curr) => acc + (curr.size_bytes || 0), 0);
  }, [photos]);

  useEffect(() => {
    async function loadSignedUrls() {
      const photosNeedingUrls = photos.filter((p) => !p.signed_url);
      if (photosNeedingUrls.length === 0) return;

      const paths = photosNeedingUrls.map((p) => p.storage_path);
      const { data, error } = await supabase.storage
        .from("photos")
        .createSignedUrls(paths, 3600);

      if (!error && data) {
        const urlMap = new Map<string, string>();
        data.forEach((item) => {
          if (item.signedUrl && item.path) {
            urlMap.set(item.path, item.signedUrl);
          }
        });

        setPhotos((prev) =>
          prev.map((photo) => {
            const url = urlMap.get(photo.storage_path);
            return url ? { ...photo, signed_url: url } : photo;
          })
        );
      }
    }

    loadSignedUrls();
  }, [photos, supabase]);

  const filteredPhotos = useMemo(() => {
    if (activeAlbum === "All") return photos;
    return photos.filter((p) => p.album === activeAlbum);
  }, [photos, activeAlbum]);

  const handlePhotoUploaded = (newPhoto: PhotoRecord) => {
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleDeletePhoto = async (photoId: string, storagePath: string) => {
    await supabase.storage.from("photos").remove([storagePath]);
    await supabase.from("photos").delete().eq("id", photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-800 flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-sm">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span>Our Moments Gallery</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Private memories compressed client-side to preserve our free 1 GB vault.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-200/60 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Photo</span>
        </button>
      </div>

      <StorageGauge
        totalBytes={totalStorageBytes}
        photoCount={photos.length}
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveAlbum("All")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeAlbum === "All"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs scale-[1.02]"
              : "bg-white/80 border border-rose-200/60 text-stone-600 hover:bg-rose-50"
          }`}
        >
          All Photos ({photos.length})
        </button>
        {albums.map((albumName) => {
          const count = photos.filter((p) => p.album === albumName).length;
          return (
            <button
              key={albumName}
              onClick={() => setActiveAlbum(albumName)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeAlbum === albumName
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs scale-[1.02]"
                  : "bg-white/80 border border-rose-200/60 text-stone-600 hover:bg-rose-50"
              }`}
            >
              <span>{albumName}</span>
              <span className="ml-1.5 opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-dashed border-rose-300 bg-white/70">
          <div className="w-14 h-14 rounded-3xl bg-rose-100 text-rose-500 mx-auto flex items-center justify-center mb-3">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-stone-700 text-lg">
            No photos in this album yet
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto font-medium">
            Upload your first photo! Our automatic WebP compressor shrinks 8 MB camera shots to ~200 KB so we can keep thousands of memories forever.
          </p>
          <div className="mt-5">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-sm hover:from-rose-600 hover:to-pink-600 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Photo</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredPhotos.map((photo, index) => {
            const isLoaded = loadedImages[photo.id];
            return (
              <div
                key={photo.id}
                onClick={() => setLightboxIndex(index)}
                className="group relative rounded-3xl overflow-hidden aspect-square cursor-pointer bg-rose-50 border border-rose-200/60 shadow-xs hover:shadow-md transition-all hover:scale-[1.02]"
              >
                {photo.blur_data_url && !isLoaded && (
                  <img
                    src={photo.blur_data_url}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover filter blur-md scale-105"
                  />
                )}

                {photo.signed_url ? (
                  <img
                    src={photo.signed_url}
                    alt={photo.caption || "Gallery memory"}
                    loading="lazy"
                    onLoad={() =>
                      setLoadedImages((prev) => ({ ...prev, [photo.id]: true }))
                    }
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      isLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-rose-50 animate-pulse">
                    <ImageIcon className="w-6 h-6 text-stone-300" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                  {photo.caption && (
                    <p className="text-xs font-bold line-clamp-1">
                      {photo.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-white/90 font-semibold mt-1">
                    <span className="flex items-center gap-1">
                      <Folder className="w-3 h-3" />
                      <span>{photo.album}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(photo.taken_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isUploadOpen && (
        <UploadModal
          existingAlbums={albums.length > 0 ? albums : ["Memories", "Dates", "Trips"]}
          currentUserId={currentUserId}
          onClose={() => setIsUploadOpen(false)}
          onUploaded={handlePhotoUploaded}
        />
      )}

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={filteredPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(i) => setLightboxIndex(i)}
          onDelete={handleDeletePhoto}
        />
      )}
    </div>
  );
}
